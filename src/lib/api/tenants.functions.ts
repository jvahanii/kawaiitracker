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
    const { data, error } = (await context.supabase.rpc("list_my_tenants")) as { data: { id: string; name: string; join_code: string; role: string }[] | null; error: { message: string } | null };
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
    const { data: rows, error } = (await context.supabase.rpc("create_tenant", { p_name: data.name })) as { data: { id: string; join_code: string }[] | { id: string; join_code: string } | null; error: { message: string } | null };
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new Error("Failed to create tenant");
    return { id: row.id, joinCode: row.join_code };
  });

export const joinTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(4).max(16) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = (await context.supabase.rpc("join_tenant_by_code", { p_code: data.code })) as { data: { id: string; name: string }[] | { id: string; name: string } | null; error: { message: string } | null };
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) return { ok: false as const, error: "No tenant found for that code" };
    return { ok: true as const, id: row.id, name: row.name };
  });

export const listTenantMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = (await context.supabase.rpc("get_tenant_members", { p_tenant_id: data.tenantId })) as { data: { id: string; display_name: string; email: string | null; role: string }[] | null; error: { message: string } | null };
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

export const addMemberByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        email: z.string().email().max(255),
        role: z.enum(["admin", "member"]).default("member"),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    // Verify caller is admin of this tenant (RLS-scoped)
    const { data: meRow, error: meErr } = await context.supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (meErr) throw new Error(meErr.message);
    if (!meRow || meRow.role !== "admin") {
      throw new Error("Only admins can add users.");
    }

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();
    const email = data.email.trim().toLowerCase();

    // Find existing user first; only invite if not found.
    let userId: string | null = null;
    let lookupErr: string | null = null;
    try {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listErr) lookupErr = listErr.message;
      const found = list?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === email,
      );
      if (found) userId = found.id;
    } catch (e) {
      lookupErr = e instanceof Error ? e.message : String(e);
    }

    if (!userId) {
      try {
        const { data: invited, error: inviteErr } =
          await admin.auth.admin.inviteUserByEmail(email);
        if (inviteErr) throw new Error(inviteErr.message);
        if (invited?.user) userId = invited.user.id;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(lookupErr ? `${msg} (${lookupErr})` : msg);
      }
    }

    if (!userId) throw new Error("Failed to resolve user");

    const { error: insErr } = await admin
      .from("tenant_members")
      .insert({ tenant_id: data.tenantId, user_id: userId, role: data.role });
    if (insErr && !/duplicate|unique/i.test(insErr.message)) {
      throw new Error(insErr.message);
    }

    return { ok: true as const, userId, alreadyMember: !!insErr };
  });
