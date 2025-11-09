# Estructura del Proyecto con Conexiones

## 🔗 Backend - Conexiones y Flujo de Datos

### Punto de Entrada
```
backend/src/index.js
    ├─→ routes/auth.routes.js
    ├─→ routes/propiedad.routes.js
    ├─→ routes/usuarios.routes.js
    ├─→ routes/favorite.routes.js
    ├─→ routes/cliente.routes.js
    ├─→ routes/negociacion.routes.js
    ├─→ routes/seguimiento.routes.js
    ├─→ routes/notaInterna.routes.js
    ├─→ routes/archivoNegociacion.routes.js
    └─→ routes/agentes.routes.js
```

### Rutas → Controladores → Prisma

#### 1. Autenticación
```
routes/auth.routes.js
    ├─→ controllers/auth.controller.js
    │   ├─→ prisma/client.js
    │   ├─→ bcrypt (hash passwords)
    │   └─→ jsonwebtoken (generar tokens)
    └─→ middlewares/verificarToken.js
```

#### 2. Propiedades
```
routes/propiedad.routes.js
    ├─→ controllers/propiedad.controller.js
    │   ├─→ prisma/client.js
    │   ├─→ config/images.js (procesar imágenes)
    │   ├─→ config/multer.js (subida de archivos)
    │   ├─→ axios (llamar servicio Python)
    │   └─→ python_service/app.py (recomendaciones KNN)
    ├─→ middlewares/verificarToken.js
    ├─→ middlewares/esPropietarioOAdmin.js
    ├─→ middlewares/esAdmin.js
    └─→ config/multer.js
```

#### 3. Usuarios
```
routes/usuarios.routes.js
    ├─→ controllers/usuarios.controller.js
    │   └─→ prisma/client.js
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAdmin.js
```

#### 4. Favoritos
```
routes/favorite.routes.js
    ├─→ controllers/favorite.controller.js
    │   └─→ prisma/client.js
    └─→ middlewares/verificarToken.js
```

#### 5. Clientes
```
routes/cliente.routes.js
    ├─→ controllers/cliente.controller.js
    │   └─→ prisma/client.js
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAgenteOAdmin.js
```

#### 6. Negociaciones
```
routes/negociacion.routes.js
    ├─→ controllers/negociacion.controller.js
    │   ├─→ prisma/client.js
    │   ├─→ controllers/cliente.controller.js (validar cliente)
    │   └─→ controllers/propiedad.controller.js (validar propiedad)
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAgenteOAdmin.js
```

#### 7. Seguimientos
```
routes/seguimiento.routes.js
    ├─→ controllers/seguimiento.controller.js
    │   ├─→ prisma/client.js
    │   └─→ controllers/negociacion.controller.js (validar negociación)
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAgenteOAdmin.js
```

#### 8. Notas Internas
```
routes/notaInterna.routes.js
    ├─→ controllers/notaInterna.controller.js
    │   ├─→ prisma/client.js
    │   └─→ controllers/negociacion.controller.js (validar negociación)
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAgenteOAdmin.js
```

#### 9. Archivos de Negociación
```
routes/archivoNegociacion.routes.js
    ├─→ controllers/archivoNegociacion.controller.js
    │   ├─→ prisma/client.js
    │   ├─→ config/multer.js (subida de archivos)
    │   └─→ controllers/negociacion.controller.js (validar negociación)
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAgenteOAdmin.js
```

#### 10. Agentes
```
routes/agentes.routes.js
    ├─→ controllers/agentes.controller.js
    │   └─→ prisma/client.js
    ├─→ middlewares/verificarToken.js
    └─→ middlewares/esAdmin.js
```

### Middlewares - Flujo de Autenticación
```
verificarToken.js
    ├─→ jsonwebtoken (verificar token)
    ├─→ prisma/client.js (validar usuario)
    └─→ req.usuario (agregar usuario al request)

esAdmin.js
    └─→ req.usuario.rol === 'admin'

esAgenteOAdmin.js
    └─→ req.usuario.rol === 'agente' || req.usuario.rol === 'admin'

esPropietarioOAdmin.js
    ├─→ req.usuario.rol === 'admin'
    └─→ req.usuario.id === propiedad.agenteId
```

