// app/api/services/NonTraiteeEmises.ts

import { emisesApi } from '../../lib/EmisesApi';
import { NonTraitee } from 'types/NonTraitee';

export const fetchNonTraitees = async (
  pageIndex: number,
  pageSize: number,
  sortField?: string,
  sortDesc?: boolean,
  filter?: string
): Promise<{ data: NonTraitee[]; totalCount: number }> => {
  const skip = pageIndex * pageSize;
  let url = `/api/purchase-orders/emises/non-traitee?skip=${skip}&top=${pageSize}`;

  if (sortField) {
    url += `&sort=${sortField}&desc=${!!sortDesc}`;
  }
  if (filter && filter.trim()) {
    url += `&search=${encodeURIComponent(filter.trim())}`;
  }

  const res = await emisesApi.get<{
    value: NonTraitee[];
    '@odata.count'?: number;
  }>(url);

  return {
    data: res.data.value,
    totalCount: res.data['@odata.count'] ?? 0
  };
};
