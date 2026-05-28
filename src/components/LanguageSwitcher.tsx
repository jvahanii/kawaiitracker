import { useTranslation } from "react-i18next";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "en").startsWith("fi") ? "fi" : "en";
  return (
    <select
      aria-label={t("common.language")}
      value={current}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={`h-8 rounded-md border border-border bg-background px-2 text-base leading-none ${className}`}
    >
      <option value="en">🇬🇧</option>
      <option value="fi">🇫🇮</option>
    </select>
  );
}

