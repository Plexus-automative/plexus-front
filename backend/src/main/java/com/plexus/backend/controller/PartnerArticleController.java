package com.plexus.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plexus.backend.dto.ArticleResponse;
import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.service.PriceHistoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Partner API: article lookup by reference, for the commercial mobile app.
 *
 * <p>This mirrors the dashboard's own article search
 * ({@code src/views/apps/ArticlesList.tsx} → {@code /api/purchase-orders/ItemVendors}),
 * deliberately and field for field, so a commercial on the mobile app and a user on the
 * dashboard looking up the same reference see the same rows at the same prices.
 *
 * <p>What that means concretely:
 * <ul>
 *   <li>The source is {@code plexusItemVendors} (Item Vendor), not the item card — so an
 *       article appears once <em>per referencing vendor</em>, with that vendor's name.
 *       Vendors flagged {@code PLX_VendorBlockedForWeb} are excluded upstream by the API
 *       page itself.</li>
 *   <li>The match is an <em>exact</em> reference, not a prefix and not a designation
 *       search: BC's Item Vendor table has no searchable description, and the dashboard
 *       has always worked this way.</li>
 *   <li>The term is tried against both the Plexus item number and the vendor's own
 *       reference ({@code vendorItemNo}), because a commercial reads whichever is printed
 *       on the box.</li>
 *   <li>Each row carries {@code lastPriceUpdate}: when that article's price last moved, so
 *       a commercial can see he is quoting on a price nobody has touched in three months.
 *       Same source and same freshness thresholds as the dashboard's "MAJ prix" chip — see
 *       {@link com.plexus.backend.service.PriceHistoryService}.</li>
 * </ul>
 *
 * <p>Authentication is the same shared API key as the rest of {@code /api/partner/**} —
 * see {@link com.plexus.backend.config.PartnerSecurityConfig}. As elsewhere on this
 * surface, BC's own error bodies are logged but never forwarded to the caller.
 */
@RestController
@RequestMapping("/api/partner/v1")
@Slf4j
public class PartnerArticleController {

    /** BC API entity backing the Item Vendor table (page 52237). */
    private static final String BC_ENTITY = "plexusItemVendors";

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final PriceHistoryService priceHistoryService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public PartnerArticleController(WebClient webClient, BusinessCentralTokenService tokenService,
            PriceHistoryService priceHistoryService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.priceHistoryService = priceHistoryService;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
    }

    // ------------------------------------------------------------------
    // Lookup by reference
    // ------------------------------------------------------------------

    /**
     * @param reference a Plexus item number or a vendor's own reference. Exact match.
     */
    @GetMapping(value = "/articles", params = "reference")
    public ResponseEntity<?> findByReference(@RequestParam String reference) {
        return lookup(reference);
    }

    /**
     * Same lookup with the reference in the path.
     *
     * <p>Note that item numbers in this catalogue can contain a slash ({@code C/B}), and
     * Spring's HTTP firewall rejects {@code %2F} inside a path segment with a 400 before
     * the request reaches here — those references need the query form above.
     */
    @GetMapping("/articles/{reference}")
    public ResponseEntity<?> findByReferencePath(@PathVariable String reference) {
        return lookup(reference);
    }

    /** A bare {@code GET /articles} would otherwise 404 with nothing explaining why. */
    @GetMapping("/articles")
    public ResponseEntity<?> missingReference() {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "validation_failed",
                "message", "reference is required, e.g. /articles?reference=FILTREA"));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ResponseEntity<?> lookup(String reference) {
        String term = reference == null ? "" : reference.trim();
        if (term.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "validation_failed", "message", "reference is required."));
        }

        try {
            List<ArticleResponse> rows = search(term);

            // The dashboard strips every non-alphanumeric character before querying, which
            // is how it copes with the spaces and dashes a user types into a reference.
            // Doing that unconditionally would make a reference that genuinely contains
            // punctuation ("C/B") unreachable, so the stripped form is a fallback rather
            // than the query: same tolerance, without losing valid references.
            String stripped = term.replaceAll("[^a-zA-Z0-9]", "");
            if (rows.isEmpty() && !stripped.isEmpty() && !stripped.equalsIgnoreCase(term)) {
                rows = search(stripped);
            }

            if (rows.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "not_found",
                        "message", "No article with that reference."));
            }
            return ResponseEntity.ok(new ArticleResponse.Result(term, withPriceUpdates(rows)));

        } catch (WebClientResponseException e) {
            log.error("!!! BC error looking up article {}: {} {}",
                    term, e.getStatusCode(), e.getResponseBodyAsString());
            return upstreamError();
        } catch (Exception e) {
            log.error("!!! Error looking up article {}: {}", term, e.getMessage(), e);
            return upstreamError();
        }
    }

    /**
     * Two queries rather than one {@code or}: Business Central refuses an OData filter
     * that ORs two different fields ({@code BadRequest_MethodNotImplemented}, "the 'OR'
     * operator is not supported on distinct fields"), so the item number and the vendor
     * reference are asked for separately and merged here.
     */
    private List<ArticleResponse> search(String term) throws Exception {
        String token = tokenService.getAccessToken();
        // Passed through as typed, like the dashboard does: BC's collation makes eq
        // case-insensitive, and upper-casing would be wrong for vendorItemNo, which is
        // free text rather than a Code field.
        String literal = escape(term);

        // Keyed by the Item Vendor primary key: the same row comes back from both queries
        // whenever a vendor's reference equals our item number, which is common.
        Map<String, ArticleResponse> byKey = new LinkedHashMap<>();
        collect(byKey, fetch("itemNo eq '" + literal + "'", token));
        collect(byKey, fetch("vendorItemNo eq '" + literal + "'", token));

        return new ArrayList<>(byKey.values());
    }

    /**
     * Attaches the last price change to each row.
     *
     * <p>One batched call for the whole result, not one per row: an exact-reference lookup
     * usually returns the same item from several vendors, so the distinct references are a
     * handful at most.
     *
     * <p>A failure here must not lose the lookup. The catalogue answer is what the commercial
     * asked for; the freshness of the price is a bonus, so an unreachable history is logged
     * and the rows go out with {@code lastPriceUpdate: null}.
     */
    private List<ArticleResponse> withPriceUpdates(List<ArticleResponse> rows) {
        Map<String, PriceHistoryService.PriceUpdate> updates;
        try {
            updates = priceHistoryService.lastUpdates(
                    rows.stream().map(ArticleResponse::reference).filter(java.util.Objects::nonNull).toList());
        } catch (Exception e) {
            log.warn("Price history unavailable for this lookup: {}", e.getMessage());
            return rows;
        }

        List<ArticleResponse> out = new ArrayList<>(rows.size());
        for (ArticleResponse row : rows) {
            PriceHistoryService.PriceUpdate u = updates.get(row.reference());
            out.add(new ArticleResponse(
                    row.reference(), row.designation(), row.unitPrice(), row.unit(),
                    row.vendorNo(), row.vendorName(), row.vendorReference(),
                    u == null ? null : new ArticleResponse.LastPriceUpdate(
                            u.dateTime(), u.oldPrice(), u.newPrice(),
                            u.changeCount(), u.daysAgo(), u.freshness())));
        }
        return out;
    }

    private void collect(Map<String, ArticleResponse> byKey, JsonNode value) {
        if (value == null || !value.isArray()) {
            return;
        }
        for (JsonNode node : value) {
            String key = text(node, "itemNo") + "|" + text(node, "vendorNo")
                    + "|" + text(node, "variantCode");
            byKey.putIfAbsent(key, toArticle(node));
        }
    }

    /** @return the {@code value} array of the BC response, or null when it is absent. */
    private JsonNode fetch(String filter, String token) throws Exception {
        String url = tarekSystemUrl + "/" + BC_ENTITY + "?$filter="
                + DemandeDevisPortalController.odataEncode(filter);

        String response = webClient.get()
                .uri(java.net.URI.create(url))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(30));

        return mapper.readTree(response).get("value");
    }

    /** The price history is attached afterwards, in one batch for the whole result. */
    private ArticleResponse toArticle(JsonNode node) {
        return new ArticleResponse(
                text(node, "itemNo"),
                text(node, "ItemDescription"),
                decimal(node, "ItemunitPrive"),
                text(node, "unitOfMeasureCode"),
                text(node, "vendorNo"),
                text(node, "vendorName"),
                text(node, "vendorItemNo"),
                null);
    }

    /** Doubling the quote is the OData escape; without it a reference with an apostrophe
     *  would break out of the filter literal. */
    private String escape(String value) {
        return value.replace("'", "''");
    }

    private String text(JsonNode node, String field) {
        if (node == null || !node.hasNonNull(field)) {
            return null;
        }
        String value = node.get(field).asText();
        return value.isBlank() ? null : value;
    }

    private BigDecimal decimal(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) ? node.get(field).decimalValue() : null;
    }

    private ResponseEntity<Map<String, String>> upstreamError() {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "upstream_error", "message", "Could not read the catalogue."));
    }
}
