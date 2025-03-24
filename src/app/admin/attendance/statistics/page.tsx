'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipo para las estadísticas de asistencia
interface AttendanceStats {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  averagePerDay: number;
  peakHour: string;
  peakDay: string;
  membershipBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
  dailyData: {
    date: string;
    count: number;
  }[];
  hourlyData: {
    hour: string;
    count: number;
  }[];
}

const AttendanceStatisticsPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');

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

  // Cargar estadísticas de asistencia
  useEffect(() => {
    if (user && isAdmin) {
      fetchAttendanceStats();
    }
  }, [user, isAdmin, dateRange]);

  // Función para obtener estadísticas de asistencia (simuladas por ahora)
  const fetchAttendanceStats = async () => {
    setIsLoading(true);
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/statistics?range=${dateRange}`);
      // const data = await response.json();
      
      // Simulamos datos para la demostración
      const today = new Date();
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
      const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
      
      // Generar datos diarios para la semana actual
      const daysInWeek = eachDayOfInterval({
        start: startOfCurrentWeek,
        end: endOfCurrentWeek
      });
      
      const dailyData = daysInWeek.map(day => ({
        date: format(day, 'EEEE', { locale: es }),
        count: Math.floor(Math.random() * 30) + 10 // Entre 10 y 40 asistencias
      }));
      
      // Generar datos por hora
      const hourlyData = Array.from({ length: 14 }, (_, i) => ({
        hour: `${i + 8}:00`, // Desde las 8:00 hasta las 22:00
        count: Math.floor(Math.random() * 15) + 1 // Entre 1 y 15 asistencias
      }));
      
      // Calcular hora pico
      const peakHourData = [...hourlyData].sort((a, b) => b.count - a.count)[0];
      
      // Calcular día pico
      const peakDayData = [...dailyData].sort((a, b) => b.count - a.count)[0];
      
      // Datos de membresías
      const membershipBreakdown = [
        {
          type: 'Mensual completo',
          count: 65,
          percentage: 65
        },
        {
          type: 'Kickboxing (2 días)',
          count: 20,
          percentage: 20
        },
        {
          type: 'Kickboxing (3 días)',
          count: 15,
          percentage: 15
        }
      ];
      
      const mockStats: AttendanceStats = {
        totalToday: Math.floor(Math.random() * 30) + 20, // Entre 20 y 50 asistencias
        totalWeek: dailyData.reduce((sum, day) => sum + day.count, 0),
        totalMonth: dailyData.reduce((sum, day) => sum + day.count, 0) * 4, // Aproximado
        averagePerDay: Math.round(dailyData.reduce((sum, day) => sum + day.count, 0) / 7),
        peakHour: peakHourData.hour,
        peakDay: peakDayData.date,
        membershipBreakdown,
        dailyData,
        hourlyData
      };
      
      // Simular un retraso en la carga
      setTimeout(() => {
        setStats(mockStats);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error al cargar las estadísticas de asistencia:', error);
      setStats(null);
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin || !stats) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Estadísticas de Asistencia</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded ${
              dateRange === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded ${
              dateRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Este mes
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500">Asistencias hoy</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalToday}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500">Asistencias esta semana</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalWeek}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500">Promedio diario</h3>
          <p className="text-3xl font-bold mt-2">{stats.averagePerDay}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500">Hora pico</h3>
          <p className="text-3xl font-bold mt-2">{stats.peakHour}</p>
          <p className="text-sm text-gray-500 mt-1">Día más concurrido: {stats.peakDay}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de asistencia diaria */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Asistencia por día</h3>
          <div className="h-64">
            <div className="flex h-full items-end space-x-2">
              {stats.dailyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ 
                      height: `${(day.count / Math.max(...stats.dailyData.map(d => d.count))) * 100}%`,
                      minHeight: '10%'
                    }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-600 capitalize">{day.date.substring(0, 3)}</div>
                  <div className="text-sm font-medium">{day.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de asistencia por hora */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Asistencia por hora</h3>
          <div className="h-64">
            <div className="flex h-full items-end space-x-1">
              {stats.hourlyData.map((hour, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${(hour.count / Math.max(...stats.hourlyData.map(h => h.count))) * 100}%`,
                      minHeight: '10%'
                    }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-600 rotate-45 origin-top-left">{hour.hour}</div>
                  <div className="text-sm font-medium mt-6">{hour.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de membresías */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Distribución por tipo de membresía</h3>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-2/3">
            <div className="h-8 w-full flex rounded-full overflow-hidden">
              {stats.membershipBreakdown.map((membership, index) => (
                <div 
                  key={index}
                  className={`h-full ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-pink-500'
                  }`}
                  style={{ width: `${membership.percentage}%` }}
                ></div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 mt-4 md:mt-0 md:pl-8">
            <div className="space-y-2">
              {stats.membershipBreakdown.map((membership, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`w-4 h-4 rounded-full mr-2 ${
                      index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-pink-500'
                    }`}
                  ></div>
                  <span className="text-sm">{membership.type}</span>
                  <span className="ml-auto text-sm font-medium">{membership.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button 
          onClick={() => router.push('/admin/attendance')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Volver a Asistencias
        </button>
        
        <button 
          onClick={() => {
            // En un entorno real, aquí se exportarían los datos
            alert('Funcionalidad de exportación en desarrollo');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Exportar estadísticas
        </button>
      </div>
    </div>
  );
};

export default AttendanceStatisticsPage;
