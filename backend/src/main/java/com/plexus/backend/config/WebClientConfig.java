package com.plexus.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;

@Configuration
public class WebClientConfig {

        @Bean
        public WebClient webClient() {
                // Configure a custom ConnectionProvider to aggressively evict idle connections
                // This prevents "Connection Reset" errors when Business Central closes inactive
                // connections
                ConnectionProvider provider = ConnectionProvider.builder("bc-connection-provider")
                                .maxConnections(500)
                                .maxIdleTime(Duration.ofSeconds(15)) // Close connections idle for 15 seconds
                                .maxLifeTime(Duration.ofSeconds(60)) // Force recreation of connections after 60s
                                .pendingAcquireTimeout(Duration.ofSeconds(60)) // How long to wait for an available
                                                                               // connection
                                .evictInBackground(Duration.ofSeconds(10)) // Run background eviction every 10 seconds
                                .build();

                HttpClient httpClient = HttpClient.create(provider)
                                .option(io.netty.channel.ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000)
                                .doOnConnected(conn -> conn
                                                .addHandlerLast(new io.netty.handler.timeout.ReadTimeoutHandler(120))
                                                .addHandlerLast(new io.netty.handler.timeout.WriteTimeoutHandler(120)))
                                .responseTimeout(Duration.ofMinutes(2)); // Increased to 2 minutes for heavy BC tasks

                return WebClient.builder()
                                .clientConnector(new ReactorClientHttpConnector(httpClient))
                                .codecs(configurer -> configurer
                                                .defaultCodecs()
                                                .maxInMemorySize(16 * 1024 * 1024))
                                .build();
        }
}
