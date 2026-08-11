package com.plexus.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.plexus.backend.dto.DemandeDevisView;
import com.plexus.backend.security.JwtUtil;
import com.plexus.backend.service.BusinessCentralTokenService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Portal-side reading of the demandes de devis, for the Plexus dashboard.
 *
 * <p>Sits on the <em>portal</em> security chain ({@link com.plexus.backend.config.SecurityConfig}),
 * so callers authenticate with a normal user JWT. The partner API key grants nothing
 * here, and this endpoint grants nothing on the partner surface — the two are separate
 * on purpose.
 *
 * <p>Visibility is restricted to the Plexus account (C0090). The check reads
 * {@code customerNo} from the <strong>signed JWT claim</strong>, not from the
 * {@code X-Customer-No} request header the frontend also sends: that header is supplied
 * by the client, so any authenticated user could set it to C0090 and read every garage's
 * demandes. The claim is signed at login and cannot be edited by the holder.
 */
@RestController
@RequestMapping("/api/demandes-devis")
@Slf4j
public class DemandeDevisPortalController {

    private static final String BC_ENTITY = "plexusDevisRequests";

    /** Guard rail so a caller can't ask BC for the entire table in one request. */
    private static final int MAX_LIMIT = 200;
    private static final int DEFAULT_LIMIT = 50;

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @Value("${demande-devis.customer-no:C0090}")
    private String devisCustomerNo;

