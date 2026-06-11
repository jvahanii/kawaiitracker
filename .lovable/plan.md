## Problem

Vercel deploy crashes with `ERR_MODULE_NOT_FOUND: Cannot find package 'tslib' imported from .../supabase__auth-js.mjs`. `tslib` is already in `package.json`, and `src/server.ts` + `src/lib/supabase/client.ts` already do `import "tslib"`. The previous attempt to remove `tslib` from Nitro's never-bundle list via `nitro.traceDeps` did not take effect on Vercel.

The real lever is Vite's SSR externalization. On the Vercel preset, Nitro reuses Vite's SSR settings, and `@supabase/auth-js` (an ESM package) gets externalized — its top-level `import "tslib"` is then resolved at runtime against the Vercel function's `node_modules`, which doesn't include it. Telling Vite to NOT externalize these packages forces them to be bundled, so `tslib`'s helpers are inlined and the runtime lookup goes away.

## Fix

### 1. `vite.config.ts` — add `ssr.noExternal`

`@lovable.dev/vite-tanstack-config` accepts a `vite` passthrough. Add:

```ts
vite: {
  ssr: {
    noExternal: ["@supabase/auth-js", "@supabase/supabase-js", "@supabase/postgrest-js", "@supabase/realtime-js", "@supabase/storage-js", "@supabase/functions-js", "@supabase/node-fetch", "tslib"],
  },
},
```

Including the whole Supabase family (not just `auth-js`) because they all share `tslib` and the same externalization behavior; bundling them avoids the same class of failure popping up next in another sub-package.

Keep the existing `nitro.traceDeps` override in place — harmless belt-and-braces; if anything still slips through external, Nitro will trace `tslib` into the function bundle.

### 2. `package.json` — already correct

`tslib ^2.8.1` is already in `dependencies`. No change.

### 3. Do NOT change

- `src/server.ts` / `src/lib/supabase/client.ts` — the `import "tslib"` shims stay (cheap insurance).
- `src/routes/auth.callback.tsx` — unrelated to this build error; leave as-is.

## Files touched

- **edit** `vite.config.ts` — add `vite.ssr.noExternal` array.

## How to verify

User redeploys on Vercel with build cache disabled. The Vercel function build output should now contain `tslib` helpers inlined into the Supabase chunks, and the runtime `ERR_MODULE_NOT_FOUND` for `tslib` should disappear.
