# Roadmap: CuddleCast

## Overview

CuddleCast is a high-performance streaming, radio atlas, and live TV/sports web application built on Material 3 Expressive design. Phase 1 delivers real free Formula 1 streaming, motorsport coverage, and multi-sport feeds with robust fallback streams, live timing, and interactive circuit telemetry.

## Phases

- [ ] **Phase 1: Real F1 Free Streaming & Multi-Sport Feeds** - Integrate reliable free F1 streaming sources, live race sessions, multi-sport events, and dynamic telemetry.

## Phase Details

### Phase 1: Real F1 Free Streaming & Multi-Sport Feeds

**Goal**: Deliver reliable free live streaming for Formula 1 races, practice/qualifying sessions, motorsport channels, and major global sports (football, basketball, fighting), with stream failover, session schedule tracking, and live telemetry data.
**Depends on**: Nothing (first phase)
**Requirements**: [REQ-01, REQ-02, REQ-03, REQ-04]
**Success Criteria** (what must be TRUE):
  1. Users can watch live Formula 1 Grand Prix sessions and 24/7 motorsport channels with automatic stream failover.
  2. Live timing, lap gaps, tire compounds, and session status reflect current or upcoming race weekends.
  3. Multi-sport live feeds (Champions League, Premier League, NBA, UFC) stream smoothly via direct HLS / embed fallbacks.
  4. Material 3 Expressive UI provides high-contrast controls, circuit telemetry cards, and multi-view/pip capabilities.

**Plans**: 4 plans

Plans:
**Wave 1**
- [ ] 01-01: Core Sports Types, OpenF1 & Jolpica API Integration, and High-Fidelity Autonomous Track Simulator Fallback Engine

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 01-02: Hybrid WatchItBetter Streaming Pipeline, Exponential Failover (1s, 2.5s, 5s), Sandboxed Iframe Player, and HTML5 Native Picture-in-Picture

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 01-03: Multiview Command Center Player with Channel Pills, 3-Tab Multiview Drawer, and Circuit Vector Cards

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 01-04: Multi-Series Schedule Hub (F1, F2, F3, MotoGP), Timezone Auto-Detection, Live Session Countdown Clocks, Web Notification Alerts, and Global Sports Feeds
