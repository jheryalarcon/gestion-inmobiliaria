# PRUEBAS DE ACEPTACIÓN - SPRINT 3
**Proyecto**: Gestión Inmobiliaria
**Fecha**: 25/11/2025

---

## CASO DE PRUEBA 01

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Registro de nueva negociación |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Negociaciones |
| **Historia de usuario asociada** | 1 (Registro de negociación) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** la selección del cliente y la propiedad requeridos por un **Agente** **Cuando** pulse el botón "Crear Negociación" **Entonces** se crea el registro en estado "Interés", se muestra un mensaje de éxito, se cierra el modal y se actualiza la lista de negociaciones.
*   **Dado** el intento de crear una negociación con un cliente inactivo (vía URL/API) **Cuando** se intente guardar **Entonces** el sistema muestra un error indicando que el cliente no es válido o no está activo.
*   **Dado** el intento de crear una negociación para una propiedad no disponible (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema impide la selección o muestra un error al guardar.
*   **Dado** el intento de crear una negociación duplicada (mismo cliente y propiedad) **Cuando** pulse "Crear Negociación" **Entonces** el sistema muestra un error indicando que ya existe una negociación activa.
*   **Dado** la selección de una propiedad de otro agente **Cuando** se visualice en el formulario **Entonces** se muestra la información del agente responsable y se permite crear la negociación.
*   **Dado** que no hay clientes activos asignados al agente **Cuando** abra el modal **Entonces** se muestra un mensaje indicando "No hay clientes disponibles" y el selector aparece vacío.
*   **Dado** que no se ha seleccionado un cliente o una propiedad **Cuando** se visualice el formulario **Entonces** el botón "Crear Negociación" permanece deshabilitado.
*   **Dado** el intento de crear una negociación para un cliente que no pertenece al agente (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema muestra un error de permisos ("No tienes permisos para gestionar este cliente").

**Pre-condiciones:**
*   Disponer de conexión a internet.
*   Estar logueado como Agente.
*   Tener al menos un cliente asignado y activo.
*   Existir propiedades con estado "Disponible" en el sistema.

**Acciones del usuario:**
1.  Dirigirse al módulo "Negociaciones".
2.  Hacer clic en el botón "Nueva Negociación".
3.  Seleccionar un Cliente del desplegable (solo visibles los propios).
4.  Buscar y seleccionar una Propiedad disponible.
5.  Hacer clic en "Crear Negociación".

**Resultado esperado:**
*   **En caso de éxito:** El modal se cierra, se muestra un toast "Negociación creada exitosamente" y aparece en la tabla con etapa "Interés".
*   **En caso de fallo:** El sistema mantiene el formulario abierto y muestra mensajes de error bajo los campos obligatorios vacíos.

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 02

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Actualización de etapa de negociación |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Negociaciones |
| **Historia de usuario asociada** | 2 (Registro de etapa) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** la selección de una nueva etapa válida (ej. "Cierre") por un **Agente** **Cuando** confirme el cambio **Entonces** el estado de la negociación se actualiza, se registra la fecha del cambio, se muestra un mensaje de éxito, se cierra el modal y se actualiza la lista.
*   **Dado** el intento de un **Administrador** de cambiar la etapa de una negociación (vía URL/API) **Cuando** intente guardar **Entonces** el sistema muestra un error indicando que los administradores solo tienen permisos de visualización.
*   **Dado** el intento de cambiar la etapa a la misma que ya tiene actual **Cuando** se seleccione en el formulario **Entonces** el botón de guardar permanece deshabilitado o se muestra una advertencia.
*   **Dado** el intento de actualizar una negociación inactiva (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema rechaza la operación indicando que la negociación no está activa.
*   **Dado** el intento de un Agente de actualizar una negociación que no le pertenece (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema muestra un error de permisos ("No tienes permisos para gestionar este cliente").
*   **Dado** el envío de un valor de etapa no válido (ej. "Inventada") (vía URL/API) **Cuando** se procese la solicitud **Entonces** el sistema rechaza el cambio indicando que la etapa es inválida.

**Pre-condiciones:**
*   Estar logueado como Agente.
*   Tener una negociación activa creada previamente.

**Acciones del usuario:**
1.  Ubicar una negociación en la tabla.
2.  Hacer clic en el botón "Actualizar Etapa" (icono de lápiz/flujo).
3.  Seleccionar una nueva etapa del desplegable (diferente a la actual).
4.  Confirmar la actualización.

**Resultado esperado:**
*   **En caso de éxito:** La tabla se refresca mostrando la nueva etapa y se muestra una notificación de éxito.
*   **En caso de fallo:** El sistema impide seleccionar la etapa actual como nueva etapa.

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 03

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Historial de seguimiento |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Negociaciones |
| **Historia de usuario asociada** | 3 (Historial de seguimiento) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** el ingreso de un comentario y tipo de seguimiento (ej. "Llamada") por un **Agente** **Cuando** pulse "Guardar Seguimiento" **Entonces** el registro se añade al historial, se muestra un mensaje de éxito, se limpia el formulario y la lista se actualiza mostrando el nuevo evento al inicio.
*   **Dado** la visualización del historial de seguimientos **Cuando** se acceda al detalle de la negociación **Entonces** se muestran todos los eventos ordenados por fecha descendente (más recientes primero).
*   **Dado** el intento de guardar un seguimiento sin comentario **Cuando** pulse "Guardar" **Entonces** el sistema muestra un error indicando que el comentario es obligatorio.
*   **Dado** que no existen seguimientos registrados **Cuando** se cargue el historial **Entonces** se muestra un mensaje de estado vacío ("No hay seguimientos registrados").
*   **Dado** el intento de un **Administrador** de agregar un seguimiento (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema muestra un error indicando que solo el agente responsable puede registrar seguimientos.
*   **Dado** el intento de un Agente de registrar un seguimiento en una negociación ajena (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema muestra un error de permisos ("Solo el agente responsable puede registrar seguimientos").
*   **Dado** el intento de registrar un tipo de seguimiento inválido (ej. "Telepatía") (vía URL/API) **Cuando** se procese la solicitud **Entonces** el sistema rechaza el registro.
*   **Dado** el intento de modificar un seguimiento ya registrado (vía URL/API) **Cuando** se busque la opción de edición **Entonces** el sistema no ofrece dicha funcionalidad (los seguimientos son inmutables).
*   **Dado** el intento de acceso directo a la negociación por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

**Pre-condiciones:**
*   Estar logueado como Agente (para crear) o Admin (para ver).
*   Acceder al detalle de una negociación.

**Acciones del usuario:**
1.  Abrir el modal de "Seguimiento/Historial".
2.  Seleccionar tipo de acción (Llamada, Visita, Email).
3.  Escribir un comentario detallado.
4.  Hacer clic en "Agregar Seguimiento".

**Resultado esperado:**
*   **En caso de éxito:** El nuevo seguimiento aparece inmediatamente en la parte superior de la lista (orden cronológico descendente) y el formulario se limpia.
*   **En caso de fallo:** Si el comentario está vacío, el borde del campo se pone rojo y no se guarda.

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 04

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Notas internas privadas |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Negociaciones |
| **Historia de usuario asociada** | 4 (Notas internas) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** el ingreso de un comentario privado por un **Agente** **Cuando** pulse "Guardar Nota Privada" **Entonces** la nota se guarda, se muestra un mensaje de éxito, se limpia el formulario y aparece en la lista con un indicador de privacidad ("Nota Privada").
*   **Dado** el intento de un **Administrador** de ver las notas internas de una negociación **Cuando** acceda al panel **Entonces** el sistema muestra un mensaje de "Acceso Restringido" o bloquea la visualización (vía URL/API devuelve error 403).
*   **Dado** el intento de un Agente de ver las notas de una negociación que no le pertenece (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema deniega el acceso ("Solo el agente responsable puede acceder").
*   **Dado** el intento de guardar una nota vacía **Cuando** pulse "Guardar" **Entonces** el sistema impide la acción y muestra un error de validación.
*   **Dado** el intento de modificar o eliminar una nota interna existente (vía URL/API) **Cuando** se busque la funcionalidad **Entonces** el sistema no lo permite (las notas son inmutables para preservar el historial).
*   **Dado** el intento de acceso a las notas internas por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

**Pre-condiciones:**
*   Estar logueado como el Agente asignado a la negociación.

**Acciones del usuario:**
1.  Acceder a la pestaña o sección "Notas Internas".
2.  Escribir una nota confidencial.
3.  Guardar la nota.
4.  (Prueba negativa) Loguearse como Admin e intentar ver estas notas.

**Resultado esperado:**
*   **En caso de éxito:** La nota se guarda con una etiqueta visual de "Privado".
*   **Seguridad:** El Administrador recibe un error 403 o mensaje de bloqueo al intentar acceder a este endpoint/vista.

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 05

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Adjuntar archivos a negociación |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Negociaciones |
| **Historia de usuario asociada** | 5 (Adjuntar archivos) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** la selección del cliente y la propiedad requeridos por un **Agente** **Cuando** pulse el botón "Crear Negociación" **Entonces** se crea el registro en estado "Interés", se muestra un mensaje de éxito, se cierra el modal y se actualiza la lista de negociaciones.
*   **Dado** la selección de un archivo válido (PDF, JPG, PNG, máx 5MB) por un **Agente** **Cuando** pulse "Subir Archivo" y confirme la operación en el modal de advertencia **Entonces** el documento se almacena, se muestra un mensaje de éxito y aparece en la lista de adjuntos.
*   **Dado** la acción de cancelar la subida en el modal de confirmación **Cuando** se pulse "Cancelar" **Entonces** el archivo no se sube y se regresa al formulario.
*   **Dado** el intento de subir un archivo mayor a 5MB o con formato no permitido (ej. .exe) **Cuando** se seleccione el archivo **Entonces** el sistema muestra un error de validación y bloquea la subida.
*   **Dado** el intento de eliminar o editar un archivo ya subido (vía URL/API) **Cuando** se busque la funcionalidad **Entonces** el sistema no lo permite (los archivos son inmutables para preservar la evidencia).
*   **Dado** el acceso de un **Administrador** a la sección de archivos **Cuando** intente gestionar documentos **Entonces** el sistema permite visualizar, descargar e incluso subir nuevos archivos (acceso total).
*   **Dado** el intento de un Agente de subir archivos a una negociación ajena (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema deniega el acceso (Error 403).
*   **Dado** la acción de descargar un archivo adjunto **Cuando** se pulse el botón "Descargar" **Entonces** el archivo se descarga correctamente al dispositivo del usuario.
*   **Dado** el intento de acceso a la sección de archivos por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

**Pre-condiciones:**
*   Tener un archivo de prueba válido (PDF, JPG) y uno inválido (EXE o >5MB).

**Acciones del usuario:**
1.  Abrir modal "Archivos Adjuntos".
2.  Seleccionar archivo del dispositivo.
3.  Hacer clic en "Subir".
4.  Confirmar en el modal de advertencia ("¿Seguro...?").

**Resultado esperado:**
*   **En caso de éxito:** El archivo aparece en la lista con opción de descarga.
*   **En caso de cancelación:** Se vuelve al formulario sin subir nada.
*   **En caso de error:** Mensaje "Formato no permitido" o "Archivo excede 5MB".

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 06

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Registro de Agentes |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Usuarios (Admin) |
| **Historia de usuario asociada** | 6 (Registro de agentes) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** el ingreso de los datos válidos (nombre, email, teléfono, contraseña > 6 caracteres) por un **Administrador** **Cuando** pulse "Guardar Agente" **Entonces** se crea la cuenta, se muestran las credenciales generadas (con opción de copiar) y se redirige al panel de agentes.
*   **Dado** el intento de registro con un correo electrónico ya existente **Cuando** se intente guardar **Entonces** el sistema muestra un error de duplicidad ("Ya existe un usuario con este email").
*   **Dado** el intento de guardar el formulario con campos obligatorios vacíos **Cuando** se pulse "Guardar" **Entonces** el sistema muestra mensajes de validación requerida y no procesa el registro.
*   **Dado** el ingreso de una contraseña menor a 6 caracteres o que no coincida con la confirmación **Cuando** se intente enviar el formulario **Entonces** el sistema muestra un error de validación y bloquea el registro.
*   **Dado** el intento de registro con un teléfono inválido (letras o longitud incorrecta) **Cuando** se escriba en el campo **Entonces** el sistema muestra una advertencia de formato.
*   **Dado** el intento de acceso a la página de registro por un usuario con rol de **Agente** (vía URL) **Cuando** cargue la ruta **Entonces** el sistema lo redirige a su panel principal o muestra error de permisos (403).
*   **Dado** el intento de acceso a la creación de agentes por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

**Pre-condiciones:**
*   Estar logueado como Administrador.

**Acciones del usuario:**
1.  Ir a "Gestión de Agentes" > "Nuevo Agente".
2.  Llenar Nombre, Email, Teléfono, Password, Confirmar Password.
3.  Hacer clic en "Guardar Agente".

**Resultado esperado:**
*   **En caso de éxito:** Toast con credenciales (Email/Pass) y botón de copiar. Redirección al panel.
*   **En caso de fallo:** Mensajes de error específicos ("Email ya registrado", "Contraseña muy corta").

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 07

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Visualización de Agentes |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Usuarios (Admin) |
| **Historia de usuario asociada** | 7 (Visualización de agentes) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** el acceso al panel de agentes por un **Administrador** **Cuando** cargue la lista **Entonces** se muestran los agentes con sus datos principales y contadores de actividad (propiedades, clientes, negociaciones).
*   **Dado** el uso de los filtros de búsqueda (nombre, email) o estado (activo/inactivo) **Cuando** se apliquen **Entonces** la lista se actualiza mostrando solo los resultados coincidentes.
*   **Dado** que no existen agentes registrados o coincidentes con la búsqueda **Cuando** se cargue la tabla **Entonces** se muestra un mensaje de estado vacío ("No se encontraron agentes").
*   **Dado** el intento de acceso al panel de agentes por un usuario con rol de **Agente** (vía URL) **Cuando** cargue la ruta **Entonces** el sistema lo redirige a su panel principal o muestra error de permisos (403).
*   **Dado** la existencia de más de 10 agentes registrados **Cuando** se visualice la lista **Entonces** el sistema muestra controles de paginación para navegar entre resultados.
*   **Dado** el intento de acceso a la lista de agentes por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

**Pre-condiciones:**
*   Estar logueado como Administrador.
*   Tener varios agentes registrados (activos e inactivos).

**Acciones del usuario:**
1.  Ingresar al módulo "Gestión de Agentes".
2.  Observar la tabla y los contadores.
3.  Escribir en el buscador.
4.  Cambiar el filtro de estado.

**Resultado esperado:**
*   **Visualización:** Datos correctos y contadores > 0 si corresponde.
*   **Filtros:** La lista se reduce mostrando solo coincidencias.
*   **Seguridad:** Redirección inmediata si no hay sesión.

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |

---

## CASO DE PRUEBA 08

| Campo | Detalle |
| :--- | :--- |
| **Nombre caso de prueba** | Edición de Agentes |
| **Sprint** | 3 |
| **Módulo/Sección a evaluar** | Gestión de Usuarios (Admin) |
| **Historia de usuario asociada** | 8 (Edición de agentes) |
| **Técnica de prueba** | Caja Negra ☑ Caja Blanca ☐ |
| **Tipo** | Prueba de Aceptación |

**Descripción:**
*   **Dado** la modificación válida de datos (nombre, email, teléfono) por un **Administrador** **Cuando** pulse "Guardar Cambios" **Entonces** la información se actualiza, se muestra un mensaje de éxito y se redirige al listado.
*   **Dado** el intento de cambiar el email de un agente a uno ya ocupado por otro usuario **Cuando** se intente guardar **Entonces** el sistema muestra un error de duplicidad.
*   **Dado** el intento de guardar el formulario con campos obligatorios vacíos (nombre o email) **Cuando** se pulse "Guardar" **Entonces** el sistema muestra mensajes de validación y no permite la actualización.
*   **Dado** el intento de salir del formulario con cambios sin guardar **Cuando** se pulse "Cancelar" o se intente navegar a otra página **Entonces** el sistema muestra un modal de advertencia ("Cambios sin guardar").
*   **Dado** el intento de modificar campos restringidos (Rol o Contraseña) desde este formulario **Cuando** se visualice la interfaz **Entonces** estos campos no son editables o no aparecen.
*   **Dado** el intento de acceso a la edición de un agente por un usuario con rol de **Agente** (vía URL) **Cuando** cargue la ruta **Entonces** el sistema deniega el acceso (403).
*   **Dado** el intento de acceso a la edición de un agente por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

**Pre-condiciones:**
*   Estar logueado como Administrador.
*   Seleccionar un agente existente para editar.

**Acciones del usuario:**
1.  Clic en "Editar" en un agente de la lista.
2.  Modificar el teléfono o nombre.
3.  Intentar salir sin guardar (para probar modal).
4.  Guardar cambios válidos.

**Resultado esperado:**
*   **Advertencia:** Modal "¿Estás seguro? Tienes cambios sin guardar".
*   **Éxito:** Mensaje "Agente actualizado" y datos reflejados en la lista.
*   **Restricción:** No debe permitir editar Rol ni Contraseña en este formulario.

| Estado de prueba | Éxito | Falló |
| :--- | :---: | :---: |
| **Resultado** | ☐ | ☐ |
