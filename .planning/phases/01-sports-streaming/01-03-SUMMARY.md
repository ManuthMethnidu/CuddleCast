# Plan 01-03: Multiview Command Center Player with Channel Pills, 3-Tab Multiview Drawer (Onboard Cam + Telemetry HUD, Live Timing Leaderboard, Twitch Chat), and Circuit Vector Cards — Summary

**Execution Date:** 2026-10-27  
**Status:** Completed  
**Phase:** 01-sports-streaming  
**Plan:** 01-03  
**Wave:** 3  
**Requirements Satisfied:** REQ-04 (Multiview Command Center, Driver Onboard & Pit Wall Feeds, 20-Driver Live Timing Leaderboard, and Twitch Watch Party Chat)

---

## 1. Executive Summary

Plan 01-03 delivers the complete premier motorsport command center layout conforming to `01-UI-SPEC.md` and implementing D-06 (Multiview Command Center Layout) and D-07 (Material 3 Expressive Controls). The Command Center pairs the primary 16:9 theater stream viewport with horizontal 1-click channel selector pills (Sky Sports ENG, IT, Onboards, Pit Wall) and a collapsible 3-tab drawer providing secondary Driver Onboard video feeds with real-time car telemetry, a 20-driver Live Timing Leaderboard with official Pirelli tyre compound badges and DRS statuses, and an embedded sandboxed Twitch watch party chat with strict origin security. High-contrast vector circuit cards deliver dynamic sector awareness and track metadata.

---

## 2. Tasks Executed & Git Commits

| Task ID | Description | Output Files | Git Commit |
|---------|-------------|--------------|------------|
| **01-03-01** | Create `ChannelSelectorBar.tsx`, `TelemetryHud.tsx`, and `CircuitVectorCard.tsx` with Material 3 Expressive filter chips, high-density telemetry gauges, and neon circuit vector SVGs. | `src/components/sports/ChannelSelectorBar.tsx`<br>`src/components/sports/TelemetryHud.tsx`<br>`src/components/sports/CircuitVectorCard.tsx` | `e2a8de5` `feat(01-03): implement channel selector bar, circuit vector card, and telemetry hud` |
| **01-03-02** | Create `LiveTimingLeaderboard.tsx` with full 20-driver grid, sticky table headers, driver acronyms, interval/gap deltas, sector colors (Purple, Green, Yellow), Pirelli tyre compound badges, and pit status indicators. | `src/components/sports/LiveTimingLeaderboard.tsx` | `5b37d68` `feat(01-03): build live timing leaderboard with tyre compounds and sector deltas` |
| **01-03-03** | Create `MultiviewCommandCenter.tsx` with 70/30 theater layout, collapsible 3-tab drawer (Onboard Cam + Telemetry HUD, Live Timing, Twitch Darkpopout Chat), and dynamic fallback between OpenF1 and Circuit Simulator. | `src/components/sports/MultiviewCommandCenter.tsx` | `1162f99` `feat(01-03): implement multiview command center with 3-tab drawer and twitch chat` |

---

## 3. Files Created & Modified

- **`src/components/sports/ChannelSelectorBar.tsx`**:
  - Horizontal scrollable pill strip (`no-scrollbar`) styled with Material 3 Expressive filter chips.
  - Highlights active channel with `#0070F3` border, `rgba(0, 112, 243, 0.15)` background glow, and active status ping indicator.
  - Displays channel name, bitrate chips (`1080p 60fps`, `720p 60fps`), and offline state indicators with accessible `aria-label` tags.

- **`src/components/sports/TelemetryHud.tsx`**:
  - Real-time high-density motorsport telemetry HUD formatted with tabular monospace digits.
  - Big speed readout (`km/h`) and gear indicator (`GEAR 7` / `NEUTRAL`).
  - Dynamic RPM tachometer bar with redline warning above 11,500 RPM.
  - Dual pedal progress bars: Throttle (emerald `#22C55E`) and Brake (red `#EF4444`).
  - Pulsating DRS activation badge with `#0070F3` accent glow (`DRS ACTIVE` vs `DRS OFF`).
  - Weather and track status badge supporting `GREEN`, `YELLOW`, `RED`, `SC`, and `VSC`.

