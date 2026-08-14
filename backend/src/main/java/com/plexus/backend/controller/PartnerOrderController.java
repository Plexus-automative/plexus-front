package com.plexus.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.plexus.backend.dto.PartnerBatchRequest;
import com.plexus.backend.dto.PartnerBatchResponse;
import com.plexus.backend.dto.PartnerOrderCancelRequest;
import com.plexus.backend.dto.PartnerOrderCancelResponse;
import com.plexus.backend.dto.PartnerOrderRequest;
import com.plexus.backend.dto.PartnerOrderResponse;
import com.plexus.backend.dto.PartnerOrderStatusResponse;
import com.plexus.backend.dto.PartnerOrderValidationRequest;
import com.plexus.backend.dto.PartnerOrderValidationResponse;
import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.service.PriceHistoryService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

/**
 * Partner API: turn a cart into commandes d'achat, for the commercial mobile app.
 *
 * <p>This is the dashboard's panier validation, exposed. It reproduces that flow step for
 * step — same Business Central entities, same header flags, same two follow-up PATCHes —
 * so a commande created from a phone is indistinguishable from one created by a user, and
 * lands in the same "Commandes en attente" list awaiting the supplier's answer.
 *
 * <p>What that means concretely:
 * <ul>
 *   <li><b>One commande per vendor.</b> A commande in BC is placed with one supplier, so a
 *       cart holding parts from three suppliers becomes three commandes — exactly as the
 *       panier does when it groups the cart by {@code vendorNumber}.</li>
 *   <li><b>Prices come from the live catalogue</b> unless the caller overrides them. A
 *       mobile app that cached a price last week must not be able to place an order at it
 *       by accident.</li>
 *   <li><b>Every (reference, vendor) pair is checked before anything is written.</b> A
 *       supplier that does not carry the part is a {@code 400}, not a half-built commande
 *       somebody has to delete by hand in BC.</li>
 *   <li><b>The dossier assurance travels with the order</b> — insurer, n° de sinistre,
 *       assuré, immatriculation, VIN. Same fields, same two-step write as the panier: the
 *       NEL API page rejects {@code InsuredName}, so it is PATCHed afterwards through our
 *       own API page.</li>
 * </ul>
 *
 * <p><b>Two identifiers, two jobs</b>, both written on every commande:
 * <ul>
 *   <li>{@code pecDossier} ({@code PLX_PecDossier}, "Pec-Dossier") <b>groups</b>. A dossier
 *       holds as many commandes as were needed — one per vendor for a split cart, plus
 *       anything ordered later. It is what {@code GET /orders/{pecDossier}} lists.</li>
 *   <li>{@code externalReference} ({@code PLX_ExternalReference}) makes retries <b>safe</b>.
 *       It is looked up before anything is written: a vendor already served by this same
 *       call comes back as it stands, so a retry after a timeout or a partial failure
 *       completes the cart instead of duplicating it.</li>
 * </ul>
 * They must not be merged. Keying idempotency on the dossier would take a genuine second
 * commande — same dossier, same vendor, ordered days later — for a retry, hand back the
 * first commande's number and order nothing.
 *
 * <p>Authentication is the shared API key on {@code X-API-Key}, like the rest of
 * {@code /api/partner/**}. BC error bodies are logged here and never forwarded.
 */
@RestController
@RequestMapping("/api/partner/v1")
@Slf4j
public class PartnerOrderController {

    /** Insurer stamped when the caller sends a dossier without naming one. */
    private static final String DEFAULT_INSURANCE_NAME = "MAE ASSURANCE";

    /** Item Vendor entity — the catalogue rows behind {@code GET /articles}. */
    private static final String ITEM_VENDORS = "plexusItemVendors";

    /**
     * Cause stamped on every commande dropped through this API.
     *
     * <p>Nothing here is a cancellation in the business sense: no order was ever placed, a
     * devis simply did not convert. Real cancellations — the ones an expert, a client or the
     * insurer decided — are made from the dashboard and keep their own reasons, so the two
     * never mix in the reporting.
     *
     * <p>{@code ShippingAdvice} still becomes {@code Annulation}: that Option belongs to
     * another extension and cannot be extended, and it is also what keeps the commande out of
     * the suppliers' and clients' screens — wanted here too. The distinction lives in the
     * cause, which the export query {@code plexusExportOrderLines} already carries as
     * {@code causeOfCancellation}. One exact word, no punctuation: the dashboard splits on
     * equality, and a value typed by a caller would eventually drift.
     */
    private static final String CANCEL_CAUSE_DEVIS = "Devis";

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    /** Owns the "valider le disponible" split rule; called rather than duplicated. */
    private final PurchaseOrderController purchaseOrderController;
    /** Same source as the dashboard's "MAJ prix" chip and as {@code GET /articles}. */
    private final PriceHistoryService priceHistoryService;
    private final ObjectMapper mapper = new ObjectMapper();

    /** NEL purchases API — owns PlexuspurchaseOrders and its lines. */
    @Value("${business-central.api.base-url}")
    private String baseUrl;

    /** Our own API group — owns plexusItemVendors and plexusPurchaseOrderPatches. */
    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    /** Same default customer as the demandes de devis: the commercial app acts for PLEXUSPEC. */
    @Value("${demande-devis.customer-no:C0090}")
    private String defaultCustomerNo;

    public PartnerOrderController(WebClient webClient, BusinessCentralTokenService tokenService,
            PurchaseOrderController purchaseOrderController, PriceHistoryService priceHistoryService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.purchaseOrderController = purchaseOrderController;
        this.priceHistoryService = priceHistoryService;
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
    }

    // ------------------------------------------------------------------
    // Create
    // ------------------------------------------------------------------

