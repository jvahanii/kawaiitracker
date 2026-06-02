import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { getSupabase } from "@/lib/supabase/client";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Tracker" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const m = useMutation({
    mutationFn: async (data: { email: string }) => {
      const supabase = getSupabase();
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email.trim().toLowerCase(),
        { redirectTo },
      );
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },
  });

  return (
    <AuthShell title={t("forgot.title")} subtitle={t("forgot.subtitle")}>
      {m.data?.ok ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link has been sent.
          </p>
          <Link to="/login" className="kawaii-button-soft block w-full text-center text-sm">
            ← {t("login.submit")}
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            m.mutate({ email });
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
          {m.error ? (
            <p className="text-sm text-destructive">{(m.error as Error).message}</p>
          ) : null}
          <button
            type="submit"
            disabled={m.isPending}
            className="kawaii-button w-full disabled:opacity-60"
          >
            {m.isPending ? t("common.loading") : `${t("forgot.submit")} ✨`}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
              ← {t("login.submit")}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
