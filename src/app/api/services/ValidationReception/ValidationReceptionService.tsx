import { Encours } from 'types/Encours';
import { emisesApi } from 'app/api/lib/EmisesApi';

export const fetchReceptionOrders = async (
    pageIndex: number,
    pageSize: number
): Promise<{ data: Encours[]; totalCount: number }> => {
    const skip = pageIndex * pageSize;

    const res = await emisesApi.get<{
        value: Encours[];
        '@odata.count'?: number;
    }>(`/api/purchase-orders/validation-reception?skip=${skip}&top=${pageSize}`);

    return {
        data: res.data.value,
        totalCount: res.data['@odata.count'] ?? 0
    };
};
