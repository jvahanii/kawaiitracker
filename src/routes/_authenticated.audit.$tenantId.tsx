import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { listMyTenants } from "@/lib/api/tenants.functions";
import { listAuditLog, type AuditEntry } from "@/lib/api/audit.functions";

export const Route = createFileRoute("/_authenticated/audit/$tenantId")({
  head: () => ({ meta: [{ title: "Audit log — Tracker" }] }),
  component: AuditPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">Not found.</div>,
});

const TABLE_LABELS: Record<string, string> = {
  items: "Item",
  item_tasks: "Task",
  item_entries: "Entry",
  item_assignees: "Assignee",
  folders: "Folder",
  folder_visibility: "Folder access",
  tenant_members: "Member",
};

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "∅";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [open, setOpen] = useState(false);
  const date = new Date(entry.createdAt);
  const actor = entry.actorName || entry.actorEmail || "Unknown";
  const label = TABLE_LABELS[entry.tableName] ?? entry.tableName;
  const changeKeys = entry.changes ? Object.keys(entry.changes) : [];

  return (
    <li className="border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium">{actor}</span>{" "}
          <span className="text-muted-foreground">
            {entry.action === "INSERT"
              ? "created"
              : entry.action === "DELETE"
                ? "deleted"
                : "updated"}
          </span>{" "}
          <span className="font-medium">{label}</span>
          {entry.action === "UPDATE" && changeKeys.length > 0 ? (
            <span className="text-muted-foreground">
              {" "}
              · {changeKeys.length} field{changeKeys.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <div className="text-xs text-muted-foreground" title={date.toISOString()}>
          {date.toLocaleString()}
        </div>
      </div>
      {(entry.changes || entry.rowData) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 text-xs text-muted-foreground underline hover:text-foreground"
        >
          {open ? "Hide details" : "Show details"}
        </button>
      )}
      {open && entry.changes ? (
        <table className="mt-2 w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-2 py-1 text-left font-normal">Field</th>
              <th className="px-2 py-1 text-left font-normal">From</th>
              <th className="px-2 py-1 text-left font-normal">To</th>
            </tr>
          </thead>
          <tbody>
            {changeKeys.map((k) => (
              <tr key={k} className="border-t border-border/60">
                <td className="px-2 py-1 font-mono">{k}</td>
                <td className="px-2 py-1 font-mono text-destructive/80 break-all">
                  {fmt(entry.changes![k].old)}
                </td>
                <td className="px-2 py-1 font-mono text-emerald-600 break-all">
                  {fmt(entry.changes![k].new)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {open && entry.rowData ? (
        <pre className="mt-2 max-h-60 overflow-auto rounded bg-accent/40 p-2 text-xs">
          {JSON.stringify(entry.rowData, null, 2)}
        </pre>
      ) : null}
    </li>
  );
}

function AuditPage() {
  const { tenantId } = Route.useParams();
  const navigate = useNavigate();

  const tenantsFn = useServerFn(listMyTenants);
  const auditFn = useServerFn(listAuditLog);

  const tenantsQ = useQuery({ queryKey: ["my-tenants"], queryFn: () => tenantsFn() });
  const currentTenant = tenantsQ.data?.find((t) => t.id === tenantId) ?? null;

  useEffect(() => {
    if (!tenantsQ.data) return;
    if (tenantsQ.data.length === 0) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (!currentTenant || currentTenant.role !== "admin") {
      navigate({ to: "/app/$tenantId", params: { tenantId: tenantsQ.data[0].id }, replace: true });
    }
  }, [currentTenant, navigate, tenantsQ.data]);

  const auditQ = useQuery({
    queryKey: ["audit", tenantId],
    queryFn: () => auditFn({ data: { tenantId, limit: 500 } }),
    enabled: currentTenant?.role === "admin",
  });

  const [actorFilter, setActorFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");

  const entries = auditQ.data ?? [];
  const actors = useMemo(() => {
    const m = new Map<string, string>();
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

  if (tenantsQ.isLoading || !currentTenant || currentTenant.role !== "admin") {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/app/$tenantId"
            params={{ tenantId }}
            className="rounded-md px-2 py-1 text-sm hover:bg-accent"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold">Audit log · {currentTenant.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="input h-8 py-0 text-sm"
          >
            <option value="">All users</option>
            {actors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="input h-8 py-0 text-sm"
          >
            <option value="">All types</option>
            {Object.entries(TABLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => auditQ.refetch()}
            className="ml-auto rounded-md px-2 py-1 text-xs hover:bg-accent"
          >
            Refresh
          </button>
        </div>

        {auditQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : auditQ.error ? (
          <p className="text-sm text-destructive">
            {auditQ.error instanceof Error ? auditQ.error.message : String(auditQ.error)}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="rounded-md border border-border">
            {filtered.map((e) => (
              <AuditRow key={e.id} entry={e} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
