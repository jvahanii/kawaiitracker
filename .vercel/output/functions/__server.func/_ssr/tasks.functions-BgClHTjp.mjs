import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, a as arrayType } from "../_libs/zod.mjs";
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
const listTasksForItem_createServerFn_handler = createServerRpc({
  id: "7a05ed2c0e2274bd7f88fd139a20b7a7b4a28ab8e7c2f394dd498c04f59d64c6",
  name: "listTasksForItem",
  filename: "src/lib/api/tasks.functions.ts"
}, (opts) => listTasksForItem.__executeServer(opts));
const listTasksForItem = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid()
}).parse(d)).handler(listTasksForItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("item_tasks").select("id, item_id, user_id, title, done, created_at, updated_at").eq("item_id", data.itemId).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return (rows ?? []).map((r) => ({
    id: r.id,
    itemId: r.item_id,
    userId: r.user_id ?? null,
    title: r.title,
    done: Boolean(r.done),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
});
const createTask_createServerFn_handler = createServerRpc({
  id: "a22c4c022ae9a4a0865866b717aeefb52c843e6683f5aa4a2db70a57a4081a72",
  name: "createTask",
  filename: "src/lib/api/tasks.functions.ts"
}, (opts) => createTask.__executeServer(opts));
const createTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid(),
  title: stringType().min(1).max(500),
  userId: stringType().uuid().optional()
}).parse(d)).handler(createTask_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: maxRow
  } = await context.supabase.from("item_tasks").select("sort_order").eq("item_id", data.itemId).order("sort_order", {
    ascending: false
  }).limit(1).maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? -1) + 1;
  const {
    data: row,
    error
  } = await context.supabase.from("item_tasks").insert({
    item_id: data.itemId,
    title: data.title.trim(),
    user_id: data.userId ?? null,
    sort_order: nextOrder
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const updateTask_createServerFn_handler = createServerRpc({
  id: "3bdb0f9163a5f2747bc264fd605c0113a7891d27b6de23c937628b8ee813ad5e",
  name: "updateTask",
  filename: "src/lib/api/tasks.functions.ts"
}, (opts) => updateTask.__executeServer(opts));
const updateTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid(),
  title: stringType().min(1).max(500).optional(),
  done: booleanType().optional()
}).parse(d)).handler(updateTask_createServerFn_handler, async ({
  context,
  data
}) => {
  const patch = {
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.title !== void 0) patch.title = data.title.trim();
  if (data.done !== void 0) patch.done = data.done;
  const {
    error
  } = await context.supabase.from("item_tasks").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteTask_createServerFn_handler = createServerRpc({
  id: "fb2376066efa1db58065bff415a88a247c8578ab5b0e9c7e61628c891ed3992a",
  name: "deleteTask",
  filename: "src/lib/api/tasks.functions.ts"
}, (opts) => deleteTask.__executeServer(opts));
const deleteTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(deleteTask_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("item_tasks").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const reorderTasks_createServerFn_handler = createServerRpc({
  id: "ba49330b21832c210e0cd377b24f4530471bd9bb285f6416c5b66bf8602df5df",
  name: "reorderTasks",
  filename: "src/lib/api/tasks.functions.ts"
}, (opts) => reorderTasks.__executeServer(opts));
const reorderTasks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid(),
  orderedIds: arrayType(stringType().uuid()).max(500)
}).parse(d)).handler(reorderTasks_createServerFn_handler, async ({
  context,
  data
}) => {
  const results = await Promise.all(data.orderedIds.map((id, i) => context.supabase.from("item_tasks").update({
    sort_order: i
  }).eq("id", id).eq("item_id", data.itemId)));
  for (const {
    error
  } of results) {
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
export {
  createTask_createServerFn_handler,
  deleteTask_createServerFn_handler,
  listTasksForItem_createServerFn_handler,
  reorderTasks_createServerFn_handler,
  updateTask_createServerFn_handler
};
