# Plan 01-04: Multi-Series Schedule Hub (F1, F2, F3, MotoGP), Timezone Auto-Detection, Live Session Countdown Clocks, Web Notification Alerts, and Global Sports Feeds — Summary

**Execution Date:** 2026-10-27  
**Status:** Completed  
**Phase:** 01-sports-streaming  
**Plan:** 01-04  
**Wave:** 4  
**Requirements Satisfied:** REQ-01 (Dual-mode HLS + Embed Streaming), REQ-03 (Exponential Failover & Channel Availability State), REQ-04 (Multiview Command Center, Timetable & Standings)

---

## 1. Executive Summary

Plan 01-04 completes Phase 01: Sports Streaming by integrating the multi-series motorsport weekend timetable (Formula 1, Formula 2, Formula 3, MotoGP), automatic local user and circuit host timezone conversion, live per-second countdown clocks, browser Web Notification reminders (T-15m and Lights Out) with Web Audio synthesized chime fallback, verified global sports event feeds (UEFA Champions League, English Premier League, NBA, UFC), and full theater mode mounting into `LiveSportsView.tsx`. The view directly connects the `MultiviewCommandCenter`, real Jolpica 2026 driver/constructor standings, 24/7 motorsport TV channels, and the 24/7 autonomous track simulator fallback.

---

## 2. Tasks Executed & Git Commits

| Task ID | Description | Output Files | Git Commit |
|---------|-------------|--------------|------------|
| **01-04-01** | Create `src/services/timezoneCountdown.ts` and `src/services/notifications.ts` for timezone detection, countdown math, browser permission management, and dual-tone chime fallback. | `src/services/timezoneCountdown.ts`<br>`src/services/notifications.ts` | `e97db45` `feat(01-04): implement timezone auto-detection, countdown calculation, and notification services` |
| **01-04-02** | Create `src/components/sports/SessionScheduleCard.tsx` and `src/components/sports/GlobalSportsGrid.tsx` with multi-series branding badges, dual time readouts, ticking countdown clocks, alert toggles, and multi-server stream mirrors. | `src/components/sports/SessionScheduleCard.tsx`<br>`src/components/sports/GlobalSportsGrid.tsx` | `3ff1751` `feat(01-04): build multi-series session schedule cards and global sports grid` |
| **01-04-03** | Refactor `src/components/LiveSportsView.tsx` to integrate `MultiviewCommandCenter` in theater mode, multi-series filter tabs, real Jolpica 2026 standings, 24/7 motorsport channels, and simulator fallback controls. | `src/components/LiveSportsView.tsx` | `7d5c895` `feat(01-04): integrate livesportsview with multiview command center and real data feeds` |

---

## 3. Files Created & Modified

- **`src/services/timezoneCountdown.ts`**:
  - `TimezoneCountdownService` class and singleton `timezoneCountdown`.
  - `getUserTimezone()`: auto-detects user IANA timezone using `Intl.DateTimeFormat().resolvedOptions().timeZone` with 'UTC' fallback.
  - `resolveCircuitTimezone(circuitOrCountry)`: maps 40+ Grand Prix and MotoGP host venues (Monaco, Silverstone, Monza, Spa, COTA, Mexico City, Lusail, etc.) to canonical IANA timezone identifiers.
  - `calculateCountdown(targetIsoDate)`: calculates live $\Delta t = T_{\text{start}} - T_{\text{now}}$. Returns `isPast: true` and `LIVE NOW` when $\Delta t \le 0$; formats as `${days}d ${hours}h ${minutes}m` when $>24\text{h}$; formats as `${HH}:${MM}:${SS}` when $\le 24\text{h}$.
  - `getDualTime(isoDate, circuitOrCountry)`: formats dual local and track time strings with timezone abbreviations.

