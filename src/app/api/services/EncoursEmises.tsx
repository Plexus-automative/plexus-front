// app/api/services/NonTraiteeEmises.ts

import { Encours } from 'types/Encours';
import { emisesApi } from '../../api/lib/EmisesApi';

export const fetchEncours = async (
    token: string,
    pageIndex: number,
    pageSize: number,
    sortField?: string,
    sortDesc?: boolean
): Promise<{ data: Encours[]; totalCount: number }> => {

    const skip = pageIndex * pageSize;

    // Default sorting (if no column clicked)
    let orderBy = 'orderDate desc';

    if (sortField) {
        orderBy = `${sortField} ${sortDesc ? 'desc' : 'asc'}`;
    }

    const res = await emisesApi.get<{
        value: Encours[];
        '@odata.count'?: number;
    }>(
        `/companies(683ADB98-EA07-F111-8405-7CED8D83AA60)/PlexuspurchaseOrders` +
        `?$filter=fullyReceived eq false and status eq 'Draft' and (ShippingAdvice eq 'ConfirmationPartielle' or ShippingAdvice eq 'Totalité')` +
        `&$orderby=${orderBy}` +
        `&$skip=${skip}` +
        `&$top=${pageSize}` +
        `&$count=true`

        ,
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
