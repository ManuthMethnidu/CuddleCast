const fs = require("fs");

const raw = fs.readFileSync("/home/mana/Projects/CuddleCast/rea-evidence/payloads/rsc_decoded.txt", "utf8");

const items = [];
const seenIds = new Set();

let i = 0;
while (i < raw.length) {
  const start = raw.indexOf('{"adult":', i);
  if (start === -1) break;

  // Bracket balance from start
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let j = start; j < raw.length; j++) {
    const ch = raw[j];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
  }

  if (end !== -1) {
    const str = raw.slice(start, end + 1);
    try {
      const obj = JSON.parse(str);
      if (obj.id && !seenIds.has(obj.id) && (obj.poster_path || obj.backdrop_path)) {
        seenIds.add(obj.id);
        items.push({
          id: obj.id,
          title: obj.title || obj.name || "Untitled",
          name: obj.name || obj.title || "Untitled",
          original_title: obj.original_title || obj.original_name,
          overview: obj.overview || "No overview available.",
          poster_path: obj.poster_path ? `https://image.tmdb.org/t/p/w500${obj.poster_path}` : "",
          backdrop_path: obj.backdrop_path ? `https://image.tmdb.org/t/p/original${obj.backdrop_path}` : "",
          media_type: obj.media_type || (obj.first_air_date ? "tv" : "movie"),
          release_date: obj.release_date || obj.first_air_date || "2024",
          first_air_date: obj.first_air_date || obj.release_date || "2024",
          vote_average: obj.vote_average ? Number(obj.vote_average.toFixed(1)) : 7.5,
          vote_count: obj.vote_count || 100,
          genre_ids: obj.genre_ids || [28, 12],
          popularity: obj.popularity || 50,
          logo_path: obj.logo_path ? `https://image.tmdb.org/t/p/w500${obj.logo_path}` : null,
          adult: false
        });
      }
    } catch (e) {}
    i = end + 1;
  } else {
    i = start + 8;
  }
}

console.log(`Successfully extracted ${items.length} authentic titles!`);

// Partition into structured rails
const billboard = items.slice(0, 10).map((item, idx) => ({
  ...item,
  rank: idx + 1,
  streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  trailerUrl: "https://test-streams.mux.dev/pts_shift/master.m3u8"
}));

const top10 = items.slice(0, 10).map((item, idx) => ({
  ...item,
  rank: idx + 1
}));

const trendingMovies = items.filter(i => i.media_type === "movie");
const trendingTv = items.filter(i => i.media_type === "tv");

const continueWatching = [
  {
    ...items[0],
    progress_seconds: 1420,
    total_seconds: 3200,
    last_watched: new Date().toISOString()
  },
  {
    ...items[1],
    progress_seconds: 850,
    total_seconds: 6400,
    last_watched: new Date().toISOString()
  },
  {
    ...items[2],
    progress_seconds: 2900,
    total_seconds: 3000,
    last_watched: new Date().toISOString()
  }
];

const episodes = [
  {
    id: 101,
    episode_number: 1,
    season_number: 1,
    title: "Chapter 1 - Le Collier de la Reine",
    overview: "Goaded by an injustice, Assane Diop sets out to avenge his father by executing a heist of the Queen's necklace at the Louvre.",
    runtime: 47,
    still_path: "https://image.tmdb.org/t/p/w500/r5lbLfjfFZYhr2TfuvKpf7b0HpQ.jpg",
    progress: 1.0,
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 102,
    episode_number: 2,
    season_number: 1,
    title: "Chapter 2 - The Illusion",
    overview: "Assane hatches a plan to contact an inmate who might hold clues to his father's death; Juliette Pellegrini reconnects with Assane.",
    runtime: 53,
    still_path: "https://image.tmdb.org/t/p/w500/5B0fvoxRPT7mhZMgMSAM27j6QZb.jpg",
    progress: 0.65,
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 103,
    episode_number: 3,
    season_number: 1,
    title: "Chapter 3 - The Commissaire",
    overview: "Assane confronts Commissioner Dumont to uncover the truth about the conspiracy, orchestrating a high-stakes escape.",
    runtime: 44,
    still_path: "https://image.tmdb.org/t/p/w500/9IF5DMeUcEaPXclFAfyMGP8CRg5.jpg",
    progress: 0,
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 104,
    episode_number: 4,
    season_number: 1,
    title: "Chapter 4 - The Journalist",
    overview: "With the help of an investigative reporter, Assane attempts to broadcast Pellegrini's dark secrets on live television.",
    runtime: 48,
    still_path: "https://image.tmdb.org/t/p/w500/1MccRnw41qQjREuZkovqP2UX1i3.jpg",
    progress: 0,
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 105,
    episode_number: 5,
    season_number: 1,
    title: "Chapter 5 - Étretat",
    overview: "On a trip to Étretat with Claire and Raoul, Assane finds himself pursued by Pellegrini's relentless hitman.",
    runtime: 51,
    still_path: "https://image.tmdb.org/t/p/w500/8pqCanIwJFehhZdP00gXE0qc9xc.jpg",
    progress: 0,
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  }
];

const cast = [
  { id: 1, name: "Omar Sy", character: "Assane Diop", profile_path: "https://image.tmdb.org/t/p/w185/Uuy6WuizieB4fOIGFp0gY90Yq2.jpg" },
  { id: 2, name: "Ludivine Sagnier", character: "Claire", profile_path: "https://image.tmdb.org/t/p/w185/hd4fLjgtgNEidJOjuLNGfK1sOhm.jpg" },
  { id: 3, name: "Antoine Gouy", character: "Benjamin Férel", profile_path: "https://image.tmdb.org/t/p/w185/g0KnDyYzYHNY3TQgcX3B26ILnTu.jpg" },
  { id: 4, name: "Soufiane Guerrab", character: "Youssef Guedira", profile_path: "https://image.tmdb.org/t/p/w185/3KPutm0tNtt1CtFm6gyLPSqtOK2.jpg" },
  { id: 5, name: "Shirine Boutella", character: "Lieutenant Belkacem", profile_path: "https://image.tmdb.org/t/p/w185/4qBT877sIjMLycDBmahEpL1nwEk.jpg" }
];

const capturedPayloads = {
  billboard,
  top10,
  continueWatching,
  rails: [
    { id: "continue-watching", title: "Continue Watching", isContinueWatching: true, items: continueWatching },
    { id: "top-10", title: "Top 10 Today", isTop10: true, items: top10 },
    { id: "trending-movies", title: "Trending Movies", items: trendingMovies.slice(0, 18) },
    { id: "trending-tv", title: "Trending TV Shows", items: trendingTv.slice(0, 18) },
    { id: "now-playing", title: "Now Playing in Theaters", items: items.slice(10, 28) },
    { id: "netflix-originals", title: "Popular Originals", items: items.slice(28, 46) },
    { id: "action", title: "Action & Adventure", items: items.slice(15, 33) },
    { id: "scifi", title: "Sci-Fi & Fantasy", items: items.slice(30, 48) }
  ],
  episodes,
  cast,
  allItems: items
};

fs.mkdirSync("/home/mana/Projects/CuddleCast/src/mocks", { recursive: true });
fs.writeFileSync(
  "/home/mana/Projects/CuddleCast/src/mocks/capturedPayloads.json",
  JSON.stringify(capturedPayloads, null, 2)
);

console.log(`Saved src/mocks/capturedPayloads.json with ${items.length} titles!`);