### Base de Datos - Modelos y Relaciones
```
prisma/schema.prisma
    │
    ├─→ Usuario
    │   ├─→ Propiedad[] (agenteId)
    │   ├─→ Favorito[] (usuarioId)
    │   ├─→ Cliente[] (agenteId)
    │   ├─→ Negociacion[] (agenteId)
    │   ├─→ Seguimiento[] (agenteId)
    │   ├─→ NotaInterna[] (agenteId)
    │   └─→ ArchivoNegociacion[] (agenteId)
    │
    ├─→ Propiedad
    │   ├─→ Usuario (agente)
    │   ├─→ Imagen[] (propiedadId)
    │   ├─→ Favorito[] (propiedadId)
    │   └─→ Negociacion[] (propiedadId)
    │
    ├─→ Imagen
    │   └─→ Propiedad (propiedadId)
    │
    ├─→ Favorito
    │   ├─→ Usuario (usuarioId)
    │   └─→ Propiedad (propiedadId)
    │
    ├─→ Cliente
    │   ├─→ Usuario (agenteId)
    │   └─→ Negociacion[] (clienteId)
    │
    ├─→ Negociacion
    │   ├─→ Cliente (clienteId)
    │   ├─→ Propiedad (propiedadId)
    │   ├─→ Usuario (agenteId)
    │   ├─→ Seguimiento[] (negociacionId)
    │   ├─→ NotaInterna[] (negociacionId)
    │   └─→ ArchivoNegociacion[] (negociacionId)
    │
    ├─→ Seguimiento
    │   ├─→ Negociacion (negociacionId)
    │   └─→ Usuario (agenteId)
    │
    ├─→ NotaInterna
    │   ├─→ Negociacion (negociacionId)
    │   └─→ Usuario (agenteId)
    │
    └─→ ArchivoNegociacion
        ├─→ Negociacion (negociacionId)
        └─→ Usuario (agenteId)
```

### Servicio Python - Recomendaciones
```
controllers/propiedad.controller.js (obtenerRecomendaciones)
    │
    ├─→ prisma/client.js (obtener favoritos y propiedades)
    │
    └─→ axios → python_service/app.py
        │
        ├─→ recomendaciones_service.py
        │   ├─→ scikit-learn (KNN)
        │   ├─→ numpy/pandas (procesamiento datos)
        │   └─→ respuesta con IDs recomendados
        │
        └─→ Fallback: algoritmo JavaScript en controlador
```

---

## 🎨 Frontend - Conexiones y Flujo de Datos

### Punto de Entrada
```
frontend/src/main.jsx
    └─→ App.jsx
        ├─→ BrowserRouter (react-router-dom)
        └─→ Routes
```

### App.jsx - Rutas Principales
```
App.jsx
    │
    ├─→ Routes (react-router-dom)
    │   │
    │   ├─→ Rutas Públicas
    │   │   ├─→ pages/Home.jsx
    │   │   ├─→ pages/Propiedades.jsx
    │   │   ├─→ pages/DetallePropiedad.jsx
    │   │   ├─→ pages/MisFavoritos.jsx
    │   │   ├─→ pages/Login.jsx
    │   │   └─→ pages/Registro.jsx
    │   │
    │   ├─→ Rutas Admin (RutaPrivada)
    │   │   ├─→ layouts/LayoutAdmin.jsx
    │   │   │   ├─→ components/Sidebar.jsx
    │   │   │   ├─→ components/Navbar.jsx
    │   │   │   └─→ Outlet (páginas admin)
    │   │   │
    │   │   └─→ Páginas Admin
    │   │       ├─→ pages/PanelAdmin.jsx
    │   │       ├─→ pages/PanelPropiedades.jsx
    │   │       ├─→ pages/RegistrarPropiedad.jsx
    │   │       ├─→ pages/EditarPropiedad.jsx
    │   │       ├─→ pages/DetallePropiedadAdmin.jsx
    │   │       ├─→ pages/PanelClientes.jsx
    │   │       ├─→ pages/RegistrarCliente.jsx
    │   │       ├─→ pages/EditarCliente.jsx
    │   │       ├─→ pages/PanelNegociaciones.jsx
    │   │       ├─→ pages/PanelAgentes.jsx
    │   │       ├─→ pages/RegistrarAgente.jsx
    │   │       └─→ pages/EditarAgente.jsx
    │   │
    │   ├─→ Rutas Agente (RutaPrivada)
    │   │   ├─→ layouts/LayoutAgente.jsx
    │   │   │   ├─→ components/Sidebar.jsx
    │   │   │   ├─→ components/Navbar.jsx
    │   │   │   └─→ Outlet (páginas agente)
    │   │   │
    │   │   └─→ Páginas Agente
    │   │       ├─→ pages/PanelAgente.jsx
    │   │       ├─→ pages/PanelPropiedades.jsx
    │   │       ├─→ pages/RegistrarPropiedad.jsx
    │   │       ├─→ pages/EditarPropiedad.jsx
    │   │       ├─→ pages/DetallePropiedadAdmin.jsx
    │   │       ├─→ pages/PanelClientes.jsx
    │   │       ├─→ pages/RegistrarCliente.jsx
    │   │       ├─→ pages/EditarCliente.jsx
    │   │       └─→ pages/PanelNegociaciones.jsx
    │   │
    │   └─→ pages/Pagina404.jsx
    │
    └─→ components/RutaPrivada.jsx
        ├─→ utils/tokenUtils.js (verificar token)
        └─→ react-router-dom (navigate)
```

