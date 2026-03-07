import json
from predict_prices import forecast_crop

result = forecast_crop("onion", 21)

print("\nML Forecast Output:\n")

print(json.dumps(result, indent=4))