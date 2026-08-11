package com.plexus.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Where the commandes of one dossier stand right now — what the mobile app polls to learn
 * that the supplier answered.
 *
 * <p>The case this exists for: a part is ordered at 490, the supplier checks his stock and
 * comes back at 590. Business Central keeps the figure it replaced, so the line carries both
 * — {@code previousUnitPrice} 490, {@code unitPrice} 590, {@code priceChanged} true — and the
 * commercial can be told before the customer is invoiced rather than after.
 */
public record PartnerOrderStatusResponse(
        String pecDossier,
        List<Order> orders) {

    public record Order(
            String number,
            String id,
            String vendorNo,
            String vendorName,
            String orderDate,

            /**
             * Raw Business Central shipping advice: {@code Attente},
             * {@code ConfirmationPartielle}, {@code Totalité}, {@code LivraisonDispo},
             * {@code Confirmé}, {@code Annulation}.
             */
            String status,

            /**
             * The same thing said plainly — {@code AWAITING_SUPPLIER},
             * {@code PARTIALLY_CONFIRMED}, {@code CONFIRMED}, {@code SHIPPED},
             * {@code RECEIVED}, {@code CANCELLED}, or {@code UNKNOWN} for a combination we
             * do not recognise. Derived from the same rules the dashboard's own tabs use.
             */
            String state,

            BigDecimal totalExcludingTax,
            BigDecimal totalIncludingTax,

            /** Last write on the commande, whatever it was — a cheap poll filter. */
            String lastModified,

            /** True as soon as one line's price moved since the commande was placed. */
            boolean anyPriceChanged,

            List<Line> lines) {
    }

    public record Line(
            /** BC line id — what {@code POST /orders/validate} expects to designate a line. */
            String lineId,

            String reference,
            String description,

            /**
             * The quantity originally ordered. Validation never changes it — accounting has
             * to keep seeing what was asked for next to what was retained.
             */
            BigDecimal quantity,

            /**
             * What was retained at validation, out of {@code quantity}. {@code 0} until the
             * commande is validated; a line kept at 0 is deleted, so it never comes back here.
             */
            BigDecimal validatedQuantity,

            /** What the line costs now — the figure that will be invoiced. */
            BigDecimal unitPrice,

            /**
             * What it cost before the last change, {@code null} if it never moved.
             *
             * <p>Only the <em>last</em> change is kept: a price edited twice reports the
             * value it had before the second edit, not the one originally ordered.
             */
            BigDecimal previousUnitPrice,

            boolean priceChanged,
            /** {@code unitPrice − previousUnitPrice}; negative when the supplier came down. */
            BigDecimal priceDifference,

            /**
             * When this <b>article's</b> catalogue price last moved — ISO-8601 instant, or
             * {@code null} if it never changed.
             *
             * <p>Not to be confused with {@code previousUnitPrice} just above. That one is the
             * supplier changing his price <em>on this commande</em>. This one comes from the
             * article's own history, across every commande and every date, and is what says
             * whether the price on the line is fresh or has been sitting still for months.
             *
             * <p>Only the date, deliberately: {@code GET /articles} carries the full block
             * (old price, new price, {@code freshness}) for the screen that needs it, and a
             * commande list only needs to date the price.
             */
            String lastPriceUpdateDate,

            /**
             * The supplier's answer on this line: {@code Disponible}, {@code NonDisponible},
             * {@code LivPrevuaDate}, or empty while he has not answered.
             */
            String decision,

            /** How much of the quantity he says he can actually supply. */
            BigDecimal availableQuantity,

            /** Date he committed to, when his answer was {@code LivPrevuaDate}. */
            String expectedDeliveryDate,

            BigDecimal receivedQuantity) {
    }
}
