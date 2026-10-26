# DX.BI · CuddleCast 🎬✨

> **A 1:1 Clean-Room Frontend Reconstruction of [dxbi-stremio](https://github.com/notdxbi/dxbi-stremio) & Vidbox**  
> A Netflix-style cinematic streaming application for movies, series, and trailers with live Supabase synchronization, interactive hover previews, encrypted watch parties, and a full picture & sound processing panel.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Live_Sync-3ECF8E?logo=supabase)
![HLS.js](https://img.shields.io/badge/Streaming-HLS.js-38bdf8)

---

## ✨ 1:1 DX.BI Design System & Features

### 1. The Rotating Billboard (`.dx-hero`)
- Full-viewport container (`min(84vh, 58vw)`) with multi-directional cinematic shade vignette.
- **Ken Burns panning zoom** (`animation: dx-kenburns 16s linear both`) on backdrop imagery.
- Traced trailer autoplay preview (1200ms delay) with audio mute/unmute and replay controls.
- **Kicker & Stylized Typography**: Bold title artwork or high-contrast clamp header.
- **Metadata Bar**: Neon emerald match percentage (`98% Match`), authentic yellow IMDb pill (`IMDb 8.7`), release year, `4K UHD`, `HDR`, and `5.1 AUDIO` pills.
- **Buttons**:
  - Solid white primary `Play` button with black icon & text.
  - Frosted glass `More Info` button (`rgba(109, 109, 118, 0.55)` with 8px backdrop blur).
- **Animated Progress Dots**: Horizontal line progress indicators where the active dot grows to 3.2rem with smooth left-to-right filling animation (`animation: dx-progress 9s linear both`).

### 2. Carousel Rails & Poster Cards
- Horizontal smooth-scrolling rails with page dashes in the top-right corner.
- Side navigation arrows (`.dx-arrow-prev`, `.dx-arrow-next`) that float on row hover with gradient masks and scale-125 icons.
- **IMDb Badges on Posters**: Glassmorphic badges (`rgba(0, 0, 0, 0.75)`) in the top-left of posters showing authentic IMDb ratings with yellow marks.
- **Wide Continue Watching**: Landscape cards with title art, progress bar in the active accent color, and remove/info actions.
- **Top 10 Today**: Oversized stroked SVG rank numerals (1–10) tucked behind posters.

### 3. Hover Preview Card (`.dx-preview`)
- Floats over cards at exact client coordinates.
- **Artwork Aura Glow (`.dx-preview-aura`)**: The title's own artwork blurred at 32px saturating behind the card for an atmospheric colored halo.
- Inner card `#181818` with hairline inset border (`box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08)`).
- Media player with slow zoom animation (`dx-preview-zoom`).
- Round action buttons (`.dx-round`): Solid white Play, My Library toggle with checkmark, Thumbs Up like, and Expand Details chevron.

### 4. Detail Page & Critic Reviews (`.dx-detail`)
- Embedded trailer player header with gradient fade.
- 2-column metadata breakdown with cast credits and audio options.
- **Critic Score Cards**: Rotten Tomatoes tomato pill (`🍅 94%`), Metacritic score (`84`), and IMDb rating.
- **Critic Reviews Section**: Authentic review quotes from outlets like *Variety* and *The Hollywood Reporter*.
- Season dropdown selector and full episode list with thumbnails, durations, and play icons.
- "More Like This" recommendations grid.

### 5. Fullscreen Player & Picture/Sound Panel (`.dx-player`, `.dx-panel`)
- Fullscreen custom HLS player with 10s seek buttons, volume memory, and scrubbing timeline with hover timecode tooltip.
- **Picture & Sound Processing Panel (Press `D` or click Sliders)**:
  - *Remove black bars* / Aspect ratio zoom (100%, 110%, 125%, 133%).
  - *Sound*: Dialogue boost (lifts speech & center frequencies) and Night mode.
  - *Subtitle sync*: Click-to-sync subtitle lines and ±0.25s fine-tuning.
  - *Stream stats*: 4K resolution, HEVC codec, HDR10, bitrate, audio channels, buffer health.
- **Up Next Countdown Card**: Floating popup in final 20 seconds with Next Episode preloading.

### 6. Encrypted Watch Party Modal
- Host or join synchronized watch rooms with unique party codes.
- Real-time simulated participants and live reaction chat.
- End-to-end encrypted design.

### 7. Dynamic 8-Accent Switcher
- Choose between **Electric Blue** (CuddleCast default), **Cinema Red** (classic DX.BI), **Crimson**, **Violet**, **Emerald**, **Amber**, **Neon Pink**, and **Mono White** on the fly via the palette button in the top bar.

---

## 🚀 Getting Started

### 1. Clone repository
```bash
git clone https://github.com/ManuthMethnidu/CuddleCast.git
cd CuddleCast
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
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
