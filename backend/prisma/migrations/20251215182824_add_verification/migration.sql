-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "token_verificacion" TEXT,
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;
