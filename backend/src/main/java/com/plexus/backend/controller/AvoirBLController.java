package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Avoir fournisseur sur BL non facturé — portail fournisseur.
 *
 * Business Central ne sait pas réduire un BL par un Purchase Credit Memo : un avoir
 * s'applique contre du facturé, pas contre du reçu-non-facturé. Le mécanisme correct est
 * "Undo Purchase Receipt Line" suivi d'un nouveau Receive aux quantités corrigées. Toute
 * cette logique vit dans l'extension AL (codeunit "Plexus Avoir BL Mgt", partagée avec
 * l'action "Avoir fournisseur sur BL" de la page BL) et est exposée par l'entité API
 * {@code plexusAvoirBLs} : ce contrôleur ne fait que l'appeler.
 *
 * Cloisonnement fournisseur : le n° fournisseur vient du header X-Vendor-No posé par
 * l'intercepteur axios depuis la session — jamais du body. Il est revérifié dans l'AL,
 * pour qu'un appel direct à l'API ne puisse pas contourner ce contrôleur.
 */
@RestController
@RequestMapping("/api/avoir-bl")
@Slf4j
public class AvoirBLController {

    private static final String PLEXUS_CUSTOMER_NO = "C0090";
    private static final int PAGE_SIZE = 500;
    private static final int MAX_PAGES = 40;

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Coupe-circuit. /apply supprime des documents enregistrés : masquer l'entrée de menu ne
     * suffirait pas à mettre la fonctionnalité hors service, la route et l'API restent
     * atteignables. Couper avec AVOIR_BL_ENABLED=false.
     */
    @Value("${avoir-bl.enabled:true}")
    private boolean featureEnabled;

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public AvoirBLController(WebClient webClient, BusinessCentralTokenService tokenService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
    }

