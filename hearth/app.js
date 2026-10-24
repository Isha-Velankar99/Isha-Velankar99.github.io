/* ============================================================
   HEARTH — feature showcase. Four upgrades to an existing hotel
   journey, one stop each: the guest's doubt as the headline, a
   drag-to-compare demo of just the part that changed, and a short
   story card. The wrapper wears the portfolio's style; Hearth's own
   look lives only inside the frames.
   Routes: #/ overview, #/1 … #/4, #/impact, #/credits
   ============================================================ */
const S = {
  pos: {},                 // stop id → slider position (0–100)
  sub: "review",           // stop 4: review | payment
  pay: "apple",
  picked: {},              // pay later demo: layer → clicked
};
const money = n => `$${Math.round(n).toLocaleString("en-US")}`;
const off = h => Math.round((1 - h.now / h.was) * 100);
const hotel = id => HOTELS.find(h => h.id === id) || HOTELS[0];
const stars = n => `<span class="stars" aria-label="${n} stars">${"★".repeat(n)}</span>`;
const word = r => r >= 9 ? "Exceptional" : r >= 8.5 ? "Excellent" : "Very good";
const rating = (h, long) => `<span class="score"><b>${h.rating.toFixed(1)}</b>${long ? ` ${word(h.rating)} · ${h.reviews.toLocaleString("en-US")} reviews` : ""}</span>`;
const H = hotel("riverside");

function price(h, r) {
  const night = Math.round(h.now * r.x), wasNight = Math.round(h.was * r.x);
  const base = wasNight * TRIP.nights, promo = (wasNight - night) * TRIP.nights;
  const coupon = Math.round(night * TRIP.nights * 0.1);
  return { night, wasNight, base, promo, coupon, total: base - promo - coupon };
}

/* ============================================================
   STOPS — the story for each upgrade, in journey order
   ============================================================ */
