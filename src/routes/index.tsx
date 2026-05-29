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
    <div className="min-h-screen text-foreground">
      <header>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Fredoka, sans-serif" }}>
            🌸 {t("common.appName")}
          </span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login" className="kawaii-button-soft text-sm">
              {t("landing.login")}
            </Link>
            <Link to="/signup" className="kawaii-button text-sm">
              {t("landing.signup")} ♡
            </Link>
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="mb-6 inline-block rounded-full border-2 border-border bg-white/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
          ✨ ʕ•ᴥ•ʔ ✨
        </div>
        <h1 className="whitespace-pre-line text-balance text-6xl font-bold tracking-tight">
          {t("landing.heading")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground">
          {t("landing.sub")}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/signup" className="kawaii-button">
            {t("landing.getStarted")} 🌷
          </Link>
          <Link to="/login" className="kawaii-button-soft">
            {t("landing.haveAccount")}
          </Link>
        </div>
        <div className="pointer-events-none mt-16 flex justify-center gap-6 text-3xl">
          <span className="animate-bounce">🍡</span>
          <span className="animate-pulse">🌷</span>
          <span className="animate-bounce">🐰</span>
          <span className="animate-pulse">⭐</span>
          <span className="animate-bounce">🍓</span>
        </div>
      </main>
    </div>
  );
}
