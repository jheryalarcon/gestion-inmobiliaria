"""
Sistema de Evaluación y Métricas para Recomendaciones
Implementa métricas para evaluar la calidad de las recomendaciones
"""

import pandas as pd
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import NearestNeighbors
import json
import logging
from typing import List, Dict, Any, Tuple
import time
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EvaluadorRecomendaciones:
    def __init__(self):
        """
        Inicializar el evaluador de recomendaciones
        """
        self.metricas_historial = []
        self.performance_historial = []
        
    def evaluar_calidad_recomendaciones(
        self, 
        recomendaciones: List[Dict[str, Any]], 
        favoritos: List[Dict[str, Any]],
        propiedades_disponibles: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluar la calidad de las recomendaciones generadas
        
        Args:
            recomendaciones: Lista de recomendaciones generadas
            favoritos: Lista de propiedades favoritas del usuario
            propiedades_disponibles: Lista de todas las propiedades disponibles
            
        Returns:
            Diccionario con métricas de evaluación
        """
        if not recomendaciones or not favoritos:
            return {
                'precision': 0,
                'recall': 0,
                'f1_score': 0,
                'diversidad': 0,
                'cobertura': 0,
                'novelty': 0,
                'tiempo_respuesta': 0,
                'timestamp': datetime.now().isoformat()
            }
        
        # 1. Métricas de similitud
        similitud_metrics = self._calcular_metricas_similitud(recomendaciones, favoritos)
        
        # 2. Métricas de diversidad
        diversidad_metrics = self._calcular_metricas_diversidad(recomendaciones)
        
        # 3. Métricas de cobertura
        cobertura_metrics = self._calcular_metricas_cobertura(recomendaciones, propiedades_disponibles)
        
        # 4. Métricas de novedad
        novelty_metrics = self._calcular_metricas_novedad(recomendaciones, favoritos)
        
        # 5. Métricas de rendimiento
        performance_metrics = self._calcular_metricas_rendimiento()
        
        # Combinar todas las métricas
        metricas_completas = {
            **similitud_metrics,
            **diversidad_metrics,
            **cobertura_metrics,
            **novelty_metrics,
            **performance_metrics,
            'timestamp': datetime.now().isoformat(),
            'total_recomendaciones': len(recomendaciones),
            'total_favoritos': len(favoritos)
        }
        
        # Guardar en historial
        self.metricas_historial.append(metricas_completas)
        
        return metricas_completas
    
    def _calcular_metricas_similitud(
        self, 
        recomendaciones: List[Dict[str, Any]], 
        favoritos: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Calcular métricas de similitud entre recomendaciones y favoritos
        
        Args:
            recomendaciones: Lista de recomendaciones
            favoritos: Lista de favoritos
            
        Returns:
            Diccionario con métricas de similitud
        """
        if not recomendaciones or not favoritos:
            return {
                'similitud_promedio': 0,
                'similitud_maxima': 0,
                'similitud_minima': 0,
                'consistencia_similitud': 0
            }
        
        similitudes = []
        
        # Calcular similitud entre cada recomendación y cada favorito
        for rec in recomendaciones:
            for fav in favoritos:
                similitud = self._calcular_similitud_propiedades(rec, fav)
                similitudes.append(similitud)
        
        if not similitudes:
            return {
                'similitud_promedio': 0,
                'similitud_maxima': 0,
                'similitud_minima': 0,
                'consistencia_similitud': 0
            }
        
        return {
            'similitud_promedio': np.mean(similitudes),
            'similitud_maxima': np.max(similitudes),
            'similitud_minima': np.min(similitudes),
            'consistencia_similitud': 1 - np.std(similitudes)  # Menor desviación = mayor consistencia
        }
    
    def _calcular_metricas_diversidad(self, recomendaciones: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calcular métricas de diversidad de las recomendaciones
        
        Args:
            recomendaciones: Lista de recomendaciones
            
        Returns:
            Diccionario con métricas de diversidad
        """
        if len(recomendaciones) < 2:
            return {
                'diversidad_tipo': 0,
                'diversidad_ciudad': 0,
                'diversidad_precio': 0,
                'diversidad_general': 0
            }
        
        # Diversidad de tipo de propiedad
        tipos = [rec.get('tipo_propiedad', 'desconocido') for rec in recomendaciones]
        diversidad_tipo = len(set(tipos)) / len(tipos)
        
        # Diversidad de ciudad
        ciudades = [rec.get('ciudad', 'desconocido') for rec in recomendaciones]
        diversidad_ciudad = len(set(ciudades)) / len(ciudades)
        
        # Diversidad de precio (coeficiente de variación)
        precios = [rec.get('precio', 0) for rec in recomendaciones if rec.get('precio', 0) > 0]
        if precios:
            diversidad_precio = np.std(precios) / np.mean(precios) if np.mean(precios) > 0 else 0
        else:
            diversidad_precio = 0
        
        # Diversidad general (promedio ponderado)
        diversidad_general = (diversidad_tipo * 0.4 + diversidad_ciudad * 0.3 + min(diversidad_precio, 1) * 0.3)
        
        return {
            'diversidad_tipo': diversidad_tipo,
            'diversidad_ciudad': diversidad_ciudad,
            'diversidad_precio': diversidad_precio,
            'diversidad_general': diversidad_general
        }
    
    def _calcular_metricas_cobertura(
        self, 
        recomendaciones: List[Dict[str, Any]], 
        propiedades_disponibles: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Calcular métricas de cobertura del catálogo
        
        Args:
            recomendaciones: Lista de recomendaciones
            propiedades_disponibles: Lista de todas las propiedades
            
        Returns:
            Diccionario con métricas de cobertura
        """
        if not recomendaciones or not propiedades_disponibles:
            return {
                'cobertura_catalogo': 0,
                'cobertura_tipos': 0,
                'cobertura_ciudades': 0
            }
        
        # Cobertura del catálogo
        ids_recomendadas = set(rec.get('id', 0) for rec in recomendaciones)
        ids_disponibles = set(prop.get('id', 0) for prop in propiedades_disponibles)
        cobertura_catalogo = len(ids_recomendadas) / len(ids_disponibles) if ids_disponibles else 0
        
        # Cobertura de tipos
        tipos_recomendadas = set(rec.get('tipo_propiedad', 'desconocido') for rec in recomendaciones)
        tipos_disponibles = set(prop.get('tipo_propiedad', 'desconocido') for prop in propiedades_disponibles)
        cobertura_tipos = len(tipos_recomendadas) / len(tipos_disponibles) if tipos_disponibles else 0
        
        # Cobertura de ciudades
        ciudades_recomendadas = set(rec.get('ciudad', 'desconocido') for rec in recomendaciones)
        ciudades_disponibles = set(prop.get('ciudad', 'desconocido') for prop in propiedades_disponibles)
        cobertura_ciudades = len(ciudades_recomendadas) / len(ciudades_disponibles) if ciudades_disponibles else 0
        
        return {
            'cobertura_catalogo': cobertura_catalogo,
            'cobertura_tipos': cobertura_tipos,
            'cobertura_ciudades': cobertura_ciudades
        }
    
    def _calcular_metricas_novedad(
        self, 
        recomendaciones: List[Dict[str, Any]], 
        favoritos: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Calcular métricas de novedad de las recomendaciones
        
        Args:
            recomendaciones: Lista de recomendaciones
            favoritos: Lista de favoritos
            
        Returns:
            Diccionario con métricas de novedad
        """
        if not recomendaciones or not favoritos:
            return {
                'novedad_promedio': 0,
                'novedad_maxima': 0,
                'propiedades_nuevas': 0
            }
        
        # Calcular novedad basada en diferencias con favoritos
        novedades = []
        propiedades_nuevas = 0
        
        for rec in recomendaciones:
            novedad_max = 0
            
            for fav in favoritos:
                # Calcular diferencia (novedad) entre recomendación y favorito
                novedad = self._calcular_novedad_propiedades(rec, fav)
                novedad_max = max(novedad_max, novedad)
            
            novedades.append(novedad_max)
            
            # Contar propiedades que son significativamente diferentes
            if novedad_max > 0.5:  # Umbral de novedad
                propiedades_nuevas += 1
        
        return {
            'novedad_promedio': np.mean(novedades) if novedades else 0,
            'novedad_maxima': np.max(novedades) if novedades else 0,
            'propiedades_nuevas': propiedades_nuevas / len(recomendaciones) if recomendaciones else 0
        }
    
    def _calcular_metricas_rendimiento(self) -> Dict[str, float]:
        """
        Calcular métricas de rendimiento del sistema
        
        Returns:
            Diccionario con métricas de rendimiento
        """
        # Tiempo de respuesta (simulado - en implementación real se mediría)
        tiempo_respuesta = np.random.uniform(0.1, 2.0)  # 100ms a 2s
        
        # Eficiencia del algoritmo
        eficiencia = max(0, 1 - tiempo_respuesta / 2.0)  # Mejor si es más rápido
        
        return {
            'tiempo_respuesta': tiempo_respuesta,
            'eficiencia_algoritmo': eficiencia
        }
    
    def _calcular_similitud_propiedades(
        self, 
        prop1: Dict[str, Any], 
        prop2: Dict[str, Any]
    ) -> float:
        """
        Calcular similitud entre dos propiedades
        
        Args:
            prop1: Primera propiedad
            prop2: Segunda propiedad
            
        Returns:
            Valor de similitud entre 0 y 1
        """
        similitudes = []
        
        # Similitud de precio
        if 'precio' in prop1 and 'precio' in prop2:
            precio1 = prop1['precio']
            precio2 = prop2['precio']
            if precio1 > 0 and precio2 > 0:
                sim_precio = 1 - abs(precio1 - precio2) / max(precio1, precio2)
                similitudes.append(sim_precio)
        
        # Similitud de tipo
        if 'tipo_propiedad' in prop1 and 'tipo_propiedad' in prop2:
            sim_tipo = 1.0 if prop1['tipo_propiedad'] == prop2['tipo_propiedad'] else 0.0
            similitudes.append(sim_tipo)
        
        # Similitud de ciudad
        if 'ciudad' in prop1 and 'ciudad' in prop2:
            sim_ciudad = 1.0 if prop1['ciudad'] == prop2['ciudad'] else 0.0
            similitudes.append(sim_ciudad)
        
        # Similitud de habitaciones
        if 'nro_habitaciones' in prop1 and 'nro_habitaciones' in prop2:
            hab1 = prop1['nro_habitaciones'] or 0
            hab2 = prop2['nro_habitaciones'] or 0
            hab_max = max(hab1, hab2, 1)
            sim_hab = 1 - abs(hab1 - hab2) / hab_max
            similitudes.append(sim_hab)
        
        # Similitud de baños
        if 'nro_banos' in prop1 and 'nro_banos' in prop2:
            banos1 = prop1['nro_banos'] or 0
            banos2 = prop2['nro_banos'] or 0
            banos_max = max(banos1, banos2, 1)
            sim_banos = 1 - abs(banos1 - banos2) / banos_max
            similitudes.append(sim_banos)
        
        return np.mean(similitudes) if similitudes else 0
    
    def _calcular_novedad_propiedades(
        self, 
        recomendacion: Dict[str, Any], 
        favorito: Dict[str, Any]
    ) -> float:
        """
        Calcular novedad de una recomendación respecto a un favorito
        
        Args:
            recomendacion: Propiedad recomendada
            favorito: Propiedad favorita
            
        Returns:
            Valor de novedad entre 0 y 1
        """
        # Novedad es la inversa de la similitud
        similitud = self._calcular_similitud_propiedades(recomendacion, favorito)
        return 1 - similitud
    
    def generar_reporte_evaluacion(self) -> Dict[str, Any]:
        """
        Generar reporte de evaluación basado en el historial
        
        Returns:
            Diccionario con reporte de evaluación
        """
        if not self.metricas_historial:
            return {
                'mensaje': 'No hay datos de evaluación disponibles',
                'total_evaluaciones': 0
            }
        
        # Calcular promedios de todas las métricas
        df_metricas = pd.DataFrame(self.metricas_historial)
        
        reporte = {
            'total_evaluaciones': len(self.metricas_historial),
            'fecha_primera_evaluacion': df_metricas['timestamp'].min(),
            'fecha_ultima_evaluacion': df_metricas['timestamp'].max(),
            'metricas_promedio': {
                'similitud_promedio': df_metricas['similitud_promedio'].mean(),
                'diversidad_general': df_metricas['diversidad_general'].mean(),
                'cobertura_catalogo': df_metricas['cobertura_catalogo'].mean(),
                'novedad_promedio': df_metricas['novedad_promedio'].mean(),
                'tiempo_respuesta': df_metricas['tiempo_respuesta'].mean(),
                'eficiencia_algoritmo': df_metricas['eficiencia_algoritmo'].mean()
            },
            'metricas_tendencia': {
                'similitud_tendencia': self._calcular_tendencia(df_metricas['similitud_promedio']),
                'diversidad_tendencia': self._calcular_tendencia(df_metricas['diversidad_general']),
                'cobertura_tendencia': self._calcular_tendencia(df_metricas['cobertura_catalogo']),
                'novedad_tendencia': self._calcular_tendencia(df_metricas['novedad_promedio'])
            },
            'recomendaciones': self._generar_recomendaciones_mejora(df_metricas)
        }
        
        return reporte
    
    def _calcular_tendencia(self, serie: pd.Series) -> str:
        """
        Calcular tendencia de una serie de métricas
        
        Args:
            serie: Serie de valores
            
        Returns:
            Tendencia ('mejorando', 'empeorando', 'estable')
        """
        if len(serie) < 2:
            return 'insuficiente_datos'
        
        # Calcular pendiente de la línea de tendencia
        x = np.arange(len(serie))
        pendiente = np.polyfit(x, serie, 1)[0]
        
        if pendiente > 0.01:
            return 'mejorando'
        elif pendiente < -0.01:
            return 'empeorando'
        else:
            return 'estable'
    
    def _generar_recomendaciones_mejora(self, df_metricas: pd.DataFrame) -> List[str]:
        """
        Generar recomendaciones de mejora basadas en las métricas
        
        Args:
            df_metricas: DataFrame con métricas históricas
            
        Returns:
            Lista de recomendaciones
        """
        recomendaciones = []
        
        # Analizar similitud
        sim_promedio = df_metricas['similitud_promedio'].mean()
        if sim_promedio < 0.6:
            recomendaciones.append("La similitud promedio es baja. Considera ajustar los pesos de las características.")
        
        # Analizar diversidad
        div_promedio = df_metricas['diversidad_general'].mean()
        if div_promedio < 0.3:
            recomendaciones.append("La diversidad es baja. Considera implementar técnicas de diversificación.")
        
        # Analizar cobertura
        cov_promedio = df_metricas['cobertura_catalogo'].mean()
        if cov_promedio < 0.1:
            recomendaciones.append("La cobertura del catálogo es baja. Considera explorar más propiedades.")
        
        # Analizar novedad
        nov_promedio = df_metricas['novedad_promedio'].mean()
        if nov_promedio < 0.3:
            recomendaciones.append("La novedad es baja. Considera introducir más variedad en las recomendaciones.")
        
        # Analizar rendimiento
        tiempo_promedio = df_metricas['tiempo_respuesta'].mean()
        if tiempo_promedio > 1.0:
            recomendaciones.append("El tiempo de respuesta es alto. Considera optimizar el algoritmo.")
        
        if not recomendaciones:
            recomendaciones.append("Las métricas están en rangos aceptables. Continúa monitoreando el rendimiento.")
        
        return recomendaciones

# Instancia global del evaluador
evaluador_recomendaciones = EvaluadorRecomendaciones()

def evaluar_recomendaciones(
    recomendaciones: List[Dict[str, Any]], 
    favoritos: List[Dict[str, Any]],
    propiedades_disponibles: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Función principal para evaluar recomendaciones
    
    Args:
        recomendaciones: Lista de recomendaciones generadas
        favoritos: Lista de propiedades favoritas
        propiedades_disponibles: Lista de todas las propiedades disponibles
        
    Returns:
        Diccionario con métricas de evaluación
    """
    return evaluador_recomendaciones.evaluar_calidad_recomendaciones(
        recomendaciones, favoritos, propiedades_disponibles
    )

def obtener_reporte_evaluacion() -> Dict[str, Any]:
    """
    Obtener reporte de evaluación del sistema
    
    Returns:
        Diccionario con reporte de evaluación
    """
    return evaluador_recomendaciones.generar_reporte_evaluacion()

if __name__ == "__main__":
    # Test del sistema de evaluación
    print("🧪 Probando sistema de evaluación de recomendaciones...")
    
    # Datos de prueba
    recomendaciones_test = [
        {
            'id': 2,
            'precio': 200000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 2,
            'nro_banos': 1
        },
        {
            'id': 3,
            'precio': 180000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 4,
            'nro_banos': 3
        }
    ]
    
    favoritos_test = [
        {
            'id': 1,
            'precio': 150000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 3,
            'nro_banos': 2
        }
    ]
    
    propiedades_disponibles_test = [
        {
            'id': 1,
            'precio': 150000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 3,
            'nro_banos': 2
        },
        {
            'id': 2,
            'precio': 200000,
            'tipo_propiedad': 'apartamento',
            'ciudad': 'Medellín',
            'nro_habitaciones': 2,
            'nro_banos': 1
        },
        {
            'id': 3,
            'precio': 180000,
            'tipo_propiedad': 'casa',
            'ciudad': 'Bogotá',
            'nro_habitaciones': 4,
            'nro_banos': 3
        }
    ]
    
    # Evaluar recomendaciones
    metricas = evaluar_recomendaciones(recomendaciones_test, favoritos_test, propiedades_disponibles_test)
    print(f"✅ Métricas de evaluación: {json.dumps(metricas, indent=2, ensure_ascii=False)}")
    
    # Generar reporte
    reporte = obtener_reporte_evaluacion()
    print(f"📊 Reporte de evaluación: {json.dumps(reporte, indent=2, ensure_ascii=False)}")
