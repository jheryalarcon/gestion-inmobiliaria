# Estructura Completa del Proyecto - Inmobiliaria App

## 📁 Vista General del Proyecto

```
inmobiliaria-app/
├── backend/                 # Backend API (Node.js/Express)
├── frontend/                # Frontend (React/Vite)
├── *.md                     # Documentación del proyecto
└── test-recomendaciones-debug.js
```

---

## 🗂️ Backend (Node.js/Express + Prisma)

### Estructura de Directorios

```
backend/
├── src/                     # Código fuente principal
│   ├── index.js            # Punto de entrada de la aplicación
│   ├── config/             # Configuraciones
│   │   ├── images.js       # Configuración de imágenes
│   │   └── multer.js       # Configuración de subida de archivos
│   ├── controllers/        # Lógica de negocio (Controladores)
│   │   ├── agentes.controller.js
│   │   ├── archivoNegociacion.controller.js
│   │   ├── auth.controller.js
│   │   ├── cliente.controller.js
│   │   ├── favorite.controller.js
│   │   ├── negociacion.controller.js
│   │   ├── notaInterna.controller.js
│   │   ├── propiedad.controller.js
│   │   ├── seguimiento.controller.js
│   │   └── usuarios.controller.js
│   ├── middlewares/        # Middlewares (Autenticación, Autorización)
│   │   ├── esAdmin.js
│   │   ├── esAgenteOAdmin.js
│   │   ├── esPropietarioOAdmin.js
│   │   └── verificarToken.js
│   ├── routes/             # Definición de rutas API
│   │   ├── agentes.routes.js
│   │   ├── archivoNegociacion.routes.js
│   │   ├── auth.routes.js
│   │   ├── cliente.routes.js
│   │   ├── favorite.routes.js
│   │   ├── negociacion.routes.js
│   │   ├── notaInterna.routes.js
│   │   ├── propiedad.routes.js
│   │   ├── seguimiento.routes.js
│   │   └── usuarios.routes.js
│   └── prisma/             # Cliente de Prisma
│       └── client.js
│
├── prisma/                 # ORM Prisma (Base de datos)
│   ├── schema.prisma       # Esquema de base de datos
│   └── migrations/         # Migraciones de base de datos
│       ├── 20250706035700_init/
│       ├── 20250710173125_actualizacion_usuario_creacion_propiedad/
│       ├── 20250715185719_actualizacion_de_campos_opcionales/
│       ├── 20250722041820_add_favorite_model/
│       ├── 20250831204625_add_cliente_model/
│       ├── 20250901180635_add_cliente_audit_fields/
│       ├── 20250902005623_add_negociacion_model/
│       ├── 20250904010513_add_historial_etapas_negociacion/
│       ├── 20250904011315_add_fecha_cambio_etapa/
│       ├── 20250904013954_update_negociacion_etapas/
│       ├── 20250904024231_add_seguimientos_model/
│       ├── 20250904172304_add_archivos_negociacion/
│       ├── 20250904180542_add_archivo_negociacion_model/
│       ├── 20250904212254_add_archivos_negociacion/
│       ├── 20250904233356_add_telefono_usuario/
│       ├── 20250904235114_add_updated_at_usuario/
│       ├── 20250904235150_/
│       ├── 20250904235545_make_telefono_required/
│       └── migration_lock.toml
│
├── python_service/         # Microservicio Python (Recomendaciones KNN)
│   ├── app.py              # Servicio principal
│   ├── app_mejorado.py     # Versión mejorada del servicio
│   ├── recomendaciones_service.py
│   ├── recomendaciones_service_mejorado.py
│   ├── sistema_hibrido_recomendaciones.py
│   ├── evaluacion_recomendaciones.py
│   ├── test_mejoras_knn.py
│   ├── setup_mejoras.py
│   ├── setup.bat           # Script de setup (Windows)
│   ├── setup.sh            # Script de setup (Linux/Mac)
│   ├── requirements.txt    # Dependencias Python
│   ├── README.md
│   └── venv/               # Entorno virtual Python
│
├── uploads/                # Archivos subidos (imágenes, documentos)
│
├── node_modules/           # Dependencias de Node.js
├── package.json            # Configuración y dependencias del proyecto
├── package-lock.json       # Lock file de dependencias
├── migrate-etapas.sql      # Script SQL para migración de etapas
├── poblar-datos.js         # Script para poblar datos de prueba
├── verificar-datos.js      # Script para verificar datos
├── verificar-usuarios.js   # Script para verificar usuarios
├── test-recomendaciones-knn.js
├── setup-env.js            # Script de configuración de entorno
├── setup-env.ps1           # Script de configuración (PowerShell)
└── setup-env.sh            # Script de configuración (Bash)
```

