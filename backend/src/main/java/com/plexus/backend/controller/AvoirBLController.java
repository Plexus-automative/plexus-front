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

import com.plexus.backend.service.AvoirGeneratorService;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
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
    private final AvoirGeneratorService avoirGeneratorService;
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

    public AvoirBLController(WebClient webClient, BusinessCentralTokenService tokenService,
            AvoirGeneratorService avoirGeneratorService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.avoirGeneratorService = avoirGeneratorService;
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
            ObjectNode result = groupByReceipt(lines, invoicedPurchaseOrders);
            attachAvoirNumbers(result, scopedVendor);
            return ResponseEntity.ok(mapper.writeValueAsString(result));
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
    /**
     * Le document « Avoir fournisseur » en PDF, à remettre avec le bon de livraison : c'est
     * lui qui explique à la comptabilité l'écart entre le BL et la facture.
     *
     * Ouvert à Plexus comme au fournisseur concerné — ce dernier ne peut tirer que les avoirs
     * portant son propre n° de fournisseur, contrôle fait sur les lignes du journal.
     *
     * Le n° passe en paramètre et NON dans le chemin : il contient un slash (AVF26/0001), que
     * Tomcat refuse même encodé en %2F, et que Spring tronquerait sinon à « AVF26 ».
     */
    @GetMapping("/document")
    public ResponseEntity<byte[]> avoirDocument(HttpServletRequest request, @RequestParam String avoirNo) {
        if (!featureEnabled) {
            return ResponseEntity.status(503).body("Indisponible".getBytes(StandardCharsets.UTF_8));
        }

        try {
            List<JsonNode> all = fetchAvoirLog(avoirNo);
            if (all.isEmpty()) {
                return ResponseEntity.status(404).body(("Avoir introuvable : " + avoirNo).getBytes(StandardCharsets.UTF_8));
            }

            String sessionVendor = request.getHeader("X-Vendor-No");
            String avoirVendor = all.get(0).path("vendorNo").asText("");
            boolean isPlexus = PLEXUS_CUSTOMER_NO.equals(request.getHeader("X-Customer-No"));
            if (!isPlexus && sessionVendor != null && !sessionVendor.isBlank()
                    && !sessionVendor.trim().equals(avoirVendor)) {
                return ResponseEntity.status(403).body("Accès refusé".getBytes(StandardCharsets.UTF_8));
            }

            // Le document reprend le volet VENTE : c'est le BL remis au client qui est corrigé.
            List<JsonNode> salesLines = new ArrayList<>();
            for (JsonNode line : all) {
                if ("Vente".equalsIgnoreCase(line.path("side").asText(""))) {
                    salesLines.add(line);
                }
            }
            if (salesLines.isEmpty()) {
                salesLines = all;
            }

            JsonNode first = salesLines.get(0);
            ObjectNode context = mapper.createObjectNode();
            context.put("shipmentNo", first.path("shipmentNo").asText(""));
            context.put("purchaseOrderNo", first.path("purchaseOrderNo").asText(""));
            context.put("salesOrderNo", first.path("salesOrderNo").asText(""));
            context.put("appliedAt", first.path("appliedAt").asText(""));
            JsonNode shipmentInfo = fetchShipmentInfo(first.path("shipmentNo").asText(""));
            context.put("vendorNo", first.path("vendorNo").asText(""));
            context.put("vendorName", resolveVendorName(first.path("vendorNo").asText("")));
            context.put("customerNo", shipmentInfo.path("sellToCustomerNo").asText(""));
            context.put("customerName", shipmentInfo.path("sellToCustomerName").asText(""));

            byte[] pdf = avoirGeneratorService.generateAvoir(avoirNo, salesLines, context);
            String filename = "Avoir_" + avoirNo.replace("/", "-") + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                    .body(pdf);

        } catch (Exception e) {
            log.error("Error generating avoir document {}: {}", avoirNo, e.getMessage());
            return ResponseEntity.status(500)
                    .body(("Erreur génération avoir : " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
        }
    }

    /**
     * Accroche à chaque BL les n° d'avoir déjà émis, pour que le fournisseur puisse
     * retélécharger le document remis avec le bon de livraison.
     */
    private void attachAvoirNumbers(ObjectNode result, String vendorNo) {
        Map<String, Set<String>> byShipment = new LinkedHashMap<>();
        try {
            String filter = "vendorNo eq '" + vendorNo.replace("'", "''") + "'";
            for (JsonNode entry : fetchQueryPaged("/plexusAvoirBLLogs", filter)) {
                String avoirNo = entry.path("avoirNo").asText("");
                String shipmentNo = entry.path("shipmentNo").asText("");
                if (!avoirNo.isEmpty() && !shipmentNo.isEmpty()) {
                    byShipment.computeIfAbsent(shipmentNo, k -> new LinkedHashSet<>()).add(avoirNo);
                }
            }
        } catch (Exception e) {
            // Sans ces numéros la liste reste utilisable : on n'échoue pas pour un libellé.
            log.warn("N° d'avoir indisponibles pour {} : {}", vendorNo, e.getMessage());
            return;
        }

        for (JsonNode shipment : result.path("receipts")) {
            Set<String> numbers = byShipment.get(shipment.path("documentNo").asText(""));
            ArrayNode arr = mapper.createArrayNode();
            if (numbers != null) {
                numbers.forEach(arr::add);
            }
            ((ObjectNode) shipment).set("avoirNos", arr);
        }
    }

    private List<JsonNode> fetchAvoirLog(String avoirNo) throws Exception {
        String url = tarekSystemUrl + "/plexusAvoirBLLogs"
                + "?$filter=" + odataEncode("avoirNo eq '" + avoirNo.replace("'", "''") + "'")
                + "&$top=" + PAGE_SIZE;

        String response = webClient.get()
                .uri(URI.create(url))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(120));

        List<JsonNode> out = new ArrayList<>();
        for (JsonNode line : mapper.readTree(response).path("value")) {
            out.add(line);
        }
        return out;
    }

    /** Le nom du fournisseur, pour l'en-tête du document. Silencieux si indisponible. */
    private String resolveVendorName(String vendorNo) {
        if (vendorNo == null || vendorNo.isBlank()) {
            return "";
        }
        try {
            String url = tarekSystemUrl + "/plexusVendors?$filter="
                    + odataEncode("number eq '" + vendorNo.replace("'", "''") + "'") + "&$top=1";
            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));
            JsonNode values = mapper.readTree(response).path("value");
            return values.isEmpty() ? vendorNo : values.get(0).path("name").asText(vendorNo);
        } catch (Exception e) {
            log.warn("Nom fournisseur {} indisponible : {}", vendorNo, e.getMessage());
            return vendorNo;
        }
    }

    /** Une ligne du BL, pour en tirer le client livré. Objet vide si indisponible. */
    private JsonNode fetchShipmentInfo(String shipmentNo) {
        if (shipmentNo == null || shipmentNo.isBlank()) {
            return mapper.createObjectNode();
        }
        try {
            String url = tarekSystemUrl + "/plexusAvoirBLLines?$filter="
                    + odataEncode("shipmentNo eq '" + shipmentNo.replace("'", "''") + "'") + "&$top=1";
            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));
            JsonNode values = mapper.readTree(response).path("value");
            return values.isEmpty() ? mapper.createObjectNode() : values.get(0);
        } catch (Exception e) {
            // Le document reste imprimable sans le nom du client : on ne bloque pas pour ça.
            log.warn("Infos client du BL {} indisponibles : {}", shipmentNo, e.getMessage());
            return mapper.createObjectNode();
        }
    }

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
        //
        // quantityInvoiced eq 0 est indispensable, pas cosmétique : sans lui un fournisseur
        // installé depuis 2020 ramène des milliers de lignes (mesuré : 500 contre 66 pour
        // F0018), la lecture est tronquée, et comme les lignes sortent dans l'ordre de la
        // table ce sont les BL RÉCENTS qui disparaissent — exactement le symptôme constaté.
        //
        // Contrepartie assumée : un BL partiellement facturé n'arrive ici qu'avec ses lignes
        // saines. C'est rare (BC facture une expédition entière via Get Shipment Lines) et le
        // codeunit refuse alors l'avoir avec un message explicite.
        String filter = "vendorNo eq '" + vendorNo.replace("'", "''") + "'"
                + " and quantity gt 0 and quantityInvoiced eq 0";

        return fetchQueryPaged("/plexusAvoirBLLines", filter);
    }

    /**
     * Lecture paginée d'une query API.
     *
     * <p>Les query objects de BC ne renvoient PAS de {@code @odata.nextLink} : se fier à ce
     * lien fait croire à une lecture complète alors que $top a silencieusement coupé. On
     * pagine donc sur $skip, et on s'arrête quand une page revient incomplète.
     */
    private List<JsonNode> fetchQueryPaged(String entity, String filter) throws Exception {
        List<JsonNode> all = new ArrayList<>();
        int page = 0;

        while (page < MAX_PAGES) {
            String url = tarekSystemUrl + entity
                    + "?$filter=" + odataEncode(filter)
                    + "&$top=" + PAGE_SIZE
                    + "&$skip=" + (page * PAGE_SIZE);

            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(120));

            JsonNode values = mapper.readTree(response).path("value");
            int count = 0;
            for (JsonNode line : values) {
                all.add(line);
                count++;
            }

            if (count < PAGE_SIZE) {
                return all;
            }
            page++;
        }

        log.warn("Avoir BL: {} arrêté à {} pages ({} lignes) — lecture tronquée",
                entity, MAX_PAGES, all.size());
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

        Set<String> orders = new HashSet<>();
        for (JsonNode line : fetchQueryPaged("/plexusPurchReceiptLines", filter)) {
            String orderNo = line.path("orderNo").asText("");
            if (!orderNo.isEmpty()) {
                orders.add(orderNo);
            }
        }
        return orders;
    }

    private ObjectNode groupByReceipt(List<JsonNode> lines, Set<String> invoicedPurchaseOrders) {
        Map<String, ObjectNode> byShipment = new LinkedHashMap<>();
        // La query joint sur le seul n° de commande vente : une ligne de BL ressort autant de
        // fois que la commande achat a de lignes. On dédoublonne sur (BL, ligne).
        Set<String> seenLines = new HashSet<>();

        // Un BL dont la commande achat est déjà facturée sort en entier : l'avoir devrait
        // alors corriger une facture achat existante, ce que le codeunit refuse.
        // (Le côté vente, lui, est déjà écarté par le $filter quantityInvoiced eq 0.)
        // Passe préalable : la ligne qui disqualifie le BL peut arriver après les autres.
        Set<String> invoicedShipments = new HashSet<>();
        for (JsonNode line : lines) {
            if (invoicedPurchaseOrders.contains(line.path("purchOrderNo").asText(""))) {
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
