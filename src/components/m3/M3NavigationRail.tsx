import React from 'react';

export interface M3NavItem<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface M3NavigationRailProps<T extends string = string> {
  items: M3NavItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function M3NavigationRail<T extends string = string>({
  items,
  activeId,
  onSelect,
  orientation = 'vertical',
  className = '',
}: M3NavigationRailProps<T>) {
  const isVertical = orientation === 'vertical';

  return (
    <nav
      className={`
        flex ${isVertical ? 'flex-col gap-3 py-4 w-20' : 'flex-row gap-2 px-3 py-2 w-full'}
        items-center bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]
        ${className}
      `}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`
              relative flex flex-col items-center justify-center gap-1 group
              cursor-pointer select-none border-none bg-transparent outline-none
              transition-transform duration-m3-short active:scale-95
              ${isVertical ? 'w-full' : 'flex-1'}
            `}
          >
            {/* Expressive Indicator Pill */}
            <div
              className={`
                relative flex items-center justify-center w-14 h-8 rounded-m3-full
                transition-all duration-m3-medium ease-spring-bouncy
                ${
                  isActive
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-m3-1'
                    : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-surface-container-high)] group-hover:text-[var(--md-sys-color-on-surface)]'
                }
              `}
            >
              <span className="w-5 h-5 shrink-0">
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
              </span>

              {item.badge && (
                <div className="absolute -top-1 -right-1">{item.badge}</div>
              )}
            </div>

            {/* Label */}
            <span
              className={`
                text-[0.6875rem] font-medium tracking-wide transition-colors duration-m3-short
                ${
                  isActive
                    ? 'font-m3-label-sm-emphasized text-[var(--md-sys-color-on-surface)] font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]'
                }
              `}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
