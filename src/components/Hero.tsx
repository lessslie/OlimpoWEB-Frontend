'use client';

import React from 'react';
import Link from 'next/link';

const Hero = () => {
  return (
    <div className="relative bg-gray-900">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="/hero-bg.jpg"
          alt="Gimnasio Olimpo"
        />
        <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Bienvenido a Olimpo
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-3xl">
          Tu camino hacia una vida más saludable y fuerte comienza aquí. Descubre nuestras instalaciones
          de última generación y únete a nuestra comunidad.
        </p>
        <div className="mt-10">
          <Link
            href="/register"
            className="inline-block bg-primary text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Comienza Ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
