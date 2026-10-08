package com.plexus.backend.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plexus.backend.controller.DemandeDevisPortalController;

import lombok.extern.slf4j.Slf4j;

/**
 * Webhook to the partner (DigiAssist): "this bris dossier changed, read it again".
 *
 * <p>Without it the partner polls {@code GET /bris-dossiers/{ref}} every few minutes, so a
 * dossier the supplier has just answered reaches its claim up to five minutes late. The
 * webhook carries no data on purpose — only the reference: the partner re-reads the dossier
 * through the Partner API, so a forged or replayed call can at worst trigger one extra read,
 * and the polling stays the safety net for a call that never arrived.
 *
 * <p>Triggered from {@link com.plexus.backend.config.PartnerWebhookInterceptor} after any
 * call that can change what that GET returns (desk chiffrage and commande, supplier answer on
 * a commande line, commande header, split). Calls are debounced per dossier: a supplier
 * answering a commande sends the header then one PATCH per line, and the dossier is only
 * PRICED once the last line is in.
 *
 * <p>Signature: {@code X-Plexus-Signature: sha256=<hex HMAC-SHA256(secret, timestamp + "." + body)>}
 * with {@code X-Plexus-Timestamp} (epoch seconds). Unset URL or secret ⇒ disabled.
 */
@Service
@Slf4j
public class PartnerWebhookService {

    /** Long enough for a supplier's per-line PATCHes to land after the header one. */
    private static final long DEBOUNCE_MS = 5_000;

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "partner-webhook");
        t.setDaemon(true);
        return t;
    });
    private final Map<String, ScheduledFuture<?>> pending = new ConcurrentHashMap<>();

    @Value("${partner.webhook.url:}")
    private String url;

    @Value("${partner.webhook.secret:}")
    private String secret;

    @Value("${bris-de-glace.partner-login:DIGIASSIST}")
    private String partnerLogin;

    @Value("${business-central.api.base-url}")
    private String baseUrl;

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public PartnerWebhookService(WebClient webClient, BusinessCentralTokenService tokenService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        String companyPath = "/companies(" + companyId + ")";
        if (baseUrl != null && !baseUrl.contains("/companies(")) {
            baseUrl += companyPath;
        }
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += companyPath;
        }
        if (enabled()) {
            log.info("Partner webhook enabled → {}", url);
        } else {
            log.info("Partner webhook disabled (PARTNER_WEBHOOK_URL / PARTNER_WEBHOOK_SECRET unset): the partner polls");
        }
    }

    public boolean enabled() {
        return url != null && !url.isBlank() && secret != null && !secret.isBlank();
    }

    // ------------------------------------------------------------------ entry points

    /** A bris dossier, by its number (BG…), may have changed. */
    public void dossierChanged(String brisNumber) {
        if (!enabled() || brisNumber == null || !brisNumber.startsWith("BG")) {
            return;
        }
        // Debounce: the last change of a burst wins, one call per dossier.
        pending.compute(brisNumber, (k, previous) -> {
            if (previous != null) {
                previous.cancel(false);
            }
            return scheduler.schedule(() -> send(brisNumber), DEBOUNCE_MS, TimeUnit.MILLISECONDS);
        });
    }

    /** A commande changed: notify its bris dossier, if it belongs to one. */
    public void orderChanged(String orderId) {
        if (!enabled() || orderId == null || orderId.isBlank()) {
            return;
        }
        scheduler.execute(() -> {
            try {
                JsonNode patch = get(tarekSystemUrl + "/plexusPurchaseOrderPatches(" + orderId + ")");
                dossierChanged(text(patch, "pecDossier"));
            } catch (Exception e) {
                // Not a commande of the patch page (dashboard-keyed) or BC hiccup: polling covers it.
                log.debug("Partner webhook: no dossier for commande {}: {}", orderId, e.getMessage());
            }
        });
    }

    // ------------------------------------------------------------------ sending

    private void send(String brisNumber) {
        pending.remove(brisNumber);
        try {
            String filter = "number eq '" + brisNumber.replace("'", "''") + "'";
            JsonNode rows = get(tarekSystemUrl + "/plexusBrisHeaders?$filter="
                    + DemandeDevisPortalController.odataEncode(filter)).get("value");
            JsonNode header = rows != null && rows.isArray() && !rows.isEmpty() ? rows.get(0) : null;
            String reference = text(header, "externalReference");
            // Only the partner's own dossiers: one keyed in on the portal is none of its business.
            if (reference == null || reference.isBlank() || !partnerLogin.equalsIgnoreCase(text(header, "createdBy"))) {
                return;
            }

            Map<String, Object> event = new LinkedHashMap<>();
            event.put("event", "bris-dossier.updated");
            event.put("externalReference", reference);
            event.put("number", brisNumber);
            String body = mapper.writeValueAsString(event);
            String timestamp = String.valueOf(Instant.now().getEpochSecond());

            for (int attempt = 1; attempt <= 3; attempt++) {
                try {
                    webClient.post()
                            .uri(java.net.URI.create(url))
                            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                            .header("X-Plexus-Timestamp", timestamp)
                            .header("X-Plexus-Signature", "sha256=" + hmac(timestamp + "." + body))
                            .bodyValue(body)
                            .retrieve()
                            .toBodilessEntity()
                            .block(Duration.ofSeconds(10));
                    log.info("Partner webhook sent for {} ({})", reference, brisNumber);
                    return;
                } catch (Exception e) {
                    log.warn("Partner webhook for {} failed (attempt {}/3): {}", reference, attempt, e.getMessage());
                    Thread.sleep(attempt * 2_000L);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("Partner webhook for {} not sent: {}", brisNumber, e.getMessage());
        }
    }

    private String hmac(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(digest.length * 2);
        for (byte b : digest) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    private JsonNode get(String uri) throws Exception {
        String response = webClient.get()
                .uri(java.net.URI.create(uri))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(20));
        return mapper.readTree(response);
    }

    private static String text(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) ? node.get(field).asText() : null;
    }
}