### Modelos de Base de Datos (Prisma Schema)

- **Usuario**: Administradores, agentes y clientes
- **Propiedad**: Propiedades inmobiliarias
- **Imagen**: Imágenes de propiedades
- **Favorito**: Propiedades favoritas de usuarios
- **Cliente**: Clientes del sistema
- **Negociacion**: Negociaciones entre clientes y propiedades
- **Seguimiento**: Historial de seguimientos de negociaciones
- **NotaInterna**: Notas internas de agentes
- **ArchivoNegociacion**: Archivos adjuntos a negociaciones

### Endpoints API Principales

- `/api/auth` - Autenticación (login, registro)
- `/api/propiedades` - Gestión de propiedades
- `/api/usuarios` - Gestión de usuarios
- `/api/favoritos` - Favoritos de usuarios
- `/api/clientes` - Gestión de clientes
- `/api/negociaciones` - Gestión de negociaciones
- `/api/seguimientos` - Seguimientos de negociaciones
- `/api/notas-internas` - Notas internas
- `/api/archivos-negociacion` - Archivos de negociaciones
- `/api/agentes` - Gestión de agentes

---

## 🎨 Frontend (React + Vite)

### Estructura de Directorios

```
frontend/
├── src/                    # Código fuente principal
│   ├── main.jsx           # Punto de entrada de React
│   ├── App.jsx            # Componente raíz de la aplicación
│   ├── App.css            # Estilos globales de la app
│   ├── index.css          # Estilos base
│   │
│   ├── pages/             # Páginas/Vistas principales
│   │   ├── Home.jsx                    # Página de inicio (pública)
│   │   ├── Propiedades.jsx             # Listado de propiedades (pública)
│   │   ├── DetallePropiedad.jsx        # Detalle de propiedad (pública)
│   │   ├── DetallePropiedadAdmin.jsx   # Detalle de propiedad (admin/agente)
│   │   ├── MisFavoritos.jsx            # Página de favoritos
│   │   ├── Login.jsx                   # Página de login
│   │   ├── Registro.jsx                # Página de registro
│   │   ├── PanelAdmin.jsx              # Panel de administrador
│   │   ├── PanelAgente.jsx             # Panel de agente
│   │   ├── PanelPropiedades.jsx        # Panel de propiedades
│   │   ├── RegistrarPropiedad.jsx      # Registrar nueva propiedad
│   │   ├── EditarPropiedad.jsx         # Editar propiedad
│   │   ├── PanelClientes.jsx           # Panel de clientes
│   │   ├── RegistrarCliente.jsx        # Registrar nuevo cliente
│   │   ├── EditarCliente.jsx           # Editar cliente
│   │   ├── PanelNegociaciones.jsx      # Panel de negociaciones
│   │   ├── PanelAgentes.jsx            # Panel de agentes
│   │   ├── RegistrarAgente.jsx         # Registrar nuevo agente
│   │   ├── EditarAgente.jsx            # Editar agente
│   │   └── Pagina404.jsx               # Página 404
│   │
│   ├── components/        # Componentes reutilizables
│   │   ├── Navbar.jsx                  # Barra de navegación (privada)
│   │   ├── NavbarPublica.jsx           # Barra de navegación (pública)
│   │   ├── Footer.jsx                  # Pie de página
│   │   ├── Sidebar.jsx                 # Barra lateral (admin/agente)
│   │   ├── LayoutPublic.jsx            # Layout público
│   │   ├── RutaPrivada.jsx             # Componente para rutas protegidas
│   │   ├── Spinner.jsx                 # Componente de carga
│   │   │
│   │   ├── CardPropiedad.jsx           # Tarjeta de propiedad (admin/agente)
│   │   ├── CardPropiedadPublica.jsx    # Tarjeta de propiedad (pública)
│   │   ├── CardNegociacion.jsx         # Tarjeta de negociación
│   │   │
│   │   ├── FiltroPropiedades.jsx       # Filtro de propiedades
│   │   ├── FiltrosPropiedades.jsx      # Filtros avanzados
│   │   ├── UltimasPropiedadesCarousel.jsx  # Carrusel de últimas propiedades
│   │   ├── Recomendaciones.jsx         # Componente de recomendaciones
│   │   │
│   │   ├── FavoritoIcon.jsx            # Icono de favorito
│   │   ├── EstadisticasFavoritos.jsx   # Estadísticas de favoritos
│   │   │
│   │   ├── CrearNegociacion.jsx        # Formulario crear negociación
│   │   ├── ActualizarEtapaForm.jsx     # Formulario actualizar etapa
│   │   ├── HistorialSeguimientos.jsx   # Historial de seguimientos
│   │   ├── NotasInternas.jsx           # Notas internas
│   │   ├── ArchivosAdjuntos.jsx        # Archivos adjuntos
│   │   │
│   │   ├── ModalActualizarEstado.jsx   # Modal actualizar estado
│   │   ├── ModalActualizarEtapaNegociacion.jsx
│   │   ├── ModalArchivosAdjuntos.jsx   # Modal archivos adjuntos
│   │   ├── ModalConfirmarEliminar.jsx  # Modal confirmar eliminación
│   │   │
│   │   ├── SelectProvincia.jsx         # Select de provincias
│   │   ├── SelectTipoPropiedad.jsx     # Select tipo de propiedad
│   │   ├── SelectTipoCliente.jsx       # Select tipo de cliente
│   │   │
│   │   ├── BotonLogout.jsx             # Botón de logout
│   │   │
│   │   └── ui/                         # Componentes UI reutilizables
│   │       └── accordion.jsx           # Componente acordeón
│   │
│   ├── layouts/           # Layouts de la aplicación
│   │   ├── LayoutAdmin.jsx    # Layout para administradores
│   │   └── LayoutAgente.jsx   # Layout para agentes
│   │
│   ├── utils/             # Utilidades y helpers
│   │   ├── tokenUtils.js      # Utilidades de tokens JWT
│   │   └── toastConfig.js     # Configuración de notificaciones
│   │
│   ├── lib/               # Librerías y configuraciones
│   │   └── utils.js           # Utilidades generales
│   │
│   └── assets/            # Recursos estáticos
│       └── react.svg
│
├── public/                # Archivos públicos estáticos
│   └── vite.svg
│
├── dist/                  # Build de producción (generado)
│   ├── assets/
│   ├── index.html
│   └── vite.svg
│
├── node_modules/          # Dependencias de Node.js
├── package.json           # Configuración y dependencias
├── package-lock.json      # Lock file de dependencias
├── vite.config.js         # Configuración de Vite
├── eslint.config.js       # Configuración de ESLint
├── jsconfig.json          # Configuración de JavaScript
├── components.json        # Configuración de componentes
├── index.html             # HTML principal
└── README.md              # Documentación del frontend
```

