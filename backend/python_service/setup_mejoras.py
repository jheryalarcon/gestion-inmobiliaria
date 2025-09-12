"""
Script de Configuración para las Mejoras del Algoritmo KNN
Configura e instala todas las mejoras implementadas
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def verificar_python():
    """Verificar versión de Python"""
    print("🐍 Verificando versión de Python...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Se requiere Python 3.8 o superior")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detectado")
    return True

def instalar_dependencias():
    """Instalar dependencias adicionales"""
    print("\n📦 Instalando dependencias adicionales...")
    
    dependencias = [
        "scikit-learn>=1.3.0",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "flask>=3.0.0",
        "flask-cors>=4.0.0"
    ]
    
    for dep in dependencias:
        try:
            print(f"   Instalando {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"   ✅ {dep} instalado correctamente")
        except subprocess.CalledProcessError:
            print(f"   ❌ Error instalando {dep}")
            return False
    
    return True

def verificar_archivos():
    """Verificar que todos los archivos estén presentes"""
    print("\n📁 Verificando archivos de mejora...")
    
    archivos_requeridos = [
        "recomendaciones_service_mejorado.py",
        "sistema_hibrido_recomendaciones.py",
        "evaluacion_recomendaciones.py",
        "app_mejorado.py",
        "test_mejoras_knn.py"
    ]
    
    archivos_faltantes = []
    for archivo in archivos_requeridos:
        if not os.path.exists(archivo):
            archivos_faltantes.append(archivo)
        else:
            print(f"   ✅ {archivo}")
    
    if archivos_faltantes:
        print(f"   ❌ Archivos faltantes: {archivos_faltantes}")
        return False
    
    return True

def crear_configuracion():
    """Crear archivo de configuración"""
    print("\n⚙️  Creando configuración...")
    
    config = {
        "servicios": {
            "original": {
                "puerto": 5001,
                "archivo": "app.py",
                "descripcion": "Servicio KNN original"
            },
            "mejorado": {
                "puerto": 5002,
                "archivo": "app_mejorado.py",
                "descripcion": "Servicio KNN mejorado con múltiples algoritmos"
            }
        },
        "algoritmos": {
            "knn_mejorado": {
                "caracteristicas": 16,
                "escaladores": ["robust", "standard", "minmax"],
                "metricas": ["euclidean", "manhattan", "cosine"],
                "optimizacion_k": True
            },
            "sistema_hibrido": {
                "estrategias": ["KNN", "Clustering", "PCA", "Outlier Detection"],
                "pesos": {
                    "KNN": 0.4,
                    "Clustering": 0.3,
                    "PCA": 0.2,
                    "Outliers": 0.1
                }
            }
        },
        "evaluacion": {
            "metricas": [
                "similitud_promedio",
                "diversidad_general",
                "cobertura_catalogo",
                "novedad_promedio",
                "tiempo_respuesta"
            ],
            "reportes_automaticos": True
        }
    }
    
    with open("config_mejoras.json", "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print("   ✅ config_mejoras.json creado")
    return True

def crear_scripts_ejecucion():
    """Crear scripts de ejecución"""
    print("\n🚀 Creando scripts de ejecución...")
    
    # Script para Windows
    script_windows = """@echo off
echo 🚀 Iniciando servicio de recomendaciones mejorado...
echo.
echo Opciones disponibles:
echo 1. Servicio original (puerto 5001)
echo 2. Servicio mejorado (puerto 5002)
echo 3. Ejecutar pruebas
echo.
set /p opcion="Selecciona una opción (1-3): "

if "%opcion%"=="1" (
    echo Iniciando servicio original...
    python app.py
) else if "%opcion%"=="2" (
    echo Iniciando servicio mejorado...
    python app_mejorado.py
) else if "%opcion%"=="3" (
    echo Ejecutando pruebas...
    python test_mejoras_knn.py
) else (
    echo Opción inválida
)
pause
"""
    
    with open("ejecutar_mejoras.bat", "w", encoding="utf-8") as f:
        f.write(script_windows)
    
    # Script para Linux/macOS
    script_unix = """#!/bin/bash
echo "🚀 Iniciando servicio de recomendaciones mejorado..."
echo ""
echo "Opciones disponibles:"
echo "1. Servicio original (puerto 5001)"
echo "2. Servicio mejorado (puerto 5002)"
echo "3. Ejecutar pruebas"
echo ""
read -p "Selecciona una opción (1-3): " opcion

case $opcion in
    1)
        echo "Iniciando servicio original..."
        python app.py
        ;;
    2)
        echo "Iniciando servicio mejorado..."
        python app_mejorado.py
        ;;
    3)
        echo "Ejecutando pruebas..."
        python test_mejoras_knn.py
        ;;
    *)
        echo "Opción inválida"
        ;;
