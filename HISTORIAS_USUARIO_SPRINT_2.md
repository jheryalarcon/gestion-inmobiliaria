# Historias de Usuario - Sprint 2

Este documento detalla las historias de usuario del Sprint 2, incluyendo descripciones, criterios de aceptación y escenarios de prueba formateados.

---

## Historia de Usuario

| **Número**: 1 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Clasificación de propiedades por estado | |
| **Prioridad en negocio**: 90 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente o Administrador **Quiero** poder cambiar el estado de una propiedad (disponible, vendida, arrendada, reservada) **Para** mantener actualizado el inventario y reflejar la realidad del negocio.

**Escenario de prueba**:
*   **Dado** la selección de un estado como "Vendida", "Arrendada" o "Reservada" por el Agente propietario **Cuando** pulse el botón "Guardar" **Entonces** el sistema actualiza el estado correctamente.
*   **Dado** el intento de clasificación de una propiedad ajena por parte de un Agente **Cuando** haga clic en la opción de cambio de estado **Entonces** el sistema muestra un mensaje de acceso denegado.
*   **Dado** la selección de un nuevo estado por parte de un Administrador en cualquier propiedad **Cuando** pulse el botón "Guardar" **Entonces** el sistema actualiza el estado sin restricciones.
*   **Dado** el intento de clasificación con un valor de estado no permitido **Cuando** pulse el botón "Guardar" **Entonces** el sistema muestra un mensaje de error indicando estado inválido.
*   **Dado** el intento de acceso a la funcionalidad por un usuario no autenticado **Cuando** intente acceder a la vista de clasificación **Entonces** el sistema lo redirige a la pantalla de inicio de sesión.
*   **Dado** un cambio de estado exitoso en una propiedad **Cuando** navegue nuevamente al listado o detalle **Entonces** el nuevo estado se refleja correctamente en la interfaz.

---

## Historia de Usuario

| **Número**: 2 | **Usuario**: Admin |
| :--- | :--- |
| **Nombre historia**: Eliminación de propiedades | |
| **Prioridad en negocio**: 80 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 2 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Administrador **Quiero** eliminar propiedades del sistema (soft delete) **Para** quitar del listado aquellas que ya no deben mostrarse sin perder su registro histórico.

**Escenario de prueba**:
*   **Dado** la selección de una propiedad activa **Cuando** el Administrador pulse el botón "Eliminar" y confirme la acción en el modal **Entonces** la propiedad cambia a estado "inactiva" y desaparece de los listados públicos y del agente.
*   **Dado** el intento de eliminación por parte de un Agente **Cuando** busque el botón de "Eliminar" en la interfaz **Entonces** el sistema no muestra la opción o deniega el permiso.
*   **Dado** la solicitud de eliminación **Cuando** el usuario pulse el botón "Cancelar" en el modal de confirmación **Entonces** la propiedad permanece activa y sin cambios.

---

## Historia de Usuario

| **Número**: 3 | **Usuario**: Usuario Público / Cliente |
| :--- | :--- |
| **Nombre historia**: Filtro y búsqueda de propiedades | |
| **Prioridad en negocio**: 95 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** usuario interesado **Quiero** filtrar y buscar propiedades por diversos criterios (ciudad, precio, tipo, etc.) **Para** encontrar rápidamente las opciones que se ajustan a mis necesidades.

**Escenario de prueba**:
*   **Dado** la visualización del listado de propiedades públicas **Cuando** seleccione una ciudad, tipo de transacción o rango de precio en los filtros **Entonces** el listado se actualiza automáticamente mostrando las propiedades que cumplen las condiciones.
*   **Dado** el uso de la barra de búsqueda **Cuando** escriba una palabra clave del título **Entonces** el listado se filtra en tiempo real mostrando las coincidencias.
*   **Dado** la selección de filtros específicos (Habitaciones, Baños) **Cuando** cambie el valor en los desplegables **Entonces** se muestran únicamente las propiedades con esa cantidad o más de características.
*   **Dado** la aplicación de filtros que no producen resultados **Cuando** se actualiza el listado **Entonces** se muestra un mensaje indicando que no se encontraron propiedades.
*   **Dado** la selección de un tipo de propiedad específico (ej. Casa, Apartamento) **Cuando** seleccione la opción en el menú **Entonces** el listado muestra solo inmuebles de esa categoría.
*   **Dado** un listado filtrado con múltiples criterios activos **Cuando** pulse el botón "Limpiar" **Entonces** se restablecen todos los campos y se muestran todas las propiedades disponibles.

