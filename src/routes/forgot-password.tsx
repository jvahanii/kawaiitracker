import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { requestPasswordReset } from "@/lib/api/auth.functions";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Tracker" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const requestFn = useServerFn(requestPasswordReset);
  const [email, setEmail] = useState("");

  const m = useMutation({
    mutationFn: (data: { email: string }) => requestFn({ data }),
  });

  return (
    <AuthShell title={t("forgot.title")} subtitle={t("forgot.subtitle")}>
      {m.data ? (
        <div className="space-y-4">
          {m.data.url ? (
            <>
              <p className="text-sm text-muted-foreground">{t("forgot.linkReady")}</p>
              <div className="rounded-2xl border-2 border-border bg-muted/30 p-3 text-xs break-all">
                <a
                  href={m.data.url}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {m.data.url}
                </a>
              </div>
              <p className="text-xs text-muted-foreground">{t("forgot.expiresNote")}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("forgot.noAccount")}</p>
          )}
          <Link
            to="/login"
            className="kawaii-button-soft block w-full text-center text-sm"
          >
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
          <button
            type="submit"
            disabled={m.isPending}
            className="kawaii-button w-full disabled:opacity-60"
          >
            {m.isPending ? t("common.loading") : `${t("forgot.submit")} ✨`}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              ← {t("login.submit")}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
