"""
Servicio de Recomendaciones con KNN usando scikit-learn
Implementa algoritmo K-Nearest Neighbors para recomendar propiedades
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import euclidean_distances
import json
import logging
from typing import List, Dict, Any, Tuple

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecomendacionesKNN:
    def __init__(self, k: int = 3):
        """
        Inicializar el sistema de recomendaciones KNN
        
        Args:
            k (int): Número de vecinos más cercanos a considerar
        """
        self.k = k
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.knn_model = None
        self.propiedades_data = None
        self.feature_columns = None
        
    def preparar_datos(self, propiedades: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Preparar y normalizar los datos de propiedades para el algoritmo KNN
        
        Args:
            propiedades: Lista de diccionarios con datos de propiedades
            
        Returns:
            DataFrame con datos normalizados
        """
        if not propiedades:
            return pd.DataFrame()
            
        # Convertir a DataFrame
        df = pd.DataFrame(propiedades)
        
        # Seleccionar y preparar características
        feature_columns = [
            'precio', 'tipo_propiedad', 'ciudad', 'nro_habitaciones', 
            'nro_banos', 'area_construccion', 'area_terreno', 'nro_parqueaderos'
        ]
        
        # Filtrar columnas existentes
        available_columns = [col for col in feature_columns if col in df.columns]
        df_features = df[available_columns].copy()
        
        # Manejar valores nulos
        df_features = df_features.fillna(0)
        
        # Codificar variables categóricas
        categorical_columns = ['tipo_propiedad', 'ciudad']
        for col in categorical_columns:
            if col in df_features.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df_features[col] = self.label_encoders[col].fit_transform(df_features[col].astype(str))
                else:
                    # Para datos nuevos, usar transform existente o manejar valores desconocidos
                    try:
                        df_features[col] = self.label_encoders[col].transform(df_features[col].astype(str))
                    except ValueError:
                        # Manejar valores no vistos antes
                        df_features[col] = 0  # Valor por defecto
        
        # Normalizar características numéricas
        numeric_columns = [col for col in df_features.columns if col not in categorical_columns]
        if numeric_columns:
            df_features[numeric_columns] = self.scaler.fit_transform(df_features[numeric_columns])
        
        # Agregar ID original para referencia
        df_features['id_original'] = df['id'] if 'id' in df.columns else range(len(df))
        
        self.feature_columns = df_features.columns.tolist()
        return df_features
    
    def entrenar_modelo(self, propiedades_disponibles: List[Dict[str, Any]]):
        """
        Entrenar el modelo KNN con las propiedades disponibles
        
        Args:
            propiedades_disponibles: Lista de propiedades disponibles para entrenar
        """
        if not propiedades_disponibles:
            logger.warning("No hay propiedades disponibles para entrenar el modelo")
            return
            
        # Preparar datos
        self.propiedades_data = self.preparar_datos(propiedades_disponibles)
        
        if self.propiedades_data.empty:
            logger.warning("No se pudieron preparar los datos para entrenar")
            return
        
        # Separar características del ID
        feature_data = self.propiedades_data.drop('id_original', axis=1)
        
        # Entrenar modelo KNN
        self.knn_model = NearestNeighbors(
            n_neighbors=min(self.k, len(feature_data)), 
            metric='euclidean',
            algorithm='auto'
        )
        
        self.knn_model.fit(feature_data)
        logger.info(f"Modelo KNN entrenado con {len(feature_data)} propiedades")
    
    def obtener_recomendaciones(
        self, 
        favoritos: List[Dict[str, Any]], 
        limit: int = 6
    ) -> Dict[str, Any]:
        """
        Obtener recomendaciones basadas en propiedades favoritas
        
        Args:
            favoritos: Lista de propiedades favoritas del usuario
            limit: Número máximo de recomendaciones a devolver
            
        Returns:
            Diccionario con recomendaciones y metadatos
        """
        if not favoritos:
            return {
                'recomendaciones': [],
                'mensaje': 'Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero',
                'tieneFavoritos': False,
                'algoritmo': 'KNN (scikit-learn)',
                'k': self.k
            }
        
        if self.knn_model is None or self.propiedades_data is None:
            return {
                'recomendaciones': [],
                'mensaje': 'El modelo no está entrenado. No hay propiedades disponibles.',
                'tieneFavoritos': True,
                'algoritmo': 'KNN (scikit-learn)',
                'k': self.k
            }
        
        # Preparar datos de favoritos
        favoritos_data = self.preparar_datos(favoritos)
        
        if favoritos_data.empty:
            return {
                'recomendaciones': [],
                'mensaje': 'No se pudieron procesar las propiedades favoritas',
                'tieneFavoritos': True,
                'algoritmo': 'KNN (scikit-learn)',
                'k': self.k
            }
        
        # Obtener IDs de favoritos para excluir
        ids_favoritas = set(favoritos_data['id_original'].tolist())
        
        # Filtrar propiedades disponibles (excluir favoritas)
        propiedades_candidatas = self.propiedades_data[
            ~self.propiedades_data['id_original'].isin(ids_favoritas)
        ]
        
        if propiedades_candidatas.empty:
            return {
                'recomendaciones': [],
                'mensaje': 'No hay más propiedades disponibles para recomendarte',
                'tieneFavoritos': True,
                'algoritmo': 'KNN (scikit-learn)',
                'k': self.k
            }
        
        # Encontrar vecinos más cercanos para cada favorita
        recomendaciones_map = {}
        
        for _, favorita in favoritos_data.iterrows():
            # Preparar datos de la favorita (sin ID)
            favorita_features = favorita.drop('id_original').values.reshape(1, -1)
            
            # Encontrar k vecinos más cercanos
            distances, indices = self.knn_model.kneighbors(favorita_features)
            
            # Obtener propiedades recomendadas
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(propiedades_candidatas):
                    prop_candidata = propiedades_candidatas.iloc[idx]
                    prop_id = int(prop_candidata['id_original'])
                    
                    if prop_id not in recomendaciones_map:
                        recomendaciones_map[prop_id] = {
                            'id': prop_id,
                            'distancia': float(dist),
                            'propiedad_referencia': int(favorita['id_original'])
                        }
        
        # Ordenar por distancia y tomar las mejores
        recomendaciones_ordenadas = sorted(
            recomendaciones_map.values(), 
            key=lambda x: x['distancia']
        )[:limit]
        
        # Obtener datos completos de las propiedades recomendadas
        ids_recomendadas = [rec['id'] for rec in recomendaciones_ordenadas]
        propiedades_recomendadas = [
            prop for prop in self.propiedades_data.to_dict('records')
            if prop['id_original'] in ids_recomendadas
        ]
        
        # Ordenar según el orden de recomendaciones
        propiedades_ordenadas = []
        for rec in recomendaciones_ordenadas:
            for prop in propiedades_recomendadas:
                if prop['id_original'] == rec['id']:
                    propiedades_ordenadas.append(prop)
                    break
        
        return {
            'recomendaciones': propiedades_ordenadas,
            'mensaje': f'Encontramos {len(propiedades_ordenadas)} propiedades que te pueden interesar',
            'tieneFavoritos': True,
            'totalFavoritos': len(favoritos),
            'algoritmo': 'KNN (scikit-learn)',
            'k': self.k,
            'metricas': {
                'total_candidatas': len(propiedades_candidatas),
                'recomendaciones_encontradas': len(recomendaciones_ordenadas)
            }
        }
    
    def calcular_similitud_detallada(
        self, 
        propiedad1: Dict[str, Any], 
        propiedad2: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Calcular similitud detallada entre dos propiedades
        
        Args:
            propiedad1: Primera propiedad
            propiedad2: Segunda propiedad
            
        Returns:
            Diccionario con métricas de similitud
        """
        similitudes = {}
        
        # Similitud de precio (normalizada)
        if 'precio' in propiedad1 and 'precio' in propiedad2:
            precio_max = max(propiedad1['precio'], propiedad2['precio'])
            if precio_max > 0:
                similitudes['precio'] = 1 - abs(propiedad1['precio'] - propiedad2['precio']) / precio_max
            else:
                similitudes['precio'] = 1.0
        
        # Similitud de tipo (binaria)
        if 'tipo_propiedad' in propiedad1 and 'tipo_propiedad' in propiedad2:
            similitudes['tipo'] = 1.0 if propiedad1['tipo_propiedad'] == propiedad2['tipo_propiedad'] else 0.0
        
        # Similitud de ciudad (binaria)
        if 'ciudad' in propiedad1 and 'ciudad' in propiedad2:
            similitudes['ciudad'] = 1.0 if propiedad1['ciudad'] == propiedad2['ciudad'] else 0.0
        
        # Similitud de habitaciones
        if 'nro_habitaciones' in propiedad1 and 'nro_habitaciones' in propiedad2:
            hab1 = propiedad1['nro_habitaciones'] or 0
            hab2 = propiedad2['nro_habitaciones'] or 0
            hab_max = max(hab1, hab2, 1)
            similitudes['habitaciones'] = 1 - abs(hab1 - hab2) / hab_max
        
        # Similitud de baños
        if 'nro_banos' in propiedad1 and 'nro_banos' in propiedad2:
            banos1 = propiedad1['nro_banos'] or 0
            banos2 = propiedad2['nro_banos'] or 0
            banos_max = max(banos1, banos2, 1)
            similitudes['banos'] = 1 - abs(banos1 - banos2) / banos_max
        
        return similitudes

# Instancia global del servicio
recomendaciones_service = RecomendacionesKNN(k=3)

def procesar_recomendaciones(
    favoritos: List[Dict[str, Any]], 
    propiedades_disponibles: List[Dict[str, Any]], 
    k: int = 3, 
    limit: int = 6
) -> Dict[str, Any]:
    """
    Función principal para procesar recomendaciones
    
    Args:
        favoritos: Lista de propiedades favoritas
        propiedades_disponibles: Lista de propiedades disponibles
        k: Número de vecinos más cercanos
        limit: Límite de recomendaciones
        
    Returns:
        Diccionario con recomendaciones
    """
    try:
        # Configurar k si es diferente
        if k != recomendaciones_service.k:
            recomendaciones_service.k = k
        
        # Entrenar modelo con propiedades disponibles
        recomendaciones_service.entrenar_modelo(propiedades_disponibles)
        
        # Obtener recomendaciones
        resultado = recomendaciones_service.obtener_recomendaciones(favoritos, limit)
        
        logger.info(f"Recomendaciones generadas: {len(resultado.get('recomendaciones', []))}")
        return resultado
        
    except Exception as e:
        logger.error(f"Error al procesar recomendaciones: {str(e)}")
        return {
            'recomendaciones': [],
            'mensaje': f'Error al generar recomendaciones: {str(e)}',
            'tieneFavoritos': len(favoritos) > 0,
            'algoritmo': 'KNN (scikit-learn)',
            'k': k,
            'error': str(e)
        }

if __name__ == "__main__":
    # Test básico del servicio
    print("🧪 Probando servicio de recomendaciones KNN...")
    
    # Datos de prueba
    propiedades_test = [
        {
            'id': 1,
            'precio': 150000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 3,
            'nro_banos': 2,
            'area_construccion': 120
        },
        {
            'id': 2,
            'precio': 200000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 2,
            'nro_banos': 1,
            'area_construccion': 80
        }
    ]
    
    favoritos_test = [propiedades_test[0]]
    
    resultado = procesar_recomendaciones(favoritos_test, propiedades_test)
    print(f"✅ Resultado: {json.dumps(resultado, indent=2, ensure_ascii=False)}")

