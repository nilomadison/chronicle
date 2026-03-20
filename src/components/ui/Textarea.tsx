import React from "react";
import styles from "./Textarea.module.css";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  storyEditor?: boolean;
  showCharCount?: boolean;
  maxChars?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      storyEditor = false,
      showCharCount = false,
      maxChars,
      id,
      value,
      className,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={styles.textareaWrapper}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          className={`${styles.textarea} ${storyEditor ? styles.storyEditor : ""} ${error ? styles.error : ""} ${className || ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {error && (
              <span
                id={`${textareaId}-error`}
                className={styles.errorText}
                role="alert"
              >
                {error}
              </span>
            )}
            {helperText && !error && (
              <span className={styles.helperText}>{helperText}</span>
            )}
          </div>
          {showCharCount && (
            <span className={styles.charCount}>
              {charCount}
              {maxChars ? ` / ${maxChars}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
