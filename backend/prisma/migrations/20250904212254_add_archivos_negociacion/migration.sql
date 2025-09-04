/*
  Warnings:

  - Added the required column `tamano` to the `ArchivoNegociacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArchivoNegociacion" ADD COLUMN     "tamano" INTEGER NOT NULL,
ALTER COLUMN "tipo" DROP NOT NULL,
ALTER COLUMN "tipo" DROP DEFAULT;
