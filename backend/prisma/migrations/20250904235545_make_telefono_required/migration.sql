/*
  Warnings:

  - Made the column `telefono` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing NULL values with a default phone number
UPDATE "Usuario" SET "telefono" = '0000000000' WHERE "telefono" IS NULL;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "telefono" SET NOT NULL;
