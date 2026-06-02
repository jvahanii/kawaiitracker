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

// Defer language detection to after hydration to avoid SSR/client mismatch.
if (typeof window !== "undefined") {
  const apply = () => {
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
  };
  if (document.readyState === "complete") {
    setTimeout(apply, 0);
  } else {
    window.addEventListener("load", apply, { once: true });
  }
}

export default i18n;
