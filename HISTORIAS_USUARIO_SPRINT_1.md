# Historias de Usuario - Sprint 1

---

## Historia de Usuario

| **Número**: 1 | **Usuario**: Cliente / Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Inicio de Sesión (*Login*) | |
| **Prioridad en negocio**: 100 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 5 | **Sprint**: 1 |
| **Programador responsable**: Patricio Cruz y Byron Carrascal | |

**Descripción**:
**Como** Usuario registrado **Quiero** ingresar mis credenciales **Para** acceder a las funcionalidades correspondientes a mi rol en la plataforma.

**Escenario de prueba**:
*   **Dado** el ingreso de las credenciales de Cliente correctas **Cuando** pulse el botón "Iniciar Sesión" **Entonces** se permite el acceso y se redirige a la vista principal de Cliente.
*   **Dado** el ingreso de las credenciales de Agente correctas **Cuando** pulse el botón "Iniciar Sesión" **Entonces** se permite el acceso y se redirige al panel de gestión de Agente.
*   **Dado** el ingreso de las credenciales de Administrador correctas **Cuando** pulse el botón "Iniciar Sesión" **Entonces** se permite el acceso y se redirige al panel de administración.
*   **Dado** el ingreso de credenciales incorrectas **Cuando** pulse el botón "Iniciar Sesión" **Entonces** se muestra una alerta indicando "Usuario o contraseña incorrecta".
*   **Dado** el intento de acceso con una cuenta inactiva **Cuando** pulse el botón "Iniciar Sesión" **Entonces** se muestra un mensaje indicando que la cuenta está desactivada.
*   **Dado** el intento de inicio de sesión con campos vacíos **Cuando** pulse el botón "Iniciar Sesión" **Entonces** se muestran mensajes de validación requerida en los campos correspondientes.

---

## Historia de Usuario

| **Número**: 2 | **Usuario**: Usuario Autenticado |
| :--- | :--- |
| **Nombre historia**: Cierre de Sesión (*Logout*) | |
| **Prioridad en negocio**: 80 | **Riesgo en desarrollo**: BAJO |
| **Puntos estimados**: 1 | **Sprint**: 1 |
| **Programador responsable**: Patricio Cruz y Byron Carrascal | |

**Descripción**:
**Como** Usuario autenticado **Quiero** cerrar mi sesión activa **Para** proteger mi cuenta y evitar accesos no autorizados en dispositivos compartidos.

**Escenario de prueba**:
*   **Dado** la existencia de una sesión activa **Cuando** pulse el botón "Cerrar Sesión" **Entonces** se finaliza la sesión, se elimina el token de acceso y se redirige al usuario a la página de inicio pública.

---

## Historia de Usuario

| **Número**: 3 | **Usuario**: Visitante / Cliente Potencial |
| :--- | :--- |
| **Nombre historia**: Registro de cuenta (cliente externo) | |
| **Prioridad en negocio**: 90 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 1 |
| **Programador responsable**: Patricio Cruz y Byron Carrascal | |

**Descripción**:
**Como** Visitante de la web **Quiero** registrarme creando una cuenta personal **Para** poder acceder a funciones exclusivas como guardar favoritos o gestionar mis datos.

**Escenario de prueba**:
*   **Dado** el ingreso de datos válidos en el formulario de registro **Cuando** pulse el botón "Registrarse" **Entonces** se crea la cuenta con rol de Cliente y se redirige a la plataforma.
*   **Dado** el ingreso de un correo electrónico ya registrado **Cuando** pulse el botón "Registrarse" **Entonces** se muestra un error indicando que el correo ya existe.
*   **Dado** el ingreso de una contraseña con menos de 6 caracteres **Cuando** intente enviar el formulario **Entonces** se muestra un mensaje de validación indicando que la contraseña es muy corta.
*   **Dado** el ingreso de un correo electrónico con formato inválido **Cuando** intente enviar el formulario **Entonces** se muestra un mensaje indicando que el formato del correo no es válido.

---

## Historia de Usuario

| **Número**: 4 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Registro de propiedades | |
| **Prioridad en negocio**: 100 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 5 | **Sprint**: 1 |
| **Programador responsable**: Patricio Cruz y Byron Carrascal | |

**Descripción**:
**Como** Agente inmobiliario **Quiero** registrar una nueva propiedad con sus detalles e imágenes **Para** publicarla en la plataforma y ofrecerla a los clientes.

