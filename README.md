# Sistema de Reportes de Mantenimiento - UTP

## 📖 Descripción General

El **Sistema de Reportes de Mantenimiento UTP** es una plataforma web integral diseñada para facilitar la comunicación y gestión de problemas de infraestructura dentro de la Universidad Tecnológica de Panamá. 

### ¿Qué problema resuelve?

Antes de este sistema, los estudiantes no tenían una forma estructurada de reportar problemas de mantenimiento (baños dañados, aires acondicionados, luces, equipos, etc.). Este sistema digitaliza y centraliza todo el proceso de reporte, seguimiento y resolución de incidencias.

### ¿Cómo funciona?

```
📱 Estudiante → Crea reporte con foto
              ↓
👷 Personal → Revisa y gestiona
              ↓
✅ Resolución → Estudiante es notificado
              ↓
📊 Admin → Analiza estadísticas
```

## 🎯 Funcionalidades Principales

### Para Estudiantes 👨‍🎓
- **Crear reportes** con foto, ubicación, categoría y descripción
- **Seguimiento en tiempo real** del estado de sus reportes
- **Dashboard personalizado** con sus estadísticas
- **Feed público** para ver reportes resueltos de otros estudiantes
- **Notificaciones por email** cuando cambia el estado de su reporte

### Para Personal de Mantenimiento 👷
- **Visualizar todos los reportes** del sistema
- **Cambiar estados**: Pendiente → En Proceso → Resuelto
- **Asignar prioridades**: Baja, Media, Alta
- **Agregar notas** de seguimiento privadas
- **Decidir visibilidad**: Publicar o mantener privado en el feed
- **Dashboard con métricas** de productividad

### Para Administradores 👨‍💼
- **Gestión completa de usuarios** (crear, editar, desactivar)
- **Cambiar roles** de usuarios
- **Estadísticas avanzadas** con gráficos
- **Análisis por categoría y ubicación**
- **Exportar reportes** (CSV/PDF)
- **Configuración del sistema**

## 🔐 Sistema de Autenticación y Seguridad

### Registro y Verificación
1. **Registro**: Solo emails `@utp.ac.pa` pueden registrarse
2. **Verificación por email**: Al registrarse, se envía un correo con token de verificación (válido 24 horas)
3. **Activación de cuenta**: El usuario debe hacer clic en el enlace antes de poder iniciar sesión

### Verificación Anual Automática 📅
**Importante**: Este sistema implementa un mecanismo único de verificación anual:

- **Cada año**, el sistema envía automáticamente un correo de "confirmación anual" a todos los usuarios
- **Objetivo**: Verificar que los estudiantes/personal siguen activos en la UTP
- **Plazo**: El usuario tiene **30 días** para confirmar que sigue activo
- **Consecuencia**: Si no confirma en 30 días, la cuenta se **desactiva automáticamente**
- **Reactivación**: Solo un administrador puede reactivar cuentas desactivadas

**Mensaje al registrarse**:
> "Recuerda: cada año recibirás un correo para confirmar que sigues siendo parte de la UTP. Si no confirmas en 30 días, tu cuenta será desactivada automáticamente."

### Cron Job de Verificación
El sistema ejecuta diariamente (a las 8:00 AM) un proceso que:
- Revisa cuentas que cumplan 1 año desde su última confirmación
- Envía emails de recordatorio
- Desactiva cuentas que no confirmaron en 30 días

## 🗄️ Arquitectura de Base de Datos

### ORM: Prisma

El sistema utiliza **Prisma ORM**, una herramienta moderna que:
- ✅ Genera tipos TypeScript automáticamente
- ✅ Migraciones de base de datos versionadas
- ✅ Query builder type-safe
- ✅ Prisma Studio para visualizar datos

### Esquema de Base de Datos

