from ml.predict_prices import predict_all_prices
from ml.crop_recommendation import recommend_crop

# Get predicted prices from ML models
predicted_prices = predict_all_prices()

print("\nPredicted Prices From ML Models:")
print(predicted_prices)

# Run crop recommendation
result = recommend_crop(
    predicted_prices=predicted_prices,
    rainfall=600,
    soil="loamy"
)

print("\nCrop Recommendation Result:")
print(result)