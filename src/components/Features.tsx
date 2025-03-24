'use client';

import React from 'react';
import Link from 'next/link';

const features = [
  {
    title: 'Musculación',
    description:
      'Accede a nuestras modernas instalaciones con equipamiento de última generación para alcanzar tus objetivos de entrenamiento.',
    image: '/musculacion.jpg',
    link: '/musculacion',
  },
  {
    title: 'Kickboxing',
    description:
      'Entrena con instructores certificados y mejora tu condición física mientras aprendes el arte del kickboxing.',
    image: '/kickboxing.jpg',
    link: '/kickboxing',
  },
  {
    title: 'Personal Trainer',
    description:
      'Recibe atención personalizada y alcanza tus metas con la guía de nuestros entrenadores expertos.',
    image: '/trainer.jpg',
    link: '/personal-trainer',
  },
];

const Features = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nuestros Servicios
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Descubre todo lo que Olimpo tiene para ofrecerte
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.link}
                className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 sm:h-64">
                  <img
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    src={feature.image}
                    alt={feature.title}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
