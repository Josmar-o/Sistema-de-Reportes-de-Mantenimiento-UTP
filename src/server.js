require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const crypto = require('crypto');
const prisma = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { enviarConfirmacionAnual } = require('./config/email');

// Importar rutas
const authRoutes = require('./routes/auth');
const reportesRoutes = require('./routes/reportes');
const estadisticasRoutes = require('./routes/estadisticas');
const usuariosRoutes = require('./routes/usuarios');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://46.225.210.163',
  'http://josmardev.me',
  'http://www.josmardev.me',
  'https://46.225.210.163',
  'https://josmardev.me',
  'https://www.josmardev.me',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
      reportes: '/api/reportes',
      estadisticas: '/api/estadisticas',
      usuarios: '/api/usuarios'
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
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/usuarios', usuariosRoutes);

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

    // ── Cron: verificación anual de cuentas (se ejecuta cada día a las 8am) ──
    cron.schedule('0 8 * * *', async () => {
      console.log('⏰ Cron: revisando cuentas para confirmación anual...');
      const ahora = new Date();

      // Hace 11 meses = falta 1 mes para el año
      const hace11Meses = new Date(ahora);
      hace11Meses.setMonth(hace11Meses.getMonth() - 11);

      // Hace 12 meses = el año ya expiró
      const hace12Meses = new Date(ahora);
      hace12Meses.setMonth(hace12Meses.getMonth() - 12);

      // 1. Enviar correo de confirmación a los que llevan 11 meses sin confirmar
      const pendientesEnvio = await prisma.usuario.findMany({
        where: {
          activo: true,
          emailVerificado: true,
          confirmacionAnualEnviada: null,
          ultimaConfirmacionAnual: { lte: hace11Meses },
        },
      });

      for (const usuario of pendientesEnvio) {
        const token = crypto.randomBytes(32).toString('hex');
        const expira = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { tokenConfirmacionAnual: token, tokenAnualExpira: expira, confirmacionAnualEnviada: ahora },
        });
        try { await enviarConfirmacionAnual(usuario, token); }
        catch (e) { console.error(`Error correo anual ${usuario.email}:`, e.message); }
      }
      if (pendientesEnvio.length) console.log(`📧 Correos anuales enviados: ${pendientesEnvio.length}`);

      // 2. Desactivar cuentas que no confirmaron en 12 meses
      const { count } = await prisma.usuario.updateMany({
        where: {
          activo: true,
          emailVerificado: true,
          ultimaConfirmacionAnual: { lte: hace12Meses },
          rol: { not: 'admin' }, // no desactivar admins
        },
        data: { activo: false },
      });
      if (count) console.log(`🚫 Cuentas desactivadas por inactividad anual: ${count}`);
    });
    console.log('⏰ Cron de verificación anual activado (8am diario)');

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
