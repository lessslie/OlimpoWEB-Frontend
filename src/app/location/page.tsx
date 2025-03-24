'use client';

import React, { useEffect } from 'react';
import BackgroundLogo from '@/components/BackgroundLogo';

// Extender la interfaz Window para incluir google
declare global {
  interface Window {
    google: any;
  }
}

const LocationPage = () => {
  // Cargar el script de Google Maps cuando el componente se monte
  useEffect(() => {
    // Esta función inicializará el mapa una vez que el script esté cargado
    const initMap = () => {
      const mapElement = document.getElementById('map');
      if (mapElement && window.google) {
        // Coordenadas exactas del gimnasio Olimpo en Quines, San Luis
        const gymLocation = { lat: -32.2358553, lng: -65.8059874 };
        
        // Crear el mapa
        const map = new window.google.maps.Map(mapElement, {
          center: gymLocation,
          zoom: 17,
        });
        
        // Añadir un marcador en la ubicación del gimnasio
        const marker = new window.google.maps.Marker({
          position: gymLocation,
          map: map,
          title: 'Olimpo Gym',
          animation: window.google.maps.Animation.DROP
        });
      }
    };

    // Cargar el script de Google Maps si aún no está cargado
    if (!window.google) {
      const script = document.createElement('script');
      // Usar el mapa sin API key, lo que permite un uso básico sin necesidad de credenciales
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
    
    // Limpieza al desmontar
    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

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
          <div id="map" className="h-96 w-full"></div>
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
