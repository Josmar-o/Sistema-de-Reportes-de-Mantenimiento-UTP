-- AlterTable
ALTER TABLE `usuarios` MODIFY `rol` ENUM('estudiante', 'admin', 'personal') NOT NULL DEFAULT 'estudiante';
