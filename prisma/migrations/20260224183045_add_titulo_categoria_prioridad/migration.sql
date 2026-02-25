/*
  Warnings:

  - Added the required column `categoria` to the `reportes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `reportes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reportes` ADD COLUMN `categoria` VARCHAR(100) NOT NULL,
    ADD COLUMN `prioridad` ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
    ADD COLUMN `titulo` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX `reportes_estado_idx` ON `reportes`(`estado`);

-- CreateIndex
CREATE INDEX `reportes_categoria_idx` ON `reportes`(`categoria`);
