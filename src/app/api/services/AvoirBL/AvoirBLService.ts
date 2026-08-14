import axiosServices from 'utils/axios';

export interface AvoirBLLine {
    lineNo: number;
    itemNo: string;
    description: string;
    unitOfMeasureCode: string;
    quantity: number;
    qtyShippedNotInvoiced: number;
    unitPrice: number;
    /** Quantité déjà retirée par des avoirs précédents sur cette ligne. */
    qtyAvoir: number;
}

export interface AvoirBLReceipt {
    /** N° du BL (expédition vente), ex. BL26/00580. */
    documentNo: string;
    postingDate: string;
    vendorNo: string;
    salesOrderNo: string;
    /** Commande achat liée (CA). */
    orderNo: string;
    customerNo: string;
    customerName: string;
    /** N° des avoirs déjà émis sur ce BL (AVF26/0001…), pour retélécharger le document. */
    avoirNos: string[];
    lines: AvoirBLLine[];
}

export interface AvoirBLResult {
    /** Le BL garde son numéro : seule la quantité avoirée y est enregistrée. */
    receiptNo: string;
    /** N° du document d'avoir généré (AVF26/0001), à remettre avec le BL. */
    avoirNo: string;
    salesOrderNo: string;
    orderNo: string;
    applied: boolean;
    linesAffected: number;
}

/**
 * Les BL du fournisseur connecté sur lesquels un avoir est encore possible : rien de
 * facturé dessus, du plus récent au plus ancien. Le n° fournisseur n'est pas passé ici —
 * il vient du header X-Vendor-No posé par l'intercepteur axios depuis la session, et le
 * backend l'impose.
 */
export const fetchAvoirableReceipts = async (): Promise<AvoirBLReceipt[]> => {
    const res = await axiosServices.get<{ receipts: AvoirBLReceipt[]; count: number }>(
        '/api/avoir-bl/receipts'
    );
    return res.data.receipts ?? [];
};

/**
 * Applique l'avoir : les lignes portent la quantité CONSERVÉE après avoir (0 = ligne annulée).
 * Ne transmettre que les lignes réellement modifiées.
 *
 * Attention : la quantité s'entend sur ce qu'il RESTE, c'est-à-dire `quantity - qtyAvoir`.
 * Une ligne livrée à 5 déjà avoirée de 1 se ramène à 3 en envoyant 3, pas 4 — c'est ainsi que
 * le codeunit la valide.
 */
export const applyAvoir = async (
    receiptNo: string,
    lines: { lineNo: number; newQty: number }[]
): Promise<AvoirBLResult> => {
    const res = await axiosServices.post<AvoirBLResult>('/api/avoir-bl/apply', {
        receiptNo,
        lines
    });
    return res.data;
};

/**
 * Télécharge le document d'avoir (PDF) à remettre avec le bon de livraison.
 * Le backend le génère à la volée depuis le journal, il n'y a rien de stocké.
 */
export const downloadAvoirDocument = async (avoirNo: string): Promise<void> => {
    // Le n° va en paramètre, pas dans le chemin : il contient un slash (AVF26/0001).
    const res = await axiosServices.get('/api/avoir-bl/document', {
        params: { avoirNo },
        responseType: 'blob'
    });

    // Un refus du backend arrive ici en blob de texte : sans ce contrôle on enregistrerait
    // un « PDF » contenant le message d'erreur, et l'échec passerait pour un fichier corrompu.
    const blob: Blob = res.data;
    if (blob.type && !blob.type.includes('pdf')) {
        throw (await blob.text()) || 'Le document d’avoir n’a pas pu être généré.';
    }

    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Avoir_${avoirNo.replace(/\//g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
