# Sistema de Reportes de Mantenimiento - UTP

Frontend completo para el sistema de gestión de reportes de mantenimiento universitario.

## Stack Tecnológico

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado global
- **React Hook Form** - Gestión de formularios
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Páginas con App Router
│   │   ├── (auth)/            # Grupo de rutas de autenticación
│   │   │   ├── login/         # Página de login
│   │   │   └── registro/      # Página de registro
│   │   ├── (estudiante)/      # Rutas de estudiante
│   │   │   ├── dashboard/     # Dashboard de estudiante
│   │   │   └── reportes/      # Gestión de reportes del estudiante
│   │   ├── (personal)/        # Rutas de personal
│   │   │   ├── dashboard/     # Dashboard de personal
│   │   │   └── reportes/      # Gestión de todos los reportes
│   │   ├── (admin)/           # Rutas de administrador
│   │   │   ├── dashboard/     # Dashboard de admin
│   │   │   ├── reportes/      # Gestión de reportes
│   │   │   ├── usuarios/      # Gestión de usuarios
│   │   │   └── estadisticas/  # Estadísticas avanzadas
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Página principal
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes reutilizables
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── Navbar.tsx    # Barra de navegación
│   │   │   ├── Sidebar.tsx   # Barra lateral
│   │   │   └── ProtectedRoute.tsx  # Protección de rutas
│   │   ├── reportes/         # Componentes de reportes
│   │   │   ├── ReporteCard.tsx     # Tarjeta de reporte
│   │   │   ├── ReporteDetalle.tsx  # Detalle de reporte
│   │   │   ├── ReporteForm.tsx     # Formulario de reporte
│   │   │   └── FiltrosReportes.tsx # Filtros de reportes
│   │   ├── usuarios/         # Componentes de usuarios
│   │   │   ├── TablaUsuarios.tsx        # Tabla de usuarios
│   │   │   └── FormularioUsuario.tsx    # Formulario de usuario
│   │   └── ui/              # Componentes UI básicos
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Select.tsx
│   │       ├── Textarea.tsx
│   │       └── LoadingSpinner.tsx
│   ├── context/             # Context API
│   │   └── AuthContext.tsx  # Contexto de autenticación
│   ├── lib/                 # Librerías y utilidades
│   │   ├── axios.ts         # Configuración de Axios
│   │   └── utils.ts         # Funciones de utilidad
│   └── types/              # Tipos TypeScript
│       └── index.ts        # Definiciones de tipos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

## Características

### Roles del Sistema

#### 1. ESTUDIANTE
- Crear reportes con foto
- Ver sus propios reportes
- Filtrar reportes por estado, ubicación, categoría
- Dashboard con estadísticas personales

#### 2. PERSONAL
- Ver todos los reportes del sistema
- Cambiar estado de reportes
- Asignar prioridades
- Agregar notas a reportes
- Dashboard con métricas clave

#### 3. ADMIN
- Todas las funciones de Personal
- Gestión completa de usuarios
- Estadísticas avanzadas
- Exportar reportes
- Filtros y análisis detallados

### Funcionalidades Principales

- **Autenticación completa** con JWT
- **Rutas protegidas** por rol
- **Sistema de notificaciones** con toast
- **Diseño responsive** mobile-first
- **Modo oscuro** opcional
- **Validación de formularios** en tiempo real
- **Upload de imágenes** con preview
- **Filtros avanzados** de reportes
- **Paginación** de resultados
- **Loading states** y skeletons

## Instalación

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno:
Copia `.env.example` a `.env.local` y configura:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Build para Producción

```bash
npm run build
npm start
```

## Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL del backend API

## Rutas del Sistema

### Públicas
- `/login` - Iniciar sesión
- `/registro` - Registro de estudiantes

### Estudiante
- `/estudiante/dashboard` - Dashboard personal
- `/estudiante/reportes` - Lista de mis reportes
- `/estudiante/reportes/nuevo` - Crear nuevo reporte

### Personal
- `/personal/dashboard` - Dashboard de personal
- `/personal/reportes` - Todos los reportes
- `/personal/reportes/[id]` - Detalle y gestión de reporte

### Admin
- `/admin/dashboard` - Dashboard administrativo
- `/admin/reportes` - Gestión de reportes
- `/admin/usuarios` - Gestión de usuarios
- `/admin/estadisticas` - Estadísticas avanzadas

## Desarrollo

### Convenciones de Código

- Componentes en PascalCase
- Archivos de utilidad en camelCase
- Uso de TypeScript estricto
- Componentes funcionales con hooks
- Props tipadas con interfaces

### Estructura de Componentes

Los componentes siguen el patrón:
1. Imports
2. Interfaces/Types
3. Componente funcional
4. Export

## Integración con Backend

El frontend se comunica con el backend a través de Axios. Todas las peticiones incluyen automáticamente:

- Token JWT en headers
- Manejo de errores 401 (logout automático)
- Interceptores para errores comunes
- Base URL desde variables de entorno

## Contribución

1. Crear una rama para tu feature
2. Hacer commits descriptivos
3. Probar todos los cambios
4. Crear Pull Request

## Licencia

Universidad Tecnológica de Panamá - 2026
