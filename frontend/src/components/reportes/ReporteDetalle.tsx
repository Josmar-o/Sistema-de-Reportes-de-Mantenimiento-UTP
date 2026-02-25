'use client';

import Image from 'next/image';
import { MapPin, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatearFecha, formatearFechaRelativa } from '@/lib/utils';
import { ESTADOS, CATEGORIAS } from '@/types';
import type { Reporte } from '@/types';

interface ReporteDetalleProps {
  reporte: Reporte;
}

export default function ReporteDetalle({ reporte }: ReporteDetalleProps) {
  return (
    <div className="space-y-6">
      {/* Imagen */}
      {reporte.fotoUrl && (
        <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            src={reporte.fotoUrl}
            alt={reporte.titulo}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {reporte.titulo}
        </h2>
        <div className="flex items-center gap-2">
          <Badge estado={reporte.estado}>
            {ESTADOS.find(e => e.value === reporte.estado)?.label}
          </Badge>
          {reporte.prioridad && (
            <Badge prioridad={reporte.prioridad}>
              {reporte.prioridad.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </h3>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {reporte.descripcion}
        </p>
      </div>

      {/* Información del reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ubicación */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ubicación
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {reporte.ubicacion}
            </p>
          </div>
        </div>

        {/* Categoría */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {CATEGORIAS.find(c => c.value === reporte.categoria)?.label || reporte.categoria}
            </p>
          </div>
        </div>

        {/* Reportado por */}
        {reporte.usuario && (
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reportado por
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reporte.usuario.nombre}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {reporte.usuario.email}
              </p>
            </div>
          </div>
        )}

        {/* Fecha de creación */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de creación
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatearFecha(reporte.creadoEn, 'PPpp')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatearFechaRelativa(reporte.creadoEn)}
            </p>
          </div>
        </div>
      </div>

      {/* Nota del Personal */}
      {reporte.notaPersonal && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Nota del Personal
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {reporte.notaPersonal}
            </p>
          </div>
        </div>
      )}

      {/* ID del reporte (para referencia) */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ID del reporte: #{reporte.id}
        </p>
      </div>
    </div>
  );
}
