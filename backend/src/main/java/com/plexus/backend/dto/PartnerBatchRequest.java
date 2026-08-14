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
 * Everything the commercial decided about a dossier, in one call.
 *
 * <p>A dossier splits into as many commandes as it has suppliers, and the commercial settles
 * them together: two validated, one cancelled. Sending that as one request saves the caller a
 * round trip per commande — and saves this API from being hammered N times for one decision.
 *
 * <p><b>Not transactional.</b> Each commande is settled on its own against Business Central,
 * and one refusal does not roll back the others. The response reports every commande
 * separately, so a caller that reads it knows exactly what to resend.
 */
public record PartnerBatchRequest(

        @NotEmpty(message = "orders is required and must not be empty")
        @Valid
        @Size(max = 50, message = "at most 50 commandes per batch")
        List<Entry> orders) {

    public record Entry(

            @NotBlank(message = "orders[].number is required")
            @Size(max = 20, message = "orders[].number must be at most 20 characters")
            String number,

            /** {@code validate} or {@code cancel}. */
            @NotBlank(message = "orders[].action is required — \"validate\" or \"cancel\"")
            String action,

            // ---- validate ----
            /**
             * Required on {@code validate}, and every line of the commande must appear —
             * same rule as {@code POST /orders/validate}, for the same reason: the call both
             * deletes and commits.
             */
            @Valid
            List<Line> lines,

            /** Required on {@code validate} as soon as a kept line answers LivPrevuaDate. */
            Boolean splitDeferredLines) {

            // `cancel` needs nothing but the number — see PartnerOrderCancelRequest.

        public static final String VALIDATE = "validate";
        public static final String CANCEL = "cancel";
    }

    public record Line(
            @Size(max = 50) String lineId,
            @Size(max = 20) String reference,
            @NotNull(message = "orders[].lines[].quantity is required")
            @Min(value = 0, message = "orders[].lines[].quantity cannot be negative")
            BigDecimal quantity) {
    }
}
