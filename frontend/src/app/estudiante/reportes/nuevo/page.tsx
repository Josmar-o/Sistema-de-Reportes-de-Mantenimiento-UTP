'use client';

import ReporteForm from '@/components/reportes/ReporteForm';

export default function NuevoReportePage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
    </>
  );
}
