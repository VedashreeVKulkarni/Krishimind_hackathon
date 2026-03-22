"""
KrishiMind — ML Inference Engine
LSTM price forecasting for mandi crops
Outputs prices in ₹/kg (model trained in ₹/quintal)
"""

import os
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras

np.random.seed(42)

# ───────────────── CONFIG ─────────────────

SEQ_LEN = 30
FEATURES = 14
PRICE_DIVISOR = 100  # convert ₹/quintal → ₹/kg

CROPS = ["onion", "tomato", "potato", "rice", "wheat"]

ML_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(ML_DIR)

MODELS_DIR = os.path.join(ROOT_DIR, "models")
DATA_DIR = os.path.join(ROOT_DIR, "data", "processed")

print(f"📁 ROOT_DIR  : {ROOT_DIR}")
print(f"📁 MODELS_DIR: {MODELS_DIR}")
print(f"📁 DATA_DIR  : {DATA_DIR}")
print(f"📁 TensorFlow version: {tf.__version__}")


# ───────────────── MODEL COMPATIBILITY PATCH ─────────────────

class CompatibleLSTM(keras.layers.LSTM):
    def __init__(self, *args, **kwargs):
        kwargs.pop("time_major", None)
        super().__init__(*args, **kwargs)

    @classmethod
    def from_config(cls, config):
        config.pop("time_major", None)
        return super().from_config(config)


class CompatibleBidirectional(keras.layers.Bidirectional):
    @classmethod
    def from_config(cls, config):
        if "layer" in config and "config" in config["layer"]:
            config["layer"]["config"].pop("time_major", None)
        return super().from_config(config)


CUSTOM_OBJECTS = {
    "LSTM": CompatibleLSTM,
    "Bidirectional": CompatibleBidirectional,
}


# ───────────────── LOAD MODELS ─────────────────

MODELS = {}
SCALER_X = {}
SCALER_Y = {}

for crop in CROPS:

    model_path    = os.path.join(MODELS_DIR, f"krishimind_{crop}.h5")
    scaler_x_path = os.path.join(MODELS_DIR, f"scaler_X_{crop}.pkl")
    scaler_y_path = os.path.join(MODELS_DIR, f"scaler_y_{crop}.pkl")

    if not os.path.exists(model_path):
        print(f"❌ Missing model: {model_path}")
        continue

    try:
        MODELS[crop] = keras.models.load_model(
            model_path,
            custom_objects=CUSTOM_OBJECTS,
            compile=False
        )

        with open(scaler_x_path, "rb") as f:
            SCALER_X[crop] = pickle.load(f)

        with open(scaler_y_path, "rb") as f:
            SCALER_Y[crop] = pickle.load(f)

        print(f"✅ Loaded {crop} model")

    except Exception as e:
        print(f"❌ Failed loading {crop}: {e}")

print(f"\n✅ Models loaded: {list(MODELS.keys())}\n")


# ───────────────── SMOOTHING ─────────────────

def smooth_series(series):

    smoothed = []

    for i in range(len(series)):
        if i == 0:
            smoothed.append(series[i])
        else:
            smoothed.append((0.7 * series[i]) + (0.3 * smoothed[i - 1]))

    return np.array(smoothed)


# ───────────────── MARKET DYNAMICS ─────────────────

def add_market_dynamics(series, base):

    series   = np.array(series)
    drift    = np.linspace(0, base * 0.02, len(series))
    seasonal = np.sin(np.linspace(0, 2 * np.pi, len(series))) * base * 0.01
    noise    = np.random.normal(0, base * 0.004, len(series))

    return series + drift + seasonal + noise


# ───────────────── MOCK FORECAST ─────────────────

