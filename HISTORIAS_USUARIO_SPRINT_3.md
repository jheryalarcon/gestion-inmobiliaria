# Historias de Usuario - Sprint 3

## Historia de Usuario

| **Número**: 1 | **Usuario**: Agente |
| :--- | :--- |
| **Nombre historia**: Registro de negociación | |
| **Prioridad en negocio**: 100 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 5 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente **Quiero** registrar una nueva negociación vinculando un cliente y una propiedad **Para** iniciar el proceso de venta o alquiler y dar seguimiento.

**Escenario de prueba**:
*   **Dado** la selección del cliente y la propiedad requeridos por un **Agente** **Cuando** pulse el botón "Crear Negociación" **Entonces** se crea el registro en estado "Interés", se muestra un mensaje de éxito, se cierra el modal y se actualiza la lista de negociaciones.
*   **Dado** el intento de crear una negociación con un cliente inactivo (vía URL/API) **Cuando** se intente guardar **Entonces** el sistema muestra un error indicando que el cliente no es válido o no está activo.
*   **Dado** el intento de crear una negociación para una propiedad no disponible (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema impide la selección o muestra un error al guardar.
*   **Dado** el intento de crear una negociación duplicada (mismo cliente y propiedad) **Cuando** pulse "Crear Negociación" **Entonces** el sistema muestra un error indicando que ya existe una negociación activa.
*   **Dado** la selección de una propiedad de otro agente **Cuando** se visualice en el formulario **Entonces** se muestra la información del agente responsable y se permite crear la negociación.
*   **Dado** que no hay clientes activos asignados al agente **Cuando** abra el modal **Entonces** se muestra un mensaje indicando "No hay clientes disponibles" y el selector aparece vacío.
*   **Dado** que no se ha seleccionado un cliente o una propiedad **Cuando** se visualice el formulario **Entonces** el botón "Crear Negociación" permanece deshabilitado.
*   **Dado** el intento de crear una negociación para un cliente que no pertenece al agente (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema muestra un error de permisos ("No tienes permisos para gestionar este cliente").

---

## Historia de Usuario

| **Número**: 2 | **Usuario**: Agente |
| :--- | :--- |
| **Nombre historia**: Registro de etapa por negociación | |
| **Prioridad en negocio**: 90 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente **Quiero** actualizar la etapa de una negociación **Para** reflejar el avance real del proceso (interés, negociación, cierre, etc.).

**Escenario de prueba**:
*   **Dado** la selección de una nueva etapa válida (ej. "Cierre") por un **Agente** **Cuando** confirme el cambio **Entonces** el estado de la negociación se actualiza, se registra la fecha del cambio, se muestra un mensaje de éxito, se cierra el modal y se actualiza la lista.
*   **Dado** el intento de un **Administrador** de cambiar la etapa de una negociación (vía URL/API) **Cuando** intente guardar **Entonces** el sistema muestra un error indicando que los administradores solo tienen permisos de visualización.
*   **Dado** el intento de cambiar la etapa a la misma que ya tiene actual **Cuando** se seleccione en el formulario **Entonces** el botón de guardar permanece deshabilitado o se muestra una advertencia.
*   **Dado** el intento de actualizar una negociación inactiva (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema rechaza la operación indicando que la negociación no está activa.
*   **Dado** el intento de un Agente de actualizar una negociación que no le pertenece (vía URL/API) **Cuando** se envíe la solicitud **Entonces** el sistema muestra un error de permisos ("No tienes permisos para gestionar este cliente").
*   **Dado** el envío de un valor de etapa no válido (ej. "Inventada") (vía URL/API) **Cuando** se procese la solicitud **Entonces** el sistema rechaza el cambio indicando que la etapa es inválida.

---

## Historia de Usuario

| **Número**: 3 | **Usuario**: Agente |
| :--- | :--- |
| **Nombre historia**: Historial de seguimiento por negociación | |
| **Prioridad en negocio**: 85 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 5 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente **Quiero** registrar seguimientos (llamadas, correos, reuniones) en una negociación **Para** mantener un bitácora detallada de las interacciones con el cliente.

**Escenario de prueba**:
*   **Dado** el ingreso de un comentario y tipo de seguimiento (ej. "Llamada") por un **Agente** **Cuando** pulse "Guardar Seguimiento" **Entonces** el registro se añade al historial, se muestra un mensaje de éxito, se limpia el formulario y la lista se actualiza mostrando el nuevo evento al inicio.
*   **Dado** la visualización del historial de seguimientos **Cuando** se acceda al detalle de la negociación **Entonces** se muestran todos los eventos ordenados por fecha descendente (más recientes primero).
*   **Dado** el intento de guardar un seguimiento sin comentario **Cuando** pulse "Guardar" **Entonces** el sistema muestra un error indicando que el comentario es obligatorio.
*   **Dado** que no existen seguimientos registrados **Cuando** se cargue el historial **Entonces** se muestra un mensaje de estado vacío ("No hay seguimientos registrados").
*   **Dado** el intento de un **Administrador** de agregar un seguimiento (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema muestra un error indicando que solo el agente responsable puede registrar seguimientos.
*   **Dado** el intento de un Agente de registrar un seguimiento en una negociación ajena (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema muestra un error de permisos ("Solo el agente responsable puede registrar seguimientos").
*   **Dado** el intento de registrar un tipo de seguimiento inválido (ej. "Telepatía") (vía URL/API) **Cuando** se procese la solicitud **Entonces** el sistema rechaza el registro.
*   **Dado** el intento de modificar un seguimiento ya registrado (vía URL/API) **Cuando** se busque la opción de edición **Entonces** el sistema no ofrece dicha funcionalidad (los seguimientos son inmutables).
*   **Dado** el intento de acceso directo a la negociación por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

---

## Historia de Usuario

| **Número**: 4 | **Usuario**: Agente |
| :--- | :--- |
| **Nombre historia**: Notas internas por negociación | |
| **Prioridad en negocio**: 80 | **Riesgo en desarrollo**: BAJO |
| **Puntos estimados**: 3 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente **Quiero** agregar notas privadas a una negociación **Para** guardar información sensible o recordatorios que no deben ser visibles para el cliente.

**Escenario de prueba**:
*   **Dado** el ingreso de un comentario privado por un **Agente** **Cuando** pulse "Guardar Nota Privada" **Entonces** la nota se guarda, se muestra un mensaje de éxito, se limpia el formulario y aparece en la lista con un indicador de privacidad ("Nota Privada").
*   **Dado** el intento de un **Administrador** de ver las notas internas de una negociación **Cuando** acceda al panel **Entonces** el sistema muestra un mensaje de "Acceso Restringido" o bloquea la visualización (vía URL/API devuelve error 403).
*   **Dado** el intento de un Agente de ver las notas de una negociación que no le pertenece (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema deniega el acceso ("Solo el agente responsable puede acceder").
*   **Dado** el intento de guardar una nota vacía **Cuando** pulse "Guardar" **Entonces** el sistema impide la acción y muestra un error de validación.
*   **Dado** el intento de modificar o eliminar una nota interna existente (vía URL/API) **Cuando** se busque la funcionalidad **Entonces** el sistema no lo permite (las notas son inmutables para preservar el historial).
*   **Dado** el intento de acceso a las notas internas por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

---

## Historia de Usuario

| **Número**: 5 | **Usuario**: Agente |
| :--- | :--- |
| **Nombre historia**: Adjuntar archivos por negociación | |
| **Prioridad en negocio**: 85 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 5 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente **Quiero** subir documentos relacionados (contratos, identificaciones) a la negociación **Para** centralizar la documentación del proceso.

**Escenario de prueba**:
*   **Dado** la selección de un archivo válido (PDF, JPG, PNG, máx 5MB) por un **Agente** **Cuando** pulse "Subir Archivo" y confirme la operación en el modal de advertencia **Entonces** el documento se almacena, se muestra un mensaje de éxito y aparece en la lista de adjuntos.
*   **Dado** la selección de un archivo válido (PDF, JPG, PNG, máx 5MB) por un **Agente** **Cuando** pulse "Subir Archivo" y confirme la operación en el modal de advertencia **Entonces** el documento se almacena, se muestra un mensaje de éxito y aparece en la lista de adjuntos.
*   **Dado** la acción de cancelar la subida en el modal de confirmación **Cuando** se pulse "Cancelar" **Entonces** el archivo no se sube y se regresa al formulario.
*   **Dado** el intento de subir un archivo mayor a 5MB o con formato no permitido (ej. .exe) **Cuando** se seleccione el archivo **Entonces** el sistema muestra un error de validación y bloquea la subida.
*   **Dado** el intento de eliminar o editar un archivo ya subido (vía URL/API) **Cuando** se busque la funcionalidad **Entonces** el sistema no lo permite (los archivos son inmutables para preservar la evidencia).
*   **Dado** el acceso de un **Administrador** a la sección de archivos **Cuando** intente gestionar documentos **Entonces** el sistema permite visualizar, descargar e incluso subir nuevos archivos (acceso total).
*   **Dado** el intento de un Agente de subir archivos a una negociación ajena (vía URL/API) **Cuando** envíe la solicitud **Entonces** el sistema deniega el acceso (Error 403).
*   **Dado** la acción de descargar un archivo adjunto **Cuando** se pulse el botón "Descargar" **Entonces** el archivo se descarga correctamente al dispositivo del usuario.
*   **Dado** el intento de acceso a la sección de archivos por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

---

## Historia de Usuario

| **Número**: 6 | **Usuario**: Administrador |
| :--- | :--- |
| **Nombre historia**: Registro de agentes | |
| **Prioridad en negocio**: 95 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 5 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Administrador **Quiero** registrar nuevos agentes en el sistema **Para** que puedan gestionar propiedades y clientes.

**Escenario de prueba**:
*   **Dado** el ingreso de los datos válidos (nombre, email, teléfono, contraseña > 6 caracteres) por un **Administrador** **Cuando** pulse "Guardar Agente" **Entonces** se crea la cuenta, se muestran las credenciales generadas (con opción de copiar) y se redirige al panel de agentes.
*   **Dado** el intento de registro con un correo electrónico ya existente **Cuando** se intente guardar **Entonces** el sistema muestra un error de duplicidad ("Ya existe un usuario con este email").
*   **Dado** el intento de guardar el formulario con campos obligatorios vacíos **Cuando** se pulse "Guardar" **Entonces** el sistema muestra mensajes de validación requerida y no procesa el registro.
*   **Dado** el ingreso de una contraseña menor a 6 caracteres o que no coincida con la confirmación **Cuando** se intente enviar el formulario **Entonces** el sistema muestra un error de validación y bloquea el registro.
*   **Dado** el intento de registro con un teléfono inválido (letras o longitud incorrecta) **Cuando** se escriba en el campo **Entonces** el sistema muestra una advertencia de formato.
*   **Dado** el intento de acceso a la página de registro por un usuario con rol de **Agente** (vía URL) **Cuando** cargue la ruta **Entonces** el sistema lo redirige a su panel principal o muestra error de permisos (403).
*   **Dado** el intento de acceso a la creación de agentes por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

---

## Historia de Usuario

| **Número**: 7 | **Usuario**: Administrador |
| :--- | :--- |
| **Nombre historia**: Visualización de agentes registrados | |
| **Prioridad en negocio**: 80 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Administrador **Quiero** ver el listado de agentes registrados **Para** gestionar el equipo de ventas y monitorear su estado.

**Escenario de prueba**:
*   **Dado** el acceso al panel de agentes por un **Administrador** **Cuando** cargue la lista **Entonces** se muestran los agentes con sus datos principales y contadores de actividad (propiedades, clientes, negociaciones).
*   **Dado** el uso de los filtros de búsqueda (nombre, email) o estado (activo/inactivo) **Cuando** se apliquen **Entonces** la lista se actualiza mostrando solo los resultados coincidentes.
*   **Dado** que no existen agentes registrados o coincidentes con la búsqueda **Cuando** se cargue la tabla **Entonces** se muestra un mensaje de estado vacío ("No se encontraron agentes").
*   **Dado** el intento de acceso al panel de agentes por un usuario con rol de **Agente** (vía URL) **Cuando** cargue la ruta **Entonces** el sistema lo redirige a su panel principal o muestra error de permisos (403).
*   **Dado** la existencia de más de 10 agentes registrados **Cuando** se visualice la lista **Entonces** el sistema muestra controles de paginación para navegar entre resultados.
*   **Dado** el intento de acceso a la lista de agentes por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.

---

## Historia de Usuario

| **Número**: 8 | **Usuario**: Administrador |
| :--- | :--- |
| **Nombre historia**: Edición de agentes | |
| **Prioridad en negocio**: 85 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 3 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Administrador **Quiero** modificar los datos de un agente **Para** corregir información o actualizar sus credenciales de contacto.

**Escenario de prueba**:
*   **Dado** la modificación válida de datos (nombre, email, teléfono) por un **Administrador** **Cuando** pulse "Guardar Cambios" **Entonces** la información se actualiza, se muestra un mensaje de éxito y se redirige al listado.
*   **Dado** el intento de cambiar el email de un agente a uno ya ocupado por otro usuario **Cuando** se intente guardar **Entonces** el sistema muestra un error de duplicidad.
*   **Dado** el intento de guardar el formulario con campos obligatorios vacíos (nombre o email) **Cuando** se pulse "Guardar" **Entonces** el sistema muestra mensajes de validación y no permite la actualización.
*   **Dado** el intento de salir del formulario con cambios sin guardar **Cuando** se pulse "Cancelar" o se intente navegar a otra página **Entonces** el sistema muestra un modal de advertencia ("Cambios sin guardar").
*   **Dado** el intento de modificar campos restringidos (Rol o Contraseña) desde este formulario **Cuando** se visualice la interfaz **Entonces** estos campos no son editables o no aparecen.
*   **Dado** el intento de acceso a la edición de un agente por un usuario con rol de **Agente** (vía URL) **Cuando** cargue la ruta **Entonces** el sistema deniega el acceso (403).
*   **Dado** el intento de acceso a la edición de un agente por un usuario no autenticado **Cuando** cargue la URL **Entonces** el sistema redirige a la página de inicio de sesión.
