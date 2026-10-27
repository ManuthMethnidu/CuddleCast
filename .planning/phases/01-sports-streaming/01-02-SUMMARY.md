# Plan 01-02: Hybrid WatchItBetter Streaming Pipeline, Exponential Failover (1s, 2.5s, 5s), Sandboxed Iframe Player, and HTML5 Native Picture-in-Picture — Summary

**Execution Date:** 2026-10-27  
**Status:** Completed  
**Phase:** 01-sports-streaming  
**Plan:** 01-02  
**Wave:** 2  
**Requirements Satisfied:** REQ-01 (Dual-mode HLS + Embed Streaming), REQ-03 (Exponential Failover & Channel Availability State)

---

## 1. Executive Summary

Plan 01-02 implements the resilient dual-mode streaming pipeline and failover orchestration engine modeled after WatchItBetter for CuddleCast Live Sports and Formula 1. It delivers high-bitrate direct HLS playback (`.m3u8`) with low latency mode and HTML5 native Picture-in-Picture (PiP). When upstream live feeds drop, fatal network errors occur, or retries exhaust, an automated 4-state exponential failover state machine (retrying at 1s, 2.5s, 5s) seamlessly transitions to a secure, sandboxed embed mirror without breaking user immersion or exposing the user to intrusive top-navigation ad redirects.

---

## 2. Tasks Executed & Git Commits

| Task ID | Description | Output Files | Git Commit |
|---------|-------------|--------------|------------|
| **01-02-01** | Create `src/services/streamFailover.ts` with 4-state failover manager (`HLS_PRIMARY` -> `RETRYING` with 1s, 2.5s, 5s backoff -> `EMBED_FALLBACK` -> `CHANNEL_MIRROR`), channel health status tracking, and error categorization. | `src/services/streamFailover.ts` | `703e305` `feat(01-02): implement stream failover state machine and retry manager` |
| **01-02-02** | Create `src/components/sports/SandboxedEmbedPlayer.tsx` with strict `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"` (excluding `allow-top-navigation`), `referrerPolicy="strict-origin-when-cross-origin"`, loading shimmer, and coverage paused/offline overlays. | `src/components/sports/SandboxedEmbedPlayer.tsx` | `4f9a069` `feat(01-02): build sandboxed embed player with ad redirect isolation` |
| **01-02-03** | Create `src/components/sports/TheaterStreamPlayer.tsx` combining Hls.js low-latency streaming and SandboxedEmbedPlayer fallback, with stream health badge, HTML5 Picture-in-Picture (`video.requestPictureInPicture()`), fullscreen controls, and Material 3 Expressive tokens. | `src/components/sports/TheaterStreamPlayer.tsx` | `4407331` `feat(01-02): implement theater stream player with hls and native pip` |

---

## 3. Files Created & Modified

- **`src/services/streamFailover.ts`**:
  - `StreamFailoverManager`: Finite state machine governing transitions between `'HLS_PRIMARY'`, `'RETRYING'`, `'EMBED_FALLBACK'`, and `'CHANNEL_MIRROR'`.
  - Configurable exponential backoff schedule: `[1000, 2500, 5000]` ms (1s, 2.5s, 5s).
  - Error categorization engine: `categorizeHlsError()` classifying `NETWORK_ERROR`, `MEDIA_ERROR`, `KEY_SYSTEM_ERROR`, `MUX_ERROR`, and `UNKNOWN_ERROR`.
  - Channel health status tracker: tracking `EXCELLENT`, `DEGRADED`, `FAILED`, and `OFFLINE` status per channel.
  - Subscriptions: `onStateChange()` and `onRetry()` event hooks with full timer cleanup and destruction lifecycle (`reset()`, `destroy()`).
  - Verbatim error copywriting alignment with `01-UI-SPEC.md`.

- **`src/components/sports/SandboxedEmbedPlayer.tsx`**:
  - Secure 16:9 iframe embed player enforcing strict sandboxing (`sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`).
  - Explicit omission of `allow-top-navigation` and `allow-top-navigation-by-user-activation` to neutralize malicious third-party ad hijacking (T-02-01).
  - Enforced `referrerPolicy="strict-origin-when-cross-origin"` preventing external query token leakage (T-02-02).
  - Centered `<md-circular-progress indeterminate>` spinner with "Connecting to secure stream mirror..." loading shimmer.
  - Coverage paused / offline overlay with high-contrast amber warning and retry triggers.
  - Visual security indicator badge: "Sandboxed Mirror • Ad Redirects Blocked".

- **`src/components/sports/TheaterStreamPlayer.tsx`**:
  - Responsive 16:9 aspect ratio container (`aspect-ratio: 16 / 9`, background `#303841`, subtle `#0070F3` accent glow, CLS 0.0).
  - Low-latency Hls.js playback (`enableWorker: true`, `lowLatencyMode: true`, `backBufferLength: 60`) with Safari native HLS fallback.
  - StreamFailoverManager integration displaying amber retry status alert:
    `"Stream Connection Failed: Unable to reach primary HLS stream. Retrying connection (Attempt 1 of 3) before switching to secure mirror..."`
  - Automated transition to `SandboxedEmbedPlayer` with embed fallback banner:
    `"Primary Stream Offline: Switched to Sandboxed Embed Mirror 1. If playback does not begin, choose Channel 2 from the switcher above."`
  - Interrupted session overlay docked across top:
    `"Broadcaster Feed Interrupted: Upstream broadcast temporarily paused. Standing by for live feed restoration..."`
  - Native HTML5 Picture-in-Picture (`video.requestPictureInPicture()`) with graceful disabled tooltip when sandboxed embeds are active:
    `"Picture-in-Picture requires direct HLS stream. Switch to HLS feed for floating player."`
  - Fullscreen toggle, audio mute/unmute, retry triggers, and stream health status badge (`1080p 60fps • HLS Live` vs `Embed Mirror 1 • Sandboxed`).

---

## 4. Verification & Quality Gates

- `npm run build` executed and compiled cleanly with zero TypeScript errors and zero lint failures.
- Zero layout shift: locked 16:9 CSS aspect ratio enforced across all player modes.
- Atomic commits completed and verified in git history.

---

## 5. Next Steps

Ready for Plan 01-03: Multiview Command Center, Driver Onboard & Pit Wall Feeds, 20-Driver Live Timing Leaderboard, and Twitch Watch Party Chat.
