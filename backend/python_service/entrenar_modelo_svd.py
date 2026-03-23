"""
Entrenamiento del Modelo SVD con Split 80/20
=============================================
Entrena un modelo de Filtrado Colaborativo (Matrix Factorization SVD)
usando datos sintéticos. Reporta RMSE y MAE por época.

Flujo:
  1. Carga synthetic_interactions.csv
  2. Calcula rating ponderado: clicks×1 + favorito×5 + contacto×10
  3. Normaliza ratings a escala 1–5
  4. Split 80% entrenamiento / 20% prueba
  5. Entrena con SGD (factorización de matrices) por N épocas
  6. Reporta RMSE y MAE en train y test
  7. Guarda el modelo en models/svd_model.pkl

Uso:
  python train_svd.py
"""

import math
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).parent
DATA_DIR  = BASE_DIR / "data" / "raw"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

# ── Hiperparámetros ────────────────────────────────────────────────────────────
N_FACTORS    = 15      # Factores latentes (alineado con el servicio de producción)
N_EPOCHS     = 30      # Épocas de entrenamiento
LR           = 0.005   # Tasa de aprendizaje
REG          = 0.02    # Regularización L2 (evita overfitting)
RANDOM_STATE = 42


def _predict(P, Q, b_u, b_i, mu, u, i):
    return mu + b_u[u] + b_i[i] + P[u].dot(Q[i])


def _evaluate(rows, P, Q, b_u, b_i, mu, user_to_idx, prop_to_idx):
    preds, actuals = [], []
    for uid, pid, r in rows:
        u = user_to_idx.get(uid)
        i = prop_to_idx.get(pid)
        if u is None or i is None:
            continue
        preds.append(_predict(P, Q, b_u, b_i, mu, u, i))
        actuals.append(r)
    if not preds:
        return float("nan"), float("nan")
    rmse = math.sqrt(mean_squared_error(actuals, preds))
    mae  = mean_absolute_error(actuals, preds)
    return rmse, mae


def train():
    np.random.seed(RANDOM_STATE)

    print("=" * 55)
    print("  ENTRENAMIENTO: COLLABORATIVE FILTERING (SVD)")
    print("=" * 55)

    # ── 1. Cargar interacciones sintéticas ────────────────────────────────────
    inter_path = DATA_DIR / "interacciones_sinteticas.csv"
    if not inter_path.exists():
        print(f"\n[ERROR] No se encontró {inter_path}")
        print("  Ejecuta primero: python data/generate_synthetic_interactions.py")
        return

    df = pd.read_csv(inter_path)
    print(f"\n[1] {len(df)} interacciones cargadas")

    # ── 2. Calcular rating ponderado (VISTA=1, FAVORITO=5, CONTACTO=10) ───────
    df["rating"] = (
        df["clicks"].astype(float) * 1 +
        df["favorito"].astype(float) * 5 +
        df["contacto"].astype(float) * 10
    )

    # Normalizar a escala 1–5 para que RMSE sea interpretable
    r_min = df["rating"].min()
    r_max = df["rating"].max()
    df["rating_norm"] = 1.0 + 4.0 * (df["rating"] - r_min) / (r_max - r_min + 1e-9)
    print(f"[2] Rating normalizado (1–5). Media: {df['rating_norm'].mean():.3f}  "
          f"Std: {df['rating_norm'].std():.3f}")

    # ── 3. Split 80% entrenamiento / 20% prueba ───────────────────────────────
    train_df, test_df = train_test_split(df, test_size=0.20, random_state=RANDOM_STATE)
    print(f"[3] Split 80/20 → Entrenamiento: {len(train_df)} | Prueba: {len(test_df)}")

    # ── 4. Mapear IDs a índices ────────────────────────────────────────────────
    user_ids    = df["user_id"].unique()
    prop_ids    = df["property_id"].unique()
    user_to_idx = {uid: i for i, uid in enumerate(user_ids)}
    prop_to_idx = {pid: i for i, pid in enumerate(prop_ids)}
    n_users     = len(user_ids)
    n_props     = len(prop_ids)

    # ── 5. Inicializar matrices de factores latentes ───────────────────────────
    P   = np.random.normal(0, 0.1, (n_users, N_FACTORS))   # Factores de usuarios
    Q   = np.random.normal(0, 0.1, (n_props, N_FACTORS))   # Factores de propiedades
    b_u = np.zeros(n_users)                                 # Bias por usuario
    b_i = np.zeros(n_props)                                 # Bias por propiedad
    mu  = train_df["rating_norm"].mean()                    # Sesgo global

    train_rows = train_df[["user_id", "property_id", "rating_norm"]].values
    test_rows  = test_df[["user_id", "property_id", "rating_norm"]].values

    print(f"\n[4] Entrenando modelo SVD")
    print(f"    Factores latentes: {N_FACTORS}  |  Épocas: {N_EPOCHS}")
    print(f"    Learning rate: {LR}  |  Regularización L2: {REG}")
    print(f"    Usuarios: {n_users}  |  Propiedades: {n_props}")
    print()
    print(f"{'Época':>6}  {'RMSE Train':>11}  {'MAE Train':>10}")
    print("-" * 34)

    # ── 6. Entrenamiento SGD por épocas ────────────────────────────────────────
    for epoch in range(1, N_EPOCHS + 1):
        np.random.shuffle(train_rows)

        for uid, pid, r in train_rows:
            u = user_to_idx.get(uid)
            i = prop_to_idx.get(pid)
            if u is None or i is None:
                continue

            pred = _predict(P, Q, b_u, b_i, mu, u, i)
            err  = float(r) - pred

            # Actualizar biases
            b_u[u] += LR * (err - REG * b_u[u])
            b_i[i] += LR * (err - REG * b_i[i])

            # Actualizar factores latentes
            P_u_old = P[u].copy()
            P[u]   += LR * (err * Q[i] - REG * P[u])
            Q[i]   += LR * (err * P_u_old - REG * Q[i])

        # Reportar RMSE y MAE cada 5 épocas
        if epoch == 1 or epoch % 5 == 0 or epoch == N_EPOCHS:
            rmse_tr, mae_tr = _evaluate(
                train_rows, P, Q, b_u, b_i, mu, user_to_idx, prop_to_idx
            )
            print(f"  {epoch:>4}    {rmse_tr:>9.4f}    {mae_tr:>8.4f}")

    # ── 7. Evaluación en test set ──────────────────────────────────────────────
    rmse_test, mae_test = _evaluate(
        test_rows, P, Q, b_u, b_i, mu, user_to_idx, prop_to_idx
    )

    print()
    print("=" * 55)
    print("  RESULTADOS EN TEST SET (20%)")
    print("=" * 55)
    print(f"  RMSE : {rmse_test:.4f}")
    print(f"  MAE  : {mae_test:.4f}")
    print("=" * 55)

    # ── 8. Guardar modelo ──────────────────────────────────────────────────────
    model = {
        "P":           P,
        "Q":           Q,
        "b_u":         b_u,
        "b_i":         b_i,
        "mu":          mu,
        "user_to_idx": user_to_idx,
        "prop_to_idx": prop_to_idx,
        "prop_ids":    prop_ids,
        "n_factors":   N_FACTORS,
    }
    model_path = MODEL_DIR / "svd_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print(f"\n[✓] Modelo guardado en: {model_path}")


if __name__ == "__main__":
    train()
