# Phase 01: Real F1 Free Streaming & Multi-Sport Feeds - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-27
**Phase:** 01-sports-streaming
**Areas discussed:** Stream Architecture & Sourcing, Live Race Telemetry & Timing, Player Experience & Multiview, Series Scope & Schedule Alerts

---

## Stream Architecture & Sourcing (WatchItBetter Analysis)

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Hybrid WatchItBetter Model | Direct HLS (.m3u8) when live + sandboxed embed player with multi-channel switcher (Sky Sports F1 ENG/IT, onboards, international feeds) | ✓ |
| Direct HLS Only | Native in-app video player with Hls.js auto-fallback and quality selector | |
| Iframe Embed Multi-Server Only | Embedded player cards with server mirrors (Server 1, Server 2, Server 3) | |

**User's choice:** Hybrid WatchItBetter Model — Direct HLS (.m3u8) when live + sandboxed embed player with multi-channel switcher.
**Notes:** User specifically instructed to reference and model after `https://watchitbetter.com/`. Inspection confirmed WatchItBetter delivers session timetables across F1, F2, F3, MotoGP with channel playlists (.m3u8) and embed player fallbacks.

---

## Live Race Telemetry & Timing

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Hybrid OpenF1 + Jolpica/Ergast API | Live real-time lap times, gap intervals, tyre strategies, and DRS data during race sessions via OpenF1, with automatic fallback to track simulator when no live session is active | ✓ |
| Pure OpenF1 Live API | Query OpenF1 directly for active weekend sessions only, showing a countdown placeholder when off-track | |
| Local Precision Engine | Realistic lap-by-lap simulation based on real 2026 grid lineups, lap records, and tyre degradation curves for 24/7 interactive racing demo | |

**User's choice:** Hybrid OpenF1 + Jolpica/Ergast API with automatic fallback to track simulator when no live session is active.
**Notes:** Ensures 24/7 engagement even when the real grid is off-track between Grand Prix weekends.

---

## Player Experience & Multiview Layout

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Multiview Command Center | High-impact theater player with channel selector pills, toggleable side panel (Driver Onboard cam / Live Timing Leaderboard / Twitch Chat), and native PiP | ✓ |
| Floating HUD Experience | Fullscreen/Cinematic stream with transparent telemetry heads-up display, sector bar overlay, and quick channel drawer | |
| Grid Studio Layout | Configurable 2x2 or 1+2 multi-stream grid for simultaneous main feed, onboard camera, and data screens | |

**User's choice:** Multiview Command Center with toggleable side panel and native PiP.
**Notes:** Reuses the existing theater layout and provides seamless switching between onboards, telemetry, and stream channels.

---

## Series Scope & Schedule Alerts

| Option | Description | Selected |
|--------|-------------|----------|
| (Recommended) Full Motorsport Tier (F1, F2, F3, MotoGP) + Global Sports (Football, NBA, UFC) | Complete weekend session breakdowns (FP1-3, Qualifying, Sprint, Race) with local timezone auto-detection, live countdowns, and browser alerts | ✓ |
| Formula 1 Dedicated + Global Sports Highlights | Deep F1 Grand Prix focus with race session countdowns and time conversion alongside top football/basketball/MMA matches | |
| Motorsport Exclusive (F1, F2, F3, MotoGP, Moto2, Moto3) | 1:1 WatchItBetter lineup dedicated purely to open-wheel and motorcycle racing with session notifications | |

**User's choice:** Full Motorsport Tier (F1, F2, F3, MotoGP) + Global Sports (Football, NBA, UFC) with complete weekend breakdowns and alerts.
**Notes:** Provides maximum sports breadth while maintaining motorsport depth.

---

## the agent's Discretion

- Selection of resilient CORS proxies and HLS manifest fallback chains.
- Implementation of circuit SVG track maps and sector timing visualization.
- Notification permission request UX following Material 3 guidelines.

## Deferred Ideas

- Social betting / fantasy prediction integration.
- Audio commentary language translation / AI voice dubbed streams.
