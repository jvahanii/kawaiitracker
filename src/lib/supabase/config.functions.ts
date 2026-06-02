import { createServerFn } from "@tanstack/react-start";

/**
 * Returns the publishable Supabase config so the browser client can be
 * initialised. URL + publishable key are public values (any visitor can read
 * them from network requests once the page loads), so this is safe to ship.
 *
 * Custom env names are used because the VITE_SUPABASE_* prefix is reserved
 * by the Lovable Cloud managed integration.
 */
export const getSupabaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env.EXT_SUPABASE_URL;
  const publishableKey = process.env.EXT_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase env missing on server. Set EXT_SUPABASE_URL and EXT_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return { url, publishableKey };
});
