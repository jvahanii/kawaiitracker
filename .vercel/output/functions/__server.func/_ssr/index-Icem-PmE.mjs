import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as applyDetectedLanguage, L as LanguageSwitcher, K as KiwiWithKey } from "./router-AQXM4Gbq.mjs";
import { i as instance } from "../_libs/i18next.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { u as useTranslation } from "../_libs/react-i18next.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-D-xo_wI2.mjs";
import "./server-C1BuN9pZ.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-CgwmKKGY.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./client-dZ0Q4Mvy.mjs";
import "../_libs/zod.mjs";
import "../_libs/use-sync-external-store.mjs";
function Landing() {
  const {
    t
  } = useTranslation();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
    applyDetectedLanguage();
  }, []);
  const tr = mounted ? t : instance.getFixedT("en");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold tracking-tight", style: {
        fontFamily: "Fredoka, sans-serif"
      }, children: [
        "🌸 ",
        tr("common.appName")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        mounted ? /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-8 w-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/help", className: "text-sm text-muted-foreground hover:text-foreground", children: mounted && instance.language?.toLowerCase().startsWith("fi") ? "Käyttöohje" : "Help" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "kawaii-button-soft text-sm", children: tr("landing.login") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "kawaii-button text-sm", children: [
          tr("landing.signup"),
          " ♡"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative mx-auto max-w-3xl px-6 py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 inline-block rounded-full border-2 border-border bg-white/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm", children: "✨ 🥝 ʕ•ᴥ•ʔ 🥝 ✨" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "whitespace-pre-line text-balance text-6xl font-bold tracking-tight", children: tr("landing.heading") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground", children: tr("landing.sub") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "kawaii-button", children: [
          tr("landing.getStarted"),
          " 🥝"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "kawaii-button-soft", children: tr("landing.haveAccount") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-12 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { alt: "Kawaii kiwi mascot with a key", width: 256, height: 256, className: "h-40 w-40 animate-bounce drop-shadow-xl sm:h-56 sm:w-56", imgClassName: "h-full w-full", keyClassName: "h-9 w-9 sm:h-12 sm:w-12" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none mt-8 flex justify-center gap-6 text-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-bounce", children: "🥝" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "🍡" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-bounce", children: "🌷" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "🥝" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-bounce", children: "🐰" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "⭐" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-bounce", children: "🍓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "🥝" })
      ] })
    ] })
  ] });
}
export {
  Landing as component
};
