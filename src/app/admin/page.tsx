'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, loading, router]);

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
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Gestión de Usuarios */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
          <p className="text-gray-600 mb-4">Administra los usuarios del gimnasio</p>
          <button 
            onClick={() => router.push('/admin/users')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ver Usuarios
          </button>
        </div>

        {/* Membresías */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Membresías</h2>
          <p className="text-gray-600 mb-4">Gestiona las membresías y pagos</p>
          <button 
            onClick={() => router.push('/admin/memberships')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Ver Membresías
          </button>
        </div>

        {/* Asistencias */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Asistencias</h2>
          <p className="text-gray-600 mb-4">Control de asistencias y registros</p>
          <button 
            onClick={() => router.push('/admin/attendance')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Ver Asistencias
          </button>
        </div>

        {/* Blog */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Blog</h2>
          <p className="text-gray-600 mb-4">Administra el contenido del blog</p>
          <button 
            onClick={() => router.push('/admin/blog')}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Gestionar Blog
          </button>
        </div>

        {/* Productos */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <p className="text-gray-600 mb-4">Gestiona el catálogo de productos</p>
          <button 
            onClick={() => router.push('/admin/products')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Ver Productos
          </button>
        </div>

        {/* Configuración */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configuración</h2>
          <p className="text-gray-600 mb-4">Ajustes generales del sistema</p>
          <button 
            onClick={() => router.push('/admin/settings')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Configurar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
