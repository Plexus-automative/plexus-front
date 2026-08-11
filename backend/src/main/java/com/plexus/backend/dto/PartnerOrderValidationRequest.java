package com.plexus.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * What the commercial keeps of a supplier's answer, line by line.
 *
 * <p>The supplier has priced and confirmed availability; the commercial takes two of one
 * reference, one of another, and none of the third. A quantity of {@code 0} means "not from
 * this supplier": the line leaves the commande, exactly as setting *qté à valider* to 0 does
 * on the dashboard's "Émises en cours".
 *
 * <p><b>Every line of the commande must appear.</b> Not a formality — the lines left out
 * would otherwise be ordered, or dropped, on nothing more than a default, and this call both
 * deletes and commits. Naming them all is what makes the intent unambiguous.
 */
public record PartnerOrderValidationRequest(

        /** The commande to validate, as returned at creation, e.g. {@code CA26/2130}. */
        @NotBlank(message = "number is required")
        @Size(max = 20, message = "number must be at most 20 characters")
        String number,

        /**
         * What to do with the lines the supplier promised for a later date
         * ({@code decision: "LivPrevuaDate"}).
         *
         * <p><b>Those lines leave this commande either way</b> — Business Central always
         * clears them out of it so the available parts can ship. The choice is what becomes
         * of them:
         * <ul>
         *   <li>{@code true} — they are re-ordered in a <b>separate commande</b>, which
         *       carries the same {@code pecDossier}. Still on order, just later.</li>
         *   <li>{@code false} — they are <b>dropped</b>. Those parts are then on order
         *       nowhere; order them again if the customer still wants them.</li>
         * </ul>
         * Same question the dashboard asks — <i>« Voulez-vous enregistrer les lignes qui sont
         * disponibles à date dans une nouvelle commande ? »</i>
         *
         * <p><b>Required as soon as one kept line carries that decision</b>, and ignored
         * otherwise. There is no sensible default: one answer keeps the parts on order, the
         * other abandons them, and neither should happen by omission.
         */
        Boolean splitDeferredLines,

        @NotEmpty(message = "lines is required and must not be empty")
        @Valid
        @Size(max = 200, message = "at most 200 lines are accepted")
        List<Line> lines) {

    public record Line(
            /**
             * The {@code lineId} of {@code GET /orders}. Preferred: a commande may hold the
             * same reference twice, and only the id tells them apart.
             */
            @Size(max = 50, message = "lines[].lineId must be at most 50 characters")
            String lineId,

            /** Alternative to {@code lineId}, accepted when it matches exactly one line. */
            @Size(max = 20, message = "lines[].reference must be at most 20 characters")
            String reference,

            /**
             * How much to keep. {@code 0} removes the line from the commande; anything else
             * commits that quantity and cannot exceed what the supplier said he has.
             */
            @NotNull(message = "lines[].quantity is required")
            @Min(value = 0, message = "lines[].quantity cannot be negative")
            BigDecimal quantity) {
    }
}
