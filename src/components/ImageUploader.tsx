'use client';

import { useState, useRef } from 'react';
import { uploadsService } from '@/services/api';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

const ImageUploader = ({ onImageUploaded, className = '' }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);

      // Simular progreso mientras se sube la imagen
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);

      // Subir imagen
      const response = await uploadsService.upload(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Obtener la URL de la imagen subida
      const imageUrl = uploadsService.getImageUrl(response.filename);
      
      // Notificar al componente padre
      onImageUploaded(imageUrl);
      
      toast.success('Imagen subida correctamente');
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
          ${isUploading ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <div className="w-full px-4">
                <div className="mb-2 text-center text-gray-500">Subiendo imagen... {progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Haz click para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF o WEBP (Máx. 5MB)</p>
              </>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
