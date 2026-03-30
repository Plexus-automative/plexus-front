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
import org.springframework.stereotype.Service;

@Service
public class DevisGeneratorService {

    // --- Premium Color Palette ---
    private static final Color PLEXUS_BLUE = new Color(0, 75, 135);
    private static final Color DARK_BLUE = new Color(7, 43, 89);
    private static final Color LIGHT_BG = new Color(248, 250, 252);
    private static final Color ACCENT_BLUE = new Color(226, 232, 240);
    private static final Color TEXT_MAIN = new Color(26, 32, 44);

    // --- High-Resolution Fonts ---
    private static final Font FONT_TITLE = new Font(Font.HELVETICA, 32, Font.BOLD, DARK_BLUE);
    private static final Font FONT_HEADER_WHITE = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font FONT_LABEL = new Font(Font.HELVETICA, 8, Font.BOLD, DARK_BLUE);
    private static final Font FONT_DATA = new Font(Font.HELVETICA, 9, Font.BOLD, TEXT_MAIN);
    private static final Font FONT_NORMAL = new Font(Font.HELVETICA, 8, Font.NORMAL, TEXT_MAIN);
    private static final Font FONT_TOTAL_LABEL = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font FONT_TOTAL_VALUE = new Font(Font.HELVETICA, 12, Font.BOLD, COLOR_WHITE_OR_BLUE(true));
    private static final Font FONT_SMALL = new Font(Font.HELVETICA, 7, Font.NORMAL, new Color(113, 128, 150));

    private static Color COLOR_WHITE_OR_BLUE(boolean white) {
        return white ? Color.WHITE : PLEXUS_BLUE;
    }

