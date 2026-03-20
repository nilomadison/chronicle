import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/Providers";
import { Sidebar } from "./Sidebar";
import styles from "./protected.module.css";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className={styles.layout}>
        <Sidebar email={session.user.email} />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
      </div>
    </Providers>
  );
}
