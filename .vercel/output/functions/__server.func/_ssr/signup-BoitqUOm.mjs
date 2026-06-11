import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { e as ensureSupabase } from "./client-L_isJv8F.mjs";
import { s as safeErrorMessage } from "./errors-AXygPWtG.mjs";
import { A as AuthShell, F as Field } from "./router-C-k-QGU5.mjs";
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
import "./createSsrRpc-CPX7Wu6L.mjs";
import "./server-dMKqlv5F.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-BH87DBXq.mjs";
import "../_libs/zod.mjs";
import "../_libs/use-sync-external-store.mjs";
function SignupPage() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const m = useMutation({
    meta: {
      silent: true
    },
    mutationFn: async (data) => {
      const supabase = await ensureSupabase();
      const {
        data: res,
        error
      } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : void 0,
          data: {
            display_name: data.displayName.trim()
          }
        }
      });
      if (error) throw new Error(error.message);
      return {
        ok: true,
        hasSession: !!res.session
      };
    },
    onSuccess: (res) => {
      if (res.hasSession) navigate({
        to: "/onboarding"
      });
    }
  });
  const errorMessage = m.error ? safeErrorMessage(m.error) : null;
  const needsConfirm = m.data && !m.data.hasSession;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthShell, { title: t("signup.title"), subtitle: t("signup.subtitle"), children: [
    needsConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Check your inbox to confirm your email, then log in." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "kawaii-button block w-full text-center", children: [
        t("login.submit"),
        " ♡"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      m.mutate({
        displayName,
        email,
        password
      });
    }, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("signup.name"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "input", autoComplete: "name" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("signup.email"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "input", autoComplete: "email" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("signup.password"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, minLength: 8, value: password, onChange: (e) => setPassword(e.target.value), className: "input", autoComplete: "new-password" }) }),
      errorMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errorMessage }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: m.isPending, className: "kawaii-button w-full disabled:opacity-60", children: m.isPending ? t("signup.submitting") : `${t("signup.submit")} ✨` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
      t("signup.haveAccount"),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-foreground underline-offset-4 hover:underline", children: t("signup.loginLink") })
    ] })
  ] });
}
export {
  SignupPage as component
};