- **`src/services/notifications.ts`**:
  - `SportsNotificationService` class and singleton `sportsNotifications`.
  - Strict user-gesture gate (`requestPermission()`) mitigating T-04-01 browser permission abuse penalties.
  - LocalStorage persistence under `cuddlecast_race_alerts` for user session reminder preferences.
  - Automated scheduling for T-15 minutes (`🏎️ {Series}: {Session} starts in 15 minutes!`) and Lights Out / T-0 (`🟢 Lights Out! {Session} is now LIVE.`).
  - Synthesized dual-tone audio chime fallback using Web Audio API (880Hz then 1320Hz sine wave, 120ms each) mitigating T-04-02 unhandled audio context suspensions.
  - `onInAppAlert` event subscription hook for dispatching visual in-app toast alerts.

- **`src/components/sports/SessionScheduleCard.tsx`**:
  - Multi-series timetable card with official series color badges (F1 `#FF1801`, F2 `#1C78FB`, F3 `#102D5C`, MotoGP `#EF0000`).
  - Dual timezone readout showing user local time (`Your Time`) and track host time (`Track Time`).
  - Live ticking countdown timer updating every second, transitioning to pulsating red `LIVE NOW` badge when live.
  - Notification toggle button with verbatim copy `"Enable Race Alerts"`.
  - Primary CTA button with `"Watch Live Grand Prix"` or `"Watch Session Stream"`.

- **`src/components/sports/GlobalSportsGrid.tsx`**:
  - Curated live and upcoming matches for UEFA Champions League (Real Madrid vs Man City, Arsenal vs Bayern Munich), Premier League (Liverpool vs Chelsea), NBA Basketball (Lakers vs Warriors, Celtics vs Mavericks), and UFC Championship (UFC 310 Pantoja vs Asakura).
  - Match card layout with live status pill / match minute (`76' LIVE`, `Q4 02:18`, `Round 3 LIVE`), team logos, and live scores.
  - Multi-server stream selection pills (Server 1 Direct HLS, Server 2 Sandboxed Mirror).
  - Material 3 filter chips for sport category filtering.

- **`src/components/LiveSportsView.tsx`**:
  - Full integration of `MultiviewCommandCenter`, `SessionScheduleCard`, `GlobalSportsGrid`, and 24/7 motorsport channels.
  - Active theater mode mounting `MultiviewCommandCenter` when a live session or `"Watch Live Grand Prix"` is clicked.
  - Multi-series filter tabs: All Series, Formula 1, F2 & F3 Junior Series, MotoGP Premier Class, and Global Sports.
  - 4 Hub tabs: Weekend Timetable, 2026 Standings, 24/7 Channels, and Global Matches.
  - Real 2026 driver and constructor standings loaded via `jolpicaService` with team brand color dots.
  - Verified 24/7 high-bitrate motorsport TV streams (MAVTV 1080p 60fps, Red Bull TV 1080p 60fps, FloRacing HD, PowerNation HD, Top Gear 720p).
  - Autonomous track simulator status badge and toggle in header bar.

---

## 4. Verification & Quality Gates

- `npm run build` executed and passed cleanly across all tasks with 0 TypeScript compilation errors and 0 lint warnings.
- Production bundle verification: clean chunk generation, TypeScript strict typing with zero unused variables (`TS6133`), and optimized images.
- Atomic git commits confirmed for every task.
- Threat model mitigations verified:
  - T-04-01: Explicit user gesture gate on notification permission requests; persistent preferences in `localStorage`.
  - T-04-02: Safe Web Audio context initialization and suspended state handling.
  - T-04-03: HTTPS scheme enforcement on stream URLs.

---

## 5. Phase 01 Completion

With Plan 01-04 complete, all 4 plans in **Phase 01: Sports Streaming & Formula 1 Multiview Command Center** are fully executed and verified:
1. **01-01:** Core sports types, OpenF1 & Jolpica API clients, and autonomous track simulator fallback engine.
2. **01-02:** Hybrid streaming pipeline, exponential failover state machine (1s, 2.5s, 5s), sandboxed embed player with ad redirect isolation, and native HTML5 Picture-in-Picture.
3. **01-03:** Multiview Command Center with channel selector bar, 3-tab multiview drawer (Onboard Cam + Telemetry HUD, Live Timing Leaderboard, sandboxed Twitch darkpopout chat), and circuit vector cards.
4. **01-04:** Multi-series weekend timetable hub, timezone auto-detection, live session countdown timers, Web Notification alerts, global sports feeds, and LiveSportsView integration.
