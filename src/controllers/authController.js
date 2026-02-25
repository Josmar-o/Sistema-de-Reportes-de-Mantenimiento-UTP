const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');
const {
  enviarVerificacionEmail,
  enviarBienvenida,
  enviarResetPassword,
} = require('../config/email');

// ─────────────────────────────────────────────
// Helper: genera token aleatorio + fecha expiración
// ─────────────────────────────────────────────
const generarToken = (horas = 24) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + horas * 60 * 60 * 1000);
  return { token, expira };
};

// ─────────────────────────────────────────────
// POST /api/auth/registro
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { token, expira } = generarToken(24);

    const usuario = await prisma.usuario.create({
      data: {
        nombre, email, password: hashedPassword,
        rol: rol || 'estudiante',
        activo: false,
        emailVerificado: false,
        emailToken: token,
        emailTokenExpira: expira,
      },
      select: { id: true, nombre: true, email: true, rol: true },
    });

    try { await enviarVerificacionEmail(usuario, token); }
    catch (e) { console.error('Correo verificación:', e.message); }

    res.status(201).json({
      success: true,
      message: 'Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.',
      data: { usuario },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/auth/verificar-email?token=xxx
// ─────────────────────────────────────────────
const verificarEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token requerido' });

    const usuario = await prisma.usuario.findFirst({
      where: { emailToken: token, emailTokenExpira: { gt: new Date() } },
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado. Solicita un nuevo correo de verificación.',
      });
    }

    const ahora = new Date();
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        activo: true, emailVerificado: true,
        emailToken: null, emailTokenExpira: null,
        fechaVerificacion: ahora,
        ultimaConfirmacionAnual: ahora,
      },
    });

    try { await enviarBienvenida(usuario); }
    catch (e) { console.error('Correo bienvenida:', e.message); }

    res.json({ success: true, message: 'Email verificado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// POST /api/auth/reenviar-verificacion
// ─────────────────────────────────────────────
const reenviarVerificacion = async (req, res, next) => {
  try {
    const { email } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (usuario && !usuario.emailVerificado) {
      const { token, expira } = generarToken(24);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { emailToken: token, emailTokenExpira: expira },
      });
      try { await enviarVerificacionEmail(usuario, token); }
      catch (e) { console.error('Correo reenvío:', e.message); }
    }

    res.json({ success: true, message: 'Si el email existe y no está verificado, recibirás el correo.' });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!usuario.emailVerificado) {
      return res.status(403).json({
        success: false,
        message: 'Debes verificar tu email antes de iniciar sesión. Revisa tu correo.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    const token = generateToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });

    res.json({
      success: true, message: 'Login exitoso',
      data: {
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
        token,
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (usuario && usuario.emailVerificado) {
      const { token, expira } = generarToken(1);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { resetPasswordToken: token, resetPasswordExpira: expira },
      });
      try { await enviarResetPassword(usuario, token); }
      catch (e) { console.error('Correo reset password:', e.message); }
    }

    res.json({
      success: true,
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token y contraseña requeridos' });
    }

    const usuario = await prisma.usuario.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpira: { gt: new Date() } },
    });

    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpira: null },
    });

    res.json({ success: true, message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/auth/profile
// ─────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, nombre: true, email: true, rol: true, activo: true,
        emailVerificado: true, fechaVerificacion: true,
        ultimaConfirmacionAnual: true, createdAt: true,
        _count: { select: { reportes: true } },
      },
    });
    res.json({ success: true, data: usuario });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// PUT /api/auth/cambiar-password  (requiere autenticación)
// ─────────────────────────────────────────────
const cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id } });

    const esValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!esValida) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }
    if (passwordNueva.length < 6) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(passwordNueva, 10);
    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/auth/confirmar-cuenta?token=xxx  (confirmación anual)
// ─────────────────────────────────────────────
const confirmarCuentaAnual = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token requerido' });

    const usuario = await prisma.usuario.findFirst({
      where: { tokenConfirmacionAnual: token, tokenAnualExpira: { gt: new Date() } },
    });

    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
    }

    const ahora = new Date();
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        activo: true,
        ultimaConfirmacionAnual: ahora,
        tokenConfirmacionAnual: null,
        tokenAnualExpira: null,
        confirmacionAnualEnviada: null,
      },
    });

    res.json({ success: true, message: '¡Cuenta confirmada por un año más!' });
  } catch (error) { next(error); }
};

module.exports = {
  register, verificarEmail, reenviarVerificacion,
  login, forgotPassword, resetPassword,
  getProfile, cambiarPassword, confirmarCuentaAnual,
};
