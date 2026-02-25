-- AlterTable
ALTER TABLE `reportes` ADD COLUMN `publicInFeed` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `reportes_publicInFeed_idx` ON `reportes`(`publicInFeed`);
