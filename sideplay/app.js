/* ============================================================
   Sports Tickets — trip-led prototype
   Home → Browse → Event (seats) → Trip (stay + extras) → Checkout → Confirmed
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $("#app");

/* ---------- State (kept for the tab session) ---------- */
const STORE_KEY = "sports-trip-state";
const state = Object.assign({ qty: null, sel: null, trip: null, bookings: [] }, load());
function load() { try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
/* Drop saved picks/bookings for fixtures that no longer exist in data.js */
if (state.sel && !EVENTS.some(e => e.id === state.sel.eventId)) { state.sel = null; state.trip = null; }
state.bookings = state.bookings.filter(b => EVENTS.some(e => e.id === b.sel.eventId));
function save() { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }

/* ---------- Formatting ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, w, many = w + "s") => `${n} ${n === 1 ? w : many}`;
const money = n => `${BRAND.currency}${Math.round(n).toLocaleString("en-US")}`;
const d = iso => new Date(iso);
const fmtDay = (iso, o = {}) => d(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", ...o });
const fmtTime = iso => d(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const ymd = dt => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const addDays = (iso, n) => { const x = d(iso); x.setDate(x.getDate() + n); return ymd(x); };
const nightsBetween = (a, b) => Math.max(0, Math.round((d(b + "T12:00") - d(a + "T12:00")) / 864e5));

/* ---------- Lookups ---------- */
const sportOf = id => SPORTS.find(s => s.id === id);
const compOf = id => COMPETITIONS.find(c => c.id === id);
const eventOf = id => EVENTS.find(e => e.id === id);
const tierOf = id => TIERS.find(t => t.id === id);
const upcoming = () => [...EVENTS].sort((a, b) => d(a.date) - d(b.date));

/* ---------- Placeholder art ---------- */
const ART = {
  football:   "linear-gradient(160deg,#2f6b3a,#10291a)",
  basketball: "linear-gradient(160deg,#c46a1c,#331a07)",
  racing:     "linear-gradient(160deg,#8a1c1c,#240909)",
  usfootball: "linear-gradient(160deg,#3b4a6b,#111725)",
  rugby:      "linear-gradient(160deg,#5a4a2e,#1b160e)",
  tennis:     "linear-gradient(160deg,#2d7a8a,#0c272d)",
  city:       "linear-gradient(160deg,#6e6a78,#1f1d26)",
  warm:       "linear-gradient(160deg,#b0764a,#2e1a10)",
  desert:     "linear-gradient(160deg,#c9a56b,#4a3218)",
  sea:        "linear-gradient(160deg,#3f7fa3,#10283a)",
  hotel1:     "linear-gradient(135deg,#a68a6d,#4a3a2c)",
  hotel2:     "linear-gradient(135deg,#3d3a52,#15131f)",
  hotel3:     "linear-gradient(135deg,#7c8f8a,#2c3634)",
};
/* Photos come from img/ (see credits.js); fall back to a gradient + icon */
const imgFor = key => (typeof CREDITS !== "undefined" && CREDITS[key]) ? `img/${CREDITS[key].file}` : null;
const bg = (key, art) => { const src = imgFor(key); return `--bg:${src ? `url('${src}')` : ART[art] || ART.city}`; };
const glyph = (key, icon) => imgFor(key) ? "" : `<span class="ms glyph">${icon}</span>`;

/* ============================================================
   SEAT MAP — one generic bowl, three rings
   ============================================================ */
const MAP = { w: 640, h: 470, cx: 320, cy: 235 };
const RINGS = {
  lower: { inner: [178, 122], outer: [232, 166], count: 16 },
  upper: { inner: [242, 176], outer: [304, 226], count: 20 },
};
const pt = (rx, ry, a) => [MAP.cx + rx * Math.cos(a), MAP.cy + ry * Math.sin(a)].map(v => v.toFixed(1));
function sectorPath(ring, a0, a1) {
  const [ix, iy] = ring.inner, [ox, oy] = ring.outer;
  const p1 = pt(ox, oy, a0), p2 = pt(ox, oy, a1), p3 = pt(ix, iy, a1), p4 = pt(ix, iy, a0);
  return `M${p1}A${ox},${oy} 0 0 1 ${p2}L${p3}A${ix},${iy} 0 0 0 ${p4}Z`;
}
const SECTIONS = (() => {
  const out = [];
  let h = 0, l = 0;
  for (const [key, ring] of Object.entries(RINGS)) {
    const step = (Math.PI * 2) / ring.count, gap = 0.012;
    for (let i = 0; i < ring.count; i++) {
      const mid = -Math.PI / 2 + i * step;
      const a0 = mid - step / 2 + gap, a1 = mid + step / 2 - gap;
      let tier = key === "upper" ? "standard" : Math.abs(Math.sin(mid)) > 0.9 ? "hospitality" : "premium";
      const label = tier === "hospitality" ? `H${++h}` : tier === "premium" ? `L${++l}` : `U${101 + i}`;
      const rx = (ring.inner[0] + ring.outer[0]) / 2, ry = (ring.inner[1] + ring.outer[1]) / 2;
      const [tx, ty] = pt(rx, ry, mid);
      // closeness to halfway line (1 = halfway, 0 = behind goal) drives price
      out.push({ id: label, tier, path: sectorPath(ring, a0, a1), tx, ty, prime: Math.abs(Math.sin(mid)) });
    }
  }
  return out;
})();

function fieldSvg(sport) {
  const { cx, cy } = MAP;
  if (sport === "basketball") return `
    <rect x="${cx - 110}" y="${cy - 62}" width="220" height="124" rx="4" fill="#d9a066"/>
    <g fill="none" stroke="#fff" stroke-width="2" opacity=".85"><rect x="${cx - 104}" y="${cy - 56}" width="208" height="112"/><line x1="${cx}" y1="${cy - 56}" x2="${cx}" y2="${cy + 56}"/><circle cx="${cx}" cy="${cy}" r="16"/>
    <rect x="${cx - 104}" y="${cy - 18}" width="38" height="36"/><rect x="${cx + 66}" y="${cy - 18}" width="38" height="36"/></g>`;
  if (sport === "racing") return `
    <rect x="${cx - 150}" y="${cy - 90}" width="300" height="180" rx="90" fill="#5b616e"/>
    <rect x="${cx - 118}" y="${cy - 58}" width="236" height="116" rx="58" fill="#3f8a4a"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" opacity=".8">GRID & PIT LANE</text>`;
  if (sport === "tennis") return `
    <rect x="${cx - 120}" y="${cy - 70}" width="240" height="140" rx="4" fill="#3a6fb0"/>
    <g fill="none" stroke="#fff" stroke-width="2"><rect x="${cx - 100}" y="${cy - 52}" width="200" height="104"/><line x1="${cx}" y1="${cy - 52}" x2="${cx}" y2="${cy + 52}"/></g>`;
  return `
    <rect x="${cx - 140}" y="${cy - 82}" width="280" height="164" rx="6" fill="#3f8a4a"/>
    <g fill="none" stroke="#fff" stroke-width="2" opacity=".8"><rect x="${cx - 128}" y="${cy - 70}" width="256" height="140"/><line x1="${cx}" y1="${cy - 70}" x2="${cx}" y2="${cy + 70}"/><circle cx="${cx}" cy="${cy}" r="22"/>
    <rect x="${cx - 128}" y="${cy - 34}" width="34" height="68"/><rect x="${cx + 94}" y="${cy - 34}" width="34" height="68"/></g>`;
}

/* ---------- Deterministic listings per event ---------- */
function rngFor(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const FEATS = [["visibility", "Clear view"], ["bolt", "Instant download"],["chair_alt", "Aisle seat"], ["sports", "Home fans section"], ["accessible", "Step-free access"]];
const LISTINGS = {};
function listingsFor(ev) {
  if (LISTINGS[ev.id]) return LISTINGS[ev.id];
  const r = rngFor(ev.id), out = [];
  for (const s of SECTIONS) {
    const odds = s.tier === "hospitality" ? 0.85 : 0.6;
    const n = r() < odds ? (r() < 0.3 ? 2 : 1) : 0;
    for (let k = 0; k < n; k++) {
      const t = tierOf(s.tier);
      const price = ev.from * t.mult * (1 + s.prime * 0.35 + r() * 0.3);
      const feats = FEATS.filter(() => r() < 0.4).slice(0, 3);
      out.push({
        id: `${s.id}-${k}`, section: s.id, tier: s.tier,
        row: s.tier === "standard" ? 8 + Math.floor(r() * 24) : 1 + Math.floor(r() * 14),
        avail: s.tier === "hospitality" ? 2 + Math.floor(r() * 9) : 2 + Math.floor(r() * 7),
        price, was: r() < 0.6 ? price * (1.08 + r() * 0.12) : null, feats,
      });
    }
  }
  // cheapest Standard seat matches the advertised "from" price
  const std = out.filter(l => l.tier === "standard").sort((a, b) => a.price - b.price)[0];
  if (std) { std.price = ev.from; std.was = ev.was; }
  // deal score: how a listing compares with others in its tier
  for (const t of TIERS) {
    const inTier = out.filter(l => l.tier === t.id);
    const min = Math.min(...inTier.map(l => l.price));
    inTier.forEach(l => { l.score = Math.max(5.2, Math.min(9.9, 10 - (l.price / min - 1) * 7 - r() * 0.5)); });
  }
  return (LISTINGS[ev.id] = out);
}
const scoreLabel = s => s >= 9 ? "Amazing" : s >= 8 ? "Great" : s >= 7 ? "Good" : "Fair";
const tierFrom = (ev, tierId) => Math.min(...listingsFor(ev).filter(l => l.tier === tierId).map(l => l.price));

/* ---------- Trip maths ---------- */
function hotelsFor(ev) {
  const c = CITIES[ev.city];
  return HOTEL_TEMPLATES.map(h => ({ ...h, name: `${h.name} ${ev.city}`, nightly: Math.round(c.nightly * h.rateX) }));
}
function quote() {
  const { sel, trip } = state;
  const ev = eventOf(sel.eventId);
  const l = listingsFor(ev).find(x => x.id === sel.listingId);
  const tickets = l.price * sel.qty;
  const nights = nightsBetween(trip.checkIn, trip.checkOut);
  const rooms = Math.ceil(sel.qty / 2);
  const hotel = trip.hotel ? hotelsFor(ev).find(h => h.key === trip.hotel) : null;
  const stay = hotel ? hotel.nightly * nights * rooms : 0;
  const bundle = hotel && nights > 0 ? -Math.round(stay * 0.05) : 0;
  const extras = EXTRAS.filter(x => trip.extras.includes(x.id)).map(x => ({ ...x, total: x.per === "person" ? x.price * sel.qty : x.price }));
  const total = tickets + stay + bundle + extras.reduce((a, x) => a + x.total, 0);
  return { ev, l, tickets, nights, rooms, hotel, stay, bundle, extras, total };
}

/* ============================================================
   SHARED UI
   ============================================================ */
function header() {
  const n = state.bookings.length;
  const m = navMarkup();
  return `
  <header class="header"><div class="wrap">
    <a href="#/" class="logo" aria-label="${esc(BRAND.name)} home">${esc(BRAND.name)}<span>.</span></a>
    ${m.nav}
    ${searchBox({ placeholder: "Search teams, tournaments, cities", cls: "hsearch", cancel: true })}
    <button type="button" class="icon-btn m-search" data-open-search aria-label="Search"><span class="ms">search</span></button>
    <a href="#/trips" class="trips-link"><span class="ms">luggage</span><span>My trips</span>${n ? `<span class="count">${n}</span>` : ""}</a>
  </div>${m.panels}</header>`;
}
function footer() {
  return `<footer class="footer"><div class="wrap">
    <div><a href="#/" class="logo">${esc(BRAND.name)}<span>.</span></a>
      <p style="margin-top:10px"><a href="#">Privacy Policy</a> · <a href="#">Terms &amp; Conditions</a> · <a href="#/credits">Image credits</a></p></div>
    <p class="legal">${esc(BRAND.name)} is a design prototype. Fixtures, prices, seats and hotels are made up and nothing can be bought. Team, competition and venue names belong to their owners; team crests are original illustrations, not official badges.</p>
  </div></footer>`;
}


function wireArrows(root = document) {
  $$(".arrows", root).forEach(a => {
    const row = document.getElementById(a.dataset.for);
    if (row.scrollWidth <= row.clientWidth + 4) { a.hidden = true; return; }
    a.innerHTML = `<button aria-label="Previous"><span class="ms">chevron_left</span></button><button aria-label="Next"><span class="ms">chevron_right</span></button>`;
    a.children[0].onclick = () => row.scrollBy({ left: -row.clientWidth * 0.8, behavior: "smooth" });
    a.children[1].onclick = () => row.scrollBy({ left: row.clientWidth * 0.8, behavior: "smooth" });
  });
}
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); }
function stepper(on) {
  const steps = [["seats", "Seats"], ["trip", "Your trip"], ["checkout", "Checkout"]];
  const i = steps.findIndex(s => s[0] === on);
  const mobile = `<div class="stepper-m"><span>Step ${i + 1} of ${steps.length} · <b>${steps[i][1]}</b></span>${i > 0 ? `<a href="${i === 1 ? `#/event/${state.sel.eventId}` : "#/trip"}">Back</a>` : ""}<i><b style="width:${((i + 1) / steps.length) * 100}%"></b></i></div>`;
  return mobile + `<div class="stepper">${steps.map(([k, n], j) => {
    const cls = j < i ? "done" : j === i ? "on" : "";
    const href = k === "seats" ? `#/event/${state.sel.eventId}` : `#/${k}`;
    const inner = `<i>${j < i ? '<span class="ms" style="font-size:16px">check</span>' : j + 1}</i>${n}`;
    return (j < i ? `<a class="s ${cls}" href="${href}">${inner}</a>` : `<span class="s ${cls}">${inner}</span>`) + (j < steps.length - 1 ? '<span class="line"></span>' : "");
  }).join("")}</div>`;
}

/* ============================================================
   VIEWS
   ============================================================ */
function viewHome() {
  const trending = upcoming().filter(e => e.hot).concat(upcoming().filter(e => !e.hot)).slice(0, 9);
  const featured = upcoming().slice(0, 8);
  const cities = [...new Set(upcoming().map(e => e.city))].slice(0, 8);
  const compsWithEvents = COMPETITIONS.filter(c => EVENTS.some(e => e.comp === c.id));
  return `
  <div class="wrap">
    <div class="hero ${imgFor("hero") ? "has-img" : ""}" style="${imgFor("hero") ? `--hero:url('${imgFor("hero")}')` : ""}"><div class="hero-inner">
      <span class="overline">Live sports, real atmosphere</span>
      <h1>${esc(BRAND.tagline)}</h1>
      <p>Find and book tickets to the biggest sports events, and a stay near the stadium, in one booking.</p>
      <div class="hero-steps"><span><span class="ms">stadium</span>Pick the match</span><span><span class="ms">event_seat</span>Choose your seats</span><span><span class="ms">hotel</span>Add your stay</span></div>
    </div></div>

    <section class="section">
      <div class="sec-head"><div><h2>Selling fast</h2><p>The fixtures everyone’s after right now</p></div><div class="arrows" data-for="trending"></div></div>
      <div class="row" id="trending">${trending.map(e => `
        <a href="#/event/${e.id}" class="photo pick" style="${bg(evKey(e), e.sport)}">
          ${e.hot ? '<span class="badge badge-hot"><span class="ms">local_fire_department</span>Selling fast</span>' : `<span class="badge">${esc(compOf(e.comp).name)}</span>`}
          ${glyph(evKey(e), sportOf(e.sport).icon)}
          <div class="cap"><h3>${esc(e.title)}</h3><div class="sub">${fmtDay(e.date)} · ${esc(e.city)}</div>
          <div class="price"><s>${money(e.was)}</s><b>${money(e.from)}</b></div></div></a>`).join("")}</div>
    </section>

    <section class="section">
      <div class="sec-head"><div><h2>Browse by sport</h2></div></div>
      <div class="chips">${SPORTS.filter(s => EVENTS.some(e => e.sport === s.id)).map(s => `<a href="#/sport/${s.id}" class="chip"><span class="chip-ic"><span class="ms">${s.icon}</span></span><span><strong>${s.name}</strong><small>${plural(EVENTS.filter(e => e.sport === s.id).length, "event")}</small></span></a>`).join("")}</div>
    </section>

    <section class="section">
      <div class="sec-head"><div><h2>Coming up</h2><p>The next fixtures we have seats for</p></div><div class="head-actions"><a class="view-all" href="#/browse">View all <span class="ms">arrow_forward</span></a><div class="arrows" data-for="featured"></div></div></div>
      <div class="row" id="featured">${featured.map(ecard).join("")}</div>
    </section>

    <section class="section">
      <div class="sec-head"><div><h2>Competitions</h2></div><div class="arrows" data-for="comps"></div></div>
      <div class="row" id="comps">${compsWithEvents.map(c => `
        <a href="#/comp/${c.id}" class="photo comp-card" style="${bg(compKey(c), c.sport)}">${glyph(compKey(c), "emoji_events")}
          <div class="cap"><h3>${esc(c.name)}</h3><div class="sub">${esc(c.where)} · ${plural(EVENTS.filter(e => e.comp === c.id).length, "event")}</div></div></a>`).join("")}</div>
    </section>

    <section class="section">
      <div class="sec-head"><div><h2>Plan a sports trip</h2><p>Pick a city, find a match, stay nearby</p></div><div class="arrows" data-for="dests"></div></div>
      <div class="row" id="dests">${cities.map(c => `
        <a href="#/city/${encodeURIComponent(c)}" class="photo dest" style="${bg(`city-${c}`, CITIES[c].art)}">${glyph(`city-${c}`, "location_city")}
          <div class="cap"><h3>${esc(c)}</h3><div class="sub">${plural(EVENTS.filter(e => e.city === c).length, "event")} · hotels from ${money(CITIES[c].nightly * 0.58)}/night</div></div></a>`).join("")}</div>
    </section>

    <section class="section">
      <div class="sec-head"><div><h2>How it works</h2></div></div>
      <div class="how">
        <div><span class="n"><span class="ms">stadium</span></span><h3>1. Pick the match</h3><p>Search by team, competition or city. Prices are per person, fees included.</p></div>
        <div><span class="n"><span class="ms">event_seat</span></span><h3>2. Choose your seats</h3><p>Standard, Premium or Hospitality. Tap the map to see what’s left in each section.</p></div>
        <div><span class="n"><span class="ms">hotel</span></span><h3>3. Add your stay</h3><p>Hotels near the stadium with dates set around the match. Bundle and save 5%.</p></div>
      </div>
    </section>

    <section class="section">
      <div class="trust">
        <div><span class="ms">verified_user</span><div><strong>Every ticket guaranteed</strong><span>Valid entry or your money back</span></div></div>
        <div><span class="ms">group</span><div><strong>Seats together</strong><span>Your group always sits side by side</span></div></div>
        <div><span class="ms">event_available</span><div><strong>Match moved? Stay moves too</strong><span>Free hotel date change if the fixture shifts</span></div></div>
      </div>
    </section>
  </div>`;
}
function afterHome() { wireArrows(); }

/* ---------- Browse ---------- */
function browseParams() { return new URLSearchParams(location.hash.split("?")[1] || ""); }
function viewBrowse() {
  const p = browseParams();
  const sport = p.get("sport"), comp = p.get("comp"), city = p.get("city"), month = p.get("month"), q = (p.get("q") || "").trim();
  const title = comp ? compOf(comp)?.name : city ? `Sports events in ${city}` : sport ? `${sportOf(sport)?.name} tickets` : q ? `Results for “${q}”` : "All events";
  const months = [...new Set(upcoming().map(e => e.date.slice(0, 7)))];
  const list = upcoming().filter(e =>
    (!sport || e.sport === sport) && (!comp || e.comp === comp) && (!city || e.city === city) &&
    (!month || e.date.startsWith(month)) &&
    (!q || [e.title, e.venue, e.city, compOf(e.comp).name].join(" ").toLowerCase().includes(q.toLowerCase())));
  const sel = (name, val, opts, all) => `<label class="select ${val ? "on" : ""}"><span class="sr">${all}</span><select data-f="${name}"><option value="">${all}</option>${opts.map(([v, t]) => `<option value="${esc(v)}" ${v === val ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
  const any = sport || comp || city || month || q;
  return `
  <div class="wrap">
    <div class="page-head">
      <div class="crumbs"><a href="#/">Home</a><span class="ms" style="font-size:16px">chevron_right</span><span>Events</span></div>
      <h1>${esc(title || "Events")}</h1>
      <p>${city ? `Tickets, plus hotels near the venue from ${money(CITIES[city].nightly * 0.58)}/night.` : "Pick a match, then add a stay near the stadium."}</p>
    </div>
    <div class="filters">
      ${sel("sport", sport, SPORTS.map(s => [s.id, s.name]), "All sports")}
      ${sel("comp", comp, COMPETITIONS.filter(c => !sport || c.sport === sport).map(c => [c.id, c.name]), "All competitions")}
      ${sel("city", city, Object.keys(CITIES).filter(c => EVENTS.some(e => e.city === c)).sort().map(c => [c, c]), "All cities")}
      ${sel("month", month, months.map(m => [m, d(m + "-01T12:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" })]), "Any date")}
      <input type="search" data-f="q" value="${esc(q)}" placeholder="Filter by team or venue" aria-label="Filter by team or venue">
      ${any ? '<a class="clear" href="#/browse">Clear all</a>' : ""}
    </div>
    <p class="count-line">${list.length} event${list.length === 1 ? "" : "s"}</p>
    <div class="results">${list.length ? list.map(e => {
      const dt = d(e.date);
      return `<a class="result" href="#/event/${e.id}">
        <div class="date-block"><small>${dt.toLocaleDateString("en-GB", { month: "short" })}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString("en-GB", { weekday: "short" })}</small></div>
        <div><h3>${esc(e.title)}</h3><div class="meta">${esc(compOf(e.comp).name)} · ${esc(e.venue)}, ${esc(e.city)} · ${fmtTime(e.date)}</div>
          <div class="tags">${e.hot ? '<span class="badge badge-hot"><span class="ms">local_fire_department</span>Selling fast</span>' : ""}<span class="badge badge-soft"><span class="ms">hotel</span>Hotels from ${money(CITIES[e.city].nightly * 0.58)}/night</span></div></div>
        <div class="right"><div><small>Tickets from</small><b>${money(e.from)}</b></div><span class="btn btn-primary btn-sm">See seats</span></div></a>`;
    }).join("") : `<div class="empty"><span class="ms">search_off</span><p>No events match these filters.</p><p style="margin-top:12px"><a class="link" href="#/browse">Clear filters</a></p></div>`}</div>
  </div>`;
}
function afterBrowse() {
  $$("[data-f]").forEach(el => {
    const apply = () => {
      const p = browseParams();
      el.value ? p.set(el.dataset.f, el.value) : p.delete(el.dataset.f);
      if (el.dataset.f === "sport") p.delete("comp");
      const qs = p.toString();
      history.replaceState(null, "", `#/browse${qs ? "?" + qs : ""}`);
      const focused = el.dataset.f === "q", pos = el.selectionStart;
      app.innerHTML = viewBrowse(); afterBrowse();
      if (focused) { const i = $('[data-f="q"]'); i.focus(); i.setSelectionRange(pos, pos); }
    };
    el.addEventListener(el.tagName === "INPUT" ? "input" : "change", apply);
  });
}