### Componentes - Conexiones

#### Layouts
```
layouts/LayoutAdmin.jsx
    ├─→ components/Sidebar.jsx
    ├─→ components/Navbar.jsx
    ├─→ components/BotonLogout.jsx
    └─→ Outlet (páginas hijas)

layouts/LayoutAgente.jsx
    ├─→ components/Sidebar.jsx
    ├─→ components/Navbar.jsx
    ├─→ components/BotonLogout.jsx
    └─→ Outlet (páginas hijas)
```

#### Páginas Públicas
```
pages/Home.jsx
    ├─→ components/LayoutPublic.jsx
    │   ├─→ components/NavbarPublica.jsx
    │   └─→ components/Footer.jsx
    ├─→ components/UltimasPropiedadesCarousel.jsx
    └─→ axios → /api/propiedades/ultimas

pages/Propiedades.jsx
    ├─→ components/LayoutPublic.jsx
    ├─→ components/NavbarPublica.jsx
    ├─→ components/FiltrosPropiedades.jsx
    ├─→ components/CardPropiedadPublica.jsx
    └─→ axios → /api/propiedades/publicas

pages/DetallePropiedad.jsx
    ├─→ components/LayoutPublic.jsx
    ├─→ components/NavbarPublica.jsx
    ├─→ components/FavoritoIcon.jsx
    ├─→ components/Recomendaciones.jsx
    ├─→ axios → /api/propiedades/publica/:id
    └─→ axios → /api/favoritos (agregar/eliminar)

pages/MisFavoritos.jsx
    ├─→ components/LayoutPublic.jsx
    ├─→ components/NavbarPublica.jsx
    ├─→ components/CardPropiedadPublica.jsx
    ├─→ components/EstadisticasFavoritos.jsx
    ├─→ axios → /api/favoritos
    └─→ axios → /api/propiedades/publica/:id
```

#### Páginas Admin/Agente - Propiedades
```
pages/PanelPropiedades.jsx
    ├─→ components/CardPropiedad.jsx
    ├─→ components/ModalActualizarEstado.jsx
    ├─→ components/ModalConfirmarEliminar.jsx
    └─→ axios → /api/propiedades

pages/RegistrarPropiedad.jsx
    ├─→ components/SelectTipoPropiedad.jsx
    ├─→ components/SelectProvincia.jsx
    ├─→ config/multer (subida imágenes)
    └─→ axios → /api/propiedades (POST)

pages/EditarPropiedad.jsx
    ├─→ components/SelectTipoPropiedad.jsx
    ├─→ components/SelectProvincia.jsx
    ├─→ axios → /api/propiedades/:id (GET)
    └─→ axios → /api/propiedades/:id (PUT)

pages/DetallePropiedadAdmin.jsx
    ├─→ components/CardPropiedad.jsx
    ├─→ components/ModalActualizarEstado.jsx
    └─→ axios → /api/propiedades/:id
```

#### Páginas Admin/Agente - Clientes
```
pages/PanelClientes.jsx
    ├─→ components/CardCliente.jsx (si existe)
    └─→ axios → /api/clientes

pages/RegistrarCliente.jsx
    ├─→ components/SelectTipoCliente.jsx
    └─→ axios → /api/clientes (POST)

pages/EditarCliente.jsx
    ├─→ components/SelectTipoCliente.jsx
    ├─→ axios → /api/clientes/:id (GET)
    └─→ axios → /api/clientes/:id (PUT)
```

