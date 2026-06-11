import { a as createMiddleware } from "./server-C1BuN9pZ.mjs";
import { r as renderErrorPage } from "./index.mjs";
import { t as tryGetSupabase, e as ensureSupabase } from "./client-dZ0Q4Mvy.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
    }
  }
}
var createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(deduped, options.serializationAdapters);
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next, serverFnMeta }) => {
    if (typeof window === "undefined") return next();
    try {
      const functionId = serverFnMeta?.id ?? "";
      const paddedFunctionId = functionId.padEnd(functionId.length + (4 - functionId.length % 4) % 4, "=");
      const decodedFunctionId = functionId ? atob(paddedFunctionId.replace(/-/g, "+").replace(/_/g, "/")).toLowerCase() : "";
      if (decodedFunctionId.includes("/supabase/config.functions.ts")) {
        return next();
      }
      const supabase = tryGetSupabase() ?? await ensureSupabase();
      if (!supabase) return next();
      let { data } = await supabase.auth.getSession();
      let token = data.session?.access_token;
      const expiresAt = data.session?.expires_at ?? 0;
      const nowSec = Math.floor(Date.now() / 1e3);
      if (!token || expiresAt - nowSec < 30) {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          token = refreshed.session?.access_token ?? token;
        } catch {
        }
      }
      if (!token) return next();
      return next({ headers: { Authorization: `Bearer ${token}` } });
    } catch {
      return next();
    }
  }
);
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
});
const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth]
}));
export {
  startInstance
};
