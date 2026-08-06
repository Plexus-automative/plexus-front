package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

/**
 * Factures vente (facture client).
 *
 * Reproduit le flux réel de Business Central : une facture n'est jamais saisie
 * de zéro, elle est bâtie depuis un ou plusieurs BL validés (Sales Shipment),
 * puis validée avec le timbre fiscal 437005 et les groupes comptables complétés.
 * Toute cette logique vit dans l'extension AL (codeunit "Plexus Sales Invoice Mgt",
 * partagée avec l'action "Valider" de la page Facture Vente) et est exposée par
 * l'entité API {@code plexusSalesInvoices} : ce contrôleur ne fait que l'appeler.
 *
 * Réservé à l'opérateur Plexus (C0090) — c'est lui qui facture les clients.
 */
@RestController
@RequestMapping("/api/sales-invoices")
@Slf4j
public class SalesInvoiceController {

    private static final String PLEXUS_CUSTOMER_NO = "C0090";

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public SalesInvoiceController(WebClient webClient, BusinessCentralTokenService tokenService) {
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
     * Crée (et valide par défaut) une facture vente à partir de BL validés.
     *
     * Body : { "shipmentNumbers": ["BL26/00572", ...], "insuredName": "...", "post": true }
     * ou    : { "shipmentNumber": "BL26/00572" }
     *
     * Réponse : { "invoiceNumber": "FVE26/0515", "customerNo": "C0090",
     *             "posted": true, "totalAmountIncludingTax": 2250.126 }
     */
    @PostMapping("/from-shipment")
    public ResponseEntity<String> createFromShipment(HttpServletRequest request,
            @RequestBody String body) {
        String customerNo = request.getHeader("X-Customer-No");
        if (!PLEXUS_CUSTOMER_NO.equals(customerNo)) {
            return ResponseEntity.status(403).body("{\"error\": \"Réservé à Plexus (C0090)\"}");
        }

        try {
            JsonNode root = mapper.readTree(body);

            StringBuilder shipments = new StringBuilder();
            JsonNode listNode = root.get("shipmentNumbers");
            if (listNode != null && listNode.isArray()) {
                for (JsonNode n : listNode) {
                    String value = n.asText("").trim();
                    if (value.isEmpty()) continue;
                    if (shipments.length() > 0) shipments.append(',');
                    shipments.append(value);
                }
            } else if (root.hasNonNull("shipmentNumber")) {
                shipments.append(root.get("shipmentNumber").asText("").trim());
            }

            if (shipments.length() == 0) {
                return ResponseEntity.badRequest().body("{\"error\": \"Aucun n° de BL fourni\"}");
            }

            boolean post = !root.has("post") || root.get("post").asBoolean(true);
            String insuredName = root.hasNonNull("insuredName") ? root.get("insuredName").asText("") : "";

            ObjectNode payload = mapper.createObjectNode();
            payload.put("shipmentNos", shipments.toString());
            payload.put("insuredName", insuredName);
            payload.put("postInvoice", post);

            String url = tarekSystemUrl + "/plexusSalesInvoices";
            log.info("Creating sales invoice from shipment(s): POST {} payload: {}", url, payload);

            String response = webClient.post()
                    .uri(java.net.URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .bodyValue(payload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(120));

            JsonNode created = mapper.readTree(response);
            ObjectNode out = mapper.createObjectNode();
            out.put("invoiceNumber", created.path("invoiceNo").asText(""));
            out.put("customerNo", created.path("customerNo").asText(""));
            out.put("posted", created.path("posted").asBoolean(false));
            out.put("totalAmountIncludingTax", created.path("totalAmountIncludingTax").asDouble(0.0));
            out.put("shipmentNumbers", shipments.toString());

            log.info("Sales invoice created: {}", out);
            return ResponseEntity.ok(mapper.writeValueAsString(out));

        } catch (WebClientResponseException e) {
            // Les erreurs métier AL (BL introuvable, déjà facturé, clients différents)
            // remontent ici telles quelles : on les renvoie au front sans les masquer.
            log.error("BC API Error creating sales invoice: (HTTP {}) {}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error creating sales invoice: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
