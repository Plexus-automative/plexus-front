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

@Service
public class BLGeneratorService {

    // --- Clean Light Modern Colors (From 1st iteration) ---
    private static final Color PRIMARY_COLOR = new Color(0, 75, 135); // Original Plexus Blue
    private static final Color LIGHT_BG = new Color(245, 247, 250);
    private static final Color BORDER_GRAY = new Color(220, 220, 220); // Soft grey borders
    private static final Color TEXT_DARK = new Color(40, 40, 40);
    private static final Color TEXT_LIGHT = new Color(100, 100, 100);

    // --- Fonts ---
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 22, Font.BOLD, PRIMARY_COLOR);
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, TEXT_DARK);
    private static final Font TH_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, TEXT_DARK);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, TEXT_DARK);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, TEXT_LIGHT);

    // Strict font for signatures
    private static final Font SIGNATURE_HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);

    public byte[] generateBL(
            String orderNumber,
            String orderDate,
            String vendorName,
            String vendorNumber,
            com.fasterxml.jackson.databind.JsonNode lines) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 60);
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
                            "PLEXUS TEST  |  Golden Tower A10.4 Centre Urbain Nord Tunis  |  Tél/Fax : 70 29 70 45  |  MF : 1639504Y  |  RC : B12251996  |  Banque : BTK 052210052346527",
                            SMALL_FONT));
                    cell.setBorder(Rectangle.TOP);
                    cell.setBorderColor(PRIMARY_COLOR);
                    cell.setBorderWidthTop(1.5f);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setPaddingTop(8);

                    footer.addCell(cell);
                    footer.writeSelectedRows(0, -1, document.left(), document.bottom() + 15, cb);
                } catch (Exception e) {
                }
            }
        });

        document.open();

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String blNumber = generateBLNumber(orderNumber);

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
                    img.scaleToFit(160, 80);
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
        divider.setSpacingBefore(15);
        divider.setSpacingAfter(20);
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

        clientBox.addElement(
                new Paragraph("CLIENT FACTURÉ / LIVRÉ", new Font(Font.HELVETICA, 8, Font.BOLD, PRIMARY_COLOR)));
        clientBox.addElement(new Paragraph("Code: " + (vendorNumber != null ? vendorNumber : ""), BOLD_FONT));

        Paragraph name = new Paragraph(vendorName != null ? vendorName : "", SUBTITLE_FONT);
        name.setSpacingBefore(4);
        clientBox.addElement(name);

        clientBox.addElement(new Paragraph("Code TVA : -", NORMAL_FONT));
        clientBox.addElement(new Paragraph("Adresse : -", NORMAL_FONT));

        clientInfoWrapper.addCell(clientBox);
        document.add(clientInfoWrapper);
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        // ==========================================
        // LINES GRID
        // ==========================================
        PdfPTable grid = new PdfPTable(6);
        grid.setWidthPercentage(100);
        grid.setWidths(new float[] { 1.5f, 4.5f, 1f, 1.5f, 1f, 1.5f });
        grid.setSpacingBefore(10);

        String[] headers = { "Réf", "Désignation", "Qté", "PU HT", "T.V.A", "Montant HT" };
        for (String h : headers) {
            PdfPCell hCell = new PdfPCell(new Phrase(h, TH_FONT));
            hCell.setBackgroundColor(PRIMARY_COLOR);
            hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            hCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hCell.setPadding(8);
            // using solid borders even here to avoid "invisible rows" look, just coloring
            // them to match nicely
            hCell.setBorderColor(Color.WHITE);
            grid.addCell(hCell);
        }

        double totalHT = 0;
        int tvaRate = 19;
        int rowsAdded = 0;

        if (lines != null && lines.isArray()) {
            for (com.fasterxml.jackson.databind.JsonNode lineData : lines) {
                String itemNo = lineData.has("lineObjectNumber") ? lineData.get("lineObjectNumber").asText() : "";
                String desc = lineData.has("description") ? lineData.get("description").asText() : "";
                double qty = lineData.has("receiveQuantity") ? lineData.get("receiveQuantity").asDouble()
                        : (lineData.has("quantity") ? lineData.get("quantity").asDouble() : 0);
                double price = lineData.has("directUnitCost") ? lineData.get("directUnitCost").asDouble() : 0;
                double lineTotal = qty * price;
                totalHT += lineTotal;

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

        int minRows = 8;
        for (int i = rowsAdded; i < minRows; i++) {
            Color rowColor = (i % 2 == 0) ? Color.WHITE : LIGHT_BG;
            addStripedCell(grid, " ", Element.ALIGN_LEFT, rowColor);
            addStripedCell(grid, " ", Element.ALIGN_LEFT, rowColor);
            addStripedCell(grid, " ", Element.ALIGN_CENTER, rowColor);
            addStripedCell(grid, " ", Element.ALIGN_RIGHT, rowColor);
            addStripedCell(grid, " ", Element.ALIGN_CENTER, rowColor);
            addStripedCell(grid, " ", Element.ALIGN_RIGHT, rowColor);
        }

        document.add(grid);
        document.add(new Paragraph(" "));

        // ==========================================
        // TOTALS & WORDS
        // ==========================================
        double remise = 0;
        double htApresRemise = totalHT - remise;
        double montantTva = htApresRemise * (tvaRate / 100.0);
        double timbre = 0.600;
        double totalTTC = htApresRemise + montantTva + timbre;

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
        plexusBox.setMinimumHeight(110);
        plexusBox.setHorizontalAlignment(Element.ALIGN_CENTER);
        plexusBox.setVerticalAlignment(Element.ALIGN_MIDDLE);
        try {
            ClassPathResource res = new ClassPathResource("cache-plexus.png");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    byte[] bytes = is.readAllBytes();
                    Image stamp = Image.getInstance(bytes);
                    stamp.scaleToFit(140, 95);
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
        emptyBox2.setMinimumHeight(110);
        emptyBox2.setBorderWidth(1f);
        emptyBox2.setBorderColor(Color.BLACK);

        PdfPCell emptyBox3 = new PdfPCell(new Phrase(" "));
        emptyBox3.setMinimumHeight(110);
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
        String seq = orderNumber != null ? orderNumber.replaceAll("[^0-9]", "") : "0";
        if (seq.isEmpty())
            seq = "0";
        int seqNum = Integer.parseInt(seq) % 100000;
        return "BL" + yearSuffix + "/" + String.format("%05d", seqNum);
    }

    private void addStripedCell(PdfPTable table, String text, int alignment, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderColor(BORDER_GRAY); // Added visible border lines inside the grid as well
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
