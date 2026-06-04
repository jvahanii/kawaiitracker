import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/supabase/auth-middleware";

export type AuditEntry = {
  id: number;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  tableName: string;
  recordId: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  changes: Record<string, { old: unknown; new: unknown }> | null;
  rowData: Record<string, unknown> | null;
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
  .handler(async ({ context, data }) => {
    const { data: rows, error } = (await context.supabase.rpc("list_audit_log", {
      p_tenant_id: data.tenantId,
      p_limit: data.limit ?? 200,
    })) as {
      data:
        | {
            id: number;
            created_at: string;
            actor_id: string | null;
            actor_name: string | null;
            actor_email: string | null;
            table_name: string;
            record_id: string | null;
            action: string;
            changes: Record<string, { old: unknown; new: unknown }> | null;
            row_data: Record<string, unknown> | null;
          }[]
        | null;
      error: { message: string } | null;
    };
    if (error) throw new Error(error.message);
    return (rows ?? []).map<AuditEntry>((r) => ({
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
