-- ============================================
-- Base de Datos: Sistema de Reportes de Mantenimiento UTP
-- ============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS mantenimiento_utp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE mantenimiento_utp;

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'admin', 'personal') DEFAULT 'estudiante',
    activo BOOLEAN DEFAULT FALSE,

    -- Verificación de email inicial
    email_verificado BOOLEAN DEFAULT FALSE,
    email_token VARCHAR(255) NULL,
    email_token_expira DATETIME NULL,
    fecha_verificacion DATETIME NULL,

    -- Confirmación anual
    ultima_confirmacion_anual DATETIME NULL,
    token_confirmacion_anual VARCHAR(255) NULL,
    token_anual_expira DATETIME NULL,
    confirmacion_anual_enviada DATETIME NULL,

    -- Reset de contraseña
    reset_password_token VARCHAR(255) NULL,
    reset_password_expira DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_email_token (email_token),
    INDEX idx_reset_token (reset_password_token)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: reportes
-- ============================================
CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    foto_url VARCHAR(500),
    estado ENUM('pendiente', 'en_proceso', 'resuelto') DEFAULT 'pendiente',
    usuario_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_estado (estado),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (creado_en)
) ENGINE=InnoDB;

-- ============================================
-- Datos de Prueba
-- ============================================

-- Insertar usuarios de prueba
-- Password: "123456" (en producción usa bcrypt)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Omar García', 'omar.garcia@utp.ac.pa', '$2b$10$rZ8qNVKLhUJ7zN2YvQX5veUQGXJK9dKVY9kZYx4lGWzJYVKJ1XPXK', 'estudiante'),
('Admin Mantenimiento', 'admin@utp.ac.pa', '$2b$10$rZ8qNVKLhUJ7zN2YvQX5veUQGXJK9dKVY9kZYx4lGWzJYVKJ1XPXK', 'admin');

-- Insertar reportes de prueba
INSERT INTO reportes (descripcion, ubicacion, foto_url, estado, usuario_id) VALUES
('Luminaria fundida en pasillo principal', 'Edificio A - Piso 2', 'https://placehold.co/600x400', 'pendiente', 1),
('Baño dañado, inodoro no funciona', 'Edificio B - Baño Hombres Piso 1', 'https://placehold.co/600x400', 'en_proceso', 1),
('Silla rota en salón de clases', 'Edificio C - Salón 301', 'https://placehold.co/600x400', 'pendiente', 1),
('Aire acondicionado no enfría', 'Edificio A - Salón 205', 'https://placehold.co/600x400', 'resuelto', 1),
('Goteo en techo de cafetería', 'Cafetería Principal', 'https://placehold.co/600x400', 'pendiente', 1);

-- ============================================
-- Verificación de datos
-- ============================================
SELECT 'Usuarios creados:' AS '';
SELECT id, nombre, email, rol FROM usuarios;

SELECT 'Reportes creados:' AS '';
SELECT id, descripcion, ubicacion, estado FROM reportes;