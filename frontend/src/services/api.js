// frontend/src/services/api.js
// ─────────────────────────────────────────────────────────────
// KrishiMind — API Service
// Connects React frontend to FastAPI backend
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ─── Core fetch wrapper ───────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Health check ─────────────────────────────────────────────
export const checkHealth = () => apiFetch("/health");

// ─── Get available crops & model status ───────────────────────
export const getCrops = () => apiFetch("/crops");

// ─── Main price prediction ─────────────────────────────────────
// Returns: { crop, predicted_price_inr, daily_forecast, trend,
//            sentiment_score, weather_condition, advisory_action, ... }
export const getPrediction = ({
  crop,
  market,
  state,
  district,
  days_ahead = 14,
  include_sentiment = true,
  include_weather = true,
}) =>
  apiFetch("/predict", {
    method: "POST",
    body: JSON.stringify({
      crop,
      market,
      state,
      district,
      days_ahead,
      include_sentiment,
      include_weather,
    }),
  });

// ─── Weather for a state ───────────────────────────────────────
export const getWeather = (state) =>
  apiFetch(`/weather/${encodeURIComponent(state)}`);

// ─── News sentiment for a crop ────────────────────────────────
export const getNews = (crop) =>
  apiFetch(`/news/${encodeURIComponent(crop)}`);

// ─── AI Chatbot ───────────────────────────────────────────────
export const sendChatMessage = ({ question, crop = "onion", state = "Maharashtra", district = "Nashik" }) =>
  apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({ question, crop, state, district }),
  });

// ─── Default export (all methods) ────────────────────────────
const api = {
  checkHealth,
  getCrops,
  getPrediction,
  getWeather,
  getNews,
  sendChatMessage,
};

export default api;