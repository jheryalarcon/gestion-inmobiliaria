#!/bin/bash

# 🔧 Script de Configuración de Variables de Entorno para Unix/Linux/macOS
# Ejecutar con: chmod +x setup-env.sh && ./setup-env.sh

echo "🔧 Configurando variables de entorno para Backend Inmobiliaria..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar si Node.js está instalado
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js detectado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js no está instalado. Instálalo desde https://nodejs.org/${NC}"
    exit 1
fi

# Verificar si npm está instalado
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm detectado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm no está instalado.${NC}"
    exit 1
fi

# Navegar al directorio del backend
BACKEND_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_PATH"

echo -e "${YELLOW}📁 Directorio de trabajo: $BACKEND_PATH${NC}"

# Verificar si el archivo .env ya existe
ENV_PATH="$BACKEND_PATH/.env"
if [ -f "$ENV_PATH" ]; then
    echo -e "${YELLOW}⚠️  El archivo .env ya existe.${NC}"
    read -p "¿Deseas sobrescribirlo? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Operación cancelada.${NC}"
        exit 0
    fi
    
    # Crear backup
    BACKUP_PATH="$BACKEND_PATH/.env.backup"
    cp "$ENV_PATH" "$BACKUP_PATH"
    echo -e "${GREEN}📁 Backup creado en: $BACKUP_PATH${NC}"
fi

# Generar JWT secret
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

# Crear contenido del archivo .env
ENV_CONTENT="# 🔧 Variables de Entorno para Backend Inmobiliaria
# Generado automáticamente el $(date)

# 🗄️ Base de Datos
# IMPORTANTE: Actualiza con tus credenciales reales
DATABASE_URL=\"postgresql://postgres:password@localhost:5432/inmobiliaria_db\"

# 🔐 Autenticación JWT
# Clave secreta generada automáticamente
JWT_SECRET=\"$JWT_SECRET\"

# 🌐 URLs de Servicios
BACKEND_URL=\"http://localhost:3000\"
PYTHON_SERVICE_URL=\"http://localhost:5001\"

# 🚀 Configuración del Servidor
NODE_ENV=\"development\"
PORT=\"3000\"
"

# Escribir el archivo .env
if echo "$ENV_CONTENT" > "$ENV_PATH"; then
    echo -e "${GREEN}✅ Archivo .env creado exitosamente!${NC}"
    echo -e "${YELLOW}📁 Ubicación: $ENV_PATH${NC}"
else
    echo -e "${RED}❌ Error al crear el archivo .env${NC}"
    exit 1
fi

# Verificar que el archivo se creó correctamente
if [ -f "$ENV_PATH" ]; then
    echo -e "${GREEN}✅ Archivo .env verificado${NC}"
else
    echo -e "${RED}❌ Error: El archivo .env no se creó correctamente${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO${NC}"
echo ""
echo -e "${YELLOW}📋 PASOS SIGUIENTES:${NC}"
echo ""
echo -e "${BLUE}1. 🗄️  CONFIGURAR BASE DE DATOS:${NC}"
echo -e "   - Instalar PostgreSQL"
echo -e "   - Crear base de datos: inmobiliaria_db"
echo -e "   - Actualizar DATABASE_URL en .env"
echo ""
echo -e "${BLUE}2. 🚀 EJECUTAR MIGRACIONES:${NC}"
echo -e "   npx prisma db push"
echo -e "   npx prisma generate"
echo ""
echo -e "${BLUE}3. ▶️  INICIAR BACKEND:${NC}"
echo -e "   npm run dev"
echo ""
echo -e "${BLUE}4. 🧪 PROBAR ENDPOINT:${NC}"
echo -e "   curl http://localhost:3000/api/propiedades/publicas?limit=6"
echo ""
echo -e "${BLUE}📚 DOCUMENTACIÓN:${NC}"
echo -e "   Ver archivo: CONFIGURACION_ENV.md"
echo ""

# Preguntar si desea instalar dependencias
read -p "¿Deseas instalar las dependencias de npm? (y/N): " install_deps
if [[ $install_deps =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    if npm install; then
        echo -e "${GREEN}✅ Dependencias instaladas exitosamente!${NC}"
    else
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Configuración completada!${NC}"
echo -e "${YELLOW}💡 Recuerda configurar tu base de datos PostgreSQL antes de iniciar el servidor.${NC}"
