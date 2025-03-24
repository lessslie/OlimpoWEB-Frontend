'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import BackgroundLogo from '@/components/BackgroundLogo';

interface MembershipInfo {
  type: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
}

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo>({
    type: null,
    status: null,
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Actualizar información de membresía cuando el usuario esté disponible
    if (user) {
      setMembershipInfo({
        type: user.membership_type,
        status: user.membership_status,
        startDate: user.membership_start,
        endDate: user.membership_end,
      });
    }
  }, [user]);

  // Formatear fecha para mostrar
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Determinar el estado de la membresía para mostrar el color adecuado
  const getMembershipStatusColor = () => {
    if (!membershipInfo.status) return 'bg-gray-200';
    
    switch (membershipInfo.status.toLowerCase()) {
      case 'active':
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'expired':
      case 'expirada':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Panel de Usuario
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Información personal y detalles de membresía
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.full_name || 'No disponible'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.email || 'No disponible'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.phone || 'No disponible'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Estado de membresía</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getMembershipStatusColor()}`}>
                    {membershipInfo.status ? 
                      membershipInfo.status.charAt(0).toUpperCase() + membershipInfo.status.slice(1) : 
                      'No disponible'}
                  </span>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tipo de membresía</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {membershipInfo.type || 'No disponible'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de inicio</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {membershipInfo.startDate ? formatDate(membershipInfo.startDate) : 'No disponible'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de vencimiento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {membershipInfo.endDate ? formatDate(membershipInfo.endDate) : 'No disponible'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sección de acciones */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mi rutina
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Acá está tu rutina personalizada.</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={() => router.push('/dashboard')}
                >
                  Ver mi rutina
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actualizar perfil
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Actualiza tu información personal y datos de contacto.</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={() => router.push('/dashboard/profile')}
                >
                  Editar perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
