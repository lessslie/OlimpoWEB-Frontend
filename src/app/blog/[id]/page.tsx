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

interface BlogPostDetailProps {
  params: {
    id: string;
  };
}

const BlogPostDetail = ({ params }: BlogPostDetailProps) => {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        // Aquí se implementaría la llamada a la API para obtener el post específico
        // Por ahora, usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const foundPost = sampleBlogPosts.find(p => p.id === params.id);
        if (foundPost) {
          setPost(foundPost);
          
          // Obtener posts relacionados (misma categoría)
          const related = sampleBlogPosts
            .filter(p => p.id !== params.id && p.category === foundPost.category)
            .slice(0, 3);
          setRelatedPosts(related);
        } else {
          toast.error('Artículo no encontrado');
          router.push('/blog');
        }
      } catch (error) {
        console.error('Error al cargar el artículo:', error);
        toast.error('No se pudo cargar el artículo');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBlogPost();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Artículo no encontrado</h2>
          <p className="mt-2 text-gray-500">El artículo que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.push('/blog')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Volver al blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <button
          onClick={() => router.push('/blog')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al blog
        </button>

        {/* Cabecera del artículo */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="relative h-96 w-full">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center space-x-2 mb-4">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {post.category}
              </span>
              <span className="text-sm text-gray-500">{post.date}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Contenido del artículo */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-500 mb-6">{post.excerpt}</p>
              
              {/* Contenido completo (simulado) */}
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introducción</h2>
              <p className="mb-4">
                El fitness y la salud son aspectos fundamentales para mantener una buena calidad de vida. En este artículo, exploraremos diferentes estrategias y consejos para mejorar tu bienestar físico y mental a través del ejercicio regular y una alimentación balanceada.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Beneficios del ejercicio regular</h2>
              <p className="mb-4">
                Realizar actividad física de manera constante tiene numerosos beneficios para la salud, entre los que se incluyen:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">Mejora de la salud cardiovascular</li>
                <li className="mb-2">Aumento de la fuerza y resistencia muscular</li>
                <li className="mb-2">Reducción del estrés y la ansiedad</li>
                <li className="mb-2">Mejor calidad del sueño</li>
                <li className="mb-2">Control del peso corporal</li>
              </ul>
              
              <div className="relative h-64 w-full my-8 rounded-lg overflow-hidden">
                <Image
                  src="/images/personasEntrenandoEnGimnasio.png"
                  alt="Personas ejercitándose"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Recomendaciones prácticas</h2>
              <p className="mb-4">
                Para incorporar el ejercicio en tu rutina diaria, considera las siguientes recomendaciones:
              </p>
              <ol className="list-decimal pl-6 mb-6">
                <li className="mb-2">Comienza gradualmente, especialmente si eres principiante</li>
                <li className="mb-2">Establece objetivos realistas y medibles</li>
                <li className="mb-2">Busca actividades que disfrutes para mantener la motivación</li>
                <li className="mb-2">Combina diferentes tipos de ejercicios (cardiovascular, fuerza, flexibilidad)</li>
                <li className="mb-2">Descansa adecuadamente entre sesiones de entrenamiento</li>
              </ol>
              
              <blockquote className="border-l-4 border-gray-900 pl-4 py-2 my-6 italic text-gray-700">
                &ldquo;El ejercicio no solo cambia tu cuerpo, cambia tu mente, tu actitud y tu humor.&rdquo;
              </blockquote>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Conclusión</h2>
              <p className="mb-4">
                Incorporar hábitos saludables en tu vida diaria puede parecer desafiante al principio, pero los beneficios a largo plazo son invaluables. Recuerda que la consistencia es clave para ver resultados duraderos.
              </p>
              <p>
                En Olimpo Gym contamos con profesionales capacitados para guiarte en tu camino hacia una vida más saludable. ¡No dudes en consultarnos!
              </p>
            </div>

            {/* Etiquetas */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Etiquetas:</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Artículos relacionados */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos relacionados</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => router.push(`/blog/${relatedPost.id}`)}
                  className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{relatedPost.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
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

export default BlogPostDetail;
