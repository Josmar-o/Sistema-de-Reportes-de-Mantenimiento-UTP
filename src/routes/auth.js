const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const {
  register, verificarEmail, reenviarVerificacion,
  login, forgotPassword, resetPassword,
  getProfile, cambiarPassword, confirmarCuentaAnual,
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// ── Validaciones ─────────────────────────────

const registerValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2, max: 100 }),
  body('email').trim().notEmpty().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('rol').optional().isIn(['estudiante', 'admin', 'personal']).withMessage('Rol inválido'),
  validate,
];

const loginValidation = [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

const emailValidation = [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  validate,
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token requerido'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

const cambiarPasswordValidation = [
  body('passwordActual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('passwordNueva').notEmpty().isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

// ── Rutas públicas ────────────────────────────
router.post('/registro', registerValidation, register);
router.post('/register', registerValidation, register);        // alias
router.get('/verificar-email', verificarEmail);               // ?token=xxx
router.post('/reenviar-verificacion', emailValidation, reenviarVerificacion);
router.post('/login', loginValidation, login);
router.post('/forgot-password', emailValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.get('/confirmar-cuenta', confirmarCuentaAnual);        // ?token=xxx (confirmación anual)

// ── Rutas protegidas ──────────────────────────
router.get('/profile', authenticate, getProfile);
router.put('/cambiar-password', authenticate, cambiarPasswordValidation, cambiarPassword);

module.exports = router;
