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
        private final com.plexus.backend.service.PriceHistoryService priceHistoryService;
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
                        FactureGeneratorService factureGeneratorService,
                        com.plexus.backend.service.PriceHistoryService priceHistoryService) {
                this.webClient = webClient;
                this.tokenService = tokenService;
                this.blGeneratorService = blGeneratorService;
                this.devisGeneratorService = devisGeneratorService;
                this.factureGeneratorService = factureGeneratorService;
                this.priceHistoryService = priceHistoryService;
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

                        try {
                                com.fasterxml.jackson.databind.node.ObjectNode metadataPatch = mapper
                                                .createObjectNode();
                                boolean hasMetadata = false;
                                if (savedInsuredName != null && !savedInsuredName.isEmpty()) {
                                         String poInsuredName = "";
                                         if (savedInsuredName.contains(" / ")) {
                                                 String[] nameParts = savedInsuredName.split(" / ");
                                                 if (nameParts.length > 1) {
                                                         poInsuredName = nameParts[1];
                                                 }
                                         } else if (!savedInsuredName.startsWith("PEC") && !savedInsuredName.startsWith("PEOC")) {
                                                 poInsuredName = savedInsuredName;
                                         }

                                         if (poInsuredName != null && !poInsuredName.isEmpty()) {
                                                 metadataPatch.put("InsuredName", poInsuredName);
                                                 hasMetadata = true;
                                         }
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
                        int index = baseUrl.indexOf("/api/NEL/AcessPurchasesAPI/v2.0");
                        String odataUrl;
                        if (index != -1) {
                                String base = baseUrl.substring(0, index);
                                odataUrl = base + "/ODataV4/Company('" + companyId + "')/workflowVendors";
                        } else {
                                odataUrl = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0/companies(", "/ODataV4/Company('")
                                                .replace(")", "')/workflowVendors");
                        }

                        String finalUrl = odataUrl;
                        if (request.getQueryString() != null && !request.getQueryString().isEmpty()) {
                                finalUrl += "?" + request.getQueryString();
                        }

                        String response = webClient.get()
                                        .uri(java.net.URI.create(finalUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        // Parse response and map searchName to displayName
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(response);
                        com.fasterxml.jackson.databind.node.ObjectNode resultNode = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arrayNode = mapper.createArrayNode();

                        if (rootNode.has("value") && rootNode.get("value").isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode vendorNode : rootNode.get("value")) {
                                        com.fasterxml.jackson.databind.node.ObjectNode mappedVendor = mapper.createObjectNode();

                                        String number = vendorNode.has("number") ? vendorNode.get("number").asText() : "";
                                        String name = vendorNode.has("name") ? vendorNode.get("name").asText() : "";
                                        String searchName = vendorNode.has("searchName") ? vendorNode.get("searchName").asText() : "";
                                        String id = vendorNode.has("id") ? vendorNode.get("id").asText() : "";

                                        // Fallback: use searchName (trimmed) if present and not empty, otherwise name
                                        String finalDisplayName = (searchName != null && !searchName.trim().isEmpty())
                                                        ? searchName.trim()
                                                        : name;

                                        mappedVendor.put("id", id);
                                        mappedVendor.put("number", number);
                                        mappedVendor.put("displayName", finalDisplayName);
                                        mappedVendor.put("name", name);
                                        mappedVendor.put("searchName", searchName);

                                        if (vendorNode.has("address")) mappedVendor.put("addressLine1", vendorNode.get("address").asText());
                                        if (vendorNode.has("phoneNumber")) mappedVendor.put("phoneNumber", vendorNode.get("phoneNumber").asText());
                                        if (vendorNode.has("eMail")) mappedVendor.put("email", vendorNode.get("eMail").asText());

                                        arrayNode.add(mappedVendor);
                                }
                        }
                        resultNode.set("value", arrayNode);
                        return ResponseEntity.ok(mapper.writeValueAsString(resultNode));
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

        // ==================== DASHBOARD (admin C0082) ====================
        // Thin proxy to the BC "plexusDashboardCues" API page (AcessSystemAPI, via tarekSystemUrl).
        // Its OnAfterGetRecord runs PlexusCueRefreshMgt.RefreshAllCues(dateFilter), which computes
        // EVERY KPI in BC: pipeline counts by ghost ShippingAdvice (Totalité+LivraisonDispo=ferme,
        // Confirmé=réceptionnées, etc.) and all money (caAnnuel, achatsAnnuel, factures, yearly)
        // from POSTED Customer/Vendor Ledger entries — so unposted or erroneous orders never poison
        // the totals. The page already returns {"value":[{...}]} with the exact field names the
        // front expects (it reads value[0]), so we return its body verbatim.
        // dateFilter is an Edm.String FlowFilter → pass the BC range literal 'start..end'.
        @GetMapping("/dashboard/stats")
        public ResponseEntity<String> getDashboardStats(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                String token = tokenService.getAccessToken();
                try {
                        String dateFilter = "dateFilter eq '" + startDate + ".." + endDate + "'";
                        String url = tarekSystemUrl + "/plexusDashboardCues"
                                        + "?$filter=" + java.net.URLEncoder.encode(dateFilter, "UTF-8");
                        String response = webClient.get()
                                        .uri(java.net.URI.create(url))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(90));
                        return ResponseEntity.ok(response);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching dashboard stats: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching dashboard stats: " + e.getMessage());
                }
        }

        // Top Clients / Fournisseurs — proxy the BC plexusCustomers / plexusVendors API pages.
        // Their Sales/Purchases (LCY) FlowFields are scoped by the dateFilter FlowFilter (same
        // pattern as the cue). The front sorts + slices client-side, so we return the rows as-is.
        @GetMapping("/dashboard/top-customers")
        public ResponseEntity<String> getTopCustomers(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                return proxyDashboardEntity("plexusCustomers", startDate, endDate);
        }

        @GetMapping("/dashboard/top-vendors")
        public ResponseEntity<String> getTopVendors(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                return proxyDashboardEntity("plexusVendors", startDate, endDate);
        }

        // GET a plexus* AcessSystemAPI entity scoped by the dateFilter FlowFilter; return body as-is.
        private ResponseEntity<String> proxyDashboardEntity(String entitySet, String startDate, String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();
                String token = tokenService.getAccessToken();
                try {
                        String dateFilter = "dateFilter eq '" + startDate + ".." + endDate + "'";
                        String url = tarekSystemUrl + "/" + entitySet
                                        + "?$filter=" + java.net.URLEncoder.encode(dateFilter, "UTF-8");
                        String response = webClient.get()
                                        .uri(java.net.URI.create(url))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(90));
                        return ResponseEntity.ok(response);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching " + entitySet + ": " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching " + entitySet + ": " + e.getMessage());
                }
        }

        // Série journalière ventes / achats facturés — alimente les courbes "Cash Flow" et
        // "Trends" du dashboard, qui affichaient jusqu'ici une répartition inventée (poids codés
        // en dur côté front) sous un total exact.
        //
        // Les deux AL queries somment EXACTEMENT les champs que somme la cue — Cust. Ledger Entry
        // "Sales (LCY)" et Vendor Ledger Entry "Purchase (LCY)" — donc les courbes se totalisent
        // sur les cartes "Ventes/Achats Facturés" par construction. On renvoie le grain jour
        // (une ligne par date active) et le front regroupe en jours/semaines/mois/années selon la
        // plage choisie : {"value":[{"date":"2026-01-07","sales":3362.3,"purchases":0}, ...]}.
        //
        // RAPPEL : ventes et achats d'une même commande sont facturés à 1–2 mois d'écart. Ces deux
        // séries restent donc non appariées — leur écart n'est pas une marge (cf. la carte
        // "Écart de Facturation" côté front).
        @GetMapping("/dashboard/daily-series")
        public ResponseEntity<String> getDashboardDailySeries(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String token = tokenService.getAccessToken();
                try {
                        String filter = "postingDate ge " + startDate + " and postingDate le " + endDate;

                        // date -> [ventes, achats]
                        java.util.TreeMap<String, double[]> byDay = new java.util.TreeMap<>();
                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusSalesDaily", filter,
                                        mapper, token)) {
                                String d = jtxt(row, "postingDate");
                                if (d.isEmpty())
                                        continue;
                                byDay.computeIfAbsent(d.substring(0, 10), k -> new double[2])[0] += jnum(row, "salesLCY");
                        }
                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusPurchDaily", filter,
                                        mapper, token)) {
                                String d = jtxt(row, "postingDate");
                                if (d.isEmpty())
                                        continue;
                                // Côté fournisseur "Purchase (LCY)" est négatif : on inverse le signe
                                // de façon UNIFORME, on ne prend pas la valeur absolue jour par jour.
                                // Sur 2026, 9 jours sur 86 sont nets positifs (avoirs > factures) ; les
                                // passer en absolu gonflait la courbe de 9 660 DT et la faisait diverger
                                // de la carte "Achats Facturés". Inversés, les 86 jours totalisent
                                // exactement les 916 288,841 DT de la cue, avoirs déduits.
                                byDay.computeIfAbsent(d.substring(0, 10), k -> new double[2])[1] -= jnum(row,
                                                "purchaseLCY");
                        }

                        com.fasterxml.jackson.databind.node.ObjectNode result = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = result.putArray("value");
                        for (java.util.Map.Entry<String, double[]> e : byDay.entrySet()) {
                                com.fasterxml.jackson.databind.node.ObjectNode n = arr.addObject();
                                n.put("date", e.getKey());
                                n.put("sales", e.getValue()[0]);
                                n.put("purchases", e.getValue()[1]);
                        }
                        return ResponseEntity.ok(mapper.writeValueAsString(result));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching daily series: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching daily series: " + e.getMessage());
                }
        }

        // Marge commerciale — écart de remise entre la vente et l'achat du MÊME dossier.
        //
        // Le métier fonctionne sur un tarif catalogue unique : on vend la pièce à -15 % et on
        // l'achète à -18 % chez le fournisseur, le gain est l'écart des deux remises. La marge se
        // lit donc directement sur les documents, en rapprochant chaque facture vente de sa
        // commande achat — sans jamais passer par le coût de stock.
        //
        //   marge = Σ lignes ARTICLE de la facture vente − Σ lignes ARTICLE de la commande achat
        //
        // Exemple validé (FVE26/0759 <-> CA26/1996, tarif de base identique des deux côtés) :
        // 4 785,579 − 4 616,677 = 168,902 DT, soit 3,53 % = (0,85 − 0,82) / 0,85.
        // Le taux varie beaucoup selon la marque (remises d'achat de 0 % à 23 %), d'où une
        // moyenne de portefeuille autour de 7-8 % confirmée par le métier.
        //
        // Pourquoi cette méthode a remplacé le calcul par coût de stock : le grand livre article
        // est inexploitable sur une partie de l'année — 478 k DT de ventes 2026 y sont typées
        // "Achat" au lieu de "Vente" (janvier, février, une partie de mars et de mai), ce qui
        // plafonnait la couverture à 65 % du CA. Le rapprochement documentaire, lui, ne dépend
        // pas du stock et couvre toutes les factures.
        //
        // Le lien facture -> commande achat n'existe dans aucune API standard (orderNumber est
        // vide sur les factures, et la chaîne facture -> BL -> commande vente -> ghost 52120 se
        // lit uniquement par RecRef) : c'est la page AL "plexusSalesMargin" qui le résout.
        @GetMapping("/dashboard/margin")
        public ResponseEntity<String> getDashboardMargin(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String token = tokenService.getAccessToken();
                try {
                        // postingDate est ici un vrai champ de page (pas un filter() de query) : il
                        // garde son nom, sans suffixe _FilterOnly.
                        String periodFilter = "postingDate ge " + startDate + " and postingDate le " + endDate;

                        double coveredRevenue = 0, cogs = 0, uncoveredRevenue = 0;
                        int invoicesCovered = 0, invoicesTotal = 0;
                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusSalesMargin",
                                        periodFilter, mapper, token)) {
                                double sales = jnum(row, "salesAmount");
                                if (sales == 0)
                                        continue;
                                invoicesTotal++;
                                // On compare matchedSalesAmount à purchaseAmount : ces deux montants
                                // portent sur les MÊMES lignes. salesAmount inclut en plus les lignes
                                // vendues sans contrepartie dans la commande achat ; les compter au
                                // numérateur sans coût au dénominateur inventerait de la marge.
                                double matchedSales = jnum(row, "matchedSalesAmount");
                                double purchase = jnum(row, "purchaseAmount");
                                if (matchedSales > 0 && purchase > 0) {
                                        coveredRevenue += matchedSales;
                                        cogs += purchase;
                                        invoicesCovered++;
                                }
                                // le reste de la facture (aucune commande achat rattachée, ou lignes
                                // sans équivalent à l'achat) est signalé, jamais estimé
                                uncoveredRevenue += (sales - matchedSales);
                        }

                        // AVOIRS — sans eux la marge est surestimée de plus d'un quart (mesuré sur
                        // 2026 : 43 791 DT de retours et 6 494 DT de RRR contre 23 486 DT de marge).
                        //   retour marchandise -> la vente ET son coût s'annulent
                        //   RRR / geste commercial -> aucune marchandise ne revient, le coût reste
                        //     acquis, donc déduction directe de la marge
                        double creditsReturned = 0, creditsCostBack = 0, creditsOther = 0;
                        int creditNotes = 0;
                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusCrMemoMargin",
                                        periodFilter, mapper, token)) {
                                creditNotes++;
                                creditsReturned += jnum(row, "matchedCreditAmount");
                                creditsCostBack += jnum(row, "purchaseAmount");
                                creditsOther += jnum(row, "otherAmount");
                        }
                        coveredRevenue -= (creditsReturned + creditsOther);
                        cogs -= creditsCostBack;

                        // AVOIRS FOURNISSEUR — seulement la part NON rattachable à un article.
                        // Les lignes article des avoirs fournisseur sont déjà déduites du coût
                        // unitaire par "PLX Margin Cost Mgt" (net commande + article) ; les
                        // redéduire ici serait un double comptage. Restent les RRR obtenus, qui
                        // n'ont pas d'article : ils réduisent le coût global, exact pendant des
                        // RRR accordés aux clients côté vente.
                        double vendorRebates = 0;
                        int vendorCreditNotes = 0;
                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusPurchCrMemos",
                                        periodFilter, mapper, token)) {
                                vendorCreditNotes++;
                                vendorRebates += jnum(row, "otherAmount");
                        }
                        cogs -= vendorRebates;

                        double margin = coveredRevenue - cogs;
                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        out.put("available", invoicesTotal > 0);
                        out.put("startDate", startDate);
                        out.put("endDate", endDate);
                        out.put("coveredRevenue", coveredRevenue);
                        out.put("cogs", cogs);
                        out.put("margin", margin);
                        out.put("marginRate", coveredRevenue != 0 ? (margin / coveredRevenue) * 100 : 0);
                        out.put("uncoveredRevenue", uncoveredRevenue);
                        out.put("invoicesCovered", invoicesCovered);
                        out.put("invoicesTotal", invoicesTotal);
                        out.put("creditNotes", creditNotes);
                        out.put("creditsReturned", creditsReturned);
                        out.put("creditsOther", creditsOther);
                        // exposé pour que l'export Excel puisse refaire la réconciliation complète
                        out.put("creditsCostBack", creditsCostBack);
                        out.put("vendorCreditNotes", vendorCreditNotes);
                        out.put("vendorRebates", vendorRebates);
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error computing margin: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error computing margin: " + e.getMessage());
                }
        }

        // Série journalière APPARIÉE : pour chaque jour, le CA des factures rapprochées et le coût
        // d'achat des mêmes dossiers. Contrairement à /daily-series (ventes et achats facturés,
        // décalés de 1 à 2 mois et sans rapport entre eux), les deux courbes portent ici sur les
        // mêmes affaires : l'écart entre elles EST la marge.
        //
        // Les avoirs sont déduits à leur propre date, des deux côtés, pour que la somme de la
        // série retombe exactement sur la carte marge.
        @GetMapping("/dashboard/margin-series")
        public ResponseEntity<String> getDashboardMarginSeries(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String token = tokenService.getAccessToken();
                try {
                        String filter = "postingDate ge " + startDate + " and postingDate le " + endDate;
                        // date -> [ventes appariées, coût apparié]
                        java.util.TreeMap<String, double[]> byDay = new java.util.TreeMap<>();

                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusSalesMargin", filter,
                                        mapper, token)) {
                                double matchedSales = jnum(row, "matchedSalesAmount");
                                double purchase = jnum(row, "purchaseAmount");
                                if (matchedSales == 0 && purchase == 0)
                                        continue;
                                String d = jtxt(row, "postingDate");
                                if (d.isEmpty())
                                        continue;
                                double[] acc = byDay.computeIfAbsent(d.substring(0, 10), k -> new double[2]);
                                acc[0] += matchedSales;
                                acc[1] += purchase;
                        }

                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusCrMemoMargin", filter,
                                        mapper, token)) {
                                String d = jtxt(row, "postingDate");
                                if (d.isEmpty())
                                        continue;
                                double[] acc = byDay.computeIfAbsent(d.substring(0, 10), k -> new double[2]);
                                acc[0] -= (jnum(row, "matchedCreditAmount") + jnum(row, "otherAmount"));
                                acc[1] -= jnum(row, "purchaseAmount");
                        }

                        for (com.fasterxml.jackson.databind.JsonNode row : fetchAllRows("plexusPurchCrMemos", filter,
                                        mapper, token)) {
                                String d = jtxt(row, "postingDate");
                                if (d.isEmpty())
                                        continue;
                                // RRR obtenus seulement : les lignes article sont déjà nettes du coût
                                byDay.computeIfAbsent(d.substring(0, 10), k -> new double[2])[1] -= jnum(row,
                                                "otherAmount");
                        }

                        com.fasterxml.jackson.databind.node.ObjectNode result = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = result.putArray("value");
                        for (java.util.Map.Entry<String, double[]> e : byDay.entrySet()) {
                                com.fasterxml.jackson.databind.node.ObjectNode n = arr.addObject();
                                n.put("date", e.getKey());
                                n.put("sales", e.getValue()[0]);
                                n.put("purchases", e.getValue()[1]);
                        }
                        return ResponseEntity.ok(mapper.writeValueAsString(result));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching margin series: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching margin series: " + e.getMessage());
                }
        }

        // Détail ligne à ligne de la marge, pour export Excel et confrontation avec la compta.
        // Une ligne par article facturé, tarif catalogue + remise vente d'un côté, prix
        // fournisseur + remise achat de l'autre. costSource indique si le coût vient d'une
        // facture fournisseur (définitif) ou du prix de commande (provisoire).
        @GetMapping("/dashboard/margin-lines")
        public ResponseEntity<String> getDashboardMarginLines(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        String filter = "postingDate ge " + startDate + " and postingDate le " + endDate;
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> rows = fetchAllRows(
                                        "plexusMarginLines", filter, mapper, tokenService.getAccessToken());
                        com.fasterxml.jackson.databind.node.ObjectNode result = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = result.putArray("value");
                        rows.forEach(arr::add);
                        return ResponseEntity.ok(mapper.writeValueAsString(result));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching margin lines: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching margin lines: " + e.getMessage());
                }
        }

        // Top Articles / Marques — aggregate the flat plexusExportOrderLines query (one row per
        // purchase line: itemNo/description/quantity/lineAmount/brand) over the order-date range.
        // Indicateur "Commandé vs Facturé" : sur la période (Order Date), combien de ce qui a
        // été commandé a réellement été réceptionné puis facturé par le fournisseur.
        // Les commandes annulées sont exclues : elles ne sont pas un manque à facturer.
        // Les montants sont ceux des lignes (Amount, net de remise), proratisés par le rapport
        // quantité réceptionnée / facturée sur quantité commandée.
        @GetMapping("/dashboard/commande-vs-facture")
        public ResponseEntity<String> getCommandeVsFacture(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        String filter = "shippingAdvice ne 'Annulation' and orderDate ge " + startDate
                                        + " and orderDate le " + endDate;
                        String next = tarekSystemUrl + "/plexusExportOrderLines"
                                        + "?$filter=" + java.net.URLEncoder.encode(filter, "UTF-8");

                        double ordered = 0, received = 0, invoiced = 0;
                        int lines = 0, linesNotInvoiced = 0;
                        // Les colonnes quantityReceived/quantityInvoiced n'existent qu'à partir de
                        // l'extension AL 1.1.1.456 : sans elles, tout paraîtrait "0 % facturé".
                        boolean columnsAvailable = false;
                        java.util.Set<String> orders = new java.util.HashSet<>();
                        java.util.Set<String> ordersFullyInvoiced = new java.util.HashSet<>();
                        java.util.Set<String> ordersPartial = new java.util.HashSet<>();
                        int pages = 0;
                        while (next != null && pages < 300) {
                                final String pageUrl = next;
                                String body = webClient.get()
                                                .uri(java.net.URI.create(pageUrl))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(180));
                                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(body);
                                com.fasterxml.jackson.databind.JsonNode value = root.get("value");
                                if (value != null && value.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode l : value) {
                                                if (l.has("quantityInvoiced"))
                                                        columnsAvailable = true;
                                                double qty = jnum(l, "quantity");
                                                double amount = jnum(l, "lineAmount");
                                                if (qty == 0 || amount == 0)
                                                        continue;
                                                double qtyRec = jnum(l, "quantityReceived");
                                                double qtyInv = jnum(l, "quantityInvoiced");
                                                double unit = amount / qty;

                                                ordered += amount;
                                                received += qtyRec * unit;
                                                invoiced += qtyInv * unit;
                                                lines++;

                                                String orderNo = jtxt(l, "number");
                                                if (!orderNo.isEmpty()) {
                                                        orders.add(orderNo);
                                                        if (qtyInv <= 0)
                                                                ordersPartial.add(orderNo);
                                                        else
                                                                ordersFullyInvoiced.add(orderNo);
                                                }
                                                if (qtyInv <= 0)
                                                        linesNotInvoiced++;
                                        }
                                }
                                com.fasterxml.jackson.databind.JsonNode nl = root.get("@odata.nextLink");
                                next = (nl != null && !nl.isNull()) ? nl.asText() : null;
                                pages++;
                        }

                        // Une commande est "partielle" si elle a au moins une ligne facturée ET une non facturée
                        ordersPartial.retainAll(ordersFullyInvoiced);

                        if (!columnsAvailable && lines > 0) {
                                log.warn("commande-vs-facture: colonnes quantityReceived/quantityInvoiced absentes "
                                                + "du flux — publier l'extension AL 1.1.1.456+");
                        }

                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        out.put("available", columnsAvailable);
                        out.put("startDate", startDate);
                        out.put("endDate", endDate);
                        out.put("ordered", ordered);
                        out.put("received", received);
                        out.put("invoiced", invoiced);
                        out.put("notInvoiced", ordered - invoiced);
                        out.put("pctReceived", ordered > 0 ? (received / ordered) * 100 : 0);
                        out.put("pctInvoiced", ordered > 0 ? (invoiced / ordered) * 100 : 0);
                        out.put("orders", orders.size());
                        out.put("lines", lines);
                        out.put("linesNotInvoiced", linesNotInvoiced);
                        out.put("ordersPartiallyInvoiced", ordersPartial.size());
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        log.error("BC error on commande-vs-facture: {}", e.getResponseBodyAsString());
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        log.error("Error on commande-vs-facture: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        @GetMapping("/dashboard/top-articles")
        public ResponseEntity<String> getTopArticles(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "status", required = false) String status,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "20") int top) {
                return topLines(startDate, endDate, false, status, top);
        }

        @GetMapping("/dashboard/top-marques")
        public ResponseEntity<String> getTopMarques(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "status", required = false) String status,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "20") int top) {
                return topLines(startDate, endDate, true, status, top);
        }

        // Mappe la clé de statut du dashboard vers la (ou les) valeur(s) ghost ShippingAdvice.
        // "Fermes" = commandes validées (Totalité + LivraisonDispo), même convention que /export-data.
        private String shippingAdviceFilter(String status) {
                if (status == null || status.isEmpty())
                        return "";
                switch (status) {
                        case "Attente":
                                return "shippingAdvice eq 'Attente'";
                        case "ConfirmationPartielle":
                                return "shippingAdvice eq 'ConfirmationPartielle'";
                        case "Fermes":
                                return "(shippingAdvice eq 'Totalité' or shippingAdvice eq 'LivraisonDispo')";
                        case "Confirme":
                                return "shippingAdvice eq 'Confirmé'";
                        // Commandes validées = confirmées par le fournisseur, hors attente et annulation
                        case "Validees":
                                return "(shippingAdvice eq 'Confirmé' or shippingAdvice eq 'Totalité' or shippingAdvice eq 'LivraisonDispo')";
                        case "Annulation":
                                return "shippingAdvice eq 'Annulation'";
                        default:
                                return "";
                }
        }

        private ResponseEntity<String> topLines(String startDate, String endDate, boolean byBrand, String status,
                        int top) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();
                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        String filter = "orderDate ge " + startDate + " and orderDate le " + endDate;
                        String shippingFilter = shippingAdviceFilter(status);
                        if (!shippingFilter.isEmpty())
                                filter = shippingFilter + " and " + filter;
                        String url = tarekSystemUrl + "/plexusExportOrderLines"
                                        + "?$filter=" + java.net.URLEncoder.encode(filter, "UTF-8");
                        java.util.Map<String, double[]> agg = new java.util.LinkedHashMap<>(); // key -> [amount, qty]
                        java.util.Map<String, String> desc = new java.util.HashMap<>();
                        // Groupe remise de l'article = Item."Item Disc. Group", exposé comme "brand"
                        // par la query plexusExportOrderLines.
                        java.util.Map<String, String> discGroup = new java.util.HashMap<>();
                        String next = url;
                        int pages = 0;
                        while (next != null && pages < 200) {
                                final String pageUrl = next;
                                String body = webClient.get()
                                                .uri(java.net.URI.create(pageUrl))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(120));
                                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(body);
                                com.fasterxml.jackson.databind.JsonNode value = root.get("value");
                                if (value != null && value.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode l : value) {
                                                String key = byBrand
                                                                ? (l.hasNonNull("brand") ? l.get("brand").asText().trim() : "")
                                                                : (l.hasNonNull("itemNo") ? l.get("itemNo").asText().trim() : "");
                                                if (key.isEmpty())
                                                        continue;
                                                double amt = l.hasNonNull("lineAmount") ? l.get("lineAmount").asDouble() : 0;
                                                double qty = l.hasNonNull("quantity") ? l.get("quantity").asDouble() : 0;
                                                double[] a = agg.computeIfAbsent(key, k -> new double[2]);
                                                a[0] += amt;
                                                a[1] += qty;
                                                if (!byBrand && !desc.containsKey(key) && l.hasNonNull("description"))
                                                        desc.put(key, l.get("description").asText());
                                                if (!byBrand && !discGroup.containsKey(key) && l.hasNonNull("brand")) {
                                                        String group = l.get("brand").asText().trim();
                                                        if (!group.isEmpty())
                                                                discGroup.put(key, group);
                                                }
                                        }
                                }
                                com.fasterxml.jackson.databind.JsonNode nl = root.get("@odata.nextLink");
                                next = (nl != null && !nl.isNull()) ? nl.asText() : null;
                                pages++;
                        }
                        // Libellés des groupes remise (PC → PEUGEOT CITROEN...). Référentiel court,
                        // chargé une fois par appel. Absent tant que l'extension AL n'est pas publiée :
                        // dans ce cas on garde le code seul plutôt que de faire échouer le dashboard.
                        java.util.Map<String, String> groupNames = new java.util.HashMap<>();
                        {
                                try {
                                        String refUrl = tarekSystemUrl + "/plexusItemDiscountGroups";
                                        String refBody = webClient.get()
                                                        .uri(java.net.URI.create(refUrl))
                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                        .retrieve()
                                                        .bodyToMono(String.class)
                                                        .block(Duration.ofSeconds(30));
                                        com.fasterxml.jackson.databind.JsonNode refValue = mapper.readTree(refBody)
                                                        .get("value");
                                        if (refValue != null && refValue.isArray())
                                                for (com.fasterxml.jackson.databind.JsonNode g : refValue) {
                                                        String code = jtxt(g, "code").trim();
                                                        String label = jtxt(g, "description").trim();
                                                        if (!code.isEmpty() && !label.isEmpty())
                                                                groupNames.put(code, label);
                                                }
                                } catch (Exception ex) {
                                        log.warn("Item discount group labels unavailable ({}): falling back to codes",
                                                        ex.getMessage());
                                }
                        }

                        // Écarte les articles sans montant sur la période : lignes jamais valorisées
                        // par le fournisseur, ou vidées (quantité remise à 0) au traitement des
                        // commandes reçues. Elles ne pèsent ni en CA ni en prix et polluaient le
                        // classement comme l'export (~1 % des articles).
                        int excludedZero = 0;
                        java.util.Iterator<java.util.Map.Entry<String, double[]>> it = agg.entrySet().iterator();
                        while (it.hasNext()) {
                                java.util.Map.Entry<String, double[]> e = it.next();
                                if (Math.abs(e.getValue()[0]) < 0.0005) {
                                        it.remove();
                                        excludedZero++;
                                }
                        }
                        if (excludedZero > 0)
                                log.info("topLines: {} article(s) sans montant écarté(s) sur la période {} → {}",
                                                excludedZero, startDate, endDate);

                        // top <= 0 : aucun plafond, on renvoie tous les articles agrégés (export Excel).
                        boolean all = top <= 0;
                        int limit = all ? 0 : Math.min(top, 500);
                        java.util.List<java.util.Map.Entry<String, double[]>> entries = new java.util.ArrayList<>(agg.entrySet());

                        // Le front classe côté client selon l'onglet actif (quantité ou CA) : on renvoie
                        // donc l'union du top N par montant ET du top N par quantité, sinon le classement
                        // par quantité serait tronqué par celui du montant.
                        java.util.LinkedHashSet<String> keep = new java.util.LinkedHashSet<>();
                        if (!all) {
                                entries.sort((x, y) -> Double.compare(y.getValue()[0], x.getValue()[0]));
                                for (int i = 0; i < entries.size() && i < limit; i++)
                                        keep.add(entries.get(i).getKey());
                                entries.sort((x, y) -> Double.compare(y.getValue()[1], x.getValue()[1]));
                                for (int i = 0; i < entries.size() && i < limit; i++)
                                        keep.add(entries.get(i).getKey());
                        }

                        entries.sort((x, y) -> Double.compare(y.getValue()[0], x.getValue()[0]));
                        com.fasterxml.jackson.databind.node.ObjectNode wrapper = mapper.createObjectNode();
                        wrapper.put("excludedZeroAmount", excludedZero);
                        com.fasterxml.jackson.databind.node.ArrayNode arr = wrapper.putArray("value");
                        for (int i = 0; i < entries.size(); i++) {
                                java.util.Map.Entry<String, double[]> e = entries.get(i);
                                if (!all && !keep.contains(e.getKey()))
                                        continue;
                                com.fasterxml.jackson.databind.node.ObjectNode o = arr.addObject();
                                if (byBrand) {
                                        o.put("brand", e.getKey());
                                        o.put("brandName", groupNames.getOrDefault(e.getKey(), ""));
                                } else {
                                        o.put("number", e.getKey());
                                        o.put("description", desc.getOrDefault(e.getKey(), ""));
                                        String group = discGroup.getOrDefault(e.getKey(), "");
                                        o.put("discountGroup", group);
                                        o.put("discountGroupName", groupNames.getOrDefault(group, ""));
                                        // PU moyen pondéré = montant total / quantité totale. Le flux
                                        // n'expose pas de prix unitaire ; Amount étant net de remise,
                                        // c'est le prix réellement payé sur la période.
                                        double qtyTot = Math.abs(e.getValue()[1]);
                                        o.put("unitPrice", qtyTot > 0 ? Math.abs(e.getValue()[0]) / qtyTot : 0.0);
                                }
                                o.put("purchasesLCY", e.getValue()[0]);
                                o.put("purchasesQty", e.getValue()[1]);
                        }
                        return ResponseEntity.ok(mapper.writeValueAsString(wrapper));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching top lines: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching top lines: " + e.getMessage());
                }
        }

        // Excel export drill-down — flat plexusExportOrderLines grouped BY ORDER, filtered by the
        // dashboard statusKey (mapped to BC ghost ShippingAdvice) + order-date range. The front
        // expects a BARE JSON ARRAY of orders, each with a nested lines[] (it builds the .xlsx
        // client-side, one row per line). totalAmount is the header amount the dashboard sums.
        @GetMapping("/export-data")
        public ResponseEntity<String> getExportData(
                        @org.springframework.web.bind.annotation.RequestParam(name = "status", required = false) String status,
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();

                // Map the dashboard statusKey to the BC ghost ShippingAdvice value(s).
                String shippingFilter = "";
                if (status != null && !status.isEmpty()) {
                        switch (status) {
                                case "Attente":
                                        shippingFilter = "shippingAdvice eq 'Attente'";
                                        break;
                                case "ConfirmationPartielle":
                                        shippingFilter = "shippingAdvice eq 'ConfirmationPartielle'";
                                        break;
                                case "Fermes":
                                        shippingFilter = "(shippingAdvice eq 'Totalité' or shippingAdvice eq 'LivraisonDispo')";
                                        break;
                                case "Confirme":
                                        shippingFilter = "shippingAdvice eq 'Confirmé'";
                                        break;
                                case "Annulation":
                                        shippingFilter = "shippingAdvice eq 'Annulation'";
                                        break;
                                default:
                                        shippingFilter = "";
                                        break;
                        }
                }
                String filter = "orderDate ge " + startDate + " and orderDate le " + endDate;
                if (!shippingFilter.isEmpty())
                        filter = shippingFilter + " and " + filter;

                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        String url = tarekSystemUrl + "/plexusExportOrderLines"
                                        + "?$filter=" + java.net.URLEncoder.encode(filter, "UTF-8");
                        java.util.Map<String, com.fasterxml.jackson.databind.node.ObjectNode> orders = new java.util.LinkedHashMap<>();
                        String next = url;
                        int pages = 0;
                        while (next != null && pages < 300) {
                                final String pageUrl = next;
                                String body = webClient.get()
                                                .uri(java.net.URI.create(pageUrl))
                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                                .retrieve()
                                                .bodyToMono(String.class)
                                                .block(Duration.ofSeconds(180));
                                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(body);
                                com.fasterxml.jackson.databind.JsonNode value = root.get("value");
                                if (value != null && value.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode row : value) {
                                                String num = row.hasNonNull("number") ? row.get("number").asText() : "";
                                                com.fasterxml.jackson.databind.node.ObjectNode order = orders.get(num);
                                                if (order == null) {
                                                        order = mapper.createObjectNode();
                                                        order.put("number", num);
                                                        order.put("totalAmount", row.hasNonNull("totalAmount") ? row.get("totalAmount").asDouble() : 0);
                                                        order.put("shippingAdvice", row.hasNonNull("shippingAdvice") ? row.get("shippingAdvice").asText() : "");
                                                        order.put("cancellationReason", row.hasNonNull("causeOfCancellation") ? row.get("causeOfCancellation").asText() : "");
                                                        order.put("clientName", row.hasNonNull("clientName") ? row.get("clientName").asText() : "");
                                                        order.put("orderDate", row.hasNonNull("orderDate") ? row.get("orderDate").asText() : "");
                                                        order.put("insuranceName", row.hasNonNull("insuranceName") ? row.get("insuranceName").asText() : "");
                                                        order.putArray("lines");
                                                        orders.put(num, order);
                                                }
                                                com.fasterxml.jackson.databind.node.ArrayNode lineArr = (com.fasterxml.jackson.databind.node.ArrayNode) order.get("lines");
                                                com.fasterxml.jackson.databind.node.ObjectNode line = lineArr.addObject();
                                                line.put("lineObjectNumber", row.hasNonNull("itemNo") ? row.get("itemNo").asText() : "");
                                                line.put("description", row.hasNonNull("description") ? row.get("description").asText() : "");
                                                line.put("quantity", row.hasNonNull("quantity") ? row.get("quantity").asDouble() : 0);
                                                line.put("amountExcludingTax", row.hasNonNull("lineAmount") ? row.get("lineAmount").asDouble() : 0);
                                                line.put("brand", row.hasNonNull("brand") ? row.get("brand").asText() : "");
                                        }
                                }
                                com.fasterxml.jackson.databind.JsonNode nl = root.get("@odata.nextLink");
                                next = (nl != null && !nl.isNull()) ? nl.asText() : null;
                                pages++;
                        }
                        com.fasterxml.jackson.databind.node.ArrayNode result = mapper.createArrayNode();
                        for (com.fasterxml.jackson.databind.node.ObjectNode o : orders.values())
                                result.add(o);
                        return ResponseEntity.ok(mapper.writeValueAsString(result));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error exporting data: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error exporting data: " + e.getMessage());
                }
        }

        // ==================== INSURANCE DASHBOARD (/pages/dashboard-assurance) ====================
        // Insurers are tracked by ghost PLX_InsuranceName; MAWDY is instead ALL orders of client
        // C0077 (PLX_SellToCustomerName 'MAWDY services'). The flat query rejects OR across
        // different fields, so insurer names (same-field OR) and MAWDY (customerName) are fetched
        // as separate requests and merged in Java. Keep INSURANCE_NAMES in sync with the AL
        // PlexusInsuranceAgg query filter.
        private static final String[] INSURANCE_NAMES = { "STAR", "STAR ASSURANCE", "MAE ASSURANCE", "SATR" };
        private static final String MAWDY_CLIENT = "MAWDY services";

        private java.util.List<com.fasterxml.jackson.databind.JsonNode> fetchAllRows(
                        String entitySet, String filter, com.fasterxml.jackson.databind.ObjectMapper mapper, String token)
                        throws Exception {
                java.util.List<com.fasterxml.jackson.databind.JsonNode> out = new java.util.ArrayList<>();
                // %20 et non '+' : le parseur de filtres BC ne relit pas '+' comme une espace.
                String next = tarekSystemUrl + "/" + entitySet + "?$filter="
                                + java.net.URLEncoder.encode(filter, "UTF-8").replace("+", "%20");
                int pages = 0;
                while (next != null && pages < 200) {
                        final String pageUrl = next;
                        String body = webClient.get().uri(java.net.URI.create(pageUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(120));
                        com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(body);
                        com.fasterxml.jackson.databind.JsonNode value = root.get("value");
                        if (value != null && value.isArray())
                                value.forEach(out::add);
                        com.fasterxml.jackson.databind.JsonNode nl = root.get("@odata.nextLink");
                        next = (nl != null && !nl.isNull()) ? nl.asText() : null;
                        pages++;
                }
                return out;
        }

        private static String jtxt(com.fasterxml.jackson.databind.JsonNode n, String f) {
                return n.hasNonNull(f) ? n.get(f).asText() : "";
        }

        private static double jnum(com.fasterxml.jackson.databind.JsonNode n, String f) {
                return n.hasNonNull(f) ? n.get(f).asDouble() : 0;
        }

        private String insurerOrClause() {
                StringBuilder b = new StringBuilder("(");
                for (int i = 0; i < INSURANCE_NAMES.length; i++) {
                        if (i > 0)
                                b.append(" or ");
                        b.append("insuranceName eq '").append(INSURANCE_NAMES[i]).append("'");
                }
                return b.append(")").toString();
        }

        // Flat per-order feed → { "orders": [ {number, orderDate, insuranceName, shippingAdvice,
        // registrationNumber, vin, sinitreNumber, vendorName, customerName, totalHT}, ... ] }
        @GetMapping("/dashboard/insurance-orders")
        public ResponseEntity<String> getInsuranceOrders(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();
                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        String dateClause = " and orderDate ge " + startDate + " and orderDate le " + endDate;
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> insurerRows = fetchAllRows(
                                        "plexusInsuranceOrders", insurerOrClause() + dateClause, mapper, token);
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> mawdyRows = fetchAllRows(
                                        "plexusInsuranceOrders", "customerName eq '" + MAWDY_CLIENT + "'" + dateClause, mapper, token);

                        java.util.LinkedHashMap<String, com.fasterxml.jackson.databind.node.ObjectNode> byNum = new java.util.LinkedHashMap<>();
                        for (com.fasterxml.jackson.databind.JsonNode r : insurerRows)
                                putOrderRow(byNum, r, null, mapper);
                        for (com.fasterxml.jackson.databind.JsonNode r : mawdyRows)
                                putOrderRow(byNum, r, "MAWDY", mapper);

                        com.fasterxml.jackson.databind.node.ObjectNode wrapper = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = wrapper.putArray("orders");
                        byNum.values().forEach(arr::add);
                        return ResponseEntity.ok(mapper.writeValueAsString(wrapper));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching insurance orders: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching insurance orders: " + e.getMessage());
                }
        }

        private void putOrderRow(java.util.Map<String, com.fasterxml.jackson.databind.node.ObjectNode> byNum,
                        com.fasterxml.jackson.databind.JsonNode r, String forceInsurer,
                        com.fasterxml.jackson.databind.ObjectMapper mapper) {
                String num = jtxt(r, "number");
                if (num.isEmpty() || byNum.containsKey(num))
                        return;
                com.fasterxml.jackson.databind.node.ObjectNode o = mapper.createObjectNode();
                o.put("number", num);
                o.put("orderDate", jtxt(r, "orderDate"));
                o.put("insuranceName", forceInsurer != null ? forceInsurer : jtxt(r, "insuranceName").trim());
                o.put("shippingAdvice", jtxt(r, "shippingAdvice"));
                o.put("registrationNumber", jtxt(r, "registrationNumber"));
                o.put("vin", jtxt(r, "vin"));
                o.put("sinitreNumber", jtxt(r, "sinistreNumber"));
                o.put("vendorName", jtxt(r, "vendorName"));
                o.put("customerName", jtxt(r, "customerName"));
                o.put("totalHT", jnum(r, "totalHT"));
                byNum.put(num, o);
        }

        // Pre-aggregated feed → { grandTotals:{count,totalHT,companyCount}, companies:[{name,count,
        // totalHT,statusBreakdown:{status:{count,ht}}}], statuses:[{status,count,ht}], rows:[...] }
        @GetMapping("/dashboard/insurance-agg")
        public ResponseEntity<String> getInsuranceAgg(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();
                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        String dateClause = "orderDate ge " + startDate + " and orderDate le " + endDate;
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> aggRows = fetchAllRows(
                                        "plexusInsuranceAggs", dateClause, mapper, token);
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> mawdyRows = fetchAllRows(
                                        "plexusInsuranceOrders", "customerName eq '" + MAWDY_CLIENT + "' and " + dateClause, mapper, token);

                        com.fasterxml.jackson.databind.node.ArrayNode rows = mapper.createArrayNode();
                        java.util.LinkedHashMap<String, double[]> compTotals = new java.util.LinkedHashMap<>();
                        java.util.LinkedHashMap<String, java.util.LinkedHashMap<String, double[]>> compStatus = new java.util.LinkedHashMap<>();
                        java.util.LinkedHashMap<String, double[]> statusTotals = new java.util.LinkedHashMap<>();

                        for (com.fasterxml.jackson.databind.JsonNode r : aggRows) {
                                accumAgg(rows, compTotals, compStatus, statusTotals,
                                                jtxt(r, "insuranceName").trim(), jtxt(r, "shippingAdvice").trim(),
                                                jtxt(r, "orderDate"), jnum(r, "orderCount"), jnum(r, "totalHT"));
                        }
                        // MAWDY: aggregate the flat client-C0077 orders by (status, orderDate)
                        java.util.LinkedHashMap<String, double[]> mawdyGroup = new java.util.LinkedHashMap<>();
                        java.util.Map<String, String[]> mawdyMeta = new java.util.HashMap<>();
                        for (com.fasterxml.jackson.databind.JsonNode r : mawdyRows) {
                                String st = jtxt(r, "shippingAdvice").trim();
                                String date = jtxt(r, "orderDate");
                                String key = st + "|" + date;
                                double[] g = mawdyGroup.computeIfAbsent(key, k -> new double[2]);
                                g[0] += 1;
                                g[1] += jnum(r, "totalHT");
                                mawdyMeta.put(key, new String[] { st, date });
                        }
                        for (java.util.Map.Entry<String, double[]> en : mawdyGroup.entrySet()) {
                                String[] m = mawdyMeta.get(en.getKey());
                                accumAgg(rows, compTotals, compStatus, statusTotals, "MAWDY", m[0], m[1],
                                                en.getValue()[0], en.getValue()[1]);
                        }

                        double grandCount = 0, grandHT = 0;
                        for (double[] v : compTotals.values()) {
                                grandCount += v[0];
                                grandHT += v[1];
                        }
                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ObjectNode gt = out.putObject("grandTotals");
                        gt.put("count", (long) grandCount);
                        gt.put("totalHT", grandHT);
                        gt.put("companyCount", compTotals.size());
                        com.fasterxml.jackson.databind.node.ArrayNode companies = out.putArray("companies");
                        for (java.util.Map.Entry<String, double[]> en : compTotals.entrySet()) {
                                com.fasterxml.jackson.databind.node.ObjectNode c = companies.addObject();
                                c.put("name", en.getKey());
                                c.put("count", (long) en.getValue()[0]);
                                c.put("totalHT", en.getValue()[1]);
                                com.fasterxml.jackson.databind.node.ObjectNode sb = c.putObject("statusBreakdown");
                                java.util.LinkedHashMap<String, double[]> sm = compStatus.get(en.getKey());
                                if (sm != null)
                                        for (java.util.Map.Entry<String, double[]> se : sm.entrySet()) {
                                                com.fasterxml.jackson.databind.node.ObjectNode b = sb.putObject(se.getKey());
                                                b.put("count", (long) se.getValue()[0]);
                                                b.put("ht", se.getValue()[1]);
                                        }
                        }
                        com.fasterxml.jackson.databind.node.ArrayNode statuses = out.putArray("statuses");
                        for (java.util.Map.Entry<String, double[]> en : statusTotals.entrySet()) {
                                com.fasterxml.jackson.databind.node.ObjectNode s = statuses.addObject();
                                s.put("status", en.getKey());
                                s.put("count", (long) en.getValue()[0]);
                                s.put("ht", en.getValue()[1]);
                        }
                        out.set("rows", rows);
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching insurance agg: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching insurance agg: " + e.getMessage());
                }
        }

        private void accumAgg(com.fasterxml.jackson.databind.node.ArrayNode rows,
                        java.util.LinkedHashMap<String, double[]> compTotals,
                        java.util.LinkedHashMap<String, java.util.LinkedHashMap<String, double[]>> compStatus,
                        java.util.LinkedHashMap<String, double[]> statusTotals,
                        String ins, String st, String date, double cnt, double ht) {
                com.fasterxml.jackson.databind.node.ObjectNode row = rows.addObject();
                row.put("insuranceName", ins);
                row.put("shippingAdvice", st);
                row.put("orderDate", date);
                row.put("count", (long) cnt);
                row.put("totalHT", ht);
                double[] ct = compTotals.computeIfAbsent(ins, k -> new double[2]);
                ct[0] += cnt;
                ct[1] += ht;
                double[] cs = compStatus.computeIfAbsent(ins, k -> new java.util.LinkedHashMap<>())
                                .computeIfAbsent(st, k -> new double[2]);
                cs[0] += cnt;
                cs[1] += ht;
                double[] stt = statusTotals.computeIfAbsent(st, k -> new double[2]);
                stt[0] += cnt;
                stt[1] += ht;
        }

        // --- Order lines (with & without remise), for the dossier modal + Excel export ---
        // Read from the standard PlexuspurchaseOrders API with $expand — the flat AL query is
        // header-only. Per line: gross = amountExcludingTax (sans remise); net = netAmount (avec
        // remise, sums to the order Total HT); remise = invoiceDiscountAllocation.
        private java.util.List<com.fasterxml.jackson.databind.JsonNode> fetchOrdersWithLines(
                        String filter, com.fasterxml.jackson.databind.ObjectMapper mapper, String token) throws Exception {
                java.util.List<com.fasterxml.jackson.databind.JsonNode> out = new java.util.ArrayList<>();
                // Keep slashes literal (order numbers like "CA26/1440") — %2F can trip up BC.
                String next = baseUrl + "/PlexuspurchaseOrders?$filter="
                                + java.net.URLEncoder.encode(filter, "UTF-8").replace("+", "%20").replace("%2F", "/")
                                + "&$expand=PlexuspurchaseOrderLines";
                int pages = 0;
                while (next != null && pages < 200) {
                        final String pageUrl = next;
                        String body = webClient.get().uri(java.net.URI.create(pageUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve().bodyToMono(String.class)
                                        .timeout(Duration.ofSeconds(180)).block(Duration.ofSeconds(185));
                        com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(body);
                        com.fasterxml.jackson.databind.JsonNode value = root.get("value");
                        if (value != null && value.isArray())
                                value.forEach(out::add);
                        com.fasterxml.jackson.databind.JsonNode nl = root.get("@odata.nextLink");
                        next = (nl != null && !nl.isNull()) ? nl.asText() : null;
                        pages++;
                }
                return out;
        }

        private static com.fasterxml.jackson.databind.JsonNode orderLines(com.fasterxml.jackson.databind.JsonNode order) {
                if (order.has("plexuspurchaseOrderLines"))
                        return order.get("plexuspurchaseOrderLines");
                if (order.has("PlexuspurchaseOrderLines"))
                        return order.get("PlexuspurchaseOrderLines");
                return null;
        }

        // gross (sans remise) = directUnitCost x quantity (public); net (avec remise) = netAmount
        // (final, after line + invoice discounts); remise = gross - net; remisePct = remise/gross.
        private com.fasterxml.jackson.databind.node.ObjectNode lineNode(
                        com.fasterxml.jackson.databind.JsonNode l, com.fasterxml.jackson.databind.ObjectMapper mapper) {
                double qty = jnum(l, "quantity");
                double unit = jnum(l, "directUnitCost");
                double gross = unit * qty;
                double net = jnum(l, "netAmount");
                double remise = gross - net;
                com.fasterxml.jackson.databind.node.ObjectNode ln = mapper.createObjectNode();
                ln.put("article", jtxt(l, "lineObjectNumber"));
                ln.put("description", jtxt(l, "description"));
                ln.put("quantity", qty);
                ln.put("unitPrice", unit);
                ln.put("grossHT", gross);
                ln.put("remise", remise);
                ln.put("remisePct", gross > 0 ? (remise / gross) * 100 : 0);
                ln.put("netHT", net);
                ln.put("netTTC", jnum(l, "netAmountIncludingTax")); // net avec remise, TVA incluse
                return ln;
        }

        private double lineGross(com.fasterxml.jackson.databind.JsonNode l) {
                return jnum(l, "directUnitCost") * jnum(l, "quantity");
        }

        // Lines of a single order → { lines:[{article,description,quantity,unitPrice,grossHT,remise,netHT}], grossHT, netHT }
        @GetMapping("/dashboard/insurance-order-lines")
        public ResponseEntity<String> getInsuranceOrderLines(
                        @org.springframework.web.bind.annotation.RequestParam(name = "number") String number) {
                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> orders = fetchOrdersWithLines(
                                        "number eq '" + number.replace("'", "''") + "'", mapper, token);
                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode linesOut = out.putArray("lines");
                        double grossTot = 0, netTot = 0, netTTCTot = 0;
                        if (!orders.isEmpty()) {
                                com.fasterxml.jackson.databind.JsonNode lines = orderLines(orders.get(0));
                                if (lines != null && lines.isArray())
                                        for (com.fasterxml.jackson.databind.JsonNode l : lines) {
                                                linesOut.add(lineNode(l, mapper));
                                                grossTot += lineGross(l);
                                                netTot += jnum(l, "netAmount");
                                                netTTCTot += jnum(l, "netAmountIncludingTax");
                                        }
                        }
                        out.put("grossHT", grossTot);
                        out.put("netHT", netTot);
                        out.put("netTTC", netTTCTot);
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("{\"error\":\"" + String.valueOf(e.getMessage()).replace("\"", "'") + "\"}");
                }
        }

        // Full export feed → { orders:[{...header..., lines:[...]}] } for insurers + client C0077 (MAWDY).
        @GetMapping("/dashboard/insurance-export")
        public ResponseEntity<String> getInsuranceExport(
                        @org.springframework.web.bind.annotation.RequestParam(name = "startDate", required = false) String startDate,
                        @org.springframework.web.bind.annotation.RequestParam(name = "endDate", required = false) String endDate) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (startDate == null || startDate.isEmpty())
                        startDate = today.withDayOfYear(1).toString();
                if (endDate == null || endDate.isEmpty())
                        endDate = today.toString();
                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        // BC rejects OR across distinct fields — fetch insurers (same-field OR) and
                        // client C0077 separately, then merge/dedupe by number (same as insurance-orders).
                        String dateClause = " and orderDate ge " + startDate + " and orderDate le " + endDate;
                        StringBuilder ins = new StringBuilder("(");
                        for (int i = 0; i < INSURANCE_NAMES.length; i++) {
                                if (i > 0)
                                        ins.append(" or ");
                                ins.append("InsuranceName eq '").append(INSURANCE_NAMES[i]).append("'");
                        }
                        ins.append(")");
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> insurerOrders = fetchOrdersWithLines(
                                        ins + dateClause, mapper, token);
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> mawdyOrders = fetchOrdersWithLines(
                                        "SellToCustomerNo eq 'C0077'" + dateClause, mapper, token);
                        java.util.Map<String, String> custNames = fetchCustomerNameMap(mapper, token);

                        java.util.LinkedHashMap<String, com.fasterxml.jackson.databind.node.ObjectNode> byNum = new java.util.LinkedHashMap<>();
                        for (com.fasterxml.jackson.databind.JsonNode o : insurerOrders)
                                putExportRow(byNum, o, null, custNames, mapper);
                        for (com.fasterxml.jackson.databind.JsonNode o : mawdyOrders)
                                putExportRow(byNum, o, "MAWDY", custNames, mapper);

                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = out.putArray("orders");
                        byNum.values().forEach(arr::add);
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("{\"error\":\"" + String.valueOf(e.getMessage()).replace("\"", "'") + "\"}");
                }
        }

        // Build one export order (header + lines) into byNum, deduped by number. forceInsurer
        // (e.g. "MAWDY" for client C0077) overrides the header InsuranceName.
        private void putExportRow(java.util.Map<String, com.fasterxml.jackson.databind.node.ObjectNode> byNum,
                        com.fasterxml.jackson.databind.JsonNode o, String forceInsurer,
                        java.util.Map<String, String> custNames, com.fasterxml.jackson.databind.ObjectMapper mapper) {
                String num = jtxt(o, "number");
                if (num.isEmpty() || byNum.containsKey(num))
                        return;
                String insurer = forceInsurer != null ? forceInsurer : jtxt(o, "InsuranceName").trim();
                if (insurer.isEmpty())
                        return;
                String custNo = jtxt(o, "SellToCustomerNo");
                com.fasterxml.jackson.databind.node.ObjectNode row = mapper.createObjectNode();
                row.put("number", num);
                row.put("orderDate", jtxt(o, "orderDate"));
                row.put("insuranceName", insurer);
                row.put("customerName", custNames.getOrDefault(custNo, custNo));
                row.put("vendorName", jtxt(o, "vendorName"));
                row.put("shippingAdvice", jtxt(o, "ShippingAdvice"));
                row.put("registrationNumber", jtxt(o, "RegistrationNumber"));
                row.put("vin", jtxt(o, "VIN"));
                row.put("sinitreNumber", jtxt(o, "SinitreNumber"));
                row.put("totalHT", jnum(o, "totalAmountExcludingTax"));
                com.fasterxml.jackson.databind.node.ArrayNode linesOut = row.putArray("lines");
                com.fasterxml.jackson.databind.JsonNode lines = orderLines(o);
                if (lines != null && lines.isArray())
                        for (com.fasterxml.jackson.databind.JsonNode l : lines)
                                linesOut.add(lineNode(l, mapper));
                byNum.put(num, row);
        }

        private java.util.Map<String, String> fetchCustomerNameMap(
                        com.fasterxml.jackson.databind.ObjectMapper mapper, String token) throws Exception {
                java.util.Map<String, String> m = new java.util.HashMap<>();
                String stdBase = baseUrl.replace("/api/NEL/AcessPurchasesAPI/v2.0", "/api/v2.0");
                String body = webClient.get()
                                .uri(java.net.URI.create(stdBase + "/customers?$select=number,displayName"))
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .retrieve().bodyToMono(String.class).timeout(Duration.ofSeconds(60)).block(Duration.ofSeconds(65));
                com.fasterxml.jackson.databind.JsonNode arr = mapper.readTree(body).get("value");
                if (arr != null && arr.isArray())
                        for (com.fasterxml.jackson.databind.JsonNode c : arr) {
                                String no = jtxt(c, "number");
                                if (!no.isEmpty())
                                        m.put(no, jtxt(c, "displayName"));
                        }
                return m;
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

        // ==================== DERNIÈRE MAJ DE PRIX (par article) ====================
        // Répond à « sur cette ligne de commande, quand le prix a-t-il bougé pour la dernière
        // fois ? ». La source est la table AL 52250 "Plexus Price History", alimentée
        // automatiquement par le subscriber Item."Unit Price" de la codeunit Plexus Price Mgt —
        // et comme Purchase Line."Direct Unit Cost" pousse le prix vers l'article, toute modif
        // de prix faite depuis le dashboard y atterrit aussi.
        //
        // ATTENTION : l'historique est tenu PAR ARTICLE, pas par ligne de commande. Deux lignes
        // portant la même référence, dans deux commandes différentes, renvoient donc la même
        // dernière MAJ. C'est bien « le prix de cet article a changé le … », pas « quelqu'un a
        // touché cette ligne-là ». Pour l'audit par ligne (avec le vrai utilisateur), c'est le
        // journal d'activité (/api/activity) qui porte l'information.
        //
        // Le front appelle avec les références d'UNE commande dépliée :
        //   GET /api/purchase-orders/price-history?items=3G1941005C,3G0807889
        //   → {"value":{"3G1941005C":{"itemNo","oldPrice","newPrice","dateTime","userId",
        //                             "changeCount","daysAgo","freshness"}, ...}}
        // Un article jamais modifié est simplement absent de la map.
        //
        // La lecture elle-même vit dans PriceHistoryService, partagé avec l'API partenaire de
        // l'app commerciale : les deux surfaces doivent dater un prix de la même façon.
        @GetMapping("/price-history")
        public ResponseEntity<String> getLastPriceUpdates(
                        @org.springframework.web.bind.annotation.RequestParam(name = "items", required = false) String items) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        java.util.List<String> refs = items == null || items.isBlank()
                                        ? java.util.List.of()
                                        : java.util.Arrays.asList(items.split(","));
                        com.fasterxml.jackson.databind.node.ObjectNode result = mapper.createObjectNode();
                        result.set("value", mapper.valueToTree(priceHistoryService.lastUpdates(refs)));
                        return ResponseEntity.ok(result.toString());
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching price history: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching price history: " + e.getMessage());
                }
        }

        // Historique complet d'UNE référence, du plus récent au plus ancien — alimente le détail
        // ouvert depuis la puce « MAJ prix » d'une ligne.
        @GetMapping("/price-history/{itemNo}")
        public ResponseEntity<String> getPriceHistoryForItem(
                        @org.springframework.web.bind.annotation.PathVariable("itemNo") String itemNo) {
                if (itemNo == null || itemNo.isEmpty() || itemNo.contains("'"))
                        return ResponseEntity.badRequest().body("{\"error\":\"référence invalide\"}");

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        com.fasterxml.jackson.databind.node.ObjectNode result = mapper.createObjectNode();
                        result.set("value", mapper.valueToTree(priceHistoryService.history(itemNo)));
                        return ResponseEntity.ok(result.toString());
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("Error fetching price history: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error fetching price history: " + e.getMessage());
                }
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
                // Held outside the try so the guard is released in the finally below whatever
                // happens in between. Separate from orderId, which stays effectively final
                // because the reactive line-update lambdas capture it. lockedOrderId/lockStamp
                // are set only once we actually own the guard.
                String lockedOrderId = null;
                long lockStamp = 0L;

                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(body);

                        final String orderId = rootNode.has("id") ? rootNode.get("id").asText() : null;
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
                        lockedOrderId = orderId;
                        lockStamp = now;

                        boolean withReclamation = rootNode.has("withReclamation")
                                        && rootNode.get("withReclamation").asBoolean();
                        String reclamationText = rootNode.has("reclamationText")
                                        ? rootNode.get("reclamationText").asText("")
                                        : "";

                        // Step 1: Get the order response to retrieve status and etag
                        String orderResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        log.info(">>> confirmReception: Order fetched");

                        com.fasterxml.jackson.databind.JsonNode orderNode = mapper.readTree(orderResponse);
                        String etag = orderNode.has("@odata.etag") ? orderNode.get("@odata.etag").asText() : "*";
                        String status = orderNode.has("status") ? orderNode.get("status").asText() : "";

                        // REOPEN order only if it is Released (bypass Released status error)
                        if ("Released".equalsIgnoreCase(status)) {
                                try {
                                        reopenPurchaseOrder(orderId, token);
                                } catch (Exception e) {
                                        log.warn(">>> confirmReception: Could not reopen order {}: {}", orderId,
                                                        e.getMessage());
                                }
                        }

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
                                try {
                                        final String finalOrderNumber = orderNode.has("number") ? orderNode.get("number").asText() : "";
                                        final String finalToken = token;
                                        if (finalOrderNumber != null && !finalOrderNumber.isEmpty()) {
                                                java.util.concurrent.CompletableFuture.runAsync(() -> {
                                                        try {
                                                                log.info("confirmReception: [Async] Starting sync for order {} after a 4s delay...", finalOrderNumber);
                                                                Thread.sleep(4000); // Allow BC transactions/locks to settle

                                                                String filter = "purchaseOrderNo eq '" + finalOrderNumber.replace("'", "''") + "'";
                                                                String encodedFilter = java.net.URLEncoder.encode(filter, "UTF-8");
                                                                String pecHeaderUrl = tarekSystemUrl + "/plexusPecHeaders?$filter=" + encodedFilter;

                                                                log.info("confirmReception: [Async] Fetching PEC Header for order {}: GET {}", finalOrderNumber, pecHeaderUrl);
                                                                String pecResponse = webClient.get()
                                                                                .uri(java.net.URI.create(pecHeaderUrl))
                                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + finalToken)
                                                                                .retrieve()
                                                                                .bodyToMono(String.class)
                                                                                .block(Duration.ofSeconds(60));

                                                                com.fasterxml.jackson.databind.ObjectMapper asyncMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                                                com.fasterxml.jackson.databind.JsonNode pecList = asyncMapper.readTree(pecResponse);
                                                                com.fasterxml.jackson.databind.JsonNode pecValue = pecList.get("value");
                                                                if (pecValue != null && pecValue.isArray() && pecValue.size() > 0) {
                                                                        com.fasterxml.jackson.databind.JsonNode pecHeader = pecValue.get(0);
                                                                        String pecHeaderId = pecHeader.get("id").asText();
                                                                        String documentNo = pecHeader.has("number") ? pecHeader.get("number").asText() : "";

                                                                        // Update Header Status to Réceptionné
                                                                        com.fasterxml.jackson.databind.node.ObjectNode pecPatch = asyncMapper.createObjectNode();
                                                                        pecPatch.put("status", "Réceptionné");

                                                                        String patchPecUrl = tarekSystemUrl + "/plexusPecHeaders(" + pecHeaderId + ")";
                                                                        log.info("confirmReception: [Async] Updating PEC Header status to Réceptionné: PATCH {} payload: {}", patchPecUrl, pecPatch);
                                                                        webClient.patch()
                                                                                        .uri(java.net.URI.create(patchPecUrl))
                                                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + finalToken)
                                                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                                        .header("If-Match", "*")
                                                                                        .bodyValue(pecPatch.toString())
                                                                                        .retrieve()
                                                                                        .bodyToMono(String.class)
                                                                                        .block(Duration.ofSeconds(60));

                                                                        // Update PEC Lines Status to Réceptionné
                                                                        if (documentNo != null && !documentNo.isEmpty()) {
                                                                                String lineFilter = "documentNo eq '" + documentNo.replace("'", "''") + "'";
                                                                                String encodedLineFilter = java.net.URLEncoder.encode(lineFilter, "UTF-8");
                                                                                String pecLinesUrl = tarekSystemUrl + "/plexusPecLines?$filter=" + encodedLineFilter;

                                                                                log.info("confirmReception: [Async] Fetching PEC lines for document {}: GET {}", documentNo, pecLinesUrl);
                                                                                String pecLinesResponse = webClient.get()
                                                                                                .uri(java.net.URI.create(pecLinesUrl))
                                                                                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + finalToken)
                                                                                                .retrieve()
                                                                                                .bodyToMono(String.class)
                                                                                                .block(Duration.ofSeconds(60));

                                                                                com.fasterxml.jackson.databind.JsonNode linesList = asyncMapper.readTree(pecLinesResponse);
                                                                                com.fasterxml.jackson.databind.JsonNode linesValue = linesList.get("value");
                                                                                if (linesValue != null && linesValue.isArray()) {
                                                                                        for (com.fasterxml.jackson.databind.JsonNode lineNode : linesValue) {
                                                                                                String lineId = lineNode.get("id").asText();
                                                                                                com.fasterxml.jackson.databind.node.ObjectNode linePatch = asyncMapper.createObjectNode();
                                                                                                linePatch.put("status", "Réceptionné");

                                                                                                String patchLineUrl = tarekSystemUrl + "/plexusPecLines(" + lineId + ")";
                                                                                                log.info("confirmReception: [Async] Updating PEC line {} to Réceptionné: PATCH {}", lineId, patchLineUrl);
                                                                                                try {
                                                                                                        webClient.patch()
                                                                                                                        .uri(java.net.URI.create(patchLineUrl))
                                                                                                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + finalToken)
                                                                                                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                                                                        .header("If-Match", "*")
                                                                                                                        .bodyValue(linePatch.toString())
                                                                                                                        .retrieve()
                                                                                                                        .bodyToMono(String.class)
                                                                                                                        .block(Duration.ofSeconds(30));
                                                                                                } catch (Exception lineEx) {
                                                                                                        log.error("confirmReception: [Async] Failed to update PEC line {}: {}", lineId, lineEx.getMessage());
                                                                                                }
                                                                                        }
                                                                                }
                                                                        }
                                                                } else {
                                                                        log.warn("confirmReception: [Async] PEC Header not found for order number: {}", finalOrderNumber);
                                                                }
                                                        } catch (Exception asyncEx) {
                                                                log.error("confirmReception: [Async] Failed to sync PEC Header/Lines status for order {}: {}", finalOrderNumber, asyncEx.getMessage());
                                                        }
                                                });
                                        }
                                } catch (Exception ex) {
                                        log.error("confirmReception: Failed to schedule async PEC Header/Lines status sync: {}", ex.getMessage());
                                }
                        } catch (Exception postEx) {
                                log.error(">>> confirmReception: receiveonly action FAILED: {}", postEx.getMessage());
                        } finally {
                                // RELEASE order after modifications — only if we reopened it (status was Released)
                                if ("Released".equalsIgnoreCase(status)) {
                                        try {
                                                if (orderId != null)
                                                        releasePurchaseOrder(orderId, token);
                                        } catch (Exception e) {
                                                log.warn(">>> confirmReception: Could not release order {}: {}", orderId,
                                                                e.getMessage());
                                        }
                                }
                        }

                        return ResponseEntity.ok("{\"success\": true}");

                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
                } finally {
                        // The guard MUST be released on every exit path. It used to be released
                        // only in the inner finally, so any failure before that block (BC timeout
                        // on the GET, unreadable response…) left the order marked "validation en
                        // cours" for 5 minutes and every retry got an instant 409.
                        // remove(key, value) so a slow request that finishes late can never drop
                        // the guard of a newer validation that already took over.
                        if (lockedOrderId != null) {
                                activeValidations.remove(lockedOrderId, lockStamp);
                        }
                }
        }

        // ===== Validate Order: Update status in BC + Generate BL PDF =====
        @org.springframework.web.bind.annotation.PostMapping("/validate-order")
        public ResponseEntity<byte[]> validateOrder(
                        @org.springframework.web.bind.annotation.RequestBody String body) {
                String token = tokenService.getAccessToken();
                String orderId = null;
                String status = "";
                long lockStamp = 0L; // 0 = this call never acquired the guard

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
                        lockStamp = nowVal;

                        // Step 1: GET the order to retrieve its status and @odata.etag
                        String orderResponse = webClient.get()
                                        .uri(java.net.URI.create(baseUrl + "/PlexuspurchaseOrders(" + orderId + ")"))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .timeout(Duration.ofSeconds(20))
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.JsonNode orderNode = mapper.readTree(orderResponse);
                        String etag = orderNode.has("@odata.etag") ? orderNode.get("@odata.etag").asText() : "*";
                        status = orderNode.has("status") ? orderNode.get("status").asText() : "";

                        // REOPEN order only if it is Released (bypass Released status error)
                        if ("Released".equalsIgnoreCase(status)) {
                                try {
                                        reopenPurchaseOrder(orderId, token);
                                } catch (Exception e) {
                                        log.warn(">>> validateOrder: Could not reopen order {}: {}", orderId, e.getMessage());
                                }
                        }

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
                                String vendorNumber = bgRootNode.has("payToVendorNumber")
                                                ? bgRootNode.get("payToVendorNumber").asText()
                                                : "";
                                targetCustomer = vendorNumber.replace("F", "C");
                                log.info(">>> [BG] Derived customer from vendor (F->C): {}", targetCustomer);
                        }


                        // Make it SYNCHRONOUS to guarantee we have the Posted Sales Shipment number for the BL
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
                                                                .block(Duration.ofMinutes(10)); // Total timeout for all lines sequential
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
                        // RELEASE order after modifications — only if we reopened it (status was Released)
                        if ("Released".equalsIgnoreCase(status)) {
                                try {
                                        if (orderId != null)
                                                releasePurchaseOrder(orderId, token);
                                } catch (Exception e) {
                                        log.warn(">>> validateOrder: Could not release order {}: {}", orderId, e.getMessage());
                                }
                        }

                        // Only release the guard we took ourselves: this finally also runs on the
                        // 409 path, where the guard belongs to the validation still in flight.
                        if (orderId != null && lockStamp != 0L) {
                                activeValidations.remove(orderId, lockStamp);
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

                                                // Patch originalOrderNo via custom API page (plexusPurchaseOrderPatches)
                                                if (originalOrder != null && originalOrder.has("number") && !originalOrder.get("number").isNull()) {
                                                        try {
                                                                com.fasterxml.jackson.databind.node.ObjectNode origOrderPatch = mapper
                                                                                .createObjectNode();
                                                                origOrderPatch.put("originalOrderNo", originalOrder.get("number").asText());
                                                                webClient.patch()
                                                                                .uri(java.net.URI.create(tarekSystemUrl
                                                                                                + "/plexusPurchaseOrderPatches("
                                                                                                + newOrderId + ")"))
                                                                                .header(HttpHeaders.AUTHORIZATION,
                                                                                                "Bearer " + token)
                                                                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                                                                .header("If-Match", "*")
                                                                                .bodyValue(origOrderPatch.toString())
                                                                                .retrieve()
                                                                                .toBodilessEntity()
                                                                                .block(Duration.ofSeconds(30));
                                                                log.info(">>> Successfully patched originalOrderNo via plexusPurchaseOrderPatches.");
                                                        } catch (Exception e) {
                                                                log.warn("!!! Failed to patch originalOrderNo via plexusPurchaseOrderPatches: {}",
                                                                                e.getMessage());
                                                        }
                                                }

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
                                                                // Store original values on the new line payload
                                                                String originalItemNo = "";
                                                                if (oldLine.has("lineObjectNumber") && !oldLine.get("lineObjectNumber").isNull()) {
                                                                        originalItemNo = oldLine.get("lineObjectNumber").asText();
                                                                } else if (oldLine.has("itemNo") && !oldLine.get("itemNo").isNull()) {
                                                                        originalItemNo = oldLine.get("itemNo").asText();
                                                                } else if (oldLine.has("ItemNo") && !oldLine.get("ItemNo").isNull()) {
                                                                        originalItemNo = oldLine.get("ItemNo").asText();
                                                                }
                                                                if (!originalItemNo.isEmpty()) {
                                                                        newLinePayload.put("OldRemplacementItemNo", originalItemNo);
                                                                }

                                                                double originalCost = 0.0;
                                                                if (oldLine.has("directUnitCost") && !oldLine.get("directUnitCost").isNull()) {
                                                                        originalCost = oldLine.get("directUnitCost").asDouble();
                                                                } else if (oldLine.has("DirectUnitCost") && !oldLine.get("DirectUnitCost").isNull()) {
                                                                        originalCost = oldLine.get("DirectUnitCost").asDouble();
                                                                }
                                                                if (originalCost > 0.0) {
                                                                        newLinePayload.put("OldUnitPrice", originalCost);
                                                                }

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
                        if (metadata.has("originalOrderNo") && !metadata.get("originalOrderNo").isNull() && !metadata.get("originalOrderNo").asText().isEmpty()) {
                                rootObj.put("PLX_OriginalOrderNo", metadata.get("originalOrderNo").asText());
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
                        @org.springframework.web.bind.annotation.RequestParam(name = "status", required = false) String status,
                        @org.springframework.web.bind.annotation.RequestParam(name = "skip", defaultValue = "0") int skip,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "10") int top) {
                String token = tokenService.getAccessToken();
                String customerNo = request.getHeader("X-Customer-No");

                if (customerNo == null || customerNo.isEmpty()) {
                        return ResponseEntity.ok("{ \"value\": [], \"@odata.count\": 0 }");
                }

                try {
                        String filter = "";
                        if (!"C0090".equals(customerNo)) {
                                filter = "customerNo eq '" + customerNo.replace("'", "''") + "'";
                        }
                        if (status != null && !status.isEmpty()) {
                                if (!filter.isEmpty()) {
                                        filter += " and ";
                                }
                                if (status.startsWith("ne:")) {
                                        filter += "status ne '" + status.substring(3).replace("'", "''") + "'";
                                } else {
                                        filter += "status eq '" + status.replace("'", "''") + "'";
                                }
                        }

                        String filterParam = "";
                        if (!filter.isEmpty()) {
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

        // Recherche de commandes d'achat pour la synchronisation des prix d'un dossier PEC.
        // Réservé à l'opérateur PEC (C0090).
        @GetMapping("/pec/orders")
        public ResponseEntity<String> searchOrdersForPec(
                        HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "search", required = false) String search,
                        @org.springframework.web.bind.annotation.RequestParam(name = "top", defaultValue = "25") int top) {
                String customerNo = request.getHeader("X-Customer-No");
                if (!"C0090".equals(customerNo)) {
                        return ResponseEntity.status(403).body("{\"error\": \"Réservé à l'opérateur PEC\"}");
                }

                String token = tokenService.getAccessToken();
                try {
                        int limit = Math.min(Math.max(top, 1), 100);
                        StringBuilder url = new StringBuilder(baseUrl + "/PlexuspurchaseOrders?$top=" + limit);
                        if (search != null && !search.trim().isEmpty()) {
                                String term = search.trim().replace("'", "''");
                                String filter = "contains(number,'" + term + "')";
                                // Les numéros de commande contiennent des "/" : les garder littéraux pour BC
                                url.append("&$filter=").append(java.net.URLEncoder.encode(filter, "UTF-8")
                                                .replace("+", "%20").replace("%2F", "/"));
                        }
                        url.append("&$orderby=").append(java.net.URLEncoder.encode("orderDate desc", "UTF-8")
                                        .replace("+", "%20"));

                        log.info("Searching purchase orders for PEC sync: GET {}", url);
                        String response = webClient.get()
                                        .uri(java.net.URI.create(url.toString()))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(60));

                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);
                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = out.putArray("value");
                        com.fasterxml.jackson.databind.JsonNode value = root.get("value");
                        if (value != null && value.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode o : value) {
                                        com.fasterxml.jackson.databind.node.ObjectNode n = mapper.createObjectNode();
                                        n.put("number", jtxt(o, "number"));
                                        n.put("vendorNumber", jtxt(o, "vendorNumber"));
                                        n.put("vendorName", jtxt(o, "vendorName"));
                                        n.put("orderDate", jtxt(o, "orderDate"));
                                        n.put("totalAmountExcludingTax", jnum(o, "totalAmountExcludingTax"));
                                        arr.add(n);
                                }
                        }
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (Exception e) {
                        log.error("Error searching orders for PEC sync: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }

        // Lignes d'une commande d'achat (référence + prix unitaire) pour la synchronisation PEC.
        // Le numéro passe en paramètre de requête car il contient des "/".
        @GetMapping("/pec/order-lines")
        public ResponseEntity<String> getOrderLinesForPec(
                        HttpServletRequest request,
                        @org.springframework.web.bind.annotation.RequestParam(name = "number") String number) {
                String customerNo = request.getHeader("X-Customer-No");
                if (!"C0090".equals(customerNo)) {
                        return ResponseEntity.status(403).body("{\"error\": \"Réservé à l'opérateur PEC\"}");
                }

                String token = tokenService.getAccessToken();
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                        java.util.List<com.fasterxml.jackson.databind.JsonNode> orders = fetchOrdersWithLines(
                                        "number eq '" + number.replace("'", "''") + "'", mapper, token);
                        com.fasterxml.jackson.databind.node.ObjectNode out = mapper.createObjectNode();
                        com.fasterxml.jackson.databind.node.ArrayNode arr = out.putArray("value");
                        if (!orders.isEmpty()) {
                                com.fasterxml.jackson.databind.JsonNode order = orders.get(0);
                                out.put("number", jtxt(order, "number"));
                                out.put("vendorNumber", jtxt(order, "vendorNumber"));
                                out.put("vendorName", jtxt(order, "vendorName"));
                                com.fasterxml.jackson.databind.JsonNode lines = orderLines(order);
                                if (lines != null && lines.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode l : lines) {
                                                com.fasterxml.jackson.databind.node.ObjectNode n = mapper
                                                                .createObjectNode();
                                                n.put("reference", jtxt(l, "lineObjectNumber"));
                                                n.put("designation", jtxt(l, "description"));
                                                n.put("quantity", jnum(l, "quantity"));
                                                n.put("unitPrice", jnum(l, "directUnitCost"));
                                                arr.add(n);
                                        }
                                }
                        }
                        return ResponseEntity.ok(mapper.writeValueAsString(out));
                } catch (Exception e) {
                        log.error("Error fetching order lines for PEC sync: {}", e.getMessage());
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
                        String uniqueNumber = "PEC" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyMMddHHmmss")) + ((int) (Math.random() * 90) + 10);
                        headerPayload.put("number", uniqueNumber);
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

                        // 1. Fetch the PEC header details to get VIN, registration, insured name,
                        // customerNo, and its SystemId (id), and fallback vendorNumber
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

                        String backupVendor = "";
                        String cleanInsuredName = insuredName;
                        if (insuredName != null && insuredName.contains("|")) {
                                String[] parts = insuredName.split("\\|");
                                cleanInsuredName = parts[0];
                                if (parts.length > 1) {
                                        backupVendor = parts[1];
                                }
                        }

                        if (vendorNumber == null || vendorNumber.isEmpty()) {
                                vendorNumber = backupVendor;
                        }

                        if (vendorNumber == null || vendorNumber.isEmpty()) {
                                return ResponseEntity.badRequest().body("{\"error\": \"Missing vendorNumber\"}");
                        }

                        // 2. Process Lines (update PEC line details in BC and verify/import references)
                        com.fasterxml.jackson.databind.JsonNode linesNode = rootNode.get("lines");
                        if (linesNode != null && linesNode.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode line : linesNode) {
                                        String lineStatus = line.has("status") ? line.get("status").asText() : "";
                                        if ("Non Disponible".equalsIgnoreCase(lineStatus) || "Non disponible".equalsIgnoreCase(lineStatus) || "2".equals(lineStatus)) {
                                                continue;
                                        }

                                        String lineId = line.get("id").asText();
                                        String reference = line.get("reference").asText();
                                        String designation = line.has("designation") ? line.get("designation").asText() : "";
                                        double quantity = line.has("quantity") ? line.get("quantity").asDouble() : 1.0;
                                        double price = line.has("price") ? line.get("price").asDouble() : 0.0;

                                        // PATCH PEC line in BC to sync details
                                        com.fasterxml.jackson.databind.node.ObjectNode linePatchPayload = mapper
                                                        .createObjectNode();
                                        linePatchPayload.put("reference", reference);
                                        linePatchPayload.put("designation", designation);
                                        linePatchPayload.put("quantity", quantity);
                                        linePatchPayload.put("status", "Commandé");
                                        linePatchPayload.put("unitCost", price);

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
                                
                                String poInsuredName = "";
                                if (cleanInsuredName != null) {
                                        if (cleanInsuredName.contains(" / ")) {
                                                String[] nameParts = cleanInsuredName.split(" / ");
                                                if (nameParts.length > 1) {
                                                        poInsuredName = nameParts[1];
                                                }
                                        } else if (!cleanInsuredName.startsWith("PEC") && !cleanInsuredName.startsWith("PEOC")) {
                                                poInsuredName = cleanInsuredName;
                                        }
                                }

                                if (poInsuredName != null && !poInsuredName.isEmpty()) {
                                        metadataPatch.put("InsuredName", poInsuredName);
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
                                        String lineStatus = line.has("status") ? line.get("status").asText() : "";
                                        if ("Non Disponible".equalsIgnoreCase(lineStatus) || "Non disponible".equalsIgnoreCase(lineStatus) || "2".equals(lineStatus)) {
                                                continue;
                                        }

                                        String reference = line.get("reference").asText();
                                        String designation = line.has("designation") ? line.get("designation").asText()
                                                        : "";
                                        double quantity = line.has("quantity") ? line.get("quantity").asDouble() : 1.0;
                                        double price = line.has("price") ? line.get("price").asDouble() : 0.0;

                                        com.fasterxml.jackson.databind.node.ObjectNode linePayload = mapper
                                                        .createObjectNode();
                                        linePayload.put("documentId", orderId);
                                        linePayload.put("lineType", "Item");
                                        linePayload.put("lineObjectNumber", reference);
                                        linePayload.put("description", designation);
                                        linePayload.put("quantity", quantity);
                                        linePayload.put("directUnitCost", price);

                                        // Carry over the planned delivery date of "LivraisonPrevuDate" PEC lines
                                        String lineExpectedDate = line.has("expectedDeliveryDate")
                                                        && !line.get("expectedDeliveryDate").isNull()
                                                                        ? line.get("expectedDeliveryDate").asText().trim()
                                                                        : "";
                                        if (!lineExpectedDate.isEmpty()) {
                                                linePayload.put("expectedReceiptDate", lineExpectedDate);
                                        }

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

                        // 7. Update PEC Header in BC (status = "Commandé", purchaseOrderNo = orderNumber, restore clean insuredName)
                        com.fasterxml.jackson.databind.node.ObjectNode pecHeaderPatch = mapper.createObjectNode();
                        pecHeaderPatch.put("status", "Commandé");
                        pecHeaderPatch.put("purchaseOrderNo", orderNumber);
                        pecHeaderPatch.put("insuredName", cleanInsuredName);

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

        @org.springframework.web.bind.annotation.PostMapping("/pec/{documentNo}/create-devis")
        public ResponseEntity<String> createDevisFromPec(
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

                        // 1. Fetch the PEC header details to get its SystemId (id)
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
                        String insuredName = pecHeader.has("insuredName") ? pecHeader.get("insuredName").asText() : "";
                        String cleanInsuredName = insuredName.contains("|") ? insuredName.split("\\|")[0] : insuredName;
                        String insuredNameWithVendor = cleanInsuredName + "|" + vendorNumber;

                        // 2. Process Lines (update PEC line details in BC and verify/import references)
                        com.fasterxml.jackson.databind.JsonNode linesNode = rootNode.get("lines");
                        if (linesNode != null && linesNode.isArray()) {
                                for (com.fasterxml.jackson.databind.JsonNode line : linesNode) {
                                        String lineId = line.get("id").asText();
                                        String reference = line.get("reference").asText();
                                        String designation = line.has("designation") ? line.get("designation").asText()
                                                        : "";
                                        double quantity = line.has("quantity") ? line.get("quantity").asDouble() : 1.0;
                                        double price = line.has("price") ? line.get("price").asDouble() : 0.0;

                                        // PATCH PEC line in BC to sync details
                                        String inputStatus = line.has("status") ? line.get("status").asText() : "Trouvé";
                                        String bcStatus = "Trouvé";
                                        if (inputStatus != null) {
                                                String s = inputStatus.trim();
                                                if ("Disponible".equalsIgnoreCase(s) || "Trouvé".equalsIgnoreCase(s) || "Trouve".equalsIgnoreCase(s)) {
                                                        bcStatus = "Trouvé";
                                                } else if ("Non disponible".equalsIgnoreCase(s) || "Non Disponible".equalsIgnoreCase(s)) {
                                                        bcStatus = "Non Disponible";
                                                } else if ("En cours".equalsIgnoreCase(s)) {
                                                        bcStatus = "En cours";
                                                } else if ("LivraisonPrevuDate".equalsIgnoreCase(s)
                                                                || "LivPrevuaDate".equalsIgnoreCase(s)) {
                                                        bcStatus = "LivraisonPrevuDate";
                                                }
                                        }

                                        // Expected delivery date (only meaningful for LivraisonPrevuDate lines)
                                        String expectedDeliveryDate = line.has("expectedDeliveryDate")
                                                        && !line.get("expectedDeliveryDate").isNull()
                                                                        ? line.get("expectedDeliveryDate").asText().trim()
                                                                        : "";

                                        com.fasterxml.jackson.databind.node.ObjectNode linePatchPayload = mapper
                                                        .createObjectNode();
                                        linePatchPayload.put("reference", reference);
                                        linePatchPayload.put("designation", designation);
                                        linePatchPayload.put("quantity", quantity);
                                        linePatchPayload.put("status", bcStatus);
                                        linePatchPayload.put("unitCost", price);
                                        if ("LivraisonPrevuDate".equals(bcStatus) && !expectedDeliveryDate.isEmpty()) {
                                                linePatchPayload.put("expectedDeliveryDate", expectedDeliveryDate);
                                        } else {
                                                // "0001-01-01" = date vide côté BC : efface une date prévue
                                                // devenue obsolète si la ligne change de statut
                                                linePatchPayload.put("expectedDeliveryDate", "0001-01-01");
                                        }

                                        String patchLineUrl = tarekSystemUrl + "/plexusPecLines(" + lineId + ")";
                                        log.info("Updating PEC Line in BC for Devis: PATCH {} payload: {}", patchLineUrl,
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
                                        if (!"Non Disponible".equals(bcStatus) && reference != null && !reference.trim().isEmpty()) {
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
                        }

                        // 3. Update PEC Header in BC to store the vendorNumber in insuredName and keep status as "En cours"
                        com.fasterxml.jackson.databind.node.ObjectNode pecHeaderPatch = mapper.createObjectNode();
                        pecHeaderPatch.put("status", "En cours");
                        pecHeaderPatch.put("insuredName", insuredNameWithVendor);

                        String patchPecHeaderUrl = tarekSystemUrl + "/plexusPecHeaders(" + pecHeaderId + ")";
                        log.info("Updating PEC Header in BC for Devis: PATCH {} payload: {}", patchPecHeaderUrl, pecHeaderPatch);
                        webClient.patch()
                                        .uri(java.net.URI.create(patchPecHeaderUrl))
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                        .header("If-Match", "*")
                                        .bodyValue(pecHeaderPatch.toString())
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block(Duration.ofSeconds(30));

                        return ResponseEntity.ok("{\"success\": true}");

                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        log.error("BC API Error creating Quote from PEC: (HTTP {}) {}", e.getStatusCode(),
                                        e.getResponseBodyAsString());
                        return ResponseEntity.status(e.getStatusCode())
                                        .body("BC Error: " + e.getResponseBodyAsString());
                } catch (Exception e) {
                        log.error("Error creating Quote from PEC: {}", e.getMessage());
                        return ResponseEntity.status(500).body("Error: " + e.getMessage());
                }
        }
}