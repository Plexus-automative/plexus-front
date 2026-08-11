package com.plexus.backend.controller;

import com.plexus.backend.security.JwtUtil;
import com.plexus.backend.service.PushNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Web Push subscription management for the portal.
 *
 * <p>Sits on the portal security chain, so callers arrive with a normal user JWT. The
 * subscription is filed against the {@code customerNo} carried in that <strong>signed</strong>
 * token rather than anything the request body claims — otherwise any authenticated user
 * could subscribe themselves to C0090's notifications and receive every demande.
 */
@RestController
@RequestMapping("/api/push")
@Slf4j
public class PushController {

    private final PushNotificationService pushService;
    private final JwtUtil jwtUtil;

    public PushController(PushNotificationService pushService, JwtUtil jwtUtil) {
        this.pushService = pushService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * The VAPID public key the browser needs to create a subscription.
     *
     * <p>Public by design — it is the half of the pair meant to be handed out. The private
     * key never leaves the server.
     */
    @GetMapping("/public-key")
    public ResponseEntity<Map<String, Object>> publicKey() {
        if (!pushService.isConfigured()) {
            return ResponseEntity.ok(Map.of("enabled", false));
        }
        return ResponseEntity.ok(Map.of("enabled", true, "publicKey", pushService.getPublicKey()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        TokenClaims claims = claimsOf(request);
        if (claims == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise."));
        }

        String endpoint = str(body.get("endpoint"));
        Map<?, ?> keys = body.get("keys") instanceof Map<?, ?> m ? m : Map.of();
        String p256dh = str(keys.get("p256dh"));
        String auth = str(keys.get("auth"));

        if (endpoint == null || p256dh == null || auth == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Abonnement incomplet."));
        }

        try {
            pushService.saveSubscription(endpoint, p256dh, auth, claims.login, claims.customerNo,
                    request.getHeader(HttpHeaders.USER_AGENT));
            return ResponseEntity.ok(Map.of("subscribed", true));
        } catch (Exception e) {
            log.error("!!! Could not store push subscription for {}: {}", claims.customerNo, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Impossible d'enregistrer l'abonnement."));
        }
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        if (claimsOf(request) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise."));
        }
        String endpoint = str(body.get("endpoint"));
        if (endpoint == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Endpoint manquant."));
        }
        try {
            pushService.deleteSubscription(endpoint);
            return ResponseEntity.ok(Map.of("subscribed", false));
        } catch (Exception e) {
            log.error("!!! Could not delete push subscription: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Impossible de supprimer l'abonnement."));
        }
    }

    // ------------------------------------------------------------------

    private record TokenClaims(String login, String customerNo) {
    }

    /** @return the signed claims, or null when the request carries no usable token. */
    private TokenClaims claimsOf(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = header.substring(7);
            return new TokenClaims(
                    jwtUtil.extractUsername(token),
                    jwtUtil.extractClaim(token, c -> c.get("customerNo", String.class)));
        } catch (Exception e) {
            return null;
        }
    }

    private String str(Object value) {
        if (value == null) return null;
        String s = value.toString().trim();
        return s.isEmpty() ? null : s;
    }
}
