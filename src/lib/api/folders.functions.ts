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

const FOLDER_VISIBILITY_SCHEMA_MESSAGE =
  "Folder visibility is not available yet. Apply the latest database migration and try again.";

function isMissingFolderVisibilitySchemaError(error: { code?: string; message?: string } | null) {
  const message = error?.message ?? "";
  return (
    error?.code === "42703" ||
    error?.code === "42P01" ||
    message.includes("folders.restricted") ||
    message.includes("folder_visibility")
  );
}

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
    if (isMissingFolderVisibilitySchemaError(error)) {
      const { data: legacyRows, error: legacyError } = await context.supabase
        .from("folders")
        .select("id, parent_id, name, sort_order")
        .eq("tenant_id", data.tenantId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (legacyError) throw new Error(legacyError.message);
      return ((legacyRows ?? []) as Omit<RawFolder, "restricted">[]).map<FolderRow>((r) => ({
        id: r.id,
        parentId: r.parent_id,
        name: r.name,
        sortOrder: r.sort_order,
        restricted: false,
      }));
    }
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

export const getFolderVisibility = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), folderId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: f, error: fErr } = await context.supabase
      .from("folders")
      .select("restricted")
      .eq("id", data.folderId)
      .eq("tenant_id", data.tenantId)
      .maybeSingle();
    if (isMissingFolderVisibilitySchemaError(fErr)) {
      return { restricted: false, userIds: [] };
    }
    if (fErr) throw new Error(fErr.message);
    const { data: rows, error } = await context.supabase
      .from("folder_visibility")
      .select("user_id")
      .eq("folder_id", data.folderId);
    if (isMissingFolderVisibilitySchemaError(error)) {
      return { restricted: false, userIds: [] };
    }
    if (error) throw new Error(error.message);
    return {
      restricted: (f as { restricted?: boolean } | null)?.restricted === true,
      userIds: ((rows ?? []) as { user_id: string }[]).map((r) => r.user_id),
    };
  });

export const setFolderVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        folderId: z.string().uuid(),
        restricted: z.boolean(),
        userIds: z.array(z.string().uuid()).max(500),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error: upErr } = await context.supabase
      .from("folders")
      .update({ restricted: data.restricted, updated_at: new Date().toISOString() })
      .eq("id", data.folderId)
      .eq("tenant_id", data.tenantId);
    if (isMissingFolderVisibilitySchemaError(upErr)) {
      throw new Error(FOLDER_VISIBILITY_SCHEMA_MESSAGE);
    }
    if (upErr) throw new Error(upErr.message);

    const { error: delErr } = await context.supabase
      .from("folder_visibility")
      .delete()
      .eq("folder_id", data.folderId);
    if (isMissingFolderVisibilitySchemaError(delErr)) {
      throw new Error(FOLDER_VISIBILITY_SCHEMA_MESSAGE);
    }
    if (delErr) throw new Error(delErr.message);

    if (data.restricted && data.userIds.length > 0) {
      const rows = Array.from(new Set(data.userIds)).map((uid) => ({
        folder_id: data.folderId,
        user_id: uid,
      }));
      const { error: insErr } = await context.supabase
        .from("folder_visibility")
        .insert(rows);
      if (insErr) throw new Error(insErr.message);
    }
    return { ok: true };
  });
