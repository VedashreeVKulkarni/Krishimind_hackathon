# ml/preprocess.py
# ─────────────────────────────────────────────────────────────
# KrishiMind — Data Preprocessing & Feature Engineering
#
# INPUT :
#   data/raw/{crop}.csv
#
# OUTPUT :
#   data/processed/X_{crop}.npy
#   data/processed/y_{crop}.npy
#   data/processed/features_{crop}.csv
#
#   models/scaler_X_{crop}.pkl
#   models/scaler_y_{crop}.pkl
#
# RUN :
#   python ml/preprocess.py
# ─────────────────────────────────────────────────────────────

import os
import sys
import pickle
import warnings
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import CONFIG, DATA_RAW, DATA_PROC, MODELS_DIR

os.makedirs(DATA_PROC, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


# ─────────────────────────────────────────────
# LOAD AND CLEAN AGMARKNET DATA
# ─────────────────────────────────────────────

def load_and_clean(crop):

    path = os.path.join(DATA_RAW, f"{crop}.csv")

    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing file: {path}")

    df = pd.read_csv(
        path,
        header=1,
        skipinitialspace=True,
        low_memory=False
    )

    df.columns = df.columns.str.strip()

    rename = {
        "Modal Price": "modal_price",
        "Min Price": "min_price",
        "Max Price": "max_price",
        "Arrival Quantity": "arrivals_mt",
        "Arrival Date": "date",
        "Price Date": "date",
    }

    df = df.rename(columns={k: v for k, v in rename.items() if k in df.columns})

    if "modal_price" not in df.columns:
        raise ValueError("Modal Price column not found")

    # clean prices
    df["modal_price"] = (
        df["modal_price"]
        .astype(str)
        .str.replace('"', '')
        .str.replace(',', '')
        .astype(float)
    )

    if "arrivals_mt" in df.columns:
        df["arrivals_mt"] = (
            df["arrivals_mt"]
            .astype(str)
            .str.replace('"', '')
            .str.replace(',', '')
            .replace('', np.nan)
        )
        df["arrivals_mt"] = pd.to_numeric(df["arrivals_mt"], errors="coerce")

    df = df.dropna(subset=["modal_price"])

    df["date"] = pd.to_datetime(
        df["date"].astype(str),
        dayfirst=True,
        errors="coerce"
    )

    df = df.dropna(subset=["date"])
    df = df.drop_duplicates(subset=["date"])

    # aggregate multiple mandis per day
    df = (
        df.groupby("date")
        .agg(
            modal_price=("modal_price", "mean"),
            arrivals_mt=("arrivals_mt", "mean")
        )
        .reset_index()
        .sort_values("date")
    )

    return df


# ─────────────────────────────────────────────
# FEATURE ENGINEERING
# ─────────────────────────────────────────────

def add_features(df):

    price = df["modal_price"]

    # lag features
    for lag in [1, 3, 7, 14, 30, 60]:
        df[f"price_lag_{lag}"] = price.shift(lag)

    # rolling features
    df["rolling_mean_7"] = price.rolling(7, min_periods=1).mean()
    df["rolling_mean_14"] = price.rolling(14, min_periods=1).mean()
    df["rolling_std_7"] = price.rolling(7, min_periods=2).std().fillna(0)

    # arrivals
    mean_arr = df["arrivals_mt"].mean()

    df["arrivals_mt"] = df["arrivals_mt"].fillna(mean_arr)

    df["weekly_arrival_change"] = (
        df["arrivals_mt"]
        .pct_change(7)
        .fillna(0)
        .clip(-2, 2)
    )

    # calendar
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["quarter"] = df["date"].dt.quarter

    df = df.dropna(subset=CONFIG["feature_cols"])

    return df


# ─────────────────────────────────────────────
# SEQUENCE GENERATION
# ─────────────────────────────────────────────

def make_sequences(df, crop):

    features = CONFIG["feature_cols"]
    seq_len = CONFIG["seq_len"]

    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled = scaler_X.fit_transform(df[features].values)
    y_scaled = scaler_y.fit_transform(df[["modal_price"]].values)

    X = []
    y = []

    for i in range(seq_len, len(X_scaled)):
        X.append(X_scaled[i-seq_len:i])
        y.append(y_scaled[i])

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.float32)

    # save scalers
    with open(os.path.join(MODELS_DIR, f"scaler_X_{crop}.pkl"), "wb") as f:
        pickle.dump(scaler_X, f)

    with open(os.path.join(MODELS_DIR, f"scaler_y_{crop}.pkl"), "wb") as f:
        pickle.dump(scaler_y, f)

    return X, y


# ─────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────

def run():

    print("\nKrishiMind Preprocessing Pipeline\n")

    for crop in CONFIG["crops"]:

        print(f"Processing {crop}...")

        try:

            df = load_and_clean(crop)

            if len(df) < CONFIG["seq_len"] + 60:
                print(f"Skipping {crop} — insufficient data")
                continue

            df = add_features(df)

            df.to_csv(
                os.path.join(DATA_PROC, f"features_{crop}.csv"),
                index=False
            )

            X, y = make_sequences(df, crop)

            np.save(os.path.join(DATA_PROC, f"X_{crop}.npy"), X)
            np.save(os.path.join(DATA_PROC, f"y_{crop}.npy"), y)

            print(f"Saved sequences for {crop}: {X.shape}")

        except Exception as e:

            print(f"Error processing {crop}: {e}")


if __name__ == "__main__":
    run()