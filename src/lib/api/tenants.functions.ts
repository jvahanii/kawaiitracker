import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type TenantSummary = {
  id: string;
  name: string;
  joinCode: string;
  role: "admin" | "member";
};

export const listMyTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("list_my_tenants");
    if (error) throw new Error(error.message);
    return (data ?? []).map<TenantSummary>((r: { id: string; name: string; join_code: string; role: string }) => ({
      id: r.id,
      name: r.name,
      joinCode: r.join_code,
      role: r.role as "admin" | "member",
    }));
  });

export const createTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ name: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase.rpc("create_tenant", { p_name: data.name });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new Error("Failed to create tenant");
    return { id: row.id as string, joinCode: row.join_code as string };
  });

export const joinTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(4).max(16) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase.rpc("join_tenant_by_code", { p_code: data.code });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) return { ok: false as const, error: "No tenant found for that code" };
    return { ok: true as const, id: row.id as string, name: row.name as string };
  });

export const listTenantMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase.rpc("get_tenant_members", { p_tenant_id: data.tenantId });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: { id: string; display_name: string; email: string | null; role: string }) => ({
      id: r.id,
      displayName: r.display_name,
      email: r.email ?? "",
      role: r.role as "admin" | "member",
    }));
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["admin", "member"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("update_member_role", {
      p_tenant_id: data.tenantId,
      p_user_id: data.userId,
      p_role: data.role,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), userId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) throw new Error("You cannot remove yourself");
    const { error } = await context.supabase
      .from("tenant_members")
      .delete()
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
