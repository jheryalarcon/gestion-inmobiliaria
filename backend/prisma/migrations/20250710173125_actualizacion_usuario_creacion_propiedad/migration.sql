/*
  Warnings:

  - Changed the type of `rol` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('cliente', 'agente', 'admin');

-- CreateEnum
CREATE TYPE "EstadoPropiedad" AS ENUM ('disponible', 'vendida', 'arrendada', 'reservada', 'inactiva');

-- CreateEnum
CREATE TYPE "TipoPropiedad" AS ENUM ('casa', 'departamento', 'terreno', 'local_comercial', 'finca', 'quinta');

-- CreateEnum
CREATE TYPE "EstadoFisico" AS ENUM ('nueva', 'usada', 'en_construccion');

-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('venta', 'alquiler');

-- CreateEnum
CREATE TYPE "Provincia" AS ENUM ('Azuay', 'Bolivar', 'Canar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El_Oro', 'Esmeraldas', 'Galapagos', 'Guayas', 'Imbabura', 'Loja', 'Los_Rios', 'Manabi', 'Morona_Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa_Elena', 'Santo_Domingo', 'Sucumbios', 'Tungurahua', 'Zamora_Chinchipe');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "rol" TYPE "Rol" USING "rol"::"Rol";

-- CreateTable
CREATE TABLE "Propiedad" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_propiedad" "TipoPropiedad" NOT NULL,
    "estado_propiedad" "EstadoFisico" NOT NULL,
    "transaccion" "TipoTransaccion" NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Ecuador',
    "codigo_postal" TEXT,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "area_terreno" DECIMAL(10,2) NOT NULL,
    "area_construccion" DECIMAL(10,2) NOT NULL,
    "nro_habitaciones" INTEGER NOT NULL,
    "nro_banos" INTEGER NOT NULL,
    "nro_parqueaderos" INTEGER NOT NULL,
    "nro_pisos" INTEGER NOT NULL,
    "anio_construccion" INTEGER,
    "estado_publicacion" "EstadoPropiedad" NOT NULL DEFAULT 'disponible',
    "agenteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imagen" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "propiedadId" INTEGER NOT NULL,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
