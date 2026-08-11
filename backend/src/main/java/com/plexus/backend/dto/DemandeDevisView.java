package com.plexus.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * A demande de devis as the Plexus portal displays it.
 *
 * <p>Separate from {@link DemandeDevisRequest}, which is what the partner sends us. The
 * two drift for good reasons: the portal wants the stored `items`/`media` already parsed
 * out of their JSON columns, plus fields the partner never sees (BC id, receipt time,
 * treatment state).
 *
 * @param items parsed from the stored JSON, so the frontend never handles a raw string
 * @param media same — each entry carries type/url/label/durationSec/addedAt
 */
public record DemandeDevisView(
        String id,
        String number,
        String externalReference,
        String status,
        /** Purchase order(s) created from this demande, comma-joined when several. */
        String orderNo,
        boolean treated,
        String customerNo,
        String customerName,
        /** When the commercial captured the demande in the field. May be null. */
        String createdOnDevice,
        /** When Plexus received it — later than the above if the mobile was offline. */
        String receivedAt,
        Garage garage,
        Commercial commercial,
        Vehicle vehicle,
        String notes,
        JsonNode items,
        JsonNode media) {

    public record Garage(String name, String customerNo) {
    }

    public record Commercial(String id, String name) {
    }

    public record Vehicle(String immatriculation, String vin, String make, String model) {
    }

    /** One page of demandes, with the unpaged total so the UI can show "x of y". */
    public record Page(long total, int limit, int offset, List<DemandeDevisView> items) {
    }
}
