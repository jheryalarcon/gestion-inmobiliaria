/*
  Warnings:

  - You are about to drop the `HistorialEtapaNegociacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HistorialEtapaNegociacion" DROP CONSTRAINT "HistorialEtapaNegociacion_negociacionId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialEtapaNegociacion" DROP CONSTRAINT "HistorialEtapaNegociacion_usuarioId_fkey";

-- DropTable
DROP TABLE "HistorialEtapaNegociacion";
