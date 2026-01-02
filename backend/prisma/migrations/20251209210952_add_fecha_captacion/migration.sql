/*
  Warnings:

  - You are about to drop the column `forma_pago_contado` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `forma_pago_credito` on the `Propiedad` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Propiedad" DROP COLUMN "forma_pago_contado",
DROP COLUMN "forma_pago_credito",
ADD COLUMN     "fecha_captacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
