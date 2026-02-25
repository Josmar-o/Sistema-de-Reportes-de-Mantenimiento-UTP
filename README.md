# Sistema de Reportes de Mantenimiento - UTP

Sistema completo de gestión de reportes de mantenimiento universitario con tres roles de usuario: Estudiante, Personal y Administrador.

## 🚀 Stack Tecnológico

### Backend
- **Node.js** + **Express** - Framework del servidor
- **Prisma ORM** - Gestión de base de datos
- **MySQL** - Base de datos
- **JWT** - Autenticación y autorización
- **Multer** - Manejo de archivos
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Axios** - Cliente HTTP
- **React Hook Form** - Gestión de formularios
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior ([Descargar](https://nodejs.org/))
- **MySQL** 8.0 o superior ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **npm** o **yarn** (viene con Node.js)
- **Git** (opcional)

## 🛠️ Instalación

### 1. Clonar o Descargar el Proyecto

```bash
# Si usas Git
git clone <url-del-repositorio>
cd proyecto-mantenimiento

# O simplemente descarga y descomprime el proyecto
```

### 2. Configurar la Base de Datos

**Crear la base de datos en MySQL:**

```bash
# Opción 1: Desde MySQL CLI
mysql -u root -p
CREATE DATABASE mantenimiento_utp;
exit;

# Opción 2: Desde MySQL Workbench
# Crear una nueva conexión y ejecutar: CREATE DATABASE mantenimiento_utp;
```

### 3. Configurar el Backend

```bash
# Instalar dependencias del backend
npm install

# Copiar el archivo de ejemplo de variables de entorno
cp .env.example .env
```

**Editar el archivo `.env` con tus credenciales:**

```env
# URL de conexión a MySQL
DATABASE_URL="mysql://usuario:password@localhost:3306/mantenimiento_utp"

# Secreto para JWT (cambia esto por algo más seguro)
JWT_SECRET="tu_secreto_super_seguro_aqui_cambiar_en_produccion"

# Puerto del servidor
PORT=3001
```

**Ejecutar migraciones de Prisma:**

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar las migraciones
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio para ver la base de datos
npx prisma studio
```

### 4. Configurar el Frontend

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias del frontend
npm install

# Copiar el archivo de ejemplo de variables de entorno
cp .env.example .env.local
```

**El archivo `.env.local` debe contener:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## ▶️ Ejecutar el Proyecto

### Opción 1: Ejecutar Backend y Frontend por Separado

**Terminal 1 - Backend:**
```bash
# Desde la raíz del proyecto
npm start

# O con auto-reload para desarrollo
npm run dev
```

El backend estará corriendo en: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
# Desde la carpeta frontend
cd frontend
npm run dev
```

El frontend estará corriendo en: `http://localhost:3000`

### Opción 2: Script para Ejecutar Ambos (Windows)

Puedes crear un archivo `start.bat` en la raíz:

```batch
@echo off
start cmd /k "npm start"
start cmd /k "cd frontend && npm run dev"
```

### Opción 3: Script para Ejecutar Ambos (Linux/Mac)

Puedes crear un archivo `start.sh` en la raíz:

```bash
#!/bin/bash
npm start &
cd frontend && npm run dev
```

## 👥 Usuarios de Prueba

Puedes crear usuarios de prueba de dos formas:

### Opción 1: Registro desde el Frontend

1. Ve a `http://localhost:3000/registro`
2. Registra un usuario con email `@utp.ac.pa`
3. Login con las credenciales creadas

### Opción 2: Crear Usuarios Manualmente con Prisma Studio

```bash
npx prisma studio
```

Esto abre una interfaz web (`http://localhost:5555`) donde puedes crear usuarios manualmente.

**Nota:** Las contraseñas deben estar hasheadas con bcrypt. Para testing, puedes usar esta contraseña hasheada que corresponde a `123456`:
```
$2a$10$YourHashedPasswordHere
```

### Opción 3: Seed de Base de Datos (Recomendado)

Crea usuarios de prueba automáticamente:

1. Crea el archivo `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Crear usuarios de prueba
  const usuarios = await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Estudiante Demo',
        email: 'estudiante@utp.ac.pa',
        password: hashedPassword,
        rol: 'estudiante',
      },
      {
        nombre: 'Personal Demo',
        email: 'personal@utp.ac.pa',
        password: hashedPassword,
        rol: 'personal',
      },
      {
        nombre: 'Admin Demo',
        email: 'admin@utp.ac.pa',
        password: hashedPassword,
        rol: 'admin',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Usuarios de prueba creados');
  console.log('\nCredenciales de acceso:');
  console.log('📧 estudiante@utp.ac.pa / 🔑 123456');
  console.log('📧 personal@utp.ac.pa   / 🔑 123456');
  console.log('📧 admin@utp.ac.pa      / 🔑 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. Agrega a `package.json`:

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

3. Ejecuta el seed:

```bash
npx prisma db seed
```

**Usuarios creados:**
- 📧 `estudiante@utp.ac.pa` / 🔑 `123456` - Rol: Estudiante
- 📧 `personal@utp.ac.pa` / 🔑 `123456` - Rol: Personal
- 📧 `admin@utp.ac.pa` / 🔑 `123456` - Rol: Admin

## 🎯 Funcionalidades por Rol

### 👨‍🎓 ESTUDIANTE
- ✅ Crear reportes de mantenimiento con foto
- ✅ Ver todos sus reportes
- ✅ Filtrar reportes por estado, ubicación, categoría
- ✅ Dashboard con estadísticas personales
- ✅ Ver estado actualizado de sus reportes

### 👷 PERSONAL
- ✅ Ver todos los reportes del sistema
- ✅ Cambiar estado de reportes (Pendiente → En Proceso → Resuelto)
- ✅ Asignar prioridades (Baja, Media, Alta)
- ✅ Agregar notas de seguimiento a reportes
- ✅ Dashboard con métricas de todos los reportes
- ✅ Filtros avanzados

### 👨‍💼 ADMIN
- ✅ Todas las funciones de Personal
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Cambiar roles de usuarios
- ✅ Activar/Desactivar usuarios
- ✅ Estadísticas avanzadas del sistema
- ✅ Gráficos de reportes por categoría y ubicación
- ✅ Exportar reportes (CSV/PDF)
- ✅ Filtros por rango de fechas

## 📁 Estructura del Proyecto

```
proyecto-mantenimiento/
├── prisma/                     # Configuración de Prisma
│   ├── schema.prisma          # Esquema de base de datos
│   ├── migrations/            # Migraciones de base de datos
│   └── seed.js               # Datos iniciales (opcional)
│
├── src/                       # Backend (Node.js + Express)
│   ├── server.js             # Punto de entrada del servidor
│   ├── config/               # Configuraciones
│   │   ├── database.js       # Conexión a base de datos
│   │   └── jwt.js           # Configuración JWT
│   ├── controllers/          # Lógica de negocio
│   │   ├── authController.js
│   │   └── reportesController.js
│   ├── middlewares/          # Middlewares
│   │   ├── auth.js          # Autenticación JWT
│   │   ├── errorHandler.js  # Manejo de errores
│   │   └── validate.js      # Validaciones
│   └── routes/              # Rutas de la API
│       ├── auth.js
│       └── reportes.js
│
├── frontend/                  # Frontend (Next.js + TypeScript)
│   ├── src/
│   │   ├── app/              # Páginas (App Router)
│   │   │   ├── (auth)/      # Login y Registro
│   │   │   ├── (estudiante)/ # Dashboard y reportes de estudiante
│   │   │   ├── (personal)/  # Dashboard y gestión de personal
│   │   │   └── (admin)/     # Dashboard y administración
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── layout/      # Navbar, Sidebar, etc.
│   │   │   ├── reportes/    # Componentes de reportes
│   │   │   ├── usuarios/    # Componentes de usuarios
│   │   │   └── ui/          # Componentes UI básicos
│   │   ├── context/         # Context API
│   │   ├── lib/             # Utilidades
│   │   └── types/           # Tipos TypeScript
│   ├── package.json
│   └── .env.local
│
├── database/                  # Scripts SQL (si es necesario)
├── uploads/                  # Archivos subidos (creado automáticamente)
├── .env                      # Variables de entorno (NO subir a Git)
├── .env.example             # Ejemplo de variables de entorno
├── package.json             # Dependencias del backend
└── README.md               # Este archivo
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registro de estudiantes

### Reportes
- `GET /api/reportes` - Obtener todos los reportes
- `GET /api/reportes/mis-reportes` - Reportes del usuario autenticado
- `GET /api/reportes/:id` - Obtener un reporte específico
- `POST /api/reportes` - Crear nuevo reporte
- `PATCH /api/reportes/:id` - Actualizar reporte
- `DELETE /api/reportes/:id` - Eliminar reporte (admin)

### Usuarios (Admin)
- `GET /api/usuarios` - Obtener todos los usuarios
- `POST /api/usuarios` - Crear usuario
- `PATCH /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Estadísticas (Admin)
- `GET /api/estadisticas` - Obtener estadísticas del sistema

Ver documentación completa en `/frontend/INTEGRACION.md`

## 🧪 Testing

### Probar el Backend

```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/api/health

# Probar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@utp.ac.pa","password":"123456"}'
```

### Probar el Frontend

1. Abre `http://localhost:3000` en tu navegador
2. Inicia sesión con alguno de los usuarios de prueba
3. Navega por las diferentes secciones según tu rol

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- ✅ Verificar que MySQL esté corriendo
- ✅ Verificar credenciales en `.env`
- ✅ Verificar que la base de datos `mantenimiento_utp` existe

### Error: "Port 3000 or 3001 already in use"
```bash
# Windows - Liberar puerto
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac - Liberar puerto
lsof -ti:3001 | xargs kill -9
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Module not found"
```bash
# Limpiar e reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# En frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS
Verificar en `src/server.js` que CORS esté configurado:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Las imágenes no se suben
- ✅ Verificar que exista la carpeta `uploads/`
- ✅ Verificar configuración de Multer en el backend
- ✅ Verificar límite de tamaño (máx 5MB)

## 📦 Build para Producción

### Backend
```bash
# El backend está listo para producción
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🚀 Despliegue

### Opciones de Hosting

**Backend:**
- Render
- Railway
- Heroku
- DigitalOcean

**Frontend:**
- Vercel (recomendado)
- Netlify
- Railway

**Base de Datos:**
- PlanetScale
- Railway
- Aiven
- DigitalOcean Managed MySQL

### Variables de Entorno en Producción

Asegúrate de configurar:
- `DATABASE_URL` - URL de MySQL en producción
- `JWT_SECRET` - Secreto seguro y aleatorio
- `NEXT_PUBLIC_API_URL` - URL del backend en producción

## 📚 Documentación Adicional

- [Frontend README](./frontend/README.md) - Documentación detallada del frontend
- [Guía de Integración](./frontend/INTEGRACION.md) - Detalles de API y endpoints
- [Guía de Instalación](./frontend/INSTALACION.md) - Instalación paso a paso

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Universidad Tecnológica de Panamá - 2026

---

## 💡 Consejos

- 🔐 Cambia `JWT_SECRET` en producción
- 📸 Las imágenes se guardan en `/uploads/`
- 🎨 El sistema tiene soporte para modo oscuro
- 📱 Todo el frontend es responsive
- ✨ Los reportes tienen estados: Pendiente → En Proceso → Resuelto
- 🏷️ Los reportes pueden tener prioridades: Baja, Media, Alta
- 💬 El personal puede agregar notas de seguimiento
- 📊 Los admins tienen acceso a estadísticas detalladas

## 📧 Contacto

Para soporte o preguntas, contacta al equipo de desarrollo.

---

**¡Gracias por usar el Sistema de Reportes de Mantenimiento UTP!** 🎓
