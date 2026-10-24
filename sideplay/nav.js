/* ============================================================
   Header navigation — Sports ▾ and Destinations ▾ mega-menus
   on desktop (mobile uses the tab bar + Explore page in
   mobile.js). Built from data.js, so new sports, competitions or cities appear
   automatically. Loaded after hubs.js, before app.js.
   ============================================================ */

function navData() {
  const sports = SPORTS.filter(s => EVENTS.some(e => e.sport === s.id)).map(s => {
    const evs = EVENTS.filter(e => e.sport === s.id);
    const comps = COMPETITIONS.filter(c => c.sport === s.id && evs.some(e => e.comp === c.id));
    const count = {};
    evs.flatMap(teamsOf).forEach(t => count[t] = (count[t] || 0) + 1);
    const teams = Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b)).slice(0, 3);
    return { ...s, n: evs.length, comps, teams };
  });
  const cities = Object.keys(CITIES).filter(c => EVENTS.some(e => e.city === c))
    .map(c => ({ name: c, n: EVENTS.filter(e => e.city === c).length, ...CITIES[c] }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  return { sports, cities, total: EVENTS.length };
}

function navMarkup() {
  const { sports, cities, total } = navData();
  const sportsMega = `
    <div class="mega" id="mega-sports" hidden><div class="wrap">
      <div class="mega-grid">${sports.map(s => `
        <div class="mega-col">
          <a class="mega-head" href="#/sport/${s.id}"><span class="chip-ic"><span class="ms">${s.icon}</span></span><span><strong>${s.name}</strong><small>${plural(s.n, "event")}</small></span></a>
          ${s.comps.length ? `<span class="mega-label">Competitions</span>
          <ul>${s.comps.map(c => `<li><a href="#/comp/${c.id}">${esc(c.name)}</a></li>`).join("")}</ul>` : ""}
          ${s.teams.length ? `<span class="mega-label">Popular teams</span>
          <ul>${s.teams.map(t => `<li><a class="mega-team" href="#/team/${slug(t)}"><span class="crest sm has-svg">${crestSvg(t)}</span>${esc(t)}</a></li>`).join("")}</ul>` : ""}
        </div>`).join("")}
      </div>
      <div class="mega-foot"><a class="view-all" href="#/browse">See all ${total} events <span class="ms">arrow_forward</span></a></div>
    </div></div>`;
  const destMega = `
    <div class="mega" id="mega-dest" hidden><div class="wrap">
      <div class="dest-grid">${cities.map(c => `
        <a class="dest-item" href="#/city/${encodeURIComponent(c.name)}">
          <span class="dest-thumb" style="${bg(`city-${c.name}`, c.art)}"></span>
          <span><strong>${esc(c.name)}</strong><small>${plural(c.n, "event")} · ${esc(c.country)}</small></span></a>`).join("")}
      </div>
      <div class="mega-foot"><span class="mega-note"><span class="ms">hotel</span>Every destination comes with hotels near the stadium, 5% off when booked with tickets.</span></div>
    </div></div>`;
  return {
    nav: `<nav class="nav" aria-label="Main">
      <button class="menu-btn" data-menu="sports" aria-expanded="false" aria-controls="mega-sports">Sports<span class="ms">expand_more</span></button>
      <button class="menu-btn" data-menu="dest" aria-expanded="false" aria-controls="mega-dest">Destinations<span class="ms">expand_more</span></button>
    </nav>`,
    panels: sportsMega + destMega,
  };
}

/* Open/close behaviour; `section` marks which menu the current page belongs to */
function wireNav(section) {
  const btns = $$(".menu-btn");
  const closeAll = except => btns.forEach(b => {
    if (b === except) return;
    b.setAttribute("aria-expanded", "false");
    $(`#${b.getAttribute("aria-controls")}`).hidden = true;
  });
  const open = b => { closeAll(b); b.setAttribute("aria-expanded", "true"); $(`#${b.getAttribute("aria-controls")}`).hidden = false; };
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let t;
  btns.forEach(b => {
    b.classList.toggle("on", b.dataset.menu === section);
    // With a mouse, hover already opened it — a click shouldn't close it again.
    // Keyboard activation (detail === 0) still toggles.
    b.onclick = e => {
      const isOpen = b.getAttribute("aria-expanded") === "true";
      if (isOpen && hoverable && e.detail > 0) return;
      isOpen ? closeAll() : open(b);
    };
    if (hoverable) {
      const panel = $(`#${b.getAttribute("aria-controls")}`);
      [b, panel].forEach(el => {
        el.onmouseenter = () => { clearTimeout(t); open(b); };
        el.onmouseleave = () => { t = setTimeout(closeAll, 180); };
      });
    }
  });
  document.onkeydown = e => {
    if (e.key !== "Escape") return;
    const openBtn = btns.find(b => b.getAttribute("aria-expanded") === "true");
    if (openBtn) { closeAll(); openBtn.focus(); }
  };
  document.onclick = e => { if (!e.target.closest(".menu-btn, .mega")) closeAll(); };
  $$(".mega a").forEach(a => a.addEventListener("click", () => closeAll()));

}
