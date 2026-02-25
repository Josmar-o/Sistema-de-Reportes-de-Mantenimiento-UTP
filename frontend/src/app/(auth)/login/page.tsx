'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LogIn, MailWarning } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import type { LoginCredentials } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailNoVerificado, setEmailNoVerificado] = useState('');
  const [reenviando, setReenviando] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginCredentials>();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/estudiante/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsSubmitting(true);
      setEmailNoVerificado('');
      await login(data);
    } catch (error: any) {
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailNoVerificado(data.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reenviarVerificacion = async () => {
    try {
      setReenviando(true);
      await api.post('/auth/reenviar-verificacion', { email: emailNoVerificado });
      toast.success('Correo de verificación reenviado. Revisa tu bandeja.');
    } catch {
      toast.error('Error al reenviar el correo.');
    } finally {
      setReenviando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bienvenido</h1>
            <p className="text-gray-600 dark:text-gray-400">Sistema de Reportes de Mantenimiento</p>
          </div>

          {/* Aviso email no verificado */}
          {emailNoVerificado && (
            <div className="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start gap-3">
              <MailWarning className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">Email no verificado</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Revisa tu correo y haz clic en el enlace de verificación.
                </p>
                <button
                  onClick={reenviarVerificacion}
                  disabled={reenviando}
                  className="text-xs text-yellow-800 dark:text-yellow-300 underline mt-2 disabled:opacity-50"
                >
                  {reenviando ? 'Reenviando...' : 'Reenviar correo de verificación'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              type="email" label="Email" placeholder="tu.correo@gmail.com"
              error={errors.email?.message} required
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' }
              })}
            />

            <div>
              <Input
                type="password" label="Contraseña" placeholder="••••••••"
                error={errors.password?.message} required
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
              />
              <div className="mt-1 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              <LogIn className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link href="/registro" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-white text-sm">
          <p>Universidad Tecnológica de Panamá</p>
          <p className="mt-1 text-primary-100">© 2026 Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}
