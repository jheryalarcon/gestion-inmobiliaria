-- HU11: Correccion de email unico en Cliente y eliminacion de 'vendedor' del enum TipoCliente
-- Ejecutar: npx prisma db execute --file prisma/fix_manual.sql --schema prisma/schema.prisma

-- 1. Actualizar clientes con tipo 'vendedor' a 'prospecto' antes de quitar el enum
UPDATE "Cliente" SET "tipo_cliente" = 'prospecto' WHERE "tipo_cliente" = 'vendedor';

-- 2. Agregar unique constraint en email (permite multiples NULL - un cliente puede no tener email)
CREATE UNIQUE INDEX IF NOT EXISTS "Cliente_email_key" ON "Cliente"("email");

-- 3. Quitar 'vendedor' del enum TipoCliente (PostgreSQL requiere recrear el tipo)
ALTER TYPE "TipoCliente" RENAME TO "TipoCliente_old";
CREATE TYPE "TipoCliente" AS ENUM('comprador', 'arrendatario', 'propietario', 'inversionista', 'colega_inmobiliario', 'prospecto');
ALTER TABLE "Cliente" ALTER COLUMN "tipo_cliente" TYPE "TipoCliente" USING "tipo_cliente"::text::"TipoCliente";
DROP TYPE "TipoCliente_old";
