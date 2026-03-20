"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import styles from "./protected.module.css";

const navItems = [
  { href: "/dashboard", label: "My Stories", icon: "📖" },
  { href: "/archive", label: "Archive", icon: "🏛️" },
  { href: "/archive/search", label: "Search", icon: "🔍" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className={styles.logoText}>
          Chron<span className={styles.logoAccent}>icle</span>
        </span>
        <div style={{ width: "2.5rem" }} />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className={`${styles.mobileOverlay} ${styles.show}`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logoLink}>
            <span className={styles.logoText}>
              Chron<span className={styles.logoAccent}>icle</span>
            </span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.navLinkActive : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.startStory}>
          <Link href="/stories/new" onClick={() => setMobileOpen(false)}>
            <Button fullWidth size="md">
              ✦ Start a Story
            </Button>
          </Link>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userSection}>
            <span className={styles.userEmail}>{email}</span>
            <button
              className={styles.signOutBtn}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
