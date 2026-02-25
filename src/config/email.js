const Mailgun = require('mailgun.js');
const FormData = require('form-data');

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'key-placeholder',
});

const DOMAIN = process.env.MAILGUN_DOMAIN || 'sandbox.mailgun.org';
const FROM = process.env.MAILGUN_FROM || 'Sistema UTP <noreply@sandbox.mailgun.org>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Estilos base compartidos
const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 36px 40px; text-align: center; }
  .header img { width: 48px; height: 48px; margin-bottom: 12px; }
  .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.3px; }
  .header p { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
  .content { padding: 40px; color: #374151; }
  .content h2 { font-size: 20px; color: #111827; margin: 0 0 16px; }
  .content p { font-size: 15px; line-height: 1.7; margin: 0 0 16px; color: #4b5563; }
  .btn { display: inline-block; padding: 14px 32px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0 20px; }
  .btn-danger { background: #dc2626; }
  .btn-success { background: #16a34a; }
  .info-box { background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #1e40af; }
  .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #92400e; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 28px 0; }
  .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { color: #9ca3af; font-size: 12px; margin: 0 0 4px; }
  .footer a { color: #6b7280; text-decoration: none; }
`;

const htmlBase = (content) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>${baseStyles}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🏫 UTP Mantenimiento</h1>
    <p>Sistema de Reportes de Mantenimiento</p>
  </div>
  <div class="content">${content}</div>
  <div class="footer">
    <p>Universidad Tecnológica de Panamá</p>
    <p>Si no reconoces esta actividad, ignora este correo.</p>
  </div>
</div>
</body>
</html>`;

/**
 * Envía un email usando Mailgun
 */
const enviarEmail = async ({ to, subject, html, text }) => {
  try {
    const result = await mg.messages.create(DOMAIN, {
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    console.log(`✉️  Email enviado a ${to}: ${subject} | ID: ${result.id}`);
    return result;
  } catch (error) {
    console.error('❌ Error al enviar email:', error.status, error.message, error.details);
    throw error;
  }
};

/**
 * Email de verificación al registrarse
 */
const enviarVerificacionEmail = async (usuario, token) => {
  const url = `${FRONTEND_URL}/verificar-email?token=${token}`;
  return enviarEmail({
    to: usuario.email,
    subject: 'Verifica tu cuenta - UTP Mantenimiento',
    text: `Hola ${usuario.nombre},\n\nVerifica tu cuenta en el siguiente enlace:\n${url}\n\nEste enlace expira en 24 horas.\n\nIMPORTANTE: Un año despues de activar tu cuenta, recibirás un correo para confirmar que sigues activo en la UTP. Si no confirmas en 30 dias, tu cuenta será desactivada automaticamente.\n\nSi no creaste esta cuenta, ignora este correo.`,
    html: htmlBase(`
      <h2>Bienvenido, ${usuario.nombre}</h2>
      <p>Tu cuenta ha sido creada exitosamente. Para activarla, necesitas verificar tu dirección de correo electrónico.</p>
      <div style="text-align:center; margin: 28px 0;">
        <a href="${url}" class="btn">Verificar mi cuenta</a>
      </div>
      <div class="warning-box">
        Este enlace expira en 24 horas.
      </div>
      <hr class="divider">
      <div class="info-box">
        <strong>Confirmación anual:</strong> Cada año te enviaremos un correo para confirmar que sigues activo en la UTP. Tendrás 30 días para confirmar o tu cuenta será desactivada automáticamente. Esto asegura que solo miembros activos de la institución usen el sistema.
      </div>
      <hr class="divider">
      <p style="font-size:13px; color:#6b7280;">Si el botón no funciona, copia este enlace en tu navegador:<br>
        <a href="${url}" style="color:#2563eb; word-break:break-all;">${url}</a>
      </p>
    `),
  });
};

/**
 * Email de confirmación anual (enviar 1 mes antes del año cumplido)
 */
const enviarConfirmacionAnual = async (usuario, token) => {
  const url = `${FRONTEND_URL}/confirmar-cuenta?token=${token}`;
  return enviarEmail({
    to: usuario.email,
    subject: 'Confirmacion anual requerida - UTP Mantenimiento',
    text: `Hola ${usuario.nombre},\n\nHan pasado casi 11 meses desde que verificaste tu cuenta. Confirma que sigues en la UTP aquí:\n${url}\n\nSi no confirmas en los próximos 30 días, tu cuenta será desactivada.\n\nSi ya no formas parte de la UTP, ignora este correo.`,
    html: htmlBase(`
      <h2>Hola, ${usuario.nombre}</h2>
      <p>Han pasado casi <strong>11 meses</strong> desde que verificaste tu cuenta. Para seguir usando el sistema, necesitas confirmar que sigues siendo parte de la UTP.</p>
      <div class="warning-box">
        Si no confirmas tu cuenta en los próximos <strong>30 días</strong>, será <strong>desactivada automáticamente</strong>.
      </div>
      <div style="text-align:center; margin: 28px 0;">
        <a href="${url}" class="btn btn-success">Confirmar que sigo en la UTP</a>
      </div>
      <hr class="divider">
      <p style="font-size:13px; color:#6b7280;">Si el botón no funciona, copia este enlace en tu navegador:<br>
        <a href="${url}" style="color:#2563eb; word-break:break-all;">${url}</a>
      </p>
      <p style="font-size:13px; color:#6b7280;">Si ya no formas parte de la UTP, puedes ignorar este correo y tu cuenta será desactivada tras 30 días.</p>
    `),
  });
};

/**
 * Email de reset de contraseña
 */
const enviarResetPassword = async (usuario, token) => {
  const url = `${FRONTEND_URL}/reset-password?token=${token}`;
  return enviarEmail({
    to: usuario.email,
    subject: 'Restablecer contrasena - UTP Mantenimiento',
    text: `Hola ${usuario.nombre},\n\nSolicitaste restablecer tu contraseña. Haz clic en el siguiente enlace:\n${url}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste este cambio, ignora este correo.`,
    html: htmlBase(`
      <h2>Restablecer contraseña</h2>
      <p>Recibiste este correo porque solicitaste restablecer la contraseña de tu cuenta asociada a <strong>${usuario.email}</strong>.</p>
      <div style="text-align:center; margin: 28px 0;">
        <a href="${url}" class="btn">Restablecer contraseña</a>
      </div>
      <div class="info-box">
        Este enlace expira en <strong>1 hora</strong>.
      </div>
      <hr class="divider">
      <p style="font-size:13px; color:#6b7280;">Si no solicitaste este cambio, ignora este correo. Tu contraseña no cambiará.</p>
      <p style="font-size:13px; color:#6b7280;">Si el botón no funciona, copia este enlace:<br>
        <a href="${url}" style="color:#2563eb; word-break:break-all;">${url}</a>
      </p>
    `),
  });
};

/**
 * Email de bienvenida después de verificar la cuenta
 */
const enviarBienvenida = async (usuario) => {
  return enviarEmail({
    to: usuario.email,
    subject: 'Cuenta activada - UTP Mantenimiento',
    text: `Hola ${usuario.nombre},\n\nTu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión en:\n${FRONTEND_URL}/login\n\nRecuerda que cada año recibirás un correo para confirmar que sigues en la UTP.`,
    html: htmlBase(`
      <h2>Tu cuenta está activa</h2>
      <p>Hola <strong>${usuario.nombre}</strong>, tu cuenta ha sido verificada exitosamente.</p>
      <div class="info-box">
        Ya puedes iniciar sesión y reportar incidencias de mantenimiento en el campus.
      </div>
      <div style="text-align:center; margin: 28px 0;">
        <a href="${FRONTEND_URL}/login" class="btn">Iniciar sesión</a>
      </div>
      <p style="font-size:13px; color:#6b7280;">Recuerda: cada año recibirás un correo para confirmar que sigues siendo parte de la UTP.</p>
    `),
  });
};

module.exports = {
  enviarEmail,
  enviarVerificacionEmail,
  enviarConfirmacionAnual,
  enviarResetPassword,
  enviarBienvenida,
};
