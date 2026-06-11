## Goal
Force `tslib` into the server bundle so the Vercel deployment stops failing with `ERR_MODULE_NOT_FOUND: Cannot find package 'tslib'`.

## Current state
- `package.json` already lists `"tslib": "^2.8.1"` in `dependencies` — this is newer than the requested `^2.6.2` and exactly matches the version `@supabase/auth-js` requires (`2.8.1`), so no version change is needed. It will be kept as an explicit dependency, not auto-resolved.
- No file currently force-imports `tslib`, so the bundler can still leave it as a bare external reference in the server output.

## Changes

1. **`src/server.ts`** (server entry point — this is the bundle that runs at `/var/task` on Vercel where the error occurs)
   - Add `import 'tslib';` as the very first line.

2. **`src/lib/supabase/client.ts`** (Supabase client configuration)
   - Add `import 'tslib';` as the very first line, ensuring tslib is pulled into any chunk containing Supabase code.

3. **Verify locally**
   - Run a production build with the Vercel preset and confirm the emitted `_libs/supabase__auth-js.mjs` (or equivalent chunk) no longer contains a bare `import "tslib"`, or that `tslib` is present in the function output.

## After implementation
Redeploy on Vercel with **"Use existing Build Cache" unchecked** so the new bundle is used.

## Technical note
The existing `nitro.traceDeps: ["!tslib"]` setting in `vite.config.ts` stays in place — it removes tslib from Nitro's internal "never bundle" list; the explicit imports are a belt-and-suspenders measure to guarantee the bundler traces it.