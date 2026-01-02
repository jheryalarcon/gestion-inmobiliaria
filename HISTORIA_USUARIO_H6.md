# Historia de Usuario

**Número:** 6

**Usuario:** Admin, Agente

**Nombre historia:** Edición de Propiedades

**Prioridad en negocio:** 95

**Riesgo en desarrollo:** ALTO

**Puntos estimados:** 5

**Sprint:** 1

**Programador responsable:** Patricio Cruz y Byron Carrascal

---

## Descripción

Como Admin o Agente Quiero editar una propiedad que he registrado o que está asignada a mí (según mi rol) modificando sus datos y gestionando sus imágenes Para actualizar la información de la propiedad en la plataforma.

---

## Escenarios de prueba

**Escenario 1: Edición exitosa de propiedad por Agente propietario**
- **Dado** que estoy autenticado como agente y accedo a editar una propiedad que está asignada a mí
- **Cuando** modifico los campos deseados y presiono el botón "Guardar cambios"
- **Entonces** se validan los campos obligatorios, se actualiza la información en la base de datos, se procesan las imágenes nuevas y las eliminadas, se muestra un mensaje de éxito y se redirige al panel de propiedades del agente.

**Escenario 2: Edición exitosa de propiedad por Admin**
- **Dado** que estoy autenticado como admin y accedo a editar cualquier propiedad
- **Cuando** modifico los campos deseados y presiono el botón "Guardar cambios"
- **Entonces** se validan los campos obligatorios, se actualiza la información en la base de datos, se procesan las imágenes nuevas y las eliminadas, se muestra un mensaje de éxito y se redirige al panel de propiedades del admin.

**Escenario 3: Acceso denegado para Agente no propietario**
- **Dado** que estoy autenticado como agente e intento acceder a editar una propiedad asignada a otro agente
- **Cuando** accedo a la ruta de edición de esa propiedad
- **Entonces** se muestra un mensaje de error "Acceso denegado" indicando que no tengo permisos para editar esa propiedad y se redirige al panel del agente.

**Escenario 4: Formulario prellenado con datos actuales**
- **Dado** que accedo a la página de edición de una propiedad
- **Cuando** se carga la página
- **Entonces** todos los campos del formulario se prellenan con los datos actuales de la propiedad, incluyendo las imágenes existentes que se muestran con opción de eliminarlas.

**Escenario 5: Eliminación de imagen existente**
- **Dado** que estoy editando una propiedad con imágenes existentes
- **Cuando** presiono el botón de eliminar (×) en una imagen existente
- **Entonces** la imagen se marca para eliminación, desaparece de la vista previa y se elimina del servidor cuando se guardan los cambios.

**Escenario 6: Agregar nuevas imágenes**
- **Dado** que estoy editando una propiedad
- **Cuando** selecciono nuevas imágenes para agregar
- **Entonces** se validan que las imágenes no excedan 5 MB cada una, se valida que el total de imágenes (actuales + nuevas) no supere 5, se muestran en vista previa y se agregan al guardar los cambios.

**Escenario 7: Validación de campos obligatorios**
- **Dado** que estoy editando una propiedad y dejo un campo obligatorio vacío
- **Cuando** presiono el botón "Guardar cambios"
- **Entonces** se muestra un mensaje de error específico para cada campo obligatorio y no se guardan los cambios.

**Escenario 8: Validación de precio inválido**
- **Dado** que ingreso un precio que no es un número o es menor o igual a cero
- **Cuando** presiono el botón "Guardar cambios"
- **Entonces** se muestra un mensaje de error indicando "Ingrese un precio válido" y no se guardan los cambios.

**Escenario 9: Validación de área de terreno inválida**
- **Dado** que ingreso un área de terreno que no es un número o es menor o igual a cero
- **Cuando** presiono el botón "Guardar cambios"
- **Entonces** se muestra un mensaje de error indicando "Área de terreno inválida" y no se guardan los cambios.

**Escenario 10: Validación de al menos una imagen**
- **Dado** que elimino todas las imágenes existentes y no agrego nuevas imágenes
- **Cuando** presiono el botón "Guardar cambios"
- **Entonces** se muestra un mensaje de error indicando "Debe subir al menos una imagen" y no se guardan los cambios.

**Escenario 11: Protección ante recarga de página con cambios**
- **Dado** que he modificado algunos campos del formulario
- **Cuando** intento recargar la página o cerrar la pestaña
- **Entonces** se muestra una advertencia del navegador preguntando si deseo salir sin guardar los cambios.

**Escenario 12: Cancelación con cambios sin guardar**
- **Dado** que he modificado algunos campos del formulario
- **Cuando** presiono el botón "Cancelar"
- **Entonces** se muestra un modal de confirmación preguntando si deseo salir sin guardar y, al confirmar, se redirige al panel de propiedades sin guardar los cambios.

**Escenario 13: Cancelación sin cambios**
- **Dado** que no he modificado ningún campo del formulario
- **Cuando** presiono el botón "Cancelar"
- **Entonces** se redirige directamente al panel de propiedades sin mostrar modal de confirmación.

**Escenario 14: Actualización de propiedad con imágenes nuevas y eliminadas**
- **Dado** que estoy editando una propiedad, elimino algunas imágenes existentes y agrego nuevas imágenes
- **Cuando** presiono el botón "Guardar cambios"
- **Entonces** se eliminan las imágenes marcadas del servidor, se suben las nuevas imágenes, se actualiza la información en la base de datos y se muestra un mensaje de éxito.

**Escenario 15: Error al cargar propiedad**
- **Dado** que hay un error al cargar los datos de la propiedad desde el servidor
- **Cuando** accedo a la página de edición
- **Entonces** se muestra un mensaje de error y no se muestra el formulario de edición.

