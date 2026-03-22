import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import { G } from "../../styles/theme";

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function PriceTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const price = payload.find(p => p.dataKey === "price");
  const upper = payload.find(p => p.dataKey === "upper");
  const lower = payload.find(p => p.dataKey === "lower");
  return (
    <div style={{
      background: "#fff", border: `1px solid ${G.bdr}`,
      borderRadius: 12, padding: "10px 14px",
      fontSize: 11, fontFamily: "'Mukta',sans-serif",
      boxShadow: "0 4px 16px rgba(27,107,53,0.12)",
    }}>
      <div style={{ color: G.muted, fontSize: 10, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {price && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green }} />
          <span style={{ color: G.muted, fontSize: 10 }}>Predicted</span>
          <span style={{ fontWeight: 800, color: G.green, fontSize: 14, marginLeft: 4 }}>
            ₹{Number(price.value).toFixed(2)} / kg
          </span>
        </div>
      )}
      {upper && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 2, background: G.amber, borderRadius: 2 }} />
          <span style={{ color: G.muted, fontSize: 10 }}>Upper  </span>
          <span style={{ fontWeight: 600, color: G.amber, fontSize: 12, marginLeft: 4 }}>
            ₹{Number(upper.value).toFixed(2)}
          </span>
        </div>
      )}
      {lower && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 2, background: "#aaa", borderRadius: 2 }} />
          <span style={{ color: G.muted, fontSize: 10 }}>Lower  </span>
          <span style={{ fontWeight: 600, color: G.muted, fontSize: 12, marginLeft: 4 }}>
            ₹{Number(lower.value).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Custom dot for start and end only ─────────────────────────────────────────
function EndDot(props) {
  const { cx, cy, index, dataLength, color } = props;
  if (index !== 0 && index !== dataLength - 1) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
  );
}

export default function PriceTrendChart({ data, base, pred, days, cropName, mandiName }) {
  const rising = pred >= base;
  const lineCol = rising ? G.green : "#E05252";
  const fillCol = rising ? G.green : "#E05252";

  // ── Smart Y-axis domain ────────────────────────────────────────────────────
  const allVals = data.flatMap(d => [d.price, d.upper, d.lower].filter(v => v != null));
  const minVal = Math.min(...allVals, base, pred);
  const maxVal = Math.max(...allVals, base, pred);
  const pad = Math.max((maxVal - minVal) * 0.2, 1);
  const yMin = Math.floor(minVal - pad);
  const yMax = Math.ceil(maxVal + pad);

  const pct = (((pred - base) / base) * 100).toFixed(1);
  const pctCol = rising ? G.green : "#E05252";

  return (
    <div style={{ padding: "4px 0" }}>

      {/* ── Chart header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16,
      }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 15, fontWeight: 700, color: G.text,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {cropName}
            <span style={{
              fontSize: 11, fontWeight: 600, color: G.muted,
              background: G.light, borderRadius: 20, padding: "2px 10px",
            }}>
              {days}-Day Forecast · {mandiName}
            </span>
          </div>
          <div style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>
            LSTM prediction with confidence band
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { color: lineCol, dash: false, label: "Predicted" },
            { color: G.amber, dash: true,  label: "Upper band" },
            { color: "#bbb",  dash: true,  label: "Lower band" },
          ].map(x => (
            <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="20" height="8">
                <line x1="0" y1="4" x2="20" y2="4"
                  stroke={x.color} strokeWidth={x.dash ? 1.5 : 2.5}
                  strokeDasharray={x.dash ? "4 2" : "none"} />
              </svg>
              <span style={{ fontSize: 10, color: G.muted }}>{x.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={fillCol} stopOpacity={0.22} />
              <stop offset="100%" stopColor={fillCol} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={G.amber} stopOpacity={0.08} />
              <stop offset="100%" stopColor={G.amber} stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,107,53,0.07)" vertical={false} />

          <XAxis
            dataKey="day"
            tick={{ fill: G.muted, fontSize: 9, fontFamily: "'Mukta',sans-serif" }}
            axisLine={{ stroke: G.faint }}
            tickLine={false}
            interval={Math.floor(data.length / 6)}
          />

          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: G.muted, fontSize: 9, fontFamily: "'Mukta',sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₹${v}`}
            width={54}
          />

          <Tooltip content={<PriceTip />} cursor={{ stroke: lineCol, strokeWidth: 1, strokeDasharray: "3 3" }} />

          <Area type="monotone" dataKey="upper"
            stroke={G.amber} strokeWidth={1.5} strokeDasharray="5 3"
            fill="url(#bandGrad)" dot={false} legendType="none" />

          <Area type="monotone" dataKey="lower"
            stroke="#bbb" strokeWidth={1} strokeDasharray="3 3"
            fill="#fff" dot={false} legendType="none" />

          <Area type="monotone" dataKey="price"
            stroke={lineCol} strokeWidth={3} fill="url(#priceGrad)"
            dot={false} activeDot={{ r: 6, fill: lineCol, stroke: "#fff", strokeWidth: 2.5 }} />

          <ReferenceLine
            y={base}
            stroke={G.amber}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: `Today ₹${base.toFixed(2)}/kg`,
              position: "insideTopRight",
              fill: G.amber,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "'Mukta',sans-serif",
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Footer stats row ── */}
      <div style={{
        display: "flex", gap: 8, marginTop: 14,
        flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{
          background: G.light, border: `1px solid ${G.bdr}`,
          borderRadius: 8, padding: "6px 12px", fontSize: 11,
        }}>
          <span style={{ color: G.muted }}>Today  </span>
          <span style={{ fontWeight: 700, color: G.text }}>₹{base.toFixed(2)} / kg</span>
        </div>

        <div style={{ color: G.muted, fontSize: 11 }}>→</div>

        <div style={{
          background: rising ? "rgba(27,107,53,0.07)" : "rgba(224,82,82,0.07)",
          border: `1px solid ${rising ? "rgba(27,107,53,0.2)" : "rgba(224,82,82,0.2)"}`,
          borderRadius: 8, padding: "6px 12px", fontSize: 11,
        }}>
          <span style={{ color: G.muted }}>D{days}  </span>
          <span style={{ fontWeight: 700, color: lineCol }}>₹{pred.toFixed(2)} / kg</span>
        </div>

        <div style={{
          background: rising ? "rgba(27,107,53,0.07)" : "rgba(224,82,82,0.07)",
          border: `1px solid ${rising ? "rgba(27,107,53,0.2)" : "rgba(224,82,82,0.2)"}`,
          borderRadius: 8, padding: "6px 12px", fontSize: 11,
          fontWeight: 700, color: pctCol,
        }}>
          {rising ? "▲" : "▼"} {Math.abs(pct)}%
        </div>

        <div style={{
          marginLeft: "auto", background: G.light, border: `1px solid ${G.bdr}`,
          borderRadius: 8, padding: "6px 12px", fontSize: 10, color: G.muted,
        }}>
          📊 Source: LSTM + Agmarknet
        </div>
      </div>
    </div>
  );
}