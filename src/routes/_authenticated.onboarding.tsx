import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { createTenant, joinTenant, listMyTenants } from "@/lib/api/tenants.functions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Tracker" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listFn = useServerFn(listMyTenants);
  const createFn = useServerFn(createTenant);
  const joinFn = useServerFn(joinTenant);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => listFn(),
    retry: 1,
  });

  useEffect(() => {
    const firstTenant = tenantsQ.data?.[0];
    if (firstTenant) {
      navigate({ to: "/app/$tenantId", params: { tenantId: firstTenant.id }, replace: true });
    }
  }, [navigate, tenantsQ.data]);

  const createM = useMutation({
    mutationFn: (n: string) => createFn({ data: { name: n } }),
    onSuccess: (r) => navigate({ to: "/app/$tenantId", params: { tenantId: r.id } }),
  });
  const joinM = useMutation({
    mutationFn: (c: string) => joinFn({ data: { code: c } }),
    onSuccess: (r) => {
      if (!r.ok) return;
      navigate({ to: "/app/$tenantId", params: { tenantId: r.id } });
    },
  });

  const hasTenant = (tenantsQ.data?.length ?? 0) > 0;
  const showLoader = tenantsQ.isLoading || !tenantsQ.isFetched || hasTenant;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-start justify-between">
          <div>
            <Link
              to="/"
              className="text-sm font-semibold tracking-tight hover:underline"
            >
              {t("common.back")}
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{t("onboarding.heading")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.sub")}</p>
          </div>
          <LanguageSwitcher />
        </div>
        {showLoader ? (
          <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">

          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="text-base font-semibold">{t("onboarding.createTitle")}</h2>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                createM.mutate(name);
              }}
              className="mt-4 space-y-3"
            >
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("onboarding.namePlaceholder")}
                className="input"
              />
              {createM.error ? (
                <p className="text-sm text-destructive">{(createM.error as Error).message}</p>
              ) : null}
              <button
                type="submit"
                disabled={createM.isPending}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {createM.isPending ? t("common.creating") : t("common.create")}
              </button>
            </form>
          </section>
          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="text-base font-semibold">{t("onboarding.joinTitle")}</h2>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                joinM.mutate(code);
              }}
              className="mt-4 space-y-3"
            >
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t("onboarding.codePlaceholder")}
                maxLength={16}
                className="input font-mono tracking-widest"
              />
              {joinM.error ? (
                <p className="text-sm text-destructive">{(joinM.error as Error).message}</p>
              ) : joinM.data && !joinM.data.ok ? (
                <p className="text-sm text-destructive">{joinM.data.error}</p>
              ) : null}
              <button
                type="submit"
                disabled={joinM.isPending}
                className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
              >
                {joinM.isPending ? t("common.joining") : t("common.join")}
              </button>
            </form>
          </section>
        </div>
        )}
      </div>
    </div>
  );
}

    </div>
  );
}
