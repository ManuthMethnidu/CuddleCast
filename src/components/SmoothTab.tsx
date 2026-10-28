/**
 * @author: @dorianbaffier (adapted for Echora / CuddleCast)
 * @description: Swipe Tabs
 * @version: 2.0.0
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import type { LucideIcon } from 'lucide-react';
import {
  type AnimationPlaybackControls,
  animate,
  useMotionValue,
} from 'motion/react';
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '../store/settingsStore';

export interface SwipeTabItem {
  id: string;
  title: string;
  /** Shown before the title in the tab. */
  icon?: LucideIcon;
  badge?: string;
  /** The panel shown for this tab. */
  content?: ReactNode;
}

export interface SmoothTabProps {
  items?: SwipeTabItem[];
  defaultTabId?: string;
  /** The selected tab id, for a controlled tab. Pair it with `onChange`. */
  value?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  /** Background classes for the indicator: the one accent. */
  activeColor?: string;
  /** Text color classes for the label sitting on the indicator. */
  activeTextColor?: string;
  /** Accessible name for the tab list. */
  label?: string;
  /** Force or override high performance mode */
  highPerformanceOnly?: boolean;
  /** Hide panels container (e.g. when used strictly as top bar tabs) */
  hidePanels?: boolean;
}

// Past the first or last tab the panel moves this fraction of the drag.
const RUBBER_BAND = 0.35;
// A release this fast (px per ms) changes tab however short the drag was.
const SWIPE_VELOCITY = 0.11;
// Movement before deciding between a horizontal swipe and a vertical scroll.
const AXIS_LOCK = 6;
// Release velocity is measured over the last stretch of the drag only.
const VELOCITY_WINDOW = 100;
// A panel one full width away sits at this opacity, so the neighbour reads
// as "next" while it slides in.
const NEIGHBOUR_OPACITY = 0.35;
// Just under critical damping: a firm settle, a hint of overshoot only after
// a fast flick.
const SPRING = { type: 'spring', stiffness: 420, damping: 38 } as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface TabRect {
  left: number;
  width: number;
  top: number;
  height: number;
}

interface Drag {
  pointerId: number;
  startX: number;
  startY: number;
  startProgress: number;
  axis: 'x' | 'y' | null;
  width: number;
  samples: { x: number; t: number }[];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** The indicator rectangle at a fractional tab position. */
function indicatorRect(rects: TabRect[], progress: number): TabRect | null {
  const last = rects.length - 1;
  if (last < 0 || progress < 0) {
    return null;
  }
  const p = clamp(progress, 0, last);
  const i = Math.min(Math.floor(p), Math.max(last - 1, 0));
  const a = rects[i];
  const b = rects[Math.min(i + 1, last)];
  if (!a || !b) return null;
  const t = p - i;
  let left = lerp(a.left, b.left, t);
  let width = lerp(a.width, b.width, t);
  // Rubber-banding past an end: the pill presses against the wall and gives
  // on the far side instead of sliding out of the track.
  const over = progress < 0 ? -progress : progress - last;
  if (over > 0) {
    const squash = width * Math.min(over, 0.5) * 0.4;
    width -= squash;
    if (progress > last) {
      left += squash;
    }
  }
  return { left, width, top: a.top, height: a.height };
}

/** Rubber-bands a raw position that runs past the first or last tab. */
function rubberBand(raw: number, last: number): number {
  if (raw < 0) {
    return raw * RUBBER_BAND;
  }
  if (raw > last) {
    return last + (raw - last) * RUBBER_BAND;
  }
  return raw;
}

export function SmoothTab({
  items = [],
  defaultTabId,
  value,
  onChange,
  className,
  activeColor = 'bg-white/15 dark:bg-white/20 shadow-md',
  activeTextColor = 'text-white font-bold',
  label = 'Navigation Sections',
  highPerformanceOnly = true,
  hidePanels = false,
}: SmoothTabProps) {
  const { performanceMode } = useSettingsStore();
  const isHighPerformance = highPerformanceOnly
    ? performanceMode === 'high'
    : true;

  const count = items.length;
  const indexOf = useCallback(
    (id: string | undefined) => {
      if (!id) return -1;
      const normalized = id === 'home' ? 'all' : id;
      const idx = items.findIndex((item) => item.id === normalized || item.id === id);
      return idx >= 0 ? idx : -1;
    },
    [items]
  );

  const [uncontrolled, setUncontrolled] = useState(() => Math.max(0, indexOf(defaultTabId)));
  const selected =
    value === undefined
      ? clamp(uncontrolled, 0, Math.max(count - 1, 0))
      : indexOf(value);

  // Captured once, so React never rewrites the imperatively painted styles.
  const [initial] = useState(selected);

  // Fractional tab position: 0 … count - 1, beyond while rubber-banding.
  const progress = useMotionValue(selected >= 0 ? selected : 0);

  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rects = useRef<TabRect[]>([]);
  const size = useRef({ width: 0, height: 0 });
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const target = useRef(selected);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const reducedMotion = useRef(false);
  const latest = useRef({ count, items, selected, onChange });
  latest.current = { count, items, selected, onChange };

  const paint = useCallback(
    (p: number) => {
      const track = trackRef.current;
      if (track) {
        track.style.transform = `translate3d(${(-p * 100) / count}%, 0, 0)`;
      }
      panelRefs.current.forEach((panel, i) => {
        if (panel) {
          const d = Math.min(Math.abs(p - i), 1);
          panel.style.opacity = String(1 - d * (1 - NEIGHBOUR_OPACITY));
        }
      });
      const overlay = overlayRef.current;
      const r = indicatorRect(rects.current, p);
      if (overlay) {
        if (r && p >= 0) {
          const right = Math.max(0, size.current.width - r.left - r.width);
          const bottom = Math.max(0, size.current.height - r.top - r.height);
          overlay.style.clipPath = `inset(${r.top}px ${right}px ${bottom}px ${r.left}px round ${r.height / 2}px)`;
          overlay.style.opacity = '1';
        } else {
          overlay.style.opacity = '0';
        }
      }
    },
    [count]
  );

  // Measure the tabs before paint, and again on resize and font load.
  useLayoutEffect(() => {
    const tablist = tablistRef.current;
    if (!tablist) {
      return;
    }
    let alive = true;
    const measure = () => {
      if (!alive) {
        return;
      }
      const box = tablist.getBoundingClientRect();
      const ratio = box.width / (tablist.offsetWidth || 1);
      const scale = Math.abs(ratio - 1) < 0.01 ? 1 : ratio;
      size.current = { width: box.width / scale, height: box.height / scale };
      rects.current = tabRefs.current.slice(0, count).map((tab) => {
        const r = tab?.getBoundingClientRect();
        return r
          ? {
              left: (r.left - box.left) / scale,
              width: r.width / scale,
              top: (r.top - box.top) / scale,
              height: r.height / scale,
            }
          : { left: 0, width: 0, top: 0, height: 0 };
      });
      paint(progress.get());
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tablist);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => undefined);
    }
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [count, paint, progress]);

