"""
Servicio de Recomendaciones con scikit-learn (TruncatedSVD)
============================================================
Implementa un sistema híbrido Content-Based + Weighted Implicit Feedback.

Señales de comportamiento usadas:
  - VISTA    (ver el detalle de una propiedad) → peso 1
  - FAVORITO (guardar como favorita)           → peso 5
  - CONTACTO (enviar formulario de contacto)   → peso 10

El perfil del usuario se construye como la suma ponderada de los vectores
de las propiedades con las que interactuó. Luego se calcula similitud coseno
en el espacio reducido por SVD para encontrar propiedades parecidas.

Probado y funcionando con Python 3.13 + sklearn 1.7.2.
"""

import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _vectorizar_propiedad(prop: Dict) -> np.ndarray:
    """
    Convierte una propiedad en un vector numérico de características.
    Cada dimensión representa un atributo normalizado o codificado.
    """
    feats = []
    # ── Características numéricas normalizadas ──────────────────────────────
    precio = float(prop.get('precio') or 0)
    feats.append(min(precio / 500_000, 3.0))                           # Precio
    feats.append(float(prop.get('nro_habitaciones') or 0) / 6.0)
    feats.append(float(prop.get('nro_banos') or 0) / 5.0)
    feats.append(float(prop.get('nro_parqueaderos') or 0) / 4.0)
    feats.append(min(float(prop.get('area_construccion') or 0) / 500.0, 2.0))
    feats.append(min(float(prop.get('area_terreno') or 0) / 1000.0, 2.0))

    # ── Tipo de propiedad (one-hot) ──────────────────────────────────────────
    tipos = ['casa', 'departamento', 'suite', 'local_comercial', 'terreno',
             'finca', 'quinta', 'oficina', 'bodega_galpon', 'edificio']
    tipo_actual = prop.get('tipo_propiedad', '')
    feats.extend([1.0 if tipo_actual == t else 0.0 for t in tipos])

    # ── Tipo de transacción (one-hot) ────────────────────────────────────────
    transacciones = ['venta', 'alquiler', 'alquiler_opcion_compra']
    trans_actual = prop.get('transaccion', '')
    feats.extend([1.0 if trans_actual == t else 0.0 for t in transacciones])

    # ── Amenidades (peso 2x para reforzar su importancia) ────────────────────
    amenidades = [
        'tiene_piscina', 'tiene_seguridad', 'tiene_ascensor', 'tiene_area_bbq',
        'tiene_terraza', 'tiene_balcon', 'tiene_patio', 'tiene_bodega',
        'tiene_areas_comunales', 'amoblado'
    ]
    for am in amenidades:
        feats.append(2.0 if prop.get(am) else 0.0)

    return np.array(feats, dtype=np.float32)


