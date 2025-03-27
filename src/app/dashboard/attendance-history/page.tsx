'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Value } from 'react-calendar/dist/cjs/shared/types';

interface Attendance {
  id: string;
  check_in_time: string;
  user_id: string;
}

const AttendanceHistoryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attendanceDates, setAttendanceDates] = useState<Date[]>([]);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Cargar el historial de asistencias del usuario
  useEffect(() => {
    if (user) {
      fetchAttendanceHistory();
    }
  }, [user]);

  // Función para obtener el historial de asistencias
  const fetchAttendanceHistory = async () => {
    setIsLoading(true);
    try {
      // Hacer la solicitud a la API
      if (!user || !user.id) {
        console.error('No hay usuario autenticado');
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const response = await fetch(`${baseUrl}/attendance/user/${user.id}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener el historial de asistencias');
      }
      
      const data = await response.json();
      setAttendanceRecords(data);
      
      // Extraer las fechas de asistencia para marcarlas en el calendario
      const dates = data.map((record: Attendance) => new Date(record.check_in_time));
      setAttendanceDates(dates);
    } catch (error) {
      console.error('Error al obtener el historial de asistencias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar asistencias por fecha seleccionada
  const getAttendancesForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.check_in_time);
      return (
        recordDate.getDate() === selectedDate.getDate() &&
        recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  // Verificar si una fecha tiene registros de asistencia
  const hasAttendanceOnDate = (date: Date) => {
    return attendanceDates.some(attendanceDate => 
      attendanceDate.getDate() === date.getDate() &&
      attendanceDate.getMonth() === date.getMonth() &&
      attendanceDate.getFullYear() === date.getFullYear()
    );
  };

  // Formatear fecha y hora para mostrar
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
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

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi historial de asistencias</h1>
          <p className="mt-2 text-sm text-gray-500">
            Revisa tu historial de asistencias al gimnasio
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Calendario de asistencias</h2>
              <div className="calendar-container">
                <Calendar
                  onChange={(value: Value) => {
                    if (value instanceof Date) {
                      setSelectedDate(value);
                    }
                  }}
                  value={selectedDate}
                  tileClassName={({ date }) => {
                    return hasAttendanceOnDate(date) ? 'attendance-date' : null;
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                Los días marcados indican asistencia registrada
              </p>
            </div>

            {/* Lista de asistencias */}
            <div className="p-6 col-span-1 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Asistencias para {selectedDate.toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              
              <div className="overflow-hidden">
                {getAttendancesForSelectedDate().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hora de entrada
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getAttendancesForSelectedDate().map((attendance) => {
                          const { date, time } = formatDateTime(attendance.check_in_time);
                          return (
                            <tr key={attendance.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {time}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No hay asistencias registradas para esta fecha</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón para volver al dashboard */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al dashboard
          </button>
        </div>
      </div>

      {/* Estilos personalizados para el calendario */}
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: none;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .react-calendar__tile--active {
          background: #4F46E5 !important;
          color: white;
        }
        
        .attendance-date {
          background-color: rgba(59, 130, 246, 0.1);
          position: relative;
        }
        
        .attendance-date::after {
          content: '';
          position: absolute;
          bottom: 0.25rem;
          left: 50%;
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          background-color: #3B82F6;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default AttendanceHistoryPage;
