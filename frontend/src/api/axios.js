import axios from 'axios';

const isDebug = import.meta.env.VITE_DEBUG === 'false' || import.meta.env.DEV;
const baseURL = isDebug ? 'http://localhost:8000/api' : 'https://edufinanzas.onrender.com/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  // No enviar tokens de autenticación en endpoints públicos para evitar errores 401 si el token local ha expirado
  const publicEndpoints = [
    '/users/auth/login/',
    '/users/auth/register/',
    '/users/auth/password-reset/',
    '/users/auth/password-reset-confirm/',
    '/users/auth/activate/'
  ];

  const isPublic = publicEndpoints.some(endpoint => config.url && config.url.includes(endpoint));

  if (!isPublic) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
