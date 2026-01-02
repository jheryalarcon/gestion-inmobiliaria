-- CreateEnum
CREATE TYPE "TipoDocumentoAgente" AS ENUM ('IDENTIFICACION', 'CONTRATO', 'HOJA_VIDA', 'CERTIFICADO', 'OTRO');

-- CreateTable
CREATE TABLE "DocumentoAgente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoDocumentoAgente" NOT NULL,
    "agenteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoAgente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentoAgente" ADD CONSTRAINT "DocumentoAgente_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
