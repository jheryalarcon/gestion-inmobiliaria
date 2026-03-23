"""
Evaluación de Métricas de Ranking — Filtrado Basado en Contenido
=================================================================
Evalúa la calidad de las recomendaciones del sistema usando las métricas
estándar de ranking para sistemas de recomendación basados en contenido:

  - Precision@K : % de los Top-K recomendados que son relevantes
  - Recall@K    : % de los ítems relevantes capturados en los Top-K
  - NDCG@K      : calidad del orden de la lista de recomendaciones

El sistema replica el algoritmo de producción (recomendaciones_service.py):
  1. Vectoriza cada propiedad (precio, tipo, amenidades, etc.)
  2. Construye el perfil de cada cliente como suma ponderada de los
     vectores de las propiedades con las que interactuó
     (vistas=1, favorito=5, contacto=10)
  3. Aplica TruncatedSVD para reducir dimensionalidad
  4. Calcula similitud coseno entre perfil y candidatas
  5. Retorna Top-K excluyendo las ya interactuadas

Partición: 80% de interacciones como historial del cliente
           20% como conjunto de prueba (ítems a descubrir)

Una propiedad se considera RELEVANTE si el cliente interactuó con ella
con puntaje >= 6 (equivale a favorito o contacto, no solo una vista).

Genera gráficas en data/output/ para K = 1, 2, 3, 5, 10.

Uso:
  python evaluar_metricas.py
"""

import math
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
from sklearn.model_selection import train_test_split

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
DATA_DIR   = BASE_DIR / "data" / "raw"
OUTPUT_DIR = BASE_DIR / "data" / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE      = 42
UMBRAL_RELEVANCIA = 6     # peso >= 6 → al menos favorito+1vista o contacto
K_VALUES          = [1, 2, 3, 5, 10]
N_COMPONENTS_SVD  = 15    # igual que en producción


# ══════════════════════════════════════════════════════════════════════════════
#  Vectorización de propiedades (réplica de recomendaciones_service.py)
# ══════════════════════════════════════════════════════════════════════════════

def _vectorizar_propiedad(prop: dict) -> np.ndarray:
    feats = []
    precio = float(prop.get("precio", 0) or 0)
    feats.append(min(precio / 500_000, 3.0))
    feats.append(float(prop.get("nro_habitaciones", 0) or 0) / 6.0)
    feats.append(float(prop.get("nro_banos", 0) or 0) / 5.0)
    feats.append(float(prop.get("nro_parqueaderos", 0) or 0) / 4.0)
    feats.append(min(float(prop.get("area_construccion", 0) or 0) / 500.0, 2.0))
    feats.append(min(float(prop.get("area_terreno", 0) or 0) / 1000.0, 2.0))

    tipos = ["casa", "departamento", "suite", "local_comercial", "terreno",
             "finca", "quinta", "oficina", "bodega_galpon", "edificio"]
    tipo_actual = prop.get("tipo_propiedad", "")
    feats.extend([1.0 if tipo_actual == t else 0.0 for t in tipos])

    transacciones = ["venta", "alquiler", "alquiler_opcion_compra"]
    trans_actual = prop.get("transaccion", "")
    feats.extend([1.0 if trans_actual == t else 0.0 for t in transacciones])

    amenidades = [
        "tiene_piscina", "tiene_seguridad", "tiene_ascensor", "tiene_area_bbq",
        "tiene_terraza", "tiene_balcon", "tiene_patio", "tiene_bodega",
        "tiene_areas_comunales", "amoblado",
    ]
    for am in amenidades:
        feats.append(2.0 if prop.get(am) else 0.0)

    return np.array(feats, dtype=np.float32)


def _recomendar(uid, historial_uids_pesos, props_dict, mat_reducida,
                ids_ordenados, excluir_ids, max_k):
    """Replica del algoritmo de produccion para un usuario, usando SVD ya ajustado."""
    # ── Perfil del usuario ────────────────────────────────────────────────────
    n_dims     = mat_reducida.shape[1]
    perfil     = np.zeros(n_dims, dtype=np.float32)
    total_peso = 0.0

    # Buscar la fila de cada propiedad ya reducida usando su índice
    idx_map = {pid: i for i, pid in enumerate(ids_ordenados)}
    for pid, peso in historial_uids_pesos.items():
        if pid in idx_map:
            perfil     += mat_reducida[idx_map[pid]] * peso
            total_peso += peso

    if total_peso == 0:
        return []
    perfil /= total_peso

    # ── Similitud coseno ──────────────────────────────────────────────────────
    norma_mat    = normalize(mat_reducida)
    norma_perfil = normalize(perfil.reshape(1, -1))[0]
    scores       = norma_mat.dot(norma_perfil)

    ranking = sorted(
        zip(ids_ordenados, scores.tolist()),
        key=lambda x: x[1], reverse=True
    )
    return [pid for pid, _ in ranking if pid not in excluir_ids][:max_k]


