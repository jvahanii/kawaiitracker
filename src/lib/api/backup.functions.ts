import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export const BACKUP_FORMAT = "kawaii-tracker-workspace";
export const BACKUP_VERSION = 1 as const;

export type BackupFolder = {
  ref: string;
  parentRef: string | null;
  name: string;
  sortOrder: number;
};

export type BackupEntryMonth = {
  month: string;
  amount: number | null;
  actual: number | null;
};

export type BackupTask = {
  title: string;
  done: boolean;
  sortOrder: number;
};

export type BackupItem = {
  ref: string;
  folderRef: string | null;
  title: string;
  status: string;
  notes: string;
  amount: number | null;
  sortOrder: number;
  months: BackupEntryMonth[];
  tasks: BackupTask[];
};

export type BackupGoal = {
  year: number;
  amount: number | null;
  date: string | null;
};

export type WorkspaceBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  workspaceName: string;
  folders: BackupFolder[];
  items: BackupItem[];
  goals: BackupGoal[];
};

const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string().optional(),
  workspaceName: z.string().max(200).optional(),
  folders: z
    .array(
      z.object({
        ref: z.string().min(1).max(64),
        parentRef: z.string().min(1).max(64).nullable(),
        name: z.string().min(1).max(120),
        sortOrder: z.number().int(),
      }),
    )
    .max(2000),
  items: z
    .array(
      z.object({
        ref: z.string().min(1).max(64),
        folderRef: z.string().min(1).max(64).nullable(),
        title: z.string().max(500),
        status: z.enum(["todo", "in_progress", "done"]),
        notes: z.string().max(20000),
        amount: z.number().nullable(),
        sortOrder: z.number().int(),
        months: z
          .array(
            z.object({
              month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
              amount: z.number().nullable(),
              actual: z.number().nullable(),
            }),
          )
          .max(600),
        tasks: z
          .array(
            z.object({
              title: z.string().max(500),
              done: z.boolean(),
              sortOrder: z.number().int(),
            }),
          )
          .max(500),
      }),
    )
    .max(5000),
  goals: z
    .array(
      z.object({
        year: z.number().int().min(1900).max(3000),
        amount: z.number().nullable(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable(),
      }),
    )
    .max(200),
});

type Ctx = { supabase: { from: (t: string) => any; rpc: (n: string, a?: unknown) => any }; userId: string };

async function requireTenantAdmin(context: Ctx, tenantId: string) {
  const { data: meRow, error } = await context.supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", context.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (meRow?.role === "admin") return;
  const { data: isSuper } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser",
  });
  if (!isSuper) throw new Error("Only admins can export or import workspace data.");
}

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

export const exportWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<WorkspaceBackup> => {
    await requireTenantAdmin(context as unknown as Ctx, data.tenantId);
    const tenantId = data.tenantId;

    const { data: tenant } = await context.supabase
      .from("tenants")
      .select("name")
      .eq("id", tenantId)
      .maybeSingle();

    const { data: folderRows, error: fErr } = await context.supabase
      .from("folders")
      .select("id, parent_id, name, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order", { ascending: true });
    if (fErr) throw new Error(fErr.message);

    const { data: itemRows, error: iErr } = await context.supabase
      .from("items")
      .select("id, folder_id, title, status, notes, amount, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order", { ascending: true });
    if (iErr) throw new Error(iErr.message);

    const itemIds = (itemRows ?? []).map((r: { id: string }) => r.id);

    let entryRows: { item_id: string; month: string; amount: unknown; actual_amount: unknown }[] = [];
    let taskRows: { item_id: string; title: string; done: boolean; sort_order: number }[] = [];
    if (itemIds.length > 0) {
      const { data: er, error: eErr } = await context.supabase
        .from("item_entries")
        .select("item_id, month, amount, actual_amount")
        .in("item_id", itemIds)
        .order("month", { ascending: true });
      if (eErr) throw new Error(eErr.message);
      entryRows = er ?? [];
      const { data: tr, error: tErr } = await context.supabase
        .from("item_tasks")
        .select("item_id, title, done, sort_order")
        .in("item_id", itemIds)
        .order("sort_order", { ascending: true });
      if (tErr) throw new Error(tErr.message);
      taskRows = tr ?? [];
    }

    const { data: goalRows, error: gErr } = await context.supabase
      .from("savings_goals")
      .select("year, amount, goal_date")
      .eq("tenant_id", tenantId)
      .order("year", { ascending: true });
    if (gErr) throw new Error(gErr.message);

    const folderRefById = new Map<string, string>();
    (folderRows ?? []).forEach((f: { id: string }, idx: number) =>
      folderRefById.set(f.id, `f${idx + 1}`),
    );

    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      workspaceName: (tenant?.name as string) ?? "",
      folders: (folderRows ?? []).map(
        (f: { id: string; parent_id: string | null; name: string; sort_order: number }) => ({
          ref: folderRefById.get(f.id)!,
          parentRef: f.parent_id ? (folderRefById.get(f.parent_id) ?? null) : null,
          name: f.name,
          sortOrder: f.sort_order ?? 0,
        }),
      ),
      items: (itemRows ?? []).map(
        (
          it: {
            id: string;
            folder_id: string | null;
            title: string;
            status: string;
            notes: string | null;
            amount: unknown;
            sort_order: number;
          },
          idx: number,
        ) => ({
          ref: `i${idx + 1}`,
          folderRef: it.folder_id ? (folderRefById.get(it.folder_id) ?? null) : null,
          title: it.title ?? "",
          status: it.status ?? "todo",
          notes: it.notes ?? "",
          amount: num(it.amount),
          sortOrder: it.sort_order ?? 0,
          months: entryRows
            .filter((e) => e.item_id === it.id)
            .map((e) => ({
              month: String(e.month).slice(0, 10),
              amount: num(e.amount),
              actual: num(e.actual_amount),
            })),
          tasks: taskRows
            .filter((tk) => tk.item_id === it.id)
            .map((tk) => ({
              title: tk.title ?? "",
              done: Boolean(tk.done),
              sortOrder: tk.sort_order ?? 0,
            })),
        }),
      ),
      goals: (goalRows ?? []).map(
        (g: { year: number; amount: unknown; goal_date: string | null }) => ({
          year: g.year,
          amount: num(g.amount),
          date: g.goal_date ?? null,
        }),
      ),
    };
  });

