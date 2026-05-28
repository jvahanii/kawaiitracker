import { Pool } from "pg";

// Single pool per Worker isolate. Aiven requires TLS.
let _pool: Pool | undefined;

export function getPool(): Pool {
  if (_pool) return _pool;
  const raw = process.env.AIVEN_DATABASE_URL;
  if (!raw) {
    throw new Error("AIVEN_DATABASE_URL is not configured");
  }
  // Parse manually so sslmode in the URL can't override our ssl options.
  const u = new URL(raw);
  _pool = new Pool({
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
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