    public DemandeDevisPortalController(WebClient webClient, BusinessCentralTokenService tokenService,
            JwtUtil jwtUtil) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.jwtUtil = jwtUtil;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
    }

    /**
     * Lists demandes, newest first.
     *
     * <p>Garage and immatriculation are deliberately separate parameters rather than one
     * combined search box: Business Central rejects an OData filter that ORs across two
     * different fields ("The 'OR' operator is not supported on distinct fields"). Supplying
     * both narrows the result — they are ANDed, which BC does support.
     *
     * @param treated         optional — {@code false} for the ones still to handle
     * @param garage          optional — substring of the garage name
     * @param immatriculation optional — substring of the registration number
     * @param from            optional — ISO date, inclusive
     * @param to              optional — ISO date, inclusive
     */
    @GetMapping
    public ResponseEntity<?> list(
            HttpServletRequest request,
            @RequestParam(required = false) Boolean treated,
            @RequestParam(required = false) String garage,
            @RequestParam(required = false) String immatriculation,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "" + DEFAULT_LIMIT) int limit,
            @RequestParam(defaultValue = "0") int offset) {

        ResponseEntity<?> denied = requirePlexusAccount(request);
        if (denied != null) {
            return denied;
        }

        int safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
        int safeOffset = Math.max(offset, 0);

        try {
            List<String> filters = new ArrayList<>();
            if (treated != null) {
                filters.add("treated eq " + treated);
            }
            if (from != null && !from.isBlank()) {
                filters.add("creationDate ge " + from.trim());
            }
            if (to != null && !to.isBlank()) {
                filters.add("creationDate le " + to.trim());
            }
            // Doubling the quote is the OData escape for a literal apostrophe.
            if (garage != null && !garage.isBlank()) {
                filters.add("contains(garageName,'" + garage.trim().replace("'", "''") + "')");
            }
            if (immatriculation != null && !immatriculation.isBlank()) {
                filters.add("contains(registrationNumber,'"
                        + immatriculation.trim().replace("'", "''") + "')");
            }

            StringBuilder url = new StringBuilder(tarekSystemUrl + "/" + BC_ENTITY);
            url.append("?$orderby=creationDateTime%20desc")
                    .append("&$top=").append(safeLimit)
                    .append("&$skip=").append(safeOffset)
                    .append("&$count=true");
            if (!filters.isEmpty()) {
                url.append("&$filter=").append(odataEncode(String.join(" and ", filters)));
            }

            String response = webClient.get()
                    .uri(java.net.URI.create(url.toString()))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(45));

            JsonNode root = mapper.readTree(response);
            JsonNode value = root.get("value");

            List<DemandeDevisView> views = new ArrayList<>();
            if (value != null && value.isArray()) {
                value.forEach(node -> views.add(toView(node)));
            }

            long total = root.hasNonNull("@odata.count")
                    ? root.get("@odata.count").asLong()
                    : views.size();

            return ResponseEntity.ok(new DemandeDevisView.Page(total, safeLimit, safeOffset, views));

        } catch (Exception e) {
            log.error("!!! Error listing demandes devis: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Impossible de charger les demandes de devis."));
        }
    }

    /**
     * One demande, by its Plexus number.
     *
     * <p>The number travels as a query parameter, not a path segment: since the DV
     * sequence contains a slash ({@code DV26/0001}), a path variant either splits into
     * two segments and misses the route, or arrives percent-encoded and is refused with
     * 400 — Spring rejects encoded slashes in paths by default.
     */
    @GetMapping("/lookup")
    public ResponseEntity<?> getOne(HttpServletRequest request, @RequestParam String number) {
        ResponseEntity<?> denied = requirePlexusAccount(request);
        if (denied != null) {
            return denied;
        }

        try {
            String filter = "number eq '" + number.trim().replace("'", "''") + "'";
            String url = tarekSystemUrl + "/" + BC_ENTITY + "?$filter=" + odataEncode(filter);

            String response = webClient.get()
                    .uri(java.net.URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            JsonNode value = mapper.readTree(response).get("value");
            if (value == null || !value.isArray() || value.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Demande introuvable."));
            }
            return ResponseEntity.ok(toView(value.get(0)));

        } catch (Exception e) {
            log.error("!!! Error reading demande devis {}: {}", number, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Impossible de charger la demande."));
        }
    }

    /** Marks a demande treated / untreated, mirroring the action on the BC list page. */
    @PostMapping("/{id}/treat")
    public ResponseEntity<?> treat(HttpServletRequest request, @PathVariable String id,
            @RequestParam(defaultValue = "true") boolean treated) {

        ResponseEntity<?> denied = requirePlexusAccount(request);
        if (denied != null) {
            return denied;
        }

        try {
            String response = webClient.patch()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + BC_ENTITY + "(" + id + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue("{\"treated\":" + treated + "}")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            return ResponseEntity.ok(toView(mapper.readTree(response)));

        } catch (Exception e) {
            log.error("!!! Error updating treated on demande {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Impossible de mettre à jour la demande."));
        }
    }

    /**
     * Links a demande to the purchase order(s) created from the cart, and marks it handled.
     *
     * <p>Called once the cart has been validated and Business Central has issued the order
     * number(s) — which is why the demande can only be assigned after checkout, never
     * before: the number does not exist until then.
     *
     * @param orderNo one or more order numbers; a cart spanning several vendors produces
     *                one order per vendor, so all of them are recorded.
     */
    @PostMapping("/{id}/assign-order")
    public ResponseEntity<?> assignOrder(HttpServletRequest request, @PathVariable String id,
            @RequestParam String orderNo) {

        ResponseEntity<?> denied = requirePlexusAccount(request);
        if (denied != null) {
            return denied;
        }

        String cleaned = orderNo == null ? "" : orderNo.trim();
        if (cleaned.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "N° de commande manquant."));
        }
        if (cleaned.length() > 250) {
            cleaned = cleaned.substring(0, 250);
        }

        try {
            ObjectNode patch = mapper.createObjectNode();
            patch.put("orderNo", cleaned);
            // Assigning an order IS the act of handling the demande, so the two move
            // together — a demande linked to a commande but still sitting in the "à
            // traiter" queue would be handled twice.
            patch.put("treated", true);

            String response = webClient.patch()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + BC_ENTITY + "(" + id + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue(patch.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            log.info("Demande devis {} assigned to order(s) {}", id, cleaned);
            return ResponseEntity.ok(toView(mapper.readTree(response)));

        } catch (Exception e) {
            log.error("!!! Error assigning order {} to demande {}: {}", cleaned, id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Impossible d'assigner la commande à la demande."));
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * @return null when the caller may proceed, otherwise the error response to return.
     */
    private ResponseEntity<?> requirePlexusAccount(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise."));
        }

        String customerNo;
        try {
            customerNo = jwtUtil.extractClaim(header.substring(7),
                    claims -> claims.get("customerNo", String.class));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session invalide."));
        }

        if (customerNo == null || !customerNo.equalsIgnoreCase(devisCustomerNo)) {
            // Deliberately 403, not 404: the caller is authenticated, just not entitled.
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Accès réservé au compte Plexus."));
        }
        return null;
    }

    private DemandeDevisView toView(JsonNode n) {
        return new DemandeDevisView(
                text(n, "id"),
                text(n, "number"),
                text(n, "externalReference"),
                text(n, "status"),
                text(n, "orderNo"),
                n.hasNonNull("treated") && n.get("treated").asBoolean(),
                text(n, "customerNo"),
                text(n, "customerName"),
                text(n, "createdOnDevice"),
                text(n, "creationDateTime"),
                new DemandeDevisView.Garage(text(n, "garageName"), text(n, "garageCustomerNo")),
                new DemandeDevisView.Commercial(text(n, "commercialId"), text(n, "commercialName")),
                new DemandeDevisView.Vehicle(
                        text(n, "registrationNumber"),
                        text(n, "vin"),
                        text(n, "vehicleMake"),
                        text(n, "vehicleModel")),
                text(n, "notes"),
                parseArray(text(n, "itemsJson")),
                parseArray(text(n, "mediaJson")));
    }

    /**
     * Turns a stored JSON column into a real array so the frontend never parses a string.
     * A malformed or absent column yields an empty array rather than breaking the page —
     * one bad row should not take the whole list down.
     */
    private JsonNode parseArray(String raw) {
        if (raw == null || raw.isBlank()) {
            return mapper.createArrayNode();
        }
        try {
            JsonNode parsed = mapper.readTree(raw);
            return parsed.isArray() ? parsed : mapper.createArrayNode();
        } catch (Exception e) {
            log.warn("Demande devis: unparseable JSON column ignored ({})", e.getMessage());
            return mapper.createArrayNode();
        }
    }

    private String text(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    /**
     * Percent-encodes an OData filter for use in a query string.
     *
     * <p>{@code URLEncoder} targets {@code application/x-www-form-urlencoded}, where a
     * space becomes {@code +}. Business Central's OData parser does not read {@code +}
     * as a space, so a multi-clause filter like {@code contains(a,'x') or contains(b,'x')}
     * comes back 501 Not Implemented. Spaces must be {@code %20}.
     */
    static String odataEncode(String filter) {
        return URLEncoder.encode(filter, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
