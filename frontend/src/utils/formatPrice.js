export const fmtKg = (val) => `₹${Math.round(val)} / quintal`;
export const fmtQ = (val) => `₹${Math.round(val)}`;
export const fmtPct = (pct) => `${pct >= 0 ? "▲" : "▼"}${Math.abs(pct).toFixed(1)}%`;
export const pctColor = (pct, G) => (pct >= 0 ? G.green : G.red);
