'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Definición de tipos para las clases
interface GymClass {
  id: string;
  name: string;
  description: string;
  instructor: string;
  schedule: string[];
  image: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
  duration: number; // en minutos
}

// Datos de ejemplo para las clases
const classesData: GymClass[] = [
  {
    id: '1',
    name: 'Spinning',
    description: 'Clase de ciclismo indoor de alta intensidad con música motivadora. Quema calorías y mejora tu resistencia cardiovascular.',
    instructor: 'Carlos Rodríguez',
    schedule: ['Lunes 18:00', 'Miércoles 18:00', 'Viernes 18:00'],
    image: '/images/spinning.jpg',
    level: 'Todos los niveles',
    duration: 45
  },
  {
    id: '2',
    name: 'Yoga',
    description: 'Conecta cuerpo y mente a través de posturas, respiración y meditación. Mejora flexibilidad, fuerza y reduce el estrés.',
    instructor: 'Laura Martínez',
    schedule: ['Martes 10:00', 'Jueves 10:00', 'Sábado 09:00'],
    image: '/images/yoga.jpg',
    level: 'Todos los niveles',
    duration: 60
  },
  {
    id: '3',
    name: 'CrossFit',
    description: 'Entrenamiento funcional de alta intensidad que combina levantamiento de pesas, ejercicios cardiovasculares y gimnásticos.',
    instructor: 'Martín Gómez',
    schedule: ['Lunes 20:00', 'Miércoles 20:00', 'Viernes 20:00'],
    image: '/images/crossfit.jpg',
    level: 'Intermedio',
    duration: 60
  },
  {
    id: '4',
    name: 'Zumba',
    description: 'Divertida clase de baile con ritmos latinos que te ayudará a quemar calorías mientras disfrutas de la música.',
    instructor: 'Ana Sánchez',
    schedule: ['Martes 19:00', 'Jueves 19:00', 'Sábado 11:00'],
    image: '/images/zumba.jpg',
    level: 'Todos los niveles',
    duration: 50
  },
  {
    id: '5',
    name: 'Pilates',
    description: 'Fortalece tu core, mejora la postura y aumenta la flexibilidad con ejercicios controlados de bajo impacto.',
    instructor: 'Sofía Pérez',
    schedule: ['Lunes 09:00', 'Miércoles 09:00', 'Viernes 09:00'],
    image: '/images/pilates.jpg',
    level: 'Todos los niveles',
    duration: 55
  },
  {
    id: '6',
    name: 'Body Pump',
    description: 'Entrenamiento con pesas al ritmo de la música que tonifica y fortalece todos los grupos musculares principales.',
    instructor: 'Diego Fernández',
    schedule: ['Martes 18:00', 'Jueves 18:00', 'Sábado 10:00'],
    image: '/images/bodypump.jpg',
    level: 'Intermedio',
    duration: 45
  }
];

const ClassesSection: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

  const openClassDetails = (gymClass: GymClass) => {
    setSelectedClass(gymClass);
  };

  const closeClassDetails = () => {
    setSelectedClass(null);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Nuestras Clases
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Descubre la variedad de clases que ofrecemos para todos los niveles y objetivos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {classesData.map((gymClass) => (
            <div 
              key={gymClass.id} 
              className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openClassDetails(gymClass)}
            >
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                <Image 
                  src={gymClass.image} 
                  alt={gymClass.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="group-hover:opacity-75 transition-opacity"
                  onError={(e) => {
                    // Fallback para imágenes que no se pueden cargar
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/class-placeholder.jpg';
                  }}
                />
                <div className="absolute bottom-0 left-0 bg-gray-900 text-white px-3 py-1 text-sm font-medium">
                  {gymClass.level}
                </div>
                <div className="absolute bottom-0 right-0 bg-gray-900 text-white px-3 py-1 text-sm font-medium">
                  {gymClass.duration} min
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{gymClass.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{gymClass.description}</p>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-500">{gymClass.instructor}</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-500">{gymClass.schedule[0]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/classes" className="inline-flex items-center text-gray-900 font-medium hover:text-gray-700">
            Ver todas las clases y horarios
            <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Modal para detalles de clase */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeClassDetails}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="relative h-64 sm:h-72">
                <Image 
                  src={selectedClass.image} 
                  alt={selectedClass.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/class-placeholder.jpg';
                  }}
                />
                <button 
                  type="button" 
                  className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-100 focus:outline-none"
                  onClick={closeClassDetails}
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl leading-6 font-bold text-gray-900" id="modal-title">
                      {selectedClass.name}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {selectedClass.level}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-600 mb-4">{selectedClass.description}</p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-sm text-gray-500"><span className="font-medium">Instructor:</span> {selectedClass.instructor}</p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-500">Horarios:</p>
                          <ul className="mt-1 space-y-1">
                            {selectedClass.schedule.map((time, index) => (
                              <li key={index} className="text-sm text-gray-500">{time}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-sm text-gray-500"><span className="font-medium">Duración:</span> {selectedClass.duration} minutos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Reservar Clase
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeClassDetails}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClassesSection;
