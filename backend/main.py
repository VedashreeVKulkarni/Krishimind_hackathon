"""
KrishiMind Backend — main.py
Entry point for the FastAPI application.
Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict, weather, news

# ─── App Init ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="🌾 KrishiMind API",
    description="""
## KrishiMind — AI Mandi Price Prediction

Backend API for predicting crop prices at Indian mandis using:
- 📊 LSTM ML model trained on Agmarknet data
- 🌤️ IMD Weather signals
- 📰 News sentiment via DistilBERT / Claude AI

### Endpoints
- `POST /predict` — Main price prediction
- `GET  /weather/{state}` — Weather for a state
- `GET  /news/{crop}` — News sentiment for a crop
    """,
    version="1.0.0",
)

# ─── CORS (allow frontend on any port to call this) ───────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # In production: replace with your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ─────────────────────────────────────────────────────────
app.include_router(predict.router,  tags=["Prediction"])
app.include_router(weather.router,  tags=["Weather"])
app.include_router(news.router,     tags=["News & Sentiment"])

# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "app": "KrishiMind API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "predict": "POST /predict",
            "weather": "GET  /weather/{state}",
            "news":    "GET  /news/{crop}",
            "health":  "GET  /health",
        }
    }

@app.get("/health", tags=["Root"])
def health():
    return {"status": "healthy", "model": "loaded"}