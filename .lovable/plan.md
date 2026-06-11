## Root cause found: Vercel has been deploying a stale, broken build snapshot

Your repo has **163 files of pre-built Vercel output committed at `.vercel/output/`** — a snapshot built at 10:50 UTC today, *before* any of the bundling fixes. I inspected it:

- `.vercel/output/functions/__server.func/_libs/supabase__auth-js.mjs` contains the exact broken line: `import { __rest } from "tslib"` (a bare import).
- The function's `package.json` declares `tslib` as a needed dependency, but **no `node_modules/tslib` folder was ever copied** into the function.
- This matches your runtime error path `/var/task/_libs/supabase__auth-js.mjs` byte-for-byte.

When a `.vercel/output` directory is present, Vercel treats it as a prebuilt deployment (Build Output API) — so your deploys have been shipping this frozen, broken snapshot. **None of the config fixes ever reached production.** That's why the error never changed no matter what we did.

Meanwhile, I verified the current config is actually correct: the installed nitro version supports `noExternals: true` and its Vite build path skips externalization entirely when it's set — so a fresh build bundles `tslib` inline.

## Plan

1. **Delete the committed `.vercel/` directory** from the project — this is build output, not source code, and it's overriding fresh builds.
2. **Add `.vercel/` to `.gitignore`** so build artifacts can never be committed again.
3. **Verify locally**: run the exact Vercel-preset production build and scan the fresh output to confirm zero remaining bare `tslib` imports (tslib code fully inlined). If anything survives, add a hard alias for `tslib` as a final safety net.
4. **You redeploy on Vercel** with "Use existing Build Cache" turned OFF, making sure the deployed commit includes these changes.

## Technical details

- Committed artifact: `.vercel/output/` (163 files, `nitro.json` timestamped 2026-06-11T10:50Z — predates commits `ad9cbff` and `450e49d` that contain the bundling fixes).
- `vite.config.ts` stays as-is: `nitro: { preset: "vercel", noExternals: true }` + `vite.ssr.noExternal` for the Supabase family — confirmed effective in nitro `3.0.260603-beta` (`baseBuildPlugins` skips the externals tracer when `noExternals === true`).
- Verification command after build: grep all `.mjs` files in the new output for `from "tslib"` — expect zero matches.