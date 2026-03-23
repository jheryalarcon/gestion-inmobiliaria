"""
Generación de Datos Sintéticos — Sistema de Recomendación Inmobiliaria
=======================================================================
Script maestro que orquesta la producción completa del conjunto de datos
sintéticos necesario para entrenar y evaluar el modelo de recomendación:

  1. generar_propiedades_sinteticas.py  — 150 propiedades inmobiliarias
  2. generar_clientes_sinteticos.py     — 60 clientes con perfiles de compra
  3. Este script                        — interacciones cliente-propiedad

Puntaje de afinidad (0 a 1) ponderado por 4 criterios:
  - Tipo de propiedad buscado vs. ofertado   (30%)
  - Rango presupuestario del cliente          (30%)
  - Modalidad de negocio (venta/alquiler)     (25%)
  - Preferencias de amenidades                (15%)

Reglas de generación de interacciones:
  - Afinidad alta  (>= 0.70): múltiples vistas + favorito probable + contacto posible
  - Afinidad media (0.40 – 0.69): 1-2 vistas, favorito poco probable
  - Afinidad baja  (< 0.40): sin interacción registrada

Archivos resultantes en data/raw/:
  propiedades_sinteticas.csv
  clientes_sinteticos.csv
  interacciones_sinteticas.csv
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import numpy as np
import pandas as pd
from generar_propiedades_sinteticas import generate_properties
from generar_clientes_sinteticos import generate_users

np.random.seed(42)

RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)


# ── Pesos de los factores de compatibilidad ────────────────────────────────────

TIPO_COMPAT = {
    # Mapeo de qué tipos de propiedad interesan a cada perfil
    "inversor":          {"terreno", "local_comercial", "finca", "oficina"},
    "familia":           {"casa", "finca", "departamento"},
    "joven_profesional": {"departamento", "suite", "casa"},
    "arrendatario":      {"departamento", "suite", "casa"},
}


def _score_compatibilidad(user: dict, prop: dict) -> float:
    score = 0.0
    # ── Factor 1: Coincidencia de tipo de propiedad (peso 0.30) ───────────────
    perfil     = user["perfil"]
    tipo_prop  = prop["tipo_propiedad"]
    tipo_pref  = user["tipo_preferido"]

    if tipo_prop == tipo_pref:
        score += 0.30               # coincidencia exacta
    elif tipo_prop in TIPO_COMPAT.get(perfil, set()):
        score += 0.15               # compatible con el perfil
    # else: 0 puntos

    # ── Factor 2: Adecuación del precio (peso 0.30) ────────────────────────────
    precio      = float(prop["precio"])
    precio_min  = float(user["precio_min"])
    precio_max  = float(user["precio_max"])

    if precio_min <= precio <= precio_max:
        # Más puntaje si está cerca del precio deseado
        precio_deseado = float(user["precio_deseado"])
        desviacion = abs(precio - precio_deseado) / max(precio_deseado, 1)
        score += 0.30 * max(0, 1 - desviacion)
    elif precio < precio_min * 0.7 or precio > precio_max * 1.3:
        score += 0.0    # muy fuera de rango
    else:
        score += 0.08   # algo cercano al rango

    # ── Factor 3: Coincidencia de transacción (peso 0.25) ─────────────────────
    if prop["transaccion"] == user["transaccion_pref"]:
        score += 0.25
    else:
        score += 0.05   # transacción alternativa: poco interés

    # ── Factor 4: Amenidades preferidas (peso 0.15) ───────────────────────────
    match_amenidades = 0
    total_pref       = 0

    if user.get("pref_piscina"):
        total_pref += 1
        match_amenidades += int(prop.get("tiene_piscina", False))
    if user.get("pref_seguridad"):
        total_pref += 1
        match_amenidades += int(prop.get("tiene_seguridad", False))
    if user.get("pref_parqueadero"):
        total_pref += 1
        match_amenidades += int(prop.get("nro_parqueaderos", 0) > 0)

    if total_pref > 0:
        score += 0.15 * (match_amenidades / total_pref)
    else:
        score += 0.075  # sin preferencias definidas → neutral

    return round(min(score, 1.0), 4)


def _generar_interacciones(user: dict, prop: dict, score: float) -> dict | None:
    """
    Según el score de compatibilidad genera la interacción.
    Retorna None si no hay interacción.
    """
    r = np.random.random()

    if score >= 0.70:
        # Compatibilidad ALTA → varios clics, alta prob. de favorito y contacto
        clicks    = int(np.random.choice([1, 2, 3, 4], p=[0.20, 0.35, 0.30, 0.15]))
        favorito  = r < 0.75
        contacto  = r < 0.35
    elif score >= 0.40:
        # Compatibilidad MEDIA → 1-2 clics, baja prob. favorito
        clicks    = int(np.random.choice([1, 2], p=[0.65, 0.35]))
        favorito  = r < 0.20
        contacto  = False
    else:
        # Compatibilidad BAJA → sin interacción
        return None

    return {
        "user_id":     user["user_id"],
        "property_id": prop["id"],
        "score":       score,
        "clicks":      clicks,
        "favorito":    int(favorito),
        "contacto":    int(contacto),
    }


def generate_interactions(users_df: pd.DataFrame, props_df: pd.DataFrame) -> pd.DataFrame:
    interactions = []
    users = users_df.to_dict("records")
    props = props_df.to_dict("records")

    total_pairs = len(users) * len(props)
    print(f"  Evaluando {total_pairs} pares usuario-propiedad...")

    for user in users:
        for prop in props:
            score = _score_compatibilidad(user, prop)
            inter = _generar_interacciones(user, prop, score)
            if inter is not None:
                interactions.append(inter)

    return pd.DataFrame(interactions)


def main():
    print("=" * 55)
    print("  GENERADOR DE DATOS SINTÉTICOS — SISTEMA INMOBILIARIO")
    print("=" * 55)

    # ── Paso 1: Propiedades ────────────────────────────────────────────────────
    print("\n[1] Generando propiedades sintéticas...")
    props_df = generate_properties(150)
    props_path = RAW_DIR / "propiedades_sinteticas.csv"
    props_df.to_csv(props_path, index=False)
    print(f"    ✓ {len(props_df)} propiedades generadas → {props_path.name}")

    # ── Paso 2: Clientes ───────────────────────────────────────────────────────
    print("\n[2] Generando clientes sintéticos...")
    users_df = generate_users(60)
    users_path = RAW_DIR / "clientes_sinteticos.csv"
    users_df.to_csv(users_path, index=False)
    print(f"    ✓ {len(users_df)} clientes generados → {users_path.name}")

    # ── Paso 3: Interacciones ─────────────────────────────────────────────────
    print("\n[3] Generando interacciones cliente-propiedad...")
    inter_df = generate_interactions(users_df, props_df)
    inter_path = RAW_DIR / "interacciones_sinteticas.csv"
    inter_df.to_csv(inter_path, index=False)

    total_pares    = len(users_df) * len(props_df)
    alta_compat    = inter_df[inter_df["score"] >= 0.70]
    media_compat   = inter_df[(inter_df["score"] >= 0.40) & (inter_df["score"] < 0.70)]

    print(f"    ✓ {len(inter_df)} interacciones generadas de {total_pares} pares evaluados")
    print(f"      - Compatibilidad alta  (≥0.70): {len(alta_compat)}")
    print(f"      - Compatibilidad media (0.40-0.70): {len(media_compat)}")
    print(f"      - Con favorito:  {inter_df['favorito'].sum()}")
    print(f"      - Con contacto:  {inter_df['contacto'].sum()}")
    print(f"    ✓ Guardado en: {inter_path.name}")

    # ── Resumen final ─────────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("  RESUMEN FINAL")
    print("=" * 55)
    print(f"  Propiedades:   {len(props_df)}")
    print(f"  Usuarios:      {len(users_df)}")
    print(f"  Interacciones: {len(inter_df)}")
    print(f"  Archivos en:   data/raw/")
    print("=" * 55)


if __name__ == "__main__":
    main()
