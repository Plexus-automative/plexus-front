import axiosServices from 'utils/axios';

// ==============================|| DEMANDES DE DEVIS - API ||============================== //
//
// Demandes relayed by the commercial mobile app's backend. Photos and voice notes stay on
// their storage — we only ever hold links, so `media[].url` points off-site.
//
// Backend: GET /api/demandes-devis (Plexus account C0090 only).

export interface DemandeDevisItem {
  description: string;
  quantity?: number;
  /** ISO-8601 with offset, e.g. 2026-08-04T08:15:30+01:00. */
  addedAt?: string;
}

export interface DemandeDevisMedia {
  type: string;
  url: string;
  label?: string;
  durationSec?: number;
  addedAt?: string;
}

export interface DemandeDevis {
  id: string;
  number: string;
  externalReference: string;
  status: string;
  treated: boolean;
  customerNo?: string | null;
  customerName?: string | null;
  /** When the commercial captured it in the field. */
  createdOnDevice?: string | null;
  /** When Plexus received it — later than the above if the mobile was offline. */
  receivedAt?: string | null;
  garage: { name?: string | null; customerNo?: string | null };
  commercial: { id?: string | null; name?: string | null };
  vehicle: {
    immatriculation?: string | null;
    vin?: string | null;
    make?: string | null;
    model?: string | null;
  };
  notes?: string | null;
  items: DemandeDevisItem[];
  media: DemandeDevisMedia[];
}

export interface DemandeDevisPage {
  total: number;
  limit: number;
  offset: number;
  items: DemandeDevis[];
}

export interface DemandeDevisFilters {
  /** false = only the ones still to handle. */
  treated?: boolean;
  /** Substring of the garage name. */
  garage?: string;
  /** Substring of the registration number. */
  immatriculation?: string;
  /** yyyy-MM-dd */
  from?: string;
  /** yyyy-MM-dd */
  to?: string;
}

const EMPTY: DemandeDevisPage = { total: 0, limit: 50, offset: 0, items: [] };

const buildQuery = (filters: DemandeDevisFilters, extra: Record<string, string | number> = {}) => {
  const params = new URLSearchParams();
  Object.entries({ ...filters, ...extra }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.length > 0) {
      params.append(key, `${value}`);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchDemandesDevis = async (
  filters: DemandeDevisFilters = {},
  limit = 50,
  offset = 0
): Promise<DemandeDevisPage> => {
  try {
    const response = await axiosServices.get(`/api/demandes-devis${buildQuery(filters, { limit, offset })}`);
    return { ...EMPTY, ...(response.data || {}) };
  } catch (error) {
    console.error('Error fetching demandes de devis:', error);
    throw error;
  }
};

export const fetchDemandeDevis = async (numero: string): Promise<DemandeDevis> => {
  const response = await axiosServices.get(`/api/demandes-devis/${encodeURIComponent(numero)}`);
  return response.data as DemandeDevis;
};

/** Marks a demande handled (or puts it back). Returns the updated demande. */
export const setDemandeTreated = async (id: string, treated: boolean): Promise<DemandeDevis> => {
  const response = await axiosServices.post(`/api/demandes-devis/${encodeURIComponent(id)}/treat?treated=${treated}`);
  return response.data as DemandeDevis;
};
