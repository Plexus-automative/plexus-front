import axiosServices from 'utils/axios';

export interface DashboardStats {
  commandeFerme: number;
  enAttente: number;
  confirmationClient: number;
  parLeClient: number;
  pourLivraison: number;
  receptionnees: number;
  annulees: number;
  echues: number;
  echuesTotalite: number;
  amountAttente: number;
  amountConfirmation: number;
  amountPourLivraison: number;
  amountReceptionnees: number;
  amountFerme: number;
  amountAnnulees: number;
  caAnnuel: number;
  achatsAnnuel: number;
  caAujourdhui: number;
  facturesNonPayees: number;
  amtFacturesNonPayees: number;
  facturesAchatAujourdhui: number;
  amtFacturesAchatAujourd: number;
  commandesAujourdhui: number;
  amtCommandesAujourdhui: number;
  devisOuverts: number;
  commandesVenteOuvertes: number;
  sales2021: number;
  sales2022: number;
  sales2023: number;
  sales2024: number;
  sales2025: number;
  sales2026: number;
  purch2021: number;
  purch2022: number;
  purch2023: number;
  purch2024: number;
  purch2025: number;
  purch2026: number;
}

export const fetchDashboardStats = async (startDate?: string, endDate?: string): Promise<DashboardStats | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/stats';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    if (response.data && response.data.value && response.data.value.length > 0) {
      return response.data.value[0] as DashboardStats;
    }
    return null;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

export interface TopCustomer {
  number: string;
  name: string;
  salesLCY: number;
  paymentsLCY: number;
}

export interface TopVendor {
  number: string;
  name: string;
  purchaseLCY: number;
  paymentsLCY: number;
}

export const fetchTopCustomers = async (startDate?: string, endDate?: string): Promise<TopCustomer[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/top-customers';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    if (response.data && response.data.value) {
      return response.data.value as TopCustomer[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching top customers:', error);
    return [];
  }
};

export const fetchTopVendors = async (startDate?: string, endDate?: string): Promise<TopVendor[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/top-vendors';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    if (response.data && response.data.value) {
      return response.data.value as TopVendor[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    return [];
  }
};

export interface TopArticle {
  number: string;
  description: string;
  purchasesLCY: number;
  purchasesQty: number;
  // Groupe remise de l'article (Item Disc. Group dans BC) : code puis libellé complet
  discountGroup?: string;
  discountGroupName?: string;
  // PU moyen pondéré sur la période = montant total / quantité totale
  unitPrice?: number;
}

export interface TopBrand {
  brand: string;
  // Libellé complet du groupe remise (PC → PEUGEOT CITROEN)
  brandName?: string;
  purchasesLCY: number;
  purchasesQty: number;
}

// status: clé de statut du dashboard ('Fermes' = commandes validées) ; top: taille de chaque classement
export const fetchTopArticles = async (
  startDate?: string,
  endDate?: string,
  status?: string,
  top?: number,
  timeoutMs?: number
): Promise<TopArticle[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/top-articles';
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    }
    if (status) params.set('status', status);
    // top === 0 signifie "tous les articles" côté backend : ne pas le confondre avec absent
    if (top !== undefined) params.set('top', String(top));
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await axiosServices.get(url, timeoutMs ? { timeout: timeoutMs } : undefined);
    if (response.data && response.data.value) {
      return response.data.value as TopArticle[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching top articles:', error);
    return [];
  }
};

// ==============================|| INSURANCE DASHBOARD ||============================== //
// Real per-InsuranceName aggregates from PlexuspurchaseOrders (assurance = header InsuranceName,
// kept raw; money = totalAmountExcludingTax/IncludingTax; status = ShippingAdvice; all statuses counted).

export interface InsuranceStatusBucket {
  count: number;
  ht: number;
}

export interface InsuranceCompany {
  name: string;
  count: number;
  totalHT: number;
  totalTTC: number;
  statusBreakdown: Record<string, InsuranceStatusBucket>;
  monthly: { month: string; ht: number }[];
}

export interface InsuranceStatus {
  status: string;
  count: number;
  ht: number;
}

export interface InsuranceOrderRow {
  number: string;
  orderDate: string;
  insuranceName: string;
  shippingAdvice: string;
  registrationNumber: string;
  vin: string;
  sinitreNumber: string;
  vendorName: string;
  customerName: string;
  totalHT: number;
}

