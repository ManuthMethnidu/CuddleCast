import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
  onClick?: () => void;
};

export type BubbleMenuProps = {
  logo?: ReactNode | string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: BubbleMenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
  onItemSelect?: (item: BubbleMenuItem) => void;
};

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  {
    label: 'Sports',
    href: '/sports',
    ariaLabel: 'Live Sports',
    rotation: -6,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' },
  },
  {
    label: 'Anime',
    href: '/anime',
    ariaLabel: 'Anime',
    rotation: 6,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' },
  },
  {
    label: 'Live TV',
    href: '/live-tv',
    ariaLabel: 'Live TV',
    rotation: -4,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' },
  },
  {
    label: 'Discover',
    href: '/discover',
    ariaLabel: 'Discover',
    rotation: 6,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' },
  },
  {
    label: 'Radio',
    href: '/radio',
    ariaLabel: 'Radio',
    rotation: -6,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' },
  },
];

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  logo,
  onMenuClick,
  className = '',
  style,
  menuAriaLabel = 'Toggle navigation',
  menuBg = 'rgba(255, 255, 255, 0.12)',
  menuContentColor = '#ffffff',
  useFixedPosition = false,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.1,
  onItemSelect,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<(HTMLAnchorElement | HTMLButtonElement)[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const menuItems = items?.length ? items.slice(0, 5) : DEFAULT_ITEMS;

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  const handleClose = () => {
    setIsMenuOpen(false);
    onMenuClick?.(false);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 20, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.03, 0.03);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase,
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration * 0.8,
              ease: 'power3.out',
            },
            '-=' + animationDuration * 0.7
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 20,
        autoAlpha: 0,
        duration: 0.18,
        ease: 'power3.in',
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.22,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          setShowOverlay(false);
        },
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 768;
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = isDesktop ? (item.rotation ?? 0) : 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      <style>{`
        .bubble-menu .menu-line {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items .pill-link {
          transform: rotate(var(--item-rot, 0deg));
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .bubble-menu-items .pill-link:hover {
          transform: rotate(var(--item-rot, 0deg)) scale(1.08) !important;
          background: var(--hover-bg) !important;
          color: var(--hover-color) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6) !important;
        }
        .bubble-menu-items .pill-link:active {
          transform: rotate(var(--item-rot, 0deg)) scale(0.95) !important;
        }
      `}</style>

      {/* Bubble Menu Trigger Button */}
      <div className={`relative inline-flex items-center ${className}`} style={style}>
        {logo && (
          <div className="mr-2 flex items-center justify-center">
            {typeof logo === 'string' ? (
              <img src={logo} alt="Logo" className="h-6 w-auto object-contain" />
            ) : (
              logo
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          className="bubble toggle-bubble menu-btn relative inline-flex flex-col items-center justify-center rounded-full w-9 h-9 sm:w-10 sm:h-10 border border-white/20 hover:border-white/40 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 z-50 backdrop-blur-md"
          style={{ background: menuBg }}
        >
          <span
            className="menu-line block rounded-full"
            style={{
              width: 18,
              height: 2,
              background: menuContentColor,
              transform: isMenuOpen ? 'translateY(3px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="menu-line block rounded-full"
            style={{
              marginTop: '4px',
              width: 18,
              height: 2,
              background: menuContentColor,
              transform: isMenuOpen ? 'translateY(-3px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Pop-up Overlay with Staggered Bubbles: Transparent with Subtle Blur */}
      {showOverlay && (
        <div
          ref={overlayRef}
          onClick={(e) => {
            if (e.target === overlayRef.current) {
              handleClose();
            }
          }}
          className={`bubble-menu-items ${
            useFixedPosition ? 'fixed' : 'fixed'
          } inset-0 flex items-center justify-center z-[200] bg-black/25 backdrop-blur-sm p-4 transition-opacity`}
          aria-hidden={!isMenuOpen}
        >
          {/* Subtle backdrop close hint */}
          <div className="absolute top-6 left-6 text-xs font-mono text-white/70 pointer-events-none uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            Navigation · Click anywhere to close
          </div>

          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 sm:gap-6 pointer-events-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full">
              {menuItems.map((item, idx) => (
                <button
                  key={`bubble-nav-${item.label}-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    if (item.onClick) {
                      item.onClick();
                    } else if (onItemSelect) {
                      onItemSelect(item);
                    }
                  }}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link flex items-center justify-center px-8 sm:px-12 md:px-14 py-4 sm:py-5 md:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wider cursor-pointer border border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.7)] transition-transform"
                  style={
                    {
                      ['--item-rot']: `${item.rotation ?? (idx % 2 === 0 ? -4 : 4)}deg`,
                      ['--hover-bg']: item.hoverStyles?.bgColor || '#3b82f6',
                      ['--hover-color']: item.hoverStyles?.textColor || '#ffffff',
                      backgroundColor: '#0a1329',
                      color: '#ffffff',
                      outline: 'none',
                    } as CSSProperties
                  }
                  ref={(el) => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <span
                    className="pill-label inline-block"
                    ref={(el) => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BubbleMenu;