# ══════════════════════════════════════════════════════════════════════════════
#  Métricas de ranking
# ══════════════════════════════════════════════════════════════════════════════

def precision_at_k(recomendados, relevantes, k):
    hits = len(set(recomendados[:k]) & relevantes)
    return hits / k if k > 0 else 0.0


def recall_at_k(recomendados, relevantes, k):
    hits = len(set(recomendados[:k]) & relevantes)
    return hits / len(relevantes) if relevantes else 0.0


def ndcg_at_k(recomendados, relevantes, k):
    top_k = recomendados[:k]

    def dcg(items):
        return sum(
            1.0 / math.log2(rank + 2)
            for rank, pid in enumerate(items)
            if pid in relevantes
        )

    ideal_dcg = dcg(list(relevantes)[:k])
    return dcg(top_k) / ideal_dcg if ideal_dcg > 0 else 0.0


# ══════════════════════════════════════════════════════════════════════════════
#  Evaluación principal
# ══════════════════════════════════════════════════════════════════════════════

def evaluate():
    print("=" * 57)
    print("  EVALUACION DE METRICAS — SISTEMA BASADO EN CONTENIDO")
    print("=" * 57)

    # ── 1. Cargar datos ────────────────────────────────────────────────────────
    inter_path = DATA_DIR / "interacciones_sinteticas.csv"
    props_path = DATA_DIR / "propiedades_sinteticas.csv"

    for p in [inter_path, props_path]:
        if not p.exists():
            print(f"\n[ERROR] No se encontro: {p}")
            print("  Ejecuta primero: python data/generar_datos_sinteticos.py")
            return

    inter_df = pd.read_csv(inter_path)
    props_df  = pd.read_csv(props_path)

    # Puntaje de interacción: vistas×1 + favorito×5 + contacto×10
    inter_df["peso"] = (
        inter_df["clicks"] * 1 +
        inter_df["favorito"] * 5 +
        inter_df["contacto"] * 10
    )

    print(f"\n[1] {len(inter_df)} interacciones | {len(props_df)} propiedades")

    # ── 2. Split 80/20 ────────────────────────────────────────────────────────
    train_df, test_df = train_test_split(inter_df, test_size=0.20, random_state=RANDOM_STATE)
    print(f"[2] Split 80/20 -> Historial (train): {len(train_df)} | Prueba (test): {len(test_df)}")

    # Historial por usuario (80%) → peso acumulado por propiedad
    historial = (
        train_df
        .groupby(["user_id", "property_id"])["peso"]
        .sum()
        .reset_index()
    )

    # Relevantes en test (20%): peso >= UMBRAL (favorito o contacto)
    relevantes_por_usuario = (
        test_df[test_df["peso"] >= UMBRAL_RELEVANCIA]
        .groupby("user_id")["property_id"]
        .apply(set)
        .to_dict()
    )

    vistos_train_por_usuario = (
        train_df.groupby("user_id")["property_id"].apply(set).to_dict()
    )

    usuarios_eval = [
        uid for uid in relevantes_por_usuario
        if len(relevantes_por_usuario[uid]) > 0
    ]
    print(f"[3] Usuarios evaluables (con relevantes en test): {len(usuarios_eval)}")
    print(f"    Umbral relevancia: peso >= {UMBRAL_RELEVANCIA} (favorito + vista, o contacto)")

    # ── 3. Preparar matriz de propiedades y SVD (una sola vez) ────────────────
    ids_ordenados = props_df["id"].tolist()
    props_dict    = props_df.set_index("id").to_dict("index")

    matriz_props = np.array(
        [_vectorizar_propiedad(props_dict[pid]) for pid in ids_ordenados],
        dtype=np.float32
    )
    n_comp = min(N_COMPONENTS_SVD, len(ids_ordenados) - 1, matriz_props.shape[1] - 1)
    if n_comp >= 2:
        svd          = TruncatedSVD(n_components=n_comp, random_state=RANDOM_STATE)
        mat_reducida = svd.fit_transform(matriz_props)
    else:
        mat_reducida = matriz_props

    print(f"    TruncatedSVD ajustado: {matriz_props.shape[0]} props x {n_comp} componentes")

    # ── 4. Calcular metricas para cada K ───────────────────────────────────────
    max_k      = max(K_VALUES)
    resultados = {k: {"precision": [], "recall": [], "ndcg": []} for k in K_VALUES}

    print(f"\n[4] Calculando recomendaciones para {len(usuarios_eval)} usuarios...")

    for idx, uid in enumerate(usuarios_eval, 1):
        hist_usuario = (
            historial[historial["user_id"] == uid]
            .set_index("property_id")["peso"]
            .to_dict()
        )
        excluir      = vistos_train_por_usuario.get(uid, set())
        relevantes   = relevantes_por_usuario[uid]
        recomendados = _recomendar(
            uid, hist_usuario, props_dict, mat_reducida, ids_ordenados, excluir, max_k
        )

        for k in K_VALUES:
            resultados[k]["precision"].append(precision_at_k(recomendados, relevantes, k))
            resultados[k]["recall"].append(recall_at_k(recomendados, relevantes, k))
            resultados[k]["ndcg"].append(ndcg_at_k(recomendados, relevantes, k))

    # ── 4. Tabla de resultados ─────────────────────────────────────────────────
    print(f"\n{'─'*54}")
    print(f"  METRICAS DE RANKING (promedio sobre {len(usuarios_eval)} usuarios)")
    print(f"{'─'*54}")
    print(f"  {'K':>4}  {'Precision@K':>12}  {'Recall@K':>10}  {'NDCG@K':>8}")
    print(f"  {'─'*4}  {'─'*12}  {'─'*10}  {'─'*8}")

    k_vals, prec_vals, rec_vals, ndcg_vals = [], [], [], []
    for k in K_VALUES:
        p = np.mean(resultados[k]["precision"])
        r = np.mean(resultados[k]["recall"])
        n = np.mean(resultados[k]["ndcg"])
        print(f"  {k:>4}   {p:>11.4f}   {r:>9.4f}   {n:>7.4f}")
        k_vals.append(k); prec_vals.append(p)
        rec_vals.append(r); ndcg_vals.append(n)

    print(f"{'─'*54}")

    # ── 5. Gráficas ────────────────────────────────────────────────────────────
    _plot_metric(k_vals, prec_vals, "Precision@K", "Valores de K", "Precision@K",
                 "#4A90D9", OUTPUT_DIR / "precision_at_k.png")
    _plot_metric(k_vals, rec_vals,  "Recall@K",    "Valores de K", "Recall@K",
                 "#E67E22", OUTPUT_DIR / "recall_at_k.png")
    _plot_metric(k_vals, ndcg_vals, "NDCG@K",      "Valores de K", "NDCG@K",
                 "#2ECC71", OUTPUT_DIR / "ndcg_at_k.png")
    _plot_combined(k_vals, prec_vals, rec_vals, ndcg_vals,
                   OUTPUT_DIR / "metricas_combinadas.png")

    print(f"\n[*] Graficas guardadas en: {OUTPUT_DIR}")
    print("=" * 57)
    print("  EVALUACION COMPLETADA")
    print("=" * 57)


