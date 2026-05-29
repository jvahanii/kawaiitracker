import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

import { query, queryOne } from "../db.server";
import { getSessionConfig, type SessionData } from "../auth.server";

async function requireUserId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function generateJoinCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export type TenantSummary = {
  id: string;
  name: string;
  joinCode: string;
  role: "admin" | "member";
};

export const listMyTenants = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const rows = await query<{ id: string; name: string; join_code: string; role: "admin" | "member" }>(
    `select t.id, t.name, t.join_code, m.role
       from tenants t
       join tenant_members m on m.tenant_id = t.id
      where m.user_id = $1
      order by t.created_at asc`,
    [userId],
  );
  return rows.map<TenantSummary>((r) => ({
    id: r.id,
    name: r.name,
    joinCode: r.join_code,
    role: r.role,
  }));
});

export const createTenant = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    // retry on rare join_code collisions
    for (let i = 0; i < 5; i++) {
      const code = generateJoinCode();
      try {
        const t = await queryOne<{ id: string }>(
          "insert into tenants (name, join_code) values ($1, $2) returning id",
          [data.name.trim(), code],
        );
        if (!t) throw new Error("Failed to create tenant");
        await query(
          "insert into tenant_members (tenant_id, user_id, role) values ($1, $2, 'admin')",
          [t.id, userId],
        );
        return { id: t.id, joinCode: code };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("join_code")) throw e;
      }
    }
    throw new Error("Could not allocate a join code, try again");
  });

export const joinTenant = createServerFn({ method: "POST" })
  .inputValidator(z.object({ code: z.string().min(4).max(16) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const code = data.code.toUpperCase().trim();
    const tenant = await queryOne<{ id: string; name: string }>(
      "select id, name from tenants where join_code = $1",
      [code],
    );
    if (!tenant) return { ok: false as const, error: "No tenant found for that code" };
    await query(
      `insert into tenant_members (tenant_id, user_id, role)
       values ($1, $2, 'member')
       on conflict (tenant_id, user_id) do nothing`,
      [tenant.id, userId],
    );
    return { ok: true as const, id: tenant.id, name: tenant.name };
  });

export const listTenantMembers = createServerFn({ method: "GET" })
  .inputValidator(z.object({ tenantId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const me = await queryOne<{ role: "admin" | "member" }>(
      "select role from tenant_members where tenant_id = $1 and user_id = $2",
      [data.tenantId, userId],
    );
    if (!me) throw new Error("Not a member of this tenant");
    const rows = await query<{ id: string; display_name: string; email: string; role: "admin" | "member" }>(
      `select u.id, u.display_name, u.email, m.role
         from tenant_members m
         join app_users u on u.id = m.user_id
        where m.tenant_id = $1
        order by u.display_name asc`,
      [data.tenantId],
    );
    return rows.map((r) => ({
      id: r.id,
      displayName: r.display_name,
      email: r.email,
      role: r.role,
    }));
  });
