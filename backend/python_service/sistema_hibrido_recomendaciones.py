"""
Sistema Híbrido de Recomendaciones
Combina múltiples algoritmos y estrategias para obtener las mejores recomendaciones
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler, LabelEncoder, RobustScaler
from sklearn.metrics.pairwise import euclidean_distances, manhattan_distances, cosine_distances
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
import json
import logging
from typing import List, Dict, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SistemaHibridoRecomendaciones:
    def __init__(self, k: int = 5):
        """
        Inicializar el sistema híbrido de recomendaciones
        
        Args:
            k (int): Número de vecinos más cercanos a considerar
        """
        self.k = k
        self.scaler = RobustScaler()
        self.label_encoders = {}
        self.knn_model = None
        self.kmeans_model = None
        self.pca_model = None
        self.outlier_detector = None
        self.propiedades_data = None
        self.feature_columns = None
        self.clusters = None
        
    def crear_caracteristicas_hibridas(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crear características híbridas combinando múltiples enfoques
        
        Args:
            df: DataFrame con datos de propiedades
            
        Returns:
            DataFrame con características híbridas
        """
        df_features = df.copy()
        
        # 1. Características de valor
        if 'precio' in df_features.columns and 'area_construccion' in df_features.columns:
            df_features['precio_por_m2'] = df_features['precio'] / (df_features['area_construccion'] + 1)
            df_features['valor_por_habitacion'] = df_features['precio'] / (df_features['nro_habitaciones'] + 1)
            df_features['valor_por_bano'] = df_features['precio'] / (df_features['nro_banos'] + 1)
        
        # 2. Características de comodidad
        if 'nro_habitaciones' in df_features.columns and 'nro_banos' in df_features.columns:
            df_features['ratio_banos_habitaciones'] = df_features['nro_banos'] / (df_features['nro_habitaciones'] + 1)
            df_features['comodidad_total'] = df_features['nro_habitaciones'] + df_features['nro_banos'] + df_features.get('nro_parqueaderos', 0)
        
        # 3. Características de eficiencia
        if 'area_construccion' in df_features.columns and 'area_terreno' in df_features.columns:
            df_features['eficiencia_construccion'] = df_features['area_construccion'] / (df_features['area_terreno'] + 1)
            df_features['densidad_habitaciones'] = df_features['nro_habitaciones'] / (df_features['area_construccion'] + 1)
        
        # 4. Características de lujo
        lujo_factors = []
        if 'nro_banos' in df_features.columns:
            lujo_factors.append(df_features['nro_banos'] * 0.3)
        if 'nro_parqueaderos' in df_features.columns:
            lujo_factors.append(df_features['nro_parqueaderos'] * 0.2)
        if 'area_construccion' in df_features.columns:
            lujo_factors.append((df_features['area_construccion'] / 100) * 0.5)
        
        if lujo_factors:
            df_features['score_lujo'] = sum(lujo_factors)
        
        # 5. Características de ubicación (simuladas)
        if 'ciudad' in df_features.columns:
            # Simular scores de ubicación basados en la ciudad
            ciudad_scores = {
                'Bogotá': 0.9,
                'Medellín': 0.8,
                'Cali': 0.7,
                'Barranquilla': 0.6,
                'Cartagena': 0.8
            }
            df_features['score_ubicacion'] = df_features['ciudad'].map(ciudad_scores).fillna(0.5)
        
        # 6. Características de tipo de propiedad
        if 'tipo_propiedad' in df_features.columns:
            tipo_scores = {
                'casa': 0.8,
                'apartamento': 0.7,
                'penthouse': 0.9,
                'estudio': 0.5,
                'duplex': 0.8
            }
            df_features['score_tipo'] = df_features['tipo_propiedad'].map(tipo_scores).fillna(0.6)
        
        # 7. Características de tamaño relativo
        if 'area_construccion' in df_features.columns:
            df_features['tamaño_relativo'] = pd.cut(
                df_features['area_construccion'],
                bins=[0, 50, 100, 150, 200, float('inf')],
                labels=[0.2, 0.4, 0.6, 0.8, 1.0]
            ).astype(float)
        
        # 8. Características de precio relativo
        if 'precio' in df_features.columns:
            df_features['precio_relativo'] = pd.cut(
                df_features['precio'],
                bins=[0, 100000, 200000, 300000, 500000, float('inf')],
                labels=[0.2, 0.4, 0.6, 0.8, 1.0]
            ).astype(float)
        
        return df_features
    
    def preparar_datos_hibridos(self, propiedades: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Preparar datos con características híbridas
        
        Args:
            propiedades: Lista de diccionarios con datos de propiedades
            
        Returns:
            DataFrame con datos híbridos normalizados
        """
        if not propiedades:
            return pd.DataFrame()
            
        # Convertir a DataFrame
        df = pd.DataFrame(propiedades)
        
        # Crear características híbridas
        df = self.crear_caracteristicas_hibridas(df)
        
        # Seleccionar características para el modelo
        feature_columns = [
            # Características básicas
            'precio', 'tipo_propiedad', 'ciudad', 'nro_habitaciones', 
            'nro_banos', 'area_construccion', 'area_terreno', 'nro_parqueaderos',
            # Características híbridas
            'precio_por_m2', 'valor_por_habitacion', 'valor_por_bano',
            'ratio_banos_habitaciones', 'comodidad_total', 'eficiencia_construccion',
            'densidad_habitaciones', 'score_lujo', 'score_ubicacion', 'score_tipo',
            'tamaño_relativo', 'precio_relativo'
        ]
        
        # Filtrar columnas existentes
        available_columns = [col for col in feature_columns if col in df.columns]
        df_features = df[available_columns].copy()
        
        # Manejar valores nulos
        for col in df_features.columns:
            if df_features[col].dtype in ['object', 'category']:
                df_features[col] = df_features[col].fillna('desconocido')
            else:
                df_features[col] = df_features[col].fillna(df_features[col].median())
        
        # Codificar variables categóricas
        categorical_columns = ['tipo_propiedad', 'ciudad']
        for col in categorical_columns:
            if col in df_features.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df_features[col] = self.label_encoders[col].fit_transform(df_features[col].astype(str))
                else:
                    try:
                        df_features[col] = self.label_encoders[col].transform(df_features[col].astype(str))
                    except ValueError:
                        df_features[col] = 0
        
        # Normalizar características numéricas
        numeric_columns = [col for col in df_features.columns if col not in categorical_columns]
        if numeric_columns:
            df_features[numeric_columns] = self.scaler.fit_transform(df_features[numeric_columns])
        
        # Agregar ID original
        df_features['id_original'] = df['id'] if 'id' in df.columns else range(len(df))
        
        self.feature_columns = df_features.columns.tolist()
        return df_features
    
    def entrenar_modelos_hibridos(self, propiedades_disponibles: List[Dict[str, Any]]):
        """
        Entrenar múltiples modelos para el sistema híbrido
        
        Args:
            propiedades_disponibles: Lista de propiedades disponibles
        """
        if not propiedades_disponibles:
            logger.warning("No hay propiedades disponibles para entrenar")
            return
            
        # Preparar datos
        self.propiedades_data = self.preparar_datos_hibridos(propiedades_disponibles)
        
        if self.propiedades_data.empty:
            logger.warning("No se pudieron preparar los datos")
            return
        
        # Separar características del ID
        feature_data = self.propiedades_data.drop('id_original', axis=1)
        
        # 1. Entrenar modelo KNN
        self.knn_model = NearestNeighbors(
            n_neighbors=min(self.k, len(feature_data)), 
            metric='euclidean',
            algorithm='auto'
        )
        self.knn_model.fit(feature_data)
        
        # 2. Entrenar modelo K-Means para clustering
        n_clusters = min(5, len(feature_data) // 3)
        if n_clusters >= 2:
            self.kmeans_model = KMeans(n_clusters=n_clusters, random_state=42)
            self.clusters = self.kmeans_model.fit_predict(feature_data)
        
        # 3. Entrenar PCA para reducción de dimensionalidad
        if len(feature_data.columns) > 5:
            self.pca_model = PCA(n_components=min(5, len(feature_data.columns)))
            self.pca_model.fit(feature_data)
        
        # 4. Entrenar detector de outliers
        self.outlier_detector = IsolationForest(contamination=0.1, random_state=42)
        self.outlier_detector.fit(feature_data)
        
        logger.info(f"Modelos híbridos entrenados con {len(feature_data)} propiedades")
        logger.info(f"Clusters: {n_clusters}, PCA components: {min(5, len(feature_data.columns))}")
    
    def obtener_recomendaciones_hibridas(
        self, 
        favoritos: List[Dict[str, Any]], 
        limit: int = 6
    ) -> Dict[str, Any]:
        """
        Obtener recomendaciones usando sistema híbrido
        
        Args:
            favoritos: Lista de propiedades favoritas
            limit: Número máximo de recomendaciones
            
        Returns:
            Diccionario con recomendaciones híbridas
        """
        if not favoritos:
            return {
                'recomendaciones': [],
                'mensaje': 'Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero',
                'tieneFavoritos': False,
                'algoritmo': 'Sistema Híbrido (KNN + Clustering + PCA)',
                'k': self.k
            }
        
        if self.knn_model is None or self.propiedades_data is None:
            return {
                'recomendaciones': [],
                'mensaje': 'Los modelos no están entrenados',
                'tieneFavoritos': True,
                'algoritmo': 'Sistema Híbrido (KNN + Clustering + PCA)',
                'k': self.k
            }
        
        # Preparar datos de favoritos
        favoritos_data = self.preparar_datos_hibridos(favoritos)
        
        if favoritos_data.empty:
            return {
                'recomendaciones': [],
                'mensaje': 'No se pudieron procesar las propiedades favoritas',
                'tieneFavoritos': True,
                'algoritmo': 'Sistema Híbrido (KNN + Clustering + PCA)',
                'k': self.k
            }
        
        # Obtener IDs de favoritos
        ids_favoritas = set(favoritos_data['id_original'].tolist())
        
        # Filtrar propiedades candidatas
        propiedades_candidatas = self.propiedades_data[
            ~self.propiedades_data['id_original'].isin(ids_favoritas)
        ]
        
        if propiedades_candidatas.empty:
            return {
                'recomendaciones': [],
                'mensaje': 'No hay más propiedades disponibles',
                'tieneFavoritos': True,
                'algoritmo': 'Sistema Híbrido (KNN + Clustering + PCA)',
                'k': self.k
            }
        
        # Combinar múltiples estrategias de recomendación
        recomendaciones_finales = self._combinar_estrategias_recomendacion(
            favoritos_data, propiedades_candidatas, limit
        )
        
        return {
            'recomendaciones': recomendaciones_finales,
            'mensaje': f'Encontramos {len(recomendaciones_finales)} propiedades usando sistema híbrido',
            'tieneFavoritos': True,
            'totalFavoritos': len(favoritos),
            'algoritmo': 'Sistema Híbrido (KNN + Clustering + PCA)',
            'k': self.k,
            'metricas': {
                'total_candidatas': len(propiedades_candidatas),
                'recomendaciones_encontradas': len(recomendaciones_finales),
                'estrategias_usadas': ['KNN', 'Clustering', 'PCA', 'Outlier Detection']
            }
        }
    
    def _combinar_estrategias_recomendacion(
        self, 
        favoritos_data: pd.DataFrame, 
        propiedades_candidatas: pd.DataFrame, 
        limit: int
    ) -> List[Dict[str, Any]]:
        """
        Combinar múltiples estrategias de recomendación
        
        Args:
            favoritos_data: Datos de propiedades favoritas
            propiedades_candidatas: Datos de propiedades candidatas
            limit: Límite de recomendaciones
            
        Returns:
            Lista de recomendaciones combinadas
        """
        recomendaciones_map = {}
        
        # Estrategia 1: KNN tradicional
        knn_recomendaciones = self._obtener_recomendaciones_knn(favoritos_data, propiedades_candidatas)
        
        # Estrategia 2: Clustering
        cluster_recomendaciones = self._obtener_recomendaciones_clustering(favoritos_data, propiedades_candidatas)
        
        # Estrategia 3: PCA + similitud
        pca_recomendaciones = self._obtener_recomendaciones_pca(favoritos_data, propiedades_candidatas)
        
        # Estrategia 4: Filtrado por outliers
        filtered_recomendaciones = self._filtrar_outliers(propiedades_candidatas)
        
        # Combinar y puntuar recomendaciones
        for rec in knn_recomendaciones:
            prop_id = rec['id']
            if prop_id not in recomendaciones_map:
                recomendaciones_map[prop_id] = rec.copy()
                recomendaciones_map[prop_id]['score_hibrido'] = 0
            recomendaciones_map[prop_id]['score_hibrido'] += rec.get('similitud', 0) * 0.4
        
        for rec in cluster_recomendaciones:
            prop_id = rec['id']
            if prop_id not in recomendaciones_map:
                recomendaciones_map[prop_id] = rec.copy()
                recomendaciones_map[prop_id]['score_hibrido'] = 0
            recomendaciones_map[prop_id]['score_hibrido'] += rec.get('similitud', 0) * 0.3
        
        for rec in pca_recomendaciones:
            prop_id = rec['id']
            if prop_id not in recomendaciones_map:
                recomendaciones_map[prop_id] = rec.copy()
                recomendaciones_map[prop_id]['score_hibrido'] = 0
            recomendaciones_map[prop_id]['score_hibrido'] += rec.get('similitud', 0) * 0.2
        
        # Bonus por no ser outlier
        for prop_id in filtered_recomendaciones:
            if prop_id in recomendaciones_map:
                recomendaciones_map[prop_id]['score_hibrido'] += 0.1
        
        # Ordenar por score híbrido
        recomendaciones_ordenadas = sorted(
            recomendaciones_map.values(), 
            key=lambda x: x['score_hibrido'],
            reverse=True
        )[:limit]
        
        # Obtener datos completos
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
                    prop['score_hibrido'] = rec['score_hibrido']
                    propiedades_ordenadas.append(prop)
                    break
        
        return propiedades_ordenadas
    
    def _obtener_recomendaciones_knn(
        self, 
        favoritos_data: pd.DataFrame, 
        propiedades_candidatas: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """Obtener recomendaciones usando KNN"""
        recomendaciones = []
        
        for _, favorita in favoritos_data.iterrows():
            favorita_features = favorita.drop('id_original').values.reshape(1, -1)
            distances, indices = self.knn_model.kneighbors(favorita_features)
            
            for dist, idx in zip(distances[0], indices[0]):
                if idx < len(propiedades_candidatas):
                    prop = propiedades_candidatas.iloc[idx]
                    recomendaciones.append({
                        'id': int(prop['id_original']),
                        'similitud': 1 / (1 + dist),
                        'distancia': float(dist),
                        'estrategia': 'KNN'
                    })
        
        return recomendaciones
    
    def _obtener_recomendaciones_clustering(
        self, 
        favoritos_data: pd.DataFrame, 
        propiedades_candidatas: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """Obtener recomendaciones usando clustering"""
        if self.kmeans_model is None:
            return []
        
        recomendaciones = []
        
        # Obtener clusters de favoritas
        favorita_clusters = self.kmeans_model.predict(favoritos_data.drop('id_original', axis=1))
        
        for i, cluster in enumerate(favorita_clusters):
            # Encontrar propiedades en el mismo cluster
            cluster_mask = self.clusters == cluster
            cluster_props = propiedades_candidatas[cluster_mask]
            
            if not cluster_props.empty:
                # Calcular similitud dentro del cluster
                favorita_features = favoritos_data.iloc[i].drop('id_original')
                for _, prop in cluster_props.iterrows():
                    prop_features = prop.drop('id_original')
                    similitud = 1 - euclidean_distances([favorita_features], [prop_features])[0][0]
                    
                    recomendaciones.append({
                        'id': int(prop['id_original']),
                        'similitud': max(0, similitud),
                        'cluster': cluster,
                        'estrategia': 'Clustering'
                    })
        
        return recomendaciones
    
    def _obtener_recomendaciones_pca(
        self, 
        favoritos_data: pd.DataFrame, 
        propiedades_candidatas: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """Obtener recomendaciones usando PCA"""
        if self.pca_model is None:
            return []
        
        recomendaciones = []
        
        # Reducir dimensionalidad
        favoritas_pca = self.pca_model.transform(favoritos_data.drop('id_original', axis=1))
        candidatas_pca = self.pca_model.transform(propiedades_candidatas.drop('id_original', axis=1))
        
        for i, favorita_pca in enumerate(favoritas_pca):
            # Calcular distancias en espacio PCA
            distances = euclidean_distances([favorita_pca], candidatas_pca)[0]
            
            for j, dist in enumerate(distances):
                if j < len(propiedades_candidatas):
                    prop = propiedades_candidatas.iloc[j]
                    recomendaciones.append({
                        'id': int(prop['id_original']),
                        'similitud': 1 / (1 + dist),
                        'distancia_pca': float(dist),
                        'estrategia': 'PCA'
                    })
        
        return recomendaciones
    
    def _filtrar_outliers(self, propiedades_candidatas: pd.DataFrame) -> List[int]:
        """Filtrar outliers usando Isolation Forest"""
        if self.outlier_detector is None:
            return []
        
        # Predecir outliers
        outlier_predictions = self.outlier_detector.predict(propiedades_candidatas.drop('id_original', axis=1))
        
        # Retornar IDs de propiedades que NO son outliers
        non_outlier_ids = []
        for i, prediction in enumerate(outlier_predictions):
            if prediction == 1:  # No es outlier
                non_outlier_ids.append(int(propiedades_candidatas.iloc[i]['id_original']))
        
        return non_outlier_ids

# Instancia global del sistema híbrido
sistema_hibrido = SistemaHibridoRecomendaciones(k=5)

def procesar_recomendaciones_hibridas(
    favoritos: List[Dict[str, Any]], 
    propiedades_disponibles: List[Dict[str, Any]], 
    k: int = 5, 
    limit: int = 6
) -> Dict[str, Any]:
    """
    Función principal para procesar recomendaciones híbridas
    
    Args:
        favoritos: Lista de propiedades favoritas
        propiedades_disponibles: Lista de propiedades disponibles
        k: Número de vecinos más cercanos
        limit: Límite de recomendaciones
        
    Returns:
        Diccionario con recomendaciones híbridas
    """
    try:
        # Configurar k si es diferente
        if k != sistema_hibrido.k:
            sistema_hibrido.k = k
        
        # Entrenar modelos híbridos
        sistema_hibrido.entrenar_modelos_hibridos(propiedades_disponibles)
        
        # Obtener recomendaciones híbridas
        resultado = sistema_hibrido.obtener_recomendaciones_hibridas(favoritos, limit)
        
        logger.info(f"Recomendaciones híbridas generadas: {len(resultado.get('recomendaciones', []))}")
        return resultado
        
    except Exception as e:
        logger.error(f"Error al procesar recomendaciones híbridas: {str(e)}")
        return {
            'recomendaciones': [],
            'mensaje': f'Error al generar recomendaciones: {str(e)}',
            'tieneFavoritos': len(favoritos) > 0,
            'algoritmo': 'Sistema Híbrido (KNN + Clustering + PCA)',
            'k': k,
            'error': str(e)
        }

if __name__ == "__main__":
    # Test del sistema híbrido
    print("🧪 Probando sistema híbrido de recomendaciones...")
    
    # Datos de prueba
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
    
    resultado = procesar_recomendaciones_hibridas(favoritos_test, propiedades_test)
    print(f"✅ Resultado híbrido: {json.dumps(resultado, indent=2, ensure_ascii=False)}")
