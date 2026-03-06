// app/api/services/NonTraiteeEmises.ts

import { Encours } from 'types/Encours';
import { emisesApi } from '../../lib/EmisesApi';

export const fetchEncours = async (
    token: string,
    pageIndex: number,
    pageSize: number
): Promise<{ data: Encours[]; totalCount: number }> => {

    const skip = pageIndex * pageSize;

    const res = await emisesApi.get<{
        value: Encours[];
        '@odata.count'?: number;
    }>(
        `http://localhost:8080/api/purchase-orders/emises/en-cours?skip=${skip}&top=${pageSize}`
    );

    return {
        data: res.data.value,
        totalCount: res.data['@odata.count'] ?? 0
    };
};