---

## Historia de Usuario

| **Número**: 4 | **Usuario**: Usuario Público |
| :--- | :--- |
| **Nombre historia**: Visualización pública de propiedades | |
| **Prioridad en negocio**: 100 | **Riesgo en desarrollo**: BAJO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** visitante del sitio web **Quiero** ver un catálogo de propiedades disponibles con sus detalles principales **Para** conocer la oferta inmobiliaria sin necesidad de registrarme.

**Escenario de prueba**:
*   **Dado** el acceso a la página de inicio ("/") por un **Visitante** **Cuando** ingrese a la URL principal **Entonces** se muestran las últimas propiedades destacadas en un diseño de cuadrícula.
*   **Dado** la navegación al catálogo completo ("/propiedades") por un **Visitante** **Cuando** haga clic en el enlace "Propiedades" del menú **Entonces** se muestra el listado completo con filtros avanzados.
*   **Dado** la selección de una tarjeta de propiedad por un **Visitante** **Cuando** haga clic en la imagen o título **Entonces** se accede a la vista de detalle mostrando el precio, ubicación, características con iconos y la información del agente.
*   **Dado** la navegación en el detalle de una propiedad por un **Visitante** **Cuando** pulse el botón "Volver" **Entonces** regresa al listado anterior conservando la navegación.
*   **Dado** la navegación por el catálogo público por un **Visitante** ante propiedades con estado distinto a "disponible" (ej. "reservada") **Cuando** explore el listado **Entonces** estas propiedades no aparecen listadas.
*   **Dado** la visualización del detalle de una propiedad por un **Visitante** **Cuando** haga clic en las flechas de navegación o miniaturas de la galería **Entonces** la imagen principal cambia acorde a la selección.
*   **Dado** el interés en una propiedad por un **Visitante** **Cuando** complete el formulario de contacto lateral y pulse "Enviar Mensaje" **Entonces** se muestra una confirmación de envío exitoso.
*   **Dado** la visualización de una propiedad específica por un **Visitante** **Cuando** se desplace al final de la página **Entonces** se muestra una sección de "Recomendaciones" con propiedades similares.
*   **Dado** la carga de la información de la propiedad para un **Visitante** **Cuando** visualice la columna derecha **Entonces** aparecen los datos del Agente responsable (nombre, foto, email) en una tarjeta dedicada.

---

## Historia de Usuario

| **Número**: 5 | **Usuario**: Cliente Registrado |
| :--- | :--- |
| **Nombre historia**: Guardar propiedad como favorita | |
| **Prioridad en negocio**: 70 | **Riesgo en desarrollo**: BAJO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** cliente registrado **Quiero** marcar propiedades como favoritas **Para** acceder a ellas fácilmente en una sección dedicada.

**Escenario de prueba**:
*   **Dado** la visualización de una propiedad por un **Cliente** **Cuando** pulse el icono de "corazón" **Entonces** la propiedad se agrega a su lista de favoritos y el icono cambia de estado.
*   **Dado** la selección de una propiedad favorita por un **Cliente** **Cuando** pulse nuevamente el icono de "corazón" **Entonces** la propiedad se elimina de la lista de favoritos.
*   **Dado** el intento de marcar favorito por un **Visitante** **Cuando** haga clic en el icono de "corazón" **Entonces** el sistema lo redirige al inicio de sesión o muestra un mensaje requiriendo registro.
*   **Dado** el acceso a la sección "Mis Favoritos" por un **Cliente** **Cuando** haga clic en la opción "Mis Favoritos" del menú **Entonces** ve listadas todas las propiedades que marcó previamente.
*   **Dado** la visualización de la lista de favoritos por un **Cliente** **Cuando** seleccione un criterio de ordenamiento (Fecha, Precio, Título) **Entonces** las tarjetas se reorganizan según la selección.
*   **Dado** el ingreso a "Mis Favoritos" por un **Cliente** sin propiedades guardadas **Cuando** acceda a la sección **Entonces** se muestra un mensaje indicando "No tienes favoritos aún" con un botón para explorar propiedades.
*   **Dado** la eliminación de un favorito desde la lista por un **Cliente** **Cuando** haga clic en el icono de "corazón" de una tarjeta **Entonces** la tarjeta desaparece inmediatamente de la lista sin necesidad de recargar.
*   **Dado** el inicio de sesión por un **Cliente** con favoritos guardados **Cuando** acceda a su cuenta **Entonces** sus propiedades favoritas persisten y se cargan correctamente.
*   **Dado** el intento de guardar una propiedad ya existente en favoritos por un **Cliente** (ej. error de sincronización) **Cuando** se envíe la solicitud **Entonces** el sistema evita duplicados y notifica el estado actual.
*   **Dado** la visualización de la página "Mis Favoritos" por un **Cliente** **Cuando** se desplace al final de la sección **Entonces** se muestra un apartado de "Recomendaciones" con propiedades sugeridas basadas en sus intereses.
*   **Dado** el intento de acceso directo a la página "Mis Favoritos" por un **Visitante** **Cuando** ingrese a la URL **Entonces** el sistema deniega el acceso y lo redirige a la página de inicio de sesión.
*   **Dado** la visualización de la sección de recomendaciones por un **Cliente** sin favoritos **Cuando** se cargue la página **Entonces** se muestra un mensaje invitando a guardar propiedades para recibir sugerencias personalizadas.

