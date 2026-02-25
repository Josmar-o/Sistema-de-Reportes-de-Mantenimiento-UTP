'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { usuario } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!usuario || usuario.rol === 'estudiante') return null;

  // Enlaces según el rol
  const getNavLinks = () => {
    if (usuario.rol === 'personal') {
      return [
        { href: '/personal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/personal/reportes', label: 'Todos los Reportes', icon: FileText },
        { href: '/personal/configuracion', label: 'Configuración', icon: Settings },
      ];
    }
    
    if (usuario.rol === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/reportes', label: 'Reportes', icon: FileText },
        { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
        { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
        { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
      ];
    }
    
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-2 text-sm">Contraer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