export const importWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        mode: z.enum(["replace", "append"]),
        payload: backupSchema,
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireTenantAdmin(context as unknown as Ctx, data.tenantId);
    const tenantId = data.tenantId;
    const sb = context.supabase;
    const payload = data.payload;

    if (data.mode === "replace") {
      const { data: oldItems } = await sb.from("items").select("id").eq("tenant_id", tenantId);
      const oldIds = (oldItems ?? []).map((r: { id: string }) => r.id);
      if (oldIds.length > 0) {
        await sb.from("item_tasks").delete().in("item_id", oldIds);
        await sb.from("item_entries").delete().in("item_id", oldIds);
        await sb.from("item_assignees").delete().in("item_id", oldIds);
        const { error } = await sb.from("items").delete().eq("tenant_id", tenantId);
        if (error) throw new Error(error.message);
      }
      const { error: fdErr } = await sb.from("folders").delete().eq("tenant_id", tenantId);
      if (fdErr) throw new Error(fdErr.message);
      await sb.from("savings_goals").delete().eq("tenant_id", tenantId);
    }

    // Insert folders parent-first.
    const idByRef = new Map<string, string>();
    const byRef = new Map(payload.folders.map((f) => [f.ref, f]));
    const pending = [...payload.folders];
    let guard = pending.length + 1;
    while (pending.length > 0 && guard-- > 0) {
      const ready = pending.filter(
        (f) => f.parentRef === null || !byRef.has(f.parentRef) || idByRef.has(f.parentRef),
      );
      if (ready.length === 0) break;
      for (const f of ready) {
        const { data: row, error } = await sb
          .from("folders")
          .insert({
            tenant_id: tenantId,
            parent_id: f.parentRef ? (idByRef.get(f.parentRef) ?? null) : null,
            name: f.name,
            sort_order: f.sortOrder,
            created_by: context.userId,
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        idByRef.set(f.ref, row.id as string);
      }
      const readySet = new Set(ready.map((f) => f.ref));
      for (let i = pending.length - 1; i >= 0; i--) {
        if (readySet.has(pending[i].ref)) pending.splice(i, 1);
      }
    }

    let itemCount = 0;
    let monthCount = 0;
    let taskCount = 0;

    for (const it of payload.items) {
      const { data: row, error } = await sb
        .from("items")
        .insert({
          tenant_id: tenantId,
          folder_id: it.folderRef ? (idByRef.get(it.folderRef) ?? null) : null,
          title: it.title,
          status: it.status,
          notes: it.notes,
          amount: it.amount,
          sort_order: it.sortOrder,
          created_by: context.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      const itemId = row.id as string;
      itemCount++;

      if (it.months.length > 0) {
        const { error: eErr } = await sb.from("item_entries").insert(
          it.months.map((m) => ({
            item_id: itemId,
            month: `${m.month.slice(0, 7)}-01`,
            amount: m.amount,
            actual_amount: m.actual,
          })),
        );
        if (eErr) throw new Error(eErr.message);
        monthCount += it.months.length;
      }
      if (it.tasks.length > 0) {
        const { error: tErr } = await sb.from("item_tasks").insert(
          it.tasks.map((tk) => ({
            item_id: itemId,
            title: tk.title,
            done: tk.done,
            sort_order: tk.sortOrder,
          })),
        );
        if (tErr) throw new Error(tErr.message);
        taskCount += it.tasks.length;
      }
    }

    for (const g of payload.goals) {
      const { error } = await sb.from("savings_goals").upsert(
        {
          tenant_id: tenantId,
          year: g.year,
          amount: g.amount,
          goal_date: g.date,
          updated_at: new Date().toISOString(),
          updated_by: context.userId,
        },
        { onConflict: "tenant_id,year" },
      );
      if (error) throw new Error(error.message);
    }

    return {
      folders: idByRef.size,
      items: itemCount,
      months: monthCount,
      tasks: taskCount,
    };
  });
