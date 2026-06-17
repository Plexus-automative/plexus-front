import { commandesLivreesApi } from '../../lib/CommandesLivreesApi';

export const fetchLivreesOrders = async (skip: number, top: number, sort?: string, desc?: boolean, search?: string, registration?: string) => {
    try {
        let url = `/api/purchase-orders/commandes-livree?skip=${skip}&top=${top}`;
        if (sort) {
            url += `&sort=${sort}&desc=${desc}`;
        }
        if (search && search.trim()) {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        if (registration && registration.trim()) {
            url += `&registration=${encodeURIComponent(registration.trim())}`;
        }
        const response = await commandesLivreesApi.get(url);

        const data = response.data;
        const orders = data.value || [];
        const totalCount = data['@odata.count'] || orders.length;

        return {
            data: orders,
            totalCount
        };
    } catch (error) {
        console.error('Error fetching livrees orders:', error);
        throw error;
    }
};
