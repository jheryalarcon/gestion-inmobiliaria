"""
Servicio de Recomendaciones KNN Mejorado con scikit-learn
Implementa algoritmo K-Nearest Neighbors avanzado con feature engineering mejorado
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler, LabelEncoder, RobustScaler, MinMaxScaler
from sklearn.metrics.pairwise import euclidean_distances, manhattan_distances, cosine_distances
from sklearn.model_selection import cross_val_score
from sklearn.metrics import silhouette_score
import json
import logging
from typing import List, Dict, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecomendacionesKNNMejorado:
    def __init__(self, k: int = 5, metric: str = 'euclidean', scaler_type: str = 'robust'):
        """
        Inicializar el sistema de recomendaciones KNN mejorado
        
        Args:
            k (int): Número de vecinos más cercanos a considerar
            metric (str): Métrica de distancia ('euclidean', 'manhattan', 'cosine')
            scaler_type (str): Tipo de escalador ('robust', 'standard', 'minmax')
        """
        self.k = k
        self.metric = metric
        self.scaler_type = scaler_type
        
        # Configurar escalador según tipo
        if scaler_type == 'robust':
            self.scaler = RobustScaler()  # Mejor para outliers
        elif scaler_type == 'minmax':
            self.scaler = MinMaxScaler()  # Escala 0-1
        else:
            self.scaler = StandardScaler()  # Escala estándar
        
        self.label_encoders = {}
        self.knn_model = None
        self.propiedades_data = None
        self.feature_columns = None
        self.feature_weights = None
        self.optimal_k = None
        
    def crear_caracteristicas_avanzadas(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crear características avanzadas para mejorar las recomendaciones
        
        Args:
            df: DataFrame con datos de propiedades
            
        Returns:
            DataFrame con características adicionales
        """
        df_features = df.copy()
        
        # 1. Características de precio por área
        if 'precio' in df_features.columns and 'area_construccion' in df_features.columns:
            df_features['precio_por_m2'] = df_features['precio'] / (df_features['area_construccion'] + 1)
            df_features['precio_por_m2'] = df_features['precio_por_m2'].fillna(df_features['precio_por_m2'].median())
        
        # 2. Densidad de habitaciones
        if 'nro_habitaciones' in df_features.columns and 'area_construccion' in df_features.columns:
            df_features['densidad_habitaciones'] = df_features['nro_habitaciones'] / (df_features['area_construccion'] + 1)
            df_features['densidad_habitaciones'] = df_features['densidad_habitaciones'].fillna(0)
        
        # 3. Ratio baños/habitaciones
        if 'nro_banos' in df_features.columns and 'nro_habitaciones' in df_features.columns:
            df_features['ratio_banos_habitaciones'] = df_features['nro_banos'] / (df_features['nro_habitaciones'] + 1)
            df_features['ratio_banos_habitaciones'] = df_features['ratio_banos_habitaciones'].fillna(0.5)
        
        # 4. Eficiencia del terreno
        if 'area_construccion' in df_features.columns and 'area_terreno' in df_features.columns:
            df_features['eficiencia_terreno'] = df_features['area_construccion'] / (df_features['area_terreno'] + 1)
            df_features['eficiencia_terreno'] = df_features['eficiencia_terreno'].fillna(0.8)
        
        # 5. Categorización de precio
        if 'precio' in df_features.columns:
            df_features['categoria_precio'] = pd.cut(
                df_features['precio'], 
                bins=5, 
                labels=['muy_bajo', 'bajo', 'medio', 'alto', 'muy_alto']
            )
        
        # 6. Tamaño de propiedad
        if 'area_construccion' in df_features.columns:
            df_features['tamaño_propiedad'] = pd.cut(
                df_features['area_construccion'],
                bins=[0, 50, 100, 150, 200, float('inf')],
                labels=['muy_pequeña', 'pequeña', 'mediana', 'grande', 'muy_grande']
            )
        
        # 7. Comodidades totales
        comodidades_cols = ['nro_habitaciones', 'nro_banos', 'nro_parqueaderos']
        existing_comodidades = [col for col in comodidades_cols if col in df_features.columns]
        if existing_comodidades:
            df_features['comodidades_totales'] = df_features[existing_comodidades].sum(axis=1)
        
        # 8. Score de lujo (basado en múltiples factores)
        lujo_factors = []
        if 'nro_banos' in df_features.columns:
            lujo_factors.append(df_features['nro_banos'] * 0.3)
        if 'nro_parqueaderos' in df_features.columns:
            lujo_factors.append(df_features['nro_parqueaderos'] * 0.2)
        if 'area_construccion' in df_features.columns:
            lujo_factors.append((df_features['area_construccion'] / 100) * 0.5)
        
        if lujo_factors:
            df_features['score_lujo'] = sum(lujo_factors)
            df_features['score_lujo'] = df_features['score_lujo'].fillna(df_features['score_lujo'].median())
        
        return df_features
    
    def preparar_datos_avanzados(self, propiedades: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Preparar y normalizar los datos de propiedades con características avanzadas
        
        Args:
            propiedades: Lista de diccionarios con datos de propiedades
            
        Returns:
            DataFrame con datos normalizados y características avanzadas
        """
        if not propiedades:
            return pd.DataFrame()
            
        # Convertir a DataFrame
        df = pd.DataFrame(propiedades)
        
        # Crear características avanzadas
        df = self.crear_caracteristicas_avanzadas(df)
        
        # Seleccionar características para el modelo
        feature_columns = [
            # Características básicas
            'precio', 'tipo_propiedad', 'ciudad', 'nro_habitaciones', 
            'nro_banos', 'area_construccion', 'area_terreno', 'nro_parqueaderos',
            # Características avanzadas
            'precio_por_m2', 'densidad_habitaciones', 'ratio_banos_habitaciones',
            'eficiencia_terreno', 'comodidades_totales', 'score_lujo'
        ]
        
        # Filtrar columnas existentes
        available_columns = [col for col in feature_columns if col in df.columns]
        df_features = df[available_columns].copy()
        
        # Manejar valores nulos con estrategias específicas
        for col in df_features.columns:
            if df_features[col].dtype in ['object', 'category']:
                df_features[col] = df_features[col].fillna('desconocido')
            else:
                # Para numéricas, usar mediana si hay outliers, media si no
                if col in ['precio', 'area_construccion', 'area_terreno']:
                    df_features[col] = df_features[col].fillna(df_features[col].median())
                else:
                    df_features[col] = df_features[col].fillna(df_features[col].mean())
        
        # Codificar variables categóricas
        categorical_columns = ['tipo_propiedad', 'ciudad', 'categoria_precio', 'tamaño_propiedad']
        for col in categorical_columns:
            if col in df_features.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df_features[col] = self.label_encoders[col].fit_transform(df_features[col].astype(str))
                else:
                    try:
                        df_features[col] = self.label_encoders[col].transform(df_features[col].astype(str))
                    except ValueError:
                        # Manejar valores no vistos antes
                        df_features[col] = 0
        
        # Normalizar características numéricas
        numeric_columns = [col for col in df_features.columns if col not in categorical_columns]
        if numeric_columns:
            df_features[numeric_columns] = self.scaler.fit_transform(df_features[numeric_columns])
        
        # Agregar ID original para referencia
        df_features['id_original'] = df['id'] if 'id' in df.columns else range(len(df))
        
        self.feature_columns = df_features.columns.tolist()
        return df_features
    
    def calcular_pesos_caracteristicas(self, df_features: pd.DataFrame) -> Dict[str, float]:
        """
        Calcular pesos para las características basado en su importancia
        
        Args:
            df_features: DataFrame con características normalizadas
            
        Returns:
            Diccionario con pesos de características
        """
        weights = {}
        
        # Pesos basados en importancia del negocio inmobiliario
        feature_importance = {
            'precio': 0.25,
            'tipo_propiedad': 0.15,
            'ciudad': 0.15,
            'nro_habitaciones': 0.12,
            'nro_banos': 0.10,
            'area_construccion': 0.10,
            'precio_por_m2': 0.08,
            'area_terreno': 0.05,
            'nro_parqueaderos': 0.05,
            'densidad_habitaciones': 0.03,
            'ratio_banos_habitaciones': 0.03,
            'eficiencia_terreno': 0.02,
            'comodidades_totales': 0.02,
            'score_lujo': 0.02,
            'categoria_precio': 0.01,
            'tamaño_propiedad': 0.01
        }
        
        # Aplicar pesos solo a características existentes
        for feature in df_features.columns:
            if feature in feature_importance and feature != 'id_original':
                weights[feature] = feature_importance[feature]
        
        # Normalizar pesos
        total_weight = sum(weights.values())
        if total_weight > 0:
            weights = {k: v/total_weight for k, v in weights.items()}
        
        return weights
    
    def encontrar_k_optimo(self, df_features: pd.DataFrame) -> int:
        """
        Encontrar el valor óptimo de K usando validación cruzada
        
        Args:
            df_features: DataFrame con características
            
        Returns:
            Valor óptimo de K
        """
        if len(df_features) < 10:
            return min(self.k, len(df_features))
        
        # Preparar datos sin ID
        feature_data = df_features.drop('id_original', axis=1)
        
        # Probar diferentes valores de K
        k_values = range(2, min(10, len(feature_data)//2))
        best_k = self.k
        best_score = -1
        
        for k in k_values:
            try:
                # Crear modelo temporal
                temp_model = NearestNeighbors(
                    n_neighbors=k,
                    metric=self.metric,
                    algorithm='auto'
                )
                temp_model.fit(feature_data)
                
                # Calcular silhouette score
                distances, indices = temp_model.kneighbors(feature_data)
                if len(feature_data) > 1:
                    score = silhouette_score(feature_data, indices[:, 1])
                    if score > best_score:
                        best_score = score
                        best_k = k
            except:
                continue
        
        logger.info(f"K óptimo encontrado: {best_k} (score: {best_score:.3f})")
        return best_k
    
    def entrenar_modelo_avanzado(self, propiedades_disponibles: List[Dict[str, Any]]):
        """
        Entrenar el modelo KNN mejorado con las propiedades disponibles
        
        Args:
            propiedades_disponibles: Lista de propiedades disponibles para entrenar
        """
        if not propiedades_disponibles:
            logger.warning("No hay propiedades disponibles para entrenar el modelo")
            return
            
        # Preparar datos con características avanzadas
        self.propiedades_data = self.preparar_datos_avanzados(propiedades_disponibles)
        
        if self.propiedades_data.empty:
            logger.warning("No se pudieron preparar los datos para entrenar")
            return
        
        # Calcular pesos de características
        self.feature_weights = self.calcular_pesos_caracteristicas(self.propiedades_data)
        
        # Encontrar K óptimo
        self.optimal_k = self.encontrar_k_optimo(self.propiedades_data)
        
        # Separar características del ID
        feature_data = self.propiedades_data.drop('id_original', axis=1)
        
        # Aplicar pesos a las características
        weighted_data = feature_data.copy()
        for feature, weight in self.feature_weights.items():
            if feature in weighted_data.columns:
                weighted_data[feature] = weighted_data[feature] * weight
        
        # Entrenar modelo KNN
        self.knn_model = NearestNeighbors(
            n_neighbors=min(self.optimal_k, len(feature_data)), 
            metric=self.metric,
            algorithm='auto'
        )
        
        self.knn_model.fit(weighted_data)
        logger.info(f"Modelo KNN mejorado entrenado con {len(feature_data)} propiedades")
        logger.info(f"K óptimo: {self.optimal_k}, Métrica: {self.metric}, Escalador: {self.scaler_type}")
    
    def obtener_recomendaciones_avanzadas(
        self, 
        favoritos: List[Dict[str, Any]], 
        limit: int = 6
    ) -> Dict[str, Any]:
        """
        Obtener recomendaciones mejoradas basadas en propiedades favoritas
        
        Args:
            favoritos: Lista de propiedades favoritas del usuario
            limit: Número máximo de recomendaciones a devolver
            
        Returns:
            Diccionario con recomendaciones y metadatos avanzados
        """
        if not favoritos:
            return {
                'recomendaciones': [],
                'mensaje': 'Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero',
                'tieneFavoritos': False,
                'algoritmo': 'KNN Mejorado (scikit-learn)',
                'k': self.optimal_k or self.k,
                'metricas': {
                    'metric': self.metric,
                    'scaler': self.scaler_type,
                    'feature_weights': self.feature_weights
                }
            }
        
        if self.knn_model is None or self.propiedades_data is None:
            return {
                'recomendaciones': [],
                'mensaje': 'El modelo no está entrenado. No hay propiedades disponibles.',
                'tieneFavoritos': True,
                'algoritmo': 'KNN Mejorado (scikit-learn)',
                'k': self.optimal_k or self.k
            }
        
        # Preparar datos de favoritos con características avanzadas
        favoritos_data = self.preparar_datos_avanzados(favoritos)
        
        if favoritos_data.empty:
            return {
                'recomendaciones': [],
                'mensaje': 'No se pudieron procesar las propiedades favoritas',
                'tieneFavoritos': True,
                'algoritmo': 'KNN Mejorado (scikit-learn)',
                'k': self.optimal_k or self.k
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
                'algoritmo': 'KNN Mejorado (scikit-learn)',
                'k': self.optimal_k or self.k
            }
        
        # Encontrar vecinos más cercanos para cada favorita
        recomendaciones_map = {}
        similitudes_detalladas = []
        
        for _, favorita in favoritos_data.iterrows():
            # Preparar datos de la favorita (sin ID)
            favorita_features = favorita.drop('id_original')
            
            # Aplicar pesos
            weighted_favorita = favorita_features.copy()
            for feature, weight in self.feature_weights.items():
                if feature in weighted_favorita.index:
                    weighted_favorita[feature] = weighted_favorita[feature] * weight
            
            favorita_values = weighted_favorita.values.reshape(1, -1)
            
            # Encontrar k vecinos más cercanos
            distances, indices = self.knn_model.kneighbors(favorita_values)
            
            # Obtener propiedades recomendadas
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(propiedades_candidatas):
                    prop_candidata = propiedades_candidatas.iloc[idx]
                    prop_id = int(prop_candidata['id_original'])
                    
                    # Calcular similitud detallada
                    similitud_detallada = self.calcular_similitud_avanzada(
                        favorita.drop('id_original'), 
                        prop_candidata.drop('id_original')
                    )
                    
                    if prop_id not in recomendaciones_map:
                        recomendaciones_map[prop_id] = {
                            'id': prop_id,
                            'distancia': float(dist),
                            'similitud': 1 / (1 + dist),  # Convertir distancia a similitud
                            'propiedad_referencia': int(favorita['id_original']),
                            'similitud_detallada': similitud_detallada
                        }
                        similitudes_detalladas.append(similitud_detallada)
        
        # Ordenar por similitud (mayor similitud = mejor recomendación)
        recomendaciones_ordenadas = sorted(
            recomendaciones_map.values(), 
            key=lambda x: x['similitud'],
            reverse=True
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
                    # Agregar información de similitud
                    prop['similitud'] = rec['similitud']
                    prop['similitud_detallada'] = rec['similitud_detallada']
                    propiedades_ordenadas.append(prop)
                    break
        
        return {
            'recomendaciones': propiedades_ordenadas,
            'mensaje': f'Encontramos {len(propiedades_ordenadas)} propiedades que te pueden interesar',
            'tieneFavoritos': True,
            'totalFavoritos': len(favoritos),
            'algoritmo': 'KNN Mejorado (scikit-learn)',
            'k': self.optimal_k or self.k,
            'metricas': {
                'total_candidatas': len(propiedades_candidatas),
                'recomendaciones_encontradas': len(recomendaciones_ordenadas),
                'metric': self.metric,
                'scaler': self.scaler_type,
                'feature_weights': self.feature_weights,
                'similitud_promedio': np.mean([rec['similitud'] for rec in recomendaciones_ordenadas]) if recomendaciones_ordenadas else 0
            }
        }
    
    def calcular_similitud_avanzada(
        self, 
        propiedad1: pd.Series, 
        propiedad2: pd.Series
    ) -> Dict[str, float]:
        """
        Calcular similitud avanzada entre dos propiedades
        
        Args:
            propiedad1: Primera propiedad (Series)
            propiedad2: Segunda propiedad (Series)
            
        Returns:
            Diccionario con métricas de similitud avanzadas
        """
        similitudes = {}
        
        # Similitud de características numéricas
        numeric_features = ['precio', 'nro_habitaciones', 'nro_banos', 'area_construccion', 
                          'area_terreno', 'nro_parqueaderos', 'precio_por_m2', 'score_lujo']
        
        for feature in numeric_features:
            if feature in propiedad1.index and feature in propiedad2.index:
                val1 = propiedad1[feature]
                val2 = propiedad2[feature]
                
                if pd.notna(val1) and pd.notna(val2):
                    # Similitud basada en diferencia relativa
                    max_val = max(abs(val1), abs(val2), 1)
                    similitudes[feature] = 1 - abs(val1 - val2) / max_val
                else:
                    similitudes[feature] = 0.5
        
        # Similitud de características categóricas
        categorical_features = ['tipo_propiedad', 'ciudad', 'categoria_precio', 'tamaño_propiedad']
        for feature in categorical_features:
            if feature in propiedad1.index and feature in propiedad2.index:
                val1 = propiedad1[feature]
                val2 = propiedad2[feature]
                similitudes[feature] = 1.0 if val1 == val2 else 0.0
        
        # Similitud de ratios
        ratio_features = ['densidad_habitaciones', 'ratio_banos_habitaciones', 'eficiencia_terreno']
        for feature in ratio_features:
            if feature in propiedad1.index and feature in propiedad2.index:
                val1 = propiedad1[feature]
                val2 = propiedad2[feature]
                
                if pd.notna(val1) and pd.notna(val2):
                    # Para ratios, usar similitud logarítmica
                    try:
                        log_diff = abs(np.log(val1 + 1) - np.log(val2 + 1))
                        similitudes[feature] = 1 / (1 + log_diff)
                    except:
                        similitudes[feature] = 0.5
                else:
                    similitudes[feature] = 0.5
        
        return similitudes

# Instancia global del servicio mejorado
recomendaciones_service_mejorado = RecomendacionesKNNMejorado(k=5, metric='euclidean', scaler_type='robust')

def procesar_recomendaciones_mejoradas(
    favoritos: List[Dict[str, Any]], 
    propiedades_disponibles: List[Dict[str, Any]], 
    k: int = 5, 
    limit: int = 6,
    metric: str = 'euclidean',
    scaler_type: str = 'robust'
) -> Dict[str, Any]:
    """
    Función principal para procesar recomendaciones mejoradas
    
    Args:
        favoritos: Lista de propiedades favoritas
        propiedades_disponibles: Lista de propiedades disponibles
        k: Número de vecinos más cercanos
        limit: Límite de recomendaciones
        metric: Métrica de distancia
        scaler_type: Tipo de escalador
        
    Returns:
        Diccionario con recomendaciones mejoradas
    """
    try:
        # Configurar parámetros si son diferentes
        if (k != recomendaciones_service_mejorado.k or 
            metric != recomendaciones_service_mejorado.metric or
            scaler_type != recomendaciones_service_mejorado.scaler_type):
            
            recomendaciones_service_mejorado.k = k
            recomendaciones_service_mejorado.metric = metric
            recomendaciones_service_mejorado.scaler_type = scaler_type
            
            # Reconfigurar escalador
            if scaler_type == 'robust':
                recomendaciones_service_mejorado.scaler = RobustScaler()
            elif scaler_type == 'minmax':
                recomendaciones_service_mejorado.scaler = MinMaxScaler()
            else:
                recomendaciones_service_mejorado.scaler = StandardScaler()
        
        # Entrenar modelo con propiedades disponibles
        recomendaciones_service_mejorado.entrenar_modelo_avanzado(propiedades_disponibles)
        
        # Obtener recomendaciones
        resultado = recomendaciones_service_mejorado.obtener_recomendaciones_avanzadas(favoritos, limit)
        
        logger.info(f"Recomendaciones mejoradas generadas: {len(resultado.get('recomendaciones', []))}")
        return resultado
        
    except Exception as e:
        logger.error(f"Error al procesar recomendaciones mejoradas: {str(e)}")
        return {
            'recomendaciones': [],
            'mensaje': f'Error al generar recomendaciones: {str(e)}',
            'tieneFavoritos': len(favoritos) > 0,
            'algoritmo': 'KNN Mejorado (scikit-learn)',
            'k': k,
            'error': str(e)
        }

if __name__ == "__main__":
    # Test del servicio mejorado
    print("🧪 Probando servicio de recomendaciones KNN mejorado...")
    
    # Datos de prueba más completos
    propiedades_test = [
        {
            'id': 1,
            'precio': 150000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 3,
            'nro_banos': 2,
            'area_construccion': 120,
            'area_terreno': 200,
            'nro_parqueaderos': 2
        },
        {
            'id': 2,
            'precio': 200000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 2,
            'nro_banos': 1,
            'area_construccion': 80,
            'area_terreno': 0,
            'nro_parqueaderos': 1
        },
        {
            'id': 3,
            'precio': 180000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 4,
            'nro_banos': 3,
            'area_construccion': 150,
            'area_terreno': 250,
            'nro_parqueaderos': 2
        }
    ]
    
    favoritos_test = [propiedades_test[0]]
    
    resultado = procesar_recomendaciones_mejoradas(favoritos_test, propiedades_test)
    print(f"✅ Resultado mejorado: {json.dumps(resultado, indent=2, ensure_ascii=False)}")
