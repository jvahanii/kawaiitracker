import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type GoalRow = {
  amount: number | null;
  date: string | null;
};

export const getGoal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ tenantId: z.string().uuid(), year: z.number().int().min(1900).max(3000) }).parse(d),
  )
  .handler(async ({ context, data }): Promise<GoalRow> => {
    const { data: row, error } = await context.supabase
      .from("savings_goals")
      .select("amount, goal_date")
      .eq("tenant_id", data.tenantId)
      .eq("year", data.year)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { amount: null, date: null };
    return {
      amount: row.amount != null ? Number(row.amount) : null,
      date: row.goal_date ?? null,
    };
  });

export const upsertGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        year: z.number().int().min(1900).max(3000),
        amount: z.number().min(-1_000_000_000).max(1_000_000_000).nullable(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<GoalRow> => {
    const { data: row, error } = await context.supabase
      .from("savings_goals")
      .upsert(
        {
          tenant_id: data.tenantId,
          year: data.year,
          amount: data.amount,
          goal_date: data.date,
          updated_at: new Date().toISOString(),
          updated_by: context.userId,
        },
        { onConflict: "tenant_id,year" },
      )
      .select("amount, goal_date")
      .single();
    if (error) throw new Error(error.message);
    return {
      amount: row.amount != null ? Number(row.amount) : null,
      date: row.goal_date ?? null,
    };
  });
