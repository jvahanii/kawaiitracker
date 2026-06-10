import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type TenantSummary = {
  id: string;
  name: string;
  joinCode: string;
  role: "admin" | "member" | "superuser";
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
      role: r.role as "admin" | "member" | "superuser",
    }));
  });

export const getLastTenantId = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("last_tenant_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const lastId = (data?.last_tenant_id as string | null) ?? null;
    if (!lastId) return { id: null as string | null };
    // Verify user is still a member of that tenant.
    const { data: member, error: mErr } = await context.supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("tenant_id", lastId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (mErr) throw new Error(mErr.message);
    return { id: member ? lastId : null };
  });

export const setLastTenantId = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ last_tenant_id: data.tenantId })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
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
    // Defense-in-depth checks (RPC enforces the same rules):
    // 1) Admins cannot modify another admin's role.
    // 2) Last admin cannot demote themselves.
    const { data: target, error: targetErr } = await context.supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (targetErr) throw new Error(targetErr.message);
    if (!target) throw new Error("User is not a member of this workspace");

    if (target.role === "admin" && data.userId !== context.userId) {
      throw new Error("You cannot change another admin's role");
    }

    if (data.role === "member" && data.userId === context.userId) {
      const { count, error: cntErr } = await context.supabase
        .from("tenant_members")
        .select("user_id", { count: "exact", head: true })
        .eq("tenant_id", data.tenantId)
        .eq("role", "admin");
      if (cntErr) throw new Error(cntErr.message);
      if ((count ?? 0) <= 1) throw new Error("Cannot remove the last admin");
    }

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

export const updateMemberName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        userId: z.string().uuid(),
        displayName: z.string().trim().min(1).max(80),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: meRow, error: meErr } = await context.supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (meErr) throw new Error(meErr.message);
    if (!meRow || meRow.role !== "admin") {
      throw new Error("Only admins can edit names.");
    }
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("profiles")
      .update({ display_name: data.displayName })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateMemberEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        userId: z.string().uuid(),
        email: z.string().trim().toLowerCase().email().max(255),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: meRow, error: meErr } = await context.supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (meErr) throw new Error(meErr.message);
    if (!meRow || meRow.role !== "admin") {
      throw new Error("Only admins can edit emails.");
    }

    const { data: target, error: tErr } = await context.supabase
      .from("tenant_members")
      .select("user_id")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!target) throw new Error("User is not a member of this workspace");

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();
    const { error: authErr } = await admin.auth.admin.updateUserById(data.userId, {
      email: data.email,
      email_confirm: true,
    });
    if (authErr) {
      const msg = /already|registered|exists|duplicate/i.test(authErr.message)
        ? "That email is already in use."
        : authErr.message;
      throw new Error(msg);
    }
    const { error: profErr } = await admin
      .from("profiles")
      .update({ email: data.email })
      .eq("id", data.userId);
    if (profErr) throw new Error(profErr.message);
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
        redirectTo: z.string().url().max(500).optional(),
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

    // Find existing user first; only invite if not found. Prefer profiles,
    // then paginate Auth users so accounts beyond the first 1000 are found too.
    let userId: string | null = null;
    let lookupErr: string | null = null;
    try {
      const { data: profile, error: profileErr } = await admin
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      if (profileErr) lookupErr = profileErr.message;
      if (profile?.id) userId = profile.id as string;
    } catch (e) {
      lookupErr = e instanceof Error ? e.message : String(e);
    }

    let resolvedEmail: string | null = null;
    for (let page = 1; !userId && page <= 50; page += 1) {
      try {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        if (listErr) {
          lookupErr = listErr.message;
          break;
        }
        const users = list?.users ?? [];
        const found = users.find((u) => (u.email ?? "").toLowerCase() === email);
        if (found) {
          userId = found.id;
          resolvedEmail = found.email ?? email;
          break;
        }
        if (users.length < 1000) break;
      } catch (e) {
        lookupErr = e instanceof Error ? e.message : String(e);
        break;
      }
    }

    const wasExisting = !!userId;

    if (!userId) {
      try {
        const { data: invited, error: inviteErr } =
          await admin.auth.admin.inviteUserByEmail(email, {
            redirectTo: data.redirectTo,
          });
        if (inviteErr) throw new Error(inviteErr.message);
        if (invited?.user) {
          userId = invited.user.id;
          resolvedEmail = invited.user.email ?? email;
        }
      } catch (e) {
        const inviteMsg = e instanceof Error ? e.message : String(e);
        const password = `${crypto.randomUUID()}-${crypto.randomUUID()}aA1!`;
        const { data: created, error: createErr } =
          await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { display_name: email.split("@")[0] || email },
          });
        if (createErr) {
          return {
            ok: false as const,
            error: lookupErr
              ? `${createErr.message} (${lookupErr}; ${inviteMsg})`
              : `${createErr.message} (${inviteMsg})`,
          };
        }
        if (created?.user) {
          userId = created.user.id;
          resolvedEmail = created.user.email ?? email;
          // createUser doesn't send mail — send a password-recovery email so
          // the user can set their own password via /reset-password.
          if (data.redirectTo) {
            await context.supabase.auth.resetPasswordForEmail(email, {
              redirectTo: data.redirectTo,
            });
          }
        }
      }
    }

    if (!userId) {
      return { ok: false as const, error: "Failed to resolve user" };
    }

    await admin.from("profiles").upsert(
      {
        id: userId,
        display_name: (resolvedEmail ?? email).split("@")[0] || resolvedEmail || email,
        email: resolvedEmail ?? email,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );

    const { error: insErr } = await admin
      .from("tenant_members")
      .insert({ tenant_id: data.tenantId, user_id: userId, role: data.role });
    if (insErr && !/duplicate|unique/i.test(insErr.message)) {
      throw new Error(insErr.message);
    }

    // For users who already had an account, also send a recovery email so they
    // get a link to set/refresh their password and land on /reset-password.
    if (wasExisting && data.redirectTo) {
      await context.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: data.redirectTo,
      });
    }

    return { ok: true as const, userId, alreadyMember: !!insErr };
  });

export const setMemberPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        userId: z.string().uuid(),
        password: z.string().min(8).max(72),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: meRow, error: meErr } = await context.supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (meErr) throw new Error(meErr.message);
    if (!meRow || meRow.role !== "admin") {
      throw new Error("Only admins can change passwords.");
    }
    const { data: targetRow, error: targetErr } = await context.supabase
      .from("tenant_members")
      .select("user_id")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (targetErr) throw new Error(targetErr.message);
    if (!targetRow) throw new Error("User is not a member of this workspace.");

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();
    const { error } = await admin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
