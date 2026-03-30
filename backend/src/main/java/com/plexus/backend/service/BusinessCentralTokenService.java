package com.plexus.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
public class BusinessCentralTokenService {

    private final WebClient webClient;

    @Value("${business-central.oauth2.token-uri}")
    private String tokenUri;

    @Value("${business-central.oauth2.client-id}")
    private String clientId;

    @Value("${business-central.oauth2.client-secret}")
    private String clientSecret;

    @Value("${business-central.oauth2.scope}")
    private String scope;

    @Value("${business-central.oauth2.grant-type}")
    private String grantType;

    private String cachedToken;
    private Instant tokenExpiration;

    public BusinessCentralTokenService(WebClient webClient) {
        this.webClient = webClient;
    }

    public synchronized String getAccessToken() {
        if (cachedToken != null && tokenExpiration != null && Instant.now().isBefore(tokenExpiration)) {
            return cachedToken;
        }

        log.info("Requesting new access token from Business Central...");

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("scope", scope);
        formData.add("grant_type", grantType);

        try {
            Map response = webClient.post()
                    .uri(tokenUri)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("access_token")) {
                this.cachedToken = (String) response.get("access_token");
                Integer expiresIn = (Integer) response.get("expires_in");
                this.tokenExpiration = Instant.now().plusSeconds(expiresIn - 300);
                log.info("Successfully retrieved and cached new access token.");
                return this.cachedToken;
            } else {
                throw new RuntimeException("Access token not found in response.");
            }
        } catch (Exception e) {
            log.error("Error retrieving token: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve Business Central token", e);
        }
    }
}
