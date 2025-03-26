'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';

const ScanQRPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | { success: boolean; message: string }>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Limpiar al desmontar
    return () => {
      stopCamera();
    };
  }, [user, loading, router]);

  const stopCamera = () => {
    // Cancelar el frame de animación si existe
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Detener todos los tracks de la cámara
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      console.log('Solicitando acceso a la cámara...');

      const constraints = {
        video: { 
          facingMode: "environment", // Usar cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setHasCamera(true);
            scanQRCode();
          }).catch(error => {
            console.error('Error al reproducir video:', error);
            setHasCamera(false);
            setIsScanning(false);
            toast.error('Error al iniciar la cámara');
          });
        };
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setHasCamera(false);
      setIsScanning(false);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Configurar el canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Función que captura frames y busca códigos QR
    const captureFrame = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;
      
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          console.log("Código QR detectado:", code.data);
          stopCamera();
          processQRCode(code.data);
          return;
        }
      } catch (error) {
        console.error("Error al procesar frame:", error);
      }
      
      // Continuar escaneando
      animationFrameRef.current = requestAnimationFrame(captureFrame);
    };
    
    // Iniciar escaneo
    animationFrameRef.current = requestAnimationFrame(captureFrame);
  };

  const processQRCode = async (decodedText: string) => {
    try {
      stopCamera();
      console.log('Procesando QR:', decodedText);
      
      // Obtener datos del QR (URL o JSON directo)
      let qrData;
      
      if (decodedText.includes('?data=')) {
        const urlParams = new URLSearchParams(decodedText.split('?')[1]);
        const dataParam = urlParams.get('data');
        if (!dataParam) {
          throw new Error('El código QR no contiene datos válidos');
        }
        qrData = JSON.parse(decodeURIComponent(dataParam));
      } else {
        try {
          qrData = JSON.parse(decodedText);
        } catch (e) {
          qrData = { raw: decodedText };
        }
      }
      
      console.log('Datos extraídos del QR:', qrData);
      
      // Validar datos del QR
      if (!qrData.type || qrData.type !== 'gym_attendance') {
        throw new Error('Este QR no es válido para registro de asistencia');
      }
      
      // Añadir el ID del usuario
      qrData.user_id = user?.id;
      
      // Registrar asistencia
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://olimpoweb-backend.onrender.com/api';
      const token = localStorage.getItem('token');
      
      console.log('Enviando datos:', `${apiBaseUrl}/attendance/check-in?data=${encodeURIComponent(JSON.stringify(qrData))}`);
      
      const response = await fetch(`${apiBaseUrl}/attendance/check-in?data=${encodeURIComponent(JSON.stringify(qrData))}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setScanResult({
          success: true,
          message: 'Asistencia registrada correctamente'
        });
        toast.success('¡Asistencia registrada correctamente!');
      } else {
        throw new Error(result.message || 'Error al registrar asistencia');
      }
    } catch (error) {
      console.error('Error al procesar QR:', error);
      setScanResult({
        success: false,
        message: error.message || 'Error al procesar el código QR'
      });
      toast.error(error.message || 'Error al procesar el código QR');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <h1 className="text-3xl font-bold mb-6 text-center">Escanear QR de Asistencia</h1>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Escanea el código QR en la entrada del gimnasio para registrar tu asistencia.
            </p>
            
            {/* Área de la cámara */}
            <div className="relative w-full h-64 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {isScanning && hasCamera !== false && (
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline 
                  muted
                  autoPlay
                />
              )}
              
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full object-cover opacity-0" 
              />
              
              {isScanning && hasCamera !== false ? (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-48 h-48 border-2 border-blue-500 animate-pulse"></div>
                </div>
              ) : scanResult ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                  {scanResult.success ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-600 font-medium text-lg">{scanResult.message}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {new Date().toLocaleTimeString()} - {new Date().toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-red-600 font-medium text-lg">{scanResult.message}</p>
                    </>
                  )}
                </div>
              ) : hasCamera === false ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-gray-800 font-medium text-lg mb-2">Se requiere acceso a la cámara</p>
                  <p className="text-gray-600 text-sm mb-4">Permite el acceso a la cámara para poder escanear códigos QR.</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="absolute bottom-4 text-gray-500 text-sm">Presiona el botón para iniciar</p>
                </div>
              )}
            </div>
            
            <button
              onClick={isScanning ? stopCamera : startCamera}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isScanning ? 'Detener' : scanResult ? 'Escanear de nuevo' : 'Iniciar escaneo'}
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
              <li>Acércate al código QR ubicado en la entrada del gimnasio</li>
              <li>Presiona el botón Iniciar escaneo</li>
              <li>Apunta la cámara al código QR</li>
              <li>Espera a que se registre tu asistencia</li>
            </ol>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanQRPage;