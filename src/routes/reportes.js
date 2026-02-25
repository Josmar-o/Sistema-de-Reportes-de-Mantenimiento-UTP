const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getAllReportes,
  getReporteById,
  createReporte,
  updateReporte,
  deleteReporte,
  getMisReportes,
  getFeedPublico
} = require('../controllers/reportesController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../config/multer');

// Validaciones para crear reporte
const createReporteValidation = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 5 }).withMessage('El título debe tener al menos 5 caracteres')
    .isLength({ max: 255 }).withMessage('El título no debe exceder 255 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
  body('ubicacion')
    .trim()
    .notEmpty().withMessage('La ubicación es requerida')
    .isLength({ max: 255 }).withMessage('La ubicación no debe exceder 255 caracteres'),
  body('categoria')
    .trim()
    .notEmpty().withMessage('La categoría es requerida')
    .isLength({ max: 100 }).withMessage('La categoría no debe exceder 100 caracteres'),
  validate
];

// Validaciones para actualizar reporte
const updateReporteValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'resuelto'])
    .withMessage('El estado debe ser: pendiente, en_proceso o resuelto'),
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('El título debe tener al menos 5 caracteres')
    .isLength({ max: 255 }).withMessage('El título no debe exceder 255 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
  body('ubicacion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La ubicación no debe exceder 255 caracteres'),
  body('categoria')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La categoría no debe exceder 100 caracteres'),
  body('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La prioridad debe ser: baja, media o alta'),
  body('publicInFeed')
    .optional()
    .custom((value) => {
      // Aceptar boolean o string 'true'/'false'
      return value === true || value === false || value === 'true' || value === 'false';
    })
    .withMessage('publicInFeed debe ser un valor booleano'),
  validate
];

// Validaciones para obtener por ID
const getByIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  validate
];

// Validaciones para query params
const queryValidation = [
  query('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'resuelto'])
    .withMessage('El estado debe ser: pendiente, en_proceso o resuelto'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
  validate
];

// Rutas públicas (requieren autenticación)
router.get('/', authenticate, queryValidation, getAllReportes);
router.get('/mis-reportes', authenticate, getMisReportes);
router.get('/feed-publico', authenticate, queryValidation, getFeedPublico);
router.get('/:id', authenticate, getByIdValidation, getReporteById);
router.post('/', authenticate, upload.single('foto'), createReporteValidation, createReporte);
router.put('/:id', authenticate, updateReporteValidation, updateReporte);
router.delete('/:id', authenticate, getByIdValidation, deleteReporte);

module.exports = router;
