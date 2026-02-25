# PROMPT COMPLETO PARA ANDROID APP - Sistema de Mantenimiento UTP

## 🎯 CONTEXTO DEL PROYECTO

Crear una aplicación Android en **Kotlin con Jetpack Compose** para el sistema de reportes de mantenimiento de la Universidad Tecnológica de Panamá (UTP).

**IMPORTANTE:** La app debe tener el mismo diseño y funcionalidad que la versión web responsive, pero optimizada para móvil.

---

## 🌐 BACKEND DESPLEGADO

- **URL Base:** `http://46.225.210.163:3001/api`
- **Protocolo:** HTTP (en producción cambiar a HTTPS)
- **Formato de respuesta:** JSON
- **Autenticación:** JWT Bearer Token

---

## 📊 BASE DE DATOS (MySQL)

### Tabla: usuarios
```sql
usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  rol ENUM('estudiante', 'personal', 'admin'),
  activo BOOLEAN DEFAULT false,
  emailVerificado BOOLEAN DEFAULT false,
  emailToken VARCHAR(255),
  emailTokenExpira DATETIME,
  fechaVerificacion DATETIME,
  ultimaConfirmacionAnual DATETIME,
  tokenConfirmacionAnual VARCHAR(255),
  tokenAnualExpira DATETIME,
  confirmacionAnualEnviada DATETIME,
  resetPasswordToken VARCHAR(255),
  resetPasswordExpira DATETIME,
  createdAt DATETIME DEFAULT now(),
  updatedAt DATETIME
)
```

### Tabla: reportes
```sql
reportes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255),
  descripcion TEXT,
  ubicacion VARCHAR(255),
  categoria VARCHAR(100),
  foto_url VARCHAR(500),
  estado ENUM('pendiente', 'en_proceso', 'resuelto') DEFAULT 'pendiente',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  nota_personal TEXT,
  publicInFeed BOOLEAN DEFAULT false,
  fechaResolucion DATETIME,
  usuario_id INT FOREIGN KEY REFERENCES usuarios(id),
  fecha_creacion DATETIME DEFAULT now(),
  updatedAt DATETIME,
  INDEX(usuario_id),
  INDEX(estado),
  INDEX(categoria),
  INDEX(publicInFeed)
)
```

---

## 🔐 AUTENTICACIÓN

### Login Flow
1. Usuario ingresa email y password
2. POST a `/api/auth/login`
3. Backend retorna token JWT
4. Guardar token en SharedPreferences/DataStore
5. Incluir token en todas las peticiones: `Authorization: Bearer {token}`

### Verificación de email
- Después del registro, usuario recibe email con token
- Debe verificar antes de poder usar la app completamente

---

## 📡 API ENDPOINTS COMPLETOS

### 🔑 AUTH (`/api/auth`)

#### `POST /auth/registro`
**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@utp.ac.pa",
  "password": "Password123!",
  "rol": "estudiante"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Usuario registrado. Verifica tu email.",
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan.perez@utp.ac.pa",
      "rol": "estudiante"
    }
  }
}
```

#### `POST /auth/login`
**Request:**
```json
{
  "email": "juan.perez@utp.ac.pa",
  "password": "Password123!"
}
```
**Response 200:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan.perez@utp.ac.pa",
      "rol": "estudiante",
      "activo": true,
      "emailVerificado": true
    }
  }
}
```

**IMPORTANTE:** Si `rol === 'admin'`, mostrar error: "Los administradores no pueden acceder desde la app móvil"

#### `POST /auth/verificar-email`
**Request:**
```json
{
  "token": "token-de-verificacion"
}
```

