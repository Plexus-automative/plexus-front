package com.plexus.backend.config;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Works out WHO is on the other end of a request, for the journal d'activité.
 *
 * Three hops can hide the real user:
 * <ul>
 * <li>nginx — the backend's peer is the proxy, so the client address only lives in
 * {@code X-Real-IP} / {@code X-Forwarded-For};</li>
 * <li>Docker — with no proxy in front (local stack, direct call to the published
 * port) the peer is the bridge gateway, e.g. {@code 172.18.0.1}: that is the host
 * machine, not a user;</li>
 * <li>Next.js — the login is performed <em>server-side</em> by NextAuth, so without
 * help the backend would record the frontend container instead of the person
 * logging in. The frontend therefore forwards the browser's address and user agent
 * in {@code X-Client-Ip} / {@code X-Client-User-Agent}.</li>
 * </ul>
 *
 * Trust: {@code X-Real-IP} is rewritten by our own nginx on every request, so it
 * cannot be forged from outside. {@code X-Forwarded-For} is read from its LAST hop —
 * the one nginx appended — because the leading entries are attacker-controlled.
 * {@code X-Client-Ip} is trusted by convention (only our frontend sets it); forging
 * it can only mislabel the machine of an otherwise authenticated action.
 */
public final class ClientIdentity {

    private ClientIdentity() {
    }

    public static String ip(HttpServletRequest request) {
        String reported = firstEntry(request.getHeader("X-Client-Ip"));
        if (reported != null) {
            return reported;
        }

        String realIp = trimToNull(request.getHeader("X-Real-IP"));
        if (realIp != null) {
            return realIp;
        }

        String forwarded = trimToNull(request.getHeader("X-Forwarded-For"));
        if (forwarded != null) {
            String[] hops = forwarded.split(",");
            String lastHop = trimToNull(hops[hops.length - 1]);
            if (lastHop != null) {
                return lastHop;
            }
        }

        return request.getRemoteAddr();
    }

    /** The end user's browser, forwarded by the frontend when it calls on their behalf. */
    public static String userAgent(HttpServletRequest request) {
        String reported = trimToNull(request.getHeader("X-Client-User-Agent"));
        return reported != null ? reported : request.getHeader("User-Agent");
    }

    private static String firstEntry(String header) {
        String value = trimToNull(header);
        if (value == null) {
            return null;
        }
        return trimToNull(value.split(",")[0]);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
