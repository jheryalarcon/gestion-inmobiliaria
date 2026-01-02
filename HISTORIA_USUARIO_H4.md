# Historia de Usuario

**Número:** 4

**Usuario:** Admin, Agente

**Nombre historia:** Registro de Propiedades

**Prioridad en negocio:** 100

**Riesgo en desarrollo:** ALTO

**Puntos estimados:** 5

**Sprint:** 1

**Programador responsable:** Patricio Cruz y Byron Carrascal

---

## Descripción

Como Admin o Agente Quiero registrar una nueva propiedad proporcionando todos los datos requeridos (título, tipo, estado físico, transacción, precio, ubicación, características e imágenes) Para publicarla en la plataforma y que quede asignada al agente correspondiente.

---

## Escenarios de prueba

**Escenario 1: Registro exitoso de propiedad por Agente**
- **Dado** que estoy autenticado como agente y completo todos los campos obligatorios (título, tipo de propiedad, estado físico, transacción, precio, dirección, ciudad, provincia, área de terreno) y subo al menos una imagen
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se valida que todos los campos obligatorios estén completos, se valida que el precio y área de terreno sean números positivos, se valida que haya al menos una imagen, se asigna automáticamente el agente actual a la propiedad, se guardan las imágenes en el servidor, se crea el registro en la base de datos, se muestra un mensaje de éxito y se redirige al panel de propiedades del agente.

**Escenario 2: Registro exitoso de propiedad por Admin con asignación de agente**
- **Dado** que estoy autenticado como admin, completo todos los campos obligatorios, subo al menos una imagen y selecciono un agente del selector
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se valida que todos los campos obligatorios estén completos, se valida que el agente esté seleccionado, se asigna el agente seleccionado a la propiedad, se guardan las imágenes en el servidor, se crea el registro en la base de datos, se muestra un mensaje de éxito y se redirige al panel de propiedades del admin.

**Escenario 3: Validación de título vacío**
- **Dado** que dejo el campo de título vacío
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se muestra un mensaje de error indicando "El título es obligatorio" y no se crea la propiedad.

**Escenario 4: Validación de tipo de propiedad no seleccionado**
- **Dado** que no selecciono un tipo de propiedad
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se muestra un mensaje de error indicando "Selecciona un tipo de propiedad" y no se crea la propiedad.

**Escenario 5: Validación de precio inválido**
- **Dado** que ingreso un precio que no es un número o es menor o igual a cero
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se muestra un mensaje de error indicando "Ingrese un precio válido" y no se crea la propiedad.

**Escenario 6: Validación de área de terreno inválida**
- **Dado** que ingreso un área de terreno que no es un número o es menor o igual a cero
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se muestra un mensaje de error indicando "Ingrese un área válida" y no se crea la propiedad.

**Escenario 7: Validación de imágenes - sin imágenes**
- **Dado** que no subo ninguna imagen
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se muestra un mensaje de error indicando "Debe subir al menos una imagen" y no se crea la propiedad.

**Escenario 8: Validación de imágenes - máximo de imágenes**
- **Dado** que intento subir más de 5 imágenes
- **Cuando** selecciono las imágenes
- **Entonces** se muestra un mensaje de error indicando que solo se pueden subir un máximo de 5 imágenes y no se agregan las imágenes adicionales.

**Escenario 9: Validación de tamaño de imagen**
- **Dado** que intento subir una imagen que supera los 5 MB
- **Cuando** selecciono la imagen
- **Entonces** se muestra un mensaje de error indicando que la imagen supera el tamaño máximo permitido y no se agrega la imagen.

**Escenario 10: Vista previa de imágenes**
- **Dado** que selecciono imágenes válidas
- **Cuando** las imágenes se cargan
- **Entonces** se muestran las imágenes en vista previa con un botón para eliminarlas antes de enviar el formulario y se muestra un contador de imágenes seleccionadas (X de 5).

**Escenario 11: Validación de agente no seleccionado (solo Admin)**
- **Dado** que estoy autenticado como admin y no selecciono un agente
- **Cuando** presiono el botón "Registrar propiedad"
- **Entonces** se muestra un mensaje de error indicando "Debe seleccionar un agente" y no se crea la propiedad.

**Escenario 12: Protección ante recarga de página**
- **Dado** que he completado algunos campos del formulario
- **Cuando** intento recargar la página o cerrar la pestaña
- **Entonces** se muestra una advertencia del navegador preguntando si deseo salir sin guardar los cambios.

**Escenario 13: Cancelación con cambios sin guardar**
- **Dado** que he completado algunos campos del formulario
- **Cuando** presiono el botón "Cancelar"
- **Entonces** se muestra un modal de confirmación preguntando si deseo salir sin guardar y, al confirmar, se redirige al panel de propiedades sin guardar los cambios.

