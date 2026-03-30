/**
 * Utility function to print an order with a specialized layout.
 */
export const printOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Veuillez autoriser les fenêtres surgissantes pour imprimer.");
        return;
    }

    const logoUrl = '/assets/images/logo.png';
    const number = order.number || 'N/A';
    const lines = order.plexuspurchaseOrderLines || [];

    const html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Impression Commande ${number}</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    padding: 0;
                    color: #333;
                }
                .container {
                    width: 100%;
                }
                .header { 
                    display: flex; 
                    align-items: center; 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 15px; 
                    margin-bottom: 20px; 
                }
                .logo { 
                    max-height: 60px; 
                    margin-right: 25px; 
                }
                .title { 
                    font-size: 26px; 
                    font-weight: 600; 
                    color: #555;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                    table-layout: fixed;
                }
                th, td { 
                    border: 1px solid #000; 
                    padding: 6px 4px; 
                    text-align: center; 
                    font-size: 11px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .text-left { text-align: left; white-space: normal; }
                
                @media print {
                    .no-print { display: none; }
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" class="logo" alt="Plexus Logo" />
                    <div class="title">Détails commande N° ${number}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 10%;">N° article</th>
                            <th style="width: 25%;">Description</th>
                            <th style="width: 7%;">Quantité</th>
                            <th style="width: 10%;">Prix unitaire</th>
                            <th style="width: 10%;">Quantité disponible</th>
                            <th style="width: 10%;">Quantité livrée</th>
                            <th style="width: 10%;">Quantité reçue</th>
                            <th style="width: 10%;">Remarque</th>
                            <th style="width: 10%;">Date livraison</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lines.map((line: any) => `
                            <tr>
                                <td>${line.lineObjectNumber || '-'}</td>
                                <td class="text-left">${line.description || '-'}</td>
                                <td>${line.quantity || 0}</td>
                                <td>${line.directUnitCost ? Number(line.directUnitCost).toFixed(3) : '0.000'}</td>
                                <td>${line.QuantityAvailable || 0}</td>
                                <td>${line.receiveQuantity || line.invoiceQuantity || 0}</td>
                                <td>${line.receivedQuantity || 0}</td>
                                <td>${line.Decision || (line.confirmationStatus === 'Disponible' ? 'Disponible' : '-')}</td>
                                <td>${line.DeliveryDate || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};
