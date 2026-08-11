package com.plexus.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * What one cart became: one commande per vendor.
 *
 * <p>{@code failed} is normally empty. It is not dropped when it is, because a caller that
 * only ever sees the field on the day something breaks tends not to handle it — the array is
 * always there, and a partial creation answers {@code 207} rather than {@code 201}.
 */
public record PartnerOrderResponse(
        String externalReference,
        String pecDossier,
        List<CreatedOrder> orders,
        List<FailedVendor> failed,
        /** True as soon as one commande in {@code orders} was already there before this call. */
        boolean duplicate) {

    public record CreatedOrder(
            /** BC document number, e.g. {@code CA26/2130} — what a human quotes on the phone. */
            String number,
            /** BC record id, for the follow-up endpoints. */
            String id,
            String vendorNo,
            String vendorName,
            /** Null on a commande this call did not create — BC is not re-read line by line. */
            Integer lineCount,
            BigDecimal totalExcludingTax,
            /** This call found it rather than created it: the caller already has this number. */
            boolean alreadyExisted) {
    }

    /** A vendor group Business Central refused, named so the caller can resend just that one. */
    public record FailedVendor(String vendorNo, String message) {
    }
}
