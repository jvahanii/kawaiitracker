import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { u as useServerFn, L as LanguageSwitcher } from "./_ssr/router-C-k-QGU5.mjs";
import { a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { l as listMyTenants, c as createTenant, j as joinTenant } from "./_ssr/tenants.functions-vHHy7BcB.mjs";
import { s as safeErrorMessage } from "./_ssr/errors-AXygPWtG.mjs";
import "./_libs/sonner.mjs";
import "./_libs/i18next.mjs";
import "./_libs/seroval.mjs";
import { u as useTranslation } from "./_libs/react-i18next.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_ssr/createSsrRpc-CPX7Wu6L.mjs";
import "./_ssr/server-dMKqlv5F.mjs";
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_ssr/auth-middleware-BH87DBXq.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_ssr/client-L_isJv8F.mjs";
import "./_libs/zod.mjs";
import "./_libs/use-sync-external-store.mjs";
function Onboarding() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const listFn = useServerFn(listMyTenants);
  const createFn = useServerFn(createTenant);
  const joinFn = useServerFn(joinTenant);
  const [name, setName] = reactExports.useState("");
  const [code, setCode] = reactExports.useState("");
  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => listFn(),
    retry: 1
  });
  const createM = useMutation({
    mutationFn: (n) => createFn({
      data: {
        name: n
      }
    }),
    onSuccess: (r) => navigate({
      to: "/app/$tenantId",
      params: {
        tenantId: r.id
      }
    })
  });
  const joinM = useMutation({
    mutationFn: (c) => joinFn({
      data: {
        code: c
      }
    }),
    onSuccess: (r) => {
      if (!r.ok) return;
      navigate({
        to: "/app/$tenantId",
        params: {
          tenantId: r.id
        }
      });
    }
  });
  const tenants = tenantsQ.data ?? [];
  const showLoader = tenantsQ.isLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-muted/30 px-4 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm font-semibold tracking-tight hover:underline", children: t("common.back") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("onboarding.heading") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t("onboarding.sub") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {})
    ] }),
    showLoader ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      tenants.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-xl border border-border bg-background p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: t("onboarding.yourWorkspaces", "Your workspaces") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 divide-y divide-border", children: tenants.map((tn) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/$tenantId", params: {
          tenantId: tn.id
        }, className: "flex items-center justify-between py-2 text-sm hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: tn.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: tn.role })
        ] }) }, tn.id)) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-border bg-background p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: t("onboarding.createTitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            createM.mutate(name);
          }, className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: t("onboarding.namePlaceholder"), className: "input" }),
            createM.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: safeErrorMessage(createM.error) }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: createM.isPending, className: "w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60", children: createM.isPending ? t("common.creating") : t("common.create") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-border bg-background p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: t("onboarding.joinTitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            joinM.mutate(code);
          }, className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: t("onboarding.codePlaceholder"), maxLength: 16, className: "input font-mono tracking-widest" }),
            joinM.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: safeErrorMessage(joinM.error) }) : joinM.data && !joinM.data.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: joinM.data.error }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: joinM.isPending, className: "w-full rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60", children: joinM.isPending ? t("common.joining") : t("common.join") })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Onboarding as component
};
