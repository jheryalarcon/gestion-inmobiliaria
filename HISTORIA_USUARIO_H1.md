# Historia de Usuario

**Número:** 1

**Usuario:** Admin, Agente, Cliente

**Nombre historia:** Inicio de Sesión con Roles

**Prioridad en negocio:** 100

**Riesgo en desarrollo:** ALTO

**Puntos estimados:** 5

**Sprint:** 1

**Programador responsable:** Patricio Cruz y Byron Carrascal

---

## Descripción

Como usuario del sistema (Admin, Agente o Cliente) Quiero ingresar mis credenciales (correo electrónico y contraseña) Para acceder a la plataforma y ser redirigido automáticamente según mi rol.

---

## Escenarios de prueba

**Escenario 1: Inicio de sesión exitoso como Admin**
- **Dado** que ingreso credenciales válidas de un usuario con rol admin
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se valida el formato del correo electrónico, se verifica que el usuario esté activo, se genera un token JWT, se almacena el token y datos del usuario en localStorage, se dispara el evento authChange y se redirige a la ruta `/admin`.

**Escenario 2: Inicio de sesión exitoso como Agente**
- **Dado** que ingreso credenciales válidas de un usuario con rol agente
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se valida el formato del correo electrónico, se verifica que el usuario esté activo, se genera un token JWT, se almacena el token y datos del usuario en localStorage, se dispara el evento authChange y se redirige a la ruta `/agente`.

**Escenario 3: Inicio de sesión exitoso como Cliente**
- **Dado** que ingreso credenciales válidas de un usuario con rol cliente
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se valida el formato del correo electrónico, se verifica que el usuario esté activo, se genera un token JWT, se almacena el token y datos del usuario en localStorage, se dispara el evento authChange y se redirige a la ruta `/`.

**Escenario 4: Credenciales incorrectas**
- **Dado** que ingreso un correo electrónico o contraseña incorrectos
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se muestra un mensaje de error indicando "Error al iniciar sesión" y no se permite el acceso a la plataforma.

**Escenario 5: Validación de campos vacíos**
- **Dado** que dejo el campo de correo electrónico o contraseña vacío
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se muestra un mensaje de error específico debajo de cada campo indicando que el campo es obligatorio.

**Escenario 6: Formato de correo inválido**
- **Dado** que ingreso un correo electrónico con formato inválido
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se muestra un mensaje de error indicando "Correo inválido" y no se permite el acceso.

**Escenario 7: Usuario inactivo**
- **Dado** que ingreso credenciales válidas de un usuario con campo activo en false
- **Cuando** presiono el botón "Ingresar"
- **Entonces** se muestra un mensaje de error y no se permite el acceso a la plataforma.

**Escenario 8: Usuario ya autenticado**
- **Dado** que ya tengo un token válido almacenado en localStorage
- **Cuando** accedo a la página de login
- **Entonces** se decodifica el token, se identifica el rol del usuario y se redirige automáticamente a la ruta correspondiente según su rol sin mostrar el formulario de login.

