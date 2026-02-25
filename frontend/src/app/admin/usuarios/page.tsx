'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TablaUsuarios from '@/components/usuarios/TablaUsuarios';
import FormularioUsuario from '@/components/usuarios/FormularioUsuario';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import type { Usuario } from '@/types';

export default function AdminUsuariosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/usuarios');
      const usuariosData = response.data.data || [];
      setUsuarios(usuariosData);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrearUsuario = async (data: any) => {
    try {
      await api.post('/usuarios', data);
      toast.success('Usuario creado exitosamente');
      setIsCreateModalOpen(false);
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      const mensaje = error.response?.data?.mensaje || 'Error al crear el usuario';
      toast.error(mensaje);
      throw error;
    }
  };

  const handleEditarUsuario = async (data: any) => {
    try {
      await api.patch(`/usuarios/${data.id}`, data);
      toast.success('Usuario actualizado exitosamente');
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      const mensaje = error.response?.data?.mensaje || 'Error al actualizar el usuario';
      toast.error(mensaje);
      throw error;
    }
  };

  const handleEliminarUsuario = async (usuarioId: number) => {
    try {
      await api.delete(`/usuarios/${usuarioId}`);
      toast.success('Usuario eliminado exitosamente');
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const handleToggleActivo = async (usuarioId: number, activo: boolean) => {
    try {
      await api.patch(`/usuarios/${usuarioId}`, { activo });
      toast.success(activo ? 'Usuario activado' : 'Usuario desactivado');
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error al cambiar estado del usuario:', error);
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Gestión de Usuarios
          </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Administra todos los usuarios del sistema
                </p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="self-start sm:self-auto">
                <UserPlus className="h-5 w-5 mr-2" />
                Crear Usuario
              </Button>
            </div>

            {/* Tabla de Usuarios */}
            {isLoading ? (
              <LoadingSpinner size="lg" className="py-12" />
            ) : (
              <TablaUsuarios
                usuarios={usuarios}
                onEdit={handleEditarUsuario}
                onDelete={handleEliminarUsuario}
                onToggleActivo={handleToggleActivo}
              />
            )}

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Usuario"
      >
        <FormularioUsuario
          onSubmit={handleCrearUsuario}
          onCancel={() => setIsCreateModalOpen(false)}
          isCreating
        />
      </Modal>
    </>
  );
}
