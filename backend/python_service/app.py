
"""
API Flask para el servicio de recomendaciones KNN
Comunica con el backend Node.js para proporcionar recomendaciones
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
from recomendaciones_service import procesar_recomendaciones, recomendaciones_service

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__)
CORS(app)  # Permitir CORS para comunicación con Node.js

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del servicio"""
    return jsonify({
        'status': 'healthy',
        'service': 'Recomendaciones KNN',
        'algorithm': 'scikit-learn',
        'version': '1.0.0'
    })

@app.route('/recomendaciones', methods=['POST'])
def obtener_recomendaciones():
    """
    Endpoint principal para obtener recomendaciones
    
    Body esperado:
    {
        "favoritos": [...],
        "propiedades_disponibles": [...],
        "k": 3,
        "limit": 6
    }
    """
    try:
        # Validar que el request tiene JSON
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type debe ser application/json'
            }), 400
        
        data = request.get_json()
        
        # Validar datos requeridos
        if 'favoritos' not in data:
            return jsonify({
                'error': 'Campo "favoritos" es requerido'
            }), 400
        
        if 'propiedades_disponibles' not in data:
            return jsonify({
                'error': 'Campo "propiedades_disponibles" es requerido'
            }), 400
        
        # Extraer parámetros
        favoritos = data['favoritos']
        propiedades_disponibles = data['propiedades_disponibles']
        k = data.get('k', 3)
        limit = data.get('limit', 6)
        
        # Validar tipos
        if not isinstance(favoritos, list):
            return jsonify({
                'error': 'favoritos debe ser una lista'
            }), 400
        
        if not isinstance(propiedades_disponibles, list):
            return jsonify({
                'error': 'propiedades_disponibles debe ser una lista'
            }), 400
        
        logger.info(f"Procesando recomendaciones: {len(favoritos)} favoritos, {len(propiedades_disponibles)} disponibles")
        
        # Procesar recomendaciones
        resultado = procesar_recomendaciones(
            favoritos=favoritos,
            propiedades_disponibles=propiedades_disponibles,
            k=k,
            limit=limit
        )
        
        logger.info(f"Recomendaciones generadas: {len(resultado.get('recomendaciones', []))}")
        
        return jsonify(resultado)
        
    except Exception as e:
        logger.error(f"Error en endpoint de recomendaciones: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/similitud', methods=['POST'])
def calcular_similitud():
    """
    Endpoint para calcular similitud entre dos propiedades
    
    Body esperado:
    {
        "propiedad1": {...},
        "propiedad2": {...}
    }
    """
    try:
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type debe ser application/json'
            }), 400
        
        data = request.get_json()
        
        if 'propiedad1' not in data or 'propiedad2' not in data:
            return jsonify({
                'error': 'Campos "propiedad1" y "propiedad2" son requeridos'
            }), 400
        
        similitudes = recomendaciones_service.calcular_similitud_detallada(
            data['propiedad1'], 
            data['propiedad2']
        )
        
        return jsonify({
            'similitudes': similitudes,
            'similitud_promedio': sum(similitudes.values()) / len(similitudes) if similitudes else 0
        })
        
    except Exception as e:
        logger.error(f"Error en endpoint de similitud: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.route('/modelo/info', methods=['GET'])
def info_modelo():
    """Obtener información del modelo actual"""
    try:
        info = {
            'k': recomendaciones_service.k,
            'entrenado': recomendaciones_service.knn_model is not None,
            'propiedades_entrenadas': len(recomendaciones_service.propiedades_data) if recomendaciones_service.propiedades_data is not None else 0,
            'algoritmo': 'KNN (scikit-learn)',
            'metricas': {
                'scaler_fitted': hasattr(recomendaciones_service.scaler, 'mean_'),
                'label_encoders': list(recomendaciones_service.label_encoders.keys())
            }
        }
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error al obtener info del modelo: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'mensaje': 'El endpoint solicitado no existe'
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
    logger.info("🚀 Iniciando servicio de recomendaciones KNN...")
    logger.info("📊 Algoritmo: scikit-learn KNN")
    logger.info("🔗 Endpoints disponibles:")
    logger.info("   - POST /recomendaciones")
    logger.info("   - POST /similitud")
    logger.info("   - GET /modelo/info")
    logger.info("   - GET /health")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )

