# CuddleCast — Edge Caching & CDN Delivery Architecture

## 1. Overview
In a media streaming application like CuddleCast, hundreds or thousands of clients simultaneously query the same media manifests, metadata payloads, and video chunks. Streaming directly from the origin server or database introduces latency spikes, bandwidth saturation, and buffering lag.

To achieve an initial playback start time under **200ms (TTFB < 50ms)**, CuddleCast deploys an **Edge Delivery Layer** directly in front of the Supabase data layer and upstream HLS transcoding origins.

```
                    ┌───────────────────────────┐
                    │  CuddleCast Client (Web)  │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │  Edge CDN (Cloudflare /   │
                    │         BunnyCDN)         │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │ (Cache Miss)                                    │ (Cache Miss)
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│  HLS Video / Live│                              │ Supabase DB &    │
│  Media Transcoder│                              │ Edge Functions   │
└──────────────────┘                              └──────────────────┘
```

---

## 2. Recommended Providers

| Feature | Cloudflare Media Edge | BunnyCDN Video Stream |
| :--- | :--- | :--- |
| **Primary Strength** | Global Anycast network (330+ PoPs), built-in DDoS shielding, Workers for HMAC token validation | Ultra-low cost per TB, optimized for video chunk caching, integrated Per-Second Storage |
| **TTFB Target** | `< 45ms` global average | `< 55ms` global average |
| **Tiered Cache** | Cloudflare Tiered Cache & Argo Smart Routing | Origin Shield enabled in 3 strategic regions |
| **HLS Optimization** | Byte-Range request caching (`Range: bytes=`) | Custom Video Delivery engine with automated MP4-to-HLS repackaging |

---

## 3. Cache Rules Configuration

### Rule 1: HLS Live Playlist Manifests (`*.m3u8`)
Live manifests update on every video fragment cycle and must not be cached indefinitely, yet must absorb client bursts:
* **Match**: `*.m3u8`
* **Edge TTL**: `2 seconds` (for Live TV / IPTV) or `300 seconds` (for VOD master playlists)
* **Browser Cache**: `no-cache, must-revalidate`
* **Stale-While-Revalidate**: `3 seconds`
* **Tiered Cache**: Enabled (coalesces requests to origin)

### Rule 2: HLS Media Chunks & Segments (`*.ts`, `*.m4s`, `*.mp4`)
Video chunks are immutable once written:
* **Match**: `*.ts`, `*.m4s`, `*.fmp4`
* **Edge TTL**: `1 Year (31,536,000s)`
* **Browser Cache**: `public, max-age=31536000, immutable`
* **Range Requests**: Forward range headers (`Accept-Ranges: bytes`) to allow instant scrubbing without redundant data transfers.

### Rule 3: Static Imagery, Backdrops & Posters (`*.webp`, `*.jpg`, `*.svg`)
* **Match**: `/posters/*`, `/backdrops/*`, `/avatars/*`
* **Edge TTL**: `30 Days`
* **Cloudflare Polish / Bunny Optimizer**: Automated WebP/AVIF delivery with compression.

---

## 4. Origin Shield & Thundering Herd Protection
When a popular event goes live (e.g., Live Sports or a breaking news broadcast), thousands of clients query the same chunk within a 100ms window.
* **Origin Shield** collapses multiple concurrent requests for the same `.ts` chunk into a single upstream request, serving all other clients from the shield cache.
* This reduces origin load by up to **99.4%** and eliminates 504 Gateway Timeouts.
