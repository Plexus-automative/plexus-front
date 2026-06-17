package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import java.time.Duration;
import com.plexus.backend.service.BLGeneratorService;
import com.plexus.backend.service.DevisGeneratorService;
import com.plexus.backend.service.FactureGeneratorService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/purchase-orders")
@Slf4j
public class PurchaseOrderController {

        private final WebClient webClient;
        private final BusinessCentralTokenService tokenService;
        private final BLGeneratorService blGeneratorService;
        private final DevisGeneratorService devisGeneratorService;
        private final FactureGeneratorService factureGeneratorService;
        private final java.util.Map<String, Long> activeValidations = new java.util.concurrent.ConcurrentHashMap<>();

        @Value("${business-central.api.base-url}")
        private String baseUrl;

        @Value("${business-central.api.system-url}")
        private String systemUrl;

        @Value("${business-central.api.tarek-system-url}")
        private String tarekSystemUrl;

        @Value("${business-central.api.company-id}")
        private String companyId;

        @jakarta.annotation.PostConstruct
        public void init() {
                String companyPath = "/companies(" + companyId + ")";
                if (baseUrl != null && !baseUrl.contains("/companies(")) {
                        baseUrl += companyPath;
                }
                if (systemUrl != null && !systemUrl.contains("/companies(")) {
                        systemUrl += companyPath;
                }
                if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
                        tarekSystemUrl += companyPath;
                }
                log.info("Initialized PurchaseOrderController with companyId: {}", companyId);
        }

        public PurchaseOrderController(WebClient webClient, BusinessCentralTokenService tokenService,
                        BLGeneratorService blGeneratorService, DevisGeneratorService devisGeneratorService,
                        FactureGeneratorService factureGeneratorService) {
                this.webClient = webClient;
                this.tokenService = tokenService;
                this.blGeneratorService = blGeneratorService;
                this.devisGeneratorService = devisGeneratorService;
                this.factureGeneratorService = factureGeneratorService;
        }

        @GetMapping
        public ResponseEntity<String> getPurchaseOrders(HttpServletRequest request) {
                return forwardRequest(request, org.springframework.http.HttpMethod.GET, null, "/PlexuspurchaseOrders");
        }

        @org.springframework.web.bind.annotation.PostMapping
        public ResponseEntity<String> createPurchaseOrder(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestBody(required = false) String body) {
                String modifiedBody = body;
                if (body != null && !body.isEmpty()) {
                        try {
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                com.fasterxml.jackson.databind.node.ObjectNode rootNode = (com.fasterxml.jackson.databind.node.ObjectNode) mapper
                                                .readTree(body);

                                String vendorNo = request.getHeader("X-Vendor-No");
                                String customerNo = request.getHeader("X-Customer-No");

                                if (vendorNo != null && !vendorNo.isEmpty()) {
                                        rootNode.put("vendorNumber", vendorNo);
                                }
                                if (customerNo != null && !customerNo.isEmpty()) {
                                        rootNode.put("SellToCustomerNo", customerNo);
                                }
                                modifiedBody = rootNode.toString();
                        } catch (Exception e) {
                                // Fallback to original body if parsing fails
                        }
                }
                return forwardRequest(request, org.springframework.http.HttpMethod.POST, modifiedBody,
                                "/PlexuspurchaseOrders");
        }

        @org.springframework.web.bind.annotation.PostMapping("/{orderId}/PlexuspurchaseOrderLines")
        public ResponseEntity<String> createPurchaseOrderLine(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.PathVariable("orderId") String orderId,
                        @org.springframework.web.bind.annotation.RequestBody(required = false) String body) {
                return forwardRequest(request, org.springframework.http.HttpMethod.POST, body,
                                "/PlexuspurchaseOrders(" + orderId + ")/PlexuspurchaseOrderLines");
        }

        @org.springframework.web.bind.annotation.PatchMapping("/{orderId}")
        public ResponseEntity<String> updatePurchaseOrder(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.PathVariable("orderId") String orderId,
                        @org.springframework.web.bind.annotation.RequestBody(required = false) String body) {
                return forwardRequest(request, org.springframework.http.HttpMethod.PATCH, body,
                                "/PlexuspurchaseOrders(" + orderId + ")");
        }

        @org.springframework.web.bind.annotation.PatchMapping("/lines/{lineId}")
        public ResponseEntity<String> updatePurchaseOrderLine(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.PathVariable("lineId") String lineId,
                        @org.springframework.web.bind.annotation.RequestBody(required = false) String body) {
                return forwardRequest(request, org.springframework.http.HttpMethod.PATCH, body,
                                "/PlexuspurchaseOrderLines(" + lineId + ")");
        }

        @org.springframework.web.bind.annotation.DeleteMapping("/lines/{lineId}")
        public ResponseEntity<String> deletePurchaseOrderLine(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.PathVariable("lineId") String lineId) {
                return forwardRequest(request, org.springframework.http.HttpMethod.DELETE, null,
                                "/PlexuspurchaseOrderLines(" + lineId + ")");
        }

        @org.springframework.web.bind.annotation.PostMapping("/bulk")
        public ResponseEntity<String> createBulkPurchaseOrder(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();

                try {
                        // 1. Parse the incoming bulk body
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        // Build header payload (everything except lines)
                        com.fasterxml.jackson.databind.node.ObjectNode headerPayload = mapper.createObjectNode();
                        java.util.Iterator<java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = rootNode
                                        .fields();
                        while (fields.hasNext()) {
                                java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields
                                                .next();
                                if (!field.getKey().equals("lines")) {
                                        headerPayload.set(field.getKey(), field.getValue());
                                }
                        }

                        // Strip fields not recognized by the NEL API page — will be set via PATCH
                        String savedInsuredName = null;
                        if (headerPayload.has("InsuredName")) {
                                savedInsuredName = headerPayload.get("InsuredName").asText();
                                headerPayload.remove("InsuredName");
                        }

                        // 2. Create Header
                        String headerResponseStr = webClient.post()
                                        .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                        .fromHttpUrl(baseUrl + "/PlexuspurchaseOrders").build(true)
                                                        .toUri())
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .bodyValue(headerPayload.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.JsonNode headerNode = mapper.readTree(headerResponseStr);
                        String orderId = headerNode.get("id").asText();
                        String orderEtag = headerNode.has("@odata.etag") ? headerNode.get("@odata.etag").asText() : "*";
                        log.info("Creating order result: {}", headerResponseStr);

                        // 2b. PATCH to set SellToCustomerNo and ensure QtyReceived is 'Non'
                        // (BC ignores relational fields during POST, and we want to prevent
                        // auto-reception)
                        com.fasterxml.jackson.databind.node.ObjectNode patchPayload = mapper.createObjectNode();
                        patchPayload.put("QtyReceived", "Non");

                        if (headerPayload.has("SellToCustomerNo")
                                        && !headerPayload.get("SellToCustomerNo").asText().isEmpty()) {
                                patchPayload.put("SellToCustomerNo", headerPayload.get("SellToCustomerNo").asText());
                        }

                        try {
                                String patchResponse = webClient
                                                .method(org.springframework.http.HttpMethod.PATCH)
                                                .uri(org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(baseUrl + "/PlexuspurchaseOrders("
                                                                                + orderId + ")")
                                                                .build(true).toUri())
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                .header("If-Match", orderEtag)
                                                .bodyValue(patchPayload.toString())
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(60));

                                log.info("Bulk creation PATCH payload: {}", patchPayload);
                                log.info("Bulk creation PATCH response: {}", patchResponse);
                                if (patchResponse != null && !patchResponse.isBlank()) {
                                        headerResponseStr = patchResponse;
                                }
                        } catch (Exception patchEx) {
                                // Silent fail for metadata patch
                        }

                        // 2c. PATCH metadata via plexustarek API (VIN, RegistrationNumber, InsuredName)
                        try {
                                com.fasterxml.jackson.databind.node.ObjectNode metadataPatch = mapper
                                                .createObjectNode();
                                boolean hasMetadata = false;

                                if (savedInsuredName != null && !savedInsuredName.isEmpty()) {
                                        metadataPatch.put("InsuredName", savedInsuredName);
                                        hasMetadata = true;
                                }
                                if (headerPayload.has("VIN") && !headerPayload.get("VIN").asText().isEmpty()) {
                                        metadataPatch.put("VIN", headerPayload.get("VIN").asText());
                                        hasMetadata = true;
                                }
                                if (headerPayload.has("RegistrationNumber")
                                                && !headerPayload.get("RegistrationNumber").asText().isEmpty()) {
                                        metadataPatch.put("RegistrationNumber",
                                                        headerPayload.get("RegistrationNumber").asText());
                                        hasMetadata = true;
                                }

                                if (hasMetadata) {
                                        String patchUrl = tarekSystemUrl + "/plexusPurchaseOrderPatches(" + orderId
                                                        + ")";
                                        webClient.method(org.springframework.http.HttpMethod.PATCH)
                                                        .uri(java.net.URI.create(patchUrl))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .header("If-Match", "*")
                                                        .bodyValue(metadataPatch.toString())
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(30));
                                        log.info("Metadata PATCH via plexustarek API succeeded for order {}", orderId);
                                }
                        } catch (Exception metadataEx) {
                                log.warn("Metadata PATCH via plexustarek API failed: {}", metadataEx.getMessage());
                        }

                        // 3. Create Lines
                        if (rootNode.has("lines") && rootNode.get("lines").isArray()) {
                                int lineCount = rootNode.get("lines").size();

                                int lineIndex = 0;
                                for (com.fasterxml.jackson.databind.JsonNode lineNode : rootNode.get("lines")) {
                                        lineIndex++;

                                        String lineResponse = webClient.post()
                                                        .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                        .fromHttpUrl(
                                                                                        baseUrl + "/PlexuspurchaseOrders("
                                                                                                        + orderId
                                                                                                        + ")/PlexuspurchaseOrderLines")
                                                                        .build(true).toUri())
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .bodyValue(lineNode.toString())
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(60));

                                }
                        } else {
                        }

                        return ResponseEntity.ok(headerResponseStr);

                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error communicating with Business Central: "
                                                        + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error communicating with Business Central: " + e.getMessage());
                }
        }

        @GetMapping("/ItemVendors")
        public ResponseEntity<String> getItemVendors(HttpServletRequest request) {
                String token = tokenService.getAccessToken();
                try {
                        String queryString = request.getQueryString();
                        // Using the standard NEL API endpoint
                        String itemVendorUrl = tarekSystemUrl + "/plexusItemVendors";

                        java.net.URI uri1 = org.springframework.web.util.UriComponentsBuilder
                                        .fromHttpUrl(itemVendorUrl)
                                        .query(queryString)
                                        .build(true)
                                        .toUri();

                        String response = webClient.get()
                                        .uri(uri1)
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode root1 = mapper.readTree(response);
                        com.fasterxml.jackson.databind.JsonNode valueNode1 = root1.get("value");

                        com.fasterxml.jackson.databind.node.ArrayNode combinedValues = mapper.createArrayNode();
                        java.util.Set<String> seenIds = new java.util.HashSet<>();

                        if (valueNode1 != null && valueNode1.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode node : valueNode1) {
                                        String id = node.has("id") ? node.get("id").asText() : node.toString();
                                        if (seenIds.add(id)) {
                                                combinedValues.add(node);
                                        }
                                }
                        }
                        // Always perform the second call if the query is by itemNo (checking both
                        // encoded and decoded spaces)
                        boolean hasItemNo = queryString != null
                                        && (queryString.contains("itemNo eq") || queryString.contains("itemNo%20eq"));
                        if (hasItemNo) {
                                String fallbackQueryString = queryString.replace("itemNo eq", "vendorItemNo eq")
                                                .replace("itemNo%20eq", "vendorItemNo%20eq");
                                java.net.URI uri2 = org.springframework.web.util.UriComponentsBuilder
                                                .fromHttpUrl(itemVendorUrl)
                                                .query(fallbackQueryString)
                                                .build(true)
                                                .toUri();

                                String response2 = webClient.get()
                                                .uri(uri2)
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(60));

                                com.fasterxml.jackson.databind.JsonNode root2 = mapper.readTree(response2);
                                com.fasterxml.jackson.databind.JsonNode valueNode2 = root2.get("value");

                                if (valueNode2 != null && valueNode2.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode node : valueNode2) {
                                                String id = node.has("id") ? node.get("id").asText() : node.toString();
                                                if (seenIds.add(id)) {
                                                        combinedValues.add(node);
                                                }
                                        }
                                }
                        }

                        if (root1.isObject()) {
                                ((com.fasterxml.jackson.databind.node.ObjectNode) root1).set("value", combinedValues);
                        }

                        return ResponseEntity.ok(mapper.writeValueAsString(root1));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode()).body("Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @GetMapping("/vendors")
        public ResponseEntity<String> getVendors(HttpServletRequest request) {
                String token = tokenService.getAccessToken();
                try {
                        // Using standard API since VendorLists is no longer exposed in custom API
                        String standardUrl = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0", "/api/v2.0")
                                        + "/vendors";
                        String response = webClient.get()
                                        .uri(uriBuilder -> {
                                                return org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(standardUrl)
                                                                .query(request.getQueryString())
                                                                .build(true)
                                                                .toUri();
                                        })
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));
                        return ResponseEntity.ok(response);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode()).body("Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @GetMapping("/customers")
        public ResponseEntity<String> getCustomers(HttpServletRequest request) {
                String token = tokenService.getAccessToken();
                try {
                        String standardUrl = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0", "/api/v2.0")
                                        + "/customers";
                        String response = webClient.get()
                                        .uri(uriBuilder -> {
                                                return org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(standardUrl)
                                                                .query(request.getQueryString())
                                                                .build(true)
                                                                .toUri();
                                        })
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));
                        return ResponseEntity.ok(response);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode()).body("Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @org.springframework.web.bind.annotation.PostMapping("/save-references")
        public ResponseEntity<String> saveReferences(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();
                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String vendorNumber = rootNode.has("vendorNumber") ? rootNode.get("vendorNumber").asText() : "";
                        com.fasterxml.jackson.databind.JsonNode items = rootNode.get("items");

                        // POST directly to plexusItemImports (tarekSystemUrl/plexustarek) — same as
                        // ArticleImportService
                        // This endpoint supports POST for creation but NOT GET with filters
                        String importUrl = tarekSystemUrl + "/plexusItemImports";

                        if (items != null && items.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode item : items) {
                                        String reference = item.has("reference") ? item.get("reference").asText() : "";
                                        String designation = item.has("designation") ? item.get("designation").asText()
                                                        : "";

                                        try {
                                                com.fasterxml.jackson.databind.node.ObjectNode postNode = mapper
                                                                .createObjectNode();
                                                postNode.put("vendorNo", vendorNumber);
                                                postNode.put("vendorItemNo", reference);
                                                postNode.put("ItemDescription",
                                                                (designation != null && !designation.isEmpty())
                                                                                ? designation
                                                                                : reference);
                                                postNode.put("genProdPostingGroup", "NEGOCE");
                                                postNode.put("vatProdPostingGroup", "TVA19");
                                                postNode.put("inventoryPostingGroup", "REVENTE");
                                                if (item.has("marque")) {
                                                        postNode.put("marque", item.get("marque").asText());
                                                }

                                                webClient.post()
                                                                .uri(java.net.URI.create(importUrl))
                                                                .header(HttpHeaders.AUTHORIZATION,
                                                                                "Bearer " + token)
                                                                .header(HttpHeaders.CONTENT_TYPE,
                                                                                "application/json")
                                                                .bodyValue(postNode.toString())
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .block(Duration.ofSeconds(60));
                                                log.info("Created item+vendor for ref={}, vendor={}", reference,
                                                                vendorNumber);

                                        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                                                int status = e.getStatusCode().value();
                                                String responseBody = e.getResponseBodyAsString();
                                                // 409 Conflict or duplicate record → item already exists, skip
                                                if (status == 409 || responseBody.contains("already exists")
                                                                || responseBody.contains("AlreadyExists")) {
                                                        log.info("Item+vendor already exists for ref={}, vendor={} — skipped",
                                                                        reference, vendorNumber);
                                                } else {
                                                        log.error("BC API Error (HTTP {}) for Item {}: {}",
                                                                        e.getStatusCode(), reference, responseBody);
                                                        throw new RuntimeException(
                                                                        "Failed to save reference in BC: "
                                                                                        + responseBody);
                                                }
                                        } catch (Exception e) {
                                                log.error("Item save failed for {}: {}", reference, e.getMessage());
                                                throw new RuntimeException(
                                                                "Failed to save reference: " + e.getMessage());
                                        }
                                }
                        }

                        return ResponseEntity.ok("{\"success\": true}");
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error saving references: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error saving references: " + e.getMessage());
                }
        }

        @GetMapping("/emises/non-traitee")
        public ResponseEntity<String> getEmisesNonTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request, "ShippingAdvice eq 'Attente'", skip,
                                top, "customer", null);
        }

        @GetMapping("/emises/en-cours")
        public ResponseEntity<String> getEmisesEnCours(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "subCategory", required = false) String subCategory,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                String filterValue;
                if ("validation".equalsIgnoreCase(subCategory)) {
                        filterValue = "ShippingAdvice eq 'ConfirmationPartielle' and status eq 'Draft' and Delivred eq 'Non' and QtyReceived eq 'Non'";
                } else if ("valide".equalsIgnoreCase(subCategory)) {
                        filterValue = "(ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and status eq 'Draft' and Delivred eq 'Non' and QtyReceived eq 'Non'";
                } else {
                        filterValue = "(ShippingAdvice eq 'ConfirmationPartielle' or ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and status eq 'Draft' and Delivred eq 'Non' and QtyReceived eq 'Non'";
                }
                return getFilteredPurchaseOrders(request, filterValue, skip, top, "customer", "ShippingAdvice desc");
        }

        @GetMapping("/emises/traitee")
        public ResponseEntity<String> getEmisesTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "ShippingAdvice eq 'Confirmé' and QtyReceived eq 'Oui'",
                                skip, top, "customer", null);
        }

        @GetMapping("/validation-reception")
        public ResponseEntity<String> getValidationReception(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "ShippingAdvice eq 'Confirmé' and Delivred eq 'Oui' and QtyReceived eq 'Non' and status eq 'Draft'",
                                skip, top, "customer", null);
        }

        @GetMapping("/recues/non-traitee")
        public ResponseEntity<String> getRecuesNonTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request, "status eq 'Draft' and ShippingAdvice eq 'Attente'", skip,
                                top, "vendor", null);
        }

        @GetMapping("/recues/en-cours")
        public ResponseEntity<String> getRecuesEnCours(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "subCategory", required = false) String subCategory,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                String filterValue;
                if ("validation".equalsIgnoreCase(subCategory)) {
                        filterValue = "status eq 'Draft' and ShippingAdvice eq 'ConfirmationPartielle' and Delivred ne 'Oui'";
                } else if ("valide".equalsIgnoreCase(subCategory)) {
                        filterValue = "status eq 'Draft' and (ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and Delivred ne 'Oui'";
                } else {
                        filterValue = "status eq 'Draft' and (ShippingAdvice eq 'ConfirmationPartielle' or ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and Delivred ne 'Oui'";
                }
                return getFilteredPurchaseOrders(request, filterValue, skip, top, "vendor", "ShippingAdvice desc");
        }

        @GetMapping("/recues/notifications")
        public ResponseEntity<String> getRecuesNotifications(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "status eq 'Draft' and (ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and Delivred ne 'Oui'",
                                skip, top, "vendor", "ShippingAdvice desc");
        }

        @GetMapping("/recues/traitee")
        public ResponseEntity<String> getRecuesTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "QtyReceived eq 'Oui' and ShippingAdvice eq 'Confirmé'",
                                skip, top, "vendor", null);
        }

        @GetMapping("/commandes-livree")
        public ResponseEntity<String> getCommandesLivree(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "ShippingAdvice eq 'Confirmé' and Delivred eq 'Oui' and QtyReceived ne 'Oui'",
                                skip, top, "vendor", null);
        }

        private ResponseEntity<String> getFilteredPurchaseOrders(HttpServletRequest request, String filterValue,
                        int skip, int top, String filterMode, String prefixOrderBy) {
                String vendorNo = request.getHeader("X-Vendor-No");
                String customerNo = request.getHeader("X-Customer-No");

                String search = request.getParameter("search");
                String sort = request.getParameter("sort");
                String desc = request.getParameter("desc");

                // Explicitly filter based on the route type
                if ("customer".equals(filterMode)) {
                        // Emises: orders the CLIENT placed, filter by SellToCustomerNo
                        if (customerNo != null && !customerNo.isEmpty()) {
                                filterValue += " and SellToCustomerNo eq '" + customerNo + "'";
                        } else {
                                // If it's a customer route but no customerNo, return empty result
                                return ResponseEntity.ok("{ \"value\": [], \"@odata.count\": 0 }");
                        }
                } else if ("vendor".equals(filterMode)) {
                        // Recues: orders the VENDOR received, filter by payToVendorNumber to map raw
                        // login IDs
                        if (vendorNo != null && !vendorNo.isEmpty()) {
                                filterValue += " and payToVendorNumber eq '" + vendorNo + "'";
                        } else {
                                // If it's a vendor route but no vendorNo, return empty result
                                return ResponseEntity.ok("{ \"value\": [], \"@odata.count\": 0 }");
                        }
                }

                String registration = request.getParameter("registration");
                if (search != null && !search.trim().isEmpty()) {
                        String cleanSearch = search.trim().replace("'", "''");
                        filterValue += " and contains(number, '" + cleanSearch + "')";
                }
                if (registration != null && !registration.trim().isEmpty()) {
                        String cleanReg = registration.trim().replace("'", "''");
                        filterValue += " and contains(RegistrationNumber, '" + cleanReg + "')";
                }

                String token = tokenService.getAccessToken();
                try {
                        // URL-encode OData query values properly
                        String encodedFilter = java.net.URLEncoder.encode(filterValue, "UTF-8");

                        String orderBy = "number desc";
                        if (sort != null && !sort.trim().isEmpty()) {
                                boolean isDesc = "true".equalsIgnoreCase(desc);
                                orderBy = sort.trim() + (isDesc ? " desc" : " asc");
                        }

                        if (prefixOrderBy != null && !prefixOrderBy.trim().isEmpty()) {
                                orderBy = prefixOrderBy.trim() + ", " + orderBy;
                        }
                        String encodedOrderBy = java.net.URLEncoder.encode(orderBy, "UTF-8");

                        String fullUrl = baseUrl + "/PlexuspurchaseOrders"
                                        + "?$filter=" + encodedFilter
                                        + "&$orderby=" + encodedOrderBy
                                        + "&$skip=" + skip
                                        + "&$top=" + top
                                        + "&$count=true"
                                        + "&$expand=PlexuspurchaseOrderLines";

                        String response = webClient.get()
                                        .uri(java.net.URI.create(fullUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        return ResponseEntity.ok(response);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error communicating with Business Central: "
                                                        + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error communicating with Business Central: " + e.getMessage());
                }
        }

        private ResponseEntity<String> forwardRequest(HttpServletRequest request,
                        org.springframework.http.HttpMethod method, String body, String path) {
                String token = tokenService.getAccessToken();

                try {
                        WebClient.RequestBodySpec requestBuilder = webClient.method(method)
                                        .uri(uriBuilder -> {
                                                return org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(baseUrl + path)
                                                                .query(request.getQueryString())
                                                                .build(true)
                                                                .toUri();
                                        })
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token);

                        // Add If-Match header for PATCH requests
                        if (method == org.springframework.http.HttpMethod.PATCH) {
                                requestBuilder.header("If-Match", "*");
                        }

                        if (body != null) {
                                requestBuilder.header(HttpHeaders.CONTENT_TYPE, "application/json");
                                requestBuilder.bodyValue(body);
                        }

                        String response = requestBuilder.retrieve()
                                        .bodyToMono(String.class)
                                        .timeout(Duration.ofSeconds(60))
                                        .defaultIfEmpty("")
                                        .block(Duration.ofSeconds(60));

                        log.info("Forwarded request [{} {}] - Response size: {}", method, path,
                                        response != null ? response.length() : 0);

                        return ResponseEntity.ok(response != null ? response : "");
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        // Auto-retry PATCH on Released orders: Reopen -> PATCH -> Release
                        if (method == org.springframework.http.HttpMethod.PATCH
                                        && e.getResponseBodyAsString().contains("Status must be equal to 'Open'")) {
                                log.warn(">>> forwardRequest: Order is Released, attempting Reopen -> PATCH -> Release for path: {}",
                                                path);
                                try {
                                        // Extract orderId from path like /PlexuspurchaseOrders(xxxx-xxxx-xxxx)
                                        String orderId = extractOrderIdFromPath(path);
                                        if (orderId != null) {
                                                reopenPurchaseOrder(orderId, token);

                                                // Retry the PATCH
                                                String retryResponse = webClient.method(method)
                                                                .uri(java.net.URI.create(baseUrl + path))
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                .header("If-Match", "*")
                                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                .bodyValue(body != null ? body : "{}")
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .timeout(Duration.ofSeconds(60))
                                                                .defaultIfEmpty("")
                                                                .block(Duration.ofSeconds(60));

                                                // Re-release after successful PATCH
                                                releasePurchaseOrder(orderId, token);

                                                log.info(">>> forwardRequest: Reopen->PATCH->Release succeeded for path: {}",
                                                                path);
                                                return ResponseEntity.ok(retryResponse != null ? retryResponse : "");
                                        }
                                } catch (Exception retryEx) {
                                        log.error(">>> forwardRequest: Reopen->PATCH->Release failed: {}",
                                                        retryEx.getMessage());
                                }
                        }
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error communicating with Business Central: "
                                                        + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error communicating with Business Central: " + e.getMessage());
                }
        }

        // ===== Confirm Reception: Client validates received quantities =====
        @org.springframework.web.bind.annotation.PostMapping("/confirm-reception")
        public ResponseEntity<String> confirmReception(
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();

                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String orderId = rootNode.has("id") ? rootNode.get("id").asText() : null;
                        log.info(">>> confirmReception started for orderId: {}", orderId);
                        if (orderId == null || orderId.isEmpty()) {
                                return ResponseEntity.badRequest().body("{\"error\": \"Missing order id\"}");
                        }

                        // Guard against concurrent validations with self-healing (5 min timeout)
                        long now = System.currentTimeMillis();
                        activeValidations.entrySet().removeIf(entry -> (now - entry.getValue()) > 300000); // 5 mins

                        if (activeValidations.putIfAbsent(orderId, now) != null) {
                                log.warn(">>> confirmReception: Validation already in progress for order: {}. Current active: {}",
                                                orderId, activeValidations.keySet());
                                return ResponseEntity.status(409)
                                                .body("{\"error\": \"Validation en cours pour cette commande (ID: "
                                                                + orderId + ")\"}");
                        }

                        boolean withReclamation = rootNode.has("withReclamation")
                                        && rootNode.get("withReclamation").asBoolean();
                        String reclamationText = rootNode.has("reclamationText")
                                        ? rootNode.get("reclamationText").asText("")
                                        : "";

                        // REOPEN order to allow modifications (bypass Released status error)
                        try {
                                reopenPurchaseOrder(orderId, token);
                        } catch (Exception e) {
                                log.warn(">>> confirmReception: Could not reopen order {}: {}", orderId,
                                                e.getMessage());
                        }

                        // Step 1: Get the etag
                        String orderResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        log.info(">>> confirmReception: Order etag fetched");

                        com.fasterxml.jackson.databind.JsonNode orderNode = mapper.readTree(orderResponse);
                        String etag = orderNode.has("@odata.etag") ? orderNode.get("@odata.etag").asText() : "*";

                        // Step 2: Fetch order lines and update them in parallel
                        String linesResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId
                                                        + ")/PlexuspurchaseOrderLines"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.JsonNode linesNode = mapper.readTree(linesResponse);
                        com.fasterxml.jackson.databind.JsonNode linesArray = linesNode.has("value")
                                        ? linesNode.get("value")
                                        : linesNode;

                        if (linesArray.isArray()) {
                                java.util.List<com.fasterxml.jackson.databind.JsonNode> linesList = new java.util.ArrayList<>();
                                linesArray.forEach(linesList::add);

                                reactor.core.publisher.Flux.fromIterable(linesList)
                                                .flatMap(lineNode -> {
                                                        String lineId = lineNode.has("id") ? lineNode.get("id").asText()
                                                                        : null;
                                                        double receiveQty = lineNode.has("receiveQuantity")
                                                                        ? lineNode.get("receiveQuantity").asDouble()
                                                                        : 0;
                                                        String lineEtag = lineNode.has("@odata.etag")
                                                                        ? lineNode.get("@odata.etag").asText()
                                                                        : "*";

                                                        if (lineId != null && receiveQty > 0) {
                                                                return webClient.patch()
                                                                                .uri(java.net.URI.create(baseUrl
                                                                                                + "/PlexuspurchaseOrders("
                                                                                                + orderId
                                                                                                + ")/PlexuspurchaseOrderLines("
                                                                                                + lineId + ")"))
                                                                                .header(HttpHeaders.AUTHORIZATION,
                                                                                                "Bearer " + token)
                                                                                .header(HttpHeaders.CONTENT_TYPE,
                                                                                                "application/json")
                                                                                .header("If-Match", lineEtag)
                                                                                .bodyValue("{\"receiveQuantity\": "
                                                                                                + receiveQty + "}")
                                                                                .retrieve()
                                                                                .toBodilessEntity()
                                                                                .doOnSuccess(v -> log.info(
                                                                                                ">>> confirmReception: Line {} updated with qty {}",
                                                                                                lineId, receiveQty))
                                                                                .onErrorResume(e -> {
                                                                                        log.warn(">>> confirmReception: Failed to update line {}: {}",
                                                                                                        lineId,
                                                                                                        e.getMessage());
                                                                                        return reactor.core.publisher.Mono
                                                                                                        .empty();
                                                                                });
                                                        }
                                                        return reactor.core.publisher.Mono.empty();
                                                }, 5) // Concurrency limit of 5
                                                .collectList()
                                                .block(Duration.ofSeconds(60));
                        }

                        // Step 3: PATCH Header — client confirms reception
                        com.fasterxml.jackson.databind.node.ObjectNode patchPayload = mapper.createObjectNode();
                        patchPayload.put("QtyReceived", "Oui");
                        patchPayload.put("ReceivedPurchaseHeader", "Oui");
                        if (withReclamation && reclamationText != null && !reclamationText.isEmpty()) {
                                patchPayload.put("Reclamation", reclamationText);
                        }

                        webClient.patch()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .header("If-Match", etag)
                                        .bodyValue(patchPayload.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        log.info(">>> confirmReception: Order header patched successfully");

                        // Step 4: Validate/Post the Purchase Order Reception (API 56109 logic)
                        try {
                                log.info(">>> confirmReception: Calling receiveonly for order: {}...", orderId);
                                // Small pause to allow BC to release locks from previous header patch
                                Thread.sleep(1000);

                                webClient.post()
                                                .uri(java.net.URI.create(
                                                                baseUrl + "/PlexuspurchaseOrders(" + orderId
                                                                                + ")/Microsoft.NAV.receiveonly"))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                .bodyValue("{}")
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(120)); // Heavy task, allow 120s
                                log.info(">>> confirmReception: receiveonly action SUCCESS");
                        } catch (Exception postEx) {
                                log.error(">>> confirmReception: receiveonly action FAILED: {}", postEx.getMessage());
                        } finally {
                                // RELEASE order after modifications
                                try {
                                        if (orderId != null)
                                                releasePurchaseOrder(orderId, token);
                                } catch (Exception e) {
                                        log.warn(">>> confirmReception: Could not release order {}: {}", orderId,
                                                        e.getMessage());
                                }

                                if (orderId != null)
                                        activeValidations.remove(orderId);
                        }

                        return ResponseEntity.ok("{\"success\": true}");

                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
                }
        }

        // ===== Validate Order: Update status in BC + Generate BL PDF =====
        @org.springframework.web.bind.annotation.PostMapping("/validate-order")
        public ResponseEntity<byte[]> validateOrder(
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();
                String orderId = null;

                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        orderId = rootNode.has("id") ? rootNode.get("id").asText() : null;
                        if (orderId == null || orderId.isEmpty()) {
                                return ResponseEntity.status(400)
                                                .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                                .body("Order ID is required".getBytes());
                        }

                        // Guard against concurrent validations with self-healing
                        long nowVal = System.currentTimeMillis();
                        activeValidations.entrySet().removeIf(entry -> (nowVal - entry.getValue()) > 300000);
                        if (activeValidations.putIfAbsent(orderId, nowVal) != null) {
                                return ResponseEntity.status(409)
                                                .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                                .body(("Validation is already in progress for this order: " + orderId)
                                                                .getBytes());
                        }

                        // REOPEN order to allow modifications (bypass Released status error)
                        try {
                                reopenPurchaseOrder(orderId, token);
                        } catch (Exception e) {
                                log.warn(">>> validateOrder: Could not reopen order {}: {}", orderId, e.getMessage());
                        }

                        // Step 1: GET the order to retrieve its @odata.etag
                        String orderResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .timeout(Duration.ofSeconds(20))
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.JsonNode orderNode = mapper.readTree(orderResponse);
                        String etag = orderNode.has("@odata.etag") ? orderNode.get("@odata.etag").asText() : "*";

                        // Step 2: PATCH the order — supplier confirms, set ShippingAdvice + Delivred
                        // only
                        // QtyReceived and ReceivedPurchaseHeader are set later by client in Validation
                        // de la réception
                        com.fasterxml.jackson.databind.node.ObjectNode patchPayload = mapper.createObjectNode();
                        patchPayload.put("ShippingAdvice", "Confirm\u00e9");
                        patchPayload.put("Delivred", "Oui");

                        webClient.patch()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .header("If-Match", etag)
                                        .bodyValue(patchPayload.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .timeout(Duration.ofSeconds(20))
                                        .block(Duration.ofSeconds(60));

                        // Step 2.1: Update Purchase Order Lines with vendor edits (PARALLEL)
                        com.fasterxml.jackson.databind.JsonNode poLinesForPatch = rootNode
                                        .has("plexuspurchaseOrderLines")
                                                        ? rootNode.get("plexuspurchaseOrderLines")
                                                        : null;
                        if (poLinesForPatch != null && poLinesForPatch.isArray()) {
                                java.util.List<com.fasterxml.jackson.databind.JsonNode> linesList = new java.util.ArrayList<>();
                                poLinesForPatch.forEach(linesList::add);

                                Flux.fromIterable(linesList)
                                                .flatMap(poLine -> {
                                                        String poLineId = poLine.has("id") ? poLine.get("id").asText()
                                                                        : null;
                                                        if (poLineId == null)
                                                                return reactor.core.publisher.Mono.empty();

                                                        com.fasterxml.jackson.databind.node.ObjectNode linePatch = mapper
                                                                        .createObjectNode();
                                                        if (poLine.has("QuantityAvailable"))
                                                                linePatch.put("QuantityAvailable", poLine
                                                                                .get("QuantityAvailable").asDouble());
                                                        if (poLine.has("quantity"))
                                                                linePatch.put("quantity",
                                                                                poLine.get("quantity").asDouble());
                                                        if (poLine.has("receiveQuantity"))
                                                                linePatch.put("receiveQuantity", poLine
                                                                                .get("receiveQuantity").asDouble());
                                                        if (poLine.has("directUnitCost"))
                                                                linePatch.put("directUnitCost", poLine
                                                                                .get("directUnitCost").asDouble());

                                                        if (poLine.has("Decision")) {
                                                                String decision = poLine.get("Decision").asText();
                                                                if ("NonDisponible".equalsIgnoreCase(decision)) {
                                                                        return webClient.delete()
                                                                                        .uri(java.net.URI.create(baseUrl
                                                                                                        + "/PlexuspurchaseOrderLines("
                                                                                                        + poLineId
                                                                                                        + ")"))
                                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                                        "Bearer " + token)
                                                                                        .header("If-Match", "*")
                                                                                        .retrieve()
                                                                                        .toBodilessEntity()
                                                                                        .timeout(Duration.ofSeconds(30))
                                                                                        .onErrorResume(e -> {
                                                                                                log.warn("Error deleting PO line {}: {}",
                                                                                                                poLineId,
                                                                                                                e.getMessage());
                                                                                                return reactor.core.publisher.Mono
                                                                                                                .empty();
                                                                                        });
                                                                }
                                                                linePatch.put("Decision", decision);
                                                        }

                                                        if (poLine.has("OldRemplacementItemNo"))
                                                                linePatch.put("OldRemplacementItemNo", poLine
                                                                                .get("OldRemplacementItemNo").asText());

                                                        return webClient.patch()
                                                                        .uri(java.net.URI.create(baseUrl
                                                                                        + "/PlexuspurchaseOrderLines("
                                                                                        + poLineId + ")"))
                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                        "Bearer " + token)
                                                                        .header(HttpHeaders.CONTENT_TYPE,
                                                                                        "application/json")
                                                                        .header("If-Match", "*")
                                                                        .bodyValue(linePatch.toString())
                                                                        .retrieve()
                                                                        .toBodilessEntity()
                                                                        .timeout(Duration.ofSeconds(30))
                                                                        .onErrorResume(e -> {
                                                                                log.warn("Error patching PO line {}: {}",
                                                                                                poLineId,
                                                                                                e.getMessage());
                                                                                return reactor.core.publisher.Mono
                                                                                                .empty();
                                                                        });
                                                }, 5) // concurrency 5 - parallel PO line updates
                                                .collectList()
                                                .block(Duration.ofSeconds(90));
                        }

                        // Step 2.5: Create Sales Order from Purchase Order data (BACKGROUND - don't
                        // block BL response)
                        final String salesBaseUrl = baseUrl.replace("AcessPurchasesAPI", "AcessSalesAPI");
                        final String bgToken = token;
                        final com.fasterxml.jackson.databind.JsonNode bgPoHeader = orderNode;
                        final com.fasterxml.jackson.databind.JsonNode bgRootNode = rootNode;
                        final com.fasterxml.jackson.databind.ObjectMapper bgMapper = mapper;

                        // Make it SYNCHRONOUS to guarantee we have the Posted Sales Shipment number for
                        // the BL
                        try {

                                String orderNumber = bgRootNode.has("number") ? bgRootNode.get("number").asText() : "";
                                String vendorNumber = bgRootNode.has("payToVendorNumber")
                                                ? bgRootNode.get("payToVendorNumber").asText()
                                                : "";

                                log.info(">>> [BG] Starting Sales Order creation for PO: {}, Vendor: {}", orderNumber,
                                                vendorNumber);

                                // Step 2.5a: Create Sales Order Header
                                com.fasterxml.jackson.databind.node.ObjectNode salesHeader = bgMapper
                                                .createObjectNode();

                                String todayDate = java.time.LocalDate.now().toString();

                                // Priority: 1. SellToCustomerNo from BC header, 2. Derived from vendorNumber
                                String targetCustomer = null;
                                if (bgPoHeader.has("SellToCustomerNo")
                                                && !bgPoHeader.get("SellToCustomerNo").asText().isEmpty()) {
                                        targetCustomer = bgPoHeader.get("SellToCustomerNo").asText();
                                        log.info(">>> [BG] Using SellToCustomerNo from BC Header: {}", targetCustomer);
                                } else if (bgRootNode.has("SellToCustomerNo")
                                                && !bgRootNode.get("SellToCustomerNo").asText().isEmpty()) {
                                        targetCustomer = bgRootNode.get("SellToCustomerNo").asText();
                                        log.info(">>> [BG] Using SellToCustomerNo from PO Payload: {}", targetCustomer);
                                } else {
                                        targetCustomer = vendorNumber.replace("F", "C");
                                        log.info(">>> [BG] Derived customer from vendor (F->C): {}", targetCustomer);
                                }

                                salesHeader.put("customerNumber", targetCustomer);
                                salesHeader.put("orderDate", todayDate);
                                salesHeader.put("postingDate", todayDate);
                                salesHeader.put("PurchaseHeaderNoNew", orderNumber);

                                log.info(">>> [BG] Sales Order Header Payload: {}", salesHeader.toString());

                                String createSalesResponse = webClient.post()
                                                .uri(java.net.URI.create(salesBaseUrl + "/PlexussalesOrders"))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + bgToken)
                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                .bodyValue(salesHeader.toString())
                                                .exchangeToMono(response -> {
                                                        if (response.statusCode().isError()) {
                                                                return response.bodyToMono(String.class)
                                                                                .map(errBody -> {
                                                                                        log.error(">>> [BG] Sales Order creation FAILED ({}): {}",
                                                                                                        response.statusCode(),
                                                                                                        errBody);
                                                                                        throw new RuntimeException(
                                                                                                        "Sales Order creation failed ("
                                                                                                                        + response.statusCode()
                                                                                                                        + "): "
                                                                                                                        + errBody);
                                                                                });
                                                        }
                                                        return response.bodyToMono(String.class);
                                                })
                                                .timeout(Duration.ofSeconds(60))
                                                .block(Duration.ofSeconds(90));

                                com.fasterxml.jackson.databind.JsonNode createdSalesOrder = bgMapper
                                                .readTree(createSalesResponse);
                                String salesOrderId = createdSalesOrder.get("id").asText();
                                String createdSalesNumber = createdSalesOrder.has("number")
                                                ? createdSalesOrder.get("number").asText()
                                                : "N/A";
                                log.info(">>> [BG] Sales Order created successfully: {} (ID: {})", createdSalesNumber,
                                                salesOrderId);

                                // Step 2.5b: Create Sales Order Lines (SEQUENTIAL)
                                com.fasterxml.jackson.databind.JsonNode poLines = bgRootNode
                                                .has("plexuspurchaseOrderLines")
                                                                ? bgRootNode.get("plexuspurchaseOrderLines")
                                                                : null;
                                if (poLines != null && poLines.isArray()) {
                                        log.info(">>> [BG] Transferring {} lines to Sales Order...", poLines.size());
                                        java.util.List<com.fasterxml.jackson.databind.JsonNode> soLinesList = new java.util.ArrayList<>();
                                        poLines.forEach(soLinesList::add);

                                        final String finalSalesOrderId = salesOrderId;

                                        Flux.fromIterable(soLinesList)
                                                        .concatMap(poLine -> {
                                                                String poLineRef = poLine.has("lineObjectNumber")
                                                                                ? poLine.get("lineObjectNumber")
                                                                                                .asText()
                                                                                : "Unknown";

                                                                if (poLine.has("Decision") && "NonDisponible"
                                                                                .equalsIgnoreCase(poLine.get("Decision")
                                                                                                .asText())) {
                                                                        log.info(">>> [BG] Skipping line {} (Decision: NonDisponible)",
                                                                                        poLineRef);
                                                                        return reactor.core.publisher.Mono.empty();
                                                                }

                                                                com.fasterxml.jackson.databind.node.ObjectNode salesLine = bgMapper
                                                                                .createObjectNode();
                                                                salesLine.put("lineType", "Item");
                                                                if (poLine.has("lineObjectNumber"))
                                                                        salesLine.put("lineObjectNumber",
                                                                                        poLine.get("lineObjectNumber")
                                                                                                        .asText());
                                                                if (poLine.has("description"))
                                                                        salesLine.put("description", poLine
                                                                                        .get("description").asText());

                                                                double qty = poLine.has("quantity")
                                                                                ? poLine.get("quantity").asDouble()
                                                                                : 0;
                                                                salesLine.put("quantity", qty);

                                                                if (poLine.has("directUnitCost"))
                                                                        salesLine.put("unitPrice",
                                                                                        poLine.get("directUnitCost")
                                                                                                        .asDouble());

                                                                double shipQty = poLine.has("receiveQuantity")
                                                                                ? poLine.get("receiveQuantity")
                                                                                                .asDouble()
                                                                                : qty;
                                                                salesLine.put("shipQuantity", shipQty);

                                                                log.info(">>> [BG] Creating Sales Line for {}: qty={}, price={}, shipQty={}",
                                                                                poLineRef, qty,
                                                                                salesLine.get("unitPrice"), shipQty);

                                                                return webClient.post()
                                                                                .uri(java.net.URI.create(salesBaseUrl
                                                                                                + "/PlexussalesOrders("
                                                                                                + finalSalesOrderId
                                                                                                + ")/PlexussalesOrderLines"))
                                                                                .header(HttpHeaders.AUTHORIZATION,
                                                                                                "Bearer " + bgToken)
                                                                                .header(HttpHeaders.CONTENT_TYPE,
                                                                                                "application/json")
                                                                                .header(HttpHeaders.ACCEPT,
                                                                                                "application/json")
                                                                                .bodyValue(salesLine.toString())
                                                                                .exchangeToMono(response -> {
                                                                                        if (response.statusCode()
                                                                                                        .isError()) {
                                                                                                return response.bodyToMono(
                                                                                                                String.class)
                                                                                                                .flatMap(errorBody -> {
                                                                                                                        log.error(">>> [BG] Sales Line creation FAILED for {}: ({}) {}",
                                                                                                                                        poLineRef,
                                                                                                                                        response.statusCode(),
                                                                                                                                        errorBody);
                                                                                                                        return reactor.core.publisher.Mono
                                                                                                                                        .empty();
                                                                                                                });
                                                                                        }
                                                                                        log.info(">>> [BG] Sales Line created for {}",
                                                                                                        poLineRef);
                                                                                        return response.toBodilessEntity();
                                                                                })
                                                                                .timeout(Duration.ofSeconds(60))
                                                                                .onErrorResume(e -> {
                                                                                        log.error(">>> [BG] Exception creating SO line for {}: {}",
                                                                                                        poLineRef,
                                                                                                        e.getMessage());
                                                                                        return reactor.core.publisher.Mono
                                                                                                        .empty();
                                                                                });
                                                        })
                                                        .collectList()
                                                        .block(Duration.ofMinutes(10)); // Total timeout for all lines
                                                                                        // sequential
                                } else {
                                        log.warn(">>> [BG] No plexuspurchaseOrderLines found in PO payload");
                                }

                                // Step 2.5c: PATCH postingDate before ShipOnly to ensure BC uses today's date
                                try {
                                        String todayForShip = java.time.LocalDate.now().toString();
                                        log.info(">>> [BG] Pre-ShipOnly PATCH: forcing postingDate={} on Sales Order: {}",
                                                        todayForShip, salesOrderId);
                                        com.fasterxml.jackson.databind.node.ObjectNode patchBeforeShip = bgMapper
                                                        .createObjectNode();
                                        patchBeforeShip.put("postingDate", todayForShip);
                                        // Fetch the ETag for PATCH
                                        String etagForShip = webClient.get()
                                                        .uri(java.net.URI.create(salesBaseUrl + "/PlexussalesOrders("
                                                                        + salesOrderId + ")"))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + bgToken)
                                                        .exchangeToMono(r -> r.bodyToMono(String.class))
                                                        .timeout(Duration.ofSeconds(30))
                                                        .block(Duration.ofSeconds(45));
                                        // PATCH the posting date
                                        webClient.patch()
                                                        .uri(java.net.URI.create(salesBaseUrl + "/PlexussalesOrders("
                                                                        + salesOrderId + ")"))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + bgToken)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .header("If-Match", "*")
                                                        .bodyValue(patchBeforeShip.toString())
                                                        .exchangeToMono(r -> r.bodyToMono(String.class))
                                                        .timeout(Duration.ofSeconds(30))
                                                        .block(Duration.ofSeconds(45));
                                        log.info(">>> [BG] Pre-ShipOnly PATCH done. Triggering ShipOnly for Sales Order: {}",
                                                        salesOrderId);
                                } catch (Exception patchEx) {
                                        log.warn(">>> [BG] Pre-ShipOnly PATCH failed (will still attempt ShipOnly): {}",
                                                        patchEx.getMessage());
                                }

                                // Step 2.5d: ShipOnly
                                try {
                                        log.info(">>> [BG] Triggering ShipOnly for Sales Order: {}", salesOrderId);
                                        webClient.post()
                                                        .uri(java.net.URI.create(salesBaseUrl + "/PlexussalesOrders("
                                                                        + salesOrderId + ")/Microsoft.NAV.ShipOnly"))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + bgToken)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .bodyValue("{}")
                                                        .exchangeToMono(response -> {
                                                                if (response.statusCode().isError()) {
                                                                        return response.bodyToMono(String.class)
                                                                                        .map(errBody -> {
                                                                                                log.error(">>> [BG] ShipOnly FAILED for {}: {}",
                                                                                                                salesOrderId,
                                                                                                                errBody);
                                                                                                throw new RuntimeException(
                                                                                                                "ShipOnly failed: "
                                                                                                                                + errBody);
                                                                                        });
                                                                }
                                                                return response.bodyToMono(String.class);
                                                        })
                                                        .timeout(Duration.ofSeconds(60))
                                                        .block(Duration.ofSeconds(90));
                                        log.info(">>> [BG] ShipOnly SUCCESS for PO: {}", orderNumber);

                                        // Step 2.5e: Fetch the Posted Sales Shipment number to use as the BL Number
                                        try {
                                                log.info(">>> Fetching Posted Sales Shipment for order: {}",
                                                                createdSalesNumber);
                                                String standardShipmentsUrl = salesBaseUrl
                                                                .replace("/api/NEL/AcessSalesAPI/v2.0", "/api/v2.0")
                                                                + "/salesShipments";
                                                java.net.URI shipmentsUri = org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(standardShipmentsUrl)
                                                                .queryParam("$filter",
                                                                                "orderNumber eq '" + createdSalesNumber
                                                                                                + "'")
                                                                .build().encode().toUri();

                                                String shipmentsResponse = webClient.get()
                                                                .uri(shipmentsUri)
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + bgToken)
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .block(Duration.ofSeconds(30));
                                                com.fasterxml.jackson.databind.JsonNode shipmentsData = bgMapper
                                                                .readTree(shipmentsResponse);
                                                com.fasterxml.jackson.databind.JsonNode shipments = shipmentsData.has(
                                                                "value") ? shipmentsData.get("value") : shipmentsData;

                                                if (shipments.isArray() && shipments.size() > 0) {
                                                        String shipmentNo = shipments.get(0).get("number").asText();
                                                        ((com.fasterxml.jackson.databind.node.ObjectNode) rootNode)
                                                                        .put("postedSalesShipmentNumber", shipmentNo);
                                                        log.info(">>> Found Posted Sales Shipment: {} (will be used for BL)",
                                                                        shipmentNo);

                                                        // Persist ShipmentNo to our plexustarek API so it's available
                                                        // for future BL downloads
                                                        try {
                                                                com.fasterxml.jackson.databind.node.ObjectNode shipUpdate = bgMapper
                                                                                .createObjectNode();
                                                                shipUpdate.put("postedSalesShipmentNumber", shipmentNo);
                                                                webClient.patch()
                                                                                .uri(java.net.URI.create(tarekSystemUrl
                                                                                                + "/plexusPurchaseOrderPatches("
                                                                                                + orderId + ")"))
                                                                                .header(HttpHeaders.AUTHORIZATION,
                                                                                                "Bearer " + bgToken)
                                                                                .header("If-Match", "*")
                                                                                .bodyValue(shipUpdate.toString())
                                                                                .retrieve()
                                                                                .bodyToMono(String.class)
                                                                                .block(Duration.ofSeconds(10));
                                                        } catch (Exception e) {
                                                                log.warn(">>> Failed to persist ShipmentNo to BC metadata: {}",
                                                                                e.getMessage());
                                                        }
                                                } else {
                                                        log.warn(">>> Posted Sales Shipment not found yet for order {}",
                                                                        createdSalesNumber);
                                                }
                                        } catch (Exception shipEx) {
                                                log.error(">>> Error fetching posted shipment: {}",
                                                                shipEx.getMessage());
                                        }

                                } catch (Exception pe) {
                                        log.error(">>> [BG] ShipOnly failed for {}: {}", salesOrderId, pe.getMessage());
                                }

                        } catch (Exception salesEx) {
                                log.error(">>> [BG] Sales Order creation fatal error for PO: {}", salesEx.getMessage());
                        }

                        // Step 3: Generate BL PDF locally (Format matches BC layout)
                        String orderNumber = rootNode.has("number") ? rootNode.get("number").asText() : "N/A";
                        String yearSuffix = String.valueOf(java.time.LocalDate.now().getYear()).substring(2);
                        String seq = orderNumber != null ? orderNumber.replaceAll("[^0-9]", "") : "0";
                        if (seq.isEmpty())
                                seq = "0";
                        int seqNum = Integer.parseInt(seq) % 100000;
                        String filename = "BL" + yearSuffix + "-" + String.format("%05d", seqNum) + ".pdf";

                        String orderDate = rootNode.has("orderDate") ? rootNode.get("orderDate").asText() : null;
                        String vendorName = rootNode.has("vendorName") ? rootNode.get("vendorName").asText() : null;
                        String vendorNumber = rootNode.has("payToVendorNumber")
                                        ? rootNode.get("payToVendorNumber").asText()
                                        : null;
                        com.fasterxml.jackson.databind.JsonNode lines = rootNode.has("plexuspurchaseOrderLines")
                                        ? rootNode.get("plexuspurchaseOrderLines")
                                        : null;

                        // Filter out NonDisponible lines for PDF generation
                        com.fasterxml.jackson.databind.node.ArrayNode filteredLinesForPdf = mapper.createArrayNode();
                        if (lines != null && lines.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode line : lines) {
                                        if (!(line.has("Decision") && "NonDisponible"
                                                        .equalsIgnoreCase(line.get("Decision").asText()))) {
                                                filteredLinesForPdf.add(line);
                                        }
                                }
                        }

                        // Enrichment: Fetch missing TVA/Phone from Customer API in BC
                        enrichWithCustomerData(rootNode, token);
                        enrichWithSalesDiscount(rootNode, filteredLinesForPdf, token);

                        log.info(">>> Generating BL PDF for order: {} (Vendor: {}, Date: {})", orderNumber, vendorName,
                                        orderDate);
                        byte[] pdfBytes = blGeneratorService.generateBL(orderNumber, orderDate, vendorName,
                                        vendorNumber, filteredLinesForPdf, rootNode);
                        log.info(">>> BL PDF generated successfully. Size: {} bytes", pdfBytes.length);

                        return ResponseEntity.ok()
                                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                                        "attachment; filename=\"" + filename + "\"")
                                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                                        .body(pdfBytes);

                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                        .body(("Error: " + e.getResponseBodyAsString()).getBytes());
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                        .body(("Error: " + e.getMessage()).getBytes());
                } finally {
                        // RELEASE order after modifications
                        try {
                                if (orderId != null)
                                        releasePurchaseOrder(orderId, token);
                        } catch (Exception e) {
                                log.warn(">>> validateOrder: Could not release order {}: {}", orderId, e.getMessage());
                        }

                        if (orderId != null) {
                                activeValidations.remove(orderId);
                        }
                }
        }

        // ===== BL (Bon de Livraison) PDF Generation =====
        @org.springframework.web.bind.annotation.PostMapping("/generate-bl")
        public ResponseEntity<byte[]> generateBL(
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String orderNumber = rootNode.has("number") ? rootNode.get("number").asText() : "N/A";
                        String orderDate = rootNode.has("orderDate") ? rootNode.get("orderDate").asText() : null;
                        String vendorName = rootNode.has("vendorName") ? rootNode.get("vendorName").asText() : null;
                        String vendorNumber = rootNode.has("payToVendorNumber")
                                        ? rootNode.get("payToVendorNumber").asText()
                                        : null;
                        com.fasterxml.jackson.databind.JsonNode lines = rootNode.has("plexuspurchaseOrderLines")
                                        ? rootNode.get("plexuspurchaseOrderLines")
                                        : null;

                        // Enrichment: Fetch missing TVA/Phone and Custom Metadata (VIN, BL Number)
                        String token = tokenService.getAccessToken();
                        enrichWithCustomerData(rootNode, token);
                        enrichWithSalesDiscount(rootNode, lines, token);
                        enrichWithPlexusMetadata(rootNode, token);

                        byte[] pdfBytes = blGeneratorService.generateBL(orderNumber, orderDate, vendorName,
                                        vendorNumber, lines, rootNode);

                        String filename = "BL_" + orderNumber.replace("/", "-") + ".pdf";

                        return ResponseEntity.ok()
                                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                                        "attachment; filename=\"" + filename + "\"")
                                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                                        .body(pdfBytes);
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                        .body(("Error generating BL: " + e.getMessage()).getBytes());
                }
        }

        // ===== DEVIS (Quote) PDF Generation =====
        @org.springframework.web.bind.annotation.PostMapping("/generate-devis")
        public ResponseEntity<byte[]> generateDevis(
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String orderNumber = rootNode.has("number") ? rootNode.get("number").asText() : "N/A";
                        String orderDate = rootNode.has("orderDate") ? rootNode.get("orderDate").asText() : null;
                        String vendorName = rootNode.has("vendorName") ? rootNode.get("vendorName").asText() : null;
                        String vendorNumber = rootNode.has("vendorNumber") ? rootNode.get("vendorNumber").asText()
                                        : (rootNode.has("payToVendorNumber")
                                                        ? rootNode.get("payToVendorNumber").asText()
                                                        : null);
                        String vendorAddress = rootNode.has("buyFromAddressLine1")
                                        ? rootNode.get("buyFromAddressLine1").asText()
                                        : "";
                        com.fasterxml.jackson.databind.JsonNode lines = rootNode.has("lines") ? rootNode.get("lines")
                                        : (rootNode.has("plexuspurchaseOrderLines")
                                                        ? rootNode.get("plexuspurchaseOrderLines")
                                                        : null);

                        // Enrichment: Fetch missing TVA/Phone from Customer API in BC
                        String token = tokenService.getAccessToken();
                        enrichWithCustomerData(rootNode, token);
                        enrichWithSalesDiscount(rootNode, lines, token);

                        String vatNo = rootNode.has("VATRegistrationNo") ? rootNode.get("VATRegistrationNo").asText()
                                        : "";

                        byte[] pdfBytes = devisGeneratorService.generateDevis(orderNumber, orderDate, vendorName,
                                        vendorNumber, vendorAddress, vatNo, lines);

                        String filename = "DEVIS_" + orderNumber.replace("/", "-") + ".pdf";

                        return ResponseEntity.ok()
                                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                                        "attachment; filename=\"" + filename + "\"")
                                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                                        .body(pdfBytes);
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500)
                                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                        .body(("Error generating Devis: " + e.getMessage()).getBytes());
                }
        }

        // ===== FACTURE (Invoice) PDF Generation =====
        @org.springframework.web.bind.annotation.PostMapping("/generate-facture")
        public ResponseEntity<byte[]> generateFacture(
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String invoiceNumber = rootNode.has("invoiceNumber") ? rootNode.get("invoiceNumber").asText()
                                        : (rootNode.has("number") ? rootNode.get("number").asText() : "N/A");
                        String invoiceDate = rootNode.has("invoiceDate") ? rootNode.get("invoiceDate").asText()
                                        : (rootNode.has("orderDate") ? rootNode.get("orderDate").asText() : null);
                        String clientName = rootNode.has("clientName") ? rootNode.get("clientName").asText()
                                        : (rootNode.has("vendorName") ? rootNode.get("vendorName").asText() : null);
                        String clientCode = rootNode.has("clientCode") ? rootNode.get("clientCode").asText()
                                        : (rootNode.has("SellToCustomerNo") ? rootNode.get("SellToCustomerNo").asText()
                                                        : null);
                        String clientAddress = rootNode.has("clientAddress") ? rootNode.get("clientAddress").asText()
                                        : "";
                        String clientCity = rootNode.has("clientCity") ? rootNode.get("clientCity").asText() : "";
                        String clientPhone = rootNode.has("clientPhone") ? rootNode.get("clientPhone").asText() : "";
                        String vatNo = rootNode.has("vatRegistrationNo") ? rootNode.get("vatRegistrationNo").asText()
                                        : "";
                        String shipmentNumber = rootNode.has("shipmentNumber") ? rootNode.get("shipmentNumber").asText()
                                        : "";

                        com.fasterxml.jackson.databind.JsonNode lines = rootNode.has("invoiceLines")
                                        ? rootNode.get("invoiceLines")
                                        : (rootNode.has("plexuspurchaseOrderLines")
                                                        ? rootNode.get("plexuspurchaseOrderLines")
                                                        : null);

                        // Enrichment: Fetch missing TVA/Phone from Customer API in BC
                        String token = tokenService.getAccessToken();
                        enrichWithCustomerData(rootNode, token);

                        byte[] pdfBytes = factureGeneratorService.generateFacture(invoiceNumber, invoiceDate,
                                        clientName, clientCode, clientAddress, clientCity, clientPhone,
                                        vatNo, shipmentNumber, lines, rootNode);

                        String filename = "FACTURE_" + invoiceNumber.replace("/", "-") + ".pdf";

                        return ResponseEntity.ok()
                                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                                        "attachment; filename=\"" + filename + "\"")
                                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                                        .body(pdfBytes);
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500)
                                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                        .body(("Error generating Facture: " + e.getMessage()).getBytes());
                }
        }

        @org.springframework.web.bind.annotation.PostMapping("/{orderId}/split-le-disponible")
        public ResponseEntity<String> splitLeDisponible(
                        @org.springframework.web.bind.annotation.PathVariable("orderId") String orderId,
                        @org.springframework.web.bind.annotation.RequestBody String body,
                        HttpServletRequest request) {
                try {
                        log.info(">>> START SPLIT-LE-DISPONIBLE for order: {}", orderId);
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        boolean isSplit = rootNode.has("splitRequested") && rootNode.get("splitRequested").asBoolean();

                        // Get client/vendor info from headers (as done in cart/bulk)
                        String customerNo = request.getHeader("X-Customer-No");
                        String vendorNoHeader = request.getHeader("X-Vendor-No");

                        log.info(">>> Split requested: {}", isSplit);
                        log.info(">>> Session CustomerNo: {}", customerNo);

                        com.fasterxml.jackson.databind.JsonNode originalOrder = null;
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> linesToMove = new java.util.ArrayList<>();
                        String token = tokenService.getAccessToken();

                        try {
                                // Fetch full order with expanded lines
                                String originalOrderStr = webClient.get()
                                                .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(baseUrl + "/PlexuspurchaseOrders("
                                                                                + orderId + ")")
                                                                .queryParam("$expand", "PlexuspurchaseOrderLines")
                                                                .build(true)
                                                                .toUri())
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .header("X-Customer-No", customerNo)
                                                .header("X-Vendor-No", vendorNoHeader)
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(60));

                                originalOrder = mapper.readTree(originalOrderStr);

                                // Extract correct Customer and Vendor from the original order itself to avoid
                                // header confusion
                                if (originalOrder != null) {
                                        // Resolve Customer
                                        String[] customerFields = { "SellToCustomerNo", "sellToCustomerNo",
                                                        "CustomerNo", "customerNo" };
                                        for (String name : customerFields) {
                                                if (originalOrder.has(name) && !originalOrder.get(name).isNull()
                                                                && !originalOrder.get(name).asText().isEmpty()) {
                                                        customerNo = originalOrder.get(name).asText();
                                                        break;
                                                }
                                        }

                                        // Resolve Vendor
                                        String[] vendorFields = { "buyFromVendorNumber", "vendorNumber", "VendorNumber",
                                                        "payToVendorNumber", "buyFromVendorNo" };
                                        for (String name : vendorFields) {
                                                if (originalOrder.has(name) && !originalOrder.get(name).isNull()
                                                                && !originalOrder.get(name).asText().isEmpty()) {
                                                        vendorNoHeader = originalOrder.get(name).asText();
                                                        break;
                                                }
                                        }
                                }

                                log.info(">>> FINAL Identified - Customer: [{}], Vendor: [{}]", customerNo,
                                                vendorNoHeader);
                        } catch (Exception e) {
                                log.warn(">>> Could not fetch original order details: {}", e.getMessage());
                        }

                        // Build payload line map at the isSplit scope level so it's accessible for both
                        // the split logic and the subsequent line confirmation logic
                        java.util.Map<String, com.fasterxml.jackson.databind.JsonNode> payloadLineMap = new java.util.HashMap<>();
                        if (rootNode.has("lines") && rootNode.get("lines").isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode pl : rootNode.get("lines")) {
                                        if (pl.has("id")) {
                                                payloadLineMap.put(pl.get("id").asText(), pl);
                                        }
                                }
                        }

                        if (isSplit && originalOrder != null) {
                                // Log the order structure to be sure
                                log.info(">>> Processing split for originalOrder lines");
                                com.fasterxml.jackson.databind.JsonNode lines = originalOrder
                                                .get("plexuspurchaseOrderLines");

                                if (lines != null && lines.isArray()) {

                                        for (com.fasterxml.jackson.databind.JsonNode line : lines) {
                                                String lineId = line.has("id") ? line.get("id").asText() : "";
                                                com.fasterxml.jackson.databind.JsonNode pLine = payloadLineMap
                                                                .get(lineId);

                                                // Use decision from payload if available, otherwise from BC
                                                String decision = (pLine != null && pLine.has("Decision"))
                                                                ? pLine.get("Decision").asText()
                                                                : (line.has("Decision") ? line.get("Decision").asText()
                                                                                : "");

                                                String advice = (pLine != null && pLine.has("ShippingAdvice"))
                                                                ? pLine.get("ShippingAdvice").asText()
                                                                : (line.has("ShippingAdvice")
                                                                                ? line.get("ShippingAdvice").asText()
                                                                                : "");

                                                log.info(">>> Line {} values - Decision: [{}], ShippingAdvice: [{}] (fromPayload: {})",
                                                                lineId, decision, advice, pLine != null);

                                                if ("LivPrevuaDate".equalsIgnoreCase(decision)
                                                                || "LivPrevuaDate".equalsIgnoreCase(advice) ||
                                                                "LivraisonPrevuDate".equalsIgnoreCase(decision)
                                                                || "LivraisonPrevuDate".equalsIgnoreCase(advice) ||
                                                                "Adaptable".equalsIgnoreCase(decision)
                                                                || "Adaptable".equalsIgnoreCase(advice)) {

                                                        // Merge adaptable data from payload into the line object so
                                                        // it's available later
                                                        if (pLine != null) {
                                                                com.fasterxml.jackson.databind.node.ObjectNode lineObj = (com.fasterxml.jackson.databind.node.ObjectNode) line;
                                                                if (pLine.has("AdaptableItemNo"))
                                                                        lineObj.set("AdaptableItemNo",
                                                                                        pLine.get("AdaptableItemNo"));
                                                                if (pLine.has("AdaptablePrice"))
                                                                        lineObj.set("AdaptablePrice",
                                                                                        pLine.get("AdaptablePrice"));
                                                                if (pLine.has("AdaptableVendorNo"))
                                                                        lineObj.set("AdaptableVendorNo",
                                                                                        pLine.get("AdaptableVendorNo"));
                                                                if (pLine.has("Decision"))
                                                                        lineObj.set("Decision", pLine.get("Decision"));
                                                        }

                                                        linesToMove.add(line);
                                                }
                                        }
                                }
                                if (!linesToMove.isEmpty()) {
                                        // Group lines by target vendor
                                        java.util.Map<String, java.util.List<com.fasterxml.jackson.databind.JsonNode>> linesByVendor = new java.util.HashMap<>();
                                        for (com.fasterxml.jackson.databind.JsonNode l : linesToMove) {
                                                String lineVendor = (l.has("AdaptableVendorNo")
                                                                && !l.get("AdaptableVendorNo").isNull()
                                                                && !l.get("AdaptableVendorNo").asText().isEmpty())
                                                                                ? l.get("AdaptableVendorNo").asText()
                                                                                : vendorNoHeader;
                                                linesByVendor.computeIfAbsent(lineVendor,
                                                                k -> new java.util.ArrayList<>()).add(l);
                                        }

                                        for (java.util.Map.Entry<String, java.util.List<com.fasterxml.jackson.databind.JsonNode>> entry : linesByVendor
                                                        .entrySet()) {
                                                String targetVendor = entry.getKey();
                                                java.util.List<com.fasterxml.jackson.databind.JsonNode> vendorLines = entry
                                                                .getValue();

                                                log.info(">>> Creating new order for vendor {} with {} lines",
                                                                targetVendor,
                                                                vendorLines.size());
                                                com.fasterxml.jackson.databind.node.ObjectNode headerPayload = mapper
                                                                .createObjectNode();

                                                // Whitelist of WRITABLE fields to clone from original header
                                                String[] writableFields = {
                                                                "orderDate", "postingDate", "requestedReceiptDate",
                                                                "currencyCode", "currencyId", "paymentTermsCode",
                                                                "paymentTermsId", "shipmentMethodCode",
                                                                "shipmentMethodId",
                                                                "RegistrationNumber", "MatriculeFiscale", "VIN",
                                                                "ChassisNo",
                                                                "SinitreNumber", "InsuranceCode", "InsuranceName",
                                                                "Insurancefile",
                                                                "shipToName", "shipToAddressLine1",
                                                                "shipToAddressLine2",
                                                                "shipToCity", "shipToPostCode", "shipToContact",
                                                                "shipToPhone",
                                                                "shipToCountry", "shipToState",
                                                                "SellToPhoneNo", "PhoneNo"
                                                };

                                                for (String fieldName : writableFields) {
                                                        if (originalOrder.has(fieldName)
                                                                        && !originalOrder.get(fieldName).isNull()) {
                                                                headerPayload.set(fieldName,
                                                                                originalOrder.get(fieldName));
                                                        }
                                                }

                                                // Explicitly set status to LivraisonDispo as requested
                                                headerPayload.put("ShippingAdvice", "LivraisonDispo");

                                                // Use today's date to avoid Number Series errors in BC (cannot backdate
                                                // new numbers)
                                                String today = java.time.LocalDate.now().toString();
                                                headerPayload.put("orderDate", today);
                                                headerPayload.put("postingDate", today);

                                                headerPayload.put("vendorNumber", targetVendor);
                                                headerPayload.put("payToVendorNumber", targetVendor);
                                                headerPayload.put("SellToCustomerNo", customerNo);

                                                // Reset logistical flags for a fresh start in the new order
                                                headerPayload.put("Delivred", "Non");
                                                headerPayload.put("QtyReceived", "Non");

                                                log.info(">>> Whitelisted New order payload: {}",
                                                                headerPayload.toString());

                                                String newHeaderResponse = webClient.post()
                                                                .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                                .fromHttpUrl(baseUrl
                                                                                                + "/PlexuspurchaseOrders")
                                                                                .build(true).toUri())
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                .header(HttpHeaders.CONTENT_TYPE,
                                                                                org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                .header(HttpHeaders.ACCEPT,
                                                                                org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                .header("X-Customer-No", customerNo)
                                                                .header("X-Vendor-No", vendorNoHeader)
                                                                .bodyValue(headerPayload.toString())
                                                                .retrieve()
                                                                .onStatus(org.springframework.http.HttpStatusCode::isError,
                                                                                response -> response.bodyToMono(
                                                                                                String.class)
                                                                                                .flatMap(errorBody -> {
                                                                                                        log.error("!!! BC Header Creation Error Body: {}",
                                                                                                                        errorBody);
                                                                                                        return reactor.core.publisher.Mono
                                                                                                                        .error(new RuntimeException(
                                                                                                                                        "BC Header Error: "
                                                                                                                                                        + errorBody));
                                                                                                }))
                                                                .bodyToMono(String.class)
                                                                .block(Duration.ofSeconds(60));

                                                com.fasterxml.jackson.databind.JsonNode newHeader = mapper
                                                                .readTree(newHeaderResponse);
                                                String newOrderId = newHeader.get("id").asText();
                                                String newOrderNumber = newHeader.get("number").asText();
                                                log.info(">>> New order header created: {} ({})", newOrderNumber,
                                                                newOrderId);

                                                // Follow-up PATCH to force SellToCustomerNo and payToVendorNumber
                                                log.info(">>> Performing follow-up PATCH to ensure SellToCustomerNo and payToVendorNumber are set...");
                                                com.fasterxml.jackson.databind.node.ObjectNode patchPayload = mapper
                                                                .createObjectNode();
                                                patchPayload.put("SellToCustomerNo", customerNo);
                                                patchPayload.put("payToVendorNumber", targetVendor);

                                                try {
                                                        webClient.patch()
                                                                        .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                                        .fromHttpUrl(baseUrl
                                                                                                        + "/PlexuspurchaseOrders("
                                                                                                        + newOrderId
                                                                                                        + ")")
                                                                                        .build(true).toUri())
                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                        "Bearer " + token)
                                                                        .header(HttpHeaders.CONTENT_TYPE,
                                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                        .header(HttpHeaders.ACCEPT,
                                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                        .header("If-Match", "*")
                                                                        .header("X-Customer-No", customerNo)
                                                                        .header("X-Vendor-No", vendorNoHeader)
                                                                        .bodyValue(patchPayload.toString())
                                                                        .retrieve()
                                                                        .toBodilessEntity()
                                                                        .block(Duration.ofSeconds(60));
                                                        log.info(">>> Successfully forced identity fields via PATCH.");
                                                } catch (Exception e) {
                                                        log.warn("!!! Follow-up PATCH warning (non-fatal): {}",
                                                                        e.getMessage());
                                                }

                                                for (com.fasterxml.jackson.databind.JsonNode oldLine : vendorLines) {
                                                        com.fasterxml.jackson.databind.node.ObjectNode newLinePayload = mapper
                                                                        .createObjectNode();
                                                        newLinePayload.put("documentId", newOrderId);

                                                        // Map essential line fields
                                                        String[] lineFields = { "lineType", "lineNo", "description",
                                                                        "quantity",
                                                                        "directUnitCost", "discountPercent",
                                                                        "discountAmount",
                                                                        "expectedReceiptDate", "DeliveryDate",
                                                                        "OldRemplacementItemNo" };
                                                        for (String f : lineFields) {
                                                                if (oldLine.has(f) && !oldLine.get(f).isNull()) {
                                                                        newLinePayload.set(f, oldLine.get(f));
                                                                }
                                                        }

                                                        // Map possible case variations for Item No and Cost
                                                        if (oldLine.has("lineObjectNumber"))
                                                                newLinePayload.set("lineObjectNumber",
                                                                                oldLine.get("lineObjectNumber"));
                                                        else if (oldLine.has("itemNo"))
                                                                newLinePayload.set("lineObjectNumber",
                                                                                oldLine.get("itemNo"));
                                                        else if (oldLine.has("ItemNo"))
                                                                newLinePayload.set("lineObjectNumber",
                                                                                oldLine.get("ItemNo"));

                                                        // Special handling for Adaptable articles: override reference
                                                        // and price
                                                        if (oldLine.has("AdaptableItemNo")
                                                                        && !oldLine.get("AdaptableItemNo").isNull()
                                                                        && !oldLine.get("AdaptableItemNo").asText()
                                                                                        .isEmpty()) {
                                                                newLinePayload.set("lineObjectNumber",
                                                                                oldLine.get("AdaptableItemNo"));
                                                                log.info(">>> splitLeDisponible: Using AdaptableItemNo: {}",
                                                                                oldLine.get("AdaptableItemNo")
                                                                                                .asText());
                                                                if (oldLine.has("AdaptablePrice") && !oldLine
                                                                                .get("AdaptablePrice").isNull()) {
                                                                        newLinePayload.set("directUnitCost",
                                                                                        oldLine.get("AdaptablePrice"));
                                                                }
                                                        } else {
                                                                if (oldLine.has("directUnitCost"))
                                                                        newLinePayload.set("directUnitCost",
                                                                                        oldLine.get("directUnitCost"));
                                                                else if (oldLine.has("DirectUnitCost"))
                                                                        newLinePayload.set("directUnitCost",
                                                                                        oldLine.get("DirectUnitCost"));
                                                        }

                                                        // Ensure lineType is set to Item to avoid "Standard Text"
                                                        // errors
                                                        if (!newLinePayload.has("lineType")
                                                                        || newLinePayload.get("lineType").isNull()) {
                                                                newLinePayload.put("lineType", "Item");
                                                        }

                                                        // Map DeliveryDate/expectedReceiptDate variations
                                                        if (oldLine.has("DeliveryDate"))
                                                                newLinePayload.set("DeliveryDate",
                                                                                oldLine.get("DeliveryDate"));
                                                        if (oldLine.has("expectedReceiptDate"))
                                                                newLinePayload.set("expectedReceiptDate",
                                                                                oldLine.get("expectedReceiptDate"));
                                                        if (oldLine.has("OldRemplacementItemNo"))
                                                                newLinePayload.set("OldRemplacementItemNo",
                                                                                oldLine.get("OldRemplacementItemNo"));

                                                        // Decision for the new order lines: "Disponible" if it was an
                                                        // adaptable article,
                                                        // otherwise keep "LivPrevuaDate" (or original decision)
                                                        if (oldLine.has("AdaptableItemNo")
                                                                        && !oldLine.get("AdaptableItemNo").isNull()
                                                                        && !oldLine.get("AdaptableItemNo").asText()
                                                                                        .isEmpty()) {
                                                                newLinePayload.put("Decision", "Disponible");
                                                        } else {
                                                                newLinePayload.put("Decision", "LivPrevuaDate");
                                                        }

                                                        log.info(">>> Creating line with payload: {}",
                                                                        newLinePayload.toString());

                                                        try {
                                                                webClient.post()
                                                                                .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                                                .fromHttpUrl(baseUrl
                                                                                                                + "/PlexuspurchaseOrders("
                                                                                                                + newOrderId
                                                                                                                + ")/PlexuspurchaseOrderLines")
                                                                                                .build(true).toUri())
                                                                                .header(HttpHeaders.AUTHORIZATION,
                                                                                                "Bearer " + token)
                                                                                .header(HttpHeaders.CONTENT_TYPE,
                                                                                                org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                                .header(HttpHeaders.ACCEPT,
                                                                                                org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                                .header("X-Customer-No", customerNo)
                                                                                .header("X-Vendor-No", vendorNoHeader)
                                                                                .bodyValue(newLinePayload.toString())
                                                                                .retrieve()
                                                                                .onStatus(status -> status
                                                                                                .is4xxClientError(),
                                                                                                response -> {
                                                                                                        return response.bodyToMono(
                                                                                                                        String.class)
                                                                                                                        .flatMap(errorBody -> {
                                                                                                                                log.error("!!! BC Line Creation Error Body: {}",
                                                                                                                                                errorBody);
                                                                                                                                return reactor.core.publisher.Mono
                                                                                                                                                .error(new RuntimeException(
                                                                                                                                                                "BC Error: " + errorBody));
                                                                                                                        });
                                                                                                })
                                                                                .bodyToMono(String.class)
                                                                                .block(Duration.ofSeconds(60));
                                                        } catch (Exception e) {
                                                                log.error("!!! FAILED to create line: {}",
                                                                                e.getMessage());
                                                                throw e; // Fail fast to avoid inconsistent orders
                                                        }
                                                }
                                                log.info(">>> Moved {} lines successfully to new order {} for vendor {}",
                                                                vendorLines.size(), newOrderNumber, targetVendor);
                                        }
                                }

                                // Update original header status
                                // We set to "Annulation" ONLY if ALL active lines were moved/replaced.
                                // If some lines remain (the "Disponible" ones), the original order stays as
                                // "LivraisonDispo".
                                boolean hasRemainingLines = false;
                                com.fasterxml.jackson.databind.JsonNode linesToCheck = originalOrder
                                                .has("plexuspurchaseOrderLines")
                                                                ? originalOrder.get("plexuspurchaseOrderLines")
                                                                : originalOrder.get("value");

                                if (linesToCheck != null && linesToCheck.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode l : linesToCheck) {
                                                String lid = l.get("id").asText();
                                                boolean isMoved = false;
                                                for (com.fasterxml.jackson.databind.JsonNode moved : linesToMove) {
                                                        if (moved.get("id").asText().equals(lid)) {
                                                                isMoved = true;
                                                                break;
                                                        }
                                                }
                                                if (!isMoved && l.has("quantity") && l.get("quantity").asDouble() > 0) {
                                                        hasRemainingLines = true;
                                                        break;
                                                }
                                        }
                                }

                                log.info(">>> Updating order header status (hasRemainingLines: {})...",
                                                hasRemainingLines);
                                try {
                                        com.fasterxml.jackson.databind.node.ObjectNode updateHeader = mapper
                                                        .createObjectNode();
                                        if (!hasRemainingLines) {
                                                updateHeader.put("ShippingAdvice", "Annulation");
                                        } else {
                                                updateHeader.put("ShippingAdvice", "LivraisonDispo");
                                        }

                                        webClient.patch()
                                                        .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                        .fromHttpUrl(baseUrl + "/PlexuspurchaseOrders("
                                                                                        + orderId + ")")
                                                                        .build(true).toUri())
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE,
                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                        .header(HttpHeaders.ACCEPT,
                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                        .header("If-Match", "*")
                                                        .header("X-Customer-No", customerNo)
                                                        .header("X-Vendor-No", vendorNoHeader)
                                                        .bodyValue(updateHeader.toString())
                                                        .retrieve()
                                                        .toBodilessEntity()
                                                        .timeout(java.time.Duration.ofSeconds(10))
                                                        .block(Duration.ofSeconds(60));
                                        log.info(">>> Successfully updated original order status.");
                                } catch (Exception e) {
                                        log.error("!!! FAILED to update original order status: {}", e.getMessage());
                                }

                                // Step: Confirm remaining "Disponible" original lines (not moved, not
                                // NonDisponible)
                                // These are lines the user kept as original and their status is
                                // Disponible/Confirmé
                                if (linesToCheck != null && linesToCheck.isArray()) {
                                        log.info(">>> Confirming remaining Disponible original lines...");
                                        for (com.fasterxml.jackson.databind.JsonNode l : linesToCheck) {
                                                String lid = l.get("id").asText();
                                                String docId = l.has("documentId") ? l.get("documentId").asText()
                                                                : orderId;

                                                // Skip lines that were moved to the new order
                                                boolean isMoved = false;
                                                for (com.fasterxml.jackson.databind.JsonNode moved : linesToMove) {
                                                        if (moved.get("id").asText().equals(lid)) {
                                                                isMoved = true;
                                                                break;
                                                        }
                                                }
                                                if (isMoved)
                                                        continue;

                                                // Get the payload data for this line
                                                com.fasterxml.jackson.databind.JsonNode pLine = payloadLineMap.get(lid);
                                                String lineDecision = (pLine != null && pLine.has("Decision"))
                                                                ? pLine.get("Decision").asText()
                                                                : (l.has("Decision") ? l.get("Decision").asText() : "");

                                                // Skip NonDisponible lines (they will be deleted by cleanup)
                                                if ("NonDisponible".equalsIgnoreCase(lineDecision)) {
                                                        log.info(">>> Skipping NonDisponible line {} (will be cleaned up)",
                                                                        lid);
                                                        continue;
                                                }

                                                // Confirm this line: patch with Decision: "Disponible" and
                                                // receiveQuantity
                                                try {
                                                        com.fasterxml.jackson.databind.node.ObjectNode linePatch = mapper
                                                                        .createObjectNode();
                                                        linePatch.put("Decision", "Disponible");

                                                        // Use invoiceQuantity from payload if available, otherwise use
                                                        // quantity from BC
                                                        double recvQty = 0;
                                                        if (pLine != null && pLine.has("invoiceQuantity")) {
                                                                recvQty = pLine.get("invoiceQuantity").asDouble();
                                                        } else if (pLine != null && pLine.has("receiveQuantity")) {
                                                                recvQty = pLine.get("receiveQuantity").asDouble();
                                                        } else if (l.has("quantity")) {
                                                                recvQty = l.get("quantity").asDouble();
                                                        }
                                                        linePatch.put("receiveQuantity", recvQty);

                                                        log.info(">>> Confirming original line {} with Decision=Disponible, receiveQuantity={}",
                                                                        lid, recvQty);

                                                        webClient.patch()
                                                                        .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                                        .fromHttpUrl(baseUrl
                                                                                                        + "/PlexuspurchaseOrders("
                                                                                                        + docId
                                                                                                        + ")/PlexuspurchaseOrderLines("
                                                                                                        + lid + ")")
                                                                                        .build(true).toUri())
                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                        "Bearer " + token)
                                                                        .header(HttpHeaders.CONTENT_TYPE,
                                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                        .header(HttpHeaders.ACCEPT,
                                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                        .header("If-Match", "*")
                                                                        .header("X-Customer-No", customerNo)
                                                                        .header("X-Vendor-No", vendorNoHeader)
                                                                        .bodyValue(linePatch.toString())
                                                                        .retrieve()
                                                                        .toBodilessEntity()
                                                                        .block(Duration.ofSeconds(30));
                                                        log.info(">>> Successfully confirmed original line {}", lid);
                                                } catch (Exception confirmEx) {
                                                        log.error("!!! FAILED to confirm original line {}: {}", lid,
                                                                        confirmEx.getMessage());
                                                }
                                        }
                                }
                        }

                        // Identify lines to delete because quantity was set to 0 in the UI
                        java.util.Set<String> zeroQtyLineIds = new java.util.HashSet<>();
                        if (rootNode.has("lines") && rootNode.get("lines").isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode payloadLine : rootNode.get("lines")) {
                                        double qty = -1;
                                        // In the UI "Quantité validée" maps to invoiceQuantity
                                        if (payloadLine.has("invoiceQuantity")) {
                                                qty = payloadLine.get("invoiceQuantity").asDouble();
                                        } else if (payloadLine.has("receiveQuantity")) {
                                                qty = payloadLine.get("receiveQuantity").asDouble();
                                        }

                                        String lId = payloadLine.has("id") ? payloadLine.get("id").asText() : "N/A";
                                        log.info(">>> splitLeDisponible: Line {} has qty: {}", lId, qty);

                                        if (qty == 0 && !"N/A".equals(lId)) {
                                                log.info(">>> splitLeDisponible: Marking line {} for deletion (qty 0)",
                                                                lId);
                                                zeroQtyLineIds.add(lId);
                                        }
                                }
                        }

                        // Move cleanup to BACKGROUND to avoid frontend timeout/wait
                        final java.util.List<com.fasterxml.jackson.databind.JsonNode> linesToClean = new java.util.ArrayList<>();
                        if (originalOrder != null && originalOrder.has("plexuspurchaseOrderLines")) {
                                for (com.fasterxml.jackson.databind.JsonNode line : originalOrder
                                                .get("plexuspurchaseOrderLines")) {
                                        String lId = line.has("id") ? line.get("id").asText() : "";

                                        // Retrieve corresponding payload line to check the user's updated
                                        // decision/quantities
                                        com.fasterxml.jackson.databind.JsonNode pLine = payloadLineMap.get(lId);
                                        String d = (pLine != null && pLine.has("Decision"))
                                                        ? pLine.get("Decision").asText()
                                                        : (line.has("Decision") ? line.get("Decision").asText() : "");
                                        String a = (pLine != null && pLine.has("ShippingAdvice"))
                                                        ? pLine.get("ShippingAdvice").asText()
                                                        : (line.has("ShippingAdvice")
                                                                        ? line.get("ShippingAdvice").asText()
                                                                        : "");

                                        if ("LivPrevuaDate".equalsIgnoreCase(d) || "LivPrevuaDate".equalsIgnoreCase(a)
                                                        || "LivraisonPrevuDate".equalsIgnoreCase(d)
                                                        || "LivraisonPrevuDate".equalsIgnoreCase(a)
                                                        || "NonDisponible".equalsIgnoreCase(d)
                                                        || "NonDisponible".equalsIgnoreCase(a)
                                                        || "Adaptable".equalsIgnoreCase(d)
                                                        || "Adaptable".equalsIgnoreCase(a)
                                                        || zeroQtyLineIds.contains(lId)) {
                                                linesToClean.add(line);
                                        }
                                }
                        }

                        if (!linesToClean.isEmpty()) {
                                final String bgToken = token;
                                final String bgCustNo = customerNo;
                                final String bgVendNo = vendorNoHeader;
                                final String bgOrderId = orderId;

                                java.util.concurrent.CompletableFuture.runAsync(() -> {
                                        log.info(">>> Starting BACKGROUND cleanup of {} lines...", linesToClean.size());
                                        for (com.fasterxml.jackson.databind.JsonNode line : linesToClean) {
                                                String lId = line.get("id").asText();
                                                String dId = (line.has("documentId")
                                                                && !line.get("documentId").isNull())
                                                                                ? line.get("documentId").asText()
                                                                                : bgOrderId;
                                                try {
                                                        webClient.delete()
                                                                        .uri(uriBuilder -> org.springframework.web.util.UriComponentsBuilder
                                                                                        .fromHttpUrl(baseUrl
                                                                                                        + "/PlexuspurchaseOrders("
                                                                                                        + dId
                                                                                                        + ")/PlexuspurchaseOrderLines("
                                                                                                        + lId + ")")
                                                                                        .build(true).toUri())
                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                        "Bearer " + bgToken)
                                                                        .header(HttpHeaders.ACCEPT,
                                                                                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
                                                                        .header("If-Match", "*")
                                                                        .header("X-Customer-No", bgCustNo)
                                                                        .header("X-Vendor-No", bgVendNo)
                                                                        .retrieve()
                                                                        .toBodilessEntity()
                                                                        .block(Duration.ofSeconds(60));
                                                        log.info(">>> Background deleted line {}", lId);
                                                } catch (Exception e) {
                                                        log.warn(">>> Background deletion failed for line {}: {}", lId,
                                                                        e.getMessage());
                                                }
                                        }
                                        log.info(">>> BACKGROUND cleanup finished.");
                                });
                        }

                        log.info(">>> SPLIT-LE-DISPONIBLE FINISHED SUCCESSFULLY (Cleanup running in background)");
                        return ResponseEntity.ok("{\"success\": true}");
                } catch (Exception e) {
                        log.error("!!! Split order fatal error: {}", e.getMessage());
                        return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
                }
        }

        private void enrichWithCustomerData(com.fasterxml.jackson.databind.JsonNode rootNode, String token) {
                try {
                        String customerNo = null;
                        if (rootNode.has("SellToCustomerNo") && !rootNode.get("SellToCustomerNo").asText().isEmpty()) {
                                customerNo = rootNode.get("SellToCustomerNo").asText();
                        } else if (rootNode.has("customerNo") && !rootNode.get("customerNo").asText().isEmpty()) {
                                customerNo = rootNode.get("customerNo").asText();
                        }

                        if (customerNo == null || customerNo.isEmpty()) {
                                return;
                        }

                        log.info(">>> Enriching document data from Customer API for: {}", customerNo);

                        // Use standard BC API for customers (standard entities aren't always in custom
                        // APIs)
                        String standardBaseUrl = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0/", "/api/v2.0/");
                        java.net.URI customerUri = org.springframework.web.util.UriComponentsBuilder
                                        .fromHttpUrl(standardBaseUrl + "/customers")
                                        .queryParam("$filter", "number eq '" + customerNo + "'")
                                        .build()
                                        .encode()
                                        .toUri();

                        String customerRes = webClient.get()
                                        .uri(customerUri)
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(10));

                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode customerData = mapper.readTree(customerRes);
                        if (customerData.has("value") && customerData.get("value").isArray()
                                        && customerData.get("value").size() > 0) {
                                com.fasterxml.jackson.databind.JsonNode customer = customerData.get("value").get(0);
                                com.fasterxml.jackson.databind.node.ObjectNode rootObj = (com.fasterxml.jackson.databind.node.ObjectNode) rootNode;

                                if (customer.has("displayName") && !customer.get("displayName").asText().isEmpty()) {
                                        rootObj.put("CustomerName", customer.get("displayName").asText());
                                }

                                // Fallback to BC standard customer fields if missing or empty in rootNode
                                if (customer.has("taxRegistrationNumber")
                                                && !customer.get("taxRegistrationNumber").asText().isEmpty()) {
                                        rootObj.put("VATRegistrationNo",
                                                        customer.get("taxRegistrationNumber").asText());
                                } else if (customer.has("vatRegistrationNumber")
                                                && !customer.get("vatRegistrationNumber").asText().isEmpty()) {
                                        rootObj.put("VATRegistrationNo",
                                                        customer.get("vatRegistrationNumber").asText());
                                }

                                if (customer.has("phoneNumber") && !customer.get("phoneNumber").asText().isEmpty()) {
                                        rootObj.put("PhoneNo", customer.get("phoneNumber").asText());
                                }

                                // Address enrichment
                                if (customer.has("addressLine1") && !customer.get("addressLine1").asText().isEmpty()) {
                                        rootObj.put("FullAddressLine1", customer.get("addressLine1").asText());
                                }
                                if (customer.has("addressLine2") && !customer.get("addressLine2").asText().isEmpty()) {
                                        rootObj.put("FullAddressLine2", customer.get("addressLine2").asText());
                                }
                                if (customer.has("city") && !customer.get("city").asText().isEmpty()) {
                                        rootObj.put("FullCity", customer.get("city").asText());
                                }
                        }
                } catch (Exception ce) {
                        log.warn(">>> Customer enrichment failed: {}", ce.getMessage());
                }
        }

        private void enrichWithPlexusMetadata(com.fasterxml.jackson.databind.JsonNode rootNode, String token) {
                try {
                        String orderId = rootNode.has("id") ? rootNode.get("id").asText() : null;
                        if (orderId == null || orderId.isEmpty())
                                return;

                        log.info(">>> Enriching document data from Plexus Metadata API for order: {}", orderId);

                        String patchUrl = tarekSystemUrl + "/plexusPurchaseOrderPatches(" + orderId + ")";
                        String response = webClient.get()
                                        .uri(java.net.URI.create(patchUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(10));

                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode metadata = mapper.readTree(response);
                        com.fasterxml.jackson.databind.node.ObjectNode rootObj = (com.fasterxml.jackson.databind.node.ObjectNode) rootNode;

                        if (metadata.has("VIN") && !metadata.get("VIN").asText().isEmpty()) {
                                rootObj.put("VIN", metadata.get("VIN").asText());
                        }
                        if (metadata.has("RegistrationNumber")
                                        && !metadata.get("RegistrationNumber").asText().isEmpty()) {
                                rootObj.put("RegistrationNumber", metadata.get("RegistrationNumber").asText());
                        }
                        if (metadata.has("postedSalesShipmentNumber")
                                        && !metadata.get("postedSalesShipmentNumber").asText().isEmpty()) {
                                rootObj.put("postedSalesShipmentNumber",
                                                metadata.get("postedSalesShipmentNumber").asText());
                        }
                        if (metadata.has("InsuredName") && !metadata.get("InsuredName").asText().isEmpty()) {
                                rootObj.put("PLX_InsuredName", metadata.get("InsuredName").asText());
                        }
                } catch (Exception e) {
                        log.warn("enrichWithPlexusMetadata failed: {}", e.getMessage());
                }
        }

        private void enrichWithSalesDiscount(com.fasterxml.jackson.databind.JsonNode rootNode,
                        com.fasterxml.jackson.databind.JsonNode poLines, String token) {
                try {
                        String orderNumber = rootNode.has("number") ? rootNode.get("number").asText() : "";
                        if (orderNumber.isEmpty() || poLines == null || !poLines.isArray()) {
                                return;
                        }

                        log.info(">>> Enriching document data from Sales API for PO: {}", orderNumber);

                        final String salesBaseUrl = baseUrl.replace("AcessPurchasesAPI", "AcessSalesAPI");
                        java.net.URI salesUri = org.springframework.web.util.UriComponentsBuilder
                                        .fromHttpUrl(salesBaseUrl + "/PlexussalesOrders")
                                        .queryParam("$filter", "PurchaseHeaderNoNew eq '" + orderNumber + "'")
                                        .queryParam("$expand", "PlexussalesOrderLines")
                                        .build()
                                        .encode()
                                        .toUri();

                        String response = webClient.get()
                                        .uri(salesUri)
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(15));

                        try {
                                java.nio.file.Files.writeString(java.nio.file.Paths.get("sales_api_response.json"),
                                                response);
                        } catch (Exception writeEx) {
                        }

                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode salesData = mapper.readTree(response);
                        com.fasterxml.jackson.databind.JsonNode salesOrders = salesData.has("value")
                                        ? salesData.get("value")
                                        : salesData;

                        if (salesOrders.isArray() && salesOrders.size() > 0) {
                                com.fasterxml.jackson.databind.JsonNode salesOrder = salesOrders.get(0);
                                // Inject Sales Order number into rootNode for BL number generation
                                if (salesOrder.has("number") && !salesOrder.get("number").asText().isEmpty()) {
                                        String salesOrderNo = salesOrder.get("number").asText();
                                        ((com.fasterxml.jackson.databind.node.ObjectNode) rootNode)
                                                        .put("salesOrderNumber", salesOrderNo);
                                        log.info(">>> Injected salesOrderNumber for BL: {}", salesOrderNo);

                                        // Step 2.5e: Fetch the actual Posted Sales Shipment number (BL number) from BC
                                        try {
                                                String standardShipmentsUrl = salesBaseUrl
                                                                .replace("/api/NEL/AcessSalesAPI/v2.0", "/api/v2.0")
                                                                + "/salesShipments";

                                                java.net.URI shipmentsUri = org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(standardShipmentsUrl)
                                                                .queryParam("$filter",
                                                                                "orderNumber eq '" + salesOrderNo + "'")
                                                                .build().encode().toUri();

                                                String shipmentsResponse = webClient.get()
                                                                .uri(shipmentsUri)
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .block(Duration.ofSeconds(10));

                                                com.fasterxml.jackson.databind.JsonNode shipmentsData = mapper
                                                                .readTree(shipmentsResponse);
                                                com.fasterxml.jackson.databind.JsonNode shipments = shipmentsData
                                                                .has("value") ? shipmentsData.get("value")
                                                                                : shipmentsData;

                                                if (shipments.isArray() && shipments.size() > 0) {
                                                        String shipmentNo = shipments.get(0).get("number").asText();
                                                        ((com.fasterxml.jackson.databind.node.ObjectNode) rootNode)
                                                                        .put("postedSalesShipmentNumber", shipmentNo);
                                                        log.info(">>> Found and Injected postedSalesShipmentNumber for BL: {}",
                                                                        shipmentNo);
                                                }
                                        } catch (Exception shipEx) {
                                                log.warn(">>> Could not fetch shipment for sales order {}: {}",
                                                                salesOrderNo, shipEx.getMessage());
                                        }
                                }
                                com.fasterxml.jackson.databind.JsonNode soLines = salesOrder
                                                .has("plexussalesOrderLines")
                                                                ? salesOrder.get("plexussalesOrderLines")
                                                                : (salesOrder.has("PlexussalesOrderLines")
                                                                                ? salesOrder.get(
                                                                                                "PlexussalesOrderLines")
                                                                                : null);

                                if (soLines != null && soLines.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode poLine : poLines) {
                                                String poLineObjNo = poLine.has("lineObjectNumber")
                                                                ? poLine.get("lineObjectNumber").asText()
                                                                : "";
                                                for (com.fasterxml.jackson.databind.JsonNode soLine : soLines) {
                                                        String soLineObjNo = soLine.has("lineObjectNumber")
                                                                        ? soLine.get("lineObjectNumber").asText()
                                                                        : "";
                                                        if (!poLineObjNo.isEmpty() && poLineObjNo.equals(soLineObjNo)) {
                                                                // Inject ALL fields that look like a discount for
                                                                // debugging
                                                                java.util.Iterator<java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = soLine
                                                                                .fields();
                                                                while (fields.hasNext()) {
                                                                        java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields
                                                                                        .next();
                                                                        if (field.getKey().toLowerCase()
                                                                                        .contains("discount")) {
                                                                                ((com.fasterxml.jackson.databind.node.ObjectNode) poLine)
                                                                                                .put("sales_" + field
                                                                                                                .getKey(),
                                                                                                                field.getValue().asText());
                                                                        }
                                                                }

                                                                if (soLine.has("lineDiscountPercent")) {
                                                                        ((com.fasterxml.jackson.databind.node.ObjectNode) poLine)
                                                                                        .put("salesDiscountPercent",
                                                                                                        soLine.get("lineDiscountPercent")
                                                                                                                        .asDouble());
                                                                } else if (soLine.has("discountPercent")) {
                                                                        ((com.fasterxml.jackson.databind.node.ObjectNode) poLine)
                                                                                        .put("salesDiscountPercent",
                                                                                                        soLine.get("discountPercent")
                                                                                                                        .asDouble());
                                                                }

                                                                if (soLine.has("lineDiscountAmount")) {
                                                                        ((com.fasterxml.jackson.databind.node.ObjectNode) poLine)
                                                                                        .put("salesDiscountAmount",
                                                                                                        soLine.get("lineDiscountAmount")
                                                                                                                        .asDouble());
                                                                } else if (soLine.has("discountAmount")) {
                                                                        ((com.fasterxml.jackson.databind.node.ObjectNode) poLine)
                                                                                        .put("salesDiscountAmount",
                                                                                                        soLine.get("discountAmount")
                                                                                                                        .asDouble());
                                                                }
                                                                break;
                                                        }
                                                }
                                        }
                                }
                        }
                } catch (Exception e) {
                        log.warn(">>> Sales discount enrichment failed: {}", e.getMessage());
                }
        }

        // ===== Helper: Reopen a Released Purchase Order via standard BC v2.0 API =====
        private void reopenPurchaseOrder(String orderId, String token) {
                String standardApiBase = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0", "/api/v2.0");
                String reopenUrl = standardApiBase + "/purchaseOrders(" + orderId + ")/Microsoft.NAV.reopen";
                log.info(">>> reopenPurchaseOrder: POST {}", reopenUrl);
                webClient.post()
                                .uri(java.net.URI.create(reopenUrl))
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                .bodyValue("{}")
                                .retrieve()
                                .toBodilessEntity()
                                .block(Duration.ofSeconds(15));
                log.info(">>> reopenPurchaseOrder: Order {} reopened successfully", orderId);
        }

        // ===== Helper: Release a Purchase Order via standard BC v2.0 API =====
        private void releasePurchaseOrder(String orderId, String token) {
                String standardApiBase = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0", "/api/v2.0");
                String releaseUrl = standardApiBase + "/purchaseOrders(" + orderId + ")/Microsoft.NAV.release";
                log.info(">>> releasePurchaseOrder: POST {}", releaseUrl);
                try {
                        webClient.post()
                                        .uri(java.net.URI.create(releaseUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .bodyValue("{}")
                                        .retrieve()
                                        .toBodilessEntity()
                                        .block(Duration.ofSeconds(15));
                        log.info(">>> releasePurchaseOrder: Order {} released successfully", orderId);
                } catch (Exception e) {
                        log.warn(">>> releasePurchaseOrder: Failed to re-release order {} (may remain Open): {}",
                                        orderId, e.getMessage());
                }
        }

        // ===== Helper: Extract orderId from API path =====
        private String extractOrderIdFromPath(String path) {
                // Matches patterns like /PlexuspurchaseOrders(xxxx-xxxx-xxxx) or
                // /PlexuspurchaseOrders(xxxx-xxxx-xxxx)/...
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("PlexuspurchaseOrders\\(([^)]+)\\)");
                java.util.regex.Matcher matcher = pattern.matcher(path);
                if (matcher.find()) {
                        return matcher.group(1);
                }
                return null;
        }

        // ===== PEC Commandes Endpoints =====

        @GetMapping("/pec")
        public ResponseEntity<String> getPecRequests(
                        HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                String token = tokenService.getAccessToken();
                String customerNo = request.getHeader("X-Customer-No");

                if (customerNo == null || customerNo.isEmpty()) {
                        return ResponseEntity.ok("{ \"value\": [], \"@odata.count\": 0 }");
                }

                try {
                        String filterParam = "";
                        if (!"C0090".equals(customerNo)) {
                                String filter = "customerNo eq '" + customerNo.replace("'", "''") + "'";
                                filterParam = "?$filter=" + java.net.URLEncoder.encode(filter, "UTF-8") + "&";
                        } else {
                                filterParam = "?";
                        }

                        String encodedOrderBy = java.net.URLEncoder.encode("creationDateTime desc", "UTF-8");

                        String fullUrl = tarekSystemUrl + "/plexusPecHeaders"
                                        + filterParam
                                        + "$orderby=" + encodedOrderBy
                                        + "&$skip=" + skip
                                        + "&$top=" + top
                                        + "&$count=true";

                        log.info("Fetching PEC requests: GET {}", fullUrl);
                        String response = webClient.get()
                                        .uri(java.net.URI.create(fullUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(30));

                        return ResponseEntity.ok(response);
                } catch (Exception e) {
                        log.error("Error fetching PEC requests: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @GetMapping("/pec/{documentNo}/lines")
        public ResponseEntity<String> getPecRequestLines(
                        HttpServletRequest request,
                        @org.springframework.web.bind.annotation.PathVariable("documentNo") String documentNo) {
                String token = tokenService.getAccessToken();

                try {
                        String filter = "documentNo eq '" + documentNo.replace("'", "''") + "'";
                        String encodedFilter = java.net.URLEncoder.encode(filter, "UTF-8");

                        String encodedOrderBy = java.net.URLEncoder.encode("lineNo asc", "UTF-8");

                        String fullUrl = tarekSystemUrl + "/plexusPecLines"
                                        + "?$filter=" + encodedFilter
                                        + "&$orderby=" + encodedOrderBy;

                        log.info("Fetching PEC request lines: GET {}", fullUrl);
                        String response = webClient.get()
                                        .uri(java.net.URI.create(fullUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(30));

                        return ResponseEntity.ok(response);
                } catch (Exception e) {
                        log.error("Error fetching PEC request lines: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @org.springframework.web.bind.annotation.PostMapping("/pec")
        public ResponseEntity<String> createPecRequest(
                        HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();
                String customerNo = request.getHeader("X-Customer-No");

                if (customerNo == null || customerNo.isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body("{\"error\": \"Missing customer number in session (X-Customer-No)\"}");
                }

                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String vin = rootNode.has("vin") ? rootNode.get("vin").asText() : "";
                        String registrationNumber = rootNode.has("registrationNumber")
                                        ? rootNode.get("registrationNumber").asText()
                                        : "";
                        String insuredName = rootNode.has("insuredName") ? rootNode.get("insuredName").asText() : "";

                        // Create Header payload
                        com.fasterxml.jackson.databind.node.ObjectNode headerPayload = mapper.createObjectNode();
                        headerPayload.put("vin", vin);
                        headerPayload.put("registrationNumber", registrationNumber);
                        headerPayload.put("insuredName", insuredName);
                        headerPayload.put("customerNo", customerNo);

                        String headerUrl = tarekSystemUrl + "/plexusPecHeaders";
                        log.info("Creating PEC request header: POST {}", headerUrl);

                        String headerResponseStr = webClient.post()
                                        .uri(java.net.URI.create(headerUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .bodyValue(headerPayload.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(30));

                        com.fasterxml.jackson.databind.JsonNode headerNode = mapper.readTree(headerResponseStr);
                        String documentNo = headerNode.get("number").asText();
                        log.info("PEC request header created successfully with documentNo: {}", documentNo);

                        // Create Lines
                        if (rootNode.has("lines") && rootNode.get("lines").isArray()) {
                                int lineIndex = 0;
                                String linesUrl = tarekSystemUrl + "/plexusPecLines";

                                for (com.fasterxml.jackson.databind.JsonNode lineNode : rootNode.get("lines")) {
                                        lineIndex++;
                                        String reference = lineNode.has("reference")
                                                        ? lineNode.get("reference").asText()
                                                        : "";
                                        String designation = lineNode.has("designation")
                                                        ? lineNode.get("designation").asText()
                                                        : "";
                                        double quantity = lineNode.has("quantity") ? lineNode.get("quantity").asDouble()
                                                        : 1.0;

                                        com.fasterxml.jackson.databind.node.ObjectNode linePayload = mapper
                                                        .createObjectNode();
                                        linePayload.put("documentNo", documentNo);
                                        linePayload.put("lineNo", lineIndex * 10000);
                                        linePayload.put("reference", reference);
                                        linePayload.put("designation", designation);
                                        linePayload.put("quantity", quantity);

                                        log.info("Creating PEC line: POST {} payload: {}", linesUrl, linePayload);
                                        webClient.post()
                                                        .uri(java.net.URI.create(linesUrl))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .bodyValue(linePayload.toString())
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(15));
                                }
                        }

                        return ResponseEntity.ok(headerResponseStr);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        log.error("BC API Error creating PEC request: (HTTP {}) {}", e.getStatusCode(),
                                        e.getResponseBodyAsString());
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("BC Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        log.error("Error creating PEC request: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @org.springframework.web.bind.annotation.PostMapping("/pec/{documentNo}/create-order")
        public ResponseEntity<String> createOrderFromPec(
                        HttpServletRequest request,
                        @org.springframework.web.bind.annotation.PathVariable("documentNo") String documentNo,
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();

                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        String vendorNumber = rootNode.has("vendorNumber") ? rootNode.get("vendorNumber").asText() : "";
                        if (vendorNumber == null || vendorNumber.isEmpty()) {
                                return ResponseEntity.badRequest().body("{\"error\": \"Missing vendorNumber\"}");
                        }

                        // 1. Fetch the PEC header details to get VIN, registration, insured name,
                        // customerNo, and its SystemId (id)
                        String filter = "number eq '" + documentNo.replace("'", "''") + "'";
                        String encodedFilter = java.net.URLEncoder.encode(filter, "UTF-8");
                        String headerUrl = tarekSystemUrl + "/plexusPecHeaders?$filter=" + encodedFilter;

                        log.info("Fetching PEC Header details: GET {}", headerUrl);
                        String headerListResponse = webClient.get()
                                        .uri(java.net.URI.create(headerUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(30));

                        com.fasterxml.jackson.databind.JsonNode listNode = mapper.readTree(headerListResponse);
                        com.fasterxml.jackson.databind.JsonNode valueNode = listNode.get("value");
                        if (valueNode == null || !valueNode.isArray() || valueNode.size() == 0) {
                                return ResponseEntity.status(404)
                                                .body("{\"error\": \"PEC demand not found: " + documentNo + "\"}");
                        }

                        com.fasterxml.jackson.databind.JsonNode pecHeader = valueNode.get(0);
                        String pecHeaderId = pecHeader.get("id").asText();
                        String vin = pecHeader.has("vin") ? pecHeader.get("vin").asText() : "";
                        String registrationNumber = pecHeader.has("registrationNumber")
                                        ? pecHeader.get("registrationNumber").asText()
                                        : "";
                        String insuredName = pecHeader.has("insuredName") ? pecHeader.get("insuredName").asText() : "";
                        String customerNo = pecHeader.has("customerNo") ? pecHeader.get("customerNo").asText() : "";

                        // 2. Process Lines (update PEC line details in BC and verify/import references)
                        com.fasterxml.jackson.databind.JsonNode linesNode = rootNode.get("lines");
                        if (linesNode != null && linesNode.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode line : linesNode) {
                                        String lineId = line.get("id").asText();
                                        String reference = line.get("reference").asText();
                                        String designation = line.has("designation") ? line.get("designation").asText()
                                                        : "";
                                        double quantity = line.has("quantity") ? line.get("quantity").asDouble() : 1.0;

                                        // PATCH PEC line in BC to sync details
                                        com.fasterxml.jackson.databind.node.ObjectNode linePatchPayload = mapper
                                                        .createObjectNode();
                                        linePatchPayload.put("reference", reference);
                                        linePatchPayload.put("designation", designation);
                                        linePatchPayload.put("quantity", quantity);

                                        String patchLineUrl = tarekSystemUrl + "/plexusPecLines(" + lineId + ")";
                                        log.info("Updating PEC Line in BC: PATCH {} payload: {}", patchLineUrl,
                                                        linePatchPayload);
                                        webClient.patch()
                                                        .uri(java.net.URI.create(patchLineUrl))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .header("If-Match", "*")
                                                        .bodyValue(linePatchPayload.toString())
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(20));

                                        // Register the reference to standard items for this vendor via
                                        // /plexusItemImports
                                        try {
                                                com.fasterxml.jackson.databind.node.ObjectNode importPayload = mapper
                                                                .createObjectNode();
                                                importPayload.put("vendorNo", vendorNumber);
                                                importPayload.put("vendorItemNo", reference);
                                                importPayload.put("ItemDescription",
                                                                (designation != null && !designation.isEmpty())
                                                                                ? designation
                                                                                : reference);
                                                importPayload.put("genProdPostingGroup", "NEGOCE");
                                                importPayload.put("vatProdPostingGroup", "TVA19");
                                                importPayload.put("inventoryPostingGroup", "REVENTE");

                                                String importUrl = tarekSystemUrl + "/plexusItemImports";
                                                log.info("Importing Item into BC: POST {} payload: {}", importUrl,
                                                                importPayload);
                                                webClient.post()
                                                                .uri(java.net.URI.create(importUrl))
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                .bodyValue(importPayload.toString())
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .block(Duration.ofSeconds(30));
                                        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                                                int status = e.getStatusCode().value();
                                                String responseBody = e.getResponseBodyAsString();
                                                if (status == 409 || responseBody.contains("already exists")
                                                                || responseBody.contains("AlreadyExists")) {
                                                        log.info("Item reference already exists: {}, skipping import",
                                                                        reference);
                                                } else {
                                                        log.error("Error importing item: {}", responseBody);
                                                        throw e;
                                                }
                                        }
                                }
                        }

                        // 3. Create Standard Purchase Order Header
                        com.fasterxml.jackson.databind.node.ObjectNode orderHeaderPayload = mapper.createObjectNode();
                        orderHeaderPayload.put("vendorNumber", vendorNumber);
                        String today = java.time.LocalDate.now().toString();
                        orderHeaderPayload.put("orderDate", today);
                        orderHeaderPayload.put("postingDate", today);
                        orderHeaderPayload.put("ShippingAdvice", "Attente");
                        orderHeaderPayload.put("Delivred", "Non");
                        orderHeaderPayload.put("QtyReceived", "Non");

                        String createOrderUrl = baseUrl + "/PlexuspurchaseOrders";
                        log.info("Creating Purchase Order: POST {} payload: {}", createOrderUrl, orderHeaderPayload);
                        String orderHeaderResponse = webClient.post()
                                        .uri(java.net.URI.create(createOrderUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .bodyValue(orderHeaderPayload.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.JsonNode standardOrder = mapper.readTree(orderHeaderResponse);
                        String orderId = standardOrder.get("id").asText();
                        String orderNumber = standardOrder.get("number").asText();
                        String orderEtag = standardOrder.has("@odata.etag") ? standardOrder.get("@odata.etag").asText()
                                        : "*";

                        // 4. Update standard order SellToCustomerNo (always assign to Plexus Pec C0090)
                        com.fasterxml.jackson.databind.node.ObjectNode patchOrderPayload = mapper.createObjectNode();
                        patchOrderPayload.put("QtyReceived", "Non");
                        patchOrderPayload.put("SellToCustomerNo", "C0090");
                        try {
                                String patchOrderUrl = baseUrl + "/PlexuspurchaseOrders(" + orderId + ")";
                                log.info("Patching Purchase Order Customer: PATCH {} payload: {}", patchOrderUrl,
                                                patchOrderPayload);
                                webClient.method(org.springframework.http.HttpMethod.PATCH)
                                                .uri(java.net.URI.create(patchOrderUrl))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                .header("If-Match", orderEtag)
                                                .bodyValue(patchOrderPayload.toString())
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(30));
                        } catch (Exception ex) {
                                log.warn("Failed to patch standard order customer: {}", ex.getMessage());
                        }

                        // 5. PATCH metadata via plexustarek API (VIN, RegistrationNumber, InsuredName)
                        try {
                                com.fasterxml.jackson.databind.node.ObjectNode metadataPatch = mapper
                                                .createObjectNode();
                                boolean hasMetadata = false;
                                if (insuredName != null && !insuredName.isEmpty()) {
                                        metadataPatch.put("InsuredName", insuredName);
                                        hasMetadata = true;
                                }
                                if (vin != null && !vin.isEmpty()) {
                                        metadataPatch.put("VIN", vin);
                                        hasMetadata = true;
                                }
                                if (registrationNumber != null && !registrationNumber.isEmpty()) {
                                        metadataPatch.put("RegistrationNumber", registrationNumber);
                                        hasMetadata = true;
                                }

                                if (hasMetadata) {
                                        String metadataPatchUrl = tarekSystemUrl + "/plexusPurchaseOrderPatches("
                                                        + orderId + ")";
                                        log.info("Patching Purchase Order Metadata: PATCH {} payload: {}",
                                                        metadataPatchUrl, metadataPatch);
                                        webClient.method(org.springframework.http.HttpMethod.PATCH)
                                                        .uri(java.net.URI.create(metadataPatchUrl))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .header("If-Match", "*")
                                                        .bodyValue(metadataPatch.toString())
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(30));
                                }
                        } catch (Exception ex) {
                                log.warn("Failed to patch standard order metadata: {}", ex.getMessage());
                        }

                        // 6. Create standard order lines
                        if (linesNode != null && linesNode.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode line : linesNode) {
                                        String reference = line.get("reference").asText();
                                        String designation = line.has("designation") ? line.get("designation").asText()
                                                        : "";
                                        double quantity = line.has("quantity") ? line.get("quantity").asDouble() : 1.0;

                                        com.fasterxml.jackson.databind.node.ObjectNode linePayload = mapper
                                                        .createObjectNode();
                                        linePayload.put("documentId", orderId);
                                        linePayload.put("lineType", "Item");
                                        linePayload.put("lineObjectNumber", reference);
                                        linePayload.put("description", designation);
                                        linePayload.put("quantity", quantity);
                                        linePayload.put("directUnitCost", 0.0);

                                        String lineUrl = baseUrl + "/PlexuspurchaseOrders(" + orderId
                                                        + ")/PlexuspurchaseOrderLines";
                                        log.info("Creating Purchase Order Line: POST {} payload: {}", lineUrl,
                                                        linePayload);
                                        webClient.post()
                                                        .uri(java.net.URI.create(lineUrl))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .bodyValue(linePayload.toString())
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(45));
                                }
                        }

                        // 7. Update PEC Header in BC (status = "Commandé", purchaseOrderNo =
                        // orderNumber)
                        com.fasterxml.jackson.databind.node.ObjectNode pecHeaderPatch = mapper.createObjectNode();
                        pecHeaderPatch.put("status", "Commandé");
                        pecHeaderPatch.put("purchaseOrderNo", orderNumber);

                        String patchPecHeaderUrl = tarekSystemUrl + "/plexusPecHeaders(" + pecHeaderId + ")";
                        log.info("Updating PEC Header in BC: PATCH {} payload: {}", patchPecHeaderUrl, pecHeaderPatch);
                        webClient.patch()
                                        .uri(java.net.URI.create(patchPecHeaderUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .header("If-Match", "*")
                                        .bodyValue(pecHeaderPatch.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(30));

                        return ResponseEntity.ok("{\"success\": true, \"orderNumber\": \"" + orderNumber + "\"}");

                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        log.error("BC API Error creating PO from PEC: (HTTP {}) {}", e.getStatusCode(),
                                        e.getResponseBodyAsString());
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("BC Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        log.error("Error creating PO from PEC: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }
}