- **`src/components/sports/CircuitVectorCard.tsx`**:
  - High-contrast SVG circuit vector path styled with crisp neon lines over `#353f49` card background.
  - Distinctive geometries for Monaco, Silverstone, Monza, Spa, COTA, and Mexico Grand Prix tracks.
  - Sector 1 (`#A855F7`), Sector 2 (`#22C55E`), and Sector 3 (`#EAB308`) mini-split markers.
  - Cyan dashed DRS activation zones and Start/Finish line markers.
  - Circuit metadata specifications: Length (`km`), Race Laps, Turns count, and Official Lap Record with holder name.

- **`src/components/sports/LiveTimingLeaderboard.tsx`**:
  - 20-driver timing grid with sticky table headers and vertical scrolling.
  - Positions `P1` (gold), `P2` (silver), `P3` (bronze), and `P4`..`P20`.
  - Team color accent strip, driver acronyms (`VER`, `NOR`, `LEC`), and car numbers.
  - Gap to leader and interval times formatted in tabular monospace.
  - Color-coded mini sector chips: Purple (fastest overall `#A855F7`), Green (personal best `#22C55E`), Yellow (normal `#EAB308`).
  - Official Pirelli tyre compound pills with compound letter and age in laps: Soft (`#FF3333`), Medium (`#FFD700`), Hard (`#FFFFFF`), Intermediate (`#39B54A`), Wet (`#0099FF`).
  - Amber `PIT` badge when car enters pit lane and `DRS` badge when active.
  - Clickable driver row switching onboard feed to selected driver.

- **`src/components/sports/MultiviewCommandCenter.tsx`**:
  - Desktop 70/30 split layout pairing `TheaterStreamPlayer` with collapsible 3-tab Multiview Drawer.
  - Tab 1 ("Onboard"): Secondary driver cockpit video cam with selected driver's `TelemetryHud` and quick driver switcher carousel.
  - Tab 2 ("Timing"): Full 20-driver `LiveTimingLeaderboard`.
  - Tab 3 ("Chat"): Sandboxed Twitch darkpopout chat iframe (`https://www.twitch.tv/embed/watchitbetter/chat?darkpopout=true&parent=${hostname}`).
  - Strict iframe security: sandboxed with `allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox` and zero top-navigation privileges (T-03-01).
  - Autonomous fallback: seamlessly subscribes to `circuitSimulator` (or polls `openF1Service`), automatically switching to the 24/7 simulator when off-track (T-03-02).
  - Material 3 Expressive Action Bar: `<md-filled-tonal-button>` for toggling simulator vs live OpenF1, `<md-icon-button>` for drawer collapse.
  - Responsive layout: Adapts to mobile viewports (`< 1024px`) with an expandable accordion drawer below the player canvas.

---

## 4. Verification & Quality Gates

- `npm run build` executed and passed cleanly across all tasks with 0 TypeScript compilation errors and 0 lint failures.
- Production bundle verification: clean chunk generation and image optimization.
- Atomic git commits confirmed for every task.
- Security threat mitigations verified:
  - T-03-01: Sandboxed Twitch chat with encoded parent domain and omitted `allow-top-navigation`.
  - T-03-02: React `useEffect` cleanups unsubscribing from `circuitSimulator` and clearing `openF1Service` polling intervals on unmount.
  - T-03-03: Pure React text node rendering preventing script injection.

---

## 5. Next Steps

With Plan 01-03 complete, the complete Phase 01: Sports Streaming and Multiview Command Center pipeline is fully implemented across Waves 1, 2, and 3. The foundation is ready for Phase 01 verification and integration into the global sports view.
