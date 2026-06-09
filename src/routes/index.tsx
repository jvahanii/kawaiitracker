import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { KiwiWithKey } from "@/components/KiwiWithKey";
import i18n, { applyDetectedLanguage } from "@/lib/i18n";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tracker — Multi-tenant item tracker" },
      { name: "description", content: "Track items across teams. Create or join a workspace with a code." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    applyDetectedLanguage();
  }, []);
  // First client render must match SSR (English) to avoid React error #418.
  // After mount we switch to the detected language.
  const tr = mounted ? t : i18n.getFixedT("en");
  return (
    <div className="min-h-screen text-foreground">
      <header>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Fredoka, sans-serif" }}>
            🌸 {tr("common.appName")}
          </span>
          <div className="flex items-center gap-3">
            {mounted ? <LanguageSwitcher /> : <span className="inline-block h-8 w-10" />}
            <Link to="/login" className="kawaii-button-soft text-sm">
              {tr("landing.login")}
            </Link>
            <Link to="/signup" className="kawaii-button text-sm">
              {tr("landing.signup")} ♡
            </Link>
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="mb-6 inline-block rounded-full border-2 border-border bg-white/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
          ✨ 🥝 ʕ•ᴥ•ʔ 🥝 ✨
        </div>
        <h1 className="whitespace-pre-line text-balance text-6xl font-bold tracking-tight">
          {tr("landing.heading")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground">
          {tr("landing.sub")}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/signup" className="kawaii-button">
            {tr("landing.getStarted")} 🥝
          </Link>
          <Link to="/login" className="kawaii-button-soft">
            {tr("landing.haveAccount")}
          </Link>
        </div>
        <div className="relative mt-12 flex justify-center">
          <KiwiWithKey
            alt="Kawaii kiwi mascot with a key"
            width={256}
            height={256}
            className="h-40 w-40 animate-bounce drop-shadow-xl sm:h-56 sm:w-56"
            imgClassName="h-full w-full"
            keyClassName="h-9 w-9 sm:h-12 sm:w-12"
          />
        </div>
        <div className="pointer-events-none mt-8 flex justify-center gap-6 text-3xl">
          <span className="animate-bounce">🥝</span>
          <span className="animate-pulse">🍡</span>
          <span className="animate-bounce">🌷</span>
          <span className="animate-pulse">🥝</span>
          <span className="animate-bounce">🐰</span>
          <span className="animate-pulse">⭐</span>
          <span className="animate-bounce">🍓</span>
          <span className="animate-pulse">🥝</span>
        </div>
      </main>
    </div>
  );
}
