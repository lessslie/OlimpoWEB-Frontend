"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

// Importación dinámica del editor para evitar problemas de SSR
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});
// Categorías predefinidas
const CATEGORIES = [
  "Musculación",
  "Kickboxing",
  "Nutrición",
  "Entrenamiento",
  "Salud",
  "Eventos",
  "Consejos",
  "Personal Trainer",
];

// Interfaces
interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  author_id: string;
  author_name?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  excerpt?: string;
  slug: string;
  tags?: string[];
}

interface PageProps {
  params: {
    id: string;
  };
}

const EditBlogPostPage = ({ params }: PageProps) => {
  const { id } = params;
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    image_url: "",
    published: false,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editorLoaded, setEditorLoaded] = useState(false);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      } else {
        setEditorLoaded(true);
        fetchPostData();
      }
    }
  }, [user, isAdmin, loading, router, id]);

  // Obtener datos del post
  const fetchPostData = async () => {
    try {
      setIsLoading(true);

      // En un entorno real, esto sería una llamada a la API
      // const response = await apiService.get(`/blog/posts/${id}`);
      // const postData = response.data;

      // Simulamos datos para la demostración
      const mockPosts: BlogPost[] = [
        {
          id: "1",
          title: "Los beneficios del entrenamiento de fuerza",
          content:
            "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>",
          image_url: "https://via.placeholder.com/800x400",
          category: "Musculación",
          author_id: "1",
          author_name: "Juan Pérez",
          published: true,
          created_at: "2023-01-15T10:30:00Z",
          updated_at: "2023-01-15T10:30:00Z",
          excerpt:
            "Descubre cómo el entrenamiento de fuerza puede transformar tu cuerpo y mejorar tu salud.",
          slug: "beneficios-entrenamiento-fuerza",
          tags: ["musculación", "entrenamiento", "salud"],
        },
        {
          id: "2",
          title: "Guía para principiantes de Kickboxing",
          content:
            "<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><h2>Técnicas básicas</h2><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>",
          image_url: "https://via.placeholder.com/800x400",
          category: "Kickboxing",
          author_id: "2",
          author_name: "María González",
          published: true,
          created_at: "2023-02-20T14:15:00Z",
          updated_at: "2023-02-20T14:15:00Z",
          excerpt:
            "Todo lo que necesitas saber para comenzar en el mundo del kickboxing.",
          slug: "guia-principiantes-kickboxing",
          tags: ["kickboxing", "principiantes", "artes marciales"],
        },
        {
          id: "3",
          title:
            "Nutrición para deportistas: qué comer antes y después del entrenamiento",
          content:
            "<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p><h3>Antes del entrenamiento</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><h3>Después del entrenamiento</h3><p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
          image_url: "https://via.placeholder.com/800x400",
          category: "Nutrición",
          author_id: "1",
          author_name: "Juan Pérez",
          published: true,
          created_at: "2023-03-10T09:45:00Z",
          updated_at: "2023-03-10T09:45:00Z",
          excerpt:
            "Aprende a optimizar tu alimentación para maximizar tus resultados en el gimnasio.",
          slug: "nutricion-deportistas",
          tags: ["nutrición", "alimentación", "rendimiento"],
        },
        {
          id: "4",
          title: "Próximos eventos y competiciones",
          content:
            "<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><ul><li>Competición regional de kickboxing</li><li>Maratón benéfica</li><li>Seminario de nutrición deportiva</li></ul>",
          image_url: "https://via.placeholder.com/800x400",
          category: "Eventos",
          author_id: "3",
          author_name: "Carlos Rodríguez",
          published: false,
          created_at: "2023-04-05T16:20:00Z",
          updated_at: "2023-04-05T16:20:00Z",
          excerpt:
            "Calendario de eventos y competiciones para los próximos meses.",
          slug: "proximos-eventos-competiciones",
          tags: ["eventos", "competiciones", "calendario"],
        },
      ];

      // Buscar el post por ID
      const post = mockPosts.find((post) => post.id === id);

      if (post) {
        setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || "",
          category: post.category,
          tags: post.tags ? post.tags.join(", ") : "",
          image_url: post.image_url || "",
          published: post.published,
        });

        if (post.image_url) {
          setImagePreview(post.image_url);
        }
      } else {
        toast.error("Post no encontrado");
        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error al cargar el post:", error);
      toast.error("No se pudo cargar el post");
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar cambios en el editor de contenido
  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
  };

  // Manejar cambios en la URL de la imagen
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  };

  // Generar slug a partir del título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);

    try {
      // Preparar datos para enviar
      const postData = {
        ...formData,
        slug: generateSlug(formData.title),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        updated_at: new Date().toISOString(),
      };

      // En un entorno real, esto sería una llamada a la API
      // await apiService.put(`/blog/posts/${id}`, postData);

      // Simulamos el guardado
      console.log("Actualizando post:", postData);

      // Mostrar mensaje de éxito
      toast.success("Post actualizado correctamente");

      // Redirigir a la lista de posts
      setTimeout(() => {
        router.push("/admin/blog");
      }, 1500);
    } catch (error) {
      console.error("Error al actualizar el post:", error);
      toast.error("No se pudo actualizar el post");
    } finally {
      setIsSaving(false);
    }
  };

  // Configuración del editor Quill
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  if (loading || isLoading || !editorLoaded) {
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
        <h1 className="text-3xl font-bold">Editar Post</h1>
        <button
          onClick={() => router.push("/admin/blog")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver a Posts
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Título */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Título del post"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Resumen */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Resumen
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Breve resumen del post (aparecerá en las vistas previas)"
                value={formData.excerpt}
                onChange={handleChange}
              />
            </div>

            {/* Contenido */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contenido <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Escribe el contenido de tu post aquí..."
                  className="h-64"
                />
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Estado de publicación */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                />
                <label
                  htmlFor="published"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Publicado
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSaving ? "Guardando..." : "Actualizar Post"}
                </button>
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

            {/* Etiquetas */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Etiquetas
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Separadas por comas (ej: musculación, entrenamiento)"
                value={formData.tags}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Separa las etiquetas con comas
              </p>
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
                  <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBlogPostPage;
