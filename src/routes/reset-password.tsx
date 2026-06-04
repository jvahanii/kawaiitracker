import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ensureSupabase } from "@/lib/supabase/client";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Tracker" }] }),
  component: ResetPasswordPage,
});

const RECOVERY_SESSION_TIMEOUT_MS = 8000;

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsub: (() => void) | undefined;

    ensureSupabase()
      .then(async (supabase) => {
        if (cancelled) return;

        // If a recovery session is already present (e.g. Supabase processed the
        // URL token before this effect ran), we can proceed immediately.
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          if (!cancelled) setSessionReady(true);
          return;
        }

        // No session yet — wait for the PASSWORD_RECOVERY event that Supabase
        // fires once it has exchanged the one-time code in the URL for tokens.
        timeoutId = setTimeout(() => {
          if (!cancelled) setLinkInvalid(true);
        }, RECOVERY_SESSION_TIMEOUT_MS);

        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            if (timeoutId !== undefined) clearTimeout(timeoutId);
            if (!cancelled) setSessionReady(true);
            unsub?.();
          }
        });
        unsub = () => listener.subscription.unsubscribe();
      })
      .catch(() => {
        if (!cancelled) setLinkInvalid(true);
      });

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      unsub?.();
    };
  }, []);

  const m = useMutation({
    mutationFn: async (data: { password: string }) => {
      const supabase = await ensureSupabase();
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },
    onSuccess: () => {
      setTimeout(() => navigate({ to: "/login" }), 1500);
    },
  });

  if (m.data?.ok) {
    return (
      <AuthShell title={t("reset.doneTitle")} subtitle={t("reset.doneSubtitle")}>
        <Link to="/login" className="kawaii-button block w-full text-center">
          {t("login.submit")} ♡
        </Link>
      </AuthShell>
    );
  }

  if (linkInvalid) {
    return (
      <AuthShell title={t("reset.title")} subtitle={t("reset.subtitle")}>
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            {t("reset.linkInvalid", "This reset link is invalid or has expired.")}
          </p>
          <Link to="/forgot-password" className="kawaii-button block w-full text-center">
            {t("reset.requestNew", "Request a new link")} ✨
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (!sessionReady) {
    return (
      <AuthShell title={t("reset.title")} subtitle={t("reset.subtitle")}>
        <p className="text-center text-sm text-muted-foreground">{t("common.loading")} ✨</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("reset.title")} subtitle={t("reset.subtitle")}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          m.mutate({ password });
        }}
        className="space-y-4"
      >
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
        {m.error ? (
          <p className="text-sm text-destructive">{(m.error as Error).message}</p>
        ) : null}
        <button
          type="submit"
          disabled={m.isPending}
          className="kawaii-button w-full disabled:opacity-60"
        >
          {m.isPending ? t("common.saving") : `${t("reset.submit")} ♡`}
        </button>
      </form>
    </AuthShell>
  );
}
