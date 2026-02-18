import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  timeout: 20000,
});

if (typeof window !== 'undefined') {
  console.log('[API CONFIG] Base URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'UNDEFINED - Check Environment Variables');
}

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

  // Inject token if available (fallback for cookies)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ddtec_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    const isAuthMe = error.config?.url?.includes('auth/me');
    const isUnauthorized = error.response?.status === 401;

    if (isAuthMe && isUnauthorized) {
      // Suppress error log for expected "No token" case on session check
      console.log(`[API INFO] ${error.config?.url}: No active session`);
    } else {
      console.error(`[API ERROR] ${error.config?.url}:`, errorMsg);
    }
    return Promise.reject(error);
  }
);

export default api;