def procesar_recomendaciones(
    usuario_id: int,
    interacciones: List[Dict],
    propiedades_disponibles: List[Dict],
    limit: int = 6
) -> Dict[str, Any]:
    """
    Genera recomendaciones usando TruncatedSVD + similitud coseno.

    Flujo:
    1. Vectoriza todas las propiedades disponibles.
    2. Construye el perfil del usuario como suma ponderada de vectores
       de las propiedades con las que interactuó (usando peso_total).
    3. Aplica TruncatedSVD para reducir dimensionalidad y encontrar
       patrones latentes (ej: "propiedades con seguridad + ascensor").
    4. Calcula similitud coseno entre el perfil del usuario y cada candidata.
    5. Excluye propiedades ya interactuadas y retorna el Top-N.

    Args:
        usuario_id    : ID del usuario (informativo, para logs)
        interacciones : Lista de {propiedadId, peso_total}
                        (VISTA=1, FAVORITO=5, CONTACTO=10, sumados por propiedad)
        propiedades_disponibles : Lista de propiedades con todas sus features
        limit         : Máximo de recomendaciones a retornar

    Returns:
        Dict con recomendaciones, mensaje, algoritmo y métricas
    """
    if not interacciones:
        return {
            "recomendaciones": [],
            "mensaje": "Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero",
            "tieneFavoritos": False,
            "algoritmo": "Factorización de Matrices (SVD)",
            "metricas": {}
        }

    if not propiedades_disponibles:
        return {
            "recomendaciones": [],
            "mensaje": "No hay propiedades disponibles para recomendarte",
            "tieneFavoritos": True,
            "algoritmo": "Factorización de Matrices (SVD)",
            "metricas": {}
        }

    try:
        ids_interactuados = {inter['propiedadId'] for inter in interacciones}
        id_to_prop = {p['id']: p for p in propiedades_disponibles}

        # ── 1. Vectorizar todas las propiedades ──────────────────────────────
        ids_ordenados = [p['id'] for p in propiedades_disponibles]
        matriz_propiedades = np.array(
            [_vectorizar_propiedad(p) for p in propiedades_disponibles],
            dtype=np.float32
        )

        # ── 2. Construir perfil del usuario ──────────────────────────────────
        # Suma ponderada: el CONTACTO (peso 10) influye 10x más que una VISTA (peso 1)
        perfil_usuario = np.zeros(matriz_propiedades.shape[1], dtype=np.float32)
        total_peso = 0.0

        for inter in interacciones:
            pid = inter['propiedadId']
            peso = float(inter['peso_total'])
            if pid in id_to_prop:
                vec = _vectorizar_propiedad(id_to_prop[pid])
                perfil_usuario += vec * peso
                total_peso += peso

        if total_peso == 0:
            return _fallback_popularidad(propiedades_disponibles, ids_interactuados, limit)

        # Normalizar perfil por el peso total
        perfil_usuario = perfil_usuario / total_peso

        # ── 3. Reducción de dimensionalidad con SVD ──────────────────────────
        n_props = len(propiedades_disponibles)
        n_feat = matriz_propiedades.shape[1]
        n_components = min(15, n_props - 1, n_feat - 1)

        if n_components >= 2:
            svd = TruncatedSVD(n_components=n_components, random_state=42)
            matriz_reducida = svd.fit_transform(matriz_propiedades)
            perfil_reducido = svd.transform(perfil_usuario.reshape(1, -1))[0]
        else:
            # Muy pocas propiedades: sin reducción
            matriz_reducida = matriz_propiedades
            perfil_reducido = perfil_usuario

        # ── 4. Similitud coseno ──────────────────────────────────────────────
        norma_matriz = normalize(matriz_reducida)
        norma_perfil = normalize(perfil_reducido.reshape(1, -1))[0]
        scores = norma_matriz.dot(norma_perfil)

        # ── 5. Ordenar y excluir ya interactuadas ────────────────────────────
        ranking = sorted(
            zip(ids_ordenados, scores.tolist()),
            key=lambda x: float(x[1]),
            reverse=True
        )

        recomendadas = [
            {"id": pid, "score": float(score)}
            for pid, score in ranking
            if pid not in ids_interactuados
        ][:limit]

        logger.info(
            f"SVD → {len(recomendadas)} recomendaciones para usuario {usuario_id} "
            f"(peso_total={total_peso:.0f}, {n_props} candidatas, {n_components} componentes)"
        )

        return {
            "recomendaciones": recomendadas,
            "mensaje": f"Encontramos {len(recomendadas)} propiedades que te pueden interesar",
            "tieneFavoritos": True,
            "algoritmo": "Factorización de Matrices (SVD)",
            "metricas": {
                "interacciones_usadas": len(interacciones),
                "peso_total": float(total_peso),
                "propiedades_candidatas": n_props,
                "n_components_svd": n_components
            }
        }

    except Exception as e:
        logger.error(f"Error en SVD: {str(e)}")
        return _fallback_popularidad(propiedades_disponibles, ids_interactuados, limit)


def _fallback_popularidad(
    propiedades_disponibles: List[Dict],
    ids_excluir: set,
    limit: int
) -> Dict[str, Any]:
    """Fallback mínimo cuando no hay datos suficientes."""
    candidatas = [
        {"id": p["id"], "score": 0.0}
        for p in propiedades_disponibles
        if p["id"] not in ids_excluir
    ][:limit]

    return {
        "recomendaciones": candidatas,
        "mensaje": f"Te mostramos {len(candidatas)} propiedades disponibles",
        "tieneFavoritos": True,
        "algoritmo": "Fallback (lista)",
        "metricas": {}
    }
