const { PrismaClient } = require('@prisma/client');

// Configurar logs según el entorno
const logConfig = process.env.NODE_ENV === 'production'
  ? ['error']
  : ['warn', 'error']; // En desarrollo solo warnings y errores

const prisma = new PrismaClient({
  log: logConfig,
});

// Manejador para cerrar la conexión cuando se cierre la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
