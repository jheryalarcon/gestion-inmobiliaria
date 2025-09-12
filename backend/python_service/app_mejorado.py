"""
API Flask Mejorada para el servicio de recomendaciones KNN
Integra múltiples algoritmos y sistemas de evaluación
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
from typing import List, Dict, Any
import time

# Importar servicios mejorados
from recomendaciones_service_mejorado import procesar_recomendaciones_mejoradas
from sistema_hibrido_recomendaciones import procesar_recomendaciones_hibridas
from evaluacion_recomendaciones import evaluar_recomendaciones, obtener_reporte_evaluacion

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__)
CORS(app)  # Permitir CORS para comunicación con Node.js

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del servicio mejorado"""
    return jsonify({
        'status': 'healthy',
        'service': 'Recomendaciones KNN Mejorado',
        'algorithms': ['KNN Mejorado', 'Sistema Híbrido', 'Evaluación'],
        'version': '2.0.0',
        'features': [
            'Feature Engineering Avanzado',
            'Múltiples Métricas de Distancia',
            'Sistema Híbrido',
            'Evaluación Automática',
            'Pesos de Características',
            'Detección de Outliers'
        ]
    })

@app.route('/recomendaciones/mejoradas', methods=['POST'])
def obtener_recomendaciones_mejoradas():
    """
    Endpoint para obtener recomendaciones con algoritmo KNN mejorado
    
    Body esperado:
    {
        "favoritos": [...],
        "propiedades_disponibles": [...],
        "k": 5,
        "limit": 6,
        "metric": "euclidean",
        "scaler_type": "robust"
    }
    """
    try:
        start_time = time.time()
        
        # Validar request
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type debe ser application/json'
            }), 400
        
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['favoritos', 'propiedades_disponibles']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Campo "{field}" es requerido'
                }), 400
        
        # Extraer parámetros
        favoritos = data['favoritos']
        propiedades_disponibles = data['propiedades_disponibles']
        k = data.get('k', 5)
        limit = data.get('limit', 6)
        metric = data.get('metric', 'euclidean')
        scaler_type = data.get('scaler_type', 'robust')
        
        # Validar tipos
        if not isinstance(favoritos, list) or not isinstance(propiedades_disponibles, list):
            return jsonify({
                'error': 'favoritos y propiedades_disponibles deben ser listas'
            }), 400
        
        logger.info(f"Procesando recomendaciones mejoradas: {len(favoritos)} favoritos, {len(propiedades_disponibles)} disponibles")
        
        # Procesar recomendaciones mejoradas
        resultado = procesar_recomendaciones_mejoradas(
            favoritos=favoritos,
            propiedades_disponibles=propiedades_disponibles,
            k=k,
            limit=limit,
            metric=metric,
            scaler_type=scaler_type
        )
        
        # Agregar métricas de tiempo
        tiempo_procesamiento = time.time() - start_time
        resultado['metricas']['tiempo_procesamiento'] = tiempo_procesamiento
        
        logger.info(f"Recomendaciones mejoradas generadas: {len(resultado.get('recomendaciones', []))} en {tiempo_procesamiento:.3f}s")
        
        return jsonify(resultado)
        
    except Exception as e:
        logger.error(f"Error en endpoint de recomendaciones mejoradas: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/recomendaciones/hibridas', methods=['POST'])
def obtener_recomendaciones_hibridas():
    """
    Endpoint para obtener recomendaciones con sistema híbrido
    
    Body esperado:
    {
        "favoritos": [...],
        "propiedades_disponibles": [...],
        "k": 5,
        "limit": 6
    }
    """
    try:
        start_time = time.time()
        
        # Validar request
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type debe ser application/json'
            }), 400
        
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['favoritos', 'propiedades_disponibles']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Campo "{field}" es requerido'
                }), 400
        
        # Extraer parámetros
        favoritos = data['favoritos']
        propiedades_disponibles = data['propiedades_disponibles']
        k = data.get('k', 5)
        limit = data.get('limit', 6)
        
        # Validar tipos
        if not isinstance(favoritos, list) or not isinstance(propiedades_disponibles, list):
            return jsonify({
                'error': 'favoritos y propiedades_disponibles deben ser listas'
            }), 400
        
        logger.info(f"Procesando recomendaciones híbridas: {len(favoritos)} favoritos, {len(propiedades_disponibles)} disponibles")
        
        # Procesar recomendaciones híbridas
        resultado = procesar_recomendaciones_hibridas(
            favoritos=favoritos,
            propiedades_disponibles=propiedades_disponibles,
            k=k,
            limit=limit
        )
        
        # Agregar métricas de tiempo
        tiempo_procesamiento = time.time() - start_time
        resultado['metricas']['tiempo_procesamiento'] = tiempo_procesamiento
        
        logger.info(f"Recomendaciones híbridas generadas: {len(resultado.get('recomendaciones', []))} en {tiempo_procesamiento:.3f}s")
        
        return jsonify(resultado)
        
    except Exception as e:
        logger.error(f"Error en endpoint de recomendaciones híbridas: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/recomendaciones/comparar', methods=['POST'])
def comparar_algoritmos():
    """
    Endpoint para comparar diferentes algoritmos de recomendación
    
    Body esperado:
    {
        "favoritos": [...],
        "propiedades_disponibles": [...],
        "k": 5,
        "limit": 6
    }
    """
    try:
        start_time = time.time()
        
        # Validar request
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type debe ser application/json'
            }), 400
        
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['favoritos', 'propiedades_disponibles']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Campo "{field}" es requerido'
                }), 400
        
        # Extraer parámetros
        favoritos = data['favoritos']
        propiedades_disponibles = data['propiedades_disponibles']
        k = data.get('k', 5)
        limit = data.get('limit', 6)
        
        logger.info(f"Comparando algoritmos: {len(favoritos)} favoritos, {len(propiedades_disponibles)} disponibles")
        
        # Ejecutar ambos algoritmos
        resultado_mejorado = procesar_recomendaciones_mejoradas(
            favoritos=favoritos,
            propiedades_disponibles=propiedades_disponibles,
            k=k,
            limit=limit
        )
        
        resultado_hibrido = procesar_recomendaciones_hibridas(
            favoritos=favoritos,
            propiedades_disponibles=propiedades_disponibles,
            k=k,
            limit=limit
        )
        
        # Evaluar ambos resultados
        evaluacion_mejorado = evaluar_recomendaciones(
            resultado_mejorado.get('recomendaciones', []),
            favoritos,
            propiedades_disponibles
        )
        
        evaluacion_hibrido = evaluar_recomendaciones(
            resultado_hibrido.get('recomendaciones', []),
            favoritos,
            propiedades_disponibles
        )
        
        # Tiempo total
        tiempo_total = time.time() - start_time
        
        # Resultado de comparación
        comparacion = {
            'algoritmo_mejorado': {
                'resultado': resultado_mejorado,
                'evaluacion': evaluacion_mejorado
            },
            'algoritmo_hibrido': {
                'resultado': resultado_hibrido,
                'evaluacion': evaluacion_hibrido
            },
            'comparacion': {
                'tiempo_total': tiempo_total,
                'mejor_similitud': 'mejorado' if evaluacion_mejorado['similitud_promedio'] > evaluacion_hibrido['similitud_promedio'] else 'hibrido',
                'mejor_diversidad': 'mejorado' if evaluacion_mejorado['diversidad_general'] > evaluacion_hibrido['diversidad_general'] else 'hibrido',
                'mejor_novedad': 'mejorado' if evaluacion_mejorado['novedad_promedio'] > evaluacion_hibrido['novedad_promedio'] else 'hibrido'
            }
        }
        
        logger.info(f"Comparación completada en {tiempo_total:.3f}s")
        
        return jsonify(comparacion)
        
    except Exception as e:
        logger.error(f"Error en endpoint de comparación: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/evaluacion', methods=['POST'])
def evaluar_recomendaciones_endpoint():
    """
    Endpoint para evaluar la calidad de recomendaciones
    
    Body esperado:
    {
        "recomendaciones": [...],
        "favoritos": [...],
        "propiedades_disponibles": [...]
    }
    """
    try:
        # Validar request
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type debe ser application/json'
            }), 400
        
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['recomendaciones', 'favoritos', 'propiedades_disponibles']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Campo "{field}" es requerido'
                }), 400
        
        # Evaluar recomendaciones
        evaluacion = evaluar_recomendaciones(
            data['recomendaciones'],
            data['favoritos'],
            data['propiedades_disponibles']
        )
        
        logger.info(f"Evaluación completada: similitud={evaluacion['similitud_promedio']:.3f}, diversidad={evaluacion['diversidad_general']:.3f}")
        
        return jsonify(evaluacion)
        
    except Exception as e:
        logger.error(f"Error en endpoint de evaluación: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/evaluacion/reporte', methods=['GET'])
def obtener_reporte_evaluacion_endpoint():
    """Endpoint para obtener reporte de evaluación del sistema"""
    try:
        reporte = obtener_reporte_evaluacion()
        return jsonify(reporte)
        
    except Exception as e:
        logger.error(f"Error al obtener reporte de evaluación: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/algoritmos/info', methods=['GET'])
def info_algoritmos():
    """Obtener información de todos los algoritmos disponibles"""
    try:
        info = {
            'algoritmos_disponibles': [
                {
                    'nombre': 'KNN Mejorado',
                    'descripcion': 'Algoritmo KNN con feature engineering avanzado',
                    'caracteristicas': [
                        'Características avanzadas (precio_por_m2, score_lujo, etc.)',
                        'Múltiples escaladores (RobustScaler, StandardScaler, MinMaxScaler)',
                        'Pesos de características basados en importancia del negocio',
                        'Optimización automática del parámetro K',
                        'Manejo robusto de outliers'
                    ],
                    'endpoint': '/recomendaciones/mejoradas',
                    'parametros': {
                        'k': 'Número de vecinos (default: 5)',
                        'metric': 'Métrica de distancia (euclidean, manhattan, cosine)',
                        'scaler_type': 'Tipo de escalador (robust, standard, minmax)'
                    }
                },
                {
                    'nombre': 'Sistema Híbrido',
                    'descripcion': 'Combina KNN, Clustering, PCA y detección de outliers',
                    'caracteristicas': [
                        'Múltiples estrategias de recomendación',
                        'Clustering con K-Means',
                        'Reducción de dimensionalidad con PCA',
                        'Detección de outliers con Isolation Forest',
                        'Scoring híbrido combinado'
                    ],
                    'endpoint': '/recomendaciones/hibridas',
                    'parametros': {
                        'k': 'Número de vecinos (default: 5)',
                        'limit': 'Límite de recomendaciones (default: 6)'
                    }
                }
            ],
            'sistema_evaluacion': {
                'descripcion': 'Sistema de evaluación automática de recomendaciones',
                'metricas': [
                    'Similitud promedio, máxima y mínima',
                    'Diversidad de tipos, ciudades y precios',
                    'Cobertura del catálogo',
                    'Novedad de las recomendaciones',
                    'Tiempo de respuesta y eficiencia'
                ],
                'endpoints': [
                    '/evaluacion - Evaluar recomendaciones específicas',
                    '/evaluacion/reporte - Reporte histórico del sistema'
                ]
            },
            'comparacion': {
                'descripcion': 'Compara múltiples algoritmos simultáneamente',
                'endpoint': '/recomendaciones/comparar',
                'salida': 'Resultados y evaluación de ambos algoritmos'
            }
        }
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error al obtener info de algoritmos: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'mensaje': 'El endpoint solicitado no existe',
        'endpoints_disponibles': [
            '/health',
            '/recomendaciones/mejoradas',
            '/recomendaciones/hibridas',
            '/recomendaciones/comparar',
            '/evaluacion',
            '/evaluacion/reporte',
            '/algoritmos/info'
        ]
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'error': 'Método no permitido',
        'mensaje': 'El método HTTP no está permitido para este endpoint'
    }), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Error interno del servidor',
        'mensaje': 'Ha ocurrido un error inesperado'
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Iniciando servicio de recomendaciones KNN mejorado...")
    logger.info("📊 Algoritmos disponibles:")
    logger.info("   - KNN Mejorado con Feature Engineering")
    logger.info("   - Sistema Híbrido (KNN + Clustering + PCA)")
    logger.info("   - Sistema de Evaluación Automática")
    logger.info("🔗 Endpoints disponibles:")
    logger.info("   - POST /recomendaciones/mejoradas")
    logger.info("   - POST /recomendaciones/hibridas")
    logger.info("   - POST /recomendaciones/comparar")
    logger.info("   - POST /evaluacion")
    logger.info("   - GET /evaluacion/reporte")
    logger.info("   - GET /algoritmos/info")
    logger.info("   - GET /health")
    
    app.run(
        host='0.0.0.0',
        port=5002,  # Puerto diferente para evitar conflictos
        debug=True,
        threaded=True
    )
