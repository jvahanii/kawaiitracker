import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link, d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { K as KiwiWithKey, L as LanguageSwitcher, u as useServerFn } from "./router-C-k-QGU5.mjs";
import { e as ensureSupabase } from "./client-L_isJv8F.mjs";
import { s as safeErrorMessage } from "./errors-AXygPWtG.mjs";
import { g as getLastTenantId } from "./tenants.functions-vHHy7BcB.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/seroval.mjs";
import { u as useTranslation } from "../_libs/react-i18next.mjs";
import { E as EyeOff, a as Eye } from "../_libs/lucide-react.mjs";
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
import "./createSsrRpc-CPX7Wu6L.mjs";
import "./server-dMKqlv5F.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-BH87DBXq.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "../_libs/use-sync-external-store.mjs";
const REMEMBER_KEY = "rememberedEmail";
function LoginPage() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const getLastTenantFn = useServerFn(getLastTenantId);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [rememberMe, setRememberMe] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
    }
  }, []);
  const m = useMutation({
    meta: {
      silent: true
    },
    mutationFn: async (data) => {
      const supabase = await ensureSupabase();
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password
      });
      if (error) throw new Error(error.message);
      try {
        if (data.rememberMe) {
          localStorage.setItem(REMEMBER_KEY, data.email.trim().toLowerCase());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {
      }
      return {
        ok: true
      };
    },
    onSuccess: async () => {
      let lastTenantId = null;
      try {
        const r = await getLastTenantFn();
        lastTenantId = r?.id ?? null;
      } catch {
      }
      if (!lastTenantId) {
        try {
          lastTenantId = localStorage.getItem("lastTenantId");
        } catch {
        }
      }
      if (lastTenantId) {
        navigate({
          to: "/app/$tenantId",
          params: {
            tenantId: lastTenantId
          }
        });
      } else {
        navigate({
          to: "/onboarding"
        });
      }
    }
  });
  const errorMessage = m.error ? safeErrorMessage(m.error) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthShell, { title: t("login.title"), subtitle: t("login.subtitle"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      m.mutate({
        email,
        password,
        rememberMe
      });
    }, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("login.email"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "input", autoComplete: "email" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("login.password"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: showPassword ? "text" : "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "input pr-10", autoComplete: "current-password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPassword((v) => !v), className: "absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", "aria-label": showPassword ? t("login.hidePassword") : t("login.showPassword"), children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 18 }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "rememberMe", className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "rememberMe", type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked), className: "h-4 w-4 rounded border-border" }),
        t("login.rememberMe")
      ] }),
      errorMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errorMessage }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: m.isPending, className: "kawaii-button w-full disabled:opacity-60", children: m.isPending ? t("login.submitting") : `${t("login.submit")} ♡` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline", children: t("login.forgotPassword") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-center text-sm text-muted-foreground", children: [
      t("login.newHere"),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "text-foreground underline-offset-4 hover:underline", children: t("login.createAccount") })
    ] })
  ] });
}
function AuthShell({
  title,
  subtitle,
  children
}) {
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 overflow-hidden text-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-[8%] top-[12%] animate-pulse", children: "🌸" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-[10%] top-[18%]", children: "✨" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-[14%] bottom-[18%]", children: "🍡" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-[12%] bottom-[14%] animate-pulse", children: "💖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-[45%] top-[6%]", children: "☁️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { className: "absolute -left-6 bottom-10 h-28 w-28 rotate-[-12deg] opacity-90 sm:left-[6%] sm:h-36 sm:w-36", imgClassName: "h-full w-full", keyClassName: "h-6 w-6 sm:h-8 sm:w-8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { className: "absolute -right-4 top-24 h-24 w-24 rotate-[18deg] opacity-90 sm:right-[6%] sm:h-32 sm:w-32", imgClassName: "h-full w-full", keyClassName: "h-5 w-5 sm:h-7 sm:w-7" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "kawaii-card relative w-full max-w-sm p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { alt: "Kawaii kiwi", width: 96, height: 96, className: "h-16 w-16 drop-shadow-md", imgClassName: "h-full w-full", keyClassName: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm text-muted-foreground hover:text-foreground", children: t("common.back") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-5 text-center text-3xl font-bold tracking-tight text-foreground", children: [
        title,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block", children: "🥝" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-sm text-muted-foreground", children: subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-medium", children: label }),
    children
  ] });
}
export {
  AuthShell,
  Field,
  LoginPage as component
};
