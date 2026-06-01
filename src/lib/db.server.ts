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
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 8_000,
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

const MAX_ATTEMPTS = 4;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const pool = getPool();
    let client;
    try {
      // Acquire a dedicated client so a stale idle socket fails here
      // (recoverable) rather than mid-query.
      client = await pool.connect();
      const res = await client.query<T extends Record<string, unknown> ? T : never>(
        text,
        params as unknown[],
      );
      return res.rows as T[];
    } catch (err) {
      lastErr = err;
      if (isConnectionError(err) && attempt < MAX_ATTEMPTS - 1) {
        // Drop the stale pool and retry with a fresh one.
        if (_pool === pool) _pool = undefined;
        try {
          await pool.end();
        } catch {
          // ignore
        }
        await sleep(100 * (attempt + 1));
        continue;
      }
      throw err;
    } finally {
      try {
        client?.release();
      } catch {
        // ignore
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Database unavailable");
}

export async function queryOne<T = unknown>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
