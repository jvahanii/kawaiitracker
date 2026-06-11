import { a as createMiddleware, g as getRequestHeader } from "./server-dMKqlv5F.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env.EXT_SUPABASE_URL;
    const publishableKey = process.env.EXT_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey) {
      throw new Error("Supabase server env missing (EXT_SUPABASE_URL / EXT_SUPABASE_PUBLISHABLE_KEY).");
    }
    const authHeader = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      throw new Error("Unauthorized");
    }
    const token = authHeader.slice(7).trim();
    if (!token) throw new Error("Unauthorized");
    const supabase = createClient(url, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error("Unauthorized");
    return next({ context: { supabase, userId: data.user.id, email: data.user.email ?? null } });
  }
);
export {
  requireSupabaseAuth as r
};
