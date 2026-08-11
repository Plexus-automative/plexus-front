package com.plexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

/**
 * « Quand le prix de cet article a-t-il bougé pour la dernière fois ? »
 *
 * <p>Source unique : la table BC "Plexus Price History" (AL 52250), alimentée automatiquement
 * par le subscriber {@code Item."Unit Price"} de la codeunit {@code Plexus Price Mgt} — qui
 * reçoit lui-même les changements de {@code Purchase Line."Direct Unit Cost"}. Toute modif de
 * prix faite depuis le dashboard y atterrit donc aussi.
 *
 * <p><b>L'historique est tenu PAR ARTICLE, pas par ligne de commande.</b> Deux lignes portant
 * la même référence renvoient la même dernière MAJ. C'est bien « le prix de cet article a
 * changé le … », pas « quelqu'un a touché cette ligne-là » — pour ça, c'est le journal
 * d'activité qui porte l'utilisateur réel.
 *
 * <p>Ce service est partagé par le dashboard ({@code PurchaseOrderController}) et l'API
 * partenaire de l'app commerciale ({@code PartnerArticleController}) : les deux doivent dater
 * un prix de la même façon, sinon un commercial et un utilisateur du dashboard regardant la
 * même référence ne verraient pas la même fraîcheur.
 */
@Service
@Slf4j
public class PriceHistoryService {

    private static final String BC_ENTITY = "plexusPriceHistories";

    /** Réfs par requête BC : au-delà l'URL du filtre OR devient déraisonnable (~900 car. ici). */
    private static final int CHUNK = 25;
    /** Garde-fou : un appelant ne peut pas faire balayer le catalogue entier en un appel. */
    private static final int MAX_ITEMS = 300;

    /** Seuils de fraîcheur, en jours — les mêmes que la puce du dashboard. */
    public static final int FRESH_DAYS = 7;
    public static final int STALE_DAYS = 14;

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public PriceHistoryService(WebClient webClient, BusinessCentralTokenService tokenService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
    }