    @PostMapping(value = "/orders", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createOrders(@Valid @RequestBody PartnerOrderRequest request) {
        String externalRef = request.externalReference().trim();
        String token = tokenService.getAccessToken();

        Map<String, JsonNode> catalogue;
        try {
            catalogue = loadCatalogue(request.items(), token);
        } catch (Exception e) {
            log.error("!!! Could not read the catalogue for order {}: {}", externalRef, e.getMessage(), e);
            return upstreamError("Could not read the catalogue. Retry.");
        }

        // Nothing is written until every line is known to be orderable: a commande missing
        // half its parts costs more to clean up than a rejected request costs to resend.
        List<Map<String, String>> violations = new ArrayList<>();
        for (int i = 0; i < request.items().size(); i++) {
            PartnerOrderRequest.Item item = request.items().get(i);
            JsonNode row = catalogue.get(key(item.reference(), item.vendorNo()));
            if (row == null) {
                violations.add(Map.of(
                        "field", "items[" + i + "]",
                        "message", "vendor " + item.vendorNo().trim() + " does not carry reference "
                                + item.reference().trim()));
            } else if (item.unitPrice() == null && decimal(row, "ItemunitPrive") == null) {
                // Falling back to zero here would place a real order at no price. Better to
                // make the caller send one than to let a free commande through.
                violations.add(Map.of(
                        "field", "items[" + i + "].unitPrice",
                        "message", "reference " + item.reference().trim() + " has no catalogue price at vendor "
                                + item.vendorNo().trim() + " — send unitPrice explicitly"));
            }
        }
        if (!violations.isEmpty()) {
            log.warn("Order {} rejected: {}", externalRef, violations);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("error", "validation_failed");
            body.put("message", "Some items are not available from the vendor they were ordered from.");
            body.put("violations", violations);
            return ResponseEntity.badRequest().body(body);
        }

        // One commande per vendor, in the order the vendors first appear in the cart.
        Map<String, List<PartnerOrderRequest.Item>> byVendor = new LinkedHashMap<>();
        for (PartnerOrderRequest.Item item : request.items()) {
            byVendor.computeIfAbsent(item.vendorNo().trim(), k -> new ArrayList<>()).add(item);
        }

        // Idempotency. Their backend retries on timeout, and a duplicated commande means a
        // supplier is asked twice for the same parts. With no local database, BC is the
        // source of truth: the commandes already written under THIS externalReference are
        // looked up before anything else — so a retry after a partial failure finishes the
        // job instead of restarting it, while a new call on the same dossier still orders.
        String pecDossier = request.pecDossier().trim();
        Map<String, PartnerOrderResponse.CreatedOrder> existing;
        try {
            existing = findAttempt(externalRef, token);
        } catch (Exception e) {
            // Writing blind here could duplicate the whole cart. Refusing costs a retry.
            log.error("!!! Could not check externalReference {} before writing: {}",
                    externalRef, e.getMessage(), e);
            return upstreamError("Could not verify whether this request already created commandes. Retry.");
        }

        List<PartnerOrderResponse.CreatedOrder> created = new ArrayList<>();
        List<PartnerOrderResponse.FailedVendor> failed = new ArrayList<>();

        for (Map.Entry<String, List<PartnerOrderRequest.Item>> group : byVendor.entrySet()) {
            PartnerOrderResponse.CreatedOrder already = existing.get(group.getKey().toUpperCase());
            if (already != null) {
                log.info("Request {} already created commande {} for vendor {} — not creating a second one",
                        externalRef, already.number(), group.getKey());
                created.add(already);
                continue;
            }
            try {
                created.add(createOrder(group.getKey(), group.getValue(), request, catalogue, token));
            } catch (WebClientResponseException e) {
                log.error("!!! BC refused the commande for vendor {} (externalReference={}): {} {}",
                        group.getKey(), externalRef, e.getStatusCode(), e.getResponseBodyAsString());
                failed.add(new PartnerOrderResponse.FailedVendor(group.getKey(),
                        "Business Central refused this commande."));
            } catch (Exception e) {
                log.error("!!! Error creating the commande for vendor {} (externalReference={}): {}",
                        group.getKey(), externalRef, e.getMessage(), e);
                failed.add(new PartnerOrderResponse.FailedVendor(group.getKey(),
                        "Could not create this commande."));
            }
        }

        boolean duplicate = created.stream().anyMatch(PartnerOrderResponse.CreatedOrder::alreadyExisted);
        PartnerOrderResponse body = new PartnerOrderResponse(externalRef, pecDossier, created, failed, duplicate);
        log.info("Order {} (dossier {}) → {} commande(s) {} ({} already existed), {} failed",
                externalRef, pecDossier, created.size(),
                created.stream().map(PartnerOrderResponse.CreatedOrder::number).toList(),
                created.stream().filter(PartnerOrderResponse.CreatedOrder::alreadyExisted).count(),
                failed.size());

        if (created.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(body);
        }
        // Partial success must not read as success: the caller has commandes to honour AND a
        // vendor group to resend, and a 201 would hide the second half. A pure replay is a
        // 200 rather than a 201 — nothing was created this time.
        if (!failed.isEmpty()) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(body);
        }
        boolean createdSomething = created.stream().anyMatch(o -> !o.alreadyExisted());
        return ResponseEntity.status(createdSomething ? HttpStatus.CREATED : HttpStatus.OK).body(body);
    }

    // ------------------------------------------------------------------
    // One commande
    // ------------------------------------------------------------------

    /**
     * Mirrors {@code PurchaseOrderController.createBulkPurchaseOrder}: create the header,
     * PATCH what the POST cannot set, then append the lines.
     */
    private PartnerOrderResponse.CreatedOrder createOrder(
            String vendorNo,
            List<PartnerOrderRequest.Item> items,
            PartnerOrderRequest request,
            Map<String, JsonNode> catalogue,
            String token) throws Exception {

        String today = LocalDate.now().toString();
        String customerNo = blank(request.customerNo()) ? defaultCustomerNo : request.customerNo().trim();
        String registration = request.vehicle().immatriculation().trim();
        PartnerOrderRequest.Insurance insurance = request.insurance();

        ObjectNode header = mapper.createObjectNode();
        header.put("vendorNumber", vendorNo);
        header.put("SellToCustomerNo", customerNo);
        header.put("orderDate", today);
        header.put("postingDate", today);
        // "Attente" is what the panier sends: the commande waits for the supplier's answer.
        header.put("ShippingAdvice", "Attente");
        header.put("Delivred", "Non");
        header.put("QtyReceived", "Non");
        header.put("RegistrationNumber", registration);
        if (!blank(request.vehicle().vin())) {
            header.put("VIN", request.vehicle().vin().trim());
        }
        if (insurance != null) {
            header.put("InsuranceName",
                    blank(insurance.name()) ? DEFAULT_INSURANCE_NAME : insurance.name().trim());
            header.put("SinitreNumber", blank(insurance.claimNumber()) ? "" : insurance.claimNumber().trim());
            header.put("InsuranceCode", 0);
            header.put("Insurancefile", true);
        }

        String headerBody = webClient.post()
                .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders"))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(header.toString())
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(60));

        JsonNode headerNode = mapper.readTree(headerBody);
        String orderId = text(headerNode, "id");
        String etag = headerNode.has("@odata.etag") ? headerNode.get("@odata.etag").asText() : "*";

