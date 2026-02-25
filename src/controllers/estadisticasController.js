const prisma = require('../config/database');

/**
 * Obtener estadísticas generales del sistema
 * GET /api/estadisticas
 */
const getEstadisticas = async (req, res, next) => {
  try {
    // Obtener conteos por estado
    const [totalReportes, reportesPendientes, reportesEnProceso, reportesResueltos] = await Promise.all([
      prisma.reporte.count(),
      prisma.reporte.count({ where: { estado: 'pendiente' } }),
      prisma.reporte.count({ where: { estado: 'en_proceso' } }),
      prisma.reporte.count({ where: { estado: 'resuelto' } }),
    ]);

    // Reportes por categoría
    const reportesPorCategoria = await prisma.reporte.groupBy({
      by: ['categoria'],
      _count: {
        id: true
      }
    });

   // Reportes por ubicación (top 10)
    const reportesPorUbicacion = await prisma.reporte.groupBy({
      by: ['ubicacion'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Calcular tasa de resolución
    const tasaResolucion = totalReportes > 0 
      ? Math.round((reportesResueltos / totalReportes) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalReportes,
        reportesPendientes,
        reportesEnProceso,
        reportesResueltos,
        reportesPorCategoria: reportesPorCategoria.map(item => ({
          categoria: item.categoria,
          total: item._count.id
        })),
        reportesPorUbicacion: reportesPorUbicacion.map(item => ({
          ubicacion: item.ubicacion,
          total: item._count.id
        })),
        tasaResolucion
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEstadisticas
};
