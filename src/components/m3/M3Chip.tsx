import React from 'react';

export type M3ChipType = 'assist' | 'filter' | 'input' | 'suggestion';

export interface M3ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  chipType?: M3ChipType;
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onDelete?: () => void;
}

export const M3Chip: React.FC<M3ChipProps> = ({
  chipType = 'filter',
  selected = false,
  leadingIcon,
  trailingIcon,
  onDelete,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 h-8 px-3 rounded-m3-sm
        font-m3-label-md-emphasized select-none cursor-pointer
        border transition-all duration-m3-short ease-spring-snappy
        disabled:opacity-40 disabled:pointer-events-none active:scale-95
        ${
          selected
            ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-transparent shadow-m3-1'
            : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container)] hover:text-[var(--md-sys-color-on-surface)]'
        }
        ${className}
      `}
      {...props}
    >
      {leadingIcon && <span className="inline-flex shrink-0 w-4 h-4">{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && !onDelete && <span className="inline-flex shrink-0 w-4 h-4">{trailingIcon}</span>}
      {onDelete && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/20"
        >
          ×
        </span>
      )}
    </button>
  );
};
