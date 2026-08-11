package com.plexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Security;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Sends Web Push notifications to the browsers that subscribed.
 *
 * <p>Subscriptions live in Business Central ({@code plexusPushSubscriptions}) because the
 * backend has no database of its own — the same reason the demandes themselves do.
 *
 * <p>Nothing here is allowed to break the caller. A push that fails is logged and the
 * subscription pruned if the push service says it is gone; the demande that triggered it
 * has already been recorded and must not be rolled back over a notification.
 */
@Service
@Slf4j
public class PushNotificationService {

    private static final String BC_ENTITY = "plexusPushSubscriptions";

    /** The push service is done with this subscription — stop sending to it. */
    private static final int GONE = 410;
    private static final int NOT_FOUND = 404;

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${push.vapid.subject:mailto:contact@plexus-tec.com}")
    private String vapidSubject;

    private PushService pushService;

    public PushNotificationService(WebClient webClient, BusinessCentralTokenService tokenService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
    }

    @PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }

        if (!isConfigured()) {
            log.warn("Web Push: VAPID keys are not set — push notifications are disabled. "
                    + "Generate a pair with: npx web-push generate-vapid-keys");
            return;
        }

        try {
            // The payload encryption uses ECDH + HKDF, which the JDK does not provide.
            Security.addProvider(new BouncyCastleProvider());
            pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            log.info("Web Push: enabled");
        } catch (Exception e) {
            log.error("!!! Web Push: could not initialise the push service: {}", e.getMessage(), e);
            pushService = null;
        }
    }

    public boolean isConfigured() {
        return vapidPublicKey != null && !vapidPublicKey.isBlank()
                && vapidPrivateKey != null && !vapidPrivateKey.isBlank();
    }

    public String getPublicKey() {
        return vapidPublicKey;
    }

    // ------------------------------------------------------------------
    // Subscriptions
    // ------------------------------------------------------------------

    /**
     * Records a browser subscription, replacing any previous row with the same endpoint.
     *
     * <p>Re-subscribing is routine — the browser can rotate an endpoint at any time, and
     * the frontend subscribes on every load. Keyed on the endpoint so that never piles up
     * duplicates that would each fire their own notification.
     */
    public void saveSubscription(String endpoint, String p256dh, String auth,
            String login, String customerNo, String userAgent) {
        String token = tokenService.getAccessToken();

        JsonNode existing = findByEndpoint(endpoint, token);

        ObjectNode payload = mapper.createObjectNode();
        payload.put("endpoint", endpoint);
        payload.put("p256dh", p256dh);
        payload.put("auth", auth);
        if (login != null) payload.put("login", login);
        if (customerNo != null) payload.put("customerNo", customerNo);
        if (userAgent != null) payload.put("userAgent", trim(userAgent, 250));

        if (existing != null) {
            String id = existing.get("id").asText();
            webClient.patch()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + BC_ENTITY + "(" + id + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue(payload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(20));
            log.info("Web Push: subscription refreshed for {}", customerNo);
        } else {
            webClient.post()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + BC_ENTITY))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(payload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(20));
            log.info("Web Push: new subscription stored for {}", customerNo);
        }
    }

    public void deleteSubscription(String endpoint) {
        String token = tokenService.getAccessToken();
        JsonNode existing = findByEndpoint(endpoint, token);
        if (existing == null) {
            return;
        }
        deleteById(existing.get("id").asText(), token);
    }

    // ------------------------------------------------------------------
    // Sending
    // ------------------------------------------------------------------

    /**
     * Pushes a notification to every browser subscribed for the given customer.
     *
     * <p>Runs off the caller's thread: the partner is waiting on an HTTP response and
     * should not pay for however long the push services take to answer.
     */
    @Async
    public void notifyCustomer(String customerNo, String title, String body, String url) {
        if (pushService == null) {
            return;
        }

        try {
            List<JsonNode> subs = findByCustomer(customerNo);
            if (subs.isEmpty()) {
                log.debug("Web Push: nobody subscribed for {}", customerNo);
                return;
            }

            ObjectNode payload = mapper.createObjectNode();
            payload.put("title", title);
            payload.put("body", body);
            payload.put("url", url);

            String token = tokenService.getAccessToken();
            int sent = 0;
            int pruned = 0;

            for (JsonNode sub : subs) {
                String endpoint = text(sub, "endpoint");
                try {
                    Notification notification = new Notification(
                            endpoint, text(sub, "p256dh"), text(sub, "auth"),
                            payload.toString().getBytes(StandardCharsets.UTF_8));

                    HttpResponse response = pushService.send(notification);
                    int status = response.getStatusLine().getStatusCode();

                    if (status == GONE || status == NOT_FOUND) {
                        // The browser is uninstalled, the permission revoked, or the
                        // endpoint rotated. Keeping it would retry forever.
                        deleteById(sub.get("id").asText(), token);
                        pruned++;
                    } else if (status >= 200 && status < 300) {
                        sent++;
                    } else {
                        log.warn("Web Push: push service answered {} for a subscription of {}",
                                status, customerNo);
                    }
                } catch (Exception e) {
                    log.warn("Web Push: could not send to one subscription: {}", e.getMessage());
                }
            }

            log.info("Web Push: {} sent, {} stale subscription(s) removed ({})", sent, pruned, customerNo);

        } catch (Exception e) {
            // Never propagate: the demande is already saved.
            log.error("!!! Web Push: notification failed for {}: {}", customerNo, e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private JsonNode findByEndpoint(String endpoint, String token) {
        String filter = "endpoint eq '" + endpoint.replace("'", "''") + "'";
        return firstOrNull(query(filter, token));
    }

    private List<JsonNode> findByCustomer(String customerNo) {
        String filter = "customerNo eq '" + customerNo.replace("'", "''") + "'";
        return query(filter, tokenService.getAccessToken());
    }

    private List<JsonNode> query(String filter, String token) {
        List<JsonNode> out = new ArrayList<>();
        try {
            // %20 for spaces, not '+': BC's OData parser does not read '+' as a space.
            String url = tarekSystemUrl + "/" + BC_ENTITY + "?$filter="
                    + URLEncoder.encode(filter, StandardCharsets.UTF_8).replace("+", "%20");

            String response = webClient.get()
                    .uri(java.net.URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(20));

            JsonNode value = mapper.readTree(response).get("value");
            if (value != null && value.isArray()) {
                value.forEach(out::add);
            }
        } catch (Exception e) {
            log.warn("Web Push: subscription lookup failed: {}", e.getMessage());
        }
        return out;
    }

    private void deleteById(String id, String token) {
        try {
            webClient.delete()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + BC_ENTITY + "(" + id + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("If-Match", "*")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(20));
        } catch (Exception e) {
            log.warn("Web Push: could not delete subscription {}: {}", id, e.getMessage());
        }
    }

    private JsonNode firstOrNull(List<JsonNode> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    private String text(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    private String trim(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }
}
