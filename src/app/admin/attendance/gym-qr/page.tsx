'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

const GymQRPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [qrValue, setQrValue] = useState<string>('');
  const [gymName, setGymName] = useState('Gimnasio Olimpo');
  const [gymId, setGymId] = useState('1');
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        generateGymQR();
      }
    }
  }, [user, isAdmin, loading, router]);

  // Función para generar el QR único del gimnasio
  const generateGymQR = () => {
    try {
      // Crear los datos para el código QR
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const qrData = {
        type: 'gym_attendance',
        gym_id: gymId,
        timestamp: new Date().toISOString().split('T')[0] // Solo la fecha, sin hora
      };
      
      // Convertir a JSON y codificar para URL
      const qrDataString = JSON.stringify(qrData);
      const encodedData = encodeURIComponent(qrDataString);
      
      // Crear URL para la API de asistencia
      const attendanceUrl = `${baseUrl}/attendance/gym-qr?data=${encodedData}`;
      
      setQrValue(attendanceUrl);
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      toast.error('Error al generar el código QR');
    }
  };

  // Función para imprimir el QR
  const printQR = () => {
    window.print();
    setShowPrintDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Código QR del Gimnasio</h1>
        <button 
          onClick={() => router.push('/admin/attendance')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Asistencias
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Code */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">QR de Asistencia Único</h2>
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6 print-section">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{gymName}</h3>
                <p className="text-sm text-gray-500">Escanea para registrar tu asistencia</p>
              </div>
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={300}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                  includeMargin={true}
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Error al generar QR</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4 w-full">
              <button
                onClick={() => setShowPrintDialog(true)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir QR
              </button>
              <button
                onClick={generateGymQR}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerar QR
              </button>
            </div>
          </div>
        </div>
        
        {/* Instrucciones */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
              <p>Este es el código QR único del gimnasio. Imprímelo y colócalo en la entrada para que los usuarios lo escaneen al ingresar.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Recomendaciones</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Imprime el código en un tamaño grande para facilitar el escaneo</li>
                <li>Colócalo en un lugar visible y bien iluminado</li>
                <li>Protégelo con un marco o laminado para evitar daños</li>
                <li>Regenera el código periódicamente por seguridad</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Proceso de asistencia</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>El usuario escanea este QR con la app del gimnasio</li>
                <li>El sistema registra la asistencia automáticamente</li>
                <li>Se muestra una notificación con información de su membresía</li>
                <li>El personal puede verificar la asistencia en el panel de administración</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de impresión */}
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Opciones de impresión</h3>
            <p className="mb-4">Selecciona el tamaño de impresión recomendado:</p>
            
            <div className="space-y-2 mb-6">
              <label className="flex items-center space-x-2">
                <input type="radio" name="size" defaultChecked />
                <span>Tamaño grande (A4)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="size" />
                <span>Tamaño mediano (10x10 cm)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="size" />
                <span>Tamaño pequeño (5x5 cm)</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPrintDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={printQR}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GymQRPage;
