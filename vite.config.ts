// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    ssr: {
      // Force-bundle the Supabase family + tslib into the SSR output so the
      // Vercel function never tries to resolve them from node_modules at
      // runtime (fixes ERR_MODULE_NOT_FOUND: 'tslib' from supabase__auth-js).
      noExternal: [
        "@supabase/auth-js",
        "@supabase/supabase-js",
        "@supabase/postgrest-js",
        "@supabase/realtime-js",
        "@supabase/storage-js",
        "@supabase/functions-js",
        "@supabase/node-fetch",
        "tslib",
      ],
    },
  },
  // Force-enable Nitro outside the Lovable sandbox (e.g. Vercel CI) with the
  // Vercel preset. Inside the Lovable sandbox, the preset is overridden back
  // to Cloudflare automatically, so this is safe for both targets.
  nitro: {
    preset: "vercel",
    // Bundle ALL dependencies into the server output instead of externalizing
    // node_modules. Externalization relied on tracing tslib into the Vercel
    // function, which kept failing (ERR_MODULE_NOT_FOUND from
    // _libs/supabase__auth-js.mjs). Full bundling is exactly what the
    // Cloudflare build already does, so this is proven to work.
    ...({ noExternals: true } as Record<string, unknown>),
  },
});
