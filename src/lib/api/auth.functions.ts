import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

import { queryOne } from "../db.server";
import { getSessionConfig, hashPassword, verifyPassword, type SessionData } from "../auth.server";

type UserRow = { id: string; email: string; display_name: string };

const signupInput = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  displayName: z.string().min(1).max(80),
});

export const signup = createServerFn({ method: "POST" })
  .inputValidator(signupInput)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const existing = await queryOne<UserRow>(
      "select id from app_users where email = $1",
      [email],
    );
    if (existing) throw new Error("An account with this email already exists");
    const passwordHash = await hashPassword(data.password);
    const user = await queryOne<UserRow>(
      `insert into app_users (email, password_hash, display_name)
       values ($1, $2, $3)
       returning id, email, display_name`,
      [email, passwordHash, data.displayName.trim()],
    );
    if (!user) throw new Error("Failed to create user");
    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ userId: user.id });
    return { id: user.id, email: user.email, displayName: user.display_name };
  });

const loginInput = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

export const login = createServerFn({ method: "POST" })
  .inputValidator(loginInput)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const row = await queryOne<{ id: string; password_hash: string; display_name: string; email: string }>(
      "select id, password_hash, display_name, email from app_users where email = $1",
      [email],
    );
    if (!row) throw new Error("Invalid email or password");
    const ok = await verifyPassword(data.password, row.password_hash);
    if (!ok) throw new Error("Invalid email or password");
    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ userId: row.id });
    return { id: row.id, email: row.email, displayName: row.display_name };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  await session.clear();
  return { ok: true };
});

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) return null;
  const row = await queryOne<UserRow>(
    "select id, email, display_name from app_users where id = $1",
    [userId],
  );
  if (!row) return null;
  return { id: row.id, email: row.email, displayName: row.display_name };
});
