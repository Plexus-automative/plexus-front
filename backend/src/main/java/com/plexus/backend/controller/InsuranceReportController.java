package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@Slf4j
public class InsuranceReportController {

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.base-url}")
    private String baseUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @jakarta.annotation.PostConstruct
    public void init() {
        String companyPath = "/companies(" + companyId + ")";
        if (baseUrl != null && !baseUrl.contains("/companies(")) {
            baseUrl += companyPath;
        }
        log.info("Initialized InsuranceReportController with companyId: {}", companyId);
    }

    public InsuranceReportController(WebClient webClient, BusinessCentralTokenService tokenService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
    }

    @GetMapping("/insurance-benefits")
    public ResponseEntity<String> getInsuranceBenefits(
            HttpServletRequest request,
            @RequestParam(name = "insuranceName", defaultValue = "STAR ASSURANCE") String insuranceName,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "search", required = false) String search) {

        String token = tokenService.getAccessToken();
        try {
            // 1. Build filter for OData API
            StringBuilder filterBuilder = new StringBuilder();
            filterBuilder.append("InsuranceName eq '").append(insuranceName.replace("'", "''")).append("'");
            filterBuilder.append(" and ShippingAdvice eq 'Confirmé'");

            if (startDate != null && !startDate.trim().isEmpty()) {
                filterBuilder.append(" and orderDate ge ").append(startDate.trim());
            }
            if (endDate != null && !endDate.trim().isEmpty()) {
                filterBuilder.append(" and orderDate le ").append(endDate.trim());
            }
            if (search != null && !search.trim().isEmpty()) {
                String cleanSearch = search.trim().replace("'", "''");
                filterBuilder.append(" and (contains(number, '").append(cleanSearch)
                             .append("') or contains(RegistrationNumber, '").append(cleanSearch)
                             .append("'))");
            }

            String encodedFilter = java.net.URLEncoder.encode(filterBuilder.toString(), "UTF-8");
            String fullUrl = baseUrl + "/PlexuspurchaseOrders"
                    + "?$filter=" + encodedFilter
                    + "&$orderby=number%20desc"
                    + "&$expand=PlexuspurchaseOrderLines";

            log.info(">>> Fetching insurance orders from BC: {}", fullUrl);

            String response = webClient.get()
                    .uri(java.net.URI.create(fullUrl))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(45))
                    .block(Duration.ofSeconds(60));

            JsonNode responseNode = mapper.readTree(response);
            JsonNode purchaseOrders = responseNode.has("value") ? responseNode.get("value") : responseNode;

            ObjectNode resultNode = mapper.createObjectNode();
            ArrayNode ordersArray = mapper.createArrayNode();

            double grandTotalPublicHT = 0;
            double grandTotalClientCostHT = 0;
            double grandTotalStarHT = 0;
            double grandTotalStarGainHT = 0;

            if (purchaseOrders.isArray()) {
                for (JsonNode order : purchaseOrders) {
                    String orderId = order.has("id") ? order.get("id").asText() : "";
                    String orderNumber = order.has("number") ? order.get("number").asText() : "";
                    String orderDate = order.has("orderDate") ? order.get("orderDate").asText() : "";
                    String vendorName = order.has("vendorName") ? order.get("vendorName").asText() : "";
                    String payToVendorNumber = order.has("payToVendorNumber") ? order.get("payToVendorNumber").asText() : "";
                    String insName = order.has("InsuranceName") ? order.get("InsuranceName").asText() : "";
                    String insuredName = order.has("InsuredName") ? order.get("InsuredName").asText() : "";
                    String registrationNumber = order.has("RegistrationNumber") ? order.get("RegistrationNumber").asText() : "";
                    String vin = order.has("VIN") ? order.get("VIN").asText() : "";
                    String customerNumber = order.has("SellToCustomerNo") ? order.get("SellToCustomerNo").asText() : "";

                    JsonNode poLines = order.has("plexuspurchaseOrderLines") ? order.get("plexuspurchaseOrderLines") : 
                                      (order.has("PlexuspurchaseOrderLines") ? order.get("PlexuspurchaseOrderLines") : null);

                    // Fetch Sales Order details for customer discount enrichment
                    ArrayNode enrichedLines = mapper.createArrayNode();
                    enrichLinesFromSalesAPI(orderNumber, poLines, enrichedLines, token);

                    // Perform calculations per line and sum for totals
                    double orderTotalPublicHT = 0;
                    double orderTotalClientCostHT = 0;
                    double orderTotalStarHT = 0;
                    double orderTotalStarGainHT = 0;

                    for (JsonNode line : enrichedLines) {
                        double qty = line.has("quantity") ? line.get("quantity").asDouble() : 0;
                        double publicPrice = line.has("directUnitCost") ? line.get("directUnitCost").asDouble() : 0;
                        
                        double salesDiscountPercent = 0;
                        if (line.has("salesDiscountPercent")) {
                            salesDiscountPercent = line.get("salesDiscountPercent").asDouble();
                        } else if (line.has("sales_lineDiscountPercent")) {
                            salesDiscountPercent = line.get("sales_lineDiscountPercent").asDouble();
                        } else if (line.has("sales_discountPercent")) {
                            salesDiscountPercent = line.get("sales_discountPercent").asDouble();
                        }

                        double linePublicHT = qty * publicPrice;
                        double clientCostPrice = publicPrice * (1.0 - (salesDiscountPercent / 100.0));
                        double lineClientCostHT = qty * clientCostPrice;
                        
                        // STAR price has a 10% markup on client cost
                        double starCostPrice = clientCostPrice * 1.10;
                        double lineStarHT = qty * starCostPrice;
                        
                        // STAR gain is public price minus STAR price
                        double lineStarGainHT = linePublicHT - lineStarHT;

                        ((ObjectNode) line).put("clientDiscountPercent", salesDiscountPercent);
                        ((ObjectNode) line).put("clientCostUnitPrice", clientCostPrice);
                        ((ObjectNode) line).put("starUnitPrice", starCostPrice);
                        ((ObjectNode) line).put("starGainUnitPrice", publicPrice - starCostPrice);
                        ((ObjectNode) line).put("totalPublicHT", linePublicHT);
                        ((ObjectNode) line).put("totalClientCostHT", lineClientCostHT);
                        ((ObjectNode) line).put("totalStarHT", lineStarHT);
                        ((ObjectNode) line).put("totalStarGainHT", lineStarGainHT);

                        orderTotalPublicHT += linePublicHT;
                        orderTotalClientCostHT += lineClientCostHT;
                        orderTotalStarHT += lineStarHT;
                        orderTotalStarGainHT += lineStarGainHT;
                    }

                    ObjectNode orderObj = mapper.createObjectNode();
                    orderObj.put("id", orderId);
                    orderObj.put("number", orderNumber);
                    orderObj.put("orderDate", orderDate);
                    orderObj.put("vendorName", vendorName);
                    orderObj.put("payToVendorNumber", payToVendorNumber);
                    orderObj.put("insuranceName", insName);
                    orderObj.put("insuredName", insuredName);
                    orderObj.put("registrationNumber", registrationNumber);
                    orderObj.put("vin", vin);
                    orderObj.put("customerNumber", customerNumber);
                    orderObj.put("customerName", order.has("SellToCustomerName") ? order.get("SellToCustomerName").asText() : "");
                    orderObj.put("totalPublicHT", orderTotalPublicHT);
                    orderObj.put("totalClientCostHT", orderTotalClientCostHT);
                    orderObj.put("totalStarHT", orderTotalStarHT);
                    orderObj.put("totalStarGainHT", orderTotalStarGainHT);
                    orderObj.set("lines", enrichedLines);

                    ordersArray.add(orderObj);

                    grandTotalPublicHT += orderTotalPublicHT;
                    grandTotalClientCostHT += orderTotalClientCostHT;
                    grandTotalStarHT += orderTotalStarHT;
                    grandTotalStarGainHT += orderTotalStarGainHT;
                }
            }

            ObjectNode totalsObj = mapper.createObjectNode();
            totalsObj.put("totalPublicHT", grandTotalPublicHT);
            totalsObj.put("totalClientCostHT", grandTotalClientCostHT);
            totalsObj.put("totalStarHT", grandTotalStarHT);
            totalsObj.put("totalStarGainHT", grandTotalStarGainHT);

            resultNode.set("orders", ordersArray);
            resultNode.set("totals", totalsObj);

            return ResponseEntity.ok(mapper.writeValueAsString(resultNode));

        } catch (Exception e) {
            log.error(">>> Error generating insurance report: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body("Error generating report: " + e.getMessage());
        }
    }

    private void enrichLinesFromSalesAPI(String orderNumber, JsonNode poLines, ArrayNode enrichedLines, String token) {
        if (poLines == null || !poLines.isArray()) {
            return;
        }

        // Initialize enrichedLines with copies of PO lines
        for (JsonNode poLine : poLines) {
            enrichedLines.add(poLine.deepCopy());
        }

        try {
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
                    .timeout(Duration.ofSeconds(15))
                    .block(Duration.ofSeconds(30));

            JsonNode salesData = mapper.readTree(response);
            JsonNode salesOrders = salesData.has("value") ? salesData.get("value") : salesData;

            if (salesOrders.isArray() && salesOrders.size() > 0) {
                JsonNode salesOrder = salesOrders.get(0);
                JsonNode soLines = salesOrder.has("plexussalesOrderLines")
                        ? salesOrder.get("plexussalesOrderLines")
                        : (salesOrder.has("PlexussalesOrderLines") ? salesOrder.get("PlexussalesOrderLines") : null);

                if (soLines != null && soLines.isArray()) {
                    for (JsonNode poLine : enrichedLines) {
                        String poLineObjNo = poLine.has("lineObjectNumber") ? poLine.get("lineObjectNumber").asText() : "";
                        for (JsonNode soLine : soLines) {
                            String soLineObjNo = soLine.has("lineObjectNumber") ? soLine.get("lineObjectNumber").asText() : "";
                            if (!poLineObjNo.isEmpty() && poLineObjNo.equals(soLineObjNo)) {
                                ObjectNode poLineObj = (ObjectNode) poLine;

                                // Inject sales discount properties
                                if (soLine.has("lineDiscountPercent")) {
                                    poLineObj.put("salesDiscountPercent", soLine.get("lineDiscountPercent").asDouble());
                                } else if (soLine.has("discountPercent")) {
                                    poLineObj.put("salesDiscountPercent", soLine.get("discountPercent").asDouble());
                                }

                                if (soLine.has("lineDiscountAmount")) {
                                    poLineObj.put("salesDiscountAmount", soLine.get("lineDiscountAmount").asDouble());
                                } else if (soLine.has("discountAmount")) {
                                    poLineObj.put("salesDiscountAmount", soLine.get("discountAmount").asDouble());
                                }

                                // Copy other sales fields if needed
                                Iterator<Map.Entry<String, JsonNode>> fields = soLine.fields();
                                while (fields.hasNext()) {
                                    Map.Entry<String, JsonNode> field = fields.next();
                                    if (field.getKey().toLowerCase().contains("discount")) {
                                        poLineObj.put("sales_" + field.getKey(), field.getValue().asText());
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn(">>> Sales discount enrichment for report PO {} failed: {}", orderNumber, e.getMessage());
        }
    }
}
