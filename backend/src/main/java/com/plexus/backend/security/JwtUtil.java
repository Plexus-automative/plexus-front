package com.plexus.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    /** HS256 needs at least 256 bits of key material. */
    private static final int MIN_KEY_BYTES = 32;

    /**
     * Signing key for every portal token. No default value on purpose — a fallback key
     * committed to the repository lets anyone who can read the source mint a valid token
     * for any user, which is indistinguishable from a real login server-side.
     */
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:86400}") // Default 1 day in seconds
    private long jwtExpiration;

    /**
     * Refuses to start on a missing or too-short signing key.
     *
     * <p>Deliberately fatal rather than a warning: booting with a weak key produces
     * tokens that look valid to every downstream check, so the failure would otherwise
     * stay invisible until someone forged one. An unresolvable {@code JWT_SECRET} also
     * fails placeholder resolution before this runs; this catches the empty-string case,
     * which docker-compose produces when the variable is absent from .env.
     */
    @jakarta.annotation.PostConstruct
    void validateSecret() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is not set. Generate one with: openssl rand -base64 48");
        }
        if (getKeyBytes().length < MIN_KEY_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short for HS256 (needs >= " + MIN_KEY_BYTES
                            + " bytes). Generate one with: openssl rand -base64 48");
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(String username, Map<String, Object> extraClaims) {
        // Convert seconds to milliseconds
        return buildToken(extraClaims, username, jwtExpiration * 1000);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(getKeyBytes());
    }

    /** Decodes the configured secret as base64, falling back to its raw bytes. */
    private byte[] getKeyBytes() {
        try {
            return Decoders.BASE64.decode(secretKey);
        } catch (Exception e) {
            // Not valid base64 — treat the configured value as raw key material.
            return secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
    }
}
