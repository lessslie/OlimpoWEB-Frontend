'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ShopPage = () => {
  const router = useRouter();
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);

  // Productos de ejemplo
  const products: Product[] = [
    {
      id: '1',
      name: 'Botella Deportiva Premium',
      description: 'Botella de acero inoxidable con aislamiento térmico, perfecta para mantener tus bebidas frías durante el entrenamiento.',
      price: 24.99,
      image: '/images/placeholder.jpg',
      category: 'accesorios'
    },
    {
      id: '2',
      name: 'Guantes de Entrenamiento',
      description: 'Guantes de alta calidad con soporte para muñeca, ideales para levantamiento de pesas y entrenamiento de fuerza.',
      price: 19.99,
      image: '/images/placeholder.jpg',
      category: 'accesorios'
    },
    {
      id: '3',
      name: 'Proteína Whey Premium',
      description: 'Proteína de suero de leche de alta calidad con 25g de proteína por porción. Sabor chocolate.',
      price: 39.99,
      image: '/images/placeholder.jpg',
      category: 'suplementos'
    },
    {
      id: '4',
      name: 'Camiseta Deportiva',
      description: 'Camiseta transpirable de secado rápido, perfecta para tus entrenamientos intensos.',
      price: 29.99,
      image: '/images/placeholder.jpg',
      category: 'ropa'
    },
    {
      id: '5',
      name: 'Banda de Resistencia',
      description: 'Set de bandas elásticas de resistencia para entrenamiento en casa o en el gimnasio.',
      price: 15.99,
      image: '/images/placeholder.jpg',
      category: 'accesorios'
    },
    {
      id: '6',
      name: 'Pre-Entrenamiento',
      description: 'Fórmula avanzada para maximizar tu energía y rendimiento durante el entrenamiento.',
      price: 34.99,
      image: '/images/placeholder.jpg',
      category: 'suplementos'
    }
  ];

  const handleAddToCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      newCart[productId] = (newCart[productId] || 0) + 1;
      return newCart;
    });
    toast.success('Producto añadido al carrito');
  };

  const handleViewAllProducts = () => {
    // Recargar la página de la tienda o aplicar filtros
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Filtros de categorías - Implementación futura */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
            Todos
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200">
            Suplementos
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200">
            Accesorios
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200">
            Ropa
          </button>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div key={product.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 flex items-center justify-center relative">
                <p className="text-gray-500">Imagen del producto</p>
                {/* Cuando tengamos imágenes reales:
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                />
                */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddToCart(product.id)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                Carrito de compras completo
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Pasarela de pagos
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Seguimiento de pedidos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
