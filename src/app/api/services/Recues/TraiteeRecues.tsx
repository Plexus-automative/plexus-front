
import { Traitee } from 'types/Traitee';
import { recuesApi } from '../../lib/RecusApi';

export const fetchTraitees = async (
  token: string,
  pageIndex: number,
  pageSize: number
): Promise<{ data: Traitee[]; totalCount: number }> => {

  const skip = pageIndex * pageSize;

  const res = await recuesApi.get<{
    value: Traitee[];
    '@odata.count'?: number;
  }>(
    `http://localhost:8080/api/purchase-orders/recues/traitee?skip=${skip}&top=${pageSize}`,
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
