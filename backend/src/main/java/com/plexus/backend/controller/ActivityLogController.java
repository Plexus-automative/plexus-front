package com.plexus.backend.controller;

import com.plexus.backend.security.JwtUtil;
import com.plexus.backend.service.ActivityLogService;
import com.plexus.backend.service.ActivityLogService.ActivityEntry;
import com.plexus.backend.service.ActivityLogService.ActivityQueryResult;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Journal d'activité — read API, reserved to the admin account (client C0082),
 * the only one with the consolidated dashboard.
 */
@RestController
@RequestMapping("/api/activity-log")
@Slf4j
public class ActivityLogController {

    private final ActivityLogService activityLog;
    private final JwtUtil jwtUtil;

    @Value("${activity-log.admin-customer-no:C0082}")
    private String adminCustomerNo;

    public ActivityLogController(ActivityLogService activityLog, JwtUtil jwtUtil) {
        this.activityLog = activityLog;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return forbidden();
        }
        try {
            ActivityQueryResult result = activityLog.query(parseDate(startDate), parseDate(endDate),
                    user, category, search, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Journal d'activité: requête en échec", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lecture du journal impossible: " + e.getMessage()));
        }
    }

    /** Same filters as the list, exported as CSV (Excel-friendly: ';' + BOM). */
    @GetMapping("/export")
    public ResponseEntity<?> export(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return forbidden();
        }

        List<ActivityEntry> entries = activityLog.queryAll(parseDate(startDate), parseDate(endDate),
                user, category, search);

        StringBuilder csv = new StringBuilder("﻿");
        csv.append("Date;Utilisateur;Role;Client;Fournisseur;Categorie;Action;Detail;Reference;Methode;Chemin;Statut;Duree (ms);IP\n");
        for (ActivityEntry e : entries) {
            csv.append(cell(e.timestamp)).append(';')
                    .append(cell(e.user)).append(';')
                    .append(cell(e.role)).append(';')
                    .append(cell(e.customerNo)).append(';')
                    .append(cell(e.vendorNo)).append(';')
                    .append(cell(e.category)).append(';')
                    .append(cell(e.action)).append(';')
                    .append(cell(e.summary)).append(';')
                    .append(cell(e.reference)).append(';')
                    .append(cell(e.method)).append(';')
                    .append(cell(e.path)).append(';')
                    .append(cell(e.status == null ? "" : String.valueOf(e.status))).append(';')
                    .append(cell(e.durationMs == null ? "" : String.valueOf(e.durationMs))).append(';')
                    .append(cell(e.ip)).append('\n');
        }

        String filename = "journal-activite-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
                .body(csv.toString());
    }

    // ==================== helpers ====================

    /** Only the dashboard admin (C0082) may read other people's activity. */
    private boolean isAdmin(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return false;
        }
        try {
            String token = header.substring(7);
            if (!jwtUtil.isTokenValid(token)) {
                return false;
            }
            String customerNo = jwtUtil.extractClaim(token, c -> c.get("customerNo", String.class));
            return adminCustomerNo != null && adminCustomerNo.equalsIgnoreCase(customerNo);
        } catch (Exception e) {
            return false;
        }
    }

    private ResponseEntity<Map<String, String>> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Accès au journal d'activité réservé au compte administrateur."));
    }

    private LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(raw.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private String cell(String value) {
        if (value == null) {
            return "";
        }
        // ';' is the separator and '"'/newlines break Excel's parsing — neutralise them.
        return value.replace(';', ',').replace('\n', ' ').replace('\r', ' ').replace('"', '\'');
    }
}
