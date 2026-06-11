import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { s as stringType, o as objectType, n as numberType } from "../_libs/zod.mjs";
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
const monthSchema = stringType().regex(/^\d{4}-\d{2}(-\d{2})?$/).transform((v) => `${v.slice(0, 7)}-01`);
function mapEntry(r) {
  return {
    id: r.id,
    itemId: r.item_id,
    month: r.month.slice(0, 10),
    amount: r.amount !== null && r.amount !== void 0 ? Number(r.amount) : null,
    actual: r.actual_amount !== null && r.actual_amount !== void 0 ? Number(r.actual_amount) : null
  };
}
const listEntriesForItem_createServerFn_handler = createServerRpc({
  id: "d3ad3fd59dfcaf506859645b3b54787310ba7eeace7a17356763619254b0976a",
  name: "listEntriesForItem",
  filename: "src/lib/api/entries.functions.ts"
}, (opts) => listEntriesForItem.__executeServer(opts));
const listEntriesForItem = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid()
}).parse(d)).handler(listEntriesForItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("item_entries").select("id, item_id, month, amount, actual_amount").eq("item_id", data.itemId).order("month", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return rows.map(mapEntry);
});
const listAllEntries_createServerFn_handler = createServerRpc({
  id: "d003bf6838687d2f074d2ed6cc2f13926efeca2a18070c0ffe2b2be0007cdaa4",
  name: "listAllEntries",
  filename: "src/lib/api/entries.functions.ts"
}, (opts) => listAllEntries.__executeServer(opts));
const listAllEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(listAllEntries_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: items,
    error: itemsErr
  } = await context.supabase.from("items").select("id").eq("tenant_id", data.tenantId);
  if (itemsErr) throw new Error(itemsErr.message);
  const ids = (items ?? []).map((i) => i.id);
  if (ids.length === 0) return [];
  const {
    data: rows,
    error
  } = await context.supabase.from("item_entries").select("id, item_id, month, amount, actual_amount").in("item_id", ids).order("month", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return rows.map(mapEntry);
});
const upsertEntry_createServerFn_handler = createServerRpc({
  id: "fb1317980c588af0bd3a8d986fa860ac709045c138fbe29280bd8a6f29b3e9c3",
  name: "upsertEntry",
  filename: "src/lib/api/entries.functions.ts"
}, (opts) => upsertEntry.__executeServer(opts));
const upsertEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid(),
  month: monthSchema,
  amount: numberType().min(-1e9).max(1e9).optional(),
  actual: numberType().min(-1e9).max(1e9).optional()
}).parse(d)).handler(upsertEntry_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: existing
  } = await context.supabase.from("item_entries").select("id, amount, actual_amount").eq("item_id", data.itemId).eq("month", data.month).maybeSingle();
  const amount = data.amount !== void 0 ? data.amount : existing ? existing.amount != null ? Number(existing.amount) : null : null;
  const actual = data.actual !== void 0 ? data.actual : existing ? existing.actual_amount != null ? Number(existing.actual_amount) : null : null;
  const {
    data: row,
    error
  } = await context.supabase.from("item_entries").upsert({
    item_id: data.itemId,
    month: data.month,
    amount,
    actual_amount: actual,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "item_id,month"
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const deleteEntry_createServerFn_handler = createServerRpc({
  id: "d3d7fc87956bc5bb4be58bb6e6c521bff4202f3924d34f12cc3b6ebe1f7585a7",
  name: "deleteEntry",
  filename: "src/lib/api/entries.functions.ts"
}, (opts) => deleteEntry.__executeServer(opts));
const deleteEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(deleteEntry_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("item_entries").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteEntry_createServerFn_handler,
  listAllEntries_createServerFn_handler,
  listEntriesForItem_createServerFn_handler,
  upsertEntry_createServerFn_handler
};
