'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound, Shield, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface CambiarPasswordForm {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export default function ConfiguracionPage() {
  const { usuario } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CambiarPasswordForm>();

  const passwordNueva = watch('passwordNueva');

  const onSubmit = async (data: CambiarPasswordForm) => {
    try {
      setIsSaving(true);
      await api.put('/auth/cambiar-password', {
        passwordActual: data.passwordActual,
        passwordNueva: data.passwordNueva,
      });
      toast.success('Contraseña actualizada correctamente');
      reset();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al cambiar la contraseña';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400">Administra la seguridad de tu cuenta</p>
      </div>

      <div className="w-full max-w-2xl space-y-6">

        {/* Info de la cuenta */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información de la cuenta</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Nombre</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{usuario?.nombre}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{usuario?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rol</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 capitalize">
                <CheckCircle className="h-3 w-3" />
                {usuario?.rol}
              </span>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <KeyRound className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cambiar contraseña</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="password"
              label="Contraseña actual"
              placeholder="••••••••"
              error={errors.passwordActual?.message}
              required
              {...register('passwordActual', {
                required: 'La contraseña actual es requerida',
              })}
            />
            <Input
              type="password"
              label="Nueva contraseña"
              placeholder="••••••••"
              error={errors.passwordNueva?.message}
              required
              {...register('passwordNueva', {
                required: 'La nueva contraseña es requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            <Input
              type="password"
              label="Confirmar nueva contraseña"
              placeholder="••••••••"
              error={errors.confirmarPassword?.message}
              required
              {...register('confirmarPassword', {
                required: 'Confirma tu nueva contraseña',
                validate: (value) => value === passwordNueva || 'Las contraseñas no coinciden',
              })}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                <KeyRound className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </>
  );
}
