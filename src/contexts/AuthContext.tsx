'use client'; // Importante para componentes del lado del cliente en Next.js

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (userData: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  signOut: async () => {},
  updateUserData: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Verificando usuario actual...');
      // En Next.js, es mejor usar cookies seguras en lugar de localStorage
      // pero por ahora mantendremos la compatibilidad con localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.log('No hay token de autenticación');
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Obtener información del usuario usando el token
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Error al obtener perfil de usuario');
          }
          
          const userData = await response.json();
          console.log('Datos del usuario obtenidos:', userData);
          
          if (userData && userData.user) {
            const userProfile: UserProfile = {
              id: userData.user.id,
              email: userData.user.email,
              full_name: userData.user.first_name && userData.user.last_name 
                ? `${userData.user.first_name} ${userData.user.last_name}` 
                : undefined,
              phone: userData.user.phone || '',
              is_admin: userData.user.is_admin || false,
              membership_status: null,
              membership_type: null,
              membership_expiry: null,
              membership_start: null,
              membership_end: null,
              emergency_contact: null,
              birth_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setUser(userProfile);
            setIsAdmin(userData.user.is_admin || false);
            setIsAuthenticated(true);
          } else {
            // Si no se pudo obtener el perfil, limpiar el estado
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error verificando usuario:', error);
          // Si hay un error (como token expirado), limpiar el estado
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error general verificando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();

      if (data && data.token) {
        // Guardar el token en localStorage
        localStorage.setItem('authToken', data.token.access_token);
        
        // Guardar información del usuario en localStorage para uso inmediato
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        toast.success('¡Inicio de sesión exitoso!');
        
        // Actualizar el estado
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.first_name && data.user.last_name 
            ? `${data.user.first_name} ${data.user.last_name}` 
            : undefined,
          phone: data.user.phone || '',
          is_admin: data.user.is_admin || false,
          membership_status: null,
          membership_type: null,
          membership_expiry: null,
          membership_start: null,
          membership_end: null,
          emergency_contact: null,
          birth_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setIsAdmin(data.user.is_admin || false);
        setIsAuthenticated(true);
        
        // Usar window.location.href en lugar de router.push para forzar una recarga completa
        // Esto asegura que el contexto de autenticación se actualice correctamente
        window.location.href = data.user.is_admin ? '/admin' : '/dashboard';
      } else {
        throw new Error('No se recibió token de autenticación');
      }
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
      // Eliminar token del localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Limpiar estado
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      
      // Redirigir a la página de inicio
      router.push('/');
      
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para actualizar los datos del usuario
  const updateUserData = (userData: UserProfile) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, loading, login, signOut, updateUserData }}>
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
