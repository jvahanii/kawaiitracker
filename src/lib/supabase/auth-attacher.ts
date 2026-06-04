import { createMiddleware } from "@tanstack/react-start";
import { ensureSupabase, tryGetSupabase } from "./client";

/**
 * Client server-fn middleware: pulls the current Supabase session and attaches
 * the access token as a Bearer Authorization header so server fns protected by
 * requireSupabaseAuth can validate the user. Refreshes when the cached token
 * is expired or missing.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next, serverFnMeta }) => {
    if (typeof window === "undefined") return next();
    try {
      const functionId = serverFnMeta?.id ?? "";
      const decodedFunctionId = functionId ? atob(functionId).toLowerCase() : "";
      if (decodedFunctionId.includes("/supabase/config.functions.ts")) {
        return next();
      }

      const supabase = tryGetSupabase() ?? (await ensureSupabase());
      if (!supabase) return next();
      let { data } = await supabase.auth.getSession();
      let token = data.session?.access_token;
      const expiresAt = data.session?.expires_at ?? 0;
      const nowSec = Math.floor(Date.now() / 1000);
      if (!token || expiresAt - nowSec < 30) {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          token = refreshed.session?.access_token ?? token;
        } catch {
          // Keep any existing token; the server middleware will validate it.
        }
      }
      if (!token) return next();
      return next({ headers: { Authorization: `Bearer ${token}` } });
    } catch {
      return next();
    }
  },
);
