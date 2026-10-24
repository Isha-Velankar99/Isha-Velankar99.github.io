/* ============================================================
   Team crests — original SVG badges drawn from TEAMS in data.js
   (kit colours + pattern) and the team's initials. Shape follows
   the sport: shield (football), roundel (basketball), angular
   badge (US football), hooped shield (rugby nations).
   Loaded after data.js, before hubs.js.
   ============================================================ */

const CREST_SHAPES = {
  shield: "M20 1.5 L37 6 V20 C37 31.5 29.5 38.5 20 42.5 C10.5 38.5 3 31.5 3 20 V6 Z",
  roundel: "M20 2 A20 20 0 1 1 19.99 2 Z",
  badge: "M20 2 L37 10 V30 L20 42 L3 30 V10 Z",
};
const SHAPE_FOR_SPORT = { football: "shield", rugby: "shield", basketball: "roundel", usfootball: "badge" };

function hexLum(hex) {
  const [r, g, b] = hex.replace("#", "").match(/../g).map(h => {
    const v = parseInt(h, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => { const [x, y] = [hexLum(a), hexLum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

/* Kit pattern drawn in the accent colour, clipped to the crest shape */
function crestPattern(p, accent) {
  switch (p) {
    case "stripes": return [6, 14, 22, 30].map(x => `<rect x="${x}" y="0" width="4" height="44" fill="${accent}"/>`).join("");
    case "halves":  return `<rect x="20" y="0" width="20" height="44" fill="${accent}"/>`;
    case "band":    return `<rect x="14" y="0" width="12" height="44" fill="${accent}"/>`;
    case "sash":    return `<polygon points="0,8 10,0 40,34 40,44 32,44 0,14" fill="${accent}"/>`;
    case "chevron": return `<polyline points="2,12 20,26 38,12" fill="none" stroke="${accent}" stroke-width="5"/>`;
    case "hoops":   return [10, 22, 34].map(y => `<rect x="0" y="${y}" width="40" height="4" fill="${accent}"/>`).join("");
    default:        return "";
  }
}

/* Sport of a team = the sport of its first fixture */
function teamSport(name) { return EVENTS.find(e => teamsOf(e).includes(name))?.sport || "football"; }

let crestSeq = 0;
function crestSvg(name) {
  const t = TEAMS[name] || { c: ["#23412e", "#d7e5a3"], p: "plain" };
  const [main, accent] = t.c;
  const shape = CREST_SHAPES[SHAPE_FOR_SPORT[teamSport(name)]] || CREST_SHAPES.shield;
  // Unique per instance: a duplicate id inside a hidden menu would break the clip elsewhere
  const id = `cr-${slug(name)}-${++crestSeq}`;
  const busy = t.p !== "plain";
  // Initials sit on the main colour; use the accent if it reads well there, else black/white
  const ink = contrast(accent, main) >= 3 ? accent : hexLum(main) > 0.4 ? "#111111" : "#FFFFFF";
  const txt = crestText(name);
  const size = txt.length > 1 ? 13 : 16;
  // Very light crests (white kits) need an edge to stand out on white cards
  const edge = hexLum(main) > 0.8 ? "rgba(41,49,42,.28)" : "rgba(0,0,0,.18)";
  return `<svg class="crest-svg" viewBox="0 0 40 44" role="img" aria-label="${esc(name)} crest">
    <defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
    <g clip-path="url(#${id})">
      <rect width="40" height="44" fill="${main}"/>
      ${crestPattern(t.p, accent)}
      <rect width="40" height="44" fill="url(#crest-shine)"/>
    </g>
    ${busy ? `<circle cx="20" cy="21" r="10.5" fill="${main}" stroke="${accent}" stroke-width="1.5"/>` : ""}
    <path d="${shape}" fill="none" stroke="${edge}" stroke-width="1"/>
    <path d="${shape}" fill="none" stroke="${accent}" stroke-width="1.6" transform="translate(20 22) scale(.86) translate(-20 -22)" opacity=".9"/>
    <text x="20" y="${21 + size * 0.36}" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="${size}" letter-spacing=".02em" fill="${ink}">${esc(txt)}</text>
  </svg>`;
}

/* Shared gradient so every crest gets the same subtle shine — added once */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("crest-defs")) return;
  document.body.insertAdjacentHTML("afterbegin", `<svg id="crest-defs" width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs><linearGradient id="crest-shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/>
    </linearGradient></defs></svg>`);
});
