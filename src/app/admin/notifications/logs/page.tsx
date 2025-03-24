'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaces
interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  subject?: string;
  content: string;
  status: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  membershipId?: string;
  templateId?: string;
  userName?: string;
  templateName?: string;
}

// Estados de notificación
const notificationStatusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

// Tipos de notificación
const notificationTypeLabels = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  BULK_EMAIL: 'Email masivo',
  MEMBERSHIP_EXPIRATION: 'Expiración de membresía',
  MEMBERSHIP_RENEWAL: 'Renovación de membresía',
};

const NotificationLogsPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchLogs();
      }
    }
  }, [user, isAdmin, loading, router, pagination.page, pagination.limit]);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      
      // Construir query params para filtros
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await apiService.get(`/notifications/logs?${queryParams.toString()}`);
      
      setLogs(response.data.items);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
      }));
    } catch (error) {
      console.error('Error al cargar registros de notificaciones:', error);
      toast.error('No se pudieron cargar los registros de notificaciones');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const viewLogDetails = (log: NotificationLog) => {
    setSelectedLog(log);
  };

  const closeLogDetails = () => {
    setSelectedLog(null);
  };

  if (loading || loadingLogs) {
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
        <h1 className="text-3xl font-bold">Registro de Notificaciones</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => router.push('/admin/notifications')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver a Notificaciones
          </button>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver al Panel
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Todos</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="BULK_EMAIL">Email masivo</option>
              <option value="MEMBERSHIP_EXPIRATION">Expiración de membresía</option>
              <option value="MEMBERSHIP_RENEWAL">Renovación de membresía</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="SENT">Enviado</option>
              <option value="FAILED">Fallido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Email, teléfono, etc."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Registros de Notificaciones</h2>
        
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron registros de notificaciones
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinatario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asunto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notificationTypeLabels[log.type as keyof typeof notificationTypeLabels] || log.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.recipient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.subject || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notificationStatusColors[log.status as keyof typeof notificationStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewLogDetails(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{logs.length}</span> de{' '}
            <span className="font-medium">{pagination.total}</span> resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">
              {pagination.page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className={`px-3 py-1 rounded ${
                pagination.page >= Math.ceil(pagination.total / pagination.limit)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles de la Notificación</h2>
              <button
                onClick={closeLogDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID</h3>
                <p className="mt-1">{selectedLog.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo</h3>
                <p className="mt-1">{notificationTypeLabels[selectedLog.type as keyof typeof notificationTypeLabels] || selectedLog.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Destinatario</h3>
                <p className="mt-1">{selectedLog.recipient}</p>
              </div>
              {selectedLog.subject && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Asunto</h3>
                  <p className="mt-1">{selectedLog.subject}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contenido</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{selectedLog.content}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notificationStatusColors[selectedLog.status as keyof typeof notificationStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {selectedLog.status}
                  </span>
                </p>
              </div>
              {selectedLog.error && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Error</h3>
                  <div className="mt-1 p-3 bg-red-50 text-red-700 rounded-md whitespace-pre-wrap">{selectedLog.error}</div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha de Creación</h3>
                <p className="mt-1">{formatDate(selectedLog.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Última Actualización</h3>
                <p className="mt-1">{formatDate(selectedLog.updatedAt)}</p>
              </div>
              {selectedLog.userName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Usuario</h3>
                  <p className="mt-1">{selectedLog.userName}</p>
                </div>
              )}
              {selectedLog.templateName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Plantilla</h3>
                  <p className="mt-1">{selectedLog.templateName}</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={closeLogDetails}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationLogsPage;
