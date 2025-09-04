/*
  Warnings:

  - The values [oferta,aceptada,cerrada] on the enum `EtapaNegociacion` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoSeguimiento" AS ENUM ('llamada', 'visita', 'mensaje', 'email', 'reunion', 'documento', 'otro');

-- AlterEnum
BEGIN;
CREATE TYPE "EtapaNegociacion_new" AS ENUM ('interes', 'negociacion', 'cierre', 'finalizada', 'cancelada');
ALTER TABLE "Negociacion" ALTER COLUMN "etapa" DROP DEFAULT;
ALTER TABLE "Negociacion" ALTER COLUMN "etapa" TYPE "EtapaNegociacion_new" USING ("etapa"::text::"EtapaNegociacion_new");
ALTER TYPE "EtapaNegociacion" RENAME TO "EtapaNegociacion_old";
ALTER TYPE "EtapaNegociacion_new" RENAME TO "EtapaNegociacion";
DROP TYPE "EtapaNegociacion_old";
ALTER TABLE "Negociacion" ALTER COLUMN "etapa" SET DEFAULT 'interes';
COMMIT;

-- CreateTable
CREATE TABLE "Seguimiento" (
    "id" SERIAL NOT NULL,
    "negociacionId" INTEGER NOT NULL,
    "agenteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT NOT NULL,
    "tipo" "TipoSeguimiento" NOT NULL DEFAULT 'otro',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seguimiento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_negociacionId_fkey" FOREIGN KEY ("negociacionId") REFERENCES "Negociacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
