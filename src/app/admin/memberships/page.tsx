'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';

// Interfaces
interface Membership {
  id: string;
  user_id: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  price: number;
  days_per_week?: number;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const AdminMembershipsPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchMemberships();
      }
    }
  }, [user, isAdmin, loading, router]);

  const fetchMemberships = async () => {
    try {
      setLoadingMemberships(true);
      const response = await apiService.get('/memberships');
      setMemberships(response.data);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
      toast.error('No se pudieron cargar las membresías');
    } finally {
      setLoadingMemberships(false);
    }
  };

  const renewMembership = async (id: string) => {
    try {
      await apiService.post(`/memberships/${id}/renew`, {});
      toast.success('Membresía renovada exitosamente');
      fetchMemberships();
    } catch (error) {
      console.error('Error al renovar membresía:', error);
      toast.error('No se pudo renovar la membresía');
    }
  };

  const toggleAutoRenew = async (id: string, currentValue: boolean) => {
    try {
      await apiService.patch(`/memberships/${id}`, {
        auto_renew: !currentValue
      });
      toast.success(`Renovación automática ${!currentValue ? 'activada' : 'desactivada'}`);
      fetchMemberships();
    } catch (error) {
      console.error('Error al cambiar renovación automática:', error);
      toast.error('No se pudo cambiar la configuración de renovación automática');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMemberships = memberships
    .filter(membership => {
      if (filter === 'all') return true;
      return membership.status === filter;
    })
    .filter(membership => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        membership.user?.name?.toLowerCase().includes(searchLower) ||
        membership.user?.email?.toLowerCase().includes(searchLower) ||
        membership.type.toLowerCase().includes(searchLower)
      );
    });

  if (loading || loadingMemberships) {
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
        <h1 className="text-3xl font-bold">Gestión de Membresías</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver al Panel
          </button>
          <button 
            onClick={() => router.push('/admin/memberships/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Membresía
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-gray-200 font-medium' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('ACTIVE')}
              className={`px-4 py-2 rounded ${filter === 'ACTIVE' ? 'bg-green-200 font-medium' : 'bg-green-100 hover:bg-green-200'}`}
            >
              Activas
            </button>
            <button 
              onClick={() => setFilter('EXPIRED')}
              className={`px-4 py-2 rounded ${filter === 'EXPIRED' ? 'bg-red-200 font-medium' : 'bg-red-100 hover:bg-red-200'}`}
            >
              Expiradas
            </button>
            <button 
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded ${filter === 'PENDING' ? 'bg-yellow-200 font-medium' : 'bg-yellow-100 hover:bg-yellow-200'}`}
            >
              Pendientes
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, email o tipo..."
              className="w-full md:w-64 px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabla de membresías */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-Renovación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMemberships.length > 0 ? (
                filteredMemberships.map((membership) => (
                  <tr key={membership.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{membership.user?.name || 'Usuario desconocido'}</div>
                      <div className="text-sm text-gray-500">{membership.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {membership.type === 'MONTHLY' ? 'Mensual' :
                         membership.type === 'QUARTERLY' ? 'Trimestral' :
                         membership.type === 'BIANNUAL' ? 'Semestral' :
                         membership.type === 'ANNUAL' ? 'Anual' :
                         membership.type === 'KICKBOXING_2' ? 'Kickboxing (2 veces/semana)' :
                         membership.type === 'KICKBOXING_3' ? 'Kickboxing (3 veces/semana)' :
                         membership.type === 'CUSTOM' ? 'Personalizada' :
                         membership.type === 'MULTISPORT' ? 'Multideporte' :
                         membership.type}
                      </div>
                      {membership.days_per_week && (
                        <div className="text-sm text-gray-500">{membership.days_per_week} días/semana</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(membership.status)}`}>
                        {membership.status === 'ACTIVE' ? 'Activa' : 
                         membership.status === 'EXPIRED' ? 'Expirada' : 
                         membership.status === 'PENDING' ? 'Pendiente' : membership.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Inicio: {formatDate(membership.start_date)}</div>
                      <div>Fin: {formatDate(membership.end_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${membership.price.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleAutoRenew(membership.id, membership.auto_renew)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${membership.auto_renew ? 'bg-green-500' : 'bg-gray-200'}`}
                        role="switch"
                        aria-checked={membership.auto_renew}
                      >
                        <span className="sr-only">Auto-renovación</span>
                        <span 
                          aria-hidden="true" 
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${membership.auto_renew ? 'translate-x-5' : 'translate-x-0'}`}
                        ></span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => router.push(`/admin/memberships/edit/${membership.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      {membership.status === 'EXPIRED' && (
                        <button 
                          onClick={() => renewMembership(membership.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Renovar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron membresías que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMembershipsPage;
