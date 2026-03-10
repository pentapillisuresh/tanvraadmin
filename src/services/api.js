import axios from 'axios';
import toast from 'react-hot-toast';

// Vite exposes env variables with import.meta.env
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;