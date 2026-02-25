
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

  // Default sorting (if no column clicked)
  let orderBy = 'orderDate desc';

  if (sortField) {
    orderBy = `${sortField} ${sortDesc ? 'desc' : 'asc'}`;
  }

  const res = await recuesApi.get<{
    value: NonTraitee[];
    '@odata.count'?: number;
  }>(
  `https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(683ADB98-EA07-F111-8405-7CED8D83AA60)/PlexuspurchaseOrders` +
  `?$filter=status eq 'Draft' and ShippingAdvice eq 'Attente'` +
  `&$orderby=postingDate desc` +
  `&$skip=0` +
  `&$top=10` +
  `&$count=true` +
  `&$expand=PlexuspurchaseOrderLines`
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
