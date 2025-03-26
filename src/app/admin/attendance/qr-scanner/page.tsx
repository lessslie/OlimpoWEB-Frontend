"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";

const ScanQRPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [scannerStarted, setScannerStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    // Verificar permisos de cámara al cargar
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((permissionStatus) => {
          setCameraPermission(
            permissionStatus.state as "granted" | "denied" | "prompt"
          );

          permissionStatus.onchange = () => {
            setCameraPermission(
              permissionStatus.state as "granted" | "denied" | "prompt"
            );
          };
        })
        .catch((error) => {
          console.error("Error checking camera permission:", error);
        });
    }

    // Limpiar al desmontar
    return () => {
      stopScanner();
    };
  }, [user, loading, router]);

  // Iniciar el escáner de QR
  const startScanner = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      const scanner = scannerRef.current;

      if (scanner && !scannerStarted) {
        await scanner.start(
          { facingMode: "environment" }, // Usar cámara trasera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          onScanFailure
        );

        setScannerStarted(true);
      }
    } catch (error) {
      console.error("Error al iniciar el escáner:", error);
      toast.error("No se pudo acceder a la cámara");
      setIsScanning(false);
    }
  };

  // Detener el escáner
  const stopScanner = async () => {
    if (scannerRef.current && scannerStarted) {
      try {
        await scannerRef.current.stop();
        setScannerStarted(false);
      } catch (error) {
        console.error("Error al detener el escáner:", error);
      }
    }
  };

  // Función que se ejecuta cuando se escanea un QR exitosamente
  const onScanSuccess = async (decodedText: string) => {
    try {
      console.log("QR escaneado exitosamente:", decodedText);

      // Detener el escáner después de un escaneo exitoso
      await stopScanner();

      // Procesar el QR escaneado
      await processQRCode(decodedText);
    } catch (error) {
      console.error("Error al procesar el QR:", error);
      setScanResult({
        success: false,
        message: "Error al procesar el código QR",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Manejar errores de escaneo
  const onScanFailure = (error: any) => {
    // No hacemos nada en errores normales de escaneo (cuando no hay QR en la vista)
    // console.log('Error de escaneo:', error);
  };

  // Procesar el código QR escaneado
  const processQRCode = async (qrValue: string) => {
    try {
      // Intentar determinar si el QR contiene una URL o datos JSON
      let qrData;

      // Si es una URL con parámetro data
      if (qrValue.includes("?data=")) {
        const urlParams = new URLSearchParams(qrValue.split("?")[1]);
        const dataParam = urlParams.get("data");

        if (dataParam) {
          qrData = JSON.parse(decodeURIComponent(dataParam));
        } else {
          throw new Error("URL no contiene parámetro data");
        }
      } else {
        // Intentar parsear como JSON directamente
        try {
          qrData = JSON.parse(qrValue);
        } catch (e) {
          // Si no es JSON, usar el valor tal cual
          console.log("No es JSON, usando el valor completo");
          qrData = { raw: qrValue };
        }
      }

      console.log("Datos del QR procesados:", qrData);

      // Verificar si es un QR válido para asistencia
      if (!qrData || (qrData.type !== "gym_attendance" && !qrData.raw)) {
        throw new Error("Código QR no válido para registro de asistencia");
      }

      // Agregar ID del usuario
      if (qrData.type === "gym_attendance") {
        qrData.user_id = user?.id;
      }

      // Registrar la asistencia
      const encodedData = encodeURIComponent(JSON.stringify(qrData));
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://olimpoweb-backend.onrender.com/api";

      console.log(
        "Enviando datos a la API:",
        `${apiBaseUrl}/attendance/check-in?data=${encodedData}`
      );

      // Hacer la solicitud a la API
      const response = await fetch(
        `${apiBaseUrl}/attendance/check-in?data=${encodedData}`
      );

      if (!response.ok) {
        throw new Error(
          `Error al registrar asistencia: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result && result.success) {
        setScanResult({
          success: true,
          message: "Asistencia registrada correctamente",
        });
        toast.success("¡Asistencia registrada correctamente!");
      } else {
        throw new Error(result.message || "Error al registrar asistencia");
      }
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      setScanResult({
        success: false,
        message: error.message || "Error al procesar el código QR",
      });
      toast.error(error.message || "Error al procesar el código QR");
    }
  };

  // Reiniciar el escáner
  const handleRescan = async () => {
    setScanResult(null);
    await startScanner();
  };

  // Solicitar permiso de cámara
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Detener el stream inmediatamente después de obtener permisos
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      startScanner();
    } catch (error) {
      console.error("Error al solicitar permiso de cámara:", error);
      setCameraPermission("denied");
      toast.error("No se otorgó permiso para acceder a la cámara");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
              {/* Lector QR */}
              <div id="reader" className="w-full h-full"></div>

              {isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 border-2 border-blue-500 animate-scan"></div>
                  </div>
                </div>
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
              ) : cameraPermission === "denied" ? (
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
                    Se requiere acceso a la cámara
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    Permite el acceso a la cámara para poder escanear códigos
                    QR.
                  </p>
                </div>
              ) : !isScanning && !scanResult ? (
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
              ) : null}
            </div>

            {/* Botones */}
            {cameraPermission === "denied" ? (
              <button
                onClick={requestCameraPermission}
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Permitir acceso a la cámara
              </button>
            ) : scanResult ? (
              <button
                onClick={handleRescan}
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Escanear de nuevo
              </button>
            ) : (
              <button
                onClick={
                  cameraPermission === "granted"
                    ? startScanner
                    : requestCameraPermission
                }
                disabled={isScanning}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  isScanning
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isScanning ? "Escaneando..." : "Iniciar escaneo"}
              </button>
            )}
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
              onClick={() => router.push("/dashboard")}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>

      {/* Estilos para la animación de escaneo */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
          }
          25% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          }
          50% {
            clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
          }
          75% {
            clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%);
          }
          100% {
            clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
          }
        }

        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScanQRPage;
