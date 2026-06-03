import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ensureSupabase } from "@/lib/supabase/client";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Set new password — Tracker" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

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
