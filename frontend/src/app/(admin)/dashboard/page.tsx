'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { calcularPorcentaje } from '@/lib/utils';
import type { EstadisticasDashboard } from '@/types';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<EstadisticasDashboard | null>(null);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/estadisticas');
      setStats(data);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = stats ? [
    {
      label: 'Total de Reportes',
      value: stats.totalReportes,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-100',
      change: '+12%',
    },
    {
      label: 'Pendientes',
      value: stats.reportesPendientes,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-100',
      change: '-5%',
    },
    {
      label: 'En Proceso',
      value: stats.reportesEnProceso,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-100',
      change: '+8%',
    },
    {
      label: 'Resueltos',
      value: stats.reportesResueltos,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-100',
      change: '+15%',
    },
  ] : [];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Vista general del sistema de reportes de mantenimiento
              </p>
            </div>

            {isLoading ? (
              <LoadingSpinner size="lg" className="py-12" />
            ) : !stats ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No se pudieron cargar las estadísticas
                </p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statsCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 ${stat.bgLight} dark:${stat.color}/20 rounded-lg`}>
                            <Icon className={`h-6 w-6 ${stat.textColor} dark:text-white`} />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {stat.value}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Métricas Adicionales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Tasa de Resolución */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tasa de Resolución
                    </h3>
                    <div className="flex items-end gap-4">
                      <div className="text-4xl font-bold text-green-600">
                        {stats.tasaResolucion || calcularPorcentaje(stats.reportesResueltos, stats.totalReportes)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        de reportes resueltos
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${stats.tasaResolucion || calcularPorcentaje(stats.reportesResueltos, stats.totalReportes)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Tiempo Promedio */}
                  {stats.tiempoPromedioResolucion && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tiempo Promedio de Resolución
                      </h3>
                      <div className="flex items-end gap-4">
                        <div className="text-4xl font-bold text-blue-600">
                          {stats.tiempoPromedioResolucion}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          horas
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reportes por Categoría y Ubicación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Por Categoría */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Reportes por Categoría
                    </h3>
                    <div className="space-y-3">
                      {stats.reportesPorCategoria.slice(0, 5).map((item) => (
                        <div key={item.categoria}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                              {item.categoria.replace(/_/g, ' ')}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {item.total}
                            </span>
                          </div>
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${calcularPorcentaje(item.total, stats.totalReportes)}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Por Ubicación */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Top 5 Ubicaciones
                    </h3>
                    <div className="space-y-3">
                      {stats.reportesPorUbicacion.slice(0, 5).map((item) => (
                        <div key={item.ubicacion}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.ubicacion}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {item.total}
                            </span>
                          </div>
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${calcularPorcentaje(item.total, stats.totalReportes)}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
