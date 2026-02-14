'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ESTADOS, CATEGORIAS, PRIORIDADES, UBICACIONES } from '@/types';
import type { FiltrosReportes } from '@/types';

interface FiltrosReportesProps {
  onFiltrosChange: (filtros: FiltrosReportes) => void;
  resultadosCount?: number;
  mostrarPrioridad?: boolean;
}

export default function FiltrosReportesComponent({ 
  onFiltrosChange, 
  resultadosCount,
  mostrarPrioridad = false 
}: FiltrosReportesProps) {
  const [filtros, setFiltros] = useState<FiltrosReportes>({});

  const handleInputChange = (field: keyof FiltrosReportes, value: string) => {
    const nuevosFiltros = {
      ...filtros,
      [field]: value || undefined,
    };
    setFiltros(nuevosFiltros);
  };

  const handleAplicarFiltros = () => {
    onFiltrosChange(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({});
    onFiltrosChange({});
  };

  const hayFiltrosActivos = Object.values(filtros).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtros
        </h3>
        {resultadosCount !== undefined && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {resultadosCount} resultado{resultadosCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={filtros.busqueda || ''}
          onChange={(e) => handleInputChange('busqueda', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Filtros en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado */}
        <Select
          label="Estado"
          value={filtros.estado || ''}
          onChange={(e) => handleInputChange('estado', e.target.value)}
          options={[
            { value: '', label: 'Todos los estados' },
            ...ESTADOS.map(e => ({ value: e.value, label: e.label }))
          ]}
        />

        {/* Ubicación */}
        <Select
          label="Ubicación"
          value={filtros.ubicacion || ''}
          onChange={(e) => handleInputChange('ubicacion', e.target.value)}
          options={[
            { value: '', label: 'Todas las ubicaciones' },
            ...UBICACIONES.map(u => ({ value: u, label: u }))
          ]}
        />

        {/* Categoría */}
        <Select
          label="Categoría"
          value={filtros.categoria || ''}
          onChange={(e) => handleInputChange('categoria', e.target.value)}
          options={[
            { value: '', label: 'Todas las categorías' },
            ...CATEGORIAS.map(c => ({ value: c.value, label: c.label }))
          ]}
        />

        {/* Prioridad (solo para personal y admin) */}
        {mostrarPrioridad && (
          <Select
            label="Prioridad"
            value={filtros.prioridad || ''}
            onChange={(e) => handleInputChange('prioridad', e.target.value)}
            options={[
              { value: '', label: 'Todas las prioridades' },
              ...PRIORIDADES.map(p => ({ value: p.value, label: p.label }))
            ]}
          />
        )}
      </div>

      {/* Rango de fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Desde"
          value={filtros.fechaDesde || ''}
          onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
        />
        <Input
          type="date"
          label="Hasta"
          value={filtros.fechaHasta || ''}
          onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleAplicarFiltros}
          className="flex-1"
        >
          Aplicar Filtros
        </Button>
        {hayFiltrosActivos && (
          <Button
            onClick={handleLimpiarFiltros}
            variant="outline"
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