    /**
     * Les BL (expéditions vente BL26/…) du fournisseur connecté encore avoirables : rien de
     * facturé dessus. Triés du plus récent au plus ancien.
     *
     * Réponse : { "receipts": [ { "documentNo", "postingDate", "vendorNo", "salesOrderNo",
     *                             "orderNo", "customerNo",
     *                             "lines": [ { "lineNo", "itemNo", "description",
     *                                          "unitOfMeasureCode", "quantity",
     *                                          "qtyShippedNotInvoiced", "unitPrice" } ] } ] }
     */
    @GetMapping("/receipts")
    public ResponseEntity<String> listReceipts(HttpServletRequest request,
            @RequestParam(required = false) String vendorNo) {
        if (!featureEnabled) {
            return featureDisabled();
        }
        String scopedVendor = resolveVendor(request, vendorNo);
        if (scopedVendor == null) {
            return ResponseEntity.status(403)
                    .body("{\"error\": \"Aucun fournisseur associé à ce compte\"}");
        }

        try {
            List<JsonNode> lines = fetchAvoirableLines(scopedVendor);
            Set<String> invoicedPurchaseOrders = fetchInvoicedPurchaseOrders(scopedVendor);
            return ResponseEntity.ok(mapper.writeValueAsString(
                    groupByReceipt(lines, invoicedPurchaseOrders)));
        } catch (WebClientResponseException e) {
            log.error("BC API Error listing avoirable receipts for {}: (HTTP {}) {}", scopedVendor,
                    e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error listing avoirable receipts: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Applique l'avoir du fournisseur sur un BL.
     *
     * Body : { "receiptNo": "BL26/00580",
     *          "lines": [ { "lineNo": 10000, "newQty": 3 }, { "lineNo": 20000, "newQty": 0 } ] }
     *
     * Le BL garde son numéro : il est supprimé puis réenregistré avec les quantités corrigées,
     * et la commande achat + sa réception suivent.
     *
     * Réponse : { "receiptNo": "BL26/00580", "salesOrderNo": "CV26/00559",
     *             "orderNo": "CA26/2094", "applied": true, "linesAffected": 2 }
     */
    @PostMapping("/apply")
    public ResponseEntity<String> apply(HttpServletRequest request, @RequestBody String body) {
        if (!featureEnabled) {
            return featureDisabled();
        }
        String scopedVendor = resolveVendor(request, null);
        if (scopedVendor == null) {
            return ResponseEntity.status(403)
                    .body("{\"error\": \"Aucun fournisseur associé à ce compte\"}");
        }

        try {
            JsonNode root = mapper.readTree(body);
            String receiptNo = root.path("receiptNo").asText("").trim();
            if (receiptNo.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"receiptNo manquant\"}");
            }

            JsonNode linesNode = root.get("lines");
            if (linesNode == null || !linesNode.isArray() || linesNode.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Aucune ligne à avoirer\"}");
            }

            StringBuilder lines = new StringBuilder();
            for (JsonNode line : linesNode) {
                int lineNo = line.path("lineNo").asInt(0);
                if (lineNo == 0) {
                    return ResponseEntity.badRequest().body("{\"error\": \"lineNo manquant sur une ligne\"}");
                }
                double newQty = line.path("newQty").asDouble(-1);
                if (newQty < 0) {
                    return ResponseEntity.badRequest()
                            .body("{\"error\": \"newQty manquante ou négative sur la ligne " + lineNo + "\"}");
                }
                if (lines.length() > 0) lines.append('|');
                lines.append(lineNo).append(':').append(trimNumber(newQty));
            }

            ObjectNode payload = mapper.createObjectNode();
            payload.put("shipmentNo", receiptNo);
            payload.put("vendorNo", scopedVendor);
            payload.put("lines", lines.toString());

            String url = tarekSystemUrl + "/plexusAvoirBLs";
            log.info("Applying avoir BL for vendor {}: POST {} payload: {}", scopedVendor, url, payload);

            String response = webClient.post()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .bodyValue(payload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(180));

            JsonNode created = mapper.readTree(response);
            ObjectNode out = mapper.createObjectNode();
            out.put("receiptNo", receiptNo);
            out.put("salesOrderNo", created.path("salesOrderNo").asText(""));
            out.put("orderNo", created.path("orderNo").asText(""));
            out.put("applied", created.path("applied").asBoolean(false));
            out.put("linesAffected", created.path("linesAffected").asInt(0));

            log.info("Avoir BL applied: {}", out);
            return ResponseEntity.ok(mapper.writeValueAsString(out));

        } catch (WebClientResponseException e) {
            // Erreurs métier AL (ligne déjà facturée, marchandise déjà expédiée, mauvais
            // fournisseur) : on les remonte telles quelles, le front les affiche au fournisseur.
            log.error("BC API Error applying avoir BL: (HTTP {}) {}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error applying avoir BL: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Le fournisseur de la session. Plexus (C0090) peut viser un fournisseur précis via
     * ?vendorNo= ; un fournisseur connecté est enfermé sur le sien, le paramètre est ignoré.
     */
    private ResponseEntity<String> featureDisabled() {
        return ResponseEntity.status(503)
                .body("{\"error\": \"L'avoir sur BL n'est pas encore disponible.\"}");
    }

    private String resolveVendor(HttpServletRequest request, String requestedVendorNo) {
        String sessionVendor = request.getHeader("X-Vendor-No");
        if (sessionVendor != null && !sessionVendor.isBlank()) {
            return sessionVendor.trim();
        }
        if (PLEXUS_CUSTOMER_NO.equals(request.getHeader("X-Customer-No"))
                && requestedVendorNo != null && !requestedVendorNo.isBlank()) {
            return requestedVendorNo.trim();
        }
        return null;
    }

    private List<JsonNode> fetchAvoirableLines(String vendorNo) throws Exception {
        // AND entre champs distincts uniquement : BC rejette le OR sur des champs différents.
        // Le "déjà facturé" n'est PAS filtré ici : c'est une règle par BL, pas par ligne
        // (voir groupByReceipt). Un $filter ligne à ligne afficherait un BL partiellement
        // facturé amputé de ses lignes facturées, avant que le codeunit ne le refuse.
        String filter = "vendorNo eq '" + vendorNo.replace("'", "''") + "'"
                + " and quantity gt 0";

        String url = tarekSystemUrl + "/plexusAvoirBLLines"
                + "?$filter=" + odataEncode(filter)
                + "&$top=" + PAGE_SIZE;

        List<JsonNode> all = new ArrayList<>();
        int pages = 0;
        while (url != null && pages < MAX_PAGES) {
            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(120));

            JsonNode root = mapper.readTree(response);
            for (JsonNode line : root.path("value")) {
                all.add(line);
            }
            url = root.hasNonNull("@odata.nextLink") ? root.get("@odata.nextLink").asText() : null;
            pages++;
        }
        if (url != null) {
            log.warn("Avoir BL: arrêt à {} pages pour le fournisseur {} — liste tronquée", MAX_PAGES, vendorNo);
        }
        return all;
    }

    /**
     * Les commandes achat du fournisseur qui portent déjà une facture. Requête séparée plutôt
     * qu'une jointure dans la query : un dataitem Purchase Line en LeftOuterJoin filtré sur
     * "Document Type" se comporte comme un INNER JOIN et vidait tout le résultat.
     */
    private Set<String> fetchInvoicedPurchaseOrders(String vendorNo) throws Exception {
        String filter = "buyFromVendorNo eq '" + vendorNo.replace("'", "''") + "'"
                + " and quantityInvoiced gt 0";

        String url = tarekSystemUrl + "/plexusPurchReceiptLines"
                + "?$filter=" + odataEncode(filter)
                + "&$top=" + PAGE_SIZE;

        Set<String> orders = new HashSet<>();
        int pages = 0;
        while (url != null && pages < MAX_PAGES) {
            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(120));

            JsonNode root = mapper.readTree(response);
            for (JsonNode line : root.path("value")) {
                String orderNo = line.path("orderNo").asText("");
                if (!orderNo.isEmpty()) {
                    orders.add(orderNo);
                }
            }
            url = root.hasNonNull("@odata.nextLink") ? root.get("@odata.nextLink").asText() : null;
            pages++;
        }
        return orders;
    }

    private ObjectNode groupByReceipt(List<JsonNode> lines, Set<String> invoicedPurchaseOrders) {
        Map<String, ObjectNode> byShipment = new LinkedHashMap<>();
        // La query joint sur le seul n° de commande vente : une ligne de BL ressort autant de
        // fois que la commande achat a de lignes. On dédoublonne sur (BL, ligne).
        Set<String> seenLines = new HashSet<>();

        // Dès qu'une facture existe sur le BL — vente OU achat, sur n'importe quelle ligne —
        // le BL entier sort de la liste : l'avoir est alors impossible et le codeunit le
        // refuserait. Passe préalable, car une ligne facturée peut apparaître après une autre
        // qui ne l'est pas.
        Set<String> invoicedShipments = new HashSet<>();
        for (JsonNode line : lines) {
            if (line.path("quantityInvoiced").asDouble(0) != 0
                    || invoicedPurchaseOrders.contains(line.path("purchOrderNo").asText(""))) {
                invoicedShipments.add(line.path("shipmentNo").asText(""));
            }
        }

        for (JsonNode line : lines) {
            String shipmentNo = line.path("shipmentNo").asText("");
            if (invoicedShipments.contains(shipmentNo)) {
                continue;
            }
            int lineNo = line.path("lineNo").asInt(0);
            if (!seenLines.add(shipmentNo + "#" + lineNo)) {
                continue;
            }

            ObjectNode shipment = byShipment.get(shipmentNo);
            if (shipment == null) {
                shipment = mapper.createObjectNode();
                shipment.put("documentNo", shipmentNo);
                shipment.put("postingDate", line.path("postingDate").asText(""));
                shipment.put("vendorNo", line.path("vendorNo").asText(""));
                shipment.put("salesOrderNo", line.path("salesOrderNo").asText(""));
                shipment.put("orderNo", line.path("purchOrderNo").asText(""));
                shipment.put("customerNo", line.path("sellToCustomerNo").asText(""));
                shipment.put("customerName", line.path("sellToCustomerName").asText(""));
                shipment.set("lines", mapper.createArrayNode());
                byShipment.put(shipmentNo, shipment);
            }

            ObjectNode out = mapper.createObjectNode();
            out.put("lineNo", lineNo);
            out.put("itemNo", line.path("itemNo").asText(""));
            out.put("description", line.path("description").asText(""));
            out.put("unitOfMeasureCode", line.path("unitOfMeasureCode").asText(""));
            out.put("quantity", line.path("quantity").asDouble(0));
            out.put("qtyShippedNotInvoiced", line.path("qtyShippedNotInvoiced").asDouble(0));
            out.put("unitPrice", line.path("unitPrice").asDouble(0));
            out.put("qtyAvoir", line.path("qtyAvoir").asDouble(0));
            ((ArrayNode) shipment.get("lines")).add(out);
        }

        // Par n° de BL décroissant : les numéros sont séquentiels, donc les plus récents
        // ressortent en tête tout en gardant une liste que le fournisseur peut parcourir
        // dans l'ordre de sa propre numérotation.
        List<ObjectNode> ordered = new ArrayList<>(byShipment.values());
        ordered.sort(Comparator.comparing(
                (ObjectNode n) -> n.path("documentNo").asText("")).reversed());

        ObjectNode result = mapper.createObjectNode();
        ArrayNode receipts = mapper.createArrayNode();
        ordered.forEach(receipts::add);
        result.set("receipts", receipts);
        result.put("count", receipts.size());
        return result;
    }

    /** BC ne lit pas '+' comme une espace : encoder à la main, jamais avec URLEncoder. */
    private static String odataEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    /** 3.0 -> "3", 2.5 -> "2.5" : l'AL évalue un Decimal, on évite les notations exotiques. */
    private static String trimNumber(double value) {
        if (value == Math.rint(value)) {
            return String.valueOf((long) value);
        }
        return String.valueOf(value);
    }
}
