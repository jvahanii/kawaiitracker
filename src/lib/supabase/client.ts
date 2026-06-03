import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let initConfig: { url: string; publishableKey: string } | null = null;

/** Public config injected by Lovable Cloud via VITE_* env vars. */
export function getEmbeddedSupabaseConfig(): { url: string; publishableKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (url && publishableKey) return { url, publishableKey };
  return null;
}

/**
 * Initialize the browser Supabase client. Uses VITE_* injected config by
 * default; an explicit config can be passed as fallback. Safe to call
 * repeatedly with the same config.
 */
export function initSupabase(config?: { url: string; publishableKey: string }): SupabaseClient {
  const resolved = config ?? getEmbeddedSupabaseConfig();
  if (!resolved) {
    throw new Error(
      "Supabase config unavailable. VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing.",
    );
  }
  if (client && initConfig?.url === resolved.url) return client;
  initConfig = resolved;
  client = createClient(resolved.url, resolved.publishableKey, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return client;
}

/** Get the initialised client. Lazy-inits from embedded config if needed. */
export function getSupabase(): SupabaseClient {
  if (!client) return initSupabase();
  return client;
}

/** Returns null if not yet initialised (use only when that is acceptable). */
export function tryGetSupabase(): SupabaseClient | null {
  return client;
}
