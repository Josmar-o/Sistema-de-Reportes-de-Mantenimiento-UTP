import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Combina clases CSS de manera condicional
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formatea una fecha a formato legible
 */
export function formatearFecha(fecha: string | Date, formato: string = 'PPP'): string {
  try {
    const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return format(date, formato, { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error, fecha);
    return 'Fecha inválida';
  }
}

/**
 * Formatea una fecha de manera relativa ("hace 2 horas")
 */
export function formatearFechaRelativa(fecha: string | Date): string {
  try {
    const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error, fecha);
    return 'Fecha inválida';
  }
}

/**
 * Trunca un texto a un máximo de caracteres
 */
export function truncarTexto(texto: string, maxLength: number = 100): string {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength).trim() + '...';
}

/**
 * Valida si un email es válido
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida si un email es de dominio UTP
 */
export function validarEmailUTP(email: string): boolean {
  return email.endsWith('@utp.ac.pa');
}

/**
 * Formatea bytes a tamaño legible (KB, MB, etc.)
 */
export function formatearTamañoArchivo(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valida el tamaño de un archivo
 */
export function validarTamañoArchivo(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Valida el tipo de un archivo
 */
export function validarTipoArchivo(file: File, tiposPermitidos: string[] = ['image/jpeg', 'image/png', 'image/jpg']): boolean {
  return tiposPermitidos.includes(file.type);
}

/**
 * Debounce function para búsquedas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Obtiene las iniciales de un nombre
 */
export function obtenerIniciales(nombre: string): string {
  const palabras = nombre.trim().split(' ');
  if (palabras.length === 1) {
    return palabras[0].substring(0, 2).toUpperCase();
  }
  return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
}

/**
 * Genera un color aleatorio para avatares
 */
export function generarColorAvatar(nombre: string): string {
  const colores = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  const index = nombre.charCodeAt(0) % colores.length;
  return colores[index];
}

/**
 * Convierte un objeto a FormData (útil para uploads)
 */
export function objetoAFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined) {
      if (obj[key] instanceof File) {
        formData.append(key, obj[key]);
      } else if (typeof obj[key] === 'object') {
        formData.append(key, JSON.stringify(obj[key]));
      } else {
        formData.append(key, obj[key].toString());
      }
    }
  });
  
  return formData;
}

/**
 * Calcula el porcentaje
 */
export function calcularPorcentaje(valor: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((valor / total) * 100);
}

/**
 * Reemplaza guiones bajos por espacios y capitaliza
 */
export function formatearTexto(texto: string): string {
  return texto
    .replace(/_/g, ' ')
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
}
