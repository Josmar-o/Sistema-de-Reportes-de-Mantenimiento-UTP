# Guía de Instalación Completa

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- PostgreSQL instalado y corriendo
- Git (opcional)

## Instalación Paso a Paso

### 1. Configurar Base de Datos

```bash
# Crear base de datos
createdb mantenimiento_utp

# O desde psql:
# psql -U postgres
# CREATE DATABASE mantenimiento_utp;
```

### 2. Configurar Backend

```bash
# Navegar al directorio del proyecto
cd proyecto-mantenimiento

# Instalar dependencias del backend
npm install

# Crear archivo .env
cp .env.example .env
```

**Editar `.env` con tus credenciales:**
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/mantenimiento_utp"
JWT_SECRET="tu_secreto_super_seguro_aqui"
PORT=3001
```

**Ejecutar migraciones de Prisma:**
```bash
npx prisma generate
npx prisma migrate dev
```

**Iniciar el backend:**
```bash
npm start
```

El backend estará corriendo en `http://localhost:3001`

### 3. Configurar Frontend

**En una nueva terminal:**
```bash
# Navegar al directorio frontend
cd proyecto-mantenimiento/frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local
```

**El archivo `.env.local` debe contener:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Iniciar el frontend:**
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

## Verificación de Instalación

### 1. Verificar Backend

Abre tu navegador o usa curl:
```bash
curl http://localhost:3001/api/health
```

Deberías ver: `{ "status": "ok" }`

### 2. Verificar Frontend

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Deberías ver la página de login.

### 3. Crear Usuario de Prueba

**Opción 1: Usar Prisma Studio**
```bash
# En el directorio del backend
npx prisma studio
```

Esto abre una interfaz web donde puedes crear usuarios manualmente.

**Opción 2: Registro desde el Frontend**

1. Ve a `http://localhost:3000/registro`
2. Regístrate con un email @utp.ac.pa
3. Login con las credenciales creadas

**Opción 3: Seed de Base de Datos (Opcional)**

Crea un archivo `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Crear usuarios de prueba
  await prisma.usuario.createMany({
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
  });

  console.log('✅ Usuarios de prueba creados');
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

**Ejecutar seed:**
```bash
npx prisma db seed
```

## Estructura de Archivos Final

```
proyecto-mantenimiento/
├── src/                      # Backend
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   └── routes/
├── prisma/                   # Prisma ORM
│   ├── schema.prisma
│   └── migrations/
├── frontend/                 # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── .env.local
├── package.json
├── .env
└── README.md
```

## Scripts Disponibles

### Backend
```bash
npm start          # Iniciar servidor
npm run dev        # Iniciar con nodemon (auto-reload)
```

### Frontend
```bash
npm run dev        # Desarrollo
npm run build      # Build para producción
npm start          # Iniciar en producción
npm run lint       # Linting
```

## Problemas Comunes

### Error: Cannot connect to database
**Solución:**
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe

### Error: EADDRINUSE port 3000
**Solución:**
```bash
# Encontrar proceso usando el puerto
lsof -ti:3000 | xargs kill -9

# O cambiar el puerto en package.json
"dev": "next dev -p 3001"
```

### Error: Prisma Client not generated
**Solución:**
```bash
npx prisma generate
```

### Error: Cannot find module
**Solución:**
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
**Solución:**
Verificar que el backend tenga configurado CORS correctamente en `server.js`

## Despliegue en Producción

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render/Railway/Heroku)
1. Configurar variables de entorno
2. Ejecutar `npm run build` si aplica
3. Configurar start command: `npm start`

### Base de Datos (Supabase/Neon/Railway)
1. Crear base de datos PostgreSQL
2. Actualizar `DATABASE_URL` en variables de entorno
3. Ejecutar migraciones: `npx prisma migrate deploy`

## Mantenimiento

### Actualizar Dependencias
```bash
# Backend
npm update

# Frontend
cd frontend
npm update
```

### Backup de Base de Datos
```bash
pg_dump mantenimiento_utp > backup.sql
```

### Restaurar Base de Datos
```bash
psql mantenimiento_utp < backup.sql
```

## Soporte

Para problemas o preguntas, consulta:
- README.md del frontend
- INTEGRACION.md para detalles de API
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Prisma: https://www.prisma.io/docs
