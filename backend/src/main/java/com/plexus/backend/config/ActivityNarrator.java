package com.plexus.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plexus.backend.service.ActivityLogService.ActivityChange;
import com.plexus.backend.service.ActivityLogService.ActivityEntry;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Turns a raw request payload into what a human actually did.
 *
 * "PATCH /api/purchase-orders/6358bc49 {ShippingAdvice: Totalité}" becomes
 * "Commande confirmée : livrer la totalité", and a line update becomes
 * "Prix unitaire : 100 → 120 · Quantité à livrer : 3" — the field names come
 * straight from what the front sends (see EmisesEncours / RecuesNonTraitees).
 *
 * Anything unknown is left out rather than guessed at: the generic action label
 * and the raw payload are always shown next to it in the journal.
 */
public final class ActivityNarrator {

    private ActivityNarrator() {
    }

    /** Business meaning of the order-level shipping option, as shown in the app. */
    private static final Map<String, String> SHIPPING_ADVICE = Map.ofEntries(
            Map.entry("attente", "En attente"),
            Map.entry("confirmationpartielle", "Confirmation partielle"),
            Map.entry("confirmé", "Confirmé"),
            Map.entry("confirme", "Confirmé"),
            Map.entry("totalité", "Livrer la totalité"),
            Map.entry("totalite", "Livrer la totalité"),
            Map.entry("livraisondispo", "Livrer le disponible"),
            Map.entry("annulation", "Annulation"),
            Map.entry("valide", "Validé"));

    /** Line-level supplier decision. */
    private static final Map<String, String> DECISION = Map.of(
            "disponible", "Disponible",
            "nondisponible", "Non disponible",
            "livprevuadate", "Livraison prévue à une date");

    /** JSON field → label shown in the journal. Order matters for readability. */
    private static final Map<String, String> FIELD_LABELS = new LinkedHashMap<>();

    static {
        FIELD_LABELS.put("ShippingAdvice", "Option d'expédition");
        FIELD_LABELS.put("CauseofCancellation", "Motif d'annulation");
        FIELD_LABELS.put("Decision", "Décision du fournisseur");
        FIELD_LABELS.put("directUnitCost", "Prix unitaire");
        FIELD_LABELS.put("quantity", "Quantité");
        FIELD_LABELS.put("receiveQuantity", "Quantité à recevoir");
        FIELD_LABELS.put("invoiceQuantity", "Quantité à facturer");
        FIELD_LABELS.put("QuantityAvailable", "Quantité à livrer");
        FIELD_LABELS.put("deliveryQuantity", "Quantité à livrer");
        FIELD_LABELS.put("DeliveryDate", "Date de livraison prévue");
        FIELD_LABELS.put("expectedDeliveryDate", "Date de livraison prévue");
        FIELD_LABELS.put("expectedReceiptDate", "Date de réception prévue");
        FIELD_LABELS.put("description", "Désignation");
        FIELD_LABELS.put("OldRemplacementItemNo", "Référence de remplacement");
        FIELD_LABELS.put("lineObjectNumber", "Référence article");
        FIELD_LABELS.put("reference", "Référence article");
        FIELD_LABELS.put("vendorNumber", "Fournisseur");
        FIELD_LABELS.put("payToVendorNumber", "Fournisseur");
        FIELD_LABELS.put("vin", "N° de châssis (VIN)");
        FIELD_LABELS.put("registrationNumber", "Immatriculation");
        FIELD_LABELS.put("insuredName", "Assuré");
        FIELD_LABELS.put("insuranceName", "Compagnie d'assurance");
        FIELD_LABELS.put("documentNo", "Document");
        FIELD_LABELS.put("orderId", "Commande");
    }

    /** Fields consumed as the "before" of another field, never listed on their own. */
    private static final Map<String, String> PREVIOUS_VALUE_OF = Map.of("OldUnitPrice", "directUnitCost");

    /** Fills {@code summary} and {@code changes} on the entry, in place. */
    public static void narrate(ActivityEntry entry, ObjectMapper mapper) {
        JsonNode payload = parse(entry.payload, mapper);

        List<ActivityChange> changes = payload != null ? describeChanges(payload) : new ArrayList<>();
        entry.changes = changes.isEmpty() ? null : changes;
        entry.summary = buildSummary(entry, payload, changes);
    }

    // ==================== field-level changes ====================

