package com.plexus.backend.controller;

import com.plexus.backend.security.JwtUtil;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Application mobile du chauffeur-livreur.
 *
 * Le livreur est chez le client, bon de livraison en main. Le client refuse une pièce : au
 * lieu d'attendre que le fournisseur le déclare depuis son portail, le livreur saisit
 * l'avoir sur place, et la facture partira du net dès le premier passage.
 *
 * C'est le MÊME mécanisme que « Mes BL » côté fournisseur — codeunit "Plexus Avoir BL Sales
 * Mgt" via l'entité API {@code plexusAvoirBLs} — mais sans le cloisonnement fournisseur : le
 * livreur n'a pas de n° fournisseur, il ouvre le BL par son numéro. Le n° de fournisseur
 * envoyé à l'AL est donc vide (= appel interne Plexus, pas de contrôle), et c'est le champ
 * {@code source} qui dit au journal qui a saisi l'avoir.
 *
 * Contrôle d'accès : rôle « Livreur » dans le JWT, posé au login depuis le champ Role de
 * Business Central. Plexus (C0090) est admis en plus, pour tester depuis le tableau de bord.
 */
@RestController
@RequestMapping("/api/livreur")
@Slf4j
public class LivreurController {

    private static final String PLEXUS_CUSTOMER_NO = "C0090";
    private static final String LIVREUR_ROLE = "Livreur";
    /** Un BL n'a jamais des centaines de lignes : une page suffit, tout est filtré sur un seul n°. */
    private static final int PAGE_SIZE = 500;

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper mapper = new ObjectMapper();