esac
"""
    
    with open("ejecutar_mejoras.sh", "w", encoding="utf-8") as f:
        f.write(script_unix)
    
    # Hacer ejecutable en Unix
    try:
        os.chmod("ejecutar_mejoras.sh", 0o755)
    except:
        pass
    
    print("   ✅ ejecutar_mejoras.bat creado")
    print("   ✅ ejecutar_mejoras.sh creado")
    return True

def crear_documentacion():
    """Crear documentación de uso"""
    print("\n📚 Creando documentación...")
    
    readme = """# 🚀 Servicio de Recomendaciones KNN Mejorado

## 📋 Descripción
Servicio mejorado de recomendaciones de propiedades que incluye:
- Algoritmo KNN con feature engineering avanzado
- Sistema híbrido con múltiples algoritmos
- Evaluación automática de calidad
- API REST mejorada

## 🛠️ Instalación
```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar configuración
python setup_mejoras.py
```

## 🚀 Uso

### Servicio Original (Puerto 5001)
```bash
python app.py
```

### Servicio Mejorado (Puerto 5002)
```bash
python app_mejorado.py
```

### Ejecutar Pruebas
```bash
python test_mejoras_knn.py
```

## 📊 Endpoints Disponibles

### Servicio Mejorado
- `POST /recomendaciones/mejoradas` - KNN con características avanzadas
- `POST /recomendaciones/hibridas` - Sistema híbrido
- `POST /recomendaciones/comparar` - Comparar algoritmos
- `POST /evaluacion` - Evaluar calidad
- `GET /evaluacion/reporte` - Reporte histórico
- `GET /algoritmos/info` - Información de algoritmos

## 🧪 Pruebas
```bash
# Ejecutar todas las pruebas
python test_mejoras_knn.py

# Probar servicio específico
curl -X POST http://localhost:5002/recomendaciones/mejoradas \\
  -H "Content-Type: application/json" \\
  -d '{"favoritos": [...], "propiedades_disponibles": [...]}'
```

## 📈 Mejoras Implementadas
- ✅ 16+ características avanzadas
- ✅ Múltiples escaladores y métricas
- ✅ Sistema híbrido con 4 estrategias
- ✅ Evaluación automática
- ✅ Optimización de parámetros
- ✅ Manejo robusto de outliers
"""
    
    with open("README_MEJORAS.md", "w", encoding="utf-8") as f:
        f.write(readme)
    
    print("   ✅ README_MEJORAS.md creado")
    return True

def verificar_servicios():
    """Verificar que los servicios funcionen"""
    print("\n🔍 Verificando servicios...")
    
    try:
        # Verificar importaciones
        print("   Verificando importaciones...")
        import recomendaciones_service_mejorado
        import sistema_hibrido_recomendaciones
        import evaluacion_recomendaciones
        print("   ✅ Todas las importaciones funcionan")
        
        # Verificar funciones principales
        print("   Verificando funciones principales...")
        from recomendaciones_service_mejorado import procesar_recomendaciones_mejoradas
        from sistema_hibrido_recomendaciones import procesar_recomendaciones_hibridas
        from evaluacion_recomendaciones import evaluar_recomendaciones
        print("   ✅ Todas las funciones están disponibles")
        
        return True
        
    except ImportError as e:
        print(f"   ❌ Error de importación: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error inesperado: {e}")
        return False

def main():
    """Función principal de configuración"""
    print("🚀 CONFIGURACIÓN DE MEJORAS DEL ALGORITMO KNN")
    print("="*50)
    
    # Verificar Python
    if not verificar_python():
        return False
    
    # Instalar dependencias
    if not instalar_dependencias():
        return False
    
    # Verificar archivos
    if not verificar_archivos():
        return False
    
    # Crear configuración
    if not crear_configuracion():
        return False
    
    # Crear scripts
    if not crear_scripts_ejecucion():
        return False
    
    # Crear documentación
    if not crear_documentacion():
        return False
    
    # Verificar servicios
    if not verificar_servicios():
        return False
    
    print("\n🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE")
    print("="*50)
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. Ejecutar 'python test_mejoras_knn.py' para probar las mejoras")
    print("2. Ejecutar 'python app_mejorado.py' para iniciar el servicio mejorado")
    print("3. Usar 'ejecutar_mejoras.bat' (Windows) o 'ejecutar_mejoras.sh' (Linux/macOS)")
    print("4. Consultar 'README_MEJORAS.md' para documentación completa")
    print("\n🔗 ENDPOINTS DISPONIBLES:")
    print("   - http://localhost:5002/recomendaciones/mejoradas")
    print("   - http://localhost:5002/recomendaciones/hibridas")
    print("   - http://localhost:5002/recomendaciones/comparar")
    print("   - http://localhost:5002/evaluacion")
    print("   - http://localhost:5002/algoritmos/info")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ CONFIGURACIÓN FALLÓ")
        sys.exit(1)
    else:
        print("\n✅ CONFIGURACIÓN EXITOSA")
        sys.exit(0)
