import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export type Me = { id: string; email: string; displayName: string } | null;

/**
 * Returns the current user (resolved via the bearer token if attached) or null.
 * Does NOT throw on missing/invalid auth — used by public routes to optionally
 * redirect signed-in users.
 */
export const getMe = createServerFn({ method: "GET" }).handler(async (): Promise<Me> => {
  const url = process.env.EXT_SUPABASE_URL;
  const publishableKey = process.env.EXT_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;

  const authHeader = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabase = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  const user = data.user;

  // Try fetching profile display_name
  let displayName = (user.user_metadata?.display_name as string | undefined) ?? "";
  try {
    const { data: p } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    if (p?.display_name) displayName = p.display_name as string;
  } catch {
    /* ignore */
  }

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: displayName || (user.email?.split("@")[0] ?? ""),
  };
});
