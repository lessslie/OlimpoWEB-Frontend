'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';

// Interfaces para los datos de estadísticas
interface MembershipStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  byType: Record<string, number>;
  revenueCurrentMonth: number;
}

interface AttendanceStats {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  averagePerDay: number;
  peakHours: { hour: number; count: number }[];
}

interface BlogStats {
  totalPosts: number;
  totalViews: number;
  mostViewedPosts: { id: string; title: string; views: number }[];
}

interface DashboardStats {
  memberships: MembershipStats;
  attendance: AttendanceStats;
  blog: BlogStats;
  newUsers: { count: number; percentChange: number };
}

const AdminDashboardPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchDashboardData();
      }
    }
  }, [user, isAdmin, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      // Obtener estadísticas generales
      const statsResponse = await apiService.get('/dashboard/stats');
      setStats(statsResponse.data);

      // Obtener datos para gráficos
      const [revenueResponse, attendanceResponse] = await Promise.all([
        apiService.get('/dashboard/revenue'),
        apiService.get('/dashboard/attendance/daily')
      ]);

      setRevenueData(revenueResponse.data);
      setAttendanceData(attendanceResponse.data);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('No se pudieron cargar los datos del dashboard');
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={() => router.push('/admin')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Panel
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta de Membresías */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Membresías</h2>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-blue-600">{stats.memberships.total}</div>
              <div className="bg-blue-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-green-100 p-2 rounded">
                <span className="block text-green-800 font-semibold">Activas</span>
                <span className="text-xl font-bold">{stats.memberships.active}</span>
              </div>
              <div className="bg-red-100 p-2 rounded">
                <span className="block text-red-800 font-semibold">Expiradas</span>
                <span className="text-xl font-bold">{stats.memberships.expired}</span>
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <span className="block text-yellow-800 font-semibold">Pendientes</span>
                <span className="text-xl font-bold">{stats.memberships.pending}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Ingresos */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Ingresos del Mes</h2>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-green-600">
                ${stats.memberships.revenueCurrentMonth.toLocaleString('es-AR')}
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/admin/memberships')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Ver Detalles
              </button>
            </div>
          </div>

          {/* Tarjeta de Asistencias */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Asistencias</h2>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-purple-600">{stats.attendance.totalToday}</div>
              <div className="bg-purple-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-purple-100 p-2 rounded">
                <span className="block text-purple-800 font-semibold">Esta semana</span>
                <span className="text-xl font-bold">{stats.attendance.totalWeek}</span>
              </div>
              <div className="bg-purple-100 p-2 rounded">
                <span className="block text-purple-800 font-semibold">Este mes</span>
                <span className="text-xl font-bold">{stats.attendance.totalMonth}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Nuevos Usuarios */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Nuevos Usuarios</h2>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-orange-600">{stats.newUsers.count}</div>
              <div className="bg-orange-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-sm font-semibold ${stats.newUsers.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.newUsers.percentChange >= 0 ? '+' : ''}{stats.newUsers.percentChange.toFixed(1)}% vs. mes anterior
              </div>
              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full mt-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Ver Usuarios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Membresías por Tipo */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Membresías por Tipo</h2>
            <div className="space-y-4">
              {Object.entries(stats.memberships.byType).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div className="w-32 font-medium">{type}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${(count / stats.memberships.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right font-medium">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Horas Pico de Asistencia</h2>
            <div className="space-y-4">
              {stats.attendance.peakHours.map(({ hour, count }) => (
                <div key={hour} className="flex items-center">
                  <div className="w-32 font-medium">{hour}:00 hs</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-purple-600 h-4 rounded-full" 
                      style={{ width: `${(count / Math.max(...stats.attendance.peakHours.map(h => h.count))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right font-medium">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/admin/memberships/create')}
            className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Membresía
          </button>
          <button 
            onClick={() => router.push('/admin/users/create')}
            className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Nuevo Usuario
          </button>
          <button 
            onClick={() => router.push('/admin/blog/create')}
            className="bg-yellow-600 text-white px-4 py-3 rounded hover:bg-yellow-700 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Nuevo Artículo
          </button>
        </div>
      </div>

      {/* Posts Más Vistos */}
      {stats && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Artículos Más Vistos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vistas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.blog.mostViewedPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => router.push(`/blog/${post.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