const STOPS = [
  { id: "deals", stage: "Discover", doubt: "Is this actually a good deal?", title: "Deals page revamp", url: "deals",
    answer: "Lead with one standout deal, and show the saving on every card.",
    changed: [
      "A featured deal leads, with its rating and a line from a real review",
      "A discount on every card, with the old price struck through",
      "Themed collections that put the saving in the headline",
    ],
    result: ["3–4s → 8–10s", "average time on the Deals page", "About 10% of Deals visitors now convert"],
    chart: { title: "Average time on the Deals page", max: 10, rows: [["Before", 3.5, "3–4s"], ["After", 9, "8–10s"]] },
    detail: `<p>About 70% of guests opened Deals looking for a deal, but stayed only 3–4 seconds. The page looked like every other page: a row of destinations and a uniform grid of hotels, with nothing saying why a deal was worth a look.</p>
      <p>Benchmarking Booking.com, Agoda, Expedia, Trip.com and MakeMyTrip surfaced 8 gaps. The biggest: value wasn't visible on the first screen.</p>
      <p>The hardest part wasn't the design: the revamp needed backend, frontend and design time, and it kept slipping behind priority fixes. It took two months to land.</p>` },
  { id: "vio", stage: "Hotel details", doubt: "Could I get it cheaper elsewhere?", title: "Price comparison with Vio", url: "hotel/the-riverside",
    answer: "Show live prices from other sites right on our page, so no one has to leave to check.",
    changed: [
      "Live prices from other sites, with ours highlighted",
      "Placed under the gallery on desktop and above the reviews on mobile",
      "Kept clear of the room button, so it supports the choice instead of competing",
    ],
    result: ["40%", "compared in the widget, stayed and went on to book", "And 25% fewer guests left to compare elsewhere"],
    chart: { title: "Guests on the hotel page", share: 40, label: "compared here, then booked" },
    detail: `<p>About 80% of users habitually compare prices across platforms, so people left to check our price, and some never came back. Vio is an embeddable widget that shows live prices from other sites inside our own page.</p>
      <table class="trade"><thead><tr><th>Why it helps</th><th>What it risks</th></tr></thead><tbody>
      <tr><td>Proves our pricing is transparent</td><td>Shows competitors inside our own page</td></tr>
      <tr><td>Cuts tab-switching</td><td>If a competitor is cheaper, people may book there</td></tr>
      <tr><td>Free, low effort, easy to roll back</td><td>Less control over the widget's UI and data</td></tr></tbody></table>
      <p>The answer was placement: show it where people are already judging value.</p>` },
  { id: "paylater", stage: "Room choice", doubt: "Am I being charged now?", title: "Reserve now, pay later", url: "hotel/the-riverside/rooms",
    answer: "Make “nothing charged today” impossible to miss on the room card.",
    rolledBack: true,
    changed: [
      "A “No upfront payment” badge on the room",
      "“Reserve now”, with “You won't be charged now” under it",
      "The same reassurance again at review and payment",
    ],
    result: ["+40%", "booking confirmations", "But cancellations rose 30%, so we rolled it back"],
    chart: { title: "Against the old flow", max: 140, base: 100, rows: [["Confirmations", 140, "+40%"], ["Cancellations", 130, "+30%"]] },
    detail: `<p>A full upfront payment can feel like a huge commitment. Pay later was meant to make the decision quicker: reserve now, cancel any time or risk a small fee. It existed, but buried in grey text, and people asked “Am I paying now? Will I be charged twice?”</p>
      <p class="rb-note">Confirmations rose 40%, but cancellations rose 30% and outweighed the extra bookings, so we rolled it back. Easy to reserve also meant easy to walk away: what counts is bookings that stay booked.</p>` },
  { id: "review", stage: "Review and pay", doubt: "What happens when I tap pay?", title: "Review booking and payment", url: "booking/review",
    answer: "Say it plainly, right at the button: you won't be charged at this step.",
    changed: [
      "“You won't be charged at this step” under the button",
      "One clear total, with the saving spelled out",
      "A progress bar, and check-in times under the dates",
    ],
    result: ["+32%", "more guests moving on to payment", "Driven by one line of microcopy at the button"],
    chart: { title: "Guests moving on to payment", max: 132, rows: [["Before", 100, "—"], ["After", 132, "+32%"]] },
    detail: `<p>Many guests hesitated on “Go to payment”, afraid tapping it would charge them. Around that fear sat three more problems: no sense of progress, discount lines competing with the total, and a full card form for everyone.</p>
      <p>On the payment step, the method now comes first: Apple Pay, Google Pay, card or pay later, with only the fields you need and a button that changes with your choice. Benchmarked Booking.com, Agoda, Trip.com, Almosafer and Almatar.</p>` },
];

/* ============================================================
   DEMOS — only the part of the screen that changed.
   Each renders its before (b = true) and after state.
   ============================================================ */
function dealCard(h, plain) {
  if (plain) return `<div class="card card--plain"><div class="card-img" style="--bg:url(${IMG(h.img)})"></div>
    <div class="card-body"><strong>${h.name}</strong><small>${h.city}</small><p class="from">from <b>${money(h.now)}</b></p></div></div>`;
  return `<div class="card"><div class="card-img" style="--bg:url(${IMG(h.img)})"><span class="off">−${off(h)}%</span></div>
    <div class="card-body"><div class="card-top"><strong>${h.name}</strong>${rating(h)}</div><small>${h.city}</small>
    <p class="from"><s>${money(h.was)}</s> <b>${money(h.now)}</b></p></div></div>`;
}

function demoDeals(b) {
  if (b) return `<h3 class="scr-h">Deals</h3>
    <div class="dests">${DESTINATIONS.map(([n, img]) => `<span><span style="--bg:url(${IMG(img)})"></span>${n}</span>`).join("")}</div>
    <div class="grid">${HOTELS.slice(0, 8).map(h => dealCard(h, true)).join("")}</div>`;
  return `<h3 class="scr-h">Deals for your next stay</h3>
    <div class="lead">
      <div class="lead-img" style="--bg:url(${IMG(H.img)})"><span class="lead-tag">Deal of the week</span></div>
      <div class="lead-body">
        <span class="off off--big">−${off(H)}% this week</span>
        <h4>${H.name}</h4><p class="muted">${stars(H.stars)} · ${H.area}, ${H.city}</p>
        <p>${rating(H, true)}</p>
        <blockquote>“${H.quote}”</blockquote>
        <div class="lead-foot"><p class="from"><s>${money(H.was)}</s> <b class="big">${money(H.now)}</b> <small>/ night</small></p><span class="btn btn-primary">View deal</span></div>
      </div>
    </div>
    <h4 class="sec-h">Top hotels in London: up to 35% off</h4>
    <div class="rail">${HOTELS.filter(h => h.id !== H.id).slice(0, 4).map(h => dealCard(h)).join("")}</div>`;
}