/* ---------- Event / seats ---------- */
let seatUI = { tier: "all", section: null, sort: "value", picked: null };
function viewEvent(id) {
  const ev = eventOf(id);
  if (!ev) return `<div class="wrap empty"><span class="ms">search_off</span><p>That event isn’t available.</p><p style="margin-top:12px"><a class="link" href="#/browse">Browse events</a></p></div>`;
  const comp = compOf(ev.comp);
  return `
  <div class="wrap">
    <div class="event-hero">
      <div>
        <div class="crumbs"><a href="#/">Home</a><span class="ms" style="font-size:16px">chevron_right</span><a href="#/comp/${comp.id}">${esc(comp.name)}</a></div>
        <h1>${esc(ev.title)}</h1>
        <div class="event-meta"><span><span class="ms">calendar_today</span>${fmtDay(ev.date, { year: "numeric" })} · ${fmtTime(ev.date)}</span><span><span class="ms">location_on</span><span><a class="u" href="#/venue/${slug(ev.venue)}">${esc(ev.venue)}</a>, <a class="u" href="#/city/${encodeURIComponent(ev.city)}">${esc(ev.city)}</a></span></span>${ev.hot ? '<span class="badge badge-hot"><span class="ms">local_fire_department</span>Selling fast</span>' : ""}</div>
      </div>
      <button class="qty-btn" id="qtyBtn"><span class="ms">group</span><span id="qtyLabel"></span><span class="ms">expand_more</span></button>
    </div>
    <div class="tiers" id="tiers"></div>
    <div class="seat-layout">
      <div class="map-card">
        <svg viewBox="0 0 ${MAP.w} ${MAP.h}" role="img" aria-label="Seat map of ${esc(ev.venue)}" id="map">
          <ellipse cx="${MAP.cx}" cy="${MAP.cy}" rx="314" ry="232" style="fill:var(--subtle)"/>
          ${fieldSvg(ev.sport)}
          ${SECTIONS.map(s => `<path class="sec" data-sec="${s.id}" d="${s.path}"><title>Section ${s.id}</title></path>`).join("")}
          ${SECTIONS.map(s => `<text x="${s.tx}" y="${(+s.ty + 3.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" pointer-events="none" data-lbl="${s.id}">${s.id}</text>`).join("")}
        </svg>
        <div class="legend">${TIERS.map(t => `<span><i style="background:${t.colour}"></i>${t.name}</span>`).join("")}<span><i style="background:var(--line);box-shadow:inset 0 0 0 1px var(--muted-2)"></i>Not available</span></div>
        <p class="map-hint">Tap a section to see its seats</p>
      </div>
      <div>
        <div class="list-tools">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="n" id="listCount"></span><span id="secChip"></span></div>
          <label class="select"><span class="sr">Sort</span><select id="sort"><option value="value">Best value</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
        </div>
        <div class="listings" id="listings"></div>
      </div>
    </div>
  </div>
  <div class="action-bar" id="bar"><div class="wrap"><div class="what" id="barWhat"></div><button class="btn btn-primary" id="toTrip"><span class="lg-only">Continue: add your stay</span><span class="sm-only">Continue</span> <span class="ms">arrow_forward</span></button></div></div>`;
}
function afterEvent(id) {
  const ev = eventOf(id); if (!ev) return;
  const keepPick = state.sel?.eventId === id;
  seatUI = { tier: "all", section: null, sort: "value", picked: keepPick ? state.sel.listingId : null };
  const all = listingsFor(ev);

  const visible = () => all.filter(l => l.avail >= state.qty && (seatUI.tier === "all" || l.tier === seatUI.tier));
  function drawTiers() {
    const opts = [{ id: "all", name: "All seats", perks: ["Every section", "Sorted by value"] }, ...TIERS];
    $("#tiers").innerHTML = opts.map(t => {
      const pool = all.filter(l => l.avail >= state.qty && (t.id === "all" || l.tier === t.id));
      const from = pool.length ? Math.min(...pool.map(l => l.price)) : null;
      return `<button class="tier ${seatUI.tier === t.id ? "on" : ""}" data-tier="${t.id}">
        <strong>${t.colour ? `<i class="dot" style="background:${t.colour}"></i>` : ""}${t.name}</strong>
        <div class="from">${from ? `from <b>${money(from)}</b>` : "Sold out for " + state.qty}</div>
        <ul>${t.perks.map(p => `<li>${p}</li>`).join("")}</ul></button>`;
    }).join("");
  }
  function drawMap() {
    const vis = visible(), withSeats = new Set(vis.map(l => l.section));
    SECTIONS.forEach(s => {
      const p = $(`[data-sec="${s.id}"]`), on = withSeats.has(s.id);
      p.style.fill = tierOf(s.tier).colour;
      p.classList.toggle("none", !on);
      p.classList.toggle("dim", !!seatUI.section && seatUI.section !== s.id);
      const pickedSec = seatUI.picked && all.find(l => l.id === seatUI.picked)?.section;
      p.classList.toggle("hl", pickedSec === s.id);
      $(`[data-lbl="${s.id}"]`).style.fill = on ? tierOf(s.tier).label : "var(--muted-2)";
    });
  }
  function drawList() {
    let vis = visible().filter(l => !seatUI.section || l.section === seatUI.section);
    vis.sort(seatUI.sort === "low" ? (a, b) => a.price - b.price : seatUI.sort === "high" ? (a, b) => b.price - a.price : (a, b) => b.score - a.score);
    $("#listCount").textContent = `${vis.length} listing${vis.length === 1 ? "" : "s"} for ${state.qty}`;
    $("#secChip").innerHTML = seatUI.section ? `<span class="sec-filter">Section ${seatUI.section}<button aria-label="Clear section" id="clrSec"><span class="ms" style="font-size:18px">close</span></button></span>` : "";
    $("#listings").innerHTML = vis.length ? vis.map(l => {
      const t = tierOf(l.tier), sc = l.score;
      return `<button class="listing ${seatUI.picked === l.id ? "on" : ""}" data-l="${l.id}" data-s="${l.section}">
        <span class="bar" style="background:${t.colour}"></span>
        <div><h4>Section ${l.section} <small>Row ${l.row} · ${t.name}</small></h4>
          <div class="feats"><span><span class="ms">group</span>${state.qty} together</span>${l.feats.map(([i, f]) => `<span><span class="ms">${i}</span>${f}</span>`).join("")}${l.tier === "hospitality" ? '<span><span class="ms">restaurant</span>Lounge & dining</span>' : ""}</div>
          <div class="tags">${l.avail <= 3 ? `<span class="badge badge-hot">Only ${l.avail} left</span>` : ""}</div></div>
        <div class="right">${l.was ? `<s>${money(l.was)}</s>` : ""}<b>${money(l.price)}</b><small><span class="lg-only">per person, incl. fees</span><span class="sm-only">each</span></small>
          <span class="score ${sc >= 8 ? "" : sc >= 7 ? "ok" : "meh"}"><i>${sc.toFixed(1)}</i>${scoreLabel(sc)}</span></div></button>`;
    }).join("") : `<div class="empty"><span class="ms">event_busy</span><p>No seats for ${state.qty} here.</p><p style="margin-top:12px"><button class="link" id="resetFilters">Show all seats</button></p></div>`;
    $("#clrSec")?.addEventListener("click", () => { seatUI.section = null; drawAll(); });
    $("#resetFilters")?.addEventListener("click", () => { seatUI.tier = "all"; seatUI.section = null; drawAll(); });
  }
  function drawBar() {
    const l = all.find(x => x.id === seatUI.picked && x.avail >= state.qty);
    $("#bar").classList.toggle("show", !!l);
    document.body.classList.toggle("has-bar", !!l);
    if (l) $("#barWhat").innerHTML = `<b>${money(l.price * state.qty)}</b>${state.qty} × ${tierOf(l.tier).name} · Section ${l.section}, Row ${l.row}`;
  }
  function drawAll() { $("#qtyLabel").textContent = `${state.qty} ticket${state.qty > 1 ? "s" : ""}`; drawTiers(); drawMap(); drawList(); drawBar(); }

  $("#tiers").addEventListener("click", e => { const b = e.target.closest("[data-tier]"); if (!b) return; seatUI.tier = b.dataset.tier; seatUI.section = null; drawAll(); });
  $("#map").addEventListener("click", e => {
    const p = e.target.closest(".sec"); if (!p || p.classList.contains("none")) return;
    seatUI.section = seatUI.section === p.dataset.sec ? null : p.dataset.sec; drawMap(); drawList();
  });
  $("#map").addEventListener("mouseover", e => { const p = e.target.closest(".sec"); $$(".listing").forEach(x => x.classList.toggle("hl", !!p && x.dataset.s === p.dataset.sec)); });
  $("#listings").addEventListener("mouseover", e => { const b = e.target.closest(".listing"); $$(".sec").forEach(p => p.classList.toggle("hl", !!b && p.dataset.sec === b.dataset.s)); });
  $("#listings").addEventListener("mouseleave", drawMap);
  $("#listings").addEventListener("click", e => { const b = e.target.closest(".listing"); if (!b) return; seatUI.picked = seatUI.picked === b.dataset.l ? null : b.dataset.l; drawList(); drawMap(); drawBar(); });
  $("#sort").addEventListener("change", e => { seatUI.sort = e.target.value; drawList(); });
  $("#qtyBtn").addEventListener("click", () => askQty(drawAll));
  $("#toTrip").addEventListener("click", () => {
    state.sel = { eventId: id, listingId: seatUI.picked, qty: state.qty };
    state.trip = { hotel: "near", checkIn: addDays(ev.date, -1), checkOut: addDays(ev.date, 1), extras: [] };
    save(); location.hash = "#/trip";
  });

  const firstVisit = !state.qty;
  state.qty ||= 2;
  drawAll();
  if (firstVisit) askQty(drawAll, true);
}
function askQty(done, first) {
  let q = state.qty || 2;
  const bgEl = document.createElement("div");
  bgEl.className = "modal-bg";
  bgEl.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="qh">
    <h2 id="qh">How many tickets?</h2><p>We only show seats where your group sits together.</p>
    <div class="qty-grid">${[1, 2, 3, 4, 5, 6].map(n => `<button data-q="${n}" class="${n === q ? "on" : ""}">${n}${n === 6 ? "+" : ""}</button>`).join("")}</div>
    <button class="btn btn-primary">Show seats</button></div>`;
  document.body.appendChild(bgEl);
  const close = () => { bgEl.remove(); state.qty = q; save(); done(); };
  bgEl.addEventListener("click", e => {
    const b = e.target.closest("[data-q]");
    if (b) { q = +b.dataset.q; $$("[data-q]", bgEl).forEach(x => x.classList.toggle("on", x === b)); return; }
    if (e.target.closest(".btn") || (!first && e.target === bgEl)) close();
  });
  $("[data-q].on", bgEl).focus();
}

/* ---------- Trip ---------- */
function summaryCard(cta, ctaId) {
  const qt = quote(), { ev, l } = qt;
  return `<aside class="card summary">
    <div class="ev"><div class="thumb" style="${bg(evKey(ev), ev.sport)}">${imgFor(evKey(ev)) ? "" : `<span class="ms">${sportOf(ev.sport).icon}</span>`}</div>
      <div><h3>${esc(ev.title)}</h3><small>${fmtDay(ev.date)} · ${fmtTime(ev.date)} · ${esc(ev.city)}</small></div></div>
    <div class="lines">
      <div><span>${state.sel.qty} × ${tierOf(l.tier).name}, Section ${l.section}</span><span>${money(qt.tickets)}</span></div>
      ${qt.hotel ? `<div><span>${esc(qt.hotel.name)} · ${qt.nights} night${qt.nights === 1 ? "" : "s"}${qt.rooms > 1 ? ` × ${qt.rooms} rooms` : ""}</span><span>${money(qt.stay)}</span></div>` : ""}
      ${qt.bundle ? `<div class="save"><span>Trip bundle saving (5% off stay)</span><span>−${money(-qt.bundle)}</span></div>` : ""}
      ${qt.extras.map(x => `<div><span>${esc(x.name)}${x.per === "person" ? ` × ${state.sel.qty}` : ""}</span><span>${money(x.total)}</span></div>`).join("")}
    </div>
    <div class="total"><span>Total</span><b>${money(qt.total)}</b></div>
    ${cta ? `<button class="btn btn-primary" id="${ctaId}">${cta}</button>` : ""}
    <p class="fine"><span class="ms" style="font-size:15px">verified_user</span>Tickets guaranteed · fees included</p>
  </aside>`;
}
function viewTrip() {
  const ev = eventOf(state.sel.eventId), t = state.trip, qt = quote();
  const hotels = hotelsFor(ev);
  return `
  <div class="wrap">
    ${stepper("trip")}
    <div class="two-col">
      <div>
        <div class="card">
          <h2>Stay near ${esc(ev.venue)}</h2>
          <p class="lead">Dates are set around the match. Rooms sleep 2, so you’ll get ${qt.rooms} room${qt.rooms > 1 ? "s" : ""} for ${state.sel.qty}.</p>
          <div class="stay-dates">
            <label class="field">Check in<input type="date" id="ci" value="${t.checkIn}" max="${ymd(d(ev.date))}"></label>
            <label class="field">Check out<input type="date" id="co" value="${t.checkOut}" min="${addDays(ev.date, 0)}"></label>
            <p class="stay-note" style="flex-basis:100%"><span class="ms" style="font-size:16px">sports</span>Match: ${fmtDay(ev.date)} at ${fmtTime(ev.date)} · ${qt.nights} night${qt.nights === 1 ? "" : "s"}</p>
          </div>
          <div class="hotels" id="hotels">
            ${hotels.map(h => `<button class="hotel ${t.hotel === h.key ? "on" : ""}" data-h="${h.key}">
              <div class="img" style="${bg(`hotel-${h.key}`, h.art)}"></div>
              <div><h3>${esc(h.name)}</h3><div class="stars">${"★".repeat(h.stars)}</div>
                <div class="meta"><span><span class="ms">directions_walk</span>${h.km} km to stadium</span><span class="badge badge-soft">${h.tag}</span></div></div>
              <div class="right"><b>${money(h.nightly * qt.nights * qt.rooms)}</b><small>${money(h.nightly)}/night${qt.rooms > 1 ? " per room" : ""}</small></div></button>`).join("")}
            <button class="hotel skip ${!t.hotel ? "on" : ""}" data-h=""><div><h3>Just the tickets</h3><div class="meta">I’ve sorted my own stay</div></div><div class="right"><b>${money(0)}</b></div></button>
          </div>
        </div>
        <div class="card">
          <h2>Make a day of it</h2><p class="lead">Optional extras for match weekend.</p>
          <div class="extras">${EXTRAS.map(x => `<label class="extra ${t.extras.includes(x.id) ? "on" : ""}"><span class="ms">${x.icon}</span>
            <div><strong>${x.name}</strong><small>${x.desc}</small></div><b>${money(x.price)}${x.per === "person" ? " pp" : ""}</b>
            <input type="checkbox" data-x="${x.id}" ${t.extras.includes(x.id) ? "checked" : ""}></label>`).join("")}</div>
        </div>
      </div>
      <div id="summary">${summaryCard("Continue to checkout", "toCheckout")}</div>
    </div>
  </div>
  ${totalBar("Checkout", "#toCheckout")}`;
}
function afterTrip() {
  const ev = eventOf(state.sel.eventId);
  const rerender = () => { const y = scrollY; app.innerHTML = viewTrip(); afterTrip(); scrollTo(0, y); };
  $("#hotels").addEventListener("click", e => { const b = e.target.closest("[data-h]"); if (!b) return; state.trip.hotel = b.dataset.h || null; save(); rerender(); });
  $$("[data-x]").forEach(c => c.addEventListener("change", () => {
    const ex = state.trip.extras;
    c.checked ? ex.push(c.dataset.x) : ex.splice(ex.indexOf(c.dataset.x), 1);
    save(); rerender();
  }));
  const ci = $("#ci"), co = $("#co");
  const onDates = () => {
    if (!ci.value || !co.value) return;
    if (ci.value > ymd(d(ev.date))) ci.value = ymd(d(ev.date));
    if (co.value <= ci.value) co.value = addDays(ci.value + "T12:00", 1);
    state.trip.checkIn = ci.value; state.trip.checkOut = co.value; save(); rerender();
  };
  ci.addEventListener("change", onDates); co.addEventListener("change", onDates);
  $("#toCheckout").addEventListener("click", () => { location.hash = "#/checkout"; });
}

/* ---------- Checkout ---------- */
function viewCheckout() {
  const n = state.sel.qty;
  return `
  <div class="wrap">
    ${stepper("checkout")}
    <div class="two-col">
      <form id="form" novalidate>
        <div class="card">
          <h2>Lead traveller</h2><p class="lead">Tickets and hotel confirmation go to this email.</p>
          <div class="form-grid">
            <label class="field">First name<input name="first" autocomplete="given-name" required><span class="msg">Enter a first name</span></label>
            <label class="field">Last name<input name="last" autocomplete="family-name" required><span class="msg">Enter a last name</span></label>
            <label class="field">Email<input name="email" type="email" autocomplete="email" required><span class="msg">Enter a valid email</span></label>
            <label class="field">Mobile<input name="phone" type="tel" autocomplete="tel" placeholder="Optional"></label>
          </div>
        </div>
        ${n > 1 ? `<div class="card"><h2>Who’s going?</h2><p class="lead">Names must match ID at the stadium.</p>
          <div class="form-grid">${Array.from({ length: n - 1 }, (_, i) => `<label class="field">Guest ${i + 2} full name<input name="guest${i + 2}" required><span class="msg">Enter a name</span></label>`).join("")}</div></div>` : ""}
        <div class="card">
          <h2>Payment</h2>
          <div class="pay-opts">
            <label class="pay-opt on"><input type="radio" name="pay" value="card" checked><span class="ms">credit_card</span>Card</label>
            <label class="pay-opt"><input type="radio" name="pay" value="apple"><span class="ms">phone_iphone</span>Apple Pay</label>
          </div>
          <p class="demo-note"><span class="ms">info</span>Prototype: no payment details are collected and nothing is charged.</p>
        </div>
      </form>
      <div>${summaryCard("Confirm booking", "confirm")}</div>
    </div>
  </div>
  ${totalBar("Confirm", "#confirm")}`;
}
function afterCheckout() {
  const form = $("#form");
  $$(".pay-opt input").forEach(r => r.addEventListener("change", () => $$(".pay-opt").forEach(p => p.classList.toggle("on", $("input", p).checked))));
  form.addEventListener("submit", e => { e.preventDefault(); $("#confirm").click(); });
  $("#confirm").addEventListener("click", () => {
    let ok = true;
    $$("input[required]", form).forEach(i => {
      const bad = !i.value.trim() || (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value));
      i.closest(".field").classList.toggle("err", bad);
      if (bad && ok) { i.focus(); ok = false; }
    });
    if (!ok) return;
    const qt = quote(), f = new FormData(form);
    const ref = "TRP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    state.bookings.unshift({ ref, sel: state.sel, trip: state.trip, total: qt.total, name: `${f.get("first")} ${f.get("last")}`, email: f.get("email"), at: Date.now() });
    state.sel = null; state.trip = null; save();
    location.hash = `#/confirmed/${ref}`;
  });
}

