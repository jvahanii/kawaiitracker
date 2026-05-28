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

async function requireMembership(userId: string, tenantId: string) {
  const m = await queryOne<{ role: "admin" | "member" }>(
    "select role from tenant_members where tenant_id = $1 and user_id = $2",
    [tenantId, userId],
  );
  if (!m) throw new Error("Not a member of this tenant");
  return m.role;
}

export type ItemStatus = "todo" | "in_progress" | "done";

export type ItemRow = {
  id: string;
  title: string;
  status: ItemStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export const listItems = createServerFn({ method: "GET" })
  .inputValidator(z.object({ tenantId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    const rows = await query<{
      id: string;
      title: string;
      status: ItemStatus;
      assignee_id: string | null;
      assignee_name: string | null;
      notes: string;
      created_at: string;
      updated_at: string;
    }>(
      `select i.id, i.title, i.status, i.assignee_id, u.display_name as assignee_name,
              i.notes, i.created_at, i.updated_at
         from items i
         left join app_users u on u.id = i.assignee_id
        where i.tenant_id = $1
        order by i.updated_at desc`,
      [data.tenantId],
    );
    return rows.map<ItemRow>((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      assigneeId: r.assignee_id,
      assigneeName: r.assignee_name,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  });

export const createItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ tenantId: z.string().uuid(), title: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    const row = await queryOne<{ id: string }>(
      `insert into items (tenant_id, title, created_by)
       values ($1, $2, $3)
       returning id`,
      [data.tenantId, data.title.trim(), userId],
    );
    if (!row) throw new Error("Failed to create item");
    return { id: row.id };
  });

const updateInput = z.object({
  tenantId: z.string().uuid(),
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  notes: z.string().max(20_000).optional(),
});

export const updateItem = createServerFn({ method: "POST" })
  .inputValidator(updateInput)
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    if (data.assigneeId) {
      const ok = await queryOne(
        "select 1 from tenant_members where tenant_id = $1 and user_id = $2",
        [data.tenantId, data.assigneeId],
      );
      if (!ok) throw new Error("Assignee is not a tenant member");
    }
    const sets: string[] = [];
    const params: unknown[] = [];
    let p = 1;
    if (data.title !== undefined) { sets.push(`title = $${p++}`); params.push(data.title.trim()); }
    if (data.status !== undefined) { sets.push(`status = $${p++}`); params.push(data.status); }
    if (data.assigneeId !== undefined) { sets.push(`assignee_id = $${p++}`); params.push(data.assigneeId); }
    if (data.notes !== undefined) { sets.push(`notes = $${p++}`); params.push(data.notes); }
    if (sets.length === 0) return { ok: true };
    sets.push(`updated_at = now()`);
    params.push(data.id, data.tenantId);
    await query(
      `update items set ${sets.join(", ")} where id = $${p++} and tenant_id = $${p}`,
      params,
    );
    return { ok: true };
  });

export const deleteItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    await query("delete from items where id = $1 and tenant_id = $2", [data.id, data.tenantId]);
    return { ok: true };
  });
