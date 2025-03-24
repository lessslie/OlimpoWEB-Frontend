'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated, loading, updateUserData } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    // Cargar datos del usuario cuando estén disponibles
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  }, [user, isAuthenticated, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseñas si se está intentando cambiar
    if (formData.new_password) {
      if (formData.new_password !== formData.confirm_password) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      
      if (!formData.current_password) {
        toast.error('Debes ingresar tu contraseña actual para cambiarla');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Preparar datos para actualizar
      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone,
      };
      
      // Incluir cambio de contraseña si se proporcionó
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }
      
      // Llamar a la API para actualizar el perfil
      const response = await authService.updateProfile(updateData);
      
      // Actualizar datos en el contexto de autenticación
      if (updateUserData) {
        updateUserData(response.user);
      }
      
      toast.success('Perfil actualizado correctamente');
      
      // Limpiar campos de contraseña
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Perfil de Usuario
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Actualiza tu información personal y contraseña
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">El email no se puede modificar</p>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <h3 className="text-lg font-medium text-gray-900">Cambiar contraseña</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Deja estos campos en blanco si no deseas cambiar tu contraseña
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Contraseña actual
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    Nueva contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirmar nueva contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
