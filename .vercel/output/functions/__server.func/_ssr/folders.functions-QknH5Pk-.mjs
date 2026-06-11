import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType, b as booleanType } from "../_libs/zod.mjs";
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
const FOLDER_VISIBILITY_SCHEMA_MESSAGE = "Folder visibility is not available yet. Apply the latest database migration and try again.";
function isMissingFolderVisibilitySchemaError(error) {
  const message = error?.message ?? "";
  return error?.code === "42703" || error?.code === "42P01" || message.includes("folders.restricted") || message.includes("folder_visibility");
}
const listFolders_createServerFn_handler = createServerRpc({
  id: "86a1c4a14726357395e4bc987e6b19272b5c4f25fae0d97fb74388342618c3b5",
  name: "listFolders",
  filename: "src/lib/api/folders.functions.ts"
}, (opts) => listFolders.__executeServer(opts));
const listFolders = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(listFolders_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("folders").select("id, parent_id, name, sort_order, restricted").eq("tenant_id", data.tenantId).order("sort_order", {
    ascending: true
  }).order("created_at", {
    ascending: true
  });
  if (isMissingFolderVisibilitySchemaError(error)) {
    const {
      data: legacyRows,
      error: legacyError
    } = await context.supabase.from("folders").select("id, parent_id, name, sort_order").eq("tenant_id", data.tenantId).order("sort_order", {
      ascending: true
    }).order("created_at", {
      ascending: true
    });
    if (legacyError) throw new Error(legacyError.message);
    return (legacyRows ?? []).map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      name: r.name,
      sortOrder: r.sort_order,
      restricted: false
    }));
  }
  if (error) throw new Error(error.message);
  return (rows ?? []).map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    name: r.name,
    sortOrder: r.sort_order,
    restricted: r.restricted === true
  }));
});
const createFolder_createServerFn_handler = createServerRpc({
  id: "34ec435197349daf2cfaab6e338e4d5d686a7a6bcf2b50b2f03dcf3482d1d55a",
  name: "createFolder",
  filename: "src/lib/api/folders.functions.ts"
}, (opts) => createFolder.__executeServer(opts));
const createFolder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  name: stringType().min(1).max(120),
  parentId: stringType().uuid().nullable().optional()
}).parse(d)).handler(createFolder_createServerFn_handler, async ({
  context,
  data
}) => {
  const parentId = data.parentId ?? null;
  let q = context.supabase.from("folders").select("sort_order").eq("tenant_id", data.tenantId).order("sort_order", {
    ascending: false
  }).limit(1);
  q = parentId === null ? q.is("parent_id", null) : q.eq("parent_id", parentId);
  const {
    data: maxRow
  } = await q.maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? -1) + 1;
  const folderId = crypto.randomUUID();
  const {
    error
  } = await context.supabase.from("folders").insert({
    id: folderId,
    tenant_id: data.tenantId,
    parent_id: parentId,
    name: data.name.trim(),
    created_by: context.userId,
    sort_order: nextOrder
  });
  if (error) throw new Error(error.message);
  return {
    id: folderId
  };
});
const updateFolder_createServerFn_handler = createServerRpc({
  id: "f355e2105a600c3e28e9dfb2f73e4efa1779c7084c096a107c5d36af2450edda",
  name: "updateFolder",
  filename: "src/lib/api/folders.functions.ts"
}, (opts) => updateFolder.__executeServer(opts));
const updateFolder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid(),
  name: stringType().min(1).max(120).optional(),
  parentId: stringType().uuid().nullable().optional()
}).parse(d)).handler(updateFolder_createServerFn_handler, async ({
  context,
  data
}) => {
  const patch = {
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.name !== void 0) patch.name = data.name.trim();
  if (data.parentId !== void 0) patch.parent_id = data.parentId;
  const {
    error
  } = await context.supabase.from("folders").update(patch).eq("id", data.id).eq("tenant_id", data.tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteFolder_createServerFn_handler = createServerRpc({
  id: "01838eea316533bfe116d3710c2480293132bc37a99a9b38a35c282d2ffd1b24",
  name: "deleteFolder",
  filename: "src/lib/api/folders.functions.ts"
}, (opts) => deleteFolder.__executeServer(opts));
const deleteFolder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(deleteFolder_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error: childErr
  } = await context.supabase.from("folders").update({
    parent_id: null
  }).eq("parent_id", data.id).eq("tenant_id", data.tenantId);
  if (childErr) throw new Error(childErr.message);
  const {
    error
  } = await context.supabase.from("folders").delete().eq("id", data.id).eq("tenant_id", data.tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getFolderVisibility_createServerFn_handler = createServerRpc({
  id: "26d8ca29e2b8be146bdcabd65e4e99cdfebab88ec382ea96832dfde8ede2f0ad",
  name: "getFolderVisibility",
  filename: "src/lib/api/folders.functions.ts"
}, (opts) => getFolderVisibility.__executeServer(opts));
const getFolderVisibility = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  folderId: stringType().uuid()
}).parse(d)).handler(getFolderVisibility_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: f,
    error: fErr
  } = await context.supabase.from("folders").select("restricted").eq("id", data.folderId).eq("tenant_id", data.tenantId).maybeSingle();
  if (isMissingFolderVisibilitySchemaError(fErr)) {
    return {
      restricted: false,
      userIds: []
    };
  }
  if (fErr) throw new Error(fErr.message);
  const {
    data: rows,
    error
  } = await context.supabase.from("folder_visibility").select("user_id").eq("folder_id", data.folderId);
  if (isMissingFolderVisibilitySchemaError(error)) {
    return {
      restricted: false,
      userIds: []
    };
  }
  if (error) throw new Error(error.message);
  return {
    restricted: f?.restricted === true,
    userIds: (rows ?? []).map((r) => r.user_id)
  };
});
const setFolderVisibility_createServerFn_handler = createServerRpc({
  id: "cd5d3a391d0485f516faf335a83b0f7fe2a58d2484e63e9b806376a863d458f8",
  name: "setFolderVisibility",
  filename: "src/lib/api/folders.functions.ts"
}, (opts) => setFolderVisibility.__executeServer(opts));
const setFolderVisibility = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  folderId: stringType().uuid(),
  restricted: booleanType(),
  userIds: arrayType(stringType().uuid()).max(500)
}).parse(d)).handler(setFolderVisibility_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error: upErr
  } = await context.supabase.from("folders").update({
    restricted: data.restricted,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.folderId).eq("tenant_id", data.tenantId);
  if (isMissingFolderVisibilitySchemaError(upErr)) {
    throw new Error(FOLDER_VISIBILITY_SCHEMA_MESSAGE);
  }
  if (upErr) throw new Error(upErr.message);
  const {
    error: delErr
  } = await context.supabase.from("folder_visibility").delete().eq("folder_id", data.folderId);
  if (isMissingFolderVisibilitySchemaError(delErr)) {
    throw new Error(FOLDER_VISIBILITY_SCHEMA_MESSAGE);
  }
  if (delErr) throw new Error(delErr.message);
  if (data.restricted && data.userIds.length > 0) {
    const rows = Array.from(new Set(data.userIds)).map((uid) => ({
      folder_id: data.folderId,
      user_id: uid
    }));
    const {
      error: insErr
    } = await context.supabase.from("folder_visibility").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }
  return {
    ok: true
  };
});
export {
  createFolder_createServerFn_handler,
  deleteFolder_createServerFn_handler,
  getFolderVisibility_createServerFn_handler,
  listFolders_createServerFn_handler,
  setFolderVisibility_createServerFn_handler,
  updateFolder_createServerFn_handler
};
