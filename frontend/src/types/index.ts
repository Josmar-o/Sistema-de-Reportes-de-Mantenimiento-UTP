export type Rol = 'estudiante' | 'personal' | 'admin';
export type EstadoReporte = 'pendiente' | 'en_proceso' | 'resuelto';
export type Prioridad = 'baja' | 'media' | 'alta';
export type Categoria = 
  | 'infraestructura' 
  | 'mobiliario' 
  | 'iluminacion' 
  | 'plomeria' 
  | 'electricidad' 
  | 'aire_acondicionado' 
  | 'limpieza' 
  | 'otro';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo?: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  categoria: Categoria;
  fotoUrl: string | null;
  estado: EstadoReporte;
  prioridad?: Prioridad;
  notaPersonal?: string;
  publicInFeed?: boolean;
  fechaResolucion?: string | null;
  usuarioId: number;
  usuario?: Usuario;
  creadoEn: string;
  actualizadoEn: string;
  notas?: Nota[];
}

export interface Nota {
  id: number;
  contenido: string;
  reporteId: number;
  usuarioId: number;
  usuario?: Usuario;
  creadoEn: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: Usuario;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

export interface EstadisticasDashboard {
  totalReportes: number;
  reportesPendientes: number;
  reportesEnProceso: number;
  reportesResueltos: number;
  reportesPorCategoria: { categoria: string; total: number }[];
  reportesPorUbicacion: { ubicacion: string; total: number }[];
  reportesPorMes: { mes: string; total: number }[];
  tasaResolucion?: number;
  tiempoPromedioResolucion?: number;
}

export interface FiltrosReportes {
  estado?: EstadoReporte;
  ubicacion?: string;
  categoria?: Categoria;
  prioridad?: Prioridad;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

export interface PaginacionParams {
  page: number;
  limit: number;
}

export interface ResponsePaginado<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Constantes
export const UBICACIONES = [
  'Edificio A - Piso 1',
  'Edificio A - Piso 2',
  'Edificio B - Piso 1',
  'Edificio B - Piso 2',
  'Edificio C - Laboratorios',
  'Cafetería Principal',
  'Biblioteca',
  'Baños Edificio A',
  'Áreas Comunes',
] as const;

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'mobiliario', label: 'Mobiliario' },
  { value: 'iluminacion', label: 'Iluminación' },
  { value: 'plomeria', label: 'Plomería' },
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'aire_acondicionado', label: 'Aire Acondicionado' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'otro', label: 'Otro' },
];

export const ESTADOS: { value: EstadoReporte; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'en_proceso', label: 'En Proceso', color: 'blue' },
  { value: 'resuelto', label: 'Resuelto', color: 'green' },
];

export const PRIORIDADES: { value: Prioridad; label: string; color: string }[] = [
  { value: 'baja', label: 'Baja', color: 'gray' },
  { value: 'media', label: 'Media', color: 'orange' },
  { value: 'alta', label: 'Alta', color: 'red' },
];

export const ROLES: { value: Rol; label: string }[] = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'personal', label: 'Personal' },
  { value: 'admin', label: 'Administrador' },
];
