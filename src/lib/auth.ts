import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }
  interface User {
    id: string;
    email: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [account] = await db
          .select()
          .from(accounts)
          .where(eq(accounts.email, email.toLowerCase().trim()))
          .limit(1);

        if (!account) {
          return null;
        }

        const isValid = await bcrypt.compare(password, account.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: account.id,
          email: account.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});

/**
 * Get the current authenticated session (server-side)
 */
export async function getSession() {
  return await auth();
}

/**
 * Require authentication — throws redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Register a new account
 */
export async function registerAccount(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if account exists
  const [existing] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, normalizedEmail))
    .limit(1);

  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const [account] = await db
    .insert(accounts)
    .values({
      email: normalizedEmail,
      passwordHash,
    })
    .returning({ id: accounts.id, email: accounts.email });

  return account;
}
