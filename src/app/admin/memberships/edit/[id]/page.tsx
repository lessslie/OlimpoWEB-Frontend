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

interface MembershipType {
  name: string;
  value: string;
  requiresDaysPerWeek: boolean;
}

const membershipTypes: MembershipType[] = [
  { name: 'Mensual', value: 'MONTHLY', requiresDaysPerWeek: false },
  { name: 'Trimestral', value: 'QUARTERLY', requiresDaysPerWeek: false },
  { name: 'Semestral', value: 'BIANNUAL', requiresDaysPerWeek: false },
  { name: 'Anual', value: 'ANNUAL', requiresDaysPerWeek: false },
  { name: 'Kickboxing', value: 'KICKBOXING', requiresDaysPerWeek: true },
];

interface MembershipStatus {
  name: string;
  value: string;
  color: string;
}

const membershipStatuses: MembershipStatus[] = [
  { name: 'Activa', value: 'ACTIVE', color: 'green' },
  { name: 'Expirada', value: 'EXPIRED', color: 'red' },
  { name: 'Pendiente', value: 'PENDING', color: 'yellow' },
];

const EditMembershipPage = ({ params }: { params: { id: string } }) => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
  
  const [formData, setFormData] = useState({
    type: '',
    status: '',
    start_date: '',
    end_date: '',
    days_per_week: 3,
    price: 0,
    auto_renew: false,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchMembership();
      }
    }
  }, [user, isAdmin, loading, router, params.id]);

  const fetchMembership = async () => {
    try {
      setLoadingMembership(true);
      const response = await apiService.get(`/memberships/${params.id}`);
      setMembership(response.data);
      
      // Formatear fechas para input type="date"
      const startDate = new Date(response.data.start_date).toISOString().split('T')[0];
      const endDate = new Date(response.data.end_date).toISOString().split('T')[0];
      
      setFormData({
        type: response.data.type,
        status: response.data.status,
        start_date: startDate,
        end_date: endDate,
        days_per_week: response.data.days_per_week || 3,
        price: response.data.price,
        auto_renew: response.data.auto_renew,
      });
    } catch (error) {
      console.error('Error al cargar membresía:', error);
      toast.error('No se pudo cargar la membresía');
      router.push('/admin/memberships');
    } finally {
      setLoadingMembership(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        days_per_week: formData.type === 'KICKBOXING' ? Number(formData.days_per_week) : undefined,
      };
      
      await apiService.patch(`/memberships/${params.id}`, payload);
      toast.success('Membresía actualizada exitosamente');
      router.push('/admin/memberships');
    } catch (error) {
      console.error('Error al actualizar membresía:', error);
      toast.error('No se pudo actualizar la membresía');
    }
  };

  if (loading || loadingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin || !membership) {
    return null;
  }

  const selectedType = membershipTypes.find(t => t.value === formData.type);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editar Membresía</h1>
        <button 
          onClick={() => router.push('/admin/memberships')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Membresías
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Información del Usuario */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Información del Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium">{membership.user?.name || 'Usuario desconocido'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{membership.user?.email || 'Email no disponible'}</p>
            </div>
            {membership.user?.phone && (
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{membership.user.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">ID de Usuario</p>
              <p className="font-medium text-sm">{membership.user_id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Membresía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Membresía
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {membershipTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {membershipStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Fecha de Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Días por Semana (solo para Kickboxing) */}
            {selectedType?.requiresDaysPerWeek && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días por Semana
                </label>
                <select
                  name="days_per_week"
                  value={formData.days_per_week}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={2}>2 días</option>
                  <option value={3}>3 días</option>
                  <option value={5}>5 días</option>
                </select>
              </div>
            )}

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min={0}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Auto-Renovación */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_renew"
                name="auto_renew"
                checked={formData.auto_renew}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="auto_renew" className="ml-2 block text-sm text-gray-700">
                Renovación Automática
              </label>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/admin/memberships')}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMembershipPage;
