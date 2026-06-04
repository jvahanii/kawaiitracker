import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type FolderRow = {
  id: string;
  parentId: string | null;
  name: string;
  sortOrder: number;
  restricted: boolean;
};

type RawFolder = {
  id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  restricted: boolean | null;
};

export const listFolders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("folders")
      .select("id, parent_id, name, sort_order, restricted")
      .eq("tenant_id", data.tenantId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map<FolderRow>((r: RawFolder) => ({
      id: r.id,
      parentId: r.parent_id,
      name: r.name,
      sortOrder: r.sort_order,
      restricted: r.restricted === true,
    }));
  });

export const createFolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        name: z.string().min(1).max(120),
        parentId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const parentId = data.parentId ?? null;
    let q = context.supabase
      .from("folders")
      .select("sort_order")
      .eq("tenant_id", data.tenantId)
      .order("sort_order", { ascending: false })
      .limit(1);
    q = parentId === null ? q.is("parent_id", null) : q.eq("parent_id", parentId);
    const { data: maxRow } = await q.maybeSingle();
    const nextOrder = ((maxRow as { sort_order?: number } | null)?.sort_order ?? -1) + 1;

    const { data: row, error } = await context.supabase
      .from("folders")
      .insert({
        tenant_id: data.tenantId,
        parent_id: parentId,
        name: data.name.trim(),
        created_by: context.userId,
        sort_order: nextOrder,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateFolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        id: z.string().uuid(),
        name: z.string().min(1).max(120).optional(),
        parentId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) patch.name = data.name.trim();
    if (data.parentId !== undefined) patch.parent_id = data.parentId;
    const { error } = await context.supabase
      .from("folders")
      .update(patch)
      .eq("id", data.id)
      .eq("tenant_id", data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    // Promote child folders to root, and detach items first (FK is set-null already for items)
    const { error: childErr } = await context.supabase
      .from("folders")
      .update({ parent_id: null })
      .eq("parent_id", data.id)
      .eq("tenant_id", data.tenantId);
    if (childErr) throw new Error(childErr.message);
    const { error } = await context.supabase
      .from("folders")
      .delete()
      .eq("id", data.id)
      .eq("tenant_id", data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
