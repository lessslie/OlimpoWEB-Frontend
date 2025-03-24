'use client';

import React from 'react';
import ClassesSection from '@/components/ClassesSection';
import BackgroundLogo from '@/components/BackgroundLogo';

const ClassesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundLogo opacity={0.03} />
      
      <div className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Nuestras Clases
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Descubre todas las actividades que tenemos para ti. Desde yoga hasta CrossFit, 
              tenemos clases para todos los niveles y objetivos.
            </p>
          </div>
        </div>
      </div>
      
      <ClassesSection />
      
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Instructores Certificados
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Nuestros instructores son profesionales certificados con años de experiencia.
                Están comprometidos con tu progreso y te guiarán en cada paso de tu entrenamiento.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">Certificaciones internacionales</strong> - 
                    Todos nuestros instructores cuentan con certificaciones reconocidas a nivel internacional.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">Capacitación continua</strong> - 
                    Nuestro equipo se actualiza constantemente con las últimas tendencias y técnicas.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">Atención personalizada</strong> - 
                    Adaptamos las clases a tus necesidades y nivel para maximizar tus resultados.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Quieres probar una clase?</h3>
                  <p className="text-gray-600 mb-6">
                    Ofrecemos una clase de prueba gratuita para que puedas experimentar la calidad de nuestros servicios.
                  </p>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                      <input type="text" id="name" name="name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" id="email" name="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input type="tel" id="phone" name="phone" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="class" className="block text-sm font-medium text-gray-700">Clase de interés</label>
                      <select id="class" name="class" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm">
                        <option value="">Selecciona una clase</option>
                        <option value="spinning">Spinning</option>
                        <option value="yoga">Yoga</option>
                        <option value="crossfit">CrossFit</option>
                        <option value="zumba">Zumba</option>
                        <option value="pilates">Pilates</option>
                        <option value="bodypump">Body Pump</option>
                      </select>
                    </div>
                    <div>
                      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                        Solicitar clase de prueba
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesPage;
