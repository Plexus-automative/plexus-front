// app/api/services/EncoursEmises.ts

import { Encours } from 'types/Encours';
import { emisesApi } from '../../lib/EmisesApi';

export const fetchEncours = async (
    pageIndex: number,
    pageSize: number,
    sortField?: string,
    sortDesc?: boolean,
    filter?: string
): Promise<{ data: Encours[]; totalCount: number }> => {

    const skip = pageIndex * pageSize;
    let url = `/api/purchase-orders/emises/en-cours?skip=${skip}&top=${pageSize}`;

    if (sortField) {
        url += `&sort=${sortField}&desc=${!!sortDesc}`;
    }
    if (filter && filter.trim()) {
        url += `&search=${encodeURIComponent(filter.trim())}`;
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
