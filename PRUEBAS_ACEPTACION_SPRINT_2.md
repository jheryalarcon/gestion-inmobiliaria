# Pruebas de Aceptación - Sprint 2

Este documento detalla los casos de prueba de aceptación para las historias de usuario del Sprint 2, siguiendo el formato estándar de calidad.

---

## CASO DE PRUEBA 01

| **Nombre caso de prueba**: Cambio de estado de propiedad | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Propiedades | **Historia de usuario asociada**: 1 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Agente o Administrador Quiero poder cambiar el estado de una propiedad (disponible, vendida, arrendada, reservada) Para mantener actualizado el inventario y reflejar la realidad del negocio.

**Escenario de prueba**:
DADO que un Agente propietario selecciona una propiedad disponible CUANDO cambia el estado a "Vendida" y guarda ENTOCES el sistema actualiza el estado y notifica el éxito.

**Pre-condiciones**:
*   El usuario debe estar autenticado como "Agente".
*   El agente debe ser el propietario de la propiedad.
*   La propiedad debe estar en estado "disponible".

**Pasos y condiciones de ejecución**:
1.  Ubicar la tarjeta o fila de la propiedad deseada en la tabla "Mis Propiedades".
2.  Hacer clic en el botón o icono de "Editar" (lápiz).
3.  Desplazarse hasta el campo desplegable "Estado de Publicación".
4.  Seleccionar la opción "Vendida".
5.  Presionar el botón "Guardar Cambios".

**Resultados Esperados**:
*   El sistema muestra una notificación tipo toast color verde: "Propiedad actualizada con éxito".
*   La etiqueta de estado en la tarjeta cambia a "Vendida".

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 02

| **Nombre caso de prueba**: Restricción de edición ajena | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Propiedades | **Historia de usuario asociada**: 1 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Agente Quiero que se impida la edición de propiedades que no me pertenecen Para asegurar la integridad de los datos de otros agentes.

**Escenario de prueba**:
DADO que un Agente intenta acceder a la edición de una propiedad ajena vía URL CUANDO carga la página ENTOCES el sistema deniega el acceso y redirige al listado.

**Pre-condiciones**:
*   El usuario debe estar autenticado como "Agente".
*   Existe una propiedad (ID 999) que pertenece a otro agente.

**Pasos y condiciones de ejecución**:
1.  Ingresar la URL de edición de la propiedad ajena (ej. `/agente/editar-propiedad/999`) en el navegador.
2.  Presionar Enter.

**Resultados Esperados**:
*   El sistema no carga el formulario de edición.
*   Se muestra notificación de error: "No tiene permisos para editar esta propiedad".
*   Redirección automática al listado de "Mis Propiedades".

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 03

| **Nombre caso de prueba**: Eliminación de propiedad (Admin) | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Propiedades | **Historia de usuario asociada**: 2 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Administrador Quiero eliminar propiedades del sistema (soft delete) Para quitar del listado aquellas que ya no deben mostrarse.

**Escenario de prueba**:
DADO que un Administrador selecciona eliminar una propiedad CUANDO confirma la acción en el modal ENTOCES la propiedad pasa a estado inactivo y desaparece del listado público.

**Pre-condiciones**:
*   El usuario debe estar autenticado como "Administrador".
*   Existe una propiedad activa.

**Pasos y condiciones de ejecución**:
1.  Identificar la propiedad a eliminar en el "Panel de Propiedades".
2.  Presionar el botón "Eliminar" (icono de papelera).
3.  Visualizar el modal de confirmación "¿Estás seguro...?".
4.  Presionar el botón "Confirmar" en el modal.

**Resultados Esperados**:
*   El modal se cierra.
*   Notificación de éxito: "Propiedad eliminada correctamente".
*   La propiedad desaparece de la vista actual.

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 04

| **Nombre caso de prueba**: Filtro de propiedades | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Catálogo Público | **Historia de usuario asociada**: 3 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como usuario interesado Quiero filtrar propiedades por criterios Para encontrar opciones rápidamente.

**Escenario de prueba**:
DADO que un usuario aplica filtros de Ciudad y Tipo CUANDO visualiza los resultados ENTOCES solo se muestran propiedades que cumplen ambos criterios.

**Pre-condiciones**:
*   El usuario está en la página `/propiedades`.

**Pasos y condiciones de ejecución**:
1.  Escribir "Quito" en el filtro "Ciudad".
2.  Seleccionar "Casa" en el filtro "Tipo de Propiedad".
3.  Observar el listado de resultados.

**Resultados Esperados**:
*   El listado se actualiza automáticamente.
*   Solo se muestran tarjetas de Casas ubicadas en Quito.
*   El contador de resultados es correcto.

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 05

| **Nombre caso de prueba**: Visualización de detalle | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Catálogo Público | **Historia de usuario asociada**: 4 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como visitante Quiero ver el detalle completo de una propiedad Para conocer sus características.

**Escenario de prueba**:
DADO que un visitante selecciona una tarjeta de propiedad CUANDO carga la vista de detalle ENTOCES se muestra toda la información, galería y contacto del agente.