/* ---------- Confirmation & trips ---------- */
function bookingQuote(b) { const keep = { sel: state.sel, trip: state.trip }; state.sel = b.sel; state.trip = b.trip; const q = quote(); Object.assign(state, keep); return q; }
function viewConfirmed(ref) {
  const b = state.bookings.find(x => x.ref === ref);
  if (!b) return `<div class="wrap empty"><span class="ms">search_off</span><p>We couldn’t find that booking.</p><p style="margin-top:12px"><a class="link" href="#/trips">My trips</a></p></div>`;
  const q = bookingQuote(b), ev = q.ev;
  // [when (for ordering), icon, label, title, detail, highlight]
  const arrive = q.hotel ? b.trip.checkIn + "T14:00" : addDays(ev.date, -1) + "T14:00";
  const items = [];
  if (q.extras.some(x => x.id === "airport")) items.push([arrive, "airport_shuttle", "On arrival", "Airport pick-up", "Your driver will message you the day before"]);
  if (q.hotel) items.push([b.trip.checkIn + "T15:00", "hotel", fmtDay(b.trip.checkIn + "T15:00"), `Check in at ${q.hotel.name}`, `From 15:00 · ${q.hotel.km} km from the stadium`]);
  if (q.extras.some(x => x.id === "tour")) {
    // tour the day before, in the afternoon if that's also arrival day
    const day = addDays(ev.date, -1), at = q.hotel && b.trip.checkIn === day ? "16:30" : "11:00";
    items.push([`${day}T${at}`, "tour", fmtDay(`${day}T${at}`), "Stadium tour", `${ev.venue} · ${at}`]);
  }
  if (q.extras.some(x => x.id === "matchday")) items.push([new Date(d(ev.date) - 90 * 6e4), "local_taxi", fmtDay(ev.date), "Match-day ride", "Pick-up from your hotel 90 minutes before the start"]);
  items.push([ev.date, "stadium", `${fmtDay(ev.date)} · ${fmtTime(ev.date)}`, ev.title, `${ev.venue} · Section ${q.l.section}, Row ${q.l.row} · ${b.sel.qty} seat${b.sel.qty > 1 ? "s together" : ""}`, true]);
  if (q.hotel) items.push([b.trip.checkOut + "T11:00", "logout", fmtDay(b.trip.checkOut + "T11:00"), "Check out", "By 11:00"]);
  items.sort((a, z) => d(a[0]) - d(z[0]));
  return `
  <div class="wrap">
    <div class="confirm-head"><div class="tick"><span class="ms">check</span></div>
      <h1>You’re going, ${esc(b.name.split(" ")[0])}!</h1>
      <p>Confirmation sent to ${esc(b.email)}. Mobile tickets arrive 48 hours before the event.</p>
      <span class="ref">${b.ref}</span></div>
    <div class="two-col">
      <div class="card"><h2>Your trip</h2>
        <ul class="timeline">${items.map(([, ic, when, what, sub, big]) => `<li><span class="ic ${big ? "big" : ""}"><span class="ms">${ic}</span></span><small>${esc(when)}</small><strong>${esc(what)}</strong><span>${esc(sub)}</span></li>`).join("")}</ul>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><button class="btn btn-ghost btn-sm" id="cal"><span class="ms">event</span>Add to calendar</button><a class="btn btn-ghost btn-sm" href="#/browse?city=${encodeURIComponent(ev.city)}"><span class="ms">explore</span>More in ${esc(ev.city)}</a></div>
      </div>
      <div><aside class="card summary"><h2 style="margin-bottom:10px">Paid</h2>
        <div class="lines" style="border-top:1px solid var(--line)">
          <div><span>Tickets</span><span>${money(q.tickets)}</span></div>
          ${q.hotel ? `<div><span>Hotel</span><span>${money(q.stay + q.bundle)}</span></div>` : ""}
          ${q.extras.length ? `<div><span>Extras</span><span>${money(q.extras.reduce((a, x) => a + x.total, 0))}</span></div>` : ""}
        </div><div class="total"><span>Total</span><b>${money(b.total)}</b></div>
        <a class="btn btn-primary" href="#/">Back to home</a></aside></div>
    </div>
  </div>`;
}
function afterConfirmed() { $("#cal")?.addEventListener("click", () => toast("Added to calendar (prototype)")); }

