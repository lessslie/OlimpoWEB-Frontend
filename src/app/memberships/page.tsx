'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import toast from 'react-hot-toast';
import { membershipsService } from '@/services/api';

// Esta es una página temporal para resolver problemas de IDE
// La funcionalidad de membresías se ha movido a la sección de administración

export default function MembershipsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página de inicio
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <BackgroundLogo opacity={0.03} />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirigiendo...</h1>
        <p className="mt-2">Esta página ha sido movida.</p>
      </div>
    </div>
  );
}