function demoVio(b) {
  const rows = [["Hearth", H.now, true], ...H.compare].sort((a, c) => a[1] - c[1]);
  const widget = b ? `<p class="no-vio"><span class="ms">open_in_new</span>No comparison here, so guests opened another tab</p>`
    : `<div class="vio"><div class="vio-head"><span class="ms">compare_arrows</span><b>Compare prices</b><small>Live for your dates · via Vio</small></div>
      <ul>${rows.map(([n, p, us]) => `<li${us ? ' class="us"' : ""}><span>${us ? "<b>Hearth</b>" : n}</span><b>${money(p)}</b></li>`).join("")}</ul></div>`;
  return `<div class="ctx"><div class="gallery">${H.gallery.map((g, i) => `<div class="g${i}" style="--bg:url(${IMG(g)})"></div>`).join("")}</div>
    <div class="hotel-title"><h3 class="scr-h">${H.name}</h3>${rating(H, true)}</div></div>
    ${widget}
    <div class="ctx"><div class="ghost-map"><span class="ms">location_on</span>Map</div>
    <div class="ghost-block"><b>Choose your room</b><i></i><i style="width:55%"></i></div></div>
    <div class="ctx"><div class="ghost-block"><b>Guest reviews</b><i style="width:80%"></i><i style="width:60%"></i></div></div>`;
}

function demoPayLater(b) {
  const r = ROOMS[0], p = price(H, r), picked = S.picked[b ? "b" : "a"];
  const cta = b
    ? `<div class="room-cta"><small class="pl-old">Pay later available</small><button class="btn btn-primary" data-pick="b">Go to payment</button></div>`
    : `<div class="pl-badge"><span class="ms">event_available</span><div><b>No upfront payment</b><small>Reserve now, pay on ${TRIP.chargeDate}</small></div></div>
       <div class="room-cta"><button class="btn btn-primary" data-pick="a">Reserve now</button><small class="reassure"><span class="ms">check</span>You won't be charged now</small></div>`;
  const outcome = !picked ? "" : b
    ? `<div class="thought"><span class="ms">help</span><div><b>“Wait, am I paying now?”</b><small>The button says payment, the grey text says later. This is where people hesitated.</small></div></div>`
    : `<div class="held"><span class="ms">check_circle</span><div><b>Room held for ${TRIP.checkIn}</b><small>Nothing charged today. ${money(p.night * TRIP.nights)} on ${TRIP.chargeDate}.</small></div></div>`;
  return `<h3 class="scr-h">Choose your room</h3><p class="muted small">${TRIP.checkIn} – ${TRIP.checkOut} · ${TRIP.guests} guests</p>
    <article class="room">
      <div class="room-main"><h4>${r.name}</h4>
        <p class="facts"><span><span class="ms">straighten</span>${r.size}</span><span><span class="ms">bed</span>${r.bed}</span></p>
        <ul class="perks">${r.perks.map(x => `<li>${x}</li>`).join("")}</ul></div>
      <div class="room-side"><p class="from"><s>${money(p.wasNight)}</s> <b class="big">${money(p.night)}</b> <small>/ night</small></p>
        <small class="muted">${money(p.night * TRIP.nights)} for ${TRIP.nights} nights</small>${cta}</div>
      ${outcome}
    </article>`;
}

