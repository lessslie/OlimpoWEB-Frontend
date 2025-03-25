'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';

const QRCodePage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [qrValue, setQrValue] = useState('');
  const [gymName, setGymName] = useState('Olimpo Gym');
  const [qrSize, setQrSize] = useState(300);
  const [showInstructions, setShowInstructions] = useState(false);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, loading, router]);

  // Generar el valor del código QR
  useEffect(() => {
    if (user && isAdmin) {
      // El valor del QR debe ser único y constante para el gimnasio
      // La aplicación móvil reemplazará USER_ID_PLACEHOLDER con el ID del usuario actual
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const qrData = {
        type: 'gym_attendance',
        gym_id: '1', // ID único del gimnasio
        user_id: 'USER_ID_PLACEHOLDER', // Será reemplazado por la app móvil
        timestamp: new Date().toISOString() // Para verificar cuándo se generó el QR
      };
      
      // Convertir a JSON y codificar para URL
      const qrDataString = JSON.stringify(qrData);
      const encodedData = encodeURIComponent(qrDataString);
      
      // Crear URL para la API de asistencia
      const attendanceUrl = `${baseUrl}/attendance/check-in?data=${encodedData}`;
      
      setQrValue(attendanceUrl);
    }
  }, [user, isAdmin]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Obtener el SVG del QR
    const svgElement = document.getElementById('gym-qrcode');
    if (!svgElement) return;

    // Convertir SVG a una imagen
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = qrSize + 100; // Añadir margen
      canvas.height = qrSize + 150; // Espacio para el texto
      
      // Fondo blanco
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar QR
        ctx.drawImage(img, 50, 50, qrSize, qrSize);
        
        // Añadir texto
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gymName, canvas.width / 2, qrSize + 80);
        ctx.font = '16px Arial';
        ctx.fillText('Escanea para registrar tu asistencia', canvas.width / 2, qrSize + 110);
        
        // Descargar imagen
        const link = document.createElement('a');
        link.download = 'olimpo-gym-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <h1 className="text-3xl font-bold mb-6">Código QR de Asistencia</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* QR Code (lado izquierdo) */}
        <div className="md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">QR para Entrada al Gimnasio</h2>
            
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 print-section">
              <div className="mb-4 qr-container">
                <QRCodeSVG
                  id="gym-qrcode"
                  value={qrValue || 'https://olimpogym.com/attendance'}
                  size={qrSize}
                  level="H" // Alta corrección de errores
                  includeMargin={true}
                />
              </div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{gymName}</h3>
                <p className="text-gray-600">Escanea para registrar tu asistencia</p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
              >
                Imprimir QR
              </button>
              
              <button 
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
              >
                Descargar QR
              </button>
            </div>
          </div>
        </div>
        
        {/* Instrucciones (lado derecho) */}
        <div className="md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Instrucciones de Uso</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
                <p>Este código QR debe ser impreso y colocado en la entrada del gimnasio. Los usuarios escanearán este código con la aplicación móvil para registrar su asistencia al ingresar.</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Instrucciones para los usuarios</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Abre la aplicación de Olimpo Gym en tu teléfono</li>
                  <li>Toca el botón Escanear QR en la pantalla principal</li>
                  <li>Apunta la cámara hacia este código QR</li>
                  <li>¡Listo! Tu asistencia ha sido registrada</li>
                </ol>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Recomendaciones</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Imprime el código QR en un tamaño grande (mínimo 15x15 cm)</li>
                  <li>Colócalo en un lugar visible y bien iluminado</li>
                  <li>Protégelo con un marco o laminado para mayor durabilidad</li>
                  <li>Evita doblarlo o dañarlo para mantener su funcionalidad</li>
                </ul>
              </div>
              
              <button 
                onClick={() => router.push('/admin/attendance')}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
              >
                Volver a Asistencias
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white;
          }
          .qr-container {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodePage;
