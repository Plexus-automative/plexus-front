package com.plexus.backend.controller;

import com.plexus.backend.service.BusinessCentralTokenService;
import com.plexus.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AuthController {

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.system-url}")
    private String systemUrl;

    @Value("${business-central.api.company-id}")
    private String companyId;

    public AuthController(WebClient webClient, BusinessCentralTokenService tokenService, JwtUtil jwtUtil) {
        this.webClient = webClient;
        this.tokenService = tokenService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email"); // Used as username/login
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required."));
        }

        // Convert email and password to lowercase for case-insensitive login and trim
        email = email.trim().toLowerCase();
        password = password.trim().toLowerCase();

        String token = tokenService.getAccessToken();

        // Step 1: Fetch the User from Business Central
        // Using tolower() in OData filter for case-insensitive search
        String url = systemUrl + "/UserB2BLists?$filter=tolower(login) eq '"
                + email + "'";

        try {

            String responseStr = webClient.get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode rootNode = mapper.readTree(responseStr);
            JsonNode valueNode = rootNode.get("value");

            // Step 2: Verify the Password
            if (valueNode == null || !valueNode.isArray() || valueNode.size() == 0) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials (User not found)."));
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

            // Generate REAL JWT Token using JwtUtil
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", role);
            if (isClient)
                extraClaims.put("customerNo", userNode.get("customerNo").asText());
            if (isFournisseur)
                extraClaims.put("vendorNo", userNode.get("vendorNo").asText());

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
}
