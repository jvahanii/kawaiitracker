import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ensureSupabase } from "@/lib/supabase/client";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Tracker" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const m = useMutation({
    meta: { silent: true },
    mutationFn: async (data: { displayName: string; email: string; password: string }) => {
      const supabase = await ensureSupabase();
      const { data: res, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
          data: { display_name: data.displayName.trim() },
        },
      });
      if (error) throw new Error(error.message);
      return { ok: true as const, hasSession: !!res.session };
    },
    onSuccess: (res) => {
      // New users have no tenants yet — go straight to onboarding.
      if (res.hasSession) navigate({ to: "/onboarding" });
    },
  });

  const errorMessage = m.error ? (m.error as Error).message : null;
  const needsConfirm = m.data && !m.data.hasSession;

  return (
    <AuthShell title={t("signup.title")} subtitle={t("signup.subtitle")}>
      {needsConfirm ? (
        <div className="space-y-3 text-sm">
          <p>Check your inbox to confirm your email, then log in.</p>
          <Link to="/login" className="kawaii-button block w-full text-center">
            {t("login.submit")} ♡
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            m.mutate({ displayName, email, password });
          }}
          className="space-y-4"
        >
          <Field label={t("signup.name")}>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              autoComplete="name"
            />
          </Field>
          <Field label={t("signup.email")}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoComplete="email"
            />
          </Field>
          <Field label={t("signup.password")}>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
            />
          </Field>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <button
            type="submit"
            disabled={m.isPending}
            className="kawaii-button w-full disabled:opacity-60"
          >
            {m.isPending ? t("signup.submitting") : `${t("signup.submit")} ✨`}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("signup.haveAccount")}{" "}
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          {t("signup.loginLink")}
        </Link>
      </p>
    </AuthShell>
  );
}
