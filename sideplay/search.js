/* ============================================================
   Search — one dropdown component in the header (modelled on
   the reference ticketing site):
   • focus, empty   → "Popular right now" fixtures
   • typing         → "Results for …": sports, teams (crest),
                      competitions, destinations, venues, events
   • clear (ⓧ) inside the field; ↑ ↓ Enter Esc on the keyboard
   On phones the header field opens in place of the logo with a
   Cancel button; results drop down under it.
   Loaded before app.js; uses its helpers at render time.
   ============================================================ */

const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

let SEARCH_INDEX = null;
function searchIndex() {
  if (SEARCH_INDEX) return SEARCH_INDEX;
  const items = [];
  const country = city => CITIES[city]?.country || "";
  SPORTS.filter(s => EVENTS.some(e => e.sport === s.id)).forEach(s =>
    items.push({ type: "sport", title: s.name, sub: "Sport", href: `#/sport/${s.id}`, icon: s.icon }));
  allTeams().forEach(t =>
    items.push({ type: "team", title: t, sub: sportOf(teamSport(t)).name, href: `#/team/${slug(t)}`, crest: t }));
  COMPETITIONS.filter(c => EVENTS.some(e => e.comp === c.id)).forEach(c =>
    items.push({ type: "comp", title: c.name, sub: `${sportOf(c.sport).name} · ${c.where}`, href: `#/comp/${c.id}`, icon: "emoji_events" }));
  Object.keys(CITIES).filter(c => EVENTS.some(e => e.city === c)).forEach(c =>
    items.push({ type: "city", title: c, sub: country(c), href: `#/city/${encodeURIComponent(c)}`, icon: "location_on" }));
  allVenues().forEach(v =>
    items.push({ type: "venue", title: v.name, sub: `${v.city} · ${country(v.city)}`, href: `#/venue/${v.slug}`, icon: "stadium" }));
  upcoming().forEach(e =>
    items.push({ type: "event", title: e.title, sub: `${fmtDay(e.date)} · ${e.city}`, href: `#/event/${e.id}`, icon: "confirmation_number", hot: e.hot }));
  items.forEach(i => i.key = norm(i.title));
  return (SEARCH_INDEX = items);
}

