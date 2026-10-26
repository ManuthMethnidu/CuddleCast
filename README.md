# CuddleCast 🎬

> A 1:1 clean-room frontend reconstruction of [Vidbox](https://vidbox.wtf/), reverse-engineered using **REA** (`reverse-engineer-anything`) with full DOM, CSSOM, bundle, and runtime evidence.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite)
![HLS.js](https://img.shields.io/badge/Streaming-HLS.js-red)

---

## ✨ Features

- **Profile Gate**: "Who's watching?" profile selection screen with avatar management and add/edit flows.
- **Glassmorphic Sticky Navbar**: Responsive layout, expandable search bar with filter toggles and live URL syncing (`?q=`), dark/light theme switch, and profile switcher.
- **Hero Billboard**: Full-viewport container with high-res backdrop crossfading into auto-playing muted HLS video trailer preview (1200ms delay), audio controls, replay button, and custom logo typography.
- **Carousel Rails**:
  - Horizontal scrolling rows with left/right navigation paddles.
  - **Top 10 Today**: Oversized SVG rank numerals tucked behind posters.
  - **Continue Watching**: Live red playback progress bar synced to playback seconds.
- **Hover Card Portal**: Floats on hover at exact client coordinates with scaled physics, preview playback, and quick-action buttons (Play, My List checkmark toggle, Like, and Expand Details).
- **Expanded Title Detail Modal**: Embedded player header, 2-column metadata breakdown, Season selector with episode list, and "More Like This" recommendation grid.
- **Custom Fullscreen HLS Player**: Scrubbing timeline with hover timecode tooltip, 10s seek buttons, volume memory, speed controls (0.5x to 2x), and next episode preview popup.
- **Smart Auto-Fallback Architecture**: Seamlessly falls back to 170+ authentic captured titles and `localStorage` persistence when TMDB/Supabase API keys are not supplied.

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
npm run build
```

Production build generates verified bundles in `dist/`.
