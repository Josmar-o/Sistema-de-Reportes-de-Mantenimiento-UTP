require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth');
const reportesRoutes = require('./routes/reportes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Ruta de health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Reportes de Mantenimiento Universitario',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      reportes: '/api/reportes'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reportesRoutes);

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación: http://localhost:${PORT}`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

module.exports = app;
