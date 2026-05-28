import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { signup } from "@/lib/api/auth.functions";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Tracker" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const signupFn = useServerFn(signup);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: (data: { displayName: string; email: string; password: string }) =>
      signupFn({ data }),
    onSuccess: () => navigate({ to: "/onboarding" }),
  });

  return (
    <AuthShell title="Create your account" subtitle="One account, many workspaces.">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          m.mutate({ displayName, email, password });
        }}
        className="space-y-4"
      >
        <Field label="Your name">
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            autoComplete="name"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
        </Field>
        <Field label="Password (8+ characters)">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="new-password"
          />
        </Field>
        {m.error ? (
          <p className="text-sm text-destructive">{(m.error as Error).message}</p>
        ) : null}
        <button
          type="submit"
          disabled={m.isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {m.isPending ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
