package com.plexus.backend.dto;

/**
 * What the partner backend gets back after relaying a demande de devis.
 *
 * @param number            Plexus-side identifier (DD + timestamp), the reference to quote
 *                          when asking about this demande later.
 * @param externalReference echoed back so the caller can correlate without holding state.
 * @param status            lifecycle marker; RECEIVED means stored, not yet priced.
 * @param duplicate         true when an existing demande with the same externalReference
 *                          was found and returned instead of creating a second one.
 */
public record DemandeDevisResponse(
        String number,
        String externalReference,
        String status,
        boolean duplicate) {

    public static final String STATUS_RECEIVED = "RECEIVED";

    public static DemandeDevisResponse created(String number, String externalReference) {
        return new DemandeDevisResponse(number, externalReference, STATUS_RECEIVED, false);
    }

    public static DemandeDevisResponse existing(String number, String externalReference, String status) {
        return new DemandeDevisResponse(number, externalReference, status, true);
    }
}
