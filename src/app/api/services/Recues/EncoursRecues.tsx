// app/api/services/EncoursRecues.ts

import { Encours } from 'types/Encours';
import { recuesApi } from 'app/api/lib/RecusApi';

export const fetchEncours = async (
    pageIndex: number,
    pageSize: number,
    sortField?: string,
    sortDesc?: boolean,
    filter?: string,
    registration?: string,
    subCategory?: string
): Promise<{ data: Encours[]; totalCount: number }> => {

    const skip = pageIndex * pageSize;
    let url = `/api/purchase-orders/recues/en-cours?skip=${skip}&top=${pageSize}`;

    if (sortField) {
        url += `&sort=${sortField}&desc=${!!sortDesc}`;
    }
    if (filter && filter.trim()) {
        url += `&search=${encodeURIComponent(filter.trim())}`;
    }
    if (registration && registration.trim()) {
        url += `&registration=${encodeURIComponent(registration.trim())}`;
    }
    if (subCategory) {
        url += `&subCategory=${encodeURIComponent(subCategory)}`;
    }

    const res = await recuesApi.get<{
        value: Encours[];
        '@odata.count'?: number;
    }>(url);

    return {
        data: res.data.value,
        totalCount: res.data['@odata.count'] ?? 0
    };
};
