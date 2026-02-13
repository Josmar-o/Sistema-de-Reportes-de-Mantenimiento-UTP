const prisma = require('../config/database');

/**
 * Obtener todos los reportes
 * GET /api/reportes
 */
const getAllReportes = async (req, res, next) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros
    const where = {};
    if (estado) {
      where.estado = estado;
    }

    // Obtener reportes con paginación
    const [reportes, total] = await Promise.all([
      prisma.reporte.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        orderBy: {
          fecha_creacion: 'desc'
        }
      }),
      prisma.reporte.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        reportes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un reporte por ID
 * GET /api/reportes/:id
 */
const getReporteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reporte = await prisma.reporte.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo reporte
 * POST /api/reportes
 */
const createReporte = async (req, res, next) => {
  try {
    const { descripcion, ubicacion, foto_url } = req.body;
    const usuario_id = req.user.id;

    const reporte = await prisma.reporte.create({
      data: {
        descripcion,
        ubicacion,
        foto_url,
        usuario_id
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      data: reporte
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estado de un reporte
 * PUT /api/reportes/:id
 */
const updateReporte = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, descripcion, ubicacion, foto_url } = req.body;

    // Verificar que el reporte existe
    const reporteExistente = await prisma.reporte.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reporteExistente) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Solo admin puede cambiar el estado, o el dueño puede editar su reporte
    if (req.user.rol !== 'admin' && reporteExistente.usuario_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este reporte'
      });
    }

    // Construir datos a actualizar
    const dataToUpdate = {};
    if (estado) dataToUpdate.estado = estado;
    if (descripcion) dataToUpdate.descripcion = descripcion;
    if (ubicacion) dataToUpdate.ubicacion = ubicacion;
    if (foto_url !== undefined) dataToUpdate.foto_url = foto_url;

    const reporte = await prisma.reporte.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reporte actualizado exitosamente',
      data: reporte
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un reporte
 * DELETE /api/reportes/:id
 */
const deleteReporte = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reporteExistente = await prisma.reporte.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reporteExistente) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Solo admin o el dueño pueden eliminar
    if (req.user.rol !== 'admin' && reporteExistente.usuario_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este reporte'
      });
    }

    await prisma.reporte.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Reporte eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener reportes del usuario autenticado
 * GET /api/reportes/mis-reportes
 */
const getMisReportes = async (req, res, next) => {
  try {
    const reportes = await prisma.reporte.findMany({
      where: { usuario_id: req.user.id },
      orderBy: { fecha_creacion: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: reportes
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReportes,
  getReporteById,
  createReporte,
  updateReporte,
  deleteReporte,
  getMisReportes,
};
