// // frontend/src/tabs/PredictionTab.jsx

// import { useState, useEffect } from "react";
// import { G, cardStyle } from "../styles/theme";
// import { getCropData } from "../data/cropData";
// import { getOrderedMandis, MANDIS_BY_STATE } from "../data/mandis";
// import { predictPrice } from "../utils/api";
// import {
//   generateForecast,
//   generateMandiBarData,
//   transformApiForecasts,
// } from "../utils/forecastGenerator";
// import QuickPredict    from "../components/prediction/QuickPredict";
// import PriceSummary    from "../components/prediction/PriceSummary";
// import MandiComparison from "../components/prediction/MandiComparison";
// import MarketSignals   from "../components/prediction/MarketSignals";
// import SectionTitle    from "../components/layout/SectionTitle";
// import PriceTrendChart from "../components/charts/PriceTrendChart";
// import Card            from "../components/common/Card";

// // Look up district from mandi name
// const getDistrict = (mandiName, state) => {
//   const list  = MANDIS_BY_STATE[state] || [];
//   const found = list.find((m) => m.name === mandiName);
//   return found?.district || mandiName.split(" ")[0];
// };

// // ── Build rich advisory line in Hindi / Kannada / English ─────────────────────
// const buildAdvisoryLine = (apiData, lang) => {
//   if (!apiData) return null;

//   const crop     = apiData.crop;
//   const market   = apiData.market;
//   const price    = apiData.predicted_price_inr?.toFixed(0);
//   const current  = apiData.current_price_inr?.toFixed(0);
//   const pct      = apiData.price_change_pct;
//   const days     = apiData.days_ahead;
//   const action   = apiData.advisory_action;   // HOLD / SELL / WAIT
//   const trend    = apiData.trend;             // bullish / bearish / neutral

//   const CROP_HI = { onion:"प्याज", tomato:"टमाटर", potato:"आलू", wheat:"गेहूं", rice:"चावल" };
//   const CROP_KN = { onion:"ಈರುಳ್ಳಿ", tomato:"ಟೊಮೇಟೊ", potato:"ಆಲೂಗಡ್ಡೆ", wheat:"ಗೋಧಿ", rice:"ಅಕ್ಕಿ" };

//   const TREND_HI = { bullish:"बढ़ेगा 📈", bearish:"घटेगा 📉", neutral:"स्थिर रहेगा ➡️" };
//   const TREND_KN = { bullish:"ಏರಲಿದೆ 📈", bearish:"ಇಳಿಯಲಿದೆ 📉", neutral:"ಸ್ಥಿರವಾಗಿರುತ್ತದೆ ➡️" };

//   const ACTION_HI = { HOLD:"रोकें — अभी मत बेचें", SELL:"अभी बेचें", WAIT:"प्रतीक्षा करें" };
//   const ACTION_KN = { HOLD:"ಹಿಡಿದಿರಿ — ಇನ್ನೂ ಮಾರಬೇಡಿ", SELL:"ಈಗಲೇ ಮಾರಿ", WAIT:"ನಿರೀಕ್ಷಿಸಿ" };
//   const ACTION_EN = { HOLD:"HOLD — Don't sell yet", SELL:"SELL NOW", WAIT:"WAIT" };

//   const ACTION_ICON = { HOLD:"🟢", SELL:"🔴", WAIT:"🟡" };

//   if (lang === "hi") {
//     return `${ACTION_ICON[action]} ${CROP_HI[crop] || crop} · ${market} · आज ₹${current}/किग्रा → ${days} दिन बाद ₹${price}/किग्रा (${pct > 0 ? "+" : ""}${pct}%) · बाजार ${TREND_HI[trend] || trend} · सलाह: ${ACTION_HI[action] || action}`;
//   }

//   if (lang === "kn") {
//     return `${ACTION_ICON[action]} ${CROP_KN[crop] || crop} · ${market} · ಇಂದು ₹${current}/ಕೆಜಿ → ${days} ದಿನಗಳ ನಂತರ ₹${price}/ಕೆಜಿ (${pct > 0 ? "+" : ""}${pct}%) · ಮಾರುಕಟ್ಟೆ ${TREND_KN[trend] || trend} · ಸಲಹೆ: ${ACTION_KN[action] || action}`;
//   }

//   // English fallback
//   return `${ACTION_ICON[action]} ${crop.charAt(0).toUpperCase() + crop.slice(1)} · ${market} · Today ₹${current}/kg → Day ${days}: ₹${price}/kg (${pct > 0 ? "+" : ""}${pct}%) · Market ${trend} · Advisory: ${ACTION_EN[action] || action}`;
// };

// export default function PredictionTab({ profile, activeCrop }) {
//   const [predicted, setPredicted] = useState(false);
//   const [result,    setResult   ] = useState(null);
//   const [apiData,   setApiData  ] = useState(null);
//   const [loading,   setLoading  ] = useState(false);
//   const [apiError,  setApiError ] = useState(null);

