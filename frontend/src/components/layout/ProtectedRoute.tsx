'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Rol } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Rol[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, usuario, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Si hay roles especificados, validar que el usuario tenga uno de esos roles
      if (allowedRoles && allowedRoles.length > 0) {
        if (!hasRole(allowedRoles)) {
          // Redirigir al dashboard correspondiente según el rol del usuario
          const dashboardRoutes: Record<Rol, string> = {
            estudiante: '/estudiante/dashboard',
            personal: '/personal/dashboard',
            admin: '/admin/dashboard',
          };
          
          if (usuario) {
            router.push(dashboardRoutes[usuario.rol]);
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, hasRole, allowedRoles, router, usuario]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si hay roles especificados y el usuario no tiene el rol correcto, no mostrar nada
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
