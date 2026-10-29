// Checkride Connect: clickable prototype. Plain JS, no build step, no network calls.
// MOCK ONLY: nothing is charged, emailed, texted or sent anywhere. State lives in localStorage
// so the demo survives reloads. "Reset demo" clears it. All examiners/applicants/schools are fictional.
(() => {
  "use strict";
  const D = window.CC_DATA;
  // Fictional Florida sample set (fl01-fl50): appended to the original examiners (demo bookings and school data use d1..d13).
  // Its airport list is a superset of data.js airports, so it replaces them.
  const FL = window.CC_SAMPLE_FL;
  if (FL && FL.fictional && Array.isArray(FL.dpes)) {
    const have = new Set(D.dpes.map((d) => d.id));
    D.dpes.push(...FL.dpes.filter((d) => !have.has(d.id)));
    if (Array.isArray(FL.airports) && D.airports.every((a) => FL.airports.some((b) => b.id === a.id))) D.airports = FL.airports;
  }
  const BOOKING_FEE = 15;
  const ALERT_LIMIT = 5; // prototype cap on saved mock alerts (alerts are free, email-only, mock)
  const KEY = "cc-connect-proto-v3";
  // Proposed school pricing (from checkride-pricing-and-counsel.md). Not final; selecting one is a mock.
  const TIERS = [
    { id: "free", name: "Free", price: "$0", unit: "", seats: "Students pay the $15 booking fee", features: ["School profile and roster", "Invite students", "See examiner availability"] },
    { id: "pro", name: "Pro", price: "$79", unit: "/mo per location", seats: "Up to about 50 active candidates", features: ["Everything in Free", "Cohort checkride calendar", "Readiness and eligibility checklist", "Option for the school to pay, on one monthly invoice", "Wait-time and pass-rate dashboards"] },
    { id: "academy", name: "Academy / University", price: "$299", unit: "/mo, multi-location", seats: "Multiple locations and chief instructors", features: ["Everything in Pro", "Multiple locations and chief instructors", "Exports and integrations (e.g. Flight Schedule Pro, Talon) – planned", "Pipeline reporting", "Priority support"] },
  ];
  const TIER_PRICE = { free: 0, pro: 79, academy: 299 };

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
        ${stat(dp.reviews ? `★ ${dp.rating} ${SAMPLE_TAG}` : "—", dp.reviews ? `sample rating (${plural(dp.reviews, "sample review")})` : "no sample reviews yet")}
        ${stat(next ? plural(daysUntil(next.date), "day") : "—", `until the next open ${esc(certById(cert).short)} slot (from the sample calendar)`)}
        ${stat(sm.avgDaysToNext != null ? plural(sm.avgDaysToNext, "day") : "—", "average wait to the next checkride (sample)")}
        ${stat(sm.leadDays != null ? plural(sm.leadDays, "day") : "—", "typical booking lead time (sample)")}
      </div>
      ${sm.reviewList.length ? `<h3 style="margin:1.1rem 0 .4rem">Showing ${sm.reviewList.length} of ${dp.reviews} sample reviews</h3>
      ${sm.reviewList.map((r) => `<blockquote class="review"><div class="row small" style="gap:.5rem"><span aria-label="${r.stars} of 5 stars, sample" class="stars">${stars(r.stars)}</span>${SAMPLE_TAG}<span class="muted">Example student · ${esc(certById(r.cert).short)} · sample review, not real</span></div><p style="margin:.25rem 0 0">“${esc(r.text)}”</p></blockquote>`).join("")}` : `<p class="muted small">No sample reviews for this new listing.</p>`}
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
    // A few examiners run two checkrides on some days (capacity 2). Added after the seeded bookings so their slot indexes are unchanged.
    ["d1", "d2", "d9"].forEach((id) => {
      slots.filter((x) => x.dpeId === id && x.status === "open").forEach((x, k) => {
        if (k % 2 === 0) slots.push({ id: "s" + ++n, dpeId: id, date: x.date, time: x.time < "11:00" ? "10:30" : "08:30", airport: x.airport, certs: x.certs, status: "open", bookingId: null, note: "Two checkrides that day (sample)" });
      });
    });
    const avail = {};
    D.dpes.forEach((dp, i) => { const ts = Date.now() - ((i % 4) * 24 + i + 2) * 3600e3; avail[dp.id] = { confirmedAt: ts, updatedAt: ts, reminderDay: 0, pauseReminders: false }; });
    return {
      v: 3, fl: 1, role: "pilot", nextId: 1000, slots, bookings, avail,
      alerts: [{ id: "a1", cert: "ppl", near: "KORL", radius: 75, before: addDays(45), maxFee: 1300, dpeId: "", channels: ["email"], createdAt: Date.now() }],
      notifications: [{ id: "n1", ts: Date.now(), title: "Your first sample alert is active", body: "Mock alert, nothing is emailed. In a real version we would tell you when a Private Pilot checkride opens within 75 nm of KORL in the next 45 days for $1,300 or less.", read: false }],
      checklist: {}, curated: {}, ticks: {}, tier: "free",
      pending: D.pendingDpes.map((p) => ({ ...p, status: "pending" })),
      approvedDpes: [], actingDpe: "d1",
    };
  }
  // Older v3 state (before the Florida sample set and the proposed tiers) is upgraded in place, keeping the user's bookings.
  function migrate(s) {
    if (!s.fl) {
      const fresh = seed(), have = new Set(s.slots.map((x) => x.dpeId));
      fresh.slots.filter((x) => !have.has(x.dpeId)).forEach((x) => s.slots.push({ ...x, id: "fl-" + x.id }));
      s.avail = s.avail || {};
      Object.entries(fresh.avail).forEach(([k, v]) => { if (!s.avail[k]) s.avail[k] = v; });
      s.fl = 1;
    }
    const oldTier = { starter: "free", enterprise: "academy" };
    if (oldTier[s.tier]) s.tier = oldTier[s.tier];
    return s;
  }
  function load() { try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 3) return migrate(s); } } catch (e) { /* storage unavailable */ } return seed(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  let S = load();
  const uid = (p) => p + S.nextId++;
  const ui = { profileKey: null, month: null, sel: null, lastPath: null };

  // ---------- queries ----------
  const openSlots = ({ dpeId, cert, before } = {}) => {
    const t = iso(today0());
    return S.slots
      .filter((s) => s.status === "open" && s.date >= t && !isStale(s.dpeId) && (!dpeId || s.dpeId === dpeId) && (!cert || s.certs.includes(cert)) && (!before || s.date <= before))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  };

  // ---------- availability freshness (per /workspace/dpe-availability-proposal.md) ----------
  const availOf = (id) => {
    S.avail = S.avail || {};
    if (!S.avail[id]) S.avail[id] = { confirmedAt: Date.now(), updatedAt: Date.now(), reminderDay: 0, pauseReminders: false };
    return S.avail[id];
  };
  // ok: 0-7 days since confirmation. amber: 8-14 (shown with a tag). stale: over 14 (slots hidden from search/booking). reverify: over 90.
  const freshOf = (id) => {
    const a = availOf(id);
    const days = Math.max(0, Math.floor((Date.now() - a.confirmedAt) / DAY));
    return { days, a, level: days > 90 ? "reverify" : days > 14 ? "stale" : days > 7 ? "amber" : "ok" };
  };
  const isStale = (id) => { const l = freshOf(id).level; return l === "stale" || l === "reverify"; };
  const agoText = (days) => (days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`);
  const freshBadge = (id) => {
    const f = freshOf(id);
    if (f.level === "ok") return `<span class="pill good">Availability confirmed ${agoText(f.days)}</span>`;
    if (f.level === "amber") return `<span class="pill warn">Confirmed ${agoText(f.days)}: may be out of date, confirm with the examiner</span>`;
    return `<span class="pill bad">Availability not recently confirmed. Contact the examiner</span>`;
  };
  const touchAvail = (id) => { const a = availOf(id); a.confirmedAt = a.updatedAt = Date.now(); };
  const SLOT_TIMES = ["08:00", "08:30", "09:00", "10:30", "12:30", "13:00", "15:30"];
  // Apply a DPE's weekly grid to the real slot list. Booked/held slots are never removed.
  function applyAvailability(dp, days) {
    const created = []; let closedDays = 0, keptDays = 0, openedDays = 0;
    days.forEach((d) => {
      const cur = S.slots.filter((x) => x.dpeId === dp.id && x.date === d.date && x.status !== "removed");
      const taken = cur.filter((x) => x.status !== "open");
      const opens = cur.filter((x) => x.status === "open").sort((a, b) => a.time.localeCompare(b.time));
      if (!d.open) { opens.forEach((x) => { x.status = "removed"; }); if (opens.length) closedDays++; if (taken.length) keptDays++; return; }
      const want = Math.max(d.cap, taken.length) - taken.length;
      opens.slice(want).forEach((x) => { x.status = "removed"; });
      const keep = opens.slice(0, want);
      if (!cur.length) openedDays++;
      keep.forEach((x, i) => {
        x.airport = d.airport; x.note = d.note;
        if (i === 0 && !cur.some((y) => y !== x && y.status !== "removed" && y.time === d.time)) x.time = d.time;
      });
      for (let i = keep.length; i < want; i++) {
        const used = S.slots.filter((y) => y.dpeId === dp.id && y.date === d.date && y.status !== "removed").map((y) => y.time);
        const time = i === 0 && !keep.length && !used.includes(d.time) ? d.time : (SLOT_TIMES.find((tm) => !used.includes(tm)) || "16:30");
        const ns = { id: uid("s"), dpeId: dp.id, date: d.date, time, airport: d.airport, certs: Object.keys(dp.fees), status: "open", bookingId: null, note: d.note, src: "weekly" };
        S.slots.push(ns); created.push(ns);
      }
    });
    return { created, closedDays, keptDays, openedDays };
  }

  // ---------- (e) location: airport/city text with a picker, or a mock "sample location" (no GPS, no network) ----------
  const aptLabel = (a) => `${a.id} – ${a.city} (${a.name})`;
  function resolveAirport(str) {
    const s = String(str || "").trim().toUpperCase();
    if (!s) return null;
    const tok = s.split(/[\s–-]+/)[0];
    const byId = D.airports.find((a) => a.id === tok || a.id === "K" + tok);
    if (byId) return byId.id;
    const t = s.replace(/,?\s*FL(ORIDA)?$/, "").trim();
    const a = D.airports.find((x) => x.city.toUpperCase() === t) || D.airports.find((x) => x.city.toUpperCase().startsWith(t)) || D.airports.find((x) => x.name.toUpperCase().includes(t));
    return a ? a.id : null;
  }
  const locationField = (near, id = "loc") => `<div class="loc-field">
      <label class="field"><span>Near me: airport or city</span><input name="nearText" list="${id}-list" autocomplete="off" value="${esc(aptLabel(apt(near)))}" aria-describedby="${id}-hint" /></label>
      <input type="hidden" name="near" value="${near}" />
      <datalist id="${id}-list">${D.airports.map((a) => `<option value="${esc(aptLabel(a))}"></option>`).join("")}</datalist>
      <div class="row small" id="${id}-hint" style="gap:.5rem"><button type="button" class="btn ghost sm" data-action="sample-location">Use a sample location</button><span class="muted">Mock: picks a sample airport, no GPS.</span></div>
    </div>`;

  function searchDpes(f) {
    const out = [];
    allDpes().forEach((dp) => {
      const fee = dp.fees[f.cert];
      if (!fee || (f.maxFee && fee > f.maxFee) || !reachable(dp, f.near, f.radius)) return;
      const slots = openSlots({ dpeId: dp.id, cert: f.cert, before: f.before });
      const soonest = slots[0] || null;
      out.push({ dp, fee, dist: distNm(dp.home, f.near), slots, soonest, slotDist: soonest ? distNm(soonest.airport, f.near) : distNm(dp.home, f.near), travel: travelCost(dp, f.near) });
    });
    const bySoon = (a, b) => (a.soonest ? a.soonest.date : "9999").localeCompare(b.soonest ? b.soonest.date : "9999");
    // Soonest first; same day goes to the closer checkride airport, then the lower fee.
    const sorters = { soonest: (a, b) => bySoon(a, b) || a.slotDist - b.slotDist || a.fee - b.fee, fee: (a, b) => a.fee - b.fee || bySoon(a, b), distance: (a, b) => a.slotDist - b.slotDist || bySoon(a, b) };
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
    if (!$("#modal-root .modal-bg")) modalReturn = document.activeElement;
    $("#modal-root").innerHTML = `<div class="modal-bg" data-action="modal-bg"><div class="modal" role="dialog" aria-modal="true" tabindex="-1">${html}</div></div>`;
    const dlg = $("#modal-root .modal");
    const h = dlg.querySelector("h2, h3");
    if (h) { h.id = "modal-title"; dlg.setAttribute("aria-labelledby", "modal-title"); } else dlg.setAttribute("aria-label", "Dialog");
    a11yFix(dlg);
    const f = dlg.querySelector('input:not([type=hidden]), select, textarea, button');
    (f || dlg).focus();
  }
  // Focus-trap helpers for the modal (keyboard accessibility).
  let modalReturn = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  // Scrollable tables need to be keyboard-reachable.
  function a11yFix(root) {
    root.querySelectorAll(".table-wrap").forEach((t) => { t.tabIndex = 0; t.setAttribute("role", "region"); if (!t.getAttribute("aria-label")) t.setAttribute("aria-label", "Scrollable table"); });
  }
const closeModal = () => {
  const bg = $("#modal-root .modal-bg");
  if (!bg || bg.classList.contains("closing")) return;
  bg.classList.add("closing");
  clearTimeout(modalTimer);
  modalTimer = setTimeout(() => { $("#modal-root").innerHTML = ""; }, 160);
  const r = modalReturn; modalReturn = null;
  if (r && document.contains(r) && r.focus) r.focus();
};

  // Fictional-sample marker. Deliberately not a check mark or shield, so it can't read as "verified".
  const sampleBadge = () => `<span class="sample-badge" title="Fictional sample examiner. Not a real person and not checked against any FAA source.">Sample examiner (fictional)</span>`;
  const SAMPLE_TAG = `<span class="sample-tag">SAMPLE</span>`;
  const ratingText = (dp) => (dp.reviews ? `<span class="rating-wrap"><span aria-hidden="true">★</span> ${dp.rating} ${SAMPLE_TAG}</span> rating (${dp.reviews} sample reviews)` : "New sample listing");

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
            ${locationField("KORL", "loc-h")}
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
          <div class="board-foot"><span>${next90} open in the next 90 days</span><a class="see-all" href="#/search?cert=ppl">See all →</a></div>
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
          ${locationField(f.near, "loc-s")}
          ${radiusSelect(f.radius)}
          <label class="field"><span>Checkride before</span><input type="date" name="before" value="${esc(f.before)}" min="${addDays(1)}" /></label>
          ${feeSelect(f.maxFee)}
          <label class="field"><span>Sort by</span><select name="sort">
            ${[["soonest", "Soonest opening"], ["fee", "Lowest fee"], ["distance", "Closest checkride airport"]].map(([v, l]) => `<option value="${v}" ${v === f.sort ? "selected" : ""}>${l}</option>`).join("")}
          </select></label>
        </form>
      </aside>
      <section class="stack">
        <div class="page-head" style="margin:0">
          <h1>Soonest ${esc(c.short)} checkrides near ${f.near}</h1>
          <p class="muted" style="margin:0">${results.length} of ${allDpes().length} sample examiners match${fees.length ? ` · fees ${money(Math.min(...fees))}–${money(Math.max(...fees))}` : ""}${soonest ? ` · soonest opening ${fmtDate(soonest.date)} (${relDays(soonest.date)})` : ""}</p>
        </div>
        ${(() => { const top = f.sort === "soonest" ? withSlots[0] : null; if (!top) return ""; return `<div class="card soonest-lead" id="soonest-lead"><div class="small muted">Soonest checkride near ${f.near} (sample)</div>
          <div class="soonest-big"><b>${fmtDate(top.soonest.date, { weekday: "short", month: "short", day: "numeric" })}</b> · ${fmtTime(top.soonest.time)} · ${top.soonest.airport} <span class="muted small">${top.slotDist <= 2 ? "at your airport" : top.slotDist + " nm away"}</span></div>
          <div class="small">${esc(top.dp.name)} ${sampleBadge()} · ${money(top.fee)} · ${relDays(top.soonest.date)}</div>
          <a class="btn sm" style="margin-top:.5rem" href="#/dpe/${top.dp.id}?cert=${f.cert}&date=${top.soonest.date}&near=${f.near}">See this opening</a></div>`; })()}
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
        <div class="row" style="gap:.5rem"><h3 style="margin:0"><a href="#/dpe/${dp.id}?cert=${f.cert}">${esc(dp.name)}</a></h3>${sampleBadge()}</div>
        <div class="muted small">${esc(apt(dp.home).city)} · ${dp.home} · ${ratingText(dp)} · replies in ~${dp.responseHours}h${sampleOf(dp).avgDaysToNext != null ? ` · avg wait ${plural(sampleOf(dp).avgDaysToNext, "day")} (sample)` : ""}</div>
        <div class="small">${where}${r.soonest ? ` · next opening ${r.slotDist <= 2 ? "at " + r.soonest.airport : r.slotDist + " nm away at " + r.soonest.airport}` : ""}</div>
        ${freshOf(dp.id).level === "ok" ? "" : `<div class="small" style="margin-top:.25rem">${freshBadge(dp.id)}</div>`}
        ${r.slots.length
          ? `<div class="chips">${chips}${r.slots.length > 4 ? `<a class="small" style="align-self:center" href="#/dpe/${dp.id}?cert=${f.cert}">+${r.slots.length - 4} more</a>` : ""}</div>`
          : isStale(dp.id) ? `<p class="small muted" style="margin:.5rem 0 0">Openings hidden until the examiner confirms them again.</p>`
          : `<p class="small muted" style="margin:.5rem 0 0">No openings in your date range. <a href="#" data-action="alert-from-search" data-dpe="${dp.id}">Save a mock alert for ${esc(first(dp.name))}</a></p>`}
      </div>
      <div class="price" style="text-align:right">
        <div class="amt">${money(r.fee)}</div><div class="muted small">${esc(certById(f.cert).short)} fee</div>
        ${r.soonest ? `<div class="pill good" style="margin-top:.4rem">Soonest ${relDays(r.soonest.date)}</div>` : `<div class="pill" style="margin-top:.4rem">${isStale(dp.id) ? "Not confirmed" : "No openings"}</div>`}
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
    // If the selected day no longer has openings (e.g. the examiner closed it or let availability go stale), move to the next open day.
    else if (!ui.sel && slots.length) { ui.sel = slots[0].date; ui.month = ui.sel.slice(0, 7); }
    else if (ui.sel && !q.date && !slots.some((s) => s.date === ui.sel) && !S.slots.some((s) => s.dpeId === dp.id && s.date === ui.sel && s.status === "held" && s.bookingId && S.bookings.some((b) => b.id === s.bookingId && b.mine))) { ui.sel = slots[0]?.date || null; if (ui.sel) ui.month = ui.sel.slice(0, 7); }
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
                <div class="row" style="gap:.6rem">${sampleBadge()}<span class="muted small">Sample DPE since ${dp.since} · ${esc(dp.fsdo)} (fictional)</span></div>
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
            ${(dp.otherAuthorizations || []).length ? `<div class="other-auth" style="margin-top:.9rem"><div class="small"><b>Other authorizations (info only)</b> <span class="pill">Not bookable in this prototype</span></div><ul class="small" style="margin:.35rem 0 0;padding-left:1.1rem">${dp.otherAuthorizations.map((o) => `<li>${esc(o.name)}${o.detail ? ` <span class="muted">${esc(o.detail)}</span>` : ""}${o.fee ? ` · sample fee ${money(o.fee)}` : ""}</li>`).join("")}</ul></div>` : ""}
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
          <div style="margin:-.25rem 0 .75rem">${freshBadge(dp.id)}</div>
          ${calendar(dp)}
          <div class="day-panel" style="margin-top:1rem">
            ${ui.sel ? `<h3>${fmtDate(ui.sel, { weekday: "long", month: "long", day: "numeric" })}</h3>` : `<p class="muted small">${isStale(dp.id) ? "No dates shown." : "No open dates right now."}</p>`}
            ${daySlots.map((s) => `<div class="slot-row">
                <div><b>${fmtTime(s.time)}</b> · ${s.airport}<div class="muted small">${s.certs.map((c) => certById(c).short).join(", ")}</div>${s.note ? `<div class="small slot-note">Note: ${esc(s.note)}</div>` : ""}</div>
                ${s.status === "open" && !isStale(dp.id) ? `<button class="btn sm" data-action="request" data-slot="${s.id}" data-cert="${cert}">Request</button>` : statusPill(s.status)}
              </div>`).join("")}
          </div>
          <div class="cta-banner small" style="margin-top:1rem">
            <b>Nothing that works?</b> <a href="#" data-action="alert-dpe" data-dpe="${dp.id}" data-cert="${cert}">Save a mock alert for ${esc(first(dp.name))}</a>
          </div>
          ${isStale(dp.id) ? `<p class="small" style="margin:.75rem 0 0"><b>Availability not recently confirmed.</b> Contact the examiner. Openings are hidden until they confirm.</p>` : ""}
          <p class="muted small" style="margin:.75rem 0 0">${plural(slots.length, "open slot")} · sample calendar, generated for this demo. Always confirm the date with the examiner; this prototype guarantees nothing.</p>
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
          <td>${r.dp.reviews ? `★ ${r.dp.rating} ${SAMPLE_TAG} <span class="muted small">(${r.dp.reviews})</span>` : '<span class="muted small">new</span>'}</td>
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
        <div><h1 style="margin:0">Examiner dashboard</h1><p class="muted" style="margin:0">${sampleBadge()} · DPEs list for free in this prototype</p></div>
        <label class="field" style="min-width:220px"><span>Signed in as (demo)</span><select data-action-change="acting-dpe">${allDpes().map((d) => `<option value="${d.id}" ${d.id === dp.id ? "selected" : ""}>${esc(d.name)} · ${d.home}</option>`).join("")}</select></label>
      </div>
      <section class="cta-banner row spread" style="margin-bottom:1rem"><div><b>Weekly check:</b> last updated ${fmtTs(availOf(dp.id).updatedAt)} · ${freshBadge(dp.id)}</div><a class="btn" href="#/dpe-openings" id="dash-openings">Update my openings</a></section>
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
              <div style="flex:1;min-width:220px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).name)}${b.mine ? ' <span class="pill accent">from Student view</span>' : b.school ? ' <span class="pill accent">from Demo Flight Academy</span>' : ""}
                <div class="small">${fmtDate(s.date)} · ${fmtTime(s.time)} · ${s.airport}</div>
                <div class="muted small">${esc(b.aircraft)} · CFI: ${esc(b.cfi)}</div>
                <div class="row small" style="margin-top:.3rem;gap:.5rem"><div class="progress" style="width:120px"><i style="width:${b.readiness}%"></i></div>${b.readiness}% checklist complete${b.selfCheck ? ` · <span class="pill">Self-attested readiness${b.selfCheck.warnings ? `, ${plural(b.selfCheck.warnings, "warning")}` : ""} (unverified)</span>` : ""}</div>
                ${selfCheckDetails(b)}
              </div>
              <div class="row"><button class="btn good sm" data-action="accept" data-id="${b.id}">Approve</button><button class="btn bad sm" data-action="decline" data-id="${b.id}">Decline</button></div>
            </div>`; }).join("") : `<p class="muted">No pending requests.</p>`}
          </section>
          <section class="card">
            <h2>Approved checkrides &amp; curated checklists</h2>
            <p class="muted small">After you approve a request, build a curated checklist for the student and send it. In this prototype it appears under <b>My checklists</b> in Student view (only for requests made there).</p>
            ${confirmed.length ? confirmed.map((b) => { const s = S.slots.find((x) => x.id === b.slotId); const c = S.curated[b.id]; return `<div class="slot-row">
              <div style="flex:1;min-width:220px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).name)}${b.mine ? ' <span class="pill accent">from Student view</span>' : b.school ? ' <span class="pill accent">from Demo Flight Academy</span>' : ""}
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


  // ---------- (c) DPE weekly "update my openings" ----------
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const nextReminderAt = (dow) => {
    const d = new Date(); d.setHours(19, 0, 0, 0);
    while (d.getDay() !== dow || d.getTime() <= Date.now()) { d.setDate(d.getDate() + 1); d.setHours(19, 0, 0, 0); }
    return d;
  };
  const fmtWhen = (d) => d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const dpeNextOpen = (id) => openSlots({ dpeId: id })[0];

  function viewOpenings() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const a = availOf(dp.id), fr = freshOf(dp.id);
    const next = dpeNextOpen(dp.id);
    const dates = Array.from({ length: 21 }, (_, i) => addDays(i));
    const weeks = [];
    dates.forEach((d) => {
      const dt = parseIso(d); const mon = new Date(dt); mon.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
      const k = iso(mon); let w = weeks.find((x) => x.k === k);
      if (!w) { w = { k, days: [] }; weeks.push(w); }
      w.days.push(d);
    });
    const near = D.airports.filter((x) => x.id === dp.home || distNm(dp.home, x.id) <= dp.travelNm).map((x) => x.id);
    const row = (d) => {
      const cur = S.slots.filter((x) => x.dpeId === dp.id && x.date === d && x.status !== "removed").sort((x, y) => x.time.localeCompare(y.time));
      const taken = cur.filter((x) => x.status !== "open").length;
      const firstOpen = cur.find((x) => x.status === "open") || cur[0];
      const isOpen = cur.length > 0;
      const maxCap = Math.max(3, cur.length);
      const cap = Math.max(1, cur.length);
      const times = [...new Set([...SLOT_TIMES, ...(firstOpen ? [firstOpen.time] : [])])].sort();
      const sunday = parseIso(d).getDay() === 0;
      return `<div class="avail-day ${isOpen ? "is-open" : ""}" data-date="${d}">
        <div class="avail-top">
          <div class="avail-date"><b>${fmtDate(d, { weekday: "short", month: "short", day: "numeric" })}</b>${taken ? `<span class="small muted">${plural(taken, "request/booking")} on this day</span>` : sunday ? `<span class="small muted">Sunday</span>` : ""}</div>
          <label class="switch"><input type="checkbox" name="open-${d}" ${isOpen ? "checked" : ""} aria-label="Open on ${fmtDate(d)}" /><span class="track"></span><span class="lbl on">Open</span><span class="lbl off">Closed</span></label>
        </div>
        <div class="avail-fields">
          <label class="field"><span>Checkrides</span><select name="cap-${d}">${Array.from({ length: maxCap }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === cap ? "selected" : ""} ${n < taken ? "disabled" : ""}>${n}</option>`).join("")}</select></label>
          <label class="field"><span>Start time</span><select name="time-${d}">${times.map((tm) => `<option value="${tm}" ${firstOpen && firstOpen.time === tm ? "selected" : ""}>${fmtTime(tm)}</option>`).join("")}</select></label>
          <label class="field"><span>Airport</span><select name="airport-${d}">${near.map((x) => `<option value="${x}" ${(firstOpen ? firstOpen.airport : dp.home) === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
          <label class="field avail-note"><span>Note (optional)</span><input name="note-${d}" maxlength="80" value="${esc((firstOpen && firstOpen.note) || "")}" placeholder="e.g. orals at 8, flight after lunch" /></label>
        </div>
      </div>`;
    };
    const wk = (w, i) => `<section class="card avail-week" data-week="${i}">
      <div class="row spread"><h3 style="margin:0">${i === 0 ? "This week" : i === 1 ? "Next week" : "Week of " + fmtDate(w.days[0], { month: "short", day: "numeric" })}</h3>
        <div class="row"><button type="button" class="btn ghost sm" data-action="avail-week" data-week="${i}" data-mode="open">Open all</button><button type="button" class="btn ghost sm" data-action="avail-week" data-week="${i}" data-mode="close">Nothing open this week</button></div></div>
      ${w.days.map(row).join("")}
    </section>`;
    const dayName = WEEKDAYS[a.reminderDay];
    const rAt = nextReminderAt(a.reminderDay);
    const nudge = new Date(rAt); nudge.setDate(nudge.getDate() + ((3 - rAt.getDay() + 7) % 7 || 7)); nudge.setHours(12, 0, 0, 0);
    const upcoming = openSlots({ dpeId: dp.id }).slice(0, 3);
    return `<div class="page avail-page">
      <div class="page-head row spread">
        <div><h1 style="margin:0">Update my openings</h1><p class="muted" style="margin:0">${esc(dp.name)} · ${dp.home} · a 1-minute weekly check so students see real dates</p></div>
        <label class="field" style="min-width:220px"><span>Signed in as (demo)</span><select data-action-change="acting-dpe">${allDpes().map((d) => `<option value="${d.id}" ${d.id === dp.id ? "selected" : ""}>${esc(d.name)} · ${d.home}</option>`).join("")}</select></label>
      </div>
      <section class="card avail-status ${fr.level}">
        <div class="row spread" style="align-items:flex-start">
          <div>
            <div class="small muted">Last updated</div>
            <div class="avail-stamp" id="avail-stamp"><b>${fmtTs(a.updatedAt)}</b> <span class="muted small">(${agoText(Math.max(0, Math.floor((Date.now() - a.updatedAt) / DAY)))})</span></div>
            <div style="margin-top:.4rem">${freshBadge(dp.id)}</div>
            <p class="small" style="margin:.5rem 0 0">Students currently see your next open date as <b id="avail-next">${next ? fmtDate(next.date, { weekday: "short", month: "short", day: "numeric" }) + " (" + relDays(next.date) + ")" : "none: no openings are shown"}</b>.${fr.level === "amber" ? " They also see a \u201cmay be out of date\u201d tag." : ""}${fr.level === "stale" || fr.level === "reverify" ? " Your slots are hidden from search and booking until you confirm." : ""}</p>
          </div>
          <div class="row"><button class="btn good" data-action="avail-confirm" id="avail-confirm">Yes, nothing changed</button><a class="btn ghost" href="#/dpe/${dp.id}">See what students see</a></div>
        </div>
        <p class="muted small" style="margin:.6rem 0 0">One tap on <b>Yes, nothing changed</b> re-confirms your current openings. Saving any edit below also refreshes the stamp. Students always see a \u201cconfirm with the examiner\u201d line.</p>
      </section>
      <form data-form="avail" class="stack avail-form">
        ${weeks.map(wk).join("")}
        <div class="avail-save"><div class="small muted">Changes apply to the next 3 weeks. Requested or approved days are never removed.</div><button class="btn" type="submit" id="avail-save">Save my openings</button></div>
      </form>
      <section class="card" style="margin-top:1rem" id="avail-reminders">
        <div class="row spread"><h2 style="margin:0">Weekly reminder <span class="pill warn" style="vertical-align:middle">Preview only</span></h2></div>
        <p class="muted small">Nothing is emailed or texted from this prototype. This shows what a real weekly nudge could look like.</p>
        <form class="row" data-form="avail-reminder" data-auto style="align-items:flex-end;gap:1rem;flex-wrap:wrap">
          <label class="field"><span>Send on (evening, 7:00 PM)</span><select name="day">${WEEKDAYS.map((n, i) => `<option value="${i}" ${a.reminderDay === i ? "selected" : ""}>${n}</option>`).join("")}</select></label>
          <label class="row small" style="gap:.4rem"><input type="checkbox" name="pause" ${a.pauseReminders ? "checked" : ""} /> Pause reminders</label>
        </form>
        <div class="small" style="margin:.75rem 0 .5rem">${a.pauseReminders ? "<b>Reminders paused.</b> Your openings will go stale after 14 days without a confirmation." : `Next reminder: <b>${fmtWhen(rAt)}</b>. If there is no response, a nudge follows <b>${fmtWhen(nudge)}</b>; after 3 missed weeks it escalates to the listing admin (mock).`}</div>
        <div class="email-preview" aria-label="Mock reminder email preview">
          <div class="ep-head"><span class="small muted">To: ${esc(dp.name.toLowerCase().replace(/[^a-z]+/g, "."))}@example.invalid</span><br><b>Subject: Still open the same as last week?</b></div>
          <div class="ep-body">
            <p>Hi ${esc(first(dp.name))}, here is what students see for you right now:</p>
            <ul>${upcoming.length ? upcoming.map((x) => `<li>${fmtDate(x.date)} · ${fmtTime(x.time)} · ${x.airport}${x.note ? " · " + esc(x.note) : ""}</li>`).join("") : "<li>Nothing open</li>"}</ul>
            <div class="row"><button type="button" class="btn good sm" data-action="avail-confirm">Yes, unchanged</button><button type="button" class="btn secondary sm" data-action="avail-scroll">Update</button><button type="button" class="btn ghost sm" data-action="avail-week" data-week="all" data-mode="close">Nothing open this week</button></div>
            <p class="small muted" style="margin-top:.75rem">Preview buttons act on this page only. Sent by Checkride Connect (fictional). Pause or change the day any time.</p>
          </div>
        </div>
      </section>
      <section class="card" style="margin-top:1rem">
        <h3 style="margin-top:0">Demo: simulate time passing</h3>
        <p class="muted small">Pretend your last confirmation was a while ago to see how students' view changes. Rules: 0 to 7 days normal, 8 to 14 days amber tag, over 14 days slots hidden.</p>
        <label class="field" style="max-width:320px"><span>My last confirmation was\u2026</span><select data-action-change="avail-age" id="avail-age">${[[0, "Just now"], [5, "5 days ago"], [10, "10 days ago"], [16, "16 days ago"]].map(([n, l]) => `<option value="${n}" ${n === fr.days ? "selected" : ""}>${l}</option>`).join("")}${[0, 5, 10, 16].includes(fr.days) ? "" : `<option value="${fr.days}" selected>${fr.days} days ago</option>`}</select></label>
      </section>
    </div>`;
  }

  // ---------- (d) flight-school cohort scheduling ----------
  const schoolBookings = () => S.bookings.filter((b) => b.school);
  const studentBooking = (st) => schoolBookings().filter((b) => b.applicant === st.name && (b.status === "requested" || b.status === "confirmed")).pop();
  const COHORT_AIRCRAFT = "Demo Flight Academy fleet (sample)";
  // Per-student readiness for cohort requests: same draft rules as the student request gate (readinessEval).
  // Answers are self-attested by the school in this browser. Defaults are fictional SAMPLE answers.
  const COHORT_PCT_MIN = 90;
  const monthsAgo = (n, day) => { const t = today0(); return iso(new Date(t.getFullYear(), t.getMonth() - n, day)); };
  const COHORT_SAMPLE = {
    "Ava Thompson": { h: { total: 52, dual: 21, solo: 12 }, kt: [23, 4] },
    "Liam Chen": { h: { xcpic: 52, inst: 44 }, kt: [14, 9] },
    "Mateo Silva": { h: { total: 47, dual: 24, solo: 12 }, kt: [9, 15] },
    "Noah Patel": { h: { total: 262, pic: 98 }, kt: [5, 20], iacra: false },
    "Emma Rossi": { h: {}, kt: [3, 1] },
  };
  function cohortAnswers(st) {
    S.cohortReady = S.cohortReady || {};
    if (S.cohortReady[st.name]) return S.cohortReady[st.name];
    const r = readyOf(st.cert), smp = Object.entries(COHORT_SAMPLE).find(([n]) => n.split(" ")[0] === first(st.name));
    const sm = smp ? smp[1] : { h: {}, kt: [6, 1] };
    return { end: r.end.map((_, i) => st.endorsed || i < r.end.length - 1), h: Object.fromEntries(r.hours.map(([k, , min]) => [k, sm.h[k] ?? Math.ceil(min * 1.2)])), ktPass: r.test, ktDate: r.test ? monthsAgo(sm.kt[0], sm.kt[1]) : "", iacra: sm.iacra !== false, sample: true };
  }
  const ktLimit = (st) => { const A = cohortAnswers(st); return readyOf(st.cert).test && A.ktDate ? ktExpiry(A.ktDate) : "9999-12-31"; };
  function cohortReadiness(st, slotDate) {
    const A = cohortAnswers(st);
    const res = readinessEval(st.cert, A, { slotDate, pct: st.readiness, pctMin: COHORT_PCT_MIN, who: first(st.name), iacra: true });
    return { ...res, answers: A, status: res.block.length ? "blocked" : res.warn.length ? "warn" : "ready" };
  }
  function cohortParams(q) {
    const from = q.from || addDays(1), to = q.to || addDays(30);
    const anyDpe = !q.dpe || q.dpe === "any" || !dpeById(q.dpe);
    const dp = anyDpe ? null : dpeById(q.dpe);
    const picked = (q.st || "").split(",").filter((x) => x !== "").map(Number).filter((i) => D.school.students[i]);
    const students = picked.map((i) => ({ ...D.school.students[i], i })).filter((st) => !studentBooking(st) && st.status !== "confirmed" && st.status !== "requested");
    return { from, to, dp, anyDpe, students, together: q.together !== "0", pick: q.pick || "" };
  }
  // A slot fits a student if the examiner lists the rating, the slot offers it, and it is on or before their knowledge-test expiry.
  const slotFits = (st, sl) => sl.certs.includes(st.cert) && !!(dpeById(sl.dpeId).fees[st.cert]) && sl.date <= ktLimit(st);
  // Matching inside one examiner-day: students with the fewest compatible slots go first.
  function matchDay(list, daySlots) {
    const used = new Set(), out = [];
    [...list].sort((x, y) => daySlots.filter((sl) => slotFits(x, sl)).length - daySlots.filter((sl) => slotFits(y, sl)).length || x.name.localeCompare(y.name)).forEach((st) => {
      const sl = daySlots.find((z) => !used.has(z.id) && slotFits(st, z));
      if (sl) { used.add(sl.id); out.push({ st, slot: sl }); }
    });
    return out;
  }
  const stAllIn = (st, dpId) => allIn(dpeById(dpId), st.cert, D.school.airport).total;
  const optKey = (o) => o.split ? "split" : `${o.dp.id}_${o.date}`;
  // Ranking rule (stated in the UI): 1) soonest date, 2) lowest total all-in cost, 3) examiner name A-Z.
  const rankCmp = (a, b) => a.date.localeCompare(b.date) || a.total - b.total || a.name.localeCompare(b.name);
  function planCohort(P) {
    const checks = P.students.map((st) => ({ st, ...cohortReadiness(st) }));
    const blocked = checks.filter((c) => c.status === "blocked");
    const eligible = checks.filter((c) => c.status !== "blocked").map((c) => c.st);
    const dpes = P.dp ? [P.dp] : allDpes();
    const ids = new Set(dpes.map((d) => d.id));
    const slots = openSlots({ before: P.to }).filter((x) => x.date >= P.from && ids.has(x.dpeId));
    const noFit = eligible.filter((st) => !slots.some((sl) => slotFits(st, sl)));
    const placeable = eligible.filter((st) => !noFit.includes(st));
    // Whole-cohort options: one examiner, one day, every placeable student fits.
    const groups = {}; slots.forEach((sl) => (groups[sl.dpeId + "_" + sl.date] = groups[sl.dpeId + "_" + sl.date] || []).push(sl));
    const options = [];
    let examinerDays = 0;
    if (placeable.length) Object.values(groups).forEach((g) => {
      examinerDays++;
      const m = matchDay(placeable, g);
      if (m.length !== placeable.length) return;
      const dp = dpeById(g[0].dpeId);
      options.push({ dp, name: dp.name, date: g[0].date, lastDate: g[0].date, assign: m.map((x) => ({ ...x, dp, date: x.slot.date })), total: m.reduce((s, x) => s + stAllIn(x.st, dp.id), 0), dpCount: 1 });
    });
    options.sort(rankCmp);
    // Split plan: most constrained student first; each takes the unused slot ranked by the same rule (date, then that student's all-in, then examiner name).
    let split = null;
    if (placeable.length) {
      const used = new Set(), assign = [];
      [...placeable].sort((x, y) => slots.filter((sl) => slotFits(x, sl)).length - slots.filter((sl) => slotFits(y, sl)).length || x.name.localeCompare(y.name)).forEach((st) => {
        const c = slots.filter((sl) => !used.has(sl.id) && slotFits(st, sl)).map((sl) => ({ sl, cost: stAllIn(st, sl.dpeId), nm: dpeById(sl.dpeId).name }))
          .sort((a, b) => a.sl.date.localeCompare(b.sl.date) || a.cost - b.cost || a.nm.localeCompare(b.nm) || a.sl.time.localeCompare(b.sl.time))[0];
        if (c) { used.add(c.sl.id); assign.push({ st, slot: c.sl, dp: dpeById(c.sl.dpeId), date: c.sl.date }); }
      });
      if (assign.length) {
        const dates = assign.map((x) => x.date).sort();
        split = { split: true, name: "Split", date: dates[0], lastDate: dates[dates.length - 1], assign, total: assign.reduce((s, x) => s + stAllIn(x.st, x.dp.id), 0), dpCount: new Set(assign.map((x) => x.dp.id)).size };
      }
    }
    let chosen = null, mode = "none";
    if (options.length && P.together && P.pick !== "split") { chosen = options.find((o) => optKey(o) === P.pick) || options[0]; mode = "whole"; }
    else if (split) { chosen = split; mode = "split"; }
    const assign = chosen ? [...chosen.assign].sort((x, y) => (x.slot.date + x.slot.time).localeCompare(y.slot.date + y.slot.time)) : [];
    const unplaced = placeable.filter((st) => !assign.some((x) => x.st.i === st.i));
    // Final per-student check against the assigned slot date (adds knowledge-test expiry warnings).
    const final = Object.fromEntries(assign.map((x) => [x.st.i, cohortReadiness(x.st, x.slot.date)]));
    return { checks, blocked, eligible, noFit, placeable, options, split, chosen, mode, assign, unplaced, final, examinerDays, dpeCount: dpes.length, slots };
  }
  const feeRow = (dp, st) => { const fee = dp.fees[st.cert], dep = depositFor(dp, st.cert); return { fee, dep, due: dep + BOOKING_FEE, allIn: stAllIn(st, dp.id) }; };
  const readyPill = (c) => c.status === "blocked" ? '<span class="pill bad">Blocked, not included</span>' : c.status === "warn" ? `<span class="pill warn">Ready, ${plural(c.warn.length, "warning")}</span>` : '<span class="pill good">Ready</span>';
  // DPE-facing readout of self-attested answers (student or school). Unverified.
  function selfCheckDetails(b) {
    const sc = b.selfCheck; if (!sc || !sc.answers) return "";
    const r = readyOf(b.cert), A = sc.answers;
    const items = [
      ...r.end.map((e, i) => `<li>${A.end[i] ? "Confirmed" : "Not confirmed"}: ${esc(e.replace(/ \(draft cite.*\)$/, ""))}</li>`),
      ...r.hours.map(([k, l, min]) => `<li>${esc(l)}: <b>${A.h[k] === "" || A.h[k] === undefined ? "not entered" : esc(String(A.h[k])) + " h"}</b> <span class="muted">(draft min ${min} h)</span></li>`),
      ...(r.test ? [`<li>Knowledge test: ${A.ktPass ? "passed" : "not marked passed"}${A.ktDate ? ` ${fmtDate(A.ktDate)}, result expires ${fmtDate(ktExpiry(A.ktDate))} (draft rule)` : ""}</li>`] : []),
      `<li>IACRA application started: ${A.iacra ? "yes" : "no"}</li>`,
    ].join("");
    const w = sc.warn || [];
    return `<details class="ready-answers small"><summary>Readiness answers, self-attested by ${sc.by === "school" ? "the school" : "the student"} (unverified)</summary>
      <ul>${items}</ul>${w.length ? `<b>Warnings shown at request time</b><ul class="warn-list">${w.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<p class="muted" style="margin:.25rem 0 0">No warnings at request time.</p>'}
      <p class="muted" style="margin:.25rem 0 0">Draft rules, not legal or FAA advice. Nothing here is verified; check the logbook and IACRA yourself.</p></details>`;
  }

  function viewCohort(q) {
    const sc = D.school;
    const P = cohortParams(q);
    const { dp, students } = P;
    const plan = planCohort(P);
    const qBase = { st: students.map((x) => x.i).join(","), dpe: P.anyDpe ? "any" : dp.id, from: P.from, to: P.to, together: P.together ? "" : "0" };
    const rosterRows = sc.students.map((st, i) => {
      const busy = !!studentBooking(st) || st.status === "confirmed" || st.status === "requested";
      const on = students.some((x) => x.i === i);
      const c = cohortReadiness({ ...st, i });
      const sub = busy ? "" : c.status === "blocked" ? `${plural(c.block.length, "readiness block")}` : c.status === "warn" ? plural(c.warn.length, "warning") : "self-attested ready";
      return `<label class="check-row ${busy ? "is-busy" : ""}"><input type="checkbox" name="st" value="${i}" ${on ? "checked" : ""} ${busy ? "disabled" : ""} />
        <span><b>${esc(st.name)}</b> <span class="pill">${esc(certById(st.cert).short)}</span> ${busy ? '<span class="pill warn">Already scheduled</span>' : ""}
        <span class="small muted" style="display:block">CFI ${esc(st.cfi)} · checklist ${st.readiness}%${sub ? " · " + sub : ""}</span></span></label>`;
    }).join("");
    const filters = `<form data-form="cohort" data-auto class="card stack">
      <h2 style="margin:0">1. Pick students <span class="muted small" style="font-weight:400">(mock roster)</span></h2>
      <div class="check-list">${rosterRows}</div>
      <h2 style="margin:.5rem 0 0">2. Examiner and window</h2>
      <div class="cohort-filters">
        <label class="field"><span>Examiner</span><select name="dpe"><option value="any" ${P.anyDpe ? "selected" : ""}>Any sample examiner (ranked)</option>${allDpes().map((d) => `<option value="${d.id}" ${dp && d.id === dp.id ? "selected" : ""}>${esc(d.name)} · ${d.home}</option>`).join("")}</select></label>
        <label class="field"><span>From</span><input type="date" name="from" value="${P.from}" /></label>
        <label class="field"><span>To</span><input type="date" name="to" value="${P.to}" /></label>
      </div>
      <label class="check-row small"><input type="checkbox" name="together" value="1" ${P.together ? "checked" : ""} /> <span><b>Keep the cohort together</b> (one examiner, one day) when an option fits everyone</span></label>
    </form>`;
    let result = "";
    if (!students.length) {
      result = `<section class="card empty"><p class="muted" style="margin:0">Select at least one student to see which openings fit.</p></section>`;
    } else {
      const readyRows = plan.checks.map((c) => {
        const fin = plan.final[c.st.i] || c;
        return `<tr data-st="${c.st.i}" class="ready-${c.status}"><td><b>${esc(c.st.name)}</b><div class="small muted">${esc(certById(c.st.cert).short)} · checklist ${c.st.readiness}%</div></td>
        <td>${readyPill(fin.block.length ? c : fin)}${c.answers.sample ? ' <span class="pill">SAMPLE answers</span>' : ""}</td>
        <td class="small">${c.block.length ? `<ul class="reasons bad-list">${c.block.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${fin.warn.length ? `<ul class="reasons warn-list">${fin.warn.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${!c.block.length && !fin.warn.length ? '<span class="muted">All draft checks confirmed (self-attested).</span>' : ""}</td>
        <td class="num"><button class="btn ghost sm" data-action="cohort-ready-edit" data-i="${c.st.i}" aria-label="${c.block.length ? "Fix answers" : "Edit answers"} for ${esc(c.st.name)}">${c.block.length ? "Fix answers" : "Edit answers"}</button></td></tr>`;
      }).join("");
      const readySec = `<section class="card stack" id="cohort-ready">
        <h2 style="margin:0">Readiness check per student <span class="pill warn" style="vertical-align:middle">Self-attested</span></h2>
        <p class="small muted" style="margin:0">Same draft checks as a student request: endorsements, logbook hours, knowledge test (24-calendar-month draft rule), plus IACRA started. Cohort requests also warn below ${COHORT_PCT_MIN}% checklist. Unverified draft, not legal or FAA advice. Blocked students are left out of matching; fix their answers or proceed with the eligible students.</p>
        <div class="table-wrap"><table class="ready-table"><thead><tr><th>Student</th><th>Status</th><th>Reasons and warnings</th><th></th></tr></thead><tbody>${readyRows}</tbody></table></div>
        <p class="small" id="cohort-eligible" style="margin:0"><b>${plan.eligible.length} of ${students.length}</b> eligible.${plan.blocked.length ? ` Not included: ${plan.blocked.map((c) => esc(c.st.name)).join(", ")}.` : ""}</p>
      </section>`;
      const rule = `<p class="rank-rule small" id="cohort-rule"><b>How options are ranked:</b> 1) soonest date that fits, 2) lowest total all-in cost for the group (examiner fee + ${money(BOOKING_FEE)} booking fee + example aircraft and travel estimates from ${esc(sc.airport)}), 3) examiner name A–Z. ${P.together ? "With <b>Keep the cohort together</b> on, one-examiner, one-day options win when any fit everyone; otherwise" : "With <b>Keep the cohort together</b> off,"} each student is placed by the same rule, most constrained student first, and can be split across examiners and days. Example numbers, not quotes.</p>`;
      const where = P.anyDpe ? `${plural(plan.dpeCount, "sample examiner")}` : esc(dp.name);
      let head;
      if (!plan.eligible.length) head = `<div class="fit-head bad"><b>No eligible students.</b> Every selected student is blocked by the readiness check. Fix their answers above.</div>`;
      else if (plan.mode === "whole") head = `<div class="fit-head good"><b>Whole cohort fits on ${fmtDate(plan.chosen.date, { weekday: "long", month: "long", day: "numeric" })} with ${esc(plan.chosen.dp.name)}.</b> ${plural(plan.assign.length, "student")}, total all-in ${money(plan.chosen.total)} (example). ${optKey(plan.chosen) === optKey(plan.options[0]) ? "Ranked #1." : "Your pick, not the top-ranked option."}</div>`;
      else if (plan.mode === "split") head = `<div class="fit-head warn"><b>${plan.options.length ? "Split chosen." : `No single examiner-day fits all ${plan.placeable.length}.`}</b> Best-fit split: ${plural(plan.split.dpCount, "examiner")}, ${plural(new Set(plan.assign.map((x) => x.date)).size, "day")}, ${plan.assign.length} of ${plan.eligible.length} eligible students placed, total all-in ${money(plan.split.total)} (example).${plan.unplaced.length ? ` ${plural(plan.unplaced.length, "student")} can\u2019t be placed (${plan.unplaced.map((x) => esc(x.name)).join(", ")}).` : ""}</div>`;
      else head = `<div class="fit-head bad"><b>No open slots fit.</b> Nothing open for the eligible students with ${where} in ${fmtDate(P.from)} to ${fmtDate(P.to)}${dp && isStale(dp.id) ? ` (${esc(dp.name)}\u2019s availability is not recently confirmed)` : ""}. Try another examiner or a wider window.</div>`;
      const warnList = [];
      plan.noFit.forEach((st) => warnList.push(`${esc(st.name)}: no open slot for ${esc(certById(st.cert).name)} with ${where} before ${fmtDate(P.to < ktLimit(st) ? P.to : ktLimit(st))}${ktLimit(st) < P.to ? " (knowledge-test expiry)" : ""}`));
      // Alternatives considered (ranked).
      const best = plan.chosen;
      const alts = [...plan.options.slice(0, 6)];
      const altRows = alts.map((o, n) => ({ o, rank: n + 1 }));
      if (plan.split && (!plan.options.length || plan.split.dpCount > 1 || plan.split.date !== plan.split.lastDate)) altRows.push({ o: plan.split, rank: null });
      const altTable = altRows.length ? `<div class="table-wrap"><table class="cohort-alts" id="cohort-alts"><caption class="small muted" style="text-align:left;padding:.4rem 0">Alternatives considered: ${plural(plan.options.length, "whole-cohort option")} out of ${plural(plan.examinerDays, "examiner-day")} with openings${plan.options.length > 6 ? ", top 6 shown" : ""}${altRows.some((x) => x.o.split) ? ", plus the per-student split" : ""}</caption>
        <thead><tr><th>Rank</th><th>Option</th><th>Dates</th><th class="num">Students</th><th class="num">Total all-in</th><th class="num">vs. selected</th><th></th></tr></thead><tbody>${altRows.map(({ o, rank }) => {
          const isSel = best && optKey(o) === optKey(best);
          const d = best ? o.total - best.total : 0;
          const label = o.split ? `Split across ${plural(o.dpCount, "examiner")}` : `${esc(o.dp.name)} · ${o.dp.home}`;
          const link = `#/school/cohort?${toQuery({ ...qBase, together: o.split ? qBase.together : "", pick: o.split ? "split" : optKey(o) })}`;
          return `<tr class="${isSel ? "sel" : ""}" data-opt="${optKey(o)}"><td>${rank ? "#" + rank : "Split"}</td><td>${label}</td><td class="small">${o.date === o.lastDate ? fmtDate(o.date, { weekday: "short", month: "short", day: "numeric" }) : `${fmtDate(o.date, { month: "short", day: "numeric" })} to ${fmtDate(o.lastDate, { month: "short", day: "numeric" })}`}</td><td class="num">${o.assign.length} of ${plan.eligible.length}</td><td class="num">${money(o.total)}</td><td class="num">${isSel ? "—" : (d > 0 ? "+" : d < 0 ? "−" : "±") + money(Math.abs(d))}</td>
            <td class="num">${isSel ? '<span class="small">Selected</span>' : `<a class="btn ghost sm" href="${link}">Use this</a>`}</td></tr>`;
        }).join("")}</tbody></table></div>` : "";
      const hint = dp ? `<p class="small muted" style="margin:.5rem 0 0">Need more room on one day? ${esc(first(dp.name))} can raise capacity on their <b>Update my openings</b> page (switch to DPE view, <a href="#/dpe-openings" data-action="as-dpe" data-dpe="${dp.id}" data-to="#/dpe-openings">open it as ${esc(first(dp.name))}</a>).</p>` : "";
      let fees = "";
      if (plan.assign.length) {
        const rows = plan.assign.map((x) => ({ ...x, ...feeRow(x.dp, x.st), chk: plan.final[x.st.i] }));
        const tot = rows.reduce((o, r) => ({ fee: o.fee + r.fee, dep: o.dep + r.dep, due: o.due + r.due, allIn: o.allIn + r.allIn }), { fee: 0, dep: 0, due: 0, allIn: 0 });
        fees = `<section class="card" id="cohort-fees">
          <h2>3. Proposed requests <span class="pill warn" style="vertical-align:middle">Mock</span></h2>
          <div class="table-wrap"><table><thead><tr><th>Student</th><th>Examiner and slot</th><th class="num">Examiner fee</th><th class="num">Deposit (ASSUMPTION)</th><th class="num">Booking fee</th><th class="num">Due if approved</th><th class="num">All-in (example)</th></tr></thead>
          <tbody>${rows.map((r) => `<tr><td><b>${esc(r.st.name)}</b><div class="small muted">${esc(certById(r.st.cert).short)}${r.chk.warn.length ? ` · ${plural(r.chk.warn.length, "warning")}` : ""}</div></td><td class="small">${esc(r.dp.name)}<div>${fmtDate(r.slot.date)} · ${fmtTime(r.slot.time)} · ${r.slot.airport}</div></td><td class="num">${money(r.fee)}</td><td class="num">${money(r.dep)}</td><td class="num">${money(BOOKING_FEE)}</td><td class="num"><b>${money(r.due)}</b></td><td class="num">${money(r.allIn)}</td></tr>`).join("")}</tbody>
          <tfoot><tr><td colspan="2"><b>Totals for ${plural(rows.length, "student")}</b></td><td class="num">${money(tot.fee)}</td><td class="num">${money(tot.dep)}</td><td class="num">${money(BOOKING_FEE * rows.length)} <span class="small muted">(${money(BOOKING_FEE)} × ${rows.length})</span></td><td class="num"><b id="cohort-total">${money(tot.due)}</b></td><td class="num" id="cohort-allin">${money(tot.allIn)}</td></tr></tfoot></table></div>
          <div class="summary small" style="margin-top:.75rem">
            <div class="line"><span>Examiner fees, due at the test (deposits are credited toward these)</span><b>${money(tot.fee)}</b></div>
            <div class="line"><span>Deposits, <b>ASSUMPTION</b>, due if each request is approved</span><b>${money(tot.dep)}</b></div>
            <div class="line"><span>Student booking fees, ${money(BOOKING_FEE)} per student</span><b>${money(BOOKING_FEE * rows.length)}</b></div>
            <div class="line" style="border-top:1px solid var(--border-strong);margin-top:.3rem;padding-top:.5rem"><span><b>Total due if all are approved</b></span><b>${money(tot.due)}</b></div>
            <div class="line muted"><span>Actually charged in this prototype</span><b id="cohort-charged">$0</b></div>
          </div>
          <div class="warn-note small" style="margin:.75rem 0"><b>ASSUMPTION, not a policy:</b> the deposit is about 20% of the examiner fee, rounded to $25, minimum $100, and is part of the fee, not an extra. Real deposit rules are set by each examiner. All-in adds example aircraft and travel estimates used only for ranking.</div>
          ${plan.blocked.length ? `<p class="small" style="margin:0 0 .5rem">Proceeding with the eligible students only. Not included: ${plan.blocked.map((c) => esc(c.st.name)).join(", ")}.</p>` : ""}
          <button class="btn" data-action="cohort-create" id="cohort-create">Create ${plural(rows.length, "mock request")}</button>
          <span class="small muted" style="margin-left:.5rem">Creates requests in this browser only. Each examiner sees the readiness answers. Nothing is sent or charged.</span>
        </section>`;
      }
      result = `${readySec}<section class="card stack" id="cohort-result"><h2 style="margin:0">Fit for ${plural(plan.eligible.length, "eligible student")} with ${P.anyDpe ? "any sample examiner" : esc(dp.name)}</h2>${head}${rule}
        ${warnList.length ? `<ul class="small cohort-warn">${warnList.map((w) => `<li>${w}</li>`).join("")}</ul>` : ""}
        ${plan.mode === "split" ? `<ul class="small split-list">${[...new Set(plan.assign.map((x) => x.date))].map((dt) => `<li><b>${fmtDate(dt)}</b>: ${plan.assign.filter((x) => x.date === dt).map((x) => `${esc(x.st.name)} with ${esc(x.dp.name)} (${fmtTime(x.slot.time)})`).join(", ")}</li>`).join("")}</ul>` : ""}
        ${altTable}${hint}</section>${fees}`;
    }
    const reqs = schoolBookings().slice().reverse();
    const reqSec = `<section class="card" id="cohort-requests"><h2>Cohort requests <span class="muted small" style="font-weight:400">(this browser, mock)</span></h2>
      ${reqs.length ? reqs.map((b) => { const sl = S.slots.find((x) => x.id === b.slotId); const d2 = dpeById(b.dpeId); return `<div class="slot-row"><div style="flex:1;min-width:200px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).short)} ${statusPill(b.status)}<div class="small">${esc(d2.name)} · ${fmtDate(sl.date)} · ${fmtTime(sl.time)} · ${sl.airport}</div><div class="small muted">Due if approved ${money(b.depositUsd + b.bookingFeeUsd)} · actually charged $0${b.selfCheck && b.selfCheck.warn && b.selfCheck.warn.length ? ` · ${plural(b.selfCheck.warn.length, "readiness warning")}` : ""}</div></div>
        <div class="row">${b.status === "requested" ? `<button class="btn secondary sm" data-action="as-dpe" data-dpe="${d2.id}">Respond as ${esc(first(d2.name))} (demo)</button>` : ""}${b.status === "requested" || b.status === "confirmed" ? `<button class="btn bad sm" data-action="pilot-cancel" data-id="${b.id}">Cancel</button>` : ""}</div></div>`; }).join("") : `<p class="muted small" style="margin:0">No cohort requests yet.</p>`}
    </section>`;
    return `<div class="page cohort-page">
      <div class="page-head"><p style="margin:0"><a href="#/school">← Roster</a></p><h1 style="margin:0">Cohort scheduling</h1><p class="muted" style="margin:0">${esc(sc.name)} · check each student\u2019s readiness, then find ranked openings for the group</p></div>
      <div class="stack">${filters}${result}${reqSec}</div>
    </div>`;
  }
  function openCohortReady(i) {
    const st = D.school.students[i], A = cohortAnswers(st);
    openModal(`<h2>Readiness answers: ${esc(st.name)}</h2>
      <p class="muted small" style="margin-bottom:.75rem">${esc(certById(st.cert).name)} · CFI ${esc(st.cfi)} · checklist ${st.readiness}%. Entered by the school, self-attested, nothing verified.</p>
      <form class="stack" data-form="cohort-ready" data-i="${i}" data-pct="${st.readiness}" data-who="${esc(first(st.name))}">
        <input type="hidden" name="cert" value="${st.cert}" />
        ${readinessFields(st.cert)}
        <label class="check-row small"><input type="checkbox" name="iacra" /> <span>IACRA application started for this student</span></label>
        <div class="row"><button class="btn" type="submit">Save answers</button><button class="btn ghost" type="button" data-action="close-modal">Cancel</button></div>
      </form>`);
    const f = $("#modal-root form[data-form=cohort-ready]");
    f.querySelectorAll(".ready-check > div.small").forEach((el) => { if (el.textContent === "Endorsements in your logbook") el.textContent = "Endorsements in the student\u2019s logbook"; });
    if (f["kt-pass"]) f["kt-pass"].nextElementSibling.textContent = "Student passed the knowledge test";
    readyOf(st.cert).end.forEach((_, n) => { f["end-" + n].checked = !!A.end[n]; });
    readyOf(st.cert).hours.forEach(([k]) => { f["h-" + k].value = A.h[k] ?? ""; });
    if (f["kt-pass"]) f["kt-pass"].checked = !!A.ktPass;
    if (f["kt-date"]) f["kt-date"].value = A.ktDate || "";
    f.iacra.checked = !!A.iacra;
    showGate(f);
  }

  function viewSchool() {
    const sc = D.school;
    const st = sc.students;
    const tier = TIERS.find((t) => t.id === S.tier) || TIERS[0];
    const ready = st.filter((s) => s.readiness >= 90 && s.endorsed).length;
    const scheduled = st.filter((s) => studentBooking(s) || s.status === "confirmed" || s.status === "requested").length;
    const status = (s) => {
      const sb = studentBooking(s);
      if (sb) { const sl = S.slots.find((x) => x.id === sb.slotId); return `${statusPill(sb.status)} <span class="small">${fmtDate(sl.date)} · ${esc(dpeById(sb.dpeId).name)}</span>`; }
      if (s.status === "confirmed") return `<span class="pill good">Approved</span> <span class="small">${fmtDate(addDays(s.daysOut))} · ${esc(dpeById(s.dpe).name)}</span>`;
      if (s.status === "requested") return `<span class="pill warn">Requested</span> <span class="small">${fmtDate(addDays(s.daysOut))} · ${esc(dpeById(s.dpe).name)}</span>`;
      if (s.status === "alert") return `<span class="pill accent">Mock alert active</span>`;
      return `<span class="muted small">Not scheduled</span>`;
    };
    return `<div class="page">
      <div class="page-head row spread">
        <div><h1 style="margin:0">${esc(sc.name)}</h1><p class="muted" style="margin:0">${sc.airport} · fictional school · <span class="pill accent">${esc(tier.name)} plan (mock, proposed pricing)</span></p></div>
        <div class="row"><a class="btn" href="#/school/cohort">Schedule a cohort</a><button class="btn secondary" data-action="school-invite">+ Add student</button></div>
      </div>
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(st.length, "Students in training (sample)")}
        ${statCard(ready, "Checkride-ready (≥ 90% + endorsed)")}
        ${statCard(scheduled, "Requested or approved checkrides")}
        ${statCard(Math.round(median(st.map((s) => s.readiness))) + "%", "Median readiness")}
      </section>
      <section class="card" style="margin-bottom:1rem">
        <h2>School plans <span class="pill warn" style="vertical-align:middle">Proposed pricing</span></h2>
        <p class="muted small">Proposed pricing, not final. DPEs list for free and students pay a ${money(BOOKING_FEE)} booking fee unless a Pro or Academy school chooses to pay. Choosing a plan here is a mock: no payment, no sign-up, no message is sent.</p>
        <div class="grid g3">${TIERS.map((t) => `<div class="card plan ${t.id === S.tier ? "featured" : ""}" style="box-shadow:none">
          <h3>${t.name} ${t.id === S.tier ? '<span class="pill good">Selected (mock)</span>' : ""}</h3><div class="p">${t.price}${t.unit ? `<span class="muted small" style="font-weight:400"> ${esc(t.unit)}</span>` : ""}</div>
          <p class="small muted" style="margin:0">${esc(t.seats)}</p>
          <ul class="small">${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          <button class="btn ${t.id === S.tier ? "ghost" : "secondary"}" data-action="pick-tier" data-tier="${t.id}">${t.id === S.tier ? "Selected" : "Select (mock)"}</button>
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
          <td class="num"><div class="row" style="justify-content:flex-end;flex-wrap:nowrap">${s.status === "none" && !studentBooking(s) ? `<a class="btn sm" href="#/search?cert=${s.cert}&near=${sc.airport}">Find slot</a>` : ""}<a class="btn ghost sm" href="#/checklists/${s.cert}">Checklist</a></div></td>
        </tr>`).join("")}</tbody>
      </table></div></section>
      <p class="muted small" style="margin-top:1rem">Planned for school tiers (not built): shared alerts for the roster, and one view of checklist progress.</p>
    </div>`;
  }

  function viewAdmin() {
    const pending = S.pending.filter((p) => p.status === "pending");
    const reviewed = S.pending.filter((p) => p.status !== "pending");
    const confirmed = S.bookings.filter((b) => b.status === "confirmed").length;
    const card = (p) => `<div class="card">
      <div class="row spread"><div class="row" style="gap:.75rem"><div class="avatar">${initials(p.name)}</div><div><b>${esc(p.name)}</b><div class="muted small">${p.home} · ${esc(apt(p.home).city)} · submitted ${p.submittedDaysAgo} day${p.submittedDaysAgo === 1 ? "" : "s"} ago</div></div></div>
      <span class="pill">Fictional locator lookup: ${p.locatorMatch ? "name found" : "name not found"}</span></div>
      <div class="grid g3 small" style="margin:.8rem 0">
        <div><div class="muted">Sample designee number</div><b>${esc(p.designee)}</b></div>
        <div><div class="muted">Managing office</div><b>${esc(p.fsdo)}</b></div>
        <div><div class="muted">Authorizations requested</div>${p.certs.map((c) => `<span class="pill">${esc(certById(c).short)}</span>`).join(" ")}</div>
      </div>
      <p class="small muted">${esc(p.note)}</p>
      <div class="row"><button class="btn good sm" data-action="approve" data-id="${p.id}">List in directory (mock)</button><button class="btn secondary sm" data-action="info" data-id="${p.id}">Request info</button><button class="btn bad sm" data-action="reject" data-id="${p.id}">Reject</button></div>
    </div>`;
    return `<div class="page">
      <div class="page-head"><h1>Admin <span class="pill warn" style="vertical-align:middle">Mock</span></h1><p class="muted">A sketch of how a team might review examiner applications and watch marketplace numbers. All applications and figures are fictional; nothing is verified against any FAA source. Listing an examiner here is a marketplace decision only and says nothing about their FAA designation.</p></div>
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(allDpes().length, "Sample examiners listed")}
        ${statCard(pending.length, "Sample applications to review")}
        ${statCard(openSlots().length, "Open slots")}
        ${statCard(S.bookings.filter((b) => b.status === "requested").length, "Requests awaiting examiners")}
        ${statCard(money(confirmed * BOOKING_FEE), `Mock booking fees (${confirmed} × ${money(BOOKING_FEE)}), not collected`)}
        ${statCard(S.alerts.length, "Mock alerts (demo user)")}
        ${statCard(money(TIER_PRICE[S.tier] || 0), "School plan MRR (proposed pricing, 1 sample school)")}
      </section>
      <h2>Sample application queue</h2>
      <div class="stack">${pending.length ? pending.map(card).join("") : `<div class="card empty">Queue is clear.</div>`}</div>
      ${reviewed.length ? `<h2 style="margin-top:1.5rem">Recently reviewed</h2><div class="card">${reviewed.map((p) => `<div class="slot-row"><span><b>${esc(p.name)}</b> <span class="muted small">${esc(p.designee)}</span></span>${p.status === "approved" ? '<span class="pill">Listed (mock)</span>' : p.status === "info" ? '<span class="pill warn">Info requested</span>' : '<span class="pill bad">Rejected</span>'}</div>`).join("")}</div>` : ""}
    </div>`;
  }

  function viewPricing() {
    return `<div class="page">
      <div class="page-head" style="text-align:center;max-width:700px;margin-inline:auto">
        <h1>Prototype pricing model <span class="pill warn" style="vertical-align:middle">Proposed pricing</span></h1>
        <p class="muted">Free for examiners, a ${money(BOOKING_FEE)} booking fee for students, and proposed plans for flight schools. Nothing is charged in this prototype.</p>
      </div>
      <section class="grid g4">
        <div class="card plan"><h3>Examiners · Free</h3><div class="p">$0</div><ul class="small">
          <li>Sample profile and calendar</li><li>Booking requests: approve or decline</li><li>Curated checklists for approved students</li></ul>
          <a class="btn secondary" href="#" data-action="set-role" data-role="dpe">See the DPE view</a></div>
        <div class="card plan"><h3>Students · booking fee</h3><div class="p">${money(BOOKING_FEE)}<span class="muted small" style="font-weight:400"> / booking</span></div><ul class="small">
          <li>Search, fee comparison and checklists are free</li><li>Plus the examiner deposit, credited toward the examiner's fee</li><li>Shown in the mock booking flow, never charged</li></ul>
          <a class="btn secondary" href="#/search">Try a mock request</a></div>
        <div class="card plan"><h3>Flight schools · proposed plans</h3><div class="p">$0 <span class="muted small" style="font-weight:400">to</span> $299<span class="muted small" style="font-weight:400"> / mo</span></div><ul class="small" id="pricing-tiers">
          ${TIERS.map((t) => `<li><b>${esc(t.name)}</b> ${t.price}${t.unit ? " " + esc(t.unit) : ""}</li>`).join("")}<li>Proposed pricing, not final. Selecting one is a mock.</li></ul>
          <a class="btn secondary" href="#" data-action="set-role" data-role="school">See the school view</a></div>
      </section>
      <section class="grid g2" style="margin-top:1rem">
        <div class="card"><h3>Why a flat student fee?</h3><p class="muted small" style="margin:0">It stays the same whichever examiner you choose and is not a percentage of the examiner's fee. Whether any booking fee is permitted alongside designee rules still needs confirming with the FAA or FSDO before launch.</p></div>
        <div class="card"><h3>Open questions</h3><p class="muted small" style="margin:0">Real examiner data sources, payment handling, deposit refund rules and checklist review by a CFI or DPE are all undecided and listed in the project plan.</p></div>
      </section>
    </div>`;
  }

  // ---------- router ----------
  const routes = [
    [/^\/$/, viewHome], [/^\/search$/, viewSearch], [/^\/dpe\/(\w+)$/, viewProfile], [/^\/compare$/, viewCompare],
    [/^\/alerts$/, viewAlerts], [/^\/checklists(?:\/(\w+))?$/, viewChecklists], [/^\/bookings$/, viewBookings], [/^\/my-checklists$/, viewMyChecklists], [/^\/dpe-checklist\/(\w+)$/, viewBuilder],
    [/^\/dpe-dashboard$/, viewDpeDash], [/^\/school$/, viewSchool], [/^\/school\/cohort$/, viewCohort], [/^\/dpe-openings$/, viewOpenings], [/^\/admin$/, viewAdmin], [/^\/pricing$/, viewPricing],
  ];
  const NAV = () => ({
    pilot: [["#/", "Home"], ["#/search", "Search"], ["#/compare", "Compare fees"], ["#/alerts", "Alerts"], ["#/checklists", "Checklists"], ["#/bookings", "My bookings"], ["#/my-checklists", "My checklists"], ["#/pricing", "Pricing"]],
    dpe: [["#/dpe-dashboard", "Dashboard"], ["#/dpe-openings", "My openings"], ["#/dpe/" + S.actingDpe, "My public profile"], ["#/pricing", "Pricing"]],
    school: [["#/school", "Roster"], ["#/school/cohort", "Cohort scheduling"], ["#/search", "Search"], ["#/compare", "Compare fees"], ["#/checklists", "Checklists"], ["#/pricing", "Pricing"]],
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
    a11yFix($("#app"));
    if (!/^\/dpe\/[^/]+$/.test(path)) ui.profileKey = null;
    const navItems = NAV();
    const bestNav = navItems.map(([h]) => h.slice(1)).filter((p) => p !== "/" && (path === p || path.startsWith(p + "/"))).sort((x, y) => y.length - x.length)[0];
    $("#nav").innerHTML = navItems.map(([href, label]) => {
      const p = href.slice(1);
      const active = p === "/" ? path === "/" : p === bestNav;
      return `<a href="${href}" class="${active ? "active" : ""}">${label}</a>`;
    }).join("");
    $("#role-select").value = S.role;
    const unread = S.notifications.filter((n) => !n.read).length;
    $("#bell").hidden = S.role !== "pilot";
    $("#bell-count").hidden = !unread;
    $("#bell-count").textContent = unread; $("#bell").setAttribute("aria-label", unread ? `Notifications, ${unread} unread` : "Notifications");
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

  // ---------- (f) readiness gate: self-attested, UNVERIFIED DRAFT minimums (not legal or FAA advice) ----------
  const END_KT = "Knowledge-test endorsement (draft cite 61.35)";
  const END_PT = "Practical-test endorsement, training within the preceding 2 calendar months (draft cite 61.39)";
  const READY = {
    ppl: { hours: [["total", "Total flight time", 40, "61.109(a)"], ["dual", "Dual instruction received", 20, "61.109(a)(1)"], ["solo", "Solo flight time", 10, "61.109(a)(2)"]], test: true, end: [END_KT, END_PT] },
    sport: { hours: [["total", "Total flight time", 20, "61.313(a)"], ["dual", "Dual instruction received", 15, "61.313(a)(1)"], ["solo", "Solo flight time", 5, "61.313(a)(2)"]], test: true, end: [END_KT, END_PT] },
    ir: { hours: [["xcpic", "Cross-country time as PIC", 50, "61.65(d)(1)"], ["inst", "Actual or simulated instrument time", 40, "61.65(d)(2)"]], test: true, end: [END_KT, END_PT] },
    cpl: { hours: [["total", "Total flight time", 250, "61.129(a)"], ["pic", "Pilot-in-command time", 100, "61.129(a)(2)"]], test: true, end: [END_KT, END_PT] },
    me: { hours: [], test: false, end: ["Multi-engine training and practical-test endorsement (draft cite 61.63(c))"] },
    cfi: { hours: [], test: true, end: ["Fundamentals of instructing and knowledge endorsements (draft cite 61.183)", "Flight-proficiency endorsement (draft cite 61.187)", "Spin-training endorsement (draft cite 61.183(i))"] },
    cfii: { hours: [], test: true, end: ["Instrument instructor practical-test endorsement (draft cite 61.183, 61.187)"] },
    mei: { hours: [["mepic", "Multi-engine pilot-in-command time", 15, "61.195(b)"]], test: false, end: ["Multi-engine instructor practical-test endorsement (draft cite 61.187)"] },
  };
  const readyOf = (cert) => READY[cert] || { hours: [], test: true, end: [END_PT] };
  // Knowledge test results: draft rule of 24 calendar months (expires at the end of the 24th month after the test month).
  const ktExpiry = (date) => { const d = parseIso(date); return iso(new Date(d.getFullYear(), d.getMonth() + 25, 0)); };
  function readinessFields(cert) {
    const r = readyOf(cert);
    return `<fieldset class="ready-check" id="req-check">
      <legend>Readiness check <span class="pill warn">Self-attested</span></legend>
      <p class="small muted" style="margin:0 0 .5rem">Unverified draft, not legal or FAA advice. Minimums below are draft Part 61 figures that have not been checked. Your instructor and the examiner decide eligibility; this prototype verifies nothing.</p>
      <div class="small" style="font-weight:700">Endorsements in your logbook</div>
      ${r.end.map((e, i) => `<label class="check-row small"><input type="checkbox" name="end-${i}" /> <span>${esc(e)}</span></label>`).join("")}
      ${r.hours.length ? `<div class="small" style="font-weight:700;margin-top:.4rem">Logbook hours</div><div class="grid g2 ready-hours">${r.hours.map(([k, l, min, cite]) => `<label class="field"><span>${esc(l)} <span class="muted">(draft min ${min} h, ${cite})</span></span><input type="number" name="h-${k}" min="0" max="20000" step="0.1" inputmode="decimal" /></label>`).join("")}</div>` : `<p class="small muted" style="margin:.4rem 0 0">No hour minimum in this draft for ${esc(certById(cert).short)}; check with your instructor.</p>`}
      ${r.test ? `<div class="small" style="font-weight:700;margin-top:.4rem">Knowledge test</div>
      <label class="check-row small"><input type="checkbox" name="kt-pass" /> <span>I passed the knowledge test</span></label>
      <label class="field"><span>Knowledge test date</span><input type="date" name="kt-date" max="${iso(today0())}" /></label>` : `<p class="small muted" style="margin:.4rem 0 0">No knowledge test in this draft for ${esc(certById(cert).short)}.</p>`}
      <div id="req-gate" class="gate small" role="status" aria-live="polite"></div>
    </fieldset>`;
  }
  // Answers object: { end: [bool], h: { key: value }, ktPass, ktDate, iacra }. Same rules for students and cohort requests.
  function answersFromForm(form) {
    const r = readyOf(form.cert.value), fd = new FormData(form);
    return { end: r.end.map((_, i) => !!fd.get("end-" + i)), h: Object.fromEntries(r.hours.map(([k]) => [k, fd.get("h-" + k) ?? ""])), ktPass: !!fd.get("kt-pass"), ktDate: fd.get("kt-date") || "", iacra: !!fd.get("iacra") };
  }
  // opts: { slotDate, pct, pctMin, who, iacra } (iacra: true = include the IACRA item in the result)
  function readinessEval(cert, A, opts = {}) {
    const r = readyOf(cert), block = [], warn = [];
    r.end.forEach((e, i) => { if (!A.end[i]) block.push(`Endorsement not confirmed: ${e.replace(/ \(draft cite.*\)$/, "")}`); });
    r.hours.forEach(([k, l, min]) => {
      const v = A.h[k];
      if (v === undefined || v === null || v === "") block.push(`${l}: enter ${opts.who ? "logbook" : "your logbook"} hours`);
      else if (+v < min) block.push(`${l}: ${+v} h is below the draft minimum of ${min} h`);
      else if (+v < min * 1.1) warn.push(`${l}: ${+v} h is close to the draft minimum of ${min} h. Double-check ${opts.who ? "the" : "your"} logbook.`);
    });
    if (r.test) {
      const d = A.ktDate, sd = opts.slotDate;
      if (!A.ktPass) block.push("Knowledge test: not marked as passed");
      if (!d) block.push(`Knowledge test: enter the date ${opts.who ? "it was" : "you"} passed`);
      else if (d > iso(today0())) block.push("Knowledge test: the date is in the future");
      else if (sd && ktExpiry(d) < sd) block.push(`Knowledge test: result from ${fmtDate(d)} expires ${fmtDate(ktExpiry(d))} (draft 24-calendar-month rule), before this checkride`);
      else if (!sd && ktExpiry(d) < iso(today0())) block.push(`Knowledge test: result from ${fmtDate(d)} expired ${fmtDate(ktExpiry(d))} (draft 24-calendar-month rule)`);
      else if (sd && daysUntil(ktExpiry(d)) - daysUntil(sd) < 60) warn.push(`Knowledge test result expires ${fmtDate(ktExpiry(d))}, soon after this checkride. A reschedule could push ${opts.who ? "the student" : "you"} past it.`);
    }
    if (opts.iacra && !A.iacra) block.push("IACRA application: not confirmed as started");
    if (opts.pct !== undefined && opts.pct < (opts.pctMin || 50)) warn.push(`${opts.who ? opts.who + "\u2019s" : "Your"} ${certById(cert).short} checklist is ${opts.pct}% complete.`);
    return { block, warn };
  }
  function readinessIssues(form) {
    const cert = form.cert.value;
    if (form.dataset.form === "cohort-ready") return readinessEval(cert, answersFromForm(form), { pct: +form.dataset.pct, pctMin: 90, who: form.dataset.who, iacra: true });
    const s = S.slots.find((x) => x.id === form.slot.value);
    return readinessEval(cert, answersFromForm(form), { slotDate: s && s.date, pct: checklistPct(cert) });
  }
  function showGate(form, submitted) {
    const g = $("#req-gate"); if (!g) return { block: [] };
    if (submitted) form.dataset.tried = "1";
    submitted = submitted || form.dataset.tried === "1";
    const res = readinessIssues(form);
    const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
    g.className = "gate small " + (res.block.length ? (submitted ? "bad" : "pending") : res.warn.length ? "warn" : "good");
    g.innerHTML = res.block.length
      ? `<b>${submitted ? "Can't submit yet" : "Still to confirm"} (${res.block.length})</b><ul>${li(res.block)}</ul>${res.warn.length ? `<b>Warnings</b><ul>${li(res.warn)}</ul>` : ""}`
      : res.warn.length ? `<b>Ready to submit, with warnings</b><ul>${li(res.warn)}</ul>` : `<b>All draft checks confirmed.</b> Self-attested only, nothing is verified.`;
    return res;
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
        ${readinessFields(cert)}
        <label class="check-row small"><input type="checkbox" name="iacra" required /> <span>My IACRA application is started, and my instructor will sign the recommendation before the checkride.</span></label>
        <div class="small" id="req-ready">Your <a href="#/checklists/${cert}" data-action="close-modal">${esc(certById(cert).short)} checklist</a> is <b>${checklistPct(cert)}%</b> complete. The examiner will see this.</div>
        <div class="summary small" id="req-summary">${requestSummary(dp, cert)}</div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn" type="submit">Submit mock request</button></div>
      </form>`);  showGate($("#modal-root form[data-form=request]"));
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
    "as-dpe": (el) => { S.role = "dpe"; S.actingDpe = el.dataset.dpe; go(el.dataset.to || "#/dpe-dashboard"); },
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
    "sample-location": (el) => {
      // Mock "use my location": no geolocation API, no network. Cycles through a few sample airports.
      const picks = ["KORL", "KTPA", "KDAB", "KFXE", "KGNV", "KFMY", "KMLB", "KJAX", "KPNS", "KSRQ"].filter((id) => apt(id));
      ui.locIdx = ((ui.locIdx ?? -1) + 1) % picks.length;
      const near = picks[ui.locIdx];
      const f = el.closest("form"); const fd = f ? new FormData(f) : new FormData();
      toast(`Mock location: ${aptLabel(apt(near))}. Sample airport, no GPS used.`);
      const q = parseHash().q;
      go("#/search?" + toQuery({ cert: fd.get("cert") || q.cert || "ppl", near, radius: fd.get("radius") || q.radius || "", before: fd.get("before") || q.before || "", maxFee: fd.get("maxFee") || q.maxFee || "", sort: fd.get("sort") || q.sort || "" }));
    },
    "avail-confirm": () => {
      const dp = dpeById(S.actingDpe); const a = availOf(dp.id); a.confirmedAt = Date.now();
      toast("Thanks. Your openings are confirmed as they are (mock: nobody was emailed). Students now see “confirmed today”.");
      rerender();
    },
    "avail-scroll": () => { const f = $(".avail-form"); if (f) f.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" }); },
    "avail-week": (el) => {
      const root = el.dataset.week === "all" ? $(".avail-form") : $(`.avail-week[data-week="${el.dataset.week}"]`);
      const open = el.dataset.mode === "open";
      root.querySelectorAll('input[type="checkbox"][name^="open-"]').forEach((c) => { c.checked = open; });
      toast(open ? "Marked open. Press Save to apply." : "Marked nothing open. Press Save to apply.");
    },
    "cohort-create": () => {
      const P = cohortParams(parseHash().q); const plan = planCohort(P);
      if (!plan.assign.length) { toast("Nothing to create."); return; }
      const cohortId = uid("c"); let n = 0;
      plan.assign.forEach((x) => {
        const sl = S.slots.find((z) => z.id === x.slot.id);
        if (sl.status !== "open") return;
        const chk = plan.final[x.st.i];
        if (chk.block.length) return; // never request for a blocked student
        const f = feeRow(x.dp, x.st);
        const b = { id: uid("b"), slotId: sl.id, dpeId: x.dp.id, applicant: x.st.name, mine: false, school: true, cohortId, cert: x.st.cert, aircraft: COHORT_AIRCRAFT, cfi: x.st.cfi, readiness: x.st.readiness,
          selfCheck: { attested: true, by: "school", warnings: chk.warn.length, warn: chk.warn, answers: JSON.parse(JSON.stringify(chk.answers)), ktDate: chk.answers.ktDate, hours: chk.answers.h },
          status: "requested", createdAt: Date.now(), feeUsd: f.fee, depositUsd: f.dep, bookingFeeUsd: BOOKING_FEE };
        S.bookings.push(b); sl.status = "held"; sl.bookingId = b.id; n++;
      });
      const nd = new Set(plan.assign.map((x) => x.dp.id)).size;
      toast(`${plural(n, "mock request")} created with ${nd === 1 ? plan.assign[0].dp.name : plural(nd, "examiner")}. Readiness answers attached. Nothing was sent or charged ($0).`);
      go("#/school/cohort?" + toQuery({ dpe: P.anyDpe ? "any" : P.dp.id, from: P.from, to: P.to }));
    },
    "cohort-ready-edit": (el) => openCohortReady(+el.dataset.i),
    "remove-slot": (el) => { const s = S.slots.find((x) => x.id === el.dataset.id); s.status = "removed"; touchAvail(s.dpeId); toast("Opening removed."); rerender(); },
    "mark-cancel": (el) => {
      const s = S.slots.find((x) => x.id === el.dataset.id);
      const b = S.bookings.find((x) => x.id === s.bookingId);
      if (b) setBookingState(b, "cancelled"); else s.status = "open";
      fireAlerts(s, "cancel");
      rerender();
    },
    "pick-tier": (el) => { S.tier = el.dataset.tier; toast(`${TIERS.find((t) => t.id === el.dataset.tier).name} plan selected (mock, proposed pricing). No payment taken, nothing sent.`); rerender(); },
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
      toast(`${p.name} listed in the sample directory (mock). This is not a check of FAA designation.`);
      rerender();
    },
    info: (el) => { S.pending.find((x) => x.id === el.dataset.id).status = "info"; toast("Mock only: no message was sent."); rerender(); },
    reject: (el) => { S.pending.find((x) => x.id === el.dataset.id).status = "rejected"; toast("Application rejected."); rerender(); },
  };

  const forms = {
    search: (f, fd) => {
      const txt = fd.get("nearText");
      let near = fd.get("near");
      if (txt != null) {
        const r = resolveAirport(txt);
        if (!r) { toast(`Couldn't find "${String(txt).slice(0, 40)}". Pick an airport or city from the list.`); return; }
        near = r;
      }
      go("#/search?" + toQuery({ cert: fd.get("cert"), near, radius: fd.get("radius"), before: fd.get("before") || "", maxFee: fd.get("maxFee") || "", sort: fd.get("sort") || "" }));
    },
    allin: (f, fd) => go("#/dpe/" + f.dataset.dpe + "?" + toQuery({ cert: fd.get("cert"), near: fd.get("near") })),
    compare: (f, fd) => go("#/compare?" + toQuery({ cert: fd.get("cert"), near: fd.get("near"), radius: fd.get("radius") })),
    alert: (f, fd) => addAlert({ cert: fd.get("cert"), near: fd.get("near"), radius: +fd.get("radius"), before: fd.get("before") || "", maxFee: +fd.get("maxFee") || 0, dpeId: fd.get("dpeId") || "" }),
    request: (f, fd) => {
      const s = S.slots.find((x) => x.id === fd.get("slot"));
      if (s.status !== "open") { closeModal(); toast("Sorry, someone else just requested that slot."); rerender(); return; }
      const gate = showGate(f, true);
      if (gate.block.length) { toast("Readiness check: confirm the remaining items before submitting (mock, self-attested)."); $("#req-gate").scrollIntoView({ block: "nearest" }); $("#req-gate").setAttribute("tabindex", "-1"); $("#req-gate").focus(); return; }
      if (isStale(s.dpeId)) { closeModal(); toast("This examiner has not confirmed their availability recently. Contact the examiner."); rerender(); return; }
      const cert = fd.get("cert");
      const dpx = dpeById(s.dpeId);
      const b = { id: uid("b"), slotId: s.id, dpeId: s.dpeId, applicant: fd.get("name").trim() || "Alex Pilot", mine: true, cert, aircraft: fd.get("aircraft").trim(), cfi: fd.get("cfi").trim(), readiness: checklistPct(cert), selfCheck: { attested: true, by: "student", warnings: gate.warn.length, warn: gate.warn, answers: { ...answersFromForm(f), iacra: true }, ktDate: fd.get("kt-date") || "", hours: Object.fromEntries([...fd.entries()].filter(([k]) => k.startsWith("h-")).map(([k, v]) => [k.slice(2), +v])) }, status: "requested", createdAt: Date.now(), feeUsd: dpx.fees[cert], depositUsd: depositFor(dpx, cert), bookingFeeUsd: BOOKING_FEE };
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
    avail: (f, fd) => {
      const dp = dpeById(S.actingDpe);
      const days = [...f.querySelectorAll("[data-date]")].map((r) => { const d = r.dataset.date; return { date: d, open: fd.get("open-" + d) === "on", cap: Number(fd.get("cap-" + d)) || 1, time: fd.get("time-" + d) || "08:00", airport: fd.get("airport-" + d) || dp.home, note: String(fd.get("note-" + d) || "").trim().slice(0, 80) }; });
      const r = applyAvailability(dp, days);
      touchAvail(dp.id);
      const bits = [];
      if (r.created.length) bits.push(`${plural(r.created.length, "new slot")} published`);
      if (r.closedDays) bits.push(`${plural(r.closedDays, "day")} closed`);
      if (r.keptDays) bits.push(`${plural(r.keptDays, "day")} kept open because of requests or bookings`);
      toast(`Saved. ${bits.length ? bits.join(", ") + ". " : "No slot changes. "}Students see the update now (mock: nobody was emailed).`);
      if (r.created.length) fireAlerts(r.created.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time))[0], "new");
      rerender();
    },
    "avail-reminder": (f, fd) => { const a = availOf(S.actingDpe); a.reminderDay = Number(fd.get("day")) || 0; a.pauseReminders = fd.get("pause") === "on"; rerender(); },
    cohort: (f, fd) => {
      go("#/school/cohort?" + toQuery({ st: fd.getAll("st").join(","), dpe: fd.get("dpe"), from: fd.get("from"), to: fd.get("to"), together: fd.get("together") ? "" : "0" }));
    },
    "cohort-ready": (f) => {
      const st = D.school.students[+f.dataset.i];
      const A = answersFromForm(f); const res = showGate(f, true);
      S.cohortReady = S.cohortReady || {}; S.cohortReady[st.name] = A;
      closeModal();
      toast(`Saved readiness answers for ${st.name} (self-attested by the school, mock). ${res.block.length ? `Still blocked: ${plural(res.block.length, "item")}.` : "Eligible for matching."}`);
      rerender();
    },
    publish: (f, fd) => {
      const certs = fd.getAll("certs");
      if (!certs.length) { toast("Pick at least one certificate."); return; }
      const s = { id: uid("s"), dpeId: S.actingDpe, date: fd.get("date"), time: fd.get("time"), airport: fd.get("airport"), certs, status: "open", bookingId: null };
      S.slots.push(s);
      touchAvail(S.actingDpe);
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
    if (t.form && (t.form.dataset.form === "request" || t.form.dataset.form === "cohort-ready") && t.name !== "cert") { showGate(t.form); return; }
    if (t.dataset.actionChange === "avail-age") { availOf(S.actingDpe).confirmedAt = Date.now() - Number(t.value) * DAY; rerender(); return; }
    if (t.dataset.actionChange === "acting-dpe") { S.actingDpe = t.value; rerender(); return; }
    if (t.dataset.actionChange === "req-cert") {
      const s = S.slots.find((x) => x.id === t.form.slot.value);
      const dp = dpeById(s.dpeId);
      $("#req-summary").innerHTML = requestSummary(dp, t.value);
      $("#req-check").outerHTML = readinessFields(t.value);
      showGate(t.form);
      $("#req-ready").innerHTML = `Your <a href="#/checklists/${t.value}" data-action="close-modal">${esc(certById(t.value).short)} checklist</a> is <b>${checklistPct(t.value)}%</b> complete. The examiner will see this.`;
      return;
    }
    const f = t.form;
    if (f && f.dataset.auto !== undefined && forms[f.dataset.form]) forms[f.dataset.form](f, new FormData(f));
  });
  // Builder inputs autosave without re-rendering (keeps focus while typing).
  document.addEventListener("input", (e) => {
    if (e.target.form && (e.target.form.dataset.form === "request" || e.target.form.dataset.form === "cohort-ready") && e.target.name !== "cert") showGate(e.target.form);
    const t = e.target;
    if (!t.dataset || !t.dataset.cl) return;
    const c = S.curated[t.dataset.bid]; if (!c) return;
    if (t.dataset.cl === "note") c.note = t.value;
    else { const it = c.items.find((x) => x.id === t.dataset.item); if (it) it[t.dataset.cl] = t.value; }
    c.updatedAt = Date.now(); save();
  });
  // Safety net: no form in this prototype ever submits to a server.
  document.addEventListener("submit", (e) => { const f = e.target; if (!f.dataset.form || !forms[f.dataset.form]) e.preventDefault(); }, true);
  document.addEventListener("keydown", (e) => {
    const dlg = $("#modal-root .modal");
    if (!dlg || $("#modal-root .modal-bg.closing")) return;
    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
    if (e.key === "Tab") {
      const items = [...dlg.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) { e.preventDefault(); dlg.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (!dlg.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $("#role-select").addEventListener("change", (e) => { S.role = e.target.value; go(HOME[S.role]); });
  window.addEventListener("hashchange", () => { closeModal(); render(); });

  render();
})();
