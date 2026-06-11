import "tslib";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let initConfig: { url: string; publishableKey: string } | null = null;
let bootstrapPromise: Promise<SupabaseClient> | null = null;

/** Public config injected by Lovable Cloud via VITE_* env vars (when present). */
export function getEmbeddedSupabaseConfig(): { url: string; publishableKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (url && publishableKey) return { url, publishableKey };
  return null;
}

/**
 * Initialize the browser Supabase client with an explicit config.
 * Safe to call repeatedly with the same config.
 */
export function initSupabase(config: { url: string; publishableKey: string }): SupabaseClient {
  if (client && initConfig?.url === config.url) return client;
  initConfig = config;
  client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
      // Disable automatic URL detection so the reset-password page can
      // exchange the PKCE recovery code itself without a race condition.
      detectSessionInUrl: false,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return client;
}

/**
 * Ensure the client is initialised. Uses VITE_* embedded config when available,
 * otherwise fetches the public config from a server function. Cached.
 */
export async function ensureSupabase(): Promise<SupabaseClient> {
  if (client) return client;
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const embedded = getEmbeddedSupabaseConfig();
    if (embedded) return initSupabase(embedded);
    // Prefer the stable public API route over a generated server-fn id —
    // resilient to stale-worker mismatches after a republish.
    try {
      const res = await fetch("/api/public/supabase-config", {
        headers: { accept: "application/json" },
      });
      if (res.ok) {
        const cfg = (await res.json()) as { url: string; publishableKey: string };
        if (cfg?.url && cfg?.publishableKey) return initSupabase(cfg);
      }
    } catch {
      // fall through to server fn
    }
    const { getSupabaseConfig } = await import("./config.functions");
    const cfg = await getSupabaseConfig();
    return initSupabase(cfg);
  })().catch((err) => {
    bootstrapPromise = null;
    throw err;
  });
  return bootstrapPromise;
}


/** Synchronous accessor — only safe after ensureSupabase() has resolved. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const embedded = getEmbeddedSupabaseConfig();
    if (embedded) return initSupabase(embedded);
    throw new Error(
      "Supabase client not initialised. Call ensureSupabase() first.",
    );
  }
  return client;
}

/** Returns null if not yet initialised (use only when that is acceptable). */
export function tryGetSupabase(): SupabaseClient | null {
  return client;
}
