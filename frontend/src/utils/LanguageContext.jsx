// frontend/src/utils/LanguageContext.jsx
//
// Provides language state to ALL components in the app.
// Wrap your App (or DashboardPage) with <LanguageProvider>.
// Any component can then call useLang() to get { lang, setLang, t }.
//
// HOW TO USE IN ANY COMPONENT (no prop drilling needed):
//
//   import { useLang } from "../utils/LanguageContext";
//   const { lang, t } = useLang();
//   <div>{t("prediction")}</div>   →  shows in selected language
//
// HOW TO WIRE INTO App.jsx (add just 2 lines, no other changes):
//
//   import { LanguageProvider } from "./utils/LanguageContext";
//   // wrap return value:
//   return <LanguageProvider> ... your existing JSX ... </LanguageProvider>

import { createContext, useContext, useState } from "react";
import { t as translate } from "./translations";

// ── Context ───────────────────────────────────────────────────────────────────
const LanguageContext = createContext({
  lang:    "en",
  setLang: () => {},
  t:       (key) => key,
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // t() pre-bound to current lang — components don't need to pass lang manually
  const t = (key) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLang() {
  return useContext(LanguageContext);
}

// ── Language switcher button component ───────────────────────────────────────
// Drop this anywhere in your Navbar — it reads/sets the global lang state
//
// Usage in Navbar.jsx (no other changes needed):
//   import { LangSwitcher } from "../../utils/LanguageContext";
//   <LangSwitcher />

export function LangSwitcher({ style = {} }) {
  const { lang, setLang } = useLang();

  const LANGS = [
    { code: "en", label: "EN"  },
    { code: "hi", label: "हि"  },
    { code: "kn", label: "ಕ"   },
  ];

  return (
    <div style={{ display: "flex", gap: 4, ...style }}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          style={{
            background:   lang === code ? "#1B6B35" : "rgba(27,107,53,0.08)",
            border:       lang === code ? "none"    : "1px solid rgba(27,107,53,0.20)",
            borderRadius: 8,
            padding:      "4px 10px",
            cursor:       "pointer",
            fontFamily:   "'Mukta', sans-serif",
            fontSize:     12,
            fontWeight:   lang === code ? 700 : 400,
            color:        lang === code ? "#fff" : "#1B6B35",
            transition:   "all 0.18s",
            minWidth:     32,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Example: how to use translations in any existing component ────────────────
//
//  BEFORE (existing code, untouched):
//    <div>Prediction</div>
//
//  AFTER (add 2 lines at top, replace text with t()):
//    import { useLang } from "../../utils/LanguageContext";
//    const { t } = useLang();
//    <div>{t("prediction")}</div>
//
// That's all — the component will now show text in EN / हिंदी / ಕನ್ನಡ
// based on whatever language the user selected in the Navbar.