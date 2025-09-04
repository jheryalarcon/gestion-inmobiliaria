/*
  Warnings:

  - You are about to drop the column `tamanio` on the `ArchivoNegociacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ArchivoNegociacion" DROP COLUMN "tamanio",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;
