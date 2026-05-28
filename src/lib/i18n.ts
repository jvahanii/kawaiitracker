import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fi from "./locales/fi.json";

if (!i18n.isInitialized) {
  const base = i18n.use(initReactI18next);
  if (typeof window !== "undefined") {
    base.use(LanguageDetector);
  }
  base.init({
    resources: { en: { translation: en }, fi: { translation: fi } },
    fallbackLng: "en",
    supportedLngs: ["en", "fi"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "lang",
    },
  });
}

export default i18n;
