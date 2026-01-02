-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "forma_pago_contado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "forma_pago_credito" BOOLEAN NOT NULL DEFAULT false;
