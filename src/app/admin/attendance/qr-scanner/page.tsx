'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import AttendanceNotification from '@/components/AttendanceNotification';
import { attendanceService, Membership } from '@/services/attendance.service';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Importar el escáner QR dinámicamente para evitar problemas de SSR
const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false });

const QRScannerPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [processingAttendance, setProcessingAttendance] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, loading, router]);

  // Procesar el resultado del escaneo
  useEffect(() => {
    if (scanResult && !processingAttendance) {
      processAttendance(scanResult);
    }
  }, [scanResult]);

  // Función para procesar la asistencia
  const processAttendance = async (qrData: string) => {
    try {
      setProcessingAttendance(true);
      
      // En un entorno real, esto sería una llamada a la API
      // const response = await attendanceService.checkIn(qrData);
      
      // Simulamos la respuesta para la demostración
      const mockMembership: Membership = {
        id: '123',
        type: 'KICKBOXING_2', // Cambia a 'MONTHLY', 'KICKBOXING_2' o 'KICKBOXING_3' para probar diferentes mensajes
        start_date: '2023-03-01T00:00:00Z',
        end_date: '2023-04-01T00:00:00Z', // Ajusta esta fecha para probar diferentes escenarios
        status: 'active',
        price: 5000,
        days_per_week: 2,
        current_week_attendances: 1 // Cambia este valor para probar diferentes escenarios
      };
      
      // Simular retraso en la respuesta
      setTimeout(() => {
        setActiveMembership(mockMembership);
        setShowNotification(true);
        setScanning(false);
        setScanResult(null);
        setProcessingAttendance(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error al procesar asistencia:', error);
      toast.error('Error al procesar la asistencia');
      setProcessingAttendance(false);
      setScanning(false);
    }
  };

  // Manejar el escaneo exitoso
  const handleScan = (data: { text: string } | null) => {
    if (data?.text && !scanResult && !processingAttendance) {
      setScanResult(data.text);
      setScanning(false);
    }
  };

  // Manejar errores del escáner
  const handleError = (err: Error) => {
    console.error('Error de escaneo:', err);
    setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
    setScanning(false);
  };

  // Iniciar el escaneo
  const startScanning = () => {
    setScanning(true);
    setCameraError(null);
    setScanResult(null);
  };

  // Cerrar la notificación
  const closeNotification = () => {
    setShowNotification(false);
    setActiveMembership(null);
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
        <h1 className="text-3xl font-bold">Escanear QR de Asistencia</h1>
        <button 
          onClick={() => router.push('/admin/attendance')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Asistencias
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Escáner QR */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Escanear código QR</h2>
          
          {scanning ? (
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg">
                <QrScanner
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                  constraints={{
                    video: { facingMode: 'environment' }
                  }}
                />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
              </div>
              <button 
                onClick={() => setScanning(false)}
                className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Cancelar escaneo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {processingAttendance ? (
                <div className="py-12 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Procesando asistencia...</p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 rounded-lg p-8 mb-6 w-full max-w-sm">
                    <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center p-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Haz clic en "Iniciar escaneo" para activar la cámara</p>
                      </div>
                    </div>
                  </div>
                  
                  {cameraError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {cameraError}
                    </div>
                  )}
                  
                  <button 
                    onClick={startScanning}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Iniciar escaneo
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Instrucciones */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
              <p>Escanea el código QR del usuario para registrar su asistencia al gimnasio. El sistema verificará automáticamente el tipo de membresía y mostrará la información relevante.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Tipos de notificaciones</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="font-medium">Membresía mensual:</span> Confirmación de ingreso y aviso si vence al día siguiente.</li>
                <li><span className="font-medium">Kickboxing 2 veces/semana:</span> Muestra cuántas entradas quedan en la semana.</li>
                <li><span className="font-medium">Kickboxing 3 veces/semana:</span> Muestra cuántas entradas quedan en la semana.</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Recomendaciones</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Asegúrate de que el código QR esté bien iluminado</li>
                <li>Mantén la cámara estable durante el escaneo</li>
                <li>Verifica que la membresía del usuario esté activa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notificación de asistencia */}
      {activeMembership && (
        <AttendanceNotification
          membership={activeMembership}
          showModal={showNotification}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default QRScannerPage;
