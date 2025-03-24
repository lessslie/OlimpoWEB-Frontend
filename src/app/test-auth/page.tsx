'use client';

import { useState } from 'react';
import { authService } from '@/services/api';
import BackgroundLogo from '@/components/BackgroundLogo';

const TestAuthPage = () => {
  const [output, setOutput] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const appendOutput = (text: string) => {
    setOutput(prev => prev + '\n' + text);
  };

  const clearOutput = () => {
    setOutput('');
  };

  const checkAuth = async () => {
    try {
      appendOutput('Verificando sesión actual...');
      
      // Verificar si hay token en localStorage
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token) {
        appendOutput('Token de autenticación encontrado en localStorage');
        
        if (userData) {
          appendOutput(`Datos de usuario encontrados en localStorage: ${userData}`);
        }
        
        try {
          const response = await authService.getProfile();
          if (response) {
            appendOutput(`Usuario autenticado: ${response.email} (${response.id})`);
            appendOutput(`Datos del usuario: ${JSON.stringify(response, null, 2)}`);
          } else {
            appendOutput('No se pudo obtener información del usuario');
          }
        } catch (error: any) {
          appendOutput(`Error al obtener perfil: ${error.message || String(error)}`);
          appendOutput('El token podría ser inválido o haber expirado');
          clearAuthData();
        }
      } else {
        appendOutput('No hay usuario autenticado');
      }
    } catch (e: any) {
      appendOutput(`Error: ${e.message || String(e)}`);
    }
  };

  const testLogin = async () => {
    try {
      appendOutput(`Intentando iniciar sesión con: ${email}`);
      
      const response = await authService.login(email, password);
      
      if (response && response.token) {
        appendOutput(`Inicio de sesión exitoso: ${response.user.email} (${response.user.id})`);
        appendOutput(`Token recibido: ${response.token.substring(0, 10)}...`);
        
        // Guardar el token en localStorage
        localStorage.setItem('authToken', response.token);
        
        // Guardar información del usuario en localStorage
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        appendOutput('Token y datos de usuario guardados en localStorage');
        appendOutput(`Datos del usuario: ${JSON.stringify(response.user, null, 2)}`);
      } else {
        appendOutput('Inicio de sesión fallido: no se recibió token');
      }
    } catch (e: any) {
      appendOutput(`Error: ${e.message || String(e)}`);
    }
  };

  const testSignOut = async () => {
    try {
      appendOutput('Cerrando sesión...');
      
      // Limpiar datos de autenticación
      clearAuthData();
      
      appendOutput('Sesión cerrada exitosamente');
    } catch (e: any) {
      appendOutput(`Error: ${e.message || String(e)}`);
    }
  };

  // Función para limpiar datos de autenticación
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Prueba de Autenticación JWT</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Verificar estado actual</h2>
            <button 
              onClick={checkAuth}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              Verificar autenticación
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Probar inicio de sesión</h2>
            <div className="flex flex-col space-y-2 mb-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              />
            </div>
            <button 
              onClick={testLogin}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cerrar sesión</h2>
            <button 
              onClick={testSignOut}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Resultado</h2>
              <button 
                onClick={clearOutput}
                className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Limpiar
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto h-64 whitespace-pre-wrap">
              {output || 'Ejecuta alguna acción para ver los resultados aquí...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage;
