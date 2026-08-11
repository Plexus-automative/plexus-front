package com.plexus.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * The outcome of validating a commande: what was dropped, and where the commande stands now.
 *
 * <p>{@code removedLines} is reported rather than left implicit — a validation deletes rows
 * in Business Central, and the caller should be able to show, or log, exactly what left the
 * commande without diffing two reads.
 */
public record PartnerOrderValidationResponse(
        String number,

        /** False only when the commande was already validated before this call. */
        boolean validated,

        /** A replay: the commande was already validated, nothing was touched. */
        boolean alreadyValidated,

        List<RemovedLine> removedLines,

        /** Lines the supplier promised for a later date, and what became of them. */
        List<DeferredLine> deferredLines,

        /**
         * The separate commande the deferred lines were moved to, when
         * {@code splitDeferredLines} was true. Null otherwise — including when the caller
         * chose to keep everything in one commande.
         */
        PartnerOrderStatusResponse.Order splitOrder,

        /** The commande as it stands after the call — same shape as {@code GET /orders}. */
        PartnerOrderStatusResponse.Order order) {

    public record RemovedLine(String lineId, String reference, String description, BigDecimal quantity) {
    }

    public record DeferredLine(
            String reference,
            String description,
            BigDecimal quantity,
            /** The date the supplier committed to. */
            String expectedDeliveryDate,
            /**
             * What happened to it: {@code MOVED_TO_NEW_ORDER} when the caller asked for a
             * split, {@code REMOVED} otherwise.
             *
             * <p>Either way the line <b>leaves this commande</b> — Business Central always
             * clears the deferred lines out of it. The choice is only whether they are
             * re-ordered elsewhere first, so {@code REMOVED} means those parts are no longer
             * on order anywhere.
             */
            String outcome) {

        public static final String MOVED = "MOVED_TO_NEW_ORDER";
        public static final String REMOVED = "REMOVED";
    }
}
