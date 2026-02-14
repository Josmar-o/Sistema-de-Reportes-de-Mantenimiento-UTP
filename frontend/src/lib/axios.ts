import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error 401 - No autorizado (token inválido o expirado)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    // Error 403 - Prohibido (sin permisos)
    if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    }

    // Error 404 - No encontrado
    if (error.response?.status === 404) {
      toast.error('Recurso no encontrado.');
    }

    // Error 500 - Error del servidor
    if (error.response?.status === 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde.');
    }

    // Error de red
    if (!error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

export default api;
