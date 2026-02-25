'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

/**
 * Componente Logo - Muestra el logo de la UTP
 * 
 * Si existe /public/images/logo-utp.png lo muestra,
 * caso contrario muestra el texto "UTP" como fallback
 */
export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageExists, setImageExists] = useState(true);

  // Probar si la imagen existe
  const handleImageError = () => {
    setImageError(true);
    setImageExists(false);
  };

  // Si la imagen no existe o hubo error, mostrar fallback
  if (!imageExists || imageError) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-utp-red rounded-full flex items-center justify-center ${className}`}
      >
        <span className={`text-white font-bold ${textSizeClasses[size]}`}>
          UTP
        </span>
      </div>
    );
  }

  // Mostrar imagen
  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <Image
        src="/images/logo-utp.png"
        alt="Logo UTP"
        fill
        className="object-contain rounded-full"
        onError={handleImageError}
        priority
      />
    </div>
  );
}
