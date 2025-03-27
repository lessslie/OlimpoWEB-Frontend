'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
  tags: string[];
}

const BlogPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        // Aquí se implementaría la llamada a la API para obtener los posts
        // Por ahora, usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(sampleBlogPosts);
      } catch (error) {
        console.error('Error al cargar los artículos del blog:', error);
        toast.error('No se pudieron cargar los artículos del blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const categories = ['all', ...Array.from(new Set(posts.map(post => post.category)))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePostClick = (postId: string) => {
    router.push(`/blog/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Blog de Fitness y Salud
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Consejos, rutinas y artículos sobre fitness, nutrición y bienestar
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          <div className="w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lista de artículos */}
        {filteredPosts.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-500">No se encontraron artículos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.id)}
                className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-base text-gray-500 mb-4">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Datos de ejemplo para el blog
const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Cómo empezar tu rutina de entrenamiento',
    excerpt: 'Consejos prácticos para principiantes que quieren comenzar a entrenar de manera efectiva.',
    content: 'Contenido completo del artículo...',
    date: '15 Mar 2025',
    image: '/images/rutinaEntrenamiento.jpeg',
    category: 'entrenamiento',
    tags: ['principiantes', 'rutina', 'consejos']
  },
  {
    id: '2',
    title: 'Nutrición para ganar masa muscular',
    excerpt: 'Guía completa sobre qué alimentos consumir para maximizar el crecimiento muscular.',
    content: 'Contenido completo del artículo...',
    date: '10 Mar 2025',
    image: '/images/masaMuscular.jpeg',
    category: 'nutrición',
    tags: ['proteínas', 'masa muscular', 'dieta']
  },
  {
    id: '3',
    title: 'Los beneficios del entrenamiento de fuerza para mujeres',
    excerpt: 'Desmitificando creencias y explicando por qué las mujeres deberían incluir entrenamiento de fuerza.',
    content: 'Contenido completo del artículo...',
    date: '5 Mar 2025',
    image: '/images/fuerzaMujeres.jpeg',
    category: 'entrenamiento',
    tags: ['mujeres', 'fuerza', 'mitos']
  },
  {
    id: '4',
    title: 'Cómo recuperarse después de un entrenamiento intenso',
    excerpt: 'Estrategias efectivas para optimizar la recuperación muscular y reducir el dolor.',
    content: 'Contenido completo del artículo...',
    date: '28 Feb 2025',
    image: '/images/recuperarse.jpeg',
    category: 'recuperación',
    tags: ['descanso', 'dolor muscular', 'suplementos']
  },
  {
    id: '5',
    title: 'Guía para una alimentación saludable',
    excerpt: 'Principios básicos para mantener una dieta equilibrada que apoye tus objetivos fitness.',
    content: 'Contenido completo del artículo...',
    date: '20 Feb 2025',
    image: '/images/guiaAlimentacion.jpeg',
    category: 'nutrición',
    tags: ['dieta', 'salud', 'hábitos']
  },
  {
    id: '6',
    title: 'Ejercicios para mejorar la postura',
    excerpt: 'Rutina de ejercicios específicos para corregir problemas posturales comunes.',
    content: 'Contenido completo del artículo...',
    date: '15 Feb 2025',
    image: '/images/mejorarPostura.jpeg',
    category: 'salud',
    tags: ['postura', 'dolor de espalda', 'oficina']
  }
];

export default BlogPage;
