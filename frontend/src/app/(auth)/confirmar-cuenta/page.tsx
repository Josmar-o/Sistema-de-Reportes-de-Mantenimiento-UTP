'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import api from '@/lib/axios';
import Link from 'next/link';

function ConfirmarCuentaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [estado, setEstado] = useState<'cargando' | 'exito' | 'error'>('cargando');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('error');
      setMensaje('Token no proporcionado.');
      return;
    }
    confirmar();
  }, [token]);

  const confirmar = async () => {
    try {
      const res = await api.get(`/auth/confirmar-cuenta?token=${token}`);
      setMensaje(res.data.message);
      setEstado('exito');
    } catch (error: any) {
      setMensaje(error.response?.data?.message || 'Token inválido o expirado.');
      setEstado('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size="lg" />
          </div>

          {estado === 'cargando' && (
            <>
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Confirmando tu cuenta...</p>
            </>
          )}

          {estado === 'exito' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Cuenta confirmada!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{mensaje}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                Tu cuenta seguirá activa por un año más. Recibirás otro aviso cuando se acerque la próxima renovación.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Ir al inicio de sesión
              </Link>
            </>
          )}

          {estado === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Confirmación fallida
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{mensaje}</p>
              <Link href="/login" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                Ir al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmarCuentaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>}>
      <ConfirmarCuentaContent />
    </Suspense>
  );
}