**Escenario de prueba**:
*   **Dado** el ingreso de los datos completos de la propiedad por parte de un Agente **Cuando** pulse el botón "Registrar Propiedad" **Entonces** se guarda la propiedad asignada automáticamente a su cuenta.
*   **Dado** el ingreso de los datos completos de la propiedad por parte de un Administrador y la selección de un agente responsable **Cuando** pulse el botón "Registrar Propiedad" **Entonces** se guarda la propiedad asignada al agente seleccionado.
*   **Dado** el intento de registro por un Administrador sin seleccionar agente responsable **Cuando** pulse el botón "Registrar Propiedad" **Entonces** se muestra un mensaje de error indicando que debe seleccionar un agente.
*   **Dado** el ingreso de datos incompletos de la propiedad **Cuando** pulse el botón "Registrar Propiedad" **Entonces** se muestran mensajes de error en los campos obligatorios.
*   **Dado** la selección de más de 5 imágenes para la propiedad **Cuando** intente subir los archivos **Entonces** se impide la acción o se muestra una advertencia sobre el límite permitido.
*   **Dado** el intento de registro sin seleccionar ninguna imagen **Cuando** pulse el botón "Registrar Propiedad" **Entonces** se muestra un error indicando que debe subir al menos una imagen.
*   **Dado** el ingreso de valores negativos o inválidos en precio o áreas **Cuando** pulse el botón "Registrar Propiedad" **Entonces** se muestra un mensaje de error validando que los valores deben ser positivos.
*   **Dado** el intento de subida de archivos con formato no permitido (ej. PDF, DOC) **Cuando** seleccione los archivos **Entonces** se muestra un error indicando que solo se permiten imágenes (JPG, PNG, WEBP).

---

## Historia de Usuario

| **Número**: 5 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Visualización de propiedades registradas | |
| **Prioridad en negocio**: 90 | **Riesgo en desarrollo**: MEDIO |
| **Puntos estimados**: 3 | **Sprint**: 1 |
| **Programador responsable**: Patricio Cruz y Byron Carrascal | |

**Descripción**:
**Como** Agente inmobiliario **Quiero** ver un listado de las propiedades que he registrado **Para** gestionar mi cartera de inmuebles y verificar su estado.

**Escenario de prueba**:
*   **Dado** el acceso al panel de propiedades como Agente **Cuando** cargue la vista **Entonces** se muestra una lista únicamente con las propiedades asignadas a ese agente.
*   **Dado** el acceso al panel de propiedades como Administrador **Cuando** cargue la vista **Entonces** se muestra una lista con todas las propiedades registradas en el sistema.
*   **Dado** la ausencia de propiedades registradas **Cuando** el usuario accede al panel **Entonces** se muestra un mensaje indicando que no hay propiedades para mostrar.
*   **Dado** la visualización del listado de propiedades **Cuando** se cargue cada tarjeta **Entonces** se muestra el estado actual de la propiedad (disponible, vendida, arrendada, reservada).
*   **Dado** la aplicación de filtros por estado, tipo, ciudad o precio **Cuando** se seleccionen los criterios **Entonces** el sistema muestra solo las propiedades que coinciden con la selección.
*   **Dado** el ingreso de un término en la barra de búsqueda **Cuando** se escribe el texto **Entonces** el sistema filtra dinámicamente las propiedades cuyo título coincida con el término.

---

## Historia de Usuario

| **Número**: 6 | **Usuario**: Agente / Admin |
| :--- | :--- |
| **Nombre historia**: Edición de propiedades | |
| **Prioridad en negocio**: 90 | **Riesgo en desarrollo**: ALTO |
| **Puntos estimados**: 5 | **Sprint**: 1 |
| **Programador responsable**: Patricio Cruz y Byron Carrascal | |

**Descripción**:
**Como** Agente inmobiliario **Quiero** modificar la información de una propiedad existente **Para** mantener los datos actualizados y corregir errores.

**Escenario de prueba**:
*   **Dado** la modificación de los datos de una propiedad propia por parte de un Agente **Cuando** pulse el botón "Guardar Cambios" **Entonces** se actualiza la información en la base de datos y se muestra un mensaje de confirmación.
*   **Dado** la modificación de cualquier propiedad por parte de un Administrador **Cuando** pulse el botón "Guardar Cambios" **Entonces** se actualiza la información correctamente.
*   **Dado** el intento de edición de una propiedad ajena por parte de un Agente **Cuando** intente acceder a la edición **Entonces** se deniega el acceso y se muestra un mensaje de acceso denegado.
*   **Dado** la eliminación de una imagen existente de la propiedad **Cuando** guarde los cambios **Entonces** se elimina el archivo correspondiente del sistema.
*   **Dado** el intento de guardar cambios dejando campos obligatorios vacíos o con datos inválidos **Cuando** pulse el botón "Guardar Cambios" **Entonces** se muestran mensajes de error y no se actualiza la propiedad.
