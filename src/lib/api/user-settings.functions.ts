import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

const currencySchema = z.enum(["EUR", "USD", "GBP", "SEK", "NOK"]);

export const getMyPreferredCurrency = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("preferred_currency")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const parsed = currencySchema.safeParse(data?.preferred_currency);
    return { currency: parsed.success ? parsed.data : null };
  });

export const updateMyPreferredCurrency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ currency: currencySchema }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ preferred_currency: data.currency })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
