// frontend/src/utils/forecastGenerator.js

/**
 * generateForecast — mock fallback used when backend is unreachable.
 * base and pred are already in ₹/kg (from cropData.js)
 */
export const generateForecast = (base, pred, days) =>
  Array.from({ length: days }, (_, i) => ({
    day:   i === 0 ? "Now" : `D${i + 1}`,
    price: +(base + (i * (pred - base)) / days + Math.sin(i * 0.4) * 0.7).toFixed(2),
    upper: +(base + (i * (pred - base)) / days + 1.8 + Math.sin(i * 0.4) * 0.7).toFixed(2),
    lower: +(base + (i * (pred - base)) / days - 1.4 + Math.sin(i * 0.4) * 0.7).toFixed(2),
  }));

/**
 * generateMandiBarData — mock fallback for mandi comparison chart.
 */
export const generateMandiBarData = (mandiNames, base, pred) =>
  mandiNames.slice(0, 4).map((name, i) => ({
    name:      name.split(" ")[0],
    today:     +(base - i * 0.4).toFixed(2),
    predicted: +(pred - i * 0.5).toFixed(2),
  }));

/**
 * transformApiForecasts — API already returns ₹/kg, no conversion needed.
 */
export const transformApiForecasts = (dailyForecast) =>
  dailyForecast.map((d, i) => ({
    day:   i === 0 ? "Now" : `D${i + 1}`,
    price: +Number(d.predicted_price).toFixed(2),
    upper: +Number(d.upper_bound).toFixed(2),
    lower: +Number(d.lower_bound).toFixed(2),
  }));