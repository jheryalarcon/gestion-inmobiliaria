-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoArchivo" ADD VALUE 'reserva';
ALTER TYPE "TipoArchivo" ADD VALUE 'promesa';
ALTER TYPE "TipoArchivo" ADD VALUE 'minuta';
ALTER TYPE "TipoArchivo" ADD VALUE 'pago';
