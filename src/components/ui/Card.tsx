import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  interactive?: boolean;
  compact?: boolean;
  flush?: boolean;
  elevated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  interactive = false,
  compact = false,
  flush = false,
  elevated = false,
  className,
  onClick,
}: CardProps) {
  const classes = [
    styles.card,
    interactive ? styles.interactive : "",
    compact ? styles.compact : "",
    flush ? styles.flush : "",
    elevated ? styles.elevated : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onClick={onClick} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.header} ${className || ""}`}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`${styles.title} ${className || ""}`}>{children}</h3>;
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.body} ${className || ""}`}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.footer} ${className || ""}`}>{children}</div>;
}
