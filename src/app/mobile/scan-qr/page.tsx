"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import toast from "react-hot-toast";

const ScanQRPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    // Limpiar al desmontar
    return () => {
      if (isScanning) {
        stopCamera();
      }
    };
  }, [user, loading, router]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);
      setScanResult(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara");
      }

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error al iniciar la cámara:", error);
      setCameraError(
        "No se pudo acceder a la cámara. Por favor verifica los permisos."
      );
      setIsScanning(false);
      toast.error("No se pudo acceder a la cámara");
    }
  };

  // Esta función simula el éxito de escaneo - después la cambiaremos por detección real
  const simulateSuccessfulScan = () => {
    if (!user) return;

    stopCamera();
    setScanResult({
      success: true,
      message: "Asistencia registrada correctamente",
    });
    toast.success("¡Asistencia registrada correctamente!");
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
      <h1 className="text-3xl font-bold mb-6 text-center">
        Escanear QR de Asistencia
      </h1>

      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Escanea el código QR en la entrada del gimnasio para registrar tu
              asistencia.
            </p>

            {/* Área de la cámara */}
            <div className="relative w-full h-64 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    autoPlay
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-48 h-48 border-2 border-blue-500 animate-pulse"></div>
                  </div>
                </>
              ) : scanResult ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                  {scanResult.success ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-green-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-green-600 font-medium text-lg">
                        {scanResult.message}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {new Date().toLocaleTimeString()} -{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-red-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <p className="text-red-600 font-medium text-lg">
                        {scanResult.message}
                      </p>
                    </>
                  )}
                </div>
              ) : cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-orange-500 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-gray-800 font-medium text-lg mb-2">
                    Error de cámara
                  </p>
                  <p className="text-gray-600 text-sm mb-4">{cameraError}</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="absolute bottom-4 text-gray-500 text-sm">
                    Presiona el botón para iniciar
                  </p>
                </div>
              )}
            </div>

            {isScanning ? (
              <div className="flex space-x-4">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Detener
                </button>
                <button
                  onClick={simulateSuccessfulScan}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Simular Escaneo
                </button>
              </div>
            ) : (
              <button
                onClick={startCamera}
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {scanResult ? "Escanear de nuevo" : "Iniciar escaneo"}
              </button>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
              <li>Acércate al código QR ubicado en la entrada del gimnasio</li>
              <li>Presiona el botón Iniciar escaneo</li>
              <li>Apunta la cámara al código QR</li>
              <li>Presiona Simular Escaneo para registrar tu asistencia</li>
            </ol>
          </div>

          <div className="mt-6">
            <button
              onClick={() => router.push("/dashboard")}
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