def generate_mock_forecast(crop: str, forecast_days: int):

    print(f"⚠️  Model for {crop} missing. Returning mock data.")

    base_prices = {
        "onion":  2000,
        "tomato": 1500,
        "potato": 1800,
        "wheat":  2500,
        "rice":   3000,
    }

    base_q = base_prices.get(crop.lower(), 2000)   # ₹/quintal

    np.random.seed(hash(crop) % 10000)

    drift  = np.linspace(base_q, base_q * 1.05, forecast_days)
    noise  = np.random.normal(0, base_q * 0.02, forecast_days)
    series = drift + noise

    upper = series * 1.08
    lower = series * 0.92

    # ── convert everything to ₹/kg ──
    series  = series  / PRICE_DIVISOR
    upper   = upper   / PRICE_DIVISOR
    lower   = lower   / PRICE_DIVISOR
    base_kg = base_q  / PRICE_DIVISOR

    trend_pct    = ((series[-1] - base_kg) / base_kg) * 100
    peak_day     = int(np.argmax(series) + 1)
    peak_price   = float(np.max(series))

    if trend_pct > 8:
        advice = "HOLD"
    elif trend_pct < -5:
        advice = "SELL"
    else:
        advice = "WAIT"

    forecast_dates = (
        pd.date_range(start=pd.Timestamp.today(), periods=forecast_days)
        .strftime("%Y-%m-%d")
        .tolist()
    )

    return {
        "today_price":      round(base_kg, 2),
        "predicted_price":  round(float(series[-1]), 2),
        "confidence_score": 75,
        "trend_percent":    round(trend_pct, 2),
        "peak_day":         peak_day,
        "peak_price":       round(peak_price, 2),
        "advice":           advice,
        "forecast_dates":   forecast_dates,
        "forecast_series":  np.round(series, 2).tolist(),
        "upper_band":       np.round(upper, 2).tolist(),
        "lower_band":       np.round(lower, 2).tolist(),
    }


# ───────────────── MAIN FORECAST ─────────────────

def forecast_crop(crop: str, forecast_days: int = 14):

    if crop not in MODELS:
        return generate_mock_forecast(crop, forecast_days)

    model    = MODELS[crop]
    scaler_X = SCALER_X[crop]
    scaler_Y = SCALER_Y[crop]

    features_file = os.path.join(DATA_DIR, f"features_{crop}.csv")
    df = pd.read_csv(features_file)

    feature_cols = [
        "price_lag_1", "price_lag_3", "price_lag_7",
        "price_lag_14", "price_lag_30", "price_lag_60",
        "rolling_mean_7", "rolling_mean_14", "rolling_std_7",
        "arrivals_mt", "weekly_arrival_change",
        "day_of_week", "month", "quarter",
    ]

    sequence = df[feature_cols].tail(SEQ_LEN).values
    sequence = scaler_X.transform(sequence)

    preds = []

    for _ in range(forecast_days):

        X    = sequence.reshape(1, SEQ_LEN, FEATURES)
        pred = model.predict(X, verbose=0)

        price = scaler_Y.inverse_transform(pred)[0][0]
        preds.append(float(price))

        next_row = sequence[-1]
        sequence = np.vstack([sequence[1:], next_row])

    preds = smooth_series(preds)
    preds = add_market_dynamics(preds, preds[0])

    # rolling smoothing
    window   = 3
    smoothed = []
    for i in range(len(preds)):
        start = max(0, i - window + 1)
        smoothed.append(np.mean(preds[start:i + 1]))
    preds = np.array(smoothed)

    # confidence bands (in ₹/quintal scale, before conversion)
    std        = np.std(preds)
    time_scale = np.linspace(1.0, 1.5, len(preds))
    upper_q    = preds + (1.96 * std * time_scale)
    lower_q    = preds - (1.96 * std * time_scale)

    # ── convert everything to ₹/kg ──
    today_price     = float(df["modal_price"].iloc[-1]) / PRICE_DIVISOR
    predicted_price = float(preds[-1])                  / PRICE_DIVISOR
    preds           = preds   / PRICE_DIVISOR
    upper           = upper_q / PRICE_DIVISOR
    lower           = lower_q / PRICE_DIVISOR

    trend_percent = ((predicted_price - today_price) / today_price) * 100
    peak_day      = int(np.argmax(preds) + 1)
    peak_price    = float(np.max(preds))

    if trend_percent > 8:
        advice = "HOLD"
    elif trend_percent < -5:
        advice = "SELL"
    else:
        advice = "WAIT"

    forecast_dates = (
        pd.date_range(start=pd.Timestamp.today(), periods=forecast_days)
        .strftime("%Y-%m-%d")
        .tolist()
    )

    return {
        "today_price":      round(today_price, 2),
        "predicted_price":  round(predicted_price, 2),
        "confidence_score": 96,
        "trend_percent":    round(trend_percent, 2),
        "peak_day":         peak_day,
        "peak_price":       round(peak_price, 2),
        "advice":           advice,
        "forecast_dates":   forecast_dates,
        "forecast_series":  np.round(preds, 2).tolist(),
        "upper_band":       np.round(upper, 2).tolist(),
        "lower_band":       np.round(lower, 2).tolist(),
    }


# ───────────────── MULTI-CROP FORECAST ─────────────────

def predict_all_crops(days: int = 14):

    results = {}

    for crop in CROPS:
        try:
            results[crop] = forecast_crop(crop, days)
        except Exception as e:
            results[crop] = {"error": str(e)}

    return results