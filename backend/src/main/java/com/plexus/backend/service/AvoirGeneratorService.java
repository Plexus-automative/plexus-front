package com.plexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Document « Avoir fournisseur sur BL », remis avec le bon de livraison.
 *
 * Sa raison d'être est comptable : le BL porte les quantités livrées, la facture porte le net,
 * et cette feuille explique l'écart entre les deux — ligne à ligne, quantité livrée, quantité
 * retirée, quantité qui sera facturée.
 *
 * La mise en page reprend celle de {@link BLGeneratorService} trait pour trait : même bandeau
 * logo/titre, même filet bleu, même encadré client, même grille à filets noirs et lignes
 * alternées, même bloc de signatures en trois cases avec le cachet Plexus. Les deux feuilles
 * partent ensemble et doivent se lire comme un seul jeu de documents.
 */
@Service
@Slf4j
public class AvoirGeneratorService {

    private static final Color PRIMARY_COLOR = new Color(0, 75, 135);
    private static final Color LIGHT_BG = new Color(245, 247, 250);
    private static final Color TEXT_DARK = new Color(40, 40, 40);
    private static final Color TEXT_LIGHT = new Color(100, 100, 100);
    private static final Color ACCENT_RED = new Color(178, 34, 34);

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, PRIMARY_COLOR);
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, TEXT_DARK);
    private static final Font TH_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, TEXT_DARK);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, TEXT_DARK);
    private static final Font CREDIT_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, ACCENT_RED);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 7, Font.NORMAL, TEXT_LIGHT);
    private static final Font SIGNATURE_HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);

    public byte[] generateAvoir(String avoirNo, List<JsonNode> logLines, JsonNode context) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 20, 40);
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        addFooter(writer);
        document.open();

        String shipmentNo = text(context, "shipmentNo");
        String purchaseOrderNo = text(context, "purchaseOrderNo");
        String vendorNo = text(context, "vendorNo");
        String vendorName = text(context, "vendorName");
        String appliedAt = formatDate(text(context, "appliedAt"));

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
                    Image img = Image.getInstance(is.readAllBytes());
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
        docDetailsCell.addElement(right("AVOIR FOURNISSEUR", TITLE_FONT, 0));
        docDetailsCell.addElement(right("N° " + avoirNo, SUBTITLE_FONT, 5));
        docDetailsCell.addElement(right("BL : " + shipmentNo, BOLD_FONT, 2));
        docDetailsCell.addElement(right("Date : " + appliedAt, BOLD_FONT, 2));
        docDetailsCell.addElement(right("Page : 1 / 1", SMALL_FONT, 0));
        headerTable.addCell(docDetailsCell);
        document.add(headerTable);

        // Filet bleu
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
        // RÉFÉRENCES + ENCADRÉ FOURNISSEUR
        // ==========================================
        PdfPTable infoWrapper = new PdfPTable(1);
        infoWrapper.setWidthPercentage(100);

        PdfPCell refCell = new PdfPCell();
        refCell.setBorder(Rectangle.NO_BORDER);
        refCell.addElement(new Paragraph("Bon de livraison : " + shipmentNo, BOLD_FONT));
        if (!purchaseOrderNo.isEmpty()) {
            refCell.addElement(new Paragraph("Réf Commande achat : " + purchaseOrderNo, BOLD_FONT));
        }
        if (!vendorName.isEmpty() || !vendorNo.isEmpty()) {
            Paragraph vendor = new Paragraph(
                    "Fournisseur : " + (vendorName.isEmpty() ? vendorNo : vendorName), BOLD_FONT);
            vendor.setSpacingBefore(3);
            refCell.addElement(vendor);
        }
        infoWrapper.addCell(refCell);

        document.add(infoWrapper);
        document.add(new Paragraph(" "));

        Paragraph intro = new Paragraph(
                "Le fournisseur retire du bon de livraison " + shipmentNo + " les quantités ci-dessous.",
                NORMAL_FONT);
        intro.setSpacingBefore(5);
        document.add(intro);

        // ==========================================
        // GRILLE DES LIGNES
        // ==========================================
        PdfPTable grid = new PdfPTable(4);
        grid.setWidthPercentage(100);
        grid.setWidths(new float[] { 2.5f, 4.5f, 1.4f, 1.4f });
        grid.setSpacingBefore(10);
        grid.setHeaderRows(1);

        String[] headers = { "Réf", "Désignation", "Qté BL", "Qté avoirée" };
        for (String h : headers) {
            PdfPCell hCell = new PdfPCell(new Phrase(h, TH_FONT));
            hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            hCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hCell.setPadding(8);
            hCell.setBorderColor(Color.BLACK);
            hCell.setBorderWidth(1f);
            grid.addCell(hCell);
        }

        double totalBefore = 0;
        double totalCredited = 0;
        int rowsAdded = 0;

        for (JsonNode entry : logLines) {
            double before = entry.path("qtyBefore").asDouble(0);
            double credited = entry.path("qtyCredited").asDouble(0);

            totalBefore += before;
            totalCredited += credited;

            Color rowColor = (rowsAdded % 2 == 0) ? Color.WHITE : LIGHT_BG;

            addStripedCell(grid, entry.path("itemNo").asText(""), Element.ALIGN_LEFT, rowColor, NORMAL_FONT);
            addStripedCell(grid, entry.path("description").asText(""), Element.ALIGN_LEFT, rowColor, NORMAL_FONT);
            addStripedCell(grid, qty(before), Element.ALIGN_CENTER, rowColor, NORMAL_FONT);
            addStripedCell(grid, qty(credited), Element.ALIGN_CENTER, rowColor, CREDIT_FONT);
            rowsAdded++;
        }

        PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL", TH_FONT));
        totalLabel.setColspan(2);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalLabel.setPadding(8);
        totalLabel.setBorderColor(Color.BLACK);
        totalLabel.setBorderWidth(1f);
        totalLabel.setBackgroundColor(LIGHT_BG);
        grid.addCell(totalLabel);
        addStripedCell(grid, qty(totalBefore), Element.ALIGN_CENTER, LIGHT_BG, TH_FONT);
        addStripedCell(grid, qty(totalCredited), Element.ALIGN_CENTER, LIGHT_BG, CREDIT_FONT);

        document.add(grid);
        document.add(new Paragraph(" "));

        // ==========================================
        // RÉCAPITULATIF
        // ==========================================
        PdfPTable recapSection = new PdfPTable(2);
        recapSection.setWidthPercentage(100);
        recapSection.setWidths(new float[] { 2f, 1f });
        recapSection.setSpacingBefore(10);

        PdfPCell noteCell = new PdfPCell();
        noteCell.setBorder(Rectangle.NO_BORDER);
        noteCell.setPaddingTop(10);
        noteCell.setPaddingRight(20);
        noteCell.addElement(new Phrase(
                "Le présent avoir accompagne le bon de livraison " + shipmentNo
                        + ". Les quantités ci-contre sont déduites de la facturation.\n",
                SMALL_FONT));
        recapSection.addCell(noteCell);

        PdfPTable summaryGrid = new PdfPTable(2);
        summaryGrid.setWidthPercentage(100);
        summaryGrid.setWidths(new float[] { 1.5f, 1f });
        // « Qté livrée » = ce qui reste réellement livré, avoir déduit : c'est ce chiffre que
        // la comptabilité doit retrouver sur la facture. Le total du BL, lui, est déjà dans la
        // colonne « Qté BL » ligne à ligne.
        addSummaryRow(summaryGrid, "QTÉ LIVRÉE", totalBefore - totalCredited, false, TEXT_DARK);
        addSummaryRow(summaryGrid, "AVOIR", totalCredited, true, ACCENT_RED);

        PdfPCell summaryCell = new PdfPCell(summaryGrid);
        summaryCell.setBorder(Rectangle.NO_BORDER);
        recapSection.addCell(summaryCell);

        document.add(recapSection);
        document.add(new Paragraph(" "));

        // ==========================================
        // BLOC SIGNATURES 3 CASES + CACHET
        // ==========================================
        PdfPTable signBlock = new PdfPTable(3);
        signBlock.setWidthPercentage(100);
        signBlock.setKeepTogether(true);

        signBlock.addCell(signHeader("PLEXUS"));
        signBlock.addCell(signHeader("FOURNISSEUR"));
        signBlock.addCell(signHeader("CLIENT"));

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
                    Image stamp = Image.getInstance(is.readAllBytes());
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
        signBlock.addCell(emptySignBox());
        signBlock.addCell(emptySignBox());

        document.add(signBlock);

        document.close();
        return baos.toByteArray();
    }

    // ---------- helpers ----------

    private void addFooter(PdfWriter writer) {
        writer.setPageEvent(new PdfPageEventHelper() {
            @Override
            public void onEndPage(PdfWriter w, Document doc) {
                try {
                    PdfPTable footer = new PdfPTable(1);
                    footer.setTotalWidth(doc.right() - doc.left());
                    Font f = new Font(Font.HELVETICA, 6.5f, Font.NORMAL, TEXT_LIGHT);
                    PdfPCell cell = new PdfPCell(new Phrase(
                            "PLEXUS |  Golden Tower B.5.2 Centre Urbain Nord Tunis  |  Tél/Fax : 70 139 750  |  MF : 1639504YBM000  |  RC : B12251996  |  Banque : BTK 20005052210070153108",
                            f));
                    cell.setBorder(Rectangle.TOP);
                    cell.setBorderColor(PRIMARY_COLOR);
                    cell.setBorderWidthTop(1.5f);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setNoWrap(true);
                    cell.setPaddingTop(12);
                    footer.addCell(cell);
                    footer.writeSelectedRows(0, -1, doc.left(), doc.bottom() - 5, w.getDirectContent());
                } catch (Exception ignored) {
                }
            }
        });
    }

    private PdfPCell signHeader(String label) {
        PdfPCell cell = new PdfPCell(new Phrase(label, SIGNATURE_HEADER_FONT));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        cell.setBorderWidth(1f);
        cell.setBorderColor(Color.BLACK);
        return cell;
    }

    private PdfPCell emptySignBox() {
        PdfPCell cell = new PdfPCell(new Phrase(" "));
        cell.setMinimumHeight(120);
        cell.setBorderWidth(1f);
        cell.setBorderColor(Color.BLACK);
        return cell;
    }

    private void addStripedCell(PdfPTable table, String text, int alignment, Color bgColor, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderColor(Color.BLACK);
        cell.setBorderWidth(1f);
        cell.setBackgroundColor(bgColor);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, double value, boolean isTotal, Color color) {
        Font fLabel = isTotal ? new Font(Font.HELVETICA, 10, Font.BOLD, color)
                : new Font(Font.HELVETICA, 8, Font.NORMAL, color);
        Font fValue = isTotal ? new Font(Font.HELVETICA, 10, Font.BOLD, color)
                : new Font(Font.HELVETICA, 8, Font.BOLD, color);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, fLabel));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        if (isTotal) {
            labelCell.setBackgroundColor(LIGHT_BG);
        }
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(qty(value), fValue));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (isTotal) {
            valueCell.setBackgroundColor(LIGHT_BG);
        }
        table.addCell(valueCell);
    }

    private Paragraph right(String text, Font font, float spacingBefore) {
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(Element.ALIGN_RIGHT);
        if (spacingBefore > 0) {
            p.setSpacingBefore(spacingBefore);
        }
        return p;
    }

    private static String qty(double value) {
        if (value == Math.rint(value)) {
            return String.valueOf((long) value);
        }
        return String.format(java.util.Locale.FRANCE, "%,.3f", value);
    }

    private static String text(JsonNode node, String field) {
        if (node == null || !node.hasNonNull(field)) {
            return "";
        }
        return node.get(field).asText("");
    }

    private static String formatDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
        try {
            return LocalDate.parse(raw.substring(0, 10))
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            return raw;
        }
    }
}
