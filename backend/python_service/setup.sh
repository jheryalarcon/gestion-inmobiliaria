#!/bin/bash

# Script para configurar el servicio Python de recomendaciones

echo "🐍 Configurando servicio Python de recomendaciones KNN..."

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
fi

# Verificar si pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 no está instalado. Por favor instala pip3."
    exit 1
fi

echo "✅ Python 3 encontrado: $(python3 --version)"
echo "✅ pip3 encontrado: $(pip3 --version)"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "⬆️ Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install -r requirements.txt

echo "✅ Configuración completada!"
echo ""
echo "🚀 Para ejecutar el servicio:"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "🔗 El servicio estará disponible en: http://localhost:5001"
echo "📊 Endpoints disponibles:"
echo "   - POST /recomendaciones"
echo "   - POST /similitud"
echo "   - GET /modelo/info"
echo "   - GET /health"

