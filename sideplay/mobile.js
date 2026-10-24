/* ============================================================
   Mobile shell — bottom tab bar (its Search tab opens the header
   search, see search.js), Explore page and the sticky total bar
   used in the booking flow.
   On desktop the tab bar and search button are hidden by CSS;
   Explore still works as a page. Loaded after nav.js, before app.js.
   ============================================================ */

/* ---------- Bottom tab bar ---------- */
function tabBar(view) {
  const n = state.bookings.length;
  const on = id => ({
    home: !view,
    explore: ["explore", "browse", "sport", "comp", "team", "city", "venue"].includes(view),
    trips: ["trips", "confirmed"].includes(view),
  }[id] ? "on" : "");
  return `<nav class="tabbar" aria-label="App">
    <a href="#/" class="${on("home")}"><span class="ms">home</span>Home</a>
    <a href="#/explore" class="${on("explore")}"><span class="ms">explore</span>Explore</a>
    <button type="button" data-open-search><span class="ms">search</span>Search</button>
    <a href="#/trips" class="${on("trips")}"><span class="ms">luggage</span>Trips${n ? `<i>${n}</i>` : ""}</a>
  </nav>`;
}


/* ---------- Explore (replaces the old drawer on mobile) ---------- */
function viewExplore() {
  const tab = new URLSearchParams(location.hash.split("?")[1] || "").get("tab") === "dest" ? "dest" : "sports";
  const { sports, cities, total } = navData();
  return `<div class="wrap explore">
    <div class="page-head"><h1>Explore</h1><p>Find a match by sport, or start from where you want to go.</p></div>
    <div class="segmented" role="tablist">
      <a role="tab" aria-selected="${tab === "sports"}" href="#/explore" class="${tab === "sports" ? "on" : ""}">Sports</a>
      <a role="tab" aria-selected="${tab === "dest"}" href="#/explore?tab=dest" class="${tab === "dest" ? "on" : ""}">Destinations</a>
    </div>
    ${tab === "sports" ? `
      <div class="ex-list">${sports.map(s => `
        <section class="ex-sport">
          <a class="ex-head" href="#/sport/${s.id}"><span class="chip-ic"><span class="ms">${s.icon}</span></span><span><strong>${s.name}</strong><small>${plural(s.n, "event")}</small></span><span class="ms">chevron_right</span></a>
          <div class="ex-chips">
            ${s.comps.map(c => `<a class="pill" href="#/comp/${c.id}"><span class="ms">emoji_events</span>${esc(c.name)}</a>`).join("")}
            ${s.teams.map(t => `<a class="pill" href="#/team/${slug(t)}"><span class="crest sm has-svg">${crestSvg(t)}</span>${esc(t)}</a>`).join("")}
          </div>
        </section>`).join("")}
      </div>
      <a class="btn btn-outline ex-all" href="#/browse">See all ${total} events</a>` : `
      <div class="ex-cities">${cities.map(c => `
        <a class="ex-city" href="#/city/${encodeURIComponent(c.name)}" style="${bg(`city-${c.name}`, c.art)}">
          <span><strong>${esc(c.name)}</strong><small>${plural(c.n, "event")} · ${esc(c.country)}</small></span></a>`).join("")}
      </div>`}
  </div>`;
}

/* ---------- Booking flow helpers ---------- */
/* Sticky bottom bar with the running total; its button clicks the page's own CTA */
function totalBar(label, target) {
  const qt = quote();
  return `<div class="total-bar"><div class="wrap">
    <button type="button" class="tb-total" data-scroll-summary><small>Total · ${plural(state.sel.qty, "ticket")}${qt.hotel ? " + stay" : ""}</small><b>${money(qt.total)}</b><span>See breakdown</span></button>
    <button type="button" class="btn btn-primary" data-proxy="${target}">${label}<span class="ms">arrow_forward</span></button>
  </div></div>`;
}
document.addEventListener("click", e => {
  const p = e.target.closest("[data-proxy]");
  if (p) $(p.dataset.proxy)?.click();
  if (e.target.closest("[data-scroll-summary]")) $(".summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
