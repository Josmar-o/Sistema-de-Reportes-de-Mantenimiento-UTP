require('dotenv').config();
const { enviarVerificacionEmail } = require('./src/config/email');

async function test() {
  const usuario = {
    nombre: 'Omar Garcia',
    email: 'omar.garcia1@utp.ac.pa',
  };
  const token = 'test-token-123abc';

  try {
    const result = await enviarVerificacionEmail(usuario, token);
    console.log('✅ Enviado:', result.id);
  } catch (error) {
    console.error('❌ Error:', error.status, error.message);
  }
}

test();
