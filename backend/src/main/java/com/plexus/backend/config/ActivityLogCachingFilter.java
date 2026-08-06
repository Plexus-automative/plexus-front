package com.plexus.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

/**
 * Makes the request/response bodies of write calls readable by
 * {@link ActivityLogInterceptor}, so the journal can show WHAT was sent and what
 * came back — not just which route was hit.
 *
 * Deliberately narrow, because caching a body means holding it in memory:
 * <ul>
 * <li>writes only (a GET has nothing interesting to cache);</li>
 * <li>never the login routes — they carry the password;</li>
 * <li>never multipart (PDF/Excel uploads would be buffered for nothing);</li>
 * <li>no response caching on routes that stream a document (BL, devis, facture,
 * exports).</li>
 * </ul>
 */
public class ActivityLogCachingFilter extends OncePerRequestFilter {

    /** Hard ceiling on what we buffer per request; the journal stores far less. */
    private static final int MAX_CACHED_BYTES = 64 * 1024;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {

        if (!shouldCapture(request)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest wrappedRequest = isMultipart(request)
                ? request
                : new ContentCachingRequestWrapper(request, MAX_CACHED_BYTES);

        ContentCachingResponseWrapper wrappedResponse = ActivityActions.streamsDocument(request.getRequestURI())
                ? null
                : new ContentCachingResponseWrapper(response);

        try {
            chain.doFilter(wrappedRequest, wrappedResponse != null ? wrappedResponse : response);
        } finally {
            // Mandatory: the wrapper swallowed the body, this writes it to the real response.
            if (wrappedResponse != null) {
                wrappedResponse.copyBodyToResponse();
            }
        }
    }

    private boolean shouldCapture(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null || !path.startsWith("/api/")) {
            return false;
        }
        if (path.startsWith("/api/activity-log") || path.startsWith("/api/account/")
                || path.startsWith("/api/catalogue/")) {
            return false;
        }
        String method = request.getMethod();
        return "POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method) || "DELETE".equals(method);
    }

    private boolean isMultipart(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith("multipart/");
    }
}
