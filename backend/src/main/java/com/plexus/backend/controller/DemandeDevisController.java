package com.plexus.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.plexus.backend.dto.DemandeDevisRequest;
import com.plexus.backend.dto.DemandeDevisResponse;
import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.service.PushNotificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/**
 * Partner API: demandes de devis relayed from the commercial mobile app's backend.
 *
 * <p>Flow: a commercial tours a garage with the mobile app, capturing photos and voice
 * notes that are uploaded to <em>their</em> backend. On "créer demande devis", that
 * backend calls this endpoint. Plexus stores the demande against the PLEXUSPEC customer
 * (C0090) with links to the media, and prices it afterwards. No Purchase Order and no
 * vendor exist at creation time — the demande is a request, not yet an order.
 *
 * <p>Authentication is a shared API key on {@code X-API-Key}, enforced by the separate
 * partner security chain — see
 * {@link com.plexus.backend.config.PartnerSecurityConfig}. There is no user session here.
 *
 * <p>Error bodies are deliberately generic. The caller is a system outside our control,
 * so Business Central's raw responses are logged here but never forwarded.
 */
@RestController
@RequestMapping("/api/partner/v1")
@Slf4j
public class DemandeDevisController {

    /** BC API entity backing PLX_DevisRequest. */
    private static final String BC_ENTITY = "plexusDevisRequests";

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final PushNotificationService pushService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @Value("${demande-devis.customer-no:C0090}")
    private String devisCustomerNo;

    public DemandeDevisController(WebClient webClient, BusinessCentralTokenService tokenService,
            PushNotificationService pushService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.pushService = pushService;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
    }