function demoReview(b) {
  const p = price(H, ROOMS[0]);
  const steps = (n, ghost) => `<ol class="steps${ghost ? " ghost" : ""}">${["Selection", "Review", "Payment"].map((s, i) => `<li class="${i < n ? "done" : i === n ? "now" : ""}"><span>${i < n ? '<span class="ms">check</span>' : i + 1}</span><em>${s}</em></li>`).join("")}</ol>`;
  const hotelRow = `<div class="sum-hotel"><div class="thumb" style="--bg:url(${IMG(H.img)})"></div><div><strong>${H.name}</strong><small>${H.area}, ${H.city}</small></div></div>`;
  const dates = `<div class="dates"><div><small>Check-in</small><b>${TRIP.checkIn}</b><span class="time${b ? " ghost" : ""}">${TRIP.inTime}</span></div>
    <span class="ms">arrow_forward</span><div><small>Check-out</small><b>${TRIP.checkOut}</b><span class="time${b ? " ghost" : ""}">${TRIP.outTime}</span></div></div>`;
  const cardForm = `<div class="form"><label class="full">Card number<input placeholder="1234 5678 9012 3456"></label><label>Expiry<input placeholder="MM / YY"></label><label>CVV<input placeholder="123"></label>
    <label class="full">Name on card<input></label><label class="full">Billing address<input></label><label>City<input></label><label>Postcode<input></label></div>`;

  // desktop checkout: the form on the left, the booking summary on the right
  if (S.sub === "payment") {
    if (b) return `${steps(2, true)}<h3 class="scr-h">Payment</h3><div class="rv-grid">
      <div class="panel"><b>Card details</b>${cardForm}<small class="muted">Other payment options at the bank's checkout</small></div>
      <div class="panel">${hotelRow}<p class="sum-total"><span>Total</span><b>${money(p.total)}</b></p><span class="btn btn-primary wide">Pay now</span></div></div>`;
    const label = { apple: `Pay ${money(p.total)} with Apple Pay`, google: `Pay ${money(p.total)} with Google Pay`, card: `Pay ${money(p.total)}`, later: `Reserve now · pay on ${TRIP.chargeDate}` }[S.pay];
    return `${steps(2)}<h3 class="scr-h">How would you like to pay?</h3><div class="rv-grid">
      <div class="panel"><div class="methods">${[["apple", "Apple Pay", "phone_iphone"], ["google", "Google Pay", "account_balance_wallet"], ["card", "Credit or debit card", "credit_card"], ["later", "Pay later", "event_available"]].map(([id, name, icon]) => `<label class="method${S.pay === id ? " on" : ""}">
        <input type="radio" name="pay" value="${id}"${S.pay === id ? " checked" : ""}><span class="ms">${icon}</span><span><b>${name}</b></span></label>`).join("")}</div></div>
      <div class="panel">${hotelRow}<p class="sum-total"><span>Total to pay</span><b>${money(p.total)}</b></p><span class="btn btn-primary wide">${label}</span></div></div>`;
  }
  const lines = b
    ? `<div class="breakup breakup--old"><p><span>Room price</span><span>${money(p.base)}</span></p><p><span>Discount (offer)</span><span>${money(p.promo)}</span></p>
       <p><span>Discount (coupon)</span><span>10% (of ${money(p.base - p.promo)})</span></p><p><span>Total</span><span>${money(p.total)}</span></p></div>`
    : `<div class="breakup"><p><span>Base price</span><span>${money(p.base)}</span></p><p class="minus"><span>Discounts</span><span>− ${money(p.promo + p.coupon)}</span></p>
       <p class="total"><span>Total to pay <small>Taxes and fees included</small></span><span>${money(p.total)}</span></p>
       <p class="saved"><span class="ms">savings</span>You've saved ${money(p.promo + p.coupon)}</p></div>`;
  return `${steps(1, b)}<h3 class="scr-h">${b ? "Booking details" : "Review your booking"}</h3>
    <div class="rv-grid rv-grid--review">
      <div class="panel"><b>Guest details</b><div class="form"><label>First name<input value="Alex"></label><label>Last name<input value="Morgan"></label>
        <label class="full">Email<input value="alex.morgan@example.com"></label><label class="full">Mobile<input value="+1 555 010 2030"></label></div></div>
      <div class="panel">${hotelRow}${dates}${lines}
        <div class="cta-block"><span class="btn btn-primary wide">${b ? "Proceed" : "Go to payment"}</span>${b ? "" : `<small class="reassure"><span class="ms">lock</span>You won't be charged at this step</small>`}</div></div>
    </div>`;
}

const DEMOS = { deals: demoDeals, vio: demoVio, paylater: demoPayLater, review: demoReview };

/* ============================================================
   PAGE
   ============================================================ */
// cur: 0 overview, 1–4 stops, 5 outcome
function journey(cur) {
  const items = [["#/", '<span class="ms">map</span>', "Overview"], ...STOPS.map((s, i) => [`#/${i + 1}`, i + 1, s.stage]), ["#/impact", '<span class="ms">flag</span>', "Outcome"]];
  return `<nav class="journey" aria-label="The hotel journey"><ol class="wrap">${items.map(([href, n, name], i) =>
    `<li class="${cur === i ? "on" : cur > i ? "done" : ""}"><a href="${href}"${cur === i ? ' aria-current="step"' : ""}><span class="node">${n}</span><span class="j-name">${name}</span></a></li>`).join("")}</ol></nav>`;
}

