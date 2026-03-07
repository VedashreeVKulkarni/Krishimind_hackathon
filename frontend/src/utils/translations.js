// frontend/src/utils/translations.js
// Complete translations for English, Hindi (हिंदी) and Kannada (ಕನ್ನಡ)
// Usage: import { t } from "../utils/translations";
//        t("predict", lang)  →  returns string in selected language

export const TRANSLATIONS = {

  // ── Navbar ─────────────────────────────────────────────────────────────────
  mycrops:          { en: "MY CROPS",          hi: "मेरी फसलें",        kn: "ನನ್ನ ಬೆಳೆಗಳು"      },
  appName:          { en: "KrishiMind",        hi: "कृषिमाइंड",         kn: "ಕೃಷಿಮೈಂಡ್"         },

  // ── Bottom Nav ─────────────────────────────────────────────────────────────
  prediction:       { en: "Prediction",        hi: "पूर्वानुमान",       kn: "ಮುನ್ಸೂಚನೆ"         },
  news:             { en: "News",              hi: "समाचार",            kn: "ಸುದ್ದಿ"             },
  history:          { en: "History",           hi: "इतिहास",            kn: "ಇತಿಹಾಸ"            },

  // ── Quick Predict ──────────────────────────────────────────────────────────
  quickPredict:     { en: "QUICK PREDICT",     hi: "त्वरित अनुमान",     kn: "ತ್ವರಿತ ಮುನ್ಸೂಚನೆ"   },
  selectMandi:      { en: "SELECT MANDI",      hi: "मंडी चुनें",        kn: "ಮಂಡಿ ಆಯ್ಕೆ ಮಾಡಿ"   },
  forecastPeriod:   { en: "FORECAST PERIOD",   hi: "पूर्वानुमान अवधि",  kn: "ಮುನ್ಸೂಚನೆ ಅವಧಿ"    },
  days:             { en: "days",              hi: "दिन",               kn: "ದಿನಗಳು"            },
  myMandi:          { en: "My Mandi",          hi: "मेरी मंडी",         kn: "ನನ್ನ ಮಂಡಿ"         },
  markets:          { en: "markets",           hi: "बाजार",             kn: "ಮಾರುಕಟ್ಟೆಗಳು"     },
  mandis:           { en: "mandis",            hi: "मंडियाँ",           kn: "ಮಂಡಿಗಳು"           },
  predictBtn:       { en: "Predict Price for", hi: "भाव अनुमान लगाएं",  kn: "ಬೆಲೆ ಮುನ್ಸೂಚನೆ"    },

  // ── Price Summary ──────────────────────────────────────────────────────────
  keyPriceSummary:  { en: "Key Price Summary", hi: "मुख्य भाव सारांश",  kn: "ಪ್ರಮುಖ ಬೆಲೆ ಸಾರಾಂಶ" },
  currentPrice:     { en: "CURRENT PRICE",     hi: "वर्तमान भाव",       kn: "ಪ್ರಸ್ತುತ ಬೆಲೆ"      },
  predictedPrice:   { en: "PREDICTED",         hi: "अनुमानित भाव",      kn: "ಅಂದಾಜು ಬೆಲೆ"       },
  confidence:       { en: "CONFIDENCE",        hi: "विश्वसनीयता",       kn: "ವಿಶ್ವಾಸಾರ್ಹತೆ"     },
  aiAdvisor:        { en: "AI ADVISOR",        hi: "AI सलाहकार",        kn: "AI ಸಲಹೆಗಾರ"        },
  hold:             { en: "HOLD",              hi: "रोकें",             kn: "ಹಿಡಿದಿರಿ"           },
  sell:             { en: "SELL",              hi: "बेचें",             kn: "ಮಾರಿ"              },
  wait:             { en: "WAIT",              hi: "प्रतीक्षा करें",    kn: "ಕಾಯಿರಿ"            },
  high:             { en: "High",              hi: "उच्च",              kn: "ಹೆಚ್ಚು"             },
  medium:           { en: "Medium",            hi: "मध्यम",             kn: "ಮಧ್ಯಮ"             },
  low:              { en: "Low",               hi: "कम",                kn: "ಕಡಿಮೆ"             },

  // ── Chart ─────────────────────────────────────────────────────────────────
  priceTrendChart:  { en: "Price Trend Chart · LSTM Forecast", hi: "भाव प्रवृत्ति चार्ट · LSTM अनुमान", kn: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ ಚಾರ್ಟ್ · LSTM ಮುನ್ಸೂಚನೆ" },
  predicted:        { en: "Predicted",         hi: "अनुमानित",          kn: "ಅಂದಾಜಿಸಲಾಗಿದೆ"     },
  upper:            { en: "Upper",             hi: "ऊपरी",              kn: "ಮೇಲ್ಮಿತಿ"           },
  lower:            { en: "Lower",             hi: "निचली",             kn: "ಕೆಳಮಿತಿ"           },
  today:            { en: "Today",             hi: "आज",                kn: "ಇಂದು"              },
  source:           { en: "Source",            hi: "स्रोत",             kn: "ಮೂಲ"               },

  // ── Mandi Comparison ──────────────────────────────────────────────────────
  mandiComparison:  { en: "MANDI COMPARISON",  hi: "मंडी तुलना",        kn: "ಮಂಡಿ ಹೋಲಿಕೆ"       },
  todayVsPred:      { en: "Today vs Predicted (₹/Q)", hi: "आज बनाम अनुमान (₹/क्विंटल)", kn: "ಇಂದು vs ಅಂದಾಜು (₹/ಕ್ವಿಂಟಲ್)" },
  best:             { en: "Best",              hi: "सर्वश्रेष्ठ",       kn: "ಅತ್ಯುತ್ತಮ"          },
  mandi:            { en: "MANDI",             hi: "मंडी",              kn: "ಮಂಡಿ"              },
  todayCol:         { en: "TODAY",             hi: "आज",                kn: "ಇಂದು"              },
  pred:             { en: "PRED",              hi: "अनुमान",            kn: "ಅಂದಾಜು"            },
  change:           { en: "Δ",                 hi: "बदलाव",             kn: "ಬದಲಾವಣೆ"           },

  // ── Market Signals ─────────────────────────────────────────────────────────
  marketSignals:    { en: "MARKET SIGNALS",    hi: "बाजार संकेत",       kn: "ಮಾರುಕಟ್ಟೆ ಸಂಕೇತಗಳು" },
  weather:          { en: "WEATHER",           hi: "मौसम",              kn: "ಹವಾಮಾನ"            },
  arrivals:         { en: "ARRIVALS",          hi: "आवक",               kn: "ಆಗಮನ"              },
  newsSentiment:    { en: "NEWS SENTIMENT",    hi: "समाचार भावना",      kn: "ಸುದ್ದಿ ಭಾವನೆ"       },
  deficitRain:      { en: "Deficit Rain",      hi: "कम बारिश",          kn: "ಕಡಿಮೆ ಮಳೆ"         },
  excessRain:       { en: "Excess Rain",       hi: "अधिक बारिश",        kn: "ಅಧಿಕ ಮಳೆ"          },
  normalRain:       { en: "Normal",            hi: "सामान्य",           kn: "ಸಾಮಾನ್ಯ"           },
  lowSupply:        { en: "Low Supply",        hi: "कम आपूर्ति",        kn: "ಕಡಿಮೆ ಪೂರೈಕೆ"      },
  highSupply:       { en: "High Supply",       hi: "अधिक आपूर्ति",      kn: "ಹೆಚ್ಚು ಪೂರೈಕೆ"     },
  stable:           { en: "Stable",            hi: "स्थिर",             kn: "ಸ್ಥಿರ"              },
  bullish:          { en: "Bullish",           hi: "तेजी",              kn: "ಬೆಲೆ ಏರಿಕೆ"        },
  bearish:          { en: "Bearish",           hi: "मंदी",              kn: "ಬೆಲೆ ಇಳಿಕೆ"        },
  neutral:          { en: "Neutral",           hi: "तटस्थ",             kn: "ತಟಸ್ಥ"              },

  // ── Warehouse Advisory ─────────────────────────────────────────────────────
  warehouseAdv:     { en: "🏪 Warehouse Advisory", hi: "🏪 गोदाम सलाह",  kn: "🏪 ಗೋದಾಮು ಸಲಹೆ"    },
  netProfit:        { en: "Net profit after storage", hi: "भंडारण के बाद शुद्ध लाभ", kn: "ಶೇಖರಣೆಯ ನಂತರ ನಿವ್ವಳ ಲಾಭ" },
  storage:          { en: "Storage",           hi: "भंडारण",            kn: "ಶೇಖರಣೆ"            },
  loan:             { en: "Loan",              hi: "ऋण",                kn: "ಸಾಲ"               },

  // ── News Tab ───────────────────────────────────────────────────────────────
  agriNews:         { en: "Agri News & Market Updates", hi: "कृषि समाचार और बाजार अपडेट", kn: "ಕೃಷಿ ಸುದ್ದಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಅಪ್‌ಡೇಟ್" },
  allNews:          { en: "All News",          hi: "सभी समाचार",        kn: "ಎಲ್ಲ ಸುದ್ದಿ"        },
  positive:         { en: "😊 Positive",       hi: "😊 सकारात्मक",      kn: "😊 ಸಕಾರಾತ್ಮಕ"       },
  negative:         { en: "😟 Negative",       hi: "😟 नकारात्मक",      kn: "😟 ನಕಾರಾತ್ಮಕ"       },
  fetchingNews:     { en: "Fetching live news…", hi: "ताजा समाचार लोड हो रहा है…", kn: "ತಾಜಾ ಸುದ್ದಿ ತರಲಾಗುತ್ತಿದೆ…" },
  sentiment:        { en: "sentiment",         hi: "भावना",             kn: "ಭಾವನೆ"             },

  // ── History Tab ────────────────────────────────────────────────────────────
  predictionHistory:{ en: "Prediction History",hi: "पूर्वानुमान इतिहास", kn: "ಮುನ್ಸೂಚನೆ ಇತಿಹಾಸ"  },
  predsMade:        { en: "Predictions Made",  hi: "किए गए अनुमान",     kn: "ಮಾಡಿದ ಮುನ್ಸೂಚನೆಗಳು" },
  avgAccuracy:      { en: "Avg Accuracy",      hi: "औसत सटीकता",       kn: "ಸರಾಸರಿ ನಿಖರತೆ"      },
  bestPred:         { en: "Best Prediction",   hi: "सर्वश्रेष्ठ अनुमान", kn: "ಅತ್ಯುತ್ತಮ ಮುನ್ಸೂಚನೆ" },
  cropsTracked:     { en: "Crops Tracked",     hi: "ट्रैक की गई फसलें", kn: "ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ಬೆಳೆಗಳು" },
  date:             { en: "Date",              hi: "तारीख",             kn: "ದಿನಾಂಕ"             },
  crop:             { en: "Crop",              hi: "फसल",               kn: "ಬೆಳೆ"               },
  accuracy:         { en: "Accuracy",          hi: "सटीकता",            kn: "ನಿಖರತೆ"            },
  advice:           { en: "Advice",            hi: "सलाह",              kn: "ಸಲಹೆ"              },
  status:           { en: "Status",            hi: "स्थिति",            kn: "ಸ್ಥಿತಿ"              },
  active:           { en: "🟢 Active",         hi: "🟢 सक्रिय",         kn: "🟢 ಸಕ್ರಿಯ"           },
  done:             { en: "✅ Done",           hi: "✅ पूर्ण",           kn: "✅ ಮುಗಿದಿದೆ"         },
  actual:           { en: "Actual",            hi: "वास्तविक",          kn: "ನಿಜವಾದ"            },

  // ── Chatbot ────────────────────────────────────────────────────────────────
  chatbotTitle:     { en: "KrishiMind AI",     hi: "कृषिमाइंड AI",      kn: "ಕೃಷಿಮೈಂಡ್ AI"       },
  chatPlaceholder:  { en: "Ask about prices, sell timing…", hi: "भाव, बेचने का समय पूछें…", kn: "ಬೆಲೆ, ಮಾರಾಟ ಸಮಯ ಕೇಳಿ…" },
  chatSend:         { en: "Send",              hi: "भेजें",             kn: "ಕಳುಹಿಸಿ"           },
  chatGreet:        { en: "Namaste",           hi: "नमस्ते",            kn: "ನಮಸ್ಕಾರ"           },

  // ── Quick prompts ──────────────────────────────────────────────────────────
  qSell:            { en: "Should I sell now?",  hi: "क्या अभी बेचूं?",   kn: "ಈಗ ಮಾರಲೇ?"        },
  qMandi:           { en: "Best mandi?",         hi: "सबसे अच्छी मंडी?", kn: "ಅತ್ಯುತ್ತಮ ಮಂಡಿ?"   },
  qWeather:         { en: "Weather impact?",     hi: "मौसम का असर?",      kn: "ಹವಾಮಾನ ಪರಿಣಾಮ?"   },
  qPeak:            { en: "When prices peak?",   hi: "भाव कब चरम पर?",   kn: "ಬೆಲೆ ಯಾವಾಗ ಉತ್ತುಂಗ?" },
  qPrice:           { en: "Price today?",        hi: "आज का भाव?",        kn: "ಇಂದಿನ ಬೆಲೆ?"      },

  // ── Empty state ────────────────────────────────────────────────────────────
  namaste:          { en: "Namaste",           hi: "नमस्ते",            kn: "ನಮಸ್ಕಾರ"           },
  selectMandiDays:  { en: "Select mandi & days above", hi: "ऊपर मंडी और दिन चुनें", kn: "ಮೇಲೆ ಮಂಡಿ ಮತ್ತು ದಿನಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ" },
  lstmForecast:     { en: "📈 LSTM Forecast",   hi: "📈 LSTM अनुमान",    kn: "📈 LSTM ಮುನ್ಸೂಚನೆ"  },
  mandiCompare:     { en: "📍 Mandi Compare",   hi: "📍 मंडी तुलना",     kn: "📍 ಮಂಡಿ ಹೋಲಿಕೆ"    },
  mktSignals:       { en: "🌤 Market Signals",  hi: "🌤 बाजार संकेत",    kn: "🌤 ಮಾರುಕಟ್ಟೆ ಸಂಕೇತ"  },
  whAdvisory:       { en: "🏪 Warehouse Advisory", hi: "🏪 गोदाम सलाह",  kn: "🏪 ಗೋದಾಮು ಸಲಹೆ"    },

  // ── Crops ─────────────────────────────────────────────────────────────────
  onion:            { en: "Onion",             hi: "प्याज",             kn: "ಈರುಳ್ಳಿ"            },
  tomato:           { en: "Tomato",            hi: "टमाटर",             kn: "ಟೊಮೇಟೊ"            },
  potato:           { en: "Potato",            hi: "आलू",               kn: "ಆಲೂಗಡ್ಡೆ"          },
  wheat:            { en: "Wheat",             hi: "गेहूं",             kn: "ಗೋಧಿ"              },
  rice:             { en: "Rice",              hi: "चावल",              kn: "ಅಕ್ಕಿ"              },

  // ── Loading / Error states ─────────────────────────────────────────────────
  runningModel:     { en: "Running LSTM model…", hi: "LSTM मॉडल चल रहा है…", kn: "LSTM ಮಾದರಿ ಚಾಲನೆಯಲ್ಲಿದೆ…" },
  fetchingData:     { en: "Fetching weather · news · warehouse data", hi: "मौसम · समाचार · गोदाम डेटा लोड हो रहा है", kn: "ಹವಾಮಾನ · ಸುದ್ದಿ · ಗೋದಾಮು ಡೇಟಾ ತರಲಾಗುತ್ತಿದೆ" },
  backendUnavail:   { en: "Backend unavailable — showing mock data.", hi: "बैकएंड उपलब्ध नहीं — नमूना डेटा दिखाया जा रहा है।", kn: "ಬ್ಯಾಕೆಂಡ್ ಲಭ್ಯವಿಲ್ಲ — ನಕಲಿ ಡೇಟಾ ತೋರಿಸಲಾಗುತ್ತಿದೆ." },
};

/**
 * t() — translate a key to the selected language
 *
 * @param {string} key   — key from TRANSLATIONS object above
 * @param {string} lang  — "en" | "hi" | "kn"
 * @returns {string}
 *
 * Usage:
 *   import { t } from "../utils/translations";
 *   <div>{t("prediction", lang)}</div>
 */
export const t = (key, lang = "en") => {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;                        // fallback: return key itself
  return entry[lang] || entry["en"] || key;      // fallback chain: lang → en → key
};

/**
 * tCrop() — translate a crop name
 *
 * @param {string} cropId  — "onion" | "tomato" | "potato" | "wheat" | "rice"
 * @param {string} lang    — "en" | "hi" | "kn"
 */
export const tCrop = (cropId, lang = "en") => t(cropId, lang);