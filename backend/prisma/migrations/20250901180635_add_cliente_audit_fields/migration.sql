-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "desactivado_por" INTEGER,
ADD COLUMN     "fecha_desactivacion" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_desactivado_por_fkey" FOREIGN KEY ("desactivado_por") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
