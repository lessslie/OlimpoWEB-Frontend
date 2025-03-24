'use client';

import { useEffect } from 'react';
import BackgroundLogo from '@/components/BackgroundLogo';
import Image from 'next/image';

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
        // Coordenadas del gimnasio (ejemplo: Buenos Aires, Obelisco)
        const gymLocation = { lat: -34.6037, lng: -58.3816 };
        
        // Crear el mapa
        const map = new window.google.maps.Map(mapElement, {
          center: gymLocation,
          zoom: 16,
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{"weight": "2.00"}]
            },
            {
              "featureType": "all",
              "elementType": "geometry.stroke",
              "stylers": [{"color": "#9c9c9c"}]
            },
            {
              "featureType": "all",
              "elementType": "labels.text",
              "stylers": [{"visibility": "on"}]
            },
            {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [{"color": "#f2f2f2"}]
            },
            {
              "featureType": "landscape",
              "elementType": "geometry.fill",
              "stylers": [{"color": "#f2f2f2"}]
            },
            {
              "featureType": "poi",
              "elementType": "all",
              "stylers": [{"visibility": "off"}]
            },
            {
              "featureType": "road",
              "elementType": "all",
              "stylers": [{"saturation": -100}, {"lightness": 45}]
            },
            {
              "featureType": "road.highway",
              "elementType": "all",
              "stylers": [{"visibility": "simplified"}]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.icon",
              "stylers": [{"visibility": "off"}]
            },
            {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [{"visibility": "off"}]
            },
            {
              "featureType": "water",
              "elementType": "all",
              "stylers": [{"color": "#b4d4e1"}, {"visibility": "on"}]
            }
          ]
        });
        
        // Añadir un marcador en la ubicación del gimnasio
        const marker = new window.google.maps.Marker({
          position: gymLocation,
          map: map,
          title: 'Olimpo Gym',
          animation: window.google.maps.Animation.DROP
        });
        
        // Añadir un infowindow al marcador
        const infowindow = new window.google.maps.InfoWindow({
          content: '<div style="padding: 10px;"><strong>Olimpo Gym</strong><br>Av. Corrientes 1234<br>Buenos Aires, Argentina</div>'
        });
        
        marker.addListener('click', () => {
          infowindow.open(map, marker);
        });
        
        // Abrir el infowindow por defecto
        infowindow.open(map, marker);
      }
    };

    // Cargar el script de Google Maps si aún no está cargado
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
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
    <div className="min-h-screen bg-gray-50 py-12">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nuestra Ubicación
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Visítanos en nuestras modernas instalaciones ubicadas en el centro de la ciudad.
          </p>
        </div>

        <div className="mt-12 bg-white shadow overflow-hidden rounded-lg">
          {/* Mapa */}
          <div id="map" className="h-96 w-full"></div>
          
          {/* Información de ubicación */}
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Dirección</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-base text-gray-500">
                      <p className="font-medium text-gray-900">Olimpo Gym</p>
                      <p className="mt-1">Av. Corrientes 1234</p>
                      <p>Buenos Aires, Argentina</p>
                      <p>CP 1043</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-base text-gray-500">
                      <p>+54 11 1234-5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-base text-gray-500">
                      <p>info@olimpogym.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Horarios</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-base text-gray-500">Lunes a Viernes</p>
                    <p className="text-base font-medium text-gray-900">8:00 - 22:00</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-base text-gray-500">Sábados</p>
                    <p className="text-base font-medium text-gray-900">9:00 - 18:00</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-base text-gray-500">Domingos</p>
                    <p className="text-base font-medium text-gray-900">10:00 - 14:00</p>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h4 className="text-base font-medium text-gray-900">Cómo llegar</h4>
                    <ul className="mt-2 space-y-2 text-base text-gray-500">
                      <li>• Subte: Línea B, estación Carlos Pellegrini</li>
                      <li>• Colectivos: 5, 6, 7, 9, 10, 17, 45, 59, 67, 70, 75, 99, 100, 115, 132</li>
                      <li>• Estacionamiento disponible en el edificio (con costo adicional)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Imágenes de las instalaciones */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Nuestras Instalaciones</h2>
          <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto text-center mb-8">
            Conoce nuestros espacios modernos y equipados para tu entrenamiento
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/gym-1.jpg"
                  alt="Área de musculación"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Área de Musculación</h3>
                <p className="mt-2 text-base text-gray-500">Equipamiento de última generación para tu entrenamiento de fuerza.</p>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/gym-2.jpg"
                  alt="Sala de clases grupales"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Sala de Clases Grupales</h3>
                <p className="mt-2 text-base text-gray-500">Espacios amplios para disfrutar de nuestras variadas clases grupales.</p>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/gym-3.jpg"
                  alt="Área cardiovascular"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Área Cardiovascular</h3>
                <p className="mt-2 text-base text-gray-500">Cintas, bicicletas y elípticos con vista panorámica de la ciudad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
