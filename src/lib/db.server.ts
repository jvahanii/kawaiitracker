import { Pool } from "pg";

// Single pool per Worker isolate. Aiven requires TLS.
let _pool: Pool | undefined;

export function getPool(): Pool {
  if (_pool) return _pool;
  const raw = process.env.AIVEN_DATABASE_URL;
  if (!raw) {
    throw new Error("AIVEN_DATABASE_URL is not configured");
  }
  // Strip sslmode from the URL so our ssl option (rejectUnauthorized: false)
  // is what pg actually uses — otherwise sslmode=require/verify-full wins.
  const connectionString = raw.replace(/([?&])sslmode=[^&]*&?/g, (_, p1) => (p1 === "?" ? "?" : ""))
    .replace(/[?&]$/, "");
  _pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  });
  return _pool;
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  const pool = getPool();
  const res = await pool.query<T extends Record<string, unknown> ? T : never>(
    text,
    params as unknown[],
  );
  return res.rows as T[];
}

export async function queryOne<T = unknown>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
