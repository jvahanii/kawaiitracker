// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Inline Supabase public config at build time so the client can initialise
// without a server-function roundtrip. This is required for the static preview
// build (`id-preview--*.lovable.app`) which has no server runtime.
const SUPABASE_URL = process.env.EXT_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = process.env.EXT_SUPABASE_PUBLISHABLE_KEY ?? "";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: {
      __SUPABASE_URL__: JSON.stringify(SUPABASE_URL),
      __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    },
  },
});