# ══════════════════════════════════════════════════════════════════════════════
#  Graficado
# ══════════════════════════════════════════════════════════════════════════════

def _plot_metric(k_vals, values, title, xlabel, ylabel, color, out_path):
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(k_vals, values, marker="o", linewidth=2.5, color=color,
            markersize=8, markerfacecolor="white", markeredgewidth=2.5)
    for k, v in zip(k_vals, values):
        ax.annotate(f"{v:.3f}", (k, v), textcoords="offset points",
                    xytext=(0, 10), ha="center", fontsize=10, color=color)
    ax.set_title(title, fontsize=14, fontweight="bold", pad=12)
    ax.set_xlabel(xlabel, fontsize=11)
    ax.set_ylabel(ylabel, fontsize=11)
    ax.set_xticks(k_vals)
    ax.set_ylim(0, min(1.05, max(values) * 1.3 + 0.05) if max(values) > 0 else 0.1)
    ax.grid(True, linestyle="--", alpha=0.5)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()


def _plot_combined(k_vals, prec, rec, ndcg, out_path):
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(k_vals, prec, marker="o", linewidth=2.5, color="#4A90D9",
            label="Precision@K", markersize=8, markerfacecolor="white", markeredgewidth=2.5)
    ax.plot(k_vals, rec,  marker="s", linewidth=2.5, color="#E67E22",
            label="Recall@K",    markersize=8, markerfacecolor="white", markeredgewidth=2.5)
    ax.plot(k_vals, ndcg, marker="^", linewidth=2.5, color="#2ECC71",
            label="NDCG@K",      markersize=8, markerfacecolor="white", markeredgewidth=2.5)
    ax.set_title("Metricas de Ranking — Recomendacion Inmobiliaria (Content-Based + SVD)",
                 fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Valores de K", fontsize=11)
    ax.set_ylabel("Puntaje", fontsize=11)
    ax.set_xticks(k_vals)
    ax.set_ylim(0, 1.05)
    ax.legend(fontsize=11)
    ax.grid(True, linestyle="--", alpha=0.5)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()


if __name__ == "__main__":
    evaluate()
