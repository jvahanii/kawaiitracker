import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type EntryRow = {
  id: string;
  itemId: string;
  month: string; // YYYY-MM-DD
  amount: number;
  actual: number;
};

const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/)
  .transform((v) => `${v.slice(0, 7)}-01`);

type RawEntry = {
  id: string;
  item_id: string;
  month: string;
  amount: number | string;
  actual_amount: number | string;
};

function mapEntry(r: RawEntry): EntryRow {
  return {
    id: r.id,
    itemId: r.item_id,
    month: r.month.slice(0, 10),
    amount: Number(r.amount),
    actual: Number(r.actual_amount),
  };
}

export const listEntriesForItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), itemId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("item_entries")
      .select("id, item_id, month, amount, actual_amount")
      .eq("item_id", data.itemId)
      .order("month", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows as RawEntry[]).map(mapEntry);
  });

export const listAllEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    // Filter via items join: select entries whose item belongs to tenant.
    const { data: items, error: itemsErr } = await context.supabase
      .from("items")
      .select("id")
      .eq("tenant_id", data.tenantId);
    if (itemsErr) throw new Error(itemsErr.message);
    const ids = (items ?? []).map((i) => i.id);
    if (ids.length === 0) return [];
    const { data: rows, error } = await context.supabase
      .from("item_entries")
      .select("id, item_id, month, amount, actual_amount")
      .in("item_id", ids)
      .order("month", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows as RawEntry[]).map(mapEntry);
  });

export const upsertEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        itemId: z.string().uuid(),
        month: monthSchema,
        amount: z.number().min(-1_000_000_000).max(1_000_000_000).optional(),
        actual: z.number().min(-1_000_000_000).max(1_000_000_000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    // Fetch existing then upsert preserving fields not provided
    const { data: existing } = await context.supabase
      .from("item_entries")
      .select("id, amount, actual_amount")
      .eq("item_id", data.itemId)
      .eq("month", data.month)
      .maybeSingle();

    const amount = data.amount !== undefined ? data.amount : Number(existing?.amount ?? 0);
    const actual = data.actual !== undefined ? data.actual : Number(existing?.actual_amount ?? 0);

    const { data: row, error } = await context.supabase
      .from("item_entries")
      .upsert(
        {
          item_id: data.itemId,
          month: data.month,
          amount,
          actual_amount: actual,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "item_id,month" },
      )
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid(), id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("item_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
