# Fix Vercel 404 by enabling Nitro's Vercel preset

## Root cause

`@lovable.dev/vite-tanstack-config` (v2.3.2) only runs Nitro automatically inside Lovable's sandbox. On Vercel's CI, no Lovable context is detected, so the build skips Nitro entirely and produces a client-only bundle with no SSR handler. Vercel then has no function to route requests to, so any non-asset URL returns `404 NOT_FOUND`.

`nitro` is already installed (`nitro@3.0.260603-beta` in `devDependencies`), so no new dependency is needed.

## Changes

### 1. `vite.config.ts` — force-enable Nitro with the Vercel preset

Update the existing `defineConfig` call to add a `nitro` option. The preset's `cloudflare` overrides only apply inside the Lovable sandbox, so on Vercel this hard-pins the Vercel target; in Lovable's sandbox the Cloudflare target is still forced automatically.

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
```

That's the entire code change. Do NOT add a top-level `plugins: [nitro(...)]` array — the preset already wires Nitro internally, and adding it manually duplicates the plugin (which is what the header comment in `vite.config.ts` warns about).

### 2. Vercel project settings

- Framework Preset: **Other** (or leave Vercel's auto-detection).
- Build Command: `npm run build` (default).
- Output Directory: leave blank — Nitro's Vercel preset writes to `.vercel/output/` which Vercel picks up automatically via the Build Output API.
- Environment variables: ensure `EXT_SUPABASE_URL`, `EXT_SUPABASE_PUBLISHABLE_KEY`, `EXT_SUPABASE_SERVICE_ROLE_KEY` are set for Production (and Preview if you want preview deploys).
- Install Command: default. If Vercel ever complains about the `nitro` beta version, set `NPM_CONFIG_LEGACY_PEER_DEPS=true`.

### 3. `vercel.json`

There is no `vercel.json` in the repo today (checked the file tree). Do not create one. A SPA rewrite (`/(.*)` → `/index.html`) would actively break SSR by hijacking server routes.

## What this does NOT change

- Lovable's own publish flow (`kawaiitracker.lovable.app`) keeps working — inside the sandbox, the preset overrides `preset`/`output`/`cloudflare` back to Cloudflare regardless of what's in `vite.config.ts`.
- No source files in `src/` change.
- The `/api/public/supabase-config` route and all `createServerFn` calls continue to work on both targets; they just need a server runtime to host them, which is exactly what was missing on Vercel.

## Verification after deploying

1. Trigger a fresh Vercel deploy.
2. Hit the deployed URL at `/` — should render the index page.
3. Hard-refresh on `/login` — should render the login page (no 404).
4. `curl https://<your-vercel-domain>/api/public/supabase-config` — should return the JSON config (this proves the server handler is mounted).
5. Try logging in end-to-end.

If step 4 still 404s, the Nitro build didn't run — check the Vercel build log for a line containing `nitro` and the resolved preset.
