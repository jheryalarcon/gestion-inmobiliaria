# 🔧 Configuración de Variables de Entorno

## 🚨 **PROBLEMA IDENTIFICADO**

**El archivo `.env` no existe en el backend**, lo cual es la causa del error 500.

## 📋 **Variables de Entorno Requeridas**

### **Archivo**: `backend/.env`

```bash
# 🗄️ Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/inmobiliaria_db"

# 🔐 Autenticación JWT
JWT_SECRET="tu_clave_secreta_jwt_muy_segura_aqui_2024"

# 🌐 URLs de Servicios
BACKEND_URL="http://localhost:3000"
PYTHON_SERVICE_URL="http://localhost:5001"

# 🚀 Configuración del Servidor
NODE_ENV="development"
PORT=3000
```

## 🛠️ **Pasos para Solucionar**

### **Paso 1: Crear el archivo .env**

```bash
# Navegar al directorio del backend
cd backend

# Crear el archivo .env
touch .env
# o en Windows:
type nul > .env
```

### **Paso 2: Configurar las variables**

**Copia y pega el siguiente contenido en `backend/.env`:**

```env
# 🗄️ Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/inmobiliaria_db"

# 🔐 Autenticación JWT
JWT_SECRET="mi_clave_secreta_jwt_super_segura_2024_inmobiliaria"

# 🌐 URLs de Servicios
BACKEND_URL="http://localhost:3000"
PYTHON_SERVICE_URL="http://localhost:5001"

# 🚀 Configuración del Servidor
NODE_ENV="development"
PORT=3000
```

### **Paso 3: Configurar la Base de Datos**

#### **Opción A: PostgreSQL Local**
```bash
# Instalar PostgreSQL
# Crear base de datos
createdb inmobiliaria_db

# Actualizar DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/inmobiliaria_db"
```

#### **Opción B: PostgreSQL con Docker**
```bash
# Ejecutar PostgreSQL en Docker
docker run --name postgres-inmobiliaria \
  -e POSTGRES_DB=inmobiliaria_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13

# DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inmobiliaria_db"
```

#### **Opción C: Base de Datos en la Nube**
```bash
# Ejemplo con Supabase, Railway, o similar
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

### **Paso 4: Ejecutar Migraciones**

```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Ejecutar migraciones de Prisma
npx prisma db push

# Generar cliente de Prisma
npx prisma generate
```

### **Paso 5: Verificar la Configuración**

```bash
# Verificar conexión a la base de datos
npx prisma db pull

# Abrir Prisma Studio (opcional)
npx prisma studio
```

### **Paso 6: Iniciar el Backend**

```bash
# Iniciar el servidor
npm run dev

# Debería mostrar:
# Servidor corriendo en http://localhost:3000
```

## 🔍 **Verificación de la Solución**

### **1. Probar el Endpoint**
```bash
# Probar el endpoint que estaba fallando
curl http://localhost:3000/api/propiedades/publicas?limit=6

# Debería devolver un array de propiedades o un array vacío
```

### **2. Verificar en el Navegador**
- Abrir `http://localhost:3000/api/propiedades/publicas?limit=6`
- Debería mostrar JSON con propiedades o array vacío

### **3. Verificar en el Frontend**
- La página de inicio debería cargar sin errores 500
- Si no hay propiedades, mostrará "No hay propiedades disponibles"

## 🚨 **Errores Comunes y Soluciones**

### **Error: "relation does not exist"**
```bash
# Solución: Ejecutar migraciones
npx prisma db push
```

### **Error: "connection refused"**
```bash
# Solución: Verificar que PostgreSQL esté ejecutándose
# En Windows: Servicios > PostgreSQL
# En Linux/Mac: sudo systemctl start postgresql
```

### **Error: "invalid JWT secret"**
```bash
# Solución: Cambiar JWT_SECRET por una clave más segura
JWT_SECRET="nueva_clave_super_segura_2024"
```

### **Error: "ENOENT: no such file or directory"**
```bash
# Solución: Verificar que el archivo .env esté en la ubicación correcta
ls -la backend/.env
```

## 📊 **Variables de Entorno Explicadas**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `clave_super_secreta_2024` |
| `BACKEND_URL` | URL base del backend (para imágenes) | `http://localhost:3000` |
| `PYTHON_SERVICE_URL` | URL del servicio de recomendaciones | `http://localhost:5001` |
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |
| `PORT` | Puerto del servidor | `3000` |

## 🎯 **Resultado Esperado**

Después de configurar el archivo `.env`:

1. ✅ **Backend inicia** sin errores
2. ✅ **Base de datos conectada** correctamente
3. ✅ **Endpoint `/api/propiedades/publicas`** responde
4. ✅ **Frontend carga** sin errores 500
5. ✅ **Autenticación JWT** funciona
6. ✅ **Imágenes se cargan** correctamente

## 🔮 **Próximos Pasos**

1. **Configurar** el archivo `.env`
2. **Verificar** la conexión a la base de datos
3. **Ejecutar** migraciones de Prisma
4. **Iniciar** el backend
5. **Probar** el frontend

## 🛡️ **Seguridad**

- ✅ **Nunca** subir `.env` a Git
- ✅ **Usar** claves JWT seguras y únicas
- ✅ **Proteger** credenciales de base de datos
- ✅ **Usar** diferentes configuraciones para desarrollo/producción
