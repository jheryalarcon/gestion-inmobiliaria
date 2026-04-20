-- Paso 1: Crear nuevo valor en el enum (ya lo hace prisma db push)
-- Este script solo actualiza los datos previos a la migracion
-- Ejecutar ANTES de correr prisma db push cuando el enum ya tiene el nuevo valor

-- Actualizar registros con 'consultor' al nuevo valor 'colega_inmobiliario'
-- Nota: Esto se ejecuta con el enum original que aun tiene 'consultor'
-- En PostgreSQL, para cambiar valores de enum hay que usar ALTER TYPE

-- Estrategia: Cambiar el tipo de columna temporalmente a TEXT, actualizar, volver a enum
ALTER TABLE "Cliente" ALTER COLUMN tipo_cliente TYPE TEXT;
UPDATE "Cliente" SET tipo_cliente = 'colega_inmobiliario' WHERE tipo_cliente = 'consultor';
-- Ahora renombrar el enum y cambiar el valor
ALTER TYPE "TipoCliente" RENAME VALUE 'consultor' TO 'colega_inmobiliario';
ALTER TABLE "Cliente" ALTER COLUMN tipo_cliente TYPE "TipoCliente" USING tipo_cliente::"TipoCliente";
