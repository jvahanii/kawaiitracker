import { createFileRoute, getRouteApi, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, FolderPlus, GripVertical, Lock, Pencil, Trash2 } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SavingsChart } from "@/components/SavingsChart";

import { ensureSupabase } from "@/lib/supabase/client";
import { listMyTenants, listTenantMembers } from "@/lib/api/tenants.functions";
import {
  createItem,
  deleteItem,
  listItems,
  reorderItems,
  updateItem,
  type ItemRow,
  type ItemStatus,
} from "@/lib/api/items.functions";
import {
  createFolder,
  deleteFolder,
  getFolderVisibility,
  listFolders,
  setFolderVisibility,
  updateFolder,
  type FolderRow,
} from "@/lib/api/folders.functions";
import { listEntriesForItem, upsertEntry } from "@/lib/api/entries.functions";
import {
  listTasksForItem,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  type TaskRow,
} from "@/lib/api/tasks.functions";

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

const authenticatedRoute = getRouteApi("/_authenticated");

function WorkspacePage() {
  const { t } = useTranslation();
  const { tenantId } = Route.useParams();
  const { tenants, currentTenant } = Route.useRouteContext();
  const { user } = authenticatedRoute.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

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

  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
  });
  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => membersFn({ data: { tenantId } }),
  });
  const foldersQ = useQuery({
    queryKey: ["folders", tenantId],
    queryFn: () => listFoldersFn({ data: { tenantId } }),
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | "ROOT">(null);
  const folders = foldersQ.data ?? [];

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
    mutationFn: (vars: { title: string; folderId: string | null }) =>
      createFn({ data: { tenantId, title: vars.title, folderId: vars.folderId } }),
    onSuccess: (r) => {
      invalidate();
      setSelectedId(r.id);
    },
  });
  const moveItemM = useMutation({
    mutationFn: (vars: { id: string; folderId: string | null }) =>
      updateFn({ data: { tenantId, id: vars.id, folderId: vars.folderId } }),
    onMutate: (vars) => {
      const prev = qc.getQueryData<ItemRow[]>(["items", tenantId]);
      if (prev) {
        qc.setQueryData<ItemRow[]>(
          ["items", tenantId],
          prev.map((it) => (it.id === vars.id ? { ...it, folderId: vars.folderId } : it)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items", tenantId], ctx.prev);
    },
    onSuccess: () => invalidate(),
  });
  const invalidateFolders = () => qc.invalidateQueries({ queryKey: ["folders", tenantId] });
  const createFolderM = useMutation({
    mutationFn: (vars: { name: string; parentId: string | null }) =>
      createFolderFn({ data: { tenantId, name: vars.name, parentId: vars.parentId } }),
    onSuccess: invalidateFolders,
  });
  const renameFolderM = useMutation({
    mutationFn: (vars: { id: string; name: string }) =>
      updateFolderFn({ data: { tenantId, id: vars.id, name: vars.name } }),
    onSuccess: invalidateFolders,
  });
  const deleteFolderM = useMutation({
    mutationFn: (id: string) => deleteFolderFn({ data: { tenantId, id } }),
    onSuccess: () => {
      invalidateFolders();
      invalidate();
    },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { tenantId, id } }),
    onSuccess: () => invalidate(),
  });
  const reorderM = useMutation({
    mutationFn: (orderedIds: string[]) => reorderFn({ data: { tenantId, orderedIds } }),
    onMutate: (orderedIds) => {
      const prev = qc.getQueryData<ItemRow[]>(["items", tenantId]);
      const sorted = orderedIds
        .map((id) => prev?.find((i) => i.id === id))
        .filter(Boolean) as ItemRow[];
      qc.setQueryData(["items", tenantId], sorted);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items", tenantId], ctx.prev);
    },
    onSuccess: () => invalidate(),
  });
  const logoutM = useMutation({
    mutationFn: async () => {
      // Navigate away first so mounted queries unmount before the session
      // is cleared — otherwise they refetch unauthenticated and 401.
      await navigate({ to: "/login" });
      const supabase = await ensureSupabase();
      await supabase.auth.signOut();
    },
  });

  const [newTitle, setNewTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard?.writeText(currentTenant.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
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
          {user ? <span className="font-medium text-foreground">{user.displayName}</span> : null}
          <LanguageSwitcher />
          {currentTenant.role === "admin" ? (
            <>
              <Link
                to="/members/$tenantId"
                params={{ tenantId }}
                className="rounded-md px-2 py-1 text-xs hover:bg-accent"
              >
                {t("workspace.manageUsers")}
              </Link>
              <button
                type="button"
                onClick={copyJoinCode}
                title={t("workspace.joinCodeTitle")}
                className="rounded bg-accent px-2 py-1 hover:bg-accent/80"
              >
                <span className="mr-1">{t("workspace.joinCode")}</span>
                <span className="font-mono font-semibold text-foreground">
                  {currentTenant.joinCode}
                </span>
              </button>
            </>
          ) : null}
          <button onClick={() => logoutM.mutate()} className="rounded-md px-2 py-1 hover:bg-accent">
            {t("common.logout")}
          </button>
        </div>
      </header>

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
                createM.mutate({ title: newTitle.trim(), folderId: null });
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
          <FolderTreePane
            tenantId={tenantId}
            t={t}
            search={search}
            items={items}
            filtered={filtered}
            folders={folders}
            loading={itemsQ.isLoading || foldersQ.isLoading}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            draggingItemId={draggingItemId}
            setDraggingItemId={setDraggingItemId}
            dragOverItemId={dragOverItemId}
            setDragOverItemId={setDragOverItemId}
            dragOverFolderId={dragOverFolderId}
            setDragOverFolderId={setDragOverFolderId}
            onReorder={(ids) => reorderM.mutate(ids)}
            onMoveItem={(id, folderId) => moveItemM.mutate({ id, folderId })}
            onCreateFolder={(name, parentId) => createFolderM.mutate({ name, parentId })}
            onRenameFolder={(id, name) => renameFolderM.mutate({ id, name })}
            onDeleteFolder={(id) => deleteFolderM.mutate(id)}
            onCreateItemInFolder={(folderId) => {
              const title = prompt(t("workspace.newItemPlaceholder"));
              if (title?.trim()) createM.mutate({ title: title.trim(), folderId });
            }}
          />
        </aside>


        {/* Right pane */}
        <main className="flex min-h-0 flex-1 flex-col">
          <SavingsChart tenantId={tenantId} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {selected ? (
              <ItemDetail
                key={selected.id}
                tenantId={tenantId}
                item={selected}
                members={membersQ.data ?? []}
                folders={folders}
                onSave={async (patch) => {
                  await updateFn({ data: { tenantId, id: selected.id, ...patch } });
                  invalidate();
                }}
                onEntriesChanged={() => qc.invalidateQueries({ queryKey: ["entries", tenantId] })}
                onDelete={() => deleteM.mutate(selected.id)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t("workspace.selectOrCreate")}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function TaskLists({
  tenantId,
  itemId,
}: {
  tenantId: string;
  itemId: string;
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listTasksForItem);
  const createFn = useServerFn(createTask);
  const updateFn = useServerFn(updateTask);
  const deleteFn = useServerFn(deleteTask);
  const reorderFn = useServerFn(reorderTasks);

  const tasksQ = useQuery({
    queryKey: ["tasks", tenantId, itemId],
    queryFn: () => listFn({ data: { tenantId, itemId } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks", tenantId, itemId] });

  const createM = useMutation({
    mutationFn: (v: { title: string; userId?: string }) =>
      createFn({ data: { tenantId, itemId, title: v.title, userId: v.userId } }),
    onSuccess: invalidate,
  });

  const updateM = useMutation({
    mutationFn: (v: { id: string; title?: string; done?: boolean }) =>
      updateFn({ data: { tenantId, id: v.id, title: v.title, done: v.done } }),
    onSuccess: invalidate,
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { tenantId, id } }),
    onSuccess: invalidate,
  });

  const reorderM = useMutation({
    mutationFn: (orderedIds: string[]) => reorderFn({ data: { tenantId, itemId, orderedIds } }),
    onMutate: (orderedIds) => {
      const prev = qc.getQueryData<TaskRow[]>(["tasks", tenantId, itemId]);
      if (prev) {
        // Rebuild the tasks list: replace the group being reordered with the new order,
        // while keeping tasks from other groups in their original positions.
        const reorderedSet = new Set(orderedIds);
        const others = prev.filter((t) => !reorderedSet.has(t.id));
        const reordered = orderedIds
          .map((id) => prev.find((t) => t.id === id))
          .filter(Boolean) as TaskRow[];
        // Put reordered group at the top in their new order, other groups after
        qc.setQueryData(["tasks", tenantId, itemId], [...reordered, ...others]);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", tenantId, itemId], ctx.prev);
    },
    onSuccess: invalidate,
  });

  const tasks = tasksQ.data ?? [];

  return (
    <div className="mt-6 space-y-4">
      <TaskGroup
        name="Tehtävät"
        tasks={tasks}
        userId={undefined}
        onAdd={(title) => createM.mutate({ title })}
        onToggle={(id, done) => updateM.mutate({ id, done })}
        onEditTitle={(id, title) => updateM.mutate({ id, title })}
        onDelete={(id) => deleteM.mutate(id)}
        onReorder={(orderedIds) => reorderM.mutate(orderedIds)}
      />
    </div>
  );
}


function TaskGroup({
  name,
  tasks,
  userId,
  onAdd,
  onToggle,
  onEditTitle,
  onDelete,
  onReorder,
}: {
  name: string;
  tasks: TaskRow[];
  userId?: string;
  onAdd: (title: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onEditTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const startEdit = (task: TaskRow) => {
    setEditingId(task.id);
    setEditText(task.title);
  };

  const commitEdit = () => {
    if (editingId && editText.trim()) {
      onEditTitle(editingId, editText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="rounded-md border border-border p-3">
      <h4 className="mb-2 text-sm font-semibold text-foreground">{name}</h4>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li
            key={t.id}
            draggable
            onDragStart={(e) => {
              setDraggingTaskId(t.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDraggingTaskId(null);
              setDragOverTaskId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverTaskId !== t.id) setDragOverTaskId(t.id);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverTaskId(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!draggingTaskId || draggingTaskId === t.id) {
                setDraggingTaskId(null);
                setDragOverTaskId(null);
                return;
              }
              const list = [...tasks];
              const fromIdx = list.findIndex((x) => x.id === draggingTaskId);
              const toIdx = list.findIndex((x) => x.id === t.id);
              const [removed] = list.splice(fromIdx, 1);
              list.splice(toIdx, 0, removed);
              onReorder(list.map((x) => x.id));
              setDraggingTaskId(null);
              setDragOverTaskId(null);
            }}
            className={`flex items-center gap-2 transition-opacity ${
              draggingTaskId === t.id ? "opacity-40" : ""
            } ${
              dragOverTaskId === t.id && draggingTaskId !== t.id
                ? "border-t-2 border-t-primary"
                : ""
            }`}
          >
            <span
              className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
              title="Järjestä vetämällä"
            >
              <GripVertical size={14} />
            </span>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => onToggle(t.id, !t.done)}
              className="shrink-0"
            />
            {editingId === t.id ? (
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="input h-7 flex-1 text-sm"
              />
            ) : (
              <span
                onClick={() => startEdit(t)}
                className={`flex-1 cursor-pointer text-sm ${
                  t.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
                title="Klikkaa muokataksesi"
              >
                {t.title}
              </span>
            )}
            <button
              type="button"
              onClick={() => startEdit(t)}
              className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Muokkaa"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDelete(t.id)}
              className="rounded px-1.5 py-0.5 text-xs text-destructive hover:bg-destructive/10"
              title="Poista"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;
          onAdd(newTitle.trim());
          setNewTitle("");
        }}
        className="mt-2 flex gap-1"
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Uusi tehtävä…"
          className="input h-7 flex-1 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground"
        >
          Lisää
        </button>
      </form>
    </div>
  );
}

function ItemDetail({
  tenantId,
  item,
  members,
  folders,
  onSave,
  onEntriesChanged,
  onDelete,
}: {
  tenantId: string;
  item: ItemRow;
  members: { id: string; displayName: string }[];
  folders: FolderRow[];
  onSave: (patch: {
    title?: string;
    status?: ItemStatus;
    assigneeIds?: string[];
    folderId?: string | null;
  }) => Promise<void>;

  onEntriesChanged: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(item.title);
  const status = item.status;
  const initialAssigneeIds = item.assignees.map((a) => a.id);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(initialAssigneeIds);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const assigneesChanged =
    assigneeIds.length !== initialAssigneeIds.length ||
    assigneeIds.some((id) => !initialAssigneeIds.includes(id));

  const dirty = title !== item.title || status !== item.status || assigneesChanged;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await onSave({
        title,
        status,
        assigneeIds: assigneesChanged ? assigneeIds : undefined,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignee = (id: string) => {
    setAssigneeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedNames = members.filter((m) => assigneeIds.includes(m.id)).map((m) => m.displayName);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none"
      />
      <MonthlyEntries tenantId={tenantId} itemId={item.id} onChanged={onEntriesChanged} />

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="pt-1 text-muted-foreground">{t("workspace.assignees")}</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="input h-8 min-w-[12rem] px-2 py-0 text-left"
            >
              {selectedNames.length > 0 ? selectedNames.join(", ") : t("workspace.unassigned")}
            </button>
            {pickerOpen ? (
              <div
                className="absolute z-20 mt-1 max-h-60 w-64 overflow-auto rounded-md border border-border bg-background p-2 shadow-lg"
                onMouseLeave={() => {
                  setPickerOpen(false);
                  void save();
                }}
              >
                {members.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-muted-foreground">{t("members.empty")}</p>
                ) : (
                  members.map((m) => {
                    const checked = assigneeIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAssignee(m.id)}
                        />
                        <span>{m.displayName}</span>
                      </label>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{t("workspace.folder")}</span>
          <select
            value={item.folderId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              void onSave({ folderId: v === "" ? null : v });
            }}
            className="input h-8 min-w-[12rem] py-0 text-sm"
          >
            <option value="">{t("workspace.uncategorized")}</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {folderPathLabel(f, folders)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TaskLists tenantId={tenantId} itemId={item.id} />


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
    const m = new Map<string, { amount: number | null; actual: number | null }>();
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
  const [text, setText] = useState(value === null ? "0" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value === null ? "0" : String(value));
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

function TotalEditor({ total, onCommit }: { total: number; onCommit: (newTotal: number) => void }) {
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

function folderPathLabel(f: FolderRow, all: FolderRow[]): string {
  const parts: string[] = [f.name];
  let cur: FolderRow | undefined = f;
  const byId = new Map(all.map((x) => [x.id, x]));
  const seen = new Set<string>([f.id]);
  while (cur?.parentId) {
    const p = byId.get(cur.parentId);
    if (!p || seen.has(p.id)) break;
    seen.add(p.id);
    parts.unshift(p.name);
    cur = p;
  }
  return parts.join(" / ");
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string;

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
  dragOverItemId,
  setDragOverItemId,
  dragOverFolderId,
  setDragOverFolderId,
  onReorder,
  onMoveItem,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateItemInFolder,
}: {
  tenantId: string;
  t: TFunc;
  search: string;
  items: ItemRow[];
  filtered: ItemRow[];
  folders: FolderRow[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  draggingItemId: string | null;
  setDraggingItemId: (id: string | null) => void;
  dragOverItemId: string | null;
  setDragOverItemId: (id: string | null) => void;
  dragOverFolderId: string | null | "ROOT";
  setDragOverFolderId: (id: string | null | "ROOT") => void;
  onReorder: (ids: string[]) => void;
  onMoveItem: (id: string, folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onCreateItemInFolder: (folderId: string | null) => void;
}) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => openMap[id] !== false;
  const toggle = (id: string) => setOpenMap((p) => ({ ...p, [id]: !isOpen(id) }));

  const childrenByParent = useMemo(() => {
    const m = new Map<string | null, FolderRow[]>();
    for (const f of folders) {
      const arr = m.get(f.parentId) ?? [];
      arr.push(f);
      m.set(f.parentId, arr);
    }
    return m;
  }, [folders]);

  const itemsByFolder = useMemo(() => {
    const m = new Map<string | null, ItemRow[]>();
    for (const it of filtered) {
      const arr = m.get(it.folderId) ?? [];
      arr.push(it);
      m.set(it.folderId, arr);
    }
    return m;
  }, [filtered]);

  const renderItem = (it: ItemRow, depth: number) => (
    <li
      key={it.id}
      draggable={!search}
      onDragStart={(e) => {
        setDraggingItemId(it.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        setDraggingItemId(null);
        setDragOverItemId(null);
        setDragOverFolderId(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverItemId !== it.id) setDragOverItemId(it.id);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverItemId(null);
      }}
      onDrop={(e) => {
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
      }}
      className={`flex items-stretch border-b border-border transition-opacity ${
        draggingItemId === it.id ? "opacity-40" : ""
      } ${
        dragOverItemId === it.id && draggingItemId !== it.id
          ? "border-t-2 border-t-primary"
          : ""
      }`}
      style={{ paddingLeft: `${depth * 12}px` }}
    >
      {!search && (
        <span className="flex cursor-grab items-center px-1.5 text-muted-foreground hover:text-foreground active:cursor-grabbing">
          <GripVertical size={14} />
        </span>
      )}
      <button
        onClick={() => setSelectedId(it.id)}
        className={`flex min-w-0 flex-1 flex-col items-start gap-1 py-2 pr-3 text-left text-sm hover:bg-accent ${
          selectedId === it.id ? "bg-accent" : ""
        } ${!search ? "" : "pl-3"}`}
      >
        <span className="line-clamp-1 font-medium">{it.title}</span>
        {it.assigneeName ? (
          <span className="text-xs text-muted-foreground">{it.assigneeName}</span>
        ) : null}
      </button>
    </li>
  );

  const renderFolder = (folder: FolderRow, depth: number): ReactNode => {
    const open = isOpen(folder.id);
    const children = childrenByParent.get(folder.id) ?? [];
    const folderItems = itemsByFolder.get(folder.id) ?? [];
    const dragHover = dragOverFolderId === folder.id;
    return (
      <li key={folder.id}>
        <div
          onDragOver={(e) => {
            if (!draggingItemId) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (dragOverFolderId !== folder.id) setDragOverFolderId(folder.id);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverFolderId(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggingItemId) onMoveItem(draggingItemId, folder.id);
            setDraggingItemId(null);
            setDragOverFolderId(null);
          }}
          className={`group flex items-center gap-1 border-b border-border py-1 pr-1 text-sm ${
            dragHover ? "bg-primary/10" : "bg-muted/30"
          }`}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <button onClick={() => toggle(folder.id)} className="p-0.5 text-muted-foreground hover:text-foreground" aria-label="toggle">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span className="flex-1 truncate font-medium">{folder.name}</span>
          <button
            type="button"
            onClick={() => {
              const name = window.prompt(t("workspace.newFolderPrompt"));
              if (name?.trim()) onCreateFolder(name.trim(), folder.id);
            }}
            className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            title={t("workspace.addSubfolder")}
          >
            <FolderPlus size={12} />
          </button>
          <button
            type="button"
            onClick={() => onCreateItemInFolder(folder.id)}
            className="px-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            title={t("workspace.newItemPlaceholder")}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              const name = window.prompt(t("workspace.folder"), folder.name);
              if (name?.trim() && name.trim() !== folder.name) onRenameFolder(folder.id, name.trim());
            }}
            className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            title={t("workspace.renameFolder")}
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("workspace.confirmDeleteFolder"))) onDeleteFolder(folder.id);
            }}
            className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
            title={t("common.delete")}
          >
            <Trash2 size={12} />
          </button>
        </div>
        {open && (
          <ul>
            {children.map((c) => renderFolder(c, depth + 1))}
            {folderItems.map((it) => renderItem(it, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const rootFolders = childrenByParent.get(null) ?? [];
  const rootItems = itemsByFolder.get(null) ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-2 py-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("workspace.folders")}
        </span>
        <button
          type="button"
          onClick={() => {
            const name = window.prompt(t("workspace.newFolderPrompt"));
            if (name?.trim()) onCreateFolder(name.trim(), null);
          }}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs hover:bg-accent"
          title={t("workspace.newFolder")}
        >
          <FolderPlus size={12} />
          {t("workspace.newFolder")}
        </button>
      </div>
      {loading ? (
        <p className="p-4 text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <ul>
          {rootFolders.map((f) => renderFolder(f, 0))}
          {/* Root (uncategorized) drop zone */}
          <li>
            <div
              onDragOver={(e) => {
                if (!draggingItemId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverFolderId !== "ROOT") setDragOverFolderId("ROOT");
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverFolderId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingItemId) onMoveItem(draggingItemId, null);
                setDraggingItemId(null);
                setDragOverFolderId(null);
              }}
              className={`border-b border-border py-1 pl-2 text-xs uppercase tracking-wide text-muted-foreground ${
                dragOverFolderId === "ROOT" ? "bg-primary/10" : ""
              }`}
            >
              {t("workspace.uncategorized")}
            </div>
            {rootItems.length === 0 && folders.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("workspace.noItems")}</p>
            ) : (
              <ul>{rootItems.map((it) => renderItem(it, 0))}</ul>
            )}
          </li>
        </ul>
      )}
    </div>
  );
}
