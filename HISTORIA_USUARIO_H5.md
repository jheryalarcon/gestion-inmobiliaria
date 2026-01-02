# Historia de Usuario

**Número:** 5

**Usuario:** Admin, Agente

**Nombre historia:** Visualización de Propiedades Registradas

**Prioridad en negocio:** 90

**Riesgo en desarrollo:** MEDIO

**Puntos estimados:** 3

**Sprint:** 1

**Programador responsable:** Patricio Cruz y Byron Carrascal

---

## Descripción

Como Admin o Agente Quiero visualizar todas las propiedades que he registrado o que están asignadas a mí (según mi rol) con la capacidad de filtrar y buscar Para gestionar eficientemente mi inventario de propiedades.

---

## Escenarios de prueba

**Escenario 1: Visualización de propiedades por Admin**
- **Dado** que estoy autenticado como admin
- **Cuando** accedo al panel de propiedades
- **Entonces** se cargan todas las propiedades del sistema desde el endpoint GET `/api/propiedades`, se muestran en un grid responsivo con tarjetas (CardPropiedad) que incluyen imagen, título, precio, ciudad, estado de publicación y tipo de propiedad, y se muestra la información del agente asignado si está disponible.

**Escenario 2: Visualización de propiedades por Agente**
- **Dado** que estoy autenticado como agente
- **Cuando** accedo al panel de propiedades
- **Entonces** se cargan solo las propiedades asignadas a mí desde el endpoint GET `/api/propiedades`, se muestran en un grid responsivo con tarjetas (CardPropiedad) que incluyen imagen, título, precio, ciudad, estado de publicación y tipo de propiedad.

**Escenario 3: Búsqueda de propiedades por título**
- **Dado** que tengo propiedades cargadas en el panel
- **Cuando** ingreso texto en el campo de búsqueda
- **Entonces** se filtran las propiedades en tiempo real mostrando solo aquellas cuyo título contiene el texto ingresado (búsqueda case-insensitive).

**Escenario 4: Filtrado por estado de publicación**
- **Dado** que tengo propiedades cargadas en el panel
- **Cuando** selecciono un estado de publicación del filtro (disponible, vendida, arrendada, reservada, inactiva)
- **Entonces** se muestran solo las propiedades que coinciden con el estado seleccionado.

**Escenario 5: Filtrado por tipo de propiedad**
- **Dado** que tengo propiedades cargadas en el panel
- **Cuando** selecciono un tipo de propiedad del filtro (casa, departamento, terreno, local_comercial, finca, quinta)
- **Entonces** se muestran solo las propiedades que coinciden con el tipo seleccionado.

**Escenario 6: Filtrado por ciudad**
- **Dado** que tengo propiedades cargadas en el panel
- **Cuando** ingreso texto en el filtro de ciudad
- **Entonces** se muestran solo las propiedades cuya ciudad contiene el texto ingresado (búsqueda case-insensitive).

**Escenario 7: Filtrado combinado (búsqueda + filtros)**
- **Dado** que tengo propiedades cargadas en el panel
- **Cuando** aplico búsqueda por título y filtros por estado, tipo y ciudad simultáneamente
- **Entonces** se muestran solo las propiedades que cumplen con todas las condiciones aplicadas.

**Escenario 8: Sin propiedades disponibles**
- **Dado** que no tengo propiedades registradas o que coincidan con los filtros aplicados
- **Cuando** accedo al panel de propiedades o aplico filtros
- **Entonces** se muestra un mensaje indicando "No hay propiedades disponibles para mostrar.".

**Escenario 9: Estado de carga**
- **Dado** que estoy accediendo al panel de propiedades
- **Cuando** se está cargando la información desde el servidor
- **Entonces** se muestra un indicador de carga y, una vez completada la carga, se muestran las propiedades o el mensaje de error correspondiente.

**Escenario 10: Error al cargar propiedades**
- **Dado** que hay un error en la comunicación con el servidor
- **Cuando** se intenta cargar las propiedades
- **Entonces** se muestra un mensaje de error indicando "Error al cargar las propiedades." y no se muestran propiedades.

**Escenario 11: URLs de imágenes correctas**
- **Dado** que las propiedades tienen imágenes asociadas
- **Cuando** se cargan las propiedades
- **Entonces** las URLs de las imágenes se procesan correctamente y se muestran en las tarjetas de propiedades, utilizando rutas absolutas cuando es necesario.

