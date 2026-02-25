'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { KeyRound, CheckCircle, XCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FormData {
  password: string;
  confirmar: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exito, setExito] = useState(false);
  const [tokenInvalido, setTokenInvalido] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch('password');

  useEffect(() => {
    if (!token) setTokenInvalido(true);
  }, [token]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/auth/reset-password', { token, password: data.password });
      setExito(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setTokenInvalido(true);
      } else {
        toast.error('Error al restablecer la contraseña.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nueva contraseña
            </h1>
          </div>

          {tokenInvalido ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Enlace inválido o expirado
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                El enlace de recuperación expiró o ya fue usado. Solicita uno nuevo.
              </p>
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : exito ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¡Contraseña restablecida!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                type="password" label="Nueva contraseña" placeholder="••••••••"
                error={errors.password?.message} required
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
              />
              <Input
                type="password" label="Confirmar contraseña" placeholder="••••••••"
                error={errors.confirmar?.message} required
                {...register('confirmar', {
                  required: 'Confirma tu contraseña',
                  validate: (value) => value === password || 'Las contraseñas no coinciden'
                })}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
                <KeyRound className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
