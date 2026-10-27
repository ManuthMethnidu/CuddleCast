import React from 'react';

export interface M3SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface M3SegmentedButtonProps<T extends string = string> {
  options: M3SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function M3SegmentedButton<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: M3SegmentedButtonProps<T>) {
  const sizeClasses = {
    sm: 'h-8 text-xs px-3',
    md: 'h-10 text-sm px-4',
  }[size];

  return (
    <div
      role="radiogroup"
      className={`
        inline-flex items-center p-1 rounded-m3-full border border-[var(--md-sys-color-outline)]
        bg-[var(--md-sys-color-surface-container-lowest)] select-none
        ${className}
      `}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`
              relative inline-flex items-center justify-center gap-1.5 rounded-m3-full
              font-m3-label-md-emphasized transition-all duration-m3-medium ease-spring-snappy
              cursor-pointer active:scale-95
              ${sizeClasses}
              ${
                isSelected
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-m3-1 font-bold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
              }
            `}
          >
            {opt.icon && <span className="w-4 h-4 shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
