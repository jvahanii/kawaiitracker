import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { resetPassword } from "@/lib/api/auth.functions";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Tracker" }] }),
  validateSearch: z.object({ token: z.string().optional() }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const resetFn = useServerFn(resetPassword);
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: (data: { token: string; password: string }) => resetFn({ data }),
    onSuccess: (res) => {
      if (res.ok) setTimeout(() => navigate({ to: "/login" }), 1500);
    },
  });

  const errorMessage = m.error
    ? (m.error as Error).message
    : m.data && !m.data.ok
      ? m.data.error
      : null;

  if (!token) {
    return (
      <AuthShell title={t("reset.invalidTitle")} subtitle={t("reset.invalidSubtitle")}>
        <Link to="/forgot-password" className="kawaii-button block w-full text-center">
          {t("forgot.submit")} ✨
        </Link>
      </AuthShell>
    );
  }

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
          m.mutate({ token, password });
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
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
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