    private static List<ActivityChange> describeChanges(JsonNode payload) {
        List<ActivityChange> changes = new ArrayList<>();
        if (!payload.isObject()) {
            return changes;
        }

        Iterator<Map.Entry<String, JsonNode>> fields = payload.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            String key = field.getKey();
            JsonNode value = field.getValue();

            if (PREVIOUS_VALUE_OF.containsKey(key)) {
                continue; // handled as the "before" of its own field
            }
            if (value.isArray()) {
                changes.add(change(key.equals("lines") ? "Lignes" : label(key), null,
                        value.size() + " ligne(s)"));
                continue;
            }
            if (value.isObject() || value.isNull()) {
                continue;
            }

            String before = null;
            for (Map.Entry<String, String> previous : PREVIOUS_VALUE_OF.entrySet()) {
                if (previous.getValue().equals(key) && payload.hasNonNull(previous.getKey())) {
                    before = formatValue(key, payload.get(previous.getKey()));
                }
            }
            changes.add(change(label(key), before, formatValue(key, value)));
        }
        return changes;
    }

    private static ActivityChange change(String label, String before, String after) {
        ActivityChange c = new ActivityChange();
        c.label = label;
        c.before = before;
        c.after = after;
        return c;
    }

    private static String label(String key) {
        String known = FIELD_LABELS.get(key);
        return known != null ? known : key;
    }

    /** Codes become the words the user sees in the app; everything else stays as sent. */
    private static String formatValue(String key, JsonNode value) {
        String raw = value.isValueNode() ? value.asText() : value.toString();
        if ("ShippingAdvice".equals(key)) {
            return SHIPPING_ADVICE.getOrDefault(raw.toLowerCase(), raw);
        }
        if ("Decision".equals(key)) {
            return DECISION.getOrDefault(raw.toLowerCase(), raw);
        }
        if (value.isBoolean()) {
            return value.asBoolean() ? "Oui" : "Non";
        }
        return raw;
    }

    // ==================== sentence ====================

    private static String buildSummary(ActivityEntry entry, JsonNode payload, List<ActivityChange> changes) {
        String path = entry.path == null ? "" : entry.path;
        String method = entry.method == null ? "" : entry.method;

        // Order-level: the shipping option IS the business decision.
        if (payload != null && payload.hasNonNull("ShippingAdvice")) {
            String advice = payload.get("ShippingAdvice").asText();
            String phrase = shippingAdvicePhrase(advice);
            String reason = payload.hasNonNull("CauseofCancellation")
                    ? payload.get("CauseofCancellation").asText()
                    : null;
            if (reason != null && !reason.isBlank()) {
                phrase += " — motif : " + reason;
            }
            String others = joinChanges(changes, "ShippingAdvice", "CauseofCancellation");
            return others.isEmpty() ? phrase : phrase + " · " + others;
        }

        if (path.contains("/purchase-orders/lines/")) {
            if ("DELETE".equals(method)) {
                // The deleted line is gone from BC, so the only description of it is what
                // the app sent along with the request.
                return entry.context != null && !entry.context.isBlank()
                        ? "Ligne de commande supprimée — " + entry.context
                        : "Ligne de commande supprimée";
            }
            String detail = joinChanges(changes);
            return detail.isEmpty() ? "Ligne de commande modifiée" : "Ligne modifiée — " + detail;
        }

        if (path.endsWith("/purchase-orders/bulk")) {
            return entry.reference != null
                    ? "Commande " + entry.reference + " créée"
                    : "Création d'une commande";
        }

        if (path.endsWith("/purchase-orders/pec") && payload != null) {
            StringBuilder sb = new StringBuilder("Demande PEC créée");
            if (payload.hasNonNull("vin")) {
                sb.append(" — véhicule ").append(payload.get("vin").asText());
            }
            if (payload.hasNonNull("registrationNumber")) {
                sb.append(" (").append(payload.get("registrationNumber").asText()).append(")");
            }
            if (payload.has("lines") && payload.get("lines").isArray()) {
                sb.append(" · ").append(payload.get("lines").size()).append(" ligne(s)");
            }
            return sb.toString();
        }

        if (path.contains("/pec/") && path.endsWith("/create-order")) {
            return "Demande PEC transformée en commande";
        }
        if (path.contains("/pec/") && path.endsWith("/create-devis")) {
            return "Devis établi depuis la demande PEC";
        }
        if (path.endsWith("/confirm-reception")) {
            return "Réception confirmée" + (entry.reference != null ? " — commande " + entry.reference : "");
        }
        if (path.endsWith("/validate-order")) {
            return "Commande validée" + (entry.reference != null ? " — " + entry.reference : "");
        }
        if (path.contains("/split-le-disponible")) {
            return "Ligne séparée pour livrer le disponible";
        }

        // Nothing specific to say: let the changes (or the app's own context) speak.
        String detail = joinChanges(changes);
        if (!detail.isEmpty()) {
            return detail;
        }
        return entry.context != null && !entry.context.isBlank() ? entry.context : null;
    }

    private static String shippingAdvicePhrase(String advice) {
        switch (advice == null ? "" : advice.toLowerCase()) {
            case "annulation":
                return "Commande annulée";
            case "confirmé":
            case "confirme":
                return "Commande confirmée";
            case "confirmationpartielle":
                return "Commande confirmée partiellement";
            case "totalité":
            case "totalite":
                return "Commande confirmée : livrer la totalité";
            case "livraisondispo":
                return "Commande confirmée : livrer le disponible";
            case "attente":
                return "Commande remise en attente";
            case "valide":
                return "Commande validée";
            default:
                return "Option d'expédition : " + advice;
        }
    }

    /** "Prix unitaire : 100 → 120 · Quantité à livrer : 3" */
    private static String joinChanges(List<ActivityChange> changes, String... excludedLabelsOfKeys) {
        List<String> excluded = new ArrayList<>();
        for (String key : excludedLabelsOfKeys) {
            excluded.add(label(key));
        }
        StringBuilder sb = new StringBuilder();
        for (ActivityChange c : changes) {
            if (excluded.contains(c.label)) {
                continue;
            }
            if (sb.length() > 0) {
                sb.append(" · ");
            }
            sb.append(c.label).append(" : ");
            if (c.before != null && !c.before.equals(c.after)) {
                sb.append(c.before).append(" → ");
            }
            sb.append(c.after);
        }
        return sb.toString();
    }

    private static JsonNode parse(String body, ObjectMapper mapper) {
        if (body == null || body.isBlank()) {
            return null;
        }
        try {
            JsonNode node = mapper.readTree(body);
            return node.isObject() ? node : null;
        } catch (Exception e) {
            return null;
        }
    }
}
