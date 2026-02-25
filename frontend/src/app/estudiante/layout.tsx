'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function EstudianteLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['estudiante']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
