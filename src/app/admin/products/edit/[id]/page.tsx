// OlimpoWEB-Frontend/src/app/admin/products/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";

// Categorías predefinidas
const CATEGORIES = [
  { id: "supplements", name: "Suplementos" },
  { id: "clothing", name: "Ropa" },
  { id: "equipment", name: "Equipamiento" },
  { id: "accessories", name: "Accesorios" },
  { id: "memberships", name: "Membresías" },
  { id: "other", name: "Otros" },
];

// Función para formatear el precio
const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseInt(price, 10) : price;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(numPrice);
};

// Interfaz para las propiedades de la página
interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const EditProductPage = ({ params }: PageProps) => {
  // NOTA: Estamos accediendo directamente a params.id, lo que genera una advertencia en Next.js.
  // En versiones futuras, se requerirá usar React.use() para desenvolver params, pero actualmente
  // no podemos usar React.use() en componentes cliente ('use client').
  const id = params.id;
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    stock: "0",
    available: true,
    featured: false,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Solo verificar una vez
        if (authChecked) return;
        
        if (!loading) {
          if (!user) {
            console.log("Usuario no autenticado, redirigiendo a login");
            router.push("/login");
            return;
          } 
          
          if (!isAdmin) {
            console.log("Usuario no es admin, redirigiendo a dashboard");
            router.push("/dashboard");
            return;
          }
          
          setAuthChecked(true);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
      }
    };
    
    checkAuth();
  }, [user, isAdmin, loading, router, authChecked]);

  // Cargar datos del producto cuando la autenticación esté verificada
  useEffect(() => {
    const loadProductData = async () => {
      if (authChecked && id) {
        console.log("Cargando datos del producto:", id);
        await fetchProductData();
      }
    };
    
    loadProductData();
  }, [authChecked, id]);

  // Obtener datos del producto
  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      console.log("Obteniendo datos del producto con ID:", id);

      // Obtener el producto específico por su ID
      const response = await apiService.get(`/products/${id}`);
      console.log("Respuesta de la API:", response.data);
      const productData = response.data;

      // Verificar si productData es un objeto (producto único) o un array
      if (Array.isArray(productData)) {
        console.log("Respuesta es un array, buscando producto con ID:", id);
        // Si es un array, buscar el producto por ID
        const product = productData.find((product) => product.id === id);
        
        if (product) {
          console.log("Producto encontrado en el array:", product);
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            image_url: product.image_url || product.image || "",
            category: product.category || product.category_id || "",
            stock: typeof product.stock === 'boolean' ? (product.stock ? "1" : "0") : product.stock.toString(),
            available: product.available || (typeof product.stock === 'boolean' ? product.stock : product.stock > 0),
            featured: product.featured || product.is_featured || false,
          });

          if (product.image_url || product.image) {
            setImagePreview(product.image_url || product.image);
          }
        } else {
          console.error("Producto no encontrado en el array");
          toast.error("Producto no encontrado");
          router.push("/admin/products");
        }
      } else {
        // Si es un objeto único (el producto directamente)
        console.log("Respuesta es un objeto único:", productData);
        const product = productData;
        
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          image_url: product.image_url || product.image || "",
          category: product.category || product.category_id || "",
          stock: typeof product.stock === 'boolean' ? (product.stock ? "1" : "0") : product.stock.toString(),
          available: product.available || (typeof product.stock === 'boolean' ? product.stock : product.stock > 0),
          featured: product.featured || product.is_featured || false,
        });

        if (product.image_url || product.image) {
          setImagePreview(product.image_url || product.image);
        }
      }
    } catch (error) {
      console.error("Error al cargar el producto:", error);
      toast.error("No se pudo cargar el producto");
      // Redirigir a la lista de productos en caso de error
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Actualizar vista previa de la imagen
    if (name === "image_url" && value) {
      setImagePreview(value);
    }
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);

    try {
      // Preparar datos para enviar - adaptados al formato que espera el backend según UpdateProductDto
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price, 10),
        image: formData.image_url,
        category_id: formData.category,
        stock: formData.available
      };

      console.log("Enviando datos de producto:", productData);
      console.log("URL de actualización:", `/products/${id}`);

      // Realizar la petición PATCH al backend
      const response = await apiService.patch(`/products/${id}`, productData);
      console.log("Respuesta de actualización:", response.data);

      // Mostrar mensaje de éxito
      toast.success("Producto actualizado correctamente");

      // Redirigir a la lista de productos
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error: any) { // Tipamos el error como 'any' para poder acceder a sus propiedades
      console.error("Error al actualizar el producto:", error);
      // Mostrar mensaje de error más detallado si está disponible
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ') 
          : error.response.data.message;
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error("No se pudo actualizar el producto");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <h1 className="text-3xl font-bold">Editar Producto</h1>
        <button
          onClick={() => router.push("/admin/products")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Productos
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Precio *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="image_url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL de la imagen
                </label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="available"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Disponible
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="featured"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Destacado
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vista previa de la imagen
                </label>
                <div className="border border-gray-300 rounded-md p-2 h-64 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="max-h-60 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">
                      No hay imagen disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              {isSaving && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
