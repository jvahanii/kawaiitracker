import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SavingsChart } from "@/components/SavingsChart";

import { logout } from "@/lib/api/auth.functions";
import { listMyTenants, listTenantMembers } from "@/lib/api/tenants.functions";
import {
  createItem,
  deleteItem,
  listItems,
  updateItem,
  type ItemRow,
  type ItemStatus,
} from "@/lib/api/items.functions";
import {
  listEntriesForItem,
  upsertEntry,
} from "@/lib/api/entries.functions";


export const Route = createFileRoute("/_authenticated/app/$tenantId")({
  head: () => ({ meta: [{ title: "Workspace — Tracker" }] }),
  beforeLoad: async ({ params }) => {
    const tenants = await listMyTenants();
    if (tenants.length === 0) throw redirect({ to: "/onboarding" });
    const current = tenants.find((t) => t.id === params.tenantId);
    if (!current) throw redirect({ to: "/app/$tenantId", params: { tenantId: tenants[0].id } });
    return { tenants, currentTenant: current };
  },
  component: WorkspacePage,
});


function WorkspacePage() {
  const { t } = useTranslation();
  const { tenantId } = Route.useParams();
  const { tenants, currentTenant } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const listFn = useServerFn(listItems);
  const membersFn = useServerFn(listTenantMembers);
  const createFn = useServerFn(createItem);
  const updateFn = useServerFn(updateItem);
  const deleteFn = useServerFn(deleteItem);
  const logoutFn = useServerFn(logout);

  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
  });
  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => membersFn({ data: { tenantId } }),
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const items = itemsQ.data ?? [];
  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search]);

  useEffect(() => {
    if (selectedId && !items.find((i) => i.id === selectedId)) setSelectedId(null);
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [items, filtered, selectedId]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["items", tenantId] });

  const createM = useMutation({
    mutationFn: (title: string) => createFn({ data: { tenantId, title } }),
    onSuccess: (r) => {
      invalidate();
      setSelectedId(r.id);
    },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { tenantId, id } }),
    onSuccess: () => invalidate(),
  });
  const logoutM = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => navigate({ to: "/" }),
  });

  const [newTitle, setNewTitle] = useState("");

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">{t("common.appName")}</span>
          <select
            value={tenantId}
            onChange={(e) =>
              navigate({ to: "/app/$tenantId", params: { tenantId: e.target.value } })
            }
            className="input h-8 py-0 text-sm"
          >
            {tenants.map((tn: { id: string; name: string }) => (
              <option key={tn.id} value={tn.id}>
                {tn.name}
              </option>
            ))}
          </select>
          <Link
            to="/onboarding"
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            {t("workspace.newWorkspace")}
          </Link>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <LanguageSwitcher />
          {currentTenant.role === "admin" ? (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(currentTenant.joinCode);
              }}
              title={t("workspace.joinCodeTitle")}
              className="rounded bg-accent px-2 py-1 hover:bg-accent/80"
            >
              <span className="mr-1">{t("workspace.joinCode")}</span>
              <span className="font-mono font-semibold text-foreground">
                {currentTenant.joinCode}
              </span>
            </button>
          ) : null}
          <button
            onClick={() => logoutM.mutate()}
            className="rounded-md px-2 py-1 hover:bg-accent"
          >
            {t("common.logout")}
          </button>
        </div>
      </header>

      <SavingsChart tenantId={tenantId} />

      <div className="flex min-h-0 flex-1">

        {/* Left pane */}
        <aside className="flex w-96 flex-col border-r border-border">
          <div className="space-y-2 border-b border-border p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("workspace.searchPlaceholder")}
              className="input h-8 text-sm"
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                createM.mutate(newTitle.trim());
                setNewTitle("");
              }}
              className="flex gap-1"
            >
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("workspace.newItemPlaceholder")}
                className="input h-8 flex-1 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                {t("common.add")}
              </button>
            </form>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {itemsQ.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("workspace.noItems")}</p>
            ) : (
              <ul>
                {filtered.map((it) => (
                  <li key={it.id}>
                    <button
                      onClick={() => setSelectedId(it.id)}
                      className={`flex w-full flex-col items-start gap-1 border-b border-border px-3 py-2 text-left text-sm hover:bg-accent ${
                        selectedId === it.id ? "bg-accent" : ""
                      }`}
                    >
                      <span className="line-clamp-1 font-medium">{it.title}</span>
                      {it.assigneeName ? (
                        <span className="text-xs text-muted-foreground">
                          {it.assigneeName}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Right pane */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          {selected ? (
            <ItemDetail
              key={selected.id}
              tenantId={tenantId}
              item={selected}
              members={membersQ.data ?? []}
              onSave={async (patch) => {
                await updateFn({ data: { tenantId, id: selected.id, ...patch } });
                invalidate();
              }}
              onEntriesChanged={() =>
                qc.invalidateQueries({ queryKey: ["entries", tenantId] })
              }
              onDelete={() => deleteM.mutate(selected.id)}
            />

          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("workspace.selectOrCreate")}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


function ItemDetail({
  tenantId,
  item,
  members,
  onSave,
  onEntriesChanged,
  onDelete,
}: {
  tenantId: string;
  item: ItemRow;
  members: { id: string; displayName: string }[];
  onSave: (patch: {
    title?: string;
    status?: ItemStatus;
    assigneeId?: string | null;
    notes?: string;
  }) => Promise<void>;
  onEntriesChanged: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(item.title);
  const status = item.status;
  const [assigneeId, setAssigneeId] = useState<string | "">(item.assigneeId ?? "");
  const [notes, setNotes] = useState(item.notes);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    title !== item.title ||
    status !== item.status ||
    (assigneeId || null) !== item.assigneeId ||
    notes !== item.notes;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await onSave({ title, status, assigneeId: assigneeId || null, notes });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none"
      />
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">{t("workspace.assignee")}</span>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            onBlur={save}
            className="input h-8 py-0"
          >
            <option value="">{t("workspace.unassigned")}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MonthlyEntries
        tenantId={tenantId}
        itemId={item.id}
        onChanged={onEntriesChanged}
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={save}
        placeholder={t("workspace.notesPlaceholder")}
        className="input mt-6 min-h-[180px] w-full resize-y leading-relaxed"
      />
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {saving
            ? t("common.saving")
            : dirty
            ? t("common.unsaved")
            : savedAt
            ? t("common.saved")
            : t("workspace.updated", { when: new Date(item.updatedAt).toLocaleString() })}
        </span>
        <button
          onClick={() => {
            if (confirm(t("workspace.confirmDelete"))) onDelete();
          }}
          className="rounded-md px-2 py-1 text-destructive hover:bg-destructive/10"
        >
          {t("common.delete")}
        </button>
      </div>
    </div>
  );
}

function MonthlyEntries({
  tenantId,
  itemId,
  onChanged,
}: {
  tenantId: string;
  itemId: string;
  onChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const listFn = useServerFn(listEntriesForItem);
  const upsertFn = useServerFn(upsertEntry);

  const entriesQ = useQuery({
    queryKey: ["entries-item", tenantId, itemId],
    queryFn: () => listFn({ data: { tenantId, itemId } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["entries-item", tenantId, itemId] });
    qc.invalidateQueries({ queryKey: ["entries", tenantId] });
    onChanged();
  };

  const upsertM = useMutation({
    mutationFn: (v: { month: string; amount?: number; actual?: number }) =>
      upsertFn({ data: { tenantId, itemId, ...v } }),
    onSuccess: invalidate,
  });

  const entries = entriesQ.data ?? [];
  const byMonth = useMemo(() => {
    const m = new Map<string, { amount: number; actual: number }>();
    for (const e of entries) m.set(e.month, { amount: e.amount, actual: e.actual });
    return m;
  }, [entries]);

  const [year, setYear] = useState(new Date().getFullYear());

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      iso: `${year}-${String(i + 1).padStart(2, "0")}-01`,
      idx: i,
    }));
  }, [year]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: "long" }),
    [i18n.language],
  );
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);

  const yearTotal = months.reduce((s, m) => s + (byMonth.get(m.iso)?.amount ?? 0), 0);
  const actualTotal = months.reduce((s, m) => s + (byMonth.get(m.iso)?.actual ?? 0), 0);

  return (
    <div className="mt-6 rounded-md border border-border p-3">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{t("workspace.monthlyEntries")}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="rounded px-2 py-0.5 hover:bg-accent"
              aria-label="Previous year"
            >
              ‹
            </button>
            <span className="font-mono font-semibold text-foreground">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="rounded px-2 py-0.5 hover:bg-accent"
              aria-label="Next year"
            >
              ›
            </button>
          </div>
          <label className="flex items-center gap-1">
            <span>Suunniteltu:</span>
            <TotalEditor
              total={yearTotal}
              onCommit={(newTotal) => {
                const per = Math.round((newTotal / 12) * 100) / 100;
                for (const m of months) {
                  upsertM.mutate({ month: m.iso, amount: per });
                }
              }}
            />
          </label>
          <label className="flex items-center gap-1">
            <span>Toteuma:</span>
            <TotalEditor
              total={actualTotal}
              onCommit={(newTotal) => {
                const per = Math.round((newTotal / 12) * 100) / 100;
                for (const m of months) {
                  upsertM.mutate({ month: m.iso, actual: per });
                }
              }}
            />
          </label>
        </div>
      </div>

      {entriesQ.isLoading ? (
        <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-12 gap-1">
          {months.map(({ iso, idx }) => {
            const cell = byMonth.get(iso);
            return (
              <MonthCell
                key={iso}
                label={monthLabel.format(new Date(2000, idx, 1))}
                amount={cell?.amount ?? null}
                actual={cell?.actual ?? null}
                onCommitAmount={(amount) => upsertM.mutate({ month: iso, amount })}
                onCommitActual={(actual) => upsertM.mutate({ month: iso, actual })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function MonthCell({
  label,
  amount,
  actual,
  onCommitAmount,
  onCommitActual,
}: {
  label: string;
  amount: number | null;
  actual: number | null;
  onCommitAmount: (amount: number) => void;
  onCommitActual: (actual: number) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col items-stretch gap-1 rounded-md border border-border bg-background px-1.5 py-1">
      <span className="truncate text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        {label.slice(0, 3)}
      </span>
      <NumberInput value={amount} onCommit={onCommitAmount} placeholder="plan" />
      <NumberInput
        value={actual}
        onCommit={onCommitActual}
        placeholder="toteuma"
        className="text-primary"
      />
    </div>
  );
}

function NumberInput({
  value,
  onCommit,
  placeholder,
  className = "",
}: {
  value: number | null;
  onCommit: (n: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value === null ? "" : String(value));
  }, [value, focused]);

  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const trimmed = text.trim();
        if (trimmed === "" && value === null) return;
        const parsed = Number(trimmed.replace(",", "."));
        if (!Number.isFinite(parsed)) return;
        if (parsed === (value ?? 0)) return;
        onCommit(parsed);
      }}
      placeholder={placeholder ?? "0"}
      className={`h-6 w-full min-w-0 bg-transparent text-center font-mono text-xs outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
    />
  );
}

function TotalEditor({
  total,
  onCommit,
}: {
  total: number;
  onCommit: (newTotal: number) => void;
}) {
  const [text, setText] = useState(String(total));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(total));
  }, [total, focused]);

  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const parsed = Number(text.trim().replace(",", "."));
        if (!Number.isFinite(parsed)) return;
        if (parsed === total) return;
        onCommit(parsed);
      }}
      className="h-6 w-24 rounded border border-border bg-background px-1 text-right font-mono text-xs font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}



