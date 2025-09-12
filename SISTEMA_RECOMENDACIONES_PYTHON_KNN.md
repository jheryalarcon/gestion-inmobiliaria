# 🐍 Sistema de Recomendaciones KNN con Python/scikit-learn - Implementación Completa

## 📝 Descripción
Sistema de recomendaciones personalizadas de propiedades implementado con **Python + scikit-learn** usando el algoritmo K-Nearest Neighbors (KNN), que se comunica con el backend Node.js para proporcionar recomendaciones avanzadas basadas en machine learning.

## 🏗️ Arquitectura del Sistema

### Microservicios
```
┌─────────────────┐    HTTP     ┌─────────────────┐
│   Frontend      │ ──────────► │   Node.js API   │
│   (React)       │             │   (Express)     │
└─────────────────┘             └─────────────────┘
                                        │
                                        │ HTTP
                                        ▼
                                ┌─────────────────┐
                                │  Python Service │
                                │ (Flask + KNN)   │
                                └─────────────────┘
```

### Componentes
1. **Frontend React**: Interfaz de usuario
2. **Node.js API**: Autenticación, base de datos, comunicación
3. **Python Service**: Algoritmo KNN con scikit-learn
4. **PostgreSQL**: Base de datos de propiedades

## 🐍 Servicio Python Implementado

### Archivos Creados
- **`recomendaciones_service.py`**: Clase principal con algoritmo KNN
- **`app.py`**: API Flask para comunicación
- **`requirements.txt`**: Dependencias Python
- **`setup.sh` / `setup.bat`**: Scripts de configuración
- **`README.md`**: Documentación del servicio

### Tecnologías Python
- **scikit-learn 1.3.2**: Algoritmo KNN optimizado
- **pandas 2.1.4**: Manipulación de datos
- **numpy 1.24.3**: Cálculos numéricos
- **Flask 3.0.0**: API REST
- **Flask-CORS 4.0.0**: CORS para comunicación

## 🧠 Algoritmo KNN con scikit-learn

### Características del Algoritmo
```python
class RecomendacionesKNN:
    def __init__(self, k: int = 3):
        self.k = k
        self.scaler = StandardScaler()           # Normalización
        self.label_encoders = {}                 # Codificación categórica
        self.knn_model = NearestNeighbors(       # Modelo KNN
            n_neighbors=k,
            metric='euclidean',
            algorithm='auto'
        )
```

### Proceso de Recomendación
1. **Preparación de Datos**:
   - Normalización con `StandardScaler`
   - Codificación categórica con `LabelEncoder`
   - Manejo de valores nulos

2. **Entrenamiento**:
   - Entrenar modelo KNN con propiedades disponibles
   - Configurar métricas de distancia

3. **Predicción**:
   - Para cada favorita, encontrar k vecinos más cercanos
   - Calcular distancias euclidianas
   - Ordenar por similitud

4. **Post-procesamiento**:
   - Eliminar duplicados
   - Ordenar por distancia
   - Limitar resultados

### Características Utilizadas
- **Precio**: Normalizado (0-1)
- **Tipo de propiedad**: Codificado con LabelEncoder
- **Ciudad**: Codificado con LabelEncoder
- **Habitaciones**: Normalizado (0-1)
- **Baños**: Normalizado (0-1)
- **Área construida**: Normalizado (0-1)
- **Área terreno**: Normalizado (0-1)
- **Parqueaderos**: Normalizado (0-1)

## 🔗 Integración Node.js ↔ Python

### Comunicación HTTP
```javascript
// Node.js llama a Python
const response = await axios.post(`${pythonServiceUrl}/recomendaciones`, {
    favoritos: favoritosData,
    propiedades_disponibles: propiedadesDisponiblesData,
    k: k,
    limit: limit
}, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});
```

### Fallback Automático
Si el servicio Python no está disponible, Node.js automáticamente usa el algoritmo JavaScript como fallback:

```javascript
try {
    // Intentar usar Python
    const response = await axios.post(pythonServiceUrl + '/recomendaciones', data);
    return response.data;
} catch (pythonError) {
    // Fallback a JavaScript
    console.log('🔄 Usando algoritmo JavaScript como fallback...');
    return await obtenerRecomendacionesFallback(...);
}
```

## 📊 API Endpoints Python

### 1. Health Check
```http
GET http://localhost:5001/health
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

### 2. Recomendaciones
```http
POST http://localhost:5001/recomendaciones
Content-Type: application/json

{
    "favoritos": [...],
    "propiedades_disponibles": [...],
    "k": 3,
    "limit": 6
}
```

### 3. Similitud
```http
POST http://localhost:5001/similitud
Content-Type: application/json

{
    "propiedad1": {...},
    "propiedad2": {...}
}
```

### 4. Info del Modelo
```http
GET http://localhost:5001/modelo/info
```

## 🚀 Instalación y Configuración

### 1. Configurar Servicio Python
```bash
# Navegar al directorio
cd backend/python_service

# Ejecutar script de configuración
# Linux/macOS:
chmod +x setup.sh && ./setup.sh
# Windows:
setup.bat

# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Ejecutar servicio
python app.py
```

### 2. Configurar Node.js
```bash
# En backend/.env
PYTHON_SERVICE_URL=http://localhost:5001