### Rutas de la Aplicación

#### Rutas Públicas
- `/` - Página de inicio
- `/propiedades` - Listado de propiedades
- `/propiedad/:id` - Detalle de propiedad
- `/favoritos` - Favoritos del usuario
- `/login` - Login
- `/registro` - Registro

#### Rutas Privadas - Admin
- `/admin` - Panel de administrador
- `/admin/registrar-propiedad` - Registrar propiedad
- `/admin/panel-propiedades` - Panel de propiedades
- `/admin/propiedad/:id` - Detalle de propiedad
- `/admin/editar-propiedad/:id` - Editar propiedad
- `/admin/registrar-cliente` - Registrar cliente
- `/admin/editar-cliente/:id` - Editar cliente
- `/admin/panel-clientes` - Panel de clientes
- `/admin/panel-negociaciones` - Panel de negociaciones
- `/admin/registrar-agente` - Registrar agente
- `/admin/editar-agente/:id` - Editar agente
- `/admin/panel-agentes` - Panel de agentes

#### Rutas Privadas - Agente
- `/agente` - Panel de agente
- `/agente/registrar-propiedad` - Registrar propiedad
- `/agente/panel-propiedades` - Panel de propiedades
- `/agente/propiedad/:id` - Detalle de propiedad
- `/agente/editar-propiedad/:id` - Editar propiedad
- `/agente/registrar-cliente` - Registrar cliente
- `/agente/editar-cliente/:id` - Editar cliente
- `/agente/panel-clientes` - Panel de clientes
- `/agente/panel-negociaciones` - Panel de negociaciones

