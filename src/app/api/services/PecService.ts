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
        vendorNumber: string;
        lines: { id: string; reference: string; designation: string; quantity: number; price: number }[];
    }
) => {
    const response = await axiosServices.post(`/api/purchase-orders/pec/${documentNo}/create-order`, data);
    return response.data;
};