#### Páginas Admin/Agente - Negociaciones
```
pages/PanelNegociaciones.jsx
    ├─→ components/CardNegociacion.jsx
    ├─→ components/CrearNegociacion.jsx
    ├─→ components/ModalActualizarEtapaNegociacion.jsx
    ├─→ axios → /api/negociaciones
    └─→ axios → /api/propiedades/negociaciones/disponibles

components/CrearNegociacion.jsx
    ├─→ components/SelectTipoCliente.jsx
    ├─→ axios → /api/clientes
    ├─→ axios → /api/propiedades/negociaciones/disponibles
    └─→ axios → /api/negociaciones (POST)

components/CardNegociacion.jsx
    ├─→ components/ActualizarEtapaForm.jsx
    ├─→ components/HistorialSeguimientos.jsx
    ├─→ components/NotasInternas.jsx
    ├─→ components/ArchivosAdjuntos.jsx
    └─→ axios → /api/negociaciones/:id

components/HistorialSeguimientos.jsx
    ├─→ axios → /api/seguimientos
    └─→ axios → /api/seguimientos (POST)

components/NotasInternas.jsx
    ├─→ axios → /api/notas-internas
    └─→ axios → /api/notas-internas (POST)

components/ArchivosAdjuntos.jsx
    ├─→ components/ModalArchivosAdjuntos.jsx
    ├─→ config/multer (subida archivos)
    ├─→ axios → /api/archivos-negociacion
    └─→ axios → /api/archivos-negociacion (POST)
```

#### Componentes Compartidos
```
components/CardPropiedad.jsx
    ├─→ react-router-dom (navigate)
    └─→ axios → /api/propiedades/:id/estado (PATCH)

components/CardPropiedadPublica.jsx
    ├─→ components/FavoritoIcon.jsx
    ├─→ react-router-dom (navigate)
    └─→ axios → /api/favoritos

components/FavoritoIcon.jsx
    ├─→ axios → /api/favoritos (POST/DELETE)
    └─→ utils/tokenUtils.js (verificar autenticación)

components/Recomendaciones.jsx
    ├─→ components/CardPropiedadPublica.jsx
    ├─→ axios → /api/propiedades/recomendaciones
    └─→ backend → python_service (KNN)

components/FiltrosPropiedades.jsx
    ├─→ components/SelectTipoPropiedad.jsx
    ├─→ components/SelectProvincia.jsx
    └─→ axios → /api/propiedades/publicas (con query params)

components/UltimasPropiedadesCarousel.jsx
    ├─→ components/CardPropiedadPublica.jsx
    ├─→ swiper (carrusel)
    └─→ axios → /api/propiedades/ultimas
```

#### Autenticación
```
pages/Login.jsx
    ├─→ axios → /api/auth/login
    ├─→ utils/tokenUtils.js (guardar token)
    └─→ react-router-dom (navigate)

pages/Registro.jsx
    ├─→ axios → /api/auth/registro
    └─→ react-router-dom (navigate)

components/RutaPrivada.jsx
    ├─→ utils/tokenUtils.js (verificar token)
    ├─→ jwt-decode (decodificar token)
    └─→ react-router-dom (navigate si no autenticado)
```

### Utilidades - Conexiones
```
utils/tokenUtils.js
    ├─→ localStorage (guardar/obtener token)
    └─→ jwt-decode (decodificar token)

utils/toastConfig.js
    └─→ sonner (configuración de notificaciones)
```

### Librerías - Conexiones
```
lib/utils.js
    └─→ clsx, tailwind-merge (utilidades de clases CSS)
```

---

## 🔄 Flujo Completo de Datos - Ejemplo: Crear Propiedad

