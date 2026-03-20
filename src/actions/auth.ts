"use server";

import { signIn } from "@/lib/auth";
import { registerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";

export type AuthResult = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    await registerAccount(email, password);
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      return { error: "An account with this email already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  // Auto sign in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    redirect("/login");
  }

  redirect("/dashboard");
}