#### Tabla: `Usuario`
```prisma
model Usuario {
  id                    Int       @id @default(autoincrement())
  nombre                String
  email                 String    @unique
  password              String    // Hash bcrypt
  rol                   Rol       @default(estudiante)
  activo                Boolean   @default(false)
  emailVerified         Boolean   @default(false)
  emailVerificationToken String?
  emailVerificationExpires DateTime?
  ultimaConfirmacionAnual DateTime?
  reportes              Reporte[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### Tabla: `Reporte`
```prisma
model Reporte {
  id             Int       @id @default(autoincrement())
  titulo         String
  descripcion    String    @db.Text
  categoria      String    // "Baño", "Aire", "Electricidad", etc.
  ubicacion      String    // Edificio y salón
  estado         String    @default("pendiente")
  prioridad      String    @default("media")
  foto_url       String?
  nota_personal  String?   @db.Text
  publicInFeed   Boolean   @default(false)
  fecha_reporte  DateTime  @default(now())
  fecha_resolucion DateTime?
  usuario        Usuario   @relation(fields: [usuarioId], references: [id])
  usuarioId      Int
}
```

### Migraciones
Todas las migraciones están en `prisma/migrations/` con versionado automático:
- `20260213215138_mantenimiento_utp` - Schema inicial
- `20260213220128_add_personal_role` - Agregado rol Personal
- `20260224183045_add_titulo_categoria_prioridad` - Campos adicionales
- `20260224205316_add_nota_personal` - Notas privadas
- `20260225143728_add_email_verification_fields` - Sistema de verificación
- `20260225173113_add_public_in_feed` - Feed público
- `20260225181302_add_fecha_resolucion` - Fecha de resolución

## 📧 Sistema de Emails (Mailgun)

El sistema envía emails automáticos para:
1. **Verificación de cuenta** (al registrarse)
2. **Recuperación de contraseña**
3. **Confirmación anual** (cada año)
4. **Notificaciones de estado** (cuando cambia el estado de un reporte)

**Configuración**: Usa Mailgun API para envío transaccional confiable.

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

### Infraestructura y Despliegue
- **Nginx** - Reverse proxy y servidor web
- **PM2** - Process manager para Node.js
- **Let's Encrypt** - Certificados SSL/TLS
- **Mailgun** - Servicio de emails transaccionales
- **Hetzner Cloud** - Hosting VPS

## 🔄 Flujo de Trabajo del Sistema

### 1. Ciclo de Vida de un Reporte

```
┌─────────────────────────────────────────────────────────────┐
│ ESTUDIANTE                                                  │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. Login → Dashboard → Crear Reporte                 │   │
│ │ 2. Llena formulario (título, descripción, categoría) │   │
│ │ 3. Sube foto del problema                            │   │
│ │ 4. Selecciona ubicación (edificio, salón)            │   │
│ │ 5. Envía reporte → Estado: PENDIENTE                 │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PERSONAL DE MANTENIMIENTO                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. Ve todos los reportes pendientes                  │   │
│ │ 2. Revisa detalles y foto                            │   │
│ │ 3. Cambia estado a: EN PROCESO                       │   │
│ │ 4. Asigna prioridad (Baja/Media/Alta)                │   │
│ │ 5. Agrega nota interna (opcional)                    │   │
│ │ 6. Realiza el mantenimiento                          │   │
│ │ 7. Cambia estado a: RESUELTO                         │   │
│ │ 8. Decide si publicar en feed público                │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ ESTUDIANTE (Notificado)                                     │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. Recibe notificación de cambio de estado           │   │
│ │ 2. Ve su reporte marcado como resuelto               │   │
│ │ 3. Si es público, aparece en feed de la comunidad    │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Flujo de Registro y Verificación

```
Registro → Email de Verificación (24h) → Activación → Login
                                              ↓
                        (Cada año) ← Confirmación Anual
                                              ↓
                        (Si no confirma en 30 días) → Cuenta Desactivada
```

### 3. Arquitectura del Sistema

