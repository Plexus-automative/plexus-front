package com.plexus.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
// Push notifications are sent off the request thread — the partner should not wait on
// however long Google/Mozilla/Apple take to answer.
@org.springframework.scheduling.annotation.EnableAsync
public class BackendApplication {
    public static void main(String[] args) {
        // Load .env file from the root directory (one level up from /backend)
        Dotenv dotenv = Dotenv.configure()
                .directory("../")
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(BackendApplication.class, args);
    }
}
