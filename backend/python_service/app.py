"""
API Flask para el servicio de recomendaciones con LightFM
Comunica con el backend Node.js para proporcionar recomendaciones híbridas
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from recomendaciones_service import procesar_recomendaciones

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del servicio"""
    return jsonify({
        'status': 'healthy',
        'service': 'Recomendaciones SVD',
        'algorithm': 'TruncatedSVD (Basado en Contenido)',
        'version': '2.0.0'
    })


@app.route('/recomendaciones', methods=['POST'])
def obtener_recomendaciones():
    """
    Endpoint principal para obtener recomendaciones.

    Body esperado:
    {
        "usuario_id": 42,
        "interacciones": [{"propiedadId": 10, "peso_total": 6}, ...],
        "propiedades_disponibles": [...],
        "limit": 6
    }
    """
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type debe ser application/json'}), 400

        data = request.get_json()

        # Validar campos requeridos
        for campo in ['usuario_id', 'interacciones', 'propiedades_disponibles']:
            if campo not in data:
                return jsonify({'error': f'Campo "{campo}" es requerido'}), 400

        usuario_id = data['usuario_id']
        interacciones = data['interacciones']
        propiedades_disponibles = data['propiedades_disponibles']
        limit = data.get('limit', 6)

        logger.info(
            f"Petición para usuario {usuario_id}: "
            f"{len(interacciones)} interacciones, "
            f"{len(propiedades_disponibles)} propiedades disponibles"
        )

        resultado = procesar_recomendaciones(
            usuario_id=usuario_id,
            interacciones=interacciones,
            propiedades_disponibles=propiedades_disponibles,
            limit=limit
        )

        logger.info(f"Recomendaciones generadas: {len(resultado.get('recomendaciones', []))}")
        return jsonify(resultado)

    except Exception as e:
        logger.error(f"Error en endpoint /recomendaciones: {str(e)}")
        return jsonify({
            'error': 'Error interno del servidor',
            'mensaje': str(e)
        }), 500


@app.route('/modelo/info', methods=['GET'])
def info_modelo():
    """Información sobre el modelo activo"""
    try:
        from recomendaciones_service import LIGHTFM_DISPONIBLE
        return jsonify({
            'algoritmo': 'SVD (Basado en Contenido)',
            'lightfm_disponible': False,
            'version': '2.0.0',
            'features': [
                'tipo_propiedad', 'transaccion', 'ciudad', 'provincia',
                'rango_precio', 'habitaciones', 'amenidades'
            ],
            'interacciones_soportadas': {
                'VISTA': 1,
                'FAVORITO': 5,
                'CONTACTO': 10
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Método no permitido'}), 405


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Error interno del servidor'}), 500


if __name__ == '__main__':
    logger.info("🚀 Iniciando servicio de recomendaciones SVD...")
    logger.info("📊 Algoritmo: TruncatedSVD (Basado en Contenido y Feedback Implícito)")
    logger.info("🔗 Endpoints disponibles:")
    logger.info("   - POST /recomendaciones")
    logger.info("   - GET  /modelo/info")
    logger.info("   - GET  /health")

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