```
┌───────────────────────────────────────────────────────────────┐
│                         INTERNET                              │
│                        (HTTPS/SSL)                            │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                   NGINX (Reverse Proxy)                       │
│  - Puerto 80/443                                              │
│  - Redirección HTTP → HTTPS                                   │
│  - Certificado Let's Encrypt                                  │
└───────────────────────────────────────────────────────────────┘
                    ↙                    ↘
┌─────────────────────────┐    ┌─────────────────────────────┐
│   FRONTEND (Next.js)    │    │   BACKEND (Express)         │
│   - Puerto 3000         │    │   - Puerto 3001             │
│   - SSR + Static        │    │   - API REST                │
│   - PM2 Process         │    │   - JWT Auth                │
│   - TypeScript          │    │   - Multer (uploads)        │
└─────────────────────────┘    │   - Cron Jobs               │
                               │   - PM2 Process             │
                               └─────────────────────────────┘
                                           ↓
                              ┌──────────────────────┐
                              │   MySQL Database     │
                              │   - Prisma ORM       │
                              │   - Migraciones      │
                              │   - Usuarios         │
                              │   - Reportes         │
                              └──────────────────────┘
```

## 🔧 Características Técnicas Especiales

### Autenticación JWT
- Tokens firmados con `JWT_SECRET`
- Expiración configurable (default: 24h)
- Middleware de protección de rutas
- Refresh token automático

### Sistema de Roles y Permisos
```javascript
Roles: ['estudiante', 'personal', 'admin']

Permisos:
- Estudiante: Crear reportes, ver sus propios reportes
- Personal: Ver todos, cambiar estados, asignar prioridades
- Admin: Todo lo anterior + gestión de usuarios
```

### Subida de Imágenes
- Multer para manejo de archivos
- Límite: 5MB por imagen
- Formatos: PNG, JPG, JPEG, GIF
- Almacenamiento: `/uploads/` en servidor
- URL generada automáticamente: `https://josmardev.me/uploads/[nombre-archivo]`

### Feed Público
- Solo reportes marcados como públicos por el personal
- Visibles para todos los estudiantes
- Fomenta transparencia y confianza en el sistema

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
CJM4LJkmdVeC
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=5 root@46.225.210.163
## 🚀 Despliegue en Producción

### Deployment Actual (Hetzner Cloud)

Este proyecto está desplegado en un VPS de Hetzner Cloud con la siguiente configuración:

**Servidor:**
- **Proveedor**: Hetzner Cloud
- **SO**: Ubuntu 24.04 LTS
- **Specs**: 4GB RAM, 2 vCPU, 40GB SSD
- **IP**: 46.225.210.163
- **Dominio**: josmardev.me

**Stack en producción:**
```
Internet (HTTPS) 
    ↓
Nginx (Reverse Proxy + SSL)
    ↓
PM2 Process Manager
    ├─→ Backend (Node.js:3001)
    └─→ Frontend (Next.js:3000)
    ↓
MySQL (localhost:3306)
```

### Pasos de Despliegue (Resumen)

#### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 globalmente
sudo npm install -g pm2
```

#### 2. Configurar MySQL

```bash
sudo mysql
CREATE DATABASE mantenimiento_utp;
CREATE USER 'josmar'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON mantenimiento_utp.* TO 'josmar'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Clonar y Configurar Proyecto

```bash
cd /var/www
git clone <tu-repositorio> Sistema-de-Reportes-de-Mantenimiento-UTP
cd Sistema-de-Reportes-de-Mantenimiento-UTP

# Instalar dependencias backend
npm install

# Configurar .env
nano .env
# (Agregar variables de producción)

# Generar Prisma Client y ejecutar migraciones
npx prisma generate
npx prisma migrate deploy

# Instalar dependencias frontend
cd frontend
npm install

# Build de producción
npm run build
cd ..
```

#### 4. Configurar PM2

```bash
# Iniciar backend
pm2 start src/server.js --name mantenimiento-api

# Iniciar frontend
cd frontend
pm2 start npm --name mantenimiento-frontend -- start

# Guardar configuración PM2
pm2 save
pm2 startup

# Verificar procesos
pm2 status
```

#### 5. Configurar Nginx

Crear archivo `/etc/nginx/sites-available/mantenimiento`:

```nginx
server {
    listen 80;
    server_name josmardev.me www.josmardev.me 46.225.210.163;

    client_max_body_size 10M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads (archivos estáticos)
    location /uploads {
        alias /var/www/Sistema-de-Reportes-de-Mantenimiento-UTP/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/mantenimiento /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d josmardev.me -d www.josmardev.me \
  --email tu_email@gmail.com --agree-tos --non-interactive --redirect

# Verificar renovación automática
sudo certbot renew --dry-run
```

#### 7. Configurar Firewall

```bash
# Habilitar UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar estado
sudo ufw status
```

#### 8. Actualizar Variables de Entorno para HTTPS

**Backend `.env`:**
```env
API_URL=https://josmardev.me
FRONTEND_URL=https://josmardev.me
```

**Frontend `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://josmardev.me/api
```

Rebuild y reiniciar:
```bash
cd frontend
npm run build
pm2 restart all
```

### Comandos Útiles de Mantenimiento

```bash
# Ver logs
pm2 logs
pm2 logs mantenimiento-api
pm2 logs mantenimiento-frontend

# Reiniciar procesos
pm2 restart all
pm2 restart mantenimiento-api

# Ver status
pm2 status

# Monitorear recursos
pm2 monit

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Opciones Alternativas de Hosting

Si no usas VPS, considera:

**Backend:**
- Railway (fácil deploy con GitHub)
- Render (free tier disponible)
- Heroku (requiere tarjeta)
- DigitalOcean App Platform

**Frontend:**
- Vercel (ideal para Next.js, free tier generoso)
- Netlify (buena integración con Git)
- Railway (backend + frontend juntos)

**Base de Datos:**
- PlanetScale (MySQL serverless, free tier)
- Railway (incluye MySQL)
- Aiven (managed databases)

### Variables de Entorno Requeridas en Producción

**Backend:**
- `PORT`, `API_URL`, `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM`

**Frontend:**
- `NEXT_PUBLIC_API_URL`

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

## 💡 Consejos y Funcionalidades Especiales

### 🔐 Seguridad
- **JWT_SECRET**: Cambia siempre en producción a un string aleatorio largo (min 32 caracteres)
- **Contraseñas**: Hasheadas con bcrypt (10 rounds)
- **Tokens de verificación**: Generados con `crypto.randomBytes(32)`
- **CORS**: Configurado para permitir solo dominios autorizados

### 📸 Sistema de Imágenes
- Las imágenes se guardan en `/uploads/` con nombres únicos
- **Límite**: 5MB por imagen
- **Formatos soportados**: PNG, JPG, JPEG, GIF
- URLs generadas automáticamente: `https://josmardev.me/uploads/[nombre-archivo]`
- Next.js Image Optimization para carga rápida

### 📧 Verificación Anual Automática
**⚠️ IMPORTANTE**: Esta es una característica única del sistema:

- **Al registrarse**: El usuario recibe el mensaje "Recuerda: cada año recibirás un correo para confirmar que sigues siendo parte de la UTP."
- **Cron diario**: Cada día a las 8:00 AM, el sistema ejecuta un proceso automático
- **Verificación**: Busca cuentas que cumplan 1 año desde su última confirmación
- **Email automático**: Envía recordatorio con enlace de confirmación
- **Plazo**: Usuario tiene 30 días para confirmar
- **Desactivación**: Si no confirma, la cuenta se desactiva automáticamente
- **Reactivación**: Solo administradores pueden reactivar cuentas

**¿Por qué existe esto?**
Para mantener la base de datos limpia y asegurar que solo usuarios activos de la UTP tengan acceso.

### 🎨 Interfaz
- **Modo oscuro**: Soporte completo para tema oscuro
- **Responsive**: Funciona en desktop, tablet y móvil
- **Sidebar colapsable**: En móvil se vuelve drawer hamburguesa
- **Toast notifications**: Feedback instantáneo para todas las acciones

### 🔄 Estados de Reportes
```
PENDIENTE → EN PROCESO → RESUELTO
   (🟡)       (🔵)        (✅)
```

### 🏷️ Sistema de Prioridades
- **Baja**: Problemas menores, no urgentes
- **Media**: Necesita atención pronto (default)
- **Alta**: Requiere acción inmediata

### 💬 Notas del Personal
- El personal puede agregar **notas privadas** en cada reporte
- Solo visible para personal y administradores
- Útil para coordinar trabajos entre equipos

### 🌐 Feed Público
- El personal decide qué reportes **resueltos** se muestran públicamente
- **Objetivo**: Transparencia y confianza en el sistema
- Los estudiantes ven que los reportes sí se resuelven
- Fomenta más participación en reportar problemas

### 📊 Estadísticas para Admins
- Gráficos de reportes por categoría
- Análisis por ubicación (edificios más problemáticos)
- Métricas de tiempo de resolución
- Reportes activos vs resueltos

### 🔄 Cron Jobs Activos
El sistema ejecuta automáticamente:
1. **Verificación anual** (8:00 AM diario)
2. **Limpieza de tokens expirados** (cuando sea necesario)

### 📱 Notificaciones por Email
El sistema envía emails en estos casos:
1. Bienvenida y verificación de cuenta
2. Recuperación de contraseña
3. Confirmación anual (cada año)
4. Cambio de estado del reporte (opcional, configurable)

## 📋 Variables de Entorno Explicadas

### Backend (.env)
```env
# Puerto del servidor
PORT=3001

# URL del API para construcción de URLs de imágenes
API_URL=https://josmardev.me

# Ambiente (development, production)
NODE_ENV=production

# MySQL Database
DATABASE_URL="mysql://usuario:password@localhost:3306/mantenimiento_utp"

# JWT Auth
JWT_SECRET=un_secreto_muy_largo_y_aleatorio_cambialo_en_produccion
JWT_EXPIRES_IN=24h

# Frontend URL para CORS y emails
FRONTEND_URL=https://josmardev.me

# Mailgun Email Service
MAILGUN_API_KEY=tu_api_key_de_mailgun
MAILGUN_DOMAIN=mg.tudominio.com
MAILGUN_FROM=Sistema UTP <noreply@mg.tudominio.com>
```

### Frontend (.env.production)
```env
# URL del backend API
NEXT_PUBLIC_API_URL=https://josmardev.me/api
```

## 🚀 Información de Despliegue

**Sistema actualmente desplegado en:**
- 🌐 **URL**: https://josmardev.me
- 🔒 **SSL**: Let's Encrypt (renovación automática)
- 🖥️ **Servidor**: Hetzner Cloud VPS (Ubuntu 24.04)
- 🔄 **Process Manager**: PM2 (auto-restart en crash)
- 🌐 **Web Server**: Nginx (reverse proxy)
- 📧 **Emails**: Mailgun API

## 📧 Contacto y Soporte

Para soporte técnico, reportar bugs o sugerencias de mejora:

- 📧 Email: development@utp.ac.pa
- 🌐 Sistema en producción: [https://josmardev.me](https://josmardev.me)
- 📚 Repositorio: GitHub (este proyecto)

### Créditos

**Desarrollado para la Universidad Tecnológica de Panamá**  
Sistema de Reportes de Mantenimiento - 2026

**Tecnologías principales:**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + Prisma ORM
- Base de Datos: MySQL
- Infraestructura: Nginx + PM2 + Let's Encrypt

---

## 🎯 Próximas Funcionalidades (Roadmap)

- [ ] App móvil nativa (iOS/Android)
- [ ] Notificaciones push en tiempo real
- [ ] Chat entre estudiante y personal
- [ ] Sistema de valoraciones de resolución
- [ ] Dashboard público con estadísticas generales
- [ ] Integración con sistema de tickets UTP
- [ ] API pública para integraciones

---

**¡Gracias por usar el Sistema de Reportes de Mantenimiento UTP!** 🎓

**Sistema en vivo**: [https://josmardev.me](https://josmardev.me) 🔒✅
