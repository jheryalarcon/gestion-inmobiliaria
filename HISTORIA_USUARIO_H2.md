# Historia de Usuario

**Número:** 2

**Usuario:** Admin, Agente, Cliente

**Nombre historia:** Cierre de Sesión

**Prioridad en negocio:** 90

**Riesgo en desarrollo:** BAJO

**Puntos estimados:** 1

**Sprint:** 1

**Programador responsable:** Patricio Cruz y Byron Carrascal

---

## Descripción

Como usuario autenticado del sistema (Admin, Agente o Cliente) Quiero cerrar mi sesión Para proteger mi cuenta cuando termine de usar la plataforma.

---

## Escenarios de prueba

**Escenario 1: Cierre de sesión exitoso**
- **Dado** que estoy autenticado en la plataforma
- **Cuando** presiono el botón "Cerrar sesión"
- **Entonces** se eliminan el token y los datos del usuario del localStorage, se dispara el evento authChange para actualizar la interfaz y se redirige a la página de inicio (`/`).

**Escenario 2: Actualización de interfaz tras cierre de sesión**
- **Dado** que cierro sesión desde cualquier componente que tenga el botón de logout
- **Cuando** se ejecuta la función cerrarSesion
- **Entonces** los componentes LayoutPublic y Sidebar detectan el evento authChange, actualizan su estado y ocultan elementos que requieren autenticación.

