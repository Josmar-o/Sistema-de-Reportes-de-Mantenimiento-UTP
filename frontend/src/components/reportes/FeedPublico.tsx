'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import LoadingSpinner from '../ui/LoadingSpinner';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  categoria: string;
  fotoUrl?: string;
  estado: string;
  prioridad: string;
  creadoEn: string;
  actualizadoEn: string;
  usuario: {
    id: number;
    nombre: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function FeedPublico() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    cargarFeedPublico();
  }, [pagination.page]);

  const cargarFeedPublico = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reportes/feed-publico', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });

      if (response.data.success) {
        setReportes(response.data.data.reportes);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error al cargar feed público:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarPagina = (nuevaPagina: number) => {
    setPagination(prev => ({
      ...prev,
      page: nuevaPagina
    }));
  };

  const getCategoriaColor = (categoria: string) => {
    const colores: Record<string, string> = {
      'Infraestructura': 'bg-blue-100 text-blue-800',
      'Equipamiento': 'bg-purple-100 text-purple-800',
      'Limpieza': 'bg-green-100 text-green-800',
      'Seguridad': 'bg-red-100 text-red-800',
      'Servicios': 'bg-yellow-100 text-yellow-800',
      'Otro': 'bg-gray-100 text-gray-800'
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading && reportes.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Feed Público de Casos Resueltos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Reportes recientemente resueltos ({pagination.total} total)
            </p>
          </div>
        </div>

        {reportes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay reportes resueltos públicos disponibles
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reportes.map((reporte) => (
                <div
                  key={reporte.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reporte.titulo}
                        </h3>
                        <Badge
                          variant="success"
                          className="text-xs"
                        >
                          ✓ Resuelto
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">
                        {reporte.descripcion}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Ubicación:</span>
                          <span>{reporte.ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(reporte.categoria)}`}>
                            {reporte.categoria}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Resuelto hace:</span>
                          <span>
                            {formatDistanceToNow(new Date(reporte.fechaResolucion || reporte.actualizadoEn), {
                              addSuffix: false,
                              locale: es
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {reporte.fotoUrl && (
                      <div className="ml-4 flex-shrink-0">
                        <img
                          src={reporte.fotoUrl}
                          alt={reporte.titulo}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Página {pagination.page} de {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarPagina(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => cambiarPagina(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