        // BC ignores relational fields on POST, and an order left to auto-receive would jump
        // straight past the supplier confirmation the whole flow is built around.
        ObjectNode patch = mapper.createObjectNode();
        patch.put("QtyReceived", "Non");
        patch.put("SellToCustomerNo", customerNo);
        try {
            webClient.method(HttpMethod.PATCH)
                    .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", etag)
                    .bodyValue(patch.toString())
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(60));
        } catch (Exception e) {
            log.warn("Header PATCH failed for {}: {}", orderId, e.getMessage());
        }

        // InsuredName is not on the NEL page — it goes through our own patch API, together
        // with VIN and immatriculation so the whole dossier lands even if the POST dropped them.
        ObjectNode metadata = mapper.createObjectNode();
        metadata.put("pecDossier", request.pecDossier().trim());
        metadata.put("externalReference", request.externalReference().trim());
        if (insurance != null && !blank(insurance.insuredName())) {
            metadata.put("InsuredName", insurance.insuredName().trim());
        }
        if (!blank(request.vehicle().vin())) {
            metadata.put("VIN", request.vehicle().vin().trim());
        }
        metadata.put("RegistrationNumber", registration);
        // This one is not allowed to fail quietly like the header patch above: it carries
        // externalReference, which protects the next retry from duplicating this commande,
        // and pecDossier, without which the partner cannot follow it. If it did not land, say
        // so loudly — the alternative is a commande nobody can recognise as already done.
        try {
            webClient.method(HttpMethod.PATCH)
                    .uri(java.net.URI.create(tarekSystemUrl + "/plexusPurchaseOrderPatches(" + orderId + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue(metadata.toString())
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(30));
        } catch (Exception e) {
            log.error("!!! Dossier PATCH failed for {} (dossier {}): {} — this commande is NOT "
                    + "protected against a retry, tag it by hand in BC", orderId, request.pecDossier(),
                    e.getMessage());
        }

        // Lines. The totals are read back from what BC returns rather than recomputed here:
        // the vendor discount is applied server-side, so a local quantity × price would
        // announce a number the commande does not carry.
        BigDecimal total = BigDecimal.ZERO;
        for (PartnerOrderRequest.Item item : items) {
            JsonNode row = catalogue.get(key(item.reference(), item.vendorNo()));
            ObjectNode line = mapper.createObjectNode();
            line.put("lineType", "Item");
            line.put("lineObjectNumber", item.reference().trim());
            line.put("quantity", item.quantity());
            line.put("directUnitCost", item.unitPrice() != null
                    ? item.unitPrice()
                    : decimal(row, "ItemunitPrive"));
            String description = !blank(item.description()) ? item.description().trim() : text(row, "ItemDescription");
            line.put("description", description == null ? "" : description);
            boolean adaptable = Boolean.TRUE.equals(item.adaptable());
            line.put("UncertainReference", adaptable);
            line.put("ChassisNo", adaptable && !blank(item.chassisNo()) ? item.chassisNo().trim() : "");

            String lineBody = webClient.post()
                    .uri(java.net.URI.create(
                            baseUrl + "/PlexuspurchaseOrders(" + orderId + ")/PlexuspurchaseOrderLines"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(line.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));

            JsonNode createdLine = mapper.readTree(lineBody);
            BigDecimal amount = decimal(createdLine, "amountExcludingTax");
            if (amount != null) {
                total = total.add(amount);
            }
        }

        return new PartnerOrderResponse.CreatedOrder(
                text(headerNode, "number"), orderId, vendorNo, text(headerNode, "vendorName"),
                items.size(), total, false);
    }

    // ------------------------------------------------------------------
    // Read back — what the supplier answered
    // ------------------------------------------------------------------

    /**
     * The current state of every commande filed under a dossier.
     *
     * <p>A commande is not finished when it is placed: the supplier answers line by line,
     * and he can come back with another price — ordered at 490, confirmed at 590. Business
     * Central keeps the replaced figure, so both are reported and {@code priceChanged} says
     * which lines moved. Poll this after creating, or on {@code lastModified} changing.
     */
    @GetMapping("/orders/{pecDossier}")
    public ResponseEntity<?> getOrdersByDossier(@PathVariable String pecDossier) {
        return readDossier(pecDossier);
    }

    /** Query form, for a dossier whose value contains a slash. */
    @GetMapping(value = "/orders", params = "pecDossier")
    public ResponseEntity<?> getOrdersByDossierParam(@RequestParam String pecDossier) {
        return readDossier(pecDossier);
    }

    /**
     * One commande, by the number returned at creation — the endpoint the mobile app polls.
     *
     * <p>The intended loop: the commercial adds his references and validates, gets
     * {@code CA26/2130} back, keeps it, and reads it whenever he wants to know where the
     * commande stands. Availability and price both live in the answer, so the devis he hands
     * the customer is the one Plexus will actually invoice.
     *
     * <p>Query parameter and not a path segment on purpose: commande numbers contain a
     * slash, and Spring's HTTP firewall rejects {@code %2F} inside a path with a {@code 400}
     * before the request ever reaches here.
     *
     * <p>Only commandes created through this API are readable — they are the ones carrying a
     * {@code Pec-Dossier}. A commande keyed in on the dashboard answers {@code 404}, so a
     * leaked key cannot be used to walk the whole purchase history and read vendor prices.
     */
    @GetMapping(value = "/orders", params = "number")
    public ResponseEntity<?> getOrderByNumber(@RequestParam String number) {
        String orderNo = number == null ? "" : number.trim();
        if (orderNo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "validation_failed", "message", "number is required."));
        }

        try {
            String token = tokenService.getAccessToken();
            JsonNode row = findPartnerOrder(orderNo, token);
            if (row == null) {
                return notFound(orderNo);
            }
            return ResponseEntity.ok(readOrder(text(row, "id"), token));

        } catch (WebClientResponseException e) {
            log.error("!!! BC error reading commande {}: {} {}",
                    orderNo, e.getStatusCode(), e.getResponseBodyAsString());
            return upstreamError("Could not read the commande. Retry.");
        } catch (Exception e) {
            log.error("!!! Error reading commande {}: {}", orderNo, e.getMessage(), e);
            return upstreamError("Could not read the commande. Retry.");
        }
    }

    /**
     * The patch-page row of a commande this API is allowed to touch, or null.
     *
     * <p>"Allowed" means it carries a {@code pecDossier}, i.e. it was created here. A commande
     * keyed in on the dashboard is treated as unknown rather than forbidden: whether one
     * exists that this key may not read is itself none of the caller's business.
     */
    private JsonNode findPartnerOrder(String orderNo, String token) throws Exception {
        String filter = "number eq '" + orderNo.replace("'", "''") + "'";
        JsonNode value = mapper.readTree(get(tarekSystemUrl + "/plexusPurchaseOrderPatches?$filter="
                + DemandeDevisPortalController.odataEncode(filter), token)).get("value");

        JsonNode row = value != null && value.isArray() && !value.isEmpty() ? value.get(0) : null;
        if (row == null) {
            return null;
        }
        if (blank(text(row, "pecDossier"))) {
            log.warn("Partner asked for commande {} which was not created through the API", orderNo);
            return null;
        }
        return row;
    }

    private ResponseEntity<Map<String, String>> notFound(String orderNo) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "not_found", "message", "No commande with that number."));
    }

    private ResponseEntity<?> readDossier(String pecDossier) {
        String dossier = pecDossier == null ? "" : pecDossier.trim();
        if (dossier.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "validation_failed", "message", "pecDossier is required."));
        }

        try {
            String token = tokenService.getAccessToken();
            // All of them, including two from the same vendor: a dossier is a grouping, not
            // a single commande.
            List<PartnerOrderResponse.CreatedOrder> found = findOrders("pecDossier", dossier, token);
            if (found.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "not_found", "message", "No commande under that pecDossier."));
            }

            List<PartnerOrderStatusResponse.Order> orders = new ArrayList<>();
            for (PartnerOrderResponse.CreatedOrder ref : found) {
                orders.add(readOrder(ref.id(), token));
            }
            return ResponseEntity.ok(new PartnerOrderStatusResponse(dossier, orders));

        } catch (WebClientResponseException e) {
            log.error("!!! BC error reading dossier {}: {} {}",
                    dossier, e.getStatusCode(), e.getResponseBodyAsString());
            return upstreamError("Could not read the commandes. Retry.");
        } catch (Exception e) {
            log.error("!!! Error reading dossier {}: {}", dossier, e.getMessage(), e);
            return upstreamError("Could not read the commandes. Retry.");
        }
    }

    /**
     * Reads a commande without letting a slow Business Central turn a completed write into a
     * failure.
     *
     * <p>The split leaves a cleanup running in the background, and BC holds the record while
     * it does — a read fired immediately after blocks until it times out. Reporting that as a
     * failed validation would be a lie: the commandes exist. So the read is retried briefly
     * and then given up on, leaving {@code null} for the caller to fetch with
     * {@code GET /orders} a moment later.
     */
    private PartnerOrderStatusResponse.Order readOrderQuietly(String orderId, String token) {
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                return readOrder(orderId, token);
            } catch (Exception e) {
                log.warn("Read-back of {} failed (attempt {}/3): {}", orderId, attempt, e.getMessage());
                if (attempt < 3) {
                    try {
                        Thread.sleep(2000L * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return null;
                    }
                }
            }
        }
        log.error("!!! Could not read {} back after the write — the write itself went through", orderId);
        return null;
    }

    /** Header then lines: the header's {@code $expand} returns an empty line array here. */
    private PartnerOrderStatusResponse.Order readOrder(String orderId, String token) throws Exception {
        JsonNode header = mapper.readTree(get(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")", token));
        JsonNode lineRows = mapper.readTree(
                get(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")/PlexuspurchaseOrderLines", token))
                .get("value");

        // One batched lookup for the whole commande, so the caller can show the same "price
        // last moved on …" badge here as on the article search. A failure must not cost the
        // commande: the lines are what was asked for, the badge is a bonus.
        Map<String, PriceHistoryService.PriceUpdate> history = Map.of();
        if (lineRows instanceof ArrayNode refRows) {
            List<String> refs = new ArrayList<>();
            refRows.forEach(r -> {
                String ref = text(r, "lineObjectNumber");
                if (ref != null) {
                    refs.add(ref);
                }
            });
            try {
                history = priceHistoryService.lastUpdates(refs);
            } catch (Exception e) {
                log.warn("Price history unavailable for commande {}: {}", orderId, e.getMessage());
            }
        }

        List<PartnerOrderStatusResponse.Line> lines = new ArrayList<>();
        boolean anyPriceChanged = false;
        if (lineRows instanceof ArrayNode rows) {
            for (JsonNode row : rows) {
                BigDecimal unitPrice = decimal(row, "directUnitCost");
                BigDecimal previous = decimal(row, "OldUnitPrice");
                // BC leaves 0 in the field when no price was ever replaced — that is "never
                // changed", not "used to be free".
                boolean changed = previous != null
                        && previous.signum() != 0
                        && unitPrice != null
                        && previous.compareTo(unitPrice) != 0;
                anyPriceChanged |= changed;

                PriceHistoryService.PriceUpdate u = history.get(text(row, "lineObjectNumber"));

                lines.add(new PartnerOrderStatusResponse.Line(
                        text(row, "id"),
                        text(row, "lineObjectNumber"),
                        text(row, "description"),
                        decimal(row, "quantity"),
                        decimal(row, "receiveQuantity"),
                        unitPrice,
                        changed ? previous : null,
                        changed,
                        changed ? unitPrice.subtract(previous) : null,
                        u == null ? null : u.dateTime(),
                        text(row, "Decision"),
                        decimal(row, "QuantityAvailable"),
                        text(row, "DeliveryDate"),
                        decimal(row, "receivedQuantity")));
            }
        }

        String status = text(header, "ShippingAdvice");
        return new PartnerOrderStatusResponse.Order(
                text(header, "number"), orderId,
                text(header, "vendorNumber"), text(header, "vendorName"),
                text(header, "orderDate"),
                status,
                state(status, text(header, "Delivred"), text(header, "QtyReceived")),
                decimal(header, "totalAmountExcludingTax"),
                decimal(header, "totalAmountIncludingTax"),
                text(header, "lastModifiedDateTime"),
                anyPriceChanged,
                lines);
    }

    /**
     * Plain-language state, using the very filters the dashboard's own tabs are built on —
     * "Non traitées" is {@code ShippingAdvice eq 'Attente'}, "Commandes livrées" is
     * {@code Confirmé + Delivred=Oui + QtyReceived≠Oui}, and so on. Anything else is reported
     * as {@code UNKNOWN} rather than guessed at.
     */
    private String state(String shippingAdvice, String delivred, String qtyReceived) {
        String advice = shippingAdvice == null ? "" : shippingAdvice.trim();
        boolean delivered = "Oui".equalsIgnoreCase(delivred);
        boolean received = "Oui".equalsIgnoreCase(qtyReceived);

        if ("Annulation".equalsIgnoreCase(advice)) {
            return "CANCELLED";
        }
        if ("Attente".equalsIgnoreCase(advice)) {
            return "AWAITING_SUPPLIER";
        }
        if ("ConfirmationPartielle".equalsIgnoreCase(advice)) {
            return "PARTIALLY_CONFIRMED";
        }
        if ("Totalité".equalsIgnoreCase(advice) || "LivraisonDispo".equalsIgnoreCase(advice)) {
            return "CONFIRMED";
        }
        if ("Confirmé".equalsIgnoreCase(advice)) {
            if (received) {
                return "RECEIVED";
            }
            return delivered ? "SHIPPED" : "CONFIRMED";
        }
        return "UNKNOWN";
    }

    private String get(String url, String token) {
        return webClient.get()
                .uri(java.net.URI.create(url))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(60));
    }

    // ------------------------------------------------------------------
    // Validate — keep what the commercial wants, drop the rest
    // ------------------------------------------------------------------

    /**
     * Commits a commande to the quantities the commercial retained.
     *
     * <p>Reproduces the dashboard's "Totalité de disponible" on Émises en cours, step for
     * step: a line kept at {@code 0} is <b>deleted</b> from the commande, the others get their
     * {@code receiveQuantity} and a {@code Disponible} decision, and the header moves to
     * {@code Totalité}. So a commercial who takes two references from one supplier and one
     * from another leaves each commande carrying only what he actually buys.
     *
     * <p>Order of operations matters: the header is moved <b>first</b>, as the dashboard does.
     * Deleting lines from a commande still open for the supplier would let him answer a line
     * that no longer exists.
     */
    @PostMapping(value = "/orders/validate", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> validateOrder(@Valid @RequestBody PartnerOrderValidationRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        String orderNo = request.number().trim();
        String token;
        JsonNode patchRow;
        try {
            token = tokenService.getAccessToken();
            patchRow = findPartnerOrder(orderNo, token);
        } catch (Exception e) {
            log.error("!!! Error looking up commande {} to validate: {}", orderNo, e.getMessage(), e);
            return upstreamError("Could not read the commande. Retry.");
        }

        if (patchRow == null) {
            return notFound(orderNo);
        }
        String orderId = text(patchRow, "id");

        try {
            JsonNode header = mapper.readTree(get(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")", token));
            String status = text(header, "ShippingAdvice");

            // A replay must not delete a second round of lines: the caller's payload still
            // names lines this call already removed. Answer with the commande as it stands.
            if (VALIDATED_ADVICES.contains(status)) {
                log.info("Commande {} was already validated ({}) — nothing to do", orderNo, status);
                return ResponseEntity.ok(new PartnerOrderValidationResponse(
                        orderNo, false, true, List.of(), List.of(), null, readOrder(orderId, token)));
            }
            if (!"ConfirmationPartielle".equalsIgnoreCase(status == null ? "" : status.trim())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "not_validatable",
                        "message", "Attente".equalsIgnoreCase(status == null ? "" : status.trim())
                                ? "The supplier has not answered this commande yet."
                                : "This commande cannot be validated in its current state: " + status));
            }

            JsonNode lineRows = mapper.readTree(
                    get(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")/PlexuspurchaseOrderLines", token))
                    .get("value");

            // Resolve the payload against the commande before touching anything.
            Map<String, JsonNode> byId = new LinkedHashMap<>();
            Map<String, List<JsonNode>> byReference = new LinkedHashMap<>();
            if (lineRows instanceof ArrayNode rows) {
                for (JsonNode row : rows) {
                    byId.put(text(row, "id"), row);
                    byReference.computeIfAbsent(
                            text(row, "lineObjectNumber") == null
                                    ? ""
                                    : text(row, "lineObjectNumber").toUpperCase(),
                            k -> new ArrayList<>())
                            .add(row);
                }
            }

            List<Map<String, String>> violations = new ArrayList<>();
            Map<String, BigDecimal> keptById = new LinkedHashMap<>();

            for (int i = 0; i < request.lines().size(); i++) {
                PartnerOrderValidationRequest.Line asked = request.lines().get(i);

                // A line asked for at 0 that is no longer on the commande has already had its
                // effect. That happens on a retry after a validation that died between
                // deleting the lines and moving the header — refusing here would leave the
                // caller with no way forward, since his payload still names what he dropped.
                if (asked.quantity().signum() == 0 && !onCommande(asked, byId, byReference)) {
                    log.info("Line {} of {} was already removed — skipping",
                            blank(asked.lineId()) ? asked.reference() : asked.lineId(), orderNo);
                    continue;
                }

                JsonNode row = resolveLine(asked, byId, byReference, i, violations);
                if (row == null) {
                    continue;
                }
                String lineId = text(row, "id");
                if (keptById.containsKey(lineId)) {
                    violations.add(Map.of("field", "lines[" + i + "]",
                            "message", "this line is named twice in the payload"));
                    continue;
                }
                // Committing more than the supplier said he has would order what does not
                // exist; the dashboard caps the same input at QuantityAvailable.
                BigDecimal available = decimal(row, "QuantityAvailable");
                if (asked.quantity().signum() > 0 && available != null && available.signum() > 0
                        && asked.quantity().compareTo(available) > 0) {
                    violations.add(Map.of("field", "lines[" + i + "].quantity",
                            "message", "the supplier only has " + available.toPlainString()
                                    + " of reference " + text(row, "lineObjectNumber")));
                    continue;
                }
                keptById.put(lineId, asked.quantity());
            }

            // Silence on a line is not consent: this call both deletes and commits.
            for (Map.Entry<String, JsonNode> line : byId.entrySet()) {
                if (!keptById.containsKey(line.getKey())) {
                    violations.add(Map.of("field", "lines",
                            "message", "line " + text(line.getValue(), "lineObjectNumber")
                                    + " (lineId " + line.getKey() + ") is missing from the payload"));
                }
            }

            boolean nothingKept = keptById.values().stream().noneMatch(q -> q.signum() > 0);
            // Lines the supplier promised for later, among those being kept. They are the ones
            // the caller has to arbitrate on: deliver the rest now, or wait for everything.
            List<PartnerOrderValidationResponse.DeferredLine> deferred = new ArrayList<>();
            for (Map.Entry<String, BigDecimal> kept : keptById.entrySet()) {
                JsonNode row = byId.get(kept.getKey());
                if (kept.getValue().signum() > 0
                        && "LivPrevuaDate".equalsIgnoreCase(String.valueOf(text(row, "Decision")))) {
                    deferred.add(new PartnerOrderValidationResponse.DeferredLine(
                            text(row, "lineObjectNumber"), text(row, "description"),
                            kept.getValue(), text(row, "DeliveryDate"),
                            Boolean.TRUE.equals(request.splitDeferredLines())
                                    ? PartnerOrderValidationResponse.DeferredLine.MOVED
                                    : PartnerOrderValidationResponse.DeferredLine.REMOVED));
                }
            }
            if (violations.isEmpty() && !deferred.isEmpty() && request.splitDeferredLines() == null) {
                violations.add(Map.of("field", "splitDeferredLines",
                        "message", deferred.size() + " line(s) are promised for a later date — "
                                + "set splitDeferredLines to true to move them to a separate commande "
                                + "so the rest ships now, or false to keep the commande together"));
            }

            if (violations.isEmpty() && nothingKept) {
                // An empty commande is not a validated commande; cancelling is a different act.
                violations.add(Map.of("field", "lines",
                        "message", "at least one line must keep a quantity greater than 0 — "
                                + "a commande with nothing left has to be cancelled, not validated"));
            }

            if (!violations.isEmpty()) {
                log.warn("Validation of {} rejected: {}", orderNo, violations);
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("error", "validation_failed");
                body.put("message", "The commande was not validated.");
                body.put("violations", violations);
                return ResponseEntity.badRequest().body(body);
            }

            List<PartnerOrderValidationResponse.RemovedLine> removed = new ArrayList<>();
            PartnerOrderStatusResponse.Order splitOrder = null;

            if (deferred.isEmpty()) {
                // The dashboard's "Totalité de disponible", verbatim — and in its order.
                //
                // The header moves FIRST. Deleting lines makes Business Central recompute the
                // document, and a header PATCH fired straight after can block long enough to
                // time out: the lines would be gone, the commande still open, and the caller
                // holding a 502 for a validation that half happened. Moving the header first
                // also closes the commande to the supplier before its lines start vanishing.
                String etag = header.has("@odata.etag") ? header.get("@odata.etag").asText() : "*";
                bcWrite(HttpMethod.PATCH, baseUrl + "/PlexuspurchaseOrders(" + orderId + ")",
                        "{\"ShippingAdvice\":\"Totalité\"}", etag);

                removed.addAll(dropZeroLines(keptById, byId, token));

                for (Map.Entry<String, BigDecimal> kept : keptById.entrySet()) {
                    if (kept.getValue().signum() == 0) {
                        continue;
                    }
                    ObjectNode linePatch = mapper.createObjectNode();
                    linePatch.put("receiveQuantity", kept.getValue());
                    linePatch.put("Decision", "Disponible");
                    bcWrite(HttpMethod.PATCH,
                            baseUrl + "/PlexuspurchaseOrderLines(" + kept.getKey() + ")",
                            linePatch.toString(), null);
                }
            } else {
                // Here the lines go first: the split routine reads the commande's lines from
                // Business Central, and a line the commercial dropped must not be carried into
                // the new commande.
                removed.addAll(dropZeroLines(keptById, byId, token));

                // Some lines are promised for a date. This is the dashboard's "Valider le
                //     disponible", and it is a 500-line rule: it clones the header field by
                //     field onto a new commande, moves the deferred lines, confirms the rest
                //     and cancels the original when nothing is left. Re-implementing it here
                //     would guarantee the two drift apart, so the existing endpoint's method
                //     is called directly — one implementation, one behaviour.
                ObjectNode splitBody = mapper.createObjectNode();
                splitBody.put("splitRequested", Boolean.TRUE.equals(request.splitDeferredLines()));
                splitBody.put("customerNo", text(header, "SellToCustomerNo"));
                com.fasterxml.jackson.databind.node.ArrayNode splitLines = splitBody.putArray("lines");
                for (Map.Entry<String, BigDecimal> kept : keptById.entrySet()) {
                    if (kept.getValue().signum() == 0) {
                        continue;
                    }
                    ObjectNode l = splitLines.addObject();
                    l.put("id", kept.getKey());
                    l.put("Decision", text(byId.get(kept.getKey()), "Decision"));
                    // The field that endpoint reads first for the quantity to commit.
                    l.put("invoiceQuantity", kept.getValue());
                }

                ResponseEntity<String> splitResult =
                        purchaseOrderController.splitLeDisponible(orderId, splitBody.toString(), servletRequest);
                if (!splitResult.getStatusCode().is2xxSuccessful()) {
                    log.error("!!! Split failed for {}: {} {}", orderNo, splitResult.getStatusCode(),
                            splitResult.getBody());
                    return upstreamError("Could not split the commande.");
                }

                if (Boolean.TRUE.equals(request.splitDeferredLines())) {
                    splitOrder = attachSplitToDossier(orderNo, text(patchRow, "pecDossier"), token);
                } else {
                    // The split routine only advances the header on its "yes" branch, so on
                    // "no" the commande would keep answering ConfirmationPartielle — validated
                    // in fact, not validated on paper, and still sitting in the "to validate"
                    // list. Finish the job the caller asked for.
                    webClient.method(HttpMethod.PATCH)
                            .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                            .header("If-Match", "*")
                            .bodyValue("{\"ShippingAdvice\":\"LivraisonDispo\"}")
                            .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(60));
                }
            }

            log.info("Commande {} validated — {} line(s) kept, {} removed, {} deferred (split={})",
                    orderNo, keptById.size() - removed.size(), removed.size(), deferred.size(),
                    request.splitDeferredLines());

            // Everything below is read-back only. The writes are done; a slow BC must not
            // turn them into a 502 the caller would retry.
            return ResponseEntity.ok(new PartnerOrderValidationResponse(
                    orderNo, true, false, removed, deferred, splitOrder,
                    readOrderQuietly(orderId, token)));

        } catch (WebClientResponseException e) {
            log.error("!!! BC refused the validation of {}: {} {}",
                    orderNo, e.getStatusCode(), e.getResponseBodyAsString());
            return upstreamError("Business Central refused the validation.");
        } catch (Exception e) {
            log.error("!!! Error validating {}: {}", orderNo, e.getMessage(), e);
            return upstreamError("Could not validate the commande.");
        }
    }

    /**
     * Stamps the dossier onto the commande the split just created, and returns it.
     *
     * <p>Without this the deferred lines would vanish from the partner's view: the split
     * clones a whitelist of Business Central header fields, and {@code Pec-Dossier} is ours,
     * so it is not among them. The new commande is found by {@code originalOrderNo}, which
     * the split does record.
     *
     * <p>{@code externalReference} is deliberately <b>not</b> copied: it identifies the call
     * that created a commande, and this one was born of a validation, not of that call.
     */
    private PartnerOrderStatusResponse.Order attachSplitToDossier(
            String originalNumber, String pecDossier, String token) {
        try {
            String filter = "originalOrderNo eq '" + originalNumber.replace("'", "''") + "'";
            JsonNode value = mapper.readTree(get(tarekSystemUrl + "/plexusPurchaseOrderPatches?$filter="
                    + DemandeDevisPortalController.odataEncode(filter), token)).get("value");
            if (!(value instanceof ArrayNode rows) || rows.isEmpty()) {
                log.error("!!! Split of {} produced no traceable commande — the deferred lines are "
                        + "NOT attached to dossier {}", originalNumber, pecDossier);
                return null;
            }
            // Newest last: a commande split twice would carry several.
            JsonNode row = rows.get(rows.size() - 1);
            String newId = text(row, "id");

            ObjectNode patch = mapper.createObjectNode();
            patch.put("pecDossier", pecDossier);
            webClient.method(HttpMethod.PATCH)
                    .uri(java.net.URI.create(tarekSystemUrl + "/plexusPurchaseOrderPatches(" + newId + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue(patch.toString())
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(30));

            log.info("Split commande {} attached to dossier {}", text(row, "number"), pecDossier);
            return readOrderQuietly(newId, token);
        } catch (Exception e) {
            // The split itself succeeded; losing the link is bad but not worth undoing it.
            log.error("!!! Could not attach the split commande of {} to dossier {}: {}",
                    originalNumber, pecDossier, e.getMessage(), e);
            return null;
        }
    }

    // ------------------------------------------------------------------
    // Batch — settle a whole dossier in one call
    // ------------------------------------------------------------------

    /**
     * Validates and cancels several commandes in one request.
     *
     * <p>A dossier splits into one commande per supplier and the commercial settles them
     * together — two validated, one cancelled. Doing that one HTTP call at a time means N
     * round trips for a single decision, so this takes the whole list.
     *
     * <p>It <b>delegates to the single-commande endpoints</b> rather than reimplementing them:
     * same guards, same statuses, same bodies. A batch can therefore never drift from what
     * {@code /orders/validate} and {@code /orders/cancel} do on their own — which is the only
     * reason this endpoint is safe to add next to them.
     *
     * <p><b>Not transactional.</b> Business Central settles each commande on its own; one
     * refusal leaves the others done. Every commande gets its own result, so the caller knows
     * exactly what to resend rather than having to guess from one overall verdict.
     */
    @PostMapping(value = "/orders/batch", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> settleBatch(@Valid @RequestBody PartnerBatchRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {

        List<PartnerBatchResponse.Result> results = new ArrayList<>();
        int ok = 0;

        for (PartnerBatchRequest.Entry entry : request.orders()) {
            String number = entry.number() == null ? "" : entry.number().trim();
            String action = entry.action() == null ? "" : entry.action().trim().toLowerCase();

            ResponseEntity<?> answer;
            if (PartnerBatchRequest.Entry.VALIDATE.equals(action)) {
                if (entry.lines() == null || entry.lines().isEmpty()) {
                    answer = ResponseEntity.badRequest().body(Map.of(
                            "error", "validation_failed",
                            "message", "lines is required when action is \"validate\"."));
                } else {
                    List<PartnerOrderValidationRequest.Line> lines = entry.lines().stream()
                            .map(l -> new PartnerOrderValidationRequest.Line(
                                    l.lineId(), l.reference(), l.quantity()))
                            .toList();
                    answer = validateOrder(new PartnerOrderValidationRequest(
                            number, entry.splitDeferredLines(), lines), servletRequest);
                }
            } else if (PartnerBatchRequest.Entry.CANCEL.equals(action)) {
                answer = cancelOrder(new PartnerOrderCancelRequest(number));
            } else {
                answer = ResponseEntity.badRequest().body(Map.of(
                        "error", "validation_failed",
                        "message", "action must be \"validate\" or \"cancel\", got: " + entry.action()));
            }

            boolean success = answer.getStatusCode().is2xxSuccessful();
            if (success) {
                ok++;
            }
            results.add(new PartnerBatchResponse.Result(
                    number, action, answer.getStatusCode().value(), success, answer.getBody()));
        }

        int failed = results.size() - ok;
        log.info("Batch settled — {} ok, {} failed: {}", ok, failed,
                results.stream().map(r -> r.number() + "=" + r.status()).toList());

        PartnerBatchResponse body = new PartnerBatchResponse(ok, failed, results);
        if (failed == 0) {
            return ResponseEntity.ok(body);
        }
        // Mixed or total failure both keep the per-commande detail; the status only says
        // whether anything got through, so a caller never has to diff two reads to find out.
        return ResponseEntity.status(ok > 0 ? HttpStatus.MULTI_STATUS : HttpStatus.BAD_REQUEST)
                .body(body);
    }

    // ------------------------------------------------------------------
    // Cancel — the commande that is not placed after all
    // ------------------------------------------------------------------

    /**
     * Cancels a commande, the way the dashboard's "Annulation commande" does:
     * {@code ShippingAdvice = Annulation} plus the reason, nothing deleted.
     *
     * <p>This is the other half of {@code /orders/validate}. A cart split across two
     * suppliers where the commercial buys everything from the first leaves the second
     * commande with nothing to keep — and validating it with every line at 0 is refused on
     * purpose, so that dropping a commande stays a deliberate act rather than the side effect
     * of an empty list. This is that act.
     */
    @PostMapping(value = "/orders/cancel", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> cancelOrder(@Valid @RequestBody PartnerOrderCancelRequest request) {
        String orderNo = request.number().trim();
        try {
            String token = tokenService.getAccessToken();
            JsonNode patchRow = findPartnerOrder(orderNo, token);
            if (patchRow == null) {
                return notFound(orderNo);
            }
            String orderId = text(patchRow, "id");
            JsonNode header = mapper.readTree(get(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")", token));
            String status = text(header, "ShippingAdvice");

            // A retry must not fail: report the commande as it stands.
            if ("Annulation".equalsIgnoreCase(status == null ? "" : status.trim())) {
                log.info("Commande {} was already cancelled", orderNo);
                return ResponseEntity.ok(new PartnerOrderCancelResponse(
                        orderNo, false, true, readOrderQuietly(orderId, token)));
            }

            // Goods that have moved cannot be un-ordered by flipping a flag — that needs a
            // return, which is a different operation entirely. Refuse rather than leave the
            // commande and the stock telling two different stories.
            boolean shipped = "Oui".equalsIgnoreCase(String.valueOf(text(header, "Delivred")));
            boolean received = "Oui".equalsIgnoreCase(String.valueOf(text(header, "QtyReceived")));
            if (shipped || received) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "not_cancellable",
                        "message", received
                                ? "This commande has already been received; it cannot be cancelled."
                                : "This commande has already been shipped; it cannot be cancelled."));
            }

            ObjectNode patch = mapper.createObjectNode();
            patch.put("ShippingAdvice", "Annulation");
            patch.put("CauseofCancellation", CANCEL_CAUSE_DEVIS);
            String etag = header.has("@odata.etag") ? header.get("@odata.etag").asText() : "*";
            webClient.method(HttpMethod.PATCH)
                    .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", etag)
                    .bodyValue(patch.toString())
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(60));

            // Le statut que lit le reporting : le ghost field reste 'Annulation' (il cache la
            // commande aux fournisseurs et aux clients, et son option ne peut pas être
            // étendue), celui-ci dit ce que c'était vraiment. Une garde dans
            // PlexusDashboardMgt empêche le mirroring de l'écraser à la modification suivante
            // — sans elle cette écriture ne tiendrait pas.
            try {
                ObjectNode statusPatch = mapper.createObjectNode();
                statusPatch.put("plxShippingAdvice", CANCEL_CAUSE_DEVIS);
                webClient.method(HttpMethod.PATCH)
                        .uri(java.net.URI.create(
                                tarekSystemUrl + "/plexusPurchaseOrderPatches(" + orderId + ")"))
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .header("If-Match", "*")
                        .bodyValue(statusPatch.toString())
                        .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(30));
            } catch (Exception e) {
                // La commande est bien retirée ; seul son étiquetage a échoué. Le dire fort
                // plutôt que d'annuler ce qui a marché — mais elle comptera comme une vraie
                // annulation dans le reporting tant que ce n'est pas corrigé à la main.
                log.error("!!! {} dropped but not tagged '{}' in PLX_ShippingAdvice: {} — it will "
                        + "count as a real cancellation in the reporting", orderNo,
                        CANCEL_CAUSE_DEVIS, e.getMessage());
            }

            log.info("Commande {} dropped as {}", orderNo, CANCEL_CAUSE_DEVIS);
            return ResponseEntity.ok(new PartnerOrderCancelResponse(
                    orderNo, true, false, readOrderQuietly(orderId, token)));

        } catch (WebClientResponseException e) {
            log.error("!!! BC refused the cancellation of {}: {} {}",
                    orderNo, e.getStatusCode(), e.getResponseBodyAsString());
            return upstreamError("Business Central refused the cancellation.");
        } catch (Exception e) {
            log.error("!!! Error cancelling {}: {}", orderNo, e.getMessage(), e);
            return upstreamError("Could not cancel the commande.");
        }
    }

    /** Header values that mean the commande has already been committed. */
    private static final java.util.Set<String> VALIDATED_ADVICES = java.util.Set.of(
            "Totalité", "LivraisonDispo", "Confirmé");

    /**
     * A write to Business Central, retried once on a timeout.
     *
     * <p>Writing a purchase document here is not a quick call: every PATCH and DELETE fires the
     * dashboard-sync subscribers and makes BC recompute the document, and a minute is not
     * always enough — measured on real commandes, a line delete after a header change has gone
     * past it. A blown deadline was then surfacing as a {@code 502} on work that had actually
     * gone through, which is the worst thing this API can tell a caller.
     *
     * <p>Retrying is safe because all three writes are idempotent: the same status, the same
     * quantity, or a line that is already gone.
     */
    private void bcWrite(HttpMethod method, String url, String body, String etag) throws Exception {
        RuntimeException last = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                WebClient.RequestBodySpec spec = webClient.method(method)
                        .uri(java.net.URI.create(url))
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                        .header("If-Match", etag == null ? "*" : etag);
                if (body != null) {
                    spec.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
                    spec.bodyValue(body);
                }
                spec.retrieve().bodyToMono(String.class).block(Duration.ofSeconds(150));
                return;
            } catch (WebClientResponseException.NotFound gone) {
                // Deleting a line that is no longer there is the outcome we wanted. This is
                // exactly what the retry below runs into: the first attempt timed out on the
                // wire while Business Central went ahead and deleted it.
                if (method == HttpMethod.DELETE) {
                    log.info("BC line already gone, treating the delete as done: {}", url);
                    return;
                }
                throw gone;
            } catch (WebClientResponseException refused) {
                // Business Central answered and said no. Repeating the call will not change
                // its mind, and hiding a refusal behind a retry would be worse than failing.
                throw refused;
            } catch (RuntimeException broken) {
                // Everything else is the connection giving up before the answer came back —
                // a netty read timeout, whose message is null and which Reactor may have
                // wrapped, so it is caught by shape rather than by type. BC has very likely
                // carried the write out anyway, and all three writes here are idempotent, so
                // trying once more is safe.
                log.warn("BC write did not come back (attempt {}/2): {} {} — {}",
                        attempt, method, url, broken.toString());
                last = broken;
            }
        }
        throw last;
    }

    /** Whether the line the caller names is still on the commande. */
    private boolean onCommande(PartnerOrderValidationRequest.Line asked,
            Map<String, JsonNode> byId, Map<String, List<JsonNode>> byReference) {
        if (!blank(asked.lineId())) {
            return byId.containsKey(asked.lineId().trim());
        }
        if (blank(asked.reference())) {
            return true; // malformed; let resolveLine produce the proper violation
        }
        List<JsonNode> matches = byReference.get(asked.reference().trim().toUpperCase());
        return matches != null && !matches.isEmpty();
    }

    /** Deletes every line the caller kept at 0, and reports what left the commande. */
    private List<PartnerOrderValidationResponse.RemovedLine> dropZeroLines(
            Map<String, BigDecimal> keptById, Map<String, JsonNode> byId, String token)
            throws Exception {

        List<PartnerOrderValidationResponse.RemovedLine> removed = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> kept : keptById.entrySet()) {
            if (kept.getValue().signum() != 0) {
                continue;
            }
            JsonNode row = byId.get(kept.getKey());
            bcWrite(HttpMethod.DELETE,
                    baseUrl + "/PlexuspurchaseOrderLines(" + kept.getKey() + ")", null, null);
            removed.add(new PartnerOrderValidationResponse.RemovedLine(
                    kept.getKey(), text(row, "lineObjectNumber"), text(row, "description"),
                    decimal(row, "quantity")));
        }
        return removed;
    }

    /** Matches one payload line to one commande line, or records why it could not. */
    private JsonNode resolveLine(PartnerOrderValidationRequest.Line asked,
            Map<String, JsonNode> byId, Map<String, List<JsonNode>> byReference,
            int index, List<Map<String, String>> violations) {

        if (!blank(asked.lineId())) {
            JsonNode row = byId.get(asked.lineId().trim());
            if (row == null) {
                violations.add(Map.of("field", "lines[" + index + "].lineId",
                        "message", "no line with that lineId on this commande"));
            }
            return row;
        }
        if (blank(asked.reference())) {
            violations.add(Map.of("field", "lines[" + index + "]",
                    "message", "either lineId or reference is required"));
            return null;
        }

        List<JsonNode> matches = byReference.get(asked.reference().trim().toUpperCase());
        if (matches == null || matches.isEmpty()) {
            violations.add(Map.of("field", "lines[" + index + "].reference",
                    "message", "reference " + asked.reference().trim() + " is not on this commande"));
            return null;
        }
        if (matches.size() > 1) {
            // Guessing here could delete the wrong line.
            violations.add(Map.of("field", "lines[" + index + "].reference",
                    "message", "reference " + asked.reference().trim() + " appears on "
                            + matches.size() + " lines — use lineId"));
            return null;
        }
        return matches.get(0);
    }

    // ------------------------------------------------------------------
    // Idempotency
    // ------------------------------------------------------------------

    /**
     * Every commande matching one field of the patch page, in BC order.
     *
     * <p>A list and not a map: a dossier holds as many commandes as were needed — one per
     * vendor for a split cart, plus whatever was ordered later from the same vendor — and
     * collapsing them by vendor would silently drop all but the first.
     */
    private List<PartnerOrderResponse.CreatedOrder> findOrders(String field, String value, String token)
            throws Exception {
        String filter = field + " eq '" + value.replace("'", "''") + "'";
        String body = get(tarekSystemUrl + "/plexusPurchaseOrderPatches?$filter="
                + DemandeDevisPortalController.odataEncode(filter), token);

        List<PartnerOrderResponse.CreatedOrder> found = new ArrayList<>();
        JsonNode rows = mapper.readTree(body).get("value");
        if (rows instanceof ArrayNode array) {
            for (JsonNode row : array) {
                found.add(new PartnerOrderResponse.CreatedOrder(
                        text(row, "number"), text(row, "id"),
                        text(row, "vendorNo"), text(row, "vendorName"),
                        null, decimal(row, "totalExcludingTax"), true));
            }
        }
        return found;
    }

    /**
     * The commandes this very call already produced, keyed by vendor.
     *
     * <p>Keyed on {@code externalReference} and not on the dossier: one dossier legitimately
     * carries several commandes, including two from the same vendor ordered days apart, so
     * the dossier cannot tell a retry from a genuine second order. The reference of the call
     * can — the same one means "this is the same attempt", a new one means "order this".
     *
     * <p>Within one attempt there is at most one commande per vendor, which is what makes
     * the vendor the right key for resuming a partial creation.
     */
    private Map<String, PartnerOrderResponse.CreatedOrder> findAttempt(String externalRef, String token)
            throws Exception {
        Map<String, PartnerOrderResponse.CreatedOrder> byVendor = new LinkedHashMap<>();
        for (PartnerOrderResponse.CreatedOrder order : findOrders("externalReference", externalRef, token)) {
            if (order.vendorNo() != null) {
                byVendor.putIfAbsent(order.vendorNo().toUpperCase(), order);
            }
        }
        return byVendor;
    }

    // ------------------------------------------------------------------
    // Catalogue
    // ------------------------------------------------------------------

    /**
     * The catalogue rows for every reference in the cart, keyed by reference and vendor.
     *
     * <p>One request for the whole cart: BC accepts an {@code or} over repeats of the
     * <em>same</em> field, which is what lets the references be asked for together (it
     * refuses an {@code or} across two different fields — hence no vendor clause here; the
     * vendor is matched in Java on the rows that come back).
     */
    private Map<String, JsonNode> loadCatalogue(List<PartnerOrderRequest.Item> items, String token)
            throws Exception {
        LinkedHashSet<String> refs = new LinkedHashSet<>();
        for (PartnerOrderRequest.Item item : items) {
            String ref = item.reference() == null ? "" : item.reference().trim();
            if (!ref.isEmpty()) {
                refs.add(ref.replace("'", "''"));
            }
        }

        Map<String, JsonNode> byKey = new LinkedHashMap<>();
        List<String> all = new ArrayList<>(refs);
        for (int from = 0; from < all.size(); from += 25) {
            List<String> chunk = all.subList(from, Math.min(from + 25, all.size()));
            StringBuilder filter = new StringBuilder("(");
            for (int i = 0; i < chunk.size(); i++) {
                if (i > 0) {
                    filter.append(" or ");
                }
                filter.append("itemNo eq '").append(chunk.get(i)).append("'");
            }
            filter.append(")");

            String body = webClient.get()
                    .uri(java.net.URI.create(tarekSystemUrl + "/" + ITEM_VENDORS + "?$filter="
                            + DemandeDevisPortalController.odataEncode(filter.toString())))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            JsonNode value = mapper.readTree(body).get("value");
            if (value instanceof ArrayNode rows) {
                for (JsonNode row : rows) {
                    byKey.putIfAbsent(key(text(row, "itemNo"), text(row, "vendorNo")), row);
                }
            }
        }
        return byKey;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private String key(String reference, String vendorNo) {
        return (reference == null ? "" : reference.trim().toUpperCase())
                + "|" + (vendorNo == null ? "" : vendorNo.trim().toUpperCase());
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
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

    private ResponseEntity<Map<String, String>> upstreamError(String message) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "upstream_error", "message", message));
    }
}