    // ------------------------------------------------------------------
    // Credential check — lets the partner verify their key without writing data
    // ------------------------------------------------------------------
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "plexus-partner-api", "version", "v1"));
    }

    // ------------------------------------------------------------------
    // Create a demande de devis
    // ------------------------------------------------------------------
    @PostMapping(value = "/demandes-devis", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createDemande(@Valid @RequestBody DemandeDevisRequest request) {

        String token = tokenService.getAccessToken();
        String externalRef = request.externalReference().trim();

        try {
            // 1. Idempotency. Their backend retries on timeout, and a duplicated demande
            //    means a commercial gets quoted twice for one visit. With no local database
            //    to hold idempotency keys, BC itself is the source of truth: look the
            //    reference up before writing.
            JsonNode existing = findByExternalReference(externalRef, token);
            if (existing != null) {
                String number = text(existing, "number");
                String status = text(existing, "status");
                log.info("Demande devis already exists for externalReference={} -> {}", externalRef, number);
                return ResponseEntity.ok(DemandeDevisResponse.existing(number, externalRef,
                        status == null || status.isBlank() ? DemandeDevisResponse.STATUS_RECEIVED : status));
            }

            // 2. Create the record in BC.
            //    The number is deliberately NOT set here: DV<yy>/<nnnn> is a sequence, and
            //    only Business Central can hand out the next one safely — it locks the
            //    table so two demandes arriving together queue instead of claiming the
            //    same number. We read back whatever it assigned.
            ObjectNode payload = buildPayload(externalRef, request);

            String created = webClient.post()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + BC_ENTITY))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(payload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            String number = text(mapper.readTree(created), "number");
            if (number == null || number.isBlank()) {
                // The row exists but we cannot tell the caller what it is called. Failing
                // loudly beats returning a blank number they would have to chase.
                log.error("!!! BC accepted the demande but returned no number (externalReference={}): {}",
                        externalRef, created);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", "upstream_error",
                                "message", "Demande recorded but no number was returned. "
                                        + "Retry with the same externalReference."));
            }

            log.info("Demande devis created: {} (externalReference={}, garage={}, media={})",
                    number, externalRef, request.garage().name(),
                    request.media() == null ? 0 : request.media().size());

            // Tell the Plexus desks a demande just landed. @Async, and the service swallows
            // its own failures — the demande is already recorded and the partner must get
            // their 201 whether or not a browser could be reached.
            String plate = request.vehicle() == null ? null : request.vehicle().immatriculation();
            // Carry the number so the click lands on this demande, not just the list.
            // Encoded because the DV sequence contains a slash (DV26/0001).
            String target = "/pages/demandes-devis?number="
                    + java.net.URLEncoder.encode(number, StandardCharsets.UTF_8);
            pushService.notifyCustomer(
                    devisCustomerNo,
                    "Nouvelle demande de devis",
                    number + " — " + request.garage().name() + (plate != null ? " (" + plate + ")" : ""),
                    target);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(DemandeDevisResponse.created(number, externalRef));

        } catch (WebClientResponseException e) {
            // Logged in full for us; the partner gets a generic message.
            log.error("!!! BC error creating demande devis (externalReference={}): {} {}",
                    externalRef, e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "upstream_error",
                            "message", "Could not record the demande. Retry with the same externalReference."));
        } catch (Exception e) {
            log.error("!!! Error creating demande devis (externalReference={}): {}", externalRef, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "internal_error",
                            "message", "Could not record the demande. Retry with the same externalReference."));
        }
    }

    // ------------------------------------------------------------------
    // Status lookup by the caller's own reference
    // ------------------------------------------------------------------
    @GetMapping("/demandes-devis/{externalReference}")
    public ResponseEntity<?> getDemande(@PathVariable String externalReference) {
        try {
            JsonNode found = findByExternalReference(externalReference.trim(), tokenService.getAccessToken());
            if (found == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found",
                                "message", "No demande with that externalReference."));
            }
            String status = text(found, "status");
            return ResponseEntity.ok(new DemandeDevisResponse(
                    text(found, "number"),
                    externalReference.trim(),
                    status == null || status.isBlank() ? DemandeDevisResponse.STATUS_RECEIVED : status,
                    false));
        } catch (Exception e) {
            log.error("!!! Error reading demande devis {}: {}", externalReference, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "upstream_error", "message", "Could not read the demande."));
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /** @return the matching BC record, or null when there is none. */
    private JsonNode findByExternalReference(String externalRef, String token) {
        // Doubling the quote is the OData escape; without it a reference containing an
        // apostrophe would break out of the filter literal.
        String filter = "externalReference eq '" + externalRef.replace("'", "''") + "'";
        // Spaces must be %20, not the '+' that URLEncoder emits — BC's OData parser does
        // not treat '+' as a space. See DemandeDevisPortalController#odataEncode.
        String url = tarekSystemUrl + "/" + BC_ENTITY + "?$filter="
                + DemandeDevisPortalController.odataEncode(filter);

        String response = webClient.get()
                .uri(java.net.URI.create(url))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(20));

        try {
            JsonNode value = mapper.readTree(response).get("value");
            if (value != null && value.isArray() && value.size() > 0) {
                return value.get(0);
            }
        } catch (Exception e) {
            log.warn("Could not parse BC lookup for externalReference={}: {}", externalRef, e.getMessage());
        }
        return null;
    }

    /** Builds the BC payload. No {@code number}: BC assigns it from the DV sequence. */
    private ObjectNode buildPayload(String externalRef, DemandeDevisRequest r) {
        ObjectNode payload = mapper.createObjectNode();
        payload.put("externalReference", externalRef);
        payload.put("customerNo", devisCustomerNo);
        payload.put("status", DemandeDevisResponse.STATUS_RECEIVED);

        payload.put("garageName", r.garage().name());
        if (r.garage().customerNo() != null) {
            payload.put("garageCustomerNo", r.garage().customerNo());
        }

        if (r.commercial() != null) {
            if (r.commercial().id() != null) payload.put("commercialId", r.commercial().id());
            if (r.commercial().name() != null) payload.put("commercialName", r.commercial().name());
        }

        if (r.vehicle() != null) {
            if (r.vehicle().immatriculation() != null) {
                payload.put("registrationNumber", r.vehicle().immatriculation());
            }
            if (r.vehicle().vin() != null) payload.put("vin", r.vehicle().vin());
            if (r.vehicle().make() != null) payload.put("vehicleMake", r.vehicle().make());
            if (r.vehicle().model() != null) payload.put("vehicleModel", r.vehicle().model());
        }

        if (r.notes() != null) payload.put("notes", r.notes());

        // Normalised to UTC for the BC DateTime column. The per-entry stamps below keep
        // the original offset instead, because "photo taken at 10:32 local" is what a
        // reader of the demande actually wants to see.
        if (r.createdAt() != null) {
            payload.put("createdOnDevice", r.createdAt().toInstant().toString());
        }

        // Items and media go in as JSON blobs rather than child rows. A child table would
        // read better in the BC UI, but creating header + N lines is several BC calls with
        // no transaction around them: a partial failure would leave a demande with half its
        // photos, and the retry would then hit the idempotency check and never repair it.
        // One atomic write is worth more here than clickable sub-rows.
        if (r.items() != null && !r.items().isEmpty()) {
            ArrayNode items = mapper.createArrayNode();
            r.items().forEach(i -> {
                ObjectNode n = items.addObject();
                n.put("description", i.description());
                n.put("quantity", i.quantity() == null ? 1 : i.quantity());
                if (i.addedAt() != null) n.put("addedAt", i.addedAt().toString());
            });
            payload.put("itemsJson", items.toString());
        }

        if (r.media() != null && !r.media().isEmpty()) {
            ArrayNode media = mapper.createArrayNode();
            r.media().forEach(m -> {
                ObjectNode n = media.addObject();
                n.put("type", m.type());
                n.put("url", m.url());
                if (m.label() != null) n.put("label", m.label());
                if (m.durationSec() != null) n.put("durationSec", m.durationSec());
                if (m.addedAt() != null) n.put("addedAt", m.addedAt().toString());
            });
            payload.put("mediaJson", media.toString());
        }

        return payload;
    }

    private String text(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) ? node.get(field).asText() : null;
    }
}
