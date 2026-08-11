package com.plexus.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * A cart to turn into purchase orders — the mobile app's equivalent of validating the
 * dashboard's panier.
 *
 * <p>Like the panier, the items carry their own vendor and are grouped by it: a cart
 * spanning three suppliers becomes three commandes, because a commande in Business Central
 * is placed with one vendor.
 *
 * <p>The insurance block is the "dossier assurance" the dashboard asks for before
 * validating. It is optional here for the same reason it is a checkbox there — an order can
 * legitimately exist without a claim — but the commercial app always sends it.
 */
public record PartnerOrderRequest(

        /**
         * The caller's own identifier for <b>this call</b> — and what makes a retry safe.
         *
         * <p>Before writing anything, the commandes already created under this reference are
         * looked up in Business Central; the vendors already served come back as they are and
         * only the missing ones are created. So a timeout followed by a retry ends with one
         * commande per vendor, not two.
         *
         * <p>It must therefore be <b>stable across a retry and different for a new order</b>.
         * Reusing it for a second, genuine cart would return the first cart's commandes and
         * order nothing.
         */
        @NotBlank(message = "externalReference is required")
        @Size(max = 50, message = "externalReference must be at most 50 characters")
        String externalReference,

        /**
         * N° du dossier de prise en charge, stored on the commande as {@code Pec-Dossier}.
         *
         * <p>This one <b>groups</b>: a dossier carries every commande it took to serve it —
         * one per vendor when the cart is split, plus anything ordered later, from the same
         * vendor or another. It is not unique and is not the idempotency key.
         */
        @NotBlank(message = "pecDossier is required")
        @Size(max = 50, message = "pecDossier must be at most 50 characters")
        String pecDossier,

        /** BC customer the commande is placed for. Defaults to PLEXUSPEC, like the demandes. */
        @Size(max = 20, message = "customerNo must be at most 20 characters")
        String customerNo,

        @NotNull(message = "vehicle is required")
        @Valid
        Vehicle vehicle,

        @Valid
        Insurance insurance,

        @NotEmpty(message = "items is required and must not be empty")
        @Valid
        @Size(max = 200, message = "at most 200 items are accepted")
        List<Item> items) {

    public record Vehicle(
            /** The plate is the key of a claim file — every commande is filed against one. */
            @NotBlank(message = "vehicle.immatriculation is required")
            @Size(max = 20, message = "vehicle.immatriculation must be at most 20 characters")
            String immatriculation,

            /** A VIN is 17 characters exactly; the dashboard refuses anything else. */
            @Size(min = 17, max = 17, message = "vehicle.vin must be exactly 17 characters")
            String vin) {
    }

    public record Insurance(
            /** {@code MAE ASSURANCE} when omitted. Free text — BC stores it as sent. */
            @Size(max = 100, message = "insurance.name must be at most 100 characters")
            String name,

            /** N° de sinistre. */
            @Size(max = 50, message = "insurance.claimNumber must be at most 50 characters")
            String claimNumber,

            /** Nom de l'assuré. */
            @Size(max = 100, message = "insurance.insuredName must be at most 100 characters")
            String insuredName) {
    }

    public record Item(
            /** Plexus item number, as returned by {@code GET /articles}. */
            @NotBlank(message = "items[].reference is required")
            @Size(max = 20, message = "items[].reference must be at most 20 characters")
            String reference,

            /** Which supplier this line is ordered from — {@code vendorNo} from the lookup. */
            @NotBlank(message = "items[].vendorNo is required")
            @Size(max = 20, message = "items[].vendorNo must be at most 20 characters")
            String vendorNo,

            @NotNull(message = "items[].quantity is required")
            @Min(value = 1, message = "items[].quantity must be at least 1")
            Integer quantity,

            /**
             * Optional. Left out, the live catalogue price is used — which is what the
             * dashboard sends, and what keeps a commande from being placed at a price the
             * mobile app cached days ago.
             */
            @DecimalMin(value = "0.0", inclusive = false, message = "items[].unitPrice must be greater than 0")
            BigDecimal unitPrice,

            /** Optional. Defaults to the catalogue designation. */
            @Size(max = 100, message = "items[].description must be at most 100 characters")
            String description,

            /**
             * An adaptable part: the reference is a suggestion to be confirmed against the
             * vehicle, which is why it travels with a chassis number.
             */
            Boolean adaptable,

            @Size(max = 50, message = "items[].chassisNo must be at most 50 characters")
            String chassisNo) {
    }
}