function cover() {
  return `<section class="cover">
    <p class="eyebrow">Hotel booking · rebranded as Hearth</p>
    <h1>Four upgrades, one doubt at a time</h1>
    <p class="lede">The journey wasn't broken, but at each step guests had a doubt that made them hesitate. As product owner for the hotel experience, I found those moments and shipped one upgrade at each of them.</p>
    <dl class="facts-strip">
      <div><dt>My role</dt><dd>Product owner: found the gaps, made the case to the CPO, directed the design and ran the A/B tests</dd></div>
      <div><dt>Team</dt><dd>Me, 1 designer, 2 frontend engineers, 1 QA</dd></div>
      <div><dt>Timeline</dt><dd>Deals 2 months · Vio 3 weeks · Payment 1 month</dd></div>
      <div><dt>Constraints</dt><dd>Deals needed backend, frontend and design time and kept slipping behind priority fixes. Vio meant showing competitors on our own page.</dd></div>
    </dl>
    <ol class="process" aria-label="How it happened">${["Consumer behaviour study", "Competitor analysis", "Gaps and solutions to the CPO", "Iterated on the options", "Directed design", "A/B tested"].map((t, k) => `<li><span>${k + 1}</span>${t}</li>`).join("")}</ol>
    <ol class="route" aria-label="The four doubts, in journey order">${STOPS.map((s, i) => `<li${s.rolledBack ? ' class="rb"' : ""}><a href="#/${i + 1}">
      <span class="pv frame" aria-hidden="true">${PREVIEWS[s.id]()}</span>
      <span class="node">${i + 1}</span><small>${s.stage}${s.rolledBack ? '<span class="tag-rb">Rolled back</span>' : ""}</small><q>${s.doubt}</q>
      <span class="r-feat">${s.title}<span class="ms">arrow_forward</span></span></a></li>`).join("")}</ol>
    <div class="cover-foot">
      <a class="teaser" href="#/impact"><b>+22%</b><span>booking conversion · three live, one rolled back</span><span class="ms">arrow_forward</span></a>
      <a class="btn btn-light" href="#/1">Start with Discover<span class="ms">arrow_forward</span></a>
    </div>
  </section>`;
}

// tiny "after" snippets for the cover route, in Hearth's own look
const PREVIEWS = {
  deals: () => `<span class="pv-deal" style="--bg:url(${IMG(H.img)})"><span class="off">−${off(H)}% this week</span></span>
    <span class="pv-row"><b>${H.name}</b><span><s>${money(H.was)}</s> <b>${money(H.now)}</b></span></span>`,
  vio: () => `<span class="pv-vio">${[["Hearth", H.now, 1], ...H.compare.slice(0, 2)].map(([n, p, us]) => `<span${us ? ' class="us"' : ""}>${n}<b>${money(p)}</b></span>`).join("")}</span>`,
  paylater: () => `<span class="pl-badge"><span class="ms">event_available</span><span><b>No upfront payment</b><small>Pay on ${TRIP.chargeDate}</small></span></span>
    <span class="btn btn-primary wide">Reserve now</span>`,
  review: () => `<span class="pv-row"><span>Total to pay</span><b class="pv-total">${money(price(H, ROOMS[0]).total)}</b></span>
    <span class="btn btn-primary wide">Go to payment</span><small class="reassure"><span class="ms">lock</span>Not charged at this step</small>`,
};

