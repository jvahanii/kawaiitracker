import { c as createServerRpc } from "./createServerRpc-DAVcwylh.mjs";
import { c as createServerFn } from "./server-C1BuN9pZ.mjs";
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
const getSupabaseConfig_createServerFn_handler = createServerRpc({
  id: "6391275a0da04f5aceaeb5abd0e54aa4fd04cc5e7fe9aa65de40dba85f216df9",
  name: "getSupabaseConfig",
  filename: "src/lib/supabase/config.functions.ts"
}, (opts) => getSupabaseConfig.__executeServer(opts));
const getSupabaseConfig = createServerFn({
  method: "GET"
}).handler(getSupabaseConfig_createServerFn_handler, async () => {
  const url = process.env.EXT_SUPABASE_URL;
  const publishableKey = process.env.EXT_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error("Supabase env missing on server. Set EXT_SUPABASE_URL and EXT_SUPABASE_PUBLISHABLE_KEY.");
  }
  return {
    url,
    publishableKey
  };
});
export {
  getSupabaseConfig_createServerFn_handler
};
