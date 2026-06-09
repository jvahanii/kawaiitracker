import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  grantSuperuserByEmail,
  isSuperuser,
  listSuperusers,
  revokeSuperuser,
} from "@/lib/api/superusers.functions";

export const Route = createFileRoute("/_authenticated/superusers")({
  head: () => ({ meta: [{ title: "Superusers — Tracker" }] }),
  component: SuperusersPage,
});

function SuperusersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isSuperFn = useServerFn(isSuperuser);
  const listFn = useServerFn(listSuperusers);
  const grantFn = useServerFn(grantSuperuserByEmail);
  const revokeFn = useServerFn(revokeSuperuser);

  const meQ = useQuery({
    queryKey: ["is-superuser"],
    queryFn: () => isSuperFn(),
    retry: 1,
  });

  const listQ = useQuery({
    queryKey: ["superusers"],
    queryFn: () => listFn(),
    enabled: meQ.data?.is === true,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["superusers"] });

  const grantM = useMutation({
    mutationFn: (email: string) => grantFn({ data: { email } }),
    meta: { silent: true },
    onSuccess: (res) => {
      if (res && "ok" in res && res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(t("superusers.granted", "Superuser added"));
      invalidate();
      setEmail("");
    },
  });

  const revokeM = useMutation({
    mutationFn: (userId: string) => revokeFn({ data: { userId } }),
    onSuccess: invalidate,
  });

  const [email, setEmail] = useState("");

  if (meQ.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }
  if (!meQ.data?.is) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-lg font-semibold">{t("common.notAuthorized", "Not authorized")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("superusers.onlySupers", "Only superusers can view this page.")}
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/onboarding" })}
          className="mt-4 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  const rows = listQ.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/onboarding" className="rounded-md px-2 py-1 text-sm hover:bg-accent">
            ← {t("common.back")}
          </Link>
          <h1 className="text-lg font-semibold">{t("superusers.title", "Superusers")}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-base font-semibold">
            {t("superusers.addTitle", "Add superuser")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "superusers.addBody",
              "The user must already have an account. They will gain access to every workspace.",
            )}
          </p>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (!email.trim()) return;
              grantM.mutate(email.trim());
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input h-9 flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={grantM.isPending || !email.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {grantM.isPending ? t("common.saving") : t("common.add")}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-base font-semibold">
            {t("superusers.currentTitle", "Current superusers")}
          </h2>
          {listQ.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : rows.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("superusers.empty", "No superusers yet.")}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {rows.map((r) => (
                <li key={r.userId} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{r.displayName || r.email}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => revokeM.mutate(r.userId)}
                    disabled={revokeM.isPending}
                    className="rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {t("superusers.revoke", "Revoke")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