---

## 📚 Documentación del Proyecto

### Archivos de Documentación en la Raíz

- `SPRINT_BACKLOG.md` - Backlog del sprint
- `SPRINT_BACKLOG_II.md` - Backlog del sprint II
- `SPRINT_BACKLOG_III.md` - Backlog del sprint III
- `CARRUSEL_RECOMENDACIONES.md` - Documentación del carrusel de recomendaciones
- `CONFIGURACION_ENV.md` - Configuración de variables de entorno
- `DECISION_RECOMENDACIONES_UNICAS.md` - Decisiones sobre recomendaciones
- `IMAGENES_CARRUSEL_UNIFORMES.md` - Documentación de imágenes del carrusel
- `MEJORAS_ALGORITMO_KNN.md` - Mejoras del algoritmo KNN
- `MEJORAS_CARRUSEL_FINALES.md` - Mejoras finales del carrusel
- `SECCIONES_RECOMENDACIONES_IMPLEMENTADAS.md` - Secciones de recomendaciones
- `SISTEMA_RECOMENDACIONES_KNN.md` - Sistema de recomendaciones KNN
- `SISTEMA_RECOMENDACIONES_PYTHON_KNN.md` - Sistema de recomendaciones Python KNN
- `SOLUCION_COMPLETA_ERROR_500.md` - Solución de error 500
- `SOLUCION_ERROR_500.md` - Solución de error 500
- `SOLUCION_FINAL_ERROR_500.md` - Solución final de error 500

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hash de contraseñas
- **Multer** - Manejo de archivos
- **Axios** - Cliente HTTP
- **CORS** - Manejo de CORS
- **Morgan** - Logger de HTTP

### Frontend
- **React** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework de CSS
- **Material-UI (MUI)** - Componentes UI
- **Radix UI** - Componentes UI accesibles
- **Sonner** - Notificaciones toast
- **Swiper** - Carruseles
- **React Image Gallery** - Galería de imágenes
- **React Photo View** - Visor de fotos
- **JWT Decode** - Decodificación de JWT

### Python Service
- **Python** - Lenguaje de programación
- **Flask/FastAPI** - Framework web (probablemente)
- **scikit-learn** - Machine Learning (KNN)
- **NumPy/Pandas** - Análisis de datos

---

## 🔐 Seguridad y Autenticación

### Middlewares de Seguridad
- `verificarToken.js` - Verificación de token JWT
- `esAdmin.js` - Verificación de rol administrador
- `esAgenteOAdmin.js` - Verificación de rol agente o admin
- `esPropietarioOAdmin.js` - Verificación de propietario o admin

### Roles de Usuario
- **admin** - Administrador completo del sistema
- **agente** - Agente inmobiliario
- **cliente** - Cliente del sistema

---

## 🗄️ Base de Datos

### Modelos Principales
1. **Usuario** - Usuarios del sistema (admin, agente, cliente)
2. **Propiedad** - Propiedades inmobiliarias
3. **Imagen** - Imágenes de propiedades
4. **Favorito** - Propiedades favoritas
5. **Cliente** - Clientes del sistema
6. **Negociacion** - Negociaciones entre clientes y propiedades
7. **Seguimiento** - Historial de seguimientos
8. **NotaInterna** - Notas internas de agentes
9. **ArchivoNegociacion** - Archivos adjuntos a negociaciones

