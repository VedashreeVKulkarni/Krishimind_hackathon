import numpy as np
import tensorflow as tf
import pickle

crop = "onion"

model = tf.keras.models.load_model(f"models/krishimind_{crop}.keras")

scaler_X = pickle.load(open(f"models/scaler_X_{crop}.pkl","rb"))
scaler_y = pickle.load(open(f"models/scaler_y_{crop}.pkl","rb"))

# dummy input (30 days × 13 features)
sample = np.random.rand(30,13)

sample_scaled = scaler_X.transform(sample)
sample_scaled = sample_scaled.reshape(1,30,13)

pred = model.predict(sample_scaled)

price = scaler_y.inverse_transform(pred)

print("Predicted Price:", price[0][0])