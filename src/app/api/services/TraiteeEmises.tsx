// app/api/services/NonTraiteeEmises.ts

import { emisesApi } from '../lib/EmisesApi';
import { NonTraitee } from 'types/NonTraitee';

export const fetchTraitees = async (
  token: string,
  pageIndex: number,
  pageSize: number,
  sortField?: string,
  sortDesc?: boolean
): Promise<{ data: NonTraitee[]; totalCount: number }> => {

  const skip = pageIndex * pageSize;

  // Default sorting (if no column clicked)
  let orderBy = 'orderDate desc';

  if (sortField) {
    orderBy = `${sortField} ${sortDesc ? 'desc' : 'asc'}`;
  }

  const res = await emisesApi.get<{
    value: NonTraitee[];
    '@odata.count'?: number;
  }>(
    `/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898a3)/purchaseOrders` +
    `?$select=number,orderDate,payToVendorNumber,vendorName,status,fullyReceived,lastModifiedDateTime` +
    `&$filter=fullyReceived eq false` +
    `&$orderby=${orderBy}` +
    `&$skip=${skip}` +
    `&$top=${pageSize}` +
    `&$count=true`,
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
