/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('LEGAL', 'PROPIETARIO', 'COMERCIAL', 'TECNICO', 'PH', 'SERVICIOS', 'OTROS');

-- CreateEnum
CREATE TYPE "TipoDocumentoPropiedad" AS ENUM ('ESCRITURA', 'CERTIFICADO_GRAVAMEN', 'PAGO_PREDIAL', 'PLANO', 'IRM', 'REGLAMENTO_PH', 'ALICUOTA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoDocumentoCliente" AS ENUM ('CEDULA', 'PAPELETA_VOTACION', 'PODER', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_DE_HECHO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "cedula" TEXT,
ADD COLUMN     "estado_civil" "EstadoCivil";

-- CreateTable
CREATE TABLE "DocumentoPropiedad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoDocumentoPropiedad" NOT NULL,
    "categoria" "CategoriaDocumento" NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoPropiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoCliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoDocumentoCliente" NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cedula_key" ON "Cliente"("cedula");

-- AddForeignKey
ALTER TABLE "DocumentoPropiedad" ADD CONSTRAINT "DocumentoPropiedad_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCliente" ADD CONSTRAINT "DocumentoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
