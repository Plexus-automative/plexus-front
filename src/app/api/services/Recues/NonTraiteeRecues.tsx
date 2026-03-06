
import { recuesApi } from 'app/api/lib/RecusApi';
import { NonTraitee } from 'types/NonTraitee';

export const fetchNonTraitees = async (
  token: string,
  pageIndex: number,
  pageSize: number,
  sortField?: string,
  sortDesc?: boolean
): Promise<{ data: NonTraitee[]; totalCount: number }> => {

  const skip = pageIndex * pageSize;
  let url = `http://localhost:8080/api/purchase-orders/recues/non-traitee?skip=${skip}&top=${pageSize}`;

  if (sortField) {
    url += `&sort=${sortField}&desc=${!!sortDesc}`;
  }

  const res = await recuesApi.get<{
    value: NonTraitee[];
    '@odata.count'?: number;
  }>(
    url,
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
