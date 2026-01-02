# Historia de Usuario

**Número:** 3

**Usuario:** Cliente (externo)

**Nombre historia:** Registro de Cuenta (Cliente Externo)

**Prioridad en negocio:** 95

**Riesgo en desarrollo:** MEDIO

**Puntos estimados:** 3

**Sprint:** 1

**Programador responsable:** Patricio Cruz y Byron Carrascal

---

## Descripción

Como cliente externo Quiero registrarme en la plataforma proporcionando mi nombre completo, correo electrónico, contraseña y teléfono (opcional) Para crear una cuenta y acceder automáticamente a la plataforma.

---

## Escenarios de prueba

**Escenario 1: Registro exitoso con todos los campos**
- **Dado** que ingreso nombre completo, correo electrónico válido, contraseña de al menos 6 caracteres y teléfono de 10 dígitos
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se valida que el correo no exista en el sistema, se encripta la contraseña, se crea el usuario con rol 'cliente', se genera un token JWT, se almacena el token y datos del usuario en localStorage, se muestra un mensaje de éxito, se dispara el evento authChange y se redirige a la página de inicio después de 2 segundos.

**Escenario 2: Registro exitoso sin teléfono**
- **Dado** que ingreso nombre completo, correo electrónico válido y contraseña de al menos 6 caracteres, dejando el teléfono vacío
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se crea el usuario con rol 'cliente' sin teléfono, se genera un token JWT, se almacena el token y datos del usuario en localStorage, se muestra un mensaje de éxito y se redirige a la página de inicio.

**Escenario 3: Validación de nombre vacío**
- **Dado** que dejo el campo de nombre completo vacío
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando "El nombre es obligatorio" y no se crea la cuenta.

**Escenario 4: Validación de correo vacío**
- **Dado** que dejo el campo de correo electrónico vacío
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando "El correo es obligatorio" y no se crea la cuenta.

**Escenario 5: Validación de formato de correo inválido**
- **Dado** que ingreso un correo electrónico con formato inválido
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando "Correo inválido" y no se crea la cuenta.

**Escenario 6: Validación de correo duplicado**
- **Dado** que ingreso un correo electrónico que ya existe en el sistema
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando que el correo ya está registrado y no se crea la cuenta.

**Escenario 7: Validación de contraseña vacía**
- **Dado** que dejo el campo de contraseña vacío
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando "La contraseña es obligatoria" y no se crea la cuenta.

**Escenario 8: Validación de contraseña corta**
- **Dado** que ingreso una contraseña con menos de 6 caracteres
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando "Debe tener al menos 6 carácteres" y no se crea la cuenta.

**Escenario 9: Validación de teléfono inválido**
- **Dado** que ingreso un teléfono que no tiene 10 dígitos
- **Cuando** presiono el botón "Registrarse"
- **Entonces** se muestra un mensaje de error indicando "El teléfono debe tener 10 dígitos" y no se crea la cuenta.

**Escenario 10: Usuario ya autenticado intenta registrarse**
- **Dado** que ya tengo un token válido almacenado en localStorage
- **Cuando** accedo a la página de registro
- **Entonces** se decodifica el token, se identifica el rol del usuario y se redirige automáticamente a la ruta correspondiente según su rol sin mostrar el formulario de registro.

