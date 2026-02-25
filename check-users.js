const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuarios en la base de datos...\n');

  const usuarios = await prisma.usuario.findMany();

  if (usuarios.length === 0) {
    console.log('❌ No hay usuarios en la base de datos');
    console.log('💡 Ejecuta: npx prisma db seed\n');
    return;
  }

  console.log(`✅ Se encontraron ${usuarios.length} usuarios:\n`);

  for (const usuario of usuarios) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📧 Email: ${usuario.email}`);
    console.log(`👤 Nombre: ${usuario.nombre}`);
    console.log(`🎭 Rol: ${usuario.rol}`);
    console.log(`🔑 Password Hash: ${usuario.password.substring(0, 20)}...`);
    
    // Verificar si la contraseña '123456' coincide
    const isValid = await bcrypt.compare('123456', usuario.password);
    console.log(`🔐 Contraseña '123456' válida: ${isValid ? '✅ SÍ' : '❌ NO'}`);
    console.log(`📅 Creado: ${usuario.createdAt}`);
  }
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
