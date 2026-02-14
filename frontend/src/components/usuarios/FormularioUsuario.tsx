'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ROLES } from '@/types';
import { validarEmail, validarEmailUTP } from '@/lib/utils';
import type { Usuario, Rol } from '@/types';

interface FormularioUsuarioProps {
  usuario?: Usuario;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isCreating?: boolean;
}

interface FormData {
  nombre: string;
  email: string;
  rol: Rol;
  password?: string;
  confirmarPassword?: string;
}

export default function FormularioUsuario({ 
  usuario, 
  onSubmit, 
  onCancel,
  isCreating = false 
}: FormularioUsuarioProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const esEdicion = !!usuario;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    defaultValues: usuario ? {
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    } : {
      rol: 'estudiante',
    }
  });

  const password = watch('password');

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Preparar datos
      const submitData: any = {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      };

      // Si es creación o se proporcionó password, incluirlo
      if (data.password) {
        submitData.password = data.password;
      }

      // Si es edición, incluir ID
      if (usuario) {
        submitData.id = usuario.id;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Nombre */}
      <Input
        label="Nombre completo"
        placeholder="Ej: Juan Pérez"
        required
        error={errors.nombre?.message}
        {...register('nombre', {
          required: 'El nombre es requerido',
          minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' }
        })}
      />

      {/* Email */}
      <Input
        type="email"
        label="Email"
        placeholder="ejemplo@utp.ac.pa"
        required
        error={errors.email?.message}
        disabled={esEdicion}
        helperText={esEdicion ? 'El email no se puede modificar' : undefined}
        {...register('email', {
          required: 'El email es requerido',
          validate: {
            validEmail: (value) => validarEmail(value) || 'Email inválido',
            utpEmail: (value) => {
              if (watch('rol') === 'estudiante') {
                return validarEmailUTP(value) || 'Los estudiantes deben usar email @utp.ac.pa';
              }
              return true;
            }
          }
        })}
      />

      {/* Rol */}
      <Select
        label="Rol"
        required
        error={errors.rol?.message}
        options={[
          { value: '', label: 'Selecciona un rol' },
          ...ROLES.map(r => ({ value: r.value, label: r.label }))
        ]}
        {...register('rol', {
          required: 'El rol es requerido'
        })}
      />

      {/* Password (solo para creación o si se quiere cambiar) */}
      {(!esEdicion || isCreating) && (
        <>
          <Input
            type="password"
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            required={!esEdicion}
            error={errors.password?.message}
            {...register('password', {
              required: esEdicion ? false : 'La contraseña es requerida',
              minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            })}
          />

          <Input
            type="password"
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            required={!esEdicion}
            error={errors.confirmarPassword?.message}
            {...register('confirmarPassword', {
              required: esEdicion ? false : 'Debes confirmar la contraseña',
              validate: (value) => {
                if (!password && !value) return true;
                return value === password || 'Las contraseñas no coinciden';
              }
            })}
          />
        </>
      )}

      {esEdicion && !isCreating && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            La contraseña solo se puede cambiar desde la configuración del usuario
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
