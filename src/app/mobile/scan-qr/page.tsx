'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';

const ScanQRPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [qrValue, setQrValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | { success: boolean; message: string }>(null);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Simular el escaneo de un código QR
  const handleScanQR = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para registrar tu asistencia');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // Simular un retraso en el escaneo
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Este sería el valor del QR escaneado (ejemplo)
      const exampleQrValue = `http://localhost:3005/api/attendance/check-in?data=${encodeURIComponent(
        JSON.stringify({
          type: 'gym_attendance',
          gym_id: '1',
          user_id: 'USER_ID_PLACEHOLDER',
          timestamp: new Date().toISOString()
        })
      )}`;

      // Reemplazar el placeholder con el ID del usuario actual
      const qrValueWithUserId = exampleQrValue.replace('USER_ID_PLACEHOLDER', user.id);
      setQrValue(qrValueWithUserId);

      // En una aplicación real, aquí se haría una solicitud a la API
      // Simular una respuesta exitosa
      const apiResponse = {
        success: true,
        message: 'Asistencia registrada correctamente',
        attendance: {
          id: Math.random().toString(36).substring(2, 15),
          user_id: user.id,
          check_in_time: new Date().toISOString()
        }
      };

      setScanResult(apiResponse);
      toast.success('¡Asistencia registrada correctamente!');
    } catch (error) {
      console.error('Error al escanear el código QR:', error);
      setScanResult({
        success: false,
        message: 'Error al registrar la asistencia. Inténtalo de nuevo.'
      });
      toast.error('Error al registrar la asistencia');
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <h1 className="text-3xl font-bold mb-6 text-center">Escanear QR de Asistencia</h1>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Escanea el código QR en la entrada del gimnasio para registrar tu asistencia.
            </p>
            
            {/* Simulación de la cámara */}
            <div className="relative w-full h-64 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 border-2 border-blue-500 animate-scan"></div>
                </div>
              ) : scanResult ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  {scanResult.success ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-600 font-medium text-lg">{scanResult.message}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {new Date().toLocaleTimeString()} - {new Date().toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-red-600 font-medium text-lg">{scanResult.message}</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="absolute bottom-4 text-gray-500 text-sm">Cámara lista para escanear</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleScanQR}
              disabled={isScanning}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isScanning ? 'Escaneando...' : scanResult ? 'Escanear de nuevo' : 'Iniciar escaneo'}
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
              <li>Acércate al código QR ubicado en la entrada del gimnasio</li>
              <li>Presiona el botón "Iniciar escaneo"</li>
              <li>Apunta la cámara al código QR</li>
              <li>Espera a que se registre tu asistencia</li>
            </ol>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
      
      {/* Estilos para la animación de escaneo */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
          }
          25% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          }
          50% {
            clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
          }
          75% {
            clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%);
          }
          100% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScanQRPage;
