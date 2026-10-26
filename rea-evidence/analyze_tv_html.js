const fs = require("fs");

async function main() {
  const html = await fetch("https://vidbox.wtf/tv/96677").then(r => r.text());
  fs.writeFileSync("/home/mana/Projects/CuddleCast/rea-evidence/dom/tv_detail.html", html);
  
  // Find play buttons
  const playButtons = [...html.matchAll(/<button[^>]*>[\s\S]*?Play[\s\S]*?<\/button>/gi)].map(m => m[0]);
  console.log("Play buttons found:", playButtons.length);
  if (playButtons[0]) console.log("Play button 1:", playButtons[0]);

  // Find all links
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  console.log("Unique links on /tv/96677:", [...new Set(links)]);
  
  // Find embed / iframe / stream
  const iframes = [...html.matchAll(/<iframe[^>]*src="([^"]+)"/g)].map(m => m[1]);
  console.log("iframes:", iframes);
}
main().catch(console.error);
