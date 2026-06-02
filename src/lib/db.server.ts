import postgres from "postgres";

// Cloudflare Workers don't keep TCP sockets alive reliably between requests.
// node-postgres (`pg`) frequently throws "Connection terminated unexpectedly"
// in this runtime, so we use postgres.js (`postgres`) which has better
// Workers compatibility. We still open a fresh, single-connection client per
// request and close it afterwards to avoid stale TCP sockets.

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
    /CONNECTION_/i.test(msg) ||
    /socket/i.test(msg)
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
const CONNECT_TIMEOUT_S = 15;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    return code ? `${err.name}[${code}]: ${err.message}` : `${err.name}: ${err.message}`;
  }
  return String(err);
}

function makeSql() {
  const raw = process.env.AIVEN_DATABASE_URL;
  if (!raw) throw new Error("AIVEN_DATABASE_URL is not configured");
  return postgres(raw, {
    ssl: "require",
    max: 1,
    idle_timeout: 1,
    max_lifetime: 30,
    connect_timeout: CONNECT_TIMEOUT_S,
    prepare: false,
    fetch_types: false,
  });
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const sql = makeSql();
    try {
      // postgres.js uses .unsafe() for raw parameterized SQL with $1, $2 style placeholders.
      const rows = await sql.unsafe(text, params as never[]);
      return rows as unknown as T[];
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
        await sql.end({ timeout: 1 });
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
