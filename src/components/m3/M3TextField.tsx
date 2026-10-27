import React, { forwardRef, useState } from 'react';

export interface M3TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'outlined' | 'filled';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const M3TextField = forwardRef<HTMLInputElement, M3TextFieldProps>(
  (
    {
      label,
      variant = 'outlined',
      leadingIcon,
      trailingIcon,
      error,
      helperText,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || `m3-input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`relative flex flex-col w-full text-left ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`
              font-m3-label-md mb-1.5 transition-colors duration-m3-short
              ${
                error
                  ? 'text-[var(--md-sys-color-error)]'
                  : focused
                  ? 'text-[var(--md-sys-color-primary)] font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)]'
              }
            `}
          >
            {label}
          </label>
        )}

        <div
          className={`
            relative flex items-center h-12 px-3.5 rounded-m3-md transition-all duration-m3-short ease-spring-snappy
            ${
              variant === 'filled'
                ? 'bg-[var(--md-sys-color-surface-container-high)] border-b-2'
                : 'bg-[var(--md-sys-color-surface)] border'
            }
            ${
              error
                ? 'border-[var(--md-sys-color-error)] ring-1 ring-[var(--md-sys-color-error)]'
                : focused
                ? 'border-[var(--md-sys-color-primary)] ring-2 ring-[var(--md-sys-color-primary)]/30'
                : 'border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-on-surface-variant)]'
            }
          `}
        >
          {leadingIcon && (
            <span className="mr-2 text-[var(--md-sys-color-on-surface-variant)]">{leadingIcon}</span>
          )}

          <input
            id={inputId}
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-[var(--md-sys-color-on-surface)] font-m3-body-md outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)]/60"
            {...props}
          />

          {trailingIcon && (
            <span className="ml-2 text-[var(--md-sys-color-on-surface-variant)]">{trailingIcon}</span>
          )}
        </div>

        {(error || helperText) && (
          <span
            className={`mt-1 font-m3-label-sm ${
              error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

M3TextField.displayName = 'M3TextField';
