import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
let client = null;
let initConfig = null;
let bootstrapPromise = null;
function initSupabase(config) {
  if (client && initConfig?.url === config.url) return client;
  initConfig = config;
  client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
      // Disable automatic URL detection so the reset-password page can
      // exchange the PKCE recovery code itself without a race condition.
      detectSessionInUrl: false,
      storage: typeof window !== "undefined" ? window.localStorage : void 0
    }
  });
  return client;
}
async function ensureSupabase() {
  if (client) return client;
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    try {
      const res = await fetch("/api/public/supabase-config", {
        headers: { accept: "application/json" }
      });
      if (res.ok) {
        const cfg2 = await res.json();
        if (cfg2?.url && cfg2?.publishableKey) return initSupabase(cfg2);
      }
    } catch {
    }
    const { getSupabaseConfig } = await import("./config.functions-CBO1meU8.mjs");
    const cfg = await getSupabaseConfig();
    return initSupabase(cfg);
  })().catch((err) => {
    bootstrapPromise = null;
    throw err;
  });
  return bootstrapPromise;
}
function tryGetSupabase() {
  return client;
}
export {
  ensureSupabase as e,
  tryGetSupabase as t
};
