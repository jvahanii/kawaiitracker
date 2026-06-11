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
  // Force-enable Nitro outside the Lovable sandbox (e.g. Vercel CI) with the
  // Vercel preset. Inside the Lovable sandbox, the preset is overridden back
  // to Cloudflare automatically, so this is safe for both targets.
  nitro: {
    preset: "vercel",
    // Force the dep tracer to copy `tslib` into the Vercel function output.
    // @supabase/auth-js imports it at runtime, and Nitro 3 keeps tslib
    // externalized — so without this it's missing from /var/task/node_modules.
    ...({ externals: { traceInclude: ["tslib"] } } as Record<string, unknown>),
  },
});
