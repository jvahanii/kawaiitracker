import { useTranslation } from "react-i18next";
import { SUPPORTED_CURRENCIES, useCurrency, type Currency } from "@/lib/currency";

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const { t } = useTranslation();
  return (
    <select
      aria-label={t("workspace.currency", "Currency")}
      title={t("workspace.currency", "Currency")}
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className={`h-8 rounded-md border border-border bg-background px-2 text-xs ${className}`}
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
