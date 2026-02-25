'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { calcularPorcentaje, formatearFecha } from '@/lib/utils';
import type { EstadisticasDashboard } from '@/types';

export default function AdminEstadisticasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<EstadisticasDashboard | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;

      const response = await api.get('/estadisticas', { params });
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltrar = () => {
    fetchEstadisticas();
  };

  const handleLimpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    fetchEstadisticas();
  };

  const handleExportarPDF = () => {
    toast.success('Exportando a PDF...');
    // TODO: Implementar exportación a PDF
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Estadísticas Avanzadas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis detallado del sistema de reportes
          </p>
        </div>
        <Button onClick={handleExportarPDF} variant="outline" className="self-start sm:self-auto">
          <Download className="h-5 w-5 mr-2" />
          Exportar PDF
        </Button>
      </div>

            {/* Filtros de Fecha */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filtrar por Rango de Fechas
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <Input
                  type="date"
                  label="Fecha de inicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
                <Input
                  type="date"
                  label="Fecha de fin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
                <div className="flex items-end gap-2">
                  <Button onClick={handleFiltrar} className="flex-1">
                    Filtrar
                  </Button>
                  <Button onClick={handleLimpiarFiltros} variant="outline">
                    Limpiar
                  </Button>
                </div>
              </div>
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
              <div className="space-y-8">
                {/* Resumen General */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Total de Reportes
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalReportes}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Tasa de Resolución
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {stats.tasaResolucion || calcularPorcentaje(stats.reportesResueltos, stats.totalReportes)}%
                    </div>
                  </div>
                  {stats.tiempoPromedioResolucion && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Tiempo Promedio
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.tiempoPromedioResolucion}h
                      </div>
                    </div>
                  )}
                </div>

                {/* Reportes por Categoría */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Reportes por Categoría
                  </h3>
                  <div className="space-y-4">
                    {(stats.reportesPorCategoria || []).map((item) => (
                      <div key={item.categoria}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                            {item.categoria.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600 dark:text-gray-400">
                              {calcularPorcentaje(item.total, stats.totalReportes)}%
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                              {item.total}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${calcularPorcentaje(item.total, stats.totalReportes)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reportes por Ubicación */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Reportes por Ubicación
                  </h3>
                  <div className="space-y-4">
                    {(stats.reportesPorUbicacion || []).map((item) => (
                      <div key={item.ubicacion}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {item.ubicacion}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600 dark:text-gray-400">
                              {calcularPorcentaje(item.total, stats.totalReportes)}%
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                              {item.total}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${calcularPorcentaje(item.total, stats.totalReportes)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reportes por Mes */}
                {stats.reportesPorMes && stats.reportesPorMes.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Tendencia por Mes
                    </h3>
                    <div className="space-y-4">
                      {stats.reportesPorMes.map((item) => (
                        <div key={item.mes} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300 font-medium min-w-[8rem]">
                            {item.mes}
                          </span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${calcularPorcentaje(item.total, Math.max(...stats.reportesPorMes.map(m => m.total)))}%` 
                                }}
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                            {item.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
    </>
  );
}
