import React from 'react';

export interface M3SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const M3Switch: React.FC<M3SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer select-none
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${className}
      `}
    >
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled) onChange(!checked);
          }
        }}
        className={`
          relative inline-flex items-center w-14 h-8 rounded-m3-full p-1
          border-2 transition-colors duration-m3-medium ease-spring-snappy
          ${
            checked
              ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]'
              : 'bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline)]'
          }
        `}
      >
        <span
          className={`
            inline-flex items-center justify-center rounded-m3-full shadow-m3-1
            transition-all duration-m3-medium ease-spring-bouncy
            ${
              checked
                ? 'w-6 h-6 translate-x-6 bg-[var(--md-sys-color-on-primary)]'
                : 'w-4 h-4 translate-x-1 bg-[var(--md-sys-color-outline)]'
            }
          `}
        />
      </div>

      {label && (
        <span className="font-m3-body-md text-[var(--md-sys-color-on-surface)]">
          {label}
        </span>
      )}
    </label>
  );
};
