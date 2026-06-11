## Why it still fails

The previous fix added `externals: { traceInclude: ["tslib"] }` to the Nitro config. After reading the installed Nitro source, that option **doesn't exist in this version** — it's silently ignored. So nothing actually changed in the deployed output.

What's really happening:
- Nitro keeps `tslib` on an internal "never bundle" list, so the server bundle (`_libs/supabase__auth-js.mjs`) keeps a bare `import "tslib"`.
- Nitro is supposed to copy `tslib` into the function's `node_modules` at build time, but on Vercel that copy isn't ending up in the deployed function — hence `ERR_MODULE_NOT_FOUND`.

## The fix

Nitro's source shows the supported escape hatch: the `traceDeps` option accepts negated entries. Setting `traceDeps: ["!tslib"]` removes `tslib` from the never-bundle list, so it gets **compiled directly into the server bundle**. No runtime `tslib` import remains, so there is nothing left to be missing on Vercel.

### Changes

1. **vite.config.ts** — replace the ignored `externals` block with:
   - `nitro: { preset: "vercel", traceDeps: ["!tslib"] }`
2. **Regenerate `package-lock.json`** — it's currently out of sync with `package.json` (missing the `tslib` entry added earlier). Vercel installs with npm from this lockfile, so it must match.

### Verification before you redeploy

1. Run a production build locally with the Vercel preset.
2. Grep `.vercel/output/functions/` to confirm no bare `tslib` import remains in any `.mjs` file.
3. Only then redeploy on Vercel — with **build cache disabled** ("Redeploy" → uncheck "Use existing Build Cache").

### Fallback

`tslib` is on that list due to a rare CJS-interop edge case when inlined. If the local build verification shows any issue, the fallback is to keep it external and force-copy it into the function output via a post-build step instead. I'll only need this if step 2 of verification fails.