import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type SuperuserRow = {
  userId: string;
  displayName: string;
  email: string;
  createdAt: string;
};

export const isSuperuser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (error) throw new Error(error.message);
    return { is: !!data };
  });

export const listSuperusers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = (await context.supabase.rpc("list_superusers")) as {
      data: { user_id: string; display_name: string; email: string | null; created_at: string }[] | null;
      error: { message: string } | null;
    };
    if (error) throw new Error(error.message);
    return (data ?? []).map<SuperuserRow>((r) => ({
      userId: r.user_id,
      displayName: r.display_name,
      email: r.email ?? "",
      createdAt: r.created_at,
    }));
  });

export type WorkspaceUserRow = {
  userId: string;
  displayName: string;
  email: string;
  isSuperuser: boolean;
  tenants: { id: string; name: string; role: string }[];
};

export const listAllWorkspaceUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = (await context.supabase.rpc(
      "list_all_workspace_users",
    )) as {
      data:
        | {
            user_id: string;
            display_name: string | null;
            email: string | null;
            is_superuser: boolean;
            tenants: { id: string; name: string; role: string }[] | null;
          }[]
        | null;
      error: { message: string } | null;
    };
    if (error) throw new Error(error.message);
    return (data ?? []).map<WorkspaceUserRow>((r) => ({
      userId: r.user_id,
      displayName: r.display_name ?? "",
      email: r.email ?? "",
      isSuperuser: !!r.is_superuser,
      tenants: r.tenants ?? [],
    }));
  });

export const grantSuperuserById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("grant_superuser", {
      p_user_id: data.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const revokeSuperuser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("revoke_superuser", {
      p_user_id: data.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const grantSuperuserByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ email: z.string().email().max(255) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    // Must already be a superuser to call this (the RPC also enforces it).
    const { data: amSuper, error: roleErr } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (roleErr) throw new Error(roleErr.message);
    if (!amSuper) throw new Error("Only superusers can grant superuser");

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();
    const email = data.email.trim().toLowerCase();

    let userId: string | null = null;
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    if (profile?.id) userId = profile.id as string;

    if (!userId) {
      for (let page = 1; !userId && page <= 50; page += 1) {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        if (listErr) break;
        const users = list?.users ?? [];
        const found = users.find((u) => (u.email ?? "").toLowerCase() === email);
        if (found) {
          userId = found.id;
          break;
        }
        if (users.length < 1000) break;
      }
    }

    if (!userId) {
      return { ok: false as const, error: "No user found for that email" };
    }

    const { error } = await context.supabase.rpc("grant_superuser", {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, userId };
  });

export const superuserUpdateMemberRole = createServerFn({ method: "POST" })
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
    const { data: amSuper, error: roleErr } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (roleErr) throw new Error(roleErr.message);
    if (!amSuper) throw new Error("Only superusers can perform this action");

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();

    const { data: target, error: tErr } = await admin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!target) throw new Error("User is not a member of this workspace");

    if (target.role === "admin" && data.role === "member") {
      const { count, error: cErr } = await admin
        .from("tenant_members")
        .select("user_id", { count: "exact", head: true })
        .eq("tenant_id", data.tenantId)
        .eq("role", "admin");
      if (cErr) throw new Error(cErr.message);
      if ((count ?? 0) <= 1) throw new Error("Cannot demote the last admin");
    }

    const { error } = await admin
      .from("tenant_members")
      .update({ role: data.role })
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const superuserRemoveMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), userId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) {
      throw new Error("Use the workspace member controls to remove yourself");
    }
    const { data: amSuper, error: roleErr } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (roleErr) throw new Error(roleErr.message);
    if (!amSuper) throw new Error("Only superusers can perform this action");

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();

    const { data: target, error: tErr } = await admin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!target) return { ok: true as const };

    if (target.role === "admin") {
      const { count, error: cErr } = await admin
        .from("tenant_members")
        .select("user_id", { count: "exact", head: true })
        .eq("tenant_id", data.tenantId)
        .eq("role", "admin");
      if (cErr) throw new Error(cErr.message);
      if ((count ?? 0) <= 1) throw new Error("Cannot remove the last admin");
    }

    const { error } = await admin
      .from("tenant_members")
      .delete()
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const superuserUpdateUserEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        userId: z.string().uuid(),
        email: z.string().trim().toLowerCase().email().max(255),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: amSuper, error: roleErr } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (roleErr) throw new Error(roleErr.message);
    if (!amSuper) throw new Error("Only superusers can perform this action");

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

export const superuserDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) {
      throw new Error("You cannot delete your own account here.");
    }
    const { data: amSuper, error: roleErr } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (roleErr) throw new Error(roleErr.message);
    if (!amSuper) throw new Error("Only superusers can perform this action");

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const admin = getSupabaseAdmin();

    const { data: targetIsSuper, error: tErr } = (await context.supabase.rpc("has_role", {
      _user_id: data.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (tErr) throw new Error(tErr.message);
    if (targetIsSuper) {
      const { count, error: cErr } = await admin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "superuser");
      if (cErr) throw new Error(cErr.message);
      if ((count ?? 0) <= 1) throw new Error("Cannot delete the last superuser");
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(data.userId);
    if (delErr) throw new Error(delErr.message);
    return { ok: true as const };
  });

export const requestPaidPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid().optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("paid_plan_requests")
      .insert({ user_id: context.userId, tenant_id: data.tenantId ?? null });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export type PaidPlanRequestRow = {
  userId: string;
  requestedAt: string;
};

export const listPaidPlanRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: amSuper, error: roleErr } = (await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser",
    })) as { data: boolean | null; error: { message: string } | null };
    if (roleErr) throw new Error(roleErr.message);
    if (!amSuper) throw new Error("Only superusers can view paid plan requests");

    const { data, error } = await context.supabase
      .from("paid_plan_requests")
      .select("user_id, requested_at")
      .order("requested_at", { ascending: false });
    if (error) throw new Error(error.message);

    // Latest per user
    const latest = new Map<string, string>();
    for (const row of (data ?? []) as { user_id: string; requested_at: string }[]) {
      if (!latest.has(row.user_id)) latest.set(row.user_id, row.requested_at);
    }
    return Array.from(latest.entries()).map<PaidPlanRequestRow>(([userId, requestedAt]) => ({
      userId,
      requestedAt,
    }));
  });


