# 🔧 Script de Configuración de Variables de Entorno para Windows
# Ejecutar en PowerShell como administrador si es necesario

Write-Host "🔧 Configurando variables de entorno para Backend Inmobiliaria..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Instálalo desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm detectado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado." -ForegroundColor Red
    exit 1
}

# Navegar al directorio del backend
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

Write-Host "📁 Directorio de trabajo: $backendPath" -ForegroundColor Yellow

# Verificar si el archivo .env ya existe
$envPath = Join-Path $backendPath ".env"
if (Test-Path $envPath) {
    Write-Host "⚠️  El archivo .env ya existe." -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit 0
    }
    
    # Crear backup
    $backupPath = Join-Path $backendPath ".env.backup"
    Copy-Item $envPath $backupPath
    Write-Host "📁 Backup creado en: $backupPath" -ForegroundColor Green
}

# Generar JWT secret
$jwtSecret = -join ((1..64) | ForEach {Get-Random -InputObject ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'.ToCharArray())})

# Crear contenido del archivo .env
$envContent = @"
# 🔧 Variables de Entorno para Backend Inmobiliaria
# Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# 🗄️ Base de Datos
# IMPORTANTE: Actualiza con tus credenciales reales
DATABASE_URL="postgresql://postgres:password@localhost:5432/inmobiliaria_db"

# 🔐 Autenticación JWT
# Clave secreta generada automáticamente
JWT_SECRET="$jwtSecret"

# 🌐 URLs de Servicios
BACKEND_URL="http://localhost:3000"
PYTHON_SERVICE_URL="http://localhost:5001"

# 🚀 Configuración del Servidor
NODE_ENV="development"
PORT="3000"
"@

# Escribir el archivo .env
try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ Archivo .env creado exitosamente!" -ForegroundColor Green
    Write-Host "📁 Ubicación: $envPath" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error al crear el archivo .env: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar que el archivo se creó correctamente
if (Test-Path $envPath) {
    Write-Host "✅ Archivo .env verificado" -ForegroundColor Green
} else {
    Write-Host "❌ Error: El archivo .env no se creó correctamente" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PASOS SIGUIENTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🗄️  CONFIGURAR BASE DE DATOS:" -ForegroundColor White
Write-Host "   - Instalar PostgreSQL" -ForegroundColor Gray
Write-Host "   - Crear base de datos: inmobiliaria_db" -ForegroundColor Gray
Write-Host "   - Actualizar DATABASE_URL en .env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🚀 EJECUTAR MIGRACIONES:" -ForegroundColor White
Write-Host "   npx prisma db push" -ForegroundColor Gray
Write-Host "   npx prisma generate" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ▶️  INICIAR BACKEND:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🧪 PROBAR ENDPOINT:" -ForegroundColor White
Write-Host "   curl http://localhost:3000/api/propiedades/publicas?limit=6" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor White
Write-Host "   Ver archivo: CONFIGURACION_ENV.md" -ForegroundColor Gray
Write-Host ""

# Preguntar si desea instalar dependencias
$installDeps = Read-Host "¿Deseas instalar las dependencias de npm? (y/N)"
if ($installDeps -eq "y" -or $installDeps -eq "Y") {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dependencias instaladas exitosamente!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al instalar dependencias: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host "💡 Recuerda configurar tu base de datos PostgreSQL antes de iniciar el servidor." -ForegroundColor Yellow
