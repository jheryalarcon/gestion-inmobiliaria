# Módulo de Clientes - InmobiliariaApp

## Descripción
Este módulo permite a los agentes y administradores gestionar los clientes interesados en propiedades inmobiliarias. Incluye funcionalidades completas de CRUD con validaciones robustas y una interfaz de usuario moderna.

## Características Implementadas

### 1. Modelo de Datos (Prisma)
- **Modelo Cliente**: Almacena información completa de los clientes
- **Campos obligatorios**: Nombre, teléfono, email, tipo de cliente
- **Campos opcionales**: Observaciones
- **Relación con agente**: Asignación automática o manual según el rol
- **Validaciones**: Email único, formato de email, teléfono válido

### 2. Backend (Node.js + Express)

#### Controlador (`cliente.controller.js`)
- ✅ **Crear cliente**: Con validaciones completas
- ✅ **Obtener clientes**: Con filtros y paginación
- ✅ **Obtener cliente específico**: Con verificación de permisos
- ✅ **Actualizar cliente**: Con validaciones de datos
- ✅ **Eliminar cliente**: Con confirmación
- ✅ **Estadísticas**: Métricas de clientes

#### Rutas (`cliente.routes.js`)
- ✅ **POST /api/clientes**: Crear cliente
- ✅ **GET /api/clientes**: Listar clientes con filtros
- ✅ **GET /api/clientes/:id**: Obtener cliente específico
- ✅ **PUT /api/clientes/:id**: Actualizar cliente
- ✅ **DELETE /api/clientes/:id**: Eliminar cliente
- ✅ **GET /api/clientes/estadisticas**: Estadísticas

#### Validaciones Implementadas
- ✅ Campos obligatorios (nombre, teléfono, email, tipo_cliente)
- ✅ Email único en el sistema
- ✅ Formato de email válido
- ✅ Formato de teléfono válido
- ✅ Agente responsable (obligatorio para admin)
- ✅ Verificación de agente existente y activo

### 3. Frontend (React)

#### Componentes Creados
- ✅ **SelectTipoCliente**: Dropdown para tipos de cliente
- ✅ **RegistrarCliente**: Formulario completo de registro
- ✅ **PanelClientes**: Listado con filtros y paginación

#### Funcionalidades del Formulario
- ✅ **Validación en tiempo real**: Errores se muestran mientras el usuario escribe
- ✅ **Validación de envío**: Verificación completa antes de enviar
- ✅ **Protección de cambios**: Modal de confirmación al salir sin guardar
- ✅ **Asignación automática**: Los agentes se asignan automáticamente
- ✅ **Selección de agente**: Solo visible para administradores
- ✅ **Mensajes de éxito/error**: Feedback claro al usuario

#### Funcionalidades del Panel
- ✅ **Búsqueda**: Por nombre, email o teléfono
- ✅ **Filtros**: Por tipo de cliente
- ✅ **Paginación**: Navegación entre páginas
- ✅ **Acciones**: Editar y eliminar clientes
- ✅ **Responsive**: Diseño adaptativo
- ✅ **Estados vacíos**: Mensajes cuando no hay resultados

### 4. Integración con el Sistema

#### Navegación
- ✅ **Navbar**: Enlaces agregados para admin y agente
- ✅ **Paneles**: Tarjetas de acceso rápido en PanelAdmin y PanelAgente
- ✅ **Rutas**: Configuradas en App.jsx con protección de roles

#### Permisos y Roles
- ✅ **Admin**: Acceso completo a todos los clientes
- ✅ **Agente**: Solo ve sus clientes asignados
- ✅ **Cliente**: Sin acceso al módulo

## Escenarios de Prueba Implementados

### ✅ Escenario: Agente registra cliente con datos válidos
- El agente completa el formulario
- El sistema registra al cliente
- Se asigna automáticamente al agente

### ✅ Escenario: Administrador registra cliente y asigna a un agente
- El admin selecciona un agente responsable
- El cliente queda registrado y asignado

### ✅ Escenario: Administrador no selecciona agente responsable
- El sistema muestra validación obligatoria
- No permite guardar sin agente

### ✅ Escenario: Registro con datos incompletos o inválidos
- Validación en tiempo real
- Mensajes de error específicos
- No permite envío con errores

### ✅ Escenario: Correo electrónico duplicado
- Verificación de email único
- Mensaje de error claro

### ✅ Escenario: Confirmación de registro exitoso
- Mensaje de éxito
- Redirección al listado

### ✅ Escenario: Usuario no autenticado intenta registrar cliente
- Redirección a login
- Protección de rutas

## Estructura de Archivos

```
backend/
├── prisma/
│   └── schema.prisma (modelo Cliente agregado)
├── src/
│   ├── controllers/
│   │   └── cliente.controller.js (nuevo)
│   ├── routes/
│   │   └── cliente.routes.js (nuevo)
│   └── index.js (rutas agregadas)

frontend/
├── src/
│   ├── components/
│   │   └── SelectTipoCliente.jsx (nuevo)
│   ├── pages/
│   │   ├── RegistrarCliente.jsx (nuevo)
│   │   └── PanelClientes.jsx (nuevo)
│   ├── components/
│   │   └── Navbar.jsx (enlaces agregados)
│   ├── pages/
│   │   ├── PanelAdmin.jsx (tarjetas agregadas)
│   │   └── PanelAgente.jsx (tarjetas agregadas)
│   └── App.jsx (rutas agregadas)
```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, Tailwind CSS, Axios
- **Validación**: Regex para email y teléfono
- **Estado**: React Hooks (useState, useEffect)
- **Navegación**: React Router
- **Notificaciones**: Sonner (toast)

## Próximas Mejoras Sugeridas

1. **Edición de clientes**: Formulario de edición
2. **Filtros avanzados**: Por fecha de registro, agente, etc.
3. **Exportación**: PDF, Excel de listados
4. **Notificaciones**: Alertas por nuevos clientes
5. **Historial**: Seguimiento de cambios
6. **Fotos**: Subir fotos de documentos
7. **Calendario**: Agendar citas con clientes
8. **Reportes**: Estadísticas gráficas

## Instalación y Uso

1. **Migrar base de datos**:
   ```bash
   cd backend
   npx prisma migrate dev --name add-cliente-model
   ```

2. **Generar cliente Prisma**:
   ```bash
   npx prisma generate
   ```

3. **Reiniciar servidores**:
   ```bash
   # Backend
   npm run dev
   
   # Frontend
   npm run dev
   ```

4. **Acceder al módulo**:
   - Como admin: `/admin/panel-clientes`
   - Como agente: `/agente/panel-clientes`

## Notas Técnicas

- El módulo sigue las mismas convenciones de diseño que el módulo de propiedades
- Las validaciones son consistentes con el resto del sistema
- La interfaz es responsive y accesible
- El código está documentado y es mantenible
- Se implementaron todas las historias de usuario solicitadas
