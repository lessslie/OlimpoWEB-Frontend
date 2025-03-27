'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { attendanceService, Membership } from '@/services/attendance.service';

const QRDisplayPage = () => {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [weeklyAttendances, setWeeklyAttendances] = useState<number>(0);
  const [daysUntilExpiration, setDaysUntilExpiration] = useState<number>(0);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Generar el valor del código QR y cargar información de membresía
  useEffect(() => {
    if (user) {
      generateQRValue();
      fetchMembershipInfo();
    }
  }, [user]);

  // Función para obtener información de la membresía activa
  const fetchMembershipInfo = async () => {
    try {
      if (!user || !user.id) {
        throw new Error('Usuario no encontrado');
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const response = await fetch(`${baseUrl}/memberships/user/${user.id}/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener información de membresía');
      }
      
      const membershipData = await response.json();
      setActiveMembership(membershipData);
      
      // Calcular días hasta el vencimiento
      if (membershipData) {
        const days = attendanceService.getDaysUntilExpiration(membershipData);
        setDaysUntilExpiration(days);
        
        // Si es kickboxing, obtener asistencias semanales
        if (membershipData.type.includes('KICKBOXING')) {
          setWeeklyAttendances(membershipData.current_week_attendances || 0);
        }
      }
    } catch (error) {
      console.error('Error al obtener información de membresía:', error);
      toast.error('Error al cargar información de membresía');
    }
  };

  // Función para generar el valor del código QR
  const generateQRValue = () => {
    setIsLoading(true);
    try {
      // Crear los datos para el código QR
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const qrData = {
        type: 'gym_attendance',
        gym_id: '1', // ID único del gimnasio
        user_id: user?.id, // ID del usuario actual
        timestamp: new Date().toISOString() // Para verificar cuándo se generó el QR
      };
      
      // Convertir a JSON y codificar para URL
      const qrDataString = JSON.stringify(qrData);
      const encodedData = encodeURIComponent(qrDataString);
      
      // Crear URL para la API de asistencia
      const attendanceUrl = `${baseUrl}/attendance/check-in?data=${encodedData}`;
      
      setQrValue(attendanceUrl);
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      toast.error('Error al generar el código QR');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar el código QR
  const refreshQR = () => {
    generateQRValue();
    toast.success('Código QR actualizado');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Determinar el tipo de membresía para mostrar
  const getMembershipTypeDisplay = () => {
    if (!activeMembership) return 'No disponible';
    
    switch (activeMembership.type) {
      case 'MONTHLY': return 'Mensual';
      case 'QUARTERLY': return 'Trimestral';
      case 'BIANNUAL': return 'Semestral';
      case 'ANNUAL': return 'Anual';
      case 'KICKBOXING_2': return 'Kickboxing (2 veces/semana)';
      case 'KICKBOXING_3': return 'Kickboxing (3 veces/semana)';
      case 'CUSTOM': return 'Personalizada';
      case 'MULTISPORT': return 'Multideporte';
      default: return activeMembership.type;
    }
  };

  // Determinar si mostrar información de kickboxing
  const isKickboxing = activeMembership?.type.includes('KICKBOXING');
  const remainingAttendances = isKickboxing && activeMembership?.days_per_week 
    ? activeMembership.days_per_week - weeklyAttendances 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Mi código QR de asistencia
            </h1>
            
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200 mb-6">
                {qrValue ? (
                  <QRCodeSVG
                    value={qrValue}
                    size={250}
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
              
              {/* Información de membresía */}
              {activeMembership && (
                <div className="w-full mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-800 mb-2">Información de membresía</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{getMembershipTypeDisplay()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">{new Date(activeMembership.end_date).toLocaleDateString()}</span>
                    </p>
                    
                    {/* Información específica para Kickboxing */}
                    {isKickboxing && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <p className="flex justify-between">
                          <span className="text-gray-600">Asistencias esta semana:</span>
                          <span className="font-medium">{weeklyAttendances} de {activeMembership.days_per_week}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Asistencias restantes:</span>
                          <span className={`font-medium ${remainingAttendances === 0 ? 'text-red-600' : ''}`}>
                            {remainingAttendances}
                          </span>
                        </p>
                      </div>
                    )}
                    
                    {/* Alerta de vencimiento */}
                    {daysUntilExpiration <= 7 && (
                      <div className={`mt-2 p-2 rounded-md ${
                        daysUntilExpiration <= 1 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {daysUntilExpiration <= 1 
                          ? '¡Tu membresía vence hoy o mañana! Renuévala para seguir disfrutando del gimnasio.'
                          : `Tu membresía vence en ${daysUntilExpiration} días. Considera renovarla pronto.`
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-2">
                  Muestra este código QR al personal del gimnasio para registrar tu asistencia.
                </p>
                <p className="text-sm text-gray-500">
                  Generado el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex flex-col space-y-3 w-full">
                <button
                  onClick={refreshQR}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Actualizar código QR
                </button>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                >
                  Volver al dashboard
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
              <li>Muestra este código QR al personal del gimnasio</li>
              <li>Espera a que escaneen el código</li>
              <li>Tu asistencia quedará registrada automáticamente</li>
              <li>¡Disfruta tu entrenamiento!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDisplayPage;
