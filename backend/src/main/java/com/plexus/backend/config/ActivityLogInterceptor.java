package com.plexus.backend.config;

import com.plexus.backend.security.JwtUtil;
import com.plexus.backend.service.ActivityLogService;
import com.plexus.backend.service.ActivityLogService.ActivityEntry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;
import org.springframework.web.util.WebUtils;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Feeds the journal d'activité from real HTTP traffic.
 *
 * Only actions worth tracing are journalled: every write (POST/PUT/PATCH/DELETE)
 * plus a short whitelist of sensitive reads (Excel exports, file downloads).
 * Plain GETs are skipped on purpose — the app polls a lot, and a journal full of
 * list refreshes hides the events that matter.
 *
 * Login/logout are recorded by {@code AuthController} itself, where the outcome
 * and the real identity are known (those routes are permitAll, so no JWT here).
 */
@Component
@Slf4j
public class ActivityLogInterceptor implements HandlerInterceptor {

    private static final String START_ATTR = "plexus.activity.start";

    /** Credential-shaped JSON fields are replaced by "***" before anything is written. */
    private static final Pattern SENSITIVE_FIELD = Pattern.compile(
            "(?i)(\"(?:password|catalogPassword|motDePasse|token|accessToken|secret|authorization)\"\\s*:\\s*)\"[^\"]*\"");

    /** First document number found in a body — used when the route carries no id. */
    private static final Pattern DOCUMENT_NUMBER = Pattern.compile(
            "(?i)\"(documentNo|number|orderNumber|no)\"\\s*:\\s*\"([^\"]+)\"");

    /** Answers we must never copy into the journal (a PDF or a workbook, byte for byte). */
    private static final Pattern BINARY_CONTENT_TYPE = Pattern.compile(
            "(?i)pdf|octet-stream|spreadsheet|excel|zip|image/|msword");

    /** Journal lines stay readable — and the month file stays small. */
    private static final int MAX_STORED_CHARS = 4000;

    private final ActivityLogService activityLog;
    private final JwtUtil jwtUtil;
    private final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public ActivityLogInterceptor(ActivityLogService activityLog, JwtUtil jwtUtil) {
        this.activityLog = activityLog;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        try {
            String method = request.getMethod();
            String path = request.getRequestURI();

            if (!isAuditable(method, path)) {
                return;
            }

            ActivityEntry entry = new ActivityEntry();
            entry.timestamp = Instant.now().toString();
            entry.method = method;
            entry.path = path;
            entry.query = request.getQueryString();
            entry.status = response.getStatus();
            entry.success = response.getStatus() < 400 && ex == null;
            entry.ip = ClientIdentity.ip(request);
            entry.userAgent = ClientIdentity.userAgent(request);
            if (ex != null) {
                entry.detail = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            }

            Object start = request.getAttribute(START_ATTR);
            if (start instanceof Long) {
                entry.durationMs = System.currentTimeMillis() - (Long) start;
            }

            fillIdentity(entry, request);

            ActivityActions.Descriptor descriptor = ActivityActions.describe(method, path);
            entry.category = descriptor.category;
            entry.action = descriptor.action;
            entry.reference = descriptor.reference;

            entry.payload = requestBody(request);
            entry.responseBody = responseBody(response);
            entry.context = activityContext(request);
            if (entry.reference == null) {
                // Creations carry no id in the URL — take the document number from what was
                // sent, or from what Business Central answered.
                entry.reference = firstDocumentNumber(entry.responseBody, entry.payload);
            }

            // Translate the payload into what the user actually did.
            ActivityNarrator.narrate(entry, mapper);

            activityLog.record(entry);
        } catch (Exception e) {
            log.debug("Journal d'activité: événement ignoré ({})", e.getMessage());
        }
    }

