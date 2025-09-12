@echo off
REM Script para configurar el servicio Python de recomendaciones en Windows

echo 🐍 Configurando servicio Python de recomendaciones KNN...

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado. Por favor instala Python 3.8 o superior.
    pause
    exit /b 1
)

REM Verificar si pip está instalado
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip no está instalado. Por favor instala pip.
    pause
    exit /b 1
)

echo ✅ Python encontrado:
python --version
echo ✅ pip encontrado:
pip --version

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔧 Activando entorno virtual...
call venv\Scripts\activate.bat

REM Actualizar pip
echo ⬆️ Actualizando pip...
python -m pip install --upgrade pip

REM Instalar dependencias
echo 📚 Instalando dependencias...
pip install -r requirements.txt

echo ✅ Configuración completada!
echo.
echo 🚀 Para ejecutar el servicio:
echo    venv\Scripts\activate.bat
echo    python app.py
echo.
echo 🔗 El servicio estará disponible en: http://localhost:5001
echo 📊 Endpoints disponibles:
echo    - POST /recomendaciones
echo    - POST /similitud
echo    - GET /modelo/info
echo    - GET /health

pause

