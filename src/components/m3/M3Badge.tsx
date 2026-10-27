import React from 'react';

export interface M3BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'dot' | 'count' | 'label';
  color?: 'tertiary' | 'primary' | 'error';
  count?: number;
  maxCount?: number;
  pulse?: boolean;
}

export const M3Badge: React.FC<M3BadgeProps> = ({
  variant = 'label',
  color = 'tertiary',
  count,
  maxCount = 99,
  pulse = false,
  children,
  className = '',
  ...props
}) => {
  const colorClasses = {
    tertiary: 'bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)]',
    primary: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]',
    error: 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]',
  }[color];

  if (variant === 'dot') {
    return (
      <span
        className={`relative inline-flex items-center justify-center ${className}`}
        {...props}
      >
        {pulse && (
          <span
            className={`absolute inline-flex w-2.5 h-2.5 rounded-full animate-ping opacity-75 ${colorClasses}`}
          />
        )}
        <span className={`inline-flex w-2 h-2 rounded-full ${colorClasses}`} />
      </span>
    );
  }

  const displayText =
    variant === 'count' && count !== undefined
      ? count > maxCount
        ? `${maxCount}+`
        : `${count}`
      : children;

  return (
    <span
      className={`
        inline-flex items-center justify-center font-m3-label-sm-emphasized
        rounded-m3-full px-2 py-0.5 min-w-[1.25rem] h-5 select-none leading-none
        shadow-m3-1 uppercase tracking-wider
        ${colorClasses}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      {...props}
    >
      {displayText}
    </span>
  );
};
