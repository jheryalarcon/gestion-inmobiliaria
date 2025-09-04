-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('contrato', 'cedula', 'otros');

-- CreateTable
CREATE TABLE "NotaInterna" (
    "id" SERIAL NOT NULL,
    "negociacionId" INTEGER NOT NULL,
    "agenteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaInterna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoNegociacion" (
    "id" SERIAL NOT NULL,
    "negociacionId" INTEGER NOT NULL,
    "agenteId" INTEGER NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "nombre_guardado" TEXT NOT NULL,
    "tipo" "TipoArchivo" NOT NULL DEFAULT 'otros',
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "tamanio" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchivoNegociacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotaInterna" ADD CONSTRAINT "NotaInterna_negociacionId_fkey" FOREIGN KEY ("negociacionId") REFERENCES "Negociacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaInterna" ADD CONSTRAINT "NotaInterna_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoNegociacion" ADD CONSTRAINT "ArchivoNegociacion_negociacionId_fkey" FOREIGN KEY ("negociacionId") REFERENCES "Negociacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoNegociacion" ADD CONSTRAINT "ArchivoNegociacion_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
