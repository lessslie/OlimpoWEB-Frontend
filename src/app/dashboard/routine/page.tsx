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
}

const RoutinePage = () => {
  const { user, isAuthenticated, loading } = useAuth();
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
      
      // En un entorno real, esto sería una llamada a la API
      // const response = await fetch(`/api/users/${user.id}/routine`);
      // const data = await response.json();
      // setRoutine(data);
      
      // Simulamos datos para la demostración
      const mockRoutine: Exercise[] = [
        // Lunes - Pecho y Tríceps
        { id: '1', name: 'Press de banca', sets: 4, reps: '8-10', rest: '90 seg', day: 'Lunes' },
        { id: '2', name: 'Press inclinado con mancuernas', sets: 3, reps: '10-12', rest: '60 seg', day: 'Lunes' },
        { id: '3', name: 'Aperturas en máquina', sets: 3, reps: '12-15', rest: '60 seg', day: 'Lunes' },
        { id: '4', name: 'Fondos en paralelas', sets: 3, reps: '10-12', rest: '60 seg', day: 'Lunes' },
        { id: '5', name: 'Extensiones de tríceps en polea', sets: 3, reps: '12-15', rest: '60 seg', day: 'Lunes' },
        
        // Martes - Espalda y Bíceps
        { id: '6', name: 'Dominadas', sets: 4, reps: 'Máximas', rest: '90 seg', day: 'Martes' },
        { id: '7', name: 'Remo con barra', sets: 3, reps: '8-10', rest: '90 seg', day: 'Martes' },
        { id: '8', name: 'Remo en máquina', sets: 3, reps: '10-12', rest: '60 seg', day: 'Martes' },
        { id: '9', name: 'Curl de bíceps con barra', sets: 3, reps: '10-12', rest: '60 seg', day: 'Martes' },
        { id: '10', name: 'Curl martillo', sets: 3, reps: '12-15', rest: '60 seg', day: 'Martes' },
        
        // Miércoles - Piernas
        { id: '11', name: 'Sentadillas', sets: 4, reps: '8-10', rest: '120 seg', day: 'Miércoles' },
        { id: '12', name: 'Prensa de piernas', sets: 3, reps: '10-12', rest: '90 seg', day: 'Miércoles' },
        { id: '13', name: 'Extensiones de cuádriceps', sets: 3, reps: '12-15', rest: '60 seg', day: 'Miércoles' },
        { id: '14', name: 'Curl femoral', sets: 3, reps: '12-15', rest: '60 seg', day: 'Miércoles' },
        { id: '15', name: 'Elevaciones de pantorrilla', sets: 4, reps: '15-20', rest: '60 seg', day: 'Miércoles' },
        
        // Jueves - Hombros y Trapecios
        { id: '16', name: 'Press militar', sets: 4, reps: '8-10', rest: '90 seg', day: 'Jueves' },
        { id: '17', name: 'Elevaciones laterales', sets: 3, reps: '12-15', rest: '60 seg', day: 'Jueves' },
        { id: '18', name: 'Elevaciones frontales', sets: 3, reps: '12-15', rest: '60 seg', day: 'Jueves' },
        { id: '19', name: 'Pájaros', sets: 3, reps: '12-15', rest: '60 seg', day: 'Jueves' },
        { id: '20', name: 'Encogimientos con barra', sets: 4, reps: '12-15', rest: '60 seg', day: 'Jueves' },
        
        // Viernes - Full Body
        { id: '21', name: 'Press de banca', sets: 3, reps: '10-12', rest: '60 seg', day: 'Viernes' },
        { id: '22', name: 'Remo con mancuerna', sets: 3, reps: '10-12', rest: '60 seg', day: 'Viernes' },
        { id: '23', name: 'Sentadillas', sets: 3, reps: '10-12', rest: '60 seg', day: 'Viernes' },
        { id: '24', name: 'Press militar', sets: 3, reps: '10-12', rest: '60 seg', day: 'Viernes' },
        { id: '25', name: 'Curl de bíceps', sets: 3, reps: '10-12', rest: '60 seg', day: 'Viernes' },
      ];
      
      setRoutine(mockRoutine);
    } catch (error) {
      console.error('Error al cargar la rutina:', error);
      toast.error('No se pudo cargar tu rutina');
    } finally {
      setLoadingRoutine(false);
    }
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const activeDays = Array.from(new Set(routine.map(exercise => exercise.day)));
  
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
              <div className="flex space-x-1 overflow-x-auto">
                {days.filter(day => activeDays.includes(day)).map(day => (
                  <button
                    key={day}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeDay === day
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveDay(day)}
                  >
                    {day}
                  </button>
                ))}
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
