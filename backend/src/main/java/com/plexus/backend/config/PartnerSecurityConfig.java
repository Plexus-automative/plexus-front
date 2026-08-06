package com.plexus.backend.config;

import com.plexus.backend.security.PartnerApiKeyFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security for the machine-to-machine partner API ({@code /api/partner/**}).
 *
 * <p>Kept as its own {@link SecurityFilterChain} rather than extra rules on the portal
 * chain in {@link SecurityConfig}. The two surfaces have genuinely different threat
 * models — one is a browser session for a human, the other is a server holding a shared
 * secret — and separating them means a change to portal auth can't silently alter what
 * the partner integration accepts, or vice versa.
 *
 * <p>Chain order matters: this chain declares {@code securityMatcher("/api/partner/**")}
 * and runs first ({@code @Order(1)}); {@link SecurityConfig} is {@code @Order(2)} and
 * catches everything else.
 */
@Configuration
@EnableWebSecurity
@Slf4j
public class PartnerSecurityConfig {

    /**
     * Anything shorter than this is treated as unusable. 32 chars of random base64 is
     * the intended shape — see the generation hint logged at startup.
     */
    private static final int MIN_KEY_LENGTH = 32;

    @Value("${partner.api-key:}")
    private String partnerApiKey;

    @jakarta.annotation.PostConstruct
    public void validateKey() {
        if (partnerApiKey == null || partnerApiKey.isBlank()) {
            log.warn("Partner API: PARTNER_API_KEY is not set — /api/partner/** will reject every request. "
                    + "Generate one with: openssl rand -base64 32");
            return;
        }
        if (partnerApiKey.trim().length() < MIN_KEY_LENGTH) {
            // Loud, but not fatal: refusing to boot would take the whole portal down over
            // an integration that is not yet load-bearing.
            log.error("Partner API: PARTNER_API_KEY is shorter than {} characters. This is too weak to expose "
                    + "publicly — replace it with: openssl rand -base64 32", MIN_KEY_LENGTH);
        }
        // The key itself is never logged, at any level.
        log.info("Partner API: authentication enabled on /api/partner/**");
    }

    @Bean
    @Order(1)
    public SecurityFilterChain partnerSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/partner/**")
                .csrf(AbstractHttpConfigurer::disable)
                // No CORS by design: server-to-server callers send no Origin header and
                // browsers have no business on this surface. Leaving CORS off keeps the
                // partner API out of the portal's allowlist entirely.
                .cors(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().hasRole("PARTNER"))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter()
                                    .write("{\"error\":\"unauthorized\",\"message\":\"Authentication required.\"}");
                        })
                        .accessDeniedHandler((request, response, deniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter()
                                    .write("{\"error\":\"forbidden\",\"message\":\"Insufficient permissions.\"}");
                        }))
                .addFilterBefore(new PartnerApiKeyFilter(partnerApiKey),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
