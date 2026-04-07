package com.plexus.backend.controller;

import com.plexus.backend.service.ArticleImportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/articles")
public class ArticleImportController {

    private final ArticleImportService importService;

    public ArticleImportController(ArticleImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/import")
    public ResponseEntity<String> importArticles(
            @RequestParam("file") MultipartFile file,
            @RequestParam("mode") String mode,
            HttpServletRequest request) {
        
        String vendorNo = request.getHeader("X-Vendor-No");
        if (vendorNo == null || vendorNo.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Vendor number (X-Vendor-No) missing in headers\"}");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"File is empty\"}");
        }

        try {
            boolean importAll = "all".equalsIgnoreCase(mode);
            importService.importArticles(file.getInputStream(), vendorNo, importAll);
            return ResponseEntity.ok("{\"success\": true, \"message\": \"Import successful\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Import failed: " + e.getMessage() + "\"}");
        }
    }
}
