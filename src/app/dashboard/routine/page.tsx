'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import BackgroundLogo from '@/components/BackgroundLogo';
import { toast } from 'react-hot-toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  day: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

const RoutinePage = () => {
  const { user, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [activeDay, setActiveDay] = useState<string>('Lunes');

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user && user.has_routine) {
      fetchRoutine();
    } else if (!loading && !user?.has_routine) {
      router.push('/dashboard');
      toast.error('No tienes una rutina asignada');
    }
  }, [user, loading]);

  const fetchRoutine = async () => {
    try {
      setLoadingRoutine(true);
      
      if (!user || !user.id) {
        throw new Error('Usuario no encontrado');
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
      const response = await fetch(`${baseUrl}/routines/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar la rutina');
      }
      
      const data = await response.json();
      setRoutine(data);
    } catch (error) {
      console.error('Error al cargar la rutina:', error);
      toast.error('No se pudo cargar tu rutina');
    } finally {
      setLoadingRoutine(false);
    }
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const activeDays = Array.from(new Set(routine.map(exercise => exercise.day)));

  const getDayIcon = (day: string) => {
    switch (day) {
      case 'Lunes':
        return '💪';
      case 'Martes':
        return '🏋️';
      case 'Miércoles':
        return '🏃';
      case 'Jueves':
        return '⚡';
      case 'Viernes':
        return '🔥';
      case 'Sábado':
        return '🥊';
      case 'Domingo':
        return '🧘';
      default:
        return '📅';
    }
  };

  const getMuscleGroupsForDay = (exercises: Exercise[]) => {
    // Mapeo de ejercicios a grupos musculares
    const muscleGroupMap: {[key: string]: string[]} = {
      'Press de banca': ['Pecho', 'Tríceps'],
      'Press inclinado': ['Pecho', 'Hombros'],
      'Aperturas': ['Pecho'],
      'Fondos': ['Pecho', 'Tríceps'],
      'Extensiones de tríceps': ['Tríceps'],
      'Dominadas': ['Espalda', 'Bíceps'],
      'Remo': ['Espalda'],
      'Curl de bíceps': ['Bíceps'],
      'Curl martillo': ['Bíceps', 'Antebrazos'],
      'Sentadillas': ['Piernas', 'Glúteos'],
      'Prensa de piernas': ['Piernas'],
      'Extensiones de cuádriceps': ['Cuádriceps'],
      'Curl femoral': ['Isquiotibiales'],
      'Elevaciones de pantorrilla': ['Pantorrillas'],
      'Press militar': ['Hombros', 'Tríceps'],
      'Elevaciones laterales': ['Hombros'],
      'Elevaciones frontales': ['Hombros'],
      'Pájaros': ['Hombros', 'Espalda'],
      'Encogimientos': ['Trapecios']
    };
    
    // Conjunto para almacenar grupos musculares únicos
    const muscleGroups = new Set<string>();
    
    exercises.forEach(exercise => {
      // Buscar coincidencias parciales en el nombre del ejercicio
      Object.keys(muscleGroupMap).forEach(key => {
        if (exercise.name.toLowerCase().includes(key.toLowerCase())) {
          muscleGroupMap[key].forEach(group => muscleGroups.add(group));
        }
      });
    });
    
    // Si no se encontraron grupos musculares, mostrar un mensaje genérico
    if (muscleGroups.size === 0) {
      return 'Entrenamiento completo';
    }
    
    // Limitar a 3 grupos para no sobrecargar la UI
    return Array.from(muscleGroups).slice(0, 3).join(', ');
  };

  const filteredExercises = routine.filter(exercise => exercise.day === activeDay);

  if (loading || loadingRoutine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mi Rutina de Entrenamiento
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Rutina personalizada creada por tu entrenador
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Volver al Dashboard
            </button>
          </div>
          
          {/* Selector de días */}
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-3">
              <h4 className="text-md font-medium text-gray-900 mb-3">Selecciona tu día de entrenamiento:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {days.filter(day => activeDays.includes(day)).map(day => {
                  // Obtener los ejercicios para este día
                  const dayExercises = routine.filter(ex => ex.day === day);
                  // Obtener los grupos musculares trabajados (simplificado)
                  const muscleGroups = getMuscleGroupsForDay(dayExercises);
                  
                  return (
                    <button
                      key={day}
                      className={`px-4 py-3 text-sm font-medium rounded-md flex flex-col items-center justify-center transition-all ${
                        activeDay === day
                          ? 'bg-gray-900 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                      onClick={() => setActiveDay(day)}
                    >
                      <span className="text-lg mb-1">{getDayIcon(day)}</span>
                      <span className="font-semibold">{day}</span>
                      <span className="text-xs mt-1 text-center">
                        {muscleGroups}
                      </span>
                      <span className="text-xs mt-1">
                        {dayExercises.length} ejercicios
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Tabla de ejercicios */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ejercicio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Series
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repeticiones
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descanso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exercise.name}</div>
                        {exercise.mediaUrl && (
                          <div className="mt-2">
                            {exercise.mediaType === 'image' ? (
                              <img 
                                src={exercise.mediaUrl} 
                                alt={`Demostración de ${exercise.name}`} 
                                className="h-20 w-auto object-cover rounded cursor-pointer hover:opacity-90"
                                onClick={() => window.open(exercise.mediaUrl, '_blank')}
                              />
                            ) : (
                              <video 
                                src={exercise.mediaUrl} 
                                controls 
                                className="h-20 w-auto object-cover rounded"
                                controlsList="nodownload"
                              >
                                Tu navegador no soporta videos HTML5.
                              </video>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exercise.sets}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exercise.reps}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exercise.rest}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exercise.notes || '-'}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay ejercicios programados para este día
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Instrucciones generales */}
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-2">Instrucciones generales:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Realiza siempre un calentamiento adecuado de 5-10 minutos antes de comenzar tu rutina.</li>
              <li>Mantén una técnica correcta en todos los ejercicios para evitar lesiones.</li>
              <li>Respeta los tiempos de descanso indicados entre series.</li>
              <li>Bebe agua durante toda la sesión de entrenamiento.</li>
              <li>Si sientes dolor (no confundir con la sensación de esfuerzo), detén el ejercicio.</li>
              <li>Esta rutina está diseñada para 4-6 semanas. Después de este período, consulta con tu entrenador para actualizarla.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutinePage;
