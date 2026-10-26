# CuddleCast 🎬✨

> **Stream Together • Cozy Cinematic Universe**  
> An elevated, luxury streaming frontend with an electric blue visual identity, clean-room reconstruction, and live Supabase synchronization.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-Theme_Blue-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Live_Sync-3ECF8E?logo=supabase)
![HLS.js](https://img.shields.io/badge/Streaming-HLS.js-38bdf8)

---

## ✨ Features

- **CuddleCast Theme Blue Identity**:
  - Deep midnight cinema slate backdrop (`#070b14`), ambient blue radial glows, and electric sapphire (`#2563eb`) to neon cyan (`#38bdf8`) accents.
  - Custom vector logo emblem combining cozy curved cuddle arcs and a cinema play beacon.
- **Profile Gate ("Who's watching?")**:
  - Smooth scale-up avatar grid with real-time profile switching, profile editing modal, and multi-profile sync.
- **Glassmorphic Header & Navigation**:
  - Transparent-to-midnight-blur scroll transitions, electric blue active tab indicator with neon glow, expandable live search (`?q=`), content type filters, and Watch Party / Cuddle Lounge shortcuts.
- **Hero Billboard**:
  - High-res full-viewport billboard crossfading into auto-playing muted HLS video trailer previews (1200ms delay), audio controls, replay button, and glowing `TOP 10 TODAY` badge.
- **Carousel Rails**:
  - Horizontal smooth sliders with glassmorphic paddle controls.
  - **Top 10 Today**: Big stroked SVG numerals (1–10) with neon cyan glow.
  - **Continue Watching**: Glowing sapphire-to-cyan progress bar synced to exact second.
- **Hover Card Portal**:
  - Floats above cards on hover at exact client coordinates with scaled bezier physics, mini preview playback, and instant quick-actions (Play, My List checkmark toggle, Like, and Expand Details).
- **Expanded Title Detail Modal**:
  - Embedded player header, 2-column metadata breakdown, Season selector with episode list, and "More Like This" recommendation cards with match percentages, duration chips, and watchlist toggles.
- **Custom Fullscreen HLS Player**:
  - Interactive scrubbing timeline with hover timecode tooltip, 10s seek buttons, volume memory, speed controls (0.5x to 2x), and next episode preview popup card.
- **Live Supabase Sync & Auto-Fallback Architecture**:
  - Real-time cloud persistence for Watchlists, Likes, Watch Progress, and User Profiles via PostgreSQL on Supabase.
  - Seamless automatic fallback to 170+ authentic captured media items and local storage when offline or when keys are absent.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ManuthMethnidu/CuddleCast.git
cd CuddleCast
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Provide your own TMDB API key or Supabase credentials. If left empty, the application automatically runs in rich offline simulation mode with zero missing states).*

### 4. Run development server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🧪 Build & Verification

```bash
npx tsc --noEmit
npm run build
```

Production build generates verified bundles in `dist/`.
