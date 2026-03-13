# ml/train.py
# ─────────────────────────────────────────────────────────────
# KrishiMind — LSTM Training Script
#
# INPUT :
#   data/processed/X_{crop}.npy
#   data/processed/y_{crop}.npy
#
# OUTPUT :
#   models/krishimind_{crop}.h5
#
# RUN :
#   python ml/train.py
# ─────────────────────────────────────────────────────────────

import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import CONFIG, DATA_PROC, MODELS_DIR

os.makedirs(MODELS_DIR, exist_ok=True)

print("Loading TensorFlow...")

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

print(f"TensorFlow version: {tf.__version__}")
print(f"GPU Available: {len(tf.config.list_physical_devices('GPU')) > 0}")


# ─────────────────────────────────────────────
# MODEL ARCHITECTURE
# ─────────────────────────────────────────────
def build_lstm(seq_len: int, n_features: int):

    model = Sequential([
        Input(shape=(seq_len, n_features)),

        LSTM(
            CONFIG["lstm_units_1"],
            return_sequences=True
        ),
        Dropout(CONFIG["dropout_rate"]),

        LSTM(
            CONFIG["lstm_units_2"],
            return_sequences=False
        ),

        Dense(CONFIG["dense_units"], activation="relu"),
        Dense(1)
    ])

    model.compile(
        optimizer=Adam(learning_rate=CONFIG["learning_rate"]),
        loss="mae",
        metrics=["mape"]
    )

    return model


# ─────────────────────────────────────────────
# TRAIN ONE CROP
# ─────────────────────────────────────────────
def train_crop(crop):

    x_path = os.path.join(DATA_PROC, f"X_{crop}.npy")
    y_path = os.path.join(DATA_PROC, f"y_{crop}.npy")

    if not os.path.exists(x_path):
        print(f"[SKIP] {crop} dataset missing")
        return

    X = np.load(x_path)
    y = np.load(y_path)

    samples, seq_len, features = X.shape

    print(f"\nTraining crop: {crop}")
    print(f"Dataset shape: {X.shape}")

    # chronological split
    test_size = int(samples * CONFIG["test_split"])
    val_size = int(samples * CONFIG["val_split"])
    train_size = samples - test_size - val_size

    X_train = X[:train_size]
    y_train = y[:train_size]

    X_val = X[train_size:train_size + val_size]
    y_val = y[train_size:train_size + val_size]

    X_test = X[train_size + val_size:]
    y_test = y[train_size + val_size:]

    print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    model = build_lstm(seq_len, features)

    model.summary()

    save_path = os.path.join(MODELS_DIR, f"krishimind_{crop}.h5")

    callbacks = [

        EarlyStopping(
            monitor="val_loss",
            patience=CONFIG["patience"],
            min_delta=CONFIG["min_delta"],
            restore_best_weights=True
        ),

        ModelCheckpoint(
            save_path,
            monitor="val_loss",
            save_best_only=True
        ),

        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=8,
            min_lr=1e-6
        )
    ]

    print("Training model...")

    history = model.fit(
        X_train,
        y_train,
        epochs=CONFIG["epochs"],
        batch_size=CONFIG["batch_size"],
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=1
    )

    best_loss = min(history.history["val_loss"])

    print(f"\nBest validation loss: {best_loss:.6f}")
    print(f"Model saved to: {save_path}")

    return model


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def run():

    print("\n==============================")
    print("KrishiMind Model Training")
    print("==============================\n")

    trained = []

    for crop in CONFIG["crops"]:

        try:
            model = train_crop(crop)

            if model is not None:
                trained.append(crop)

        except Exception as e:
            print(f"Error training {crop}: {e}")

    print("\n==============================")
    print("Training complete")
    print("==============================")

    print("Trained models:", trained)
    print("Skipped models:", [c for c in CONFIG["crops"] if c not in trained])


if __name__ == "__main__":
    run()
import joblib

# after training your model
joblib.dump(model, "ml/model.pkl")
print("Model saved successfully")
