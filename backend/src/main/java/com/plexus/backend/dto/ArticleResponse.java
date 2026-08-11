package com.plexus.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * One article/vendor pair — the same row the dashboard's article search shows.
 *
 * <p>An article carries as many rows as it has referencing vendors, which is why the
 * vendor fields are on the article itself rather than nested: what the commercial picks
 * is "this part, from this supplier", not the part alone.
 *
 * <p>{@code unitCost} exists upstream on the same record and is deliberately not relayed.
 */
public record ArticleResponse(
        String reference,
        String designation,
        BigDecimal unitPrice,
        String unit,
        String vendorNo,
        String vendorName,
        String vendorReference,
        LastPriceUpdate lastPriceUpdate) {

    /**
     * When {@code unitPrice} last moved, so the commercial knows whether he is quoting on a
     * current price or on one that has not been touched in months.
     *
     * <p>Tracked <b>per article</b>, not per vendor row: the source is the item's own price
     * history in BC. Every vendor row of the same reference therefore carries the same block.
     * {@code null} when that price has never changed since the article was created.
     *
     * <p>{@code daysAgo} and {@code freshness} ({@code recent} ≤ 7 days, {@code aging} ≤ 14,
     * {@code stale} beyond) are computed here rather than left to the caller, so the mobile
     * app and the dashboard colour the same price the same way. The BC user behind the change
     * is not relayed: it reads {@code API OR WEBSERVICE} for everything done through the apps.
     */
    public record LastPriceUpdate(
            String date,
            BigDecimal previousPrice,
            BigDecimal newPrice,
            int changeCount,
            Long daysAgo,
            String freshness) {
    }

    /**
     * The rows matching one lookup.
     *
     * <p>No pagination: the search is an exact reference match, so a result is a handful
     * of vendors, not a page of a catalogue.
     */
    public record Result(String reference, List<ArticleResponse> items) {
    }
}
