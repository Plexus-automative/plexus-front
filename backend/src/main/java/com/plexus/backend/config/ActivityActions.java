package com.plexus.backend.config;

/**
 * Turns a raw (method, path) into the French label + category shown in the
 * journal d'activité, and pulls out the document reference when the route
 * carries one. Kept in one place so the journal stays readable as routes grow:
 * an unmapped route still lands in the journal, just with a generic label.
 */
public final class ActivityActions {

    private ActivityActions() {
    }

    public static class Descriptor {
        public final String category;
        public final String action;
        public final String reference;

        Descriptor(String category, String action, String reference) {
            this.category = category;
            this.action = action;
            this.reference = reference;
        }
    }

    public static final String CAT_AUTH = "AUTH";
    public static final String CAT_COMMANDE = "COMMANDE";
    public static final String CAT_PEC = "PEC";
    public static final String CAT_DOCUMENT = "DOCUMENT";
    public static final String CAT_BRIS = "BRIS";
    public static final String CAT_ARTICLE = "ARTICLE";
    public static final String CAT_EXPORT = "EXPORT";
    public static final String CAT_AUTRE = "AUTRE";

    /**
     * Routes whose response is a document (PDF/Excel) rather than JSON — their body is
     * never buffered for the journal.
     */
    public static boolean streamsDocument(String path) {
        return path.contains("/generate-bl") || path.contains("/generate-devis")
                || path.contains("/generate-facture") || path.contains("/export")
                || path.endsWith("/file");
    }

    /** Reads that move data out of the app, and so deserve a journal line. */
    public static boolean isAuditableRead(String path) {
        return path.startsWith("/api/purchase-orders/export-data")
                || path.startsWith("/api/purchase-orders/dashboard/insurance-export")
                || path.startsWith("/api/reports/insurance-benefits")
                || (path.startsWith("/api/bris-de-glace/dossiers/") && path.endsWith("/file"));
    }

    public static Descriptor describe(String method, String path) {
        String[] s = segments(path);

        if (s.length >= 1) {
            switch (s[0]) {
                case "purchase-orders":
                    return purchaseOrders(method, s);
                case "bris-de-glace":
                    return brisDeGlace(method, s);
                case "articles":
                    if (s.length >= 2 && "import".equals(s[1])) {
                        return new Descriptor(CAT_ARTICLE, "Import d'articles", null);
                    }
                    break;
                case "sales-invoices":
                    if (s.length >= 2 && "from-shipment".equals(s[1])) {
                        return new Descriptor(CAT_DOCUMENT, "Création facture de vente", null);
                    }
                    break;
                case "reports":
                    if (s.length >= 2 && "insurance-benefits".equals(s[1])) {
                        return new Descriptor(CAT_EXPORT, "Consultation rapport assurances", null);
                    }
                    break;
                default:
                    break;
            }
        }
        return new Descriptor(CAT_AUTRE, method + " " + path, null);
    }