// Fast flat per-order feed (AL flat query) — dossiers table + top clients/réparateurs. HT only.
export const fetchInsuranceOrders = async (startDate?: string, endDate?: string): Promise<InsuranceOrderRow[] | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/insurance-orders';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    const d = response.data;
    if (d && Array.isArray(d.orders)) {
      return d.orders as InsuranceOrderRow[];
    }
    return null;
  } catch (error) {
    console.error('Error fetching insurance orders:', error);
    return null;
  }
};

export interface InsuranceDashboardData {
  grandTotals: { count: number; totalHT: number; totalTTC: number; companyCount: number };
  companies: InsuranceCompany[];
  statuses: InsuranceStatus[];
  orders: InsuranceOrderRow[];
}

// Order line: gross = sans remise, net = avec remise (sums to order Total HT), remise = discount.
export interface InsuranceLine {
  article: string;
  description: string;
  quantity: number;
  unitPrice: number;
  grossHT: number;
  remise: number;
  remisePct: number;
  netHT: number;
  netTTC: number;
}

export interface InsuranceOrderLines {
  lines: InsuranceLine[];
  grossHT: number;
  netHT: number;
}

export const fetchInsuranceOrderLines = async (orderNumber: string): Promise<InsuranceOrderLines | null> => {
  try {
    // Keep the slash literal (order numbers like "CA26/1440") — an encoded %2F is rejected by
    // the servlet/security firewall before it reaches the endpoint, yielding an empty response.
    const encoded = encodeURIComponent(orderNumber).replace(/%2F/g, '/');
    const url = `/api/purchase-orders/dashboard/insurance-order-lines?number=${encoded}`;
    const response = await axiosServices.get(url);
    const d = response.data;
    if (d && Array.isArray(d.lines)) {
      return d as InsuranceOrderLines;
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching order lines:', error?.response?.status, error?.message || error);
    return null;
  }
};

export interface InsuranceExportOrder extends InsuranceOrderRow {
  vendorName: string;
  totalHT: number;
  lines: InsuranceLine[];
}

export const fetchInsuranceExport = async (startDate?: string, endDate?: string): Promise<InsuranceExportOrder[] | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/insurance-export';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url, { timeout: 300000 });
    const d = response.data;
    if (d && Array.isArray(d.orders)) {
      return d.orders as InsuranceExportOrder[];
    }
    return null;
  } catch (error) {
    console.error('Error fetching insurance export:', error);
    return null;
  }
};

// Fast pre-aggregated feed (AL GROUP BY query) — for KPIs/charts. HT only, no client dimension.
export interface InsuranceAggCompany {
  name: string;
  count: number;
  totalHT: number;
  statusBreakdown: Record<string, InsuranceStatusBucket>;
}

export interface InsuranceAggRow {
  insuranceName: string;
  shippingAdvice: string;
  orderDate: string;
  count: number;
  totalHT: number;
}

export interface InsuranceAggData {
  grandTotals: { count: number; totalHT: number; companyCount: number };
  companies: InsuranceAggCompany[];
  statuses: InsuranceStatus[];
  rows: InsuranceAggRow[];
}

export const fetchInsuranceDashboardAgg = async (startDate?: string, endDate?: string): Promise<InsuranceAggData | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/insurance-agg';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    const d = response.data;
    if (d && d.rows) {
      return d as InsuranceAggData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching insurance agg:', error);
    return null;
  }
};

// Maps SellToCustomerNo (e.g. C0005) -> displayName (e.g. STE SMAOUI AUTOS SERVICES SAS)
export const fetchCustomerNames = async (): Promise<Record<string, string>> => {
  try {
    const response = await axiosServices.get('/api/purchase-orders/customers');
    const vals = response.data?.value || response.data || [];
    const map: Record<string, string> = {};
    (Array.isArray(vals) ? vals : []).forEach((c: any) => {
      if (c && c.number) map[c.number] = (c.displayName || '').trim() || c.number;
    });
    return map;
  } catch (error) {
    console.error('Error fetching customer names:', error);
    return {};
  }
};

export const fetchInsuranceDashboard = async (startDate?: string, endDate?: string): Promise<InsuranceDashboardData | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/insurance';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    const d = response.data;
    if (d && d.companies) {
      return d as InsuranceDashboardData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching insurance dashboard:', error);
    return null;
  }
};

