"""
routers/predict.py
POST /predict — Main prediction endpoint
Loads LSTM model, runs inference, returns price forecast
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timedelta
from services.lstm_service import LSTMService
from services.news_service import NewsService
from services.weather_service import WeatherService

router = APIRouter()

# ─── Shared service instances ─────────────────────────────────────────────────
lstm_svc    = LSTMService()
news_svc    = NewsService()
weather_svc = WeatherService()

# ─── Valid options ─────────────────────────────────────────────────────────────
VALID_CROPS = ["onion", "tomato", "potato", "wheat", "rice"]
VALID_STATES = [
    "Maharashtra", "Karnataka", "Uttar Pradesh", "Madhya Pradesh",
    "Telangana", "Punjab", "Haryana", "Rajasthan", "Gujarat",
    "Andhra Pradesh", "Tamil Nadu", "West Bengal"
]

# ─── Request / Response Schemas ───────────────────────────────────────────────

class PredictRequest(BaseModel):
    crop: str = Field(..., example="onion", description="Crop name (lowercase)")
    market: str = Field(..., example="Nashik APMC", description="Mandi name")
    state: str = Field(..., example="Maharashtra", description="State name")
    days_ahead: int = Field(..., ge=7, le=30, example=14, description="7–30 days")
    include_sentiment: bool = Field(True, description="Include news sentiment")
    include_weather: bool = Field(True, description="Include weather signals")

    @validator("crop")
    def crop_must_be_valid(cls, v):
        v = v.lower()
        if v not in VALID_CROPS:
            raise ValueError(f"crop must be one of {VALID_CROPS}")
        return v

    @validator("state")
    def state_must_be_valid(cls, v):
        if v not in VALID_STATES:
            raise ValueError(f"state must be one of {VALID_STATES}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "crop": "onion",
                "market": "Nashik APMC",
                "state": "Maharashtra",
                "days_ahead": 14,
                "include_sentiment": True,
                "include_weather": True
            }
        }


class DailyForecast(BaseModel):
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float


class PredictResponse(BaseModel):
    crop: str
    market: str
    state: str
    prediction_date: str
    days_ahead: int
    current_price_inr: float
    predicted_price_inr: float
    price_change_pct: float
    confidence_score: int
    trend: str
    trend_emoji: str
    mape_score: float
    model_used: str
    confidence_interval: dict
    sentiment_score: Optional[float]
    sentiment_label: Optional[str]
    sentiment_reason: Optional[str]
    weather_condition: Optional[str]
    weather_impact: Optional[str]
    daily_forecast: List[DailyForecast]
    recommendation: str
    hindi_summary: str
    data_sources: List[str]


# ─── Helper functions ─────────────────────────────────────────────────────────

def get_trend(pct: float):
    if pct > 4:
        return "bullish", "📈"
    elif pct < -4:
        return "bearish", "📉"
    return "neutral", "➡️"

def get_recommendation(trend: str, crop: str, days: int, sell_day: int) -> str:
    if trend == "bullish":
        return f"📈 HOLD your {crop} stock. Prices rising — sell closer to Day {days} for better returns."
    elif trend == "bearish":
        return f"📉 SELL NOW. Prices expected to fall. Sell before Day {sell_day} to avoid losses."
    return f"⚖️ NEUTRAL market. Sell based on your storage cost and urgency."

def hindi_summary(crop: str, market: str, price: float, trend: str, days: int) -> str:
    crop_hindi = {"onion":"प्याज","tomato":"टमाटर","potato":"आलू","wheat":"गेहूं","rice":"चावल"}.get(crop, crop)
    trend_hindi = {"bullish":"बढ़ेगा","bearish":"घटेगा","neutral":"स्थिर रहेगा"}.get(trend, "")
    return f"{crop_hindi} का मंडी भाव {market} में अगले {days} दिनों में ₹{price:.0f}/किग्रा के आसपास रहने का अनुमान है। बाजार {trend_hindi}।"


# ─── Route ────────────────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictResponse, summary="Predict mandi price")
async def predict_price(req: PredictRequest):
    """
    Main prediction endpoint.

    **Flow:**
    1. Load LSTM model for the crop
    2. Run inference on last 30 days of features
    3. Get weather data for the state
    4. Get news sentiment for the crop
    5. Adjust prediction with sentiment
    6. Return full forecast JSON
    """

    # ── Step 1: Run LSTM prediction ───────────────────────────────────────────
    try:
        ml_result = lstm_svc.predict(
            crop=req.crop,
            market=req.market,
            days_ahead=req.days_ahead
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

    current_price   = ml_result["current_price"]
    predicted_price = ml_result["predicted_price"]
    lower           = ml_result["lower"]
    upper           = ml_result["upper"]
    mape            = ml_result["mape"]
    daily_raw       = ml_result["daily_forecast"]

    # ── Step 2: Get weather ───────────────────────────────────────────────────
    weather_condition = None
    weather_impact    = None
    if req.include_weather:
        try:
            w = weather_svc.get_weather(req.state)
            weather_condition = w["condition"]
            weather_impact    = w["impact"]
        except Exception:
            weather_condition = "normal"
            weather_impact    = "No weather disruption expected"

    # ── Step 3: Get sentiment ─────────────────────────────────────────────────
    sentiment_score  = 0.0
    sentiment_label  = "neutral"
    sentiment_reason = "Not requested"
    if req.include_sentiment:
        try:
            s = news_svc.get_sentiment(req.crop)
            sentiment_score  = s["sentiment"]
            sentiment_label  = s["label"]
            sentiment_reason = s["reason"]
        except Exception:
            pass  # fallback to neutral

    # ── Step 4: Adjust price with sentiment ───────────────────────────────────
    # Sentiment adjusts price by up to ±5%
    adjusted_price = round(predicted_price * (1 + sentiment_score * 0.05), 2)

    # ── Step 5: Build response ────────────────────────────────────────────────
    price_change_pct = round(((adjusted_price - current_price) / current_price) * 100, 2)
    trend, emoji     = get_trend(price_change_pct)

    # Confidence: higher for stable crops, lower for volatile ones
    volatility_map   = {"onion":0.22,"tomato":0.25,"potato":0.12,"wheat":0.05,"rice":0.06}
    vol              = volatility_map.get(req.crop, 0.10)
    confidence       = min(97, max(52, int(85 - vol * 100 + abs(sentiment_score) * 5)))

    sell_day = max(1, req.days_ahead // 4)

    # Daily forecast series
    daily_forecast = []
    for d in daily_raw:
        daily_forecast.append(DailyForecast(
            date=d["date"],
            predicted_price=d["price"],
            lower_bound=d["lower"],
            upper_bound=d["upper"]
        ))

    data_sources = ["Agmarknet CSV (historical prices)"]
    if req.include_weather: data_sources.append("IMD Weather API")
    if req.include_sentiment: data_sources.append("NewsAPI + DistilBERT Sentiment")

    return PredictResponse(
        crop=req.crop,
        market=req.market,
        state=req.state,
        prediction_date=(datetime.now() + timedelta(days=req.days_ahead)).strftime("%Y-%m-%d"),
        days_ahead=req.days_ahead,
        current_price_inr=current_price,
        predicted_price_inr=adjusted_price,
        price_change_pct=price_change_pct,
        confidence_score=confidence,
        trend=trend,
        trend_emoji=emoji,
        mape_score=mape,
        model_used="LSTM (TensorFlow/Keras)",
        confidence_interval={"lower": lower, "upper": upper, "level": "80%"},
        sentiment_score=sentiment_score,
        sentiment_label=sentiment_label,
        sentiment_reason=sentiment_reason,
        weather_condition=weather_condition,
        weather_impact=weather_impact,
        daily_forecast=daily_forecast,
        recommendation=get_recommendation(trend, req.crop, req.days_ahead, sell_day),
        hindi_summary=hindi_summary(req.crop, req.market, adjusted_price, trend, req.days_ahead),
        data_sources=data_sources,
    )


# ─── Demo endpoint ────────────────────────────────────────────────────────────
@router.get("/predict/demo", summary="3 hardcoded demo predictions")
async def demo():
    """Returns 3 pre-built demo predictions for presentation."""
    demos = [
        PredictRequest(crop="onion",  market="Nashik APMC",      state="Maharashtra", days_ahead=14),
        PredictRequest(crop="tomato", market="Bangalore APMC",   state="Karnataka",   days_ahead=7),
        PredictRequest(crop="wheat",  market="Ludhiana APMC",    state="Punjab",      days_ahead=30),
    ]
    return [await predict_price(d) for d in demos]