'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validarEmail, validarEmailUTP } from '@/lib/utils';
import type { RegisterData } from '@/types';

interface RegisterFormData extends RegisterData {
  confirmarPassword: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  const password = watch('password');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/estudiante/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      const { confirmarPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (error) {
      // El error ya se maneja en el AuthContext con toast
    } finally {
      setIsSubmitting(false);
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
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-utp-red rounded-full mb-4">
              <span className="text-white font-bold text-2xl">UTP</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Regístrate para reportar problemas de mantenimiento
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              error={errors.nombre?.message}
              required
              {...register('nombre', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres'
                }
              })}
            />

            <Input
              type="email"
              label="Email institucional"
              placeholder="tu.nombre@utp.ac.pa"
              error={errors.email?.message}
              helperText="Debes usar tu email institucional @utp.ac.pa"
              required
              {...register('email', {
                required: 'El email es requerido',
                validate: {
                  validEmail: (value) => validarEmail(value) || 'Email inválido',
                  utpEmail: (value) => validarEmailUTP(value) || 'Debes usar un email @utp.ac.pa'
                }
              })}
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              error={errors.password?.message}
              required
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
            />

            <Input
              type="password"
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              error={errors.confirmarPassword?.message}
              required
              {...register('confirmarPassword', {
                required: 'Debes confirmar tu contraseña',
                validate: (value) =>
                  value === password || 'Las contraseñas no coinciden'
              })}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>

          {/* Link a Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white text-sm">
          <p>Universidad Tecnológica de Panamá</p>
          <p className="mt-1 text-primary-100">© 2026 Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}
