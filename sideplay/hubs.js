/* ============================================================
   Hub pages — destination, competition, sport, venue, team.
   Shared structure:
     hero (left-aligned, key facts) → big games (event cards)
     → fixtures (one list, filter chips, grouped by month)
     → related rows
   Loaded before app.js; uses its helpers at render time.
   ============================================================ */

const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const byDate = list => [...list].sort((a, b) => d(a.date) - d(b.date));

/* "Semi-final: A vs B" → ["A", "B"]; races and other events have no teams */
function teamsOf(e) {
  const t = e.title.replace(/^[^:]+:\s*/, "");
  return t.includes(" vs ") ? t.split(" vs ").map(s => s.trim()) : [];
}
function allTeams() { return [...new Set(EVENTS.flatMap(teamsOf))]; }
function teamBySlug(s) { return allTeams().find(t => slug(t) === s); }
function allVenues() {
  return [...new Map(EVENTS.map(e => [slug(e.venue), { slug: slug(e.venue), name: e.venue, city: e.city, sport: e.sport }])).values()];
}
function venueBySlug(s) { return allVenues().find(v => v.slug === s); }
const crestText = n => n.replace(/^(FC|AC|SSC|SC|RB|1\.)\s+/i, "").split(/\s+/).filter(w => !/^(FC|CF|SG|de)$/i.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();

/* New fixtures reuse a photo taken at the same venue */
function evKey(e) {
  if (imgFor(`ev-${e.id}`)) return `ev-${e.id}`;
  const twin = EVENTS.find(x => x.venue === e.venue && imgFor(`ev-${x.id}`));
  return twin ? `ev-${twin.id}` : `ev-${e.id}`;
}
const venueKey = v => evKey(EVENTS.find(e => e.venue === v.name));
/* Competitions without their own photo borrow one of their fixtures' */
const compKey = c => imgFor(`comp-${c.id}`) || !EVENTS.some(e => e.comp === c.id) ? `comp-${c.id}` : evKey(EVENTS.find(e => e.comp === c.id));
/* Big games first, then by date */
const topFirst = list => [...list].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || d(a.date) - d(b.date));
const fromPrice = list => list.length ? Math.min(...list.map(e => e.from)) : 0;

/* ---------- Shared pieces ---------- */
function hubCrumbs(trail) {
  return `<div class="crumbs hub-crumbs"><a href="#/">Home</a>${trail.map(([href, t]) => `<span class="ms" style="font-size:16px">chevron_right</span>${href ? `<a href="${href}">${esc(t)}</a>` : `<span>${esc(t)}</span>`}`).join("")}</div>`;
}
/* Left-aligned hero; text sits low where the scrim is darkest; facts as chips */
function hubHero({ key, art, overline, title, tagline, crest, facts = [] }) {
  return `<section class="hub-hero" style="${bg(key, art)}"><div class="hh-inner">
    ${crest ? `<span class="hero-crest">${crest}</span>` : ""}
    ${overline ? `<span class="overline">${esc(overline)}</span>` : ""}
    <h1>${esc(title)}</h1>
    <p class="tagline">${esc(tagline)}</p>
    ${facts.length ? `<div class="hh-facts">${facts.map(([icon, text]) => `<span><span class="ms">${icon}</span>${esc(text)}</span>`).join("")}</div>` : ""}
  </div></section>`;
}
function rowSection(id, title, sub, cards) {
  if (!cards.length) return "";
  return `<section class="section"><div class="sec-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div><div class="arrows" data-for="${id}"></div></div>
    <div class="row" id="${id}">${cards.join("")}</div></section>`;
}
/* Event card from the design-system moodboard: 16:9 photo, details below */
const ecard = e => `
  <a href="#/event/${e.id}" class="ecard"><div class="ecard-img" style="${bg(evKey(e), e.sport)}">${e.hot ? '<span class="badge badge-hot"><span class="ms">local_fire_department</span>Selling fast</span>' : ""}</div>
    <div class="ecard-body"><span class="overline">${esc(compOf(e.comp).name)}</span><h3>${esc(e.title)}</h3>
      <div class="meta"><span class="ms">calendar_today</span>${fmtDay(e.date)} · ${fmtTime(e.date)}</div>
      <div class="meta"><span class="ms">location_on</span>${esc(e.venue)}, ${esc(e.city)}</div>
      <div class="ecard-foot"><div><small>From</small><b>${money(e.from)}</b></div><span class="btn btn-primary btn-sm">View seats</span></div></div></a>`;
