const express = require('express');
const router = express.Router();
const { getEstadisticas } = require('../controllers/estadisticasController');
const { authenticate } = require('../middlewares/auth');

// Ruta para obtener estadísticas (solo admin y personal)
router.get('/', authenticate, getEstadisticas);

module.exports = router;
