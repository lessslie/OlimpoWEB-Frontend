'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import 'react-calendar/dist/Calendar.css';
import './styles.css';

// Tipo para los datos de asistencia
interface Attendance {
  id: string;
  userId: string;
  userName: string;
  checkInTime: string;
  membershipType?: string;
  membershipStatus?: string;
}

const AttendancePage = () => {
  const { user, isAdmin, loading, token } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [filteredData, setFilteredData] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [totalAttendance, setTotalAttendance] = useState(0);

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

  // Cargar datos de asistencia cuando cambia la fecha seleccionada
  useEffect(() => {
    if (user && isAdmin) {
      fetchAttendanceData(selectedDate);
    }
  }, [selectedDate, user, isAdmin]);

  // Filtrar datos de asistencia cuando cambian los filtros
  useEffect(() => {
    filterAttendanceData();
  }, [attendanceData, searchTerm, membershipFilter]);

  // Función para obtener datos de asistencia
  const fetchAttendanceData = async (date: Date) => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const response = await fetch(`${baseUrl}/attendance/date/${formattedDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos de asistencia');
      }
      
      const data = await response.json();
      setAttendanceData(data);
      setTotalAttendance(data.length);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar los datos de asistencia:', error);
      setAttendanceData([]);
      setTotalAttendance(0);
      setIsLoading(false);
    }
  };

  // Función para filtrar los datos de asistencia
  const filterAttendanceData = () => {
    let filtered = [...attendanceData];
    
    // Filtrar por término de búsqueda (nombre de usuario)
    if (searchTerm) {
      filtered = filtered.filter(attendance => 
        attendance.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tipo de membresía
    if (membershipFilter !== 'all') {
      filtered = filtered.filter(attendance => 
        attendance.membershipType?.toLowerCase().includes(membershipFilter.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  // Formatear la hora para mostrar
  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, 'HH:mm', { locale: es });
  };

  // Obtener el color de estado de la membresía
  const getMembershipStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'por vencer':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <h1 className="text-3xl font-bold mb-6">Control de Asistencias</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendario (lado izquierdo) */}
        <div className="md:w-1/3">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Calendario</h2>
            <div className="calendar-container">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
                    setSelectedDate(value[0]);
                  }
                }}
                value={selectedDate}
                locale="es"
                className="w-full border-0"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-medium">
                Fecha seleccionada: {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Lista de asistencias (lado derecho) */}
        <div className="md:w-2/3">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold">
                Asistencias del día {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
              </h2>
              <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                Total: {totalAttendance} {totalAttendance === 1 ? 'asistencia' : 'asistencias'}
              </div>
            </div>
            
            {/* Filtros */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nombre
                </label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nombre del usuario"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="membershipFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por membresía
                </label>
                <select
                  id="membershipFilter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={membershipFilter}
                  onChange={(e) => setMembershipFilter(e.target.value)}
                >
                  <option value="all">Todas las membresías</option>
                  <option value="mensual">Mensual completo</option>
                  <option value="kickboxing">Kickboxing</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Usuario</th>
                      <th className="py-3 px-6 text-left">Membresía</th>
                      <th className="py-3 px-6 text-center">Estado</th>
                      <th className="py-3 px-6 text-center">Hora de Entrada</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {filteredData.map((attendance) => (
                      <tr key={attendance.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left">
                          <div className="font-medium">{attendance.userName}</div>
                          <div className="text-xs text-gray-500">ID: {attendance.userId}</div>
                        </td>
                        <td className="py-3 px-6 text-left">
                          {attendance.membershipType || 'No disponible'}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${getMembershipStatusColor(attendance.membershipStatus)}`}>
                            {attendance.membershipStatus || 'No disponible'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          {formatTime(attendance.checkInTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                {searchTerm || membershipFilter !== 'all' 
                  ? 'No hay resultados que coincidan con los filtros aplicados.' 
                  : 'No hay registros de asistencia para esta fecha.'}
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => router.push('/admin')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Volver al Panel
              </button>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => router.push('/admin/attendance/qr-scanner')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Escanear QR
                </button>
                
                <button 
                  onClick={() => router.push('/admin/attendance/gym-qr')}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  QR del Gimnasio
                </button>
                
                <button 
                  onClick={() => {
                    // En un entorno real, aquí se exportarían los datos
                    alert('Funcionalidad de exportación en desarrollo');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Exportar datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
