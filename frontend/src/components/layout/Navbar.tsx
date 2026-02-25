'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/ui/Logo';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { cn, obtenerIniciales, generarColorAvatar } from '@/lib/utils';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (!usuario) return null;

  const configuracionHref = `/${usuario.rol}/configuracion`;

  // Enlaces según el rol del usuario
  const getNavLinks = () => {
    switch (usuario.rol) {
      case 'estudiante':
        return [
          { href: '/estudiante/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/estudiante/reportes', label: 'Mis Reportes', icon: FileText },
          { href: '/estudiante/reportes/nuevo', label: 'Crear Reporte', icon: PlusCircle },
        ];
      case 'personal':
        return [
          { href: '/personal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/personal/reportes', label: 'Todos los Reportes', icon: FileText },
        ];
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/reportes', label: 'Reportes', icon: FileText },
          { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
          { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y Links */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href={`/${usuario.rol}/dashboard`} className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Logo size="md" />
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  Sistema de Reportes
                </span>
              </div>
            </Link>

            {/* Links Desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium', generarColorAvatar(usuario.nombre))}>
                  {obtenerIniciales(usuario.nombre)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {usuario.nombre}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {usuario.rol}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {usuario.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {usuario.email}
                      </p>
                    </div>
                    <Link 
                      href={configuracionHref}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'flex items-center px-3 py-2 text-base font-medium rounded-md',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