    private static Descriptor purchaseOrders(String method, String[] s) {
        // /api/purchase-orders
        if (s.length == 1) {
            if ("POST".equals(method)) {
                return new Descriptor(CAT_COMMANDE, "Création d'une commande", null);
            }
            return new Descriptor(CAT_COMMANDE, "Consultation des commandes", null);
        }

        String second = s[1];

        // /api/purchase-orders/pec/...
        if ("pec".equals(second)) {
            if (s.length == 2) {
                return new Descriptor(CAT_PEC, "Création d'une demande PEC", null);
            }
            String documentNo = s[2];
            if (s.length >= 4) {
                switch (s[3]) {
                    case "create-order":
                        return new Descriptor(CAT_PEC, "Transformation de la demande PEC en commande", documentNo);
                    case "create-devis":
                        return new Descriptor(CAT_PEC, "Création d'un devis depuis la demande PEC", documentNo);
                    default:
                        break;
                }
            }
            return new Descriptor(CAT_PEC, "Demande PEC", documentNo);
        }

        // /api/purchase-orders/lines/{lineId}
        if ("lines".equals(second)) {
            String lineId = s.length >= 3 ? s[2] : null;
            if ("DELETE".equals(method)) {
                return new Descriptor(CAT_COMMANDE, "Suppression d'une ligne de commande", lineId);
            }
            return new Descriptor(CAT_COMMANDE, "Modification d'une ligne de commande", lineId);
        }

        switch (second) {
            case "bulk":
                return new Descriptor(CAT_COMMANDE, "Création de commandes (lot)", null);
            case "save-references":
                return new Descriptor(CAT_ARTICLE, "Enregistrement de références", null);
            case "confirm-reception":
                return new Descriptor(CAT_COMMANDE, "Confirmation de réception", null);
            case "validate-order":
                return new Descriptor(CAT_COMMANDE, "Validation d'une commande", null);
            case "generate-bl":
                return new Descriptor(CAT_DOCUMENT, "Génération d'un bon de livraison", null);
            case "generate-devis":
                return new Descriptor(CAT_DOCUMENT, "Génération d'un devis", null);
            case "generate-facture":
                return new Descriptor(CAT_DOCUMENT, "Génération d'une facture", null);
            case "export-data":
                return new Descriptor(CAT_EXPORT, "Export Excel des commandes", null);
            case "dashboard":
                if (s.length >= 3 && "insurance-export".equals(s[2])) {
                    return new Descriptor(CAT_EXPORT, "Export Excel des dossiers assurance", null);
                }
                return new Descriptor(CAT_AUTRE, "Consultation du tableau de bord", null);
            default:
                break;
        }

        // /api/purchase-orders/{orderId}/...
        String orderId = second;
        if (s.length >= 3) {
            switch (s[2]) {
                case "PlexuspurchaseOrderLines":
                    return new Descriptor(CAT_COMMANDE, "Ajout d'une ligne à la commande", orderId);
                case "split-le-disponible":
                    return new Descriptor(CAT_COMMANDE, "Séparation de ligne (le disponible)", orderId);
                default:
                    break;
            }
        }
        if ("PATCH".equals(method) || "PUT".equals(method)) {
            return new Descriptor(CAT_COMMANDE, "Modification d'une commande", orderId);
        }
        if ("DELETE".equals(method)) {
            return new Descriptor(CAT_COMMANDE, "Suppression d'une commande", orderId);
        }
        return new Descriptor(CAT_COMMANDE, "Commande", orderId);
    }

    private static Descriptor brisDeGlace(String method, String[] s) {
        if (s.length >= 2 && "dossiers".equals(s[1])) {
            String id = s.length >= 3 ? s[2] : null;
            if (s.length >= 4) {
                switch (s[3]) {
                    case "file":
                        return new Descriptor(CAT_BRIS,
                                "GET".equals(method) ? "Téléchargement de la pièce jointe du dossier"
                                        : "Ajout d'une pièce jointe au dossier",
                                id);
                    case "treat":
                        return new Descriptor(CAT_BRIS, "Traitement d'un dossier bris de glace", id);
                    default:
                        break;
                }
            }
            if (id == null) {
                return new Descriptor(CAT_BRIS, "Création d'un dossier bris de glace", null);
            }
            return new Descriptor(CAT_BRIS, "Dossier bris de glace", id);
        }
        return new Descriptor(CAT_BRIS, "Bris de glace", null);
    }

    /** Path segments after the leading {@code /api/}. */
    private static String[] segments(String path) {
        String p = path;
        if (p.startsWith("/api/")) {
            p = p.substring("/api/".length());
        } else if (p.startsWith("/")) {
            p = p.substring(1);
        }
        if (p.endsWith("/")) {
            p = p.substring(0, p.length() - 1);
        }
        if (p.isEmpty()) {
            return new String[0];
        }
        return p.split("/");
    }
}
