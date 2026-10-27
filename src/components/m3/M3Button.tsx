import React, { forwardRef } from 'react';

export type M3ButtonVariant =
  | 'filled'
  | 'elevated'
  | 'tonal'
  | 'outlined'
  | 'text'
  | 'fab'
  | 'extended-fab';

export type M3ButtonSize = 'sm' | 'md' | 'lg';

export interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ButtonVariant;
  size?: M3ButtonSize;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

export const M3Button = forwardRef<HTMLButtonElement, M3ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      icon,
      trailingIcon,
      loading,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-5 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    }[size];

    const variantClasses: Record<M3ButtonVariant, string> = {
      filled:
        'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-m3-1 hover:shadow-m3-2 hover:brightness-105 active:scale-[0.97]',
      elevated:
        'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] shadow-m3-1 hover:shadow-m3-2 hover:bg-[var(--md-sys-color-surface-container)] active:scale-[0.97]',
      tonal:
        'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:brightness-110 active:scale-[0.97]',
      outlined:
        'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] bg-transparent hover:bg-[var(--md-sys-color-surface-container-highest)]/20 active:scale-[0.97]',
      text:
        'text-[var(--md-sys-color-primary)] bg-transparent hover:bg-[var(--md-sys-color-surface-container-highest)]/20 active:scale-[0.97]',
      fab:
        'w-14 h-14 p-0 rounded-m3-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-m3-3 hover:shadow-m3-4 hover:scale-105 active:scale-95',
      'extended-fab':
        'h-14 px-6 rounded-m3-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-m3-3 hover:shadow-m3-4 hover:scale-[1.02] active:scale-95 text-sm font-bold',
    };

    const isFab = variant === 'fab' || variant === 'extended-fab';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          relative inline-flex items-center justify-center select-none font-semibold
          font-m3-label-lg-emphasized transition-all duration-m3-medium ease-spring-snappy
          cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none
          ${isFab ? '' : 'rounded-m3-full'}
          ${isFab && variant === 'fab' ? '' : sizeClasses}
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
      </button>
    );
  }
);

M3Button.displayName = 'M3Button';
