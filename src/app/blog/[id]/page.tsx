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
  author: string;
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
            <div className="flex items-center mb-8">
              <div className="flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden">
                <Image
                  src="/images/avatar-placeholder.jpg"
                  alt={post.author}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-500">Entrenador certificado</p>
              </div>
            </div>

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
                  src="/images/blog-detail-1.jpg"
                  alt="Personas ejercitándose"
                  fill
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
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Compartir */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Compartir:</h3>
              <div className="mt-2 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">WhatsApp</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Artículos relacionados */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Artículos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => router.push(`/blog/${relatedPost.id}`)}
                  className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{relatedPost.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{relatedPost.date}</p>
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
    author: 'María García',
    date: '15 Mar 2025',
    image: '/images/blog-1.jpg',
    category: 'entrenamiento',
    tags: ['principiantes', 'rutina', 'consejos']
  },
  {
    id: '2',
    title: 'Nutrición para ganar masa muscular',
    excerpt: 'Guía completa sobre qué alimentos consumir para maximizar el crecimiento muscular.',
    content: 'Contenido completo del artículo...',
    author: 'Carlos Rodríguez',
    date: '10 Mar 2025',
    image: '/images/blog-2.jpg',
    category: 'nutrición',
    tags: ['proteínas', 'masa muscular', 'dieta']
  },
  {
    id: '3',
    title: 'Los beneficios del entrenamiento de fuerza para mujeres',
    excerpt: 'Desmitificando creencias y explicando por qué las mujeres deberían incluir entrenamiento de fuerza.',
    content: 'Contenido completo del artículo...',
    author: 'Laura Martínez',
    date: '5 Mar 2025',
    image: '/images/blog-3.jpg',
    category: 'entrenamiento',
    tags: ['mujeres', 'fuerza', 'mitos']
  },
  {
    id: '4',
    title: 'Cómo recuperarse después de un entrenamiento intenso',
    excerpt: 'Estrategias efectivas para optimizar la recuperación muscular y reducir el dolor.',
    content: 'Contenido completo del artículo...',
    author: 'Javier López',
    date: '28 Feb 2025',
    image: '/images/blog-4.jpg',
    category: 'recuperación',
    tags: ['descanso', 'dolor muscular', 'suplementos']
  },
  {
    id: '5',
    title: 'Guía para una alimentación saludable',
    excerpt: 'Principios básicos para mantener una dieta equilibrada que apoye tus objetivos fitness.',
    content: 'Contenido completo del artículo...',
    author: 'Ana Sánchez',
    date: '20 Feb 2025',
    image: '/images/blog-5.jpg',
    category: 'nutrición',
    tags: ['dieta', 'salud', 'hábitos']
  },
  {
    id: '6',
    title: 'Ejercicios para mejorar la postura',
    excerpt: 'Rutina de ejercicios específicos para corregir problemas posturales comunes.',
    content: 'Contenido completo del artículo...',
    author: 'Diego Fernández',
    date: '15 Feb 2025',
    image: '/images/blog-6.jpg',
    category: 'salud',
    tags: ['postura', 'dolor de espalda', 'oficina']
  }
];

export default BlogPostDetail;
