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
}

async function requireItemInTenant(itemId: string, tenantId: string) {
  const r = await queryOne(
    "select 1 from items where id = $1 and tenant_id = $2",
    [itemId, tenantId],
  );
  if (!r) throw new Error("Item not found");
}

export type EntryRow = {
  id: string;
  itemId: string;
  month: string; // YYYY-MM-DD (first of month)
  amount: number;
};

// Normalize month input to first day of month (YYYY-MM-DD)
const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/)
  .transform((v) => `${v.slice(0, 7)}-01`);

export const listEntriesForItem = createServerFn({ method: "GET" })
  .inputValidator(z.object({ tenantId: z.string().uuid(), itemId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    await requireItemInTenant(data.itemId, data.tenantId);
    const rows = await query<{ id: string; item_id: string; month: string; amount: string }>(
      `select id, item_id, to_char(month, 'YYYY-MM-DD') as month, amount
         from item_entries
        where item_id = $1
        order by month desc`,
      [data.itemId],
    );
    return rows.map<EntryRow>((r) => ({
      id: r.id,
      itemId: r.item_id,
      month: r.month,
      amount: Number(r.amount),
    }));
  });

export const listAllEntries = createServerFn({ method: "GET" })
  .inputValidator(z.object({ tenantId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    const rows = await query<{ id: string; item_id: string; month: string; amount: string }>(
      `select e.id, e.item_id, to_char(e.month, 'YYYY-MM-DD') as month, e.amount
         from item_entries e
         join items i on i.id = e.item_id
        where i.tenant_id = $1
        order by e.month asc`,
      [data.tenantId],
    );
    return rows.map<EntryRow>((r) => ({
      id: r.id,
      itemId: r.item_id,
      month: r.month,
      amount: Number(r.amount),
    }));
  });

export const upsertEntry = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tenantId: z.string().uuid(),
      itemId: z.string().uuid(),
      month: monthSchema,
      amount: z.number().min(-1_000_000_000).max(1_000_000_000),
    }),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    await requireItemInTenant(data.itemId, data.tenantId);
    const row = await queryOne<{ id: string }>(
      `insert into item_entries (item_id, month, amount)
       values ($1, $2, $3)
       on conflict (item_id, month) do update set amount = excluded.amount, updated_at = now()
       returning id`,
      [data.itemId, data.month, data.amount],
    );
    return { id: row!.id };
  });

export const deleteEntry = createServerFn({ method: "POST" })
  .inputValidator(z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await requireMembership(userId, data.tenantId);
    await query(
      `delete from item_entries
        where id = $1
          and item_id in (select id from items where tenant_id = $2)`,
      [data.id, data.tenantId],
    );
    return { ok: true };
  });
