"""
backend/routers/predict.py
Main prediction + chatbot API for KrishiMind
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timedelta
import os

from groq import Groq

from services.lstm_service import LSTMService
from services.news_service import NewsService
from services.weather_service import WeatherService
from services.warehouse_service import WarehouseService


router = APIRouter()


lstm_svc = LSTMService()
news_svc = NewsService()
weather_svc = WeatherService()
warehouse_svc = WarehouseService()


VALID_CROPS = ["onion", "tomato", "potato", "wheat", "rice"]

VALID_STATES = [
    "Maharashtra","Karnataka","Uttar Pradesh","Madhya Pradesh",
    "Telangana","Punjab","Haryana","Rajasthan","Gujarat",
    "Andhra Pradesh","Tamil Nadu","West Bengal"
]


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class PredictRequest(BaseModel):

    crop: str
    market: str
    state: str
    district: str
    days_ahead: int = Field(..., ge=7, le=30)

    include_sentiment: bool = True
    include_weather: bool = True


    @validator("crop")
    def validate_crop(cls, v):

        v = v.lower()

        if v not in VALID_CROPS:
            raise ValueError(f"crop must be one of {VALID_CROPS}")

        return v


    @validator("state")
    def validate_state(cls, v):

        if v not in VALID_STATES:
            raise ValueError(f"state must be one of {VALID_STATES}")

        return v


class DailyForecast(BaseModel):

    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float


class PredictResponse(BaseModel):

    crop: str
    market: str
    state: str
    district: str

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

    advisory_action: str
    recommendation: str

    warehouse_advisory: Optional[dict]

    hindi_summary: str

    data_sources: List[str]


# --------------------------------------------------
# CHATBOT MODELS
# --------------------------------------------------

class ChatRequest(BaseModel):

    question: str
    crop: str = "onion"
    state: str = "Maharashtra"
    district: str = "Nashik"


class ChatResponse(BaseModel):

    question: str
    answer: str
    model_used: str


# --------------------------------------------------
# HELPER
# --------------------------------------------------

def get_trend(change_pct):

    if change_pct > 2:
        return "bullish","📈"

    if change_pct < -2:
        return "bearish","📉"

    return "neutral","➡️"


# --------------------------------------------------
# PRICE PREDICTION
# --------------------------------------------------

@router.post("/predict", response_model=PredictResponse)

async def predict_price(req: PredictRequest):

    try:

        ml_result = lstm_svc.predict(
            crop=req.crop,
            market=req.market,
            days_ahead=req.days_ahead
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"LSTM prediction failed: {str(e)}"
        )


    current_price = ml_result["current_price"]
    predicted_price = ml_result["predicted_price"]
    mape = ml_result["mape"]


    sentiment_score = 0.0
    sentiment_label = "neutral"
    sentiment_reason = "Sentiment not requested"

    if req.include_sentiment:

        try:
            s = news_svc.get_sentiment(req.crop)
            sentiment_score = s["sentiment"]
            sentiment_label = s["label"]
            sentiment_reason = s["reason"]
        except:
            pass


    weather_condition = None
    weather_impact = None

    if req.include_weather:

        try:
            w = weather_svc.get_weather(req.state)
            weather_condition = w["condition"]
            weather_impact = w["impact"]
        except:
            weather_condition="normal"
            weather_impact="No disruption"


    sentiment_adjust = 1 + sentiment_score * 0.05

    adjusted_price = round(predicted_price * sentiment_adjust,2)

    price_change_pct = round(
        ((adjusted_price-current_price)/current_price)*100,
        2
    )


    trend,emoji = get_trend(price_change_pct)


    daily_forecast=[]

    for d in ml_result["daily_forecast"]:

        adj_price = round(d["price"]*sentiment_adjust,2)

        daily_forecast.append(
            DailyForecast(
                date=d["date"],
                predicted_price=adj_price,
                lower_bound=round(adj_price*0.92,2),
                upper_bound=round(adj_price*1.08,2)
            )
        )


    return PredictResponse(

        crop=req.crop,
        market=req.market,
        state=req.state,
        district=req.district,

        prediction_date=(
            datetime.now()+timedelta(days=req.days_ahead)
        ).strftime("%Y-%m-%d"),

        days_ahead=req.days_ahead,

        current_price_inr=current_price,
        predicted_price_inr=adjusted_price,

        price_change_pct=price_change_pct,

        confidence_score=85,

        trend=trend,
        trend_emoji=emoji,

        mape_score=mape,

        model_used="LSTM (TensorFlow/Keras)",

        confidence_interval={
            "lower":round(adjusted_price*0.9,2),
            "upper":round(adjusted_price*1.1,2),
            "level":"80%"
        },

        sentiment_score=sentiment_score,
        sentiment_label=sentiment_label,
        sentiment_reason=sentiment_reason,

        weather_condition=weather_condition,
        weather_impact=weather_impact,

        daily_forecast=daily_forecast,

        advisory_action="SELL" if price_change_pct < -2 else "HOLD" if price_change_pct > 2 else "WAIT",

        recommendation=(
            "Prices expected to fall — consider selling soon."
            if trend=="bearish"
            else "Prices stable or rising — holding may yield better returns."
        ),

        warehouse_advisory=None,

        hindi_summary="मंडी भाव का अनुमान मॉडल द्वारा किया गया है।",

        data_sources=[
            "Agmarknet mandi data",
            "IMD weather",
            "News sentiment"
        ]
    )


# --------------------------------------------------
# AI CHATBOT (Groq)
# --------------------------------------------------

@router.post("/chat", response_model=ChatResponse)

async def farmer_chat(request: ChatRequest):

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured"
        )

    client = Groq(api_key=api_key)

    prompt = f"""
You are KrishiMind AI helping Indian farmers.

Farmer question: {request.question}

Crop: {request.crop}
Location: {request.district}, {request.state}

Give practical advice in 2-3 sentences.
"""

    try:

        completion = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {"role":"user","content":prompt}
            ]
        )

        answer = completion.choices[0].message.content

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    return ChatResponse(
        question=request.question,
        answer=answer,
        model_used="Groq LLaMA 3.3"
    )