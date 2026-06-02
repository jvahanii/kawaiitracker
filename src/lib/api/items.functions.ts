import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type ItemStatus = "todo" | "in_progress" | "done";

export type ItemRow = {
  id: string;
  title: string;
  status: ItemStatus;
  assigneeId: string | null;
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

    // Resolve assignee display names via a single profiles lookup
    const assigneeIds = Array.from(
      new Set(items.map((r) => r.assignee_id).filter((v): v is string => !!v)),
    );
    const nameById = new Map<string, string>();
    if (assigneeIds.length > 0) {
      const { data: profiles } = await context.supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", assigneeIds);
      for (const p of (profiles ?? []) as { id: string; display_name: string | null }[]) {
        nameById.set(p.id, p.display_name ?? "");
      }
    }

    return items.map<ItemRow>((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      assigneeId: r.assignee_id,
      assigneeName: r.assignee_id ? (nameById.get(r.assignee_id) ?? null) : null,
      notes: r.notes ?? "",
      amount: r.amount === null ? null : Number(r.amount),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
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
  assigneeId: z.string().uuid().nullable().optional(),
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
    if (data.assigneeId !== undefined) patch.assignee_id = data.assigneeId;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.amount !== undefined) patch.amount = data.amount;
    if (Object.keys(patch).length === 1) return { ok: true };
    const { error } = await context.supabase
      .from("items")
      .update(patch)
      .eq("id", data.id)
      .eq("tenant_id", data.tenantId);
    if (error) throw new Error(error.message);
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
