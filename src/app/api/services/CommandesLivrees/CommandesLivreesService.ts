import { commandesLivreesApi } from '../../lib/CommandesLivreesApi';

export const fetchLivreesOrders = async (token: string, skip: number, top: number) => {
    try {
        const response = await commandesLivreesApi.get(
            `http://localhost:8080/api/purchase-orders/commandes-livree?skip=${skip}&top=${top}`
        );

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