  useEffect(() => {
    const unsubscribe = progress.on('change', paint);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reducedMotion.current = query.matches;
    };
    sync();
    query.addEventListener('change', sync);
    return () => {
      unsubscribe();
      query.removeEventListener('change', sync);
      anim.current?.stop();
    };
  }, [paint, progress]);

  /** Moves the position to a tab. `velocity` is in tabs per second. */
  const settle = useCallback(
    (index: number, opts: { instant?: boolean; velocity?: number } = {}) => {
      target.current = index;
      anim.current?.stop();
      anim.current = null;
      if (index < 0) {
        progress.jump(-1);
        paint(-1);
        return;
      }
      if (opts.instant || !isHighPerformance) {
        progress.jump(index);
        return;
      }
      anim.current = reducedMotion.current
        ? animate(progress, index, { duration: 0.15, ease: EASE_OUT })
        : animate(progress, index, { ...SPRING, velocity: opts.velocity ?? 0 });
    },
    [progress, isHighPerformance, paint]
  );

  const select = useCallback(
    (index: number, opts?: { instant?: boolean; velocity?: number }) => {
      const { count: n, items: list, selected: current } = latest.current;
      if (n === 0) return;
      const next = clamp(index, 0, n - 1);
      settle(next, opts);
      if (next !== current && list[next]) {
        setUncontrolled(next);
        latest.current.onChange?.(list[next].id);
      }
    },
    [settle]
  );

  // A controlled `value` changed from outside: follow it.
  useEffect(() => {
    if (selected !== target.current && !drag.current) {
      settle(selected);
    }
  }, [selected, settle]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const keys: Record<string, number> = {
      ArrowRight: (i + 1) % count,
      ArrowLeft: (i - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = keys[e.key];
    if (next === undefined) {
      return;
    }
    e.preventDefault();
    tabRefs.current[next]?.focus();
    select(next, { instant: e.repeat });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!isHighPerformance || count < 2 || (e.pointerType === 'mouse' && e.button !== 0)) {
      return;
    }
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startProgress: progress.get(),
      axis: null,
      width: e.currentTarget.clientWidth || 1,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
  };

  const lockAxis = (current: Drag, e: PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - current.startX;
    const dy = e.clientY - current.startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK) {
      return;
    }
    current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (current.axis === 'x') {
      anim.current?.stop();
      current.startProgress = progress.get();
      current.startX = e.clientX;
      current.samples = [{ x: e.clientX, t: e.timeStamp }];
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.dragging = '';
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== e.pointerId) {
      return;
    }
    if (current.axis === null) {
      lockAxis(current, e);
    }
    if (current.axis !== 'x') {
      return;
    }
    current.samples.push({ x: e.clientX, t: e.timeStamp });
    while (
      current.samples.length > 2 &&
      e.timeStamp - current.samples[0].t > VELOCITY_WINDOW
    ) {
      current.samples.shift();
    }
    const raw =
      current.startProgress - (e.clientX - current.startX) / current.width;
    progress.set(rubberBand(raw, count - 1));
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointerId !== e.pointerId) {
      return;
    }
    drag.current = null;
    delete e.currentTarget.dataset.dragging;
    if (current.axis !== 'x') {
      return;
    }
    if (!cancelled) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
    const first = current.samples[0];
    const vx = (e.clientX - first.x) / Math.max(e.timeStamp - first.t, 1);
    const p = progress.get();
    let next = Math.round(p);
    if (!cancelled && Math.abs(vx) > SWIPE_VELOCITY) {
      next = vx < 0 ? Math.floor(p) + 1 : Math.ceil(p) - 1;
    }
    select(next, { velocity: (-vx * 1000) / current.width });
  };

  const onTablistPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!isHighPerformance || count < 2 || (e.pointerType === 'mouse' && e.button !== 0)) {
      return;
    }
    const firstTab = tabRefs.current[0];
    const avgTabWidth = firstTab?.offsetWidth || 90;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startProgress: progress.get(),
      axis: null,
      width: avgTabWidth,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
  };

  const onTablistPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== e.pointerId) {
      return;
    }
    if (current.axis === null) {
      lockAxis(current, e);
    }
    if (current.axis !== 'x') {
      return;
    }
    current.samples.push({ x: e.clientX, t: e.timeStamp });
    while (
      current.samples.length > 2 &&
      e.timeStamp - current.samples[0].t > VELOCITY_WINDOW
    ) {
      current.samples.shift();
    }
    const raw =
      current.startProgress - (e.clientX - current.startX) / current.width;
    progress.set(rubberBand(raw, count - 1));
  };

  const endTablistDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointerId !== e.pointerId) {
      return;
    }
    drag.current = null;
    delete e.currentTarget.dataset.dragging;
    if (current.axis !== 'x') {
      return;
    }
    if (!cancelled) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 50);
    }
    const first = current.samples[0];
    const vx = (e.clientX - first.x) / Math.max(e.timeStamp - first.t, 1);
    const p = progress.get();
    let next = Math.round(p);
    if (!cancelled && Math.abs(vx) > SWIPE_VELOCITY) {
      next = vx < 0 ? Math.floor(p) + 1 : Math.ceil(p) - 1;
    }
    select(next, { velocity: (-vx * 1000) / current.width });
  };

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = (i: number) => `${baseId}-panel-${i}`;

  const hasContent = items.some((item) => Boolean(item.content));

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Top Tab List Pill */}
      <div className="flex items-center justify-center">
        <div
          aria-label={label}
          className="relative inline-flex max-w-full items-center rounded-full bg-black/40 border border-white/10 p-1 shadow-inner backdrop-blur-md overflow-x-auto no-scrollbar select-none"
          ref={tablistRef}
          role="tablist"
          onPointerDown={hidePanels ? onTablistPointerDown : undefined}
          onPointerMove={hidePanels ? onTablistPointerMove : undefined}
          onLostPointerCapture={hidePanels ? (e) => endTablistDrag(e, false) : undefined}
          onPointerCancel={hidePanels ? (e) => endTablistDrag(e, true) : undefined}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            const isSelected = i === selected && selected >= 0;
            return (
              <button
                aria-controls={hasContent ? panelId(i) : undefined}
                aria-selected={isSelected}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium text-xs sm:text-sm',
                  'text-zinc-400 transition-colors duration-150 ease-out hover:text-white',
                  'outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                )}
                id={tabId(i)}
                key={item.id}
                onClick={() => {
                  if (suppressClick.current) return;
                  select(i);
                }}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                {Icon && <Icon aria-hidden="true" className="size-3.5 sm:size-4" />}
                <span className="whitespace-nowrap">{item.title}</span>
                {item.badge && (
                  <span className="ml-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Sliding Indicator with exact sub-pixel clip path */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 flex p-1 items-center',
              activeColor
            )}
            ref={overlayRef}
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 font-medium text-xs sm:text-sm',
                    activeTextColor
                  )}
                  key={item.id}
                >
                  {Icon && <Icon className="size-3.5 sm:size-4" />}
                  <span className="whitespace-nowrap">{item.title}</span>
                  {item.badge && (
                    <span className="ml-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Swipeable Panels Track (Rendered when content is present and not hidden) */}
      {!hidePanels && hasContent && (
        <div
          className={cn(
            'relative touch-pan-y select-none overflow-hidden rounded-2xl border border-white/10 bg-[#353f49]/80 data-dragging:cursor-grabbing backdrop-blur-xl',
            isHighPerformance ? 'cursor-grab' : ''
          )}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              suppressClick.current = false;
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onLostPointerCapture={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
        >
          <div
            className="flex will-change-transform"
            ref={trackRef}
            style={{
              width: `${count * 100}%`,
              transform: `translate3d(${(-initial * 100) / count}%, 0, 0)`,
            }}
          >
            {items.map((item, i) => (
              <div
                aria-labelledby={tabId(i)}
                className="p-4 sm:p-6 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                id={panelId(i)}
                {...(i !== selected ? { inert: '' as any } : {})}
                key={item.id}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                role="tabpanel"
                style={{
                  width: `${100 / count}%`,
                  opacity: i === initial ? 1 : NEIGHBOUR_OPACITY,
                }}
                tabIndex={i === selected ? 0 : -1}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmoothTab;
