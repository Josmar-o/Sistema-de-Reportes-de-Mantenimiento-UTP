'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, PlusCircle, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import ReporteCard from '@/components/reportes/ReporteCard';
import FeedPublico from '@/components/reportes/FeedPublico';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import type { Reporte } from '@/types';

export default function EstudianteDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  });

  useEffect(() => {
    fetchMisReportes();
  }, []);

  const fetchMisReportes = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/reportes/mis-reportes');
      
      // El backend devuelve { success, data: reportes }
      const reportesData = data.data || [];
      setReportes(reportesData);
      
      // Calcular estadísticas
      const stats = {
        total: reportesData.length,
        pendientes: reportesData.filter((r: Reporte) => r.estado === 'pendiente').length,
        enProceso: reportesData.filter((r: Reporte) => r.estado === 'en_proceso').length,
        resueltos: reportesData.filter((r: Reporte) => r.estado === 'resuelto').length,
      };
      setStats(stats);
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      toast.error('Error al cargar los reportes');
      setReportes([]); // Asegurarse de que reportes sea un array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Total de Reportes',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-100',
    },
    {
      label: 'Pendientes',
      value: stats.pendientes,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-100',
    },
    {
      label: 'En Proceso',
      value: stats.enProceso,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-100',
    },
    {
      label: 'Resueltos',
      value: stats.resueltos,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-100',
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mi Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona y visualiza tus reportes de mantenimiento
        </p>
      </div>

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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Botón Crear Reporte */}
          <div className="mb-8">
            <Link href="/estudiante/reportes/nuevo">
              <Button size="lg" className="w-full sm:w-auto">
                <PlusCircle className="h-5 w-5 mr-2" />
                Crear Nuevo Reporte
              </Button>
            </Link>
          </div>

          {/* Últimos Reportes */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Últimos Reportes
              </h2>
              {reportes.length > 3 && (
                <Link 
                  href="/estudiante/reportes"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Ver todos →
                </Link>
              )}
            </div>

            {isLoading ? (
              <LoadingSpinner size="lg" className="py-12" />
            ) : reportes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tienes reportes
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Comienza creando tu primer reporte de mantenimiento
                </p>
                <Link href="/estudiante/reportes/nuevo">
                  <Button>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Crear Primer Reporte
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportes.slice(0, 3).map((reporte) => (
                  <ReporteCard key={reporte.id} reporte={reporte} />
                ))}
              </div>
            )}
          </div>

          {/* Feed Público */}
          <div className="mt-12">
            <FeedPublico />
          </div>
    </>
  );
}
