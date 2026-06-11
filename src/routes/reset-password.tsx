import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ensureSupabase } from "@/lib/supabase/client";
import { safeErrorMessage } from "@/lib/errors";
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
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsub: (() => void) | undefined;

    const markInvalid = (reason?: string) => {
      if (cancelled) return;
      if (reason) setInvalidReason(reason);
      setLinkInvalid(true);
    };

    (async () => {
      try {
        const supabase = await ensureSupabase();
        if (cancelled) return;

        const url = new URL(window.location.href);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

        // 1. Explicit error in URL (expired / used link from Supabase).
        const errParam =
          url.searchParams.get("error_description") ??
          url.searchParams.get("error") ??
          hash.get("error_description") ??
          hash.get("error");
        if (errParam) {
          markInvalid(errParam);
          return;
        }

        // 2. PKCE flow: `?code=...` — must exchange for a session.
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (error) {
            // The code may have already been exchanged (e.g. by a prior render
            // or a concurrent call). Fall through to the session check before
            // declaring the link invalid.
            const { data: existingSession } = await supabase.auth.getSession();
            if (cancelled) return;
            if (existingSession.session) {
              url.searchParams.delete("code");
              window.history.replaceState({}, "", url.pathname + url.search + url.hash);
              setSessionReady(true);
              return;
            }
            markInvalid(error.message);
            return;
          }
          // Clean the code from the URL so a refresh does not re-exchange.
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
          setSessionReady(true);
          return;
        }

        // 3. Implicit flow: tokens come in the URL hash.
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const type = hash.get("type");
        if (accessToken && refreshToken && type === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (cancelled) return;
          if (error) {
            markInvalid(error.message);
            return;
          }
          window.history.replaceState({}, "", url.pathname + url.search);
          setSessionReady(true);
          return;
        }

        // 4. Recovery session may already be present from a prior detectSessionInUrl run.
        const { data: sessionData } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionData.session) {
          setSessionReady(true);
          return;
        }

        // 5. Last resort: wait briefly for PASSWORD_RECOVERY event.
        timeoutId = setTimeout(() => markInvalid("timeout"), RECOVERY_SESSION_TIMEOUT_MS);
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            if (timeoutId !== undefined) clearTimeout(timeoutId);
            if (!cancelled) setSessionReady(true);
            unsub?.();
          }
        });
        unsub = () => listener.subscription.unsubscribe();
      } catch (e) {
        markInvalid(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      unsub?.();
    };
  }, []);

  const m = useMutation({
    meta: { silent: true },
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
          {invalidReason ? (
            <p className="text-xs text-muted-foreground break-words">{invalidReason}</p>
          ) : null}
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
          {m.isPending ? t("common.saving") : t("reset.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
