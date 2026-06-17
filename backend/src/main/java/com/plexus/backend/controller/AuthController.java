package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.security.JwtUtil;
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
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.system-url}")
    private String systemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (systemUrl != null && !systemUrl.contains("/companies(")) {
            systemUrl += "/companies(" + companyId + ")";
        }
    }

    @Value("${guacamole.url}")
    private String guacamoleUrl;

    public AuthController(WebClient webClient, BusinessCentralTokenService tokenService, JwtUtil jwtUtil) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/account/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials (User '" + email.toUpperCase() + "' not found)."));
            }

            JsonNode userNode = valueNode.get(0);

            String bcPassword = null;
            if (userNode.has("password") && !userNode.get("password").isNull()
                    && !userNode.get("password").asText().isEmpty()) {
                bcPassword = userNode.get("password").asText();
            } else if (userNode.has("catalogPassword") && !userNode.get("catalogPassword").isNull()
                    && !userNode.get("catalogPassword").asText().isEmpty()) {
                bcPassword = userNode.get("catalogPassword").asText();
            }

            if (bcPassword == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials (No password configured)."));
            }

            String trimmedBcPassword = bcPassword.trim();

            if (!password.equalsIgnoreCase(trimmedBcPassword)) {
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

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", userNode.has("systemId") ? userNode.get("systemId").asText() : email);
            userData.put("name", userNode.has("name") ? userNode.get("name").asText() : email);
            userData.put("email", email);
            userData.put("role", role);
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
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
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
