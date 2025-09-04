-- Migración de etapas legacy a nuevas etapas
-- Ejecutar este script antes de la migración de Prisma

-- 1. Actualizar etapas legacy a nuevas etapas
UPDATE "Negociacion" 
SET etapa = 'cierre' 
WHERE etapa IN ('oferta', 'aceptada');

UPDATE "Negociacion" 
SET etapa = 'finalizada' 
WHERE etapa = 'cerrada';

-- 2. Verificar que no queden etapas legacy
SELECT etapa, COUNT(*) as cantidad
FROM "Negociacion" 
GROUP BY etapa
ORDER BY etapa;

-- 3. Después de ejecutar este script, ejecutar:
-- npx prisma migrate dev --name remove_legacy_etapas
