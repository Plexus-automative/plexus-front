
import { Traitee } from 'types/Traitee';
import { emisesApi } from 'app/api/lib/EmisesApi';


export const fetchTraitees = async (
  pageIndex: number,
  pageSize: number,
  filter?: string
): Promise<{ data: Traitee[]; totalCount: number }> => {

  const skip = pageIndex * pageSize;
  let url = `/api/purchase-orders/emises/traitee?skip=${skip}&top=${pageSize}`;
  if (filter && filter.trim()) {
    url += `&search=${encodeURIComponent(filter.trim())}`;
  }

  const res = await emisesApi.get<{
    value: Traitee[];
    '@odata.count'?: number;
  }>(url);

  return {
    data: res.data.value,
    totalCount: res.data['@odata.count'] ?? 0
  };
};
