import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${error ? styles.error : ""} ${className || ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
