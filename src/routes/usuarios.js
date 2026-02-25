const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
} = require('../controllers/usuariosController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Validaciones para crear usuario
const createUsuarioValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
    .isLength({ max: 100 }).withMessage('El nombre no debe exceder 100 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['estudiante', 'personal', 'admin'])
    .withMessage('El rol debe ser: estudiante, personal o admin'),
  validate
];

// Validaciones para actualizar usuario
const updateUsuarioValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
    .isLength({ max: 100 }).withMessage('El nombre no debe exceder 100 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['estudiante', 'personal', 'admin'])
    .withMessage('El rol debe ser: estudiante, personal o admin'),
  validate
];

// Validaciones para ID
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  validate
];

// Rutas (todas requieren autenticación y rol admin)
router.get('/', authenticate, getAllUsuarios);
router.post('/', authenticate, createUsuarioValidation, createUsuario);
router.patch('/:id', authenticate, updateUsuarioValidation, updateUsuario);
router.delete('/:id', authenticate, idValidation, deleteUsuario);

module.exports = router;
