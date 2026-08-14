package com.plexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Drops a commande the commercial decided not to place after all.
 *
 * <p>The case this exists for: a cart split across two suppliers, and the commercial buys
 * everything from the first. The second commande is not "validated with nothing" — it is
 * dropped. {@code POST /orders/validate} refuses an all-zero payload precisely so that this
 * stays a deliberate act rather than the side effect of an empty list.
 *
 * <p><b>The number is all this takes.</b> Everything dropped through this API is a devis that
 * never converted — nobody cancelled an order, the quote simply did not turn into one — so
 * Plexus records the cause itself, always as the word {@code Devis}. Real cancellations, the
 * ones with an expert or a client behind them, are a dashboard action and keep their own
 * reasons.
 */
public record PartnerOrderCancelRequest(

        @NotBlank(message = "number is required")
        @Size(max = 20, message = "number must be at most 20 characters")
        String number) {
}