---

## Historia de Usuario

| **Número**: 6 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Registro de clientes internos | |
| **Prioridad en negocio**: 90 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 5 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente o Administrador **Quiero** registrar clientes potenciales (prospectos) en el sistema **Para** gestionar su seguimiento y asignarles propiedades de interés.

**Escenario de prueba**:
*   **Dado** el ingreso de los datos completos del cliente por parte de un **Agente** **Cuando** pulse el botón "Guardar Cliente" **Entonces** se registra el prospecto asignado automáticamente a su cartera.
*   **Dado** el ingreso de los datos completos del cliente por parte de un **Administrador** y la selección de un agente responsable **Cuando** pulse el botón "Guardar Cliente" **Entonces** se guarda el cliente asignado al agente seleccionado.
*   **Dado** el intento de registro por un **Administrador** sin seleccionar agente responsable **Cuando** pulse el botón "Guardar Cliente" **Entonces** se muestra un mensaje de validación solicitando seleccionar un agente.
*   **Dado** el ingreso de datos incompletos o inválidos en el formulario **Cuando** pulse el botón "Guardar Cliente" **Entonces** se muestran mensajes de error en los campos obligatorios y no se permite el registro.
*   **Dado** el ingreso de un correo electrónico ya registrado en el sistema **Cuando** pulse el botón "Guardar Cliente" **Entonces** se muestra un mensaje de advertencia indicando que el correo ya existe.
*   **Dado** el registro exitoso del cliente en el sistema **Cuando** se complete el proceso de guardado **Entonces** se muestra un mensaje de éxito y se redirige al listado de clientes registrados.
*   **Dado** el intento de acceso al formulario por un usuario no autenticado **Cuando** intente ingresar a la URL protegida **Entonces** el sistema lo redirige a la pantalla de inicio de sesión.
*   **Dado** la cancelación del proceso de registro por parte del usuario **Cuando** pulse el botón "Cancelar" **Entonces** se limpia el formulario o se redirige al listado anterior sin guardar cambios.

---

## Historia de Usuario

| **Número**: 7 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Visualización de clientes registrados | |
| **Prioridad en negocio**: 85 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente o Administrador **Quiero** ver un listado de los clientes registrados **Para** consultar su información y estado.

**Escenario de prueba**:
*   **Dado** el acceso al panel de clientes por un **Agente** **Cuando** seleccione la opción del sidebar "Panel de Clientes" **Entonces** visualiza únicamente los clientes asignados a su cuenta.
*   **Dado** el acceso al panel de clientes por un **Administrador** **Cuando** seleccione la opción del sidebar "Panel de Clientes" **Entonces** visualiza todos los clientes del sistema y su agente responsable.
*   **Dado** el uso de filtros por estado o tipo de cliente **Cuando** seleccione una opción en los desplegables **Entonces** la tabla se actualiza mostrando solo los registros coincidentes.
*   **Dado** la búsqueda de un cliente específico **Cuando** ingrese texto (nombre, email o teléfono) en la barra de búsqueda **Entonces** el listado se filtra en tiempo real mostrando las coincidencias.
*   **Dado** la ausencia de clientes registrados o coincidentes con los filtros y/o barra de búsqueda **Cuando** acceda al panel de clientes **Entonces** se muestra un mensaje indicando que no se encontraron clientes.
*   **Dado** el intento de acceso al panel de clientes por un usuario no autenticado **Cuando** ingrese a la URL protegida **Entonces** el sistema lo redirige a la pantalla de inicio de sesión.
*   **Dado** la navegación por un listado extenso de clientes por un **Usuario** **Cuando** cambie de página en los controles de paginación **Entonces** se cargan los siguientes registros correctamente.

