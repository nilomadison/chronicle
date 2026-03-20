import React from "react";
import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullPage?: boolean;
}

export function Spinner({ size = "md", label, fullPage = false }: SpinnerProps) {
  return (
    <div className={`${styles.container} ${fullPage ? styles.fullPage : ""}`}>
      <div
        className={`${styles.spinner} ${styles[size]}`}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
