'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, User } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ReporteDetalle from './ReporteDetalle';
import { formatearFechaRelativa, truncarTexto, cn } from '@/lib/utils';
import { ESTADOS } from '@/types';
import type { Reporte, EstadoReporte } from '@/types';

interface ReporteCardProps {
  reporte: Reporte;
  onEstadoChange?: (reporteId: number, nuevoEstado: EstadoReporte) => Promise<void>;
  esPersonalOAdmin?: boolean;
  onClick?: () => void;
}

export default function ReporteCard({ 
  reporte, 
  onEstadoChange, 
  esPersonalOAdmin = false,
  onClick 
}: ReporteCardProps) {
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isChangingEstado, setIsChangingEstado] = useState(false);

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onEstadoChange) return;
    
    e.stopPropagation();
    const nuevoEstado = e.target.value as EstadoReporte;
    
    try {
      setIsChangingEstado(true);
      await onEstadoChange(reporte.id, nuevoEstado);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsChangingEstado(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsDetalleOpen(true);
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
      >
        {/* Imagen */}
        {reporte.fotoUrl && (
          <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
            <Image
              src={reporte.fotoUrl}
              alt={reporte.titulo}
              fill
              className="object-cover"
            />
          </div>
        )}
        {!reporte.fotoUrl && (
          <div className="h-48 w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-600" />
          </div>
        )}

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {reporte.titulo}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {truncarTexto(reporte.descripcion, 100)}
          </p>

          {/* Metadatos */}
          <div className="space-y-2">
            {/* Ubicación */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{reporte.ubicacion}</span>
            </div>

            {/* Usuario que reportó */}
            {reporte.usuario && esPersonalOAdmin && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1" />
                <span className="truncate">{reporte.usuario.nombre}</span>
              </div>
            )}

            {/* Fecha */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatearFechaRelativa(reporte.creadoEn)}</span>
            </div>
          </div>

          {/* Badges y Estado */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <Badge estado={reporte.estado}>
              {ESTADOS.find(e => e.value === reporte.estado)?.label}
            </Badge>

            {reporte.prioridad && (
              <Badge prioridad={reporte.prioridad} size="sm">
                {reporte.prioridad}
              </Badge>
            )}
          </div>

          {/* Cambio de estado (solo para personal y admin) */}
          {esPersonalOAdmin && onEstadoChange && (
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                value={reporte.estado}
                onChange={handleEstadoChange}
                disabled={isChangingEstado}
                options={[
                  { value: '', label: 'Cambiar estado...' },
                  ...ESTADOS.map(e => ({ value: e.value, label: e.label }))
                ]}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      <Modal
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
        size="lg"
      >
        <ReporteDetalle reporte={reporte} />
      </Modal>
    </>
  );
}
