import React from "react";
import styles from "./Badge.module.css";

type BadgeVariant =
  | "default"
  | "amber"
  | "sage"
  | "clay"
  | "sky"
  | "draft"
  | "published"
  | "unpublished";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  removable = false,
  onRemove,
  className,
}: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${className || ""}`}
    >
      {children}
      {removable && onRemove && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}

/** Helper to map story status to a badge variant */
export function statusVariant(
  status: string
): BadgeVariant {
  switch (status) {
    case "published":
      return "published";
    case "unpublished":
      return "unpublished";
    case "draft":
    default:
      return "draft";
  }
}
