
import { Traitee } from 'types/Traitee';
import { recuesApi } from '../../lib/RecusApi';

export const fetchTraitees = async (
  token: string,
  pageIndex: number,
  pageSize: number,
  sortField?: string,
  sortDesc?: boolean
): Promise<{ data: Traitee[]; totalCount: number }> => {

  const skip = pageIndex * pageSize;

  let orderBy = 'orderDate desc';

  if (sortField) {
    orderBy = `${sortField} ${sortDesc ? 'desc' : 'asc'}`;
  }

  const res = await recuesApi.get<{
    value: Traitee[];
    '@odata.count'?: number;
  }>(
    `https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(683ADB98-EA07-F111-8405-7CED8D83AA60)/PlexuspurchaseOrders` +
    `?$select=number,orderDate,payToVendorNumber,vendorName,status,fullyReceived,lastModifiedDateTime,ShippingAdvice` +
    `&$filter=fullyReceived eq false and status eq 'Open' and ShippingAdvice eq 'Confirmé'` +
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
