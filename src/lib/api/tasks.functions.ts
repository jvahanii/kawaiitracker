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
};

type RawTask = {
  id: string;
  item_id: string;
  user_id: string | null;
  title: string;
  done: boolean;
  created_at: string;
};

function map(r: RawTask): TaskRow {
  return {
    id: r.id,
    itemId: r.item_id,
    userId: r.user_id,
    title: r.title,
    done: r.done,
    createdAt: r.created_at,
  };
}

export const listTasksForItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), itemId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("item_tasks")
      .select("id, item_id, user_id, title, done, created_at")
      .eq("item_id", data.itemId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows as RawTask[]).map(map);
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        itemId: z.string().uuid(),
        userId: z.string().uuid().nullable().optional(),
        title: z.string().min(1).max(500),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("item_tasks")
      .insert({
        item_id: data.itemId,
        user_id: data.userId ?? null,
        title: data.title.trim(),
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
    const { error } = await context.supabase
      .from("item_tasks")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("item_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