#### `GET /auth/perfil`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan.perez@utp.ac.pa",
    "rol": "estudiante",
    "activo": true,
    "emailVerificado": true
  }
}
```

#### `POST /auth/logout`
**Headers:** `Authorization: Bearer {token}`

#### `POST /auth/forgot-password`
**Request:**
```json
{
  "email": "juan.perez@utp.ac.pa"
}
```

#### `POST /auth/reset-password`
**Request:**
```json
{
  "token": "reset-token",
  "password": "NewPassword123!"
}
```

---

### 📝 REPORTES (`/api/reportes`)

#### `GET /reportes` (Solo Personal)
Query params: `?estado=pendiente&page=1&limit=10`
**Response:**
```json
{
  "success": true,
  "data": {
    "reportes": [
      {
        "id": 1,
        "titulo": "Luz fundida en aula 203",
        "descripcion": "La luz del aula no enciende desde hace 3 días",
        "ubicacion": "Edificio 1 - Aula 203",
        "categoria": "Infraestructura",
        "fotoUrl": "http://46.225.210.163:3001/uploads/foto123.jpg",
        "estado": "pendiente",
        "prioridad": "media",
        "notaPersonal": "Revisar el martes",
        "publicInFeed": false,
        "fechaResolucion": null,
        "usuarioId": 5,
        "usuario": {
          "id": 5,
          "nombre": "María García",
          "email": "maria.garcia@utp.ac.pa"
        },
        "creadoEn": "2026-02-25T10:30:00Z",
        "actualizadoEn": "2026-02-25T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

#### `GET /reportes/mis-reportes` (Estudiantes)
**Headers:** `Authorization: Bearer {token}`
**Response:** Array de reportes del usuario autenticado

#### `GET /reportes/feed-publico`
Query params: `?page=1&limit=10`
**Response:** Reportes resueltos y marcados como públicos

#### `GET /reportes/:id`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Luz fundida en aula 203",
    // ... resto de campos
  }
}
```

#### `POST /reportes` (Crear reporte)
**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**FormData:**
```
titulo: "Luz fundida"
descripcion: "Descripción detallada"
ubicacion: "Edificio 1 - Aula 203"
categoria: "Infraestructura"
foto: File (opcional)
```

**Response 201:**
```json
{
  "success": true,
  "message": "Reporte creado exitosamente",
  "data": { /* reporte completo */ }
}
```

#### `PUT /reportes/:id` (Actualizar - Solo Personal)
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "estado": "resuelto",
  "prioridad": "alta",
  "nota_personal": "Reparado el 25/02/2026",
  "publicInFeed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reporte actualizado exitosamente",
  "data": { /* reporte actualizado */ }
}
```

#### `DELETE /reportes/:id`
**Headers:** `Authorization: Bearer {token}`

---

### 📊 ESTADÍSTICAS (`/api/estadisticas`)

#### `GET /estadisticas/dashboard`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "data": {
    "totalReportes": 150,
    "reportesPendientes": 25,
    "reportesEnProceso": 40,
    "reportesResueltos": 85,
    "reportesPorCategoria": [
      { "categoria": "Infraestructura", "total": 50 }
    ],
    "reportesPorUbicacion": [
      { "ubicacion": "Edificio 1", "total": 30 }
    ],
    "reportesPorMes": [
      { "mes": "Enero", "total": 20 }
    ],
    "tasaResolucion": 56.67,
    "tiempoPromedioResolucion": 72
  }
}
```

---

## 🎨 DISEÑO UI/UX (IGUAL A LA WEB RESPONSIVE)

### Paleta de colores
```kotlin
object AppColors {
    val Primary = Color(0xFF3B82F6)      // Azul principal
    val Secondary = Color(0xFF10B981)    // Verde
    val Error = Color(0xFFEF4444)        // Rojo
    val Warning = Color(0xFFF59E0B)      // Amarillo
    val Success = Color(0xFF10B981)      // Verde
    val Background = Color(0xFFF9FAFB)   // Gris claro
    val Surface = Color(0xFFFFFFFF)      // Blanco
    val TextPrimary = Color(0xFF111827)  // Gris oscuro
    val TextSecondary = Color(0xFF6B7280) // Gris medio
}
```

### Componentes principales

#### ReporteCard
```
┌─────────────────────────────────┐
│ [Imagen del reporte]            │
│                                 │
├─────────────────────────────────┤
│ Título del reporte            📍│
│ Ubicación: Edificio 1           │
│ ⏱️ Hace 2 horas                  │
│ 📊 [Badge Estado]  [Prioridad]  │
└─────────────────────────────────┘
```

#### Estados con colores
- **Pendiente:** Amarillo (#F59E0B)
- **En Proceso:** Azul (#3B82F6)
- **Resuelto:** Verde (#10B981)

#### Prioridades
- **Baja:** Verde claro
- **Media:** Amarillo
- **Alta:** Rojo

---

## 📱 PANTALLAS DE LA APP

### 1. Auth Flow

#### SplashScreen
- Logo UTP
- Verificar si hay token guardado
- Si hay token válido → Dashboard
- Si no → LoginScreen

#### LoginScreen
```
┌──────────────────────────┐
│   [Logo UTP]             │
│                          │
│   Sistema de             │
│   Mantenimiento          │
│                          │
│   📧 [Email]             │
│   🔒 [Password]          │
│                          │
│   [Botón INGRESAR]       │
│                          │
│   ¿Olvidaste tu         │
│   contraseña?            │
│                          │
│   ¿No tienes cuenta?     │
│   Regístrate             │
└──────────────────────────┘
```

**VALIDACIÓN LOGIN:**
```kotlin
if (response.data.usuario.rol == "admin") {
    showError("Los administradores no pueden acceder desde la app móvil")
    return
}
```

#### RegisterScreen
```
┌──────────────────────────┐
│   Crear Cuenta           │
│                          │
│   👤 [Nombre completo]   │
│   📧 [Email UTP]         │
│   🔒 [Contraseña]        │
│   🔒 [Confirmar]         │
│   📋 [Rol: estudiante]   │
│                          │
│   [Botón REGISTRAR]      │
│                          │
│   ¿Ya tienes cuenta?     │
│   Inicia sesión          │
└──────────────────────────┘
```

---

### 2. ESTUDIANTE Flow

#### Dashboard (Estudiante)
```
┌──────────────────────────┐
│ [Header con nombre]   🔔 │
│ Hola, Juan               │
├──────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐    │
│ │ 12 │ │ 5  │ │ 7  │    │
│ │Tot│  │Pend│ │Res│     │
│ └────┘ └────┘ └────┘    │
├──────────────────────────┤
│ [+ Crear Reporte]        │
├──────────────────────────┤
│ Mis Reportes             │
│                          │
│ ┌──────────────────┐    │
│ │ [ReporteCard 1]  │    │
│ └──────────────────┘    │
│ ┌──────────────────┐    │
│ │ [ReporteCard 2]  │    │
│ └──────────────────┘    │
├──────────────────────────┤
│ Feed Público             │
│ (Casos Resueltos)        │
│                          │
│ ┌──────────────────┐    │
│ │ [ReporteCard]    │    │
│ │ ✓ Resuelto       │    │
│ └──────────────────┘    │
└──────────────────────────┘
```

#### MisReportesScreen
```
┌──────────────────────────┐
│ ← Mis Reportes      [+]  │
├──────────────────────────┤
│ [Filtros: Estado ▼]      │
├──────────────────────────┤
│ ┌──────────────────┐    │
│ │ Luz fundida      │    │
│ │ 📍 Edificio 1     │    │
│ │ ⏱️ Hace 2 horas   │    │
│ │ [Pendiente]      │    │
│ └──────────────────┘    │
│                          │
│ ┌──────────────────┐    │
│ │ Puerta rota      │    │
│ │ 📍 Edificio 2     │    │
│ │ ⏱️ Hace 1 día     │    │
│ │ [En Proceso]     │    │
│ └──────────────────┘    │
└──────────────────────────┘
```

#### CrearReporteScreen
```
┌──────────────────────────┐
│ ← Crear Reporte          │
├──────────────────────────┤
│ 📝 Título                │
│ [Input]                  │
│                          │
│ 📄 Descripción           │
│ [TextArea multiline]     │
│                          │
│ 📍 Ubicación             │
│ [Dropdown]               │
│                          │
│ 🏷️ Categoría             │
│ [Dropdown]               │
│                          │
│ 📷 Foto (opcional)       │
│ ┌──────────────────┐    │
│ │   [+]            │    │
│ │ Tomar/Subir foto │    │
│ └──────────────────┘    │
│                          │
│ [Botón CREAR REPORTE]    │
└──────────────────────────┘
```

#### DetalleReporteScreen (Estudiante)
```
┌──────────────────────────┐
│ ← Reporte #1234          │
├──────────────────────────┤
│ [Imagen grande]          │
├──────────────────────────┤
│ Luz fundida en aula 203  │
│ [Badge: Pendiente]       │
│                          │
│ 📄 Descripción           │
│ La luz no enciende...    │
│                          │
│ 📍 Ubicación             │
│ Edificio 1 - Aula 203    │
│                          │
│ 🏷️ Categoría             │
│ Infraestructura          │
│                          │
│ 👤 Reportado por         │
│ Juan Pérez               │
│                          │
│ 📅 Fecha                 │
│ 25/02/2026 10:30         │
│                          │
│ 📝 Nota del Personal     │
│ (Si existe)              │
│                          │
│ [Botón ELIMINAR]         │
└──────────────────────────┘
```

---

### 3. PERSONAL Flow

#### Dashboard (Personal)
```
┌──────────────────────────┐
│ [Header]              🔔 │
│ Panel de Personal        │
├──────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐    │
│ │150 │ │ 25 │ │ 85 │    │
│ │Tot│  │Pend│ │Res│     │
│ └────┘ └────┘ └────┘    │
├──────────────────────────┤
│ Reportes Pendientes      │
│                          │
│ ┌──────────────────┐    │
│ │ [ReporteCard]    │    │
│ │ [Alta] 🔴        │    │
│ └──────────────────┘    │
│                          │
│ Resueltos Hoy: 5         │
│ Resueltos Semana: 12     │
└──────────────────────────┘
```

#### ReportesScreen (Personal)
```
┌──────────────────────────┐
│ ← Todos los Reportes     │
├──────────────────────────┤
│ [Estado ▼] [Prioridad ▼] │
├──────────────────────────┤
│ ┌──────────────────┐    │
│ │ Luz fundida      │    │
│ │ 📍 Edificio 1     │    │
│ │ 👤 Juan Pérez     │    │
│ │ [Pendiente] [Tap]│    │
│ └──────────────────┘    │
└──────────────────────────┘
```

#### DetalleReporteScreen (Personal)
```
┌──────────────────────────┐
│ ← Reporte #1234          │
├──────────────────────────┤
│ [Imagen]                 │
│                          │
│ Luz fundida en aula 203  │
│                          │
│ 📄 Descripción           │
│ ...                      │
│                          │
│ 👤 Reportado por         │
│ Juan Pérez               │
│ juan.perez@utp.ac.pa     │
├──────────────────────────┤
│ 🛠️ Gestionar Reporte     │
│                          │
│ Estado                   │
│ [Dropdown]               │
│ ☑️ Pendiente             │
│   En Proceso             │
│   Resuelto               │
│                          │
│ Prioridad                │
│ [Dropdown]               │
│ ☑️ Media                 │
│   Alta                   │
│   Baja                   │
│                          │
│ [SI estado == resuelto]  │
│ ☑️ Publicar en Feed      │
│    Público               │
│                          │
│ 📝 Nota del Personal     │
│ [TextArea]               │
│                          │
│ [Botón GUARDAR CAMBIOS]  │
└──────────────────────────┘
```

---

## 🗂️ ESTRUCTURA DEL PROYECTO ANDROID

```
app/
├── build.gradle.kts
├── src/main/
│   ├── AndroidManifest.xml
│   ├── java/com/utp/mantenimiento/
│   │   ├── MantenimientoApp.kt
│   │   │
│   │   ├── data/
│   │   │   ├── api/
│   │   │   │   ├── MantenimientoAPI.kt
│   │   │   │   └── AuthInterceptor.kt
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── Usuario.kt
│   │   │   │   ├── Reporte.kt
│   │   │   │   ├── LoginRequest.kt
│   │   │   │   ├── LoginResponse.kt
│   │   │   │   └── ApiResponse.kt
│   │   │   │
│   │   │   └── repository/
│   │   │       ├── AuthRepository.kt
│   │   │       └── ReportesRepository.kt
│   │   │
│   │   ├── ui/
│   │   │   ├── theme/
│   │   │   │   ├── Color.kt
│   │   │   │   ├── Theme.kt
│   │   │   │   └── Type.kt
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ReporteCard.kt
│   │   │   │   ├── EstadoBadge.kt
│   │   │   │   ├── PrioridadBadge.kt
│   │   │   │   └── LoadingScreen.kt
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   └── NavGraph.kt
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.kt
│   │   │   │   ├── LoginViewModel.kt
│   │   │   │   ├── RegisterScreen.kt
│   │   │   │   └── RegisterViewModel.kt
│   │   │   │
│   │   │   ├── estudiante/
│   │   │   │   ├── EstudianteDashboard.kt
│   │   │   │   ├── DashboardViewModel.kt
│   │   │   │   ├── MisReportesScreen.kt
│   │   │   │   ├── CrearReporteScreen.kt
│   │   │   │   ├── CrearReporteViewModel.kt
│   │   │   │   ├── DetalleReporteScreen.kt
│   │   │   │   └── FeedPublicoScreen.kt
│   │   │   │
│   │   │   └── personal/
│   │   │       ├── PersonalDashboard.kt
│   │   │       ├── PersonalDashboardViewModel.kt
│   │   │       ├── ReportesScreen.kt
│   │   │       ├── ReportesViewModel.kt
│   │   │       ├── DetalleReportePersonalScreen.kt
│   │   │       └── DetalleReporteViewModel.kt
│   │   │
│   │   └── utils/
│   │       ├── Constants.kt
│   │       ├── AuthManager.kt
│   │       ├── NetworkModule.kt
│   │       └── Extensions.kt
│   │
│   └── res/
│       ├── values/strings.xml
│       └── drawable/
```

---

## 🔧 DEPENDENCIAS (build.gradle.kts)

```kotlin
dependencies {
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Compose
    val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coil (Imágenes)
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // DataStore (Token storage)
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

---

## 📝 CONFIGURACIÓN INICIAL

### AndroidManifest.xml
```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application
        android:name=".MantenimientoApp"
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config"
        ...>
```

### network_security_config.xml
```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">46.225.210.163</domain>
    </domain-config>
</network-security-config>
```

---

## 🚀 CÓDIGO BASE ESENCIAL

### Constants.kt
```kotlin
object Constants {
    const val BASE_URL = "http://46.225.210.163:3001/api/"
    const val TOKEN_KEY = "auth_token"
    const val USER_KEY = "user_data"
    
    // Ubicaciones UTP
    val UBICACIONES = listOf(
        "Edificio 1",
        "Edificio 2",
        "Edificio 3",
        "Biblioteca",
        "Cafetería",
        "Laboratorios",
        "Canchas deportivas"
    )
    
    // Categorías
    val CATEGORIAS = listOf(
        "Infraestructura",
        "Equipamiento",
        "Limpieza",
        "Seguridad",
        "Servicios",
        "Otro"
    )
}
```

### MantenimientoAPI.kt
```kotlin
interface MantenimientoAPI {
    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
    
    @POST("auth/registro")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<Usuario>
    
    @GET("auth/perfil")
    suspend fun getPerfil(): ApiResponse<Usuario>
    
    // Reportes
    @GET("reportes/mis-reportes")
    suspend fun getMisReportes(): ApiResponse<List<Reporte>>
    
    @GET("reportes")
    suspend fun getReportes(
        @Query("estado") estado: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10
    ): ApiResponse<ReportesResponse>
    
    @GET("reportes/feed-publico")
    suspend fun getFeedPublico(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10
    ): ApiResponse<ReportesResponse>
    
    @GET("reportes/{id}")
    suspend fun getReporte(@Path("id") id: Int): ApiResponse<Reporte>
    
    @Multipart
    @POST("reportes")
    suspend fun crearReporte(
        @Part("titulo") titulo: RequestBody,
        @Part("descripcion") descripcion: RequestBody,
        @Part("ubicacion") ubicacion: RequestBody,
        @Part("categoria") categoria: RequestBody,
        @Part foto: MultipartBody.Part?
    ): ApiResponse<Reporte>
    
    @PUT("reportes/{id}")
    suspend fun actualizarReporte(
        @Path("id") id: Int,
        @Body request: ActualizarReporteRequest
    ): ApiResponse<Reporte>
    
    @DELETE("reportes/{id}")
    suspend fun eliminarReporte(@Path("id") id: Int): ApiResponse<Unit>
    
    // Estadísticas
    @GET("estadisticas/dashboard")
    suspend fun getEstadisticas(): ApiResponse<Estadisticas>
}
```

### Modelos de datos
```kotlin
data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val message: String,
    val data: LoginData
)

data class LoginData(
    val token: String,
    val usuario: Usuario
)

data class Usuario(
    val id: Int,
    val nombre: String,
    val email: String,
    val rol: String,
    val activo: Boolean,
    val emailVerificado: Boolean
)

data class Reporte(
    val id: Int,
    val titulo: String,
    val descripcion: String,
    val ubicacion: String,
    val categoria: String,
    val fotoUrl: String?,
    val estado: String,
    val prioridad: String?,
    val notaPersonal: String?,
    val publicInFeed: Boolean?,
    val fechaResolucion: String?,
    val usuarioId: Int,
    val usuario: UsuarioBasico?,
    val creadoEn: String,
    val actualizadoEn: String
)

data class UsuarioBasico(
    val id: Int,
    val nombre: String,
    val email: String
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T
)

data class ReportesResponse(
    val reportes: List<Reporte>,
    val pagination: Pagination
)

data class Pagination(
    val total: Int,
    val page: Int,
    val limit: Int,
    val totalPages: Int
)

data class Estadisticas(
    val totalReportes: Int,
    val reportesPendientes: Int,
    val reportesEnProceso: Int,
    val reportesResueltos: Int,
    val reportesPorCategoria: List<CategoriaStats>,
    val tasaResolucion: Double?,
    val tiempoPromedioResolucion: Int?
)

data class ActualizarReporteRequest(
    val estado: String?,
    val prioridad: String?,
    val nota_personal: String?,
    val publicInFeed: Boolean?
)
```

---

## ✅ VALIDACIONES IMPORTANTES

### Login
```kotlin
// En LoginViewModel
if (response.data.usuario.rol == "admin") {
    _uiState.value = LoginUiState.Error(
        "Los administradores no pueden acceder desde la app móvil. " +
        "Por favor, use la versión web."
    )
    return
}

if (!response.data.usuario.emailVerificado) {
    _uiState.value = LoginUiState.Error(
        "Por favor, verifica tu email antes de continuar."
    )
    return
}
```

### Crear Reporte
```kotlin
// Validaciones
if (titulo.length < 5) {
    return "El título debe tener al menos 5 caracteres"
}
if (descripcion.length < 10) {
    return "La descripción debe tener al menos 10 caracteres"
}
if (ubicacion.isEmpty()) {
    return "Selecciona una ubicación"
}
```

---

## 🎯 FUNCIONALIDADES REQUERIDAS

### Para ESTUDIANTE:
- ✅ Login (bloquear admin)
- ✅ Ver dashboard con estadísticas personales
- ✅ Ver "Mis Reportes" (creados por el usuario)
- ✅ Crear nuevo reporte (con foto)
- ✅ Ver detalle de sus reportes
- ✅ Eliminar sus propios reportes
- ✅ Ver Feed Público (reportes resueltos)
- ✅ Perfil y logout

### Para PERSONAL:
- ✅ Login (bloquear admin)
- ✅ Ver dashboard con todas las estadísticas
- ✅ Ver todos los reportes (filtrar por estado/prioridad)
- ✅ Ver detalle de cualquier reporte
- ✅ Cambiar estado de reportes
- ✅ Cambiar prioridad
- ✅ Agregar notas al personal
- ✅ Marcar como público en feed (solo si estado = resuelto)
- ✅ Perfil y logout

---

## 🎨 COMPONENTES REUTILIZABLES CLAVE

### ReporteCard.kt
```kotlin
@Composable
fun ReporteCard(
    reporte: Reporte,
    onClick: () -> Unit,
    esPersonal: Boolean = false
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column {
            // Imagen
            if (reporte.fotoUrl != null) {
                AsyncImage(
                    model = reporte.fotoUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentScale = ContentScale.Crop
                )
            }
            
            Column(modifier = Modifier.padding(16.dp)) {
                // Título y badges
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = reporte.titulo,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    EstadoBadge(estado = reporte.estado)
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Ubicación
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = reporte.ubicacion,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                
                // Si es personal, mostrar quien reportó
                if (esPersonal && reporte.usuario != null) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, ...)
                        Text(text = reporte.usuario.nombre)
                    }
                }
                
                // Fecha
                Text(
                    text = formatearFechaRelativa(reporte.creadoEn),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.secondary
                )
                
                // Prioridad
                if (reporte.prioridad != null) {
                    PrioridadBadge(prioridad = reporte.prioridad)
                }
            }
        }
    }
}
```

---

## 🚨 MANEJO DE ERRORES

```kotlin
sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

// En ViewModels
catch (e: HttpException) {
    _uiState.value = UiState.Error(
        when (e.code()) {
            401 -> "Sesión expirada. Por favor inicia sesión nuevamente"
            404 -> "Recurso no encontrado"
            500 -> "Error del servidor. Intenta más tarde"
            else -> e.message() ?: "Error desconocido"
        }
    )
} catch (e: IOException) {
    _uiState.value = UiState.Error(
        "Error de conexión. Verifica tu internet"
    )
}
```

---

## 📸 SUBIDA DE IMÁGENES

```kotlin
// En CrearReporteViewModel
fun crearReporte(
    titulo: String,
    descripcion: String,
    ubicacion: String,
    categoria: String,
    imageUri: Uri?
) {
    viewModelScope.launch {
        try {
            val tituloBody = titulo.toRequestBody("text/plain".toMediaType())
            val descripcionBody = descripcion.toRequestBody("text/plain".toMediaType())
            val ubicacionBody = ubicacion.toRequestBody("text/plain".toMediaType())
            val categoriaBody = categoria.toRequestBody("text/plain".toMediaType())
            
            val fotoPart = imageUri?.let { uri ->
                val file = uriToFile(context, uri)
                val requestFile = file.asRequestBody("image/*".toMediaType())
                MultipartBody.Part.createFormData("foto", file.name, requestFile)
            }
            
            val response = repository.crearReporte(
                tituloBody,
                descripcionBody,
                ubicacionBody,
                categoriaBody,
                fotoPart
            )
            
            _uiState.value = UiState.Success(response.data)
        } catch (e: Exception) {
            _uiState.value = UiState.Error(e.message ?: "Error al crear reporte")
        }
    }
}
```

---

## 🔄 NAVEGACIÓN

```kotlin
sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object EstudianteDashboard : Screen("estudiante/dashboard")
    object MisReportes : Screen("estudiante/reportes")
    object CrearReporte : Screen("estudiante/crear")
    object DetalleReporte : Screen("estudiante/reporte/{id}")
    object PersonalDashboard : Screen("personal/dashboard")
    object PersonalReportes : Screen("personal/reportes")
    object PersonalDetalle : Screen("personal/reporte/{id}")
}
```

---

## ⚡ TIPS DE OPTIMIZACIÓN

1. **Caché de imágenes**: Coil lo hace automáticamente
2. **Paginación**: Implementar LazyColumn con paginación para lista larga de reportes
3. **Pull to Refresh**: Usar `SwipeRefresh` en listas
4. **Estados offline**: Mostrar mensaje cuando no hay conexión
5. **Validación de token**: Interceptor que renueva token si expira

---

## 🎯 PROMPT FINAL PARA LA IA

**"Crea una aplicación Android completa en Kotlin con Jetpack Compose siguiendo EXACTAMENTE toda la especificación anterior. Incluye:**

1. **Configuración inicial** con todas las dependencias
2. **Pantallas de autenticación** (Login, Registro) bloqueando acceso de admins
3. **Dashboard de Estudiante** con estadísticas, mis reportes y feed público
4. **Dashboard de Personal** con todos los reportes y filtros
5. **Creación de reportes** con subida de fotos
6. **Detalle de reportes** (vista estudiante y vista personal con gestión)
7. **Navegación completa** entre todas las pantallas
8. **Manejo de estados** (Loading, Success, Error)
9. **Almacenamiento de token JWT** con DataStore
10. **Componentes reutilizables** (ReporteCard, Badges, etc.)
11. **Mismo diseño y paleta de colores** de la web responsive
12. **Retrofit configurado** para la API en `http://46.225.210.163:3001/api`

**Genera todos los archivos necesarios con código completo y comentarios."**

---

## 📋 CHECKLIST FINAL

- [ ] Login funcional (bloquea admin)
- [ ] Register funcional
- [ ] Dashboard Estudiante
- [ ] Crear reporte con foto
- [ ] Ver mis reportes
- [ ] Detalle de reporte (estudiante)
- [ ] Feed público
- [ ] Dashboard Personal
- [ ] Ver todos los reportes
- [ ] Filtros por estado/prioridad
- [ ] Detalle de reporte (personal)
- [ ] Cambiar estado/prioridad
- [ ] Agregar notas
- [ ] Checkbox feed público (solo si resuelto)
- [ ] Logout
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Pull to refresh

---

**¡SUCCESS! 🚀 Con este prompt tienes TODO lo necesario para que la IA genere la app Android completa en minutos!**
