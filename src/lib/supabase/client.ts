import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let initConfig: { url: string; publishableKey: string } | null = null;

/**
 * Initialize the browser Supabase client. Called once from the root component
 * with values fetched server-side (since VITE_* env names are reserved).
 * Safe to call multiple times with the same config.
 */
export function initSupabase(config: { url: string; publishableKey: string }): SupabaseClient {
  if (client && initConfig?.url === config.url) return client;
  initConfig = config;
  client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return client;
}

/** Get the initialised client. Throws if init hasn't run. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase client not initialised. Make sure the root loader has run.",
    );
  }
  return client;
}

/** Returns null if not yet initialised (use only when that is acceptable). */
export function tryGetSupabase(): SupabaseClient | null {
  return client;
}
