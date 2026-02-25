'use client';

import { useState } from 'react';
import { Search, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormularioUsuario from './FormularioUsuario';
import { formatearFecha, obtenerIniciales, generarColorAvatar, cn } from '@/lib/utils';
import { ROLES } from '@/types';
import type { Usuario, Rol } from '@/types';

interface TablaUsuariosProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuarioId: number) => void;
  onToggleActivo: (usuarioId: number, activo: boolean) => void;
  isLoading?: boolean;
}

export default function TablaUsuarios({ 
  usuarios, 
  onEdit, 
  onDelete, 
  onToggleActivo,
  isLoading = false 
}: TablaUsuariosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [rolFiltro, setRolFiltro] = useState<Rol | ''>('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusqueda = 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchRol = !rolFiltro || usuario.rol === rolFiltro;

    return matchBusqueda && matchRol;
  });

  const handleEdit = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (usuario: Usuario) => {
    onEdit(usuario);
    setIsEditModalOpen(false);
    setUsuarioSeleccionado(null);
  };

  const getRolBadgeVariant = (rol: Rol): 'default' | 'success' | 'info' | 'warning' => {
    switch (rol) {
      case 'admin': return 'success';
      case 'personal': return 'info';
      case 'estudiante': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value as Rol | '')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los roles</option>
            {ROLES.map(rol => (
              <option key={rol.value} value={rol.value}>
                {rol.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha de registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                          generarColorAvatar(usuario.nombre)
                        )}>
                          {obtenerIniciales(usuario.nombre)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {usuario.nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {usuario.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {usuario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRolBadgeVariant(usuario.rol)}>
                        {ROLES.find(r => r.value === usuario.rol)?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {usuario.activo !== false ? (
                        <Badge variant="success">
                          <UserCheck className="h-3 w-3 mr-1 inline" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <UserX className="h-3 w-3 mr-1 inline" />
                          Inactivo
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatearFecha(usuario.creadoEn, 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar usuario"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onToggleActivo(usuario.id, !(usuario.activo !== false))}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                          title={usuario.activo !== false ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {usuario.activo !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                              onDelete(usuario.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resultados */}
      {!isLoading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </div>
      )}

      {/* Modal de edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUsuarioSeleccionado(null);
        }}
        title="Editar Usuario"
      >
        {usuarioSeleccionado && (
          <FormularioUsuario
            usuario={usuarioSeleccionado}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setUsuarioSeleccionado(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