export const fetchTopBrands = async (startDate?: string, endDate?: string): Promise<TopBrand[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/top-marques';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url);
    if (response.data && response.data.value) {
      return response.data.value as TopBrand[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching top brands:', error);
    return [];
  }
};

// Indicateur "Commandé vs Facturé" : part de ce qui a été commandé (hors commandes
// annulées) qui a été réceptionné puis réellement facturé par le fournisseur.
export interface CommandeVsFacture {
  // false tant que l'extension AL 1.1.1.456+ n'est pas publiée (colonnes absentes du flux)
  available: boolean;
  startDate: string;
  endDate: string;
  ordered: number;
  received: number;
  invoiced: number;
  notInvoiced: number;
  pctReceived: number;
  pctInvoiced: number;
  orders: number;
  lines: number;
  linesNotInvoiced: number;
  ordersPartiallyInvoiced: number;
}

export const fetchCommandeVsFacture = async (
  startDate?: string,
  endDate?: string
): Promise<CommandeVsFacture | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/commande-vs-facture';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url, { timeout: 300000 });
    return (response.data as CommandeVsFacture) || null;
  } catch (error) {
    console.error('Error fetching commande vs facture:', error);
    return null;
  }
};

// Série journalière réelle des ventes / achats facturés (une ligne par jour actif).
// Somme les mêmes champs que les cartes "Ventes/Achats Facturés" (Sales/Purchase (LCY)),
// donc les courbes se totalisent dessus. Vide tant que l'extension AL 1.1.1.462+ (queries
// plexusSalesDaily / plexusPurchDaily) n'est pas publiée.
export interface DailyPoint {
  date: string; // YYYY-MM-DD
  sales: number;
  purchases: number;
}

// Marge commerciale : écart de remise entre la vente et l'achat du même dossier (facture vente
// rapprochée de sa commande achat), et non ventes − achats de la période.
// coveredRevenue = CA des factures effectivement rattachées à une commande achat.
export interface MarginStats {
  available: boolean;
  startDate: string;
  endDate: string;
  coveredRevenue: number;
  cogs: number;
  margin: number;
  marginRate: number;
  uncoveredRevenue: number;
  invoicesCovered: number;
  invoicesTotal: number;
  // avoirs déjà déduits de coveredRevenue/cogs : creditsReturned = marchandise reprise
  // (vente et coût annulés), creditsOther = RRR et gestes commerciaux (perte sèche).
  creditNotes: number;
  creditsReturned: number;
  creditsOther: number;
  creditsCostBack: number;
  // avoirs fournisseur : seuls les RRR obtenus figurent ici, les lignes article étant déjà
  // nettes dans le coût unitaire (sinon double comptage).
  vendorCreditNotes: number;
  vendorRebates: number;
}

export const fetchMargin = async (startDate?: string, endDate?: string): Promise<MarginStats | null> => {
  try {
    let url = '/api/purchase-orders/dashboard/margin';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url, { timeout: 300000 });
    const data = response.data as MarginStats;
    return data && data.available ? data : null;
  } catch (error) {
    console.error('Error fetching margin:', error);
    return null;
  }
};

// Détail ligne à ligne derrière la marge — sert à l'export Excel de contrôle.
export interface MarginLine {
  documentNo: string;
  postingDate: string;
  customerName: string;
  itemNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  salesDiscountPct: number;
  salesAmount: number;
  purchaseOrderNo: string;
  vendorName: string;
  purchaseUnitCost: number;
  purchaseDiscountPct: number;
  purchaseAmount: number;
  costSource: string;
  marginAmount: number;
  marginPct: number;
}

export const fetchMarginLines = async (startDate?: string, endDate?: string): Promise<MarginLine[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/margin-lines';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url, { timeout: 300000 });
    const value = response.data?.value;
    return Array.isArray(value) ? (value as MarginLine[]) : [];
  } catch (error) {
    console.error('Error fetching margin lines:', error);
    return [];
  }
};

// Série APPARIÉE : mêmes dossiers des deux côtés, donc l'écart entre les deux courbes est la
// marge. À ne pas confondre avec fetchDailySeries, qui renvoie les flux de facturation bruts
// (décalés de 1 à 2 mois entre vente et achat, sans rapport dossier à dossier).
export const fetchMarginSeries = async (startDate?: string, endDate?: string): Promise<DailyPoint[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/margin-series';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url, { timeout: 300000 });
    const value = response.data?.value;
    return Array.isArray(value) ? (value as DailyPoint[]) : [];
  } catch (error) {
    console.error('Error fetching margin series:', error);
    return [];
  }
};

export const fetchDailySeries = async (startDate?: string, endDate?: string): Promise<DailyPoint[]> => {
  try {
    let url = '/api/purchase-orders/dashboard/daily-series';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axiosServices.get(url, { timeout: 120000 });
    const value = response.data?.value;
    return Array.isArray(value) ? (value as DailyPoint[]) : [];
  } catch (error) {
    console.error('Error fetching daily series:', error);
    return [];
  }
};