function viewTrips() {
  return `<div class="wrap"><div class="page-head"><h1>My trips</h1><p>Bookings made in this browser tab.</p></div>
    ${state.bookings.length ? `<div class="results">${state.bookings.map(b => {
      const q = bookingQuote(b), ev = q.ev, dt = d(ev.date);
      return `<a class="result" href="#/confirmed/${b.ref}">
        <div class="date-block"><small>${dt.toLocaleDateString("en-GB", { month: "short" })}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString("en-GB", { weekday: "short" })}</small></div>
        <div><h3>${esc(ev.title)}</h3><div class="meta">${b.sel.qty} × Section ${q.l.section}${q.hotel ? ` · ${esc(q.hotel.name)}, ${q.nights} nights` : ""}</div><div class="tags"><span class="badge badge-good"><span class="ms">check_circle</span>Confirmed · ${b.ref}</span></div></div>
        <div class="right"><div><small>Total</small><b>${money(b.total)}</b></div><span class="btn btn-ghost btn-sm">View trip</span></div></a>`;
    }).join("")}</div>` : `<div class="empty"><span class="ms">luggage</span><p>No trips yet.</p><p style="margin-top:12px"><a class="link" href="#/browse">Find a match</a></p></div>`}</div>`;
}

function viewCredits() {
  const seen = new Set();
  const list = (typeof CREDITS === "undefined" ? [] : Object.entries(CREDITS)).filter(([, c]) => !seen.has(c.file) && seen.add(c.file));
  return `<div class="wrap"><div class="page-head"><h1>Image credits</h1><p>All photos are from Wikimedia Commons under open licences. Images may be cropped.</p></div>
    <div class="credits">${list.map(([k, c]) => `<div class="credit"><img src="img/${c.file}" alt="" loading="lazy">
      <div><a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""))}</a>
      <small>${esc(c.author)} · ${c.licenseUrl ? `<a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a>` : esc(c.license)}</small></div></div>`).join("")}</div></div>`;
}

