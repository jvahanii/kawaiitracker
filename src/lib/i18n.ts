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

// The server-rendered HTML is English. Force the client singleton back to the
// same initial language before React hydrates; stored/user language is applied
// later from RootComponent after hydration.
if (i18n.language !== "en") {
  i18n.changeLanguage("en");
}

// Detect the preferred language after the first browser paint. React can
// hydrate lazy route segments after parent effects, so delay the language
// change one tick to keep server-rendered English matching first client text.
export function applyDetectedLanguage() {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem("lang");
    const nav = window.navigator.language?.toLowerCase() ?? "";
    const detected = stored || (nav.startsWith("fi") ? "fi" : "en");
    const lang = detected.startsWith("fi") ? "fi" : "en";
    if (i18n.language !== lang) {
      window.setTimeout(() => {
        i18n.changeLanguage(lang);
      }, 0);
    }
  } catch {
    // ignore
  }
}

export default i18n;
