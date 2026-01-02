-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "unidad_area_construccion" TEXT NOT NULL DEFAULT 'm2',
ADD COLUMN     "unidad_area_terreno" TEXT NOT NULL DEFAULT 'm2';