//   // ── Get lang from context if available, else default to "en" ───────────────
//   let lang = "en";
//   try {
//     const { useLang } = require("../utils/LanguageContext");
//     lang = useLang().lang;
//   } catch {
//     // LanguageContext not yet wired — safe fallback
//   }

//   const cdata    = getCropData(activeCrop.id);
//   const myMandis = getOrderedMandis(profile.mandi, profile.state);

//   // Reset when crop changes
//   useEffect(() => {
//     setPredicted(false);
//     setResult(null);
//     setApiData(null);
//     setApiError(null);
//   }, [activeCrop.id]);

//   const handlePredict = async ({ mandi, mandiIdx, days }) => {
//     setLoading(true);
//     setApiError(null);
//     setApiData(null);

//     try {
//       const district = getDistrict(mandi, profile.state);
//       const data     = await predictPrice({
//         crop:              activeCrop.id,
//         market:            mandi,
//         state:             profile.state,
//         district:          district,
//         days_ahead:        days,
//         include_sentiment: true,
//         include_weather:   true,
//       });
//       setApiData(data);
//     } catch (e) {
//       setApiError(`Backend unavailable — showing mock data. (${e.message})`);
//     } finally {
//       setResult({ mandi, mandiIdx, days });
//       setPredicted(true);
//       setLoading(false);
//     }
//   };

//   const forecastData = apiData
//     ? transformApiForecasts(apiData.daily_forecast)
//     : result
//     ? generateForecast(cdata.base, cdata.pred, result.days)
//     : [];

//   const barData = result
//     ? generateMandiBarData(myMandis, cdata.base, cdata.pred)
//     : [];

//   const displayData = apiData
//     ? {
//         base: apiData.current_price_inr,
//         pred: apiData.predicted_price_inr,
//         conf: apiData.confidence_score,
//         pct:  apiData.price_change_pct,
//         adv:  apiData.advisory_action,
//       }
//     : cdata;

//   // ── Advisory line colour by action ─────────────────────────────────────────
//   const advisoryBg = {
//     HOLD: "rgba(27,107,53,0.07)",
//     SELL: "rgba(192,57,43,0.07)",
//     WAIT: "rgba(184,120,10,0.07)",
//   };
//   const advisoryBorder = {
//     HOLD: "rgba(27,107,53,0.22)",
//     SELL: "rgba(192,57,43,0.22)",
//     WAIT: "rgba(184,120,10,0.22)",
//   };
//   const advisoryColor = {
//     HOLD: G.green,
//     SELL: "#C0392B",
//     WAIT: "#B8780A",
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

//       <QuickPredict
//         myMandis={myMandis}
//         cdata={cdata}
//         cropEmoji={activeCrop.emoji}
//         cropLabel={activeCrop.label}
//         onPredict={handlePredict}
//       />

//       {/* Loading */}
//       {loading && (
//         <Card style={{ textAlign: "center", padding: "32px 24px" }}>
//           <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
//           <div style={{ color: G.green, fontWeight: 700, fontSize: 15 }}>
//             Running LSTM model…
//           </div>
//           <div style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>
//             Fetching weather · news · warehouse data
//           </div>
//         </Card>
//       )}

//       {/* Error banner */}
//       {apiError && !loading && (
//         <div style={{
//           background:   "rgba(184,120,10,0.09)",
//           border:       "1px solid rgba(184,120,10,0.25)",
//           borderRadius: 10, padding: "10px 14px",
//           fontSize: 11, color: "#B8780A",
//         }}>
//           ⚠ {apiError}
//         </div>
//       )}

//       {predicted && result && !loading && (
//         <>
//           {/* Price Summary */}
//           <div className="fu s1">
//             <SectionTitle>Key Price Summary</SectionTitle>
//             <PriceSummary cdata={displayData} days={result.days} />
//           </div>

//           {/* LSTM Chart */}
//           <div className="fu s2">
//             <SectionTitle
//               right={`${displayData.pct > 0 ? "▲" : "▼"}${Math.abs(displayData.pct)}%`}
//             >
//               Price Trend Chart · LSTM Forecast
//             </SectionTitle>
//             <Card>
//               <PriceTrendChart
//                 data={forecastData}
//                 base={displayData.base}
//                 pred={displayData.pred}
//                 days={result.days}
//                 cropName={`${activeCrop.emoji} ${activeCrop.label}`}
//                 mandiName={result.mandi}
//               />
//             </Card>
//           </div>

//           {/* ── AI Advisory Line (Hindi / Kannada / English) ────────────────── */}
//           {apiData && (
//             <div className="fu s2" style={{
//               background:   advisoryBg[apiData.advisory_action]   || "rgba(27,107,53,0.07)",
//               border:       `1px solid ${advisoryBorder[apiData.advisory_action] || "rgba(27,107,53,0.22)"}`,
//               borderRadius: 12,
//               padding:      "13px 18px",
//               fontSize:     14,
//               fontWeight:   600,
//               color:        advisoryColor[apiData.advisory_action] || G.green,
//               lineHeight:   1.7,
//             }}>
//               {/* Main advisory line — shown in user's selected language */}
//               <div style={{ marginBottom: 4 }}>
//                 {buildAdvisoryLine(apiData, lang)}
//               </div>

//               {/* Always show Hindi summary below as secondary line */}
//               {lang !== "hi" && apiData.hindi_summary && (
//                 <div style={{
//                   fontSize:   12,
//                   fontWeight: 400,
//                   color:      G.muted,
//                   marginTop:  4,
//                   paddingTop: 6,
//                   borderTop:  `1px solid ${G.faint}`,
//                 }}>
//                   🇮🇳 {apiData.hindi_summary}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Warehouse Advisory */}
//           {apiData?.warehouse_advisory && (
//             <div className="fu s3">
//               <SectionTitle>🏪 Warehouse Advisory</SectionTitle>
//               <Card style={{ background: "rgba(27,107,53,0.03)" }}>
//                 <div style={{ fontWeight: 700, color: G.green, marginBottom: 6 }}>
//                   {apiData.warehouse_advisory.action}
//                 </div>
//                 <div style={{ fontSize: 12, color: G.muted, marginBottom: 8 }}>
//                   {apiData.warehouse_advisory.reason}
//                 </div>
//                 {apiData.warehouse_advisory.nearest_warehouse && (
//                   <div style={{
//                     background: G.light, borderRadius: 8,
//                     padding: "8px 12px", fontSize: 11, color: G.text, lineHeight: 1.8,
//                   }}>
//                     📍 <strong>{apiData.warehouse_advisory.nearest_warehouse.name}</strong><br />
//                     🏠 {apiData.warehouse_advisory.nearest_warehouse.address}<br />
//                     📞 {apiData.warehouse_advisory.nearest_warehouse.phone}<br />
//                     💰 Storage: {apiData.warehouse_advisory.nearest_warehouse.cost}<br />
//                     🏦 Loan: {apiData.warehouse_advisory.nearest_warehouse.loan}
//                   </div>
//                 )}
//                 {apiData.warehouse_advisory.net_profit && (
//                   <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: G.green }}>
//                     💹 Net profit after storage: {apiData.warehouse_advisory.net_profit}
//                   </div>
//                 )}
//               </Card>
//             </div>
//           )}

//           {/* Mandi Comparison */}
//           <div className="fu s4">
//             <MandiComparison barData={barData} bestMandi={myMandis[0]} />
//           </div>

//           {/* Market Signals */}
//           <div className="fu s5">
//             <MarketSignals />
//           </div>
//         </>
//       )}

//       {/* Empty state */}
//       {!predicted && !loading && (
//         <Card style={{ textAlign: "center", padding: "44px 24px" }}>
//           <div style={{ fontSize: 42, marginBottom: 10 }}>🌾</div>
//           <div style={{
//             fontFamily: "'Playfair Display',serif", fontSize: 18,
//             fontWeight: 700, color: G.green, marginBottom: 7,
//           }}>
//             Namaste, {profile.name.split(" ")[0]}! Select mandi &amp; days above
//           </div>
//           <div style={{
//             fontSize: 12, color: G.muted, maxWidth: 380,
//             margin: "0 auto", lineHeight: 1.7,
//           }}>
//             Your crops ({profile.crops.join(", ")}) and primary mandi are pre-loaded.
//             Pick a mandi + forecast period and click Predict.
//           </div>
//           <div style={{
//             display: "flex", justifyContent: "center",
//             gap: 9, marginTop: 16, flexWrap: "wrap",
//           }}>
//             {["📈 LSTM Forecast", "📍 Mandi Compare", "🌤 Market Signals", "🏪 Warehouse Advisory"].map((f) => (
//               <div key={f} style={{
//                 background: G.light, border: `1px solid ${G.bdr}`,
//                 borderRadius: 9, padding: "6px 14px",
//                 fontSize: 11, color: G.green, fontWeight: 600,
//               }}>{f}</div>
//             ))}
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }



// frontend/src/tabs/PredictionTab.jsx
// frontend/src/tabs/PredictionTab.jsx

import { useState, useEffect } from "react";
import { useLang } from "../utils/LanguageContext";
import { G } from "../styles/theme";
import { getCropData } from "../data/cropData";
import { getOrderedMandis, MANDIS_BY_STATE } from "../data/mandis";
import { predictPrice } from "../utils/api";
import {
  generateForecast,
  generateMandiBarData,
  transformApiForecasts,
} from "../utils/forecastGenerator";
import QuickPredict    from "../components/prediction/QuickPredict";
import PriceSummary    from "../components/prediction/PriceSummary";
import MandiComparison from "../components/prediction/MandiComparison";
import MarketSignals   from "../components/prediction/MarketSignals";
import SectionTitle    from "../components/layout/SectionTitle";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import Card            from "../components/common/Card";

// ── Static government warehouse data by state ──────────────────────────────────
const GOVT_WAREHOUSES = {
  "Maharashtra": {
    name:     "NAFED / Maharashtra State Warehousing Corporation",
    address:  "Plot No. 5, APMC Yard, Lasalgaon, Nashik District, Maharashtra – 422306",
    phone:    "02556-274100",
    helpline: "1800-270-0224",
    cost:     "₹1–2/kg/month",
    loan:     "Up to 75% of crop value (Kisan Credit Card)",
    distance: "~2 km from Lasalgaon APMC",
    scheme:   "PM Kisan Bhandaran Yojana",
  },
  "Karnataka": {
    name:     "Karnataka State Warehousing Corporation (KSWC)",
    address:  "No. 14, Race Course Road, Bengaluru, Karnataka – 560001",
    phone:    "080-22371355",
    helpline: "1800-425-8889",
    cost:     "₹1.5–2.5/kg/month",
    loan:     "Up to 75% of crop value (NWR-based loan)",
    distance: "Available in all district HQs",
    scheme:   "Warehousing Development & Regulatory Authority (WDRA)",
  },
  "Uttar Pradesh": {
    name:     "UP State Warehousing Corporation (UPSWC)",
    address:  "Mandi Parishad Building, Vibhuti Khand, Gomti Nagar, Lucknow – 226010",
    phone:    "0522-2721614",
    helpline: "1800-180-1551",
    cost:     "₹1–1.5/kg/month",
    loan:     "Up to 70% of crop value (via cooperative banks)",
    distance: "Available in all 75 districts",
    scheme:   "e-NWR (Electronic Negotiable Warehouse Receipt)",
  },
  "Madhya Pradesh": {
    name:     "MP State Warehousing Corporation (MPSWC)",
    address:  "Mandi Board Campus, E-5, Arera Colony, Bhopal – 462016",
    phone:    "0755-2460220",
    helpline: "1800-180-1234",
    cost:     "₹1–2/kg/month",
    loan:     "Up to 75% via MP Cooperative Bank",
    distance: "Available across all 52 districts",
    scheme:   "Bhavantar Bhugtan Yojana + NWR",
  },
  "Telangana": {
    name:     "Telangana State Warehousing Corporation (TSWC)",
    address:  "H.No. 1-8-303, Chiran Fort Lane, Begumpet, Hyderabad – 500016",
    phone:    "040-27765071",
    helpline: "1800-599-4322",
    cost:     "₹1.5–2/kg/month",
    loan:     "Up to 75% (Rythu Bandhu + NWR)",
    distance: "Available in all 33 districts",
    scheme:   "Rythu Bandhu Scheme + WDRA",
  },
  "Punjab": {
    name:     "Punjab State Warehousing Corporation (PSWC)",
    address:  "Plot No. 3, Sector 19-B, Madhya Marg, Chandigarh – 160019",
    phone:    "0172-2741300",
    helpline: "1800-180-2525",
    cost:     "₹0.80–1.5/kg/month",
    loan:     "Up to 80% (Punjab & Sind Bank / SBI)",
    distance: "Available in all 23 districts",
    scheme:   "PM Fasal Bima + NWR Pledge",
  },
  "Haryana": {
    name:     "Haryana Warehousing Corporation (HWC)",
    address:  "Bay No. 7-8, Sector 2, Panchkula, Haryana – 134109",
    phone:    "0172-2585111",
    helpline: "1800-180-2060",
    cost:     "₹1–1.8/kg/month",
    loan:     "Up to 75% via HAFED / Cooperative Bank",
    distance: "Available in all 22 districts",
    scheme:   "e-NWR + Bhavantar Scheme",
  },
  "Rajasthan": {
    name:     "Rajasthan State Warehousing Corporation (RSWC)",
    address:  "Janpath, Near SMS Hospital, Jaipur, Rajasthan – 302001",
    phone:    "0141-2740843",
    helpline: "1800-180-6127",
    cost:     "₹1–2/kg/month",
    loan:     "Up to 70% (NABARD / Cooperative Bank)",
    distance: "Present in all 33 districts",
    scheme:   "WDRA Registered Warehouse + NWR",
  },
  "Gujarat": {
    name:     "Gujarat State Warehousing Corporation (GSWC)",
    address:  "Block No. 2, Udyog Bhavan, Sector 11, Gandhinagar – 382017",
    phone:    "079-23257601",
    helpline: "1800-233-5500",
    cost:     "₹1.5–2.5/kg/month",
    loan:     "Up to 75% (Gujarat Cooperative Bank + NWR)",
    distance: "Available in all 33 districts",
    scheme:   "PM Kisan Bhandaran + APMC Storage",
  },
  "Andhra Pradesh": {
    name:     "AP State Warehousing Corporation (APSWC)",
    address:  "D.No. 26-4-13, M.G. Road, Vijayawada, Andhra Pradesh – 520002",
    phone:    "0866-2577511",
    helpline: "1800-425-0082",
    cost:     "₹1–2/kg/month",
    loan:     "Up to 75% via AP Grameena Vikas Bank",
    distance: "Available in all 13 districts",
    scheme:   "YSR Rythu Bharosa + NWR",
  },
  "Tamil Nadu": {
    name:     "Tamil Nadu Warehousing Corporation (TNWC)",
    address:  "No. 3, Thiyagaraya Road, T. Nagar, Chennai – 600017",
    phone:    "044-24316757",
    helpline: "1800-425-6000",
    cost:     "₹1.5–2.5/kg/month",
    loan:     "Up to 70% (Tamil Nadu Cooperative Bank)",
    distance: "Present in all 38 districts",
    scheme:   "WDRA + Uzhavar Sandhai Storage",
  },
  "West Bengal": {
    name:     "West Bengal State Warehousing Corporation (WBSWC)",
    address:  "Brabourne Road, 2nd Floor, Kolkata, West Bengal – 700001",
    phone:    "033-22312185",
    helpline: "1800-345-5505",
    cost:     "₹1–2/kg/month",
    loan:     "Up to 70% (West Bengal Cooperative Bank + NWR)",
    distance: "Available in all 23 districts",
    scheme:   "Krishak Bandhu + NWR Pledge",
  },
};

const DEFAULT_WAREHOUSE = {
  name:     "Central Warehousing Corporation (CWC)",
  address:  "4/1, Siri Institutional Area, August Kranti Marg, New Delhi – 110016",
  phone:    "011-26863206",
  helpline: "1800-200-1234",
  cost:     "₹1–2.5/kg/month",
  loan:     "Up to 75% of crop value (NWR-based loan from any bank)",
  distance: "Available nationwide — contact for nearest branch",
  scheme:   "WDRA Registered + e-NWR",
};

const getWarehouse = (state, apiWh) => {
  if (apiWh?.name) return apiWh;
  return GOVT_WAREHOUSES[state] || DEFAULT_WAREHOUSE;
};

const getDistrict = (mandiName, state) => {
  const list  = MANDIS_BY_STATE[state] || [];
  const found = list.find((m) => m.name === mandiName);
  return found?.district || mandiName.split(" ")[0];
};

// ── Translations ───────────────────────────────────────────────────────────────
const CROP_HI = { onion:"प्याज", tomato:"टमाटर", potato:"आलू", wheat:"गेहूं", rice:"चावल" };
const CROP_KN = { onion:"ಈರುಳ್ಳಿ", tomato:"ಟೊಮೇಟೊ", potato:"ಆಲೂಗಡ್ಡೆ", wheat:"ಗೋಧಿ", rice:"ಅಕ್ಕಿ" };

const buildExplanation = (d, lang) => {
  if (!d) return null;
  const crop    = d.crop;
  const price   = d.predicted_price_inr?.toFixed(0);
  const current = d.current_price_inr?.toFixed(0);
  const pct     = Math.abs(d.price_change_pct).toFixed(1);
  const days    = d.days_ahead;
  const action  = d.advisory_action;
  const conf    = d.confidence_score;
  const hi = CROP_HI[crop] || crop;
  const kn = CROP_KN[crop] || crop;
  const en = crop.charAt(0).toUpperCase() + crop.slice(1);

  if (lang === "hi") {
    if (action === "HOLD") return `${hi} का भाव अगले ${days} दिनों में ₹${current} से बढ़कर ₹${price}/किग्रा होने का अनुमान है (+${pct}%)। बाजार में तेजी है — अभी मत बेचें। नीचे बताए सरकारी गोदाम में रखें और ज़्यादा मुनाफे में बेचें। भरोसेमंदी: ${conf}/100।`;
    if (action === "SELL") return `${hi} का भाव अगले ${days} दिनों में ₹${current} से घटकर ₹${price}/किग्रा हो सकता है (-${pct}%)। बाजार में मंदी है — जल्द बेच दें, देर से नुकसान होगा। भरोसेमंदी: ${conf}/100।`;
    return `${hi} का भाव अगले ${days} दिनों में ₹${price}/किग्रा के आसपास स्थिर रहेगा। बाजार सामान्य है — जल्दबाजी न करें। भरोसेमंदी: ${conf}/100।`;
  }
  if (lang === "kn") {
    if (action === "HOLD") return `${kn} ಬೆಲೆ ಮುಂದಿನ ${days} ದಿನಗಳಲ್ಲಿ ₹${current} ರಿಂದ ₹${price}/ಕೆಜಿಗೆ ಏರಬಹುದು (+${pct}%). ಮಾರುಕಟ್ಟೆ ಏರಿಕೆಯಲ್ಲಿದೆ — ಈಗ ಮಾರಬೇಡಿ. ಕೆಳಗೆ ತೋರಿಸಿದ ಸರ್ಕಾರಿ ಗೋದಾಮಿನಲ್ಲಿ ಇರಿಸಿ ಹೆಚ್ಚು ಲಾಭ ಪಡೆಯಿರಿ. ವಿಶ್ವಾಸಾರ್ಹತೆ: ${conf}/100.`;
    if (action === "SELL") return `${kn} ಬೆಲೆ ಮುಂದಿನ ${days} ದಿನಗಳಲ್ಲಿ ₹${current} ರಿಂದ ₹${price}/ಕೆಜಿಗೆ ಇಳಿಯಬಹುದು (-${pct}%). ಮಾರುಕಟ್ಟೆ ಇಳಿಕೆಯಲ್ಲಿದೆ — ಇಂದೇ ಮಾರಿ. ವಿಶ್ವಾಸಾರ್ಹತೆ: ${conf}/100.`;
    return `${kn} ಬೆಲೆ ಮುಂದಿನ ${days} ದಿನಗಳಲ್ಲಿ ₹${price}/ಕೆಜಿ ಸಮೀಪ ಸ್ಥಿರವಾಗಿರಲಿದೆ. ಮಾರುಕಟ್ಟೆ ಸಾಮಾನ್ಯ — ಆತುರ ಬೇಡ. ವಿಶ್ವಾಸಾರ್ಹತೆ: ${conf}/100.`;
  }
  if (action === "HOLD") return `${en} price is forecast to rise from ₹${current} to ₹${price}/kg over the next ${days} days (+${pct}%). Market is bullish — do not sell now. Store in the government warehouse below and sell later for higher profit. Model confidence: ${conf}/100.`;
  if (action === "SELL") return `${en} price is forecast to drop from ₹${current} to ₹${price}/kg over the next ${days} days (-${pct}%). Market is bearish — sell as soon as possible to avoid losses. Model confidence: ${conf}/100.`;
  return `${en} price is expected to stay near ₹${price}/kg over the next ${days} days. Market is stable — no urgency to sell. Model confidence: ${conf}/100.`;
};

