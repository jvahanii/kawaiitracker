import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

export type AuditChange = { old: JsonValue; new: JsonValue };

export type AuditEntry = {
  id: number;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  tableName: string;
  recordId: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  changes: { [k: string]: AuditChange } | null;
  rowData: { [k: string]: JsonValue } | null;
};

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        tenantId: z.string().uuid(),
        limit: z.number().int().min(1).max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<AuditEntry[]> => {
    const { data: rows, error } = await context.supabase.rpc("list_audit_log", {
      p_tenant_id: data.tenantId,
      p_limit: data.limit ?? 200,
    });
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as Array<{
      id: number;
      created_at: string;
      actor_id: string | null;
      actor_name: string | null;
      actor_email: string | null;
      table_name: string;
      record_id: string | null;
      action: string;
      changes: { [k: string]: AuditChange } | null;
      row_data: { [k: string]: JsonValue } | null;
    }>;
    return list.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      actorId: r.actor_id,
      actorName: r.actor_name,
      actorEmail: r.actor_email,
      tableName: r.table_name,
      recordId: r.record_id,
      action: r.action as AuditEntry["action"],
      changes: r.changes,
      rowData: r.row_data,
    }));
  });
