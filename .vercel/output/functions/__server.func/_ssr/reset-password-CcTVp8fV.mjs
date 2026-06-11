import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { e as ensureSupabase } from "./client-cGEFPIfD.mjs";
import { s as safeErrorMessage } from "./errors-AXygPWtG.mjs";
import { A as AuthShell, F as Field } from "./router-Bkldq2G_.mjs";
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
import "./createSsrRpc-B_sfLEGR.mjs";
import "./server-CERHnNmm.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-3tVLAvsj.mjs";
import "../_libs/zod.mjs";
import "../_libs/use-sync-external-store.mjs";
const RECOVERY_SESSION_TIMEOUT_MS = 8e3;
function ResetPasswordPage() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = reactExports.useState("");
  const [sessionReady, setSessionReady] = reactExports.useState(false);
  const [linkInvalid, setLinkInvalid] = reactExports.useState(false);
  const [invalidReason, setInvalidReason] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    let timeoutId;
    let unsub;
    const markInvalid = (reason) => {
      if (cancelled) return;
      if (reason) setInvalidReason(reason);
      setLinkInvalid(true);
    };
    (async () => {
      try {
        const supabase = await ensureSupabase();
        if (cancelled) return;
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const errParam = url.searchParams.get("error_description") ?? url.searchParams.get("error") ?? hash.get("error_description") ?? hash.get("error");
        if (errParam) {
          markInvalid(errParam);
          return;
        }
        const code = url.searchParams.get("code");
        if (code) {
          const {
            error
          } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (error) {
            const {
              data: existingSession
            } = await supabase.auth.getSession();
            if (cancelled) return;
            if (existingSession.session) {
              url.searchParams.delete("code");
              window.history.replaceState({}, "", url.pathname + url.search + url.hash);
              setSessionReady(true);
              return;
            }
            markInvalid(error.message);
            return;
          }
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
          setSessionReady(true);
          return;
        }
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const type = hash.get("type");
        if (accessToken && refreshToken && type === "recovery") {
          const {
            error
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (cancelled) return;
          if (error) {
            markInvalid(error.message);
            return;
          }
          window.history.replaceState({}, "", url.pathname + url.search);
          setSessionReady(true);
          return;
        }
        const {
          data: sessionData
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionData.session) {
          setSessionReady(true);
          return;
        }
        timeoutId = setTimeout(() => markInvalid("timeout"), RECOVERY_SESSION_TIMEOUT_MS);
        const {
          data: listener
        } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            if (timeoutId !== void 0) clearTimeout(timeoutId);
            if (!cancelled) setSessionReady(true);
            unsub?.();
          }
        });
        unsub = () => listener.subscription.unsubscribe();
      } catch (e) {
        markInvalid(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      if (timeoutId !== void 0) clearTimeout(timeoutId);
      unsub?.();
    };
  }, []);
  const m = useMutation({
    meta: {
      silent: true
    },
    mutationFn: async (data) => {
      const supabase = await ensureSupabase();
      const {
        error
      } = await supabase.auth.updateUser({
        password: data.password
      });
      if (error) throw new Error(error.message);
      return {
        ok: true
      };
    },
    onSuccess: () => {
      setTimeout(() => navigate({
        to: "/login"
      }), 1500);
    }
  });
  if (m.data?.ok) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: t("reset.doneTitle"), subtitle: t("reset.doneSubtitle"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "kawaii-button block w-full text-center", children: [
      t("login.submit"),
      " ♡"
    ] }) });
  }
  if (linkInvalid) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: t("reset.title"), subtitle: t("reset.subtitle"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: t("reset.linkInvalid", "This reset link is invalid or has expired.") }),
      invalidReason ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground break-words", children: invalidReason }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/forgot-password", className: "kawaii-button block w-full text-center", children: [
        t("reset.requestNew", "Request a new link"),
        " ✨"
      ] })
    ] }) });
  }
  if (!sessionReady) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: t("reset.title"), subtitle: t("reset.subtitle"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
      t("common.loading"),
      " ✨"
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: t("reset.title"), subtitle: t("reset.subtitle"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    m.mutate({
      password
    });
  }, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("signup.password"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, minLength: 8, value: password, onChange: (e) => setPassword(e.target.value), className: "input", autoComplete: "new-password" }) }),
    m.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: safeErrorMessage(m.error) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: m.isPending, className: "kawaii-button w-full disabled:opacity-60", children: m.isPending ? t("common.saving") : t("reset.submit") })
  ] }) });
}
export {
  ResetPasswordPage as component
};
