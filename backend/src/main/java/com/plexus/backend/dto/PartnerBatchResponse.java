package com.plexus.backend.dto;

import java.util.List;

/**
 * One result per commande of the batch, in the order they were sent.
 *
 * <p>Each entry carries the very body the single-commande endpoint would have returned, so a
 * caller can move from one to the other without changing how it reads the answer. A failure
 * carries its own {@code status} and {@code error} instead — nothing is hidden behind a
 * single overall verdict.
 */
public record PartnerBatchResponse(
        int okCount,
        int failedCount,
        List<Result> results) {

    public record Result(
            String number,
            String action,
            /** HTTP status the same operation would have returned on its own endpoint. */
            int status,
            /** True for any 2xx. */
            boolean ok,
            /** The single-endpoint response body — or the error body when it failed. */
            Object body) {
    }
}
