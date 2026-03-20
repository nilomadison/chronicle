"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthResult } from "@/actions/auth";
import { Button, Input, Alert } from "@/components/ui";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    loginAction,
    {}
  );

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <span className={styles.logoText}>
            Chron<span className={styles.logoAccent}>icle</span>
          </span>
        </div>
        <p className={styles.subtitle}>
          A living archive of human stories
        </p>

        {state.error && (
          <Alert variant="error" className="animate-fade-in">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className={styles.form}>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className={styles.switchLink}>
          Don&apos;t have an account?{" "}
          <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
