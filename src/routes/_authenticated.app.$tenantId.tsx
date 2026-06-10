import { createFileRoute, getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, FolderPlus, GripVertical, Lock, Pencil, Trash2 } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useCurrency } from "@/lib/currency";
import { SavingsChart } from "@/components/SavingsChart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ensureSupabase } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format-date";
import { listMyTenants, listTenantMembers, setLastTenantId } from "@/lib/api/tenants.functions";
import { isSuperuser as isSuperuserFn } from "@/lib/api/superusers.functions";
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
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/$tenantId")({
  head: () => ({ meta: [{ title: "Workspace — Tracker" }] }),
  component: WorkspacePage,
});

const authenticatedRoute = getRouteApi("/_authenticated");

function WorkspacePage() {
  const { t } = useTranslation();
  const { tenantId } = Route.useParams();
  const { user } = authenticatedRoute.useRouteContext();
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
  const isSuperuserSF = useServerFn(isSuperuserFn);

  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => tenantListFn(),
    retry: 1,
  });
  const isSuperuserQ = useQuery({
    queryKey: ["is-superuser"],
    queryFn: () => isSuperuserSF(),
  });
  const tenants = tenantsQ.data ?? [];
  const currentTenant = tenants.find((tn) => tn.id === tenantId) ?? null;

  useEffect(() => {
    if (!tenantsQ.data) return;
    if (tenantsQ.data.length === 0) {
      try {
        localStorage.removeItem("lastTenantId");
      } catch {
        /* ignore */
      }
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (!currentTenant) {
      try {
        localStorage.removeItem("lastTenantId");
      } catch {
        /* ignore */
      }
      navigate({ to: "/app/$tenantId", params: { tenantId: tenantsQ.data[0].id }, replace: true });
      return;
    }
    try {
      localStorage.setItem("lastTenantId", currentTenant.id);
    } catch {
      /* ignore */
    }
    // Persist server-side too so the preference syncs across devices.
    setLastTenantFn({ data: { tenantId: currentTenant.id } }).catch(() => {
      /* best-effort */
    });
  }, [currentTenant, navigate, setLastTenantFn, tenantsQ.data]);

  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
    enabled: !!currentTenant,
  });
  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => membersFn({ data: { tenantId } }),
    enabled: !!currentTenant,
  });
  const foldersQ = useQuery({
    queryKey: ["folders", tenantId],
    queryFn: () => listFoldersFn({ data: { tenantId } }),
    enabled: !!currentTenant,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | "ROOT">(null);
  const [visibilityFolderId, setVisibilityFolderId] = useState<string | null>(null);
  const folders = foldersQ.data ?? [];
  const isSuperuser = !!isSuperuserQ.data?.is || currentTenant?.role === "superuser";
  const isAdmin = currentTenant?.role === "admin" || isSuperuser;

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

  const pageError = tenantsQ.error ?? itemsQ.error ?? membersQ.error ?? foldersQ.error;

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
    meta: { silent: true },
    onSuccess: () => {
      invalidateFolders();
      toast.success(t("workspace.folderCreated"));
    },
  });
  const renameFolderM = useMutation({
    mutationFn: (vars: { id: string; name: string }) =>
      updateFolderFn({ data: { tenantId, id: vars.id, name: vars.name } }),
    onSuccess: invalidateFolders,
  });
  const moveFolderM = useMutation({
    mutationFn: (vars: { id: string; parentId: string | null }) =>
      updateFolderFn({ data: { tenantId, id: vars.id, parentId: vars.parentId } }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["folders", tenantId] });
      const prev = qc.getQueryData<FolderRow[]>(["folders", tenantId]);
      if (prev) {
        qc.setQueryData<FolderRow[]>(
          ["folders", tenantId],
          prev.map((f) => (f.id === vars.id ? { ...f, parentId: vars.parentId } : f)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["folders", tenantId], ctx.prev);
    },
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
      await navigator.clipboard?.writeText(currentTenant?.joinCode ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (pageError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold">{t("common.error")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pageError instanceof Error ? pageError.message : String(pageError)}
          </p>
          <button
            type="button"
            onClick={() => {
              tenantsQ.refetch();
              itemsQ.refetch();
              membersQ.refetch();
              foldersQ.refetch();
            }}
            className="mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (tenantsQ.isLoading || !currentTenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

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
          {user ? (
            <span className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{user.displayName}</span>
              {isSuperuser ? (
                <Link
                  to="/members/$tenantId"
                  params={{ tenantId }}
                  className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300"
                >
                  {t("workspace.superuserBadge", "Superuser")}
                </Link>
              ) : null}
            </span>
          ) : null}
          <LanguageSwitcher />
          <CurrencySwitcher />
          <Link
            to="/help"
            className="rounded-md px-2 py-1 text-xs hover:bg-accent"
          >
            {t("common.help", "Help")}
          </Link>
          <Link
            to="/members/$tenantId"
            params={{ tenantId }}
            className="rounded-md px-2 py-1 text-xs hover:bg-accent"
          >
            {t("workspace.manageUsers")}
          </Link>
          {isAdmin ? (
            <>
              <Link
                to="/audit/$tenantId"
                params={{ tenantId }}
                className="rounded-md px-2 py-1 text-xs hover:bg-accent"
              >
                {t("workspace.changeHistory")}
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
            draggingFolderId={draggingFolderId}
            setDraggingFolderId={setDraggingFolderId}
            dragOverItemId={dragOverItemId}
            setDragOverItemId={setDragOverItemId}
            dragOverFolderId={dragOverFolderId}
            setDragOverFolderId={setDragOverFolderId}
            isAdmin={isAdmin}
            onReorder={(ids) => reorderM.mutate(ids)}
            onMoveItem={(id, folderId) => moveItemM.mutate({ id, folderId })}
            onMoveFolder={(id, parentId) => moveFolderM.mutate({ id, parentId })}
            onCreateFolder={(name, parentId) => createFolderM.mutate({ name, parentId })}
            onRenameFolder={(id, name) => renameFolderM.mutate({ id, name })}
            onDeleteFolder={(id) => deleteFolderM.mutate(id)}
            onManageVisibility={(id) => setVisibilityFolderId(id)}
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
      {visibilityFolderId ? (
        <FolderVisibilityDialog
          tenantId={tenantId}
          folderId={visibilityFolderId}
          folderName={folders.find((f) => f.id === visibilityFolderId)?.name ?? ""}
          members={membersQ.data ?? []}
          onClose={() => setVisibilityFolderId(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["folders", tenantId] });
            qc.invalidateQueries({ queryKey: ["items", tenantId] });
            setVisibilityFolderId(null);
          }}
        />
      ) : null}
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
  const { t } = useTranslation();
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
        {tasks.map((task) => (
          <li
            key={task.id}
            draggable
            onDragStart={(e) => {
              setDraggingTaskId(task.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDraggingTaskId(null);
              setDragOverTaskId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverTaskId !== task.id) setDragOverTaskId(task.id);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverTaskId(null);
              }
            }}
            onDrop={(e) => {
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
            }}
            className={`flex items-center gap-2 transition-opacity ${
              draggingTaskId === task.id ? "opacity-40" : ""
            } ${
              dragOverTaskId === task.id && draggingTaskId !== task.id
                ? "border-t-2 border-t-primary"
                : ""
            }`}
          >
            <span
              className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
              title={t("workspace.dragToReorder")}
            >
              <GripVertical size={14} />
            </span>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task.id, !task.done)}
              className="shrink-0"
            />
            {editingId === task.id ? (
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
                onClick={() => startEdit(task)}
                className={`flex-1 cursor-pointer text-sm ${
                  task.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
                title={t("workspace.clickToEdit")}
              >
                {task.title}
              </span>
            )}
            <button
              type="button"
              onClick={() => startEdit(task)}
              className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              title={t("workspace.edit")}
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded px-1.5 py-0.5 text-xs text-destructive hover:bg-destructive/10"
              title={t("common.delete")}
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
          placeholder={t("workspace.newTask")}
          className="input h-7 flex-1 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground"
        >
          {t("common.add")}
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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const assigneesChanged =
    assigneeIds.length !== initialAssigneeIds.length ||
    assigneeIds.some((id) => !initialAssigneeIds.includes(id));

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
        assigneeIds: assigneesChanged ? assigneeIds : undefined,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
  }, []);
  const scheduleTitleSave = (next: string) => {
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      const trimmed = next.trim();
      if (trimmed.length === 0) return;
      if (trimmed === item.title) return;
      void onSave({ title: trimmed });
      setSavedAt(Date.now());
    }, 600);
  };

  const toggleAssignee = (id: string) => {
    setAssigneeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedNames = members.filter((m) => assigneeIds.includes(m.id)).map((m) => m.displayName);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <input
        value={title}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          scheduleTitleSave(v);
        }}
        onBlur={() => {
          if (titleTimerRef.current) {
            clearTimeout(titleTimerRef.current);
            titleTimerRef.current = null;
          }
          void save();
        }}
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
                : t("workspace.updated", { when: formatDateTime(item.updatedAt) })}
        </span>
        <button
          onClick={() => setDeleteOpen(true)}
          className="rounded-md px-2 py-1 text-destructive hover:bg-destructive/10"
        >
          {t("common.delete")}
        </button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workspace.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{item.title}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  const { convert, toEur, currency } = useCurrency();

  const currencySymbol = useMemo(() => {
    try {
      const parts = new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency,
      }).formatToParts(0);
      return parts.find((p) => p.type === "currency")?.value ?? currency;
    } catch {
      return currency;
    }
  }, [i18n.language, currency]);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const yearTotalEur = months.reduce((s, m) => s + (byMonth.get(m.iso)?.amount ?? 0), 0);
  const actualTotalEur = months.reduce((s, m) => s + (byMonth.get(m.iso)?.actual ?? 0), 0);
  const yearTotal = round2(convert(yearTotalEur));
  const actualTotal = round2(convert(actualTotalEur));

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
            <span>{t("workspace.planned")}:</span>
            <TotalEditor
              total={yearTotal}
              onCommit={(newTotal) => {
                const perEur = round2(toEur(newTotal) / 12);
                for (const m of months) {
                  upsertM.mutate({ month: m.iso, amount: perEur });
                }
              }}
            />
            <span className="font-mono">{currencySymbol}</span>
          </label>
          <label className="flex items-center gap-1">
            <span>{t("workspace.actual")}:</span>
            <TotalEditor
              total={actualTotal}
              onCommit={(newTotal) => {
                const perEur = round2(toEur(newTotal) / 12);
                for (const m of months) {
                  upsertM.mutate({ month: m.iso, actual: perEur });
                }
              }}
            />
            <span className="font-mono">{currencySymbol}</span>
          </label>
        </div>
      </div>

      {entriesQ.isLoading ? (
        <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-12 gap-1">
          {months.map(({ iso, idx }) => {
            const cell = byMonth.get(iso);
            const amountDisp = cell?.amount == null ? null : round2(convert(cell.amount));
            const actualDisp = cell?.actual == null ? null : round2(convert(cell.actual));
            return (
              <MonthCell
                key={iso}
                label={monthLabel.format(new Date(2000, idx, 1))}
                amount={amountDisp}
                actual={actualDisp}
                planTabIndex={idx + 1}
                actualTabIndex={idx + 13}
                onCommitAmount={(amount) =>
                  upsertM.mutate({ month: iso, amount: round2(toEur(amount)) })
                }
                onCommitActual={(actual) =>
                  upsertM.mutate({ month: iso, actual: round2(toEur(actual)) })
                }
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
  planTabIndex,
  actualTabIndex,
}: {
  label: string;
  amount: number | null;
  actual: number | null;
  onCommitAmount: (amount: number) => void;
  onCommitActual: (actual: number) => void;
  planTabIndex?: number;
  actualTabIndex?: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-col items-stretch gap-1 rounded-md border border-border bg-background px-1.5 py-1">
      <span className="truncate text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        {label.slice(0, 3)}
      </span>
      <NumberInput value={amount} onCommit={onCommitAmount} placeholder="plan" tabIndex={planTabIndex} />
      <NumberInput
        value={actual}
        onCommit={onCommitActual}
        placeholder={t("workspace.actual").toLowerCase()}
        className="text-primary"
        tabIndex={actualTabIndex}
      />
    </div>
  );
}

function NumberInput({
  value,
  onCommit,
  placeholder,
  className = "",
  tabIndex,
}: {
  value: number | null;
  onCommit: (n: number) => void;
  placeholder?: string;
  className?: string;
  tabIndex?: number;
}) {
  const [text, setText] = useState(value === null ? "0" : String(value));
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focused) setText(value === null ? "0" : String(value));
  }, [value, focused]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commitIfChanged = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "" && value === null) return;
    const parsed = Number(trimmed.replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    if (parsed === (value ?? 0)) return;
    onCommit(parsed);
  };

  const scheduleSave = (raw: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      commitIfChanged(raw);
    }, 600);
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={text}
      tabIndex={tabIndex}
      onFocus={(e) => {
        setFocused(true);
        e.currentTarget.select();
      }}
      onChange={(e) => {
        setText(e.target.value);
        scheduleSave(e.target.value);
      }}
      onBlur={() => {
        setFocused(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        commitIfChanged(text);
      }}
      placeholder={placeholder ?? "0"}
      className={`h-6 w-full min-w-0 bg-transparent text-center font-mono text-xs outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
    />
  );
}

function TotalEditor({ total, onCommit }: { total: number; onCommit: (newTotal: number) => void }) {
  const [text, setText] = useState(String(total));
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focused) setText(String(total));
  }, [total, focused]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commitIfChanged = (raw: string) => {
    const parsed = Number(raw.trim().replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    if (parsed === total) return;
    onCommit(parsed);
  };

  const scheduleSave = (raw: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      commitIfChanged(raw);
    }, 600);
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        setText(e.target.value);
        scheduleSave(e.target.value);
      }}
      onBlur={() => {
        setFocused(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        commitIfChanged(text);
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
  isAdmin,
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
  draggingFolderId: string | null;
  setDraggingFolderId: (id: string | null) => void;
  dragOverItemId: string | null;
  setDragOverItemId: (id: string | null) => void;
  dragOverFolderId: string | null | "ROOT";
  setDragOverFolderId: (id: string | null | "ROOT") => void;
  onReorder: (ids: string[]) => void;
  onMoveItem: (id: string, folderId: string | null) => void;
  onMoveFolder: (id: string, parentId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onManageVisibility: (id: string) => void;
  onCreateItemInFolder: (folderId: string | null) => void;
  isAdmin: boolean;
}) {
  type FolderModal =
    | { type: "create"; parentId: string | null }
    | { type: "rename"; id: string; currentName: string }
    | { type: "delete"; id: string; name: string }
    | null;

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => openMap[id] !== false;
  const toggle = (id: string) => setOpenMap((p) => ({ ...p, [id]: !isOpen(id) }));

  const [folderModal, setFolderModal] = useState<FolderModal>(null);
  const [folderNameInput, setFolderNameInput] = useState("");
  const openFolderModal = (modal: NonNullable<FolderModal>) => {
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

  const isDescendantOf = (candidateId: string, ancestorId: string): boolean => {
    if (candidateId === ancestorId) return true;
    const kids = childrenByParent.get(ancestorId) ?? [];
    for (const k of kids) {
      if (isDescendantOf(candidateId, k.id)) return true;
    }
    return false;
  };

  const renderFolder = (folder: FolderRow, depth: number): ReactNode => {
    const open = isOpen(folder.id);
    const children = childrenByParent.get(folder.id) ?? [];
    const folderItems = itemsByFolder.get(folder.id) ?? [];
    const dragHover = dragOverFolderId === folder.id;
    const folderDropAllowed =
      !draggingFolderId || !isDescendantOf(folder.id, draggingFolderId);
    return (
      <li key={folder.id}>
        <div
          draggable
          onDragStart={(e) => {
            setDraggingFolderId(folder.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            setDraggingFolderId(null);
            setDragOverFolderId(null);
          }}
          onDragOver={(e) => {
            if (!draggingItemId && !draggingFolderId) return;
            if (draggingFolderId && !folderDropAllowed) return;
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
            else if (draggingFolderId && folderDropAllowed && draggingFolderId !== folder.id) {
              onMoveFolder(draggingFolderId, folder.id);
            }
            setDraggingItemId(null);
            setDraggingFolderId(null);
            setDragOverFolderId(null);
          }}
          className={`group flex items-center gap-1 border-b border-border py-1 pr-1 text-sm ${
            dragHover ? "bg-primary/10" : "bg-muted/30"
          } ${draggingFolderId === folder.id ? "opacity-40" : ""}`}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <button onClick={() => toggle(folder.id)} className="p-0.5 text-muted-foreground hover:text-foreground" aria-label="toggle">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span className="flex-1 truncate font-medium">{folder.name}</span>
          {folder.restricted ? (
            <Lock size={11} className="text-muted-foreground" aria-label="restricted" />
          ) : null}
          <button
            type="button"
            onClick={() => openFolderModal({ type: "create", parentId: folder.id })}
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
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onManageVisibility(folder.id)}
              className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
              title={t("workspace.folderVisibility")}
            >
              <Lock size={12} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => openFolderModal({ type: "rename", id: folder.id, currentName: folder.name })}
            className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            title={t("workspace.renameFolder")}
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => openFolderModal({ type: "delete", id: folder.id, name: folder.name })}
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
    <>
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-2 py-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("workspace.folders")}
        </span>
        <button
          type="button"
          onClick={() => openFolderModal({ type: "create", parentId: null })}
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
                if (!draggingItemId && !draggingFolderId) return;
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
                else if (draggingFolderId) onMoveFolder(draggingFolderId, null);
                setDraggingItemId(null);
                setDraggingFolderId(null);
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

      {/* Folder name dialog (create / rename) */}
      <Dialog
        open={folderModal?.type === "create" || folderModal?.type === "rename"}
        onOpenChange={closeFolderModal}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {folderModal?.type === "rename"
                ? t("workspace.renameFolder")
                : folderModal?.type === "create" && folderModal.parentId
                  ? t("workspace.addSubfolder")
                  : t("workspace.newFolder")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("workspace.newFolderPrompt")}
            </DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            type="text"
            value={folderNameInput}
            onChange={(e) => setFolderNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleFolderNameSubmit(); }}
            placeholder={t("workspace.newFolderPrompt")}
            className="input w-full"
          />
          <DialogFooter>
            <button
              type="button"
              onClick={closeFolderModal}
              className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleFolderNameSubmit}
              disabled={!folderNameInput.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {folderModal?.type === "rename" ? t("workspace.save") : t("common.create")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder delete confirmation */}
      <AlertDialog
        open={folderModal?.type === "delete"}
        onOpenChange={closeFolderModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.delete")} &ldquo;{folderModal?.type === "delete" ? folderModal.name : ""}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("workspace.confirmDeleteFolder")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeFolderModal}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (folderModal?.type === "delete") {
                  onDeleteFolder(folderModal.id);
                }
                closeFolderModal();
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FolderVisibilityDialog({
  tenantId,
  folderId,
  folderName,
  members,
  onClose,
  onSaved,
}: {
  tenantId: string;
  folderId: string;
  folderName: string;
  members: { id: string; displayName: string; email: string; role: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const getFn = useServerFn(getFolderVisibility);
  const setFn = useServerFn(setFolderVisibility);
  const visQ = useQuery({
    queryKey: ["folder-visibility", tenantId, folderId],
    queryFn: () => getFn({ data: { tenantId, folderId } }),
  });
  const [restricted, setRestricted] = useState(false);
  const [allowed, setAllowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visQ.data) {
      setRestricted(visQ.data.restricted);
      setAllowed(new Set(visQ.data.userIds));
    }
  }, [visQ.data]);

  const saveM = useMutation({
    mutationFn: () =>
      setFn({
        data: { tenantId, folderId, restricted, userIds: Array.from(allowed) },
      }),
    onSuccess: onSaved,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold">{t("workspace.folderVisibilityTitle")}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{folderName}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("workspace.folderVisibilityBody")}</p>

        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={restricted}
            onChange={(e) => setRestricted(e.target.checked)}
          />
          <span>{t("workspace.restrictAccess")}</span>
        </label>

        {restricted ? (
          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("workspace.allowedMembers")}
            </div>
            {visQ.isLoading ? (
              <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto rounded border border-border p-2">
                {members.map((m) => (
                  <li key={m.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        disabled={m.role === "admin"}
                        checked={m.role === "admin" || allowed.has(m.id)}
                        onChange={(e) => {
                          setAllowed((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(m.id);
                            else next.delete(m.id);
                            return next;
                          });
                        }}
                      />
                      <span className="flex-1 truncate">{m.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.role === "admin" ? t("members.admin") : ""}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={saveM.isPending || visQ.isLoading}
            onClick={() => saveM.mutate()}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saveM.isPending ? t("common.saving") : t("workspace.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
