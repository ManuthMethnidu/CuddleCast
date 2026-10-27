import React, { forwardRef } from 'react';

export type M3CardVariant = 'elevated' | 'filled' | 'outlined' | 'expressive';

export interface M3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: M3CardVariant;
  interactive?: boolean;
  asymmetric?: boolean;
}

export const M3Card = forwardRef<HTMLDivElement, M3CardProps>(
  (
    {
      variant = 'elevated',
      interactive = false,
      asymmetric = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantClasses: Record<M3CardVariant, string> = {
      elevated:
        'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] shadow-m3-1 border border-[var(--md-sys-color-outline-variant)]',
      filled:
        'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-transparent',
      outlined:
        'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]',
      expressive:
        'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] shadow-m3-1',
    };

    const interactiveClasses = interactive
      ? 'cursor-pointer hover:shadow-m3-3 hover:-translate-y-1 active:scale-[0.98] transition-all duration-m3-medium ease-spring-snappy'
      : '';

    const radiusClass = asymmetric || variant === 'expressive' ? 'rounded-m3-asym' : 'rounded-m3-lg';

    return (
      <div
        ref={ref}
        className={`
          relative overflow-hidden transition-all duration-m3-medium
          ${radiusClass}
          ${variantClasses[variant]}
          ${interactiveClasses}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

M3Card.displayName = 'M3Card';
