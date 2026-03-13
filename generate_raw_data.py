import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_RAW = os.path.join(BASE_DIR, "data", "raw")
os.makedirs(DATA_RAW, exist_ok=True)

crops = ["onion", "tomato", "potato", "rice", "wheat"]

np.random.seed(42)

for crop in crops:
    # 5 years of daily data
    dates = pd.date_range(start="2019-01-01", end="2024-01-01")
    n = len(dates)
    
    base_price = np.random.randint(1000, 3000)
    prices = base_price + np.cumsum(np.random.normal(0, 10, n))
    prices = np.clip(prices, 500, None)
    
    arrivals = np.random.normal(500, 100, n)
    arrivals = np.clip(arrivals, 50, None)
    
    df = pd.DataFrame({
        "Price Date": dates.strftime("%d-%b-%Y"),
        "Arrival Date": dates.strftime("%d-%b-%Y"),
        "Modal Price": prices,
        "Min Price": prices * 0.9,
        "Max Price": prices * 1.1,
        "Arrival Quantity": arrivals
    })
    
    # Save with 1 empty header row as expected by preprocess.py
    path = os.path.join(DATA_RAW, f"{crop}.csv")
    with open(path, "w") as f:
        f.write("Agmarknet Data\n")
    df.to_csv(path, index=False, mode='a')
    print(f"Generated {path}")

print("Done generating raw data.")
