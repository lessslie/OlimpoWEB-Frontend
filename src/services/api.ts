'use client';

// URL base de la API del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Función para obtener el token de autenticación
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Función para realizar peticiones a la API
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Manejar errores de autenticación
    if (response.status === 401 && typeof window !== 'undefined') {
      // Limpiar el token y redirigir al login si es necesario
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Si estamos en una página protegida, redirigir al login
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/' &&
          !window.location.pathname.includes('/contact') &&
          !window.location.pathname.includes('/location') &&
          !window.location.pathname.includes('/memberships')) {
        window.location.href = '/login';
      }
      
      throw new Error('Sesión expirada o inválida');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || 'Error en la petición',
        response: errorData,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la petición API:', error);
    throw error;
  }
};

// Servicios para las diferentes entidades
const authService = {
  login: async (email: string, password: string) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Adaptar la respuesta al formato esperado por el frontend
    return {
      user: data.user,
      token: data.token || data.session
    };
  },
  
  register: async (userData: any) => {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return {
      user: data.user,
      token: data.token || data.session
    };
  },
  
  getProfile: async () => {
    return await fetchAPI('/auth/me');
  },
  
  updateProfile: async (userData: any) => {
    return await fetchAPI('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },
};

const membershipsService = {
  getAll: async () => {
    return await fetchAPI('/memberships');
  },
  
  getById: async (id: string) => {
    return await fetchAPI(`/memberships/${id}`);
  },
  
  getUserMemberships: async (userId: string) => {
    return await fetchAPI(`/memberships/user/${userId}`);
  },
  
  create: async (membershipData: any) => {
    return await fetchAPI('/memberships', {
      method: 'POST',
      body: JSON.stringify(membershipData),
    });
  },
  
  update: async (id: string, membershipData: any) => {
    return await fetchAPI(`/memberships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(membershipData),
    });
  },
  
  delete: async (id: string) => {
    return await fetchAPI(`/memberships/${id}`, {
      method: 'DELETE',
    });
  },
  
  renew: async (id: string) => {
    return await fetchAPI(`/memberships/${id}/renew`, {
      method: 'POST',
    });
  },
  
  checkExpired: async () => {
    return await fetchAPI('/memberships/check-expired', {
      method: 'POST',
    });
  },
};

const attendanceService = {
  getAll: async () => {
    return await fetchAPI('/attendance');
  },
  
  getById: async (id: string) => {
    return await fetchAPI(`/attendance/${id}`);
  },
  
  getUserAttendance: async (userId: string) => {
    return await fetchAPI(`/attendance/user/${userId}`);
  },
  
  getByDateRange: async (startDate: string, endDate: string) => {
    return await fetchAPI(`/attendance/date-range?startDate=${startDate}&endDate=${endDate}`);
  },
  
  create: async (attendanceData: any) => {
    return await fetchAPI('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  },
  
  checkOut: async (id: string) => {
    return await fetchAPI(`/attendance/${id}/check-out`, {
      method: 'POST',
    });
  },
  
  generateQR: async (userId: string) => {
    return await fetchAPI(`/attendance/qr/generate/${userId}`, {
      method: 'POST',
    });
  },
  
  verifyQR: async (qrData: any) => {
    return await fetchAPI('/attendance/qr/verify', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  },
};

const blogService = {
  getAll: async () => {
    return await fetchAPI('/blog');
  },
  
  getAllAdmin: async () => {
    return await fetchAPI('/blog/all');
  },
  
  getById: async (id: string) => {
    return await fetchAPI(`/blog/${id}`);
  },
  
  getBySlug: async (slug: string) => {
    return await fetchAPI(`/blog/slug/${slug}`);
  },
  
  getByTag: async (tag: string) => {
    return await fetchAPI(`/blog/tag/${tag}`);
  },
  
  getTags: async () => {
    return await fetchAPI('/blog/tags');
  },
  
  create: async (postData: any) => {
    return await fetchAPI('/blog', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },
  
  update: async (id: string, postData: any) => {
    return await fetchAPI(`/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(postData),
    });
  },
  
  delete: async (id: string) => {
    return await fetchAPI(`/blog/${id}`, {
      method: 'DELETE',
    });
  },
  
  publish: async (id: string) => {
    return await fetchAPI(`/blog/${id}/publish`, {
      method: 'POST',
    });
  },
  
  unpublish: async (id: string) => {
    return await fetchAPI(`/blog/${id}/unpublish`, {
      method: 'POST',
    });
  },
};

const productsService = {
  getAll: async () => {
    return await fetchAPI('/products');
  },
  
  getAllAdmin: async () => {
    return await fetchAPI('/products/all');
  },
  
  getById: async (id: string) => {
    return await fetchAPI(`/products/${id}`);
  },
  
  getBySlug: async (slug: string) => {
    return await fetchAPI(`/products/slug/${slug}`);
  },
  
  getByCategory: async (category: string) => {
    return await fetchAPI(`/products/category/${category}`);
  },
  
  getCategories: async () => {
    return await fetchAPI('/products/categories');
  },
  
  create: async (productData: any) => {
    return await fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
  
  update: async (id: string, productData: any) => {
    return await fetchAPI(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  },
  
  delete: async (id: string) => {
    return await fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    });
  },
  
  toggleAvailability: async (id: string) => {
    return await fetchAPI(`/products/${id}/toggle-availability`, {
      method: 'POST',
    });
  },
};

export {
  fetchAPI,
  authService,
  membershipsService,
  attendanceService,
  blogService,
  productsService,
};
