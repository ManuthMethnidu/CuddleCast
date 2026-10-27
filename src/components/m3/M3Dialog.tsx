import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface M3DialogProps {
  open: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  headline?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const M3Dialog: React.FC<M3DialogProps> = ({
  open,
  onClose,
  icon,
  headline,
  children,
  actions,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Scrim / Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-m3-medium"
      />

      {/* Dialog Surface */}
      <div
        ref={dialogRef}
        className={`
          relative z-10 w-full max-w-lg p-6 rounded-m3-xl
          bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]
          shadow-m3-3 border border-[var(--md-sys-color-outline-variant)]
          animate-spring-scale
          ${className}
        `}
      >
        {icon && (
          <div className="mb-4 inline-flex items-center justify-center text-[var(--md-sys-color-primary)]">
            {icon}
          </div>
        )}

        {headline && (
          <h2 className="font-m3-headline-sm-emphasized text-[var(--md-sys-color-on-surface)] mb-3">
            {headline}
          </h2>
        )}

        <div className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)] mb-6">
          {children}
        </div>

        {actions && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  const portalRoot = document.getElementById('portal-root') || document.body;
  return createPortal(content, portalRoot);
};
