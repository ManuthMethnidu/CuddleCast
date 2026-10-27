---
phase: "01"
slug: "sports-streaming"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-27"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (`tsc`) + Vite production build + Vitest (Wave 0) |
| **Config file** | `tsconfig.json` / `vite.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Full build must be green (exit code 0)
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | REQ-02 | — | Validates OpenF1 & Jolpica API client response typing and fallback | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | REQ-02 | — | High-fidelity track simulator produces continuous lap times and tyre wear | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | REQ-01 | T-01-01 | Sandboxed embed player prevents unwanted popup escapes and redirect scripts | integration | `npm run build` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | REQ-01 | T-01-02 | Exponential retry failover transitions to mirror embed upon HLS error | integration | `npm run build` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | REQ-04 | — | Multiview command center renders channel pills, PiP trigger, and side panels | visual/unit | `npm run build` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 4 | REQ-03 | — | Timezone conversion and session countdown calculations calculate accurate offsets | unit | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/openf1.ts` — Typed client for OpenF1 API and fallback simulation data
- [ ] `src/services/circuitSimulator.ts` — Continuous autonomous F1 telemetry and timing simulation engine
- [ ] `src/types/sports.ts` — Comprehensive data types for sessions, channels, standings, and telemetry

---

## Manual-Only Verifications

| Behavior | Why Manual-Only | Test Procedure |
|----------|-----------------|----------------|
| Live HLS / Embed Stream Playback | Third-party video stream delivery across browser codecs and CSP | Select channel, observe video rendering, audio playback, and quality switching |
| Picture-in-Picture (PiP) | Browser native PiP window requires user gesture | Click PiP button in player controls, verify video detaches into floating overlay |
| Browser Session Notifications | Requires notification permissions and system notification daemon | Click "Enable Alerts" for upcoming Grand Prix, confirm browser permission prompt |
