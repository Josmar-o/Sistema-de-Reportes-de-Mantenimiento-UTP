'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import ReporteForm from '@/components/reportes/ReporteForm';

export default function NuevoReportePage() {
  return (
    <ProtectedRoute allowedRoles={['estudiante']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Crear Nuevo Reporte
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Completa el formulario para reportar un problema de mantenimiento
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <ReporteForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
