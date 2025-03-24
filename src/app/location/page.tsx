'use client';

import React from 'react';
import BackgroundLogo from '@/components/BackgroundLogo';

const LocationPage = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Nuestra Ubicación
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Visítanos en nuestras modernas instalaciones ubicadas en Quines, San Luis.
          </p>
        </div>

        {/* Mapa */}
        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <div className="h-96 w-full">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.5726521041!2d-65.8085623!3d-32.2358553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d4917ffe2738c7%3A0x5af9065b5a24a2cd!2sOlimpo+Gym!5e0!3m2!1ses-419!2sar!4v1711292292889!5m2!1ses-419!2sar" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        
        {/* Información de contacto en dos columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-200 rounded-lg p-6">
          {/* Columna izquierda - Dirección */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección</h3>
            <p className="text-gray-600 mb-2">Calle Pringles entre Saavedra y Córdoba</p>
            <p className="text-gray-600 mb-4">Quines, San Luis</p>
            <a 
              href="https://www.google.com/maps/place/Olimpo+Gym/@-32.2358553,-65.8085623,745m/data=!3m2!1e3!4b1!4m6!3m5!1s0x95d4917ffe2738c7:0x5af9065b5a24a2cd!8m2!3d-32.2358553!4d-65.8059874!16s%2Fg%2F11vdnsjycz?hl=es-419&entry=ttu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              Ver en Google Maps →
            </a>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto</h3>
              <p className="text-gray-600 mb-2">
                Teléfono: <a href="https://wa.me/5492304355852" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">+54 2304355852</a>
              </p>
              <p className="text-gray-600 mb-2">
                Email: <a href="mailto:walterdamianmaidana100@gmail.com" className="text-blue-600 hover:text-blue-800">walterdamianmaidana100@gmail.com</a>
              </p>
              <a 
                href="https://wa.me/5492304355852" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                Envíanos un mensaje →
              </a>
            </div>
          </div>
          
          {/* Columna derecha - Horarios */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600">Lunes a Viernes:</p>
                <p className="text-gray-800">07:00 - 12:30, 14:00 - 23:00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Sábados:</p>
                <p className="text-gray-800">09:00 - 13:00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Domingos:</p>
                <p className="text-gray-800">Cerrado</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LocationPage;
