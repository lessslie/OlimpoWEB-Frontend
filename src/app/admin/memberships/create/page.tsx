'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';

// Interfaces
interface User {
  id: string;
  name: string;
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
  { name: 'Kickboxing', value: 'KICKBOXING', defaultPrice: 6000, requiresDaysPerWeek: true },
];

const CreateMembershipPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: '',
    type: 'MONTHLY',
    start_date: new Date().toISOString().split('T')[0],
    days_per_week: 3,
    price: 5000,
    auto_renew: false,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        u => 
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiService.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setLoadingUsers(false);
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

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, user_id: user.id }));
    setSearchTerm(user.name);
    setShowUserDropdown(false);
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
        days_per_week: formData.type === 'KICKBOXING' ? Number(formData.days_per_week) : undefined,
      };
      
      await apiService.post('/memberships', payload);
      toast.success('Membresía creada exitosamente');
      router.push('/admin/memberships');
    } catch (error) {
      console.error('Error al crear membresía:', error);
      toast.error('No se pudo crear la membresía');
    }
  };

  if (loading || loadingUsers) {
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
          onClick={() => router.push('/admin/memberships')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Membresías
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de Usuario */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o email..."
                  className="w-full px-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                />
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectUser(user)}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedUser && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Usuario seleccionado:</span> {selectedUser.name} ({selectedUser.email})
                  </p>
                </div>
              )}
            </div>

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

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Crear Membresía
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMembershipPage;
