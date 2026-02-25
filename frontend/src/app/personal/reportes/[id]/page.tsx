'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import ReporteDetalle from '@/components/reportes/ReporteDetalle';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ESTADOS, PRIORIDADES } from '@/types';
import type { Reporte, EstadoReporte, Prioridad } from '@/types';

export default function ReporteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const reporteId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [estado, setEstado] = useState<EstadoReporte>('pendiente');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [notaPersonal, setNotaPersonal] = useState('');
  const [publicInFeed, setPublicInFeed] = useState(false);

  useEffect(() => {
    if (reporteId) {
      fetchReporte();
    }
  }, [reporteId]);

  // Resetear publicInFeed cuando el estado cambia y no es resuelto
  useEffect(() => {
    if (estado !== 'resuelto') {
      setPublicInFeed(false);
    }
  }, [estado]);

  const fetchReporte = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/reportes/${reporteId}`);
      const data = response.data.data;
      setReporte(data);
      setEstado(data.estado);
      setPrioridad(data.prioridad || 'media');
      setNotaPersonal(data.notaPersonal || '');
      setPublicInFeed(data.publicInFeed || false);
    } catch (error: any) {
      console.error('Error al cargar reporte:', error);
      toast.error('Error al cargar el reporte');
      router.push('/personal/reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarCambios = async () => {
    if (!reporte) return;

    try {
      setIsSaving(true);
      
      const dataToSend = {
        estado,
        prioridad,
        nota_personal: notaPersonal,
        publicInFeed: estado === 'resuelto' ? publicInFeed : false,
      };
      
      console.log('=== ENVIANDO AL BACKEND ===');
      console.log('Datos a enviar:', dataToSend);
      
      // Actualizar estado, prioridad, nota y publicInFeed
      await api.put(`/reportes/${reporte.id}`, dataToSend);

      toast.success('Cambios guardados correctamente');
      
      // Recargar el reporte
      await fetchReporte();
    } catch (error: any) {
      console.error('Error al guardar cambios:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarcarResuelto = async () => {
    if (!reporte) return;

    try {
      setIsSaving(true);
      
      await api.put(`/reportes/${reporte.id}`, {
        estado: 'resuelto',
        nota_personal: notaPersonal,
      });

      toast.success('Reporte marcado como resuelto');
      
      // Redirigir a la lista de reportes
      router.push('/personal/reportes');
    } catch (error: any) {
      console.error('Error al marcar como resuelto:', error);
      toast.error('Error al marcar el reporte como resuelto');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
            <div className="mb-6 sm:mb-8 flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  Detalle del Reporte
                </h1>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner size="lg" className="py-12" />
            ) : !reporte ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontró el reporte
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Información del Reporte */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <ReporteDetalle reporte={reporte} />
                  </div>
                </div>

                {/* Panel de Acciones */}
                <div className="space-y-6">
                  {/* Cambiar Estado */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Gestionar Reporte
                    </h3>
                    
                    <div className="space-y-4">
                      <Select
                        label="Estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value as EstadoReporte)}
                        options={ESTADOS.map(e => ({ value: e.value, label: e.label }))}
                      />

                      <Select
                        label="Prioridad"
                        value={prioridad}
                        onChange={(e) => setPrioridad(e.target.value as Prioridad)}
                        options={PRIORIDADES.map(p => ({ value: p.value, label: p.label }))}
                      />

                      {/* Checkbox para Feed Público */}
                      {estado === 'resuelto' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={publicInFeed}
                              onChange={(e) => setPublicInFeed(e.target.checked)}
                              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Publicar en Feed Público
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Mostrar este reporte resuelto en el feed público como prueba de actividad
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agregar Nota */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Agregar Nota
                    </h3>
                    
                    <Textarea
                      placeholder="Escribe una nota sobre el progreso o estado del reporte..."
                      value={notaPersonal}
                      onChange={(e) => setNotaPersonal(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Botones de Acción */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleGuardarCambios}
                      isLoading={isSaving}
                      disabled={isSaving}
                      className="w-full"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Guardar Cambios
                    </Button>

                    {estado !== 'resuelto' && (
                      <Button
                        onClick={handleMarcarResuelto}
                        isLoading={isSaving}
                        disabled={isSaving}
                        variant="secondary"
                        className="w-full"
                      >
                        Marcar como Resuelto
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
    </>
  );
}
