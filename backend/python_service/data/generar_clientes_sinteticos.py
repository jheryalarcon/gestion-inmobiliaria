"""
Generador de Usuarios Sintéticos
==================================
Genera 60 usuarios distribuidos en 4 perfiles latentes, con distribuciones
de probabilidad predefinidas para sus preferencias inmobiliarias.

Perfiles:
  - inversor         (25%): terrenos / locales, precio alto, venta
  - familia          (35%): casas con habitaciones, precio medio, venta
  - joven_profesional(25%): departamentos/suites, precio bajo-medio, alquiler o venta
  - arrendatario     (15%): alquiler, departamentos, precio bajo

Exporta: data/raw/synthetic_users.csv
"""

import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ── Definición de perfiles latentes ───────────────────────────────────────────
PERFILES = {
    "inversor": {
        "count": 0.25,  # 25%
        "tipo_preferido": ["terreno", "local_comercial", "finca", "oficina"],
        "tipo_pesos":     [0.40, 0.30, 0.20, 0.10],
        "rango_precio_min": 60_000,
        "rango_precio_max": 300_000,
        "transaccion_pref": ["venta", "alquiler"],
        "transaccion_pesos": [0.85, 0.15],
        "hab_preferidas": [0, 1, 2],
        "hab_pesos":      [0.50, 0.30, 0.20],
    },
    "familia": {
        "count": 0.35,  # 35%
        "tipo_preferido": ["casa", "finca", "departamento"],
        "tipo_pesos":     [0.65, 0.15, 0.20],
        "rango_precio_min": 60_000,
        "rango_precio_max": 200_000,
        "transaccion_pref": ["venta", "alquiler"],
        "transaccion_pesos": [0.80, 0.20],
        "hab_preferidas": [3, 4, 5],
        "hab_pesos":      [0.40, 0.40, 0.20],
    },
    "joven_profesional": {
        "count": 0.25,  # 25%
        "tipo_preferido": ["departamento", "suite", "casa"],
        "tipo_pesos":     [0.55, 0.30, 0.15],
        "rango_precio_min": 30_000,
        "rango_precio_max": 120_000,
        "transaccion_pref": ["alquiler", "venta"],
        "transaccion_pesos": [0.55, 0.45],
        "hab_preferidas": [1, 2, 3],
        "hab_pesos":      [0.35, 0.45, 0.20],
    },
    "arrendatario": {
        "count": 0.15,  # 15%
        "tipo_preferido": ["departamento", "suite", "casa"],
        "tipo_pesos":     [0.50, 0.30, 0.20],
        "rango_precio_min": 15_000,
        "rango_precio_max": 70_000,
        "transaccion_pref": ["alquiler", "venta"],
        "transaccion_pesos": [0.90, 0.10],
        "hab_preferidas": [1, 2, 3],
        "hab_pesos":      [0.40, 0.45, 0.15],
    },
}


def _perfil_aleatorio() -> str:
    nombres = list(PERFILES.keys())
    pesos   = [PERFILES[p]["count"] for p in nombres]
    return np.random.choice(nombres, p=pesos)


def generate_users(n: int = 60) -> pd.DataFrame:
    users = []
    for uid in range(1, n + 1):
        perfil = _perfil_aleatorio()
        p      = PERFILES[perfil]

        tipo_pref = np.random.choice(p["tipo_preferido"], p=p["tipo_pesos"])
        transaccion_pref = np.random.choice(p["transaccion_pref"], p=p["transaccion_pesos"])
        hab_pref = np.random.choice(p["hab_preferidas"], p=p["hab_pesos"])

        precio_min = p["rango_precio_min"]
        precio_max = p["rango_precio_max"]
        # Precio deseado: distribución normal centrada en la mitad del rango
        precio_mu  = (precio_min + precio_max) / 2
        precio_deseado = int(np.clip(
            np.random.normal(precio_mu, (precio_max - precio_min) / 4),
            precio_min, precio_max
        ))

        # Amenidades favoritas según perfil
        amenidad_piscina = perfil in ("familia", "inversor") and np.random.random() > 0.5
        amenidad_seguridad = np.random.random() > 0.4
        amenidad_parqueadero = perfil != "arrendatario" and np.random.random() > 0.4

        users.append({
            "user_id":            uid,
            "perfil":             perfil,
            "tipo_preferido":     tipo_pref,
            "transaccion_pref":   transaccion_pref,
            "precio_deseado":     precio_deseado,
            "precio_min":         precio_min,
            "precio_max":         precio_max,
            "hab_preferidas":     hab_pref,
            "pref_piscina":       amenidad_piscina,
            "pref_seguridad":     amenidad_seguridad,
            "pref_parqueadero":   amenidad_parqueadero,
        })

    return pd.DataFrame(users)


if __name__ == "__main__":
    df = generate_users(60)
    out_path = RAW_DIR / "synthetic_users.csv"
    df.to_csv(out_path, index=False)

    print("=" * 50)
    print("  GENERADOR DE USUARIOS SINTÉTICOS")
    print("=" * 50)
    print(f"\n[✓] {len(df)} usuarios generados")
    print(f"[✓] Guardado en: {out_path}\n")
    print("Distribución por perfil:")
    print(df["perfil"].value_counts().to_string())
    print("\nTipo de propiedad preferida:")
    print(df["tipo_preferido"].value_counts().to_string())
    print("\nTransacción preferida:")
    print(df["transaccion_pref"].value_counts().to_string())
