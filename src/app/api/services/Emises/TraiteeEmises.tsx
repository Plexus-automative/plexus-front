
import { Traitee } from 'types/Traitee';
import { emisesApi } from 'app/api/lib/EmisesApi';


export const fetchTraitees = async (
  token: string,
  pageIndex: number,
  pageSize: number
): Promise<{ data: Traitee[]; totalCount: number }> => {

  const skip = pageIndex * pageSize;

  const res = await emisesApi.get<{
    value: Traitee[];
    '@odata.count'?: number;
  }>(
    `http://localhost:8080/api/purchase-orders/emises/traitee?skip=${skip}&top=${pageSize}`,
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
