'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReporteCard from '@/components/reportes/ReporteCard';
import FiltrosReportes from '@/components/reportes/FiltrosReportes';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import type { Reporte, FiltrosReportes as FiltrosType } from '@/types';

export default function MisReportesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<Reporte[]>([]);
  const [filtros, setFiltros] = useState<FiltrosType>({});

  useEffect(() => {
    fetchMisReportes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reportes]);

  const fetchMisReportes = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/reportes/mis-reportes');
      const reportesData = data.data || [];
      setReportes(reportesData);
      setReportesFiltrados(reportesData);
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      toast.error('Error al cargar los reportes');
      setReportes([]);
      setReportesFiltrados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...reportes];

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }

    // Filtro por ubicación
    if (filtros.ubicacion) {
      resultado = resultado.filter(r => r.ubicacion === filtros.ubicacion);
    }

    // Filtro por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(r => r.categoria === filtros.categoria);
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(r => 
        r.titulo.toLowerCase().includes(busquedaLower) ||
        r.descripcion.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por fechas
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

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mis Reportes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza y gestiona todos tus reportes de mantenimiento
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <FiltrosReportes 
          onFiltrosChange={setFiltros}
          resultadosCount={reportesFiltrados.length}
        />
      </div>

      {/* Lista de Reportes */}
      {isLoading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : reportes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tienes reportes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comienza creando tu primer reporte de mantenimiento
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
            <ReporteCard key={reporte.id} reporte={reporte} />
          ))}
        </div>
      )}
    </>
  );
}