    public byte[] generateDevis(
            String devisNumber,
            String devisDate,
            String clientName,
            String clientNumber,
            String clientAddress,
            String matriculeFiscale,
            com.fasterxml.jackson.databind.JsonNode lines) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 30, 30, 40, 70);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        // --- Premium Global Header/Footer ---
        writer.setPageEvent(new PdfPageEventHelper() {
            @Override
            public void onEndPage(PdfWriter writer, Document document) {
                PdfContentByte cb = writer.getDirectContent();

                // Top Light Accent Line
                cb.setColorFill(PLEXUS_BLUE);
                cb.rectangle(document.left(), document.top() + 15, document.right() - document.left(), 3);
                cb.fill();

                // Footer
                PdfPTable footer = new PdfPTable(1);
                footer.setTotalWidth(document.right() - document.left());
                String info = "PLEXUS AUTOMOTIVE  |  Golden Tower A10.4 Centre Urbain Nord Tunis  |  Tél/Fax : 70 29 70 45\nMF : 1639504Y  |  RC : B12251996  |  BTK 052210052346527";
                PdfPCell cell = new PdfPCell(new Phrase(info, FONT_SMALL));
                cell.setBorder(Rectangle.TOP);
                cell.setBorderColor(ACCENT_BLUE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPaddingTop(10);
                footer.addCell(cell);
                footer.writeSelectedRows(0, -1, document.left(), 50, cb);
            }
        });

        document.open();

        // ==========================================
        // HEADER: Logo & Document Title
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
                    img.scaleToFit(180, 80);
                    logoCell.addElement(img);
                }
            }
        } catch (Exception e) {
        }
        header.addCell(logoCell);

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph devisP = new Paragraph("DEVIS", FONT_TITLE);
        devisP.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(devisP);
        Paragraph pageP = new Paragraph("Page " + writer.getPageNumber() + " / 1", FONT_SMALL);
        pageP.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(pageP);
        header.addCell(titleCell);
        document.add(header);

        document.add(new Paragraph(" "));

        // ==========================================
        // INFO GRID: Meta Info & Client Box
        // ==========================================
        PdfPTable mainInfo = new PdfPTable(2);
        mainInfo.setWidthPercentage(100);
        mainInfo.setWidths(new float[] { 1f, 1.2f });

        // Left: Numero and Date
        PdfPCell leftPart = new PdfPCell();
        leftPart.setBorder(Rectangle.NO_BORDER);
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(90);
        metaTable.setHorizontalAlignment(Element.ALIGN_LEFT);

        addMetaBox(metaTable, "Numéro", devisNumber);
        addMetaBox(metaTable, "Date",
                devisDate != null ? devisDate : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        leftPart.addElement(metaTable);
        mainInfo.addCell(leftPart);

        // Right: Modern Client Box
        PdfPCell clientBox = new PdfPCell();
        clientBox.setBorder(Rectangle.BOX);
        clientBox.setBorderColor(PLEXUS_BLUE);
        clientBox.setBorderWidth(1.5f);
        clientBox.setBackgroundColor(LIGHT_BG);
        clientBox.setPadding(15);

        clientBox.addElement(new Paragraph("DESTINATAIRE", FONT_LABEL));
        clientBox.addElement(new Paragraph("Client N° : " + (clientNumber != null ? clientNumber : "N/A"), FONT_DATA));
        clientBox.addElement(new Paragraph(" ", FONT_SMALL));

        Paragraph cName = new Paragraph(clientName != null ? clientName.toUpperCase() : "N/A",
                new Font(Font.HELVETICA, 12, Font.BOLD, DARK_BLUE));
        clientBox.addElement(cName);

        if (clientAddress != null && !clientAddress.isEmpty()) {
            clientBox.addElement(new Paragraph(clientAddress, FONT_NORMAL));
        }
        clientBox.addElement(new Paragraph("Matricule fiscale: " + (matriculeFiscale != null ? matriculeFiscale : "-"),
                FONT_NORMAL));

        mainInfo.addCell(clientBox);
        document.add(mainInfo);

        document.add(new Paragraph(" "));

        // ==========================================
        // ITEMS TABLE
        // ==========================================
        PdfPTable grid = new PdfPTable(8);
        grid.setWidthPercentage(100);
        // Optimized widths to ensure Référence, Qté, Prix U.HT, and Différence stay on
        // one line
        grid.setWidths(new float[] { 1.5f, 2.1f, 1.0f, 1.5f, 1.0f, 1.6f, 1.3f, 1.6f });
        grid.setSpacingBefore(15);

        String[] cols = {
                "Référence",
                "Désignation",
                "Qté",
                "Prix U.HT",
                "P.U\nCons.",
                "Différence",
                "Montant\nHT",
                "Observations\nDevis"
        };
        for (String c : cols) {
            PdfPCell hCell = new PdfPCell(new Phrase(c, FONT_HEADER_WHITE));
            hCell.setBackgroundColor(DARK_BLUE);
            hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            hCell.setPadding(10);
            hCell.setBorderWidth(0.5f);
            hCell.setBorderColor(Color.WHITE);
            grid.addCell(hCell);
        }

        double totalHT = 0;
        int rows = 0;
        if (lines != null && lines.isArray()) {
            for (com.fasterxml.jackson.databind.JsonNode line : lines) {
                String ref = line.has("lineObjectNumber") ? line.get("lineObjectNumber").asText() : "";
                String desc = line.has("description") ? line.get("description").asText() : "";
                double qty = line.has("quantity") ? line.get("quantity").asDouble() : 1;
                double up = line.has("directUnitCost") ? line.get("directUnitCost").asDouble() : 0;
                double sub = qty * up;
                totalHT += sub;

                Color bg = (rows % 2 == 0) ? Color.WHITE : LIGHT_BG;
                addGridData(grid, ref, Element.ALIGN_LEFT, bg);
                addGridData(grid, desc, Element.ALIGN_LEFT, bg);
                addGridData(grid, String.valueOf((int) qty), Element.ALIGN_CENTER, bg);
                addGridData(grid, format(up), Element.ALIGN_RIGHT, bg);
                addGridData(grid, "0,000", Element.ALIGN_RIGHT, bg);
                addGridData(grid, format(sub), Element.ALIGN_RIGHT, bg);
                addGridData(grid, format(sub), Element.ALIGN_RIGHT, bg);
                addGridData(grid, "", Element.ALIGN_LEFT, bg);
                rows++;
            }
        }

        // Dummy rows for stability
        for (int i = rows; i < 7; i++) {
            Color bg = (i % 2 == 0) ? Color.WHITE : LIGHT_BG;
            for (int j = 0; j < 8; j++)
                addGridData(grid, " ", Element.ALIGN_CENTER, bg);
        }

        document.add(grid);

        // ==========================================
        // TOTALS & SIGNATURE
        // ==========================================
        document.add(new Paragraph(" "));
        PdfPTable bottom = new PdfPTable(2);
        bottom.setWidthPercentage(100);
        bottom.setWidths(new float[] { 2f, 1f });

        // Words Box
        PdfPCell wordCell = new PdfPCell();
        wordCell.setBorder(Rectangle.BOX);
        wordCell.setBorderColor(ACCENT_BLUE);
        wordCell.setPadding(12);

        long dinars = (long) Math.floor(totalHT);
        long mills = (long) Math.round((totalHT - dinars) * 1000);
        String txt = NumberToWordsConverter.convert(dinars) + " DINARS ET " +
                NumberToWordsConverter.convert(mills) + " MILLIMES";

        wordCell.addElement(new Paragraph("Arrêter le présent devis à la somme de :", FONT_LABEL));
        Paragraph pWord = new Paragraph(txt.toUpperCase(), new Font(Font.HELVETICA, 10, Font.BOLD, DARK_BLUE));
        pWord.setSpacingBefore(8);
        wordCell.addElement(pWord);
        bottom.addCell(wordCell);

        // Totals Box
        PdfPCell totalCell = new PdfPCell();
        totalCell.setBorder(Rectangle.NO_BORDER);
        totalCell.setPaddingLeft(25);

        PdfPTable tTable = new PdfPTable(2);
        tTable.setWidthPercentage(100);
        PdfPCell tLabel = new PdfPCell(new Phrase("TOTAL HT", FONT_TOTAL_LABEL));
        tLabel.setBackgroundColor(PLEXUS_BLUE);
        tLabel.setPadding(12);
        tLabel.setBorder(Rectangle.NO_BORDER);

        PdfPCell tValue = new PdfPCell(new Phrase(format(totalHT), FONT_TOTAL_VALUE));
        tValue.setBackgroundColor(PLEXUS_BLUE);
        tValue.setPadding(12);
        tValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tValue.setBorder(Rectangle.NO_BORDER);

        tTable.addCell(tLabel);
        tTable.addCell(tValue);
        totalCell.addElement(tTable);
        bottom.addCell(totalCell);

        document.add(bottom);

        // CACHE
        document.add(new Paragraph(" "));
        try {
            ClassPathResource res = new ClassPathResource("cache-devis.png");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    byte[] bytes = is.readAllBytes();
                    Image stamp = Image.getInstance(bytes);
                    stamp.scaleToFit(160, 160);
                    stamp.setAlignment(Element.ALIGN_CENTER);
                    document.add(stamp);
                }
            }
        } catch (Exception e) {
        }

        document.close();
        return baos.toByteArray();
    }

    private void addMetaBox(PdfPTable table, String label, String val) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, FONT_HEADER_WHITE));
        lCell.setBackgroundColor(PLEXUS_BLUE);
        lCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        lCell.setPadding(8);
        lCell.setBorderColor(Color.WHITE);

        PdfPCell vCell = new PdfPCell(new Phrase(val != null ? val : "-", FONT_DATA));
        vCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        vCell.setPadding(8);
        vCell.setBorderColor(ACCENT_BLUE);

        table.addCell(lCell);
        table.addCell(vCell);
    }

    private void addGridData(PdfPTable table, String text, int align, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_NORMAL));
        cell.setHorizontalAlignment(align);
        cell.setPadding(8);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(ACCENT_BLUE);
        table.addCell(cell);
    }

    private String format(double v) {
        return String.format(Locale.FRANCE, "%,.3f", v);
    }
}
