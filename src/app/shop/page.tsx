'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api.service';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  stock: number;
  available: boolean;
  featured?: boolean;
}

const ShopPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para obtener los productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const response = await fetch(`${baseUrl}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      
      const data = await response.json();
      
      // Filtrar solo productos disponibles para la tienda
      const availableProducts = data.filter((product: Product) => product.available);
      
      // Extraer categorías únicas de los productos
      const uniqueCategories: string[] = Array.from(
        new Set(availableProducts.map((product: Product) => product.category))
      );
      
      setCategories(uniqueCategories);
      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      toast.error('No se pudieron cargar los productos');
      setLoading(false);
    }
  };

  // Filtrar productos por categoría
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  const handleViewAllProducts = () => {
    // Recargar la página de la tienda o aplicar filtros
    filterByCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white py-12">
      <BackgroundLogo opacity={0.05} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nuestra Tienda
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Descubre nuestros productos de alta calidad para mejorar tu experiencia fitness.
          </p>
        </div>

        {/* Filtros de categorías */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => filterByCategory('all')}
          >
            Todos
          </button>
          {categories.map(category => (
            <button 
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => filterByCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                    <div 
                      className="h-64 bg-gray-200 flex items-center justify-center relative cursor-pointer"
                      onClick={() => router.push(`/shop/product/${product.id}`)}
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <p className="text-gray-500">Imagen no disponible</p>
                      )}
                      {product.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Destacado
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">AGOTADO</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 
                        className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                        onClick={() => router.push(`/shop/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image_url: product.image_url
                            }, 1);
                          }}
                          disabled={!product.available}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            product.available 
                              ? 'bg-gray-900 text-white hover:bg-gray-800' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {product.available ? 'Añadir al carrito' : 'Agotado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-600">No se encontraron productos en esta categoría.</p>
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={handleViewAllProducts}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Ver todos los productos
          </button>
        </div>

        {/* Sección de próximamente */}
        <div className="mt-20 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Próximamente</h2>
            <p className="mt-4 text-gray-600">
              Estamos trabajando en ampliar nuestra tienda con más productos y funcionalidades:
            </p>
            <ul className="mt-6 space-y-4 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Pasarela de pagos online
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Seguimiento de pedidos
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Reseñas de productos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
