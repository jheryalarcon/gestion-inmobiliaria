-- CreateEnum
CREATE TYPE "EtapaNegociacion" AS ENUM ('interes', 'negociacion', 'oferta', 'aceptada', 'cerrada', 'cancelada');

-- CreateTable
CREATE TABLE "Negociacion" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "agenteId" INTEGER NOT NULL,
    "etapa" "EtapaNegociacion" NOT NULL DEFAULT 'interes',
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Negociacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Negociacion_clienteId_propiedadId_key" ON "Negociacion"("clienteId", "propiedadId");

-- AddForeignKey
ALTER TABLE "Negociacion" ADD CONSTRAINT "Negociacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negociacion" ADD CONSTRAINT "Negociacion_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negociacion" ADD CONSTRAINT "Negociacion_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
