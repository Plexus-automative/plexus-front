package com.plexus.backend.controller;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Turns validation and malformed-JSON failures on the partner API into a legible body.
 *
 * <p>Scoped to the partner controllers via {@code assignableTypes} rather than applied
 * globally: the portal controllers have their own error conventions and this must not
 * quietly change what the frontend receives. Every partner endpoint taking a
 * {@code @Valid} body belongs in the list, or its rejections come back in Spring's default
 * shape instead of the documented one.
 *
 * <p>The partner team cannot read our logs, so field-level messages are returned to
 * them. That is safe here because the messages come from our own DTO constraints and
 * describe the request they just sent — no internal state is disclosed.
 */
@RestControllerAdvice(assignableTypes = { DemandeDevisController.class, PartnerOrderController.class })
@Slf4j
public class PartnerApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> {
                    Map<String, String> v = new LinkedHashMap<>();
                    v.put("field", fe.getField());
                    v.put("message", fe.getDefaultMessage());
                    return v;
                })
                .toList();

        log.warn("Partner API validation rejected a payload: {}", violations);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "validation_failed");
        body.put("message", "The request payload is invalid.");
        body.put("violations", violations);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        // The parser message can echo payload fragments, so it is logged rather than returned.
        log.warn("Partner API received unparseable JSON: {}", ex.getMessage());

        // A bad timestamp is by far the likeliest cause here, and reporting it as
        // "malformed JSON" would send the caller hunting for a syntax error that isn't
        // there. Name the field instead.
        if (ex.getCause() instanceof InvalidFormatException ife) {
            String field = ife.getPath().stream()
                    .map(ref -> ref.getFieldName() != null
                            ? ref.getFieldName()
                            : "[" + ref.getIndex() + "]")
                    .reduce((a, b) -> b.startsWith("[") ? a + b : a + "." + b)
                    .orElse("(unknown)");

            String expected = ife.getTargetType() != null
                    && java.time.temporal.Temporal.class.isAssignableFrom(ife.getTargetType())
                            ? "an ISO-8601 timestamp with offset, e.g. 2026-08-04T10:32:15+01:00"
                            : "a " + (ife.getTargetType() == null
                                    ? "valid value"
                                    : ife.getTargetType().getSimpleName());

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("error", "validation_failed");
            body.put("message", "The request payload is invalid.");
            body.put("violations", List.of(Map.of(
                    "field", field,
                    "message", field + " must be " + expected)));
            return ResponseEntity.badRequest().body(body);
        }

        return ResponseEntity.badRequest().body(Map.of(
                "error", "malformed_json",
                "message", "Request body could not be parsed as JSON."));
    }
}
