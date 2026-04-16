package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import java.time.Duration;
import com.plexus.backend.service.BLGeneratorService;
import com.plexus.backend.service.DevisGeneratorService;
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
        private final Set<String> activeValidations = ConcurrentHashMap.newKeySet();

        @Value("${business-central.api.base-url}")
        private String baseUrl;

        @Value("${business-central.api.system-url}")
        private String systemUrl;

        @Value("${business-central.api.tarek-system-url}")
        private String tarekSystemUrl;

        @Value("${business-central.api.company-id}")
        private String companyId;

        public PurchaseOrderController(WebClient webClient, BusinessCentralTokenService tokenService,
                        BLGeneratorService blGeneratorService, DevisGeneratorService devisGeneratorService) {
                this.webClient = webClient;
                this.tokenService = tokenService;
                this.blGeneratorService = blGeneratorService;
                this.devisGeneratorService = devisGeneratorService;
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

                        System.out.println("====== BC HEADER PAYLOAD ======");
                        System.out.println(headerPayload.toPrettyString());
                        System.out.println("===============================");

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
                                        .block();

                        System.out.println("====== BC HEADER RESPONSE ======");
                        System.out.println(headerResponseStr);
                        System.out.println("================================");

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
                                                .block();

                        log.info("Bulk creation PATCH payload: {}", patchPayload);
                        log.info("Bulk creation PATCH response: {}", patchResponse);
                                if (patchResponse != null && !patchResponse.isBlank()) {
                                        headerResponseStr = patchResponse;
                                }
                        } catch (Exception patchEx) {
                                // Silent fail for metadata patch
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
                                                        .block();

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
                        String itemVendorUrl = systemUrl + "/ItemVendors";

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
                                        .block();

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
                                                .block();

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
                        // Using AcessSystemAPI/v1.0 and the correct company ID as per ItemVendors
                        // pattern
                        String vendorUrl = systemUrl + "/VendorLists";
                        String response = webClient.get()
                                        .uri(uriBuilder -> {
                                                return org.springframework.web.util.UriComponentsBuilder
                                                                .fromHttpUrl(vendorUrl)
                                                                .query(request.getQueryString())
                                                                .build(true)
                                                                .toUri();
                                        })
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();
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
                                        .block();
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

                        // Base URL for the new AcessSystemAPI endpoints
                        // (Display Name: Plexus)
                        String bcApiUrl = tarekSystemUrl;
                        String itemUrl = bcApiUrl + "/plexusProducts";
                        String vendorLinkUrl = bcApiUrl + "/plexusVendorPosts";

                        if (items != null && items.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode item : items) {
                                        String reference = item.has("reference") ? item.get("reference").asText() : "";
                                        String designation = item.has("designation") ? item.get("designation").asText()
                                                        : "";

                                        // --- STEP 1: Ensure the Item exists in BC ---
                                        boolean itemExistsOrCreated = false;
                                        try {
                                                // GET item filtered by its number
                                                String filter = "number eq '" + reference + "'";
                                                String encodedFilter = java.net.URLEncoder.encode(filter, "UTF-8")
                                                                .replace("+", "%20");
                                                String existingItemResponse = webClient.get()
                                                                .uri(java.net.URI.create(
                                                                                itemUrl + "?$filter=" + encodedFilter))
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .block();

                                                com.fasterxml.jackson.databind.JsonNode existingNode = mapper
                                                                .readTree(existingItemResponse);

                                                // If search returns 0 results, create the item
                                                if (existingNode.has("value")
                                                                && existingNode.get("value").size() == 0) {
                                                        com.fasterxml.jackson.databind.node.ObjectNode newItem = mapper
                                                                        .createObjectNode();
                                                        newItem.put("number", reference);
                                                        newItem.put("description", designation);
                                                        newItem.put("baseUnitOfMeasure", "PCS"); // Must match BC exact
                                                                                                 // unit code e.g., PCS,
                                                                                                 // UN, etc.
                                                        newItem.put("inventoryPostingGroup", "REVENTE");
                                                        newItem.put("unitPrice", 0.999);

                                                        // POST to create the Item
                                                        webClient.post()
                                                                        .uri(java.net.URI.create(itemUrl))
                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                        "Bearer " + token)
                                                                        .header(HttpHeaders.CONTENT_TYPE,
                                                                                        "application/json")
                                                                        .bodyValue(newItem.toString())
                                                                        .retrieve()
                                                                        .bodyToMono(String.class)
                                                                        .block();
                                                }
                                                itemExistsOrCreated = true;
                                        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                                                String responseBody = e.getResponseBodyAsString();
                                                System.err.println("BC API Error (HTTP " + e.getStatusCode()
                                                                + ") for Item "
                                                                + reference + ": " + responseBody);
                                                // Let it fail fast so it doesn't try vendor link
                                                throw new RuntimeException(
                                                                "Failed to ensure Item exists in BC: " + responseBody);
                                        } catch (Exception e) {
                                                System.err.println("Item existence check/creation failed for "
                                                                + reference + ": " + e.getMessage());
                                                throw new RuntimeException(
                                                                "Failed to check/create item: " + e.getMessage());
                                        }

                                        // --- STEP 2: Create the Item Vendor Link ---
                                        if (itemExistsOrCreated) {
                                                try {
                                                        com.fasterxml.jackson.databind.node.ObjectNode bcVendorLink = mapper
                                                                        .createObjectNode();
                                                        bcVendorLink.put("itemNo", reference);
                                                        bcVendorLink.put("vendorNo", vendorNumber);
                                                        bcVendorLink.put("variantCode", ""); // Empty variant
                                                        bcVendorLink.put("vendorItemNo", reference);
                                                        bcVendorLink.put("ItemDescription", designation);

                                                        // POST to the stable plexusVendorPosts API
                                                        webClient.post()
                                                                        .uri(java.net.URI.create(vendorLinkUrl))
                                                                        .header(HttpHeaders.AUTHORIZATION,
                                                                                        "Bearer " + token)
                                                                        .header(HttpHeaders.CONTENT_TYPE,
                                                                                        "application/json")
                                                                        .bodyValue(bcVendorLink.toString())
                                                                        .retrieve()
                                                                        .bodyToMono(String.class)
                                                                        .block();
                                                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                                                        String responseBody = e.getResponseBodyAsString();
                                                        System.err.println("BC API Error (HTTP " + e.getStatusCode()
                                                                        + ") for VendorLink "
                                                                        + reference + ": " + responseBody);
                                                        throw new RuntimeException("Failed to link vendor to item: "
                                                                        + responseBody);
                                                } catch (Exception e) {
                                                        System.err.println("Vendor link creation failed for "
                                                                        + reference + ": " + e.getMessage());
                                                        throw new RuntimeException("Failed to create vendor link: "
                                                                        + e.getMessage());
                                                }
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
                                top, "customer");
        }

        @GetMapping("/emises/en-cours")
        public ResponseEntity<String> getEmisesEnCours(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "(ShippingAdvice eq 'ConfirmationPartielle' or ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and status eq 'Draft' and Delivred eq 'Non' and QtyReceived eq 'Non'",
                                skip, top, "customer");
        }

        @GetMapping("/emises/traitee")
        public ResponseEntity<String> getEmisesTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "ShippingAdvice eq 'Confirmé' and QtyReceived eq 'Oui'",
                                skip, top, "customer");
        }

        @GetMapping("/validation-reception")
        public ResponseEntity<String> getValidationReception(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "ShippingAdvice eq 'Confirmé' and Delivred eq 'Oui' and QtyReceived eq 'Non' and status eq 'Draft'",
                                skip, top, "customer");
        }

        @GetMapping("/recues/non-traitee")
        public ResponseEntity<String> getRecuesNonTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request, "status eq 'Draft' and ShippingAdvice eq 'Attente'", skip,
                                top, "vendor");
        }

        @GetMapping("/recues/en-cours")
        public ResponseEntity<String> getRecuesEnCours(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "status eq 'Draft' and (ShippingAdvice eq 'ConfirmationPartielle' or ShippingAdvice eq 'Totalité' or ShippingAdvice eq 'LivraisonDispo') and Delivred ne 'Oui'",
                                skip, top, "vendor");
        }

        @GetMapping("/recues/traitee")
        public ResponseEntity<String> getRecuesTraitee(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "QtyReceived eq 'Oui' and ShippingAdvice eq 'Confirmé'",
                                skip, top, "vendor");
        }

        @GetMapping("/commandes-livree")
        public ResponseEntity<String> getCommandesLivree(HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                return getFilteredPurchaseOrders(request,
                                "ShippingAdvice eq 'Confirmé' and Delivred eq 'Oui' and QtyReceived ne 'Oui'",
                                skip, top, "vendor");
        }

        private ResponseEntity<String> getFilteredPurchaseOrders(HttpServletRequest request, String filterValue,
                        int skip, int top, String filterMode) {
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
                        }
                } else if ("vendor".equals(filterMode)) {
                        // Recues: orders the VENDOR received, filter by payToVendorNumber to map raw
                        // login IDs
                        if (vendorNo != null && !vendorNo.isEmpty()) {
                                filterValue += " and payToVendorNumber eq '" + vendorNo + "'";
                        }
                }

                if (search != null && !search.trim().isEmpty()) {
                        String cleanSearch = search.trim().replace("'", "''");
                        filterValue += " and contains(number, '" + cleanSearch + "')";
                }

                String token = tokenService.getAccessToken();
                try {
                        // URL-encode OData query values properly
                        String encodedFilter = java.net.URLEncoder.encode(filterValue, "UTF-8");

                        String orderBy = "orderDate desc";
                        if (sort != null && !sort.trim().isEmpty()) {
                                boolean isDesc = "true".equalsIgnoreCase(desc);
                                orderBy = sort.trim() + (isDesc ? " desc" : " asc");
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
                                        .block();

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
                                        .timeout(Duration.ofSeconds(20))
                                        .defaultIfEmpty("")
                                        .block();

                        log.info("Forwarded request [{} {}] - Response size: {}", method, path, response != null ? response.length() : 0);

                        return ResponseEntity.ok(response != null ? response : "");
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
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
                        if (orderId == null || orderId.isEmpty()) {
                                return ResponseEntity.badRequest().body("{\"error\": \"Missing order id\"}");
                        }

                        boolean withReclamation = rootNode.has("withReclamation")
                                        && rootNode.get("withReclamation").asBoolean();
                        String reclamationText = rootNode.has("reclamationText")
                                        ? rootNode.get("reclamationText").asText("")
                                        : "";

                        // Step 1: Get the etag
                        String orderResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        com.fasterxml.jackson.databind.JsonNode orderNode = mapper.readTree(orderResponse);
                        String etag = orderNode.has("@odata.etag") ? orderNode.get("@odata.etag").asText() : "*";

                        // Step 2: PATCH — client confirms reception
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
                                        .block();

                        // Step 3: Fetch order lines to update Qty to Receive (API 56110 logic)
                        String linesResponse = webClient.get()
                                        .uri(java.net.URI
                                                        .create(baseUrl + "/PlexuspurchaseOrders(" + orderId
                                                                        + ")/PlexuspurchaseOrderLines"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        com.fasterxml.jackson.databind.JsonNode linesNode = mapper.readTree(linesResponse);
                        com.fasterxml.jackson.databind.JsonNode linesArray = linesNode.has("value")
                                        ? linesNode.get("value")
                                        : linesNode;

                        for (com.fasterxml.jackson.databind.JsonNode lineNode : linesArray) {
                                String lineId = lineNode.has("id") ? lineNode.get("id").asText() : null;
                                double receiveQty = lineNode.has("receiveQuantity")
                                                ? lineNode.get("receiveQuantity").asDouble()
                                                : 0;
                                String lineEtag = lineNode.has("@odata.etag") ? lineNode.get("@odata.etag").asText()
                                                : "*";

                                if (lineId != null && receiveQty > 0) {
                                        com.fasterxml.jackson.databind.node.ObjectNode actionPayload = mapper
                                                        .createObjectNode();
                                        actionPayload.put("quantity", receiveQty);

                                        try {
                                                webClient.patch()
                                                                .uri(java.net.URI.create(baseUrl
                                                                                + "/PlexuspurchaseOrders(" + orderId
                                                                                + ")/PlexuspurchaseOrderLines(" + lineId
                                                                                + ")"))
                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                .header("If-Match", lineEtag)
                                                                .bodyValue("{\"receiveQuantity\": " + receiveQty + "}")
                                                                .retrieve()
                                                                .bodyToMono(String.class)
                                                                .block();

                                        } catch (Exception lineEx) {
                                        }
                                }
                        }

                        // Step 4: Validate/Post the Purchase Order Reception (API 56109 logic)
                        try {
                                webClient.post()
                                                .uri(java.net.URI.create(
                                                                baseUrl + "/PlexuspurchaseOrders(" + orderId
                                                                                + ")/Microsoft.NAV.receiveonly"))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                .bodyValue("{}")
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block();
                        } catch (Exception postEx) {
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

                        // Guard against concurrent validations for the same Order ID
                        if (!activeValidations.add(orderId)) {
                                return ResponseEntity.status(409)
                                                .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                                                .body("Validation is already in progress for this order".getBytes());
                        }

                        // Step 1: GET the order to retrieve its @odata.etag
                        String orderResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .timeout(Duration.ofSeconds(20))
                                        .block();

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
                                        .block();

                        // Step 2.1: Update Purchase Order Lines with vendor edits
                        com.fasterxml.jackson.databind.JsonNode poLinesForPatch = rootNode
                                        .has("plexuspurchaseOrderLines")
                                                        ? rootNode.get("plexuspurchaseOrderLines")
                                                        : null;
                        if (poLinesForPatch != null && poLinesForPatch.isArray()) {
                                java.util.List<com.fasterxml.jackson.databind.JsonNode> linesList = new java.util.ArrayList<>();
                                poLinesForPatch.forEach(linesList::add);

                                Flux.fromIterable(linesList)
                                                .flatMap(poLine -> {
                                                        String poLineId = poLine.has("id") ? poLine.get("id").asText() : null;
                                                        if (poLineId == null)
                                                                return reactor.core.publisher.Mono.empty();

                                                        com.fasterxml.jackson.databind.node.ObjectNode linePatch = mapper.createObjectNode();
                                                        if (poLine.has("QuantityAvailable"))
                                                                linePatch.put("QuantityAvailable", poLine.get("QuantityAvailable").asDouble());
                                                        if (poLine.has("quantity"))
                                                                linePatch.put("quantity", poLine.get("quantity").asDouble());
                                                        if (poLine.has("receiveQuantity"))
                                                                linePatch.put("receiveQuantity", poLine.get("receiveQuantity").asDouble());
                                                        if (poLine.has("directUnitCost"))
                                                                linePatch.put("directUnitCost", poLine.get("directUnitCost").asDouble());

                                                        if (poLine.has("Decision")) {
                                                                String decision = poLine.get("Decision").asText();
                                                                if ("NonDisponible".equalsIgnoreCase(decision)) {
                                                                        return webClient.delete()
                                                                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrderLines(" + poLineId + ")"))
                                                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                                        .retrieve()
                                                                                        .toBodilessEntity()
                                                                                        .timeout(Duration.ofSeconds(20))
                                                                                        .onErrorResume(e -> {
                                                                                                System.err.println("Error deleting PO line " + poLineId + ": " + e.getMessage());
                                                                                                return reactor.core.publisher.Mono.empty();
                                                                                        });
                                                                }
                                                                linePatch.put("Decision", decision);
                                                        }

                                                        if (poLine.has("OldRemplacementItemNo"))
                                                                linePatch.put("OldRemplacementItemNo", poLine.get("OldRemplacementItemNo").asText());

                                                        return webClient.patch()
                                                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrderLines(" + poLineId + ")"))
                                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                        .header("If-Match", "*")
                                                                        .bodyValue(linePatch.toString())
                                                                        .retrieve()
                                                                        .toBodilessEntity()
                                                                        .timeout(Duration.ofSeconds(20))
                                                                        .onErrorResume(e -> {
                                                                                System.err.println("Error patching PO line " + poLineId + ": " + e.getMessage());
                                                                                return reactor.core.publisher.Mono.empty();
                                                                        });
                                                })
                                                .collectList()
                                                .block();
                        }

                        // Step 2.5: Create Sales Order from Purchase Order data
                        String salesBaseUrl = baseUrl.replace("AcessPurchasesAPI", "AcessSalesAPI");
                        String salesOrderId = null;
                        String salesOrderNumber = null;
                        try {
                                String orderNumber = rootNode.has("number") ? rootNode.get("number").asText() : "";
                                String vendorName = rootNode.has("vendorName") ? rootNode.get("vendorName").asText()
                                                : "";
                                String orderDate = rootNode.has("orderDate") ? rootNode.get("orderDate").asText() : "";
                                String postingDate = rootNode.has("postingDate") ? rootNode.get("postingDate").asText()
                                                : orderDate;
                                // The PO's buyFromVendorNumber maps to a customer in BC
                                // We need to find the matching customer. For now, use vendorNumber as lookup
                                String vendorNumber = rootNode.has("payToVendorNumber")
                                                ? rootNode.get("payToVendorNumber").asText()
                                                : "";

                                // Step 2.5a: Create Sales Order Header
                                com.fasterxml.jackson.databind.node.ObjectNode salesHeader = mapper.createObjectNode();
                                // Use vendorNumber to find matching customer (e.g., F0024 -> C0024)
                                salesHeader.put("customerNumber", vendorNumber.replace("F", "C"));
                                // Use today's date for Sales Order (BC number series V-CDE requires current
                                // date)
                                String todayDate = java.time.LocalDate.now().toString(); // yyyy-MM-dd
                                salesHeader.put("orderDate", todayDate);
                                salesHeader.put("postingDate", todayDate);
                                salesHeader.put("PurchaseHeaderNoNew", orderNumber);

                                String createSalesResponse = webClient.post()
                                                .uri(java.net.URI.create(salesBaseUrl + "/PlexussalesOrders"))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                .bodyValue(salesHeader.toString())
                                                .exchangeToMono(response -> {
                                                        if (response.statusCode().isError()) {
                                                                return response.bodyToMono(String.class)
                                                                                .map(errBody -> {
                                                                                        throw new RuntimeException(
                                                                                                        "Sales Order creation failed ("
                                                                                                                        + response.statusCode()
                                                                                                                        + "): "
                                                                                                                        + errBody);
                                                                                });
                                                        }
                                                        return response.bodyToMono(String.class);
                                                })
                                                .timeout(Duration.ofSeconds(20))
                                                .block();

                                com.fasterxml.jackson.databind.JsonNode createdSalesOrder = mapper
                                                .readTree(createSalesResponse);
                                salesOrderId = createdSalesOrder.get("id").asText();
                                String salesEtag = createdSalesOrder.has("@odata.etag")
                                                ? createdSalesOrder.get("@odata.etag").asText()
                                                : "*";
                                salesOrderNumber = createdSalesOrder.get("number").asText();

                                // Step 2.5b: Create Sales Order Lines from Purchase Order Lines
                                com.fasterxml.jackson.databind.JsonNode poLines = rootNode
                                                .has("plexuspurchaseOrderLines")
                                                                ? rootNode.get("plexuspurchaseOrderLines")
                                                                : null;
                                if (poLines != null && poLines.isArray()) {
                                        java.util.List<com.fasterxml.jackson.databind.JsonNode> soLinesList = new java.util.ArrayList<>();
                                        poLines.forEach(soLinesList::add);

                                        final String finalSalesOrderId = salesOrderId;
                                        final String finalSalesBaseUrl = salesBaseUrl;

                                        Flux.fromIterable(soLinesList)
                                                        .flatMap(poLine -> {
                                                                if (poLine.has("Decision") && "NonDisponible".equalsIgnoreCase(poLine.get("Decision").asText())) {
                                                                        return reactor.core.publisher.Mono.empty();
                                                                }

                                                                com.fasterxml.jackson.databind.node.ObjectNode salesLine = mapper.createObjectNode();
                                                                salesLine.put("lineType", "Item");
                                                                if (poLine.has("lineObjectNumber"))
                                                                        salesLine.put("lineObjectNumber", poLine.get("lineObjectNumber").asText());
                                                                if (poLine.has("description"))
                                                                        salesLine.put("description", poLine.get("description").asText());
                                                                double qty = poLine.has("quantity") ? poLine.get("quantity").asDouble() : 0;
                                                                salesLine.put("quantity", qty);
                                                                if (poLine.has("directUnitCost"))
                                                                        salesLine.put("unitPrice", poLine.get("directUnitCost").asDouble());

                                                                return webClient.post()
                                                                                .uri(java.net.URI.create(finalSalesBaseUrl + "/PlexussalesOrders(" + finalSalesOrderId + ")/PlexussalesOrderLines"))
                                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                                .bodyValue(salesLine.toString())
                                                                                .retrieve()
                                                                                .bodyToMono(String.class)
                                                                                .timeout(Duration.ofSeconds(20))
                                                                                .flatMap(lineResponse -> {
                                                                                        try {
                                                                                                com.fasterxml.jackson.databind.JsonNode createdLine = mapper.readTree(lineResponse);
                                                                                                String sLineId = createdLine.get("id").asText();
                                                                                                String sLineEtag = createdLine.has("@odata.etag") ? createdLine.get("@odata.etag").asText() : "*";

                                                                                                double shipQty = poLine.has("receiveQuantity") ? poLine.get("receiveQuantity").asDouble() : qty;
                                                                                                com.fasterxml.jackson.databind.node.ObjectNode patchShip = mapper.createObjectNode();
                                                                                                patchShip.put("shipQuantity", shipQty);

                                                                                                return webClient.patch()
                                                                                                                .uri(java.net.URI.create(finalSalesBaseUrl + "/PlexussalesOrders(" + finalSalesOrderId + ")/PlexussalesOrderLines(" + sLineId + ")"))
                                                                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                                                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                                                                .header("If-Match", sLineEtag)
                                                                                                                .bodyValue(patchShip.toString())
                                                                                                                .retrieve()
                                                                                                                .toBodilessEntity()
                                                                                                                .timeout(Duration.ofSeconds(20));
                                                                                        } catch (Exception e) {
                                                                                                return reactor.core.publisher.Mono.error(e);
                                                                                        }
                                                                                })
                                                                                .onErrorResume(e -> {
                                                                                        System.err.println("Error creating/patching SO line: " + e.getMessage());
                                                                                        return reactor.core.publisher.Mono.empty();
                                                                                });
                                                        })
                                                        .collectList()
                                                        .block();
                                }

                                // Step 2.5c: Post the Sales Order (API 56105 -> Microsoft.NAV.ShipOnly)
                                try {
                                        webClient.post()
                                                        .uri(java.net.URI.create(
                                                                        salesBaseUrl + "/PlexussalesOrders("
                                                                                        + salesOrderId
                                                                                        + ")/Microsoft.NAV.ShipOnly"))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                        .bodyValue("{}")
                                                        .exchangeToMono(response -> {
                                                                if (response.statusCode().isError()) {
                                                                        return response.bodyToMono(String.class)
                                                                                        .map(errBody -> {
                                                                                                throw new RuntimeException(
                                                                                                                "ShipOnly failed ("
                                                                                                                                + response.statusCode()
                                                                                                                                + "): "
                                                                                                                                + errBody);
                                                                                        });
                                                                }
                                                                return response.bodyToMono(String.class);
                                                        })
                                                        .timeout(Duration.ofSeconds(20))
                                                        .block();
                                } catch (Exception pe) {
                                }

                        } catch (Exception salesEx) {
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

                        byte[] pdfBytes = blGeneratorService.generateBL(orderNumber, orderDate, vendorName,
                                        vendorNumber, lines);

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

                        byte[] pdfBytes = blGeneratorService.generateBL(orderNumber, orderDate, vendorName,
                                        vendorNumber, lines);

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
                        String matricule = rootNode.has("MatriculeFiscale") ? rootNode.get("MatriculeFiscale").asText()
                                        : "";
                        com.fasterxml.jackson.databind.JsonNode lines = rootNode.has("lines") ? rootNode.get("lines")
                                        : (rootNode.has("plexuspurchaseOrderLines")
                                                        ? rootNode.get("plexuspurchaseOrderLines")
                                                        : null);

                        byte[] pdfBytes = devisGeneratorService.generateDevis(orderNumber, orderDate, vendorName,
                                        vendorNumber, vendorAddress, matricule, lines);

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
}
