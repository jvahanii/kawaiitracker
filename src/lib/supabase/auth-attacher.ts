import { createMiddleware } from "@tanstack/react-start";
import { tryGetSupabase } from "./client";

/**
 * Client server-fn middleware: pulls the current Supabase session and attaches
 * the access token as a Bearer Authorization header so server fns protected by
 * requireSupabaseAuth can validate the user.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const supabase = tryGetSupabase();
    if (!supabase) return next();
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return next();
      return next({ headers: { Authorization: `Bearer ${token}` } });
    } catch {
      return next();
    }
  },
);
