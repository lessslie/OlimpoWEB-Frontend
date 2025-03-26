'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { toast } from 'react-hot-toast';
import { Suspense } from 'react';

// Interfaces
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface MembershipType {
  name: string;
  value: string;
  defaultPrice: number;
  requiresDaysPerWeek: boolean;
}

const membershipTypes: MembershipType[] = [
  { name: 'Mensual', value: 'MONTHLY', defaultPrice: 5000, requiresDaysPerWeek: false },
  { name: 'Trimestral', value: 'QUARTERLY', defaultPrice: 13500, requiresDaysPerWeek: false },
  { name: 'Semestral', value: 'BIANNUAL', defaultPrice: 25000, requiresDaysPerWeek: false },
  { name: 'Anual', value: 'ANNUAL', defaultPrice: 45000, requiresDaysPerWeek: false },
  { name: 'Kickboxing 2 veces/semana', value: 'KICKBOXING_2', defaultPrice: 5000, requiresDaysPerWeek: true },
  { name: 'Kickboxing 3 veces/semana', value: 'KICKBOXING_3', defaultPrice: 6000, requiresDaysPerWeek: true },
  { name: 'Personalizado', value: 'CUSTOM', defaultPrice: 8000, requiresDaysPerWeek: false },
  { name: 'Polideportivo', value: 'MULTISPORT', defaultPrice: 7000, requiresDaysPerWeek: false },
];

// Componente que usa useSearchParams
import { useSearchParams } from 'next/navigation';

function MembershipFormWithParams() {
  const { user, isAdmin, loading, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: userId || '',
    type: 'MONTHLY',
    start_date: new Date().toISOString().split('T')[0],
    days_per_week: 3,
    price: 5000,
    auto_renew: false,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH',
    payment_status: 'PAID',
  });

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else if (userId) {
        fetchUserData(userId);
      }
    }
  }, [user, isAdmin, loading, router, userId]);

  // Obtener datos del usuario si se proporciona un ID
  const fetchUserData = async (id: string) => {
    try {
      setIsLoadingUser(true);
      // En un entorno real, esto sería una llamada a la API
      // const response = await apiService.get(`/users/${id}`);
      // setSelectedUser(response.data);
      
      // Simulamos datos para la demostración
      setTimeout(() => {
        setSelectedUser({
          id,
          first_name: 'Usuario',
          last_name: 'Ejemplo',
          email: 'usuario@ejemplo.com'
        });
        setIsLoadingUser(false);
      }, 500);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      toast.error('No se pudieron cargar los datos del usuario');
      setIsLoadingUser(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'type') {
      const selectedType = membershipTypes.find(t => t.value === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        price: selectedType?.defaultPrice || prev.price
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      toast.error('Debe seleccionar un usuario');
      return;
    }

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        days_per_week: formData.type === 'KICKBOXING_2' || formData.type === 'KICKBOXING_3' ? Number(formData.days_per_week) : undefined,
      };
      
      // En un entorno real, esto sería una llamada a la API
      // await apiService.post('/memberships', payload);
      
      // Simulamos la creación para la demostración
      toast.success('Membresía creada exitosamente');
      
      // Redirigir al detalle del usuario
      if (userId) {
        router.push(`/admin/users/${userId}`);
      } else {
        router.push('/admin/memberships');
      }
    } catch (error) {
      console.error('Error al crear membresía:', error);
      toast.error('No se pudo crear la membresía');
    }
  };

  if (loading || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const selectedType = membershipTypes.find(t => t.value === formData.type);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Crear Nueva Membresía</h1>
        <button 
          onClick={() => userId ? router.push(`/admin/users/${userId}`) : router.push('/admin/memberships')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {selectedUser && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Usuario seleccionado</h2>
            <p className="text-gray-700">
              <span className="font-medium">Nombre:</span> {selectedUser.first_name} {selectedUser.last_name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {selectedUser.email}
            </p>
          </div>
        )}

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
                required
              >
                {membershipTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
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
                required
              />
            </div>

            {/* Días por Semana (solo para Kickboxing) */}
            {(formData.type === 'KICKBOXING_2' || formData.type === 'KICKBOXING_3') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días por Semana
                </label>
                <select
                  name="days_per_week"
                  value={formData.days_per_week}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="1">1 día</option>
                  <option value="2">2 días</option>
                  <option value="3">3 días</option>
                  <option value="4">4 días</option>
                  <option value="5">5 días</option>
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
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            {/* Fecha de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                <option value="DEBIT_CARD">Tarjeta de Débito</option>
              </select>
            </div>

            {/* Estado del Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado del Pago
              </label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="PAID">Pagado</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>

            {/* Auto-renovación */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_renew"
                  name="auto_renew"
                  checked={formData.auto_renew}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="auto_renew" className="ml-2 block text-sm text-gray-700">
                  Renovación automática
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Crear Membresía
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente principal de la página - Envolvemos con Suspense
const NewMembershipPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <MembershipFormWithParams />
    </Suspense>
  );
};

export default NewMembershipPage;