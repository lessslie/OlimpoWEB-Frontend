import axios from 'axios';

// Obtener la URL base de la API del entorno o usar un valor por defecto
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
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
      // Si estamos en el navegador, redirigir a la página de inicio de sesión
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // No redirigimos aquí para evitar problemas con Next.js
        // La redirección se manejará en los componentes
      }
    }
    
    return Promise.reject(error);
  }
);

// Exportar el servicio de API con métodos comunes
export const apiService = {
  // Método GET
  get: (url: string, params?: any) => apiClient.get(url, { params }),
  
  // Método POST
  post: (url: string, data: any) => apiClient.post(url, data),
  
  // Método PUT
  put: (url: string, data: any) => apiClient.put(url, data),
  
  // Método PATCH
  patch: (url: string, data: any) => apiClient.patch(url, data),
  
  // Método DELETE
  delete: (url: string) => apiClient.delete(url),
  
  // Método para subir archivos
  upload: (url: string, formData: FormData) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Método para establecer el token manualmente
  setAuthToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  // Método para eliminar el token
  removeAuthToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  // Método para obtener el token actual
  getAuthToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
};
