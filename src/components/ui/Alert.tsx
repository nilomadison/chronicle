import React from "react";
import styles from "./Alert.module.css";

type AlertVariant = "info" | "success" | "warning" | "error";

const icons: Record<AlertVariant, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  return (
    <div
      className={`${styles.alert} ${styles[variant]} ${className || ""}`}
      role="alert"
    >
      <span className={styles.icon}>{icons[variant]}</span>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
