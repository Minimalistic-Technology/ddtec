import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  timeout: 20000, // 20 seconds timeout to prevent infinite "Sending..."
});

// Add a request interceptor to handle path prefixes and logging
api.interceptors.request.use((config) => {
  // Fix baseURL trailing slash
  if (config.baseURL && !config.baseURL.endsWith('/')) {
    config.baseURL += '/';
  }
  // Fix url leading slash
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

// Add a response interceptor for global error handling/logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API SUCCESS] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.msg || error.message || 'Unknown API Error';
    console.error(`[API ERROR] ${error.config?.url}:`, errorMsg);
    return Promise.reject(error);
  }
);

export default api;
