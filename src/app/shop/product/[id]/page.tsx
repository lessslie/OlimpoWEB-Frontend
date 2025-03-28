"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackgroundLogo from "@/components/BackgroundLogo";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

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
  created_at: string;
  updated_at: string;
}

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const ProductDetailPage = ({ params }: PageProps) => {
  const { id } = params;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Función para obtener los detalles del producto
  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      // En un entorno real, esto sería una llamada a la API
      const response = await apiService.get(`/products/${id}`);
      const productData = response.data;



      // Buscar el producto por ID
      const foundProduct = productData.find((p) => p.id === id);

      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        toast.error("Producto no encontrado");
        router.push("/shop");
      }
    } catch (error) {
      console.error("Error al cargar el producto:", error);
      toast.error("No se pudo cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  // Añadir al carrito
  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    setAddingToCart(true);

    // Añadir al carrito usando el contexto
    setTimeout(() => {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
        quantity
      );

      setAddingToCart(false);
    }, 800);
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <p className="text-gray-600 mb-6">
          El producto que estás buscando no existe o ha sido eliminado.
        </p>
        <Link
          href="/shop"
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <BackgroundLogo opacity={0.05} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Inicio
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/shop" className="text-gray-500 hover:text-gray-700">
            Tienda
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Imagen del producto */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image_url || "/placeholder-image.png"}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
            : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Imagen no disponible</p>
              </div>
            )
          </div>

          {/* Detalles del producto */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center mb-4">
                <span className="px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="ml-2 px-2 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {formatPrice(product.price)}
              </p>
              <div className="prose max-w-none text-gray-600">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Stock */}
            <div className="mb-6">
              <p
                className={`font-medium ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} unidades disponibles`
                  : "Producto agotado"}
              </p>
            </div>

            {/* Acciones */}
            {product.stock > 0 ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="quantity"
                    className="text-gray-700 font-medium"
                  >
                    Cantidad:
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={quantity}
                    onChange={handleQuantityChange}
                  >
                    {Array.from(
                      { length: Math.min(10, product.stock) },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`w-full py-3 px-6 rounded-md text-white font-medium ${
                    addingToCart
                      ? "bg-gray-400"
                      : "bg-gray-900 hover:bg-gray-800"
                  } transition-colors`}
                >
                  {addingToCart ? "Añadiendo..." : "Añadir al carrito"}
                </button>

                <p className="text-sm text-gray-500 mt-2">
                  * Los productos se pagan en el gimnasio. Un asesor se pondrá
                  en contacto contigo para coordinar la entrega.
                </p>
              </div>
            ) : (
              <div>
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-md bg-gray-300 text-gray-500 font-medium cursor-not-allowed"
                >
                  Producto agotado
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Este producto está temporalmente agotado. Pronto estará
                  disponible nuevamente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Volver a la tienda */}
        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center text-gray-900 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
