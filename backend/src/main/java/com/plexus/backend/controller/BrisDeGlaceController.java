package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.security.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Bris de Glace (auto-glass claim dossiers).
 *
 * A glass B2B user submits a dossier that is stored in Business Central in a
 * dedicated table ({@code PLX_BrisHeader}, exposed as the writable API entity
 * {@code plexusBrisHeaders}) — mirroring how the PEC "demande" flow works.
 * No Purchase Order and NO vendor are required at creation: Plexus (C0090)
 * processes the dossier afterwards. The uploaded PDF is stored on the backend
 * filesystem; only its filename is persisted in BC ({@code insuranceFile}).
 *
 * Scoping: a glass user sees only dossiers they created (filtered by login);
 * the Plexus customer C0090 sees all.
 */
@RestController
@RequestMapping("/api/bris-de-glace")
@Slf4j
public class BrisDeGlaceController {

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @Value("${bris-de-glace.uploads-dir}")
    private String uploadsDir;

    @Value("${bris-de-glace.customer-no:C0090}")
    private String brisCustomerNo;

    private Path uploadsPath;

    public BrisDeGlaceController(WebClient webClient, BusinessCentralTokenService tokenService, JwtUtil jwtUtil) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.jwtUtil = jwtUtil;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
        uploadsPath = prepareUploadsDir();
        log.info("Bris de glace uploads dir: {}", uploadsPath);
    }

    /**
     * Resolve a writable uploads directory. Tries the configured path first, then the app
     * working dir, then the OS temp dir — so a bad/unwritable BRIS_UPLOADS_DIR (e.g. /data on
     * a local macOS run) never blocks dossier creation. In Docker the mounted /data volume is
     * writable, so the configured path is used.
     */
    private Path prepareUploadsDir() {
        String[] candidates = {
                uploadsDir,
                Paths.get(System.getProperty("user.dir"), "uploads", "bris-de-glace").toString(),
                Paths.get(System.getProperty("java.io.tmpdir"), "bris-uploads").toString()
        };
        for (String candidate : candidates) {
            if (candidate == null || candidate.isBlank()) continue;
            try {
                Path p = Paths.get(candidate).toAbsolutePath().normalize();
                Files.createDirectories(p);
                if (Files.isWritable(p)) {
                    if (!candidate.equals(uploadsDir)) {
                        log.warn("Configured bris uploads dir '{}' is not usable; falling back to '{}'.", uploadsDir, p);
                    }
                    return p;
                }
            } catch (Exception e) {
                log.warn("Bris uploads candidate '{}' not usable: {}", candidate, e.getMessage());
            }
        }
        return Paths.get(System.getProperty("java.io.tmpdir"), "bris-uploads").toAbsolutePath().normalize();
    }

    // ------------------------------------------------------------------
    // Create dossier
    // ------------------------------------------------------------------
    @PostMapping(value = "/dossiers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createDossier(
            HttpServletRequest request,
            @RequestParam("data") String dataJson,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        String token = tokenService.getAccessToken();
        String creator = extractLogin(request);
        String customerNo = request.getHeader("X-Customer-No");

        try {
            JsonNode data = mapper.readTree(dataJson);
            String dossierNo = text(data, "dossierNo");
            String immatriculation = text(data, "immatriculation");
            String assureur = text(data, "assureur");
            String vehicleMakeModel = text(data, "vehicleMakeModel");
            String vin = text(data, "vin");
            String damageZones = joinZones(data.get("damageZones"));

            // 1. Save the PDF to disk (only the filename is stored in BC).
            String savedFileName = null;
            if (file != null && !file.isEmpty()) {
                savedFileName = saveFile(file, dossierNo);
            }

            // 2. Create the dossier record in BC (no PO, no vendor).
            String number = "BG" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
                    + ((int) (Math.random() * 90) + 10);

            ObjectNode payload = mapper.createObjectNode();
            payload.put("number", number);
            payload.put("brisDossierNo", dossierNo);
            payload.put("registrationNumber", immatriculation);
            payload.put("insuranceName", assureur);
            payload.put("vehicleMakeModel", vehicleMakeModel);
            payload.put("vin", vin);
            payload.put("damageZones", damageZones);
            if (savedFileName != null) payload.put("insuranceFile", savedFileName);
            payload.put("createdBy", creator);
            if (customerNo != null && !customerNo.isBlank()) payload.put("customerNo", customerNo);

            String url = tarekSystemUrl + "/plexusBrisHeaders";
            String response = webClient.post()
                    .uri(java.net.URI.create(url))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(payload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            log.info("Bris dossier created: {}", number);
            return ResponseEntity.ok(response);

        } catch (WebClientResponseException e) {
            log.error("!!! BC error creating bris dossier: {}", e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("!!! Error creating bris dossier: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("{\"error\":\"" + safe(e.getMessage()) + "\"}");
        }
    }

    // ------------------------------------------------------------------
    // Attach / replace the PDF on an existing dossier (from the consultation list)
    // ------------------------------------------------------------------
    @PostMapping(value = "/dossiers/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateDossierFile(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\":\"Fichier PDF manquant\"}");
        }
        String token = tokenService.getAccessToken();
        try {
            String savedFileName = saveFile(file, null);

            ObjectNode patch = mapper.createObjectNode();
            patch.put("insuranceFile", savedFileName);

            String response = webClient.patch()
                    .uri(java.net.URI.create(tarekSystemUrl + "/plexusBrisHeaders(" + id + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue(patch.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            log.info("Bris dossier {} PDF updated: {}", id, savedFileName);
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            log.error("!!! BC error updating bris file for {}: {}", id, e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("!!! Error updating bris file for {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("{\"error\":\"" + safe(e.getMessage()) + "\"}");
        }
    }

    // ------------------------------------------------------------------
    // Mark a dossier as treated (C0090 processing) — drops it from the notification
    // ------------------------------------------------------------------
    @PostMapping("/dossiers/{id}/treat")
    public ResponseEntity<String> treatDossier(@PathVariable String id,
            @RequestParam(value = "treated", defaultValue = "true") boolean treated) {
        String token = tokenService.getAccessToken();
        try {
            ObjectNode patch = mapper.createObjectNode();
            patch.put("treated", treated);

            String response = webClient.patch()
                    .uri(java.net.URI.create(tarekSystemUrl + "/plexusBrisHeaders(" + id + ")"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("If-Match", "*")
                    .bodyValue(patch.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            log.info("Bris dossier {} treated={}", id, treated);
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            log.error("!!! BC error treating bris dossier {}: {}", id, e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body("BC Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("!!! Error treating bris dossier {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("{\"error\":\"" + safe(e.getMessage()) + "\"}");
        }
    }

    // ------------------------------------------------------------------
    // List dossiers (creator sees own; the Plexus customer C0090 sees all)
    // ------------------------------------------------------------------
    @GetMapping("/dossiers")
    public ResponseEntity<String> listDossiers(HttpServletRequest request) {
        String token = tokenService.getAccessToken();
        String customerNo = request.getHeader("X-Customer-No");
        String login = extractLogin(request);

        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromHttpUrl(tarekSystemUrl + "/plexusBrisHeaders")
                    .queryParam("$orderby", "creationDateTime desc");

            boolean seesAll = brisCustomerNo.equalsIgnoreCase(customerNo == null ? "" : customerNo.trim());
            if (!seesAll) {
                builder.queryParam("$filter", "createdBy eq '" + login.replace("'", "''") + "'");
            }

            String response = webClient.get()
                    .uri(builder.build().encode().toUri())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(45));

            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("!!! Error listing bris dossiers: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("{\"error\":\"" + safe(e.getMessage()) + "\"}");
        }
    }

    // ------------------------------------------------------------------
    // Vehicle makes/models reference list (managed in BC — no redeploy to edit)
    // ------------------------------------------------------------------
    @GetMapping("/vehicle-models")
    public ResponseEntity<String> listVehicleModels() {
        String token = tokenService.getAccessToken();
        try {
            String response = webClient.get()
                    .uri(java.net.URI.create(tarekSystemUrl + "/plexusVehicleModels?$orderby=make,model"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("!!! Error listing vehicle models: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("{\"error\":\"" + safe(e.getMessage()) + "\"}");
        }
    }

    // ------------------------------------------------------------------
    // Download the dossier PDF
    // ------------------------------------------------------------------
    @GetMapping("/dossiers/{id}/file")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {
        String token = tokenService.getAccessToken();
        try {
            String resp = webClient.get()
                    .uri(java.net.URI.create(tarekSystemUrl + "/plexusBrisHeaders(" + id + ")?$select=insuranceFile"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            JsonNode node = mapper.readTree(resp);
            String fileName = node.has("insuranceFile") && !node.get("insuranceFile").isNull()
                    ? node.get("insuranceFile").asText()
                    : "";
            if (fileName.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Path-traversal guard: only a bare filename resolved under the uploads dir.
            Path resolved = uploadsPath.resolve(fileName).normalize();
            if (!resolved.startsWith(uploadsPath) || !Files.exists(resolved)) {
                log.warn("Bris file not found or outside uploads dir: {}", fileName);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(resolved);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resolved.getFileName() + "\"")
                    .body(resource);
        } catch (WebClientResponseException e) {
            log.error("!!! Error resolving bris file for {}: {}", id, e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            log.error("!!! Error downloading bris file for {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    private String saveFile(MultipartFile file, String dossierNo) throws Exception {
        String base = dossierNo == null ? "" : dossierNo.replaceAll("[^A-Za-z0-9]", "_");
        if (base.length() > 40) base = base.substring(0, 40);
        String fileName = ("bris_" + (base.isEmpty() ? "" : base + "_") + UUID.randomUUID() + ".pdf");
        Path target = uploadsPath.resolve(fileName).normalize();
        if (!target.startsWith(uploadsPath)) {
            throw new IllegalArgumentException("Invalid upload target");
        }
        // Self-heal: ensure the uploads directory exists (init() may have failed if the
        // path was not yet writable). Surfaces a clear error if the path is unusable.
        Files.createDirectories(uploadsPath);
        Files.copy(file.getInputStream(), target);
        return fileName;
    }

    private String extractLogin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String login = jwtUtil.extractUsername(authHeader.substring(7));
                return login == null ? "" : login;
            } catch (Exception ignore) {
            }
        }
        return "";
    }

    private static String text(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText().trim() : "";
    }

    private static String joinZones(JsonNode zones) {
        if (zones == null || !zones.isArray()) {
            return zones != null && zones.isTextual() ? zones.asText().trim() : "";
        }
        StringBuilder sb = new StringBuilder();
        for (JsonNode z : (ArrayNode) zones) {
            if (z.isNull()) continue;
            String v = z.asText().trim();
            if (v.isEmpty()) continue;
            if (sb.length() > 0) sb.append(',');
            sb.append(v);
        }
        return sb.toString();
    }

    private static String safe(String msg) {
        return msg == null ? "" : msg.replace("\"", "'").replace("\n", " ");
    }
}
