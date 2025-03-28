//OlimpoWEB-Frontend/src/app/admin/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import React from 'react';

// Categorías predefinidas
const CATEGORIES = [
  "Suplementos",
  "Equipamiento",
  "Accesorios",
  "Indumentaria",
  "Bebidas",
  "Snacks",
  "Merchandising",
];

// Interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  stock: number;
  available: boolean;
  created_at: string;
  updated_at: string;
  featured?: boolean;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

const EditProductPage = ({ params }: PageProps) => {
  // Usar React.use() para desenvolver la promesa de params
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
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

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      } else {
        fetchProductData();
      }
    }
  }, [user, isAdmin, loading, router, id]);

  // Obtener datos del producto
  const fetchProductData = async () => {
    try {
      setIsLoading(true);

      // Obtener el producto específico por su ID
      const response = await apiService.get(`/products/${id}`);
      const productData = response.data;

      // Verificar si productData es un objeto (producto único) o un array
      if (Array.isArray(productData)) {
        // Si es un array, buscar el producto por ID
        const product = productData.find((product) => product.id === id);
        
        if (product) {
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
          toast.error("Producto no encontrado");
          router.push("/admin/products");
        }
      } else {
        // Si es un objeto único (el producto directamente)
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
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else if (name === "price" || name === "stock") {
      // Solo permitir números para precio y stock
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar cambios en la URL de la imagen
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
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
        image: formData.image_url, // Backend espera 'image', no 'image_url'
        category_id: formData.category, // Backend espera 'category_id', no 'category'
        stock: formData.available, // Backend espera 'stock' como boolean
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
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      toast.error("No se pudo actualizar el producto");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
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
        <h1 className="text-3xl font-bold">Editar Producto</h1>
        <button
          onClick={() => router.push("/admin/products")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Productos
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Descripción detallada del producto"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Precio */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  required
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock
              </label>
              <input
                type="text"
                id="stock"
                name="stock"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>

            {/* Imagen */}
            <div>
              <label
                htmlFor="image_url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL de la imagen
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.image_url}
                onChange={handleImageUrlChange}
              />

              {imagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-full object-contain"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Opciones adicionales */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Opciones adicionales
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="available"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Disponible para la venta
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="featured"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Producto destacado
                  </label>
                </div>
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSaving ? "Guardando..." : "Actualizar Producto"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
