'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api.service';
import axios from 'axios';

// Definimos el tipo de perfil de usuario
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone: string;
  is_admin: boolean;
  membership_status: string | null;
  membership_type: string | null;
  membership_expiry: string | null;
  membership_start: string | null;
  membership_end: string | null;
  emergency_contact: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
  has_routine?: boolean;
  routine?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (userData: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  loading: true,
  token: null,
  login: async () => {},
  signOut: async () => {},
  updateUserData: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Verificando usuario actual...');
      
      // Verificar si hay un token en localStorage
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        
        if (!storedToken) {
          console.log('No hay token de autenticación');
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        setToken(storedToken);
        
        // Obtener datos del usuario actual desde el backend
        try {
          const response = await apiService.get('auth/me');
          
          if (response.data) {
            console.log('Datos del usuario obtenidos desde el backend:', response.data);
            setUser(response.data);
            setIsAdmin(response.data.is_admin || false);
            setIsAuthenticated(true);
          } else {
            console.log('No se pudieron obtener los datos del usuario desde el backend');
            // Si no se pueden obtener datos, limpiar el token
            localStorage.removeItem('token');
            setUser(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
            setToken(null);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          // Si hay un error al obtener datos, limpiar el token
          localStorage.removeItem('token');
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Error verificando usuario:', error);
      // Si hay un error general, limpiar el estado
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Iniciar sesión usando el backend
      const backendUrl = 'https://olimpoweb-backend.onrender.com/api/auth/login';
      console.log('Intentando login en URL completa:', backendUrl);
      console.log('URL base de la API en AuthContext:', process.env.NEXT_PUBLIC_API_URL);
    console.log('URL completa para login:', `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
    
      
      // Usar axios directamente con la URL completa
      const response = await axios.post(backendUrl, { email, password });
      
      if (!response.data || !response.data.token) {
        throw new Error('No se recibió un token válido');
      }
      
      const { token: authToken, user: userData } = response.data;
      
      // Guardar el token en localStorage
      localStorage.setItem('token', authToken);
      setToken(authToken);
      
      // Actualizar el estado con los datos del usuario
      setUser(userData);
      setIsAdmin(userData.is_admin || false);
      setIsAuthenticated(true);
      
      toast.success('¡Inicio de sesión exitoso!');
      
      // Redirigir según el tipo de usuario
      const redirectPath = userData.is_admin ? '/admin' : '/dashboard';
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error('Credenciales de inicio de sesión inválidas');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Cerrando sesión...');
      
      // Opcional: si tu backend tiene un endpoint de logout, puedes llamarlo aquí
      // await apiService.post('/auth/logout');
      
      // Eliminar token del localStorage
      localStorage.removeItem('token');
      
      // Limpiar estado
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      setToken(null);
      
      // Redirigir a la página de inicio
      router.push('/');
      
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para actualizar los datos del usuario
  const updateUserData = async (userData: UserProfile) => {
    try {
      // Aquí podrías hacer una llamada al backend para actualizar los datos del usuario
      // const response = await apiService.put(`/users/${userData.id}`, userData);
      
      // Actualizar el estado local con los nuevos datos
      setUser(userData);
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      toast.error('No se pudieron actualizar los datos del usuario');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, loading, token, login, signOut, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};