import axiosServices from 'utils/axios';

export const createPecRequest = async (data: {
    vin: string;
    registrationNumber?: string;
    insuredName?: string;
    lines: { reference?: string; designation?: string; quantity: number }[];
}) => {
    const response = await axiosServices.post(`/api/purchase-orders/pec`, data);
    return response.data;
};

export const fetchPecRequests = async (skip = 0, top = 10) => {
    const response = await axiosServices.get(`/api/purchase-orders/pec?skip=${skip}&top=${top}`);
    return response.data;
};

export const fetchPecRequestLines = async (documentNo: string) => {
    const response = await axiosServices.get(`/api/purchase-orders/pec/${documentNo}/lines`);
    return response.data;
};

export const createOrderFromPec = async (
    documentNo: string,
    data: {
        vendorNumber?: string;
        lines: {
            id: string;
            reference: string;
            designation: string;
            quantity: number;
            price: number;
            status?: string | number;
            expectedDeliveryDate?: string;
        }[];
    }
) => {
    const response = await axiosServices.post(`/api/purchase-orders/pec/${documentNo}/create-order`, data);
    return response.data;
};

export const createDevisFromPec = async (
    documentNo: string,
    data: {
        vendorNumber: string;
        lines: {
            id: string;
            reference: string;
            designation: string;
            quantity: number;
            price: number;
            status?: string | number;
            expectedDeliveryDate?: string;
        }[];
    }
) => {
    const response = await axiosServices.post(`/api/purchase-orders/pec/${documentNo}/create-devis`, data);
    return response.data;
};

export interface PecSyncOrder {
    number: string;
    vendorNumber?: string;
    vendorName?: string;
    orderDate?: string;
    totalAmountExcludingTax?: number;
}

export interface PecSyncOrderLine {
    reference: string;
    designation?: string;
    quantity?: number;
    unitPrice: number;
}

// Recherche de commandes d'achat (opérateur PEC uniquement) pour synchroniser les prix
export const fetchOrdersForPecSync = async (search = '', top = 25): Promise<PecSyncOrder[]> => {
    const params = new URLSearchParams({ top: String(top) });
    if (search.trim()) params.set('search', search.trim());
    const response = await axiosServices.get(`/api/purchase-orders/pec/orders?${params.toString()}`);
    return response.data?.value || [];
};

export const fetchOrderLinesForPecSync = async (
    number: string
): Promise<{ number?: string; vendorNumber?: string; vendorName?: string; value: PecSyncOrderLine[] }> => {
    const response = await axiosServices.get(
        `/api/purchase-orders/pec/order-lines?number=${encodeURIComponent(number)}`
    );
    return { ...response.data, value: response.data?.value || [] };
};

