# ml/evaluate.py
# ─────────────────────────────────────────────────────────────
#  KrishiMind — Model Evaluation
#
#  INPUT :
#     models/krishimind_{crop}.h5
#     models/scaler_y_{crop}.pkl
#     data/processed/X_{crop}.npy
#     data/processed/y_{crop}.npy
#
#  OUTPUT :
#     Console report
#     data/processed/eval_{crop}.csv
#
#  RUN :
#     python ml/evaluate.py
# ─────────────────────────────────────────────────────────────

import os
import sys
import pickle
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import CONFIG, DATA_PROC, MODELS_DIR


# ─────────────────────────────────────────────
# METRICS
# ─────────────────────────────────────────────

def calc_mape(y_true, y_pred):

    y_true = y_true.flatten()
    y_pred = y_pred.flatten()

    mask = y_true > 0

    return float(
        np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    )


def calc_rmse(y_true, y_pred):

    return float(
        np.sqrt(np.mean((y_true.flatten() - y_pred.flatten()) ** 2))
    )


def calc_mae(y_true, y_pred):

    return float(
        np.mean(np.abs(y_true.flatten() - y_pred.flatten()))
    )


# ─────────────────────────────────────────────
# EVALUATE ONE CROP
# ─────────────────────────────────────────────

def evaluate_crop(crop):

    model_path = os.path.join(MODELS_DIR, f"krishimind_{crop}.h5")
    scalery_path = os.path.join(MODELS_DIR, f"scaler_y_{crop}.pkl")
    x_path = os.path.join(DATA_PROC, f"X_{crop}.npy")
    y_path = os.path.join(DATA_PROC, f"y_{crop}.npy")

    for p, label in [
        (model_path, "model"),
        (scalery_path, "scaler_y"),
        (x_path, "X"),
        (y_path, "y")
    ]:

        if not os.path.exists(p):
            print(f"[SKIP] {crop} — missing {label}: {p}")
            return None

    import tensorflow as tf

    model = tf.keras.models.load_model(model_path, compile=False)

    X = np.load(x_path)
    y = np.load(y_path)

    with open(scalery_path, "rb") as f:
        scaler_y = pickle.load(f)

    n = len(X)

    n_test = int(n * CONFIG["test_split"])
    n_val = int(n * CONFIG["val_split"])

    X_test = X[n - n_test :]
    y_test = y[n - n_test :]

    y_pred_norm = model.predict(X_test, verbose=0)

    y_pred_real = scaler_y.inverse_transform(y_pred_norm).flatten()
    y_true_real = scaler_y.inverse_transform(y_test).flatten()

    mape = calc_mape(y_true_real, y_pred_real)
    rmse = calc_rmse(y_true_real, y_pred_real)
    mae = calc_mae(y_true_real, y_pred_real)

    eval_df = pd.DataFrame({
        "actual_price_q": y_true_real.round(0),
        "predicted_price_q": y_pred_real.round(0),
        "error_pct": (
            np.abs(y_true_real - y_pred_real) / y_true_real * 100
        ).round(2)
    })

    eval_df.to_csv(
        os.path.join(DATA_PROC, f"eval_{crop}.csv"),
        index=False
    )

    return {
        "crop": crop,
        "mape": mape,
        "rmse": rmse,
        "mae": mae,
        "samples": n_test,
        "pass": mape < CONFIG["target_mape"]
    }


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def run():

    print("\n" + "=" * 60)
    print("KrishiMind — Model Evaluation Report")
    print(f"Target: MAPE < {CONFIG['target_mape']}%")
    print("=" * 60)

    results = []
    all_pass = True

    for crop in CONFIG["crops"]:

        print(f"\nEvaluating {crop.upper()}...")

        res = evaluate_crop(crop)

        if res is None:
            all_pass = False
            continue

        results.append(res)

        status = "PASS ✓" if res["pass"] else "FAIL ✗"

        if not res["pass"]:
            all_pass = False

        print("-" * 40)
        print(f"{crop.upper():<10} {status}")
        print(f"MAPE : {res['mape']:.2f}%")
        print(f"RMSE : ₹{res['rmse']:.0f}/Q")
        print(f"MAE  : ₹{res['mae']:.0f}/Q")
        print(f"Test samples : {res['samples']}")
        print(f"Saved → data/processed/eval_{crop}.csv")

    print("\n" + "=" * 60)
    print(f"{'CROP':<12} {'MAPE':>8} {'RMSE':>10} {'MAE':>10} {'STATUS':>8}")
    print("=" * 60)

    for r in results:

        status = "PASS ✓" if r["pass"] else "FAIL ✗"

        print(
            f"{r['crop']:<12} "
            f"{r['mape']:>7.2f}% "
            f"₹{r['rmse']:>8.0f} "
            f"₹{r['mae']:>8.0f} "
            f"{status}"
        )

    print("=" * 60)

    if all_pass and results:

        print("\nAll models PASS — ready for backend deployment")

    else:

        print("\nSome models need tuning.")

    print()


if __name__ == "__main__":
    run()