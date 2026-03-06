import axiosServices from 'utils/axios';

export const fetchVendors = async () => {
    const response = await axiosServices.get('http://localhost:8080/api/purchase-orders/vendors');
    return response.data;
};

export const saveReferences = async (data: any) => {
    const response = await axiosServices.post('http://localhost:8080/api/purchase-orders/save-references', data);
    return response.data;
};
