const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Manejador para cerrar la conexión cuando se cierre la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
