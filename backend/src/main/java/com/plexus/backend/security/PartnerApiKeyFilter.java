package com.plexus.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;

/**
 * Authenticates the machine-to-machine partner API ({@code /api/partner/**}) with a
 * shared API key sent as {@code X-API-Key}.
 *
 * <p>The caller here is another <em>backend</em> (the commercial mobile app's server),
 * not a browser and not a human — so a shared secret is the right primitive: there is
 * no user to log in, and a confidential server client can actually keep a secret.
 *
 * <p>Deliberately NOT a {@code @Component}: a Filter bean is auto-registered into the
 * main servlet chain by Spring Boot and would then run on <em>every</em> request in the
 * app, rejecting the whole web portal. It is constructed explicitly by
 * {@link com.plexus.backend.config.PartnerSecurityConfig} so it only ever runs inside
 * the partner security chain.
 *
 * <p>Fails closed: when no key is configured, every partner request is rejected rather
 * than waved through. A missing key disables the partner API; it never disables the
 * check. Startup does not fail, so a missing key can't take the existing portal down.
 */
public class PartnerApiKeyFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-API-Key";

    /** Identifies the authenticated caller in the SecurityContext and the activity log. */
    private static final String PARTNER_PRINCIPAL = "partner-api";

    private static final String ROLE_PARTNER = "ROLE_PARTNER";

    private final byte[] expectedKey;
    private final boolean enabled;

    public PartnerApiKeyFilter(String configuredKey) {
        this.enabled = configuredKey != null && !configuredKey.isBlank();
        this.expectedKey = enabled ? configuredKey.trim().getBytes(StandardCharsets.UTF_8) : new byte[0];
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (!enabled) {
            // No key configured => the partner API is closed, not open.
            reject(response, "Partner API is not configured on this environment.");
            return;
        }

        String presented = request.getHeader(HEADER_NAME);
        if (presented == null || presented.isBlank()) {
            reject(response, "Missing " + HEADER_NAME + " header.");
            return;
        }

        // Constant-time comparison: a plain String.equals() short-circuits on the first
        // differing byte, which leaks the key one character at a time to a caller that
        // can measure response times.
        byte[] presentedBytes = presented.trim().getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expectedKey, presentedBytes)) {
            reject(response, "Invalid API key.");
            return;
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                PARTNER_PRINCIPAL,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(ROLE_PARTNER)));
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    /**
     * Always answers 401 with the same generic shape. The reason is intentionally coarse —
     * telling a caller "invalid key" vs "unknown client" helps an attacker enumerate.
     */
    private void reject(HttpServletResponse response, String detail) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"" + detail + "\"}");
    }
}