    @PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
    }

    /** Le dernier changement de prix enregistré pour une référence. */
    public record PriceUpdate(
            String itemNo,
            BigDecimal oldPrice,
            BigDecimal newPrice,
            String dateTime,
            String userId,
            int changeCount,
            Long daysAgo,
            String freshness) {
    }

    /** Une ligne d'historique, sans le compteur ni la fraîcheur. */
    public record PriceChange(BigDecimal oldPrice, BigDecimal newPrice, String dateTime, String userId) {
    }

    /**
     * Dernière MAJ de prix par référence. Une référence dont le prix n'a jamais bougé est
     * simplement absente de la map (plutôt qu'une valeur nulle à tester chez l'appelant).
     */
    public Map<String, PriceUpdate> lastUpdates(Collection<String> itemNos) throws Exception {
        Map<String, PriceUpdate> out = new LinkedHashMap<>();
        List<String> refs = sanitize(itemNos);
        if (refs.isEmpty()) {
            return out;
        }

        String token = tokenService.getAccessToken();
        // itemNo -> nombre de changements, compté au fil des pages.
        Map<String, Integer> counts = new LinkedHashMap<>();

        for (int from = 0; from < refs.size(); from += CHUNK) {
            List<String> chunk = refs.subList(from, Math.min(from + CHUNK, refs.size()));
            StringBuilder filter = new StringBuilder("(");
            for (int i = 0; i < chunk.size(); i++) {
                if (i > 0) {
                    filter.append(" or ");
                }
                filter.append("itemNo eq '").append(chunk.get(i)).append("'");
            }
            filter.append(")");

            // Pas de $top : la table est petite (quelques milliers de lignes) et un $top
            // tronquerait l'article le plus modifié du lot. Trié décroissant, la première
            // occurrence d'une référence EST sa dernière MAJ ; les suivantes ne font que compter.
            for (JsonNode row : fetchAll(filter.toString(), token)) {
                String itemNo = text(row, "itemNo");
                if (itemNo == null) {
                    continue;
                }
                if (counts.merge(itemNo, 1, Integer::sum) == 1) {
                    String dateTime = text(row, "dateTime");
                    Long days = daysAgo(dateTime);
                    out.put(itemNo, new PriceUpdate(
                            itemNo,
                            decimal(row, "oldPrice"),
                            decimal(row, "newPrice"),
                            dateTime,
                            text(row, "userId"),
                            1,
                            days,
                            freshness(days)));
                }
            }
        }

        // Le compteur définitif n'est connu qu'une fois toutes les pages lues.
        counts.forEach((itemNo, count) -> out.computeIfPresent(itemNo, (k, u) -> new PriceUpdate(
                u.itemNo(), u.oldPrice(), u.newPrice(), u.dateTime(), u.userId(),
                count, u.daysAgo(), u.freshness())));

        return out;
    }

    /** La dernière MAJ d'une seule référence, ou null si son prix n'a jamais bougé. */
    public PriceUpdate lastUpdate(String itemNo) throws Exception {
        return lastUpdates(List.of(itemNo == null ? "" : itemNo)).get(itemNo);
    }

    /** Historique complet d'une référence, du plus récent au plus ancien. */
    public List<PriceChange> history(String itemNo) throws Exception {
        List<PriceChange> out = new ArrayList<>();
        if (itemNo == null || itemNo.isBlank() || itemNo.contains("'")) {
            return out;
        }
        for (JsonNode row : fetchAll("itemNo eq '" + itemNo.trim() + "'", tokenService.getAccessToken())) {
            out.add(new PriceChange(
                    decimal(row, "oldPrice"), decimal(row, "newPrice"),
                    text(row, "dateTime"), text(row, "userId")));
        }
        return out;
    }

    /** Jours écoulés depuis la MAJ, ou null si la date est absente ou illisible. */
    public static Long daysAgo(String dateTime) {
        if (dateTime == null || dateTime.isBlank()) {
            return null;
        }
        try {
            return ChronoUnit.DAYS.between(Instant.parse(dateTime), Instant.now());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Le mot que les deux applications affichent en couleur : {@code recent} (vert),
     * {@code aging} (orange), {@code stale} (rouge). Null quand la date est inexploitable —
     * mieux vaut ne rien colorer que déclarer un prix périmé à tort.
     */
    public static String freshness(Long days) {
        if (days == null) {
            return null;
        }
        if (days <= FRESH_DAYS) {
            return "recent";
        }
        return days <= STALE_DAYS ? "aging" : "stale";
    }

    // ------------------------------------------------------------------
    // BC
    // ------------------------------------------------------------------

    /** Toutes les pages du filtre, triées de la MAJ la plus récente à la plus ancienne. */
    private List<JsonNode> fetchAll(String filter, String token) throws Exception {
        List<JsonNode> out = new ArrayList<>();
        String next = tarekSystemUrl + "/" + BC_ENTITY
                + "?$filter=" + odataEncode(filter)
                + "&$orderby=" + odataEncode("dateTime desc");

        int pages = 0;
        while (next != null && pages < 50) {
            String body = webClient.get()
                    .uri(java.net.URI.create(next))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));

            JsonNode root = mapper.readTree(body);
            JsonNode value = root.get("value");
            if (value != null && value.isArray()) {
                value.forEach(out::add);
            }
            JsonNode nextLink = root.get("@odata.nextLink");
            next = nextLink != null && !nextLink.isNull() ? nextLink.asText() : null;
            pages++;
        }
        return out;
    }

    /**
     * Références exploitables : sans doublon, sans vide, et sans apostrophe — celle-ci
     * casserait le littéral OData, et une référence en contenant est écartée plutôt que
     * de faire échouer tout le lot.
     */
    private List<String> sanitize(Collection<String> itemNos) {
        LinkedHashSet<String> refs = new LinkedHashSet<>();
        if (itemNos != null) {
            for (String raw : itemNos) {
                if (raw == null) {
                    continue;
                }
                String ref = raw.trim();
                if (!ref.isEmpty() && !ref.contains("'") && refs.size() < MAX_ITEMS) {
                    refs.add(ref);
                }
            }
        }
        return new ArrayList<>(refs);
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

    /**
     * %20 et non '+' : le parseur de filtres BC ne relit pas '+' comme une espace.
     * (Même règle que {@code DemandeDevisPortalController.odataEncode}, hors d'atteinte
     * depuis ce paquet.)
     */
    private static String odataEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, "UTF-8").replace("+", "%20");
        } catch (Exception e) {
            return value;
        }
    }
}
