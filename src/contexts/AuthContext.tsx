"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

// Definimos el tipo de perfil de usuario
interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
  full_name?: string;
  membership_status?: string | null;
  membership_type?: string | null;
  membership_expiry?: string | null;
  membership_start?: string | null;
  membership_end?: string | null;
  emergency_contact?: string | null;
  birth_date?: string | null;
  created_at?: string;
  updated_at?: string;
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

// URL base de la API
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://olimpoweb-backend.onrender.com/api";
console.log("URL de la API en AuthContext:", API_URL);

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
      console.log("Verificando usuario actual...");

      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          console.log("No hay token de autenticación");
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setToken(storedToken);

        try {
          // Hacer petición al endpoint me
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.data && response.data.user) {
            console.log("Datos del usuario obtenidos:", response.data.user);

            // Actualizar el estado con los datos del usuario
            const userData = response.data.user;
            setUser({
              ...userData,
              full_name: `${userData.first_name} ${userData.last_name}`,
            });
            setIsAdmin(userData.is_admin || false);
            setIsAuthenticated(true);
          } else {
            console.log(
              "Respuesta de /auth/me no contiene datos de usuario:",
              response.data
            );
            localStorage.removeItem("token");
            setUser(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
            setToken(null);
          }
        } catch (error) {
          console.error("Error al verificar sesión:", error);

          // Solo cerrar sesión si es un error de autenticación
          if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
            console.log("Error de autenticación, cerrando sesión...");
            localStorage.removeItem("token");
            setUser(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
            setToken(null);
            console.log("Sesión cerrada");
          }
        }
      }
    } catch (error) {
      console.error("Error general verificando usuario:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
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
      console.log("Intentando iniciar sesión con:", email);

      // Hacer petición al endpoint login
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("Respuesta del login:", response.data);

      if (
        !response.data ||
        !response.data.token ||
        !response.data.token.access_token
      ) {
        throw new Error("No se recibió un token válido");
      }
      console.log("Token de acceso:", response.data.token.access_token);

      // Estructura según el backend: { message, user, token: { access_token } }
      const {
        token: { access_token },
        user: userData,
      } = response.data;

      // Guardar el token en localStorage (sin el prefijo Bearer)
      localStorage.setItem("token", access_token);
      setToken(access_token);

      // Actualizar el estado con los datos del usuario
      const userProfile = {
        ...userData,
        full_name: `${userData.first_name} ${userData.last_name}`,
      };
      setUser(userProfile);
      setIsAdmin(userData.is_admin || false);
      setIsAuthenticated(true);

      toast.success("¡Inicio de sesión exitoso!");

      // Redirigir según el tipo de usuario
      const redirectPath = userData.is_admin ? "/admin" : "/dashboard";
      router.push(redirectPath);
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast.error("Credenciales de inicio de sesión inválidas");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Cerrando sesión...");

      // Eliminar token del localStorage
      localStorage.removeItem("token");

      // Limpiar estado
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      setToken(null);

      // Redirigir a la página de inicio
      router.push("/");

      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para actualizar los datos del usuario
  const updateUserData = (userData: UserProfile) => {
    setUser(userData);
    setIsAdmin(userData.is_admin || false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated,
        loading,
        token,
        login,
        signOut,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
