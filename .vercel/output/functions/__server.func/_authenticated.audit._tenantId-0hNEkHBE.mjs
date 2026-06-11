import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { b as Route$1, u as useServerFn } from "./_ssr/router-CLHUrko-.mjs";
import { a as useQuery } from "./_libs/tanstack__react-query.mjs";
import { l as listMyTenants } from "./_ssr/tenants.functions-Cd6k6oiM.mjs";
import { c as createSsrRpc } from "./_ssr/createSsrRpc-B-oggCnm.mjs";
import { c as createServerFn } from "./_ssr/server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./_ssr/auth-middleware-CAaNNUN6.mjs";
import { l as listItems, a as listAllEntries, f as formatDateTime } from "./_ssr/format-date-yUuoX8UB.mjs";
import "./_libs/sonner.mjs";
import "./_libs/i18next.mjs";
import "./_libs/seroval.mjs";
import { u as useTranslation } from "./_libs/react-i18next.mjs";
import { o as objectType, n as numberType, s as stringType } from "./_libs/zod.mjs";
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
import "./_ssr/client-F9s_q744.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_libs/use-sync-external-store.mjs";
const listAuditLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  limit: numberType().int().min(1).max(1e3).optional()
}).parse(d)).handler(createSsrRpc("a152ca7691988bc23845fc63d40f80587032650679c867eda96c74439304e767"));
const TABLE_LABELS = {
  items: "Item",
  item_tasks: "Task",
  item_entries: "Entry",
  item_assignees: "Assignee",
  folders: "Folder",
  folder_visibility: "Folder access",
  tenant_members: "Member"
};
function fmt(value) {
  if (value === null || value === void 0) return "∅";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
function pickStr(row, changes, keys) {
  for (const k of keys) {
    const v = row?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  for (const k of keys) {
    const c = changes?.[k];
    if (c) {
      if (typeof c.new === "string" && c.new.trim()) return c.new;
      if (typeof c.old === "string" && c.old.trim()) return c.old;
    }
  }
  return null;
}
function shortId(id) {
  if (!id) return "";
  return id.length > 8 ? id.slice(0, 8) : id;
}
function formatMonth(v) {
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
}
function entryMonth(entry, entriesById) {
  const row = entry.rowData;
  const fromRow = formatMonth(row?.month);
  if (fromRow) return fromRow;
  const ch = entry.changes?.month;
  if (ch) {
    const m = formatMonth(ch.new) ?? formatMonth(ch.old);
    if (m) return m;
  }
  if (entry.recordId) {
    const meta = entriesById.get(entry.recordId);
    if (meta) return meta.month.slice(0, 7);
  }
  return null;
}
function resolveEntryItemId(entry, entriesById) {
  const row = entry.rowData;
  const ch = entry.changes;
  const fromRow = row?.item_id ?? ch?.item_id?.new ?? ch?.item_id?.old ?? null;
  if (fromRow) return fromRow;
  if (entry.recordId) {
    const meta = entriesById.get(entry.recordId);
    if (meta) return meta.itemId;
  }
  return null;
}
function entityName(entry, itemNames, entriesById) {
  const row = entry.rowData;
  const ch = entry.changes;
  switch (entry.tableName) {
    case "folders":
      return pickStr(row, ch, ["name"]);
    case "items":
      return pickStr(row, ch, ["title", "name"]);
    case "item_tasks": {
      const title = pickStr(row, ch, ["title", "name"]);
      const itemId = row?.item_id ?? ch?.item_id?.new ?? ch?.item_id?.old ?? null;
      const parent = itemId ? itemNames.get(itemId) : null;
      if (title && parent) return `${title} (${parent})`;
      return title ?? (parent ? `task in ${parent}` : null);
    }
    case "item_entries": {
      const itemId = resolveEntryItemId(entry, entriesById);
      const parent = itemId ? itemNames.get(itemId) : null;
      const month = entryMonth(entry, entriesById);
      if (parent && month) return `${parent} · ${month}`;
      if (parent) return parent;
      if (month) return month;
      return null;
    }
    case "item_assignees": {
      const uid = row?.user_id ?? null;
      const itemId = row?.item_id ?? null;
      const parent = itemId ? itemNames.get(itemId) : null;
      if (parent && uid) return `${parent} · user ${shortId(uid)}`;
      return parent ?? (uid ? `user ${shortId(uid)}` : null);
    }
    case "folder_visibility": {
      const fid = row?.folder_id ?? null;
      return fid ? `folder ${shortId(fid)}` : null;
    }
    case "tenant_members": {
      const role = row?.role ?? null;
      const uid = row?.user_id ?? null;
      if (role && uid) return `${role} · ${shortId(uid)}`;
      return role ?? (uid ? `user ${shortId(uid)}` : null);
    }
    default:
      return null;
  }
}
function parentItemRef(entry, itemNames, entriesById) {
  if (entry.tableName !== "item_tasks" && entry.tableName !== "item_entries") return null;
  const itemId = entry.tableName === "item_entries" ? resolveEntryItemId(entry, entriesById) : (() => {
    const row = entry.rowData;
    return row?.item_id ?? entry.changes?.item_id?.new ?? entry.changes?.item_id?.old ?? null;
  })();
  if (!itemId) return null;
  if (itemNames.get(itemId)) return null;
  return shortId(itemId);
}
function AuditRow({
  entry,
  itemNames,
  entriesById
}) {
  const date = new Date(entry.createdAt);
  const actor = entry.actorName || entry.actorEmail || "Unknown";
  const label = TABLE_LABELS[entry.tableName] ?? entry.tableName;
  const name = entityName(entry, itemNames, entriesById);
  const parentRef = parentItemRef(entry, itemNames, entriesById);
  const changeKeys = entry.changes ? Object.keys(entry.changes) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "border-b border-border px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: actor }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: entry.action === "INSERT" ? "created" : entry.action === "DELETE" ? "deleted" : "updated" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label }),
        name ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            "“",
            name,
            "”"
          ] })
        ] }) : entry.recordId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          " · ",
          shortId(entry.recordId)
        ] }) : null,
        parentRef ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          " on item ",
          parentRef
        ] }) : null,
        entry.action === "UPDATE" && changeKeys.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          " ",
          "· ",
          changeKeys.length,
          " field",
          changeKeys.length === 1 ? "" : "s"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", title: date.toISOString(), children: formatDateTime(date) })
    ] }),
    entry.changes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "mt-2 w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left font-normal", children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left font-normal", children: "From" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left font-normal", children: "To" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: changeKeys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 font-mono", children: k }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 font-mono text-destructive/80 break-all", children: fmt(entry.changes[k].old) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 font-mono text-emerald-600 break-all", children: fmt(entry.changes[k].new) })
      ] }, k)) })
    ] }) : null,
    entry.rowData && !entry.changes ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 max-h-60 overflow-auto rounded bg-accent/40 p-2 text-xs", children: JSON.stringify(entry.rowData, null, 2) }) : null
  ] });
}
function AuditPage() {
  const {
    t
  } = useTranslation();
  const {
    tenantId
  } = Route$1.useParams();
  const navigate = useNavigate();
  const tenantsFn = useServerFn(listMyTenants);
  const auditFn = useServerFn(listAuditLog);
  const itemsFn = useServerFn(listItems);
  const entriesFn = useServerFn(listAllEntries);
  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => tenantsFn()
  });
  const currentTenant = tenantsQ.data?.find((t2) => t2.id === tenantId) ?? null;
  reactExports.useEffect(() => {
    if (!tenantsQ.data) return;
    if (tenantsQ.data.length === 0) {
      navigate({
        to: "/onboarding",
        replace: true
      });
      return;
    }
    if (!currentTenant) {
      navigate({
        to: "/app/$tenantId",
        params: {
          tenantId: tenantsQ.data[0].id
        },
        replace: true
      });
    }
  }, [currentTenant, navigate, tenantsQ.data]);
  const isMember = !!currentTenant;
  const auditQ = useQuery({
    queryKey: ["audit", tenantId],
    queryFn: () => auditFn({
      data: {
        tenantId,
        limit: 500
      }
    }),
    enabled: isMember
  });
  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => itemsFn({
      data: {
        tenantId
      }
    }),
    enabled: isMember
  });
  const itemNames = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const it of itemsQ.data ?? []) m.set(it.id, it.title);
    return m;
  }, [itemsQ.data]);
  const entriesAllQ = useQuery({
    queryKey: ["entries-all", tenantId],
    queryFn: () => entriesFn({
      data: {
        tenantId
      }
    }),
    enabled: isMember
  });
  const entriesById = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const e of entriesAllQ.data ?? []) m.set(e.id, {
      itemId: e.itemId,
      month: e.month
    });
    return m;
  }, [entriesAllQ.data]);
  const [actorFilter, setActorFilter] = reactExports.useState("");
  const [tableFilter, setTableFilter] = reactExports.useState("");
  const entries = auditQ.data ?? [];
  const actors = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const e of entries) {
      if (e.actorId) m.set(e.actorId, e.actorName || e.actorEmail || "Unknown");
    }
    return Array.from(m.entries());
  }, [entries]);
  const filtered = entries.filter((e) => {
    if (actorFilter && e.actorId !== actorFilter) return false;
    if (tableFilter && e.tableName !== tableFilter) return false;
    return true;
  });
  if (tenantsQ.isLoading || !tenantsQ.data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Loading…" });
  }
  if (!currentTenant) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-sm text-destructive", children: [
      "Tenant not found (",
      tenantId,
      ")."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/$tenantId", params: {
        tenantId
      }, className: "rounded-md px-2 py-1 text-sm hover:bg-accent", children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-semibold", children: [
        t("workspace.changeHistory"),
        " · ",
        currentTenant.name
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-4xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: actorFilter, onChange: (e) => setActorFilter(e.target.value), className: "input h-8 py-0 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All users" }),
          actors.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: tableFilter, onChange: (e) => setTableFilter(e.target.value), className: "input h-8 py-0 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All types" }),
          Object.entries(TABLE_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => auditQ.refetch(), className: "ml-auto rounded-md px-2 py-1 text-xs hover:bg-accent", children: "Refresh" })
      ] }),
      auditQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : auditQ.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: auditQ.error instanceof Error ? auditQ.error.message : String(auditQ.error) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No activity yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "rounded-md border border-border", children: filtered.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(AuditRow, { entry: e, itemNames, entriesById }, e.id)) })
    ] })
  ] });
}
export {
  AuditPage as component
};
