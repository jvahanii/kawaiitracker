import { createFileRoute } from "@tanstack/react-router";

/**
 * Stable public endpoint returning the publishable Supabase config so the
 * browser client can be initialised. URL + publishable key are public values.
 *
 * Uses a fixed URL (not a generated server-fn id), so a slightly stale worker
 * cannot break bootstrap after a republish.
 */
export const Route = createFileRoute("/api/public/supabase-config")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.EXT_SUPABASE_URL;
        const publishableKey = process.env.EXT_SUPABASE_PUBLISHABLE_KEY;
        const missing: string[] = [];
        if (!url) missing.push("EXT_SUPABASE_URL");
        if (!publishableKey) missing.push("EXT_SUPABASE_PUBLISHABLE_KEY");
        if (missing.length > 0) {
          return new Response(
            JSON.stringify({
              error: "Supabase env missing on server. Set the listed variables in project secrets.",
              missing,
            }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(JSON.stringify({ url, publishableKey }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
