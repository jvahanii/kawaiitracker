# Fix Vercel "Cannot find package 'tslib'" error

## Root cause

Your server bundler (Nitro 3 beta) **deliberately refuses to bundle `tslib`** — it's on an internal "never inline" list (added in `nf3@0.3.11` to work around a CJS interop bug). That's why the previous two fixes didn't work:

- Adding `tslib` to `package.json` doesn't help: Vercel functions only contain the files the bundler explicitly copies into the build output — your project's `node_modules` is never installed into `/var/task`.
- The `noExternals` tweak (which is no longer in `vite.config.ts` anyway) can't help either: even with full bundling enabled, `tslib` is force-externalized by that internal list.

So the built server chunk (`_libs/supabase__auth-js.mjs`) contains a bare `import 'tslib'`, but the bundler's dependency tracer fails to copy the `tslib` package into the Vercel function's output. At runtime, Node can't resolve it → crash.

## Fix

Tell the bundler to explicitly trace and copy `tslib` into the server output:

**`vite.config.ts`** — extend the existing `nitro` block:

```ts
nitro: {
  preset: "vercel",
  externals: {
    traceInclude: ["tslib"],
    inline: [], // keep default behavior otherwise
  },
},
```

`traceInclude` forces the dependency tracer to bundle-copy `tslib` (and its `package.json`) into the deployed function's `node_modules`, so the bare import resolves at runtime.

## Verification (before you redeploy)

1. Run a production build locally with the Vercel preset forced.
2. Inspect the generated `.vercel/output/functions/` directory and confirm `tslib` is present in the function's `node_modules`.
3. Only then ask you to redeploy on Vercel.

If `traceInclude` is not honored by this Nitro beta version, the fallback is a small build plugin that copies `tslib` into the function output after the build — but I'll confirm with the local build first instead of guessing again.

## One thing to double-check on your side

Make sure your Vercel deploy actually picked up the latest commit (the one adding `tslib` to `package.json`), and try **"Redeploy" with "Use existing Build Cache" turned off** — a stale build cache can also reproduce this exact error.
