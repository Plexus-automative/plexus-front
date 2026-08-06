package com.plexus.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.core.io.ClassPathResource;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FactureGeneratorService {

    // --- Premium Color Palette ---
    private static final Color PLEXUS_NAVY = new Color(7, 43, 89);
    private static final Color PLEXUS_BLUE = new Color(0, 75, 135);
    private static final Color ACCENT_GOLD = new Color(196, 167, 103);
    private static final Color LIGHT_BG = new Color(248, 250, 252);
    private static final Color BORDER_SOFT = new Color(210, 218, 230);
    private static final Color TEXT_MAIN = new Color(26, 32, 44);
    private static final Color TEXT_MUTED = new Color(100, 110, 130);
    private static final Color ROW_ALT = new Color(243, 246, 250);
    private static final Color TOTAL_BG = new Color(7, 43, 89);

    // --- Fonts ---
    private static final Font F_TITLE = new Font(Font.HELVETICA, 22, Font.BOLD, PLEXUS_NAVY);
    private static final Font F_SUBTITLE = new Font(Font.HELVETICA, 10, Font.BOLD, PLEXUS_BLUE);
    private static final Font F_TH = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
    private static final Font F_NORMAL = new Font(Font.HELVETICA, 8, Font.NORMAL, TEXT_MAIN);
    private static final Font F_BOLD = new Font(Font.HELVETICA, 8, Font.BOLD, TEXT_MAIN);
    private static final Font F_SMALL = new Font(Font.HELVETICA, 7, Font.NORMAL, TEXT_MUTED);
    private static final Font F_LABEL = new Font(Font.HELVETICA, 7, Font.BOLD, PLEXUS_BLUE);
    private static final Font F_CLIENT_NAME = new Font(Font.HELVETICA, 11, Font.BOLD, PLEXUS_NAVY);
    private static final Font F_TOTAL_LABEL = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font F_TOTAL_VAL = new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE);
    private static final Font F_GOLD_LABEL = new Font(Font.HELVETICA, 8, Font.BOLD, ACCENT_GOLD);
    private static final Font F_SIG_HEADER = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
    private static final Font F_PC = new Font(Font.HELVETICA, 8.5f, Font.BOLD | Font.ITALIC, PLEXUS_BLUE);

    public byte[] generateFacture(
            String invoiceNumber,
            String invoiceDate,
            String clientName,
            String clientCode,
            String clientAddress,
            String clientCity,
            String clientPhone,
            String vatRegistrationNo,
            String shipmentNumber,
            com.fasterxml.jackson.databind.JsonNode lines,
            com.fasterxml.jackson.databind.JsonNode fullOrder) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 35, 35, 25, 50);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        // --- Footer Event ---
        writer.setPageEvent(new PdfPageEventHelper() {
            @Override
            public void onEndPage(PdfWriter w, Document doc) {
                PdfContentByte cb = w.getDirectContent();
                // Gold accent line
                cb.setColorFill(ACCENT_GOLD);
                cb.rectangle(doc.left(), doc.bottom() - 8, doc.right() - doc.left(), 2);
                cb.fill();

                try {
                    // Single centered line — showTextAligned never wraps; small font keeps it on one line.
                    Font footerFont = new Font(Font.HELVETICA, 6.5f, Font.NORMAL, TEXT_MUTED);
                    String info = "PLEXUS  |  Golden Tower B.5.2 Centre Urbain Nord Tunis  |  Tél/Fax : 70 139 750  |  MF : 1639504YBM000  |  RC : B12251996  |  Banque : BTK 20005052210070153108";
                    // Sit well below the gold accent line (at bottom()-8) so text doesn't touch it.
                    ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, new Phrase(info, footerFont),
                            (doc.left() + doc.right()) / 2, doc.bottom() - 17, 0);
                } catch (Exception e) {
                }
            }
        });

        document.open();

        String today = invoiceDate != null && !invoiceDate.isEmpty() ? invoiceDate
                : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        // ==========================================
        // HEADER: Logo + Document Info
        // ==========================================
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[] { 1.2f, 1f });

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        try {
            ClassPathResource res = new ClassPathResource("logo.png");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    byte[] bytes = is.readAllBytes();
                    Image img = Image.getInstance(bytes);
                    img.scaleToFit(150, 70);
                    logoCell.addElement(img);
                }
            } else {
                logoCell.addElement(new Paragraph("PLEXUS", F_TITLE));
            }
        } catch (Exception e) {
            logoCell.addElement(new Paragraph("PLEXUS", F_TITLE));
        }

        // Company address under logo
        Paragraph compAddr = new Paragraph("Golden Tower B.5.2 Centre Urbain Nord Tunis", F_SMALL);
        compAddr.setSpacingBefore(4);
        logoCell.addElement(compAddr);
        logoCell.addElement(new Paragraph("Tél : 70 139 750  |  Fax : 70 139 750", F_SMALL));
        logoCell.addElement(new Paragraph("Identifiant unique : 1639504YBM000", F_SMALL));
        header.addCell(logoCell);

        // Right: Title + Invoice meta
        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph titleP = new Paragraph("FACTURE", F_TITLE);
        titleP.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(titleP);

        // Gold accent line under title
        Paragraph goldLine = new Paragraph("━━━━━━━━━━━━━━━━━", F_GOLD_LABEL);
        goldLine.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(goldLine);

        Paragraph numP = new Paragraph("N° " + (invoiceNumber != null ? invoiceNumber : "N/A"), F_SUBTITLE);
        numP.setAlignment(Element.ALIGN_RIGHT);
        numP.setSpacingBefore(4);
        titleCell.addElement(numP);

        Paragraph dateP = new Paragraph("DATE : " + today, F_BOLD);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        dateP.setSpacingBefore(3);
        titleCell.addElement(dateP);

        Paragraph pageP = new Paragraph("Page : 1 / 1", F_SMALL);
        pageP.setAlignment(Element.ALIGN_RIGHT);
        pageP.setSpacingBefore(2);
        titleCell.addElement(pageP);

        header.addCell(titleCell);
        document.add(header);

        // Navy divider
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        divider.setSpacingBefore(6);
        divider.setSpacingAfter(10);
        PdfPCell divLine = new PdfPCell(new Phrase(" "));
        divLine.setBorderColor(PLEXUS_NAVY);
        divLine.setBorderWidthBottom(2.5f);
        divLine.setBorder(Rectangle.BOTTOM);
        divider.addCell(divLine);
        document.add(divider);

        // ==========================================
        // CLIENT INFO BLOCK
        // ==========================================
        PdfPTable clientSection = new PdfPTable(2);
        clientSection.setWidthPercentage(100);
        clientSection.setWidths(new float[] { 1f, 1.3f });

        // Left: Shipment reference
        PdfPCell refCell = new PdfPCell();
        refCell.setBorder(Rectangle.NO_BORDER);
        refCell.setPaddingTop(5);

        if (shipmentNumber != null && !shipmentNumber.isEmpty()) {
            refCell.addElement(new Paragraph("N° Expédition :", F_LABEL));
            refCell.addElement(new Paragraph(shipmentNumber, F_SUBTITLE));
            refCell.addElement(new Paragraph(" ", F_SMALL));
        }

        boolean isC0090 = "C0090".equalsIgnoreCase(clientCode);

        // VIN / Immatriculation if available
        if (fullOrder != null && !isC0090) {
            String vin = extractField(fullOrder, "VIN", "vin", "ChassisNo");
            String immat = extractField(fullOrder, "RegistrationNumber", "registrationNumber");
            if (vin != null && !vin.isEmpty()) {
                refCell.addElement(new Paragraph("VIN : " + vin, F_BOLD));
            }
            if (immat != null && !immat.isEmpty()) {
                refCell.addElement(new Paragraph("Immatriculation : " + immat, F_BOLD));
            }
        }
        clientSection.addCell(refCell);

        // Right: Client box
        PdfPCell clientBox = new PdfPCell();
        clientBox.setBorderColor(PLEXUS_BLUE);
        clientBox.setBorderWidth(1.2f);
        clientBox.setBackgroundColor(LIGHT_BG);
        clientBox.setPadding(12);

        clientBox.addElement(new Paragraph("CLIENT", F_LABEL));
        if (!isC0090) {
            clientBox.addElement(new Paragraph("Code : " + (clientCode != null ? clientCode : "-"), F_BOLD));
        }

        // Robust name from fullOrder
        String displayName = clientName;
        if (fullOrder != null) {
            if (fullOrder.has("CustomerName") && !fullOrder.get("CustomerName").asText().isEmpty()) {
                displayName = fullOrder.get("CustomerName").asText();
            }
        }

        String finalClientName = displayName;
        if (isC0090) {
            String insured = extractField(fullOrder, "insuredName", "PLX_InsuredName", "InsuredName");
            if (insured != null && !insured.isEmpty()) {
                if (insured.contains("/")) {
                    String[] parts = insured.split("/");
                    if (parts.length > 1) {
                        finalClientName = parts[1].trim();
                    } else {
                        finalClientName = parts[0].trim();
                    }
                } else {
                    finalClientName = insured.trim();
                }
            } else {
                finalClientName = "CLIENT PLEXUS";
            }
        }

        Paragraph namePara = new Paragraph(finalClientName != null ? finalClientName.toUpperCase() : "-",
                F_CLIENT_NAME);
        namePara.setSpacingBefore(4);
        clientBox.addElement(namePara);

        if (!isC0090) {
            // Address
            String fullAddr = buildAddress(clientAddress, clientCity, fullOrder);
            clientBox.addElement(new Paragraph("Adresse : " + fullAddr, F_NORMAL));

            // VAT
            String vat = vatRegistrationNo;
            if ((vat == null || vat.isEmpty()) && fullOrder != null && fullOrder.has("VATRegistrationNo")) {
                vat = fullOrder.get("VATRegistrationNo").asText();
            }
            clientBox.addElement(new Paragraph("Code TVA : " + (vat != null ? vat : "-"), F_NORMAL));

            // Phone
            String phone = buildPhone(clientPhone, fullOrder);
            clientBox.addElement(new Paragraph("Tél : " + phone, F_NORMAL));

            // City
            String city = clientCity;
            if ((city == null || city.isEmpty()) && fullOrder != null) {
                city = extractField(fullOrder, "FullCity", "shipToCity", "SellToCity");
            }
            if (city != null && !city.isEmpty()) {
                clientBox.addElement(new Paragraph("Ville : " + city, F_NORMAL));
            }

            // Insured Name (MAWDY)
            String insured = extractField(fullOrder, "insuredName", "PLX_InsuredName", "InsuredName");
            if (insured != null && !insured.isEmpty()) {
                Paragraph pcPara = new Paragraph("P/C : " + insured.toUpperCase(), F_PC);
                pcPara.setSpacingBefore(3);
                clientBox.addElement(pcPara);
            }
        } else {
            // Also add VIN and Immatriculation inside the client box for C0090 (first)
            if (fullOrder != null) {
                String vin = extractField(fullOrder, "VIN", "vin", "ChassisNo");
                String immat = extractField(fullOrder, "RegistrationNumber", "registrationNumber");
                if (vin != null && !vin.isEmpty()) {
                    clientBox.addElement(new Paragraph("VIN : " + vin, F_NORMAL));
                }
                if (immat != null && !immat.isEmpty()) {
                    clientBox.addElement(new Paragraph("Immatriculation : " + immat, F_NORMAL));
                }
            }

            // For C0090, set P/C to the name of client C0090 (displayName, e.g. PLEXUS PEC)
            // (last)
            String pcName = (displayName != null && !displayName.isEmpty()) ? displayName : "PLEXUS PEC";
            Paragraph pcPara = new Paragraph("P/C : " + pcName.toUpperCase(), F_PC);
            pcPara.setSpacingBefore(3);
            clientBox.addElement(pcPara);
        }

        clientSection.addCell(clientBox);
        document.add(clientSection);
        document.add(new Paragraph(" "));

        // ==========================================
        // LINES TABLE
        // ==========================================
        PdfPTable grid = new PdfPTable(7);
        grid.setWidthPercentage(100);
        grid.setWidths(new float[] { 1.4f, 3.5f, 0.7f, 1.3f, 0.9f, 1.2f, 1.3f });
        grid.setSpacingBefore(8);

        String[] headers2 = { "Réference", "Désignation", "Qté", "Prix U.HT", "% Remise", "Remise", "Montant HT" };
        for (String h : headers2) {
            PdfPCell hCell = new PdfPCell(new Phrase(h, F_TH));
            hCell.setBackgroundColor(PLEXUS_NAVY);
            hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            hCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hCell.setPadding(7);
            hCell.setBorderColor(Color.WHITE);
            hCell.setBorderWidth(0.5f);
            grid.addCell(hCell);
        }

        double totalBrutHT = 0;
        double totalRemise = 0;
        int tvaRate = 19;
        int rowIdx = 0;

        // Add shipment grouping header if available
        if (shipmentNumber != null && !shipmentNumber.isEmpty()) {
            Color rowColor = new Color(235, 240, 248);
            // Col 1: Reference/Type (Must be empty)
            addDataCell(grid, "", Element.ALIGN_LEFT, rowColor);
            // Col 2: Designation (Contains N° BL)
            addDataCell(grid, "N° BL : " + shipmentNumber, Element.ALIGN_LEFT, rowColor);
            // Remaining 5 columns: Empty
            addDataCell(grid, "", Element.ALIGN_CENTER, rowColor);
            addDataCell(grid, "", Element.ALIGN_RIGHT, rowColor);
            addDataCell(grid, "", Element.ALIGN_CENTER, rowColor);
            addDataCell(grid, "", Element.ALIGN_RIGHT, rowColor);
            addDataCell(grid, "", Element.ALIGN_RIGHT, rowColor);
        }

        if (lines != null && lines.isArray()) {
            for (com.fasterxml.jackson.databind.JsonNode lineData : lines) {
                String itemNo = lineData.has("lineObjectNumber") ? lineData.get("lineObjectNumber").asText() : "";
                String desc = lineData.has("description") ? lineData.get("description").asText() : "";
                double qty = extractQty(lineData);
                double price = lineData.has("directUnitCost") ? lineData.get("directUnitCost").asDouble() : 0;
                double lineBrut = qty * price;
                totalBrutHT += lineBrut;

                double lineDiscountPct = 0;
                if (lineData.has("salesDiscountPercent")) {
                    lineDiscountPct = lineData.get("salesDiscountPercent").asDouble();
                } else if (lineData.has("sales_lineDiscountPercent")) {
                    lineDiscountPct = lineData.get("sales_lineDiscountPercent").asDouble();
                } else if (lineData.has("sales_discountPercent")) {
                    lineDiscountPct = lineData.get("sales_discountPercent").asDouble();
                }

                double lineDiscountAmt = 0;
                if (lineData.has("salesDiscountAmount")) {
                    lineDiscountAmt = lineData.get("salesDiscountAmount").asDouble();
                } else if (lineData.has("sales_discountAmount")) {
                    lineDiscountAmt = lineData.get("sales_discountAmount").asDouble();
                } else if (lineData.has("sales_lineDiscountAmount")) {
                    lineDiscountAmt = lineData.get("sales_lineDiscountAmount").asDouble();
                } else {
                    lineDiscountAmt = lineBrut * (lineDiscountPct / 100.0);
                }

                // Compute discount percent if not provided
                if (lineDiscountPct == 0 && lineDiscountAmt > 0 && lineBrut > 0) {
                    lineDiscountPct = (lineDiscountAmt / lineBrut) * 100.0;
                }

                totalRemise += lineDiscountAmt;
                double lineNet = lineBrut - lineDiscountAmt;

                Color rowColor = (rowIdx % 2 == 0) ? Color.WHITE : ROW_ALT;
                addDataCell(grid, itemNo, Element.ALIGN_LEFT, rowColor);
                addDataCell(grid, desc, Element.ALIGN_LEFT, rowColor);
                addDataCell(grid, String.valueOf((int) qty), Element.ALIGN_CENTER, rowColor);
                addDataCell(grid, fmt(price), Element.ALIGN_RIGHT, rowColor);
                addDataCell(grid, lineDiscountPct > 0 ? String.format("%.0f %%", lineDiscountPct) : "-",
                        Element.ALIGN_CENTER, rowColor);
                addDataCell(grid, fmt(lineDiscountAmt), Element.ALIGN_RIGHT, rowColor);
                addDataCell(grid, fmt(lineNet), Element.ALIGN_RIGHT, rowColor);
                rowIdx++;
            }
        }

        document.add(grid);
        document.add(new Paragraph(" "));

        // ==========================================
        // TOTALS + AMOUNT IN WORDS
        // ==========================================
        double netHT = totalBrutHT - totalRemise;
        double montantTVA = netHT * (tvaRate / 100.0);
        double timbre = 1.000;
        double totalTTC = netHT + montantTVA + timbre;

        // Check if timbre was sent
        if (fullOrder != null && fullOrder.has("timbre")) {
            timbre = fullOrder.get("timbre").asDouble();
            totalTTC = netHT + montantTVA + timbre;
        }

        log.info(">>> Facture Totals - brutHT: {}, remise: {}, netHT: {}, TVA: {}, timbre: {}, TTC: {}",
                totalBrutHT, totalRemise, netHT, montantTVA, timbre, totalTTC);

        PdfPTable totalsWrapper = new PdfPTable(2);
        totalsWrapper.setWidthPercentage(100);
        totalsWrapper.setWidths(new float[] { 1.8f, 1f });
        totalsWrapper.setSpacingBefore(8);

        // Left: Amount in words
        PdfPCell wordsCell = new PdfPCell();
        wordsCell.setBorder(Rectangle.NO_BORDER);
        wordsCell.setPaddingTop(8);
        wordsCell.setPaddingRight(20);

        long dinars = (long) Math.floor(totalTTC);
        long millimes = (long) Math.round((totalTTC - dinars) * 1000);
        String amountWords = NumberToWordsConverter.convert(dinars) + " DINARS ET "
                + NumberToWordsConverter.convert(millimes) + " MILLIMES";

        wordsCell.addElement(new Phrase("Arrêtée la présente facture à la somme de :", F_SMALL));
        Paragraph wordsPara = new Paragraph(amountWords, F_BOLD);
        wordsPara.setSpacingBefore(5);
        wordsCell.addElement(wordsPara);
        totalsWrapper.addCell(wordsCell);

        // Right: Summary table
        PdfPTable summaryGrid = new PdfPTable(2);
        summaryGrid.setWidthPercentage(100);
        summaryGrid.setWidths(new float[] { 1.5f, 1f });

        addSummaryRow(summaryGrid, "Total Brut HT", totalBrutHT, false);
        addSummaryRow(summaryGrid, "Total Remise", totalRemise, false);
        addSummaryRow(summaryGrid, "Total Net HT", netHT, false);
        addSummaryRow(summaryGrid, "Total TVA (" + tvaRate + "%)", montantTVA, false);
        addSummaryRow(summaryGrid, "Timbre", timbre, false);
        addTotalRow(summaryGrid, "Total TTC", totalTTC);

        PdfPCell summaryCell = new PdfPCell(summaryGrid);
        summaryCell.setBorder(Rectangle.NO_BORDER);
        totalsWrapper.addCell(summaryCell);
        document.add(totalsWrapper);

        document.close();
        return baos.toByteArray();
    }

    // --- Helpers ---

    private String extractField(com.fasterxml.jackson.databind.JsonNode node, String... keys) {
        for (String k : keys) {
            if (node.has(k) && !node.get(k).asText().isEmpty()) {
                return node.get(k).asText();
            }
        }
        return null;
    }

    private double extractQty(com.fasterxml.jackson.databind.JsonNode lineData) {
        if (lineData.has("quantity") && lineData.get("quantity").asDouble() > 0)
            return lineData.get("quantity").asDouble();
        if (lineData.has("receivedQuantity") && lineData.get("receivedQuantity").asDouble() > 0)
            return lineData.get("receivedQuantity").asDouble();
        if (lineData.has("invoiceQuantity") && lineData.get("invoiceQuantity").asDouble() > 0)
            return lineData.get("invoiceQuantity").asDouble();
        return 1;
    }

    private String buildAddress(String clientAddr, String clientCity,
            com.fasterxml.jackson.databind.JsonNode fullOrder) {
        String addr = clientAddr != null ? clientAddr : "";
        if (addr.isEmpty() && fullOrder != null) {
            String a1 = extractField(fullOrder, "FullAddressLine1", "shipToAddressLine1", "SellToAddress");
            String a2 = extractField(fullOrder, "FullAddressLine2", "shipToAddressLine2", "SellToAddress2");
            addr = (a1 != null ? a1 : "") + (a2 != null && !a2.isEmpty() ? ", " + a2 : "");
        }
        String city = clientCity;
        if ((city == null || city.isEmpty()) && fullOrder != null) {
            city = extractField(fullOrder, "FullCity", "shipToCity", "SellToCity");
        }
        if (city != null && !city.isEmpty()) {
            addr += (addr.isEmpty() ? "" : " - ") + city;
        }
        return addr.isEmpty() ? "-" : addr;
    }

    private String buildPhone(String clientPhone, com.fasterxml.jackson.databind.JsonNode fullOrder) {
        if (clientPhone != null && !clientPhone.isEmpty())
            return clientPhone;
        if (fullOrder == null)
            return "-";
        String p = extractField(fullOrder, "PhoneNo", "SellToPhoneNo", "shipToPhone");
        return p != null ? p : "-";
    }

    private void addDataCell(PdfPTable table, String text, int align, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, F_NORMAL));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBorderColor(BORDER_SOFT);
        cell.setBorderWidth(0.5f);
        cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, double value, boolean highlight) {
        Font fL = highlight ? F_BOLD : F_NORMAL;
        Font fV = F_BOLD;
        PdfPCell lCell = new PdfPCell(new Phrase(label, fL));
        lCell.setBorder(Rectangle.BOX);
        lCell.setBorderColor(BORDER_SOFT);
        lCell.setPadding(5);
        if (highlight)
            lCell.setBackgroundColor(LIGHT_BG);

        PdfPCell vCell = new PdfPCell(new Phrase(fmt(value), fV));
        vCell.setBorder(Rectangle.BOX);
        vCell.setBorderColor(BORDER_SOFT);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setPadding(5);
        if (highlight)
            vCell.setBackgroundColor(LIGHT_BG);

        table.addCell(lCell);
        table.addCell(vCell);
    }

    private void addTotalRow(PdfPTable table, String label, double value) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, F_TOTAL_LABEL));
        lCell.setBackgroundColor(TOTAL_BG);
        lCell.setPadding(8);
        lCell.setBorder(Rectangle.NO_BORDER);

        PdfPCell vCell = new PdfPCell(new Phrase(fmt(value), F_TOTAL_VAL));
        vCell.setBackgroundColor(TOTAL_BG);
        vCell.setPadding(8);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setBorder(Rectangle.NO_BORDER);

        table.addCell(lCell);
        table.addCell(vCell);
    }

    private String fmt(double v) {
        return String.format(Locale.FRANCE, "%,.3f", v);
    }
}
