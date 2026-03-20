"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthResult } from "@/actions/auth";
import { Button, Input, Alert } from "@/components/ui";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    registerAction,
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
          Create an account to begin sharing your stories
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
            helperText="Your email is private and never shown publicly."
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className={styles.switchLink}>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
