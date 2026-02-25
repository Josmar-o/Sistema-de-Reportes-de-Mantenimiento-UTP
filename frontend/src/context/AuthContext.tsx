'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import type { Usuario, LoginCredentials, RegisterData, AuthResponse, Rol } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  actualizarUsuario: (data: Partial<Usuario>) => void;
  isAuthenticated: boolean;
  hasRole: (roles: Rol | Rol[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUsuario = localStorage.getItem('usuario');

        if (storedToken && storedUsuario) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUsuario));
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      
      // La respuesta viene como: { success, message, data: { token, usuario } }
      setToken(data.data.token);
      setUsuario(data.data.usuario);
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
      
      toast.success(`¡Bienvenido, ${data.data.usuario.nombre}!`);
      
      // Redirigir según el rol
      const dashboardRoutes: Record<Rol, string> = {
        estudiante: '/estudiante/dashboard',
        personal: '/personal/dashboard',
        admin: '/admin/dashboard',
      };
      
      router.push(dashboardRoutes[data.data.usuario.rol]);
    } catch (error: any) {
      console.error('Error en login:', error);
      const mensaje = error.response?.data?.message || error.response?.data?.mensaje || 'Error al iniciar sesión';
      toast.error(mensaje);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post('/auth/registro', data);
      // La cuenta se crea pero necesita verificación de email
      toast.success('¡Cuenta creada! Revisa tu correo para verificarla.', { duration: 6000 });
      router.push('/login');
    } catch (error: any) {
      console.error('Error en registro:', error);
      const mensaje = error.response?.data?.message || 'Error al registrarse';
      toast.error(mensaje);
      throw error;
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    toast.success('Sesión cerrada correctamente');
    router.push('/login');
  };

  const actualizarUsuario = (data: Partial<Usuario>) => {
    if (usuario) {
      const updatedUser = { ...usuario, ...data };
      setUsuario(updatedUser);
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
    }
  };

  const hasRole = (roles: Rol | Rol[]): boolean => {
    if (!usuario) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(usuario.rol);
  };

  const value: AuthContextType = {
    usuario,
    token,
    isLoading,
    login,
    logout,
    register,
    actualizarUsuario,
    isAuthenticated: !!usuario && !!token,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
