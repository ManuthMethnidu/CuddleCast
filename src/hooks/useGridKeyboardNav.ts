import { useEffect } from 'react';

interface GridNavOptions {
  containerSelector?: string;
  itemSelector?: string;
  columns?: number;
  enabled?: boolean;
}

/**
 * useGridKeyboardNav: Spatial keyboard navigation for video cards & streaming rails.
 * Allows remote controls / arrow keys (Up, Down, Left, Right, Enter) to navigate
 * smoothly between video items with dedicated focus-visible rings.
 */
export const useGridKeyboardNav = ({
  containerSelector = '[data-grid-nav="true"]',
  itemSelector = 'button, [tabindex="0"], a',
  columns = 4,
  enabled = true,
}: GridNavOptions = {}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in inputs or textareas
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      const container = activeElement?.closest(containerSelector) || document.querySelector(containerSelector);
      if (!container) return;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      ).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );

      if (items.length === 0) return;

      const currentIndex = activeElement ? items.indexOf(activeElement) : -1;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex + columns < items.length ? currentIndex + columns : currentIndex;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex - columns >= 0 ? currentIndex - columns : currentIndex;
          break;
        case 'Enter':
        case ' ':
          if (activeElement && items.includes(activeElement)) {
            // Let normal click happen
            return;
          }
          break;
        default:
          return;
      }

      if (nextIndex >= 0 && nextIndex < items.length) {
        items[nextIndex].focus();
        items[nextIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [containerSelector, itemSelector, columns, enabled]);
};
