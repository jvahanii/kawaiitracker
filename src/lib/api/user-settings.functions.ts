import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

const CurrencySchema = z.enum(["EUR", "USD", "GBP", "SEK", "NOK"]);
export type PreferredCurrency = z.infer<typeof CurrencySchema>;

export const getMyPreferredCurrency = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("preferred_currency")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const value = (data?.preferred_currency as string | null) ?? "EUR";
    const parsed = CurrencySchema.safeParse(value);
    return { currency: parsed.success ? parsed.data : ("EUR" as PreferredCurrency) };
  });

export const updateMyPreferredCurrency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ currency: CurrencySchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ preferred_currency: data.currency })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const, currency: data.currency };
  });
