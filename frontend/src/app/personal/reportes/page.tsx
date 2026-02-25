'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReporteCard from '@/components/reportes/ReporteCard';
import FiltrosReportes from '@/components/reportes/FiltrosReportes';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import type { Reporte, FiltrosReportes as FiltrosType, EstadoReporte } from '@/types';

export default function PersonalReportesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<Reporte[]>([]);
  const [filtros, setFiltros] = useState<FiltrosType>({});

  useEffect(() => {
    fetchReportes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reportes]);

  const fetchReportes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/reportes');
      const reportesData = response.data.data.reportes || [];
      setReportes(reportesData);
      setReportesFiltrados(reportesData);
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...reportes];

    if (filtros.estado) {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }

    if (filtros.ubicacion) {
      resultado = resultado.filter(r => r.ubicacion === filtros.ubicacion);
    }

    if (filtros.categoria) {
      resultado = resultado.filter(r => r.categoria === filtros.categoria);
    }

    if (filtros.prioridad) {
      resultado = resultado.filter(r => r.prioridad === filtros.prioridad);
    }

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(r => 
        r.titulo.toLowerCase().includes(busquedaLower) ||
        r.descripcion.toLowerCase().includes(busquedaLower) ||
        r.usuario?.nombre.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtros.fechaDesde) {
      resultado = resultado.filter(r => 
        new Date(r.creadoEn) >= new Date(filtros.fechaDesde!)
      );
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      resultado = resultado.filter(r => 
        new Date(r.creadoEn) <= fechaHasta
      );
    }

    setReportesFiltrados(resultado);
  };

  const handleCambiarEstado = async (reporteId: number, nuevoEstado: EstadoReporte) => {
    try {
      await api.patch(`/reportes/${reporteId}`, { estado: nuevoEstado });
      
      // Actualizar el reporte en el estado local
      setReportes(prevReportes =>
        prevReportes.map(r =>
          r.id === reporteId ? { ...r, estado: nuevoEstado } : r
        )
      );
      
      toast.success('Estado actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
      throw error;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Todos los Reportes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona y da seguimiento a todos los reportes del sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <FiltrosReportes 
          onFiltrosChange={setFiltros}
          resultadosCount={reportesFiltrados.length}
          mostrarPrioridad
        />
      </div>

      {/* Lista de Reportes */}
      {isLoading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : reportes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay reportes en el sistema
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Los reportes aparecerán aquí cuando los estudiantes los creen
                </p>
              </div>
            ) : reportesFiltrados.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron reportes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportesFiltrados.map((reporte) => (
                  <ReporteCard 
                    key={reporte.id} 
                    reporte={reporte}
                    esPersonalOAdmin
                    onEstadoChange={handleCambiarEstado}
                    onClick={() => router.push(`/personal/reportes/${reporte.id}`)}
                  />
                ))}
              </div>
            )}
    </>
  );
}