/* ============================================================
   ROUTER
   ============================================================ */
function route() {
  $$(".modal-bg").forEach(m => m.remove());
  document.body.classList.remove("has-bar");
  const [path] = (location.hash.slice(1) || "/").split("?");
  const [view, arg] = path.split("/").filter(Boolean);
  const needsSel = ["trip", "checkout"].includes(view) && !state.sel;
  if (needsSel) { location.replace("#/"); return; }

  exitHeaderSearch();
  document.body.dataset.view = view || "home";
  document.body.classList.toggle("flow", ["event", "trip", "checkout"].includes(view));
  $("#hdr").innerHTML = header();
  $("#tabs").innerHTML = tabBar(view);
  wireNav(["sport", "comp", "team", "browse", "explore"].includes(view) ? "sports" : ["city", "venue"].includes(view) ? "dest" : null);

  const views = {
    undefined: [viewHome, afterHome],
    browse: [viewBrowse, afterBrowse],
    event: [() => viewEvent(arg), () => afterEvent(arg)],
    trip: [viewTrip, afterTrip],
    checkout: [viewCheckout, afterCheckout],
    confirmed: [() => viewConfirmed(arg), afterConfirmed],
    trips: [viewTrips, () => {}],
    explore: [viewExplore, () => {}],
    credits: [viewCredits, () => {}],
    city: [() => viewCity(decodeURIComponent(arg || "")), afterHub],
    comp: [() => viewComp(arg), afterHub],
    sport: [() => viewSport(arg), afterHub],
    venue: [() => viewVenue(arg), afterHub],
    team: [() => viewTeam(arg), afterHub],
  };
  const [v, after] = views[view] || views.undefined;
  app.innerHTML = v();
  after();
  wireSearchBoxes();
  scrollTo(0, 0);
  const ev = view === "event" && eventOf(arg);
  document.title = ev ? `${ev.title} tickets · ${BRAND.name}` : `${BRAND.name} · Sports tickets & trips`;
}
$("#ftr").innerHTML = footer();
addEventListener("hashchange", route);
route();