const ACTION_STYLE = {
  HOLD: { bg: "rgba(27,107,53,0.07)",  border: "rgba(27,107,53,0.25)",  color: G.green,   icon: "🟢" },
  SELL: { bg: "rgba(192,57,43,0.07)",  border: "rgba(192,57,43,0.25)",  color: "#C0392B", icon: "🔴" },
  WAIT: { bg: "rgba(184,120,10,0.07)", border: "rgba(184,120,10,0.25)", color: "#B8780A", icon: "🟡" },
};
const ACTION_LABEL = {
  HOLD: { en:"HOLD — Wait for better price",  hi:"रोकें — बेहतर भाव का इंतजार करें",  kn:"ಹಿಡಿದಿರಿ — ಉತ್ತಮ ಬೆಲೆಗಾಗಿ ಕಾಯಿ" },
  SELL: { en:"SELL NOW — Price will drop",    hi:"अभी बेचें — भाव गिरेगा",            kn:"ಈಗ ಮಾರಿ — ಬೆಲೆ ಇಳಿಯಲಿದೆ"       },
  WAIT: { en:"WAIT — Market is neutral",      hi:"प्रतीक्षा करें — बाजार स्थिर है",   kn:"ನಿರೀಕ್ಷಿಸಿ — ಮಾರುಕಟ್ಟೆ ಸ್ಥಿರ"   },
};

