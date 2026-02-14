# Guía de Integración Frontend-Backend

## Configuración del Backend

### 1. Variables de Entorno del Backend

Asegúrate de que tu backend tenga configurado CORS para permitir peticiones desde el frontend:

**Archivo: `src/server.js`**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  credentials: true
}));
```

### 2. Endpoints Requeridos

El frontend espera que el backend tenga los siguientes endpoints:

#### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/registro` - Registro de estudiante

#### Reportes
- `GET /api/reportes` - Obtener todos los reportes
- `GET /api/reportes/mis-reportes` - Reportes del usuario autenticado
- `GET /api/reportes/:id` - Obtener un reporte específico
- `POST /api/reportes` - Crear nuevo reporte (con FormData para foto)
- `PATCH /api/reportes/:id` - Actualizar reporte (estado, prioridad)
- `DELETE /api/reportes/:id` - Eliminar reporte (solo admin)

#### Notas de Reporte
- `POST /api/reportes/:id/notas` - Agregar nota a un reporte
- `GET /api/reportes/:id/notas` - Obtener notas de un reporte

#### Usuarios (Admin)
- `GET /api/usuarios` - Obtener todos los usuarios
- `POST /api/usuarios` - Crear nuevo usuario
- `PATCH /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

#### Estadísticas (Admin)
- `GET /api/estadisticas` - Obtener estadísticas generales
- Query params opcionales: `fechaInicio`, `fechaFin`

### 3. Formato de Respuestas Esperado

#### Login/Registro
```json
{
  "token": "jwt_token_here",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@utp.ac.pa",
    "rol": "estudiante",
    "creadoEn": "2026-02-13T00:00:00.000Z"
  }
}
```

#### Reportes
```json
{
  "id": 1,
  "titulo": "Luz fundida",
  "descripcion": "La luz del aula 203 está fundida",
  "ubicacion": "Edificio A - Piso 2",
  "categoria": "iluminacion",
  "fotoUrl": "http://localhost:3001/uploads/foto.jpg",
  "estado": "pendiente",
  "prioridad": "media",
  "usuarioId": 1,
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@utp.ac.pa",
    "rol": "estudiante"
  },
  "creadoEn": "2026-02-13T00:00:00.000Z",
  "actualizadoEn": "2026-02-13T00:00:00.000Z",
  "notas": []
}
```

#### Estadísticas
```json
{
  "totalReportes": 100,
  "reportesPendientes": 20,
  "reportesEnProceso": 30,
  "reportesResueltos": 50,
  "tasaResolucion": 50,
  "tiempoPromedioResolucion": 24,
  "reportesPorCategoria": [
    { "categoria": "iluminacion", "total": 25 },
    { "categoria": "plomeria", "total": 20 }
  ],
  "reportesPorUbicacion": [
    { "ubicacion": "Edificio A - Piso 1", "total": 15 }
  ],
  "reportesPorMes": [
    { "mes": "Enero 2026", "total": 30 }
  ]
}
```

## Configuración del Frontend

### 1. Instalar Dependencias
```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Ejecutar Frontend
```bash
npm run dev
```

## Flujo de Autenticación

1. Usuario hace login en `/login`
2. Backend valida credenciales y devuelve token JWT + datos de usuario
3. Frontend guarda token en `localStorage`
4. Axios interceptor agrega automáticamente el token en todas las peticiones
5. Si el token expira (401), se hace logout automático

## Subida de Archivos

El formulario de creación de reportes envía datos como `FormData`:

```javascript
const formData = new FormData();
formData.append('titulo', 'Título');
formData.append('descripcion', 'Descripción');
formData.append('ubicacion', 'Ubicación');
formData.append('categoria', 'categoria');
formData.append('foto', file); // File object

axios.post('/reportes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

Backend debe usar `multer` u otro middleware para manejar archivos.

## Protección de Rutas

### Frontend
El componente `ProtectedRoute` verifica:
- Usuario autenticado
- Rol correcto para la ruta
- Redirige automáticamente si no cumple

### Backend
Debe tener middleware de autenticación:
- Verificar token JWT
- Extraer usuario del token
- Validar rol para endpoints protegidos

## Testing de Integración

### 1. Verificar CORS
```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS --verbose \
  http://localhost:3001/api/auth/login
```

### 2. Test de Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@utp.ac.pa","password":"123456"}'
```

### 3. Test con Token
```bash
curl -X GET http://localhost:3001/api/reportes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Solución de Problemas Comunes

### Error de CORS
- Verificar que el backend tenga configurado CORS
- Verificar que la URL del frontend esté permitida

### Token no se envía
- Verificar que se guardó en localStorage
- Verificar interceptor de Axios

### 401 Unauthorized
- Token expirado o inválido
- Backend no recibe el header Authorization

### 404 Not Found
- Verificar que la ruta del backend existe
- Verificar NEXT_PUBLIC_API_URL

### Upload de archivo falla
- Verificar size limit en backend
- Verificar Content-Type: multipart/form-data
- Verificar que el campo se llama 'foto' en backend

## Scripts Útiles

### Ejecutar Backend y Frontend
```bash
# Terminal 1 - Backend
cd proyecto-mantenimiento
npm start

# Terminal 2 - Frontend  
cd proyecto-mantenimiento/frontend
npm run dev
```

### Build de Producción
```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd ..
npm start
```

## Usuarios de Prueba

Una vez que el backend esté configurado, puedes crear usuarios de prueba:

**Estudiante:**
- Email: estudiante@utp.ac.pa
- Password: 123456
- Rol: estudiante

**Personal:**
- Email: personal@utp.ac.pa
- Password: 123456
- Rol: personal

**Admin:**
- Email: admin@utp.ac.pa
- Password: 123456
- Rol: admin
