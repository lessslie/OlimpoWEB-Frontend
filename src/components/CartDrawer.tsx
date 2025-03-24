'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import type { CartItem } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar el drawer al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevenir scroll cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Finalizar compra
  const handleCheckout = () => {
    toast.success('¡Gracias por tu compra! Un asesor se pondrá en contacto contigo.');
    clearCart();
    onClose();
    router.push('/shop');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div 
        ref={drawerRef}
        className="bg-white w-full max-w-md h-full overflow-auto shadow-xl transform transition-transform duration-300"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tu Carrito</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
              <button 
                onClick={() => {
                  onClose();
                  router.push('/shop');
                }}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Ir a la tienda
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium">Gratis</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold mt-4">
                  <span>Total:</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Finalizar Compra
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  Vaciar Carrito
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                * Los productos se pagan en el gimnasio. Un asesor se pondrá en contacto contigo para coordinar la entrega.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para un item individual del carrito
const CartItem: React.FC<{
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}> = ({ item, onRemove, onUpdateQuantity }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex items-center border-b pb-4">
      <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden mr-4 flex-shrink-0">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
              {item.quantity}
            </span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700"
            aria-label="Eliminar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="ml-4 text-right">
        <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
        <p className="text-sm text-gray-500">{formatPrice(item.price)} c/u</p>
      </div>
    </div>
  );
};

export default CartDrawer;
