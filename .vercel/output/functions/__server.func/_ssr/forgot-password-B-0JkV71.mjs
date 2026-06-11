import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { e as ensureSupabase } from "./client-F9s_q744.mjs";
import { s as safeErrorMessage } from "./errors-AXygPWtG.mjs";
import { A as AuthShell, F as Field } from "./router-CLHUrko-.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createSsrRpc-B-oggCnm.mjs";
import "./server-ACSZmim3.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/zod.mjs";
import "../_libs/use-sync-external-store.mjs";
function ForgotPasswordPage() {
  const {
    t
  } = useTranslation();
  const [email, setEmail] = reactExports.useState("");
  const m = useMutation({
    meta: {
      silent: true
    },
    mutationFn: async (data) => {
      const supabase = await ensureSupabase();
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : void 0;
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(data.email.trim().toLowerCase(), {
        redirectTo
      });
      if (error) throw new Error(error.message);
      return {
        ok: true
      };
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: t("forgot.title"), subtitle: t("forgot.subtitle"), children: m.data?.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "If an account exists for that email, a reset link has been sent." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "kawaii-button-soft block w-full text-center text-sm", children: [
      "← ",
      t("login.submit")
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    m.mutate({
      email
    });
  }, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("login.email"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "input", autoComplete: "email" }) }),
    m.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: safeErrorMessage(m.error) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: m.isPending, className: "kawaii-button w-full disabled:opacity-60", children: m.isPending ? t("common.loading") : `${t("forgot.submit")} ✨` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "text-foreground underline-offset-4 hover:underline", children: [
      "← ",
      t("login.submit")
    ] }) })
  ] }) });
}
export {
  ForgotPasswordPage as component
};
