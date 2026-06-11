import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link, g as getRouteApi } from "./_libs/tanstack__react-router.mjs";
import { d as Route, u as useServerFn, L as LanguageSwitcher, c as useCurrency, S as SUPPORTED_CURRENCIES } from "./_ssr/router-C-k-QGU5.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { l as listItems, c as createItem, u as updateItem, d as deleteItem, r as reorderItems, a as listAllEntries, f as formatDateTime, b as listEntriesForItem, e as upsertEntry } from "./_ssr/format-date-CXjP5uVW.mjs";
import { c as createSsrRpc } from "./_ssr/createSsrRpc-CPX7Wu6L.mjs";
import { c as createServerFn } from "./_ssr/server-dMKqlv5F.mjs";
import { r as requireSupabaseAuth } from "./_ssr/auth-middleware-BH87DBXq.mjs";
import { e as ensureSupabase } from "./_ssr/client-L_isJv8F.mjs";
import { R as Root, P as Portal, C as Content, a as Close, T as Title, D as Description, O as Overlay } from "./_libs/radix-ui__react-dialog.mjs";
import { i as isSuperuser, A as AlertDialog, f as AlertDialogContent, h as AlertDialogHeader, j as AlertDialogTitle, o as AlertDialogDescription, k as AlertDialogFooter, m as AlertDialogCancel, n as AlertDialogAction, p as cn } from "./_ssr/superusers.functions-BO8TRMjP.mjs";
import { l as listMyTenants, a as listTenantMembers, f as setLastTenantId } from "./_ssr/tenants.functions-vHHy7BcB.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import "./_libs/i18next.mjs";
import "./_libs/seroval.mjs";
import { u as useTranslation } from "./_libs/react-i18next.mjs";
import { F as FolderPlus, X, C as ChevronDown, b as ChevronRight, L as Lock, P as Pencil, T as Trash2, G as GripVertical } from "./_libs/lucide-react.mjs";
import { R as ResponsiveContainer, C as ComposedChart, a as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, A as Area, L as LabelList, b as ReferenceLine, c as Line } from "./_libs/recharts.mjs";
import { o as objectType, s as stringType, n as numberType, a as arrayType, b as booleanType } from "./_libs/zod.mjs";
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
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/use-sync-external-store.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/lodash.mjs";
import "./_libs/tiny-invariant.mjs";
import "./_libs/react-is.mjs";
import "./_libs/d3-shape.mjs";
import "./_libs/d3-path.mjs";
import "./_libs/react-smooth.mjs";
import "./_libs/prop-types.mjs";
import "./_libs/fast-equals.mjs";
import "./_libs/victory-vendor.mjs";
import "./_libs/d3-scale.mjs";
import "./_libs/internmap.mjs";
import "./_libs/d3-array.mjs";
import "./_libs/d3-time-format.mjs";
import "./_libs/d3-time.mjs";
import "./_libs/d3-interpolate.mjs";
import "./_libs/d3-color.mjs";
import "./_libs/d3-format.mjs";
import "./_libs/recharts-scale.mjs";
import "./_libs/decimal.js-light.mjs";
import "./_libs/eventemitter3.mjs";
function CurrencySwitcher({ className = "" }) {
  const { currency, setCurrency } = useCurrency();
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "select",
    {
      "aria-label": t("workspace.currency", "Currency"),
      title: t("workspace.currency", "Currency"),
      value: currency,
      onChange: (e) => setCurrency(e.target.value),
      className: `h-8 rounded-md border border-border bg-background px-2 text-xs ${className}`,
      children: SUPPORTED_CURRENCIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
    }
  );
}
const getGoal = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(1900).max(3e3)
}).parse(d)).handler(createSsrRpc("d7137616dfb9022b1e8e0553ea7e22b7850cd016b0470a861fef015d98bb1ad9"));
const upsertGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(1900).max(3e3),
  amount: numberType().min(-1e9).max(1e9).nullable(),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()
}).parse(d)).handler(createSsrRpc("a43225206d2e60b084bd996fd6abe9bedb3910b268db6f21487a15ebddd4f28a"));
function monthKey(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}
function colorFor(id, idx) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  const hue = (h + idx * 47) % 360;
  return `oklch(0.72 0.15 ${hue})`;
}
function darkColorFor(id, idx) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  const hue = (h + idx * 47) % 360;
  return `oklch(0.42 0.17 ${hue})`;
}
function SavingsChart({ tenantId }) {
  const { t, i18n } = useTranslation();
  const [year, setYear] = reactExports.useState(() => (/* @__PURE__ */ new Date()).getFullYear());
  const [groupBy, setGroupBy] = reactExports.useState("item");
  const queryClient = useQueryClient();
  const { format: fmt, convert, toEur, currency } = useCurrency();
  const currencySymbol = reactExports.useMemo(() => {
    const parts = new Intl.NumberFormat(i18n.language, { style: "currency", currency }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  }, [i18n.language, currency]);
  const listFn = useServerFn(listAllEntries);
  const itemsFn = useServerFn(listItems);
  const getGoalFn = useServerFn(getGoal);
  const upsertGoalFn = useServerFn(upsertGoal);
  const goalKey = ["savings-goal", tenantId, year];
  const goalQ = useQuery({
    queryKey: goalKey,
    queryFn: () => getGoalFn({ data: { tenantId, year } })
  });
  const goal = goalQ.data ?? { amount: null, date: null };
  const upsertM = useMutation({
    mutationFn: (g) => upsertGoalFn({ data: { tenantId, year, amount: g.amount, date: g.date } }),
    onMutate: async (g) => {
      await queryClient.cancelQueries({ queryKey: goalKey });
      const prev = queryClient.getQueryData(goalKey);
      queryClient.setQueryData(goalKey, g);
      return { prev };
    },
    onError: (_e, _g, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(goalKey, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalKey });
    }
  });
  const saveGoal = (g) => upsertM.mutate(g);
  const [amountDraft, setAmountDraft] = reactExports.useState(
    goal.amount === null ? "" : String(Math.round(convert(goal.amount) * 100) / 100)
  );
  const amountFocusedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (amountFocusedRef.current) return;
    setAmountDraft(
      goal.amount === null ? "" : String(Math.round(convert(goal.amount) * 100) / 100)
    );
  }, [goal.amount, currency, convert]);
  const amountTimerRef = reactExports.useRef(null);
  const scheduleAmountSave = (raw) => {
    if (amountTimerRef.current) clearTimeout(amountTimerRef.current);
    amountTimerRef.current = setTimeout(() => {
      const v = raw.trim();
      const parsed = v === "" ? null : Number(v.replace(",", "."));
      if (parsed !== null && Number.isNaN(parsed)) return;
      const nextEur = parsed === null ? null : Math.round(toEur(parsed) * 100) / 100;
      if (nextEur === goal.amount) return;
      saveGoal({ ...goal, amount: nextEur });
    }, 600);
  };
  reactExports.useEffect(() => () => {
    if (amountTimerRef.current) clearTimeout(amountTimerRef.current);
  }, []);
  reactExports.useEffect(() => {
    let cancelled = false;
    let cleanup = null;
    (async () => {
      const supabase = await ensureSupabase().catch(() => null);
      if (!supabase || cancelled) return;
      const channel = supabase.channel(`savings_goals:${tenantId}`).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "savings_goals",
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["savings-goal", tenantId] });
        }
      ).subscribe();
      cleanup = () => {
        supabase.removeChannel(channel);
      };
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [tenantId, queryClient]);
  const entriesQ = useQuery({
    queryKey: ["entries", tenantId],
    queryFn: () => listFn({ data: { tenantId } })
  });
  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => itemsFn({ data: { tenantId } })
  });
  const monthFmt = new Intl.DateTimeFormat(i18n.language, { month: "short" });
  const allEntries = entriesQ.data ?? [];
  const entries = reactExports.useMemo(
    () => allEntries.filter((e) => new Date(e.month).getFullYear() === year),
    [allEntries, year]
  );
  const items = itemsQ.data ?? [];
  const total = reactExports.useMemo(() => entries.reduce((s, e) => s + (e.amount ?? 0), 0), [entries]);
  const actualTotal = reactExports.useMemo(() => entries.reduce((s, e) => s + (e.actual ?? 0), 0), [entries]);
  const itemAssigneeMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const it of items) {
      const ids = it.assignees.map((a) => a.id);
      m.set(it.id, ids.length > 0 ? ids : ["__unassigned"]);
    }
    return m;
  }, [items]);
  const assigneeName = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const it of items) for (const a of it.assignees) m.set(a.id, a.name);
    m.set("__unassigned", t("workspace.unassigned"));
    return m;
  }, [items, t]);
  const { chartData, seriesKeys } = reactExports.useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) months.push(monthKey(new Date(year, m, 1)));
    const keysFor = (itemId) => {
      if (groupBy === "item") return [{ key: itemId, weight: 1 }];
      const ids2 = itemAssigneeMap.get(itemId) ?? ["__unassigned"];
      const w = 1 / ids2.length;
      return ids2.map((id) => ({ key: id, weight: w }));
    };
    const perKeyMonth = /* @__PURE__ */ new Map();
    const perKeyMonthActual = /* @__PURE__ */ new Map();
    const actualPerMonth = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const k = monthKey(new Date(e.month));
      for (const { key, weight } of keysFor(e.itemId)) {
        let m = perKeyMonth.get(key);
        if (!m) {
          m = /* @__PURE__ */ new Map();
          perKeyMonth.set(key, m);
        }
        m.set(k, (m.get(k) ?? 0) + (e.amount ?? 0) * weight);
        let ma = perKeyMonthActual.get(key);
        if (!ma) {
          ma = /* @__PURE__ */ new Map();
          perKeyMonthActual.set(key, ma);
        }
        ma.set(k, (ma.get(k) ?? 0) + (e.actual ?? 0) * weight);
      }
      actualPerMonth.set(k, (actualPerMonth.get(k) ?? 0) + (e.actual ?? 0));
    }
    const ids = Array.from(perKeyMonth.keys());
    const cum = new Map(ids.map((id) => [id, 0]));
    const cumA = new Map(ids.map((id) => [id, 0]));
    let cumActual = 0;
    const now = monthKey(/* @__PURE__ */ new Date());
    const rows = months.map((tm) => {
      const row = { t: tm };
      for (const id of ids) {
        const add = perKeyMonth.get(id)?.get(tm) ?? 0;
        cum.set(id, (cum.get(id) ?? 0) + add);
        row[id] = cum.get(id) ?? 0;
        if (tm <= now) {
          const addA = perKeyMonthActual.get(id)?.get(tm) ?? 0;
          cumA.set(id, (cumA.get(id) ?? 0) + addA);
          row[`${id}__a`] = cumA.get(id) ?? 0;
        }
      }
      if (tm <= now) {
        cumActual += actualPerMonth.get(tm) ?? 0;
        row.__actual = cumActual;
      }
      row.__plan = ids.reduce((s, id) => s + (row[id] ?? 0), 0);
      return row;
    });
    const activeIds = ids.filter(
      (id) => rows.some((r) => (r[id] ?? 0) !== 0 || (r[`${id}__a`] ?? 0) !== 0)
    );
    return { chartData: rows, seriesKeys: activeIds };
  }, [entries, groupBy, itemAssigneeMap, year]);
  const seriesTitle = (id) => groupBy === "item" ? items.find((i) => i.id === id)?.title ?? "—" : assigneeName.get(id) ?? "—";
  const today = Date.now();
  const daysLeft = goal.date && !Number.isNaN(new Date(goal.date).getTime()) ? Math.max(0, Math.ceil((new Date(goal.date).getTime() - today) / (1e3 * 60 * 60 * 24))) : null;
  goal.amount && goal.amount > 0 ? Math.min(100, Math.round(total / goal.amount * 100)) : null;
  const hasData = entries.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-b border-border bg-card/40 px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex flex-wrap items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold tracking-tight", children: t("workspace.chartTitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        t("workspace.chartTotal"),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: fmt(total) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
          "· ",
          t("workspace.actual"),
          ":",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: fmt(actualTotal) })
        ] }),
        daysLeft !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
          "· ",
          t("workspace.daysLeft", { count: daysLeft })
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center gap-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setYear((y) => y - 1),
            className: "rounded px-2 py-0.5 hover:bg-accent",
            "aria-label": "Previous year",
            children: "‹"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: year }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setYear((y) => y + 1),
            className: "rounded px-2 py-0.5 hover:bg-accent",
            "aria-label": "Next year",
            children: "›"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("workspace.goalAmount") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            inputMode: "decimal",
            step: "0.01",
            value: amountDraft,
            onFocus: () => {
              amountFocusedRef.current = true;
            },
            onBlur: () => {
              amountFocusedRef.current = false;
              if (amountTimerRef.current) {
                clearTimeout(amountTimerRef.current);
                amountTimerRef.current = null;
              }
              const v = amountDraft.trim();
              const parsed = v === "" ? null : Number(v.replace(",", "."));
              if (parsed !== null && Number.isNaN(parsed)) return;
              const nextEur = parsed === null ? null : Math.round(toEur(parsed) * 100) / 100;
              if (nextEur === goal.amount) return;
              saveGoal({ ...goal, amount: nextEur });
            },
            onChange: (e) => {
              const v = e.target.value;
              setAmountDraft(v);
              scheduleAmountSave(v);
            },
            placeholder: "0,00",
            className: "input h-7 w-28 py-0 text-xs"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: currencySymbol })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto inline-flex overflow-hidden rounded border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setGroupBy("item"),
            className: `px-2 py-0.5 text-xs ${groupBy === "item" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`,
            children: t("workspace.byItem")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setGroupBy("assignee"),
            className: `px-2 py-0.5 text-xs ${groupBy === "assignee" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`,
            children: t("workspace.byAssignee")
          }
        )
      ] })
    ] }),
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-xs text-muted-foreground", children: t("workspace.chartEmpty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-36 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 8, right: 16, left: 0, bottom: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))", vertical: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        XAxis,
        {
          dataKey: "t",
          type: "number",
          domain: [monthKey(new Date(year, 0, 1)), monthKey(new Date(year, 11, 1))],
          allowDataOverflow: true,
          scale: "time",
          tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
          tickFormatter: (v) => monthFmt.format(new Date(Number(v)))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        YAxis,
        {
          tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
          tickFormatter: (v) => fmt(Number(v)),
          width: 70,
          domain: [0, (dataMax) => Math.max(dataMax, goal.amount ?? 0) * 1.1]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tooltip,
        {
          cursor: { stroke: "hsl(var(--accent))" },
          contentStyle: {
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          },
          labelFormatter: (v) => monthFmt.format(new Date(Number(v))),
          content: ({ payload, label }) => {
            if (!payload || payload.length === 0) return null;
            const row = payload[0]?.payload;
            const totalPlan = row?.__plan ?? 0;
            const totalActual = row?.__actual;
            const rows = [];
            for (const id of seriesKeys) {
              const plan = row?.[id];
              const actual = row?.[`${id}__a`];
              if (plan === void 0 && actual === void 0) continue;
              const name = seriesTitle(id);
              if (actual !== void 0 && plan !== void 0) {
                rows.push({ name, value: `${fmt(actual)} / ${fmt(plan)}` });
              } else if (actual !== void 0) {
                rows.push({ name: `${name} (${t("workspace.actual").toLowerCase()})`, value: fmt(actual) });
              } else if (plan !== void 0) {
                rows.push({ name: `${name} (${t("workspace.chartTotal").toLowerCase()})`, value: fmt(plan) });
              }
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                style: {
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  padding: "8px 12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, marginBottom: 6 }, children: monthFmt.format(new Date(Number(label))) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, marginBottom: rows.length > 0 ? 4 : 0, paddingBottom: rows.length > 0 ? 4 : 0, borderBottom: rows.length > 0 ? "1px solid var(--border)" : "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, lineHeight: 1.6 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "hsl(var(--muted-foreground))" }, children: t("workspace.actualPlan") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "monospace", fontWeight: 700 }, children: [
                      totalActual !== void 0 ? fmt(totalActual) : "—",
                      " / ",
                      fmt(totalPlan)
                    ] })
                  ] }) }),
                  rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, lineHeight: 1.6 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "hsl(var(--muted-foreground))" }, children: r.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 500 }, children: r.value })
                  ] }, r.name))
                ]
              }
            );
          }
        }
      ),
      seriesKeys.map((id, idx) => {
        const c = colorFor(id, idx);
        const dc = darkColorFor(id, idx);
        const m = Math.max(1, chartData.length);
        const targetIndex = m - 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Area,
          {
            type: "monotone",
            dataKey: id,
            name: id,
            stackId: "plan",
            stroke: c,
            fill: c,
            fillOpacity: 0.35,
            strokeWidth: 1,
            strokeDasharray: "3 3",
            isAnimationActive: false,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              LabelList,
              {
                dataKey: id,
                content: (props) => {
                  const i = props.index ?? -1;
                  if (i !== targetIndex) return null;
                  const x = Number(props.x ?? 0);
                  const y = Number(props.y ?? 0);
                  const w = Number(props.width ?? 0);
                  const h = Number(props.height ?? 0);
                  const label = seriesTitle(id);
                  if (!label || label === "—") return null;
                  const cy = h > 16 ? y + h / 2 + 3 : y + 10;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "text",
                    {
                      x: x + w - 4,
                      y: cy,
                      textAnchor: "end",
                      fontSize: 10,
                      fontWeight: 600,
                      fill: dc,
                      style: { paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3, strokeLinejoin: "round" },
                      children: label
                    }
                  );
                }
              }
            )
          },
          id
        );
      }),
      seriesKeys.map((id, idx) => {
        const c = darkColorFor(id, idx);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Area,
          {
            type: "monotone",
            dataKey: `${id}__a`,
            name: `${id}__a`,
            stackId: "actual",
            stroke: c,
            fill: c,
            fillOpacity: 0.85,
            strokeWidth: 1.5,
            isAnimationActive: false
          },
          `${id}__a`
        );
      }),
      goal.date && !Number.isNaN(new Date(goal.date).getTime()) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReferenceLine,
        {
          x: monthKey(new Date(goal.date)),
          stroke: "var(--destructive)",
          strokeDasharray: "2 4",
          label: {
            value: t("workspace.goalDateShort"),
            fill: "var(--destructive)",
            fontSize: 11,
            position: "top"
          }
        }
      ) : null,
      goal.amount && goal.amount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReferenceLine,
        {
          y: goal.amount,
          stroke: "var(--destructive)",
          strokeDasharray: "4 4",
          strokeWidth: 1.5,
          ifOverflow: "extendDomain"
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Line,
        {
          type: "monotone",
          dataKey: "__actual",
          name: "__actual",
          stroke: "hsl(var(--foreground))",
          strokeWidth: 2,
          dot: { r: 2.5, fill: "hsl(var(--foreground))" },
          isAnimationActive: false
        }
      )
    ] }) }) }) }) })
  ] });
}
const Dialog = Root;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-foreground/20 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-5 border-2 bg-card p-6 shadow-2xl shadow-primary/10 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-3xl",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const listFolders = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("86a1c4a14726357395e4bc987e6b19272b5c4f25fae0d97fb74388342618c3b5"));
const createFolder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  name: stringType().min(1).max(120),
  parentId: stringType().uuid().nullable().optional()
}).parse(d)).handler(createSsrRpc("34ec435197349daf2cfaab6e338e4d5d686a7a6bcf2b50b2f03dcf3482d1d55a"));
const updateFolder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid(),
  name: stringType().min(1).max(120).optional(),
  parentId: stringType().uuid().nullable().optional()
}).parse(d)).handler(createSsrRpc("f355e2105a600c3e28e9dfb2f73e4efa1779c7084c096a107c5d36af2450edda"));
const deleteFolder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("01838eea316533bfe116d3710c2480293132bc37a99a9b38a35c282d2ffd1b24"));
const getFolderVisibility = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  folderId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("26d8ca29e2b8be146bdcabd65e4e99cdfebab88ec382ea96832dfde8ede2f0ad"));
const setFolderVisibility = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  folderId: stringType().uuid(),
  restricted: booleanType(),
  userIds: arrayType(stringType().uuid()).max(500)
}).parse(d)).handler(createSsrRpc("cd5d3a391d0485f516faf335a83b0f7fe2a58d2484e63e9b806376a863d458f8"));
const listTasksForItem = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7a05ed2c0e2274bd7f88fd139a20b7a7b4a28ab8e7c2f394dd498c04f59d64c6"));
const createTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid(),
  title: stringType().min(1).max(500),
  userId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("a22c4c022ae9a4a0865866b717aeefb52c843e6683f5aa4a2db70a57a4081a72"));
const updateTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid(),
  title: stringType().min(1).max(500).optional(),
  done: booleanType().optional()
}).parse(d)).handler(createSsrRpc("3bdb0f9163a5f2747bc264fd605c0113a7891d27b6de23c937628b8ee813ad5e"));
const deleteTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("fb2376066efa1db58065bff415a88a247c8578ab5b0e9c7e61628c891ed3992a"));
const reorderTasks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid(),
  orderedIds: arrayType(stringType().uuid()).max(500)
}).parse(d)).handler(createSsrRpc("ba49330b21832c210e0cd377b24f4530471bd9bb285f6416c5b66bf8602df5df"));
const authenticatedRoute = getRouteApi("/_authenticated");
function WorkspacePage() {
  const {
    t
  } = useTranslation();
  const {
    tenantId
  } = Route.useParams();
  const {
    user
  } = authenticatedRoute.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const tenantListFn = useServerFn(listMyTenants);
  const listFn = useServerFn(listItems);
  const membersFn = useServerFn(listTenantMembers);
  const createFn = useServerFn(createItem);
  const updateFn = useServerFn(updateItem);
  const deleteFn = useServerFn(deleteItem);
  const reorderFn = useServerFn(reorderItems);
  const listFoldersFn = useServerFn(listFolders);
  const createFolderFn = useServerFn(createFolder);
  const updateFolderFn = useServerFn(updateFolder);
  const deleteFolderFn = useServerFn(deleteFolder);
  const setLastTenantFn = useServerFn(setLastTenantId);
  const isSuperuserSF = useServerFn(isSuperuser);
  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => tenantListFn(),
    retry: 1
  });
  const isSuperuserQ = useQuery({
    queryKey: ["is-superuser"],
    queryFn: () => isSuperuserSF()
  });
  const tenants = tenantsQ.data ?? [];
  const currentTenant = tenants.find((tn) => tn.id === tenantId) ?? null;
  reactExports.useEffect(() => {
    if (!tenantsQ.data) return;
    if (tenantsQ.data.length === 0) {
      try {
        localStorage.removeItem("lastTenantId");
      } catch {
      }
      navigate({
        to: "/onboarding",
        replace: true
      });
      return;
    }
    if (!currentTenant) {
      try {
        localStorage.removeItem("lastTenantId");
      } catch {
      }
      navigate({
        to: "/app/$tenantId",
        params: {
          tenantId: tenantsQ.data[0].id
        },
        replace: true
      });
      return;
    }
    try {
      localStorage.setItem("lastTenantId", currentTenant.id);
    } catch {
    }
    setLastTenantFn({
      data: {
        tenantId: currentTenant.id
      }
    }).catch(() => {
    });
  }, [currentTenant, navigate, setLastTenantFn, tenantsQ.data]);
  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => listFn({
      data: {
        tenantId
      }
    }),
    enabled: !!currentTenant
  });
  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => membersFn({
      data: {
        tenantId
      }
    }),
    enabled: !!currentTenant
  });
  const foldersQ = useQuery({
    queryKey: ["folders", tenantId],
    queryFn: () => listFoldersFn({
      data: {
        tenantId
      }
    }),
    enabled: !!currentTenant
  });
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [draggingItemId, setDraggingItemId] = reactExports.useState(null);
  const [draggingFolderId, setDraggingFolderId] = reactExports.useState(null);
  const [dragOverItemId, setDragOverItemId] = reactExports.useState(null);
  const [dragOverFolderId, setDragOverFolderId] = reactExports.useState(null);
  const [visibilityFolderId, setVisibilityFolderId] = reactExports.useState(null);
  const folders = foldersQ.data ?? [];
  const isSuperuser$1 = !!isSuperuserQ.data?.is || currentTenant?.role === "superuser";
  const isAdmin = currentTenant?.role === "admin" || isSuperuser$1;
  const items = itemsQ.data ?? [];
  const filtered = reactExports.useMemo(() => {
    return items.filter((i) => {
      if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search]);
  reactExports.useEffect(() => {
    if (selectedId && !items.find((i) => i.id === selectedId)) setSelectedId(null);
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [items, filtered, selectedId]);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const pageError = tenantsQ.error ?? itemsQ.error ?? membersQ.error ?? foldersQ.error;
  const invalidate = () => qc.invalidateQueries({
    queryKey: ["items", tenantId]
  });
  const createM = useMutation({
    mutationFn: (vars) => createFn({
      data: {
        tenantId,
        title: vars.title,
        folderId: vars.folderId
      }
    }),
    onSuccess: (r) => {
      invalidate();
      setSelectedId(r.id);
    }
  });
  const moveItemM = useMutation({
    mutationFn: (vars) => updateFn({
      data: {
        tenantId,
        id: vars.id,
        folderId: vars.folderId
      }
    }),
    onMutate: (vars) => {
      const prev = qc.getQueryData(["items", tenantId]);
      if (prev) {
        qc.setQueryData(["items", tenantId], prev.map((it) => it.id === vars.id ? {
          ...it,
          folderId: vars.folderId
        } : it));
      }
      return {
        prev
      };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items", tenantId], ctx.prev);
    },
    onSuccess: () => invalidate()
  });
  const invalidateFolders = () => qc.invalidateQueries({
    queryKey: ["folders", tenantId]
  });
  const createFolderM = useMutation({
    mutationFn: (vars) => createFolderFn({
      data: {
        tenantId,
        name: vars.name,
        parentId: vars.parentId
      }
    }),
    meta: {
      silent: true
    },
    onSuccess: () => {
      invalidateFolders();
      toast.success(t("workspace.folderCreated"));
    }
  });
  const renameFolderM = useMutation({
    mutationFn: (vars) => updateFolderFn({
      data: {
        tenantId,
        id: vars.id,
        name: vars.name
      }
    }),
    onSuccess: invalidateFolders
  });
  const moveFolderM = useMutation({
    mutationFn: (vars) => updateFolderFn({
      data: {
        tenantId,
        id: vars.id,
        parentId: vars.parentId
      }
    }),
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: ["folders", tenantId]
      });
      const prev = qc.getQueryData(["folders", tenantId]);
      if (prev) {
        qc.setQueryData(["folders", tenantId], prev.map((f) => f.id === vars.id ? {
          ...f,
          parentId: vars.parentId
        } : f));
      }
      return {
        prev
      };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["folders", tenantId], ctx.prev);
    },
    onSuccess: invalidateFolders
  });
  const deleteFolderM = useMutation({
    mutationFn: (id) => deleteFolderFn({
      data: {
        tenantId,
        id
      }
    }),
    onSuccess: () => {
      invalidateFolders();
      invalidate();
    }
  });
  const deleteM = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        tenantId,
        id
      }
    }),
    onSuccess: () => invalidate()
  });
  const reorderM = useMutation({
    mutationFn: (orderedIds) => reorderFn({
      data: {
        tenantId,
        orderedIds
      }
    }),
    onMutate: (orderedIds) => {
      const prev = qc.getQueryData(["items", tenantId]);
      const sorted = orderedIds.map((id) => prev?.find((i) => i.id === id)).filter(Boolean);
      qc.setQueryData(["items", tenantId], sorted);
      return {
        prev
      };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items", tenantId], ctx.prev);
    },
    onSuccess: () => invalidate()
  });
  const logoutM = useMutation({
    mutationFn: async () => {
      await navigate({
        to: "/login"
      });
      const supabase = await ensureSupabase();
      await supabase.auth.signOut();
    }
  });
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [copied, setCopied] = reactExports.useState(false);
  const [newItemDialogFolderId, setNewItemDialogFolderId] = reactExports.useState(null);
  const [newItemDialogTitle, setNewItemDialogTitle] = reactExports.useState("");
  const submitNewItemDialog = () => {
    if (!newItemDialogTitle.trim()) return;
    createM.mutate({
      title: newItemDialogTitle.trim(),
      folderId: newItemDialogFolderId
    });
    setNewItemDialogFolderId(null);
  };
  const copyJoinCode = async () => {
    try {
      await navigator.clipboard?.writeText(currentTenant?.joinCode ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  };
  if (pageError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4 text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold", children: t("common.error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: pageError instanceof Error ? pageError.message : String(pageError) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        tenantsQ.refetch();
        itemsQ.refetch();
        membersQ.refetch();
        foldersQ.refetch();
      }, className: "mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground", children: t("common.retry") })
    ] }) });
  }
  if (tenantsQ.isLoading || !currentTenant) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground", children: t("common.loading") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between border-b border-border px-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: tenantId, onChange: (e) => navigate({
          to: "/app/$tenantId",
          params: {
            tenantId: e.target.value
          }
        }), className: "input h-8 py-0 text-sm", children: tenants.map((tn) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: tn.id, children: tn.name }, tn.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding", className: "rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent", children: t("workspace.newWorkspace") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
        user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: user.displayName }),
          isSuperuser$1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/members/$tenantId", params: {
            tenantId
          }, className: "rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300", children: t("workspace.superuserBadge", "Superuser") }) : null
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CurrencySwitcher, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/help", className: "rounded-md px-2 py-1 text-xs hover:bg-accent", children: t("common.help", "Help") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/members/$tenantId", params: {
          tenantId
        }, className: "rounded-md px-2 py-1 text-xs hover:bg-accent", children: t("workspace.manageUsers") }),
        isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/audit/$tenantId", params: {
            tenantId
          }, className: "rounded-md px-2 py-1 text-xs hover:bg-accent", children: t("workspace.changeHistory") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: copyJoinCode, title: t("workspace.joinCodeTitle"), className: "rounded bg-accent px-2 py-1 hover:bg-accent/80", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1", children: t("workspace.joinCode") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: currentTenant.joinCode })
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => logoutM.mutate(), className: "rounded-md px-2 py-1 hover:bg-accent", children: t("common.logout") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex w-96 flex-col border-r border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: t("workspace.searchPlaceholder"), className: "input h-8 text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            createM.mutate({
              title: newTitle.trim(),
              folderId: null
            });
            setNewTitle("");
          }, className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: t("workspace.newItemPlaceholder"), className: "input h-8 flex-1 text-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground", children: t("common.add") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTreePane, { tenantId, t, search, items, filtered, folders, loading: itemsQ.isLoading || foldersQ.isLoading, selectedId, setSelectedId, draggingItemId, setDraggingItemId, draggingFolderId, setDraggingFolderId, dragOverItemId, setDragOverItemId, dragOverFolderId, setDragOverFolderId, isAdmin, onReorder: (ids) => reorderM.mutate(ids), onMoveItem: (id, folderId) => moveItemM.mutate({
          id,
          folderId
        }), onMoveFolder: (id, parentId) => moveFolderM.mutate({
          id,
          parentId
        }), onCreateFolder: (name, parentId) => createFolderM.mutate({
          name,
          parentId
        }), onRenameFolder: (id, name) => renameFolderM.mutate({
          id,
          name
        }), onDeleteFolder: (id) => deleteFolderM.mutate(id), onManageVisibility: (id) => setVisibilityFolderId(id), onCreateItemInFolder: (folderId) => {
          setNewItemDialogFolderId(folderId);
          setNewItemDialogTitle("");
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex min-h-0 flex-1 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SavingsChart, { tenantId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(ItemDetail, { tenantId, item: selected, members: membersQ.data ?? [], folders, onSave: async (patch) => {
          await updateFn({
            data: {
              tenantId,
              id: selected.id,
              ...patch
            }
          });
          invalidate();
        }, onEntriesChanged: () => qc.invalidateQueries({
          queryKey: ["entries", tenantId]
        }), onDelete: () => deleteM.mutate(selected.id) }, selected.id) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-sm text-muted-foreground", children: t("workspace.selectOrCreate") }) })
      ] })
    ] }),
    visibilityFolderId ? /* @__PURE__ */ jsxRuntimeExports.jsx(FolderVisibilityDialog, { tenantId, folderId: visibilityFolderId, folderName: folders.find((f) => f.id === visibilityFolderId)?.name ?? "", members: membersQ.data ?? [], onClose: () => setVisibilityFolderId(null), onSaved: () => {
      qc.invalidateQueries({
        queryKey: ["folders", tenantId]
      });
      qc.invalidateQueries({
        queryKey: ["items", tenantId]
      });
      setVisibilityFolderId(null);
    } }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: newItemDialogFolderId !== null, onOpenChange: (open) => {
      if (!open) setNewItemDialogFolderId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("common.add") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "sr-only", children: t("workspace.newItemPlaceholder") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "text", value: newItemDialogTitle, onChange: (e) => setNewItemDialogTitle(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") submitNewItemDialog();
      }, placeholder: t("workspace.newItemPlaceholder"), className: "input w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setNewItemDialogFolderId(null), className: "rounded-md px-3 py-1.5 text-sm hover:bg-accent", children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: !newItemDialogTitle.trim(), onClick: submitNewItemDialog, className: "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: t("common.create") })
      ] })
    ] }) })
  ] });
}
function TaskLists({
  tenantId,
  itemId
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listTasksForItem);
  const createFn = useServerFn(createTask);
  const updateFn = useServerFn(updateTask);
  const deleteFn = useServerFn(deleteTask);
  const reorderFn = useServerFn(reorderTasks);
  const tasksQ = useQuery({
    queryKey: ["tasks", tenantId, itemId],
    queryFn: () => listFn({
      data: {
        tenantId,
        itemId
      }
    })
  });
  const invalidate = () => qc.invalidateQueries({
    queryKey: ["tasks", tenantId, itemId]
  });
  const createM = useMutation({
    mutationFn: (v) => createFn({
      data: {
        tenantId,
        itemId,
        title: v.title,
        userId: v.userId
      }
    }),
    onSuccess: invalidate
  });
  const updateM = useMutation({
    mutationFn: (v) => updateFn({
      data: {
        tenantId,
        id: v.id,
        title: v.title,
        done: v.done
      }
    }),
    onSuccess: invalidate
  });
  const deleteM = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        tenantId,
        id
      }
    }),
    onSuccess: invalidate
  });
  const reorderM = useMutation({
    mutationFn: (orderedIds) => reorderFn({
      data: {
        tenantId,
        itemId,
        orderedIds
      }
    }),
    onMutate: (orderedIds) => {
      const prev = qc.getQueryData(["tasks", tenantId, itemId]);
      if (prev) {
        const reorderedSet = new Set(orderedIds);
        const others = prev.filter((t) => !reorderedSet.has(t.id));
        const reordered = orderedIds.map((id) => prev.find((t) => t.id === id)).filter(Boolean);
        qc.setQueryData(["tasks", tenantId, itemId], [...reordered, ...others]);
      }
      return {
        prev
      };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", tenantId, itemId], ctx.prev);
    },
    onSuccess: invalidate
  });
  const tasks = tasksQ.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaskGroup, { name: "Tehtävät", tasks, userId: void 0, onAdd: (title) => createM.mutate({
    title
  }), onToggle: (id, done) => updateM.mutate({
    id,
    done
  }), onEditTitle: (id, title) => updateM.mutate({
    id,
    title
  }), onDelete: (id) => deleteM.mutate(id), onReorder: (orderedIds) => reorderM.mutate(orderedIds) }) });
}
function TaskGroup({
  name,
  tasks,
  userId,
  onAdd,
  onToggle,
  onEditTitle,
  onDelete,
  onReorder
}) {
  const {
    t
  } = useTranslation();
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editText, setEditText] = reactExports.useState("");
  const [draggingTaskId, setDraggingTaskId] = reactExports.useState(null);
  const [dragOverTaskId, setDragOverTaskId] = reactExports.useState(null);
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.title);
  };
  const commitEdit = () => {
    if (editingId && editText.trim()) {
      onEditTitle(editingId, editText.trim());
    }
    setEditingId(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 text-sm font-semibold text-foreground", children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: tasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { draggable: true, onDragStart: (e) => {
      setDraggingTaskId(task.id);
      e.dataTransfer.effectAllowed = "move";
    }, onDragEnd: () => {
      setDraggingTaskId(null);
      setDragOverTaskId(null);
    }, onDragOver: (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverTaskId !== task.id) setDragOverTaskId(task.id);
    }, onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setDragOverTaskId(null);
      }
    }, onDrop: (e) => {
      e.preventDefault();
      if (!draggingTaskId || draggingTaskId === task.id) {
        setDraggingTaskId(null);
        setDragOverTaskId(null);
        return;
      }
      const list = [...tasks];
      const fromIdx = list.findIndex((x) => x.id === draggingTaskId);
      const toIdx = list.findIndex((x) => x.id === task.id);
      const [removed] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, removed);
      onReorder(list.map((x) => x.id));
      setDraggingTaskId(null);
      setDragOverTaskId(null);
    }, className: `flex items-center gap-2 transition-opacity ${draggingTaskId === task.id ? "opacity-40" : ""} ${dragOverTaskId === task.id && draggingTaskId !== task.id ? "border-t-2 border-t-primary" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing", title: t("workspace.dragToReorder"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { size: 14 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: task.done, onChange: () => onToggle(task.id, !task.done), className: "shrink-0" }),
      editingId === task.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, value: editText, onChange: (e) => setEditText(e.target.value), onBlur: commitEdit, onKeyDown: (e) => {
        if (e.key === "Enter") commitEdit();
        if (e.key === "Escape") setEditingId(null);
      }, className: "input h-7 flex-1 text-sm" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: () => startEdit(task), className: `flex-1 cursor-pointer text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`, title: t("workspace.clickToEdit"), children: task.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => startEdit(task), className: "rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground", title: t("workspace.edit"), children: "✎" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onDelete(task.id), className: "rounded px-1.5 py-0.5 text-xs text-destructive hover:bg-destructive/10", title: t("common.delete"), children: "×" })
    ] }, task.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      if (!newTitle.trim()) return;
      onAdd(newTitle.trim());
      setNewTitle("");
    }, className: "mt-2 flex gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: t("workspace.newTask"), className: "input h-7 flex-1 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground", children: t("common.add") })
    ] })
  ] });
}
function ItemDetail({
  tenantId,
  item,
  members,
  folders,
  onSave,
  onEntriesChanged,
  onDelete
}) {
  const {
    t
  } = useTranslation();
  const [title, setTitle] = reactExports.useState(item.title);
  const status = item.status;
  const initialAssigneeIds = item.assignees.map((a) => a.id);
  const [assigneeIds, setAssigneeIds] = reactExports.useState(initialAssigneeIds);
  const [pickerOpen, setPickerOpen] = reactExports.useState(false);
  const [deleteOpen, setDeleteOpen] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [savedAt, setSavedAt] = reactExports.useState(null);
  const assigneesChanged = assigneeIds.length !== initialAssigneeIds.length || assigneeIds.some((id) => !initialAssigneeIds.includes(id));
  const dirty = title !== item.title || status !== item.status || assigneesChanged;
  const save = async () => {
    if (!dirty) return;
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setTitle(item.title);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: trimmed,
        status,
        assigneeIds: assigneesChanged ? assigneeIds : void 0
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };
  const titleTimerRef = reactExports.useRef(null);
  reactExports.useEffect(() => () => {
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
  }, []);
  const scheduleTitleSave = (next) => {
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      const trimmed = next.trim();
      if (trimmed.length === 0) return;
      if (trimmed === item.title) return;
      void onSave({
        title: trimmed
      });
      setSavedAt(Date.now());
    }, 600);
  };
  const toggleAssignee = (id) => {
    setAssigneeIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const selectedNames = members.filter((m) => assigneeIds.includes(m.id)).map((m) => m.displayName);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: title, onChange: (e) => {
      const v = e.target.value;
      setTitle(v);
      scheduleTitleSave(v);
    }, onBlur: () => {
      if (titleTimerRef.current) {
        clearTimeout(titleTimerRef.current);
        titleTimerRef.current = null;
      }
      void save();
    }, className: "w-full bg-transparent text-2xl font-semibold tracking-tight outline-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MonthlyEntries, { tenantId, itemId: item.id, onChanged: onEntriesChanged }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pt-1 text-muted-foreground", children: t("workspace.assignees") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPickerOpen((v) => !v), className: "input h-8 min-w-[12rem] px-2 py-0 text-left", children: selectedNames.length > 0 ? selectedNames.join(", ") : t("workspace.unassigned") }),
          pickerOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-20 mt-1 max-h-60 w-64 overflow-auto rounded-md border border-border bg-background p-2 shadow-lg", onMouseLeave: () => {
            setPickerOpen(false);
            void save();
          }, children: members.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-1 text-xs text-muted-foreground", children: t("members.empty") }) : members.map((m) => {
            const checked = assigneeIds.includes(m.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: () => toggleAssignee(m.id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.displayName })
            ] }, m.id);
          }) }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("workspace.folder") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: item.folderId ?? "", onChange: (e) => {
          const v = e.target.value;
          void onSave({
            folderId: v === "" ? null : v
          });
        }, className: "input h-8 min-w-[12rem] py-0 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("workspace.uncategorized") }),
          folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: folderPathLabel(f, folders) }, f.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TaskLists, { tenantId, itemId: item.id }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: saving ? t("common.saving") : dirty ? t("common.unsaved") : savedAt ? t("common.saved") : t("workspace.updated", {
        when: formatDateTime(item.updatedAt)
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteOpen(true), className: "rounded-md px-2 py-1 text-destructive hover:bg-destructive/10", children: t("common.delete") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deleteOpen, onOpenChange: setDeleteOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: t("workspace.confirmDelete") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: item.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: onDelete, children: t("common.delete") })
      ] })
    ] }) })
  ] });
}
function MonthlyEntries({
  tenantId,
  itemId,
  onChanged
}) {
  const {
    t,
    i18n
  } = useTranslation();
  const qc = useQueryClient();
  const listFn = useServerFn(listEntriesForItem);
  const upsertFn = useServerFn(upsertEntry);
  const entriesQ = useQuery({
    queryKey: ["entries-item", tenantId, itemId],
    queryFn: () => listFn({
      data: {
        tenantId,
        itemId
      }
    })
  });
  const invalidate = () => {
    qc.invalidateQueries({
      queryKey: ["entries-item", tenantId, itemId]
    });
    qc.invalidateQueries({
      queryKey: ["entries", tenantId]
    });
    onChanged();
  };
  const upsertM = useMutation({
    mutationFn: (v) => upsertFn({
      data: {
        tenantId,
        itemId,
        ...v
      }
    }),
    onSuccess: invalidate
  });
  const entries = entriesQ.data ?? [];
  const byMonth = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const e of entries) m.set(e.month, {
      amount: e.amount,
      actual: e.actual
    });
    return m;
  }, [entries]);
  const YEAR_STORAGE_KEY = "keywi.monthlyEntries.year";
  const [year, setYearState] = reactExports.useState(() => {
    if (typeof window === "undefined") return (/* @__PURE__ */ new Date()).getFullYear();
    const stored = window.localStorage.getItem(YEAR_STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : (/* @__PURE__ */ new Date()).getFullYear();
  });
  const setYear = (updater) => {
    setYearState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(YEAR_STORAGE_KEY, String(next));
      }
      return next;
    });
  };
  const months = reactExports.useMemo(() => {
    return Array.from({
      length: 12
    }, (_, i) => ({
      iso: `${year}-${String(i + 1).padStart(2, "0")}-01`,
      idx: i
    }));
  }, [year]);
  const monthLabel = reactExports.useMemo(() => new Intl.DateTimeFormat(i18n.language, {
    month: "long"
  }), [i18n.language]);
  const {
    convert,
    toEur,
    currency
  } = useCurrency();
  const currencySymbol = reactExports.useMemo(() => {
    try {
      const parts = new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency
      }).formatToParts(0);
      return parts.find((p) => p.type === "currency")?.value ?? currency;
    } catch {
      return currency;
    }
  }, [i18n.language, currency]);
  const round2 = (n) => Math.round(n * 100) / 100;
  const yearTotalEur = months.reduce((s, m) => s + (byMonth.get(m.iso)?.amount ?? 0), 0);
  const actualTotalEur = months.reduce((s, m) => s + (byMonth.get(m.iso)?.actual ?? 0), 0);
  const yearTotal = round2(convert(yearTotalEur));
  const actualTotal = round2(convert(actualTotalEur));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-md border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: t("workspace.monthlyEntries") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setYear((y) => y - 1), className: "rounded px-2 py-0.5 hover:bg-accent", "aria-label": "Previous year", children: "‹" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: year }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setYear((y) => y + 1), className: "rounded px-2 py-0.5 hover:bg-accent", "aria-label": "Next year", children: "›" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            t("workspace.planned"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TotalEditor, { total: yearTotal, onCommit: (newTotal) => {
            const perEur = round2(toEur(newTotal) / 12);
            for (const m of months) {
              upsertM.mutate({
                month: m.iso,
                amount: perEur
              });
            }
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: currencySymbol })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            t("workspace.actual"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TotalEditor, { total: actualTotal, onCommit: (newTotal) => {
            const perEur = round2(toEur(newTotal) / 12);
            for (const m of months) {
              upsertM.mutate({
                month: m.iso,
                actual: perEur
              });
            }
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: currencySymbol })
        ] })
      ] })
    ] }),
    entriesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("common.loading") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-12 gap-1", children: months.map(({
      iso,
      idx
    }) => {
      const cell = byMonth.get(iso);
      const amountDisp = cell?.amount == null ? null : round2(convert(cell.amount));
      const actualDisp = cell?.actual == null ? null : round2(convert(cell.actual));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MonthCell, { label: monthLabel.format(new Date(2e3, idx, 1)), amount: amountDisp, actual: actualDisp, planTabIndex: idx + 1, actualTabIndex: idx + 13, onCommitAmount: (amount) => upsertM.mutate({
        month: iso,
        amount: round2(toEur(amount))
      }), onCommitActual: (actual) => upsertM.mutate({
        month: iso,
        actual: round2(toEur(actual))
      }) }, iso);
    }) })
  ] });
}
function MonthCell({
  label,
  amount,
  actual,
  onCommitAmount,
  onCommitActual,
  planTabIndex,
  actualTabIndex
}) {
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col items-stretch gap-1 rounded-md border border-border bg-background px-1.5 py-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-center text-[10px] uppercase tracking-wide text-muted-foreground", children: label.slice(0, 3) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { value: amount, onCommit: onCommitAmount, placeholder: "plan", tabIndex: planTabIndex }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { value: actual, onCommit: onCommitActual, placeholder: t("workspace.actual").toLowerCase(), className: "text-primary", tabIndex: actualTabIndex })
  ] });
}
function NumberInput({
  value,
  onCommit,
  placeholder,
  className = "",
  tabIndex
}) {
  const [text, setText] = reactExports.useState(value === null ? "0" : String(value));
  const [focused, setFocused] = reactExports.useState(false);
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!focused) setText(value === null ? "0" : String(value));
  }, [value, focused]);
  reactExports.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const commitIfChanged = (raw) => {
    const trimmed = raw.trim();
    if (trimmed === "" && value === null) return;
    const parsed = Number(trimmed.replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    if (parsed === (value ?? 0)) return;
    onCommit(parsed);
  };
  const scheduleSave = (raw) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      commitIfChanged(raw);
    }, 600);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", inputMode: "decimal", step: "0.01", value: text, tabIndex, onFocus: (e) => {
    setFocused(true);
    e.currentTarget.select();
  }, onChange: (e) => {
    setText(e.target.value);
    scheduleSave(e.target.value);
  }, onBlur: () => {
    setFocused(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    commitIfChanged(text);
  }, placeholder: placeholder ?? "0", className: `h-6 w-full min-w-0 bg-transparent text-center font-mono text-xs outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}` });
}
function TotalEditor({
  total,
  onCommit
}) {
  const [text, setText] = reactExports.useState(String(total));
  const [focused, setFocused] = reactExports.useState(false);
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!focused) setText(String(total));
  }, [total, focused]);
  reactExports.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const commitIfChanged = (raw) => {
    const parsed = Number(raw.trim().replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    if (parsed === total) return;
    onCommit(parsed);
  };
  const scheduleSave = (raw) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      commitIfChanged(raw);
    }, 600);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", inputMode: "decimal", step: "0.01", value: text, onFocus: () => setFocused(true), onChange: (e) => {
    setText(e.target.value);
    scheduleSave(e.target.value);
  }, onBlur: () => {
    setFocused(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    commitIfChanged(text);
  }, className: "h-6 w-24 rounded border border-border bg-background px-1 text-right font-mono text-xs font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" });
}
function folderPathLabel(f, all) {
  const parts = [f.name];
  let cur = f;
  const byId = new Map(all.map((x) => [x.id, x]));
  const seen = /* @__PURE__ */ new Set([f.id]);
  while (cur?.parentId) {
    const p = byId.get(cur.parentId);
    if (!p || seen.has(p.id)) break;
    seen.add(p.id);
    parts.unshift(p.name);
    cur = p;
  }
  return parts.join(" / ");
}
function FolderTreePane({
  t,
  search,
  items,
  filtered,
  folders,
  loading,
  selectedId,
  setSelectedId,
  draggingItemId,
  setDraggingItemId,
  draggingFolderId,
  setDraggingFolderId,
  dragOverItemId,
  setDragOverItemId,
  dragOverFolderId,
  setDragOverFolderId,
  onReorder,
  onMoveItem,
  onMoveFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onManageVisibility,
  onCreateItemInFolder,
  isAdmin
}) {
  const [openMap, setOpenMap] = reactExports.useState({});
  const isOpen = (id) => openMap[id] === true;
  const toggle = (id) => setOpenMap((p) => ({
    ...p,
    [id]: !isOpen(id)
  }));
  const [folderModal, setFolderModal] = reactExports.useState(null);
  const [folderNameInput, setFolderNameInput] = reactExports.useState("");
  const openFolderModal = (modal) => {
    setFolderNameInput(modal.type === "rename" ? modal.currentName : "");
    setFolderModal(modal);
  };
  const closeFolderModal = () => setFolderModal(null);
  const handleFolderNameSubmit = () => {
    if (!folderModal || !folderNameInput.trim()) return;
    if (folderModal.type === "create") {
      onCreateFolder(folderNameInput.trim(), folderModal.parentId);
    } else if (folderModal.type === "rename") {
      if (folderNameInput.trim() !== folderModal.currentName) {
        onRenameFolder(folderModal.id, folderNameInput.trim());
      }
    }
    closeFolderModal();
  };
  const childrenByParent = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const f of folders) {
      const arr = m.get(f.parentId) ?? [];
      arr.push(f);
      m.set(f.parentId, arr);
    }
    return m;
  }, [folders]);
  const itemsByFolder = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const it of filtered) {
      const arr = m.get(it.folderId) ?? [];
      arr.push(it);
      m.set(it.folderId, arr);
    }
    return m;
  }, [filtered]);
  const renderItem = (it, depth) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { draggable: !search, onDragStart: (e) => {
    setDraggingItemId(it.id);
    e.dataTransfer.effectAllowed = "move";
  }, onDragEnd: () => {
    setDraggingItemId(null);
    setDragOverItemId(null);
    setDragOverFolderId(null);
  }, onDragOver: (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverItemId !== it.id) setDragOverItemId(it.id);
  }, onDragLeave: (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverItemId(null);
  }, onDrop: (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingItemId || draggingItemId === it.id) {
      setDraggingItemId(null);
      setDragOverItemId(null);
      return;
    }
    const dragging = items.find((x) => x.id === draggingItemId);
    if (dragging && dragging.folderId !== it.folderId) {
      onMoveItem(draggingItemId, it.folderId);
    } else {
      const list = [...items];
      const fromIdx = list.findIndex((i) => i.id === draggingItemId);
      const toIdx = list.findIndex((i) => i.id === it.id);
      if (fromIdx >= 0 && toIdx >= 0) {
        const [removed] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, removed);
        onReorder(list.map((i) => i.id));
      }
    }
    setDraggingItemId(null);
    setDragOverItemId(null);
  }, className: `flex items-stretch border-b border-border transition-opacity ${draggingItemId === it.id ? "opacity-40" : ""} ${dragOverItemId === it.id && draggingItemId !== it.id ? "border-t-2 border-t-primary" : ""}`, style: {
    paddingLeft: `${depth * 12}px`
  }, children: [
    !search && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex cursor-grab items-center px-1.5 text-muted-foreground hover:text-foreground active:cursor-grabbing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { size: 14 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedId(it.id), className: `flex min-w-0 flex-1 flex-col items-start gap-1 py-2 pr-3 text-left text-sm hover:bg-accent ${selectedId === it.id ? "bg-accent" : ""} ${!search ? "" : "pl-3"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 font-medium", children: it.title }),
      it.assigneeName ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: it.assigneeName }) : null
    ] })
  ] }, it.id);
  const isDescendantOf = (candidateId, ancestorId) => {
    if (candidateId === ancestorId) return true;
    const kids = childrenByParent.get(ancestorId) ?? [];
    for (const k of kids) {
      if (isDescendantOf(candidateId, k.id)) return true;
    }
    return false;
  };
  const renderFolder = (folder, depth) => {
    const open = isOpen(folder.id);
    const children = childrenByParent.get(folder.id) ?? [];
    const folderItems = itemsByFolder.get(folder.id) ?? [];
    const dragHover = dragOverFolderId === folder.id;
    const folderDropAllowed = !draggingFolderId || !isDescendantOf(folder.id, draggingFolderId);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { draggable: true, onDragStart: (e) => {
        setDraggingFolderId(folder.id);
        e.dataTransfer.effectAllowed = "move";
      }, onDragEnd: () => {
        setDraggingFolderId(null);
        setDragOverFolderId(null);
      }, onDragOver: (e) => {
        if (!draggingItemId && !draggingFolderId) return;
        if (draggingFolderId && !folderDropAllowed) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverFolderId !== folder.id) setDragOverFolderId(folder.id);
      }, onDragLeave: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragOverFolderId(null);
      }, onDrop: (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggingItemId) onMoveItem(draggingItemId, folder.id);
        else if (draggingFolderId && folderDropAllowed && draggingFolderId !== folder.id) {
          onMoveFolder(draggingFolderId, folder.id);
        }
        setDraggingItemId(null);
        setDraggingFolderId(null);
        setDragOverFolderId(null);
      }, className: `group flex items-center gap-1 border-b border-border py-1 pr-1 text-sm ${dragHover ? "bg-primary/10" : "bg-muted/30"} ${draggingFolderId === folder.id ? "opacity-40" : ""}`, style: {
        paddingLeft: `${depth * 12 + 4}px`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggle(folder.id), className: "p-0.5 text-muted-foreground hover:text-foreground", "aria-label": "toggle", children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate font-medium", children: folder.name }),
        folder.restricted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 11, className: "text-muted-foreground", "aria-label": "restricted" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => openFolderModal({
          type: "create",
          parentId: folder.id
        }), className: "p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground", title: t("workspace.addSubfolder"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { size: 12 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onCreateItemInFolder(folder.id), className: "px-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground", title: t("workspace.newItemPlaceholder"), children: "+" }),
        isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onManageVisibility(folder.id), className: "p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground", title: t("workspace.folderVisibility"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12 }) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => openFolderModal({
          type: "rename",
          id: folder.id,
          currentName: folder.name
        }), className: "p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground", title: t("workspace.renameFolder"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => openFolderModal({
          type: "delete",
          id: folder.id,
          name: folder.name
        }), className: "p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive", title: t("common.delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
      ] }),
      open && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
        children.map((c) => renderFolder(c, depth + 1)),
        folderItems.map((it) => renderItem(it, depth + 1))
      ] })
    ] }, folder.id);
  };
  const rootFolders = childrenByParent.get(null) ?? [];
  const rootItems = itemsByFolder.get(null) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: t("workspace.folders") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => openFolderModal({
          type: "create",
          parentId: null
        }), className: "flex items-center gap-1 rounded px-2 py-0.5 text-xs hover:bg-accent", title: t("workspace.newFolder"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { size: 12 }),
          t("workspace.newFolder")
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-muted-foreground", children: t("common.loading") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
        rootFolders.map((f) => renderFolder(f, 0)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onDragOver: (e) => {
            if (!draggingItemId && !draggingFolderId) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (dragOverFolderId !== "ROOT") setDragOverFolderId("ROOT");
          }, onDragLeave: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setDragOverFolderId(null);
          }, onDrop: (e) => {
            e.preventDefault();
            if (draggingItemId) onMoveItem(draggingItemId, null);
            else if (draggingFolderId) onMoveFolder(draggingFolderId, null);
            setDraggingItemId(null);
            setDraggingFolderId(null);
            setDragOverFolderId(null);
          }, className: `border-b border-border py-1 pl-2 text-xs uppercase tracking-wide text-muted-foreground ${dragOverFolderId === "ROOT" ? "bg-primary/10" : ""}`, children: t("workspace.uncategorized") }),
          rootItems.length === 0 && folders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-muted-foreground", children: t("workspace.noItems") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: rootItems.map((it) => renderItem(it, 0)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: folderModal?.type === "create" || folderModal?.type === "rename", onOpenChange: closeFolderModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: folderModal?.type === "rename" ? t("workspace.renameFolder") : folderModal?.type === "create" && folderModal.parentId ? t("workspace.addSubfolder") : t("workspace.newFolder") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "sr-only", children: t("workspace.newFolderPrompt") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "text", value: folderNameInput, onChange: (e) => setFolderNameInput(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") handleFolderNameSubmit();
      }, placeholder: t("workspace.newFolderPrompt"), className: "input w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: closeFolderModal, className: "rounded-md px-3 py-1.5 text-sm hover:bg-accent", children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleFolderNameSubmit, disabled: !folderNameInput.trim(), className: "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: folderModal?.type === "rename" ? t("workspace.save") : t("common.create") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: folderModal?.type === "delete", onOpenChange: closeFolderModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          t("common.delete"),
          " “",
          folderModal?.type === "delete" ? folderModal.name : "",
          "”?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: t("workspace.confirmDeleteFolder") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { onClick: closeFolderModal, children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: () => {
          if (folderModal?.type === "delete") {
            onDeleteFolder(folderModal.id);
          }
          closeFolderModal();
        }, children: t("common.delete") })
      ] })
    ] }) })
  ] });
}
function FolderVisibilityDialog({
  tenantId,
  folderId,
  folderName,
  members,
  onClose,
  onSaved
}) {
  const {
    t
  } = useTranslation();
  const getFn = useServerFn(getFolderVisibility);
  const setFn = useServerFn(setFolderVisibility);
  const visQ = useQuery({
    queryKey: ["folder-visibility", tenantId, folderId],
    queryFn: () => getFn({
      data: {
        tenantId,
        folderId
      }
    })
  });
  const [restricted, setRestricted] = reactExports.useState(false);
  const [allowed, setAllowed] = reactExports.useState(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    if (visQ.data) {
      setRestricted(visQ.data.restricted);
      setAllowed(new Set(visQ.data.userIds));
    }
  }, [visQ.data]);
  const saveM = useMutation({
    mutationFn: () => setFn({
      data: {
        tenantId,
        folderId,
        restricted,
        userIds: Array.from(allowed)
      }
    }),
    onSuccess: onSaved
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-lg font-semibold", children: t("workspace.folderVisibilityTitle") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-muted-foreground", children: folderName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-xs text-muted-foreground", children: t("workspace.folderVisibilityBody") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-3 flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: restricted, onChange: (e) => setRestricted(e.target.checked) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("workspace.restrictAccess") })
    ] }),
    restricted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t("workspace.allowedMembers") }),
      visQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("common.loading") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "max-h-64 space-y-1 overflow-y-auto rounded border border-border p-2", children: members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: m.role === "admin", checked: m.role === "admin" || allowed.has(m.id), onChange: (e) => {
          setAllowed((prev) => {
            const next = new Set(prev);
            if (e.target.checked) next.add(m.id);
            else next.delete(m.id);
            return next;
          });
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: m.displayName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.role === "admin" ? t("members.admin") : "" })
      ] }) }, m.id)) })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "rounded-md px-3 py-1.5 text-sm hover:bg-accent", children: t("common.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: saveM.isPending || visQ.isLoading, onClick: () => saveM.mutate(), className: "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: saveM.isPending ? t("common.saving") : t("workspace.save") })
    ] })
  ] }) });
}
export {
  WorkspacePage as component
};
