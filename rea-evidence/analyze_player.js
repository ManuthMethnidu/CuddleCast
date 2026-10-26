const fs = require("fs");
const path = require("path");

const tv = fs.readFileSync("/home/mana/Projects/CuddleCast/rea-evidence/bundles/tv_detail_page.js", "utf8");
const movie = fs.readFileSync("/home/mana/Projects/CuddleCast/rea-evidence/bundles/movie_detail_page.js", "utf8");
const combined = tv + "\n" + movie;

const playerMatches = combined.match(/(?:player|embed|iframe|stream|video|hls|source)[a-zA-Z0-9_]*\s*[:=]/gi);
console.log("Player matches:", [...new Set(playerMatches || [])].slice(0, 30));

const urls = [...combined.matchAll(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"'\\<>]*/g)].map(m => m[0]);
console.log("URLs found in detail pages:", [...new Set(urls)].slice(0, 30));

// Check iframe src patterns
const iframes = combined.match(/src:\s*["`'][^"`']+["`']/g);
console.log("src matches:", iframes ? iframes.slice(0, 20) : null);
