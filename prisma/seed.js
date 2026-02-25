const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // Crear usuarios de prueba
  const ahora = new Date();
  const usuarios = [
    {
      nombre: 'Estudiante Demo',
      email: 'estudiante@utp.ac.pa',
      password: hashedPassword,
      rol: 'estudiante',
      activo: true,
      emailVerificado: true,
      fechaVerificacion: ahora,
      ultimaConfirmacionAnual: ahora,
    },
    {
      nombre: 'Personal Demo',
      email: 'personal@utp.ac.pa',
      password: hashedPassword,
      rol: 'personal',
      activo: true,
      emailVerificado: true,
      fechaVerificacion: ahora,
      ultimaConfirmacionAnual: ahora,
    },
    {
      nombre: 'Admin Demo',
      email: 'admin@utp.ac.pa',
      password: hashedPassword,
      rol: 'admin',
      activo: true,
      emailVerificado: true,
      fechaVerificacion: ahora,
      ultimaConfirmacionAnual: ahora,
    },
  ];

  for (const userData of usuarios) {
    try {
      const usuario = await prisma.usuario.upsert({
        where: { email: userData.email },
        update: {
          activo: true,
          emailVerificado: true,
          fechaVerificacion: ahora,
          ultimaConfirmacionAnual: ahora,
        },
        create: userData,
      });
      console.log(`✅ Usuario creado/actualizado: ${usuario.email} (${usuario.rol})`);
    } catch (error) {
      console.log(`⚠️  Error con usuario: ${userData.email}`, error.message);
    }
  }

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('📋 Credenciales de acceso:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 estudiante@utp.ac.pa / 🔑 123456 (Estudiante)');
  console.log('📧 personal@utp.ac.pa   / 🔑 123456 (Personal)');
  console.log('📧 admin@utp.ac.pa      / 🔑 123456 (Admin)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
