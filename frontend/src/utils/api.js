import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  }
});

// POST /predict
export const predictPrice = async (body) => {
  const { data } = await apiClient.post("/predict", body);
  return data;
};

// GET /news/{crop}
export const fetchNewsSentiment = async (crop) => {
  const { data } = await apiClient.get(`/news/${crop.toLowerCase()}`);
  return data;
};

// GET /weather/{state}
export const fetchWeather = async (state) => {
  const { data } = await apiClient.get(`/weather/${encodeURIComponent(state)}`);
  return data;
};

// POST /chat
export const sendChatMessage = async (body) => {
  const { data } = await apiClient.post("/chat", body);
  return data;
};