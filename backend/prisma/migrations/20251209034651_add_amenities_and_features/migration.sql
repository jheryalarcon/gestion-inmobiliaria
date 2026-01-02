/*
  Warnings:

  - The values [usada] on the enum `EstadoFisico` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[codigo_interno]` on the table `Propiedad` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UsoPropiedad" AS ENUM ('residencial', 'comercial', 'industrial', 'agricola', 'turistico', 'mixto');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoFisico_new" AS ENUM ('nueva', 'bueno', 'regular', 'por_remodelar', 'en_construccion');
ALTER TABLE "Propiedad" ALTER COLUMN "estado_propiedad" TYPE "EstadoFisico_new" USING ("estado_propiedad"::text::"EstadoFisico_new");
ALTER TYPE "EstadoFisico" RENAME TO "EstadoFisico_old";
ALTER TYPE "EstadoFisico_new" RENAME TO "EstadoFisico";
DROP TYPE "EstadoFisico_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoPropiedad" ADD VALUE 'suite';
ALTER TYPE "TipoPropiedad" ADD VALUE 'oficina';
ALTER TYPE "TipoPropiedad" ADD VALUE 'bodega_galpon';
ALTER TYPE "TipoPropiedad" ADD VALUE 'edificio';

-- AlterEnum
ALTER TYPE "TipoTransaccion" ADD VALUE 'alquiler_opcion_compra';

-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "amoblado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "codigo_interno" TEXT,
ADD COLUMN     "comision" DECIMAL(10,2),
ADD COLUMN     "desactivado_por" INTEGER,
ADD COLUMN     "fecha_desactivacion" TIMESTAMP(3),
ADD COLUMN     "fecha_fin_contrato" TIMESTAMP(3),
ADD COLUMN     "orientacion" TEXT,
ADD COLUMN     "precio_minimo" DECIMAL(12,2),
ADD COLUMN     "propietarioId" INTEGER,
ADD COLUMN     "referencia" TEXT,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "semi_amoblado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_area_bbq" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_areas_comunales" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_ascensor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_balcon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_bodega" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_gas_centralizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_patio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_piscina" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_seguridad" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_terraza" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipo_comision" TEXT DEFAULT 'porcentaje',
ADD COLUMN     "tipo_contrato" TEXT,
ADD COLUMN     "updatedBy" INTEGER,
ADD COLUMN     "uso_propiedad" "UsoPropiedad";

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "telefono" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Propiedad_codigo_interno_key" ON "Propiedad"("codigo_interno");

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_desactivado_por_fkey" FOREIGN KEY ("desactivado_por") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
