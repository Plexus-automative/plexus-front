import axiosServices from 'utils/axios';

// Re-export axiosServices so that session headers (X-Customer-No, X-Vendor-No)
// and Authorization tokens are automatically attached via the request interceptor.
export const commandesLivreesApi = axiosServices;
