# ml/transformer.py
# ─────────────────────────────────────────────────────────────
#  KrishiMind — Transformer Model (Alternative to LSTM)
#
#  Implements a lightweight Time Series Transformer:
#    Input Embedding → Positional Encoding
#    → Transformer Encoder Block (Multi-Head Attention + FFN)
#    → Global Average Pooling → Dense Output
#
#  RUN   : cd KRISHIMIND && python ml/transformer.py
#  OUTPUT: models/krishimind_transformer_{crop}.keras
#
#  After running both train.py and transformer.py,
#  compare MAPE on the same test set and use the better model.
# ─────────────────────────────────────────────────────────────

import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import CONFIG, DATA_PROC, MODELS_DIR

os.makedirs(MODELS_DIR, exist_ok=True)

print("Loading TensorFlow...")
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

print(f"  TensorFlow {tf.__version__}")


# ════════════════════════════════════════════════════════════════
# POSITIONAL ENCODING
# ════════════════════════════════════════════════════════════════
class PositionalEncoding(layers.Layer):
    """
    Add sinusoidal positional encoding to input embeddings.
    Lets the Transformer know the temporal order of each day.
    """
    def __init__(self, seq_len: int, d_model: int, **kwargs):
        super().__init__(**kwargs)
        self.seq_len = seq_len
        self.d_model = d_model

        # Build encoding matrix once
        positions = np.arange(seq_len)[:, np.newaxis]          # (seq_len, 1)
        dims      = np.arange(d_model)[np.newaxis, :]           # (1, d_model)
        angles    = positions / np.power(10000, (2 * (dims // 2)) / d_model)

        # Apply sin to even indices, cos to odd
        angles[:, 0::2] = np.sin(angles[:, 0::2])
        angles[:, 1::2] = np.cos(angles[:, 1::2])

        self.pos_encoding = tf.cast(angles[np.newaxis, :, :], dtype=tf.float32)

    def call(self, x):
        return x + self.pos_encoding[:, :tf.shape(x)[1], :]

    def get_config(self):
        config = super().get_config()
        config.update({"seq_len": self.seq_len, "d_model": self.d_model})
        return config


# ════════════════════════════════════════════════════════════════
# TRANSFORMER ENCODER BLOCK
# ════════════════════════════════════════════════════════════════
class TransformerEncoderBlock(layers.Layer):
    """
    Single Transformer encoder block:
      MultiHeadAttention → Add & Norm → FFN → Add & Norm
    """
    def __init__(self, d_model: int, n_heads: int, ff_dim: int,
                 dropout: float = 0.1, **kwargs):
        super().__init__(**kwargs)
        self.attention  = layers.MultiHeadAttention(
            num_heads=n_heads, key_dim=d_model // n_heads, dropout=dropout
        )
        self.ffn        = tf.keras.Sequential([
            layers.Dense(ff_dim, activation="relu"),
            layers.Dropout(dropout),
            layers.Dense(d_model),
        ])
        self.norm1      = layers.LayerNormalization(epsilon=1e-6)
        self.norm2      = layers.LayerNormalization(epsilon=1e-6)
        self.drop1      = layers.Dropout(dropout)
        self.drop2      = layers.Dropout(dropout)

    def call(self, x, training=False):
        # Self-attention
        attn_out = self.attention(x, x, training=training)
        x        = self.norm1(x + self.drop1(attn_out, training=training))
        # Feed-forward
        ffn_out  = self.ffn(x, training=training)
        x        = self.norm2(x + self.drop2(ffn_out, training=training))
        return x

    def get_config(self):
        config = super().get_config()
        return config


# ════════════════════════════════════════════════════════════════
# FULL TRANSFORMER MODEL
# ════════════════════════════════════════════════════════════════
def build_transformer(seq_len: int, n_features: int,
                      d_model: int = 64, n_heads: int = 4,
                      ff_dim: int = 128, n_blocks: int = 2,
                      dropout: float = 0.1) -> Model:
    """
    Architecture:
      Input (seq_len, n_features)
      → Linear projection to d_model
      → Positional Encoding
      → N × TransformerEncoderBlock
      → Global Average Pooling
      → Dense(32, relu)
      → Dense(1)  ← price prediction
    """
    inputs = tf.keras.Input(shape=(seq_len, n_features), name="price_sequence")

    # Project features → d_model dimension
    x = layers.Dense(d_model, name="input_projection")(inputs)

    # Add positional encoding
    x = PositionalEncoding(seq_len, d_model, name="positional_encoding")(x)
    x = layers.Dropout(dropout)(x)

    # Transformer encoder blocks
    for i in range(n_blocks):
        x = TransformerEncoderBlock(
            d_model=d_model, n_heads=n_heads, ff_dim=ff_dim,
            dropout=dropout, name=f"transformer_block_{i}"
        )(x)

    # Pool across time → single vector
    x = layers.GlobalAveragePooling1D(name="global_avg_pool")(x)

    # Dense head
    x = layers.Dense(32, activation="relu", name="dense_hidden")(x)
    x = layers.Dropout(dropout)(x)
    outputs = layers.Dense(1, name="price_output")(x)

    model = Model(inputs=inputs, outputs=outputs, name="KrishiMind_Transformer")
    model.compile(
        optimizer=Adam(learning_rate=CONFIG["learning_rate"]),
        loss="mae",
        metrics=["mape"],
    )
    return model


# ════════════════════════════════════════════════════════════════
# TRAIN ONE CROP
# ════════════════════════════════════════════════════════════════
def train_transformer(crop: str):
    x_path = os.path.join(DATA_PROC, f"X_{crop}.npy")
    y_path = os.path.join(DATA_PROC, f"y_{crop}.npy")

    if not os.path.exists(x_path):
        print(f"  [SKIP] {crop} — run preprocess.py first")
        return None

    X = np.load(x_path)
    y = np.load(y_path)
    n_samples, seq_len, n_features = X.shape

    # Chronological split
    n_test  = int(n_samples * CONFIG["test_split"])
    n_val   = int(n_samples * CONFIG["val_split"])
    n_train = n_samples - n_test - n_val

    X_train, y_train = X[:n_train], y[:n_train]
    X_val,   y_val   = X[n_train:n_train+n_val], y[n_train:n_train+n_val]

    print(f"\n  X{X.shape}  split → train={n_train} val={n_val} test={n_test}")

    model     = build_transformer(seq_len, n_features)
    save_path = os.path.join(MODELS_DIR, f"krishimind_transformer_{crop}.keras")

    model.summary()

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=CONFIG["patience"],
                      restore_best_weights=True, verbose=1),
        ModelCheckpoint(filepath=save_path, monitor="val_loss",
                        save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5,
                          patience=8, min_lr=1e-6, verbose=1),
    ]

    history = model.fit(
        X_train, y_train,
        epochs=CONFIG["epochs"],
        batch_size=CONFIG["batch_size"],
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=1,
    )

    best_val = min(history.history["val_loss"])
    print(f"\n  Best val_loss: {best_val:.6f}")
    print(f"  Saved: {save_path}")
    return model


# ════════════════════════════════════════════════════════════════
# COMPARE LSTM vs TRANSFORMER
# ════════════════════════════════════════════════════════════════
def compare_models():
    """
    Load both saved models and compare their MAPE on the test set.
    Prints which model to use per crop.
    """
    import pickle
    import tensorflow as tf

    print("\n" + "=" * 60)
    print("  LSTM vs Transformer — MAPE Comparison")
    print("=" * 60)
    print(f"  {'CROP':<12} {'LSTM MAPE':>12} {'TRANSFORMER':>14} {'WINNER':>10}")
    print(f"  {'─'*12} {'─'*12} {'─'*14} {'─'*10}")

    for crop in CONFIG["crops"]:
        x_path       = os.path.join(DATA_PROC,  f"X_{crop}.npy")
        y_path       = os.path.join(DATA_PROC,  f"y_{crop}.npy")
        scalery_path = os.path.join(MODELS_DIR, f"scaler_y_{crop}.pkl")
        lstm_path    = os.path.join(MODELS_DIR, f"krishimind_{crop}.keras")
        trans_path   = os.path.join(MODELS_DIR, f"krishimind_transformer_{crop}.keras")

        missing = [p for p in [x_path, y_path, scalery_path, lstm_path, trans_path]
                   if not os.path.exists(p)]
        if missing:
            print(f"  {crop:<12}  [SKIP — missing: {os.path.basename(missing[0])}]")
            continue

        X = np.load(x_path)
        y = np.load(y_path)
        n      = len(X)
        n_test = int(n * CONFIG["test_split"])
        X_test = X[n - n_test:]
        y_test = y[n - n_test:]

        with open(scalery_path, "rb") as f:
            scaler_y = pickle.load(f)

        y_true = scaler_y.inverse_transform(y_test).flatten()

        def get_mape(model_path):
            m     = tf.keras.models.load_model(
                model_path,
                custom_objects={
                    "PositionalEncoding": PositionalEncoding,
                    "TransformerEncoderBlock": TransformerEncoderBlock,
                }
            )
            pred  = m.predict(X_test, verbose=0)
            y_p   = scaler_y.inverse_transform(pred).flatten()
            mask  = y_true > 0
            return float(np.mean(np.abs((y_true[mask] - y_p[mask]) / y_true[mask])) * 100)

        lstm_mape  = get_mape(lstm_path)
        trans_mape = get_mape(trans_path)
        winner     = "LSTM" if lstm_mape <= trans_mape else "Transformer"

        print(f"  {crop:<12} {lstm_mape:>10.2f}%  {trans_mape:>12.2f}%  {winner:>10}")

    print("=" * 60)
    print("  Use the winning model per crop for Person 2's backend.")


# ════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════
def run():
    print("\n" + "=" * 60)
    print("  KrishiMind — Transformer Training")
    print("=" * 60)

    for crop in CONFIG["crops"]:
        print(f"\n{'─'*60}")
        print(f"  CROP: {crop.upper()}")
        print(f"{'─'*60}")
        train_transformer(crop)

    print("\n  All Transformer models trained!")

    # Ask user if they want to compare
    print("\n  Run comparison? (LSTM must also be trained first)")
    choice = input("  Compare LSTM vs Transformer now? [y/N]: ").strip().lower()
    if choice == "y":
        compare_models()
    else:
        print("  Run this later: open transformer.py and call compare_models()")


if __name__ == "__main__":
    run()