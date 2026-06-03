import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare const __SUPABASE_URL__: string;
declare const __SUPABASE_PUBLISHABLE_KEY__: string;

let client: SupabaseClient | null = null;
let initConfig: { url: string; publishableKey: string } | null = null;

/** Build-time injected public config (see vite.config.ts). */
export function getEmbeddedSupabaseConfig(): { url: string; publishableKey: string } | null {
  try {
    const url = typeof __SUPABASE_URL__ === "string" ? __SUPABASE_URL__ : "";
    const publishableKey =
      typeof __SUPABASE_PUBLISHABLE_KEY__ === "string" ? __SUPABASE_PUBLISHABLE_KEY__ : "";
    if (url && publishableKey) return { url, publishableKey };
  } catch {
    // ignore
  }
  return null;
}

/**
 * Initialize the browser Supabase client. Uses the build-time embedded config
 * by default; an explicit config can be passed (e.g. from a server-fn) as a
 * fallback. Safe to call multiple times with the same config.
 */
export function initSupabase(config?: { url: string; publishableKey: string }): SupabaseClient {
  const resolved = config ?? getEmbeddedSupabaseConfig();
  if (!resolved) {
    throw new Error(
      "Supabase config unavailable. Build-time env EXT_SUPABASE_URL / EXT_SUPABASE_PUBLISHABLE_KEY missing.",
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

/** Get the initialised client. Throws if init hasn't run. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    // Lazy init from embedded config if caller forgot to bootstrap.
    return initSupabase();
  }
  return client;
}

/** Returns null if not yet initialised (use only when that is acceptable). */
export function tryGetSupabase(): SupabaseClient | null {
  return client;
}
