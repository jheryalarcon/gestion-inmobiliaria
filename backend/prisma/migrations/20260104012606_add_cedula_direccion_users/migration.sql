/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TipoCliente" ADD VALUE 'prospecto';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'CONTRATO_EXCLUSIVIDAD';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'CERTIFICADO_EXPENSAS';

-- DropIndex
DROP INDEX "Cliente_cedula_key";

-- DropIndex
DROP INDEX "Cliente_email_key";

-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "valor_garantia" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cedula" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "token_recuperacion" TEXT,
ADD COLUMN     "token_recuperacion_expiracion" TIMESTAMP(3),
ADD COLUMN     "token_verificacion_expiracion" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cedula_key" ON "Usuario"("cedula");