```
Usuario (Frontend)
    │
    ↓
pages/RegistrarPropiedad.jsx
    │
    ↓ (Formulario + imágenes)
components/SelectTipoPropiedad.jsx
components/SelectProvincia.jsx
    │
    ↓ (POST con FormData)
axios → /api/propiedades
    │
    ↓
routes/propiedad.routes.js
    │
    ↓ (Middleware)
middlewares/verificarToken.js
    ├─→ jwt.verify()
    └─→ prisma.usuario.findUnique()
    │
    ↓
middlewares/esPropietarioOAdmin.js
    │
    ↓ (Multer)
config/multer.js (procesar imágenes)
    │
    ↓
controllers/propiedad.controller.js (crearPropiedad)
    │
    ↓ (Validaciones)
    │
    ↓ (Crear propiedad)
prisma.propiedad.create()
    │
    ↓ (Crear imágenes)
prisma.imagen.createMany()
    │
    ↓ (Procesar URLs)
config/images.js (procesarImagenes)
    │
    ↓ (Response)
axios response
    │
    ↓
pages/RegistrarPropiedad.jsx
    │
    ↓ (Notificación)
sonner (toast)
    │
    ↓ (Navegación)
react-router-dom (navigate)
```

---

## 🔄 Flujo Completo de Datos - Ejemplo: Recomendaciones

```
Usuario (Frontend)
    │
    ↓
pages/DetallePropiedad.jsx
    │
    ↓
components/Recomendaciones.jsx
    │
    ↓ (GET con token)
axios → /api/propiedades/recomendaciones
    │
    ↓
routes/propiedad.routes.js
    │
    ↓ (Middleware)
middlewares/verificarToken.js
    │
    ↓
controllers/propiedad.controller.js (obtenerRecomendaciones)
    │
    ↓ (Obtener favoritos)
prisma.favorito.findMany()
    │
    ↓ (Obtener propiedades disponibles)
prisma.propiedad.findMany()
    │
    ↓ (Preparar datos)
    │
    ↓ (POST)
axios → python_service/app.py
    │
    ↓
python_service/app.py
    │
    ↓
recomendaciones_service.py
    ├─→ scikit-learn (KNN)
    ├─→ numpy/pandas (procesamiento)
    └─→ respuesta con IDs
    │
    ↓ (Response)
controllers/propiedad.controller.js
    │
    ↓ (Obtener propiedades completas)
prisma.propiedad.findMany() (filtrar por IDs)
    │
    ↓ (Procesar imágenes)
config/images.js
    │
    ↓ (Response JSON)
axios response
    │
    ↓
components/Recomendaciones.jsx
    │
    ↓ (Renderizar)
components/CardPropiedadPublica.jsx
    │
    ↓
Usuario (Frontend)
```

---

## 🔐 Flujo de Autenticación

```
Usuario ingresa credenciales
    │
    ↓
pages/Login.jsx
    │
    ↓ (POST)
axios → /api/auth/login
    │
    ↓
routes/auth.routes.js
    │
    ↓
controllers/auth.controller.js (login)
    │
    ↓ (Validar credenciales)
prisma.usuario.findUnique()
    │
    ↓ (Verificar contraseña)
bcrypt.compare()
    │
    ↓ (Generar token)
jsonwebtoken.sign()
    │
    ↓ (Response con token)
axios response
    │
    ↓
pages/Login.jsx
    │
    ↓ (Guardar token)
utils/tokenUtils.js → localStorage
    │
    ↓ (Navegar)
react-router-dom (navigate)
    │
    ↓
Ruta Protegida
    │
    ↓
components/RutaPrivada.jsx
    │
    ↓ (Verificar token)
utils/tokenUtils.js (obtener token)
    │
    ↓ (Decodificar)
jwt-decode (verificar expiración)
    │
    ↓ (Permitir acceso)
Outlet (renderizar componente)
```

---

## 📊 Resumen de Conexiones Principales

### Backend
- **index.js** → 10 rutas
- **Routes** → 10 controladores
- **Controllers** → Prisma ORM
- **Controllers** → Middlewares (4)
- **Controllers** → Config (2)
- **Propiedad Controller** → Python Service (recomendaciones)

### Frontend
- **App.jsx** → 20 páginas
- **Pages** → 30+ componentes
- **Components** → Axios (API calls)
- **Components** → React Router (navegación)
- **Components** → Utils (token, toast)

### Base de Datos
- **9 modelos** interconectados
- **Usuario** → 7 relaciones
- **Propiedad** → 4 relaciones
- **Negociacion** → 5 relaciones

### Servicios Externos
- **Backend** → Python Service (HTTP)
- **Python Service** → scikit-learn (KNN)
- **Frontend** → Backend API (REST)

---

*Última actualización: 2025*


