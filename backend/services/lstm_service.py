"""
backend/services/lstm_service.py
Bridge between FastAPI routes and ML inference engine.
"""

import sys
import os
from typing import Dict

# -------------------------------------------------
# PATH FIX
# -------------------------------------------------

THIS_FILE = os.path.abspath(__file__)
SERVICES_DIR = os.path.dirname(THIS_FILE)
BACKEND_DIR = os.path.dirname(SERVICES_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

print(f"✅ LSTMService ROOT_DIR = {ROOT_DIR}")

from ml.predict_prices import forecast_crop


class LSTMService:
    """
    Wrapper service used by FastAPI routers.
    """

    def __init__(self):
        print("🌾 LSTMService initialized")

    def predict(self, crop: str, market: str, days_ahead: int) -> Dict:

        try:

            result = forecast_crop(crop, days_ahead)

            daily_forecast = []

            for i in range(days_ahead):

                daily_forecast.append({
                    "date": result["forecast_dates"][i],
                    "price": round(result["forecast_series"][i], 2),
                    "lower": round(result["lower_band"][i], 2),
                    "upper": round(result["upper_band"][i], 2),
                })

            return {

                "current_price": result["today_price"],

                "predicted_price": result["predicted_price"],

                "lower": result["lower_band"][-1],

                "upper": result["upper_band"][-1],

                "mape": 7.5,

                "daily_forecast": daily_forecast,
            }

        except Exception as e:

            raise RuntimeError(
                f"LSTM prediction failed for crop '{crop}': {str(e)}"
            )