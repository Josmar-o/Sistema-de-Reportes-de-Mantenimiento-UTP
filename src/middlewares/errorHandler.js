/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de Prisma - Registro duplicado
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un registro con esos datos',
      field: err.meta?.target?.[0]
    });
  }

  // Error de Prisma - Registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado'
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
};

module.exports = {
  errorHandler,
  notFound,
};
