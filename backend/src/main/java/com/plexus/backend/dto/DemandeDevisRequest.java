package com.plexus.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * A "demande de devis" relayed from the commercial mobile app's backend.
 *
 * <p>Explicit DTOs rather than the {@code Map}/{@code JsonNode} passthrough used
 * elsewhere in this codebase: this payload arrives from a system we do not deploy, so
 * the contract has to be stable and the validation errors have to be legible to a team
 * that can't read our logs.
 *
 * <p>Media is referenced by URL, never uploaded — the photos and voice notes stay on the
 * commercials' own backend and Plexus only stores links.
 */
public record DemandeDevisRequest(

        /**
         * The caller's own identifier for this demande. Used to make retries idempotent,
         * so it must be stable across a retry of the same logical request.
         */
        @NotBlank(message = "externalReference is required")
        @Size(max = 50, message = "externalReference must be at most 50 characters")
        String externalReference,

        @NotNull(message = "garage is required")
        @Valid
        Garage garage,

        @Valid
        Commercial commercial,

        @NotNull(message = "vehicle is required")
        @Valid
        Vehicle vehicle,

        @Valid
        @Size(max = 200, message = "at most 200 items are accepted")
        List<Item> items,

        @Size(max = 2000, message = "notes must be at most 2000 characters")
        String notes,

        /**
         * When the commercial started the demande on the device.
         *
         * <p>Distinct from the moment Plexus receives it: a visit captured in a garage
         * with no signal may only sync hours later, and it is the visit time that
         * matters when reading the demande back.
         */
        @JsonFormat(without = JsonFormat.Feature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE)
        OffsetDateTime createdAt,

        @Valid
        @Size(max = 100, message = "at most 100 media entries are accepted")
        List<Media> media) {

    public record Garage(
            @NotBlank(message = "garage.name is required")
            @Size(max = 100) String name,

            /** Optional BC customer number, when the garage is already a known customer. */
            @Size(max = 20) String customerNo) {
    }

    public record Commercial(
            @Size(max = 50) String id,
            @Size(max = 100) String name) {
    }

    /**
     * Marque and modèle are separate fields, matching how vehicles are already stored
     * in BC ({@code PLX_VehicleModel}: Make Text[50], Model Text[100]) — so a value sent
     * here can be reconciled against the existing marque/modèle list.
     */
    public record Vehicle(
            @Size(max = 20) String immatriculation,
            @Size(max = 25) String vin,
            @Size(max = 50) String make,
            @Size(max = 100) String model) {
    }

    public record Item(
            @NotBlank(message = "item.description is required")
            @Size(max = 250) String description,

            @Min(value = 1, message = "item.quantity must be at least 1")
            Integer quantity,

            /** When the commercial added this line during the visit. */
            @JsonFormat(without = JsonFormat.Feature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE)
            OffsetDateTime addedAt) {
    }

    public record Media(
            /** "photo", "audio", or "document". Free-form, but kept short for BC. */
            @NotBlank(message = "media.type is required")
            @Size(max = 20) String type,

            /**
             * Restricted to http/https on purpose. These links are stored and later opened
             * by Plexus staff from the BC UI, so accepting arbitrary schemes here would let
             * a caller plant {@code javascript:} or {@code file:} URLs for someone to click.
             */
            @NotBlank(message = "media.url is required")
            @Pattern(regexp = "^https?://.+", message = "media.url must be an http(s) URL")
            @Size(max = 500) String url,

            @Size(max = 100) String label,

            @Min(value = 0, message = "media.durationSec cannot be negative")
            Integer durationSec,

            /** When the photo was taken or the voice note recorded. */
            @JsonFormat(without = JsonFormat.Feature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE)
            OffsetDateTime addedAt) {
    }
}
