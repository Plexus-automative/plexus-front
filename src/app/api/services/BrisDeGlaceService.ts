import axiosServices from 'utils/axios';

export interface BrisDossierInput {
  dossierNo: string;
  immatriculation: string;
  assureur: string;
  vehicleMakeModel: string;
  vin: string;
  damageZones: string[];
}

export interface BrisDossier {
  id: string;
  number: string;
  brisDossierNo: string;
  creationDate: string;
  creationDateTime: string;
  registrationNumber: string;
  insuranceName: string;
  vehicleMakeModel: string;
  vin: string;
  damageZones: string;
  insuranceFile: string;
  createdBy: string;
  customerNo: string;
  customerName: string;
  status: string;
  treated: boolean;
}

// Emitted after a dossier is marked treated, so the header notification refreshes instantly.
export const BRIS_TREATED_EVENT = 'bris-treated';

// Create a bris de glace dossier (multipart: JSON metadata + optional PDF).
export const createBrisDossier = async (input: BrisDossierInput, file: File | null) => {
  const form = new FormData();
  form.append('data', JSON.stringify(input));
  if (file) {
    form.append('file', file);
  }
  const response = await axiosServices.post('/api/bris-de-glace/dossiers', form);
  return response.data;
};

// List dossiers. Backend scopes by creator unless the caller is the Plexus customer (C0090).
export const fetchBrisDossiers = async (): Promise<BrisDossier[]> => {
  const response = await axiosServices.get('/api/bris-de-glace/dossiers');
  return response.data?.value ?? [];
};

export interface VehicleModelRow {
  make: string;
  model: string;
}

// Vehicle makes/models managed in BC (plexusVehicleModels). Empty array = not yet seeded.
export const fetchVehicleModels = async (): Promise<VehicleModelRow[]> => {
  const response = await axiosServices.get('/api/bris-de-glace/vehicle-models');
  return (response.data?.value ?? [])
    .map((r: any) => ({ make: (r.make || '').trim(), model: (r.model || '').trim() }))
    .filter((r: VehicleModelRow) => r.make);
};

// Mark a dossier as treated (C0090) — removes it from the notification list.
export const treatBrisDossier = async (orderId: string, treated = true) => {
  const response = await axiosServices.post(`/api/bris-de-glace/dossiers/${orderId}/treat?treated=${treated}`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BRIS_TREATED_EVENT));
  }
  return response.data;
};

// Attach or replace the PDF on an existing dossier (from the consultation list).
export const uploadBrisFile = async (orderId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosServices.post(`/api/bris-de-glace/dossiers/${orderId}/file`, form);
  return response.data;
};

// Download the dossier PDF as a Blob (auth header auto-injected by axiosServices).
export const downloadBrisFile = async (orderId: string): Promise<Blob> => {
  const response = await axiosServices.get(`/api/bris-de-glace/dossiers/${orderId}/file`, {
    responseType: 'blob'
  });
  return response.data as Blob;
};
