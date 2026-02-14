'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
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
  const [nuevaNota, setNuevaNota] = useState('');

  useEffect(() => {
    if (reporteId) {
      fetchReporte();
    }
  }, [reporteId]);

  const fetchReporte = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/reportes/${reporteId}`);
      setReporte(data);
      setEstado(data.estado);
      setPrioridad(data.prioridad || 'media');
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
      
      // Actualizar estado y prioridad
      await api.patch(`/reportes/${reporte.id}`, {
        estado,
        prioridad,
      });

      // Agregar nota si hay texto
      if (nuevaNota.trim()) {
        await api.post(`/reportes/${reporte.id}/notas`, {
          contenido: nuevaNota,
        });
        setNuevaNota('');
      }

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
      
      await api.patch(`/reportes/${reporte.id}`, {
        estado: 'resuelto',
      });

      if (nuevaNota.trim()) {
        await api.post(`/reportes/${reporte.id}/notas`, {
          contenido: nuevaNota,
        });
        setNuevaNota('');
      }

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
    <ProtectedRoute allowedRoles={['personal']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
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
                    </div>
                  </div>

                  {/* Agregar Nota */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Agregar Nota
                    </h3>
                    
                    <Textarea
                      placeholder="Escribe una nota sobre el progreso o estado del reporte..."
                      value={nuevaNota}
                      onChange={(e) => setNuevaNota(e.target.value)}
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
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
