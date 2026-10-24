/* ============================================================
   PRODUCT NOTES — optional layer explaining the decisions behind
   each screen. On with ?notes=1 or the floating toggle; numbered
   pins open a short note. Doesn't touch the app's own markup.
   ============================================================ */
(() => {
  const CASE_STUDY = "case-study/index.html";
  // view → [selector, kind, title, body]
  const HUB = [
    [".hub-hero", "Design system", "One template, five page types", "Destination, competition, sport, venue and team pages share one layout, so new supplier inventory slots in without new design work."],
    ["#fixtures", "Design", "Fixtures grouped by month", "Travellers plan around when they can travel, so fixtures are grouped by month and filterable, not one long list."],
    [".trip-strip", "Differentiator", "The stay shows up early", "Every hub reminds travellers a hotel close by is part of the booking, before they’ve even picked a seat."],
  ];
  const NOTES = {
    home: [
      [".hero-steps", "Opportunity", "Trip-led, not ticket-led", "For luxury travellers the match is often the reason for the trip. Booking it next to the hotel makes the platform where the trip starts."],
      [".chips", "Scope", "Sports only, on purpose", "Concerts and experiences were deferred. One category gave a clean launch to learn from, and a template to expand with."],
      ["#trending", "Experiment", "Testing the way in", "We A/B tested where the vertical sits inside client 1’s platform to find the entry point that drives the most traffic. The home page leads with matches, not menus."],
      ["#comps", "Information architecture", "Browse the way fans think", "Some start from a competition, some from a team, some from a city. Every route lands on the same fixture list."],
      ["#dests", "Differentiator", "Destinations as a way in", "Travel-first users start from the city. Hotel prices show from the first tap, so the trip cost is never a surprise."],
      [".how", "Expectation setting", "The bundle, explained up front", "Three steps make clear the stay is part of the flow, not an upsell sprung at checkout."],
      [".trust", "Design", "Trust before price", "Ticket buyers worry about fakes and split seats. On a high-value trip, the guarantees need to come before the price."],
    ],
    explore: [
      [".segmented", "Mobile-first", "Two ways in, one tap apart", "Desktop mega-menus become a Sports / Destinations switch on mobile, keeping the same two entry points."],
    ],
    browse: [
      [".filters", "Information architecture", "Filters mirror the entry points", "Sport, competition, city and date: the same ways in as the home page, so travellers never relearn the model."],
      [".results", "Differentiator", "Trip cost on every fixture", "Each match shows hotel prices nearby, so travellers compare whole trips, not just tickets."],
    ],
    city: HUB, comp: HUB, sport: HUB, venue: HUB, team: HUB,
    event: [
      ["#qtyBtn", "Adopted from the market", "Group size first", "Benchmarked SeatGeek, viagogo and Seat Unique. Asking quantity up front means only seats the whole group can sit in together are shown."],
      ["#tiers", "Design", "Tiers before sections", "Standard, Premium and Hospitality match how luxury travellers decide: by experience first, then by where they sit."],
      [".map-card", "Adopted from the market", "Map and list linked", "Tap a section to filter the list; pick a listing to see it on the map. Skipped resale mechanics: our travellers buy to attend, not to trade."],
      [".list-tools", "Live problem", "Price swings drive abandonment", "Supplier prices move, so travellers leave to compare. A value score and the original price give context; sourcing more stable suppliers is the real fix, in progress."],
      ["#listings", "After launch", "The fix that moved the number", "Travellers dropped off between picking tickets and checkout with questions the page didn’t answer. A “More info” section on each ticket in the live product: +20% reached booking review, 7% of them booked."],
    ],
    trip: [
      ["#hotels", "Differentiator", "The stay, planned around the match", "No ticket site carries you into the rest of the trip. Dates and nearby hotels are pre-filled; tickets-only is one tap away."],
      [".extras", "Value add", "Make a day of it", "Transfers, tours and match-day rides are where a travel platform adds value a ticket site can’t."],
      ["#summary", "Design", "Always know the total", "Tickets, stay and extras add up live, with fees included, so there’s no surprise at checkout."],
    ],
    checkout: [
      ["#form", "Risk", "Passports and facial recognition", "Some tickets need ID. Cleared multiple security reviews and stored data only in approved systems."],
      [".summary", "Insight", "Support is part of the product", "High-value, time-sensitive bookings need customer support close by. Its questions feed straight back into the backlog."],
    ],
    confirmed: [
      [".confirm-head", "Risk", "Ticket delivery", "At launch suppliers deliver tickets directly, the quickest safe path, while our own delivery pipeline is built."],
      [".timeline", "Roadmap", "A trip, not a receipt", "Next: share tickets with your group, and book together, with seats held while each person adds their own details."],
    ],
    trips: [
      [".page-head", "Roadmap", "Where the trip lives", "After booking, the trip stays here. Next: marketing to grow traffic, now that the journey converts better."],
    ],
  };

  const store = {
    get() { try { return sessionStorage.getItem("pn") === "1"; } catch { return false; } },
    set(v) { try { sessionStorage.setItem("pn", v ? "1" : "0"); } catch {} },
  };
  if (new URLSearchParams(location.search).get("notes") === "1") store.set(true);
  let on = store.get(), open = -1;

  const layer = document.createElement("div"); layer.className = "pn-layer";
  const card = document.createElement("div"); card.className = "pn-card"; card.hidden = true;
  const bar = document.createElement("div"); bar.className = "pn-bar";
  document.body.append(layer, card, bar);

  const view = () => document.body.dataset.view || "home";
  const notes = () => (NOTES[view()] || []).map(n => [document.querySelector(n[0]), ...n.slice(1)]).filter(n => n[0] && n[0].getClientRects().length);

  function drawBar() {
    bar.innerHTML = `<a class="pn-home" href="/#work" aria-label="Back to Isha's portfolio"><span class="ms">arrow_back</span><span class="pn-long">Portfolio</span></a><button class="pn-toggle ${on ? "on" : ""}" aria-pressed="${on}"><span class="ms">lightbulb</span><span class="pn-long">Product notes</span><span class="pn-short">Notes</span> ${on ? "on" : "off"}</button><a href="${CASE_STUDY}">Case study</a>`;
  }
  bar.addEventListener("click", e => {
    if (!e.target.closest(".pn-toggle")) return;
    on = !on; store.set(on); open = -1; drawBar(); place(); showCard();
    if (on) welcome();
  });

  // bottom offset so the bar and card clear the tab bar and sticky total
  function bottomOffset() {
    let h = 0;
    document.querySelectorAll("#tabs > *, .tabbar, .total-bar, .action-bar").forEach(el => {
      const r = el.getBoundingClientRect(), pos = getComputedStyle(el).position;
      if ((pos === "fixed" || pos === "sticky") && r.height && r.bottom >= innerHeight - 2) h += r.height;
    });
    return h;
  }

  function place() {
    const b = bottomOffset();
    bar.style.bottom = `${b + 12}px`;
    card.style.bottom = `${b + 64}px`;
    layer.innerHTML = "";
    if (!on) return;
    const taken = [];
    notes().forEach(([el], i) => {
      const r = el.getBoundingClientRect();
      // nudge down if it would sit on an earlier pin
      let top = r.top + scrollY - 12;
      const left = Math.min(r.right - 14, document.documentElement.clientWidth - 34) + scrollX;
      while (taken.some(([t, l]) => Math.abs(t - top) < 34 && Math.abs(l - left) < 34)) top += 34;
      taken.push([top, left]);
      const pin = document.createElement("button");
      pin.className = `pn-pin ${open === i ? "on" : ""}`; pin.textContent = i + 1; pin.dataset.i = i;
      pin.setAttribute("aria-label", `Product note ${i + 1}`);
      pin.style.top = `${top}px`;
      pin.style.left = `${left}px`;
      layer.append(pin);
    });
  }

  function showCard() {
    const list = notes();
    if (!on || open < 0 || !list[open]) { card.hidden = true; return; }
    const [, kind, title, body] = list[open];
    card.innerHTML = `<div class="pn-head"><span class="pn-kind">${kind}</span><span class="pn-count">${open + 1} of ${list.length}</span><button class="pn-x" aria-label="Close"><span class="ms">close</span></button></div>
      <h3>${title}</h3><p>${body}</p>
      ${list.length > 1 ? `<button class="pn-next">${open + 1 < list.length ? "Next note" : "Back to first"} <span class="ms">arrow_forward</span></button>` : ""}`;
    card.hidden = false;
  }
  layer.addEventListener("click", e => {
    const p = e.target.closest(".pn-pin"); if (!p) return;
    open = +p.dataset.i === open ? -1 : +p.dataset.i; place(); showCard();
  });
  card.addEventListener("click", e => {
    if (e.target.closest(".pn-x")) { open = -1; place(); showCard(); }
    else if (e.target.closest(".pn-next")) {
      open = (open + 1) % notes().length; place(); showCard();
      notes()[open][0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // one-time intro, not a forced tour
  function welcome() {
    try { if (sessionStorage.getItem("pn-seen")) return; sessionStorage.setItem("pn-seen", "1"); } catch {}
    card.innerHTML = `<div class="pn-head"><span class="pn-kind">Product notes</span><button class="pn-x" aria-label="Close"><span class="ms">close</span></button></div>
      <h3>Sideplay is a rebranded mockup of a live product</h3>
      <p>I owned it end to end: product, design and the frontend build. Use it like a traveller; tap the numbered dots for the decision behind each screen.</p>
      <p class="pn-path">Pick a match → seats → stay → checkout</p>
      <a class="pn-next" href="${CASE_STUDY}">Read the case study <span class="ms">arrow_forward</span></a>`;
    card.hidden = false;
  }

  // re-place after the app re-renders or the layout shifts
  let t;
  const later = () => { clearTimeout(t); t = setTimeout(place, 60); };
  addEventListener("hashchange", () => { open = -1; card.hidden = true; later(); });
  addEventListener("resize", later);
  addEventListener("load", later);
  // sticky totals slide in after a pick
  addEventListener("click", later);
  addEventListener("transitionend", later);
  new MutationObserver(later).observe(document.getElementById("app"), { childList: true, subtree: true });
  new ResizeObserver(later).observe(document.body);

  drawBar(); place();
  if (on) welcome();
})();
