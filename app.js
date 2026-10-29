// Checkride Connect: clickable prototype. Plain JS, no build step, no network calls.
// MOCK ONLY: nothing is charged, emailed, texted or sent anywhere. State lives in localStorage
// so the demo survives reloads. "Reset demo" clears it. All examiners/applicants/schools are fictional.
(() => {
  "use strict";
  const D = window.CC_DATA;
  const BOOKING_FEE = 15;
  const ALERT_LIMIT = 5; // prototype cap on saved mock alerts (alerts are free, email-only, mock)
  const KEY = "cc-connect-proto-v3";
  const TIERS = [
    { id: "starter", name: "Starter", price: "$49/mo", seats: "Up to 10 active students", features: ["Roster and readiness view", "Mock alerts for roster students", "Standard checklists"] },
    { id: "pro", name: "Pro", price: "$149/mo", seats: "Up to 50 active students", features: ["Everything in Starter", "Bulk examiner-opening alerts", "CFI sign-off tracking (planned)"] },
    { id: "enterprise", name: "Enterprise", price: "Contact us", seats: "Unlimited students, multiple campuses", features: ["Everything in Pro", "Multi-location roster", "Custom reporting (planned)"] },
  ];

  // ---------- small helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const median = (arr) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
  const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const first = (name) => name.split(" ")[0];
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  // Local time zone of the viewer, with a short zone label.
  const fmtTs = (ts) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  const DAY = 86400000;
  const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (n) => { const d = today0(); d.setDate(d.getDate() + n); return iso(d); };
  const daysUntil = (s) => Math.round((parseIso(s) - today0()) / DAY);
  const fmtDate = (s, o = { weekday: "short", month: "short", day: "numeric" }) => parseIso(s).toLocaleDateString("en-US", o);
  const fmtTime = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h >= 12 ? "PM" : "AM"}`; };
  const relDays = (s) => { const n = daysUntil(s); return n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${plural(n, "day")}`; };

  const certById = (id) => D.certs.find((c) => c.id === id);
  const apt = (id) => D.airports.find((a) => a.id === id);
  const allDpes = () => [...D.dpes, ...S.approvedDpes];
  const dpeById = (id) => allDpes().find((d) => d.id === id);
  // Sample deposit: about 20% of the examiner fee, rounded to $25. Credited toward the fee. Mock only.
  const depositFor = (dp, cert) => Math.min(dp.fees[cert], Math.max(100, Math.round((dp.fees[cert] * 0.2) / 25) * 25));

  // ---- All-in cost model (EXAMPLE NUMBERS from sample data, not quotes) ----
  const sampleOf = (dp) => dp.sample || { rental: 150, lodging: 130, noShow: 250, avgDaysToNext: null, leadDays: null, reviewList: [] };
  const allIn = (dp, cert, near) => {
    const M = D.allInModel, sm = sampleOf(dp);
    const fee = dp.fees[cert], dep = depositFor(dp, cert);
    const hrs = M.hours[cert] || 2.5, rate = Math.round(sm.rental * (M.multi.includes(cert) ? M.multiMult : 1));
    const aircraft = Math.round(hrs * rate);
    const dist = distNm(dp.home, near);
    let travel = 0, travelLabel = "Travel / lodging estimate", travelNote = "Examiner is based at your airport";
    if (dist > 10 && dist <= dp.travelNm) { travel = dp.travelFee; travelNote = `Examiner travel fee, ${dist} nm from you (sample)`; }
    else if (dist > dp.travelNm) {
      const fly = Math.round(((dist * 2) / M.cruiseKt) * rate / 5) * 5, lodge = dist > M.lodgingOverNm ? sm.lodging : 0;
      travel = fly + lodge; travelNote = `Outside the examiner's ${dp.travelNm} nm range: you fly ${dist} nm each way (${money(fly)})${lodge ? ` plus 1 hotel night (${money(lodge)})` : ""}`;
    }
    return { fee, dep, aircraft, aircraftNote: `${hrs} h × ${money(rate)}/h rental + fuel (example)`, travel, travelLabel, travelNote, studentFee: BOOKING_FEE,
      total: fee + BOOKING_FEE + aircraft + travel, retest: dp.retestFee, noShow: sm.noShow, dist };
  };
  const allInCard = (dp, cert, near) => {
    const x = allIn(dp, cert, near);
    return `<section class="card" id="all-in">
      <div class="row spread"><h2 style="margin:0">All-in cost</h2><span class="pill warn">Example numbers, not a quote</span></div>
      <form class="row" data-form="allin" data-auto data-dpe="${dp.id}" style="margin:.75rem 0 0;gap:.75rem;align-items:flex-end;flex-wrap:wrap">
        ${certSelect("cert", cert, Object.keys(dp.fees))}${airportSelect("near", near, "Your airport")}
      </form>
      <div class="summary small" style="margin-top:.9rem">
        <div class="line"><span>Examiner fee, ${esc(certById(cert).short)} (sample)</span><b>${money(x.fee)}</b></div>
        <div class="line"><span>Student booking fee (flat, mock)</span><b>${money(x.studentFee)}</b></div>
        <div class="line"><span>Aircraft rental + fuel estimate<div class="muted small">${esc(x.aircraftNote)}</div></span><b>${money(x.aircraft)}</b></div>
        <div class="line"><span>${x.travelLabel}<div class="muted small">${esc(x.travelNote)}</div></span><b>${money(x.travel)}</b></div>
        <div class="line" style="border-top:1px solid var(--border-strong);margin-top:.3rem;padding-top:.5rem"><span><b>Example all-in total</b></span><b>${money(x.total)}</b></div>
      </div>
      <div class="summary small" style="margin-top:.75rem">
        <div class="line muted"><span>Not added to the total, if needed: retest / discontinuance (sample)</span><b>+${money(x.retest)}</b></div>
        <div class="line muted"><span>Not added to the total, if needed: no-show / late-cancel fee, up to (sample)</span><b>+${money(x.noShow)}</b></div>
      </div>
      <p class="warn-note small" style="margin:.75rem 0 0"><b>ASSUMPTION:</b> the examiner deposit (${money(x.dep)}, about 20% of the fee, rounded to $25, minimum $100) is <b>part of</b> the examiner fee, not an extra. It is due at approval together with the ${money(BOOKING_FEE)} student fee (${money(x.dep + BOOKING_FEE)}), and the rest (${money(x.fee - x.dep)}) is paid at the test. Real deposit rules are set by each examiner. Prototype, not legal or FAA advice, and no real payments.</p>
    </section>`;
  };
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const reviewsCard = (dp, cert) => {
    const sm = sampleOf(dp);
    const next = openSlots({ dpeId: dp.id, cert })[0];
    const stat = (v, l) => `<div><div class="big-num" style="font-size:1.5rem">${v}</div><div class="muted small">${l}</div></div>`;
    return `<section class="card" id="reviews">
      <div class="row spread"><h2 style="margin:0">Reviews and wait time</h2><span class="pill warn">Sample reviews, not real</span></div>
      <div class="grid g2" style="margin-top:.9rem;gap:1rem">
        ${stat(dp.reviews ? "★ " + dp.rating : "—", dp.reviews ? `sample rating (${plural(dp.reviews, "sample review")})` : "no sample reviews yet")}
        ${stat(next ? plural(daysUntil(next.date), "day") : "—", `until the next open ${esc(certById(cert).short)} slot (from the sample calendar)`)}
        ${stat(sm.avgDaysToNext != null ? plural(sm.avgDaysToNext, "day") : "—", "average wait to the next checkride (sample)")}
        ${stat(sm.leadDays != null ? plural(sm.leadDays, "day") : "—", "typical booking lead time (sample)")}
      </div>
      ${sm.reviewList.length ? `<h3 style="margin:1.1rem 0 .4rem">Showing ${sm.reviewList.length} of ${dp.reviews} sample reviews</h3>
      ${sm.reviewList.map((r) => `<blockquote class="review"><div class="row small" style="gap:.5rem"><span aria-label="${r.stars} of 5 stars" style="color:var(--warn)">${stars(r.stars)}</span><span class="muted">Example student · ${esc(certById(r.cert).short)} · sample review, not real</span></div><p style="margin:.25rem 0 0">“${esc(r.text)}”</p></blockquote>`).join("")}` : `<p class="muted small">No sample reviews for this new listing.</p>`}
      <p class="muted small" style="margin:.75rem 0 0">All ratings, reviews and wait figures are invented example data. They are not real examiners, students or feedback.</p>
    </section>`;
  };
  const standardItems = (cert) => (D.checklists[cert] || []).flatMap((sec) => sec.items.map((it) => ({ t: it.t, n: it.n || "" })));

  function nm(a, b) {
    const R = 3440.065, toR = Math.PI / 180;
    const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const distNm = (a, b) => Math.round(nm(apt(a), apt(b)));
  // A DPE is an option if the pilot will fly to them, or they will travel to the pilot.
  const reachable = (dp, near, radius) => { const d = distNm(dp.home, near); return d <= radius || d <= dp.travelNm; };
  const travelCost = (dp, near) => { const d = distNm(dp.home, near); return d <= 10 ? 0 : d <= dp.travelNm ? dp.travelFee : null; };

  // ---------- state ----------
  function rng(seed) {
    return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function seed() {
    const slots = [];
    let n = 0;
    D.dpes.forEach((dp, i) => {
      const r = rng(i * 97 + 13);
      const near = D.airports.filter((a) => a.id !== dp.home && distNm(dp.home, a.id) <= dp.travelNm).map((a) => a.id);
      let day = dp.soonest;
      for (let k = 0; k < dp.count; k++) {
        if (parseIso(addDays(day)).getDay() === 0) day++; // no Sundays
        const airport = near.length && r() < 0.25 ? near[Math.floor(r() * near.length)] : dp.home;
        const time = ["08:00", "08:30", "09:00", "12:30", "13:00"][Math.floor(r() * 5)];
        slots.push({ id: "s" + ++n, dpeId: dp.id, date: addDays(day), time, airport, certs: Object.keys(dp.fees), status: "open", bookingId: null });
        day += dp.gap + Math.floor(r() * 3);
      }
    });
    const bookings = D.seededBookings.map((b, i) => {
      const s = slots.filter((x) => x.dpeId === b.dpeId)[b.slotIndex];
      const id = "b" + (i + 1);
      s.status = b.status === "confirmed" ? "booked" : "held";
      s.bookingId = id;
      return { id, slotId: s.id, dpeId: b.dpeId, applicant: b.applicant, mine: false, cert: b.cert, aircraft: b.aircraft, cfi: b.cfi, readiness: b.readiness, status: b.status, createdAt: Date.now() - (i + 1) * 3600e3 };
    });
    return {
      v: 3, role: "pilot", nextId: 1000, slots, bookings,
      alerts: [{ id: "a1", cert: "ppl", near: "KORL", radius: 75, before: addDays(45), maxFee: 1300, dpeId: "", channels: ["email"], createdAt: Date.now() }],
      notifications: [{ id: "n1", ts: Date.now(), title: "Your first sample alert is active", body: "Mock alert, nothing is emailed. In a real version we would tell you when a Private Pilot checkride opens within 75 nm of KORL in the next 45 days for $1,300 or less.", read: false }],
      checklist: {}, curated: {}, ticks: {}, tier: "starter",
      pending: D.pendingDpes.map((p) => ({ ...p, status: "pending" })),
      approvedDpes: [], actingDpe: "d1",
    };
  }
  function load() { try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 3) return s; } } catch (e) { /* storage unavailable */ } return seed(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  let S = load();
  const uid = (p) => p + S.nextId++;
  const ui = { profileKey: null, month: null, sel: null, lastPath: null };

  // ---------- queries ----------
  const openSlots = ({ dpeId, cert, before } = {}) => {
    const t = iso(today0());
    return S.slots
      .filter((s) => s.status === "open" && s.date >= t && (!dpeId || s.dpeId === dpeId) && (!cert || s.certs.includes(cert)) && (!before || s.date <= before))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  };

  function searchDpes(f) {
    const out = [];
    allDpes().forEach((dp) => {
      const fee = dp.fees[f.cert];
      if (!fee || (f.maxFee && fee > f.maxFee) || !reachable(dp, f.near, f.radius)) return;
      const slots = openSlots({ dpeId: dp.id, cert: f.cert, before: f.before });
      out.push({ dp, fee, dist: distNm(dp.home, f.near), slots, soonest: slots[0] || null, travel: travelCost(dp, f.near) });
    });
    const bySoon = (a, b) => (a.soonest ? a.soonest.date : "9999").localeCompare(b.soonest ? b.soonest.date : "9999");
    const sorters = { soonest: (a, b) => bySoon(a, b) || a.fee - b.fee, fee: (a, b) => a.fee - b.fee || bySoon(a, b), distance: (a, b) => a.dist - b.dist };
    return out.sort(sorters[f.sort] || sorters.soonest);
  }

  function checklistPct(cert) {
    const items = (D.checklists[cert] || []).flatMap((c) => c.items);
    if (!items.length) return 0;
    const done = items.filter((i) => S.checklist[cert]?.[i.id]).length;
    return Math.round((done / items.length) * 100);
  }

  function alertMatches(a, slot) {
    const dp = dpeById(slot.dpeId);
    if (!dp || !dp.fees[a.cert] || !slot.certs.includes(a.cert)) return false;
    if (a.dpeId && a.dpeId !== dp.id) return false;
    if (a.before && slot.date > a.before) return false;
    if (a.maxFee && dp.fees[a.cert] > a.maxFee) return false;
    return reachable(dp, a.near, a.radius);
  }

  // Runs when a slot opens up (new opening, cancellation, released request).
  function fireAlerts(slot, kind, { skipMine = false } = {}) {
    const dp = dpeById(slot.dpeId);
    const matched = skipMine ? [] : S.alerts.filter((a) => alertMatches(a, slot));
    // Stand-in for other pilots' alerts in a real system.
    const others = 1 + (parseInt(slot.id.replace(/\D/g, ""), 10) % 6);
    matched.forEach((a) => {
      const c = certById(a.cert);
      S.notifications.unshift({
        id: uid("n"), ts: Date.now(), read: false, slotId: slot.id, dpeId: dp.id, cert: a.cert,
        title: kind === "cancel" ? `Cancellation: earlier ${c.short} checkride` : `New ${c.short} opening`,
        body: `${dp.name} · ${fmtDate(slot.date)} at ${fmtTime(slot.time)} · ${slot.airport} (${relDays(slot.date)}) · ${money(dp.fees[a.cert])}`,
        channel: "Mock alert · nothing was sent",
      });
    });
    const total = matched.length + others;
    toast(`${kind === "cancel" ? "Cancellation" : "Opening"} published (mock). ${matched.length ? `${plural(matched.length, "of your saved alerts")} matched, added to your Student-view inbox. ` : ""}No email, SMS or push is sent; a real version would also notify about ${plural(others, "other sample pilot")}.`);
  }

  // ---------- UI primitives ----------
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 4200);
  }
  let modalTimer;
  function openModal(html) {
    clearTimeout(modalTimer);
    $("#modal-root").innerHTML = `<div class="modal-bg" data-action="modal-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
    const f = $("#modal-root input, #modal-root select, #modal-root button");
    if (f) f.focus();
  }
const closeModal = () => {
  const bg = $("#modal-root .modal-bg");
  if (!bg || bg.classList.contains("closing")) return;
  bg.classList.add("closing");
  clearTimeout(modalTimer);
  modalTimer = setTimeout(() => { $("#modal-root").innerHTML = ""; }, 160);
};

  const verifiedBadge = () => `<span class="verified" title="Fictional sample examiner. Not a real person and not verified against any FAA source."><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4z"/></svg>Sample examiner</span>`;
  const ratingText = (dp) => (dp.reviews ? `★ ${dp.rating} sample rating (${dp.reviews})` : "New sample listing");

  const certOptions = (val, only) => D.certs.filter((c) => !only || only.includes(c.id)).map((c) => `<option value="${c.id}" ${c.id === val ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  const certSelect = (name, val, only, label = "Certificate / rating") => `<label class="field"><span>${label}</span><select name="${name}">${certOptions(val, only)}</select></label>`;
  const airportSelect = (name, val, label = "Near", only) => `<label class="field"><span>${label}</span><select name="${name}">${D.airports.filter((a) => !only || only.includes(a.id)).map((a) => `<option value="${a.id}" ${a.id === val ? "selected" : ""}>${a.id} · ${esc(a.city)}</option>`).join("")}</select></label>`;
  const radiusSelect = (val) => `<label class="field"><span>Within</span><select name="radius">${[25, 50, 75, 100, 150, 250].map((r) => `<option value="${r}" ${r === val ? "selected" : ""}>${r} nm</option>`).join("")}</select></label>`;
  const feeSelect = (val) => `<label class="field"><span>Max fee</span><select name="maxFee"><option value="">Any</option>${[1000, 1200, 1300, 1500, 2000].map((v) => `<option value="${v}" ${v === val ? "selected" : ""}>Up to ${money(v)}</option>`).join("")}</select></label>`;
  const statCard = (v, l) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`;
  const statusPill = (st) => ({ requested: '<span class="pill warn">Requested</span>', confirmed: '<span class="pill good">Approved</span>', declined: '<span class="pill bad">Declined</span>', cancelled: '<span class="pill">Cancelled</span>', open: '<span class="pill accent">Open</span>', held: '<span class="pill warn">Request pending</span>', booked: '<span class="pill good">Booked</span>' }[st] || "");

  function searchFilters(q) {
    return { cert: certById(q.cert) ? q.cert : "ppl", near: apt(q.near) ? q.near : "KORL", radius: +q.radius || 75, before: q.before || "", maxFee: +q.maxFee || 0, sort: q.sort || "soonest" };
  }
  const toQuery = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== "" && v != null && v !== 0)).toString();

  // ---------- views ----------
  function viewHome() {
    const pplFees = allDpes().map((d) => d.fees.ppl).filter(Boolean);
    const open30 = openSlots().filter((s) => daysUntil(s.date) <= 30).length;
    const next = openSlots({ cert: "ppl" });
    const next90 = next.filter((s) => daysUntil(s.date) <= 90).length;
    const soon = next[0];
    const check = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
    const rows = next.slice(0, 6).map((s, i) => {
      const dp = dpeById(s.dpeId);
      return `<a class="board-row" style="--i:${i}" href="#/dpe/${dp.id}?cert=ppl&date=${s.date}">
        <span><b>${fmtDate(s.date, { month: "short", day: "numeric" }).toUpperCase()}</b><small>${fmtTime(s.time)}</small></span>
        <span class="b-field">${s.airport}</span>
        <span class="b-who">${esc(dp.name)}<small>${relDays(s.date)}</small></span>
        <span class="b-fee">${money(dp.fees.ppl)}</span>
      </a>`;
    }).join("");
    return `
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <span class="eyebrow anim"><span class="pulse"></span>Sample data · ${D.region.name} · ${plural(allDpes().length, "sample examiner")}</span>
          <h1 class="anim">Find your checkride.<br /><span class="hl">Sooner.</span></h1>
          <p class="lead anim">Search sample examiners by certificate, location, availability and price, and see how an alert would flag an earlier date. This is a prototype with fictional data.</p>
          <form class="search-box anim" data-form="search">
            ${certSelect("cert", "ppl")}
            ${airportSelect("near", "KORL")}
            ${radiusSelect(75)}
            <label class="field"><span>Before (optional)</span><input type="date" name="before" min="${addDays(1)}" /></label>
            <button class="btn" type="submit">Search examiners <span class="arrow">→</span></button>
          </form>
          <div class="hero-meta anim">
            <span>${check}Fictional sample examiners</span>
            <span>${check}${money(BOOKING_FEE)} mock booking fee, nothing charged</span>
            <span>${check}Mock cancellation alerts</span>
          </div>
        </div>
        <aside class="board anim" aria-label="Next Private Pilot openings">
          <div class="board-head"><span>Next openings · Private</span><span class="live">Sample</span></div>
          <div class="board-cols"><span>Date</span><span>Field</span><span>Examiner</span><span>Fee</span></div>
          <div class="board-rows">${rows || `<div class="board-row"><span></span><span></span><span>No openings right now</span><span></span></div>`}</div>
          <div class="board-foot"><span>${next90} open in the next 90 days</span><a href="#/search?cert=ppl">See all →</a></div>
        </aside>
      </div>
    </section>
    <section class="statband anim">
      <div><div class="v">${allDpes().length}</div><div class="l">Sample examiners in ${D.region.name}</div></div>
      <div><div class="v">${open30}</div><div class="l">Open slots in the next 30 days</div></div>
      <div><div class="v">${money(median(pplFees))}</div><div class="l">Median Private Pilot fee</div></div>
      <div><div class="v">${soon ? plural(daysUntil(soon.date), "day") : "—"}</div><div class="l">Until the soonest Private opening</div></div>
    </section>
    <h2 class="section-title anim">How it works</h2>
    <section class="grid g3 steps">
      <div class="card anim"><h3>Search & compare</h3><p class="muted" style="margin:0">Filter by certificate, distance, date and fee. Every examiner listed is fictional sample data.</p></div>
      <div class="card anim"><h3>Request a slot</h3><p class="muted" style="margin:0">Pick an opening and send your details. The prototype shows a flat ${money(BOOKING_FEE)} booking fee plus an examiner deposit. Nothing is charged.</p></div>
      <div class="card anim"><h3>Get there sooner</h3><p class="muted" style="margin:0">Save a search and see a mock alert when a cancellation or new opening matches it. No email is sent.</p></div>
    </section>
    <h2 class="section-title anim">Explore</h2>
    <section class="grid g4" style="margin-bottom:1rem">
      <a class="card feature anim" href="#/compare"><h3>Fee comparison</h3><p class="muted small">Every examiner's fee for your certificate side by side, travel included.</p></a>
      <a class="card feature anim" href="#/checklists"><h3>Readiness checklists</h3><p class="muted small">Documents, endorsements and aircraft paperwork for each certificate.</p></a>
      <a class="card feature anim" href="#" data-action="set-role" data-role="dpe"><h3>For examiners</h3><p class="muted small">Publish openings, fill cancellations, and get applicants who arrive prepared.</p></a>
      <a class="card feature anim" href="#" data-action="set-role" data-role="school"><h3>For flight schools</h3><p class="muted small">Track student readiness and book checkrides for your whole roster.</p></a>
    </section>`;
  }

  function viewSearch(q) {
    const f = searchFilters(q);
    const results = searchDpes(f);
    const c = certById(f.cert);
    const fees = results.map((r) => r.fee);
    const soonest = results.find((r) => r.soonest)?.soonest;
    const withSlots = results.filter((r) => r.slots.length);
    return `<div class="page split">
      <aside class="card sticky">
        <h2>Filters</h2>
        <form class="stack" data-form="search" data-auto>
          ${certSelect("cert", f.cert)}
          ${airportSelect("near", f.near)}
          ${radiusSelect(f.radius)}
          <label class="field"><span>Checkride before</span><input type="date" name="before" value="${esc(f.before)}" min="${addDays(1)}" /></label>
          ${feeSelect(f.maxFee)}
          <label class="field"><span>Sort by</span><select name="sort">
            ${[["soonest", "Soonest opening"], ["fee", "Lowest fee"], ["distance", "Closest"]].map(([v, l]) => `<option value="${v}" ${v === f.sort ? "selected" : ""}>${l}</option>`).join("")}
          </select></label>
        </form>
      </aside>
      <section class="stack">
        <div class="page-head" style="margin:0">
          <h1>${esc(c.name)} examiners near ${f.near}</h1>
          <p class="muted" style="margin:0">${results.length} of ${allDpes().length} sample examiners match${fees.length ? ` · fees ${money(Math.min(...fees))}–${money(Math.max(...fees))}` : ""}${soonest ? ` · soonest opening ${fmtDate(soonest.date)} (${relDays(soonest.date)})` : ""}</p>
        </div>
        <div class="cta-banner row spread">
          <div><b>Want an earlier date?</b> <span class="muted">Save this search as a mock alert (stored in this browser, no email sent).</span></div>
          <button class="btn sm" data-action="alert-from-search">Save mock alert</button>
        </div>
        ${results.length ? [...withSlots, ...results.filter((r) => !r.slots.length)].map((r) => resultCard(r, f)).join("") : `<div class="card empty"><h3>No examiners match these filters</h3><p>Try a larger radius or a higher max fee, or save a mock alert.</p></div>`}
      </section>
    </div>`;
  }

  function resultCard(r, f) {
    const { dp } = r;
    const where = r.dist <= 10 ? `Based at ${f.near}` : r.travel != null ? `Travels to ${f.near} (+${money(r.travel)})` : `You fly to ${dp.home} (${r.dist} nm)`;
    const chips = r.slots.slice(0, 4).map((s) => `<a class="chip ${daysUntil(s.date) <= 14 ? "soon" : ""}" href="#/dpe/${dp.id}?cert=${f.cert}&date=${s.date}">${fmtDate(s.date)} · ${fmtTime(s.time)}${s.airport !== dp.home ? " · " + s.airport : ""}</a>`).join("");
    return `<article class="card result">
      <div class="avatar">${initials(dp.name)}</div>
      <div>
        <div class="row" style="gap:.5rem"><h3 style="margin:0"><a href="#/dpe/${dp.id}?cert=${f.cert}">${esc(dp.name)}</a></h3>${verifiedBadge()}</div>
        <div class="muted small">${esc(apt(dp.home).city)} · ${dp.home} · ${ratingText(dp)} · replies in ~${dp.responseHours}h${sampleOf(dp).avgDaysToNext != null ? ` · avg wait ${plural(sampleOf(dp).avgDaysToNext, "day")} (sample)` : ""}</div>
        <div class="small">${where}</div>
        ${r.slots.length
          ? `<div class="chips">${chips}${r.slots.length > 4 ? `<a class="small" style="align-self:center" href="#/dpe/${dp.id}?cert=${f.cert}">+${r.slots.length - 4} more</a>` : ""}</div>`
          : `<p class="small muted" style="margin:.5rem 0 0">No openings in your date range. <a href="#" data-action="alert-from-search" data-dpe="${dp.id}">Save a mock alert for ${esc(first(dp.name))}</a></p>`}
      </div>
      <div class="price" style="text-align:right">
        <div class="amt">${money(r.fee)}</div><div class="muted small">${esc(certById(f.cert).short)} fee</div>
        ${r.soonest ? `<div class="pill good" style="margin-top:.4rem">Soonest ${relDays(r.soonest.date)}</div>` : `<div class="pill" style="margin-top:.4rem">No openings</div>`}
      </div>
    </article>`;
  }

  function viewProfile(q, id) {
    const dp = dpeById(id);
    if (!dp) return `<div class="page card empty"><h2>Examiner not found</h2><a href="#/search">Back to search</a></div>`;
    const certIds = Object.keys(dp.fees);
    const cert = certIds.includes(q.cert) ? q.cert : certIds[0];
    const near = apt(q.near) ? q.near : "KORL";
    const slots = openSlots({ dpeId: dp.id });
    // Reset the calendar focus whenever the URL changes (new examiner or a slot link).
    if (ui.profileKey !== location.hash) {
      const focus = q.date || slots[0]?.date || iso(today0());
      ui.profileKey = location.hash; ui.sel = q.date || slots[0]?.date || null; ui.month = focus.slice(0, 7);
    }
    const own = S.role === "dpe" && S.actingDpe === dp.id;
    const daySlots = ui.sel ? S.slots.filter((s) => s.dpeId === dp.id && s.date === ui.sel && s.status !== "removed").sort((a, b) => a.time.localeCompare(b.time)) : [];
    return `<div class="page">
      ${own ? `<div class="cta-banner" style="margin-bottom:1rem"><b>This is your public profile as pilots see it.</b> <a href="#/dpe-dashboard">Back to dashboard</a></div>` : `<p><a href="#/search?cert=${cert}">← Back to search</a></p>`}
      <div style="margin-bottom:1.25rem">
          <section class="card">
            <div class="row" style="gap:1rem;align-items:flex-start">
              <div class="avatar lg">${initials(dp.name)}</div>
              <div style="flex:1;min-width:200px">
                <h1 style="margin-bottom:.2rem">${esc(dp.name)}</h1>
                <div class="row" style="gap:.6rem">${verifiedBadge()}<span class="muted small">Sample DPE since ${dp.since} · ${esc(dp.fsdo)} (fictional)</span></div>
                <div class="muted small" style="margin-top:.3rem">${dp.home} · ${esc(apt(dp.home).name)}, ${esc(apt(dp.home).city)} · travels up to ${dp.travelNm} nm · ${ratingText(dp)} · ${dp.languages.map(esc).join(", ")}</div>
              </div>
            </div>
            <p style="margin-top:1rem">${esc(dp.bio)}</p>
          </section>
      </div>
      <div class="split-r">
        <div class="stack">
          <section class="card">
            <h2>Fees</h2>
            <p class="muted small">Set by the examiner and paid directly to them. Prototype booking: a flat ${money(BOOKING_FEE)} student booking fee plus a sample deposit (ASSUMPTION, about 20% of the fee, credited toward it), both shown only if the examiner approves. Nothing is charged. Prototype, not legal or FAA advice.</p>
            <div class="table-wrap"><table>
              <thead><tr><th>Certificate / rating</th><th class="num">Examiner fee</th></tr></thead>
              <tbody>${certIds.map((c) => `<tr ${c === cert ? 'class="best"' : ""}><td>${esc(certById(c).name)} <span class="muted small">${esc(certById(c).detail)}</span></td><td class="num"><b>${money(dp.fees[c])}</b></td></tr>`).join("")}</tbody>
            </table></div>
            <div class="grid g2" style="margin-top:1rem">
              <div><div class="muted small">Retest / discontinuance (sample)</div><b>${money(dp.retestFee)}</b></div>
              <div><div class="muted small">Travel to your airport (≤ ${dp.travelNm} nm)</div><b>+${money(dp.travelFee)}</b></div>
            </div>
          </section>
          ${allInCard(dp, cert, near)}
          <section class="card">
            <h2>Policies</h2>
            <p><b>Cancellation:</b> ${esc(dp.cancellation)}</p>
            <p><b>Aircraft:</b> ${esc(dp.aircraft)}</p>
            <p style="margin:0"><b>What to bring:</b> see the <a href="#/checklists/${cert}">${esc(certById(cert).short)} readiness checklist</a>.</p>
          </section>
          ${reviewsCard(dp, cert)}
        </div>
        <aside class="card sticky">
          <h2>Availability</h2>
          ${calendar(dp)}
          <div class="day-panel" style="margin-top:1rem">
            ${ui.sel ? `<h3>${fmtDate(ui.sel, { weekday: "long", month: "long", day: "numeric" })}</h3>` : `<p class="muted small">No open dates right now.</p>`}
            ${daySlots.map((s) => `<div class="slot-row">
                <div><b>${fmtTime(s.time)}</b> · ${s.airport}<div class="muted small">${s.certs.map((c) => certById(c).short).join(", ")}</div></div>
                ${s.status === "open" ? `<button class="btn sm" data-action="request" data-slot="${s.id}" data-cert="${cert}">Request</button>` : statusPill(s.status)}
              </div>`).join("")}
          </div>
          <div class="cta-banner small" style="margin-top:1rem">
            <b>Nothing that works?</b> <a href="#" data-action="alert-dpe" data-dpe="${dp.id}" data-cert="${cert}">Save a mock alert for ${esc(first(dp.name))}</a>
          </div>
          <p class="muted small" style="margin:.75rem 0 0">${plural(slots.length, "open slot")} · sample calendar, generated for this demo</p>
        </aside>
      </div>
    </div>`;
  }

  function calendar(dp) {
    const [y, m] = ui.month.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const daysIn = new Date(y, m, 0).getDate();
    const openDates = new Set(openSlots({ dpeId: dp.id }).map((s) => s.date));
    const t = iso(today0());
    const minMonth = t.slice(0, 7);
    const maxD = today0(); maxD.setMonth(maxD.getMonth() + 4);
    const maxMonth = iso(maxD).slice(0, 7);
    let cells = ["S", "M", "T", "W", "T", "F", "S"].map((d) => `<div class="dow">${d}</div>`).join("");
    cells += "<div></div>".repeat(firstDay.getDay());
    for (let d = 1; d <= daysIn; d++) {
      const ds = `${ui.month}-${String(d).padStart(2, "0")}`;
      const open = openDates.has(ds);
      const cls = [open && "open", ds === ui.sel && "sel", ds === t && "today", ds < t && "past"].filter(Boolean).join(" ");
      cells += `<button class="${cls}" ${open ? `data-action="cal-day" data-date="${ds}" aria-label="${fmtDate(ds)}: openings available"` : 'tabindex="-1" aria-hidden="true"'}>${d}</button>`;
    }
    return `<div class="cal-head">
      <button class="btn ghost sm" data-action="cal-nav" data-dir="-1" ${ui.month <= minMonth ? "disabled" : ""} aria-label="Previous month">‹</button>
      <b>${firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</b>
      <button class="btn ghost sm" data-action="cal-nav" data-dir="1" ${ui.month >= maxMonth ? "disabled" : ""} aria-label="Next month">›</button>
    </div><div class="cal">${cells}</div>`;
  }

  function viewCompare(q) {
    const f = searchFilters({ radius: 100, ...q });
    const c = certById(f.cert);
    const rows = allDpes().filter((dp) => dp.fees[f.cert] && reachable(dp, f.near, f.radius)).map((dp) => {
      const x = allIn(dp, f.cert, f.near);
      const soon = openSlots({ dpeId: dp.id, cert: f.cert })[0];
      return { dp, x, soon, fee: x.fee, total: x.total, dist: x.dist };
    }).sort((a, b) => a.total - b.total);
    const fees = rows.map((r) => r.fee), totals = rows.map((r) => r.total);
    const max = Math.max(...totals, 1);
    return `<div class="page">
      <div class="page-head"><h1>Checkride cost comparison <span class="pill warn" style="vertical-align:middle">Example numbers</span></h1><p class="muted">The same checkride across sample examiners: the examiner fee, plus our flat ${money(BOOKING_FEE)} student fee and example aircraft and travel estimates, so you can compare the all-in total. Sorted by all-in total.</p></div>
      <form class="card search-box" data-form="compare" data-auto style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-bottom:1rem">
        ${certSelect("cert", f.cert)}${airportSelect("near", f.near, "Your airport")}${radiusSelect(f.radius)}
      </form>
      ${rows.length ? `<section class="grid g4" style="margin-bottom:1rem">
        ${statCard(money(Math.min(...totals)), `Lowest all-in ${esc(c.short)} total (example)`)}
        ${statCard(money(median(totals)), "Median all-in total (example)")}
        ${statCard(money(Math.max(...totals)), "Highest all-in total (example)")}
        ${statCard(money(Math.min(...fees)) + "–" + money(Math.max(...fees)), "Examiner fee range (sample)")}
      </section>
      <section class="card"><div class="table-wrap tight"><table class="cmp">
        <thead><tr><th>Examiner</th><th>Based at</th><th class="num">Exam fee</th><th class="num">Student fee</th><th class="num">Aircraft (est.)</th><th class="num">Travel / lodging (est.)</th><th class="num">All-in total (example)</th><th>Rating (sample)</th><th>Avg wait (sample)</th><th>Soonest opening</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr ${i === 0 ? 'class="best"' : ""}>
          <td><a href="#/dpe/${r.dp.id}?${toQuery({ cert: f.cert, near: f.near })}"><b>${esc(r.dp.name)}</b></a>${i === 0 ? ' <span class="pill good">Lowest all-in</span>' : ""}</td>
          <td>${r.dp.home} <span class="muted small">${r.dist} nm</span></td>
          <td class="num">${money(r.fee)}</td>
          <td class="num">${money(r.x.studentFee)}</td>
          <td class="num">${money(r.x.aircraft)}</td>
          <td class="num">${r.x.travel ? money(r.x.travel) : "—"}</td>
          <td class="num"><b>${money(r.total)}</b></td>
          <td>${r.dp.reviews ? `★ ${r.dp.rating} <span class="muted small">(${r.dp.reviews})</span>` : '<span class="muted small">new</span>'}</td>
          <td>${sampleOf(r.dp).avgDaysToNext != null ? plural(sampleOf(r.dp).avgDaysToNext, "day") : '<span class="muted small">n/a</span>'}</td>
          <td>${r.soon ? `${fmtDate(r.soon.date)} <span class="muted small">${relDays(r.soon.date)}</span>` : '<span class="muted small">None open</span>'}</td>
        </tr>`).join("")}</tbody>
      </table></div>
      <p class="muted small" style="margin:.75rem 0 0">Example numbers only, not quotes. Exam fees are set by each examiner and paid to them. Aircraft and travel are rough estimates from sample data, and retest or no-show fees are not included (see each profile). The deposit (ASSUMPTION, about 20% of the fee) is part of the exam fee, so it is not added here. Ratings and wait figures are sample data, not real reviews.<span class="cmp-mobile-note"> On a phone the table shows examiner, exam fee, all-in total and wait; open a profile for the full breakdown.</span></p>
      </section>` : `<div class="card empty"><h3>No examiners offer this checkride in range</h3><p>Try a larger radius.</p></div>`}
    </div>`;
  }

  function viewAlerts() {
    const unread = S.notifications.filter((n) => !n.read).length;
    const alertCard = (a) => {
      const c = certById(a.cert);
      const matches = openSlots({ cert: a.cert }).filter((s) => alertMatches(a, s)).length;
      const dp = a.dpeId ? dpeById(a.dpeId) : null;
      return `<div class="card">
        <div class="row spread"><h3 style="margin:0">${esc(c.name)}</h3><button class="btn ghost sm" data-action="del-alert" data-id="${a.id}">Delete</button></div>
        <p class="muted small" style="margin:.3rem 0">Within ${a.radius} nm of ${a.near}${a.before ? ` · before ${fmtDate(a.before)}` : ""}${a.maxFee ? ` · up to ${money(a.maxFee)}` : ""}${dp ? ` · only ${esc(dp.name)}` : ""}</p>
        <div class="row small"><span class="pill">Mock: email only (not sent)</span>
        <a href="#/search?${toQuery({ cert: a.cert, near: a.near, radius: a.radius, before: a.before, maxFee: a.maxFee })}">${plural(matches, "matching opening")} now →</a></div>
      </div>`;
    };
    return `<div class="page">
      <div class="page-head"><h1>Alerts <span class="pill warn" style="vertical-align:middle">Mock only</span></h1><p class="muted">Saved searches are matched against sample openings in this browser. <b>No email, SMS or push is ever sent</b>; alerts appear only in the inbox on this page.</p></div>
      <div class="split-r">
        <div class="stack">
          <section class="card" style="border-color:var(--border-strong)"><span class="pill">Free for students</span> <span class="pill warn">Email only · mock</span><p class="muted small" style="margin:.5rem 0 0">Alerts are free and email-only in the plan. In this prototype nothing is emailed: matches show up in the inbox on this page.</p></section>
          <section class="card">
            <h2>New alert <span class="muted small" style="font-weight:400">(${S.alerts.length}/${ALERT_LIMIT} saved)</span></h2>
            <form class="grid g2" data-form="alert">
              ${certSelect("cert", "ppl")}${airportSelect("near", "KORL")}${radiusSelect(75)}
              <label class="field"><span>Checkride before</span><input type="date" name="before" value="${addDays(45)}" min="${addDays(1)}" /></label>
              ${feeSelect(0)}
              <label class="field"><span>Examiner</span><select name="dpeId"><option value="">Any sample examiner</option>${allDpes().map((d) => `<option value="${d.id}">${esc(d.name)} (${d.home})</option>`).join("")}</select></label>
              <div style="grid-column:1/-1" class="row small">
                <label class="row" style="gap:.35rem"><input type="checkbox" checked disabled /> Email (mock, not sent)</label>
              </div>
              <div style="grid-column:1/-1"><button class="btn" type="submit">Save alert</button></div>
            </form>
          </section>
          ${S.alerts.length ? S.alerts.map(alertCard).join("") : `<div class="card empty">No alerts yet.</div>`}
        </div>
        <aside class="card sticky" id="inbox">
          <div class="row spread"><h2 style="margin:0">Inbox</h2>${unread ? `<button class="btn ghost sm" data-action="read-all">Mark all read</button>` : ""}</div>
          <p class="muted small">Mock inbox. Tip: switch to <b>DPE view</b> and publish an opening or mark a cancellation near KORL to see a mock alert arrive here.</p>
          ${S.notifications.length ? S.notifications.slice(0, 25).map((n) => {
            const slot = n.slotId ? S.slots.find((s) => s.id === n.slotId) : null;
            const live = slot && slot.status === "open";
            return `<div class="notif ${n.read ? "read" : ""}"><span class="dot"></span><div style="flex:1">
              <b>${esc(n.title)}</b><div class="small">${esc(n.body)}</div>
              <div class="muted small">${fmtTs(n.ts)}${n.channel ? " · " + esc(n.channel) : ""}</div>
              ${slot ? (live ? `<a class="btn sm" style="margin-top:.4rem" href="#/dpe/${n.dpeId}?cert=${n.cert}&date=${slot.date}" data-action="read-notif" data-id="${n.id}">View opening</a>` : `<span class="pill" style="margin-top:.4rem">Already taken</span>`) : ""}
            </div></div>`;
          }).join("") : `<div class="empty">Nothing yet.</div>`}
        </aside>
      </div>
    </div>`;
  }

  function viewChecklists(q, certId) {
    const cert = D.checklists[certId] ? certId : "ppl";
    const pct = checklistPct(cert);
    const lists = D.checklists[cert];
    return `<div class="page">
      <div class="page-head"><h1>Readiness checklists <span class="pill warn" style="vertical-align:middle">Unverified draft</span></h1><p class="muted">Standard starter lists, written from memory and not yet reviewed by a CFI or DPE. Your ticks are saved in this browser only. Once an examiner approves your request they can send you a curated list under <a href="#/my-checklists">My checklists</a>.</p></div>
      <nav class="tabs">${D.certs.map((c) => `<a href="#/checklists/${c.id}" class="${c.id === cert ? "active" : ""}">${esc(c.short)}</a>`).join("")}</nav>
      <div class="split-r">
        <div class="stack">
          ${lists.map((sec) => `<section class="card"><h2>${esc(sec.cat)}</h2>
            ${sec.items.map((it) => { const done = !!S.checklist[cert]?.[it.id]; return `<label class="check-item ${done ? "done" : ""}">
              <input type="checkbox" data-check="${cert}" data-item="${it.id}" ${done ? "checked" : ""} />
              <div><div class="t">${esc(it.t)}</div>${it.n ? `<div class="muted small">${esc(it.n)}</div>` : ""}</div></label>`; }).join("")}
          </section>`).join("")}
          <p class="muted small">Unverified draft, reference only. The regulation cites have not been checked. Always verify against current 14 CFR, the Airman Certification Standards and AC 61-65, and confirm specifics with your instructor and examiner.</p>
        </div>
        <aside class="card sticky">
          <h2>${esc(certById(cert).name)}</h2>
          <div class="row spread"><b class="big-num">${pct}%</b><span class="muted small">ready</span></div>
          <div class="progress" style="margin:.4rem 0 1rem"><i style="width:${pct}%"></i></div>
          <button class="btn secondary" style="width:100%" data-action="share-checklist" data-cert="${cert}">Share with DPE/CFI (not available)</button>
          <a class="btn" style="width:100%;margin-top:.5rem" href="#/search?cert=${cert}">Find a ${esc(certById(cert).short)} checkride</a>
          <p class="muted small" style="margin:.75rem 0 0">When you request a checkride (mock), the sample examiner sees this readiness score.</p>
        </aside>
      </div>
    </div>`;
  }

  function viewBookings() {
    const mine = S.bookings.filter((b) => b.mine).sort((a, b) => b.createdAt - a.createdAt);
    return `<div class="page">
      <div class="page-head"><h1>My bookings <span class="pill warn" style="vertical-align:middle">Mock</span></h1><p class="muted">Mock requests saved in this browser only. Nothing is charged, emailed or sent to an examiner.</p></div>
      ${mine.length ? `<div class="stack">${mine.map((b) => {
        const s = S.slots.find((x) => x.id === b.slotId); const dp = dpeById(b.dpeId);
        const fee = b.feeUsd ?? dp.fees[b.cert], dep = b.depositUsd ?? depositFor(dp, b.cert);
        const cur = S.curated[b.id];
        return `<div class="card">
          <div class="row spread">
            <div class="row" style="gap:1rem"><div class="avatar">${initials(dp.name)}</div><div>
              <div class="row" style="gap:.5rem"><b>${esc(certById(b.cert).name)}</b>${statusPill(b.status)}</div>
              <div class="small">${fmtDate(s.date, { weekday: "long", month: "long", day: "numeric" })} · ${fmtTime(s.time)} · ${s.airport} · with <a href="#/dpe/${dp.id}">${esc(dp.name)}</a> <span class="muted">(sample examiner)</span></div>
              <div class="muted small">Requested ${fmtTs(b.createdAt)}</div>
            </div></div>
            <div class="row">
              ${b.status === "requested" ? `<button class="btn secondary sm" data-action="as-dpe" data-dpe="${dp.id}">Respond as ${esc(first(dp.name))} (demo)</button><button class="btn bad sm" data-action="pilot-cancel" data-id="${b.id}">Cancel request</button>` : ""}
              ${b.status === "confirmed" ? `<a class="btn secondary sm" href="#/my-checklists">${cur?.sent ? "Curated checklist" : "My checklists"}</a><button class="btn bad sm" data-action="pilot-cancel" data-id="${b.id}">Cancel booking</button>` : ""}
            </div>
          </div>
          <div class="summary small" style="margin-top:.8rem">
            <div class="line"><span>Examiner deposit (ASSUMPTION, credited toward the fee)</span><b>${money(dep)}</b></div>
            <div class="line"><span>Student booking fee</span><b>${money(BOOKING_FEE)}</b></div>
            <div class="line"><span><b>Total due if approved</b></span><b>${money(dep + BOOKING_FEE)}</b></div>
            <div class="line muted"><span>Remaining examiner fee at the test (${money(fee)} less deposit)</span><b>${money(fee - dep)}</b></div>
            <div class="line muted"><span>Actually charged (prototype)</span><b>$0</b></div>
          </div>
          <div class="muted small" style="margin-top:.5rem">${b.status === "requested" ? "The slot is held while the sample examiner reviews it. Nothing charged." : b.status === "confirmed" ? "Approved. A real version would charge the deposit and fee now; this prototype charged nothing." : b.status === "declined" ? "Declined. Nothing charged. The slot was released." : "Cancelled. Nothing was charged."}</div>
        </div>`; }).join("")}</div>`
        : `<div class="card empty"><h3>No bookings yet</h3><p>Find a sample examiner and submit a mock request. Nothing is charged.</p><a class="btn" href="#/search">Search examiners</a></div>`}
    </div>`;
  }

  // Student view: curated checklists sent by a (sample) DPE after approving a request.
  function viewMyChecklists() {
    const mine = S.bookings.filter((b) => b.mine && b.status === "confirmed").sort((a, b) => b.createdAt - a.createdAt);
    const card = (b) => {
      const dp = dpeById(b.dpeId), s = S.slots.find((x) => x.id === b.slotId), c = S.curated[b.id];
      const head = `<div class="row spread"><div><h2 style="margin:0">${esc(certById(b.cert).name)}</h2><div class="muted small">from ${esc(dp.name)} (sample examiner) · checkride ${fmtDate(s.date)} · ${s.airport}</div></div>`;
      if (!c || !c.sent) return `<section class="card">${head}<span class="pill warn">Waiting for your examiner</span></div><p class="muted small" style="margin:.6rem 0 0">Your request is approved. The examiner can build and send a curated checklist; use <b>DPE</b> in the role switch to try it. Meanwhile use the <a href="#/checklists/${b.cert}">standard ${esc(certById(b.cert).short)} list</a>.</p></section>`;
      const t = S.ticks[b.id] || {};
      const items = c.sent.items;
      const done = items.filter((i) => t[i.id]).length, pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return `<section class="card">${head}<div class="row"><span class="pill good">Sent ${fmtTs(c.sent.sentAt)}</span><b class="big-num">${pct}%</b></div></div>
        <div class="progress" style="margin:.5rem 0 .8rem"><i style="width:${pct}%"></i></div>
        ${c.sent.note ? `<div class="cta-banner small" style="margin-bottom:.8rem"><b>Note from your examiner:</b> ${esc(c.sent.note)}</div>` : ""}
        ${items.length ? items.map((it) => { const d = !!t[it.id]; return `<label class="check-item ${d ? "done" : ""}"><input type="checkbox" data-ctick="${b.id}" data-item="${it.id}" ${d ? "checked" : ""} /><div><div class="t">${esc(it.t)}</div>${it.n ? `<div class="muted small">${esc(it.n)}</div>` : ""}</div></label>`; }).join("") : '<p class="muted">The examiner sent an empty list.</p>'}
      </section>`;
    };
    return `<div class="page">
      <div class="page-head"><h1>My checklists <span class="pill warn" style="vertical-align:middle">Unverified draft</span></h1><p class="muted">Curated lists your examiner sends after approving your request. Ticks are saved in this browser only. Items start from the standard lists, which are unverified drafts.</p></div>
      ${mine.length ? `<div class="stack">${mine.map(card).join("")}</div>` : `<div class="card empty"><h3>Nothing here yet</h3><p>Submit a mock request, then switch to <b>DPE</b> to approve it and send a curated checklist.</p><a class="btn" href="#/search">Search examiners</a></div>`}
    </div>`;
  }

  // DPE view: build a curated checklist for an approved request.
  function viewBuilder(q, id) {
    const b = S.bookings.find((x) => x.id === id);
    if (!b) return `<div class="page card empty"><h2>Request not found</h2><a href="#/dpe-dashboard">Back to dashboard</a></div>`;
    const s = S.slots.find((x) => x.id === b.slotId), c = S.curated[b.id];
    const back = `<p><a href="#/dpe-dashboard">← Back to dashboard</a></p>`;
    if (b.status !== "confirmed") return `<div class="page">${back}<div class="card empty"><h2>Approve the request first</h2><p>A curated checklist can be built once the request is approved.</p></div></div>`;
    const head = `<div class="page-head row spread"><div><h1 style="margin:0">Curated checklist <span class="pill warn" style="vertical-align:middle">Prototype</span></h1><p class="muted" style="margin:0">${esc(b.applicant)} · ${esc(certById(b.cert).name)} · ${fmtDate(s.date)} · ${s.airport}${b.mine ? " · request made in Student view" : " · sample applicant"}</p></div></div>`;
    if (!c) return `<div class="page">${back}${head}<section class="card"><h2>Start your list</h2><p class="muted">Begin with the standard ${esc(certById(b.cert).short)} checklist (an unverified draft) and edit it, or start blank.</p>
      <div class="row"><button class="btn" data-action="cl-start" data-id="${b.id}" data-mode="std">Start from standard ${esc(certById(b.cert).short)} list</button><button class="btn secondary" data-action="cl-start" data-id="${b.id}" data-mode="blank">Start blank</button></div></section></div>`;
    const dirty = !c.sent || JSON.stringify({ i: c.items, n: c.note }) !== JSON.stringify({ i: c.sent.items, n: c.sent.note });
    return `<div class="page">${back}${head}
      <div class="split-r">
        <section class="card">
          <h2>Items (${c.items.length})</h2>
          <div class="stack" id="cl-items">
          ${c.items.map((it, i) => `<div class="cl-row">
            <div class="cl-fields">
              <input data-cl="t" data-bid="${b.id}" data-item="${it.id}" value="${esc(it.t)}" aria-label="Item ${i + 1} text" placeholder="Checklist item" />
              <input data-cl="n" data-bid="${b.id}" data-item="${it.id}" value="${esc(it.n)}" aria-label="Item ${i + 1} note" placeholder="Optional note for the student" />
            </div>
            <div class="cl-btns"><button class="btn ghost sm" data-action="cl-move" data-id="${b.id}" data-item="${it.id}" data-dir="-1" ${i === 0 ? "disabled" : ""} aria-label="Move up">↑</button><button class="btn ghost sm" data-action="cl-move" data-id="${b.id}" data-item="${it.id}" data-dir="1" ${i === c.items.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button><button class="btn ghost sm" data-action="cl-del" data-id="${b.id}" data-item="${it.id}" aria-label="Remove item">✕</button></div>
          </div>`).join("") || '<p class="muted">No items yet. Add one below.</p>'}
          </div>
          <form class="row" data-form="cl-add" style="margin-top:1rem;flex-wrap:nowrap"><input type="hidden" name="bid" value="${b.id}" /><input name="t" required placeholder="Add an item" aria-label="New item text" /><button class="btn secondary" type="submit" style="white-space:nowrap">Add item</button></form>
        </section>
        <aside class="card sticky">
          <h2>Note to student</h2>
          <textarea data-cl="note" data-bid="${b.id}" rows="4" placeholder="Anything the student should know before checkride day">${esc(c.note)}</textarea>
          <p class="muted small" style="margin:.5rem 0 1rem">Drafts autosave in this browser.</p>
          <button class="btn" style="width:100%" data-action="cl-send" data-id="${b.id}" ${c.items.length ? "" : "disabled"}>${c.sent ? "Re-send to student (mock)" : "Send to student (mock)"}</button>
          <p class="small" style="margin:.75rem 0 0">${c.sent ? `<span class="pill good">Sent ${fmtTs(c.sent.sentAt)}</span>${dirty ? ' <span class="pill warn">Unsent changes</span>' : ""}` : '<span class="pill warn">Draft, not sent</span>'}</p>
          <p class="muted small" style="margin:.75rem 0 0">${b.mine ? "The student sees this under My checklists in Student view. No email is sent." : "This is a sample applicant, so only the saved copy exists. Requests made in Student view receive the list under My checklists. No email is sent."} Student ticks are kept for items that stay in the list.</p>
        </aside>
      </div>
    </div>`;
  }

  function viewDpeDash() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const t = iso(today0());
    const mySlots = S.slots.filter((s) => s.dpeId === dp.id && s.status !== "removed" && s.date >= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const myBookings = S.bookings.filter((b) => b.dpeId === dp.id);
    const pending = myBookings.filter((b) => b.status === "requested");
    const confirmed = myBookings.filter((b) => b.status === "confirmed");
    const earnings = confirmed.reduce((sum, b) => sum + (dp.fees[b.cert] || 0), 0);
    const nearby = D.airports.filter((a) => distNm(dp.home, a.id) <= dp.travelNm).map((a) => a.id);
    return `<div class="page">
      <div class="page-head row spread">
        <div><h1 style="margin:0">Examiner dashboard</h1><p class="muted" style="margin:0">${verifiedBadge()} · DPEs list for free in this prototype</p></div>
        <label class="field" style="min-width:220px"><span>Signed in as (demo)</span><select data-action-change="acting-dpe">${allDpes().map((d) => `<option value="${d.id}" ${d.id === dp.id ? "selected" : ""}>${esc(d.name)} · ${d.home}</option>`).join("")}</select></label>
      </div>
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(mySlots.filter((s) => s.status === "open").length, "Open slots published")}
        ${statCard(pending.length, "Requests awaiting you")}
        ${statCard(confirmed.length, "Approved checkrides")}
        ${statCard(money(earnings), "Sample fees on approved checkrides")}
      </section>
      <div class="split-r">
        <div class="stack">
          <section class="card">
            <h2>Booking requests</h2>
            ${pending.length ? pending.map((b) => { const s = S.slots.find((x) => x.id === b.slotId); return `<div class="slot-row">
              <div style="flex:1;min-width:220px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).name)}${b.mine ? ' <span class="pill accent">from Student view</span>' : ""}
                <div class="small">${fmtDate(s.date)} · ${fmtTime(s.time)} · ${s.airport}</div>
                <div class="muted small">${esc(b.aircraft)} · CFI: ${esc(b.cfi)}</div>
                <div class="row small" style="margin-top:.3rem;gap:.5rem"><div class="progress" style="width:120px"><i style="width:${b.readiness}%"></i></div>${b.readiness}% checklist complete</div>
              </div>
              <div class="row"><button class="btn good sm" data-action="accept" data-id="${b.id}">Approve</button><button class="btn bad sm" data-action="decline" data-id="${b.id}">Decline</button></div>
            </div>`; }).join("") : `<p class="muted">No pending requests.</p>`}
          </section>
          <section class="card">
            <h2>Approved checkrides &amp; curated checklists</h2>
            <p class="muted small">After you approve a request, build a curated checklist for the student and send it. In this prototype it appears under <b>My checklists</b> in Student view (only for requests made there).</p>
            ${confirmed.length ? confirmed.map((b) => { const s = S.slots.find((x) => x.id === b.slotId); const c = S.curated[b.id]; return `<div class="slot-row">
              <div style="flex:1;min-width:220px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).name)}${b.mine ? ' <span class="pill accent">from Student view</span>' : ""}
                <div class="small">${fmtDate(s.date)} · ${fmtTime(s.time)} · ${s.airport}</div></div>
              <div class="row">${c?.sent ? '<span class="pill good">Checklist sent</span>' : c ? '<span class="pill warn">Draft</span>' : '<span class="pill">No checklist yet</span>'}<a class="btn secondary sm" href="#/dpe-checklist/${b.id}">${c ? "Edit checklist" : "Build checklist"}</a></div>
            </div>`; }).join("") : '<p class="muted">No approved checkrides yet.</p>'}
          </section>
          <section class="card">
            <h2>Upcoming calendar</h2>
            <div class="table-wrap"><table>
              <thead><tr><th>Date</th><th>Airport</th><th>Status</th><th>Applicant</th><th></th></tr></thead>
              <tbody>${mySlots.slice(0, 14).map((s) => { const b = s.bookingId ? S.bookings.find((x) => x.id === s.bookingId) : null; return `<tr>
                <td>${fmtDate(s.date)} <span class="muted small">${fmtTime(s.time)}</span></td><td>${s.airport}</td><td>${statusPill(s.status)}</td>
                <td>${b && s.status !== "open" ? `${esc(b.applicant)} <span class="muted small">${esc(certById(b.cert).short)}</span>` : '<span class="muted">—</span>'}</td>
                <td class="num">${s.status === "open" ? `<button class="btn ghost sm" data-action="remove-slot" data-id="${s.id}">Remove</button>` : s.status === "booked" ? `<button class="btn secondary sm" data-action="mark-cancel" data-id="${s.id}" title="Applicant cancelled: reopen this slot and alert matching pilots">Applicant cancelled</button>` : ""}</td>
              </tr>`; }).join("")}</tbody>
            </table></div>
          </section>
        </div>
        <aside class="stack sticky">
          <section class="card">
            <h2>Publish an opening</h2>
            <p class="muted small">Pilots with matching saved alerts get a mock alert in this browser. Nothing is emailed.</p>
            <form class="stack" data-form="publish">
              <div class="grid g2" style="grid-template-columns:1fr 1fr">
                <label class="field"><span>Date</span><input type="date" name="date" required min="${addDays(1)}" value="${addDays(6)}" /></label>
                <label class="field"><span>Start</span><select name="time">${["07:30", "08:00", "08:30", "09:00", "12:00", "12:30", "13:00"].map((x) => `<option value="${x}">${fmtTime(x)}</option>`).join("")}</select></label>
              </div>
              ${airportSelect("airport", dp.home, "Airport", nearby)}
              <fieldset style="border:0;padding:0;margin:0"><legend class="small muted" style="font-weight:600;margin-bottom:.3rem">CERTIFICATES OFFERED</legend>
                <div class="row small">${Object.keys(dp.fees).map((c) => `<label class="row" style="gap:.3rem"><input type="checkbox" name="certs" value="${c}" checked /> ${esc(certById(c).short)}</label>`).join("")}</div>
              </fieldset>
              <button class="btn" type="submit">Publish opening</button>
            </form>
          </section>
          <section class="card small">
            <h3>Your listing</h3>
            <p class="muted">Sample listing. Fictional calendar.</p>
            <a class="btn secondary sm" href="#/dpe/${dp.id}">View public profile</a>
          </section>
        </aside>
      </div>
    </div>`;
  }

  function viewSchool() {
    const sc = D.school;
    const st = sc.students;
    const tier = TIERS.find((t) => t.id === S.tier) || TIERS[0];
    const ready = st.filter((s) => s.readiness >= 90 && s.endorsed).length;
    const scheduled = st.filter((s) => s.status === "confirmed" || s.status === "requested").length;
    const status = (s) => {
      if (s.status === "confirmed") return `<span class="pill good">Approved</span> <span class="small">${fmtDate(addDays(s.daysOut))} · ${esc(dpeById(s.dpe).name)}</span>`;
      if (s.status === "requested") return `<span class="pill warn">Requested</span> <span class="small">${fmtDate(addDays(s.daysOut))} · ${esc(dpeById(s.dpe).name)}</span>`;
      if (s.status === "alert") return `<span class="pill accent">Mock alert active</span>`;
      return `<span class="muted small">Not scheduled</span>`;
    };
    return `<div class="page">
      <div class="page-head row spread">
        <div><h1 style="margin:0">${esc(sc.name)}</h1><p class="muted" style="margin:0">${sc.airport} · fictional school · <span class="pill accent">${esc(tier.name)} tier (mock)</span></p></div>
        <button class="btn secondary" data-action="school-invite">+ Add student</button>
      </div>
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(st.length, "Students in training (sample)")}
        ${statCard(ready, "Checkride-ready (≥ 90% + endorsed)")}
        ${statCard(scheduled, "Requested or approved checkrides")}
        ${statCard(Math.round(median(st.map((s) => s.readiness))) + "%", "Median readiness")}
      </section>
      <section class="card" style="margin-bottom:1rem">
        <h2>Subscription tiers <span class="pill warn" style="vertical-align:middle">Placeholder pricing</span></h2>
        <p class="muted small">Flight schools would subscribe; DPEs list for free and students pay a ${money(BOOKING_FEE)} booking fee. These tiers and prices are placeholders, and choosing one is a mock: no payment, no sign-up, no message is sent.</p>
        <div class="grid g3">${TIERS.map((t) => `<div class="card plan ${t.id === S.tier ? "featured" : ""}" style="box-shadow:none">
          <h3>${t.name} ${t.id === S.tier ? '<span class="pill good">Selected (mock)</span>' : ""}</h3><div class="p">${t.id === "enterprise" ? "Contact us" : t.price.replace("/mo", `<span class="muted small" style="font-weight:400"> / mo</span>`)}</div>
          <p class="small muted" style="margin:0">${esc(t.seats)}</p>
          <ul class="small">${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          <button class="btn ${t.id === S.tier ? "ghost" : "secondary"}" data-action="pick-tier" data-tier="${t.id}">${t.id === "enterprise" ? "Contact us (mock)" : t.id === S.tier ? "Selected" : "Select (mock)"}</button>
        </div>`).join("")}</div>
      </section>
      <h2>Roster <span class="muted small" style="font-weight:400">(mock, fictional students)</span></h2>
      <section class="card"><div class="table-wrap"><table>
        <thead><tr><th>Student</th><th>Checkride</th><th>CFI</th><th>Readiness</th><th>Endorsements</th><th>Status</th><th></th></tr></thead>
        <tbody>${st.map((s) => `<tr>
          <td><b>${esc(s.name)}</b></td><td>${esc(certById(s.cert).short)}</td><td class="small">${esc(s.cfi)}</td>
          <td><div class="row" style="gap:.5rem;flex-wrap:nowrap"><div class="progress" style="width:90px"><i style="width:${s.readiness}%"></i></div><span class="small">${s.readiness}%</span></div></td>
          <td>${s.endorsed ? '<span class="pill good">Signed</span>' : '<span class="pill warn">Pending</span>'}</td>
          <td>${status(s)}</td>
          <td class="num"><div class="row" style="justify-content:flex-end;flex-wrap:nowrap">${s.status === "none" ? `<a class="btn sm" href="#/search?cert=${s.cert}&near=${sc.airport}">Find slot</a>` : ""}<a class="btn ghost sm" href="#/checklists/${s.cert}">Checklist</a></div></td>
        </tr>`).join("")}</tbody>
      </table></div></section>
      <p class="muted small" style="margin-top:1rem">Planned for school tiers (not built): requesting checkrides for students, shared alerts for the roster, and one view of checklist progress.</p>
    </div>`;
  }

  function viewAdmin() {
    const pending = S.pending.filter((p) => p.status === "pending");
    const reviewed = S.pending.filter((p) => p.status !== "pending");
    const confirmed = S.bookings.filter((b) => b.status === "confirmed").length;
    const card = (p) => `<div class="card">
      <div class="row spread"><div class="row" style="gap:.75rem"><div class="avatar">${initials(p.name)}</div><div><b>${esc(p.name)}</b><div class="muted small">${p.home} · ${esc(apt(p.home).city)} · submitted ${p.submittedDaysAgo} day${p.submittedDaysAgo === 1 ? "" : "s"} ago</div></div></div>
      ${p.locatorMatch ? '<span class="pill good">Sample locator check: match</span>' : '<span class="pill bad">Sample locator check: no match</span>'}</div>
      <div class="grid g3 small" style="margin:.8rem 0">
        <div><div class="muted">Sample designee number</div><b>${esc(p.designee)}</b></div>
        <div><div class="muted">Managing office</div><b>${esc(p.fsdo)}</b></div>
        <div><div class="muted">Authorizations requested</div>${p.certs.map((c) => `<span class="pill">${esc(certById(c).short)}</span>`).join(" ")}</div>
      </div>
      <p class="small muted">${esc(p.note)}</p>
      <div class="row"><button class="btn good sm" data-action="approve" data-id="${p.id}">Approve (mock)</button><button class="btn secondary sm" data-action="info" data-id="${p.id}">Request info</button><button class="btn bad sm" data-action="reject" data-id="${p.id}">Reject</button></div>
    </div>`;
    return `<div class="page">
      <div class="page-head"><h1>Admin <span class="pill warn" style="vertical-align:middle">Mock</span></h1><p class="muted">A sketch of how a team might review examiner applications and watch marketplace numbers. All applications and figures are fictional; nothing is verified against any FAA source.</p></div>
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(allDpes().length, "Sample examiners listed")}
        ${statCard(pending.length, "Sample applications to review")}
        ${statCard(openSlots().length, "Open slots")}
        ${statCard(S.bookings.filter((b) => b.status === "requested").length, "Requests awaiting examiners")}
        ${statCard(money(confirmed * BOOKING_FEE), `Mock booking fees (${confirmed} × ${money(BOOKING_FEE)}), not collected`)}
        ${statCard(S.alerts.length, "Mock alerts (demo user)")}
        ${statCard(money(S.tier === "pro" ? 149 : S.tier === "enterprise" ? 0 : 49), "School tier MRR (placeholder, 1 school)")}
      </section>
      <h2>Sample application queue</h2>
      <div class="stack">${pending.length ? pending.map(card).join("") : `<div class="card empty">Queue is clear.</div>`}</div>
      ${reviewed.length ? `<h2 style="margin-top:1.5rem">Recently reviewed</h2><div class="card">${reviewed.map((p) => `<div class="slot-row"><span><b>${esc(p.name)}</b> <span class="muted small">${esc(p.designee)}</span></span>${p.status === "approved" ? '<span class="pill good">Approved (mock)</span>' : p.status === "info" ? '<span class="pill warn">Info requested</span>' : '<span class="pill bad">Rejected</span>'}</div>`).join("")}</div>` : ""}
    </div>`;
  }

  function viewPricing() {
    return `<div class="page">
      <div class="page-head" style="text-align:center;max-width:700px;margin-inline:auto">
        <h1>Prototype pricing model</h1>
        <p class="muted">Free for examiners, a ${money(BOOKING_FEE)} booking fee for students, and a subscription for flight schools. All prices are placeholders and nothing is charged in this prototype.</p>
      </div>
      <section class="grid g4">
        <div class="card plan"><h3>Examiners · Free</h3><div class="p">$0</div><ul class="small">
          <li>Sample profile and calendar</li><li>Booking requests: approve or decline</li><li>Curated checklists for approved students</li></ul>
          <a class="btn secondary" href="#" data-action="set-role" data-role="dpe">See the DPE view</a></div>
        <div class="card plan"><h3>Students · booking fee</h3><div class="p">${money(BOOKING_FEE)}<span class="muted small" style="font-weight:400"> / booking</span></div><ul class="small">
          <li>Search, fee comparison and checklists are free</li><li>Plus the examiner deposit, credited toward the examiner's fee</li><li>Shown in the mock booking flow, never charged</li></ul>
          <a class="btn secondary" href="#/search">Try a mock request</a></div>
        <div class="card plan"><h3>Flight schools · subscription</h3><div class="p">$49 <span class="muted small" style="font-weight:400">to</span> $149<span class="muted small" style="font-weight:400"> / mo</span></div><ul class="small">
          <li>Starter $49/mo, Pro $149/mo, Enterprise: contact us</li><li>Placeholder tiers, not final</li><li>Selecting one is a mock</li></ul>
          <a class="btn secondary" href="#" data-action="set-role" data-role="school">See the school view</a></div>
      </section>
      <section class="grid g2" style="margin-top:1rem">
        <div class="card"><h3>Why a flat student fee?</h3><p class="muted small" style="margin:0">It stays the same whichever examiner you choose and is not a percentage of the examiner's fee. Whether any booking fee is permitted alongside designee rules still needs confirming with the FAA or FSDO before launch.</p></div>
        <div class="card"><h3>Open questions</h3><p class="muted small" style="margin:0">Real examiner data sources, payment handling, deposit refund rules and checklist review by a CFI or DPE are all undecided. See PLAN.md.</p></div>
      </section>
    </div>`;
  }

  // ---------- router ----------
  const routes = [
    [/^\/$/, viewHome], [/^\/search$/, viewSearch], [/^\/dpe\/(\w+)$/, viewProfile], [/^\/compare$/, viewCompare],
    [/^\/alerts$/, viewAlerts], [/^\/checklists(?:\/(\w+))?$/, viewChecklists], [/^\/bookings$/, viewBookings], [/^\/my-checklists$/, viewMyChecklists], [/^\/dpe-checklist\/(\w+)$/, viewBuilder],
    [/^\/dpe-dashboard$/, viewDpeDash], [/^\/school$/, viewSchool], [/^\/admin$/, viewAdmin], [/^\/pricing$/, viewPricing],
  ];
  const NAV = () => ({
    pilot: [["#/", "Home"], ["#/search", "Search"], ["#/compare", "Compare fees"], ["#/alerts", "Alerts"], ["#/checklists", "Checklists"], ["#/bookings", "My bookings"], ["#/my-checklists", "My checklists"], ["#/pricing", "Pricing"]],
    dpe: [["#/dpe-dashboard", "Dashboard"], ["#/dpe/" + S.actingDpe, "My public profile"], ["#/pricing", "Pricing"]],
    school: [["#/school", "Roster"], ["#/search", "Search"], ["#/compare", "Compare fees"], ["#/checklists", "Checklists"], ["#/pricing", "Pricing"]],
    admin: [["#/admin", "Applications & metrics"], ["#/search", "Browse listings"], ["#/pricing", "Pricing"]],
  }[S.role]);
  const HOME = { pilot: "#/", dpe: "#/dpe-dashboard", school: "#/school", admin: "#/admin" };

  function parseHash() {
    const h = location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    return { path: path || "/", q: Object.fromEntries(new URLSearchParams(qs || "")) };
  }

  const PROTO_STRIP = `<div class="proto-strip" role="note"><span><b>Prototype – no real payments.</b> Nothing is charged, emailed, texted or sent; everything stays in this browser.</span><span><b>Prototype, not legal or FAA advice.</b> Fees, deposits and checklists are fictional examples.</span></div>`;

  function render() {
    const { path, q } = parseHash();
    let html = null;
    for (const [re, fn] of routes) { const m = path.match(re); if (m) { html = fn(q, ...m.slice(1)); break; } }
    $("#app").innerHTML = PROTO_STRIP + (html ?? `<div class="page card empty"><h2>Page not found</h2><a href="#/">Go home</a></div>`);
    $("#nav").innerHTML = NAV().map(([href, label]) => {
      const p = href.slice(1);
      const active = p === "/" ? path === "/" : path === p || path.startsWith(p + "/");
      return `<a href="${href}" class="${active ? "active" : ""}">${label}</a>`;
    }).join("");
    $("#role-select").value = S.role;
    const unread = S.notifications.filter((n) => !n.read).length;
    $("#bell").hidden = S.role !== "pilot";
    $("#bell-count").hidden = !unread;
    $("#bell-count").textContent = unread;
if (unread > (ui.lastUnread ?? unread)) { const b = $("#bell"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
ui.lastUnread = unread;
if (ui.lastPath !== path) { window.scrollTo(0, 0); ui.lastPath = path; animateEnter(); }
  }
const rerender = () => { save(); render(); };

// ---------- motion ----------
const reduceMotion = () => !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let enterTimer;
// After navigating to a new screen, its main blocks rise in one after another.
function animateEnter() {
  const app = $("#app");
  let i = 0;
  app.querySelectorAll(".anim, .page-head, .tabs, .cta-banner, .result, .grid > .card, .grid > .stat, .page .stack > .card, .page .stack > section, .split > aside, .split-r > aside, .page > .card, .page > section").forEach((el) => {
    if (el.parentElement.closest(".anim")) return;
    el.classList.add("anim");
    el.style.setProperty("--i", Math.min(i++, 10));
  });
  app.classList.remove("enter");
  void app.offsetWidth;
  app.classList.add("enter");
  clearTimeout(enterTimer);
  enterTimer = setTimeout(() => app.classList.remove("enter"), 1400);
  countUp(app);
}
// Big numbers count up from zero when a screen opens.
function countUp(root) {
  if (reduceMotion()) return;
  root.querySelectorAll(".stat .v, .statband .v").forEach((el) => {
    const m = el.textContent.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m) return;
    const target = Number(m[2].replace(/,/g, ""));
    if (!target) return;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      el.textContent = m[1] + Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US") + m[3];
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
  const go = (hash) => { if (location.hash === hash) rerender(); else { save(); location.hash = hash; } };

  // ---------- actions ----------
  function addAlert(a) {
    if (S.alerts.length >= ALERT_LIMIT) {
      openModal(`<h2>Alert limit reached</h2><p class="muted">This prototype keeps up to ${ALERT_LIMIT} saved mock alerts. Delete one to add another.</p>
        <div class="row" style="justify-content:flex-end"><a class="btn secondary" href="#/alerts" data-action="close-modal">Manage alerts</a></div>`);
      return false;
    }
    S.alerts.push({ id: uid("a"), channels: ["email"], createdAt: Date.now(), ...a });
    const n = openSlots({ cert: a.cert }).filter((s) => alertMatches(a, s)).length;
    toast(`Mock alert saved in this browser.${n ? ` ${plural(n, "opening")} already match${n === 1 ? "es" : ""} it.` : " A mock alert will appear in your inbox when something matches."} No email is sent.`);
    rerender();
    return true;
  }

  function openRequest(slotId, certHint) {
    const s = S.slots.find((x) => x.id === slotId);
    const dp = dpeById(s.dpeId);
    const certs = s.certs.filter((c) => dp.fees[c]);
    const cert = certs.includes(certHint) ? certHint : certs[0];
    openModal(`<h2>Request checkride <span class="pill warn" style="vertical-align:middle">Mock</span></h2>
      <p class="muted small" style="margin-bottom:.75rem">${esc(dp.name)} (sample examiner) · ${fmtDate(s.date, { weekday: "long", month: "long", day: "numeric" })} · ${fmtTime(s.time)} · ${s.airport}</p>
      <div class="proto-strip small" style="margin-bottom:1rem"><b>Prototype – no real payments.</b> Nothing is charged or sent. <b>Prototype, not legal or FAA advice.</b></div>
      <form class="stack" data-form="request">
        <input type="hidden" name="slot" value="${s.id}" />
        <label class="field"><span>Certificate / rating</span><select name="cert" data-action-change="req-cert">${certOptions(cert, certs)}</select></label>
        <label class="field"><span>Your name (fictional is fine)</span><input name="name" required value="Alex Pilot" /></label>
        <label class="field"><span>Aircraft (tail number & type)</span><input name="aircraft" required placeholder="N12345 · Cessna 172S" /></label>
        <label class="field"><span>Recommending instructor</span><input name="cfi" required placeholder="Name, CFI" /></label>
        <label class="row small" style="gap:.5rem;align-items:flex-start"><input type="checkbox" required style="margin-top:.2rem" /> My instructor has signed (or will sign before the checkride) the required endorsements, and my IACRA application is started.</label>
        <div class="small" id="req-ready">Your <a href="#/checklists/${cert}" data-action="close-modal">${esc(certById(cert).short)} checklist</a> is <b>${checklistPct(cert)}%</b> complete. The examiner will see this.</div>
        <div class="summary small" id="req-summary">${requestSummary(dp, cert)}</div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn" type="submit">Submit mock request</button></div>
      </form>`);
  }
  const requestSummary = (dp, cert) => {
    const fee = dp.fees[cert], dep = depositFor(dp, cert);
    return `
    <div class="line"><span>Examiner fee, ${esc(certById(cert).short)} (sample)</span><b>${money(fee)}</b></div>
    <div class="line"><span>Examiner deposit, <b>ASSUMPTION</b> (credited toward the fee)</span><b>${money(dep)}</b></div>
    <div class="line"><span>Student booking fee</span><b>${money(BOOKING_FEE)}</b></div>
    <div class="line" style="border-top:1px solid var(--border-strong);margin-top:.3rem;padding-top:.5rem"><span><b>Total due if the examiner approves</b></span><b>${money(dep + BOOKING_FEE)}</b></div>
    <div class="line muted"><span>Remaining examiner fee at the test</span><b>${money(fee - dep)}</b></div>
    <div class="line muted"><span>Actually charged in this prototype</span><b>$0</b></div>
    <div class="warn-note small" style="margin-top:.5rem"><b>ASSUMPTION, not a policy:</b> the deposit is about 20% of the examiner fee, rounded to $25, minimum $100, and is part of the fee, not an extra. Real deposit rules are set by each examiner.</div>`;
  };

  function setBookingState(b, status) {
    const s = S.slots.find((x) => x.id === b.slotId);
    b.status = status;
    if (status === "confirmed") { s.status = "booked"; }
    else if (status === "declined" || status === "cancelled") { s.status = "open"; s.bookingId = null; }
    return s;
  }

  const actions = {
    "set-role": (el) => { S.role = el.dataset.role; go(HOME[S.role]); },
    reset: () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } S = seed(); ui.profileKey = null; toast("Demo reset to sample data."); go("#/"); },
    "close-modal": (el) => { closeModal(); return el.tagName === "A"; },
    "modal-bg": (el, e) => { if (e.target === el) closeModal(); },
    "alert-from-search": (el) => {
      const f = searchFilters(parseHash().q);
      addAlert({ cert: f.cert, near: f.near, radius: f.radius, before: f.before || addDays(60), maxFee: f.maxFee, dpeId: el.dataset.dpe || "" });
    },
    "alert-dpe": (el) => addAlert({ cert: el.dataset.cert, near: dpeById(el.dataset.dpe).home, radius: 100, before: addDays(90), maxFee: 0, dpeId: el.dataset.dpe }),
    "del-alert": (el) => { S.alerts = S.alerts.filter((a) => a.id !== el.dataset.id); toast("Alert deleted."); rerender(); },
    "read-all": () => { S.notifications.forEach((n) => { n.read = true; }); rerender(); },
    "read-notif": (el) => { const n = S.notifications.find((x) => x.id === el.dataset.id); if (n) n.read = true; save(); return true; },
    "cal-nav": (el) => { const [y, m] = ui.month.split("-").map(Number); const d = new Date(y, m - 1 + Number(el.dataset.dir), 1); ui.month = iso(d).slice(0, 7); render(); },
    "cal-day": (el) => { ui.sel = el.dataset.date; render(); },
    request: (el) => openRequest(el.dataset.slot, el.dataset.cert),
    "share-checklist": (el) => {
      toast("Sharing is not available in this prototype. No link was created and nothing was sent.");
    },
    "pilot-cancel": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      const wasConfirmed = b.status === "confirmed";
      const s = setBookingState(b, "cancelled");
      toast(wasConfirmed ? "Booking cancelled (mock). Nothing was charged, so nothing to refund." : "Request cancelled.");
      fireAlerts(s, "cancel", { skipMine: true });
      rerender();
    },
    "as-dpe": (el) => { S.role = "dpe"; S.actingDpe = el.dataset.dpe; go("#/dpe-dashboard"); },
    accept: (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      const s = setBookingState(b, "confirmed");
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Request approved", body: `${dpeById(b.dpeId).name} approved your ${certById(b.cert).short} request for ${fmtDate(s.date)} at ${fmtTime(s.time)} (${s.airport}). Prototype: no deposit or ${money(BOOKING_FEE)} fee was actually charged.` });
      toast(`Approved ${b.applicant} for ${fmtDate(s.date)}. Mock only: no notification or charge. Next, build a curated checklist below.`);
      rerender();
    },
    decline: (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      const s = setBookingState(b, "declined");
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Request declined", body: `${dpeById(b.dpeId).name} couldn't take the ${fmtDate(s.date)} slot. Nothing was charged.` });
      fireAlerts(s, "new", { skipMine: b.mine });
      rerender();
    },
    "remove-slot": (el) => { const s = S.slots.find((x) => x.id === el.dataset.id); s.status = "removed"; toast("Opening removed."); rerender(); },
    "mark-cancel": (el) => {
      const s = S.slots.find((x) => x.id === el.dataset.id);
      const b = S.bookings.find((x) => x.id === s.bookingId);
      if (b) setBookingState(b, "cancelled"); else s.status = "open";
      fireAlerts(s, "cancel");
      rerender();
    },
    "pick-tier": (el) => { S.tier = el.dataset.tier; toast(el.dataset.tier === "enterprise" ? "Mock only: no message was sent. Enterprise is \"contact us\" in this placeholder." : `${TIERS.find((t) => t.id === el.dataset.tier).name} tier selected (mock). No payment taken.`); rerender(); },
    "cl-start": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      S.curated[b.id] = { items: el.dataset.mode === "std" ? standardItems(b.cert).map((i) => ({ id: uid("i"), ...i })) : [], note: "", updatedAt: Date.now(), sent: null };
      rerender();
    },
    "cl-move": (el) => {
      const c = S.curated[el.dataset.id]; const i = c.items.findIndex((x) => x.id === el.dataset.item); const j = i + Number(el.dataset.dir);
      if (i < 0 || j < 0 || j >= c.items.length) return;
      [c.items[i], c.items[j]] = [c.items[j], c.items[i]]; rerender();
    },
    "cl-del": (el) => { const c = S.curated[el.dataset.id]; c.items = c.items.filter((x) => x.id !== el.dataset.item); rerender(); },
    "cl-send": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id), c = S.curated[b.id];
      c.items = c.items.filter((i) => i.t.trim());
      c.sent = { items: JSON.parse(JSON.stringify(c.items)), note: c.note, sentAt: Date.now() };
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Curated checklist received", body: `${dpeById(b.dpeId).name} sent a curated ${certById(b.cert).short} checklist (${c.items.length} items). Mock: nothing was emailed.` });
      toast(b.mine ? "Checklist sent (mock). The student sees it under My checklists." : "Checklist saved as sent (mock). Sample applicant, so no student view exists for it.");
      rerender();
    },
    "school-invite": () => toast("Mock only: no invite email is sent."),
    approve: (el) => {
      const p = S.pending.find((x) => x.id === el.dataset.id);
      p.status = "approved";
      const defaults = { ppl: 1100, ir: 1050, cpl: 1200, cfi: 1700, sport: 750 };
      S.approvedDpes.push({ id: "n" + p.id, name: p.name, home: p.home, travelNm: 50, travelFee: 150, retestFee: 550, fsdo: p.fsdo, since: new Date().getFullYear(), languages: ["English"], rating: 0, reviews: 0, responseHours: 24,
        fees: Object.fromEntries(p.certs.map((c) => [c, defaults[c] || 1100])), bio: "New sample listing. Calendar coming soon.", cancellation: "Not yet set.", aircraft: "Applicant provides the aircraft." });
      toast(`${p.name} approved (mock). Added to the sample directory.`);
      rerender();
    },
    info: (el) => { S.pending.find((x) => x.id === el.dataset.id).status = "info"; toast("Mock only: no message was sent."); rerender(); },
    reject: (el) => { S.pending.find((x) => x.id === el.dataset.id).status = "rejected"; toast("Application rejected."); rerender(); },
  };

  const forms = {
    search: (f, fd) => go("#/search?" + toQuery({ cert: fd.get("cert"), near: fd.get("near"), radius: fd.get("radius"), before: fd.get("before") || "", maxFee: fd.get("maxFee") || "", sort: fd.get("sort") || "" })),
    allin: (f, fd) => go("#/dpe/" + f.dataset.dpe + "?" + toQuery({ cert: fd.get("cert"), near: fd.get("near") })),
    compare: (f, fd) => go("#/compare?" + toQuery({ cert: fd.get("cert"), near: fd.get("near"), radius: fd.get("radius") })),
    alert: (f, fd) => addAlert({ cert: fd.get("cert"), near: fd.get("near"), radius: +fd.get("radius"), before: fd.get("before") || "", maxFee: +fd.get("maxFee") || 0, dpeId: fd.get("dpeId") || "" }),
    request: (f, fd) => {
      const s = S.slots.find((x) => x.id === fd.get("slot"));
      if (s.status !== "open") { closeModal(); toast("Sorry, someone else just requested that slot."); rerender(); return; }
      const cert = fd.get("cert");
      const dpx = dpeById(s.dpeId);
      const b = { id: uid("b"), slotId: s.id, dpeId: s.dpeId, applicant: fd.get("name").trim() || "Alex Pilot", mine: true, cert, aircraft: fd.get("aircraft").trim(), cfi: fd.get("cfi").trim(), readiness: checklistPct(cert), status: "requested", createdAt: Date.now(), feeUsd: dpx.fees[cert], depositUsd: depositFor(dpx, cert), bookingFeeUsd: BOOKING_FEE };
      S.bookings.push(b);
      s.status = "held"; s.bookingId = b.id;
      closeModal();
      toast(`Mock request saved (status: Requested). Nothing was sent or charged. The slot is held while the sample examiner reviews it.`);
      go("#/bookings");
    },
    "cl-add": (f, fd) => {
      const c = S.curated[fd.get("bid")]; const t = fd.get("t").trim(); if (!t) return;
      c.items.push({ id: uid("i"), t, n: "" }); rerender();
      const last = $("#cl-items .cl-row:last-child input"); if (last) last.scrollIntoView({ block: "nearest" });
    },
    publish: (f, fd) => {
      const certs = fd.getAll("certs");
      if (!certs.length) { toast("Pick at least one certificate."); return; }
      const s = { id: uid("s"), dpeId: S.actingDpe, date: fd.get("date"), time: fd.get("time"), airport: fd.get("airport"), certs, status: "open", bookingId: null };
      S.slots.push(s);
      fireAlerts(s, "new");
      rerender();
    },
  };

  // ---------- event wiring ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || !actions[el.dataset.action]) return;
    const passThrough = actions[el.dataset.action](el, e);
    if (passThrough !== true && (el.tagName === "A" || el.tagName === "BUTTON")) e.preventDefault();
  });
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (!f.dataset.form || !forms[f.dataset.form]) return;
    e.preventDefault();
    forms[f.dataset.form](f, new FormData(f));
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.ctick) {
      S.ticks[t.dataset.ctick] = S.ticks[t.dataset.ctick] || {};
      S.ticks[t.dataset.ctick][t.dataset.item] = t.checked;
      rerender();
      return;
    }
    if (t.dataset.check) {
      S.checklist[t.dataset.check] = S.checklist[t.dataset.check] || {};
      S.checklist[t.dataset.check][t.dataset.item] = t.checked;
      rerender();
      return;
    }
    if (t.dataset.actionChange === "acting-dpe") { S.actingDpe = t.value; rerender(); return; }
    if (t.dataset.actionChange === "req-cert") {
      const s = S.slots.find((x) => x.id === t.form.slot.value);
      const dp = dpeById(s.dpeId);
      $("#req-summary").innerHTML = requestSummary(dp, t.value);
      $("#req-ready").innerHTML = `Your <a href="#/checklists/${t.value}" data-action="close-modal">${esc(certById(t.value).short)} checklist</a> is <b>${checklistPct(t.value)}%</b> complete. The examiner will see this.`;
      return;
    }
    const f = t.form;
    if (f && f.dataset.auto !== undefined && forms[f.dataset.form]) forms[f.dataset.form](f, new FormData(f));
  });
  // Builder inputs autosave without re-rendering (keeps focus while typing).
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!t.dataset || !t.dataset.cl) return;
    const c = S.curated[t.dataset.bid]; if (!c) return;
    if (t.dataset.cl === "note") c.note = t.value;
    else { const it = c.items.find((x) => x.id === t.dataset.item); if (it) it[t.dataset.cl] = t.value; }
    c.updatedAt = Date.now(); save();
  });
  // Safety net: no form in this prototype ever submits to a server.
  document.addEventListener("submit", (e) => { const f = e.target; if (!f.dataset.form || !forms[f.dataset.form]) e.preventDefault(); }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  $("#role-select").addEventListener("change", (e) => { S.role = e.target.value; go(HOME[S.role]); });
  window.addEventListener("hashchange", () => { closeModal(); render(); });

  render();
})();
