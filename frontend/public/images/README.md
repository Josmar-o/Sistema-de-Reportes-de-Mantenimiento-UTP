# Imágenes del Proyecto

## Logo de la Universidad

Coloca tu logo oficial de la UTP aquí con el nombre: `logo-utp.png`

### Recomendaciones:
- **Formato**: PNG con fondo transparente
- **Tamaño recomendado**: 512x512 píxeles (tamaño mínimo 256x256)
- **Peso**: Menor a 100KB para mejor rendimiento
- **Forma**: Circular o cuadrada (el componente se ajustará automáticamente)

### Archivos de logo:
- `logo-utp.png` - Logo principal (requerido)
- `logo-utp-small.png` - Logo pequeño para navbar (opcional, si es diferente)
- `favicon.ico` - Favicon del sitio (opcional)

## Otras imágenes

Puedes colocar otras imágenes estáticas aquí:
- Banners
- Iconos
- Imágenes de fondo
- Etc.

## Cómo usar las imágenes

En Next.js, las imágenes en `/public` se acceden desde la raíz:

```tsx
import Image from 'next/image';

<Image 
  src="/images/logo-utp.png" 
  alt="Logo UTP"
  width={100}
  height={100}
/>
```
