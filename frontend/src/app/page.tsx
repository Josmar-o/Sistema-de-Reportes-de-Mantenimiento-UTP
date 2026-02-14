'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, usuario } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && usuario) {
        // Redirigir al dashboard según el rol
        const dashboardRoutes = {
          estudiante: '/estudiante/dashboard',
          personal: '/personal/dashboard',
          admin: '/admin/dashboard',
        };
        router.push(dashboardRoutes[usuario.rol]);
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, usuario, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <LoadingSpinner size="lg" />
    </div>
  );
}
