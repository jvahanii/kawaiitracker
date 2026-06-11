import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, n as numberType, s as stringType } from "../_libs/zod.mjs";
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
const getGoal_createServerFn_handler = createServerRpc({
  id: "d7137616dfb9022b1e8e0553ea7e22b7850cd016b0470a861fef015d98bb1ad9",
  name: "getGoal",
  filename: "src/lib/api/goals.functions.ts"
}, (opts) => getGoal.__executeServer(opts));
const getGoal = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(1900).max(3e3)
}).parse(d)).handler(getGoal_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: row,
    error
  } = await context.supabase.from("savings_goals").select("amount, goal_date").eq("tenant_id", data.tenantId).eq("year", data.year).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return {
    amount: null,
    date: null
  };
  return {
    amount: row.amount != null ? Number(row.amount) : null,
    date: row.goal_date ?? null
  };
});
const upsertGoal_createServerFn_handler = createServerRpc({
  id: "a43225206d2e60b084bd996fd6abe9bedb3910b268db6f21487a15ebddd4f28a",
  name: "upsertGoal",
  filename: "src/lib/api/goals.functions.ts"
}, (opts) => upsertGoal.__executeServer(opts));
const upsertGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(1900).max(3e3),
  amount: numberType().min(-1e9).max(1e9).nullable(),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()
}).parse(d)).handler(upsertGoal_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: row,
    error
  } = await context.supabase.from("savings_goals").upsert({
    tenant_id: data.tenantId,
    year: data.year,
    amount: data.amount,
    goal_date: data.date,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  }, {
    onConflict: "tenant_id,year"
  }).select("amount, goal_date").single();
  if (error) throw new Error(error.message);
  return {
    amount: row.amount != null ? Number(row.amount) : null,
    date: row.goal_date ?? null
  };
});
export {
  getGoal_createServerFn_handler,
  upsertGoal_createServerFn_handler
};
