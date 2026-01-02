-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'AUTORIZACION_VENTA';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'FICHA_CATASTRAL';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'CERTIFICADO_USO_SUELO';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'CERTIFICADO_ALICUOTA';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'PLANILLA_LUZ';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'PLANILLA_AGUA';
ALTER TYPE "TipoDocumentoPropiedad" ADD VALUE 'PLANILLA_ALICUOTA';