// wiggle the handle once per visit so it's obviously draggable
function nudge() {
  try { if (sessionStorage.getItem("nudged")) return false; sessionStorage.setItem("nudged", "1"); } catch { return false; }
  return true;
}

// small before → after bars under each result
function chart(c) {
  const head = `<p class="bars-h">${c.title}</p>`;
  if (c.share) return `<div class="bars" role="img" aria-label="${c.share}% of ${c.title.toLowerCase()} ${c.label}">${head}
    <span class="share"><i style="width:${c.share}%"></i></span><p class="share-l"><b>${c.share / 10} in 10</b> ${c.label}</p></div>`;
  const tick = c.base ? `<em class="tick" style="left:${c.base / c.max * 100}%"></em>` : "";
  return `<div class="bars" role="img" aria-label="${c.title}: ${c.rows.map(r => `${r[0]} ${r[2]}`).join(", ")}">${head}
    ${c.rows.map(([l, v, d], k) => `<div class="bar-row"><span>${l}</span><span class="track"><i class="b${k}" style="width:${v / c.max * 100}%"></i>${tick}</span><b>${d}</b></div>`).join("")}
    ${c.base ? '<p class="tick-l"><em class="tick"></em>Before the change</p>' : ""}</div>`;
}

function stopPage(i) {
  const s = STOPS[i];
  // on the desktop checkout, start the handle over the column that changed
  const key = s.id === "review" ? `review-${S.sub}` : s.id;
  const wide = !matchMedia("(max-width: 639.98px)").matches; // phones stack the columns
  const pos = S.pos[key] ?? ((wide && { "review-review": 75, "review-payment": 25 }[key]) || 50);
  const seg = (attr, cur, opts) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-${attr}="${v}" aria-pressed="${cur === v}">${t}</button>`).join("")}</div>`;
  const controls = s.id === "review" ? seg("sub", S.sub, [["review", "Review step"], ["payment", "Payment step"]]) : "";
  return `<article class="stop">
    <header class="stop-head">
      <p class="eyebrow"><span class="num">${String(i + 1).padStart(2, "0")}</span>${s.stage} · ${s.title}${s.rolledBack ? '<span class="tag-rb">Rolled back</span>' : ""}</p>
      <h2>“${s.doubt}”</h2>
      <p class="answer">${s.answer}</p>
      <p class="result-chip${s.rolledBack ? " result-chip--rb" : ""}"><b>${s.result[0]}</b>${s.result[1]}</p>
    </header>
    <div class="stop-grid">
      <div class="stage">
        ${controls ? `<div class="controls">${controls}</div>` : ""}
        <div class="frame">
          <div class="frame-bar"><span class="h-logo"><i></i>hearth</span><span class="url">hearth.app/${s.url}</span></div>
          <div class="cmp${nudge() ? " nudge" : ""}" style="--pos:${pos}%" data-stop="${key}">
            <div class="layer layer--before" aria-label="Before">${DEMOS[s.id](true)}</div>
            <div class="layer layer--after" aria-label="After">${DEMOS[s.id](false)}</div>
            <span class="cmp-tag cmp-tag--b">Before</span><span class="cmp-tag cmp-tag--a">After</span>
            <div class="cmp-handle" role="slider" tabindex="0" aria-label="Drag to compare before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pos}"><span class="ms">code</span></div>
          </div>
        </div>
        <p class="hint"><span class="ms">swap_horiz</span>Drag the handle to compare${s.id === "paylater" ? ", then try the buttons" : ""}</p>
      </div>
      <aside class="story">
        <div class="result${s.rolledBack ? " result--rb" : ""}"><b>${s.result[0]}</b><span>${s.result[1]}</span><small>${s.result[2]}</small>${chart(s.chart)}</div>
        <h3>What changed</h3>
        <ul class="changed">${s.changed.map(t => `<li>${t}</li>`).join("")}</ul>
        <details class="more"><summary>More detail<span class="ms">expand_more</span></summary><div class="more-body">${s.detail}</div></details>
      </aside>
    </div>
    <nav class="pager"><a class="btn btn-ghost" href="#/${i || ""}"><span class="ms">arrow_back</span><span class="pv-full">${i ? STOPS[i - 1].stage : "Overview"}</span><span class="pv-short">Back</span></a>
      <a class="btn btn-dark" href="${i < 3 ? `#/${i + 2}` : "#/impact"}">Next: ${i < 3 ? STOPS[i + 1].stage : "Outcome"}<span class="ms">arrow_forward</span></a></nav>
  </article>`;
}

// the cover's route again, now carrying the results. Schematic, not to scale.
function routeChart() {
  const pts = [[40, 200], [230, 200], [420, 150], [610, 150], [800, 90], [960, 90]];
  const labels = ["Before", ...STOPS.map(s => s.stage), "After"];
  const notes = ["", "8–10s on Deals", "4 in 10 book here", "", "+32% to payment", ""];
  return `<figure class="route-chart"><svg viewBox="0 0 1000 250" role="img" aria-label="Booking conversion rose step by step along the journey: Deals brought more intent, Vio kept 4 in 10 guests on the page, pay later was rolled back, and the review step moved 32% more guests to payment, ending at plus 22% booking conversion overall.">
    <line class="rc-base" x1="40" y1="200" x2="960" y2="200"/>
    <polyline class="rc-line" points="${pts.map(p => p.join(",")).join(" ")}"/>
    <line class="rc-blip" x1="610" y1="150" x2="610" y2="96"/><circle class="rc-ghost" cx="610" cy="96" r="9"/>
    <text class="rc-note rc-note--rb" x="626" y="100">+40%, rolled back</text>
    ${pts.map(([x, y], i) => i === 0 ? `<circle class="rc-start" cx="${x}" cy="${y}" r="7"/>`
      : i === 5 ? `<circle class="rc-end" cx="${x}" cy="${y}" r="16"/>`
      : `<circle class="rc-node${i === 3 ? " rc-node--rb" : ""}" cx="${x}" cy="${y}" r="14"/><text class="rc-num" x="${x}" y="${y + 5}">${i}</text>`).join("")}
    ${notes.map((n, i) => n ? `<text class="rc-note" x="${pts[i][0]}" y="${pts[i][1] - 26}">${n}</text>` : "").join("")}
    <text class="rc-big" x="975" y="142">+22%</text>
    ${labels.map((l, i) => `<text class="rc-label" x="${pts[i][0]}" y="236">${l}</text>`).join("")}
  </svg><figcaption>Booking conversion along the journey · schematic, not to scale</figcaption></figure>`;
}

function impact() {
  const why = [
    "More guests started with intent: they stayed 8–10s on Deals instead of 3–4s.",
    "Fewer were lost to other sites: 40% compared right on our page, stayed and booked.",
    "We kept only gains that lasted: pay later's cancellations outweighed it, so it went.",
    "The last step stopped scaring people: one line moved 32% more guests to payment.",
  ];
  return `<article class="stop impact">
    <header class="stop-head"><p class="eyebrow">Outcome</p>
      <h2><span class="hl">+22%</span> booking conversion</h2>
      <p class="lede">Measured across the hotel journey. Three upgrades live, one rolled back.</p></header>
    ${routeChart()}
    <h3 class="why-h">Why it moved</h3>
    <ol class="why">${why.map((t, k) => `<li class="${STOPS[k].rolledBack ? "rb" : ""}"><a href="#/${k + 1}"><span class="why-n">${STOPS[k].result[0]}</span><span>${t}</span><span class="ms">arrow_forward</span></a></li>`).join("")}</ol>
    <div class="impact-grid">
      <section><h3>What I learned</h3><ul class="changed">
        <li><b>Placement is the design.</b> A sentence, a badge or a number in the right place beat a big redesign.</li>
        <li><b>Measure the booking that sticks.</b> Confirmations went up with pay later; bookings that stayed didn't.</li></ul></section>
      <section><h3>What's next</h3><ul class="changed"><li>A/B testing the Deals page</li><li>Personalised and localised deals</li><li>Price-drop alerts</li></ul></section>
    </div>
    <nav class="pager"><a class="btn btn-ghost" href="#/4"><span class="ms">arrow_back</span><span class="pv-full">Review and pay</span><span class="pv-short">Back</span></a><a class="btn btn-dark" href="#/">Back to overview<span class="ms">map</span></a></nav>
  </article>`;
}

function credits() {
  return `<article class="stop"><h2>Photo credits</h2><p class="lede">Photos from Wikimedia Commons under open licences. Hotels, names and prices are fictional.</p>
    <ul class="credits">${CREDITS.map(c => `<li><a href="${c.page}" target="_blank" rel="noopener">${c.title.replace("File:", "")}</a> · ${c.author || "Unknown"} · <a href="${c.licenseUrl || c.page}" target="_blank" rel="noopener">${c.license}</a></li>`).join("")}</ul></article>`;
}

// -2 overview, 0–3 stops, 4 outcome, -1 credits
const route = () => { const r = location.hash.replace(/^#\/?/, ""); return r === "impact" ? 4 : r === "credits" ? -1 : /^[1-4]$/.test(r) ? +r - 1 : -2; };

function render(keep) {
  const i = route(), y = scrollY;
  document.getElementById("app").innerHTML = `
    <header class="top"><div class="wrap top-in"><a class="me" href="/#top">Isha Velankar</a><a class="top-tag top-back" href="/#work"><span class="ms">arrow_back</span>Back to portfolio</a></div></header>
    ${i !== -1 ? journey(i === -2 ? 0 : i + 1) : ""}
    ${i === -2 ? `<main class="cover-band"><div class="wrap">${cover()}</div></main>` : `<main class="wrap">${i === 4 ? impact() : i === -1 ? credits() : stopPage(i)}</main>`}
    <footer class="ftr"><div class="wrap">Hearth is a rebranded version of work I shipped at a travel-tech company; company and partner names and data are left out. <a href="#/credits">Photo credits</a></div></footer>`;
  scrollTo(0, keep ? y : 0);
  // keep the current step in view when the bar scrolls on small screens
  const ol = document.querySelector(".journey ol"), on = ol?.querySelector(".on");
  if (on && ol.scrollWidth > ol.clientWidth) ol.scrollLeft = on.offsetLeft - (ol.clientWidth - on.offsetWidth) / 2;
}

/* ---------- drag to compare ---------- */
function setPos(cmp, x) {
  const r = cmp.getBoundingClientRect(), pos = Math.round(Math.min(Math.max((x - r.left) / r.width * 100, 0), 100));
  cmp.style.setProperty("--pos", `${pos}%`);
  cmp.querySelector(".cmp-handle").setAttribute("aria-valuenow", pos);
  S.pos[cmp.dataset.stop] = pos;
}
document.addEventListener("pointerdown", e => {
  const h = e.target.closest(".cmp-handle"); if (!h) return;
  e.preventDefault();
  const cmp = h.closest(".cmp");
  const move = ev => setPos(cmp, ev.clientX);
  const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); cmp.classList.remove("dragging"); };
  cmp.classList.add("dragging");
  addEventListener("pointermove", move); addEventListener("pointerup", up);
});
document.addEventListener("keydown", e => {
  const h = e.target.closest?.(".cmp-handle"); if (!h || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault();
  const cmp = h.closest(".cmp"), r = cmp.getBoundingClientRect(), cur = S.pos[cmp.dataset.stop] ?? 50;
  setPos(cmp, r.left + r.width * (cur + (e.key === "ArrowLeft" ? -5 : 5)) / 100);
});

document.addEventListener("click", e => {
  const t = e.target.closest("[data-sub],[data-pick]");
  if (!t) return;
  if (t.dataset.sub) S.sub = t.dataset.sub;
  if (t.dataset.pick) S.picked[t.dataset.pick] = !S.picked[t.dataset.pick];
  render(true);
});
document.addEventListener("change", e => { if (e.target.name === "pay") { S.pay = e.target.value; render(true); } });
addEventListener("hashchange", () => { S.picked = {}; render(); });
render();