    /** Writes are always traced; reads only when they extract data out of the app. */
    private boolean isAuditable(String method, String path) {
        if (path == null || !path.startsWith("/api/")) {
            return false;
        }
        // Never journal the journal itself (or the login routes — AuthController does those).
        if (path.startsWith("/api/activity-log") || path.startsWith("/api/account/")
                || path.startsWith("/api/catalogue/")) {
            return false;
        }
        if ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method) || "DELETE".equals(method)) {
            return true;
        }
        return "GET".equals(method) && ActivityActions.isAuditableRead(path);
    }

    /** Identity comes from the JWT the frontend already sends on every call. */
    private void fillIdentity(ActivityEntry entry, HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                entry.user = jwtUtil.extractUsername(token);
                entry.role = jwtUtil.extractClaim(token, c -> c.get("role", String.class));
                entry.customerNo = jwtUtil.extractClaim(token, c -> c.get("customerNo", String.class));
                entry.vendorNo = jwtUtil.extractClaim(token, c -> c.get("vendorNo", String.class));
            } catch (Exception ignored) {
                // expired/invalid token — the request is being rejected anyway, still trace it
            }
        }
        if (entry.customerNo == null) {
            entry.customerNo = request.getHeader("X-Customer-No");
        }
        if (entry.vendorNo == null) {
            entry.vendorNo = request.getHeader("X-Vendor-No");
        }
        if (entry.user == null) {
            entry.user = "anonyme";
        }
    }

    // ==================== bodies ====================

    /** What the user sent, if {@link ActivityLogCachingFilter} kept it. */
    private String requestBody(HttpServletRequest request) {
        ContentCachingRequestWrapper wrapper = WebUtils.getNativeRequest(request, ContentCachingRequestWrapper.class);
        if (wrapper == null) {
            return null;
        }
        byte[] buffer = wrapper.getContentAsByteArray();
        if (buffer.length == 0) {
            return null;
        }
        return clean(new String(buffer, StandardCharsets.UTF_8));
    }

    /**
     * What was answered. Text and JSON are kept — several routes report their errors as
     * plain text, and that message is exactly what makes a failed action understandable.
     * Binary answers (documents, files) are never stored.
     */
    private String responseBody(HttpServletResponse response) {
        ContentCachingResponseWrapper wrapper = WebUtils.getNativeResponse(response, ContentCachingResponseWrapper.class);
        if (wrapper == null) {
            return null;
        }
        String contentType = wrapper.getContentType();
        if (contentType != null && BINARY_CONTENT_TYPE.matcher(contentType).find()) {
            return null;
        }
        byte[] buffer = wrapper.getContentAsByteArray();
        if (buffer.length == 0) {
            return null;
        }
        return clean(new String(buffer, StandardCharsets.UTF_8));
    }

    /**
     * Optional {@code X-Activity-Context} header: a short human sentence the frontend
     * sends when the request alone can't tell the story — a DELETE, typically, whose
     * target no longer exists by the time anyone reads the journal. Percent-encoded by
     * the sender because HTTP headers are not UTF-8.
     */
    private String activityContext(HttpServletRequest request) {
        String raw = request.getHeader("X-Activity-Context");
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            String decoded = URLDecoder.decode(raw, StandardCharsets.UTF_8);
            return decoded.length() > 300 ? decoded.substring(0, 300) : decoded;
        } catch (Exception e) {
            return raw;
        }
    }

    /** Redact anything credential-shaped, then cap the size stored in the journal. */
    private String clean(String body) {
        String redacted = SENSITIVE_FIELD.matcher(body).replaceAll("$1\"***\"");
        if (redacted.length() > MAX_STORED_CHARS) {
            return redacted.substring(0, MAX_STORED_CHARS) + "… (tronqué)";
        }
        return redacted;
    }

    /**
     * Best-effort document number for creations: the first {@code documentNo}/{@code number}
     * found in the response, else in the request.
     */
    private String firstDocumentNumber(String... bodies) {
        for (String body : bodies) {
            if (body == null) {
                continue;
            }
            Matcher matcher = DOCUMENT_NUMBER.matcher(body);
            if (matcher.find()) {
                String value = matcher.group(2);
                if (value != null && !value.isBlank()) {
                    return value;
                }
            }
        }
        return null;
    }

}
