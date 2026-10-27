# Phase 01: Real F1 Free Streaming & Multi-Sport Feeds - Context

**Gathered:** 2026-10-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Delivers free live streaming and comprehensive race tracking for Formula 1 Grand Prix sessions (FP1, FP2, FP3, Qualifying, Sprint, Race), companion motorsport series (F2, F3, MotoGP), and global sports (Football/UCL/EPL, NBA, UFC). Sourced using a hybrid architecture inspired by WatchItBetter, providing direct HLS playback alongside sandboxed multi-channel embed switchers (Sky Sports F1 ENG/IT, onboards, international commentary), live OpenF1 telemetry and gap intervals with track simulator fallback, session countdown alerts with local timezone conversion, and a multiview command center.

</domain>

<decisions>
## Implementation Decisions

### Stream Architecture & Sourcing (WatchItBetter Model)
- **D-01:** Hybrid WatchItBetter Streaming Model — Direct HLS (`.m3u8`) playback when live streams are active, paired with sandboxed embed fallback players and multi-channel switchers (e.g., Sky Sports F1 [ENG], Sky Sports F1 [IT], Driver Onboard feeds, international commentary). — **Reversibility:** costly — changes media player pipeline and fallback state machine across all sports channels.
- **D-02:** Sandboxed Embed Security — Embed players must run with strict sandbox permissions: `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"` and `allow="autoplay; fullscreen"`, preventing intrusive ad redirects while preserving full playback capability.
- **D-03:** Live Channel Availability State — Sessions display clear status indicators: Upcoming (with countdown timer), Live (with active stream switcher), and Finished. Coverage pause / reconnect notices displayed if an upstream feed interrupts.

### Race Telemetry & Timing
- **D-04:** Hybrid OpenF1 + Jolpica/Ergast API Integration — Query OpenF1 REST/WebSocket endpoints for live real-time lap times, gap intervals, tyre compounds (Soft, Medium, Hard, Intermediate, Wet), and DRS actuation during live sessions; integrate Jolpica/Ergast for driver and constructor championship standings and 2026 race calendar. — **Reversibility:** costly — connects live external data contract into telemetry HUD.
- **D-05:** Track Simulator Fallback — When no live on-track session is currently active, automatically activate the high-fidelity circuit simulator engine to display dynamic lap simulation, sector timing deltas, and car telemetry for 24/7 interactive preview.

### Player Experience & Multiview Command Center
- **D-06:** Multiview Command Center Layout — Theater-mode player with channel selector pills, toggleable side panel supporting Driver Onboard cameras, Live Timing Leaderboard, or community chat (Twitch darkpopout embed), with native browser Picture-in-Picture (PiP) support. — **Reversibility:** reversible — UI layout component composition in React.
- **D-07:** Material 3 Expressive Controls — Player controls and telemetry panels styled strictly with Material 3 Expressive tokens (`@material/web` buttons, chips, surface containers, high contrast borders).

### Series Scope, Schedule & Notification Alerts
- **D-08:** Expanded Motorsport & Global Sports Lineup — Track complete weekend session breakdowns (FP1-3, Qualifying, Sprint, Race) for Formula 1, Formula 2, Formula 3, and MotoGP, alongside top global sporting events (Champions League, Premier League, NBA, UFC).
- **D-09:** Local Timezone Conversion & Session Countdowns — Auto-detect user's local timezone, display both local and circuit track time, and provide session countdown timers with browser notification triggers for lights out and qualifying starts.

### the agent's Discretion
- Specific stream proxy / CORS proxy selection for upstream HLS manifests.
- Fallback placeholder graphics and circuit track vector renders.
- Stream retry backoff timing (exponential backoff up to 3 retry attempts before fallback to embed mirror).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### External Reference Architecture
- `https://watchitbetter.com/` — Target reference for session schema (`event`, `circuit`, `starts_at`, `state`), channel switcher pills, and embed/HLS dual-mode delivery.
- `https://racetimetable.com` — Upstream source for verified race weekend start times and session timetables across F1, F2, F3, and MotoGP.
- `https://openf1.org/` — Open-source F1 live timing and telemetry API specification (car data, intervals, laps, pit, weather).

### Internal Architecture & Design System
- `.planning/PROJECT.md` — Project core value and scope boundaries.
- `.planning/ROADMAP.md` — Phase 1 goals and success criteria.
- `src/types/material-web.d.ts` — Material Web component JSX augmentations.
- `src/components/LiveSportsView.tsx` — Current sports view implementation with schedule, mock telemetry, and 24/7 motorsport streams.
- `src/components/VideoPlayer.tsx` — Hls.js player with error recovery and responsive fullscreen.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/LiveSportsView.tsx`: Already contains driver/constructor standings, Grand Prix calendar, verified 24/7 motorsport channels (MAVTV, Red Bull TV, FloRacing, PowerNation, Top Gear), and circuit telemetry cards.
- `src/components/VideoPlayer.tsx`: Built with `hls.js` supporting HLS stream recovery, video source switching, and fallback handling.
- `@material/web`: Registered buttons (`<md-filled-button>`, `<md-outlined-button>`, `<md-filled-tonal-button>`), tabs (`<md-tabs>`, `<md-primary-tab>`), and chips.

### Established Patterns
- High-contrast dark theme surfaces with `--md-sys-color-surface-container` and custom theme accent color borders (`#0070F3`, etc.).
- Embedded iframes configured with strict referrer policy (`strict-origin-when-cross-origin`) and secure sandboxing.

### Integration Points
- Sports tab in `Navbar.tsx` and mobile bottom navigation routes directly into `LiveSportsView.tsx`.
- Video playback hooks into the global player modal or theater mode player.

</code_context>

<specifics>
## Specific Ideas

- Modeled after `https://watchitbetter.com/`: clean dark theater layout, session cards showing official circuit hero art, series badges with official hex colors (F1: `#FF1801`, F2: `#1C78FB`, F3: `#102D5C`, MotoGP: `#EF0000`), channel switcher pills, and dual-mode embed / direct HLS.
- Twitch darkpopout chat option for community race watch parties (`https://www.twitch.tv/embed/watchitbetter/chat?darkpopout=true`).

</specifics>

<deferred>
## Deferred Ideas

- Social betting / fantasy prediction integration — belongs in a dedicated social or gamification phase.
- Audio commentary language translation / AI voice dubbed streams — future phase candidate.

</deferred>

---

*Phase: 01-sports-streaming*
*Context gathered: 2026-10-27*
