## Fix Vercel `Cannot find package 'tslib'` error

### Problem
`@supabase/auth-js` imports `tslib` at runtime, but Vercel's serverless bundle doesn't include it because nothing in our app declares it as a direct dependency.

### Changes

1. **`package.json`** — Add `tslib` as an explicit dependency so the Vercel build includes it in the deployed function's `node_modules`:
   ```json
   "tslib": "^2.8.1"
   ```

2. **`vite.config.ts`** — Tell Nitro to inline `tslib` into the server bundle so it never tries to resolve it externally at runtime:
   ```ts
   nitro: {
     ...existing,
     rollupConfig: { ...existing?.rollupConfig },
     noExternals: ['tslib'],
   }
   ```
   (Exact key depends on current Nitro config shape — will adapt to whatever's there.)

### Verification
After redeploy on Vercel: the function cold-start should no longer throw `ERR_MODULE_NOT_FOUND` for `tslib`, and routes will load.
