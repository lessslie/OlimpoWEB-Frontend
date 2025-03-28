'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  image?: string;
  category_id?: string;  
  category?: string;
  stock: boolean | number;  
  available?: boolean;
  created_at: string;
  updated_at: string;
  featured?: boolean;
  is_featured?: boolean;  
}

const AdminProductsPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchProducts();
      }
    }
  }, [user, isAdmin, loading, router]);

  // Función para obtener los productos
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await apiService.get('/products');
      const data = response.data;
      
      // Adaptar los datos recibidos al formato esperado por el componente
      const adaptedProducts = data.map((product: any) => ({
        ...product,
        category: product.category_id || 'Sin categoría',  
        available: product.stock === true,  
        featured: product.is_featured  
      }));
      
      // Asignar los datos adaptados
      setProducts(adaptedProducts);
      
      // Extraer categorías únicas de los productos después de asignarlos
      const uniqueCategories = Array.from(new Set(adaptedProducts.map(product => product.category))) as string[];
      setCategories(uniqueCategories);
      
      setLoadingProducts(false);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      toast.error('No se pudieron cargar los productos');
      setLoadingProducts(false);
    }
  };

  // Función para eliminar un producto
  const deleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        await apiService.delete(`/products/${id}`);
        
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        toast.error('No se pudo eliminar el producto');
      }
    }
  };

  // Función para cambiar la disponibilidad de un producto
  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await apiService.patch(`/products/${id}`, { stock: !currentStatus });
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? { ...product, available: !currentStatus, stock: !currentStatus } : product
        )
      );
      
      toast.success(`Producto ${!currentStatus ? 'disponible' : 'no disponible'}`);
    } catch (error) {
      console.error('Error al cambiar la disponibilidad:', error);
      toast.error('No se pudo cambiar la disponibilidad');
    }
  };

  // Filtrar productos según los criterios seleccionados
  const filteredProducts = products
    .filter(product => {
      if (filter === 'available') return product.available === true;
      if (filter === 'unavailable') return product.available === false;
      if (filter === 'out_of_stock') return product.stock === 0 || product.stock === false;
      return true; 
    })
    .filter(product => {
      if (selectedCategory === 'all') return true;
      return product.category === selectedCategory;
    })
    .filter(product => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.category && product.category.toLowerCase().includes(searchLower))
      );
    });

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading || loadingProducts) {
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
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver al Panel
          </button>
          <button 
            onClick={() => router.push('/admin/products/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">No disponibles</option>
              <option value="out_of_stock">Sin stock</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image_url && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img className="h-10 w-10 rounded-md object-cover" src={product.image_url} alt="" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {product.name}
                            {product.featured && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Destacado
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`${product.stock === 0 || product.stock === false ? 'text-red-600 font-medium' : ''}`}>
                        {typeof product.stock === 'boolean' ? (product.stock ? 'En stock' : 'Sin stock') : product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAvailability(product.id, product.available === true)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.available ? 'Disponible' : 'No disponible'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleAvailability(product.id, product.available === true)}
                          className={product.available ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                          title={product.available ? "Marcar como no disponible" : "Marcar como disponible"}
                        >
                          {product.available ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No se encontraron productos que coincidan con los criterios de búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
