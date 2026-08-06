package com.plexus.backend.controller;

import com.plexus.backend.service.ActivityLogService;
import com.plexus.backend.service.ActivityLogService.ActivityEntry;
import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.BodyInserters;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final JwtUtil jwtUtil;
    private final ActivityLogService activityLog;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.system-url}")
    private String systemUrl;

    @Value("${business-central.api.tarek-system-url}")
    private String tarekSystemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (systemUrl != null && !systemUrl.contains("/companies(")) {
            systemUrl += "/companies(" + companyId + ")";
        }
        if (tarekSystemUrl != null && !tarekSystemUrl.contains("/companies(")) {
            tarekSystemUrl += "/companies(" + companyId + ")";
        }
    }

    @Value("${guacamole.url}")
    private String guacamoleUrl;

    public AuthController(WebClient webClient, BusinessCentralTokenService tokenService, JwtUtil jwtUtil,
            ActivityLogService activityLog) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.jwtUtil = jwtUtil;
        this.activityLog = activityLog;
    }

    /**
     * Journal d'activité entry for an authentication event. Login routes are permitAll,
     * so the interceptor has no JWT to read here — the outcome is recorded explicitly.
     */
    private void logAuth(HttpServletRequest httpRequest, String login, String action, boolean success,
            String detail, Map<String, Object> userData) {
        try {
            ActivityEntry entry = new ActivityEntry();
            entry.user = login == null ? "anonyme" : login;
            entry.category = "AUTH";
            entry.action = action;
            entry.success = success;
            entry.detail = detail;
            entry.method = httpRequest != null ? httpRequest.getMethod() : "POST";
            entry.path = httpRequest != null ? httpRequest.getRequestURI() : "/api/account/login";
            entry.status = success ? 200 : 401;
            if (httpRequest != null) {
                // NextAuth performs this call server-side, so the peer is the frontend
                // itself: the user's machine only arrives via the headers it forwards.
                entry.ip = com.plexus.backend.config.ClientIdentity.ip(httpRequest);
                entry.userAgent = com.plexus.backend.config.ClientIdentity.userAgent(httpRequest);
            }
            if (userData != null) {
                Object name = userData.get("name");
                Object role = userData.get("role");
                Object customerNo = userData.get("customerNo");
                Object vendorNo = userData.get("vendorNo");
                entry.userName = name != null ? name.toString() : null;
                entry.role = role != null ? role.toString() : null;
                entry.customerNo = customerNo != null ? customerNo.toString() : null;
                entry.vendorNo = vendorNo != null ? vendorNo.toString() : null;
            }
            activityLog.record(entry);
        } catch (Exception e) {
            // never let the journal break a login
            System.err.println("Journal d'activité (auth) ignoré: " + e.getMessage());
        }
    }

    @PostMapping("/account/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String email = request.get("email"); // Used as username/login
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required."));
        }

        // Convert email to lowercase for case-insensitive login and trim
        email = email.trim().toLowerCase();
        password = password.trim();

        String token = tokenService.getAccessToken();

        // Step 1: Fetch the User from Business Central
        String url = systemUrl + "/UserB2BLists?$filter=login eq '" + email.toUpperCase() + "'";

        try {
            String responseStr = webClient.get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode rootNode = mapper.readTree(responseStr);
            JsonNode valueNode = rootNode.get("value");

            // Step 2: Verify the User
            if (valueNode == null || !valueNode.isArray() || valueNode.size() == 0) {
                logAuth(httpRequest, email, "Échec de connexion", false, "Utilisateur introuvable", null);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials (User '" + email.toUpperCase() + "' not found)."));
            }

            JsonNode userNode = valueNode.get(0);

            // Bris de glace glass-user flag (exposed on UserB2BLists API page)
            boolean isBriseDeGlace = userNode.has("isBriseDeGlace") && !userNode.get("isBriseDeGlace").isNull()
                    && userNode.get("isBriseDeGlace").asBoolean();

            String bcPassword = null;
            if (userNode.has("password") && !userNode.get("password").isNull()
                    && !userNode.get("password").asText().isEmpty()) {
                bcPassword = userNode.get("password").asText();
            } else if (userNode.has("catalogPassword") && !userNode.get("catalogPassword").isNull()
                    && !userNode.get("catalogPassword").asText().isEmpty()) {
                bcPassword = userNode.get("catalogPassword").asText();
            }

            if (bcPassword == null) {
                logAuth(httpRequest, email, "Échec de connexion", false, "Aucun mot de passe configuré", null);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials (No password configured)."));
            }

            String trimmedBcPassword = bcPassword.trim();

            if (!password.equalsIgnoreCase(trimmedBcPassword)) {
                logAuth(httpRequest, email, "Échec de connexion", false, "Mot de passe incorrect", null);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials (Password mismatch)."));
            }

            // Step 3: Return Success & Role
            boolean isClient = userNode.has("customerNo") && !userNode.get("customerNo").isNull()
                    && !userNode.get("customerNo").asText().isEmpty();
            boolean isFournisseur = userNode.has("vendorNo") && !userNode.get("vendorNo").isNull()
                    && !userNode.get("vendorNo").asText().isEmpty();

            String role = "Unknown";
            if (isClient && isFournisseur) {
                role = "Client and Fournisseur";
            } else if (isClient) {
                role = "Client";
            } else if (isFournisseur) {
                role = "Fournisseur";
            }

            boolean isPec = false;
            if (isClient) {
                String clientNo = userNode.get("customerNo").asText();
                try {
                    String customerUrl = tarekSystemUrl + "/plexusCustomers?$filter=number eq '" + clientNo.replace("'", "''") + "'";
                    System.out.println("Fetching customer isPec status: GET " + customerUrl);
                    String custResponse = webClient.get()
                            .uri(customerUrl)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block(java.time.Duration.ofSeconds(15));
                    JsonNode custRoot = mapper.readTree(custResponse);
                    JsonNode custValue = custRoot.get("value");
                    if (custValue != null && custValue.isArray() && custValue.size() > 0) {
                        JsonNode customerNode = custValue.get(0);
                        if (customerNode.has("isPec") && !customerNode.get("isPec").isNull()) {
                            isPec = customerNode.get("isPec").asBoolean();
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Failed to fetch customer isPec status: " + ex.getMessage());
                }
            }

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", userNode.has("systemId") ? userNode.get("systemId").asText() : email);
            userData.put("name", userNode.has("name") ? userNode.get("name").asText() : email);
            userData.put("email", email);
            userData.put("role", role);
            userData.put("isPec", isPec);
            userData.put("isBriseDeGlace", isBriseDeGlace);
            if (isClient) {
                userData.put("customerNo", userNode.get("customerNo").asText());
            }
            if (isFournisseur) {
                userData.put("vendorNo", userNode.get("vendorNo").asText());
            }

            // Extract Catalog Type for conditional UI - try multiple possible field names
            String catalogType = "";
            String[] possibleFields = { "Catalog_Type", "catalogType", "typeCatalogue", "Type_Catalogue",
                    "catalog_type", "CatalogType", "type_catalogue" };
            for (String fieldName : possibleFields) {
                if (userNode.has(fieldName) && !userNode.get(fieldName).isNull()
                        && !userNode.get(fieldName).asText().isEmpty()) {
                    catalogType = userNode.get(fieldName).asText();
                    break;
                }
            }

            userData.put("catalogType", catalogType);

            // Generate REAL JWT Token using JwtUtil
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", role);
            extraClaims.put("isPec", isPec);
            extraClaims.put("isBriseDeGlace", isBriseDeGlace);
            if (isClient)
                extraClaims.put("customerNo", userNode.get("customerNo").asText());
            if (isFournisseur)
                extraClaims.put("vendorNo", userNode.get("vendorNo").asText());

            extraClaims.put("catalogType", catalogType);

            String generatedToken = jwtUtil.generateToken(email, extraClaims);

            // Format expected by frontend NextAuth
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("user", userData);
            responseBody.put("serviceToken", generatedToken);

            logAuth(httpRequest, email, "Connexion à l'application", true, null, userData);

            return ResponseEntity.ok(responseBody);

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message",
                            "Error communicating with Business Central API: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/catalogue/login")
    public ResponseEntity<Map<String, Object>> catalogueLogin(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            HttpServletRequest httpRequest) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Missing or invalid authorization header"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            // Get user's password from Business Central
            String bcToken = tokenService.getAccessToken();
            // The systemUrl now already contains the /companies(ID) suffix via
            // @PostConstruct
            String url = systemUrl + "/UserB2BLists?$filter=toupper(login) eq '" + email.toUpperCase() + "'";

            String responseStr = webClient.get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + bcToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode rootNode = mapper.readTree(responseStr);
            JsonNode valueNode = rootNode.get("value");

            if (valueNode == null || !valueNode.isArray() || valueNode.size() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            JsonNode userNode = valueNode.get(0);
            String guacUsername = null;
            String guacPassword = null;

            if (userNode.has("guacamoleUsername") && !userNode.get("guacamoleUsername").isNull()
                    && !userNode.get("guacamoleUsername").asText().isEmpty()) {
                guacUsername = userNode.get("guacamoleUsername").asText();
            } else if (userNode.has("username") && !userNode.get("username").isNull()
                    && !userNode.get("username").asText().isEmpty()) {
                guacUsername = userNode.get("username").asText();
            } else if (userNode.has("login") && !userNode.get("login").isNull()
                    && !userNode.get("login").asText().isEmpty()) {
                guacUsername = userNode.get("login").asText();
            }

            if (userNode.has("guacamolePassword") && !userNode.get("guacamolePassword").isNull()
                    && !userNode.get("guacamolePassword").asText().isEmpty()) {
                guacPassword = userNode.get("guacamolePassword").asText();
            } else if (userNode.has("password") && !userNode.get("password").isNull()
                    && !userNode.get("password").asText().isEmpty()) {
                guacPassword = userNode.get("password").asText();
            } else if (userNode.has("catalogPassword") && !userNode.get("catalogPassword").isNull()
                    && !userNode.get("catalogPassword").asText().isEmpty()) {
                guacPassword = userNode.get("catalogPassword").asText();
            }

            if (guacUsername == null || guacPassword == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Guacamole credentials not found in BC"));
            }

            String apiTokensUrl = guacamoleUrl;
            if (apiTokensUrl.endsWith("/")) {
                apiTokensUrl = apiTokensUrl.substring(0, apiTokensUrl.length() - 1);
            }
            if (!apiTokensUrl.endsWith("/guacamole") && !apiTokensUrl.contains("/guacamole/")) {
                apiTokensUrl += "/guacamole";
            }
            apiTokensUrl += "/api/tokens";

            String guacResponse = null;
            try {
                guacResponse = webClient.post()
                        .uri(apiTokensUrl)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .body(BodyInserters.fromFormData("username", guacUsername)
                                .with("password", guacPassword))
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(java.time.Duration.ofSeconds(10))
                        .block();
            } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                System.err.println(
                        "!!! Guacamole login failed: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
                return ResponseEntity.status(e.getStatusCode())
                        .body(Map.of("message", "Guacamole authentication failed: " + e.getResponseBodyAsString()));
            } catch (Exception e) {
                System.err.println("!!! Guacamole error: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Guacamole error: " + e.getMessage()));
            }

            JsonNode guacNode = mapper.readTree(guacResponse);

            if (guacNode.has("authToken")) {
                String guacToken = guacNode.get("authToken").asText();

                Map<String, Object> response = new HashMap<>();
                response.put("authToken", guacToken);
                response.put("redirectUrl", guacamoleUrl + "/guacamole/#/?token=" + guacToken);
                logAuth(httpRequest, email, "Accès au catalogue", true, null, null);
                return ResponseEntity.ok(response);
            } else if (guacNode.has("message")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", guacNode.get("message").asText()));
            } else {
                System.err.println("!!! Invalid response from Guacamole - no authToken or message");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Invalid response from Guacamole"));
            }

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error: " + e.getMessage()));
        }
    }
}