**Pre-condiciones**:
*   El usuario está en el listado de propiedades.

**Pasos y condiciones de ejecución**:
1.  Hacer clic en la imagen o título de una tarjeta.
2.  Esperar la carga de la página `/propiedad/:id`.
3.  Revisar los componentes de la página.

**Resultados Esperados**:
*   Se muestra precio, descripción, características y mapa.
*   La galería de imágenes es funcional.
*   Aparece la tarjeta de contacto del Agente responsable.

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 06

| **Nombre caso de prueba**: Agregar a Favoritos | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Favoritos | **Historia de usuario asociada**: 5 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Cliente Quiero marcar propiedades como favoritas Para acceder a ellas fácilmente.

**Escenario de prueba**:
DADO que un Cliente autenticado pulsa el icono de corazón en una propiedad CUANDO el sistema procesa la acción ENTOCES el icono se rellena y la propiedad se guarda en su lista.

**Pre-condiciones**:
*   El usuario está autenticado como "Cliente".

**Pasos y condiciones de ejecución**:
1.  Ubicar una propiedad en el listado.
2.  Presionar el icono de "Corazón" (vacío).

**Resultados Esperados**:
*   El icono cambia a "Corazón Relleno" (rojo).
*   La propiedad aparece posteriormente en la sección "Mis Favoritos".

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 07

| **Nombre caso de prueba**: Registro de Cliente Interno | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Clientes | **Historia de usuario asociada**: 6 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Agente Quiero registrar prospectos Para gestionar su seguimiento.

**Escenario de prueba**:
DADO que un Agente completa el formulario de nuevo cliente CUANDO guarda los datos ENTOCES el cliente se registra y se asigna automáticamente al agente.

**Pre-condiciones**:
*   El usuario está autenticado como "Agente".

**Pasos y condiciones de ejecución**:
1.  Navegar al "Panel de Clientes" y pulsar "Nuevo Cliente".
2.  Ingresar Nombre, Email, Teléfono y Tipo.
3.  Presionar "Guardar Cliente".

**Resultados Esperados**:
*   Validación exitosa de datos.
*   Notificación: "Cliente registrado correctamente".
*   El nuevo cliente aparece en la tabla del agente.

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 08

| **Nombre caso de prueba**: Visualización de Clientes | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Clientes | **Historia de usuario asociada**: 7 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Agente Quiero ver mis clientes registrados Para consultar su información.

**Escenario de prueba**:
DADO que un Agente accede al panel de clientes CUANDO carga la tabla ENTOCES solo visualiza los clientes asignados a su cuenta.

**Pre-condiciones**:
*   El usuario está autenticado como "Agente".

**Pasos y condiciones de ejecución**:
1.  Hacer clic en "Panel de Clientes" en el menú.
2.  Revisar el listado mostrado.

**Resultados Esperados**:
*   Se muestra la tabla de clientes.
*   No aparecen clientes pertenecientes a otros agentes.

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 09

| **Nombre caso de prueba**: Edición de Cliente | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Clientes | **Historia de usuario asociada**: 8 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Agente Quiero modificar datos de un cliente Para mantener su información actualizada.

**Escenario de prueba**:
DADO que un Agente edita el teléfono de un cliente CUANDO guarda los cambios ENTOCES la información se actualiza en el sistema.

**Pre-condiciones**:
*   El usuario "Agente" está en el "Panel de Clientes".

**Pasos y condiciones de ejecución**:
1.  Presionar "Editar" en un cliente propio.
2.  Modificar el campo "Teléfono".
3.  Presionar "Guardar Cambios".

**Resultados Esperados**:
*   Notificación de éxito.
*   El nuevo teléfono se refleja en la tabla.

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

## CASO DE PRUEBA 10

| **Nombre caso de prueba**: Desactivación de Cliente | **Sprint**: 2 | **Fecha**: 26/11/2025 |
| :--- | :--- | :--- |
| **Módulo/sección a evaluar**: Gestión de Clientes | **Historia de usuario asociada**: 9 | |
| **Técnica de Prueba**: Caja Negra [X] Caja Blanca [ ] | **Tipo**: Prueba de Aceptación | |

**Descripción**:
Como Agente Quiero desactivar clientes inactivos Para limpiar mi base de datos.

**Escenario de prueba**:
DADO que un Agente selecciona desactivar un cliente CUANDO confirma en el modal ENTOCES el estado del cliente cambia a Inactivo.

**Pre-condiciones**:
*   El cliente está "Activo".

**Pasos y condiciones de ejecución**:
1.  Presionar "Desactivar" en la fila del cliente.
2.  Confirmar la acción en el modal emergente.

**Resultados Esperados**:
*   Notificación: "Cliente desactivado correctamente".
*   El estado visual cambia a "Inactivo" (badge rojo).

| **Estado de Prueba** | **Éxito** | **Fallo** |
| :--- | :--- | :--- |
| | Si | No |

**Errores Asociados**:

---

<br>
<br>

_____________________________________
**Sr. Cristian Escudero**
**PRODUCT OWNER**
