'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { formatearFechaRelativa } from '@/lib/utils';
import type { Reporte } from '@/types';

export default function PersonalDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportesPendientes, setReportesPendientes] = useState<Reporte[]>([]);
  const [stats, setStats] = useState({
    pendientes: 0,
    enProceso: 0,
    resueltosHoy: 0,
    resueltosSemana: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todos los reportes
      const { data: reportes } = await api.get('/reportes');
      
      // Calcular estadísticas
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const semanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const stats = {
        pendientes: reportes.filter((r: Reporte) => r.estado === 'pendiente').length,
        enProceso: reportes.filter((r: Reporte) => r.estado === 'en_proceso').length,
        resueltosHoy: reportes.filter((r: Reporte) => 
          r.estado === 'resuelto' && new Date(r.actualizadoEn) >= hoy
        ).length,
        resueltosSemana: reportes.filter((r: Reporte) => 
          r.estado === 'resuelto' && new Date(r.actualizadoEn) >= semanaAtras
        ).length,
      };
      
      setStats(stats);
      
      // Obtener reportes pendientes (máximo 10)
      const pendientes = reportes
        .filter((r: Reporte) => r.estado === 'pendiente')
        .sort((a: Reporte, b: Reporte) => 
          new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
        )
        .slice(0, 10);
      
      setReportesPendientes(pendientes);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Reportes Pendientes',
      value: stats.pendientes,
      icon: AlertCircle,
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
      label: 'Resueltos Hoy',
      value: stats.resueltosHoy,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-100',
    },
    {
      label: 'Resueltos Esta Semana',
      value: stats.resueltosSemana,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-100',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['personal']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard de Personal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona y da seguimiento a todos los reportes de mantenimiento
              </p>
            </div>

            {isLoading ? (
              <LoadingSpinner size="lg" className="py-12" />
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

                {/* Reportes Pendientes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Reportes Pendientes
                      </h2>
                      <Link href="/personal/reportes">
                        <Button variant="outline" size="sm">
                          Ver Todos
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportesPendientes.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          ¡Excelente! No hay reportes pendientes
                        </p>
                      </div>
                    ) : (
                      reportesPendientes.map((reporte) => (
                        <Link
                          key={reporte.id}
                          href={`/personal/reportes/${reporte.id}`}
                          className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                {reporte.titulo}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                                {reporte.descripcion}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>{reporte.ubicacion}</span>
                                <span>•</span>
                                <span>{reporte.usuario?.nombre}</span>
                                <span>•</span>
                                <span>{formatearFechaRelativa(reporte.creadoEn)}</span>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <Badge estado={reporte.estado}>Pendiente</Badge>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
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