    /** Même coupe-circuit que le portail : /avoir écrit dans des documents enregistrés. */
    @Value("${avoir-bl.enabled:true}")
    private boolean featureEnabled;

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public LivreurController(WebClient webClient, BusinessCentralTokenService tokenService,
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
     * Le BL saisi par le livreur, tel qu'il doit s'afficher pour vérification AVANT tout
     * avoir : client livré, fournisseur, lignes, et ce qu'il reste avoirable sur chacune.
     *
     * Le numéro est accepté sous toutes les formes que donne un clavier de téléphone :
     * « 580 », « bl26/580 », « BL26/00580 ». Voir {@link #normalizeShipmentNo}.
     *
     * Réponse 200 même quand le BL n'est PAS avoirable : {@code avoirable:false} +
     * {@code blockedReason}. L'app doit montrer le BL (le livreur veut savoir qu'il a tapé le
     * bon numéro) et expliquer pourquoi le bouton est grisé — un 4xx muet ne dirait rien.
     */
    @GetMapping("/bl")
    public ResponseEntity<String> lookup(HttpServletRequest request,
            @RequestParam("no") String no) {
        if (!featureEnabled) {
            return featureDisabled();
        }
        if (!isLivreur(request)) {
            return forbidden();
        }

        String shipmentNo = normalizeShipmentNo(no);
        if (shipmentNo.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\":\"N° de BL manquant\"}");
        }

        try {
            List<JsonNode> lines = fetchShipmentLines(shipmentNo);
            if (lines.isEmpty()) {
                return ResponseEntity.status(404).body(
                        "{\"error\":\"Aucun BL " + jsonEscape(shipmentNo) + " dans Business Central.\","
                                + "\"documentNo\":\"" + jsonEscape(shipmentNo) + "\"}");
            }
            return ResponseEntity.ok(mapper.writeValueAsString(buildShipment(shipmentNo, lines)));
        } catch (WebClientResponseException e) {
            log.error("BC API Error looking up BL {}: (HTTP {}) {}", shipmentNo, e.getStatusCode(),
                    e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error looking up BL {}: {}", shipmentNo, e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Enregistre l'avoir saisi par le livreur.
     *
     * Body : { "blNo": "BL26/00580",
     *          "lines": [ { "lineNo": 10000, "newQty": 3 }, { "lineNo": 20000, "newQty": 0 } ] }
     *
     * {@code newQty} = ce que le client GARDE sur la ligne, comme dans le portail : c'est la
     * même sémantique de bout en bout, l'AL n'a pas à deviner de quel côté on compte.
     *
     * Réponse : { "avoirNo": "AVF26/0004", "documentNo": "BL26/00580",
     *             "salesOrderNo": "…", "orderNo": "…", "linesAffected": 2, "applied": true }
     */
    @PostMapping("/avoir")
    public ResponseEntity<String> createAvoir(HttpServletRequest request, @RequestBody String body) {
        if (!featureEnabled) {
            return featureDisabled();
        }
        if (!isLivreur(request)) {
            return forbidden();
        }

        try {
            JsonNode root = mapper.readTree(body);
            String shipmentNo = normalizeShipmentNo(root.path("blNo").asText(""));
            if (shipmentNo.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"N° de BL manquant\"}");
            }

            JsonNode requested = root.get("lines");
            if (requested == null || !requested.isArray() || requested.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Aucune ligne à avoirer\"}");
            }

            // Relire le BL plutôt que faire confiance au téléphone : entre l'affichage et le
            // bouton, une facture a pu passer ou un premier avoir être saisi ailleurs.
            List<JsonNode> current = fetchShipmentLines(shipmentNo);
            if (current.isEmpty()) {
                return ResponseEntity.status(404)
                        .body("{\"error\":\"BL " + jsonEscape(shipmentNo) + " introuvable\"}");
            }
            ObjectNode shipment = buildShipment(shipmentNo, current);
            if (!shipment.path("avoirable").asBoolean(false)) {
                return ResponseEntity.status(409).body("{\"error\":\""
                        + jsonEscape(shipment.path("blockedReason").asText("Ce BL n'est plus avoirable."))
                        + "\"}");
            }

            StringBuilder payloadLines = new StringBuilder();
            int changed = 0;
            Set<Integer> seen = new HashSet<>();
            for (JsonNode line : requested) {
                int lineNo = line.path("lineNo").asInt(0);
                if (lineNo == 0) {
                    return ResponseEntity.badRequest().body("{\"error\":\"lineNo manquant sur une ligne\"}");
                }
                if (!seen.add(lineNo)) {
                    return ResponseEntity.badRequest()
                            .body("{\"error\":\"Ligne " + lineNo + " envoyée deux fois\"}");
                }
                JsonNode known = findLine(shipment, lineNo);
                if (known == null) {
                    return ResponseEntity.badRequest().body(
                            "{\"error\":\"La ligne " + lineNo + " n'existe pas sur le BL "
                                    + jsonEscape(shipmentNo) + "\"}");
                }
                double remaining = known.path("remaining").asDouble(0);
                double newQty = line.path("newQty").asDouble(-1);
                if (newQty < 0 || newQty > remaining) {
                    return ResponseEntity.badRequest().body("{\"error\":\"Quantité invalide sur la ligne "
                            + lineNo + " : elle doit être comprise entre 0 et " + trimNumber(remaining) + "\"}");
                }
                if (newQty == remaining) {
                    // Ligne laissée intacte par le livreur : ne pas l'envoyer, l'AL compte les
                    // lignes réellement avoirées et refuse une demande qui n'en change aucune.
                    continue;
                }
                if (payloadLines.length() > 0) {
                    payloadLines.append('|');
                }
                payloadLines.append(lineNo).append(':').append(trimNumber(newQty));
                changed++;
            }

            if (changed == 0) {
                return ResponseEntity.badRequest()
                        .body("{\"error\":\"Aucune quantité modifiée : il n'y a pas d'avoir à créer.\"}");
            }

            ObjectNode payload = mapper.createObjectNode();
            payload.put("shipmentNo", shipmentNo);
            // Vide volontairement : le livreur n'est pas le fournisseur, et le contrôle de
            // cloisonnement de l'AL ne doit pas s'appliquer. C'est « source » qui trace.
            payload.put("vendorNo", "");
            payload.put("lines", payloadLines.toString());
            payload.put("source", sourceLabel());

            String url = tarekSystemUrl + "/plexusAvoirBLs";
            log.info("Avoir livreur sur {} par {} : POST {} payload {}", shipmentNo,
                    currentLogin(), url, payload);

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
            out.put("avoirNo", created.path("avoirNo").asText(""));
            out.put("documentNo", shipmentNo);
            out.put("salesOrderNo", created.path("salesOrderNo").asText(""));
            out.put("orderNo", created.path("orderNo").asText(""));
            out.put("linesAffected", created.path("linesAffected").asInt(0));
            out.put("applied", created.path("applied").asBoolean(false));
            out.put("customerName", shipment.path("customerName").asText(""));
            out.put("vendorName", shipment.path("vendorName").asText(""));

            log.info("Avoir livreur enregistré : {}", out);
            return ResponseEntity.ok(mapper.writeValueAsString(out));

        } catch (WebClientResponseException e) {
            // Erreurs métier AL (ligne déjà facturée, quantité hors bornes) : le message AL est
            // rédigé pour un humain, on le laisse remonter tel quel jusqu'au téléphone.
            log.error("BC API Error creating avoir livreur: (HTTP {}) {}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error creating avoir livreur: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ————————————————————————————— lecture BC —————————————————————————————

    /**
     * Les lignes du BL. Pas de pagination : tout est filtré sur un seul n° d'expédition, et
     * $top=500 dépasse de loin ce qu'un BL peut porter. (Le portail, lui, lit tout un
     * fournisseur et doit paginer sur $skip — les query API de BC n'envoient pas de nextLink.)
     */
    private List<JsonNode> fetchShipmentLines(String shipmentNo) throws Exception {
        String filter = "shipmentNo eq '" + shipmentNo.replace("'", "''") + "' and quantity gt 0";
        String url = tarekSystemUrl + "/plexusAvoirBLLines"
                + "?$filter=" + odataEncode(filter) + "&$top=" + PAGE_SIZE;

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

    private ObjectNode buildShipment(String shipmentNo, List<JsonNode> lines) {
        JsonNode first = lines.get(0);
        String purchOrderNo = first.path("purchOrderNo").asText("");
        String vendorNo = first.path("vendorNo").asText("");

        ObjectNode shipment = mapper.createObjectNode();
        shipment.put("documentNo", shipmentNo);
        shipment.put("postingDate", first.path("postingDate").asText(""));
        shipment.put("customerNo", first.path("sellToCustomerNo").asText(""));
        shipment.put("customerName", first.path("sellToCustomerName").asText(""));
        shipment.put("salesOrderNo", first.path("salesOrderNo").asText(""));
        shipment.put("purchaseOrderNo", purchOrderNo);
        shipment.put("vendorNo", vendorNo);
        shipment.put("vendorName", vendorNo.isEmpty() ? "" : resolveVendorName(vendorNo));

        ArrayNode out = mapper.createArrayNode();
        Set<Integer> seenLines = new HashSet<>();
        boolean anyInvoiced = false;
        double totalRemaining = 0;

        for (JsonNode line : lines) {
            int lineNo = line.path("lineNo").asInt(0);
            if (!seenLines.add(lineNo)) {
                continue;
            }
            if (line.path("quantityInvoiced").asDouble(0) > 0) {
                anyInvoiced = true;
            }

            double quantity = line.path("quantity").asDouble(0);
            double qtyAvoir = line.path("qtyAvoir").asDouble(0);
            // Un second avoir se calcule sur le reliquat, jamais sur la quantité d'origine.
            double remaining = Math.max(0, quantity - qtyAvoir);
            totalRemaining += remaining;

            ObjectNode node = mapper.createObjectNode();
            node.put("lineNo", lineNo);
            node.put("itemNo", line.path("itemNo").asText(""));
            node.put("description", line.path("description").asText(""));
            node.put("unitOfMeasureCode", line.path("unitOfMeasureCode").asText(""));
            node.put("quantity", quantity);
            node.put("qtyAvoir", qtyAvoir);
            node.put("remaining", remaining);
            node.put("unitPrice", line.path("unitPrice").asDouble(0));
            out.add(node);
        }
        shipment.set("lines", out);
        shipment.put("linesCount", out.size());
        shipment.set("avoirNos", fetchAvoirNumbers(shipmentNo));

        String blocked = null;
        if (anyInvoiced) {
            blocked = "Ce BL est déjà facturé : l'avoir doit passer par un retour classique.";
        } else if (!purchOrderNo.isEmpty() && isPurchaseOrderInvoiced(purchOrderNo)) {
            blocked = "La facture d'achat de ce BL est déjà établie : l'avoir n'est plus possible ici.";
        } else if (totalRemaining <= 0) {
            blocked = "Ce BL est déjà entièrement avoiré.";
        }
        shipment.put("avoirable", blocked == null);
        if (blocked != null) {
            shipment.put("blockedReason", blocked);
        }
        return shipment;
    }

    /** Les avoirs déjà émis sur ce BL — pour que le livreur voie qu'il repasse sur un BL traité. */
    private ArrayNode fetchAvoirNumbers(String shipmentNo) {
        ArrayNode arr = mapper.createArrayNode();
        try {
            String filter = "shipmentNo eq '" + shipmentNo.replace("'", "''") + "'";
            String url = tarekSystemUrl + "/plexusAvoirBLLogs"
                    + "?$filter=" + odataEncode(filter) + "&$top=" + PAGE_SIZE;
            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));

            Set<String> numbers = new LinkedHashSet<>();
            for (JsonNode entry : mapper.readTree(response).path("value")) {
                String avoirNo = entry.path("avoirNo").asText("");
                if (!avoirNo.isEmpty()) {
                    numbers.add(avoirNo);
                }
            }
            numbers.forEach(arr::add);
        } catch (Exception e) {
            // Un libellé manquant ne doit pas empêcher le livreur de travailler.
            log.warn("N° d'avoir indisponibles pour {} : {}", shipmentNo, e.getMessage());
        }
        return arr;
    }

    /**
     * Requête séparée plutôt qu'une jointure : un dataitem Purchase Line en LeftOuterJoin
     * portant un DataItemTableFilter se comporte comme un INNER JOIN et vide le résultat.
     */
    private boolean isPurchaseOrderInvoiced(String purchOrderNo) {
        try {
            String filter = "orderNo eq '" + purchOrderNo.replace("'", "''") + "' and quantityInvoiced gt 0";
            String url = tarekSystemUrl + "/plexusPurchReceiptLines"
                    + "?$filter=" + odataEncode(filter) + "&$top=1";
            String response = webClient.get()
                    .uri(URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.getAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));
            return !mapper.readTree(response).path("value").isEmpty();
        } catch (Exception e) {
            // Ne pas bloquer sur une lecture indisponible : l'AL refuse de toute façon un BL
            // facturé, avec un message plus précis que celui-ci.
            log.warn("Contrôle facture achat {} indisponible : {}", purchOrderNo, e.getMessage());
            return false;
        }
    }

    private String resolveVendorName(String vendorNo) {
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

    // ————————————————————————————— utilitaires —————————————————————————————

    /**
     * Ce que le livreur tape sur un clavier de téléphone → un n° de BL de Business Central.
     *
     * « 580 » → BL26/00580, « bl26/580 » → BL26/00580, « BL26/00580 » inchangé. Sur le pas de
     * la porte, exiger la forme exacte reviendrait à demander 11 caractères dont un slash.
     */
    static String normalizeShipmentNo(String raw) {
        if (raw == null) {
            return "";
        }
        String value = raw.trim().toUpperCase().replace(" ", "");
        if (value.isEmpty()) {
            return "";
        }

        if (value.matches("\\d+")) {
            return "BL" + twoDigitYear() + "/" + padNumber(value);
        }
        // BL26/580 → BL26/00580 : le séquentiel BC est sur 5 chiffres.
        if (value.matches("[A-Z]{2}\\d{2}/\\d+")) {
            int slash = value.indexOf('/');
            return value.substring(0, slash + 1) + padNumber(value.substring(slash + 1));
        }
        return value;
    }

    private static String padNumber(String digits) {
        String trimmed = digits.replaceFirst("^0+(?=\\d)", "");
        return trimmed.length() >= 5 ? trimmed : "0".repeat(5 - trimmed.length()) + trimmed;
    }

    private static String twoDigitYear() {
        return String.format("%02d", LocalDate.now().getYear() % 100);
    }

    private JsonNode findLine(ObjectNode shipment, int lineNo) {
        for (JsonNode line : shipment.path("lines")) {
            if (line.path("lineNo").asInt(0) == lineNo) {
                return line;
            }
        }
        return null;
    }

    /**
     * Ce que le journal d'avoir affichera comme origine (Text[30] côté AL, tronqué là-bas).
     * Sans ça, un avoir saisi par un livreur serait indiscernable d'une déclaration du
     * fournisseur lui-même.
     */
    private String sourceLabel() {
        String login = currentLogin();
        return login.isEmpty() ? "Application livreur" : "Livreur " + login;
    }

    private String currentLogin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null || auth.getName() == null ? "" : auth.getName();
    }

    /**
     * Rôle Livreur, ou Plexus lui-même (C0090) pour tester depuis le tableau de bord.
     *
     * Les deux sont lus dans le JWT — jamais dans l'en-tête X-Customer-No, que le client
     * fabrique lui-même : ces routes créent des avoirs sur N'IMPORTE QUEL BL, un en-tête
     * suffirait alors à n'importe quel compte du portail pour se donner ce droit.
     */
    private boolean isLivreur(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (LIVREUR_ROLE.equalsIgnoreCase(authority.getAuthority())) {
                return true;
            }
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return false;
        }
        try {
            String customerNo = jwtUtil.extractClaim(header.substring(7),
                    claims -> claims.get("customerNo", String.class));
            return PLEXUS_CUSTOMER_NO.equals(customerNo);
        } catch (Exception e) {
            return false;
        }
    }

    private ResponseEntity<String> forbidden() {
        return ResponseEntity.status(403)
                .body("{\"error\":\"Cet espace est réservé aux livreurs Plexus.\"}");
    }

    private ResponseEntity<String> featureDisabled() {
        return ResponseEntity.status(503)
                .body("{\"error\":\"L'avoir sur BL n'est pas disponible pour le moment.\"}");
    }

    /** BC ne lit pas '+' comme une espace : encoder à la main, jamais avec URLEncoder seul. */
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

    private static String jsonEscape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
