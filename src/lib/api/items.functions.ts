import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type ItemStatus = "todo" | "in_progress" | "done";

export type ItemAssignee = { id: string; name: string };

export type ItemRow = {
  id: string;
  title: string;
  status: ItemStatus;
  assignees: ItemAssignee[];
  /** @deprecated kept for compat; first assignee id (or null) */
  assigneeId: string | null;
  /** @deprecated kept for compat; comma-separated names */
  assigneeName: string | null;
  notes: string;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
};

type RawItem = {
  id: string;
  title: string;
  status: ItemStatus;
  assignee_id: string | null;
  notes: string;
  amount: number | string | null;
  created_at: string;
  updated_at: string;
};

export const listItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("items")
      .select("id, title, status, assignee_id, notes, amount, created_at, updated_at")
      .eq("tenant_id", data.tenantId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    const items = (rows ?? []) as RawItem[];

    // Fetch many-to-many assignees for these items
    const itemIds = items.map((r) => r.id);
    const assigneesByItem = new Map<string, string[]>();
    if (itemIds.length > 0) {
      const { data: rels, error: relErr } = await context.supabase
        .from("item_assignees")
        .select("item_id, user_id")
        .in("item_id", itemIds);
      if (!relErr) {
        for (const r of (rels ?? []) as { item_id: string; user_id: string }[]) {
          const list = assigneesByItem.get(r.item_id) ?? [];
          list.push(r.user_id);
          assigneesByItem.set(r.item_id, list);
        }
      }
      // If table doesn't exist yet, silently fall back to legacy assignee_id
    }

    // Resolve names from profiles
    const allUserIds = new Set<string>();
    for (const list of assigneesByItem.values()) for (const id of list) allUserIds.add(id);
    for (const r of items) if (r.assignee_id) allUserIds.add(r.assignee_id);
    const nameById = new Map<string, string>();
    if (allUserIds.size > 0) {
      const { data: profiles } = await context.supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", Array.from(allUserIds));
      for (const p of (profiles ?? []) as { id: string; display_name: string | null }[]) {
        nameById.set(p.id, p.display_name ?? "");
      }
    }

    return items.map<ItemRow>((r) => {
      const ids = assigneesByItem.get(r.id) ?? (r.assignee_id ? [r.assignee_id] : []);
      const assignees = ids.map<ItemAssignee>((id) => ({
        id,
        name: nameById.get(id) ?? "",
      }));
      return {
        id: r.id,
        title: r.title,
        status: r.status,
        assignees,
        assigneeId: assignees[0]?.id ?? null,
        assigneeName: assignees.length > 0 ? assignees.map((a) => a.name).join(", ") : null,
        notes: r.notes ?? "",
        amount: r.amount === null ? null : Number(r.amount),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });
  });

export const createItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), title: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("items")
      .insert({ tenant_id: data.tenantId, title: data.title.trim(), created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

const updateInput = z.object({
  tenantId: z.string().uuid(),
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  assigneeIds: z.array(z.string().uuid()).max(50).optional(),
  notes: z.string().max(20_000).optional(),
  amount: z.number().min(-1_000_000_000).max(1_000_000_000).nullable().optional(),
});

export const updateItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => updateInput.parse(d))
  .handler(async ({ context, data }) => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) patch.title = data.title.trim();
    if (data.status !== undefined) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.amount !== undefined) patch.amount = data.amount;

    // Always touch updated_at when something changes; skip if only that
    const onlyTimestamp = Object.keys(patch).length === 1 && data.assigneeIds === undefined;
    if (!onlyTimestamp) {
      // Mirror first assignee to legacy column for backwards compatibility
      if (data.assigneeIds !== undefined) {
        patch.assignee_id = data.assigneeIds[0] ?? null;
      }
      const { error } = await context.supabase
        .from("items")
        .update(patch)
        .eq("id", data.id)
        .eq("tenant_id", data.tenantId);
      if (error) throw new Error(error.message);
    }

    if (data.assigneeIds !== undefined) {
      // Replace the set of assignees
      const { error: delErr } = await context.supabase
        .from("item_assignees")
        .delete()
        .eq("item_id", data.id);
      if (delErr) throw new Error(delErr.message);
      if (data.assigneeIds.length > 0) {
        const rows = Array.from(new Set(data.assigneeIds)).map((uid) => ({
          item_id: data.id,
          user_id: uid,
        }));
        const { error: insErr } = await context.supabase
          .from("item_assignees")
          .insert(rows);
        if (insErr) throw new Error(insErr.message);
      }
    }

    return { ok: true };
  });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("items")
      .delete()
      .eq("id", data.id)
      .eq("tenant_id", data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
