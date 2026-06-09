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