### Estados y Enums
- **EstadoPropiedad**: disponible, vendida, arrendada, reservada, inactiva
- **TipoPropiedad**: casa, departamento, terreno, local_comercial, finca, quinta
- **EstadoFisico**: nueva, usada, en_construccion
- **TipoTransaccion**: venta, alquiler
- **EtapaNegociacion**: interes, negociacion, cierre, finalizada, cancelada
- **TipoSeguimiento**: llamada, visita, mensaje, email, reunion, documento, otro
- **TipoCliente**: comprador, arrendatario, propietario, vendedor, inversionista, consultor

---

## 🚀 Scripts de Inicio

### Backend
```bash
npm run dev  # Inicia el servidor en modo desarrollo
```

### Frontend
```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Previsualiza el build de producción
```

### Python Service
```bash
# Windows
setup.bat

# Linux/Mac
./setup.sh
```

---

## 📝 Notas Importantes

1. **Puertos por defecto**:
   - Backend: `3000`
   - Frontend: `5173`
   - Python Service: `5001`

2. **Variables de entorno**: Configurar en archivo `.env` según `CONFIGURACION_ENV.md`

3. **Base de datos**: PostgreSQL configurada mediante Prisma

4. **Archivos estáticos**: Las imágenes se guardan en `backend/uploads/`

5. **Migraciones**: Las migraciones de Prisma están en `backend/prisma/migrations/`

---

## 🔄 Flujo de Datos

```
Usuario (Frontend)
    ↓
React Router
    ↓
Componentes/Páginas
    ↓
Axios (HTTP Requests)
    ↓
Backend API (Express)
    ↓
Middleware (Auth, Validation)
    ↓
Controllers (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

### Servicio de Recomendaciones
```
Backend API
    ↓
Axios Request
    ↓
Python Service (KNN Algorithm)
    ↓
Response con Recomendaciones
    ↓
Backend API
    ↓
Frontend
```

---

## 📊 Estructura de Archivos por Funcionalidad

### Gestión de Propiedades
- Backend: `controllers/propiedad.controller.js`, `routes/propiedad.routes.js`
- Frontend: `pages/PanelPropiedades.jsx`, `pages/RegistrarPropiedad.jsx`, `pages/EditarPropiedad.jsx`

### Gestión de Clientes
- Backend: `controllers/cliente.controller.js`, `routes/cliente.routes.js`
- Frontend: `pages/PanelClientes.jsx`, `pages/RegistrarCliente.jsx`, `pages/EditarCliente.jsx`

### Gestión de Negociaciones
- Backend: `controllers/negociacion.controller.js`, `routes/negociacion.routes.js`
- Frontend: `pages/PanelNegociaciones.jsx`, `components/CrearNegociacion.jsx`

### Sistema de Recomendaciones
- Backend: `controllers/propiedad.controller.js` (función `obtenerRecomendaciones`)
- Python Service: `python_service/app.py`, `python_service/recomendaciones_service.py`
- Frontend: `components/Recomendaciones.jsx`

### Autenticación
- Backend: `controllers/auth.controller.js`, `routes/auth.routes.js`, `middlewares/verificarToken.js`
- Frontend: `pages/Login.jsx`, `pages/Registro.jsx`, `components/RutaPrivada.jsx`

---

## 🎯 Características Principales

1. **Sistema de autenticación** con JWT
2. **Gestión de propiedades** inmobiliarias
3. **Sistema de favoritos** para usuarios
4. **Sistema de recomendaciones** basado en KNN
5. **Gestión de clientes** y negociaciones
6. **Seguimiento de negociaciones** con historial
7. **Notas internas** para agentes
8. **Archivos adjuntos** en negociaciones
9. **Roles y permisos** (admin, agente, cliente)
10. **Portal público** y privado

---

*Última actualización: 2025*