# Ejecutar backend Node.js
cd backend
npm run dev
```

### 3. Ejecutar Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Testing BDD Actualizado

### Tests Implementados
Los tests BDD ahora verifican:
- ✅ **Comunicación con Python**: Verifica que el servicio esté disponible
- ✅ **Algoritmo scikit-learn**: Confirma uso del algoritmo Python
- ✅ **Fallback JavaScript**: Prueba el fallback si Python falla
- ✅ **Métricas avanzadas**: Verifica métricas del algoritmo

### Ejecutar Tests
```bash
# Desde backend/
node test-recomendaciones-knn.js
```

**Salida esperada:**
```
🚀 INICIANDO TESTS BDD PARA SISTEMA DE RECOMENDACIONES KNN (Python/scikit-learn)
================================================================================

📋 SETUP INICIAL
🐍 Verificando servicio Python...
✅ Servicio Python disponible: Recomendaciones KNN
   - Algoritmo: scikit-learn
   - Versión: 1.0.0

🎉 ¡TODOS LOS TESTS BDD PASARON EXITOSAMENTE!
🐍 Servicio Python: ACTIVO
```

## 📈 Ventajas de la Implementación Python

### vs. Implementación JavaScript Pura
| Característica | JavaScript | Python + scikit-learn |
|----------------|------------|----------------------|
| **Algoritmo** | KNN manual | KNN optimizado |
| **Normalización** | Manual | StandardScaler |
| **Codificación** | Manual | LabelEncoder |
| **Rendimiento** | Básico | Optimizado |
| **Escalabilidad** | Limitada | Alta |
| **Métricas** | Básicas | Detalladas |
| **Mantenimiento** | Simple | Profesional |

### Características Avanzadas
- ✅ **Normalización inteligente**: StandardScaler para mejor distribución
- ✅ **Codificación categórica**: LabelEncoder para variables categóricas
- ✅ **Manejo de valores nulos**: Relleno automático
- ✅ **Valores desconocidos**: Manejo de categorías no vistas
- ✅ **Métricas detalladas**: Información sobre el proceso
- ✅ **Logging profesional**: Registro detallado de operaciones
- ✅ **Error handling robusto**: Manejo de errores avanzado

## 🔧 Configuración de Producción

### Variables de Entorno
```bash
# .env
PYTHON_SERVICE_URL=http://localhost:5001
PYTHON_SERVICE_TIMEOUT=10000
```

### Docker (Opcional)
```dockerfile
# Dockerfile para Python service
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "app.py"]
```

## 📊 Monitoreo y Logs

### Logs del Servicio Python
```
INFO:recomendaciones_service:Modelo KNN entrenado con 150 propiedades
INFO:recomendaciones_service:Recomendaciones generadas: 6
INFO:app:Procesando recomendaciones: 3 favoritos, 150 disponibles
```

### Métricas Disponibles
- Número de propiedades entrenadas
- Tiempo de procesamiento
- Número de recomendaciones generadas
- Estado del modelo (entrenado/no entrenado)
- Configuración del algoritmo

## 🎯 Casos de Uso

### 1. Usuario con Favoritos
- **Entrada**: 3 propiedades favoritas
- **Proceso**: KNN encuentra 3 vecinos más cercanos por favorita
- **Salida**: 6-9 recomendaciones ordenadas por similitud

### 2. Usuario sin Favoritos
- **Entrada**: 0 favoritos
- **Proceso**: Retorna mensaje informativo
- **Salida**: "Guarda algunas favoritas primero"

### 3. Sin Propiedades Disponibles
- **Entrada**: Favoritos pero no hay candidatas
- **Proceso**: Retorna mensaje explicativo
- **Salida**: "No hay más propiedades disponibles"

### 4. Servicio Python No Disponible
- **Entrada**: Cualquier solicitud
- **Proceso**: Fallback automático a JavaScript
- **Salida**: Recomendaciones con algoritmo JavaScript

## 🔮 Mejoras Futuras

### Corto Plazo
1. **Caching**: Cachear modelos entrenados
2. **Batch Processing**: Procesar múltiples usuarios
3. **Métricas avanzadas**: Tiempo de respuesta, precisión

### Mediano Plazo
1. **Algoritmos adicionales**: Random Forest, SVM
2. **Feature Engineering**: Más características
3. **Model Persistence**: Guardar modelos entrenados

### Largo Plazo
1. **Real-time Updates**: Actualización en tiempo real
2. **Deep Learning**: Redes neuronales
3. **Recomendaciones colaborativas**: Filtrado colaborativo

## 🎉 Conclusión

El sistema de recomendaciones KNN con Python/scikit-learn está completamente implementado y proporciona:

- ✅ **Algoritmo profesional** usando scikit-learn
- ✅ **Integración perfecta** con Node.js
- ✅ **Fallback automático** a JavaScript
- ✅ **Tests BDD completos** para todos los escenarios
- ✅ **Documentación exhaustiva** y scripts de configuración
- ✅ **Manejo robusto de errores** y casos edge
- ✅ **Métricas detalladas** del proceso de recomendación

El sistema cumple con todos los requerimientos especificados y proporciona una base sólida para futuras mejoras en machine learning.

