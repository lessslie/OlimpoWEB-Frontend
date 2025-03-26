'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function AsistenciaPage() {
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrData, setQrData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Procesar datos del QR al cargar la página
  useEffect(() => {
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      setError('No se encontraron datos válidos en el código QR');
      setLoading(false);
      return;
    }
    
    try {
      // Si los datos vienen como string codificado JSON
      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      setQrData(parsedData);
      
      // Verificar si el usuario ya está autenticado
      const token = localStorage.getItem('token');
      if (token) {
        checkAuthAndRegisterAttendance(token, parsedData);
      } else {
        // Si no hay token, mostrar formulario de login
        setLoading(false);
      }
    } catch (e) {
      console.error('Error al procesar datos del QR:', e);
      setError('El código QR no contiene datos válidos');
      setLoading(false);
    }
  }, [searchParams]);

  // Función para verificar autenticación y registrar asistencia
  const checkAuthAndRegisterAttendance = async (token: string, data: any) => {
    try {
      // Verificar token con el backend
      const userResponse = await apiService.get('auth/me');
      if (userResponse.success && userResponse.data.user) {
        setUserData(userResponse.data.user);
        registerAttendance(token, data, userResponse.data.user);
      } else {
        // Token inválido, limpiar y mostrar login
        localStorage.removeItem('token');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  // Función para registrar la asistencia
  const registerAttendance = async (token: string, data: any, user: any) => {
    try {
      setRegistering(true);
      
      // Llamar al endpoint de registro de asistencia
      const attendanceResponse = await apiService.post('attendance/register', {
        qrData: data,
        userId: user.id
      });
      
      if (attendanceResponse.success) {
        setSuccess(true);
        toast.success('¡Asistencia registrada exitosamente!');
      } else {
        setError(attendanceResponse.error || 'Error al registrar asistencia');
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      setError('No se pudo registrar la asistencia. Intente nuevamente.');
    } finally {
      setRegistering(false);
      setLoading(false);
    }
  };

  // Manejar inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    
    setLoading(true);
    
    try {
      const loginResponse = await apiService.login(email, password);
      
      if (loginResponse.success) {
        // Si el usuario eligió recordar sesión
        if (rememberMe) {
            localStorage.setItem('token', loginResponse.data.token);
          } else {
            sessionStorage.setItem('token', loginResponse.data.token);
          }
        
        // Registrar asistencia con el nuevo token
        registerAttendance(
          loginResponse.data.token.access_token, 
          qrData, 
          loginResponse.data.user
        );
        
        setUserData(loginResponse.data.user);
      } else {
        setError('Credenciales inválidas');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  // Renderizar pantalla de éxito
  if (success && userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Asistencia Registrada!</h2>
          
          <p className="text-lg text-gray-600 mb-2">
            Bienvenido/a, <span className="font-semibold">{userData.first_name} {userData.last_name}</span>
          </p>
          
          <p className="text-gray-500 mb-6">
            Tu asistencia ha sido registrada exitosamente.
            <br />
            {new Date().toLocaleString('es-ES')}
          </p>
          
          <div className="mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
              <p>¡Disfruta tu entrenamiento en Olimpo Gym!</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/dashboard" 
              className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-indigo-700 transition duration-200"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar formulario de login o pantalla de carga/error
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white text-center">
          <h1 className="text-2xl font-bold">Olimpo Gym</h1>
          <p className="text-indigo-100">Registro de Asistencia</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
                <p>{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white py-2 px-6 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-200"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
                <p className="text-gray-600 text-sm">
                  Para registrar tu asistencia, inicia sesión con tu cuenta de Olimpo Gym
                </p>
              </div>
              
              {registering ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600">Registrando asistencia...</p>
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Recordar mi sesión en este dispositivo
                      </span>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                  >
                    Iniciar sesión y registrar asistencia
                  </button>
                </form>
              )}
              
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
                    Regístrate
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}apiService.login