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
const listAuditLog_createServerFn_handler = createServerRpc({
  id: "a152ca7691988bc23845fc63d40f80587032650679c867eda96c74439304e767",
  name: "listAuditLog",
  filename: "src/lib/api/audit.functions.ts"
}, (opts) => listAuditLog.__executeServer(opts));
const listAuditLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  limit: numberType().int().min(1).max(1e3).optional()
}).parse(d)).handler(listAuditLog_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.rpc("list_audit_log", {
    p_tenant_id: data.tenantId,
    p_limit: data.limit ?? 200
  });
  if (error) throw new Error(error.message);
  const list = rows ?? [];
  return list.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    actorId: r.actor_id,
    actorName: r.actor_name,
    actorEmail: r.actor_email,
    tableName: r.table_name,
    recordId: r.record_id,
    action: r.action,
    changes: r.changes,
    rowData: r.row_data
  }));
});
export {
  listAuditLog_createServerFn_handler
};
