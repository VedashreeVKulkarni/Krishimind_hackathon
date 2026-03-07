# ml/crop_recommendation.py

import pandas as pd


# ─────────────────────────────────────────────
# Crop parameters
# ─────────────────────────────────────────────
CROP_DATA = {
    "onion": {
        "cost_per_acre": 20000,
        "yield_quintal": 120,
        "rainfall_range": (400, 700),
        "soil": ["loamy", "sandy"]
    },
    "tomato": {
        "cost_per_acre": 18000,
        "yield_quintal": 100,
        "rainfall_range": (500, 800),
        "soil": ["loamy"]
    },
    "potato": {
        "cost_per_acre": 22000,
        "yield_quintal": 110,
        "rainfall_range": (400, 600),
        "soil": ["sandy", "loamy"]
    },
    "rice": {
        "cost_per_acre": 25000,
        "yield_quintal": 140,
        "rainfall_range": (800, 1200),
        "soil": ["clay", "loamy"]
    },
    "wheat": {
        "cost_per_acre": 17000,
        "yield_quintal": 90,
        "rainfall_range": (300, 500),
        "soil": ["loamy", "clay"]
    }
}


# ─────────────────────────────────────────────
# Rainfall suitability
# ─────────────────────────────────────────────
def rainfall_score(crop, rainfall):

    rmin, rmax = CROP_DATA[crop]["rainfall_range"]

    if rmin <= rainfall <= rmax:
        return 1.0
    elif rainfall < rmin:
        return 0.5
    else:
        return 0.6


# ─────────────────────────────────────────────
# Soil suitability
# ─────────────────────────────────────────────
def soil_score(crop, soil):

    if soil in CROP_DATA[crop]["soil"]:
        return 1.0
    return 0.5


# ─────────────────────────────────────────────
# Profit calculation
# ─────────────────────────────────────────────
def estimate_profit(crop, predicted_price):

    yield_q = CROP_DATA[crop]["yield_quintal"]
    cost = CROP_DATA[crop]["cost_per_acre"]

    revenue = predicted_price * yield_q
    profit = revenue - cost

    return profit


# ─────────────────────────────────────────────
# Main recommendation engine
# ─────────────────────────────────────────────
def recommend_crop(predicted_prices, rainfall, soil):

    results = []

    for crop, price in predicted_prices.items():

        rain = rainfall_score(crop, rainfall)
        soil_s = soil_score(crop, soil)

        profit = estimate_profit(crop, price)

        # demand index (normalized price)
        demand_index = price / 2000

        score = (
            demand_index * 0.5 +
            rain * 0.3 +
            soil_s * 0.2
        )

        results.append({
            "crop": crop,
            "predicted_price": int(price),
            "profit_per_acre": int(profit),
            "rainfall_score": round(rain, 2),
            "soil_score": round(soil_s, 2),
            "score": round(score, 2)
        })

    # Convert to dataframe for sorting
    df = pd.DataFrame(results)

    df = df.sort_values("score", ascending=False)

    best = df.iloc[0]

    confidence = min(100, int(best["score"] * 100))

    return {
        "recommended_crop": str(best["crop"]),
        "expected_price": int(best["predicted_price"]),
        "profit_per_acre": int(best["profit_per_acre"]),
        "confidence": confidence,
        "ranking": df.to_dict(orient="records")
    }