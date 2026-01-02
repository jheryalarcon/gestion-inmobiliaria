/*
  Warnings:

  - You are about to drop the column `semi_amoblado` on the `Propiedad` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Propiedad" DROP COLUMN "semi_amoblado",
ADD COLUMN     "tiene_cisterna" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_lavanderia" BOOLEAN NOT NULL DEFAULT false;