/* Rank: title starts with query > a word starts with it > contains it; then by type */
const TYPE_ORDER = ["sport", "team", "comp", "city", "venue", "event"];
function searchFor(q) {
  const n = norm(q);
  return searchIndex()
    .map(i => {
      const at = i.key.indexOf(n);
      if (at < 0) return null;
      const rank = at === 0 ? 0 : /[\s\-(]/.test(i.key[at - 1]) ? 1 : 2;
      return { ...i, at, rank };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.title.localeCompare(b.title))
    .slice(0, 10);
}
const trending = () => upcoming().filter(e => e.hot).slice(0, 8)
  .map(e => ({ type: "event", title: e.title, sub: `${fmtDay(e.date)} · ${e.city}`, href: `#/event/${e.id}`, icon: "confirmation_number" }));

/* Bold the matched part of the title */
function highlight(title, at, len) {
  if (at == null || at < 0) return esc(title);
  return esc(title.slice(0, at)) + "<mark>" + esc(title.slice(at, at + len)) + "</mark>" + esc(title.slice(at + len));
}

let sboxSeq = 0;
function searchBox({ placeholder, cls = "", cancel = false }) {
  const id = `sbox-${++sboxSeq}`;
  return `<div class="sbox ${cls}" data-sbox>
    <div class="sbox-field">
      <span class="ms">search</span>
      <input type="search" placeholder="${esc(placeholder)}" autocomplete="off" enterkeyhint="search"
        role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}" aria-label="Search teams, tournaments, cities">
      <button type="button" class="sbox-clear" aria-label="Clear search" hidden><span class="ms">cancel</span></button>
    </div>
    ${cancel ? `<button type="button" class="sbox-cancel">Cancel</button>` : ""}
    <div class="sbox-drop" id="${id}" role="listbox" hidden></div>
  </div>`;
}

function wireSearchBoxes(root = document) {
  $$("[data-sbox]:not([data-wired])", root).forEach(box => {
    box.dataset.wired = "1";
    const input = $("input", box), drop = $(".sbox-drop", box), clear = $(".sbox-clear", box);
    let items = [], idx = -1;

    const row = (it, i, q) => `<a href="${it.href}" class="sbox-item ${i === idx ? "active" : ""}" role="option" id="${drop.id}-${i}" aria-selected="${i === idx}">
      <span class="sbox-ic ${it.crest ? "crest-ic" : ""}">${it.crest ? `<span class="crest has-svg">${crestSvg(it.crest)}</span>` : `<span class="ms">${it.icon}</span>`}</span>
      <span class="sbox-txt"><strong>${q ? highlight(it.title, it.at, q.length) : esc(it.title)}</strong><small>${esc(it.sub)}</small></span>
      ${it.hot ? '<span class="badge badge-hot">Selling fast</span>' : ""}</a>`;

    function render() {
      const q = input.value.trim();
      clear.hidden = !q;
      items = q ? searchFor(q) : trending();
      drop.innerHTML = q
        ? (items.length
            ? `<p class="sbox-head">Results for “${esc(q)}”</p>${items.map((it, i) => row(it, i, q)).join("")}
               <a href="#/browse?q=${encodeURIComponent(q)}" class="sbox-all"><span class="ms">search</span>See all fixtures for “${esc(q)}”</a>`
            : `<p class="sbox-head">No matches for “${esc(q)}”</p><p class="sbox-empty">Try a team, competition, stadium or city.</p>`)
        : `<p class="sbox-head">Popular right now</p>${items.map((it, i) => row(it, i)).join("")}`;
      open();
    }
    function open() { drop.hidden = false; input.setAttribute("aria-expanded", "true"); box.classList.add("open"); }
    function close() {
      drop.hidden = true; idx = -1; box.classList.remove("open");
      input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant");
    }
    function move(d) {
      if (!items.length) return;
      idx = (idx + d + items.length) % items.length;
      $$(".sbox-item", drop).forEach((a, i) => { a.classList.toggle("active", i === idx); a.setAttribute("aria-selected", i === idx); });
      const act = $(`#${drop.id}-${idx}`); act?.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", act?.id || "");
    }

    input.addEventListener("focus", () => {
      render();
      // Phones: bring the field up so the results have room
      if (matchMedia("(max-width: 1023.98px)").matches && !box.closest(".header")) {
        const y = box.getBoundingClientRect().top + scrollY - 72;
        if (Math.abs(scrollY - y) > 8) scrollTo({ top: y, behavior: "smooth" });
      }
    });
    input.addEventListener("input", () => { idx = -1; render(); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); if (drop.hidden) render(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const q = input.value.trim();
        const href = idx >= 0 ? items[idx].href : q ? `#/browse?q=${encodeURIComponent(q)}` : null;
        if (href) { close(); input.blur(); location.hash = href; }
      } else if (e.key === "Escape") {
        if (input.value) { input.value = ""; render(); } else { close(); input.blur(); exitHeaderSearch(); }
      }
    });
    clear.addEventListener("click", () => { input.value = ""; render(); input.focus(); });
    // Keep focus in the field while a result is being tapped, so the tap isn't lost to blur
    drop.addEventListener("pointerdown", e => e.preventDefault());
    drop.addEventListener("click", e => { if (e.target.closest("a")) { close(); input.blur(); exitHeaderSearch(); } });
    $(".sbox-cancel", box)?.addEventListener("click", () => { input.value = ""; clear.hidden = true; close(); input.blur(); exitHeaderSearch(); });
    box._close = close;
  });
}
document.addEventListener("pointerdown", e => {
  $$("[data-sbox].open").forEach(box => { if (!box.contains(e.target) && !e.target.closest("[data-open-search]")) box._close(); });
});

/* Phones: header search replaces the logo while open */
function enterHeaderSearch() {
  document.body.classList.add("searching");
  const input = $(".header [data-sbox] input");
  input?.focus();
}
function exitHeaderSearch() { document.body.classList.remove("searching"); }
document.addEventListener("click", e => { if (e.target.closest("[data-open-search]")) { e.preventDefault(); enterHeaderSearch(); } });
