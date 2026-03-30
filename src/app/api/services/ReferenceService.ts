import axiosServices from 'utils/axios';

export const fetchVendors = async () => {
    const response = await axiosServices.get(`/api/purchase-orders/vendors`);
    return response.data;
};

export const saveReferences = async (data: any) => {
    const response = await axiosServices.post(`/api/purchase-orders/save-references`, data);
    return response.data;
};
