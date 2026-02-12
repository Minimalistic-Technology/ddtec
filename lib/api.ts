import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

// Add a request interceptor to handle path prefixes in baseURL
api.interceptors.request.use((config) => {
  // If baseURL has a path (like /ddtec) and url starts with / (like /categories)
  // Axios standard behavior will strip the baseURL path.
  // We force the url to be relative to the baseURL.
  if (config.baseURL && !config.baseURL.endsWith('/')) {
    config.baseURL += '/';
  }
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  return config;
});

export default api;
