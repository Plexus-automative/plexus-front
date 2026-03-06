import { Encours } from 'types/Encours';
import { emisesApi } from 'app/api/lib/EmisesApi';

export const fetchReceptionOrders = async (
    token: string,
    pageIndex: number,
    pageSize: number
): Promise<{ data: Encours[]; totalCount: number }> => {
    const skip = pageIndex * pageSize;

    const res = await emisesApi.get<{
        value: Encours[];
        '@odata.count'?: number;
    }>(
        `http://localhost:8080/api/purchase-orders/validation-reception?skip=${skip}&top=${pageSize}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return {
        data: res.data.value,
        totalCount: res.data['@odata.count'] ?? 0
    };
};
