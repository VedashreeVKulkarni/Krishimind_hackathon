"""
KrishiMind — LSTM Service

Acts as a bridge between FastAPI routes and the ML inference engine.

Flow:
Router → LSTMService → ml.predict_prices → trained models

This file keeps backend code clean and reusable.
"""

import sys
import os
from typing import Dict

# ─────────────────────────────────────────────
# Allow backend to import from /ml
# ─────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

# Import ML prediction engine
from ml.predict_prices import forecast_crop


class LSTMService:
    """
    Service wrapper for ML price prediction.
    """

    def __init__(self):
        print("🌾 LSTMService initialized — ML prediction engine ready")

    # ─────────────────────────────────────────────
    # PUBLIC METHOD
    # ─────────────────────────────────────────────

    def predict(self, crop: str, market: str, days_ahead: int) -> Dict:
        """
        Main method called by router.

        Parameters
        ----------
        crop : str
        market : str
        days_ahead : int

        Returns
        -------
        dict
        """

        try:
            result = forecast_crop(crop, days_ahead)

            today_price = result["today_price"]
            predicted_price = result["predicted_price"]

            daily_forecast = []

            for i in range(days_ahead):

                daily_forecast.append({
                    "date": result["forecast_dates"][i],
                    "price": result["forecast_series"][i],
                    "lower": result["lower_band"][i],
                    "upper": result["upper_band"][i],
                })

            return {
                "current_price": today_price,
                "predicted_price": predicted_price,
                "lower": result["lower_band"][-1],
                "upper": result["upper_band"][-1],
                "mape": 7.5,
                "daily_forecast": daily_forecast,
            }

        except Exception as e:

            raise RuntimeError(
                f"LSTM prediction failed for crop '{crop}': {str(e)}"
            )