// app/api/services/NonTraiteeEmises.ts

import { emisesApi } from '../../lib/EmisesApi';
import { NonTraitee } from 'types/NonTraitee';

export const fetchNonTraitees = async (
  token: string,
  pageIndex: number,
  pageSize: number
): Promise<{ data: NonTraitee[]; totalCount: number }> => {
  const skip = pageIndex * pageSize;

  const res = await emisesApi.get<{
    value: NonTraitee[];
    '@odata.count'?: number;
  }>(
    `http://localhost:8080/api/purchase-orders/emises/non-traitee` +
    `?skip=${skip}&top=${pageSize}`
  );

  return {
    data: res.data.value,
    totalCount: res.data['@odata.count'] ?? 0
  };
};
