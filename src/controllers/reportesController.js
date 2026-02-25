const prisma = require('../config/database');

/**
 * Mapea un reporte de snake_case (DB) a camelCase (Frontend)
 */
const mapearReporte = (reporte) => {
  if (!reporte) return null;
  
  // Convertir URLs relativas a absolutas
  let fotoUrl = reporte.foto_url;
  if (fotoUrl && fotoUrl.startsWith('/uploads/')) {
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    fotoUrl = `${baseUrl}${fotoUrl}`;
  }
  
  return {
    id: reporte.id,
    titulo: reporte.titulo,
    descripcion: reporte.descripcion,
    ubicacion: reporte.ubicacion,
    categoria: reporte.categoria,
    fotoUrl: fotoUrl,
    estado: reporte.estado,
    prioridad: reporte.prioridad,
    notaPersonal: reporte.nota_personal || '',
    publicInFeed: reporte.publicInFeed || false,
    fechaResolucion: reporte.fechaResolucion,
    usuarioId: reporte.usuario_id,
    creadoEn: reporte.fecha_creacion,
    actualizadoEn: reporte.updatedAt,
    usuario: reporte.usuario ? {
      id: reporte.usuario.id,
      nombre: reporte.usuario.nombre,
      email: reporte.usuario.email,
      rol: reporte.usuario.rol
    } : undefined
  };
};

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
        reportes: reportes.map(mapearReporte),
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
      data: mapearReporte(reporte)
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
    const { titulo, descripcion, ubicacion, categoria } = req.body;
    const usuario_id = req.user.id;

    // Si se subió un archivo, guardamos la URL completa
    let foto_url = null;
    if (req.file) {
      const baseUrl = process.env.API_URL || 'http://localhost:3001';
      foto_url = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const reporte = await prisma.reporte.create({
      data: {
        titulo,
        descripcion,
        ubicacion,
        categoria,
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
      data: mapearReporte(reporte)
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
    const { estado, titulo, descripcion, ubicacion, categoria, prioridad, foto_url, nota_personal } = req.body;

    console.log('=== UPDATE REPORTE ===');
    console.log('Body recibido:', req.body);
    console.log('publicInFeed:', req.body.publicInFeed, 'tipo:', typeof req.body.publicInFeed);
    console.log('Usuario rol:', req.user.rol);

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

    // Solo admin/personal pueden cambiar el estado, o el dueño puede editar su reporte
    if (req.user.rol !== 'admin' && req.user.rol !== 'personal' && reporteExistente.usuario_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este reporte'
      });
    }

    // Construir datos a actualizar
    const dataToUpdate = {};
    if (estado) {
      dataToUpdate.estado = estado;
      // Si cambia a resuelto, guardar la fecha de resolución
      if (estado === 'resuelto' && reporteExistente.estado !== 'resuelto') {
        dataToUpdate.fechaResolucion = new Date();
      }
      // Si cambia de resuelto a otro estado, limpiar la fecha
      if (estado !== 'resuelto' && reporteExistente.estado === 'resuelto') {
        dataToUpdate.fechaResolucion = null;
      }
    }
    if (titulo) dataToUpdate.titulo = titulo;
    if (descripcion) dataToUpdate.descripcion = descripcion;
    if (ubicacion) dataToUpdate.ubicacion = ubicacion;
    if (categoria) dataToUpdate.categoria = categoria;
    if (prioridad) dataToUpdate.prioridad = prioridad;
    if (foto_url !== undefined) dataToUpdate.foto_url = foto_url;
    if (nota_personal !== undefined) dataToUpdate.nota_personal = nota_personal;
    
    // Solo admin/personal pueden cambiar publicInFeed
    if (req.body.publicInFeed !== undefined && (req.user.rol === 'admin' || req.user.rol === 'personal')) {
      // Convertir a booleano si viene como string
      dataToUpdate.publicInFeed = req.body.publicInFeed === true || req.body.publicInFeed === 'true';
    }

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
      data: mapearReporte(reporte)
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
      data: reportes.map(mapearReporte)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener feed público de reportes resueltos
 * GET /api/reportes/feed-publico
 */
const getFeedPublico = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener reportes resueltos y marcados como públicos
    const [reportes, total] = await Promise.all([
      prisma.reporte.findMany({
        where: {
          estado: 'resuelto',
          publicInFeed: true
        },
        skip,
        take: parseInt(limit),
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true
            }
          }
        },
        orderBy: {
          fechaResolucion: 'desc'
        }
      }),
      prisma.reporte.count({
        where: {
          estado: 'resuelto',
          publicInFeed: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        reportes: reportes.map(mapearReporte),
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

module.exports = {
  getAllReportes,
  getReporteById,
  createReporte,
  updateReporte,
  deleteReporte,
  getMisReportes,
  getFeedPublico,
};
