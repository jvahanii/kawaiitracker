import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import i18n, { applyDetectedLanguage } from "@/lib/i18n";

import guideEn from "../../docs/USER_GUIDE.en.md?raw";
import guideFi from "../../docs/USER_GUIDE.fi.md?raw";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "User guide — Keywi" },
      { name: "description", content: "User guide for Keywi: workspaces, savings, monthly entries, goals, currency, admin and superuser features." },
      { property: "og:title", content: "User guide — Keywi" },
      { property: "og:description", content: "User guide for Keywi." },
      { property: "og:url", content: "https://kawaiitracker.lovable.app/help" },
    ],
    links: [{ rel: "canonical", href: "https://kawaiitracker.lovable.app/help" }],
  }),
  component: HelpPage,
});

function renderMarkdown(src: string) {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] | null = null;
  let para: string[] | null = null;
  let key = 0;

  const inline = (text: string) => {
    // bold **x**, then split for code `x`
    const parts: React.ReactNode[] = [];
    const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[1]) parts.push(<strong key={`b${i++}`}>{m[1]}</strong>);
      else if (m[2]) parts.push(<code key={`c${i++}`} className="rounded bg-muted px-1 py-0.5 text-sm">{m[2]}</code>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  const flushList = () => {
    if (list) {
      out.push(
        <ul key={`ul-${key++}`} className="my-3 ml-6 list-disc space-y-1">
          {list.map((li, i) => <li key={i}>{inline(li)}</li>)}
        </ul>
      );
      list = null;
    }
  };
  const flushPara = () => {
    if (para) {
      out.push(<p key={`p-${key++}`} className="my-3 leading-relaxed">{inline(para.join(" "))}</p>);
      para = null;
    }
  };
  const flushAll = () => { flushList(); flushPara(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushAll(); continue; }
    if (line.startsWith("# ")) { flushAll(); out.push(<h1 key={`h-${key++}`} className="mt-6 mb-4 text-4xl font-bold">{inline(line.slice(2))}</h1>); continue; }
    if (line.startsWith("## ")) { flushAll(); out.push(<h2 key={`h-${key++}`} className="mt-8 mb-3 text-2xl font-semibold">{inline(line.slice(3))}</h2>); continue; }
    if (line.startsWith("### ")) { flushAll(); out.push(<h3 key={`h-${key++}`} className="mt-5 mb-2 text-lg font-semibold">{inline(line.slice(4))}</h3>); continue; }
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) { flushPara(); if (!list) list = []; list.push(ol[1]); continue; }
    if (line.startsWith("- ")) { flushPara(); if (!list) list = []; list.push(line.slice(2)); continue; }
    flushList();
    if (!para) para = [];
    para.push(line.trim());
  }
  flushAll();
  return out;
}

function HelpPage() {
  const { t, i18n: i18nHook } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    applyDetectedLanguage();
  }, []);
  const tr = mounted ? t : i18n.getFixedT("en");
  const lang = mounted ? i18nHook.language : "en";
  const content = lang?.toLowerCase().startsWith("fi") ? guideFi : guideEn;

  const handleBack = () => {
    if (mounted && router.history.canGoBack()) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight" style={{ fontFamily: "Fredoka, sans-serif" }}>
            🌸 Keywi
          </Link>
          <div className="flex items-center gap-3">
            {mounted ? <LanguageSwitcher /> : <span className="inline-block h-8 w-10" />}
            <button type="button" onClick={handleBack} className="kawaii-button-soft text-sm">
              {tr("common.back")}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <article className="prose-like">
          {renderMarkdown(content)}
        </article>
      </main>
    </div>
  );
}