---

## Historia de Usuario

| **Número**: 8 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Edición de clientes | |
| **Prioridad en negocio**: 80 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente o Administrador **Quiero** modificar los datos de un cliente **Para** mantener su información de contacto y preferencias actualizada.

**Escenario de prueba**:
*   **Dado** la edición de los datos de un cliente asignado por un **Agente** **Cuando** pulse el botón "Guardar Cambios" **Entonces** el sistema muestra un mensaje de éxito y redirige automáticamente al panel de clientes.
*   **Dado** el intento de edición de un cliente ajeno por un **Agente** **Cuando** intente acceder al formulario **Entonces** el sistema muestra un mensaje de acceso denegado y lo redirige al listado de clientes.
*   **Dado** la modificación de datos de cualquier cliente por un **Administrador** **Cuando** pulse "Guardar Cambios" **Entonces** el sistema guarda los cambios, muestra un mensaje de confirmación y lo redirige al panel de clientes.
*   **Dado** el intento de guardar cambios con campos obligatorios vacíos **Cuando** pulse el botón "Guardar Cambios" **Entonces** el sistema muestra mensajes de validación y mantiene al usuario en el formulario.
*   **Dado** la modificación del correo electrónico de un cliente a uno ya existente **Cuando** de clic en el botón "Guardar Cambios" **Entonces** el sistema muestra un mensaje de error por duplicación.
*   **Dado** el intento de acceso al formulario de edición de un cliente por un usuario no autenticado **Cuando** ingrese a la URL protegida **Entonces** el sistema lo redirige a la pantalla de inicio de sesión.
*   **Dado** el intento de edición de un cliente inactivo **Cuando** acceda al formulario de edición del cliente **Entonces** se muestra una alerta indicando que debe reactivarse y se bloquea la edición.
*   **Dado** la decisión de descartar los cambios en los datos de un cliente **Cuando** pulse el botón "Cancelar" **Entonces** se muestra un modal de confirmación (si hay cambios) o se redirige al panel de clientes (si no hay cambios).

---

## Historia de Usuario

| **Número**: 9 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Eliminación o desactivación de clientes | |
| **Prioridad en negocio**: 75 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 2 |
| **Programador responsable**: Equipo de Desarrollo | |

**Descripción**:
**Como** Agente o Administrador **Quiero** desactivar clientes que ya no están interesados **Para** mantener la base de datos limpia, teniendo la opción de reactivarlos si es necesario.

**Escenario de prueba**:
*   **Dado** la selección de un cliente activo asignado por un **Agente** **Cuando** presione la opción "Desactivar" y confirme la acción **Entonces** el sistema cambia el estado a "inactivo" y deja de aparecer en la lista de clientes activos.
*   **Dado** el intento de desactivar un cliente por un **Agente** **Cuando** presione el botón "Desactivar" **Entonces** el sistema muestra una advertencia y solicita confirmación antes de aplicar la acción.
*   **Dado** la selección de cualquier cliente por un **Administrador** **Cuando** presione el botón "Desactivar" y confirme **Entonces** el cliente se marca como "inactivo" y se oculta de la vista de clientes activos.
*   **Dado** la visualización de la lista de clientes inactivos por un **Administrador** **Cuando** aplique la opción "Inactivos" del filtro "Estado" y presione "Reactivar" **Entonces** el sistema cambia su estado a "activo" y vuelve a estar visible en la vista de clientes activos del agente responsable.
*   **Dado** el intento de reactivación de un cliente inactivo por un **Agente** **Cuando** presione el botón "Reactivar" **Entonces** el sistema muestra un mensaje de error indicando que solo un administrador puede hacer la acción.
*   **Dado** el intento de desactivar un cliente ajeno por un **Agente** (vía URL/API) **Cuando** intente realizar la acción **Entonces** el sistema muestra un mensaje de acceso denegado.
*   **Dado** el intento de eliminar un cliente por un **Usuario no autenticado** **Cuando** acceda a la funcionalidad por URL **Entonces** el sistema lo redirige a la pantalla de inicio de sesión.
