'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { validarTamañoArchivo, validarTipoArchivo, formatearTamañoArchivo } from '@/lib/utils';
import { UBICACIONES, CATEGORIAS } from '@/types';
import type { Categoria } from '@/types';

interface ReporteFormData {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  categoria: Categoria;
}

export default function ReporteForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReporteFormData>();

  // Manejo de archivo
  const handleFileSelect = useCallback((file: File) => {
    // Validar tipo
    if (!validarTipoArchivo(file)) {
      toast.error('Solo se permiten imágenes JPG, JPEG o PNG');
      return;
    }

    // Validar tamaño (5MB)
    if (!validarTamañoArchivo(file, 5)) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    setFotoFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setFotoFile(null);
    setPreviewUrl(null);
  };

  // Envío del formulario
  const onSubmit = async (data: ReporteFormData) => {
    try {
      setIsSubmitting(true);

      // Crear FormData
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      formData.append('descripcion', data.descripcion);
      formData.append('ubicacion', data.ubicacion);
      formData.append('categoria', data.categoria);
      
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      // Enviar al servidor
      await api.post('/reportes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('¡Reporte creado exitosamente!');
      reset();
      setFotoFile(null);
      setPreviewUrl(null);
      
      // Redirigir a la lista de reportes
      router.push('/estudiante/reportes');
    } catch (error: any) {
      console.error('Error al crear reporte:', error);
      const mensaje = error.response?.data?.mensaje || 'Error al crear el reporte';
      toast.error(mensaje);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Título */}
      <Input
        label="Título del reporte"
        placeholder="Ej: Luz fundida en aula 203"
        error={errors.titulo?.message}
        required
        {...register('titulo', {
          required: 'El título es requerido',
          minLength: { value: 5, message: 'El título debe tener al menos 5 caracteres' },
          maxLength: { value: 100, message: 'El título no puede superar los 100 caracteres' }
        })}
      />

      {/* Descripción */}
      <Textarea
        label="Descripción detallada"
        placeholder="Describe el problema con el mayor detalle posible..."
        error={errors.descripcion?.message}
        required
        rows={5}
        {...register('descripcion', {
          required: 'La descripción es requerida',
          minLength: { value: 10, message: 'La descripción debe tener al menos 10 caracteres' }
        })}
      />

      {/* Ubicación y Categoría en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Ubicación"
          required
          error={errors.ubicacion?.message}
          options={[
            { value: '', label: 'Selecciona una ubicación' },
            ...UBICACIONES.map(u => ({ value: u, label: u }))
          ]}
          {...register('ubicacion', {
            required: 'La ubicación es requerida'
          })}
        />

        <Select
          label="Categoría"
          required
          error={errors.categoria?.message}
          options={[
            { value: '', label: 'Selecciona una categoría' },
            ...CATEGORIAS.map(c => ({ value: c.value, label: c.label }))
          ]}
          {...register('categoria', {
            required: 'La categoría es requerida'
          })}
        />
      </div>

      {/* Upload de Foto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Foto (opcional)
        </label>
        
        {!previewUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, JPEG o PNG - Máximo 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {fotoFile && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm">
                {fotoFile.name} - {formatearTamañoArchivo(fotoFile.size)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
