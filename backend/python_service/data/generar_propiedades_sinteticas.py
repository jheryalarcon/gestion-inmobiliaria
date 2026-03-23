"""
Generador de Propiedades Sintéticas
====================================
Genera 150 propiedades inmobiliarias con características coherentes
para Ecuador, usando distribuciones controladas con np.random.seed(42).

Exporta: data/raw/synthetic_properties.csv
"""

import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ── Distribuciones de tipo de propiedad ────────────────────────────────────────
TIPOS = {
    "casa":            {"peso": 0.35, "precio_mu": 120_000, "precio_sigma": 50_000, "hab_mu": 3.5, "ban_mu": 2.5},
    "departamento":    {"peso": 0.28, "precio_mu":  75_000, "precio_sigma": 30_000, "hab_mu": 2.5, "ban_mu": 1.8},
    "suite":           {"peso": 0.08, "precio_mu":  55_000, "precio_sigma": 20_000, "hab_mu": 1.0, "ban_mu": 1.0},
    "terreno":         {"peso": 0.12, "precio_mu":  40_000, "precio_sigma": 25_000, "hab_mu": 0.0, "ban_mu": 0.0},
    "local_comercial": {"peso": 0.09, "precio_mu":  90_000, "precio_sigma": 40_000, "hab_mu": 0.0, "ban_mu": 1.0},
    "finca":           {"peso": 0.05, "precio_mu": 180_000, "precio_sigma": 80_000, "hab_mu": 3.0, "ban_mu": 2.0},
    "oficina":         {"peso": 0.03, "precio_mu":  60_000, "precio_sigma": 25_000, "hab_mu": 0.0, "ban_mu": 1.0},
}

# ── Ciudades y provincias de Ecuador ───────────────────────────────────────────
CIUDADES = [
    ("Quito",         "Pichincha",     0.30),
    ("Guayaquil",     "Guayas",        0.25),
    ("Cuenca",        "Azuay",         0.15),
    ("Santo Domingo", "Santo_Domingo", 0.10),
    ("Ambato",        "Tungurahua",    0.08),
    ("Manta",         "Manabi",        0.06),
    ("Loja",          "Loja",          0.06),
]

TRANSACCIONES = [("venta", 0.62), ("alquiler", 0.38)]


def _tipo_aleatorio():
    tipos  = list(TIPOS.keys())
    pesos  = [TIPOS[t]["peso"] for t in tipos]
    return np.random.choice(tipos, p=pesos)


def _ciudad_aleatoria():
    ciudades  = [(c[0], c[1]) for c in CIUDADES]
    pesos     = [c[2] for c in CIUDADES]
    idx = np.random.choice(len(ciudades), p=pesos)
    return ciudades[idx]


def _transaccion_aleatoria():
    ops   = [t[0] for t in TRANSACCIONES]
    pesos = [t[1] for t in TRANSACCIONES]
    return np.random.choice(ops, p=pesos)


def _precio(tipo: str, transaccion: str) -> float:
    mu    = TIPOS[tipo]["precio_mu"]
    sigma = TIPOS[tipo]["precio_sigma"]
    precio = max(10_000, np.random.normal(mu, sigma))
    # El alquiler es aprox 0.6% del precio de venta por mes
    if transaccion == "alquiler":
        precio = precio * 0.006
    return round(precio, 2)


def _habitaciones(tipo: str) -> int:
    mu = TIPOS[tipo]["hab_mu"]
    if mu == 0:
        return 0
    val = int(np.clip(np.random.normal(mu, 0.8), 1, 8))
    return val


def _banios(tipo: str, hab: int) -> int:
    mu = TIPOS[tipo]["ban_mu"]
    if mu == 0:
        return 0
    val = int(np.clip(np.random.normal(mu, 0.5), 1, max(1, hab)))
    return val


def _area(tipo: str) -> tuple:
    if tipo == "terreno":
        area_t = round(max(50, np.random.normal(600, 300)), 1)
        return area_t, 0.0
    elif tipo == "finca":
        area_t = round(max(500, np.random.normal(5000, 3000)), 1)
        area_c = round(max(50, np.random.normal(200, 80)), 1)
        return area_t, area_c
    else:
        area_c = round(max(30, np.random.normal(120, 60)), 1)
        area_t = round(area_c * np.random.uniform(1.0, 1.5), 1)
        return area_t, area_c


def _amenidades(tipo: str, precio: float) -> dict:
    """Las amenidades se correlacionan con el precio y tipo."""
    es_premium = precio > 80_000
    es_casa    = tipo in ("casa", "finca")
    es_depto   = tipo in ("departamento", "suite")

    def prob(base, extra=0.0):
        return float(base + extra) > np.random.random()

    return {
        "tiene_piscina":         prob(0.05, 0.20 if es_casa and es_premium else 0),
        "tiene_seguridad":       prob(0.30, 0.30 if es_premium else 0),
        "tiene_ascensor":        prob(0.05, 0.40 if es_depto else 0),
        "tiene_area_bbq":        prob(0.10, 0.15 if es_casa else 0),
        "tiene_terraza":         prob(0.15, 0.20 if es_depto else 0.05 if es_casa else 0),
        "tiene_balcon":          prob(0.20, 0.25 if es_depto else 0),
        "tiene_patio":           prob(0.05, 0.40 if es_casa else 0),
        "tiene_bodega":          prob(0.15, 0.10 if es_premium else 0),
        "tiene_areas_comunales": prob(0.10, 0.35 if es_depto else 0),
        "amoblado":              prob(0.15, 0.10 if es_depto else 0),
    }


def generate_properties(n: int = 150) -> pd.DataFrame:
    props = []
    for pid in range(1, n + 1):
        tipo       = _tipo_aleatorio()
        ciudad, prov = _ciudad_aleatoria()
        transaccion = _transaccion_aleatoria()
        precio      = _precio(tipo, transaccion)
        hab         = _habitaciones(tipo)
        ban         = _banios(tipo, hab)
        area_t, area_c = _area(tipo)
        amenidades  = _amenidades(tipo, precio)
        park = int(np.clip(np.random.poisson(1.0 if hab >= 3 else 0.5), 0, 4))

        prop = {
            "id":               pid,
            "tipo_propiedad":   tipo,
            "transaccion":      transaccion,
            "precio":           precio,
            "ciudad":           ciudad,
            "provincia":        prov,
            "nro_habitaciones": hab,
            "nro_banos":        ban,
            "nro_parqueaderos": park,
            "area_terreno":     area_t,
            "area_construccion": area_c,
        }
        prop.update(amenidades)
        props.append(prop)

    return pd.DataFrame(props)


if __name__ == "__main__":
    df = generate_properties(150)
    out_path = RAW_DIR / "synthetic_properties.csv"
    df.to_csv(out_path, index=False)

    print("=" * 50)
    print("  GENERADOR DE PROPIEDADES SINTÉTICAS")
    print("=" * 50)
    print(f"\n[✓] {len(df)} propiedades generadas")
    print(f"[✓] Guardado en: {out_path}\n")
    print("Distribución por tipo:")
    print(df["tipo_propiedad"].value_counts().to_string())
    print("\nDistribución por ciudad:")
    print(df["ciudad"].value_counts().to_string())
    print(f"\nPrecio promedio: ${df['precio'].mean():,.2f}")