const pickCard = e => `
  <a href="#/event/${e.id}" class="photo pick" style="${bg(evKey(e), e.sport)}">
    ${e.hot ? '<span class="badge badge-hot"><span class="ms">local_fire_department</span>Selling fast</span>' : `<span class="badge">${esc(compOf(e.comp).name)}</span>`}
    ${glyph(evKey(e), sportOf(e.sport).icon)}
    <div class="cap"><h3>${esc(e.title)}</h3><div class="sub">${fmtDay(e.date)} · ${esc(e.city)}</div>
    <div class="price"><small>From</small><b>${money(e.from)}</b></div></div></a>`;
const compCard = c => `
  <a href="#/comp/${c.id}" class="photo comp-card" style="${bg(compKey(c), c.sport)}">${glyph(compKey(c), "emoji_events")}
    <div class="cap"><h3>${esc(c.name)}</h3><div class="sub"><span class="ms" style="font-size:15px">location_on</span> ${esc(c.where)} · ${plural(EVENTS.filter(e => e.comp === c.id).length, "fixture")}</div></div></a>`;
const venueCard = v => `
  <a href="#/venue/${v.slug}" class="photo venue-card" style="${bg(venueKey(v), v.sport)}">${glyph(venueKey(v), "stadium")}
    <div class="cap"><h3>${esc(v.name)}</h3><div class="sub"><span class="ms" style="font-size:15px">location_on</span> ${esc(v.city)}</div></div></a>`;
const cityCard = c => `
  <a href="#/city/${encodeURIComponent(c)}" class="photo dest" style="${bg(`city-${c}`, CITIES[c].art)}">
    <div class="cap"><h3>${esc(c)}</h3><div class="sub">${plural(EVENTS.filter(e => e.city === c).length, "fixture")} · hotels from ${money(CITIES[c].nightly * 0.58)}/night</div></div></a>`;
const teamCard = t => {
  const n = EVENTS.filter(e => teamsOf(e).includes(t)).length;
  return `<a href="#/team/${slug(t)}" class="team-card"><span class="crest lg has-svg">${crestSvg(t)}</span><strong>${esc(t)}</strong><small>${plural(n, "match", "matches")}</small></a>`;
};
/* Hotel tie-in, shown on destination and venue pages */
const stayStrip = (city, place) => `<section class="section"><div class="trip-strip"><span class="ms">hotel</span>
  <div><strong>Stay near ${esc(place)}</strong><span>Pick your seats, then add a hotel close by. From ${money(CITIES[city].nightly * 0.58)}/night, 5% off when booked together.</span></div></div></section>`;

