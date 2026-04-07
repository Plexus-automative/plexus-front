package com.plexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class ArticleImportService {

    private final WebClient webClient;
    private final BusinessCentralTokenService tokenService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${business-central.api.system-url}")
    private String systemUrl;

    public ArticleImportService(WebClient webClient, BusinessCentralTokenService tokenService) {
        this.webClient = webClient;
        this.tokenService = tokenService;
    }

    public void importArticles(InputStream inputStream, String vendorNo, boolean importAll) throws Exception {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);
        String token = tokenService.getAccessToken();

        // Identify column indices
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            workbook.close();
            throw new Exception("Excel file is empty");
        }

        int codeIdx = -1, descIdx = -1, prixIdx = -1, qteIdx = -1;
        for (Cell cell : headerRow) {
            String val = cell.getStringCellValue().trim();
            if (val.equalsIgnoreCase("CodeArticle")) codeIdx = cell.getColumnIndex();
            else if (val.equalsIgnoreCase("Designation")) descIdx = cell.getColumnIndex();
            else if (val.equalsIgnoreCase("Prix")) prixIdx = cell.getColumnIndex();
            else if (val.equalsIgnoreCase("Qte")) qteIdx = cell.getColumnIndex();
        }

        if (codeIdx == -1) {
            workbook.close();
            throw new Exception("Column 'CodeArticle' not found");
        }

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String code = getCellValue(row.getCell(codeIdx));
            String desc = getCellValue(row.getCell(descIdx));
            Double prix = getNumericValue(row.getCell(prixIdx));
            Double qte = getNumericValue(row.getCell(qteIdx));

            if (code == null || code.isEmpty()) continue;

            try {
                processArticle(token, vendorNo, code, desc, prix, qte, importAll);
            } catch (Exception e) {
                System.err.println("Error processing row " + i + ": " + e.getMessage());
            }
        }
        workbook.close();
    }

    private void processArticle(String token, String vendorNo, String code, String desc, Double prix, Double qte, boolean importAll) throws Exception {
        // Use vendorItemNo filter as code might be the vendor's internal reference
        String filter = "vendorNo eq '" + vendorNo + "' and (itemNo eq '" + code + "' or vendorItemNo eq '" + code + "')";
        String encodedFilter = URLEncoder.encode(filter, StandardCharsets.UTF_8).replace("+", "%20");
        String url = systemUrl + "/plexusItemImports?$filter=" + encodedFilter;

        String response = webClient.get()
                .uri(URI.create(url))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode root = mapper.readTree(response);
        JsonNode value = root.get("value");

        if (value != null && value.isArray() && value.size() > 0) {
            // Update existing
            JsonNode itemVendor = value.get(0);
            String itemNo = itemVendor.get("itemNo").asText();
            String etag = itemVendor.get("@odata.etag").asText();
            
            ObjectNode patchNode = mapper.createObjectNode();
            if (prix != null) patchNode.put("ItemUnitPrice", prix);
            if (qte != null) patchNode.put("ItemInventory", qte);
            if (desc != null && !desc.isEmpty()) patchNode.put("ItemDescription", desc);

            // Use SystemId (id) for the PATCH URL as it's the standard OData way for BC APIs
            String id = itemVendor.get("id").asText();
            String patchUrl = systemUrl + "/plexusItemImports(" + id + ")";
            
            webClient.patch()
                    .uri(URI.create(patchUrl))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("If-Match", etag)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(patchNode.toString())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } else if (importAll) {
            // Create new
            ObjectNode postNode = mapper.createObjectNode();
            postNode.put("vendorNo", vendorNo);
            postNode.put("vendorItemNo", code);
            postNode.put("ItemDescription", (desc != null && !desc.isEmpty()) ? desc : code);
            if (prix != null) postNode.put("ItemUnitPrice", prix);
            if (qte != null) postNode.put("ItemInventory", qte);

            webClient.post()
                    .uri(URI.create(systemUrl + "/plexusItemImports"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(postNode.toString())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf((long) cell.getNumericCellValue());
        return null;
    }

    private Double getNumericValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue().replace(",", "."));
            } catch (Exception e) { return null; }
        }
        return null;
    }
}
