import { Encours } from 'types/Encours';
import { emisesApi } from 'app/api/lib/EmisesApi';

export const fetchReceptionOrders = async (
    pageIndex: number,
    pageSize: number,
    sort?: string,
    desc?: boolean
): Promise<{ data: Encours[]; totalCount: number }> => {
    const skip = pageIndex * pageSize;
    let url = `/api/purchase-orders/validation-reception?skip=${skip}&top=${pageSize}`;
    
    if (sort) {
        url += `&sort=${sort}&desc=${desc}`;
    }

    const res = await emisesApi.get<{
        value: Encours[];
        '@odata.count'?: number;
    }>(url);

    return {
        data: res.data.value,
        totalCount: res.data['@odata.count'] ?? 0
    };
};
