package com.plexus.backend.dto;

/**
 * The outcome of cancelling a commande.
 *
 * <p>{@code alreadyCancelled} makes a retry harmless: the second call reports the commande as
 * it stands instead of failing, so a timeout does not leave the caller unsure.
 */
public record PartnerOrderCancelResponse(
        String number,
        boolean cancelled,
        boolean alreadyCancelled,
        PartnerOrderStatusResponse.Order order) {
}
