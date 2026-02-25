const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Obtener todos los usuarios
 * GET /api/usuarios
 */
const getAllUsuarios = async (req, res, next) => {
  try {
    // Solo admin puede ver todos los usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a esta información'
      });
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Mapear a camelCase
    const usuariosMapeados = usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      creadoEn: u.createdAt,
      actualizadoEn: u.updatedAt
    }));

    res.json({
      success: true,
      data: usuariosMapeados
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo usuario
 * POST /api/usuarios
 */
const createUsuario = async (req, res, next) => {
  try {
    // Solo admin puede crear usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    const { nombre, email, password, rol } = req.body;

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'estudiante'
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        creadoEn: usuario.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un usuario
 * PATCH /api/usuarios/:id
 */
const updateUsuario = async (req, res, next) => {
  try {
    // Solo admin puede actualizar usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    const { id } = req.params;
    const { nombre, email, rol, password } = req.body;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const dataToUpdate = {};
    if (nombre) dataToUpdate.nombre = nombre;
    if (email) dataToUpdate.email = email;
    if (rol) dataToUpdate.rol = rol;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        actualizadoEn: usuario.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un usuario
 * DELETE /api/usuarios/:id
 */
const deleteUsuario = async (req, res, next) => {
  try {
    // Solo admin puede eliminar usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    const { id } = req.params;

    // No permitir que el admin se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
