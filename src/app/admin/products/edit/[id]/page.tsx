// OlimpoWEB-Frontend/src/app/admin/products/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import Link from "next/link";

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
}

const EditProductPage = ({ params }: PageProps) => {
  // Obtenemos el ID del producto de los parámetros de la ruta
  const productId = params.id;
  
  // Hooks y estado
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
    featured: false
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [productLoaded, setProductLoaded] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    const verifyAuth = async () => {
      // Esperar a que se cargue la información de autenticación
      if (loading) return;

      // Si no hay usuario o no es admin, redirigir
      if (!user) {
        toast.error("Debes iniciar sesión para acceder a esta página");
        router.replace("/login");
        return;
      }

      if (!isAdmin) {
        toast.error("No tienes permisos para acceder a esta página");
        router.replace("/dashboard");
        return;
      }

      setAuthChecked(true);
    };

    verifyAuth();
  }, [user, isAdmin, loading, router]);

  // Cargar datos del producto cuando la autenticación esté verificada
  useEffect(() => {
    if (!authChecked || !productId) return;
    
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        console.log("Cargando producto con ID:", productId);
        
        const response = await apiService.get(`/products/${productId}`);
        const data = response.data;
        
        // Manejar tanto si la respuesta es un objeto como un array
        const productData = Array.isArray(data) ? data[0] : data;
        
        if (!productData) {
          toast.error("Producto no encontrado");
          router.replace("/admin/products");
          return;
        }
        
        console.log("Datos del producto cargados:", productData);
        
        // Actualizar el estado del formulario
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price ? productData.price.toString() : "0",
          image_url: productData.image || "",
          category: productData.category_id || "",
          stock: "0", // Valor por defecto
          available: typeof productData.stock === "boolean" ? productData.stock : true,
          featured: productData.is_featured || false
        });
        
        // Establecer vista previa de imagen
        if (productData.image) {
          setImagePreview(productData.image);
        }
        
        setProductLoaded(true);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        toast.error("No se pudo cargar el producto");
        router.replace("/admin/products");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProduct();
  }, [authChecked, productId, router]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los campos de checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Manejar cambios en la imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, image_url: value }));
    setImagePreview(value);
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);

    try {
      // Preparar datos según el formato que espera el backend
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price, 10),
        image: formData.image_url,
        category_id: formData.category,
        stock: formData.available
      };

      console.log("Enviando datos:", productData);
      
      // Actualizar el producto
      await apiService.patch(`/products/${productId}`, productData);
      
      toast.success("Producto actualizado correctamente");
      
      // Usar setTimeout para dar tiempo a que se muestre el toast
      setTimeout(() => {
        router.replace("/admin/products");
      }, 1000);
    } catch (error: any) {
      console.error("Error al actualizar el producto:", error);
      
      // Mostrar mensaje de error detallado si está disponible
      if (error.response?.data?.message) {
        const errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message;
        toast.error(`Error: ${errorMsg}`);
      } else {
        toast.error("No se pudo actualizar el producto");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading || (!authChecked && !productLoaded)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <BackgroundLogo />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de carga mientras se cargan los datos del producto
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <BackgroundLogo />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando datos del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <BackgroundLogo />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Volver a Productos
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              {/* Precio */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">ARS</span>
                  </div>
                </div>
                {formData.price && (
                  <p className="mt-1 text-sm text-gray-500">
                    Precio formateado: {formatPrice(formData.price)}
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* URL de la imagen */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la imagen
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleImageChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              {/* Vista previa de la imagen */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Vista previa</p>
                <div className="mt-1 border-2 border-gray-300 border-dashed rounded-md p-2 h-48 flex justify-center items-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="max-h-full max-w-full object-contain"
                      onError={() => {
                        toast.error("Error al cargar la imagen");
                        setImagePreview("");
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500">No hay imagen</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center">
                <input
                  id="available"
                  name="available"
                  type="checkbox"
                  checked={formData.available}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                  Producto disponible
                </label>
              </div>

              {/* Destacado */}
              <div className="flex items-center">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Producto destacado
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end">
            <Link
              href="/admin/products"
              className="mr-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
