-- AlterTable
ALTER TABLE "Negociacion" ADD COLUMN     "fecha_cambio_etapa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "HistorialEtapaNegociacion" (
    "id" SERIAL NOT NULL,
    "negociacionId" INTEGER NOT NULL,
    "etapa_anterior" "EtapaNegociacion",
    "etapa_nueva" "EtapaNegociacion" NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEtapaNegociacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistorialEtapaNegociacion" ADD CONSTRAINT "HistorialEtapaNegociacion_negociacionId_fkey" FOREIGN KEY ("negociacionId") REFERENCES "Negociacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEtapaNegociacion" ADD CONSTRAINT "HistorialEtapaNegociacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