/* ---------- Fixture list: filter chips + month groups; each row opens the event ---------- */
function fixtureRow(e) {
  const dt = d(e.date), [a, b] = teamsOf(e);
  const who = a
    ? `<span class="fx-team"><span class="crest has-svg">${crestSvg(a)}</span>${esc(a)}</span><span class="fx-team"><span class="crest has-svg">${crestSvg(b)}</span>${esc(b)}</span>`
    : `<span class="fx-team"><span class="crest fx-icon"><span class="ms">${sportOf(e.sport).icon}</span></span>${esc(e.title)}</span>`;
  return `<a class="fx" href="#/event/${e.id}">
    <span class="fx-date"><small>${dt.toLocaleDateString("en-GB", { weekday: "short" })}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString("en-GB", { month: "short" })}</small></span>
    <span class="fx-main">${who}<span class="fx-meta">${fmtTime(e.date)} · ${esc(e.venue)}, ${esc(e.city)} · ${esc(compOf(e.comp).name)}</span></span>
    <span class="fx-side">${e.hot ? '<span class="badge badge-hot">Selling fast</span>' : ""}<small>from</small><b>${money(e.from)}</b></span>
    <span class="ms fx-go">chevron_right</span></a>`;
}
let fixState = null;
function fixturesSection(list, { title = "Fixtures", filterBy = "comp" } = {}) {
  const groups = filterBy === "comp"
    ? COMPETITIONS.filter(c => list.some(e => e.comp === c.id)).map(c => [c.id, c.name])
    : SPORTS.filter(s => list.some(e => e.sport === s.id)).map(s => [s.id, s.name]);
  fixState = { list: byDate(list), filterBy, groups, pick: "", sort: "date", shown: 10 };
  return `<section class="section" id="fixtures"><div class="sec-head"><div><h2>${esc(title)}</h2><p id="fxCount"></p></div>
      <label class="select"><span class="sr">Sort fixtures</span><select id="fxSort"><option value="date">Soonest first</option><option value="price">Lowest price</option></select></label></div>
    ${groups.length > 1 ? `<div class="fx-chips" id="fxChips" role="group" aria-label="Filter fixtures"></div>` : ""}
    <div id="fxList"></div><div class="more-wrap" id="fxMore"></div></section>`;
}
function drawFixtures() {
  const s = fixState; if (!s || !$("#fxList")) return;
  let list = s.list.filter(e => !s.pick || e[s.filterBy] === s.pick);
  if (s.sort === "price") list = [...list].sort((a, b) => a.from - b.from);
  $("#fxCount").textContent = plural(list.length, "fixture");
  if ($("#fxChips")) $("#fxChips").innerHTML = [["", "All"], ...s.groups].map(([id, name]) =>
    `<button type="button" class="fchip ${s.pick === id ? "on" : ""}" data-pick="${id}" aria-pressed="${s.pick === id}">${esc(name)}</button>`).join("");
  const shown = list.slice(0, s.shown);
  // Group by month when sorted by date; flat list when sorted by price
  let html = "", month = "";
  shown.forEach(e => {
    const m = d(e.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (s.sort === "date" && m !== month) { html += `<h3 class="fx-month">${m}</h3>`; month = m; }
    html += fixtureRow(e);
  });
  $("#fxList").innerHTML = html || `<div class="empty"><span class="ms">event_busy</span><p>No fixtures here yet.</p></div>`;
  $("#fxMore").innerHTML = list.length > s.shown ? `<button class="btn btn-outline" id="fxMoreBtn">Show ${Math.min(10, list.length - s.shown)} more</button>` : "";
  $$("[data-pick]").forEach(b => b.onclick = () => { s.pick = b.dataset.pick; s.shown = 10; drawFixtures(); });
  $("#fxMoreBtn")?.addEventListener("click", () => { s.shown += 10; drawFixtures(); });
}
function afterHub() {
  wireArrows();
  if ($("#fxList")) { $("#fxSort").onchange = e => { fixState.sort = e.target.value; drawFixtures(); }; drawFixtures(); }
}
const notFound = what => `<div class="wrap empty"><span class="ms">search_off</span><p>We couldn’t find that ${what}.</p><p style="margin-top:12px"><a class="link" href="#/browse">Browse all fixtures</a></p></div>`;
const bigGames = (title, list) => list.length > 1 ? rowSection("bigGames", title, "", topFirst(list).slice(0, 8).map(ecard)) : "";

/* ---------- Destination ---------- */
function viewCity(name) {
  const c = CITIES[name];
  if (!c) return notFound("destination");
  const evs = byDate(EVENTS.filter(e => e.city === name));
  const comps = COMPETITIONS.filter(k => evs.some(e => e.comp === k.id));
  const venues = allVenues().filter(v => v.city === name);
  const others = Object.keys(CITIES).filter(k => k !== name && EVENTS.some(e => e.city === k))
    .sort((a, b) => (CITIES[b].country === c.country) - (CITIES[a].country === c.country));
  return `<div class="wrap">
    ${hubCrumbs([["#/explore?tab=dest", "Destinations"], [null, name]])}
    ${hubHero({ key: `city-${name}`, art: c.art, overline: c.country, title: name, tagline: c.tagline || `Live sport in ${name}, with seats and a stay near the stadium in one booking.`,
      facts: [["confirmation_number", plural(evs.length, "fixture")], ["stadium", plural(venues.length, "stadium")], ["hotel", `Hotels from ${money(c.nightly * 0.58)}`]] })}
    ${bigGames(`Big games in ${name}`, evs)}
    ${fixturesSection(evs, { title: `What’s on in ${name}`, filterBy: comps.length > 1 ? "comp" : "sport" })}
    ${stayStrip(name, name)}
    ${rowSection("cityVenues", `Stadiums in ${name}`, "", venues.map(venueCard))}
    ${rowSection("cityComps", "Competitions", "", comps.map(compCard))}
    ${rowSection("cityOthers", "More destinations", "", others.slice(0, 8).map(cityCard))}
  </div>`;
}

/* ---------- Competition ---------- */
function viewComp(id) {
  const c = compOf(id);
  if (!c) return notFound("competition");
  const evs = byDate(EVENTS.filter(e => e.comp === id));
  const teams = [...new Set(evs.flatMap(teamsOf))];
  const cities = [...new Set(evs.map(e => e.city))];
  const similar = COMPETITIONS.filter(k => k.id !== id && EVENTS.some(e => e.comp === k.id)).sort((a, b) => (b.sport === c.sport) - (a.sport === c.sport));
  return `<div class="wrap">
    ${hubCrumbs([[`#/sport/${c.sport}`, sportOf(c.sport).name], [null, c.name]])}
    ${hubHero({ key: compKey(c), art: c.sport, overline: sportOf(c.sport).name, title: c.name, tagline: c.tagline || `Every ${c.name} fixture we have seats for, with hotels near each ground.`,
      facts: [["confirmation_number", plural(evs.length, "fixture")], ["location_on", plural(cities.length, "city", "cities")], ["sell", `From ${money(fromPrice(evs))}`]] })}
    ${bigGames("Headline fixtures", evs)}
    ${fixturesSection(evs, { title: "All fixtures", filterBy: "comp" })}
    ${rowSection("compTeams", "Teams", "", teams.map(teamCard))}
    ${rowSection("compSimilar", "More competitions", "", similar.map(compCard))}
  </div>`;
}

/* ---------- Sport ---------- */
function viewSport(id) {
  const s = sportOf(id);
  if (!s) return notFound("sport");
  const evs = byDate(EVENTS.filter(e => e.sport === id));
  const comps = COMPETITIONS.filter(c => c.sport === id && evs.some(e => e.comp === c.id));
  const venues = allVenues().filter(v => v.sport === id);
  const cities = [...new Set(evs.map(e => e.city))];
  const heroComp = comps.find(c => imgFor(`comp-${c.id}`));
  return `<div class="wrap">
    ${hubCrumbs([["#/explore", "Sports"], [null, s.name]])}
    ${hubHero({ key: heroComp ? `comp-${heroComp.id}` : evs[0] ? evKey(evs[0]) : "", art: id, overline: "Sport", title: s.name, tagline: `From league nights to finals: ${s.name.toLowerCase()} tickets with a stay near the venue.`,
      facts: [["confirmation_number", plural(evs.length, "fixture")], ["emoji_events", plural(comps.length, "competition")], ["location_on", plural(cities.length, "city", "cities")]] })}
    ${evs.length ? `${bigGames("Big games", evs)}${fixturesSection(evs, { title: "All fixtures", filterBy: "comp" })}` : `<div class="empty"><span class="ms">event_busy</span><p>No ${esc(s.name.toLowerCase())} fixtures on sale yet.</p></div>`}
    ${rowSection("sportComps", "Competitions", "", comps.map(compCard))}
    ${rowSection("sportVenues", "Stadiums", "", venues.map(venueCard))}
    ${rowSection("sportCities", `Where to watch ${s.name.toLowerCase()}`, "Cities with fixtures coming up, and hotels nearby.", cities.map(cityCard))}
  </div>`;
}

/* ---------- Venue ---------- */
function viewVenue(sl) {
  const v = venueBySlug(sl);
  if (!v) return notFound("venue");
  const evs = byDate(EVENTS.filter(e => e.venue === v.name));
  const similar = allVenues().filter(x => x.slug !== sl).sort((a, b) => (b.sport === v.sport) - (a.sport === v.sport));
  return `<div class="wrap">
    ${hubCrumbs([[`#/city/${encodeURIComponent(v.city)}`, v.city], [null, v.name]])}
    ${hubHero({ key: venueKey(v), art: v.sport, overline: `${v.city}, ${CITIES[v.city].country}`, title: v.name, tagline: `Live ${sportOf(v.sport).name.toLowerCase()} at ${v.name}. Pick your section on the seat map, then add a hotel nearby.`,
      facts: [["confirmation_number", plural(evs.length, "fixture")], ["sell", `From ${money(fromPrice(evs))}`], ["hotel", `Hotels from ${money(CITIES[v.city].nightly * 0.58)}`]] })}
    ${fixturesSection(evs, { title: `Coming up at ${v.name}`, filterBy: "comp" })}
    ${stayStrip(v.city, v.name)}
    ${rowSection("venueSimilar", "More stadiums", "", similar.slice(0, 10).map(venueCard))}
  </div>`;
}

/* ---------- Team ---------- */
function viewTeam(sl) {
  const t = teamBySlug(sl);
  if (!t) return notFound("team");
  const evs = byDate(EVENTS.filter(e => teamsOf(e).includes(t)));
  const home = evs.find(e => teamsOf(e)[0] === t) || evs[0];
  const comps = COMPETITIONS.filter(c => evs.some(e => e.comp === c.id));
  const rivals = [...new Set(evs.flatMap(teamsOf))].filter(x => x !== t);
  return `<div class="wrap">
    ${hubCrumbs([[`#/sport/${home.sport}`, sportOf(home.sport).name], [null, t]])}
    ${hubHero({ key: evKey(home), art: home.sport, crest: crestSvg(t), overline: comps.map(c => c.name).join(" · "), title: t, tagline: `Follow ${t} home and away. Seats together, plus a stay near the ground.`,
      facts: [["confirmation_number", plural(evs.length, "match", "matches")], ["home", teamsOf(home)[0] === t ? home.venue : home.city], ["sell", `From ${money(fromPrice(evs))}`]] })}
    ${fixturesSection(evs, { title: "Matches", filterBy: "comp" })}
    ${rowSection("teamComps", "Competitions", "", comps.map(compCard))}
    ${rowSection("teamRivals", "Opponents", "", rivals.map(teamCard))}
  </div>`;
}
