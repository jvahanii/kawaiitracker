import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fi from "./locales/fi.json";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, fi: { translation: fi } },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "fi"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

// Detect the preferred language. Caller is responsible for invoking this
// AFTER React hydration completes (e.g. from a useEffect in the root) so
// the server-rendered HTML (always English) matches the first client render.
export function applyDetectedLanguage() {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem("lang");
    const nav = window.navigator.language?.toLowerCase() ?? "";
    const detected = stored || (nav.startsWith("fi") ? "fi" : "en");
    const lang = detected.startsWith("fi") ? "fi" : "en";
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  } catch {
    // ignore
  }
}

export default i18n;
