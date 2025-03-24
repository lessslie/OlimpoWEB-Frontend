'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

// Solo 3 testimonios destacados
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Laura Martínez',
    role: 'Miembro desde 2022',
    content: 'Desde que me uní a Olimpo Gym, mi vida ha cambiado completamente. Los entrenadores son increíbles y siempre me motivan a dar lo mejor de mí.',
    image: '/images/testimonial-1.jpg',
    rating: 5
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    role: 'Miembro desde 2021',
    content: 'Las instalaciones son de primera calidad y el ambiente es muy motivador. Me encanta la variedad de clases que ofrecen.',
    image: '/images/testimonial-2.jpg',
    rating: 5
  },
  {
    id: '3',
    name: 'Sofía Pérez',
    role: 'Miembro desde 2023',
    content: 'Después de probar varios gimnasios, finalmente encontré mi lugar en Olimpo. Los horarios flexibles se adaptan perfectamente a mi agenda.',
    image: '/images/testimonial-3.jpg',
    rating: 4
  }
];

const TestimonialsSection: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    testimonial: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí se implementaría la lógica para enviar el testimonio a la base de datos
    // Por ahora, simularemos un envío exitoso
    
    try {
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('¡Gracias por compartir tu experiencia!');
      setFormData({
        name: '',
        email: '',
        rating: 5,
        testimonial: ''
      });
    } catch (error) {
      toast.error('Ha ocurrido un error al enviar tu testimonio. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Lo que dicen nuestros miembros
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Experiencias reales de la comunidad Olimpo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/testimonial-placeholder.jpg';
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-600 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario para enviar un testimonio */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Comparte tu experiencia</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="5">5 estrellas - Excelente</option>
                    <option value="4">4 estrellas - Muy bueno</option>
                    <option value="3">3 estrellas - Bueno</option>
                    <option value="2">2 estrellas - Regular</option>
                    <option value="1">1 estrella - Malo</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700 mb-1">Tu experiencia</label>
                  <textarea
                    id="testimonial"
                    name="testimonial"
                    value={formData.testimonial}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar testimonio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
