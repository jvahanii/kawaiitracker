import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { e as enumType, o as objectType } from "../_libs/zod.mjs";
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
const currencySchema = enumType(["EUR", "USD", "GBP", "SEK", "NOK"]);
const getMyPreferredCurrency_createServerFn_handler = createServerRpc({
  id: "1d037c2863d1446ad303aea281b3cc9b6294ee86eaa880a0bcae088e5d58b6a1",
  name: "getMyPreferredCurrency",
  filename: "src/lib/api/user-settings.functions.ts"
}, (opts) => getMyPreferredCurrency.__executeServer(opts));
const getMyPreferredCurrency = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyPreferredCurrency_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("profiles").select("preferred_currency").eq("id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  const parsed = currencySchema.safeParse(data?.preferred_currency);
  return {
    currency: parsed.success ? parsed.data : null
  };
});
const updateMyPreferredCurrency_createServerFn_handler = createServerRpc({
  id: "f7fb519415a24b7b7f1b6371f65c0ff7a223dbfb994c57c4df6bd0eef4a0aab7",
  name: "updateMyPreferredCurrency",
  filename: "src/lib/api/user-settings.functions.ts"
}, (opts) => updateMyPreferredCurrency.__executeServer(opts));
const updateMyPreferredCurrency = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  currency: currencySchema
}).parse(d)).handler(updateMyPreferredCurrency_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("profiles").update({
    preferred_currency: data.currency
  }).eq("id", context.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  getMyPreferredCurrency_createServerFn_handler,
  updateMyPreferredCurrency_createServerFn_handler
};
