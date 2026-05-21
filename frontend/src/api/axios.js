import axios from 'axios';

const isDebug = import.meta.env.VITE_DEBUG === 'false' || import.meta.env.DEV;
const baseURL = 'https://edufinanzas.onrender.com/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
