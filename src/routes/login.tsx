import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ensureSupabase } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { KiwiWithKey } from "@/components/KiwiWithKey";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Tracker" }] }),
  component: LoginPage,
});

const REMEMBER_KEY = "rememberedEmail";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const m = useMutation({
    meta: { silent: true },
    mutationFn: async (data: { email: string; password: string; rememberMe: boolean }) => {
      const supabase = await ensureSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      if (error) throw new Error(error.message);
      try {
        if (data.rememberMe) {
          localStorage.setItem(REMEMBER_KEY, data.email.trim().toLowerCase());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {
        // ignore
      }
      return { ok: true as const };
    },
    onSuccess: () => {
      navigate({ to: "/onboarding" });
    },
  });

  const errorMessage = m.error ? (m.error as Error).message : null;

  return (
    <AuthShell title={t("login.title")} subtitle={t("login.subtitle")}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          m.mutate({ email, password, rememberMe });
        }}
        className="space-y-4"
      >
        <Field label={t("login.email")}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
        </Field>
        <Field label={t("login.password")}>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="current-password"
          />
        </Field>
        <label htmlFor="rememberMe" className="flex items-center gap-2 text-sm">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          {t("login.rememberMe")}
        </label>
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        <button
          type="submit"
          disabled={m.isPending}
          className="kawaii-button w-full disabled:opacity-60"
        >
          {m.isPending ? t("login.submitting") : `${t("login.submit")} ♡`}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link
          to="/forgot-password"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("login.forgotPassword")}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("login.newHere")}{" "}
        <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
          {t("login.createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-2xl">
        <span className="absolute left-[8%] top-[12%] animate-pulse">🌸</span>
        <span className="absolute right-[10%] top-[18%]">✨</span>
        <span className="absolute left-[14%] bottom-[18%]">🍡</span>
        <span className="absolute right-[12%] bottom-[14%] animate-pulse">💖</span>
        <span className="absolute left-[45%] top-[6%]">☁️</span>
        <KiwiWithKey
          className="absolute -left-6 bottom-10 h-28 w-28 rotate-[-12deg] opacity-90 sm:left-[6%] sm:h-36 sm:w-36"
          imgClassName="h-full w-full"
          keyClassName="h-6 w-6 sm:h-8 sm:w-8"
        />
        <KiwiWithKey
          className="absolute -right-4 top-24 h-24 w-24 rotate-[18deg] opacity-90 sm:right-[6%] sm:h-32 sm:w-32"
          imgClassName="h-full w-full"
          keyClassName="h-5 w-5 sm:h-7 sm:w-7"
        />
      </div>
      <div className="kawaii-card relative w-full max-w-sm p-8">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <KiwiWithKey
            alt="Kawaii kiwi"
            width={96}
            height={96}
            className="h-16 w-16 drop-shadow-md"
            imgClassName="h-full w-full"
            keyClassName="h-4 w-4"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t("common.back")}
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="mt-5 text-center text-3xl font-bold tracking-tight text-foreground">
          {title} <span className="inline-block">🥝</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
