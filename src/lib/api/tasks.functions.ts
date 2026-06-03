import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type TaskRow = {
  id: string;
  itemId: string;
  userId: string | null;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export const listTasksForItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), itemId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("item_tasks")
      .select("id, item_id, user_id, title, done, created_at, updated_at")
      .eq("item_id", data.itemId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id as string,
      itemId: r.item_id as string,
      userId: (r.user_id as string | null) ?? null,
      title: r.title as string,
      done: Boolean(r.done),
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    })) as TaskRow[];
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        itemId: z.string().uuid(),
        title: z.string().min(1).max(500),
        userId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: maxRow } = await context.supabase
      .from("item_tasks")
      .select("sort_order")
      .eq("item_id", data.itemId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = ((maxRow as { sort_order?: number } | null)?.sort_order ?? -1) + 1;
    const { data: row, error } = await context.supabase
      .from("item_tasks")
      .insert({
        item_id: data.itemId,
        title: data.title.trim(),
        user_id: data.userId ?? null,
        sort_order: nextOrder,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        done: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) patch.title = data.title.trim();
    if (data.done !== undefined) patch.done = data.done;
    const { error } = await context.supabase.from("item_tasks").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("item_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        itemId: z.string().uuid(),
        orderedIds: z.array(z.string().uuid()).max(500),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const results = await Promise.all(
      data.orderedIds.map((id, i) =>
        context.supabase
          .from("item_tasks")
          .update({ sort_order: i })
          .eq("id", id)
          .eq("item_id", data.itemId),
      ),
    );
    for (const { error } of results) {
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
