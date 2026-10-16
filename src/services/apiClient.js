/**
 * Axios API Client Configuration
 * Pre-configured for future Node.js + Express REST API integration.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor for future JWT auth token attachment
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('basah_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // In Phase 1 frontend-first mode, log the simulated API call
    console.warn('[API Client Notice] Remote API call intercepted or offline. Using local frontend service layer.', error?.message);
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
