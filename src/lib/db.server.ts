import { Pool } from "pg";

// Single pool per Worker isolate. Aiven requires TLS.
let _pool: Pool | undefined;

export function getPool(): Pool {
  if (_pool) return _pool;
  const raw = process.env.AIVEN_DATABASE_URL;
  if (!raw) {
    throw new Error("AIVEN_DATABASE_URL is not configured");
  }
  const u = new URL(raw);
  const pool = new Pool({
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  });
  // Prevent idle-connection terminations from crashing the worker, and
  // drop the cached pool so the next query rebuilds fresh connections.
  pool.on("error", (err) => {
    console.error("pg pool error:", err);
    if (_pool === pool) _pool = undefined;
  });
  _pool = pool;
  return pool;
}

function isConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Connection terminated/i.test(msg) ||
    /timeout/i.test(msg) ||
    /ECONNRESET/i.test(msg) ||
    /ENOTFOUND/i.test(msg) ||
    /server closed the connection/i.test(msg)
  );
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const pool = getPool();
    try {
      const res = await pool.query<T extends Record<string, unknown> ? T : never>(
        text,
        params as unknown[],
      );
      return res.rows as T[];
    } catch (err) {
      if (attempt === 0 && isConnectionError(err)) {
        // Drop the stale pool and retry once with a fresh one.
        if (_pool === pool) _pool = undefined;
        try {
          await pool.end();
        } catch {
          // ignore
        }
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}

export async function queryOne<T = unknown>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
