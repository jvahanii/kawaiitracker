import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { getMe } from "@/lib/api/auth.functions";
import { listMyTenants } from "@/lib/api/tenants.functions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tracker — Multi-tenant item tracker" },
      { name: "description", content: "Track items across teams. Create or join a workspace with a code." },
    ],
  }),
  beforeLoad: async () => {
    const me = await getMe();
    if (!me) return;
    const tenants = await listMyTenants();
    if (tenants.length === 0) throw redirect({ to: "/onboarding" });
    throw redirect({ to: "/app/$tenantId", params: { tenantId: tenants[0].id } });
  },
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">{t("common.appName")}</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/login" className="rounded-md px-3 py-1.5 text-sm hover:bg-accent">
              {t("landing.login")}
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("landing.signup")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-balance text-5xl font-semibold tracking-tight">
          {t("landing.heading")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-muted-foreground">
          {t("landing.sub")}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("landing.getStarted")}
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            {t("landing.haveAccount")}
          </Link>
        </div>
      </main>
    </div>
  );
}
