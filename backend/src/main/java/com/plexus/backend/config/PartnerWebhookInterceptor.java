package com.plexus.backend.config;

import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;
import org.springframework.web.util.WebUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plexus.backend.service.PartnerWebhookService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Tells {@link PartnerWebhookService} which bris dossier a successful call may have changed.
 *
 * <p>Watching the routes here, rather than editing each controller method, keeps the hook in
 * one place: the supplier's answer goes through generic Business Central proxies
 * ({@code PATCH /api/purchase-orders/lines/{id}}), and the bodies are already cached by
 * {@link ActivityLogCachingFilter}. Only what can turn the partner's view of a dossier
 * PRICED is watched — a line deletion or a reception cannot.
 */
@Component
@Slf4j
public class PartnerWebhookInterceptor implements HandlerInterceptor {

    /** PUT /lines and POST /commander of the desk: the path carries the dossier number. */
    private static final Pattern BRIS_DOSSIER = Pattern.compile("^/api/bris-de-glace/dossiers/([^/]+)/(lines|commander)$");
    /** Commande header patch, or the split of a commande: the path carries the order id. */
    private static final Pattern ORDER = Pattern.compile("^/api/purchase-orders/([0-9a-fA-F-]{36})(/split-le-disponible)?$");
    /** The supplier's answer on one line: BC answers with the line, whose documentId is the order. */
    private static final Pattern ORDER_LINE = Pattern.compile("^/api/purchase-orders/lines/[^/]+$");
    /** The supplier's final confirmation: the order id is in the body. */
    private static final String VALIDATE_ORDER = "/api/purchase-orders/validate-order";

    private final PartnerWebhookService webhook;
    private final ObjectMapper mapper = new ObjectMapper();

    public PartnerWebhookInterceptor(PartnerWebhookService webhook) {
        this.webhook = webhook;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler, Exception ex) {
        if (!webhook.enabled() || ex != null || response.getStatus() >= 300 || "GET".equals(request.getMethod())) {
            return;
        }
        try {
            String path = request.getRequestURI();
            Matcher m = BRIS_DOSSIER.matcher(path);
            if (m.matches()) {
                webhook.dossierChanged(m.group(1));
                return;
            }
            m = ORDER.matcher(path);
            if (m.matches()) {
                webhook.orderChanged(m.group(1));
                return;
            }
            if (ORDER_LINE.matcher(path).matches() && "PATCH".equals(request.getMethod())) {
                webhook.orderChanged(field(responseBody(response), "documentId"));
                return;
            }
            if (VALIDATE_ORDER.equals(path)) {
                webhook.orderChanged(field(requestBody(request), "id"));
            }
        } catch (Exception e) {
            // Never let the webhook break the call it observes: polling covers a missed one.
            log.debug("Partner webhook hook skipped for {}: {}", request.getRequestURI(), e.getMessage());
        }
    }

    private String field(String json, String name) throws Exception {
        if (json == null || json.isBlank()) {
            return null;
        }
        JsonNode node = mapper.readTree(json);
        return node.hasNonNull(name) ? node.get(name).asText() : null;
    }

    private static String requestBody(HttpServletRequest request) {
        ContentCachingRequestWrapper wrapper = WebUtils.getNativeRequest(request, ContentCachingRequestWrapper.class);
        return wrapper == null ? null : new String(wrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
    }

    private static String responseBody(HttpServletResponse response) {
        ContentCachingResponseWrapper wrapper = WebUtils.getNativeResponse(response, ContentCachingResponseWrapper.class);
        return wrapper == null ? null : new String(wrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
    }
}
