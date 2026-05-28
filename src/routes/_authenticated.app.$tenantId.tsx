import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

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
          <span className="text-sm font-semibold tracking-tight">Tracker</span>
          <select
            value={tenantId}
            onChange={(e) =>
              navigate({ to: "/app/$tenantId", params: { tenantId: e.target.value } })
            }
            className="input h-8 py-0 text-sm"
          >
            {tenants.map((t: { id: string; name: string }) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Link
            to="/onboarding"
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            + Workspace
          </Link>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {currentTenant.role === "admin" ? (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(currentTenant.joinCode);
              }}
              title="Share this code so teammates can join the workspace. Click to copy."
              className="rounded bg-accent px-2 py-1 hover:bg-accent/80"
            >
              <span className="mr-1">Join code:</span>
              <span className="font-mono font-semibold text-foreground">
                {currentTenant.joinCode}
              </span>
            </button>
          ) : null}
          <button
            onClick={() => logoutM.mutate()}
            className="rounded-md px-2 py-1 hover:bg-accent"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left pane */}
        <aside className="flex w-80 flex-col border-r border-border">
          <div className="space-y-2 border-b border-border p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
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
                placeholder="New item title…"
                className="input h-8 flex-1 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Add
              </button>
            </form>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {itemsQ.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No items yet.</p>
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
              item={selected}
              members={membersQ.data ?? []}
              onSave={async (patch) => {
                await updateFn({ data: { tenantId, id: selected.id, ...patch } });
                invalidate();
              }}
              onDelete={() => deleteM.mutate(selected.id)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select an item, or create a new one.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


function ItemDetail({
  item,
  members,
  onSave,
  onDelete,
}: {
  item: ItemRow;
  members: { id: string; displayName: string }[];
  onSave: (patch: {
    title?: string;
    status?: ItemStatus;
    assigneeId?: string | null;
    notes?: string;
  }) => Promise<void>;
  onDelete: () => void;
}) {
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
      await onSave({
        title,
        status,
        assigneeId: assigneeId || null,
        notes,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none"
      />
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Assignee</span>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            onBlur={save}
            className="input h-8 py-0"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={save}
        placeholder="Notes…"
        className="input mt-6 min-h-[260px] w-full resize-y leading-relaxed"
      />
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {saving
            ? "Saving…"
            : dirty
            ? "Unsaved changes"
            : savedAt
            ? "Saved"
            : `Updated ${new Date(item.updatedAt).toLocaleString()}`}
        </span>
        <button
          onClick={() => {
            if (confirm("Delete this item?")) onDelete();
          }}
          className="rounded-md px-2 py-1 text-destructive hover:bg-destructive/10"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
