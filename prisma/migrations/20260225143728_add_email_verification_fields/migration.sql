-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `confirmacionAnualEnviada` DATETIME(3) NULL,
    ADD COLUMN `emailToken` VARCHAR(255) NULL,
    ADD COLUMN `emailTokenExpira` DATETIME(3) NULL,
    ADD COLUMN `emailVerificado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `fechaVerificacion` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordExpira` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(255) NULL,
    ADD COLUMN `tokenAnualExpira` DATETIME(3) NULL,
    ADD COLUMN `tokenConfirmacionAnual` VARCHAR(255) NULL,
    ADD COLUMN `ultimaConfirmacionAnual` DATETIME(3) NULL;