export default function PredictionTab({ profile, activeCrop }) {
  const { lang } = useLang();
  const [predicted, setPredicted] = useState(false);
  const [result,    setResult   ] = useState(null);
  const [apiData,   setApiData  ] = useState(null);
  const [loading,   setLoading  ] = useState(false);
  const [apiError,  setApiError ] = useState(null);

  const cdata    = getCropData(activeCrop.id);
  const myMandis = getOrderedMandis(profile.mandi, profile.state);

  useEffect(() => {
    setPredicted(false); setResult(null); setApiData(null); setApiError(null);
  }, [activeCrop.id]);

  const handlePredict = async ({ mandi, mandiIdx, days }) => {
    setLoading(true); setApiError(null); setApiData(null);
    try {
      const data = await predictPrice({
        crop: activeCrop.id, market: mandi,
        state: profile.state, district: getDistrict(mandi, profile.state),
        days_ahead: days, include_sentiment: true, include_weather: true,
      });
      setApiData(data);
    } catch (e) {
      setApiError(`Backend unavailable — showing mock data. (${e.message})`);
    } finally {
      setResult({ mandi, mandiIdx, days }); setPredicted(true); setLoading(false);
    }
  };

  const forecastData = apiData ? transformApiForecasts(apiData.daily_forecast)
    : result ? generateForecast(cdata.base, cdata.pred, result.days) : [];
  const barData     = result  ? generateMandiBarData(myMandis, cdata.base, cdata.pred) : [];
  const displayData = apiData
    ? { base: apiData.current_price_inr, pred: apiData.predicted_price_inr,
        conf: apiData.confidence_score,  pct:  apiData.price_change_pct, adv: apiData.advisory_action }
    : cdata;

  const action = apiData?.advisory_action || "WAIT";
  const aStyle = ACTION_STYLE[action] || ACTION_STYLE.WAIT;
  const aLabel = ACTION_LABEL[action]?.[lang] || ACTION_LABEL[action]?.en;

  // Always resolve warehouse — from API first, then static fallback by state
  const wh = getWarehouse(profile.state, apiData?.warehouse_advisory?.nearest_warehouse);

  const L = {
    whTitle:   { en:"Nearest Government Warehouse",           hi:"निकटतम सरकारी गोदाम",                  kn:"ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಗೋದಾಮು"         },
    scheme:    { en:"Scheme",                                  hi:"योजना",                                 kn:"ಯೋಜನೆ"                           },
    call:      { en:"Call Warehouse",                          hi:"गोदाम को फ़ोन करें",                    kn:"ಗೋದಾಮಿಗೆ ಕರೆ ಮಾಡಿ"               },
    helpline:  { en:"Toll-Free Helpline",                      hi:"टोल-फ्री हेल्पलाइन",                   kn:"ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿ"             },
    storage:   { en:"Storage Cost",                            hi:"भंडारण शुल्क",                          kn:"ಶೇಖರಣಾ ಶುಲ್ಕ"                   },
    loan:      { en:"Crop Loan Available",                     hi:"फसल ऋण उपलब्ध",                         kn:"ಬೆಳೆ ಸಾಲ ಲಭ್ಯ"                  },
    distance:  { en:"Location",                                hi:"स्थान",                                 kn:"ಸ್ಥಳ"                            },
    tip:       {
      en: "Store here → get NWR receipt → take to any bank → instant 75% crop loan",
      hi: "यहाँ रखें → NWR रसीद पाएं → किसी भी बैंक जाएं → तुरंत 75% फसल ऋण लें",
      kn: "ಇಲ್ಲಿ ಇರಿಸಿ → NWR ರಸೀದಿ ಪಡೆಯಿರಿ → ಯಾವುದೇ ಬ್ಯಾಂಕ್‌ಗೆ ಹೋಗಿ → ತಕ್ಷಣ 75% ಸಾಲ",
    },
  };
  const tx = (key) => L[key]?.[lang] || L[key]?.en;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <QuickPredict myMandis={myMandis} cdata={cdata}
        cropEmoji={activeCrop.emoji} cropLabel={activeCrop.label} onPredict={handlePredict} />

      {loading && (
        <Card style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <div style={{ color: G.green, fontWeight: 700, fontSize: 15 }}>Running LSTM model…</div>
          <div style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>Fetching weather · news · warehouse data</div>
        </Card>
      )}

      {apiError && !loading && (
        <div style={{ background:"rgba(184,120,10,0.09)", border:"1px solid rgba(184,120,10,0.25)",
          borderRadius:10, padding:"10px 14px", fontSize:11, color:"#B8780A" }}>⚠ {apiError}</div>
      )}

      {predicted && result && !loading && (
        <>
          <div className="fu s1">
            <SectionTitle>Key Price Summary</SectionTitle>
            <PriceSummary cdata={displayData} days={result.days} />
          </div>

          <div className="fu s2">
            <SectionTitle right={`${displayData.pct > 0 ? "▲" : "▼"}${Math.abs(displayData.pct)}%`}>
              Price Trend Chart · LSTM Forecast
            </SectionTitle>
            <Card>
              <PriceTrendChart data={forecastData} base={displayData.base} pred={displayData.pred}
                days={result.days} cropName={`${activeCrop.emoji} ${activeCrop.label}`}
                mandiName={result.mandi} />
            </Card>
          </div>

          {/* ══ AI ADVISORY ══ */}
          {apiData && (
            <div className="fu s3" style={{
              background: aStyle.bg, border: `1.5px solid ${aStyle.border}`,
              borderRadius: 16, overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ padding:"10px 18px", background: aStyle.border,
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>🤖</span>
                  <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.15em",
                    textTransform:"uppercase", color: aStyle.color }}>AI Advisory</span>
                </div>
                <span style={{ background: aStyle.color, color:"#fff", borderRadius:20,
                  padding:"3px 16px", fontSize:12, fontWeight:800 }}>
                  {aStyle.icon} {aLabel}
                </span>
              </div>

              {/* Explanation */}
              <div style={{ padding:"16px 18px 12px" }}>
                <p style={{ fontSize:14, color:G.text, lineHeight:1.85, margin:0 }}>
                  {buildExplanation(apiData, lang)}
                </p>
              </div>

              {/* ── Government Warehouse — always shown on HOLD ── */}
              {action === "HOLD" && (
                <div style={{ margin:"4px 16px 16px", borderRadius:14, overflow:"hidden",
                  border:`1.5px solid ${G.bdr}`, background:"#fff" }}>

                  {/* Warehouse header bar */}
                  <div style={{ background:`linear-gradient(135deg,${G.deep},${G.green})`,
                    padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:20 }}>🏛️</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:800, color:"#fff",
                        textTransform:"uppercase", letterSpacing:"0.12em" }}>
                        {tx("whTitle")}
                      </div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", marginTop:2 }}>
                        {wh.scheme}
                      </div>
                    </div>
                    <div style={{ marginLeft:"auto", background:"rgba(255,255,255,0.18)",
                      borderRadius:20, padding:"3px 12px", fontSize:10,
                      color:"#fff", fontWeight:700 }}>
                      {wh.distance}
                    </div>
                  </div>

                  {/* Warehouse name + address */}
                  <div style={{ padding:"12px 16px 8px", borderBottom:`1px solid ${G.faint}` }}>
                    <div style={{ fontSize:14, fontWeight:800, color:G.text, marginBottom:4 }}>
                      {wh.name}
                    </div>
                    <div style={{ fontSize:12, color:G.muted, display:"flex", gap:6, alignItems:"flex-start" }}>
                      <span>🏠</span><span>{wh.address}</span>
                    </div>
                  </div>

                  {/* 4-cell info grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    gap:0, borderBottom:`1px solid ${G.faint}` }}>

                    {/* Call warehouse */}
                    <a href={`tel:${wh.phone}`} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"12px 14px", textDecoration:"none",
                      borderRight:`1px solid ${G.faint}`, borderBottom:`1px solid ${G.faint}`,
                      background:"rgba(27,107,53,0.02)", cursor:"pointer",
                    }}>
                      <span style={{ fontSize:22 }}>📞</span>
                      <div>
                        <div style={{ fontSize:9, color:G.muted, textTransform:"uppercase",
                          letterSpacing:"0.08em", marginBottom:3 }}>{tx("call")}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:G.green }}>{wh.phone}</div>
                      </div>
                    </a>

                    {/* Helpline */}
                    <a href={`tel:${wh.helpline}`} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"12px 14px", textDecoration:"none",
                      borderBottom:`1px solid ${G.faint}`,
                      background:"rgba(27,107,53,0.02)", cursor:"pointer",
                    }}>
                      <span style={{ fontSize:22 }}>☎️</span>
                      <div>
                        <div style={{ fontSize:9, color:G.muted, textTransform:"uppercase",
                          letterSpacing:"0.08em", marginBottom:3 }}>{tx("helpline")}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:G.green }}>{wh.helpline}</div>
                      </div>
                    </a>

                    {/* Storage cost */}
                    <div style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"12px 14px", borderRight:`1px solid ${G.faint}` }}>
                      <span style={{ fontSize:22 }}>💰</span>
                      <div>
                        <div style={{ fontSize:9, color:G.muted, textTransform:"uppercase",
                          letterSpacing:"0.08em", marginBottom:3 }}>{tx("storage")}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:G.text }}>{wh.cost}</div>
                      </div>
                    </div>

                    {/* Loan */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px" }}>
                      <span style={{ fontSize:22 }}>🏦</span>
                      <div>
                        <div style={{ fontSize:9, color:G.muted, textTransform:"uppercase",
                          letterSpacing:"0.08em", marginBottom:3 }}>{tx("loan")}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:G.green }}>{wh.loan}</div>
                      </div>
                    </div>
                  </div>

                  {/* NWR tip banner */}
                  <div style={{ padding:"10px 16px", background:"rgba(27,107,53,0.06)",
                    display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>💡</span>
                    <span style={{ fontSize:12, fontWeight:700, color:G.green, lineHeight:1.6 }}>
                      {tx("tip")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="fu s4">
            <MandiComparison barData={barData} bestMandi={myMandis[0]} />
          </div>

          <div className="fu s5">
            <MarketSignals />
          </div>
        </>
      )}

      {!predicted && !loading && (
        <Card style={{ textAlign:"center", padding:"44px 24px" }}>
          <div style={{ fontSize:42, marginBottom:10 }}>🌾</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18,
            fontWeight:700, color:G.green, marginBottom:7 }}>
            Namaste, {profile.name.split(" ")[0]}! Select mandi &amp; days above
          </div>
          <div style={{ fontSize:12, color:G.muted, maxWidth:380, margin:"0 auto", lineHeight:1.7 }}>
            Your crops ({profile.crops.join(", ")}) and primary mandi are pre-loaded.
            Pick a mandi + forecast period and click Predict.
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:9, marginTop:16, flexWrap:"wrap" }}>
            {["📈 LSTM Forecast","📍 Mandi Compare","🌤 Market Signals","🏛️ Govt Warehouse"].map(f => (
              <div key={f} style={{ background:G.light, border:`1px solid ${G.bdr}`,
                borderRadius:9, padding:"6px 14px", fontSize:11, color:G.green, fontWeight:600 }}>{f}</div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
