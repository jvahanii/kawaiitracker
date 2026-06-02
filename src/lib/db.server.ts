import { Client } from "pg";

// Cloudflare Workers don't keep TCP sockets alive reliably between requests,
// and pg.Pool's idle connections cause "Connection terminated unexpectedly"
// errors. Open a fresh Client per call instead.

export function isConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Connection terminated/i.test(msg) ||
    /timeout/i.test(msg) ||
    /ECONNRESET/i.test(msg) ||
    /ENOTFOUND/i.test(msg) ||
    /server closed the connection/i.test(msg) ||
    /Client has encountered a connection error/i.test(msg) ||
    /Client was closed/i.test(msg) ||
    /socket hang up/i.test(msg) ||
    /TLS/i.test(msg)
  );
}

export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Database temporarily unavailable");
    this.name = "DatabaseUnavailableError";
    if (cause) (this as { cause?: unknown }).cause = cause;
  }
}

const MAX_ATTEMPTS = 3;
const CONNECT_TIMEOUT_MS = 15_000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    const errno = (err as { errno?: string | number }).errno;
    const severity = (err as { severity?: string }).severity;
    const parts = [err.name];
    if (code) parts.push(`code=${code}`);
    if (errno !== undefined) parts.push(`errno=${errno}`);
    if (severity) parts.push(`severity=${severity}`);
    return `${parts.join(" ")}: ${err.message}`;
  }
  return String(err);
}

function makeClient(): Client {
  const raw = process.env.AIVEN_DATABASE_URL;
  if (!raw) throw new Error("AIVEN_DATABASE_URL is not configured");
  const u = new URL(raw);
  return new Client({
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const client = makeClient();
    // Swallow async client errors so they don't crash the worker.
    client.on("error", (err) => {
      console.error("[db] client error:", describeError(err));
    });
    try {
      await client.connect();
      const res = await client.query<T extends Record<string, unknown> ? T : never>(
        text,
        params as unknown[],
      );
      return res.rows as T[];
    } catch (err) {
      lastErr = err;
      const desc = describeError(err);
      if (isConnectionError(err) && attempt < MAX_ATTEMPTS - 1) {
        console.warn(`[db] retrying after connection error (attempt ${attempt + 1}): ${desc}`);
        await sleep(150 * (attempt + 1));
        continue;
      }
      if (isConnectionError(err)) {
        console.error(`[db] connection error after retries: ${desc}`);
        throw new DatabaseUnavailableError(err);
      }
      console.error(`[db] query error: ${desc}`);
      throw err;
    } finally {
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }
  console.error(`[db] exhausted retries: ${describeError(lastErr)}`);
  throw new DatabaseUnavailableError(lastErr);
}

export async function queryOne<T = unknown>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
