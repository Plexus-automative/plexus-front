package com.plexus.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BLGeneratorService {

    // --- Clean Light Modern Colors (From 1st iteration) ---
    private static final Color PRIMARY_COLOR = new Color(0, 75, 135); // Original Plexus Blue
    private static final Color LIGHT_BG = new Color(245, 247, 250);
    private static final Color BORDER_GRAY = new Color(220, 220, 220); // Soft grey borders
    private static final Color TEXT_DARK = new Color(40, 40, 40);
    private static final Color TEXT_LIGHT = new Color(100, 100, 100);

    // --- Fonts ---
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, PRIMARY_COLOR);
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, TEXT_DARK);
    private static final Font TH_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, TEXT_DARK);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, TEXT_DARK);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 7, Font.NORMAL, TEXT_LIGHT);

    // Strict font for signatures
    private static final Font SIGNATURE_HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);

    public byte[] generateBL(
            String orderNumber,
            String orderDate,
            String vendorName,
            String vendorNumber,
            com.fasterxml.jackson.databind.JsonNode lines,
            com.fasterxml.jackson.databind.JsonNode fullOrder) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 20, 40);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        // --- Clean Modern Footer ---
        writer.setPageEvent(new PdfPageEventHelper() {
            @Override
            public void onEndPage(PdfWriter writer, Document document) {
                PdfContentByte cb = writer.getDirectContent();

                PdfPTable footer = new PdfPTable(1);
                try {
                    footer.setTotalWidth(document.right() - document.left());

                    PdfPCell cell = new PdfPCell(new Phrase(
                            "PLEXUS |  Golden Tower B.5.2 Centre Urbain Nord Tunis  |  Tél/Fax : 70 139 750  |  MF : 1639504Y  |  RC : B12251996  |  Banque : BTK 20005052210070153108",
                            SMALL_FONT));
                    cell.setBorder(Rectangle.TOP);
                    cell.setBorderColor(PRIMARY_COLOR);
                    cell.setBorderWidthTop(1.5f);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setPaddingTop(8);

                    footer.addCell(cell);
                    footer.writeSelectedRows(0, -1, document.left(), document.bottom() - 5, cb);
                } catch (Exception e) {
                }
            }
        });

        document.open();

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        if (orderDate != null && !orderDate.trim().isEmpty()) {
            try {
                if (orderDate.contains("-")) {
                    LocalDate parsedDate = LocalDate.parse(orderDate.trim());
                    today = parsedDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } else if (orderDate.contains("/")) {
                    LocalDate parsedDate = LocalDate.parse(orderDate.trim(), DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    today = parsedDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                }
            } catch (Exception e) {
                log.warn("Could not parse orderDate '{}': {}", orderDate, e.getMessage());
            }
        }
        // Priority 1: Posted Sales Shipment number (exact BL number from BC, e.g.
        // BL26/00548)
        // Priority 2: Sales Order number (fallback, e.g. CV26/00527)
        // Priority 3: Purchase Order number (fallback, e.g. CA26/1279)
        String blSourceNumber = orderNumber;
        if (fullOrder != null) {
            if (fullOrder.has("postedSalesShipmentNumber")
                    && !fullOrder.get("postedSalesShipmentNumber").asText().isEmpty()) {
                blSourceNumber = fullOrder.get("postedSalesShipmentNumber").asText();
            } else if (fullOrder.has("salesOrderNumber") && !fullOrder.get("salesOrderNumber").asText().isEmpty()) {
                blSourceNumber = fullOrder.get("salesOrderNumber").asText();
            }
        }

        String blNumber = generateBLNumber(blSourceNumber);

        // ==========================================
        // HEADER
        // ==========================================
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[] { 1f, 1f });

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        try {
            ClassPathResource res = new ClassPathResource("logo.png");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    byte[] bytes = is.readAllBytes();
                    Image img = Image.getInstance(bytes);
                    img.scaleToFit(140, 70);
                    logoCell.addElement(img);
                }
            } else {
                logoCell.addElement(new Paragraph("PLEXUS", TITLE_FONT));
            }
        } catch (Exception e) {
            logoCell.addElement(new Paragraph("PLEXUS", TITLE_FONT));
        }
        headerTable.addCell(logoCell);

        PdfPCell docDetailsCell = new PdfPCell();
        docDetailsCell.setBorder(Rectangle.NO_BORDER);
        docDetailsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph title = new Paragraph("BON DE LIVRAISON", TITLE_FONT);
        title.setAlignment(Element.ALIGN_RIGHT);
        docDetailsCell.addElement(title);

        Paragraph num = new Paragraph("N° " + blNumber, SUBTITLE_FONT);
        num.setAlignment(Element.ALIGN_RIGHT);
        num.setSpacingBefore(5);
        docDetailsCell.addElement(num);

        if (fullOrder != null) {
            // Robust VIN extraction
            String vinVal = null;
            if (fullOrder.has("VIN") && !fullOrder.get("VIN").asText().isEmpty())
                vinVal = fullOrder.get("VIN").asText();
            else if (fullOrder.has("vin") && !fullOrder.get("vin").asText().isEmpty())
                vinVal = fullOrder.get("vin").asText();
            else if (fullOrder.has("ChassisNo") && !fullOrder.get("ChassisNo").asText().isEmpty())
                vinVal = fullOrder.get("ChassisNo").asText();

            if (vinVal != null) {
                Paragraph vinPara = new Paragraph("VIN : " + vinVal, BOLD_FONT);
                vinPara.setAlignment(Element.ALIGN_RIGHT);
                vinPara.setSpacingBefore(2);
                docDetailsCell.addElement(vinPara);
            }

            // Robust Immatriculation extraction
            String immatVal = null;
            if (fullOrder.has("RegistrationNumber") && !fullOrder.get("RegistrationNumber").asText().isEmpty())
                immatVal = fullOrder.get("RegistrationNumber").asText();
            else if (fullOrder.has("registrationNumber") && !fullOrder.get("registrationNumber").asText().isEmpty())
                immatVal = fullOrder.get("registrationNumber").asText();

            if (immatVal != null) {
                Paragraph immatPara = new Paragraph("Immatriculation : " + immatVal, BOLD_FONT);
                immatPara.setAlignment(Element.ALIGN_RIGHT);
                immatPara.setSpacingBefore(2);
                docDetailsCell.addElement(immatPara);
            }
        }

        Paragraph dateStr = new Paragraph("Date : " + today, BOLD_FONT);
        dateStr.setAlignment(Element.ALIGN_RIGHT);
        dateStr.setSpacingBefore(2);
        docDetailsCell.addElement(dateStr);

        Paragraph pageStr = new Paragraph("Page : 1 / 1", SMALL_FONT);
        pageStr.setAlignment(Element.ALIGN_RIGHT);
        docDetailsCell.addElement(pageStr);

        headerTable.addCell(docDetailsCell);
        document.add(headerTable);

        // Divider
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        divider.setSpacingBefore(5);
        divider.setSpacingAfter(10);
        PdfPCell line = new PdfPCell(new Phrase(" "));
        line.setBorderColor(PRIMARY_COLOR);
        line.setBorderWidthBottom(2f);
        line.setBorder(Rectangle.BOTTOM);
        divider.addCell(line);
        document.add(divider);

        // ==========================================
        // CLIENT INFO BLOCK
        // ==========================================
        PdfPTable clientInfoWrapper = new PdfPTable(2);
        clientInfoWrapper.setWidthPercentage(100);
        clientInfoWrapper.setWidths(new float[] { 1.2f, 1f });

        PdfPCell refCell = new PdfPCell();
        refCell.setBorder(Rectangle.NO_BORDER);
        refCell.addElement(new Paragraph("Réf Commande : " + (orderNumber != null ? orderNumber : ""), BOLD_FONT));
        clientInfoWrapper.addCell(refCell);

        PdfPCell clientBox = new PdfPCell();
        clientBox.setBorderColor(BORDER_GRAY);
        clientBox.setBorderWidth(1f);
        clientBox.setBackgroundColor(LIGHT_BG);
        clientBox.setPadding(10);

        String clientCode = fullOrder.has("SellToCustomerNo") ? fullOrder.get("SellToCustomerNo").asText()
                : (vendorNumber != null ? vendorNumber : "-");

        // Robust TVA lookup (using VATRegistrationNo only)
        String vat = (fullOrder.has("VATRegistrationNo") && !fullOrder.get("VATRegistrationNo").asText().isEmpty())
                ? fullOrder.get("VATRegistrationNo").asText()
                : "";

        String addr1 = fullOrder.has("FullAddressLine1") ? fullOrder.get("FullAddressLine1").asText()
                : (fullOrder.has("shipToAddressLine1") ? fullOrder.get("shipToAddressLine1").asText() : "");
        String addr2 = fullOrder.has("FullAddressLine2") ? fullOrder.get("FullAddressLine2").asText()
                : (fullOrder.has("shipToAddressLine2") ? fullOrder.get("shipToAddressLine2").asText() : "");
        String city = fullOrder.has("FullCity") ? fullOrder.get("FullCity").asText()
                : (fullOrder.has("shipToCity") ? fullOrder.get("shipToCity").asText() : "");

        // Robust Phone lookup - shipToContact often contains names like "HADIA//SAMIA"
        String phone = "-";
        if (fullOrder.has("PhoneNo") && !fullOrder.get("PhoneNo").asText().isEmpty()) {
            phone = fullOrder.get("PhoneNo").asText();
        } else if (fullOrder.has("SellToPhoneNo") && !fullOrder.get("SellToPhoneNo").asText().isEmpty()) {
            phone = fullOrder.get("SellToPhoneNo").asText();
        } else if (fullOrder.has("shipToPhone") && !fullOrder.get("shipToPhone").asText().isEmpty()) {
            phone = fullOrder.get("shipToPhone").asText();
        } else if (fullOrder.has("shipToContact") && !fullOrder.get("shipToContact").asText().isEmpty()) {
            String contact = fullOrder.get("shipToContact").asText();
            // If it contains // or doesn't look like a number, it's likely a name
            if (!contact.contains("//") && contact.matches(".*\\d.*")) {
                phone = contact;
            }
        }

        phone = phone.replace("//", "/");
        String fullAddr = addr1 + (addr2.isEmpty() ? "" : ", " + addr2) + (city.isEmpty() ? "" : " - " + city);
        fullAddr = fullAddr.replace("à ", "").replace("à", "");

        String vin = (fullOrder != null && fullOrder.has("VIN")) ? fullOrder.get("VIN").asText() : "-";
        String immat = (fullOrder != null && fullOrder.has("RegistrationNumber"))
                ? fullOrder.get("RegistrationNumber").asText()
                : "-";

        log.info(">>> BL Metadata extracted - Client: {}, TVA: {}, Phone: {}, VIN: {}, Immat: {}",
                clientCode, vat, phone, vin, immat);

        clientBox.addElement(
                new Paragraph("CLIENT FACTURÉ / LIVRÉ", new Font(Font.HELVETICA, 8, Font.BOLD, PRIMARY_COLOR)));
        clientBox.addElement(new Paragraph("Code: " + (clientCode != null ? clientCode : ""), BOLD_FONT));

        String displayName = vendorName;
        if (fullOrder.has("CustomerName") && !fullOrder.get("CustomerName").asText().isEmpty()) {
            displayName = fullOrder.get("CustomerName").asText();
        } else if (fullOrder.has("shipToName") && !fullOrder.get("shipToName").asText().isEmpty()) {
            displayName = fullOrder.get("shipToName").asText();
        }

        Paragraph name = new Paragraph(displayName != null ? displayName : "", SUBTITLE_FONT);
        name.setSpacingBefore(4);
        clientBox.addElement(name);

        clientBox.addElement(new Paragraph("Code TVA : " + vat, NORMAL_FONT));
        clientBox.addElement(new Paragraph("Adresse : " + (fullAddr.isEmpty() ? "-" : fullAddr), NORMAL_FONT));
        clientBox.addElement(new Paragraph("Tél : " + phone, NORMAL_FONT));

        // Insured Name (MAWDY)
        String insured = (fullOrder.has("insuredName") && !fullOrder.get("insuredName").asText().isEmpty())
                ? fullOrder.get("insuredName").asText()
                : (fullOrder.has("PLX_InsuredName") ? fullOrder.get("PLX_InsuredName").asText() : "");
        if (insured != null && !insured.isEmpty()) {
            clientBox.addElement(new Paragraph("P/C : " + insured.toUpperCase(), BOLD_FONT));
        }

        clientInfoWrapper.addCell(clientBox);
        document.add(clientInfoWrapper);
        document.add(new Paragraph(" "));

        // ==========================================
        // LINES GRID
        // ==========================================
        PdfPTable grid = new PdfPTable(6);
        grid.setWidthPercentage(100);
        grid.setWidths(new float[] { 2.5f, 3.5f, 1f, 1.5f, 1f, 1.5f });
        grid.setSpacingBefore(10);

        String[] headers = { "Réf", "Désignation", "Qté", "PU HT", "T.V.A", "Montant HT" };
        for (String h : headers) {
            PdfPCell hCell = new PdfPCell(new Phrase(h, TH_FONT));
            hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            hCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hCell.setPadding(8);
            hCell.setBorderColor(Color.BLACK);
            hCell.setBorderWidth(1f);
            grid.addCell(hCell);
        }

        double totalHT = 0;
        double remise = 0;
        int tvaRate = 19;
        int rowsAdded = 0;

        if (lines != null && lines.isArray()) {
            for (com.fasterxml.jackson.databind.JsonNode lineData : lines) {
                String itemNo = lineData.has("lineObjectNumber") ? lineData.get("lineObjectNumber").asText() : "";
                String desc = lineData.has("description") ? lineData.get("description").asText() : "";

                double qty = 0;
                if (lineData.has("receivedQuantity") && lineData.get("receivedQuantity").asDouble() > 0) {
                    qty = lineData.get("receivedQuantity").asDouble();
                } else if (lineData.has("receiveQuantity") && lineData.get("receiveQuantity").asDouble() > 0) {
                    qty = lineData.get("receiveQuantity").asDouble();
                } else if (lineData.has("quantity")) {
                    qty = lineData.get("quantity").asDouble();
                } else if (lineData.has("invoiceQuantity")) {
                    qty = lineData.get("invoiceQuantity").asDouble();
                }
                double price = lineData.has("directUnitCost") ? lineData.get("directUnitCost").asDouble() : 0;
                double lineTotal = qty * price;
                totalHT += lineTotal;

                double lineDiscount = 0;
                if (lineData.has("salesDiscountAmount")) {
                    lineDiscount = lineData.get("salesDiscountAmount").asDouble();
                    log.info(">>> [BL] Line {}: using salesDiscountAmount = {}", itemNo, lineDiscount);
                } else if (lineData.has("sales_discountAmount")) {
                    // Use the CLIENT discount from Sales Order line (injected by
                    // enrichWithSalesDiscount)
                    lineDiscount = lineData.get("sales_discountAmount").asDouble();
                    log.info(">>> [BL] Line {}: using sales_discountAmount = {}", itemNo, lineDiscount);
                } else if (lineData.has("sales_lineDiscountAmount")) {
                    lineDiscount = lineData.get("sales_lineDiscountAmount").asDouble();
                    log.info(">>> [BL] Line {}: using sales_lineDiscountAmount = {}", itemNo, lineDiscount);
                }

                remise += lineDiscount;

                Color rowColor = (rowsAdded % 2 == 0) ? Color.WHITE : LIGHT_BG;

                addStripedCell(grid, itemNo, Element.ALIGN_LEFT, rowColor);
                addStripedCell(grid, desc, Element.ALIGN_LEFT, rowColor);
                addStripedCell(grid, String.valueOf((int) qty), Element.ALIGN_CENTER, rowColor);
                addStripedCell(grid, String.format(java.util.Locale.FRANCE, "%,.3f", price), Element.ALIGN_RIGHT,
                        rowColor);
                addStripedCell(grid, String.valueOf(tvaRate) + "%", Element.ALIGN_CENTER, rowColor);
                addStripedCell(grid, String.format(java.util.Locale.FRANCE, "%,.3f", lineTotal), Element.ALIGN_RIGHT,
                        rowColor);
                rowsAdded++;
            }
        }

        // Removed empty rows padding as requested by user

        document.add(grid);
        document.add(new Paragraph(" "));

        // ==========================================
        // TOTALS & WORDS
        // ==========================================
        double htApresRemise = totalHT - remise;
        double montantTva = htApresRemise * (tvaRate / 100.0);
        double timbre = 0.000;
        double totalTTC = htApresRemise + montantTva + timbre;

        log.info(">>> BL Generation Totals - totalHT: {}, remise: {}, htApresRemise: {}, montantTva: {}, totalTTC: {}",
                totalHT, remise, htApresRemise, montantTva, totalTTC);

        PdfPTable totalsSection = new PdfPTable(2);
        totalsSection.setWidthPercentage(100);
        totalsSection.setWidths(new float[] { 2f, 1f });
        totalsSection.setSpacingBefore(10);

        PdfPCell wordsCell = new PdfPCell();
        wordsCell.setBorder(Rectangle.NO_BORDER);
        wordsCell.setPaddingTop(10);
        wordsCell.setPaddingRight(20);

        long dinars = (long) Math.floor(totalTTC);
        long millimes = (long) Math.round((totalTTC - dinars) * 1000);
        String amountInWords = NumberToWordsConverter.convert(dinars) + " DINARS ET " +
                NumberToWordsConverter.convert(millimes) + " MILLIMES";

        wordsCell.addElement(new Phrase("Arrêter la présente facture à la somme de : \n", SMALL_FONT));
        Paragraph wordsP = new Paragraph(amountInWords, BOLD_FONT);
        wordsP.setSpacingBefore(5);
        wordsCell.addElement(wordsP);
        totalsSection.addCell(wordsCell);

        PdfPTable summaryGrid = new PdfPTable(2);
        summaryGrid.setWidthPercentage(100);
        summaryGrid.setWidths(new float[] { 1.5f, 1f });

        addSummaryRow(summaryGrid, "TOTAL HT", totalHT, false);
        addSummaryRow(summaryGrid, "REMISE", remise, false);
        addSummaryRow(summaryGrid, "NET HT", htApresRemise, false);
        addSummaryRow(summaryGrid, "TVA (" + tvaRate + "%)", montantTva, false);
        addSummaryRow(summaryGrid, "TIMBRE", timbre, false);
        addSummaryRow(summaryGrid, "TOTAL TTC", totalTTC, true);

        PdfPCell summaryCell = new PdfPCell(summaryGrid);
        summaryCell.setBorder(Rectangle.NO_BORDER);
        totalsSection.addCell(summaryCell);

        document.add(totalsSection);
        document.add(new Paragraph(" "));

        // ==========================================
        // STRICT 3-BOX SIGNATURE BLOCK
        // ==========================================
        PdfPTable signBlock = new PdfPTable(3);
        signBlock.setWidthPercentage(100);
        signBlock.setKeepTogether(true);

        PdfPCell s1 = new PdfPCell(new Phrase("PLEXUS", SIGNATURE_HEADER_FONT));
        s1.setHorizontalAlignment(Element.ALIGN_CENTER);
        s1.setPadding(6);
        s1.setBorderWidth(1f);
        s1.setBorderColor(Color.BLACK);

        PdfPCell s2 = new PdfPCell(new Phrase("LIVREUR", SIGNATURE_HEADER_FONT));
        s2.setHorizontalAlignment(Element.ALIGN_CENTER);
        s2.setPadding(6);
        s2.setBorderWidth(1f);
        s2.setBorderColor(Color.BLACK);

        PdfPCell s3 = new PdfPCell(new Phrase("CLIENT", SIGNATURE_HEADER_FONT));
        s3.setHorizontalAlignment(Element.ALIGN_CENTER);
        s3.setPadding(6);
        s3.setBorderWidth(1f);
        s3.setBorderColor(Color.BLACK);

        signBlock.addCell(s1);
        signBlock.addCell(s2);
        signBlock.addCell(s3);

        // Plexus Cache Box
        PdfPCell plexusBox = new PdfPCell();
        plexusBox.setBorderWidth(1f);
        plexusBox.setBorderColor(Color.BLACK);
        plexusBox.setMinimumHeight(120);
        plexusBox.setHorizontalAlignment(Element.ALIGN_CENTER);
        plexusBox.setVerticalAlignment(Element.ALIGN_MIDDLE);
        try {
            ClassPathResource res = new ClassPathResource("cache-plexus.png");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    byte[] bytes = is.readAllBytes();
                    Image stamp = Image.getInstance(bytes);
                    stamp.scaleToFit(160, 118);
                    stamp.setAlignment(Element.ALIGN_CENTER);
                    plexusBox.addElement(stamp);
                }
            } else {
                plexusBox.addElement(new Paragraph(" "));
            }
        } catch (Exception e) {
            plexusBox.addElement(new Paragraph(" "));
        }
        signBlock.addCell(plexusBox);

        // Empty boxes
        PdfPCell emptyBox2 = new PdfPCell(new Phrase(" "));
        emptyBox2.setMinimumHeight(120);
        emptyBox2.setBorderWidth(1f);
        emptyBox2.setBorderColor(Color.BLACK);

        PdfPCell emptyBox3 = new PdfPCell(new Phrase(" "));
        emptyBox3.setMinimumHeight(120);
        emptyBox3.setBorderWidth(1f);
        emptyBox3.setBorderColor(Color.BLACK);

        signBlock.addCell(emptyBox2);
        signBlock.addCell(emptyBox3);

        document.add(signBlock);

        document.close();
        return baos.toByteArray();
    }

    private String generateBLNumber(String orderNumber) {
        String yearSuffix = String.valueOf(LocalDate.now().getYear()).substring(2);
        String seq = "0";
        if (orderNumber != null) {
            if (orderNumber.contains("/")) {
                seq = orderNumber.substring(orderNumber.lastIndexOf('/') + 1).replaceAll("[^0-9]", "");
            } else {
                seq = orderNumber.replaceAll("[^0-9]", "");
            }
        }
        if (seq.isEmpty()) {
            seq = "0";
        }
        return "BL" + yearSuffix + "/" + seq;
    }

    private void addStripedCell(PdfPTable table, String text, int alignment, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderColor(Color.BLACK); // Black border lines inside the grid
        cell.setBorderWidth(1f);
        cell.setBackgroundColor(bgColor);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, double value, boolean isTotal) {
        Font fLabel = isTotal ? new Font(Font.HELVETICA, 10, Font.BOLD, PRIMARY_COLOR) : NORMAL_FONT;
        Font fVal = isTotal ? new Font(Font.HELVETICA, 11, Font.BOLD, PRIMARY_COLOR) : BOLD_FONT;

        PdfPCell lCell = new PdfPCell(new Phrase(label, fLabel));
        lCell.setBorder(Rectangle.BOTTOM | Rectangle.LEFT | Rectangle.TOP | Rectangle.RIGHT);
        lCell.setBorderColor(BORDER_GRAY);
        lCell.setPadding(6);
        if (isTotal)
            lCell.setBackgroundColor(LIGHT_BG);

        PdfPCell vCell = new PdfPCell(new Phrase(String.format(java.util.Locale.FRANCE, "%,.3f", value), fVal));
        vCell.setBorder(Rectangle.BOTTOM | Rectangle.LEFT | Rectangle.TOP | Rectangle.RIGHT);
        vCell.setBorderColor(BORDER_GRAY);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setPadding(6);
        if (isTotal)
            vCell.setBackgroundColor(LIGHT_BG);

        table.addCell(lCell);
        table.addCell(vCell);
    }
}
