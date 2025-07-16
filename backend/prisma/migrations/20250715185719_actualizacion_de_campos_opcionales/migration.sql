-- AlterTable
ALTER TABLE "Propiedad" ALTER COLUMN "area_construccion" DROP NOT NULL,
ALTER COLUMN "nro_habitaciones" DROP NOT NULL,
ALTER COLUMN "nro_banos" DROP NOT NULL,
ALTER COLUMN "nro_parqueaderos" DROP NOT NULL,
ALTER COLUMN "nro_pisos" DROP NOT NULL;
