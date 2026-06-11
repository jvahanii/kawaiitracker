import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, n as numberType, a as arrayType, e as enumType } from "../_libs/zod.mjs";
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
const listItems_createServerFn_handler = createServerRpc({
  id: "45233f116d49806098c1a49b803c065945c6dbdca81c16da69c01ddb596bf421",
  name: "listItems",
  filename: "src/lib/api/items.functions.ts"
}, (opts) => listItems.__executeServer(opts));
const listItems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(listItems_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("items").select("id, title, status, assignee_id, notes, amount, folder_id, created_at, updated_at").eq("tenant_id", data.tenantId).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  const items = rows ?? [];
  const itemIds = items.map((r) => r.id);
  const assigneesByItem = /* @__PURE__ */ new Map();
  if (itemIds.length > 0) {
    const {
      data: rels,
      error: relErr
    } = await context.supabase.from("item_assignees").select("item_id, user_id").in("item_id", itemIds);
    if (!relErr) {
      for (const r of rels ?? []) {
        const list = assigneesByItem.get(r.item_id) ?? [];
        list.push(r.user_id);
        assigneesByItem.set(r.item_id, list);
      }
    }
  }
  const allUserIds = /* @__PURE__ */ new Set();
  for (const list of assigneesByItem.values()) for (const id of list) allUserIds.add(id);
  for (const r of items) if (r.assignee_id) allUserIds.add(r.assignee_id);
  const nameById = /* @__PURE__ */ new Map();
  if (allUserIds.size > 0) {
    const {
      data: profiles
    } = await context.supabase.from("profiles").select("id, display_name").in("id", Array.from(allUserIds));
    for (const p of profiles ?? []) {
      nameById.set(p.id, p.display_name ?? "");
    }
  }
  return items.map((r) => {
    const ids = assigneesByItem.get(r.id) ?? (r.assignee_id ? [r.assignee_id] : []);
    const assignees = ids.map((id) => ({
      id,
      name: nameById.get(id) ?? ""
    }));
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      assignees,
      assigneeId: assignees[0]?.id ?? null,
      assigneeName: assignees.length > 0 ? assignees.map((a) => a.name).join(", ") : null,
      notes: r.notes ?? "",
      amount: r.amount === null ? null : Number(r.amount),
      folderId: r.folder_id ?? null,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  });
});
const createItem_createServerFn_handler = createServerRpc({
  id: "68a0fbc7cd6036c7e9a35bcd14da7f0806a9f12fdcf4b1f0124e088e1262053c",
  name: "createItem",
  filename: "src/lib/api/items.functions.ts"
}, (opts) => createItem.__executeServer(opts));
const createItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  title: stringType().min(1).max(200),
  folderId: stringType().uuid().nullable().optional()
}).parse(d)).handler(createItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: maxRow
  } = await context.supabase.from("items").select("sort_order").eq("tenant_id", data.tenantId).order("sort_order", {
    ascending: false
  }).limit(1).maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? -1) + 1;
  const {
    data: row,
    error
  } = await context.supabase.from("items").insert({
    tenant_id: data.tenantId,
    title: data.title.trim(),
    created_by: context.userId,
    sort_order: nextOrder,
    folder_id: data.folderId ?? null
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const updateInput = objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid(),
  title: stringType().min(1).max(200).optional(),
  status: enumType(["todo", "in_progress", "done"]).optional(),
  assigneeIds: arrayType(stringType().uuid()).max(50).optional(),
  notes: stringType().max(2e4).optional(),
  amount: numberType().min(-1e9).max(1e9).nullable().optional(),
  folderId: stringType().uuid().nullable().optional()
});
const updateItem_createServerFn_handler = createServerRpc({
  id: "d61c819a56f07f98da1bdf6a012b63f2ba3dfd88bcef0aafa57f6d40990bb447",
  name: "updateItem",
  filename: "src/lib/api/items.functions.ts"
}, (opts) => updateItem.__executeServer(opts));
const updateItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => updateInput.parse(d)).handler(updateItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const patch = {
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.title !== void 0) patch.title = data.title.trim();
  if (data.status !== void 0) patch.status = data.status;
  if (data.notes !== void 0) patch.notes = data.notes;
  if (data.amount !== void 0) patch.amount = data.amount;
  if (data.folderId !== void 0) patch.folder_id = data.folderId;
  const onlyTimestamp = Object.keys(patch).length === 1 && data.assigneeIds === void 0;
  if (!onlyTimestamp) {
    if (data.assigneeIds !== void 0) {
      patch.assignee_id = data.assigneeIds[0] ?? null;
    }
    const {
      error
    } = await context.supabase.from("items").update(patch).eq("id", data.id).eq("tenant_id", data.tenantId);
    if (error) throw new Error(error.message);
  }
  if (data.assigneeIds !== void 0) {
    const {
      error: delErr
    } = await context.supabase.from("item_assignees").delete().eq("item_id", data.id);
    if (delErr) throw new Error(delErr.message);
    if (data.assigneeIds.length > 0) {
      const rows = Array.from(new Set(data.assigneeIds)).map((uid) => ({
        item_id: data.id,
        user_id: uid
      }));
      const {
        error: insErr
      } = await context.supabase.from("item_assignees").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }
  }
  return {
    ok: true
  };
});
const deleteItem_createServerFn_handler = createServerRpc({
  id: "6b7f7738e0120134f88e67a23dd529b17f81c92d94e6b6a69a985769999f1f2c",
  name: "deleteItem",
  filename: "src/lib/api/items.functions.ts"
}, (opts) => deleteItem.__executeServer(opts));
const deleteItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(deleteItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("items").delete().eq("id", data.id).eq("tenant_id", data.tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const reorderItems_createServerFn_handler = createServerRpc({
  id: "1196b94331e65ad27539c528701e15159bada85e5e19b11342dd4dd2f1d8d508",
  name: "reorderItems",
  filename: "src/lib/api/items.functions.ts"
}, (opts) => reorderItems.__executeServer(opts));
const reorderItems = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  orderedIds: arrayType(stringType().uuid()).max(500)
}).parse(d)).handler(reorderItems_createServerFn_handler, async ({
  context,
  data
}) => {
  const results = await Promise.all(data.orderedIds.map((id, i) => context.supabase.from("items").update({
    sort_order: i
  }).eq("id", id).eq("tenant_id", data.tenantId)));
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
  createItem_createServerFn_handler,
  deleteItem_createServerFn_handler,
  listItems_createServerFn_handler,
  reorderItems_createServerFn_handler,
  updateItem_createServerFn_handler
};
