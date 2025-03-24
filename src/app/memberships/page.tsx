'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';
import { membershipsService } from '@/services/api';

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_popular?: boolean;
}

const MembershipsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const data = await membershipsService.getAll();
        setPlans(data);
      } catch (error) {
        console.error('Error al cargar membresías:', error);
        toast.error('No se pudieron cargar los planes de membresía');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  const handleSelectPlan = (plan: MembershipPlan) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para adquirir una membresía');
      router.push('/login');
      return;
    }

    // Aquí se podría implementar la lógica para procesar el pago
    // Por ahora, simplemente redirigimos al dashboard
    toast.success(`Has seleccionado el plan ${plan.name}`);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si no hay planes disponibles en la API, mostramos planes predeterminados
  const defaultPlans: MembershipPlan[] = [
    {
      id: '1',
      name: 'Plan Básico',
      description: 'Ideal para principiantes',
      price: 2000,
      duration_days: 30,
      features: [
        'Acceso a sala de musculación',
        'Horario limitado (8:00 - 18:00)',
        'Evaluación inicial',
      ],
    },
    {
      id: '2',
      name: 'Plan Estándar',
      description: 'Nuestro plan más popular',
      price: 3000,
      duration_days: 30,
      features: [
        'Acceso a sala de musculación',
        'Acceso a clases grupales',
        'Horario completo',
        'Evaluación mensual',
      ],
      is_popular: true,
    },
    {
      id: '3',
      name: 'Plan Premium',
      description: 'La experiencia completa',
      price: 4500,
      duration_days: 30,
      features: [
        'Acceso a sala de musculación',
        'Acceso a clases grupales',
        'Horario completo',
        'Evaluación semanal',
        'Entrenador personal (2 sesiones)',
        'Acceso a sauna',
      ],
    },
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <BackgroundLogo opacity={0.03} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Planes de Membresía
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y objetivos
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.is_popular ? 'ring-2 ring-gray-900' : ''
              }`}
            >
              {plan.is_popular && (
                <div className="absolute top-0 right-0 -mt-3 mr-3">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-900 text-white">
                    Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mes</span>
                </p>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="mt-8 block w-full bg-gray-900 border border-gray-900 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-700"
                >
                  Seleccionar plan
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900">Incluye:</h4>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-gray-500">
            ¿Tienes preguntas sobre nuestros planes? Contáctanos al{' '}
            <a href="tel:+123456789" className="font-medium text-gray-900 underline">
              +54 11 1234-5678
            </a>{' '}
            o visita nuestro gimnasio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipsPage;
