# 🐍 Servicio de Recomendaciones KNN con Python/scikit-learn

## 📝 Descripción
Servicio Python independiente que implementa el algoritmo K-Nearest Neighbors usando scikit-learn para generar recomendaciones personalizadas de propiedades.

## 🏗️ Arquitectura

### Componentes
- **`recomendaciones_service.py`**: Clase principal con algoritmo KNN
- **`app.py`**: API Flask para comunicación con Node.js
- **`requirements.txt`**: Dependencias Python
- **`setup.sh` / `setup.bat`**: Scripts de configuración

### Tecnologías
- **Python 3.8+**
- **scikit-learn**: Algoritmo KNN
- **pandas**: Manipulación de datos
- **numpy**: Cálculos numéricos
- **Flask**: API REST
- **Flask-CORS**: CORS para comunicación

## 🚀 Instalación y Configuración

### Requisitos Previos
- Python 3.8 o superior
- pip3

### Instalación Automática

#### Linux/macOS:
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows:
```cmd
setup.bat
```

### Instalación Manual
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## 🎯 Uso

### Ejecutar el Servicio
```bash
# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate     # Windows

# Ejecutar servicio
python app.py
```

El servicio estará disponible en: `http://localhost:5001`

## 📊 API Endpoints

### 1. Health Check
```http
GET /health
```
**Respuesta:**
```json
{
    "status": "healthy",
    "service": "Recomendaciones KNN",
    "algorithm": "scikit-learn",
    "version": "1.0.0"
}
```

### 2. Obtener Recomendaciones
```http
POST /recomendaciones
Content-Type: application/json

{
    "favoritos": [
        {
            "id": 1,
            "precio": 150000,
            "tipo_propiedad": "casa",
            "ciudad": "Bogotá",
            "nro_habitaciones": 3,
            "nro_banos": 2,
            "area_construccion": 120
        }
    ],
    "propiedades_disponibles": [...],
    "k": 3,
    "limit": 6
}
```

**Respuesta:**
```json
{
    "recomendaciones": [...],
    "mensaje": "Encontramos 6 propiedades que te pueden interesar",
    "tieneFavoritos": true,
    "totalFavoritos": 1,
    "algoritmo": "KNN (scikit-learn)",
    "k": 3,
    "metricas": {
        "total_candidatas": 50,
        "recomendaciones_encontradas": 6
    }
}
```

### 3. Calcular Similitud
```http
POST /similitud
Content-Type: application/json

{
    "propiedad1": {...},
    "propiedad2": {...}
}
```

### 4. Información del Modelo
```http
GET /modelo/info
```

## 🧠 Algoritmo KNN Implementado

### Características Utilizadas
- **Precio**: Normalizado (0-1)
- **Tipo de propiedad**: Codificado con LabelEncoder
- **Ciudad**: Codificado con LabelEncoder
- **Habitaciones**: Normalizado (0-1)
- **Baños**: Normalizado (0-1)
- **Área construida**: Normalizado (0-1)
- **Área terreno**: Normalizado (0-1)
- **Parqueaderos**: Normalizado (0-1)

### Proceso
1. **Preparación**: Normalización y codificación de datos
2. **Entrenamiento**: Entrenar modelo KNN con propiedades disponibles
3. **Predicción**: Para cada favorita, encontrar k vecinos más cercanos
4. **Deduplicación**: Eliminar propiedades duplicadas
5. **Ordenamiento**: Ordenar por similitud (menor distancia)

### Configuración
- **k**: Número de vecinos más cercanos (default: 3)
- **Métrica**: Distancia euclidiana
- **Algoritmo**: Auto (selección automática)

## 🔧 Integración con Node.js

### Configuración en Node.js
```javascript
// En .env
PYTHON_SERVICE_URL=http://localhost:5001

// En el controlador
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
```

### Fallback
Si el servicio Python no está disponible, Node.js automáticamente usa el algoritmo JavaScript como fallback.

## 📈 Ventajas del Servicio Python

### vs. Implementación JavaScript
- ✅ **Algoritmos optimizados**: scikit-learn está altamente optimizado
- ✅ **Normalización avanzada**: StandardScaler para mejor normalización
- ✅ **Codificación inteligente**: LabelEncoder para variables categóricas
- ✅ **Métricas detalladas**: Información sobre el proceso de recomendación
- ✅ **Escalabilidad**: Mejor rendimiento con datasets grandes
- ✅ **Flexibilidad**: Fácil agregar nuevos algoritmos ML

### Características Avanzadas
- **Manejo de valores nulos**: Relleno automático con 0
- **Valores desconocidos**: Manejo de categorías no vistas
- **Métricas de similitud**: Cálculo detallado de similitudes
- **Logging**: Registro detallado de operaciones
- **Error handling**: Manejo robusto de errores

## 🧪 Testing

### Ejecutar Tests BDD
```bash
# Desde el directorio backend
node test-recomendaciones-knn.js
```

Los tests verifican:
- ✅ Comunicación con servicio Python
- ✅ Generación de recomendaciones
- ✅ Manejo de casos edge
- ✅ Fallback a JavaScript si Python falla

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Puerto 5001 ocupado
```bash
# Cambiar puerto en app.py
app.run(port=5002)
```

#### 2. Dependencias no instaladas
```bash
pip install -r requirements.txt
```

#### 3. Entorno virtual no activado
```bash
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

#### 4. Error de CORS
El servicio ya incluye Flask-CORS configurado.

## 📊 Monitoreo

### Logs
El servicio genera logs detallados:
- Entrenamiento del modelo
- Procesamiento de recomendaciones
- Errores y excepciones

### Métricas
- Número de propiedades entrenadas
- Tiempo de procesamiento
- Número de recomendaciones generadas

## 🔮 Mejoras Futuras

1. **Caching**: Cachear modelos entrenados
2. **Batch Processing**: Procesar múltiples usuarios
3. **Algoritmos adicionales**: Random Forest, SVM
4. **Feature Engineering**: Más características
5. **Model Persistence**: Guardar modelos entrenados
6. **Real-time Updates**: Actualización en tiempo real

## 📝 Notas de Desarrollo

- El servicio es independiente y puede ejecutarse en cualquier servidor
- Compatible con Python 3.8+
- Usa scikit-learn 1.3.2 (versión estable)
- Incluye fallback automático en Node.js
- Logging configurado para producción

