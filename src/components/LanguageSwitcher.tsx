import { useTranslation } from "react-i18next";

function FlagGB({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id="gb-c"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#gb-c)" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        stroke="#C8102E"
        strokeWidth="4"
        clipPath="url(#gb-c)"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

function FlagFI({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 11" className={className} aria-hidden="true">
      <rect width="18" height="11" fill="#fff" />
      <rect x="0" y="4" width="18" height="3" fill="#003580" />
      <rect x="5" y="0" width="3" height="11" fill="#003580" />
    </svg>
  );
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "en").startsWith("fi") ? "fi" : "en";
  const next = current === "fi" ? "en" : "fi";
  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={t("common.language")}
      title={t("common.language")}
      className={`inline-flex h-8 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-background ${className}`}
    >
      {current === "fi" ? (
        <FlagFI className="h-5 w-auto" />
      ) : (
        <FlagGB className="h-5 w-auto" />
      )}
    </button>
  );
}
