import axios from 'axios';
import { auth } from '../utils/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Add a request interceptor to include the Firebase ID token in headers
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 429 rate limiting and 401 blocked users
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Handle 401 Blocked User
    if (response && response.status === 401 && response.data?.error?.includes('blocked by an admin')) {
      console.error('User is blocked. Forcing logout.');
      // We'll let the AuthContext or the page handle the actual logout/redirect if needed,
      // but we can also broadcast a custom event or clear storage.
      window.dispatchEvent(new CustomEvent('user-blocked', { detail: response.data.error }));
      return Promise.reject(error);
    }

    // If it's a 429 error and we haven't retried yet
    if (response && response.status === 429 && !config._retry) {
      config._retry = true;
      
      console.warn('Rate limit hit. Retrying in 10 seconds...');
      
      // Wait for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Retry the request
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export default api;
