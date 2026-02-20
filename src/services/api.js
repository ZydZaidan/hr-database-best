import axios from 'axios';

// Bikin instance Axios yang udah nyambung ke URL Railway
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor: Otomatis nyisipin Token Login (Bearer Token) ke setiap request
api.interceptors.request.use(
  (config) => {
    // Nanti token aslinya kita ambil dari localStorage pas fitur login API udah jalan
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;