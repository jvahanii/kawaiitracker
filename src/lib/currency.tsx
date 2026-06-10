import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { tryGetSupabase } from "@/lib/supabase/client";

export const SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP", "SEK", "NOK"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const STORAGE_KEY = "keywi.currency";
const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1,
  GBP: 1,
  SEK: 1,
  NOK: 1,
};

type Rates = Record<Currency, number>;

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  convert: (eurAmount: number) => number;
  toEur: (displayAmount: number) => number;
  format: (eurAmount: number) => string;
};


const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function isCurrency(value: unknown): value is Currency {
  return (
    typeof value === "string" &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
  );
}

async function fetchRates(): Promise<Rates> {
  const symbols = SUPPORTED_CURRENCIES.filter((c) => c !== "EUR").join(",");
  const res = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${symbols}`,
  );
  if (!res.ok) throw new Error("FX fetch failed");
  const json = (await res.json()) as { rates: Record<string, number> };
  const rates: Rates = { ...FALLBACK_RATES };
  for (const c of SUPPORTED_CURRENCIES) {
    if (c === "EUR") continue;
    if (typeof json.rates[c] === "number") rates[c] = json.rates[c];
  }
  return rates;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const appliedUserRef = useRef<string | null>(null);

  // Read localStorage after mount to avoid SSR hydration mismatch
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isCurrency(stored)) setCurrencyState(stored);
    } catch {
      // ignore
    }
  }, []);

  // Apply per-user preference from Supabase auth user metadata (no DB schema needed)
  useEffect(() => {
    const client = tryGetSupabase();
    if (!client) return;
    let mounted = true;

    const applyFromUser = (user: { id: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        appliedUserRef.current = null;
        return;
      }
      // Apply server preference once per signed-in user
      if (appliedUserRef.current === user.id) return;
      appliedUserRef.current = user.id;
      const pref = user.user_metadata?.preferred_currency;
      if (isCurrency(pref)) {
        setCurrencyState(pref);
        try {
          window.localStorage.setItem(STORAGE_KEY, pref);
        } catch {
          // ignore
        }
      }
    };

    client.auth.getUser().then(({ data }) => {
      if (mounted) applyFromUser(data.user ?? null);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      applyFromUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
    // Persist per user in Supabase auth metadata (fire-and-forget)
    const client = tryGetSupabase();
    if (client) {
      client.auth
        .updateUser({ data: { preferred_currency: c } })
        .catch(() => {
          // signed out or offline — localStorage still keeps the choice locally
        });
    }
  }, []);

  const ratesQ = useQuery({
    queryKey: ["fx", "EUR"],
    queryFn: fetchRates,
    staleTime: 1000 * 60 * 60 * 12, // 12h
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const rates = ratesQ.data ?? FALLBACK_RATES;

  const value = useMemo<CurrencyContextValue>(() => {
    const rate = rates[currency] ?? 1;
    const convert = (eur: number) => eur * rate;
    const toEur = (disp: number) => (rate ? disp / rate : disp);
    const format = (eur: number) => {
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(convert(eur));
      } catch {
        return `${convert(eur).toFixed(2)} ${currency}`;
      }
    };
    return { currency, setCurrency, rates, convert, toEur, format };
  }, [currency, setCurrency, rates]);


  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    const convert = (eur: number) => eur;
    const toEur = (disp: number) => disp;
    return {
      currency: "EUR",
      setCurrency: () => {},
      rates: FALLBACK_RATES,
      convert,
      toEur,
      format: (eur: number) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(eur),
    };
  }
  return ctx;
}
