import axiosServices from 'utils/axios';

// ==============================|| JOURNAL D'ACTIVITÉ - API ||============================== //

export interface ActivityEntry {
  id: string;
  timestamp: string; // ISO-8601 instant (UTC)
  user: string;
  userName?: string | null;
  role?: string | null;
  customerNo?: string | null;
  vendorNo?: string | null;
  category: string;
  action: string;
  reference?: string | null;
  method?: string | null;
  path?: string | null;
  query?: string | null;
  status?: number | null;
  durationMs?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  success?: boolean | null;
  detail?: string | null;
  /** Body sent by the user on write calls (credentials redacted, truncated). */
  payload?: string | null;
  /** JSON answer returned to them (truncated); null for document/file responses. */
  responseBody?: string | null;
  /** Extra context the app sent with the request (typically what a delete removed). */
  context?: string | null;
  /** What was done, in business terms: "Commande confirmée : livrer la totalité". */
  summary?: string | null;
  /** Field-by-field changes, with the previous value when the app sent it. */
  changes?: ActivityChange[] | null;
}

export interface ActivityChange {
  label: string;
  before?: string | null;
  after?: string | null;
}

export interface ActivityLogResponse {
  items: ActivityEntry[];
  total: number;
  page: number;
  size: number;
  users: string[];
  categories: string[];
  countsByCategory: Record<string, number>;
  countsByDay: Record<string, number>;
  distinctUsers: number;
  failures: number;
}

export interface ActivityLogFilters {
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  user?: string;
  category?: string;
  search?: string;
}

const EMPTY: ActivityLogResponse = {
  items: [],
  total: 0,
  page: 0,
  size: 50,
  users: [],
  categories: [],
  countsByCategory: {},
  countsByDay: {},
  distinctUsers: 0,
  failures: 0
};

const buildQuery = (filters: ActivityLogFilters, extra: Record<string, string | number> = {}) => {
  const params = new URLSearchParams();
  Object.entries({ ...filters, ...extra }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.length > 0) {
      params.append(key, `${value}`);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchActivityLog = async (
  filters: ActivityLogFilters,
  page = 0,
  size = 50
): Promise<ActivityLogResponse> => {
  try {
    const response = await axiosServices.get(`/api/activity-log${buildQuery(filters, { page, size })}`);
    return { ...EMPTY, ...(response.data || {}) };
  } catch (error) {
    console.error('Error fetching activity log:', error);
    throw error;
  }
};

/** Downloads the filtered journal as CSV (the backend streams an Excel-friendly file). */
export const exportActivityLog = async (filters: ActivityLogFilters): Promise<Blob> => {
  const response = await axiosServices.get(`/api/activity-log/export${buildQuery(filters)}`, {
    responseType: 'blob'
  });
  return response.data as Blob;
};
