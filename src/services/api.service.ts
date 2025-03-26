// src/services/api.service.ts
import axios from 'axios';

// Obtener la URL base de la API del entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Crear una instancia de axios con configuración común
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token de autenticación en las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    // Obtener el token del almacenamiento local
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Si hay un token, incluirlo en el encabezado de autorización
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Si estamos en el navegador, eliminar el token
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // La redirección se manejará en los componentes
      }
    }

    return Promise.reject(error);
  }
);

// Exportar el servicio de API con métodos comunes
export const apiService = {
  // Métodos HTTP básicos
  get: (url: string, params?: any) => apiClient.get(url, { params }),
  post: (url: string, data: any) => apiClient.post(url, data),
  put: (url: string, data: any) => apiClient.put(url, data),
  patch: (url: string, data: any) => apiClient.patch(url, data),
  delete: (url: string) => apiClient.delete(url),

  // Método para subir archivos
  upload: (url: string, formData: FormData) => {
    return apiClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Métodos de autenticación
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        return { success: true, data: response.data };
      }

      return { success: false, error: "No se recibió un token válido" };
    } catch (error) {
      return {
        success: false,
        error: (error as any).response?.data?.message || "Error al iniciar sesión",
      };
    }
  },

  register: async (userData: any) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: (error as any).response?.data?.message || "Error al registrar usuario",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    // Opcionalmente, también puedes hacer una llamada al backend para invalidar el token
    // return apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: (error as any).response?.data?.message || "Error al obtener datos del usuario",
      };
    }
  },

  // Métodos auxiliares de token
  setAuthToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  removeAuthToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  getAuthToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },
};
