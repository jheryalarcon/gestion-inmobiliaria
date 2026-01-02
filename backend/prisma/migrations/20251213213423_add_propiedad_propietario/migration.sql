-- CreateTable
CREATE TABLE "PropiedadPropietario" (
    "id" SERIAL NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropiedadPropietario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropiedadPropietario_propiedadId_clienteId_key" ON "PropiedadPropietario"("propiedadId", "clienteId");

-- AddForeignKey
ALTER TABLE "PropiedadPropietario" ADD CONSTRAINT "PropiedadPropietario_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropiedadPropietario" ADD CONSTRAINT "PropiedadPropietario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
