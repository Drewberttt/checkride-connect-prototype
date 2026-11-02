// Checkride Connect: clickable prototype. Plain JS, no build step, no network calls.
// MOCK ONLY: nothing is charged, emailed, texted or sent anywhere. State lives in localStorage
// so the demo survives reloads. "Reset demo data" (footer, More menu) clears it. All examiners/applicants/schools are fictional.
(() => {
  "use strict";
  const D = window.CC_DATA;
  // Data load failure: data.js missing, blocked or broken. index.html shows the error state (see #app-fallback script).
  if (!D || !Array.isArray(D.dpes) || !D.dpes.length) { window.CC_APP_FAILED = "data"; return; }
  // Fictional Florida sample set (fl01-fl50): appended to the original examiners (demo bookings and school data use d1..d13).
  // Its airport list is a superset of data.js airports, so it replaces them.
  const FL = window.CC_SAMPLE_FL;
  if (FL && FL.fictional && Array.isArray(FL.dpes)) {
    const have = new Set(D.dpes.map((d) => d.id));
    D.dpes.push(...FL.dpes.filter((d) => !have.has(d.id)));
    if (Array.isArray(FL.airports) && D.airports.every((a) => FL.airports.some((b) => b.id === a.id))) D.airports = FL.airports;
  }
  // B (multi-state): fictional TX / CA / AZ sample sets (tx01.., ca01.., az01..) are APPENDED after d1..d13 and fl01..fl50,
  // so d1, d2, d9 (referenced by seeded bookings, the school and the capacity days) keep their ids and positions.
  // Every airport carries a US state and an IANA time zone (D38): airport.tz, else data.js airportTz, else the region zone.
  D.airports.forEach((a) => { if (!a.state) a.state = "FL"; });
  const MULTI_STATE = [];
  [window.CC_SAMPLE_TX, window.CC_SAMPLE_CA, window.CC_SAMPLE_AZ].forEach((X) => {
    if (!X || !X.fictional || !Array.isArray(X.dpes) || !X.region) return;
    const st = X.region.short, haveA = new Set(D.airports.map((a) => a.id)), haveD = new Set(D.dpes.map((d) => d.id));
    (X.airports || []).filter((a) => !haveA.has(a.id)).forEach((a) => D.airports.push({ ...a, state: st, tz: a.tz || (D.airportTz && D.airportTz[a.id]) || undefined }));
    X.dpes.filter((d) => !haveD.has(d.id)).forEach((d) => { D.dpes.push(d); MULTI_STATE.push(d.id); });
  });
  // EASY SWITCH (rc2): the example states. Edit this one list; Find/landing copy reads it through coveredList().
  const COVERED_STATES = [["FL", "Florida"], ["TX", "Texas"], ["CA", "California"], ["AZ", "Arizona"]];
  // EASY SWITCH (rc2): the logo lockups (currently Runway). app.js uses this everywhere and syncs the header at boot;
  // index.html (first paint) and sw.js (precache) list the same two files.
  const BRAND_LOGO = { light: "brand/runway-horizontal-light.svg", dark: "brand/runway-horizontal-dark.svg" };
  const coveredList = () => { const n = COVERED_STATES.map(([, x]) => x); return n.length > 1 ? n.slice(0, -1).join(", ") + " and " + n[n.length - 1] : n.join(""); };
  const US_STATES = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming" };
  const STATE_HOME = { FL: "KORL", TX: "KADS", CA: "KVNY", AZ: "KDVT" }; // default "near" airport when you switch state
  const aptState = (id) => { const a = D.airports.find((x) => x.id === id); return (a && a.state) || "FL"; };
  const dpeState = (dp) => aptState(dp.home);
  // B: the pilot's "near" airport for an examiner. A near airport in another state (the KORL default on a TX profile) would
  // price a 900 nm trip, so out-of-state falls back to the examiner's home airport. Florida keeps the old KORL default.
  const nearFor = (n, dp) => { const st = dp ? dpeState(dp) : "FL"; if (apt(n) && aptState(n) === st) return n; return st === "FL" ? (apt(n) ? n : "KORL") : dp.home; };
  // ===================== PROTOTYPE CONFIG: the one switch for fees =====================
  // Owner decision (Oct 29, 2026): Checkride Connect is FREE during the prototype.
  // FEES_ENABLED: false  -> no $15 student booking fee anywhere (pricing, request, all-in, cohort, credits,
  //                         cancellation outcomes, alerts, DPE/school/admin views) and no school paid tiers.
  // FEES_ENABLED: true   -> brings back the previous $15 booking-fee rule and the proposed school tiers.
  // Deposits are unaffected either way: paid directly to the examiner under the examiner's own terms (mock).
  const CC_CONFIG = Object.assign({ FEES_ENABLED: false }, window.CC_CONFIG || {});
  window.CC_CONFIG = CC_CONFIG;
  const FEES = CC_CONFIG.FEES_ENABLED === true;
  const BOOKING_FEE = FEES ? 15 : 0;
  const FREE_LINE = "Checkride Connect is free during the prototype.";
  const ALERT_LIMIT = 5; // prototype cap on saved mock alerts (alerts are free, email-only, mock)
  // Demo date mode (demo-date.js) keeps its own state so pinned screenshots always start from fresh sample data.
  const KEY = "cc-connect-proto-v3" + (window.CC_DEMO_DATE ? ":demo-" + window.CC_DEMO_DATE : "");
  // Every saved-state key this prototype writes: cc-connect-proto-v3 and its demo-date variants (cc-connect-proto-v3:demo-YYYY-MM-DD).
  // The theme (cc-theme) and the fonts-loaded flag (cc-wf) are kept.
  const clearDemoData = () => { try { Object.keys(localStorage).filter((k) => k.startsWith("cc-connect-proto-v3")).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* private mode */ } };
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
  // Empty / error states share one look: icon, short title, one line of help, and the next useful action.
  const ICON = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    inbox: '<path d="M3.5 13.5 6 5.5h12l2.5 8V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0"/><path d="M16 5.6a3 3 0 0 1 0 5.8M18 14a5.5 5.5 0 0 1 3 5.5"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7L16 9.6"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17.2v.1"/>',
  };
  const icon = (k) => `<svg class="state-ic" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[k] || ICON.compass}</svg>`;
  const emptyState = ({ id, ic = "compass", title, body = "", actions = "", tag = "div", h = "h3", cls = "card" }) =>
    `<${tag} class="${cls} empty state" data-state="${id}">${icon(ic)}${title ? `<${h}>${title}</${h}>` : ""}${body ? `<p>${body}</p>` : ""}${actions ? `<div class="empty-actions">${actions}</div>` : ""}</${tag}>`;
  // ---- Time zones (D38 #1/#3, QA-003). Slot times are wall-clock times at the checkride airport, shown in that
  // airport's IANA zone with a zone label ("9:00 AM CT"). Everything is computed with Intl.DateTimeFormat + timeZone,
  // never with the browser's own zone (no setHours on a local Date), so labels and countdowns are the same in any browser zone.
  // "Today" for the sample region (Florida) is the date in REGION_TZ.
  const REGION_TZ = "America/New_York";
  const ZONE_ABBR = { "America/New_York": "ET", "America/Chicago": "CT", "America/Denver": "MT", "America/Phoenix": "MST", "America/Los_Angeles": "PT" };
  const _dtf = {};
  const dtf = (tz) => _dtf[tz] || (_dtf[tz] = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  const zParts = (ts, tz) => { const o = {}; for (const x of dtf(tz).formatToParts(new Date(ts))) o[x.type] = x.value; return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second }; };
  const tzOffset = (ts, tz) => { const z = zParts(ts, tz); return Date.UTC(z.y, z.mo - 1, z.d, z.h, z.mi, z.s) - Math.floor(ts / 1000) * 1000; };
  // Epoch ms of a wall-clock date + "HH:MM" in an IANA zone.
  const zonedEpoch = (ymd, hm, tz) => { const [y, m, d] = ymd.split("-").map(Number); const [h, mi] = (hm || "00:00").split(":").map(Number); const g = Date.UTC(y, m - 1, d, h, mi || 0); const t = g - tzOffset(g, tz); return g - tzOffset(t, tz); };
  const ymdIn = (ts, tz) => { const z = zParts(ts, tz); return `${z.y}-${String(z.mo).padStart(2, "0")}-${String(z.d).padStart(2, "0")}`; };
  const zoneLabel = (tz) => ZONE_ABBR[tz] || (() => { try { return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortGeneric" }).formatToParts(new Date()).find((x) => x.type === "timeZoneName").value; } catch (e) { return tz; } })();
  const aptTz = (id) => { const a = D.airports.find((x) => x.id === id); return (a && a.tz) || (D.airportTz && D.airportTz[id]) || REGION_TZ; };
  const fmtIn = (ts, tz, o) => new Date(ts).toLocaleString("en-US", { ...o, timeZone: tz });
  // QA-033 (B): system and activity timestamps (sent, requested, cancelled, withdrawn, updated, notifications, the
  // Requests "Weekly check" line) use the READER's own zone with the SHORT zone label: "Oct 29, 3:12 PM ET".
  // Slot and checkride times, and request hold ends, stay in the airport zone (D38). Never "GMT+00:00".
  const READER_ABBR = { ...ZONE_ABBR, "America/Detroit": "ET", "America/Indiana/Indianapolis": "ET", "America/Kentucky/Louisville": "ET", "America/Boise": "MT", "America/Anchorage": "AKT", "Pacific/Honolulu": "HT", "UTC": "UTC", "Etc/UTC": "UTC", "Etc/GMT": "UTC", "GMT": "UTC" };
  const readerTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } };
  const readerZoneLabel = () => {
    const tz = readerTz(); if (READER_ABBR[tz]) return READER_ABBR[tz];
    try {
      const v = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date()).find((x) => x.type === "timeZoneName").value;
      const m = /^GMT([+-]\d{1,2})?(?::(\d\d))?$/.exec(v);
      if (m) return m[1] ? `UTC${m[1]}${m[2] && m[2] !== "00" ? ":" + m[2] : ""}` : "UTC";
      return v;
    } catch (e) { return "UTC"; }
  };
  const fmtTs = (ts) => `${new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ${readerZoneLabel()}`.trim();

  const DAY = 86400000;
  // Midnight (as a calendar date) of "today" in the sample region's zone; date math below is calendar math only.
  const today0 = () => { const [y, m, d] = ymdIn(Date.now(), REGION_TZ).split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (n) => { const d = today0(); d.setDate(d.getDate() + n); return iso(d); };
  // D39 (KECP bug): "today" is per zone. Region pages use REGION_TZ; examiner pages and slot math use the airport's zone
  // (America/Chicago for KECP), via Intl + timeZone, never the browser's zone.
  const todayIn = (tz = REGION_TZ) => ymdIn(Date.now(), tz);
  const shiftYmd = (ymd, n) => { const d = parseIso(ymd); d.setDate(d.getDate() + n); return iso(d); };
  const addDaysIn = (n, tz) => shiftYmd(todayIn(tz), n);
  const slotToday = (sl) => todayIn(slotTz(sl));
  const daysUntil = (s, tz = REGION_TZ) => Math.round((parseIso(s) - parseIso(todayIn(tz))) / DAY);
  const fmtDate = (s, o = { weekday: "short", month: "short", day: "numeric" }) => parseIso(s).toLocaleDateString("en-US", o);
  // QA-036: long-horizon dates (knowledge-test expiry, a "before" date) always carry the year: "Mon, Jan 31, 2028".
  // fmtDateY always shows it; fmtDateA shows it when the date is in another year than today or more than ~6 months out.
  const fmtDateY = (s) => fmtDate(s, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const fmtDateA = (s) => (s.slice(0, 4) !== todayIn().slice(0, 4) || Math.abs(daysUntil(s)) > 180 ? fmtDateY(s) : fmtDate(s));
  const fmtTime = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
  const relDays = (s, tz) => { const n = daysUntil(s, tz); return n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${plural(n, "day")}`; };

  const certById = (id) => D.certs.find((c) => c.id === id);
  const apt = (id) => D.airports.find((a) => a.id === id);
  const allDpes = () => [...D.dpes, ...S.approvedDpes];
  const dpeById = (id) => allDpes().find((d) => d.id === id);
  // Deposit and booking-fee policy (Proposed, pending legal review). Single source so every screen says the same thing.
  // Exact wording from ux-copy-v2.md "Replacement for the deposit policy line" (UF#3). PM default, pending Drewbert and a lawyer (D2, D3, working defaults).
  const DEPOSIT_POLICY_FEES = "<b>Booking fee and cancellations (proposed, pending legal review).</b> Cancel 48 hours or more ahead (in the checkride airport\u2019s local time) and your $15 booking fee becomes a credit, good on any booking for 12 months. Credits can\u2019t be transferred or cashed out. Cancel later or miss the checkride, and the $15 is kept; you can dispute a no-show within 7 days. If the examiner, weather or maintenance cancels, Checkride Connect will refund or credit the $15. Your deposit goes directly to the examiner and follows their own cancellation terms, shown below.";
  // Flag off (UF#3, owner decision): deposits always follow the examiner's terms, and Checkride Connect is free during the prototype.
  // ux-copy-v3 wl.policy (free during the prototype). The deposit sentence keeps the pending-legal tag.
  const DEPOSIT_POLICY_FREE = "<b>Cancellations and deposits.</b> Checkride Connect is free during the prototype, so there\u2019s no fee from us to refund or credit. If you or the examiner cancels a confirmed checkride, the slot is released and everyone involved is told in the app. Your deposit goes directly to the examiner and follows their own cancellation terms, shown below <i>(Proposed, pending legal review)</i>.";
  const DEPOSIT_POLICY = FEES ? DEPOSIT_POLICY_FEES : DEPOSIT_POLICY_FREE;
  const LEGAL_TAG = `<span class="pill warn">Proposed, pending legal review</span>`;
  const PM_TAG = `<span class="pm-tag muted small">PM default, pending Drewbert and a lawyer.</span>`;
  const POLICY_SHORT = `Deposit paid to your examiner (mock); Checkride Connect never holds it. <span class="pill warn">Proposed, pending legal review</span>`;
  // Examiner's own deposit terms, quoted (UF#6). Editable on Fees & policies (UF#2).
  const depTerms = (dp) => dp.depositTerms || dp.cancellation || "Not yet set.";
  const examinerTerms = (dp) => `<div class="small terms-pair" data-terms><div><b>Examiner\u2019s deposit terms:</b> \u201c${esc(depTerms(dp))}\u201d</div>${FEES ? `<div><b>Checkride Connect $15 fee:</b> follows the rule above. ${LEGAL_TAG}</div>` : `<div><b>Checkride Connect:</b> free during the prototype, no booking fee.</div>`}</div>`;
  // ---- Cancellation timing (UF#5). Slot times are the checkride airport's local time, in its own zone (D38). ----
  const H48 = 48 * 3600e3;
  const slotTz = (sl) => aptTz(sl.airport);
  const slotStart = (sl) => zonedEpoch(sl.date, sl.time, slotTz(sl));
  // QA-039: one shared rule. A slot whose start instant (airport zone) has passed is never listed, alerted, offered or requestable.
  const slotPast = (sl) => !!sl && slotStart(sl) <= Date.now();
  // ux-copy-v3 §7.6 (Marlo, Nov 2): copy keys used by the v4 build. "That date has passed" stays for onboarding date fields only.
  const COPY = { "slot.started": "This opening has already started.", "search.empty_today": "No openings left today.", "search.state.placeholder": "Choose a state" };
  const PAST_SLOT = COPY["slot.started"]; // QA-039 / QA-070: the stale-slot refusal uses the slot.started key
  const slotLive = (sl) => !!sl && sl.status === "open" && !slotPast(sl);
  const slotTime = (sl) => `${fmtTime(sl.time)} ${zoneLabel(slotTz(sl))}`;
  const durText = (ms) => { const h = Math.floor(Math.max(ms, 0) / 3600e3); if (h < 1) return "less than 1 hour"; if (h < 48) return plural(h, "hour"); const d = Math.floor(h / 24), r = h % 24; return plural(d, "day") + (r ? ", " + plural(r, "hour") : ""); };
  const durShort = (ms) => { const h = Math.floor(Math.max(ms, 0) / 3600e3); return h < 48 ? (h < 1 ? "less than 1 hour" : plural(h, "hour")) : plural(Math.floor(h / 24), "day"); };
  const slotWhen = (sl) => `${fmtDate(sl.date)} \u00b7 ${slotTime(sl)}`;
  const slotWhenLong = (sl) => `${fmtDate(sl.date, { weekday: "short", month: "short", day: "numeric" })} \u00b7 ${slotTime(sl)}`;
  // D38 / ux-copy-v3 "Times": "Fri, Nov 6 · 9:00 AM ET, at KVDF" (airport zone label plus ICAO).
  const slotAt = (sl) => `${slotWhenLong(sl)}, at ${sl.airport}`;
  // A moment shown in a given zone (the checkride airport's zone where there is one), with its label.
  const fmtEt = (ts) => fmtTs(ts); // cancellation moment: a system timestamp, reader's zone
  const creditUntil = (ts) => { const [y, m, d] = ymdIn(ts, REGION_TZ).split("-").map(Number); return new Date(y + 1, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  const tsWhen = (ts, tz = REGION_TZ) => `${fmtIn(ts, tz, { weekday: "short", month: "short", day: "numeric" })} \u00b7 ${fmtIn(ts, tz, { hour: "numeric", minute: "2-digit" })} ${zoneLabel(tz)}`;
  // QA-044: one rule for event moments (sent, withdrawn): the reader's zone, with the weekday (ux-copy 5.2a sample).
  const tsReader = (ts) => `${fmtIn(ts, readerTz(), { weekday: "short", month: "short", day: "numeric" })} \u00b7 ${fmtIn(ts, readerTz(), { hour: "numeric", minute: "2-digit" })} ${readerZoneLabel()}`.trim();
  // Soft hold (F4/F12): up to 48 hours from sending, ending no later than 12 hours before the slot; inside 12 hours, no hold.
  const H12 = 12 * 3600e3;
  // QA-038: once a pilot's hold has run out with no reply, the hold line is replaced (copy from Drewbert's run notes;
  // the spec is silent, pending PM review).
  const HOLD_ENDED = "Hold ended. The examiner didn\u2019t reply in time. You can request another opening.";
  const holdEnded = (b, sl) => { if (!b || b.status !== "requested" || !b.mine || !sl) return false; const he = holdEnd(b, sl); return !!he && he <= Date.now(); };
  // .bak11 (QA-038, F11): req.status.hold_ended replaces req.status.released. The waitlist sentence only when the student is on
  // THIS examiner's waitlist (same rule as the withdraw toast). An ended hold never counts as a pass or a fail on the record.
  const holdEndedLine = (b) => { const onWl = !!b && S.alerts.some((a) => a.cert === b.cert && a.dpeId === b.dpeId); return `<p class="small" data-hold-ended>${HOLD_ENDED}${onWl ? ` <span data-hold-wl>You keep your place on ${esc(first(dpeById(b.dpeId).name))}\u2019s waitlist.</span>` : ""} <a href="#/search${b && b.cert ? `?cert=${encodeURIComponent(b.cert)}` : ""}" data-hold-search>Search openings</a></p>`; };
  const holdEnd = (b, sl) => { const st = slotStart(sl); return st - b.createdAt < H12 ? null : Math.min(b.createdAt + H48, st - H12); };
  // C (D32/F12): examiner-side hold chips. dpe.request.hold / dpe.request.nohold.
  const dpeHoldLine = (b, sl) => {
    if (!b || b.status !== "requested" || !sl || !b.createdAt) return "";
    const he = holdEnd(b, sl), who = esc(first(b.applicant || "The student"));
    if (he === null) return `<div class="small" data-dpe-hold="none">Starts in less than 12 hours, so there\u2019s no hold. Other students can request this slot too; the first request you accept gets it.</div>`;
    if (he > Date.now()) return `<div class="small" data-dpe-hold="${he}">Held for ${who} until ${tsWhen(he, slotTz(sl))}. If you haven\u2019t answered by then, the slot is released.</div>`;
    return "";
  };
  // C (D34/D36, F6/F14): no-shows. Only the examiner marks one (after the slot time); the student can dispute within 7 days of
  // the confirmed checkride date; a dispute affects the record only (no fee). Examiners see a 12-month count that leaves out
  // disputes under review and reversed ones.
  const NS_WINDOW = 7 * 86400000;
  const nsDisputeBy = (sl) => slotStart(sl) + NS_WINDOW;
  const nsCounts = (b) => !!b.noShow && Date.now() - b.noShow.at < 365 * 86400000 && !(b.noShow.dispute && b.noShow.dispute.status !== "upheld");
  const noShowCount = (name) => S.bookings.filter((x) => x.applicant === name && nsCounts(x)).length;
  const dpeNoShowLine = (b) => `<div class="small muted" data-noshows="${noShowCount(b.applicant)}">No-shows in the last 12 months: ${noShowCount(b.applicant)} \u00b7 Disputed no-shows aren\u2019t counted until they\u2019re resolved.</div>`;
  // ux-copy-v2 5.6 dialog bodies. PM default, pending Drewbert and a lawyer.
  const studentCancelBody = (sl, ms, dp) => !FEES ? `Your confirmed checkride is ${slotAt(sl)}. If you cancel, the slot goes back to ${esc(first(dp.name))}, and the next person in line can request it. Checkride Connect is free, so there\u2019s nothing from us to refund or credit.` : ms >= H48
    ? `It\u2019s ${durText(ms)} until ${slotWhen(sl)}. Because that\u2019s 48 hours or more, your $15 booking fee becomes a credit. You can use it on any booking for 12 months.`
    : `It\u2019s ${durText(ms)} until ${slotWhen(sl)}. Because that\u2019s less than 48 hours, the $15 booking fee is kept.`;
  // Sample deposit: about 20% of the examiner fee, rounded to $25. Credited toward the fee. Mock only.
  const depositFor = (dp, cert) => dp.depositUsd != null && dp.depositUsd !== "" ? Math.min(dp.fees[cert], Number(dp.depositUsd)) : Math.min(dp.fees[cert], Math.max(100, Math.round((dp.fees[cert] * 0.2) / 25) * 25));
  const depositRule = (dp) => dp.depositUsd != null && dp.depositUsd !== "" ? `set by the examiner at ${money(Number(dp.depositUsd))} per checkride` : "about 20% of the fee, rounded to $25, minimum $100";

  // ---- All-in cost model (EXAMPLE NUMBERS from sample data, not quotes) ----
  const sampleOf = (dp) => dp.sample || { rental: 150, lodging: 130, noShow: 250, avgDaysToNext: null, leadDays: null, reviewList: [] };
  // `at` = the opening's airport (UF#4). The examiner travel fee applies only when the opening isn't at the examiner's home airport.
  const allIn = (dp, cert, near, at) => {
    const M = D.allInModel, sm = sampleOf(dp);
    const fee = dp.fees[cert], dep = depositFor(dp, cert);
    // B: a sample examiner's own costModel (TX/CA/AZ) wins, so this card and the expected all-in estimate agree.
    const cmx = dp.costModel || {}, own = cmx.byCert && cmx.byCert[cert];
    const hrs = (own && own.rentalHoursTest) || M.hours[cert] || 1.5;
    const rate = M.multi.includes(cert) ? (cmx.rentalRatePerHr && cmx.rentalRatePerHr.me) || Math.round(sm.rental * M.multiMult) : Math.round(sm.rental);
    const aircraft = Math.round(hrs * rate);
    const dist = distNm(dp.home, near);
    let travel = 0, travelLabel = "Travel / lodging estimate", travelNote = "Examiner is based at your airport";
    if (at && apt(at)) {
      const d2 = distNm(at, near), away = at !== dp.home;
      const tf = away ? dp.travelFee : 0;
      const fly = d2 > 10 ? Math.round(((d2 * 2) / M.cruiseKt) * rate / 5) * 5 : 0, lodge = d2 > M.lodgingOverNm ? sm.lodging : 0;
      travel = tf + fly + lodge;
      const parts = [];
      parts.push(away ? `Opening is at ${at}, away from the examiner\u2019s home airport: examiner travel fee ${money(tf)} (sample)` : `Opening is at ${at}, the examiner\u2019s home airport: no examiner travel fee`);
      parts.push(fly ? `you fly ${d2} nm each way (${money(fly)})${lodge ? ` plus 1 hotel night (${money(lodge)})` : ""}` : `${at} is at or near your airport`);
      travelNote = parts.join("; ");
      const offer = !away && dist > 10 && dist <= dp.travelNm ? `Listed openings are at ${dp.home}; ${first(dp.name)} can travel to ${near} for +${money(dp.travelFee)} on request.` : "";
      return { fee, dep, aircraft, aircraftNote: `${hrs} h \u00d7 ${money(rate)}/h rental + fuel (example)`, travel, travelLabel, travelNote, offer, at, studentFee: BOOKING_FEE,
        total: fee + BOOKING_FEE + aircraft + travel, retest: dp.retestFee, noShow: sm.noShow, dist };
    }
    if (dist > 10 && dist <= dp.travelNm) { travel = dp.travelFee; travelNote = `Examiner travel fee, ${dist} nm from you (sample)`; }
    else if (dist > dp.travelNm) {
      const fly = Math.round(((dist * 2) / M.cruiseKt) * rate / 5) * 5, lodge = dist > M.lodgingOverNm ? sm.lodging : 0;
      travel = fly + lodge; travelNote = `Outside the examiner's ${dp.travelNm} nm range: you fly ${dist} nm each way (${money(fly)})${lodge ? ` plus 1 hotel night (${money(lodge)})` : ""}`;
    }
    return { fee, dep, aircraft, aircraftNote: `${hrs} h × ${money(rate)}/h rental + fuel (example)`, travel, travelLabel, travelNote, studentFee: BOOKING_FEE,
      total: fee + BOOKING_FEE + aircraft + travel, retest: dp.retestFee, noShow: sm.noShow, dist };
  };
  const allInCard = (dp, cert, near, at) => {
    const x = allIn(dp, cert, near, at);
    return `<section class="card" id="all-in">
      <p class="eyebrow">What this slot would cost</p>
      <div class="row spread"><h2 style="margin:0">All-in cost</h2><span class="pill warn">Example numbers, not a quote</span></div>
      <form class="row" data-form="allin" data-auto data-dpe="${dp.id}" style="margin:.75rem 0 0;gap:.75rem;align-items:flex-end;flex-wrap:wrap">
        ${certSelect("cert", cert, Object.keys(dp.fees))}${airportSelect("near", near, "Your airport")}
      </form>
      <div class="summary small" style="margin-top:.9rem">
        <div class="line"><span>Examiner fee, ${esc(certById(cert).short)} (sample)</span><b>${money(x.fee)}</b></div>
        ${FEES ? `<div class="line"><span>Student booking fee (flat, mock)</span><b>${money(x.studentFee)}</b></div>` : ""}
        <div class="line"><span>Aircraft rental + fuel estimate<div class="muted small">${esc(x.aircraftNote)}</div></span><b>${money(x.aircraft)}</b></div>
        <div class="line"><span>${x.travelLabel}<div class="muted small" data-travel-note>${esc(x.travelNote)}</div></span><b>${money(x.travel)}</b></div>
        <div class="line" style="border-top:1px solid var(--border-strong);margin-top:.3rem;padding-top:.5rem"><span><b>Example all-in total${x.at ? ` for an opening at ${x.at}` : ""}</b></span><b>${money(x.total)}</b></div>
      </div>
      ${x.offer ? `<p class="small" id="travel-offer" style="margin:.6rem 0 0">${esc(x.offer)}</p>` : ""}
      <div class="summary small" style="margin-top:.75rem">
        <div class="line muted"><span>Not added to the total, if needed: retest / discontinuance (sample)</span><b>+${money(x.retest)}</b></div>
        <div class="line muted"><span>Not added to the total, if needed: no-show / late-cancel fee, up to (sample)</span><b>+${money(x.noShow)}</b></div>
      </div>
      <p class="warn-note small" style="margin:.75rem 0 0"><b>ASSUMPTION:</b> Deposit paid to your examiner (mock): ${money(x.dep)}, ${depositRule(dp)}. It is <b>part of</b> the examiner fee, not an extra; Checkride Connect never holds it. It is due at approval${FEES ? ` together with the ${money(BOOKING_FEE)} student fee (${money(x.dep + BOOKING_FEE)})` : ` (${FREE_LINE.replace(".", "")}, no booking fee)`}, and the rest (${money(x.fee - x.dep)}) is paid at the test. Real deposit rules are set by each examiner. Prototype, not legal or FAA advice, and no real payments.</p>
    </section>`;
  };
  // ---------- B: expected all-in cost estimator (CC_COST_MODEL from /workspace/checkride-pm/data/cost-model.js) ----------
  // ESTIMATE FROM EXAMPLE INPUTS. Test-day flight time uses the sourced 1.3–2.0 h range (typical per checkride type) and a
  // twin rents for about 2.4x a trainer (395 / 165, PilotBound 2026). The retest chance is a SHARED default per checkride type
  // from FAA-wide statistics, adjustable by the user. It is never an examiner's pass rate.
  const CM = window.CC_COST_MODEL || null;
  const TWIN_MULT = 2.4;
  const pTypical = (cert) => (CM && CM.byCert[cert] ? CM.byCert[cert].retestProbability.typical : 0.25);
  // TX / CA / AZ sample examiners ship a fictional costModel. Older sample examiners (d1.., fl01..) get one built from their own
  // sample fee, sample rental rate and the shared cost-model.js defaults, so every profile can show the same estimate.
  function costModelFor(dp, cert) {
    if (!CM) return null;
    const own = dp.costModel && dp.costModel.byCert && dp.costModel.byCert[cert];
    if (own) return { ...dp.costModel, byCert: { ...dp.costModel.byCert, [cert]: { ...own, examinerFee: dp.fees[cert] ?? own.examinerFee } } };
    const d = CM.byCert[cert];
    if (!d || dp.fees[cert] == null) return null;
    const st = (CM.stateRates || {})[dpeState(dp)] || {};
    const se = sampleOf(dp).rental, fee = dp.fees[cert];
    const primary = ["ppl", "ir"].find((c) => dp.fees[c]) || Object.keys(dp.fees)[0];
    return {
      fictional: true, built: true, rentalRatePerHr: { se, me: Math.round(se * TWIN_MULT) }, cfiRatePerHr: st.cfi || CM.rates.cfi.typical,
      byCert: { [cert]: { examinerFee: fee, rentalHoursTest: d.rentalHoursTest.typical, cfiPrepHours: d.cfiPrepHours.typical, cfiPrepGroundHours: CM.shared.cfiPrepGroundHours.typical,
        retestProbability: d.retestProbability.typical, retestFee: cert === primary && dp.retestFee ? dp.retestFee : Math.round((fee * CM.shared.retestFeeRatio.typical) / 25) * 25,
        retestRentalHours: CM.shared.retestRentalHours.typical, retestDualHours: CM.shared.retestDualHours.typical } },
    };
  }
  // The user's retest chance per checkride type (stored in this browser). Default = the shared default for that type.
  const retestP = (cert) => { const v = S.retestP && S.retestP[cert]; return typeof v === "number" && v >= 0 && v <= 0.6 ? v : pTypical(cert); };
  // QA-047: the label matches the value used. "1 in n" only when it is close (within 0.02); otherwise "k in 10" (0.6 → About 6 in 10). No percentages.
  const oneIn = (p) => { if (p <= 0) return "Leave out"; const n = Math.round(1 / p); return Math.abs(1 / n - p) <= 0.02 ? `About 1 in ${n}` : `About ${Math.round(p * 10)} in 10`; };
  function estimateFor(dp, cert, travel, feeOverride) {
    const cm = costModelFor(dp, cert);
    if (!cm) return null;
    const bc = cm.byCert[cert];
    if (feeOverride != null) bc.examinerFee = feeOverride;
    const p = retestP(cert), isMulti = (CM.multi || []).includes(cert);
    const x = CM.expectedAllInForExaminer({ ...dp, costModel: { ...cm, byCert: { ...cm.byCert, [cert]: { ...bc, retestProbability: p } } } }, cert, travel);
    if (!x) return null;
    const rate = isMulti ? cm.rentalRatePerHr.me : cm.rentalRatePerHr.se;
    const range = CM.byCert[cert] ? CM.byCert[cert].rentalHoursTest : { low: 1.3, high: 2.0 };
    // QA-046: round each line once and show the total as the sum of the rounded lines, so the card always adds up.
    const R = Math.round, rl = { exam: R(x.exam), aircraft: R(x.aircraft), prep: R(x.prep), travel: R(x.travel), expectedRetest: R(x.expectedRetest), retestCost: R(x.retestCost) };
    const total = rl.exam + rl.aircraft + rl.prep + rl.travel + rl.expectedRetest;
    return { ...x, ...rl, total, exactTotal: x.total, p, rate, isMulti, hours: bc.rentalHoursTest, range, prepHours: bc.cfiPrepHours, groundHours: bc.cfiPrepGroundHours, cfiRate: cm.cfiRatePerHr,
      retestFee: bc.retestFee, built: !!cm.built, studentFee: BOOKING_FEE, grand: total + BOOKING_FEE };
  }
  const RETEST_OPTS = [0, 0.1, 0.125, 0.2, 0.25, 0.33, 0.4, 0.5];
  const retestSelect = (cert, id) => {
    const def = pTypical(cert), cur = retestP(cert);
    const opts = [...new Set([...RETEST_OPTS.filter((v) => v === 0 || (Math.abs(v - def) > 0.02 && oneIn(v) !== oneIn(def))), def, cur])].sort((a, b) => a - b);
    // QA-047: dedupe options by label, but the stored value always keeps its own (selected) option.
    const lab = (v) => oneIn(v) + (Math.abs(v - def) < 1e-9 ? " (shared default)" : "");
    const seen = new Set(opts.filter((v) => Math.abs(v - cur) < 1e-9).map(lab));
    return `<label class="field"><span>Retest chance (estimate, adjustable)</span><select name="p" id="${id}" data-retest-select>${opts.map((v) => {
      const l = lab(v), isCur = Math.abs(v - cur) < 1e-9;
      if (!isCur) { if (seen.has(l)) return ""; seen.add(l); }
      return `<option value="${v}" ${Math.abs(v - cur) < 1e-9 ? "selected" : ""}>${l}</option>`;
    }).join("")}</select></label>`;
  };
  const EST_LABEL = "Estimate built from example inputs, not a quote";
  const EST_PILL = `<span class="pill warn" data-estimate-label>${EST_LABEL}</span>`;
  const retestNote = (cert) => `The retest chance is a shared default for every ${esc(certById(cert).short)} checkride, from FAA-wide statistics, and you can change it. It is not this examiner\u2019s pass rate. ${VERIFY}`;
  // Profile card ("Expected all-in, including retest risk").
  const estimateCard = (dp, cert, near, at) => {
    const travel = allIn(dp, cert, near, at).travel, e = estimateFor(dp, cert, travel);
    if (!e) return "";
    const L = (k, v, note) => `<div class="line"><span>${k}${note ? `<div class="muted small">${note}</div>` : ""}</span><b class="mono">${v}</b></div>`;
    return `<section class="card" id="cost-estimate" data-estimate="${dp.id}:${cert}">
      <p class="eyebrow">ESTIMATE \u00b7 EXAMPLE INPUTS</p>
      <div class="row spread"><h2 style="margin:0">Expected all-in, including retest risk</h2>${EST_PILL}</div>
      <form class="row" data-form="retest" data-auto data-cert="${cert}" style="margin:.75rem 0 0;gap:.75rem;align-items:flex-end;flex-wrap:wrap">${retestSelect(cert, "retest-p")}</form>
      <div class="summary small" style="margin-top:.9rem">
        ${L(`Examiner fee, ${esc(certById(cert).short)} (sample)`, money(e.exam))}
        ${L("Aircraft on test day (estimate)", money(e.aircraft), `${e.hours} h \u00d7 ${money(e.rate)}/h${e.isMulti ? `, a twin at about ${TWIN_MULT}\u00d7 a trainer` : ""}. Sourced test-day flight time is about ${e.range.low}\u2013${e.range.high} h.`)}
        ${L("CFI prep and mock checkride (estimate)", money(e.prep), `${e.prepHours} h dual + ${e.groundHours} h ground at ${money(e.cfiRate)}/h instructor and the same rental rate`)}
        ${L("Travel (estimate)", money(e.travel))}
        ${FEES ? L("Student booking fee (mock)", money(e.studentFee)) : ""}
        ${L("Retest risk (estimate)", money(e.expectedRetest), e.p > 0 ? `${oneIn(e.p).toLowerCase()} \u00d7 ${money(e.retestCost)} if a retest is needed (retest fee ${money(e.retestFee)}, extra training, rental${e.travel ? ", travel again" : ""})` : "Left out of this estimate")}
        <div class="line total"><span><b>Expected all-in (est.)</b></span><b class="mono" data-est-total>${money(e.grand)}</b></div>
      </div>
      <p class="muted small" style="margin:.6rem 0 0">${retestNote(cert)}</p>
      <p class="muted small" style="margin:.35rem 0 0">Every input is example data: sample fees and rental rates, and shared defaults for prep hours and retests${e.built ? " (this examiner\u2019s rates are sample values, with the rest from shared defaults)" : ""}. Your school\u2019s rates and your own progress change the real number.</p>
    </section>`;
  };
  // Compact version for the request workspace's fee card.
  const estimateMini = (dp, cert, travel, fee) => {
    const e = estimateFor(dp, cert, travel, fee);
    if (!e) return "";
    return `<div class="inset small" id="fee-estimate" data-estimate="${dp.id}:${cert}" style="margin-top:.75rem">
      <div class="line"><span><b>Expected all-in, including retest risk</b></span><b class="mono" data-est-total>${money(e.grand)}</b></div>
      <p class="muted" style="margin:.25rem 0 0">Adds CFI prep (${money(e.prep)}), aircraft on test day (${money(e.aircraft)}, ${e.hours} h) and retest risk (${money(e.expectedRetest)}) to the fee and travel above.</p>
      <form data-form="retest" data-auto data-cert="${cert}" style="margin:.5rem 0 0">${retestSelect(cert, "retest-p-req")}</form>
      <p class="muted" style="margin:.35rem 0 0">${EST_LABEL}. ${retestNote(cert)}</p>
    </div>`;
  };
  const reviewsCard = (dp, cert) => {
    const sm = sampleOf(dp);
    const next = openSlots({ dpeId: dp.id, cert })[0];
    const stat = (v, l) => `<div><div class="big-num" style="font-size:1.5rem">${v}</div><div class="muted small">${l}</div></div>`;
    return `<section class="card" id="reviews">
      <div class="row spread"><h2 style="margin:0">Reviews and wait time</h2><span class="pill warn">Sample reviews, not real</span></div>
      <div class="grid g2" style="margin-top:.9rem;gap:1rem">
        ${stat(next ? plural(daysUntil(next.date, slotTz(next)), "day") : "—", `until the next open ${esc(certById(cert).short)} slot (from the sample calendar)`)}
        ${stat(sm.avgDaysToNext != null ? plural(sm.avgDaysToNext, "day") : "—", "average wait to the next checkride (sample)")}
        ${stat(sm.leadDays != null ? plural(sm.leadDays, "day") : "—", "typical booking lead time (sample)")}
      </div>
      ${sm.reviewList.length ? `<h3 style="margin:1.1rem 0 .4rem">Showing ${sm.reviewList.length} of ${dp.reviews} sample reviews</h3>
      ${sm.reviewList.map((r) => `<blockquote class="review"><div class="row small" style="gap:.5rem">${SAMPLE_TAG}<span class="muted">Example student · ${esc(certById(r.cert).short)} · sample review, not real</span></div><p style="margin:.25rem 0 0">“${esc(r.text)}”</p></blockquote>`).join("")}` : `<p class="muted small">No sample reviews for this new listing.</p>`}
      <p class="muted small" style="margin:.75rem 0 0">All reviews and wait figures are invented example data. They are not real examiners, students or feedback.</p>
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

  // Busy examiners with realistic multi-checkride days (capacity 3: morning, midday, afternoon), so a small cohort can stay
  // together with one examiner on one day. Sample data only. Used by seed() and by the Phase 4 migration of older saved demos.
  const TRIPLE_DPES = ["d1", "d5", "d9"];
  function addTripleDays(slots, n, mkId = (k) => "s" + k) {
    TRIPLE_DPES.forEach((id) => {
      const days = [...new Set(slots.filter((x) => x.dpeId === id && x.status === "open").map((x) => x.date))].sort();
      days.forEach((date, k) => {
        if (k % 3 !== 1) return; // every third open day
        const cur = slots.filter((x) => x.dpeId === id && x.date === date);
        const base = cur[0];
        ["08:00", "11:30", "14:30"].filter((tm) => !cur.some((x) => x.time === tm)).slice(0, Math.max(0, 3 - cur.length)).forEach((tm) => {
          slots.push({ id: mkId(++n), dpeId: id, date, time: tm, airport: base.airport, certs: base.certs, status: "open", bookingId: null, note: "Up to three checkrides that day (sample)" });
        });
      });
    });
    return n;
  }

  // One examiner's generated calendar. The rng seed is the examiner's index in D.dpes, so appending examiners never moves anyone's slots.
  function genSlots(slots, dp, i, n, mkId = (k) => "s" + k) {
    const r = rng(i * 97 + 13);
    const near = D.airports.filter((a) => a.id !== dp.home && distNm(dp.home, a.id) <= dp.travelNm).map((a) => a.id);
    let day = dp.soonest;
    for (let k = 0; k < dp.count; k++) {
      if (parseIso(addDays(day)).getDay() === 0) day++; // no Sundays
      const airport = near.length && r() < 0.25 ? near[Math.floor(r() * near.length)] : dp.home;
      const time = ["08:00", "08:30", "09:00", "12:30", "13:00"][Math.floor(r() * 5)];
      slots.push({ id: mkId(++n), dpeId: dp.id, date: addDays(day), time, airport, certs: Object.keys(dp.fees), status: "open", bookingId: null });
      day += dp.gap + Math.floor(r() * 3);
    }
    return n;
  }
  // B: TX / CA / AZ sample calendars get their own id prefix ("ms"), so the Florida slot ids (s1..) stay exactly as before.
  function addMultiStateSlots(slots) {
    let m = 0;
    D.dpes.forEach((dp, i) => { if (MULTI_STATE.includes(dp.id)) m = genSlots(slots, dp, i, m, (k) => "ms" + k); });
  }
  function seed() {
    const slots = [];
    let n = 0;
    D.dpes.forEach((dp, i) => { if (!MULTI_STATE.includes(dp.id)) n = genSlots(slots, dp, i, n); });
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
    n = addTripleDays(slots, n);
    addMultiStateSlots(slots);
    const avail = {};
    D.dpes.forEach((dp, i) => { const ts = Date.now() - ((i % 4) * 24 + i + 2) * 3600e3; avail[dp.id] = { confirmedAt: ts, updatedAt: ts, reminderDay: 0, pauseReminders: false }; });
    return {
      v: 3, fl: 1, ms: 1, role: "pilot", nextId: 1000, slots, bookings, avail,
      alerts: [{ id: "a1", cert: "ppl", near: "KORL", radius: 75, before: addDays(45), maxFee: 1300, dpeId: "", channels: ["email"], createdAt: Date.now() }],
      notifications: [{ id: "n1", ts: Date.now(), title: "Your first sample alert is active", body: "Mock alert, nothing is emailed. In a real version we would tell you when a Private Pilot checkride opens within 75 nm of KORL in the next 45 days for $1,300 or less.", read: false }],
      checklist: {}, curated: {}, ticks: {}, tier: "free",
      // QA-026 / D38 #7: a fresh profile shows a target month and a dated roll-up. Sample KT date (about 10 months ago), example data only.
      target: defaultTarget(), ready9Dates: { kt: addDays(-300) }, ktSample: true,
      pending: D.pendingDpes.map((p) => ({ ...p, status: "pending" })),
      approvedDpes: [], actingDpe: "d1", p4: 1,
    };
  }
  // Older v3 state (before the Florida sample set and the proposed tiers) is upgraded in place, keeping the user's bookings.
  function migrate(s) {
    if (!s.target) s.target = defaultTarget();
    if (!s.fl) {
      const fresh = seed(), have = new Set(s.slots.map((x) => x.dpeId));
      fresh.slots.filter((x) => !have.has(x.dpeId) && !MULTI_STATE.includes(x.dpeId)).forEach((x) => s.slots.push({ ...x, id: "fl-" + x.id }));
      s.avail = s.avail || {};
      Object.entries(fresh.avail).forEach(([k, v]) => { if (!s.avail[k]) s.avail[k] = v; });
      s.fl = 1;
    }
    if (!s.p4) {
      // Phase 4: add the sample capacity-3 days to saved demos without touching existing slots or bookings.
      const have = new Set(s.slots.map((x) => x.dpeId + "_" + x.date + "_" + x.time));
      const tmp = s.slots.map((x) => ({ ...x }));
      addTripleDays(tmp, 0, (k) => "p4s" + k);
      tmp.filter((x) => x.id.startsWith("p4s") && !have.has(x.dpeId + "_" + x.date + "_" + x.time)).forEach((x) => s.slots.push(x));
      s.p4 = 1;
    }
    if (!s.ms && MULTI_STATE.length) {
      // B: saved demos get the TX / CA / AZ sample calendars without touching existing slots or bookings.
      const have = new Set(s.slots.map((x) => x.id));
      const tmp = []; addMultiStateSlots(tmp);
      tmp.filter((x) => !have.has(x.id)).forEach((x) => s.slots.push(x));
      s.avail = s.avail || {};
      const ts = Date.now() - 26 * 3600e3;
      MULTI_STATE.forEach((id) => { if (!s.avail[id]) s.avail[id] = { confirmedAt: ts, updatedAt: ts, reminderDay: 0, pauseReminders: false }; });
      s.ms = 1;
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
  // ---- Examiner-edited fees & policies (UF#2). Saved in S.dpeEdits and applied over the sample data, so every screen reads the same values. ----
  const EDIT_KEYS = ["fees", "depositUsd", "depositTerms", "travelNm", "travelFee", "retestFee", "cancellation"];
  const ORIG = {};
  function applyDpeEdits() {
    allDpes().forEach((dp) => {
      if (!ORIG[dp.id]) ORIG[dp.id] = JSON.parse(JSON.stringify(Object.fromEntries(EDIT_KEYS.map((k) => [k, dp[k] ?? null]))));
      const o = ORIG[dp.id];
      EDIT_KEYS.forEach((k) => { dp[k] = o[k] && typeof o[k] === "object" ? { ...o[k] } : o[k]; });
      const e = (S.dpeEdits || {})[dp.id];
      if (e) EDIT_KEYS.forEach((k) => { if (e[k] !== undefined) dp[k] = k === "fees" ? { ...dp.fees, ...e.fees } : e[k]; });
    });
  }
  applyDpeEdits();

  // ---------- queries ----------
  const openSlots = ({ dpeId, cert, before, state } = {}) => {
    return S.slots
      .filter((s) => s.status === "open" && s.date >= slotToday(s) && !slotPast(s) && !isStale(s.dpeId) && (!dpeId || s.dpeId === dpeId) && (!cert || s.certs.includes(cert)) && (!before || s.date <= before) && (!state || aptState(s.airport) === state))
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
  // QA-040: the weekly pattern only manages pattern slots. One-off openings (Publish form, simulated) are never moved,
  // re-timed or removed by a pattern save, and the toast counts only real changes. QA-039: days before the publish form's
  // lead-time rule (a date after today at that airport) are skipped.
  const isOneOff = (x) => x.src === "oneoff" || !!x.simulated;
  function applyAvailability(dp, days) {
    const created = []; let closedDays = 0, keptDays = 0, openedDays = 0, skipped = 0, removed = 0, updated = 0, oneOffs = 0;
    days.forEach((d) => {
      if (d.date <= todayIn(aptTz(d.airport || dp.home))) return;
      const all = S.slots.filter((x) => x.dpeId === dp.id && x.date === d.date && x.status !== "removed");
      const cur = all.filter((x) => !isOneOff(x));
      const ones = all.length - cur.length, c0 = created.length + removed + updated; // one-offs are only mentioned for days the save changed
      const taken = cur.filter((x) => x.status !== "open");
      const opens = cur.filter((x) => x.status === "open").sort((a, b) => a.time.localeCompare(b.time));
      if (!d.open) { opens.forEach((x) => { x.status = "removed"; }); removed += opens.length; if (opens.length) { closedDays++; oneOffs += ones; } if (taken.length) keptDays++; return; }
      const want = Math.max(d.cap, taken.length) - taken.length;
      const drop = opens.slice(want); drop.forEach((x) => { x.status = "removed"; }); removed += drop.length;
      const keep = opens.slice(0, want);
      skipped += keep.length; // C (Marlo): openings already published for this day are kept, never re-created
      if (!cur.length) openedDays++;
      const base = keep[0] ? { airport: keep[0].airport, note: keep[0].note || "" } : null; // the row shows the first open slot's fields
      keep.forEach((x, i) => {
        const before = x.time + "|" + x.airport + "|" + (x.note || "");
        // QA-040: a plain save never rewrites other slots; only fields the examiner actually changed in the row are applied
        if (i === 0 || d.airport !== base.airport) x.airport = d.airport;
        if (i === 0 || (d.note || "") !== base.note) x.note = d.note;
        if (i === 0 && !all.some((y) => y !== x && y.status !== "removed" && y.time === d.time)) x.time = d.time;
        if (x.time + "|" + x.airport + "|" + (x.note || "") !== before) { updated++; skipped--; }
      });
      for (let i = keep.length; i < want; i++) {
        const used = S.slots.filter((y) => y.dpeId === dp.id && y.date === d.date && y.status !== "removed").map((y) => y.time);
        const time = i === 0 && !keep.length && !used.includes(d.time) ? d.time : (SLOT_TIMES.find((tm) => !used.includes(tm)) || "16:30");
        if (used.includes(time)) { skipped++; continue; } // same examiner, date and start time already published
        const ns = { id: uid("s"), dpeId: dp.id, date: d.date, time, airport: d.airport, certs: Object.keys(dp.fees), status: "open", bookingId: null, note: d.note, src: "weekly" };
        S.slots.push(ns); created.push(ns);
      }
      if (created.length + removed + updated > c0) oneOffs += ones;
    });
    return { created, closedDays, keptDays, openedDays, skipped, removed, updated, oneOffs };
  }

  // ---------- (e) location: airport/city text with a picker, or a mock "sample location" (no GPS, no network) ----------
  const aptLabel = (a) => `${a.id} – ${a.city} (${a.name})`;
  // QA-049: well-known airports outside the sample states (public ICAO codes, reference only, no examiner data). Typing one
  // shows that state's outside-coverage panel instead of "Couldn't find".
  const OUT_ICAO = { KJFK: "NY", KLGA: "NY", KALB: "NY", KBUF: "NY", KROC: "NY", KSYR: "NY", KISP: "NY", KHPN: "NY", KFRG: "NY", KEWR: "NJ", KTEB: "NJ", KMMU: "NJ",
    KBOS: "MA", KBED: "MA", KBDL: "CT", KPVD: "RI", KMHT: "NH", KPWM: "ME", KBTV: "VT", KPHL: "PA", KPIT: "PA", KBWI: "MD", KDCA: "VA", KIAD: "VA", KRIC: "VA",
    KILG: "DE", KCRW: "WV", KCLT: "NC", KRDU: "NC", KCHS: "SC", KATL: "GA", KPDK: "GA", KSAV: "GA", KBHM: "AL", KJAN: "MS", KMSY: "LA", KBNA: "TN", KMEM: "TN",
    KSDF: "KY", KCVG: "KY", KCLE: "OH", KCMH: "OH", KDTW: "MI", KIND: "IN", KORD: "IL", KMDW: "IL", KMKE: "WI", KMSP: "MN", KDSM: "IA", KSTL: "MO", KMCI: "MO",
    KLIT: "AR", KOKC: "OK", KTUL: "OK", KICT: "KS", KOMA: "NE", KFSD: "SD", KFAR: "ND", KDEN: "CO", KAPA: "CO", KCOS: "CO", KABQ: "NM", KSLC: "UT", KLAS: "NV",
    KRNO: "NV", KBOI: "ID", KBIL: "MT", KCYS: "WY", KSEA: "WA", KBFI: "WA", KPDX: "OR", PANC: "AK", PAFA: "AK", PHNL: "HI", PHOG: "HI" };
  const outsideStateFor = (str) => { const t = String(str || "").trim().toUpperCase().split(/[\s,–-]+/)[0]; return OUT_ICAO[t] || OUT_ICAO["K" + t] || ""; };
  function resolveAirport(str) {
    const s = String(str || "").trim().toUpperCase();
    if (!s) return null;
    const tok = s.split(/[\s–-]+/)[0];
    const byId = D.airports.find((a) => a.id === tok || a.id === "K" + tok);
    if (byId) return byId.id;
    const t = s.replace(/,?\s*(FL(ORIDA)?|TX|TEXAS|CA|CALIFORNIA|AZ|ARIZONA)$/, "").trim();
    const a = D.airports.find((x) => x.city.toUpperCase() === t) || D.airports.find((x) => x.city.toUpperCase().startsWith(t)) || D.airports.find((x) => x.name.toUpperCase().includes(t));
    return a ? a.id : null;
  }
  const locationField = (near, id = "loc", state = "") => `<div class="loc-field">
      <label class="field"><span>Near me: airport or city</span><input name="nearText" list="${id}-list" autocomplete="off" value="${esc(aptLabel(apt(near)))}" aria-describedby="${id}-hint" /></label>
      <input type="hidden" name="near" value="${near}" />
      <datalist id="${id}-list">${D.airports.filter((a) => !state || a.state === state).map((a) => `<option value="${esc(aptLabel(a))}"></option>`).join("")}</datalist>
      <div class="row small" id="${id}-hint" style="gap:.5rem"><button type="button" class="btn ghost sm" data-action="sample-location">Use a sample location</button><span class="muted">Mock: picks a sample airport, no GPS.</span></div>
    </div>`;

  function searchDpes(f) {
    const out = [];
    allDpes().forEach((dp) => {
      const fee = dp.fees[f.cert];
      if (!fee || (f.maxFee && fee > f.maxFee) || (f.state && dpeState(dp) !== f.state) || !reachable(dp, f.near, f.radius)) return;
      const slots = openSlots({ dpeId: dp.id, cert: f.cert, before: f.before });
      const soonest = slots[0] || null;
      out.push({ dp, fee, dist: distNm(dp.home, f.near), slots, soonest, slotDist: soonest ? distNm(soonest.airport, f.near) : distNm(dp.home, f.near), travel: travelCost(dp, f.near) });
    });
    const bySoon = (a, b) => (a.soonest ? a.soonest.date : "9999").localeCompare(b.soonest ? b.soonest.date : "9999");
    // Soonest first; same day goes to the closer checkride airport, then the lower fee.
    const sorters = { soonest: (a, b) => bySoon(a, b) || a.slotDist - b.slotDist || a.fee - b.fee, fee: (a, b) => a.fee - b.fee || bySoon(a, b), distance: (a, b) => a.slotDist - b.slotDist || bySoon(a, b) };
    return out.sort(sorters[f.sort] || sorters.soonest);
  }

  // D12 (ux-copy-v3 §3): readiness is shown as a count plus a status label, never as a percentage.
  function checklistCount(cert) {
    const items = (D.checklists[cert] || []).flatMap((c) => c.items);
    return { n: items.filter((i) => S.checklist[cert]?.[i.id]).length, total: items.length };
  }
  // Sample data stores readiness as a share; convert to the 9-item count (rounded down, so nobody shows ready early).
  const of9 = (share) => Math.max(0, Math.min(9, Math.floor((share / 100) * 9 + 1e-9)));
  const readyLabel = (n, total) => (n <= 0 ? "Not started" : n >= total ? "Ready for review" : "In progress");
  const readyCls = (n, total) => (n <= 0 ? "" : n >= total ? "good" : "accent");
  const readyText = (n, total = 9) => `${n} of ${total} ready \u00b7 ${readyLabel(n, total)}`;
  const countPill = (n, total = 9) => `<span class="pill ${readyCls(n, total)}" data-ready="${n}/${total}">${readyText(n, total)}</span>`;
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

  // Link from a notification to the examiner profile with that slot preselected (the request form opens automatically).
  const notifLink = (n, slot) => `#/dpe/${n.dpeId}?cert=${n.cert}&date=${slot.date}&slot=${n.slotId}`;
  // Optional OS-level notification, only if the user already granted permission from the Alerts page button. Shown by this
  // page only: no push server, no email, no SMS. Never asks for permission by itself.
  function browserNotify(n) {
    try {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const slot = S.slots.find((x) => x.id === n.slotId);
      const opts = { body: `${n.body}\nSimulated in this prototype. Nothing was emailed or texted.`, tag: n.id, icon: "icons/icon-192.png", data: { hash: slot ? notifLink(n, slot) : "#/alerts" } };
      try {
        const bn = new Notification(n.title, opts);
        bn.onclick = () => { window.focus(); location.hash = opts.data.hash; bn.close(); };
      } catch (e) {
        // Some mobile browsers only allow notifications through the service worker.
        if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then((r) => r.showNotification(n.title, opts)).catch(() => {});
      }
      ui.browserNotified = (ui.browserNotified || 0) + 1;
    } catch (e) { /* optional feature */ }
  }

  // Demo control: creates a clearly labelled simulated opening that matches an alert (or for one examiner), then runs the
  // normal alert matching. Example data only; nothing is sent.
  // Extra (QA-050 note): Simulate opening looks disabled during its 1.2 s lock. aria-disabled (not disabled) keeps keyboard focus on it.
  function simBusy() {
    const mark = (on) => document.querySelectorAll('[data-action="sim-open"]').forEach((b) => { b.classList.toggle("is-busy", on); if (on) { b.setAttribute("aria-disabled", "true"); b.setAttribute("aria-busy", "true"); } else { b.removeAttribute("aria-disabled"); b.removeAttribute("aria-busy"); } });
    mark(true); setTimeout(() => mark(true), 0);
    setTimeout(() => mark(false), Math.max(0, (ui.simLock || 0) - Date.now()));
  }
  function simulateOpening({ alertId, dpeId }) {
    const a = alertId ? S.alerts.find((x) => x.id === alertId) : null;
    let dp = null, cert = null;
    if (a) {
      cert = a.cert;
      const cands = (a.dpeId ? [dpeById(a.dpeId)] : allDpes()).filter((d) => d && d.fees[cert] && (!a.maxFee || d.fees[cert] <= a.maxFee) && reachable(d, a.near, a.radius));
      dp = cands.find((d) => !isStale(d.id)) || cands[0];
      if (!dp) { toast("No sample examiner fits this alert (fee or distance), so nothing was simulated. Try a wider radius or higher fee limit."); return; }
    } else {
      dp = dpeById(dpeId) || D.dpes[0];
      cert = Object.keys(dp.fees)[0];
    }
    const last = a && a.before ? a.before : addDays(60);
    let date = null;
    for (let i = 2; i <= 60 && addDays(i) <= last; i++) { const d = addDays(i); if (!S.slots.some((x) => x.dpeId === dp.id && x.date === d && x.status !== "removed")) { date = d; break; } }
    date = date || addDays(1);
    S.simSeq = (S.simSeq || 0) + 1;
    const slot = { id: "sim" + S.simSeq + "x" + (S.nextId++), dpeId: dp.id, date, time: "09:30", airport: dp.home, certs: Object.keys(dp.fees), status: "open", bookingId: null, note: "Simulated opening (demo, not a real examiner)", simulated: true };
    S.slots.push(slot);
    fireAlerts(slot, "open");
    rerender();
    return slot;
  }

  // Runs when a slot opens up (new opening, cancellation, released request).
  // In-app notice to the booked student when the examiner cancels (ux-copy-v2 5.4 / 5.5). PM default, pending Drewbert and a lawyer.
  function cancelNotice(b, s, dp) {
    const c = b.cancel, f1 = first(dp.name), when = slotAt(s), dep = b.depositUsd ?? depositFor(dp, b.cert);
    const lines = [];
    let title, body;
    if (c.by === "examiner") {
      title = `${dp.name} cancelled your checkride`;
      body = `Your ${certById(b.cert).name} checkride on ${when} is cancelled by the examiner.`;
      if (FEES) lines.push({ t: "Because the examiner cancelled, Checkride Connect will refund or credit your $15 booking fee. We\u2019ll show which here once it\u2019s decided.", tag: 1 });
      lines.push({ t: `Your ${money(dep)} deposit was paid directly to ${f1} and follows their terms: \u201c${depTerms(dp)}\u201d. Questions about it go to ${f1}.` });
    } else if (c.by === "weather" || c.by === "maintenance") {
      const why = c.by === "weather" ? "weather" : "aircraft maintenance";
      title = `Checkride cancelled for ${why}`;
      body = `Your checkride with ${dp.name} on ${when} is off because of ${why}. Totally normal. It happens to everyone.`;
      if (FEES) lines.push({ t: "For weather and maintenance cancellations, Checkride Connect will refund or credit your $15 booking fee. We\u2019ll show which here once it\u2019s decided.", tag: 1 });
      lines.push({ t: `Your deposit follows ${f1}\u2019s terms: \u201c${depTerms(dp)}\u201d.` });
    } else {
      title = `Your checkride with ${dp.name} is cancelled`;
      body = `${f1} recorded that you asked to cancel your ${certById(b.cert).name} checkride on ${when}.`;
      if (FEES) lines.push({ t: studentCancelBody(s, c.aheadMs), tag: 1 });
      lines.push({ t: `Your ${money(dep)} deposit was paid directly to ${f1} and follows their terms: \u201c${depTerms(dp)}\u201d.` });
    }
    if (c.note) lines.unshift({ t: `${f1}: \u201c${c.note}\u201d` });
    if (!FEES) lines.push({ t: FREE_LINE });
    lines.push({ t: "Prototype: nothing is charged." });
    return { id: uid("n"), ts: Date.now(), read: false, kind: "booking-cancel", bookingId: b.id, dpeId: dp.id, cert: b.cert, title, body, lines, channel: "In-app notice (mock) \u00b7 nothing was emailed or texted" };
  }
  function fireAlerts(slot, kind, { skipMine = false, quiet = false } = {}) {
    if (slotPast(slot)) return; // QA-039: no alert for a slot that has already started
    const dp = dpeById(slot.dpeId);
    const matched = skipMine ? [] : S.alerts.filter((a) => alertMatches(a, slot));
    // Stand-in for other pilots' alerts in a real system.
    const others = 1 + (parseInt(slot.id.replace(/\D/g, ""), 10) % 6);
    matched.forEach((a) => {
      const c = certById(a.cert);
      const n = {
        id: uid("n"), ts: Date.now(), read: false, slotId: slot.id, dpeId: dp.id, cert: a.cert, simulated: !!slot.simulated,
        title: (slot.simulated ? "Simulated: " : "") + (kind === "cancel" ? `Cancellation: earlier ${c.short} checkride` : `New ${c.short} opening`),
        body: `${dp.name} · ${fmtDate(slot.date)} at ${slotTime(slot)} · ${slot.airport} (${relDays(slot.date, slotTz(slot))}) · ${money(dp.fees[a.cert])}`,
        channel: slot.simulated ? "Simulated mock alert · nothing was sent" : "Mock alert · nothing was sent",
      };
      S.notifications.unshift(n);
      browserNotify(n);
    });
    const total = matched.length + others;
    if (quiet) return total;
    toast(`${kind === "cancel" ? "Cancellation" : "Opening"} published (mock). ${matched.length ? `${plural(matched.length, "of your saved alerts")} matched, added to your Student-view inbox. ` : ""}No email, SMS or push is sent; a real version would also notify about ${plural(others, "other sample pilot")}.`);
  }

  // ---------- UI primitives ----------
  let lastToast = { msg: "", at: 0 };
  function toast(msg, kind) {
    // QA-016: one action can reach the same handler twice (Enter fires change + submit); show an identical message once.
    if (msg === lastToast.msg && Date.now() - lastToast.at < 1000) return;
    lastToast = { msg, at: Date.now() };
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : ""); // QA-073: kind "crit" = critical styling (stale-slot refusal)
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
    // QA-067: each region is named from its table's caption (or the card heading) and the names are unique on the page;
    // header cells get scope (col in thead, row in tbody).
    const used = new Map();
    root.querySelectorAll(".table-wrap").forEach((t) => {
      t.tabIndex = 0; t.setAttribute("role", "region");
      let l = t.getAttribute("aria-label");
      if (!l || l === "Scrollable table") {
        const cap = t.querySelector("caption"), h = t.closest("section, .card, .page") && t.closest("section, .card, .page").querySelector("h1, h2, h3");
        l = ((cap && cap.textContent) || (h && h.textContent) || "Table").replace(/\s+/g, " ").trim() + " (table)";
      }
      const n = (used.get(l) || 0) + 1; used.set(l, n);
      t.setAttribute("aria-label", n > 1 ? `${l} ${n}` : l);
    });
    root.querySelectorAll("table thead th:not([scope])").forEach((th) => th.setAttribute("scope", "col"));
    root.querySelectorAll("table tbody th:not([scope])").forEach((th) => th.setAttribute("scope", "row"));
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

  const certOptions = (val, only) => D.certs.filter((c) => !only || only.includes(c.id)).map((c) => `<option value="${c.id}" ${c.id === val ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  const certSelect = (name, val, only, label = "Certificate / rating") => `<label class="field"><span>${label}</span><select name="${name}">${certOptions(val, only)}</select></label>`;
  // B: grouped by state (FL / TX / CA / AZ) once more than one state is loaded.
  const airportSelect = (name, val, label = "Near", only) => {
    const list = D.airports.filter((a) => !only || only.includes(a.id));
    const opt = (a) => `<option value="${a.id}" ${a.id === val ? "selected" : ""}>${a.id} · ${esc(a.city)}</option>`;
    const states = COVERED_STATES.filter(([c]) => list.some((a) => a.state === c));
    const body = states.length > 1 ? states.map(([c, n]) => `<optgroup label="${n}">${list.filter((a) => a.state === c).map(opt).join("")}</optgroup>`).join("") : list.map(opt).join("");
    return `<label class="field"><span>${label}</span><select name="${name}">${body}</select></label>`;
  };
  const radiusSelect = (val) => `<label class="field"><span>Within</span><select name="radius">${[25, 50, 75, 100, 150, 250].map((r) => `<option value="${r}" ${r === val ? "selected" : ""}>${r} nm</option>`).join("")}</select></label>`;
  const feeSelect = (val) => `<label class="field"><span>Max fee</span><select name="maxFee"><option value="">Any</option>${[1000, 1200, 1300, 1500, 2000].map((v) => `<option value="${v}" ${v === val ? "selected" : ""}>Up to ${money(v)}</option>`).join("")}</select></label>`;
  const statCard = (v, l) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`;
  const statusPill = (st) => ({ requested: '<span class="pill warn">Awaiting review</span>', confirmed: '<span class="pill good">Confirmed</span>', declined: '<span class="pill bad">Declined</span>', cancelled: '<span class="pill">Cancelled</span>', open: '<span class="pill accent">Open</span>', held: '<span class="pill warn">Awaiting review</span>', booked: '<span class="pill good">Confirmed</span>' }[st] || "");
  // ux-copy-v3 req.status.*: request, not booking. Soft hold per D32 (req.status.pending / pending_nohold).
  // QA-028 (B): a pending request the student withdrew is "Withdrawn", not "Cancelled" (ux-copy-v3 §5.2a req.withdraw.*, req.card.withdrawn).
  const isWithdrawn = (b) => !!b && b.status === "cancelled" && !!(b.cancel && b.cancel.request);
  const WITHDRAWN_PILL = '<span class="pill" data-req-status="withdrawn">Withdrawn</span>';
  const bookingPill = (b) => (isWithdrawn(b) ? WITHDRAWN_PILL : statusPill(b.status));
  const reqPill = (b) => { if (isWithdrawn(b)) return WITHDRAWN_PILL; const f = first(dpeById(b.dpeId).name); return { requested: (() => { const sl = slotOf(b), he = sl && b.mine ? holdEnd(b, sl) : null; const held = he && he > Date.now(), ended = he && !held; const nohold = !!(sl && b.mine && b.createdAt && he === null); if (ended) return `<span class="pill" data-req-status="hold-ended" data-hold-ended>Hold ended</span>`; // QA-043: one state, no contradiction (wording pending PM)
 if (nohold) return `<span class="pill warn" data-req-status="pending" data-nohold>Awaiting ${esc(f)} \u00b7 No hold \u00b7 First to be accepted gets it</span>`; return `<span class="pill warn" data-req-status="pending"${held ? ` data-held-until="${he}"` : ""}${ended ? " data-hold-ended" : ""}>Awaiting ${esc(f)} \u00b7 ${held ? `Held for you until ${tsWhen(he, slotTz(sl))} \u00b7 ` : ended ? "Hold ended \u00b7 " : ""}Not confirmed yet</span>`; })(), confirmed: '<span class="pill good" data-req-status="confirmed">Confirmed</span>', declined: '<span class="pill bad" data-req-status="declined">Declined</span>', cancelled: '<span class="pill" data-req-status="cancelled">Cancelled</span>' }[b.status] || ""; };
  // v3 eyebrow + paired headline (ink line, accent line).
  const head = (eyebrow, a, b, lead = "", tag = "h1", extra = "") => `<div class="page-head v3-head"><p class="eyebrow">${eyebrow}</p><${tag} class="paired">${a}${b ? ` <span class="b">${b}</span>` : ""}${extra}</${tag}>${lead ? `<p class="lead muted">${lead}</p>` : ""}</div>`;

  // B: state = the state of the search airport. ?st= picks a state: a covered one (FL/TX/CA/AZ) moves the search to that state's
  // sample airport unless the airport is already there; any other US state shows the outside-coverage message (ux-copy-v3, D16).
  function searchFilters(q) {
    let near = apt(q.near) ? q.near : "KORL";
    const st = String(q.st || "").toUpperCase();
    let outside = "";
    if (st && COVERED_STATES.some(([c]) => c === st)) { if (aptState(near) !== st) near = STATE_HOME[st]; }
    else if (st && (US_STATES[st] || US_TERR[st] || /^[A-Z]{2}$/.test(st))) outside = st; // QA-049: an unknown or territory code shows the outside panel, never Florida silently
    return { cert: certById(q.cert) ? q.cert : "ppl", near, state: aptState(near), outside, radius: +q.radius || 75, before: q.before || "", maxFee: +q.maxFee || 0, sort: q.sort || "soonest" };
  }
  const US_TERR = { PR: "Puerto Rico", GU: "Guam", VI: "the U.S. Virgin Islands", AS: "American Samoa", MP: "the Northern Mariana Islands" };
  const stateName = (c) => (COVERED_STATES.find(([k]) => k === c) || [c, US_STATES[c] || US_TERR[c] || "this state"])[1]; // QA-055: never the raw code
  const OUTSIDE_COPY = "This prototype only has sample examiners in FL, TX, CA and AZ so far. Pick an airport there to try it out.";
  const stateSelect = (cur) => `<label class="field"><span>State</span><select name="st" data-state-select>
      ${!COVERED_STATES.some(([k]) => k === cur) && !US_STATES[cur] && !US_TERR[cur] ? `<option value="" selected disabled>${COPY["search.state.placeholder"]}</option>` : ""}
      <optgroup label="Sample examiners">${COVERED_STATES.map(([c, n]) => `<option value="${c}" ${c === cur ? "selected" : ""}>${c} · ${n}</option>`).join("")}</optgroup>
      <optgroup label="Not covered yet">${Object.entries(US_STATES).filter(([c]) => !COVERED_STATES.some(([k]) => k === c)).map(([c, n]) => `<option value="${c}" ${c === cur ? "selected" : ""}>${c} · ${n}</option>`).join("")}</optgroup>
      <optgroup label="Territories (not covered yet)">${Object.entries(US_TERR).map(([c, n]) => `<option value="${c}" ${c === cur ? "selected" : ""}>${c} · ${n.replace(/^the /, "")}</option>`).join("")}</optgroup>
    </select></label>`;
  const outsideCoverage = (st) => `<section class="card empty state" id="outside-coverage" data-state="outside" data-outside="${st}">
      <h2 style="margin:0 0 .35rem">No sample examiners in ${esc(stateName(st))} yet</h2>
      <p style="margin:0">${OUTSIDE_COPY}</p>
      <div class="row" style="margin-top:.75rem;gap:.5rem;flex-wrap:wrap">${COVERED_STATES.map(([c, n]) => `<a class="btn secondary sm" href="#/search?st=${c}">${n}</a>`).join("")}</div>
    </section>`;
  const toQuery = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== "" && v != null && v !== 0)).toString();

  // ---------- views ----------
  function viewHome() {
    const next = openSlots({ cert: "ppl", state: "FL" }); // B: the demo pilot flies from KORL, so Home shows Florida openings
    const rows = next.slice(0, 5).map((s, i) => {
      const dp = dpeById(s.dpeId);
      return `<a class="board-row" style="--i:${i}" href="#/dpe/${dp.id}?cert=ppl&date=${s.date}">
        ${dateTile(s.date)}
        <span class="b-who"><b>${esc(dp.name)}</b><small>${s.airport} \u00b7 <span class="mono">${slotTime(s)}</span> \u00b7 ${relDays(s.date, slotTz(s))}</small></span>
        <span class="b-fee mono">${money(dp.fees.ppl)}</span>
      </a>`;
    }).join("");
    const cur = activeReq(), n = ready9Count();
    const cdp = cur && dpeById(cur.dpeId), cs = cur && slotOf(cur);
    const ms = cur && cur.status === "confirmed" ? `${chip("good", `Confirmed: ${fmtDate(cs.date)}`)}` : cur ? reqPill(cur) : `<span class="small muted">No request yet</span>`;
    return `
    <div class="page home-v3">
      <div class="ws-grid">
        <div class="stack">
          ${head("FOR STUDENT PILOTS", "Find your checkride.", "Sooner.", "Compare openings, fees and wait times across examiners near you.")}
          <form class="card search-box stack" data-form="search">
            ${certSelect("cert", "ppl")}
            ${locationField("KORL", "loc-h")}
            ${radiusSelect(75)}
            <label class="field"><span>Before (optional)</span><input type="date" name="before" min="${addDays(1)}" /></label>
            <button class="btn cta" type="submit">Search openings</button>
          </form>
          <a class="card milestone" href="#/journey">
            <p class="eyebrow">YOUR NEXT MILESTONE</p>
            <div class="row spread"><b>${esc(certLong(cur ? cur.cert : "ppl"))}</b><span class="mono small">${readyText(n)}</span></div>
            ${seg9(n)}
            <div class="row spread">${ms}<span class="small">Open</span></div>
            ${cdp ? `<span class="sr-only">with ${esc(cdp.name)}</span>` : ""}
          </a>
        </div>
        <aside class="board" aria-label="Next Private Pilot openings">
          <div class="board-head"><span>Next openings \u00b7 Private</span><span class="pill">Sample</span></div>
          <div class="board-rows">${rows || `<p class="muted small">No openings right now</p>`}</div>
          <div class="board-foot"><a class="see-all" href="#/search?cert=ppl">See all</a></div>
        </aside>
      </div>
    </div>`;
  }

  function searchEmpty(f) {
    const radii = [25, 50, 75, 100, 150, 250], wider = radii.find((r) => r > f.radius);
    const acts = [];
    if (wider) acts.push(`<a class="btn" href="#/search?${toQuery({ ...f, radius: wider, sort: f.sort === "soonest" ? "" : f.sort })}">Search within ${wider} nm</a>`);
    if (f.maxFee) acts.push(`<a class="btn secondary" href="#/search?${toQuery({ ...f, maxFee: 0, sort: f.sort === "soonest" ? "" : f.sort })}">Remove the max fee</a>`);
    if (f.before) acts.push(`<a class="btn secondary" href="#/search?${toQuery({ ...f, before: "", sort: f.sort === "soonest" ? "" : f.sort })}">Remove the date limit</a>`);
    acts.push(`<a class="btn ghost" href="#/search?${toQuery({ cert: f.cert, near: f.near })}">Clear filters</a>`);
    const why = [f.maxFee ? `fee up to ${money(f.maxFee)}` : "", f.before ? `checkride before ${fmtDateA(f.before)}` : ""].filter(Boolean).join(", ");
    return emptyState({ id: "search-empty", ic: "search", title: "No sample examiners match these filters",
      body: `Nothing for ${esc(certById(f.cert).name)} within ${f.radius} nm of ${esc(f.near)}${why ? ` with ${why}` : ""}. Widen the search, or save a mock alert above to hear about new openings.`, actions: acts.join("") });
  }
  function viewSearch(q) {
    const f = searchFilters(q);
    const results = f.outside ? [] : searchDpes(f);
    const inState = allDpes().filter((dp) => dpeState(dp) === f.state).length;
    const c = certById(f.cert);
    const fees = results.map((r) => r.fee);
    const soonest = results.find((r) => r.soonest)?.soonest;
    const withSlots = results.filter((r) => r.slots.length);
    return `<div class="page split">
      <aside class="card sticky">
        <h2>Filters</h2>
        <form class="stack" data-form="search" data-auto>
          ${stateSelect(f.outside || f.state)}
          ${certSelect("cert", f.cert)}
          ${locationField(f.near, "loc-s", f.outside ? "" : f.state)}
          ${radiusSelect(f.radius)}
          <label class="field"><span>Checkride before</span><input type="date" name="before" value="${esc(f.before)}" min="${addDays(1)}" /></label>
          ${feeSelect(f.maxFee)}
          <label class="field"><span>Sort by</span><select name="sort">
            ${[["soonest", "Soonest opening"], ["fee", "Lowest fee"], ["distance", "Closest checkride airport"]].map(([v, l]) => `<option value="${v}" ${v === f.sort ? "selected" : ""}>${l}</option>`).join("")}
          </select></label>
        </form>
      </aside>
      <section class="stack">
        <div class="page-head v3-head" style="margin:0">
          <p class="eyebrow">Search</p>
          <h1>${f.outside ? `${esc(c.short)} checkrides in ${esc(stateName(f.outside))}` : `Soonest ${esc(c.short)} checkrides near ${f.near}`}</h1>
          <p class="muted small" id="search-helper" style="margin:0 0 .25rem">Soonest openings first. Fees shown are each examiner's own.</p>
          ${f.outside ? "" : `<p class="muted" style="margin:0" id="search-count">${results.length} of ${inState} sample examiners in ${esc(stateName(f.state))} match${fees.length ? (Math.min(...fees) === Math.max(...fees) ? ` · fee ${money(fees[0])}` : ` · fees ${money(Math.min(...fees))}–${money(Math.max(...fees))}`) : ""}${soonest ? ` · soonest opening ${fmtDate(soonest.date)} (${relDays(soonest.date, slotTz(soonest))})` : ""}</p>`}
        </div>
        ${f.outside ? outsideCoverage(f.outside) : ""}
        ${(() => { const top = f.sort === "soonest" ? withSlots[0] : null; if (!top) return ""; return `<div class="card soonest-lead" id="soonest-lead"><div class="small muted">Soonest checkride near ${f.near} (sample)</div>
          <div class="soonest-big"><b>${fmtDate(top.soonest.date, { weekday: "short", month: "short", day: "numeric" })}</b> · ${slotTime(top.soonest)} · ${top.soonest.airport} <span class="muted small">${top.slotDist <= 2 ? "at your airport" : top.slotDist + " nm away"}</span></div>
          <div class="small">${esc(top.dp.name)} ${sampleBadge()} · ${money(top.fee)} · ${relDays(top.soonest.date, slotTz(top.soonest))}</div>
          <a class="btn sm" style="margin-top:.5rem" href="#/dpe/${top.dp.id}?cert=${f.cert}&date=${top.soonest.date}&near=${f.near}">See this opening</a></div>`; })()}
        ${f.outside ? "" : `<div class="cta-banner row spread">
          <div><b>Want an earlier date?</b> <span class="muted">Save this search as a mock alert (stored in this browser, no email sent).</span></div>
          <button class="btn sm" data-action="alert-from-search">Save mock alert</button>
        </div>
        <h2 class="sr-only">Examiners</h2>
        ${results.length ? [...withSlots, ...results.filter((r) => !r.slots.length)].map((r) => resultCard(r, f)).join("") : searchEmpty(f)}`}
      </section>
    </div>`;
  }

  function resultCard(r, f) {
    const { dp } = r;
    const atHome = r.slots.length && r.slots.every((s) => s.airport === dp.home);
    const where = r.dist <= 10 ? `Based at ${f.near}` : r.travel != null ? (atHome ? `Listed openings are at ${dp.home} (${r.dist} nm); can travel to ${f.near} for +${money(r.travel)} on request` : `Travels to ${f.near} (+${money(r.travel)})`) : `You fly to ${dp.home} (${r.dist} nm)`;
    const chips = r.slots.slice(0, 4).map((s) => `<a class="chip ${daysUntil(s.date, slotTz(s)) <= 14 ? "soon" : ""}" href="#/dpe/${dp.id}?cert=${f.cert}&date=${s.date}">${fmtDate(s.date)} · ${slotTime(s)}${s.airport !== dp.home ? " · " + s.airport : ""}</a>`).join("");
    return `<article class="card result">
      <div class="avatar">${initials(dp.name)}</div>
      <div>
        <div class="row" style="gap:.5rem"><h3 style="margin:0"><a href="#/dpe/${dp.id}?cert=${f.cert}">${esc(dp.name)}</a></h3>${sampleBadge()}</div>
        <div class="muted small">${esc(apt(dp.home).city)} · ${dp.home} · replies in ~${dp.responseHours}h${sampleOf(dp).avgDaysToNext != null ? ` · avg wait ${plural(sampleOf(dp).avgDaysToNext, "day")} (sample)` : ""}</div>
        <div class="small">${where}${r.soonest ? ` · next opening ${r.slotDist <= 2 ? "at " + r.soonest.airport : r.slotDist + " nm away at " + r.soonest.airport}` : ""}</div>
        ${freshOf(dp.id).level === "ok" ? "" : `<div class="small" style="margin-top:.25rem">${freshBadge(dp.id)}</div>`}
        ${r.slots.length
          ? `<div class="chips">${chips}${r.slots.length > 4 ? `<a class="small more-link" style="align-self:center" href="#/dpe/${dp.id}?cert=${f.cert}">+${r.slots.length - 4} more</a>` : ""}</div>`
          : isStale(dp.id) ? `<p class="small muted" style="margin:.5rem 0 0">Openings hidden until the examiner confirms them again.</p>`
          : `<p class="small muted" style="margin:.5rem 0 0">No openings in your date range. <a href="#" data-action="alert-from-search" data-dpe="${dp.id}">Save a mock alert for ${esc(first(dp.name))}</a></p>`}
      </div>
      <div class="price" style="text-align:right">
        <div class="amt">${money(r.fee)}</div><div class="muted small">${esc(certById(f.cert).short)} fee</div>
        ${r.soonest ? `<div class="pill good" style="margin-top:.4rem">Soonest ${relDays(r.soonest.date, slotTz(r.soonest))}</div>` : `<div class="pill" style="margin-top:.4rem">${isStale(dp.id) ? "Not confirmed" : "No openings"}</div>`}
      </div>
    </article>`;
  }

  function viewProfile(q, id) {
    const dp = dpeById(id);
    if (!dp) return `<div class="page">${emptyState({ id: "dpe-not-found", ic: "search", h: "h1", title: "Examiner not found", body: "This sample examiner isn\u2019t in the data set (links can go stale after a reset).", actions: `<a class="btn" href="#/find">Back to Find a DPE</a>` })}</div>`; // QA-072
    const certIds = Object.keys(dp.fees);
    const cert = certIds.includes(q.cert) ? q.cert : certIds[0];
    // QA-045 (D40): ATP and rotorcraft have no estimator yet. A ?cert=atp|rh link says so instead of silently showing another cert's numbers.
    const noEst = !certIds.includes(q.cert) && (q.cert === "atp" || q.cert === "rh") ? q.cert : "";
    const noEstName = noEst ? (((dp.otherAuthorizations || []).find((o) => o.id === noEst) || {}).name || (noEst === "atp" ? "ATP" : "Rotorcraft")) : "";
    const near = nearFor(q.near, dp);
    const slots = openSlots({ dpeId: dp.id });
    // Reset the picker whenever the URL changes (new examiner, a slot link or a "Next opening" link).
    // QA-070: the day only ever changes because the student chose it. A ?date= with no openings, or a picked slot that has
    // started, stays on that day with a message; the sticky bar never re-targets to another date on its own.
    if (ui.profileKey !== location.hash) {
      const want = q.pick || q.slot || null, ws = want ? S.slots.find((s) => s.id === want && s.dpeId === dp.id) : null;
      ui.profileKey = location.hash; ui.v4pick = want; ui.v4cur = null; ui.v4lost = null; ui.v4needPick = false; ui.dateMoved = null;
      ui.sel = q.date || (ws && ws.date) || slots.find((s) => s.certs.includes(cert))?.date || slots[0]?.date || null; ui.selFixed = !!(q.date || ws);
      if (want && !(ws && slotLive(ws) && !isStale(dp.id))) { ui.v4pick = null; ui.v4needPick = true; if (ws && !q.slot) ui.v4lost = { id: ws.id, date: ws.date, time: slotTime(ws), started: slotPast(ws) }; }
      ui.month = (ui.sel || iso(today0())).slice(0, 7);
    }
    else if (!ui.sel && slots.length) { ui.sel = slots[0].date; ui.month = ui.sel.slice(0, 7); }
    // QA-070: the slot the sticky bar was showing has started (60 s re-check, focus, visibility) or was taken: clear the pick,
    // keep the student's day, say so, and keep focus on the message instead of <body>.
    { const cur = ui.v4cur && S.slots.find((s) => s.id === ui.v4cur);
      if (cur && cur.dpeId === dp.id && !(slotLive(cur) && !isStale(dp.id))) {
        ui.v4lost = { id: cur.id, date: cur.date, time: slotTime(cur), started: slotPast(cur) }; ui.v4pick = null; ui.v4cur = null; ui.v4needPick = true; ui.sel = cur.date; ui.selFixed = true;
        const a = document.activeElement;
        if (!ui.focusAfter && (!a || a === document.body || (a.closest && a.closest("#v4-openings")))) ui.focusAfter = "#slot-started || #day-none || #v4-op-h";
      } }
    const own = S.role === "dpe" && S.actingDpe === dp.id;
    // Arriving from an alert: highlight that slot and open the request form once for this link.
    const pick = q.slot ? S.slots.find((s) => s.id === q.slot && s.dpeId === dp.id && slotLive(s) && !isStale(dp.id)) : null;
    if (pick) { if (ui.autoReqKey !== location.hash) { ui.autoReqKey = location.hash; ui.pendingReq = [pick.id, q.cert]; } }
    const daySlots = ui.sel ? S.slots.filter((s) => s.dpeId === dp.id && s.date === ui.sel && s.status !== "removed" && !(s.status === "open" && slotPast(s))).sort((a, b) => a.time.localeCompare(b.time)) : [];
    return `<div class="page">
      ${own ? `<div class="cta-banner" style="margin-bottom:1rem"><b>This is your public profile as pilots see it.</b> <a href="#/requests">Back to dashboard</a></div>` : `<p><a class="back-link" href="#/search?cert=${cert}">← Back to search</a></p>`}
      <div style="margin-bottom:1.25rem">
          <section class="card">
            <div class="row" style="gap:1rem;align-items:flex-start">
              <div class="avatar lg">${initials(dp.name)}</div>
              <div style="flex:1;min-width:200px">
                <p class="eyebrow">Examiner profile</p>
                <h1 style="margin-bottom:.2rem">${esc(dp.name)}</h1>
                <div class="row" style="gap:.6rem">${sampleBadge()}<span class="muted small">Sample DPE since ${dp.since} · ${esc(dp.fsdo)} (fictional)</span></div>
                <div class="muted small" style="margin-top:.3rem">${dp.home} · ${esc(apt(dp.home).name)}, ${esc(apt(dp.home).city)} · travels up to ${dp.travelNm} nm · Speaks ${dp.languages.map(esc).join(", ")}${dp.languages.length > 1 ? " (practical tests are conducted in English)" : ""}</div>
              </div>
            </div>
            <p style="margin-top:1rem">${esc(dp.bio)}</p>
          </section>
          ${v4Openings(dp, cert, slots, own, q, pick)}
      </div>
      <div class="v4-prof-more">
        <div class="stack">
          <section class="card">
            <h2>Fees</h2>
            <p class="muted small">Set by the examiner and paid directly to them. Prototype booking: ${FEES ? `a flat ${money(BOOKING_FEE)} student booking fee plus a sample deposit paid to your examiner (ASSUMPTION, about 20% of the fee, credited toward it), both shown only if the examiner approves.` : `a sample deposit paid to your examiner (ASSUMPTION, about 20% of the fee, credited toward it), due only if the examiner approves. ${FREE_LINE}`} Nothing is charged. Prototype, not legal or FAA advice.</p>
            <div class="table-wrap"><table>
              <thead><tr><th>Certificate / rating</th><th class="num">Examiner fee</th></tr></thead>
              <tbody>${certIds.map((c) => `<tr ${c === cert ? 'class="best"' : ""}><td>${esc(certById(c).name)} <span class="muted small">${esc(certById(c).detail)}</span></td><td class="num"><b>${money(dp.fees[c])}</b></td></tr>`).join("")}</tbody>
            </table></div>
            ${(dp.otherAuthorizations || []).length ? `<div class="other-auth" style="margin-top:.9rem"><div class="small"><b>Other authorizations (info only)</b> <span class="pill">Not bookable in this prototype</span></div><ul class="small" style="margin:.35rem 0 0;padding-left:1.1rem">${dp.otherAuthorizations.map((o) => `<li>${esc(o.name)}${o.detail ? ` <span class="muted">${esc(o.detail)}</span>` : ""}${o.fee ? ` · sample fee ${money(o.fee)}` : ""}${o.id === "atp" || o.id === "rh" ? ` <span class="muted" data-no-estimate="${esc(o.id)}">\u00b7 No estimate yet for this certificate.</span>` : ""}</li>`).join("")}</ul></div>` : ""}
            <div class="grid g2" style="margin-top:1rem">
              <div><div class="muted small">Retest / discontinuance (sample)</div><b>${money(dp.retestFee)}</b></div>
              <div><div class="muted small">Travel to your airport (≤ ${dp.travelNm} nm)</div><b>+${money(dp.travelFee)}</b></div>
            </div>
          </section>
          ${noEst ? `<section class="card" id="cost-estimate" data-no-estimate="${esc(noEst)}"><p class="eyebrow">ESTIMATE \u00b7 EXAMPLE INPUTS</p><h2 style="margin:0 0 .35rem">${esc(noEstName)}</h2><p style="margin:0">No estimate yet for this certificate.</p></section>` : `${allInCard(dp, cert, near, (daySlots.find((s) => s.status === "open") || slots[0] || {}).airport)}
          ${estimateCard(dp, cert, near, (daySlots.find((s) => s.status === "open") || slots[0] || {}).airport)}`}
          <section class="card">
            <h2>Policies</h2>
            <p><b>Cancellation:</b> ${esc(dp.cancellation)}</p>
            <p id="profile-deposit"><b>Deposit paid to your examiner:</b> ${money(depositFor(dp, cert))} for ${esc(certById(cert).short)} (${depositRule(dp)}). <b>Examiner\u2019s deposit terms:</b> \u201c${esc(depTerms(dp))}\u201d</p>
            <p class="small">${FEES ? `<b>Checkride Connect $15 fee:</b>` : `<b>Checkride Connect:</b> free during the prototype.`} <a href="#/pricing#deposit-policy">How cancellations work</a> ${LEGAL_TAG}</p>
            <p><b>Aircraft:</b> ${esc(dp.aircraft)}</p>
            <p style="margin:0"><b>What to bring:</b> see the <a href="#/checklists/${cert}">${esc(certById(cert).short)} readiness checklist</a>.</p>
          </section>
          ${reviewsCard(dp, cert)}
        </div>
      </div>
    </div>`;
  }

  // QA-052 / QA-070 / QA-073: a day whose openings have all started (or were taken) says so in a sky-soft panel, with a link
  // to the next opening. The student follows the link themselves; the day never changes on its own.
  function dayNone(dp, cert, slots, day) {
    const d = day || ui.sel;
    const nx = slots.find((s) => s.date > d && s.certs.includes(cert)) || null;
    const isToday = d === slotToday({ airport: dp.home });
    return `<div class="v4-note" id="day-none" tabindex="-1"><b>${isToday ? COPY["search.empty_today"] : `No openings left on ${esc(fmtDate(d, { weekday: "short", month: "short", day: "numeric" }))}.`}</b> ${nx ? `<a href="#/dpe/${dp.id}?cert=${cert}&date=${nx.date}&pick=${nx.id}" data-action="day-next" data-date="${nx.date}" data-slot="${nx.id}" id="day-next">Next opening: ${esc(fmtDate(nx.date, { weekday: "short", month: "short", day: "numeric" }))} \u00b7 ${slotTime(nx)}</a>` : "No later openings right now."}</div>`;
  }


  function calendar(dp) {
    const [y, m] = ui.month.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const daysIn = new Date(y, m, 0).getDate();
    const openDates = new Set(openSlots({ dpeId: dp.id }).map((s) => s.date));
    const t = todayIn(aptTz(dp.home));
    const minMonth = t.slice(0, 7);
    const maxD = parseIso(t); maxD.setMonth(maxD.getMonth() + 4);
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
    const f = searchFilters({ radius: 75, ...q }); // UF#12: same default radius as search
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
        <thead><tr><th>Examiner</th><th>Based at</th><th class="num">Exam fee</th>${FEES ? `<th class="num">Student fee</th>` : ""}<th class="num">Aircraft (est.)</th><th class="num">Travel / lodging (est.)</th><th class="num">All-in total (example)</th><th>Avg wait (sample)</th><th>Soonest opening</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr ${i === 0 ? 'class="best"' : ""}>
          <td><a href="#/dpe/${r.dp.id}?${toQuery({ cert: f.cert, near: f.near })}"><b>${esc(r.dp.name)}</b></a>${i === 0 ? ' <span class="pill good">Lowest all-in</span>' : ""}</td>
          <td>${r.dp.home} <span class="muted small">${r.dist} nm</span></td>
          <td class="num">${money(r.fee)}</td>
          ${FEES ? `<td class="num">${money(r.x.studentFee)}</td>` : ""}
          <td class="num">${money(r.x.aircraft)}</td>
          <td class="num">${r.x.travel ? money(r.x.travel) : "—"}</td>
          <td class="num"><b>${money(r.total)}</b></td>
          <td>${sampleOf(r.dp).avgDaysToNext != null ? plural(sampleOf(r.dp).avgDaysToNext, "day") : '<span class="muted small">n/a</span>'}</td>
          <td>${r.soon ? `${fmtDate(r.soon.date)} <span class="muted small">${relDays(r.soon.date, slotTz(r.soon))}</span>` : '<span class="muted small">None open</span>'}</td>
        </tr>`).join("")}</tbody>
      </table></div>
      <p class="muted small" style="margin:.75rem 0 0">Example numbers only, not quotes. Exam fees are set by each examiner and paid to them. Aircraft and travel are rough estimates from sample data, and retest or no-show fees are not included (see each profile). The deposit paid to your examiner (ASSUMPTION, about 20% of the fee) is part of the exam fee, so it is not added here. Wait figures are sample data, not real reviews.<span class="cmp-mobile-note"> On a phone the table shows examiner, exam fee, all-in total and wait; open a profile for the full breakdown.</span></p>
      </section>` : emptyState({ id: "compare-empty", ic: "search", title: "No examiners offer this checkride in range", body: "Try a larger radius, or pick another certificate or airport.", actions: `<a class="btn secondary" href="#/search">Open search</a>` })}
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
        <p class="muted small" style="margin:.3rem 0">Within ${a.radius} nm of ${a.near}${a.before ? ` · before ${fmtDateA(a.before)}` : ""}${a.maxFee ? ` · up to ${money(a.maxFee)}` : ""}${dp ? ` · only ${esc(dp.name)}` : ""}</p>
        <div class="row small"><span class="pill">Mock: email only (not sent)</span>
        <a href="#/search?${toQuery({ cert: a.cert, near: a.near, radius: a.radius, before: a.before, maxFee: a.maxFee })}">${plural(matches, "matching opening")} now →</a></div>
        <div class="row small" style="margin-top:.6rem"><button class="btn ghost sm" data-action="sim-open" data-alert="${a.id}">Simulate a matching opening</button><span class="muted">Demo only: adds a labelled simulated slot and runs this alert.</span></div>
      </div>`;
    };
    return `<div class="page">
      <div class="page-head v3-head"><p class="eyebrow">Openings and updates</p><h1>Alerts <span class="pill warn" style="vertical-align:middle">Mock only</span></h1><p class="muted">Saved searches are matched against sample openings in this browser. <b>No email, SMS or push is ever sent</b>; alerts appear only in the inbox on this page.</p></div>
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
          ${S.alerts.length ? S.alerts.map(alertCard).join("") : emptyState({ id: "alerts-empty", ic: "bell", title: "No saved alerts yet", body: "Use the form above, or save one from a search. Alerts are mock: stored in this browser, nothing is emailed or texted." })}
        </div>
        <aside class="card sticky" id="inbox">
          <div class="row spread"><h2 style="margin:0">Inbox</h2>${unread ? `<button class="btn ghost sm" data-action="read-all">Mark all read</button>` : ""}</div>
          <p class="muted small">Mock inbox. Tip: tap <b>Simulate a matching opening</b> on an alert, or switch to <b>DPE view</b> and publish an opening or mark a cancellation near KORL, to see a mock alert arrive here.</p>
          ${"Notification" in window ? `<div class="small" id="notif-perm" style="margin-bottom:.75rem">${Notification.permission === "granted" ? `<span class="pill good">Browser notifications on</span> <span class="muted">Shown by this page only. Nothing is emailed or texted.</span>` : Notification.permission === "denied" ? `<span class="muted">Browser notifications are blocked in this browser. The inbox still works.</span>` : `<button class="btn ghost sm" data-action="notif-perm">Also show browser notifications (optional)</button> <span class="muted">Shown by this page only, never email or SMS.</span>`}</div>` : ""}
          ${S.notifications.length ? S.notifications.slice(0, 25).map((n) => {
            const slot = n.slotId ? S.slots.find((s) => s.id === n.slotId) : null;
            const live = slotLive(slot);
            return `<div class="notif ${n.read ? "read" : ""}"><span class="dot"></span><div style="flex:1">
              <b>${esc(n.title)}</b><div class="small">${esc(n.body)}${n.link ? ` \u00b7 <a href="${esc(n.link)}" data-action="read-notif" data-id="${n.id}">${esc(n.linkText || "Open")}</a>` : ""}</div>
              ${n.kind === "booking-cancel" ? `<div class="small cancel-notice" data-notice="${esc(n.bookingId)}">${(n.lines || []).map((l) => `<div>${esc(l.t)}${l.tag ? ` ${LEGAL_TAG} ${PM_TAG}` : ""}</div>`).join("")}<div class="row" style="margin-top:.35rem"><a class="btn sm" href="#/dpe/${esc(n.dpeId)}?cert=${esc(n.cert)}" data-action="read-notif" data-id="${n.id}">Rebook with ${esc(first(dpeById(n.dpeId)?.name || "the examiner"))}</a><a class="btn secondary sm" href="#/search?cert=${esc(n.cert)}" data-action="read-notif" data-id="${n.id}">Find another examiner</a></div></div>` : ""}
              <div class="muted small">${fmtTs(n.ts)}${n.channel ? " · " + esc(n.channel) : ""}</div>
              ${n.simulated ? `<span class="pill warn" style="margin-top:.3rem">Simulated</span> ` : ""}${slot ? (live ? `<a class="btn sm" style="margin-top:.4rem" href="${notifLink(n, slot)}" data-action="read-notif" data-id="${n.id}">Book this opening</a> <a class="small" href="#/offer/${n.id}" data-action="read-notif" data-id="${n.id}" data-offer-link>A slot opened with ${esc(dpeById(n.dpeId)?.name || "")}</a>` : `<span class="pill" style="margin-top:.4rem">Already taken</span>`) : ""}
            </div></div>`;
          }).join("") : emptyState({ id: "inbox-empty", ic: "inbox", cls: "", title: "Your inbox is empty", body: "When a saved alert matches a new opening, it shows up here. Try <b>Simulate an opening</b> on an alert." })}
        </aside>
      </div>
    </div>`;
  }

  function viewChecklists(q, certId) {
    const cert = D.checklists[certId] ? certId : "ppl";
    const pct = checklistPct(cert);
    const lists = D.checklists[cert];
    return `<div class="page">
      <div class="page-head v3-head"><p class="eyebrow">Journey</p><h1>Readiness checklists <span class="pill warn" style="vertical-align:middle">Unverified draft</span></h1><p class="muted">Standard starter lists, written from memory and not yet reviewed by a CFI or DPE. Your ticks are saved in this browser only. Once an examiner accepts your request they can send you a list under <a href="#/my-checklists">From your examiner</a>.</p></div>
      <nav class="tabs">${D.certs.map((c) => `<a href="#/checklists/${c.id}" class="${c.id === cert ? "active" : ""}">${esc(c.short)}</a>`).join("")}</nav>
      <div class="split-r">
        <div class="stack">
          ${lists.map((sec) => `<section class="card"><h2>${esc(sec.cat)}</h2>
            ${sec.items.map((it) => { const done = !!S.checklist[cert]?.[it.id]; return `<label class="check-item ${done ? "done" : ""}">
              <input type="checkbox" data-check="${cert}" data-item="${it.id}" ${done ? "checked" : ""} />
              <div><div class="t">${esc(it.t)}</div>${it.n ? `<div class="muted small">${esc(it.n)}</div>` : ""}</div></label>`; }).join("")}
          </section>`).join("")}
          <p class="muted small">Unverified draft, reference only. The regulation cites have not been checked. Always verify against current 14 CFR, the applicable ACS or PTS (CFII and Sport still use a PTS: FAA-S-8081-9E and FAA-S-8081-29B) and AC 61-65K, and confirm specifics with your instructor and examiner.</p>
        </div>
        <aside class="card sticky">
          <h2>${esc(certById(cert).name)}</h2>
          ${(() => { const k = checklistCount(cert); return `<div class="row spread"><b class="big-num">${k.n} of ${k.total}</b><span class="muted small">ready</span></div><div style="margin-top:.35rem">${countPill(k.n, k.total)}</div>`; })()}
          <div style="margin:.4rem 0 1rem">${(() => { const k = checklistCount(cert); return seg9(k.n, k.total); })()}</div>
          <button class="btn secondary" style="width:100%" data-action="share-checklist" data-cert="${cert}">Share with DPE/CFI (not available)</button>
          <a class="btn" style="width:100%;margin-top:.5rem" href="#/search?cert=${cert}">Find a ${esc(certById(cert).short)} checkride</a>
          <p class="muted small" style="margin:.75rem 0 0">When you request a checkride (mock), the sample examiner sees this readiness count.</p>
        </aside>
      </div>
    </div>`;
  }

  function cancelLine(b, s) {
    const c = b.cancel;
    if (!c) return "Cancelled. Nothing was charged.";
    if (c.request) return S.role === "dpe" && s
      ? `${esc(first(b.applicant || "The student"))} withdrew their request for ${slotAt(s)}. The slot is open again.` // dpe.request.withdrawn
      : `Withdrawn by you \u00b7 ${tsReader(c.at)} \u00b7 Slot released`; // req.card.withdrawn
    const tz = s ? slotTz(s) : REGION_TZ;
    const when = fmtIn(c.at, tz, { month: "short", day: "numeric" });
    const who = c.by === "student-via-dpe" ? "Cancelled at your request" : "Cancelled by you";
    if (!FEES) {
      // Free prototype: no booking-fee outcome; the deposit follows the examiner's terms (quoted on the card).
      if (c.by === "examiner") return `Cancelled by examiner \u00b7 ${when} \u00b7 deposit: examiner\u2019s terms`;
      if (c.by === "weather" || c.by === "maintenance") return `Cancelled \u00b7 ${c.by === "weather" ? "weather" : "aircraft maintenance"} \u00b7 deposit: examiner\u2019s terms`;
      return `${who} \u00b7 ${fmtEt(c.at)} \u00b7 deposit: examiner\u2019s terms`; // D38 #2: no countdown in free mode
    }
    if (c.by === "examiner") return `Cancelled by examiner \u00b7 ${when} \u00b7 $15: refund/credit pending`;
    if (c.by === "weather") return "Cancelled \u00b7 weather \u00b7 $15: refund/credit pending";
    if (c.by === "maintenance") return "Cancelled \u00b7 aircraft maintenance \u00b7 $15: refund/credit pending";
    return c.fee === "credited" ? `${who} \u00b7 ${fmtEt(c.at)}, ${durShort(c.aheadMs)} ahead \u00b7 $15: credited` : `${who} \u00b7 ${durShort(c.aheadMs)} ahead \u00b7 $15: kept`;
  }

  // ---- C (D35/F10): checkride-day prep list, item 9. Starts from chk.prep.default.*; the examiner can add, reword or remove.
  const PREP_DEFAULT = (n) => [`Meeting time and place confirmed with ${n}`, "Aircraft scheduled for the day, with your school or the owner", "Weather checked the evening before and the morning of", `Any planning ${n} asked for, done and with you`, "Items 1\u20138 packed in one place", "A good night\u2019s sleep and something to eat before you go"];
  const prepDefaults = (n) => PREP_DEFAULT(n).map((t, i) => ({ id: "pd" + (i + 1), t, o: t }));
  function prepOf(b) {
    S.prep = S.prep || {};
    if (!S.prep[b.id]) S.prep[b.id] = { items: prepDefaults(dpeById(b.dpeId).name), sent: null };
    return S.prep[b.id];
  }
  function prepSync(bid) {
    const pr = S.prep && S.prep[bid]; if (!pr) return;
    document.querySelectorAll('#prep-form input[name^="t-"]').forEach((i) => { const it = pr.items.find((x) => "t-" + x.id === i.name); if (it) it.t = i.value; });
  }
  // Student view (chk.prep.*). Without a confirmed checkride, the default list with the examiner's name if there is one.
  function prepStudent(b, dp) {
    const n = dp ? esc(dp.name) : "your examiner";
    const sent = b && S.prep && S.prep[b.id] && S.prep[b.id].sent;
    const items = sent ? sent.items : prepDefaults(n);
    const from = !!(sent && sent.changed);
    const list = items.length ? `<ul class="small prep-items" style="margin:.35rem 0 0;padding-left:1.1rem">${items.map((it) => `<li>${esc(it.t)}${from && !it.o ? ` <span class="muted">\u00b7 Added by ${n}</span>` : from && it.o !== it.t ? ` <span class="muted">\u00b7 Updated by ${n}</span>` : ""}</li>`).join("")}</ul>`
      : `<p class="small" data-prep-empty style="margin:.35rem 0 0">Nothing extra from ${n} for the day. You\u2019re set on this one.</p>`;
    return `<div class="inset prep-student" data-prep="${from ? "dpe" : "default"}" style="margin:.4rem 0 .2rem 2.2rem">
      <div class="row" style="gap:.5rem"><b class="small">Checkride-day prep</b>${chip(from ? "" : "", from ? `From ${n}` : "Default list")}</div>
      <p class="muted small" style="margin:.25rem 0 0">A starting list for the day. ${dp ? n : "Your examiner"} can add to it or change it, and you\u2019ll see it here. ${VERIFY}</p>${list}</div>`;
  }
  // Examiner editor (chk.d.prep.*), on the confirmed applicant's checklist page.
  function prepEditor(b) {
    const pr = prepOf(b);
    return `<section class="card" id="prep-editor" style="margin-top:1rem">
      <p class="eyebrow">YOUR EXAMINER DESK</p><h2>Checkride-day prep \u00b7 ${esc(first(b.applicant))}</h2>
      <p class="muted small">Starts from our default list. Add, reword or remove items so it matches how you run the day. ${VERIFY}</p>
      <form class="stack" data-form="prep-save" id="prep-form"><input type="hidden" name="bid" value="${b.id}" />
        ${pr.items.map((it, i) => `<div class="row prep-row" style="flex-wrap:nowrap;gap:.5rem"><input id="prep-${it.id}" name="t-${it.id}" value="${esc(it.t)}" maxlength="140" aria-label="Edit item ${i + 1}" style="flex:1;min-width:0" /><button type="button" class="btn ghost sm" data-action="prep-del" data-id="${b.id}" data-item="${it.id}" aria-label="Remove item ${i + 1}">Remove</button></div>`).join("") || `<p class="muted small">Nothing extra from ${esc(dpeById(b.dpeId).name)} for the day. You\u2019re set on this one.</p>`}
        <div class="row"><button type="button" class="btn secondary sm" data-action="prep-add" data-id="${b.id}">Add an item</button><button class="btn" type="submit" id="prep-save">Save list</button>${pr.sent ? ` <span class="small muted">Saved ${fmtTs(pr.sent.at)}</span>` : ""}</div>
      </form>
    </section>`;
  }

  // ---- C (D20/D13): medical type selector and optional date (as entered), reminder 60 days before. Warn, never block.
  const MED_OPTS = [["c1", "Class 1 medical"], ["c2", "Class 2 medical"], ["c3", "Class 3 medical"], ["basicmed", "BasicMed"], ["dl", "U.S. driver\u2019s license (Sport Pilot)"], ["unsure", "Not sure yet"]];
  const medDaysLeft = (d) => Math.round((parseIso(d) - parseIso(iso(new Date()))) / DAY);
  function medicalBlock() {
    const m = S.medical || {}, o = MED_OPTS.find((x) => x[0] === m.type);
    const dated = o && m.type !== "unsure";
    const row = !dated ? `<span class="muted small">${chip("", "Not set")}</span>`
      : m.date ? `<p class="small" data-med-row="date" style="margin:.35rem 0 0">Your ${esc(o[1])} is valid through ${fmtDateY(m.date)} (as you entered it). \u00b7 <button type="button" class="linkish" data-action="med-edit">Edit</button> ${medDaysLeft(m.date) <= 60 ? chip("warn", "Heads-up") : chip("good", "On track")}</p>`
      : `<p class="small" data-med-row="nodate" style="margin:.35rem 0 0">${esc(o[1])} \u00b7 No date added. Add one if you\u2019d like a reminder 60 days before it. \u00b7 <button type="button" class="linkish" data-action="med-edit">Add date</button> ${chip("", "Not set")}</p>`;
    return `<div class="inset med-block" id="med-block" style="margin:.4rem 0 .2rem 2.2rem">
      <label class="field"><span>What will you use for your checkride? ${VERIFY}</span><select id="med-type" data-med="type"><option value="" ${o ? "" : "selected"}>Not set</option>${MED_OPTS.map(([v, l]) => `<option value="${v}" ${m.type === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      <p class="muted small" style="margin:.25rem 0 0">Pick what\u2019s on your certificate or card. Not sure which one you need? Your CFI or AME can tell you.</p>
      ${m.type === "basicmed" ? `<p class="muted small" style="margin:.25rem 0 0">BasicMed has more than one date to keep current. Enter the one that comes first, and check the details with your CFI. ${VERIFY}</p>` : ""}
      ${m.type === "dl" ? `<p class="muted small" style="margin:.25rem 0 0">A U.S. driver\u2019s license can work for some Sport Pilot checkrides. Check with your CFI that it covers yours. ${VERIFY}</p>` : ""}
      ${dated ? `<label class="field" style="max-width:240px;margin-top:.5rem"><span>${m.type === "dl" ? "License expires (optional)" : "Valid through (optional)"}</span><input type="date" id="med-date" data-med="date" value="${esc(m.date || "")}" /></label><p class="muted small" style="margin:.25rem 0 0">Enter the date shown for the privileges you\u2019ll use on your checkride. You can skip this.</p>` : ""}
      ${row}
    </div>`;
  }

  // ---- C (wl.offer.*, D5/D14/D19/D23): the waitlist-offer screen. Hold end in the student's own zone (D19).
  const wlOf = (dpeId) => { S.wl = S.wl || {}; return S.wl[dpeId] || (S.wl[dpeId] = { pos: 4, passes: 0 }); }; // mock place in line
  const WL_BACK = 12; // mock "back of the line"
  const quietHour = (ts) => { const h = new Date(ts).getHours(); return h >= 21 || h < 8; };
  function offerHold(n, sl) {
    const st = slotStart(sl), t0 = n.ts;
    if (st - t0 < 72 * 3600e3) return { end: Math.min(t0 + 30 * 60e3, st), kind: "short" };
    const end = t0 + 2 * 3600e3;
    if (quietHour(end)) { const x = new Date(end); if (x.getHours() >= 21) x.setDate(x.getDate() + 1); x.setHours(9, 0, 0, 0); return { end: x.getTime(), kind: "quiet" }; }
    return { end, kind: "std" };
  }
  const readerTime = (ts) => `${fmtIn(ts, undefined, { hour: "numeric", minute: "2-digit" })} ${readerZoneLabel()}`;
  const sameReaderDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  function viewOffer(q, id) {
    const n = S.notifications.find((x) => x.id === id), sl = n && S.slots.find((x) => x.id === n.slotId), dp = n && dpeById(n.dpeId);
    if (!n || !sl || !dp) return `<div class="page">${emptyState({ id: "offer-not-found", ic: "bell", h: "h1", title: "Already taken", body: "", actions: `<a class="btn" href="#/alerts">Alerts</a><a class="btn secondary" href="#/search">Find another opening</a>` })}</div>`;
    S.offers = S.offers || {};
    const o = S.offers[id] || {}, wl = wlOf(dp.id), f = esc(first(dp.name)), when = esc(slotAt(sl)), h = offerHold(n, sl), now = Date.now();
    const mineB = sl.bookingId && S.bookings.find((x) => x.id === sl.bookingId && x.mine);
    const ended = !mineB && (now > h.end || !slotLive(sl)); // QA-039: a started slot ends the offer
    const endT = `<b data-hold-end="${h.end}">${readerTime(h.end)}</b>`;
    const body = h.kind === "short" ? `${when}. This one\u2019s coming up fast, so we can hold it for 30 minutes, until ${endT}. If you miss it overnight, that\u2019s fine: it doesn\u2019t count as a pass, and you keep your place.`
      : h.kind === "quiet" ? `${when}. It\u2019s yours to request until <b data-hold-end="${h.end}">${readerTime(h.end)} ${sameReaderDay(h.end, now) ? "today" : "tomorrow"}</b> (${fmtIn(h.end, undefined, { weekday: "short", month: "short", day: "numeric" })}), so you won\u2019t miss it overnight.`
      : `${when}. It\u2019s yours to request until ${endT}${sameReaderDay(h.end, now) ? " today" : ""}. After that, it goes to the next person in line.`;
    const cert = n.cert, fee = dp.fees[cert], dep = depositFor(dp, cert);
    const al = S.alerts.find((a) => a.cert === cert) || {};
    const travel = allIn(dp, cert, nearFor(al.near, dp), sl.airport).travel;
    const allin = `Examiner fee ${money(fee)} \u00b7 Checkride Connect: ${FEES ? `${money(BOOKING_FEE)} student booking fee (mock) <span class="pill warn">Proposed pricing</span>` : "free"} \u00b7 deposit ${money(dep)}, paid directly to ${f} under ${f}\u2019s terms \u00b7 travel: ${sl.airport === dp.home && !travel ? "none, this slot is at the examiner\u2019s home airport" : money(travel)}`;
    const endedText = (!o.passed && quietHour(h.end)) ? `That opening\u2019s hold ended overnight, so it went to the next person. No pass counted. You\u2019re still #${wl.pos}.`
      : o.passed ? "" : wl.passes >= 1 ? `That hold ended, so the slot went to the next person. We counted it as a pass. You\u2019re now #${WL_BACK}, at the back of the line.` : `That hold ended, so the slot went to the next person. We counted it as a pass. You\u2019re still #${wl.pos}.`;
    return `<div class="page">
      ${head("OPENING AVAILABLE", "A slot opened.", "Your call.")}
      <section class="card" id="wl-offer" data-offer-kind="${h.kind}">
        <h2>A slot opened with ${esc(dp.name)}</h2>
        ${mineB ? `<p>${reqPill(mineB)}</p>` : ended ? `<p class="small" data-offer-ended>${endedText || "Already taken"}</p>` : `<p data-offer-chip>${chip("warn", `Held for you until ${readerTime(h.end)}`)}</p><p data-offer-body>${body}</p>
        <p class="small muted" data-hold-rule>We hold openings for 2 hours, or 30 minutes if the slot is less than 3 days away. If a 2-hour hold would end overnight (9 PM\u20138 AM your time), we hold it until 9 AM.</p>
        <p class="small" data-offer-allin>${allin}</p>
        ${o.passed ? "" : `<p class="small muted" data-pass-rule>Pass once and you keep your place. Pass twice and you move to the back of the line. A hold that runs out overnight doesn\u2019t count as a pass.</p>`}
        <div class="row"><button class="btn cta" data-action="request" data-slot="${sl.id}" data-cert="${cert}">Request this slot</button>${o.passed ? "" : `<button class="btn secondary" data-action="offer-pass" data-id="${id}">Pass, keep my place</button>`}</div>`}
        <p class="muted small" style="margin:.75rem 0 0">${n.channel ? esc(n.channel) : "Mock alert \u00b7 nothing was sent"}</p>
      </section>
    </div>`;
  }
  // ux-copy-v3 §5.6: no-show card and dispute state (student side).
  function noShowCard(b, s, dp) {
    if (!b.noShow || !s) return "";
    const f = esc(first(dp.name)), by = nsDisputeBy(s), d = b.noShow.dispute;
    const tail = d ? (d.status === "reversed" ? `We reviewed it and removed the no-show from your record. Your deposit still follows ${f}\u2019s terms.`
      : d.status === "upheld" ? "We reviewed it, and the no-show stays on your record. Thanks for telling us what happened."
      : "Got it. We\u2019ll show the outcome here.")
      : Date.now() <= by ? `Think this is wrong? \u00b7 <button type="button" class="linkish" data-action="ns-dispute" data-id="${b.id}">Dispute by ${fmtIn(by, slotTz(s), { month: "short", day: "numeric" })}</button>`
      : "The 7-day dispute window for this no-show has closed.";
    return `<div class="small cancel-outcome" data-noshow="${d ? d.status : "open"}" style="margin-top:.35rem"><b>Marked as a no-show by ${f} for your confirmed checkride on ${slotAt(s)} \u00b7 The slot is closed \u00b7 Deposit: per ${f}\u2019s terms</b><div>${tail}</div><div class="muted">Prototype: nothing is charged.</div></div>`;
  }
  function viewBookings() {
    const mine = S.bookings.filter((b) => b.mine).sort((a, b) => b.createdAt - a.createdAt);
    return `<div class="page">
      <div class="page-head v3-head"><p class="eyebrow">Journey</p><h1>My checkrides <span class="pill warn" style="vertical-align:middle">Mock</span></h1><p class="muted">Requests, not bookings. Saved in this browser only. Nothing is charged, emailed or sent to an examiner.</p></div>
      ${mine.length ? `<div class="stack">${mine.map((b) => {
        const s = S.slots.find((x) => x.id === b.slotId); const dp = dpeById(b.dpeId);
        const fee = b.feeUsd ?? dp.fees[b.cert], dep = b.depositUsd ?? depositFor(dp, b.cert);
        const cur = S.curated[b.id];
        return `<div class="card">
          <div class="row spread">
            <div class="row" style="gap:1rem"><div class="avatar">${initials(dp.name)}</div><div>
              <div class="row" style="gap:.5rem"><b><a href="#/request/${b.id}">${esc(certById(b.cert).name)}</a></b>${reqPill(b)}${b.simulated ? `<span class="pill warn">Simulated opening</span>` : ""}${b.fromAlert ? `<span class="pill">From a mock alert</span>` : ""}</div>
              <div class="small">${fmtDate(s.date, { weekday: "long", month: "long", day: "numeric" })} · ${slotTime(s)} · ${s.airport} · with <a href="#/dpe/${dp.id}">${esc(dp.name)}</a> <span class="muted">(sample examiner)</span></div>
              <div class="muted small">Requested ${fmtTs(b.createdAt)}</div>
            </div></div>
            <div class="row">
              <a class="btn secondary sm" href="#/request/${b.id}">Open request</a>
              ${b.status === "requested" ? `<button class="btn secondary sm" data-action="as-dpe" data-dpe="${dp.id}">Respond as ${esc(first(dp.name))} (demo)</button><button class="btn bad sm" data-action="pilot-cancel" data-id="${b.id}">Withdraw request</button>` : ""}
              ${b.status === "confirmed" && !b.noShow ? `<a class="btn secondary sm" href="#/my-checklists">From your examiner</a><button class="btn bad sm" data-action="pilot-cancel" data-id="${b.id}">Cancel checkride</button>` : ""}
            </div>
          </div>
          <div class="summary small" style="margin-top:.8rem">
            <div class="line"><span>Deposit paid to your examiner (ASSUMPTION, mock, credited toward the fee)</span><b>${money(dep)}</b></div>
            ${FEES ? `<div class="line"><span>Student booking fee</span><b>${money(BOOKING_FEE)}</b></div>` : ""}
            <div class="line"><span><b>Total due if the examiner accepts</b></span><b>${money(dep + BOOKING_FEE)}</b></div>
            <div class="line muted"><span>Remaining examiner fee at the test (${money(fee)} less deposit)</span><b>${money(fee - dep)}</b></div>
            <div class="line muted"><span>Actually charged (prototype)</span><b>$0</b></div>
          </div>
          <div class="muted small" style="margin-top:.5rem">${b.status === "requested" ? `Waiting for ${esc(first(dp.name))} to review your request. Nothing is confirmed until ${esc(first(dp.name))} accepts. Nothing charged.` : b.status === "confirmed" ? `Confirmed. In a real version: Deposit paid to your examiner (mock) ${FEES ? "and the booking fee charged now" : "under their terms"}; this prototype charged nothing.` : b.status === "declined" ? `${esc(first(dp.name))} couldn't take this request. Nothing was confirmed, so nothing changes on your side.` : ""}</div>
          ${b.status === "cancelled" ? `<div class="small cancel-outcome" data-outcome="${esc(b.cancel?.fee || "none")}" style="margin-top:.35rem"><b>${cancelLine(b, s)}</b><div class="muted">Prototype: nothing is charged.</div></div>` : ""}
          ${noShowCard(b, s, dp)}
          ${FEES && b.status === "confirmed" && slotStart(s) - Date.now() >= H48 ? `<div class="small" data-cutoff style="margin-top:.35rem">Cancel by ${tsWhen(slotStart(s) - H48, slotTz(s))} to get your $15 back as a credit. ${LEGAL_TAG}</div>` : ""}
          ${examinerTerms(dp)}
          <div class="muted small" style="margin-top:.35rem" data-policy>${POLICY_SHORT} <a href="#/pricing#deposit-policy">How cancellations work</a></div>
        </div>`; }).join("")}</div>`
        : emptyState({ id: "bookings-empty", ic: "calendar", h: "h2" /* QA-019 */, title: "No checkride requests yet", body: "Find a sample examiner and send a request. It's a request, not a booking. Nothing is charged.", actions: `<a class="btn" href="#/search">Search openings</a>` })}
    </div>`;
  }

  // Student view: curated checklists sent by a (sample) DPE after approving a request.
  function viewMyChecklists() {
    const mine = S.bookings.filter((b) => b.mine && b.status === "confirmed").sort((a, b) => b.createdAt - a.createdAt);
    const card = (b) => {
      const dp = dpeById(b.dpeId), s = S.slots.find((x) => x.id === b.slotId), c = S.curated[b.id];
      const head = `<div class="row spread"><div><h2 style="margin:0">${esc(certById(b.cert).name)}</h2><div class="muted small">from ${esc(dp.name)} (sample examiner) · checkride ${fmtDate(s.date)} · ${s.airport}</div></div>`;
      if (!c || !c.sent) return `<section class="card">${head}<span class="pill warn">Waiting for your examiner</span></div><p class="muted small" style="margin:.6rem 0 0">Your request is confirmed. The examiner can build and send a curated checklist; use <b>Examiner</b> in the role switch to try it. Meanwhile use the <a href="#/checklists/${b.cert}">standard ${esc(certById(b.cert).short)} list</a>.</p></section>`;
      const t = S.ticks[b.id] || {};
      const items = c.sent.items;
      const done = items.filter((i) => t[i.id]).length, pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return `<section class="card">${head}<div class="row"><span class="pill good">Sent ${fmtTs(c.sent.sentAt)}</span>${countPill(done, items.length)}</div></div>
        <div style="margin:.5rem 0 .8rem">${seg9(done, items.length)}</div>
        ${c.sent.note ? `<div class="cta-banner small" style="margin-bottom:.8rem"><b>Note from your examiner:</b> ${esc(c.sent.note)}</div>` : ""}
        ${items.length ? items.map((it) => { const d = !!t[it.id]; return `<label class="check-item ${d ? "done" : ""}"><input type="checkbox" data-ctick="${b.id}" data-item="${it.id}" ${d ? "checked" : ""} /><div><div class="t">${esc(it.t)}</div>${it.n ? `<div class="muted small">${esc(it.n)}</div>` : ""}</div></label>`; }).join("") : '<p class="muted">The examiner sent an empty list.</p>'}
      </section>`;
    };
    return `<div class="page">
      <div class="page-head v3-head"><p class="eyebrow">Journey</p><h1>From your examiner <span class="pill warn" style="vertical-align:middle">Unverified draft</span></h1><p class="muted">Curated lists your examiner sends after approving your request. Ticks are saved in this browser only. Items start from the standard lists, which are unverified drafts.</p></div>
      ${mine.length ? `<div class="stack">${mine.map(card).join("")}</div>` : emptyState({ id: "my-checklists-empty", ic: "list", h: "h2" /* QA-019 */, title: "No checklists from an examiner yet", body: "Send a request, then switch to <b>Examiner</b> to accept it and send a checklist.", actions: `<a class="btn" href="#/search">Search examiners</a><a class="btn secondary" href="#/checklists">Standard checklists</a>` })}
    </div>`;
  }

  // DPE view: build a curated checklist for an approved request.
  function viewBuilder(q, id) {
    const b = S.bookings.find((x) => x.id === id);
    if (!b) return `<div class="page">${emptyState({ id: "request-not-found", ic: "inbox", h: "h1", title: "Request not found", body: "It may have been cancelled, or the demo was reset.", actions: `<a class="btn" href="#/requests">Back to dashboard</a>` })}</div>`;
    const s = S.slots.find((x) => x.id === b.slotId), c = S.curated[b.id];
    const back = `<p><a href="#/requests">← Back to dashboard</a></p>`;
    if (b.status !== "confirmed") return `<div class="page">${back}<div class="card empty"><h1 class="h3">Accept the request first</h1><p>A checklist can be built once the request is confirmed.</p></div></div>`;
    const head = `<div class="page-head row spread"><div><h1 style="margin:0" id="cl-h1" tabindex="-1">Curated checklist <span class="pill warn" style="vertical-align:middle">Prototype</span></h1><p class="muted" style="margin:0">${esc(b.applicant)} · ${esc(certById(b.cert).name)} · ${fmtDate(s.date)} · ${s.airport}${b.mine ? " · request made in Student view" : " · sample applicant"}</p></div></div>`;
    if (!c) return `<div class="page">${back}${head}<section class="card"><h2>Start your list</h2><p class="muted">Begin with the standard ${esc(certById(b.cert).short)} checklist (an unverified draft) and edit it, or start blank.</p>
      <div class="row"><button class="btn" data-action="cl-start" data-id="${b.id}" data-mode="std">Start from standard ${esc(certById(b.cert).short)} list</button><button class="btn secondary" data-action="cl-start" data-id="${b.id}" data-mode="blank">Start blank</button></div></section>${prepEditor(b)}</div>`;
    const dirty = !c.sent || JSON.stringify({ i: c.items, n: c.note }) !== JSON.stringify({ i: c.sent.items, n: c.sent.note });
    return `<div class="page">${back}${head}
      ${c.prefilled && !c.sent ? `<p class="v4-note" id="cl-prefilled" role="status">Accepted. This list is prefilled with the standard ${esc(certById(b.cert).short)} checklist (an unverified draft) and the default prep list below. Edit both, then send.</p>` : ""}
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
          <p class="muted small" style="margin:.75rem 0 0">${b.mine ? "The student sees this under From your examiner in Student view. No email is sent." : "This is a sample applicant, so only the saved copy exists. Requests made in Student view receive the list under From your examiner. No email is sent."} Student ticks are kept for items that stay in the list.</p>
        </aside>
      </div>
      ${prepEditor(b)}
    </div>`;
  }

  function viewDpeDash() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const dtz = aptTz(dp.home);
    const mySlots = S.slots.filter((s) => s.dpeId === dp.id && s.status !== "removed" && s.date >= slotToday(s) && !(s.status === "open" && slotPast(s))) /* QA-054: same started-slot helper as the pilot views */.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const myBookings = S.bookings.filter((b) => b.dpeId === dp.id);
    const pending = myBookings.filter((b) => b.status === "requested");
    const confirmed = myBookings.filter((b) => b.status === "confirmed");
    const nearby = D.airports.filter((a) => distNm(dp.home, a.id) <= dp.travelNm).map((a) => a.id);
    return `<div class="page">
      <div class="page-head row spread">
        ${head("Your examiner desk", "Your calendar.", "Your decisions.", "Requests, not bookings. Nothing is confirmed until you accept.", "h1")}
        ${actingSelect(dp)}
      </div>
      <section class="cta-banner row spread" style="margin-bottom:1rem"><div><b>Weekly check:</b> last updated ${fmtTs(availOf(dp.id).updatedAt)} · ${freshBadge(dp.id)}</div><div class="row" style="gap:.5rem"><a class="btn" href="#/dpe-openings" id="dash-openings">Update my openings</a><a class="btn secondary" href="#/openings" id="dash-publish">Publish one opening</a></div></section>
      ${dpeTiles(myBookings)}
      <div class="split-r">
        <div class="stack">
          <section class="card">
            <h2>Checkride requests</h2>
            ${pending.length ? pending.map((b) => { const s = S.slots.find((x) => x.id === b.slotId); return `<div class="slot-row">
              <div style="flex:1;min-width:220px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).name)}${b.mine ? ' <span class="pill accent">from Student view</span>' : b.school ? ' <span class="pill accent">from Demo Flight Academy</span>' : ""}
                <div class="small">${fmtDate(s.date)} · ${slotTime(s)} · ${s.airport}</div>
                <div class="muted small">${esc(b.aircraft)} · CFI: ${esc(b.cfi)}</div>
                ${dpeHoldLine(b, s)}${dpeNoShowLine(b)}
                <div class="row small" style="margin-top:.3rem;gap:.5rem"><div style="width:120px">${seg9(of9(b.readiness))}</div>${countPill(of9(b.readiness))}${b.selfCheck ? ` · <span class="pill">Self-attested readiness${b.selfCheck.warnings ? `, ${plural(b.selfCheck.warnings, "warning")}` : ""} (unverified)</span>` : ""}</div>
                ${selfCheckDetails(b)}
              </div>
              <div class="row"><button class="btn bad sm" data-action="decline" data-id="${b.id}">Decline</button><button class="btn good sm" data-action="accept" data-id="${b.id}">Accept request</button><button class="btn sm" data-action="accept-checklist" data-id="${b.id}">Accept + checklist</button></div>
            </div>`; }).join("") : emptyState({ id: "dpe-pending-empty", ic: "check", cls: "", title: "", body: "No new requests. They'll show up here." })}
            ${myBookings.filter((b) => isWithdrawn(b) && Date.now() - b.cancel.at < 7 * DAY).map((b) => `<p class="small muted" data-dpe-withdrawn="${b.id}" style="margin:.5rem 0 0">${cancelLine(b, slotOf(b))}</p>`).join("")}
          </section>
          <section class="card">
            <h2>Confirmed checkrides &amp; checklists</h2>
            <p class="muted small">After you accept a request, build a checklist for the student and send it. In this prototype it appears under <b>From your examiner</b> in Student view (only for requests made there).</p>
            ${confirmed.length ? confirmed.map((b) => { const s = S.slots.find((x) => x.id === b.slotId); const c = S.curated[b.id]; return `<div class="slot-row">
              <div style="flex:1;min-width:220px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).name)}${b.mine ? ' <span class="pill accent">from Student view</span>' : b.school ? ' <span class="pill accent">from Demo Flight Academy</span>' : ""}
                <div class="small">${fmtDate(s.date)} · ${slotTime(s)} · ${s.airport}</div></div>
              <div class="row">${c?.sent ? '<span class="pill good">Checklist sent</span>' : c ? '<span class="pill warn">Draft</span>' : '<span class="pill">No checklist yet</span>'}<a class="btn secondary sm" href="#/dpe-checklist/${b.id}">${c ? "Edit checklist" : "Build checklist"}</a>${b.noShow ? `<span class="pill bad" data-ns-marked="${b.id}">No-show</span>` : slotStart(s) <= Date.now() ? `<button class="btn ghost sm" data-action="ns-mark" data-id="${b.id}">Mark no-show</button>` : ""}</div>
            </div>`; }).join("") : emptyState({ id: "dpe-confirmed-empty", ic: "list", cls: "", title: "", body: "No confirmed checkrides yet. When you accept a request, that applicant's checklist shows up here." })}
          </section>
          <section class="card">
            <h2>Upcoming calendar</h2>
            <div class="table-wrap"><table>
              <thead><tr><th>Date</th><th>Airport</th><th>Status</th><th>Applicant</th><th><span class="sr-only">Actions</span></th></tr></thead>
              <tbody>${mySlots.slice(0, 14).map((s) => { const b = s.bookingId ? S.bookings.find((x) => x.id === s.bookingId) : null; return `<tr>
                <td>${fmtDate(s.date)} <span class="muted small">${slotTime(s)}</span></td><td>${s.airport}</td><td>${statusPill(s.status)}</td>
                <td>${b && s.status !== "open" ? `${esc(b.applicant)} <span class="muted small">${esc(certById(b.cert).short)}</span>` : '<span class="muted">—</span>'}</td>
                <td class="num">${s.status === "open" ? `<button class="btn ghost sm" data-action="remove-slot" data-id="${s.id}">Remove</button>` : s.status === "booked" ? `<button class="btn secondary sm" data-action="mark-cancel" data-id="${s.id}">Cancel checkride</button>` : ""}</td>
              </tr>`; }).join("")}</tbody>
            </table></div>
          </section>
        </div>
        <aside class="stack sticky">
          <section class="card small" id="publish-link-card">
            <h3>Publish an opening</h3>
            <p class="muted">Add one date at a time. Pilots with matching saved alerts get a mock alert.</p>
            <a class="btn sm" href="#/openings">Open the publish form</a>
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
  // Weekly reminder at 7:00 PM in the examiner's home-airport zone (D38: zone-aware, never the browser's own zone).
  const dowOf = (ymd) => parseIso(ymd).getDay(); // calendar weekday of a date string (zone-free)
  const nextDowAt = (fromYmd, dow, hm, tz, strictlyAfter) => {
    for (let i = 0; i < 15; i++) { const ymd = iso(new Date(parseIso(fromYmd).getFullYear(), parseIso(fromYmd).getMonth(), parseIso(fromYmd).getDate() + i)); const t = zonedEpoch(ymd, hm, tz); if (dowOf(ymd) === dow && t > strictlyAfter) return t; }
    return null;
  };
  const nextReminderAt = (dow, tz = REGION_TZ) => nextDowAt(ymdIn(Date.now(), tz), dow, "19:00", tz, Date.now());
  const fmtWhen = (ts, tz = REGION_TZ) => `${fmtIn(ts, tz, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ${zoneLabel(tz)}`;
  const dpeNextOpen = (id) => openSlots({ dpeId: id })[0];

  function viewDpeFees() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const certIds = Object.keys(dp.fees);
    const edited = !!(S.dpeEdits || {})[dp.id];
    const numField = (name, label, val, lo, hi, step = 1) => `<label class="field"><span>${label}</span><input type="number" inputmode="numeric" name="${name}" min="${lo}" max="${hi}" step="${step}" value="${val ?? ""}" ${name === "depositUsd" ? "" : "required"} /></label>`;
    return `<div class="page">
      <div class="page-head"><h1>Fees &amp; policies <span class="pill warn" style="vertical-align:middle">Mock</span></h1><p class="muted">${esc(dp.name)} (sample examiner). What you set here shows on your public profile, in search, compare and the request form. Saved in this browser only; nothing is sent.</p></div>
      <div class="split-r">
        <form class="card stack" data-form="dpe-fees" id="dpe-fees-form">
          <h2>Examiner fee by certificate</h2>
          <div class="grid g2">${certIds.map((c) => numField("fee-" + c, `${esc(certById(c).name)} ($)`, dp.fees[c], 100, 5000)).join("")}</div>
          <h2>Deposit</h2>
          ${numField("depositUsd", "Deposit per checkride ($, part of the fee). Leave blank for the sample rule (about 20%).", dp.depositUsd, 0, 2000)}
          <label class="field"><span>Deposit refund terms (quoted to students, in your words)</span><textarea name="depositTerms" rows="2" maxlength="300" required>${esc(depTerms(dp))}</textarea></label>
          <h2>Travel and retest</h2>
          <div class="grid g2">
            ${numField("travelNm", "Travel radius (nm)", dp.travelNm, 0, 500)}
            ${numField("travelFee", "Travel fee ($, when the checkride isn\u2019t at your home airport)", dp.travelFee, 0, 2000)}
            ${numField("retestFee", "Retest / discontinuance fee ($)", dp.retestFee, 0, 5000)}
          </div>
          <label class="field"><span>Cancellation terms</span><textarea name="cancellation" rows="2" maxlength="300" required>${esc(dp.cancellation || "")}</textarea></label>
          <div class="row"><button class="btn" type="submit">Save fees &amp; policies</button><button type="button" class="btn ghost" data-action="dpe-fees-reset" ${edited ? "" : "disabled"}>Restore sample values</button></div>
          <p class="muted small" style="margin:0">Prototype \u2013 no real payments. Deposits go directly to you under your terms; Checkride Connect never holds them. ${FEES ? "Students also see the $15 booking-fee rule." : FREE_LINE} ${LEGAL_TAG}</p>
        </form>
        <aside class="card sticky" id="fees-preview">
          <h2>Public profile preview</h2>
          <div class="table-wrap"><table><thead><tr><th>Certificate / rating</th><th class="num">Fee</th><th class="num">Deposit</th></tr></thead>
            <tbody>${certIds.map((c) => `<tr><td>${esc(certById(c).short)}</td><td class="num" data-preview-fee="${c}">${money(dp.fees[c])}</td><td class="num">${money(depositFor(dp, c))}</td></tr>`).join("")}</tbody></table></div>
          <p class="small"><b>Travel:</b> up to ${dp.travelNm} nm from ${dp.home}, +${money(dp.travelFee)} when the checkride isn\u2019t at ${dp.home}.<br><b>Retest:</b> ${money(dp.retestFee)}<br><b>Cancellation:</b> ${esc(dp.cancellation || "")}<br><b>Deposit terms:</b> \u201c<span data-preview-terms>${esc(depTerms(dp))}</span>\u201d</p>
          <a class="btn secondary" href="#/dpe/${dp.id}">View public profile</a>
        </aside>
      </div>
    </div>`;
  }

  // RC2 / D39 S12: the publish-openings form has its own route, #/openings, linked from #/requests ("Publish one opening").
  function viewPublish() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const dtz = aptTz(dp.home);
    const nearby = D.airports.filter((a) => distNm(dp.home, a.id) <= dp.travelNm).map((a) => a.id);
    const mineAll = S.slots.filter((x) => x.dpeId === dp.id && x.status === "open" && x.date >= slotToday(x) && !slotPast(x)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    // QA-035 / QA-008: the just-published (or already-published) opening is always listed, so focus can move to it.
    const hi = ui.pubHighlight && mineAll.find((x) => x.id === ui.pubHighlight.id);
    const mine = mineAll.slice(0, 5); if (hi && !mine.includes(hi)) mine.push(hi);
    return `<div class="page">
      <div class="page-head row spread">
        ${head("Your examiner desk", "Publish an opening.", "", "One date at a time. For your weekly pattern, use Calendar.", "h1")}
        ${actingSelect(dp)}
      </div>
      <p class="small"><a href="#/requests">\u2190 Back to Requests</a> \u00b7 <a href="#/dpe-openings">Calendar</a></p>
      <div class="stack">
          <section class="card" id="publish-opening" style="max-width:640px" tabindex="-1" aria-labelledby="publish-opening-h">
            <h2 id="publish-opening-h">New opening</h2>
            <p class="muted small">Pilots with matching saved alerts get a mock alert in this browser. Nothing is emailed.</p>
            <form class="stack" data-form="publish">
              <div class="grid g2" style="grid-template-columns:1fr 1fr">
                <label class="field"><span>Date</span><input type="date" name="date" required min="${addDaysIn(1, dtz)}" value="${addDaysIn(6, dtz)}" /></label>
                <label class="field"><span>Start (airport local time)</span><select name="time">${["07:30", "08:00", "08:30", "09:00", "12:00", "12:30", "13:00"].map((x) => `<option value="${x}">${fmtTime(x)}</option>`).join("")}</select></label>
              </div>
              ${airportSelect("airport", dp.home, "Airport", nearby)}
              <fieldset style="border:0;padding:0;margin:0"><legend class="small muted" style="font-weight:600;margin-bottom:.3rem">CERTIFICATES OFFERED</legend>
                <div class="row small">${Object.keys(dp.fees).map((c) => `<label class="row" style="gap:.3rem"><input type="checkbox" name="certs" value="${c}" checked /> ${esc(certById(c).short)}</label>`).join("")}</div>
              </fieldset>
              <button class="btn" type="submit" id="publish-submit">Publish opening</button>
            </form>
          </section>
          <section class="card small" id="publish-upcoming"><h2 class="h3">Your next open dates</h2>
            ${mine.length ? `<ul class="plain">${mine.map((x) => `<li id="pub-${x.id}" tabindex="-1">${slotWhenLong(x)} \u00b7 ${x.airport}${hi && hi.id === x.id ? ` <span class="pill ${ui.pubHighlight.dup ? "warn" : "good"}">${ui.pubHighlight.dup ? "Already published" : "Just published"}</span>` : ""}</li>`).join("")}</ul>` : '<p class="muted">No open dates yet.</p>'}
          </section>
      </div>
    </div>`;
  }

  function viewOpenings() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const a = availOf(dp.id), fr = freshOf(dp.id);
    const next = dpeNextOpen(dp.id);
    const dates = Array.from({ length: 21 }, (_, i) => addDaysIn(i + 1, aptTz(dp.home))); // QA-039: same lead-time rule as the Publish form
    const weeks = [];
    dates.forEach((d) => {
      const dt = parseIso(d); const mon = new Date(dt); mon.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
      const k = iso(mon); let w = weeks.find((x) => x.k === k);
      if (!w) { w = { k, days: [] }; weeks.push(w); }
      w.days.push(d);
    });
    const near = D.airports.filter((x) => x.id === dp.home || distNm(dp.home, x.id) <= dp.travelNm).map((x) => x.id);
    const row = (d) => {
      const all = S.slots.filter((x) => x.dpeId === dp.id && x.date === d && x.status !== "removed").sort((x, y) => x.time.localeCompare(y.time));
      const cur = all.filter((x) => !isOneOff(x)), ones = all.length - cur.length; // QA-040: the pattern row shows pattern slots only
      const taken = cur.filter((x) => x.status !== "open").length;
      const firstOpen = cur.find((x) => x.status === "open") || cur[0];
      const isOpen = cur.length > 0;
      const maxCap = Math.max(3, cur.length);
      const cap = Math.max(1, cur.length);
      const times = [...new Set([...SLOT_TIMES, ...(firstOpen ? [firstOpen.time] : [])])].sort();
      const sunday = parseIso(d).getDay() === 0;
      return `<div class="avail-day ${isOpen ? "is-open" : ""}" data-date="${d}">
        <div class="avail-top">
          <div class="avail-date"><b>${fmtDate(d, { weekday: "short", month: "short", day: "numeric" })}</b>${taken ? `<span class="small muted">${plural(taken, "request/booking")} on this day</span>` : sunday ? `<span class="small muted">Sunday</span>` : ""}${ones ? `<span class="small muted" data-oneoff-count="${ones}">${plural(ones, "one-off opening")} on this day, not changed by the weekly pattern</span>` : ""}</div>
          <label class="switch"><input type="checkbox" name="open-${d}" ${isOpen ? "checked" : ""} aria-label="Open on ${fmtDate(d)}" /><span class="track"></span><span class="lbl on">Open</span><span class="lbl off">Closed</span></label>
        </div>
        <div class="avail-fields">
          <label class="field"><span>Checkrides</span><select name="cap-${d}">${Array.from({ length: maxCap }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === cap ? "selected" : ""} ${n < taken ? "disabled" : ""}>${n}</option>`).join("")}</select></label>
          <label class="field"><span>Start time (airport local)</span><select name="time-${d}">${times.map((tm) => `<option value="${tm}" ${firstOpen && firstOpen.time === tm ? "selected" : ""}>${fmtTime(tm)}</option>`).join("")}</select></label>
          <label class="field"><span>Airport</span><select name="airport-${d}">${[...new Set([...near, ...(firstOpen ? [firstOpen.airport] : [])])].map((x) => `<option value="${x}" ${(firstOpen ? firstOpen.airport : dp.home) === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
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
    const rTz = aptTz(dp.home);
    const rAt = nextReminderAt(a.reminderDay, rTz);
    const rYmd = ymdIn(rAt, rTz);
    const nudge = nextDowAt(iso(new Date(parseIso(rYmd).getFullYear(), parseIso(rYmd).getMonth(), parseIso(rYmd).getDate() + 1)), 3, "12:00", rTz, rAt);
    const upcoming = openSlots({ dpeId: dp.id }).slice(0, 3);
    return `<div class="page avail-page">
      <div class="page-head row spread">
        <div class="page-head v3-head" style="margin:0"><p class="eyebrow">Calendar</p><h1 style="margin:0 0 .35rem">Your calendar</h1><p class="muted" style="margin:0">Tap a slot to open or close it. ${esc(dp.name)} · ${dp.home} · a 1-minute weekly check so students see real dates</p></div>
        <label class="field" style="min-width:220px"><span>Signed in as (demo)</span><select data-action-change="acting-dpe">${allDpes().map((d) => `<option value="${d.id}" ${d.id === dp.id ? "selected" : ""}>${esc(d.name)} · ${d.home}</option>`).join("")}</select></label>
      </div>
      <section class="card avail-status ${fr.level}">
        <div class="row spread" style="align-items:flex-start">
          <div>
            <div class="small muted">Last updated</div>
            <div class="avail-stamp" id="avail-stamp"><b>${fmtTs(a.updatedAt)}</b> <span class="muted small">(${agoText(Math.max(0, Math.floor((Date.now() - a.updatedAt) / DAY)))})</span></div>
            <div style="margin-top:.4rem">${freshBadge(dp.id)}</div>
            <p class="small" style="margin:.5rem 0 0">Students currently see your next open date as <b id="avail-next">${next ? fmtDate(next.date, { weekday: "short", month: "short", day: "numeric" }) + " (" + relDays(next.date, slotTz(next)) + ")" : "none: no openings are shown"}</b>.${fr.level === "amber" ? " They also see a \u201cmay be out of date\u201d tag." : ""}${fr.level === "stale" || fr.level === "reverify" ? " Your slots are hidden from search and requests until you confirm." : ""}</p>
          </div>
          <div class="row"><button class="btn good" data-action="avail-confirm" id="avail-confirm">Yes, nothing changed</button><a class="btn ghost" href="#/dpe/${dp.id}">See what students see</a></div>
        </div>
        <p class="muted small" style="margin:.6rem 0 0">One tap on <b>Yes, nothing changed</b> re-confirms your current openings. Saving any edit below also refreshes the stamp. Students always see a \u201cconfirm with the examiner\u201d line.</p>
      </section>
      <section class="card" id="sim-card" style="margin-bottom:1rem">
        <div class="row spread"><h2 style="margin:0">Simulate an opening <span class="pill warn" style="vertical-align:middle">Demo · simulated</span></h2><button class="btn ghost sm" data-action="sim-open" data-dpe="${dp.id}" id="sim-open-dpe">Simulate opening</button></div>
        <p class="muted small" style="margin:.4rem 0 0">Adds one labelled simulated slot for ${esc(dp.name)} on the next free day and runs saved student alerts against it. Matching students see it in their in-app inbox. Nothing is emailed, texted or pushed.</p>
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
        <div class="small" style="margin:.75rem 0 .5rem">${a.pauseReminders ? "<b>Reminders paused.</b> Your openings will go stale after 14 days without a confirmation." : `Next reminder: <b>${fmtWhen(rAt, rTz)}</b>. If there is no response, a nudge follows <b>${fmtWhen(nudge, rTz)}</b>; after 3 missed weeks it escalates to the listing admin (mock).`}</div>
        <div class="email-preview" aria-label="Mock reminder email preview">
          <div class="ep-head"><span class="small muted">To: ${esc(dp.name.toLowerCase().replace(/[^a-z]+/g, "."))}@example.invalid</span><br><b>Subject: Still open the same as last week?</b></div>
          <div class="ep-body">
            <p>Hi ${esc(first(dp.name))}, here is what students see for you right now:</p>
            <ul>${upcoming.length ? upcoming.map((x) => `<li>${fmtDate(x.date)} · ${slotTime(x)} · ${x.airport}${x.note ? " · " + esc(x.note) : ""}</li>`).join("") : "<li>Nothing open</li>"}</ul>
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
    "Liam Chen": { h: { xcpic: 61, inst: 49 }, kt: [14, 9] },
    "Mateo Silva": { h: { total: 47, dual: 24, solo: 12 }, kt: [9, 15] },
    "Noah Patel": { h: { total: 262, pic: 104 }, kt: [5, 20], iacra: false },
    "Emma Rossi": { h: {}, kt: [3, 1] },
    "Olivia Grant": { h: { total: 58, dual: 26, solo: 14 }, kt: [6, 12] },
    "Ethan Brooks": { h: { total: 64, dual: 30, solo: 15 }, kt: [4, 8] },
    "Zoe Carter": { h: { xcpic: 57, inst: 42 }, kt: [8, 3] },
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
  // Matching inside one examiner-day: a maximum bipartite matching (augmenting paths), so a cohort that can share a day
  // is never rejected because an earlier student took the "wrong" slot. Students with the fewest compatible slots go first,
  // each prefers the earliest time.
  function matchDay(list, daySlots) {
    const slotsByTime = [...daySlots].sort((a, b) => a.time.localeCompare(b.time));
    const fits = new Map(list.map((st) => [st, slotsByTime.filter((sl) => slotFits(st, sl))]));
    const order = [...list].sort((x, y) => fits.get(x).length - fits.get(y).length || x.name.localeCompare(y.name));
    const owner = new Map(); // slot id -> student
    const tryAssign = (st, seen) => {
      for (const sl of fits.get(st)) {
        if (seen.has(sl.id)) continue;
        seen.add(sl.id);
        if (!owner.has(sl.id) || tryAssign(owner.get(sl.id), seen)) { owner.set(sl.id, st); return true; }
      }
      return false;
    };
    order.forEach((st) => tryAssign(st, new Set()));
    return slotsByTime.filter((sl) => owner.has(sl.id)).map((sl) => ({ st: owner.get(sl.id), slot: sl }));
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
      ...(r.test ? [`<li>Knowledge test: ${A.ktPass ? "passed" : "not marked passed"}${A.ktDate ? ` ${fmtDateY(A.ktDate)}, result expires ${fmtDateY(ktExpiry(A.ktDate))} (draft rule)` : ""}</li>`] : []),
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
        <span class="small muted" style="display:block">CFI ${esc(st.cfi)} · checklist ${readyText(of9(st.readiness))}${sub ? " · " + sub : ""}</span></span></label>`;
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
      result = emptyState({ id: "cohort-empty", ic: "users", tag: "section", title: "No students selected", body: "Select at least one student above to see which openings fit the group." });
    } else {
      const readyRows = plan.checks.map((c) => {
        const fin = plan.final[c.st.i] || c;
        return `<tr data-st="${c.st.i}" class="ready-${c.status}"><td><b>${esc(c.st.name)}</b><div class="small muted">${esc(certById(c.st.cert).short)} · checklist ${readyText(of9(c.st.readiness))}</div></td>
        <td>${readyPill(fin.block.length ? c : fin)}${c.answers.sample ? ' <span class="pill">SAMPLE answers</span>' : ""}</td>
        <td class="small">${c.block.length ? `<ul class="reasons bad-list">${c.block.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${fin.warn.length ? `<ul class="reasons warn-list">${fin.warn.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${!c.block.length && !fin.warn.length ? '<span class="muted">All draft checks confirmed (self-attested).</span>' : ""}</td>
        <td class="num"><button class="btn ghost sm" data-action="cohort-ready-edit" data-i="${c.st.i}" aria-label="${c.block.length ? "Fix answers" : "Edit answers"} for ${esc(c.st.name)}">${c.block.length ? "Fix answers" : "Edit answers"}</button></td></tr>`;
      }).join("");
      const readySec = `<section class="card stack" id="cohort-ready">
        <h2 style="margin:0">Readiness check per student <span class="pill warn" style="vertical-align:middle">Self-attested</span></h2>
        <p class="small muted" style="margin:0">Same draft checks as a student request: endorsements, logbook hours, knowledge test (24-calendar-month draft rule), plus IACRA started. Cohort requests also warn below ${of9(COHORT_PCT_MIN)} of 9 ready. Unverified draft, not legal or FAA advice. Blocked students are left out of matching; fix their answers or proceed with the eligible students.</p>
        <div class="table-wrap"><table class="ready-table"><thead><tr><th>Student</th><th>Status</th><th>Reasons and warnings</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${readyRows}</tbody></table></div>
        <p class="small" id="cohort-eligible" style="margin:0"><b>${plan.eligible.length} of ${students.length}</b> eligible.${plan.blocked.length ? ` Not included: ${plan.blocked.map((c) => esc(c.st.name)).join(", ")}.` : ""}</p>
      </section>`;
      const rule = `<p class="rank-rule small" id="cohort-rule"><b>How options are ranked:</b> 1) soonest date that fits, 2) lowest total all-in cost for the group (examiner fee + ${FEES ? `${money(BOOKING_FEE)} booking fee + ` : ""}example aircraft and travel estimates from ${esc(sc.airport)}), 3) examiner name A–Z. ${P.together ? "With <b>Keep the cohort together</b> on, one-examiner, one-day options win when any fit everyone; otherwise" : "With <b>Keep the cohort together</b> off,"} each student is placed by the same rule, most constrained student first, and can be split across examiners and days. Example numbers, not quotes.</p>`;
      const where = P.anyDpe ? `${plural(plan.dpeCount, "sample examiner")}` : esc(dp.name);
      let head;
      if (!plan.eligible.length) head = `<div class="fit-head bad"><b>No eligible students.</b> Every selected student is blocked by the readiness check. Fix their answers above.</div>`;
      else if (plan.mode === "whole") head = `<div class="fit-head good"><b>Whole cohort fits on ${fmtDate(plan.chosen.date, { weekday: "long", month: "long", day: "numeric" })} with ${esc(plan.chosen.dp.name)}.</b> ${plural(plan.assign.length, "student")}, total all-in ${money(plan.chosen.total)} (example). ${optKey(plan.chosen) === optKey(plan.options[0]) ? "Ranked #1." : "Your pick, not the top-ranked option."}</div>`;
      else if (plan.mode === "split") head = `<div class="fit-head warn"><b>${plan.options.length ? "Split chosen." : `No single examiner-day fits all ${plan.placeable.length}.`}</b> Best-fit split: ${plural(plan.split.dpCount, "examiner")}, ${plural(new Set(plan.assign.map((x) => x.date)).size, "day")}, ${plan.assign.length} of ${plan.eligible.length} eligible students placed, total all-in ${money(plan.split.total)} (example).${plan.unplaced.length ? ` ${plural(plan.unplaced.length, "student")} can\u2019t be placed (${plan.unplaced.map((x) => esc(x.name)).join(", ")}).` : ""}</div>`;
      else head = `<div class="fit-head bad"><b>No open slots fit.</b> Nothing open for the eligible students with ${where} in ${fmtDate(P.from)} to ${fmtDate(P.to)}${dp && isStale(dp.id) ? ` (${esc(dp.name)}\u2019s availability is not recently confirmed)` : ""}. Try another examiner or a wider window.</div>`;
      const warnList = [];
      plan.noFit.forEach((st) => warnList.push(`${esc(st.name)}: no open slot for ${esc(certById(st.cert).name)} with ${where} before ${fmtDateA(P.to < ktLimit(st) ? P.to : ktLimit(st))}${ktLimit(st) < P.to ? " (knowledge-test expiry)" : ""}`));
      // Alternatives considered (ranked).
      const best = plan.chosen;
      const alts = [...plan.options.slice(0, 6)];
      const altRows = alts.map((o, n) => ({ o, rank: n + 1 }));
      if (plan.split && (!plan.options.length || plan.split.dpCount > 1 || plan.split.date !== plan.split.lastDate)) altRows.push({ o: plan.split, rank: null });
      const altTable = altRows.length ? `<div class="table-wrap"><table class="cohort-alts" id="cohort-alts"><caption class="small muted" style="text-align:left;padding:.4rem 0">Alternatives considered: ${plural(plan.options.length, "whole-cohort option")} out of ${plural(plan.examinerDays, "examiner-day")} with openings${plan.options.length > 6 ? ", top 6 shown" : ""}${altRows.some((x) => x.o.split) ? ", plus the per-student split" : ""}</caption>
        <thead><tr><th>Rank</th><th>Option</th><th>Dates</th><th class="num">Students</th><th class="num">Total all-in</th><th class="num">vs. selected</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${altRows.map(({ o, rank }) => {
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
          <div class="table-wrap"><table><thead><tr><th>Student</th><th>Examiner and slot</th><th class="num">Examiner fee</th><th class="num">Deposit (ASSUMPTION)</th>${FEES ? `<th class="num">Booking fee</th>` : ""}<th class="num">Due if accepted</th><th class="num">All-in (example)</th></tr></thead>
          <tbody>${rows.map((r) => `<tr><td><b>${esc(r.st.name)}</b><div class="small muted">${esc(certById(r.st.cert).short)}${r.chk.warn.length ? ` · ${plural(r.chk.warn.length, "warning")}` : ""}</div></td><td class="small">${esc(r.dp.name)}<div>${fmtDate(r.slot.date)} · ${slotTime(r.slot)} · ${r.slot.airport}</div></td><td class="num">${money(r.fee)}</td><td class="num">${money(r.dep)}</td>${FEES ? `<td class="num">${money(BOOKING_FEE)}</td>` : ""}<td class="num"><b>${money(r.due)}</b></td><td class="num">${money(r.allIn)}</td></tr>`).join("")}</tbody>
          <tfoot><tr><td colspan="2"><b>Totals for ${plural(rows.length, "student")}</b></td><td class="num">${money(tot.fee)}</td><td class="num">${money(tot.dep)}</td>${FEES ? `<td class="num">${money(BOOKING_FEE * rows.length)} <span class="small muted">(${money(BOOKING_FEE)} × ${rows.length})</span></td>` : ""}<td class="num"><b id="cohort-total">${money(tot.due)}</b></td><td class="num" id="cohort-allin">${money(tot.allIn)}</td></tr></tfoot></table></div>
          <div class="summary small" style="margin-top:.75rem">
            <div class="line"><span>Examiner fees, due at the test (deposits are credited toward these)</span><b>${money(tot.fee)}</b></div>
            <div class="line"><span>Deposits, <b>ASSUMPTION</b>, paid to each examiner (mock) if the request is accepted</span><b>${money(tot.dep)}</b></div>
            ${FEES ? `<div class="line"><span>Student booking fees, ${money(BOOKING_FEE)} per student</span><b>${money(BOOKING_FEE * rows.length)}</b></div>` : `<div class="line muted"><span>Student booking fees (${FREE_LINE.replace(".", "")})</span><b>$0</b></div>`}
            <div class="line" style="border-top:1px solid var(--border-strong);margin-top:.3rem;padding-top:.5rem"><span><b>Total due if all are accepted</b></span><b>${money(tot.due)}</b></div>
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
      ${reqs.length ? reqs.map((b) => { const sl = S.slots.find((x) => x.id === b.slotId); const d2 = dpeById(b.dpeId); return `<div class="slot-row"><div style="flex:1;min-width:200px"><b>${esc(b.applicant)}</b> · ${esc(certById(b.cert).short)} ${bookingPill(b)}<div class="small">${esc(d2.name)} · ${fmtDate(sl.date)} · ${slotTime(sl)} · ${sl.airport}</div><div class="small muted">Due if accepted ${money(b.depositUsd + b.bookingFeeUsd)} · actually charged $0${b.selfCheck && b.selfCheck.warn && b.selfCheck.warn.length ? ` · ${plural(b.selfCheck.warn.length, "readiness warning")}` : ""}</div></div>
        <div class="row">${b.status === "requested" ? `<button class="btn secondary sm" data-action="as-dpe" data-dpe="${d2.id}">Respond as ${esc(first(d2.name))} (demo)</button>` : ""}${b.status === "requested" || b.status === "confirmed" ? `<button class="btn bad sm" data-action="pilot-cancel" data-id="${b.id}">Cancel</button>` : ""}</div></div>`; }).join("") : emptyState({ id: "cohort-requests-empty", ic: "calendar", cls: "", title: "", body: "No cohort requests yet. Pick students and an option above, then request it (mock)." })}
    </section>`;
    return `<div class="page cohort-page">
      <div class="page-head"><p style="margin:0"><a href="#/school">← Roster</a></p><h1 style="margin:0">Cohort scheduling</h1><p class="muted" style="margin:0">${esc(sc.name)} · check each student\u2019s readiness, then find ranked openings for the group</p></div>
      <div class="stack">${filters}${result}${reqSec}</div>
    </div>`;
  }
  function openCohortReady(i) {
    const st = D.school.students[i], A = cohortAnswers(st);
    openModal(`<h2>Readiness answers: ${esc(st.name)}</h2>
      <p class="muted small" style="margin-bottom:.75rem">${esc(certById(st.cert).name)} · CFI ${esc(st.cfi)} · checklist ${readyText(of9(st.readiness))}. Entered by the school, self-attested, nothing verified.</p>
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
    const ready = st.filter((s) => of9(s.readiness) >= 9 && s.endorsed).length;
    const scheduled = st.filter((s) => studentBooking(s) || s.status === "confirmed" || s.status === "requested").length;
    const status = (s) => {
      const sb = studentBooking(s);
      if (sb) { const sl = S.slots.find((x) => x.id === sb.slotId); return `${bookingPill(sb)} <span class="small">${fmtDate(sl.date)} · ${esc(dpeById(sb.dpeId).name)}</span>`; }
      if (s.status === "confirmed") return `<span class="pill good">Confirmed</span> <span class="small">${fmtDate(addDays(s.daysOut))} · ${esc(dpeById(s.dpe).name)}</span>`;
      if (s.status === "requested") return `<span class="pill warn">Awaiting examiner</span> <span class="small">${fmtDate(addDays(s.daysOut))} · ${esc(dpeById(s.dpe).name)}</span>`;
      if (s.status === "alert") return `<span class="pill accent">Mock alert active</span>`;
      return `<span class="muted small">Not scheduled</span>`;
    };
    return `<div class="page">
      <div class="page-head row spread">
        <div>${schoolHead()}<p class="muted" style="margin:-.75rem 0 0"><b>${esc(sc.name)}</b> · ${sc.airport} · fictional school · ${FEES ? `<span class="pill accent">${esc(tier.name)} plan (mock, proposed pricing)</span>` : `<span class="pill good">Free during the prototype</span>`}</p></div>
        <div class="row"><a class="btn" href="#/school/cohort">Schedule a cohort</a><button class="btn secondary" data-action="school-invite">+ Add student</button></div>
      </div>
      ${SCHOOL_TABS("#/school")}
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(st.length, "Students in training (sample)")}
        ${statCard(ready, "Ready for review (9 of 9 ready + endorsed)")}
        ${statCard(scheduled, "Requested or confirmed checkrides")}
        ${statCard(`${of9(median(st.map((s) => s.readiness)))} of 9`, "Median readiness (items ready)")}
      </section>
      ${!FEES ? `<section class="card" id="school-free" style="margin-bottom:1rem"><h2>Free during the prototype</h2><p class="muted small" style="margin:0">Checkride Connect is free for schools, students and examiners during the prototype. There are no school plans to choose. Deposits are paid directly to each examiner under their terms (mock). Nothing is charged.</p></section>` : `<section class="card" style="margin-bottom:1rem">
        <h2>School plans <span class="pill warn" style="vertical-align:middle">Proposed pricing</span></h2>
        <p class="muted small">Proposed pricing, not final. DPEs list for free and students pay a ${money(BOOKING_FEE)} booking fee unless a Pro or Academy school chooses to pay. Choosing a plan here is a mock: no payment, no sign-up, no message is sent.</p>
        <div class="grid g3">${TIERS.map((t) => `<div class="card plan ${t.id === S.tier ? "featured" : ""}" style="box-shadow:none">
          <h3>${t.name} ${t.id === S.tier ? '<span class="pill good">Selected (mock)</span>' : ""}</h3><div class="p">${t.price}${t.unit ? `<span class="muted small" style="font-weight:400"> ${esc(t.unit)}</span>` : ""}</div>
          <p class="small muted" style="margin:0">${esc(t.seats)}</p>
          <ul class="small">${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          <button class="btn ${t.id === S.tier ? "ghost" : "secondary"}" data-action="pick-tier" data-tier="${t.id}">${t.id === S.tier ? "Selected" : "Select (mock)"}</button>
        </div>`).join("")}</div>
      </section>`}
      <p class="eyebrow" id="roster-label">Your students · ${st.length}</p>
      <h2>Roster <span class="muted small" style="font-weight:400">(mock, fictional students)</span></h2>
      <section class="card"><div class="table-wrap"><table><caption class="sr-only">Student roster: checkride, CFI, readiness, endorsements and status</caption>
        <thead><tr><th>Student</th><th>Checkride</th><th>CFI</th><th>Readiness</th><th>Endorsements</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${st.map((s) => `<tr>
          <td><b>${esc(s.name)}</b></td><td>${esc(certById(s.cert).short)}</td><td class="small">${esc(s.cfi)}</td>
          <td><div class="row" style="gap:.5rem;flex-wrap:nowrap"><div style="width:90px">${seg9(of9(s.readiness))}</div>${countPill(of9(s.readiness))}</div></td>
          <td>${s.endorsed ? '<span class="pill good">Signed</span>' : '<span class="pill warn">Pending</span>'}</td>
          <td>${status(s)}</td>
          <td class="num"><div class="row" style="justify-content:flex-end;flex-wrap:nowrap">${s.status === "none" && !studentBooking(s) ? `<a class="btn sm" href="#/search?cert=${s.cert}&near=${sc.airport}" data-action="school-find" data-student="${esc(s.name)}">Find slot</a>` : ""}<a class="btn ghost sm" href="#/school/readiness">Checklist</a></div></td>
        </tr>`).join("")}</tbody>
      </table></div></section>
      <p class="muted small" style="margin-top:1rem">Planned${FEES ? " for school tiers" : ""} (not built): shared alerts for the roster, and one view of checklist progress.</p>
    ${v4SchoolNear()}
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
      <div class="page-head v3-head"><h1>Admin <span class="pill warn" style="vertical-align:middle">Mock</span></h1><p class="muted">A sketch of how a team might review examiner applications and watch marketplace numbers. All applications and figures are fictional; nothing is verified against any FAA source. Listing an examiner here is a marketplace decision only and says nothing about their FAA designation.</p></div>
      <section class="grid g4" style="margin-bottom:1rem">
        ${statCard(allDpes().length, "Sample examiners listed")}
        ${statCard(pending.length, "Sample applications to review")}
        ${statCard(openSlots().length, "Open slots")}
        ${statCard(S.bookings.filter((b) => b.status === "requested").length, "Requests awaiting examiners")}
        ${FEES ? statCard(money(confirmed * BOOKING_FEE), `Mock booking fees (${confirmed} × ${money(BOOKING_FEE)}), not collected`) : statCard("$0", "Booking fees (free during the prototype)")}
        ${statCard(S.alerts.length, "Mock alerts (demo user)")}
        ${FEES ? statCard(money(TIER_PRICE[S.tier] || 0), "School plan MRR (proposed pricing, 1 sample school)") : statCard(confirmed, "Approved bookings (sample)")}
      </section>
      <h2>Sample application queue</h2>
      <div class="stack">${pending.length ? pending.map(card).join("") : emptyState({ id: "admin-queue-empty", ic: "check", title: "Queue is clear", body: "No sample applications are waiting for review." })}</div>
      ${reviewed.length ? `<h2 style="margin-top:1.5rem">Recently reviewed</h2><div class="card">${reviewed.map((p) => `<div class="slot-row"><span><b>${esc(p.name)}</b> <span class="muted small">${esc(p.designee)}</span></span>${p.status === "approved" ? '<span class="pill">Listed (mock)</span>' : p.status === "info" ? '<span class="pill warn">Info requested</span>' : '<span class="pill bad">Rejected</span>'}</div>`).join("")}</div>` : ""}
    </div>`;
  }

  function viewPricing() {
    if (!FEES) {
      const ex = D.dpes[0], exFee = ex.fees.ppl, exTravel = ex.travelFee;
      return `<div class="page narrow pricing-v3">
      ${head("What it costs", "Free during the prototype.", "No fees from us.", "Students, examiners and flight schools pay Checkride Connect nothing while we test this prototype. You pay your examiner directly for the checkride, under the examiner\u2019s own terms.")}
      <section class="card" id="pricing-free">
        <div class="row spread"><h2 style="margin:0">Checkride Connect</h2><span class="big-num">Free</span></div>
        <p class="muted small" style="margin:.5rem 0 0">Free during the prototype \u00b7 Students, examiners and flight schools</p>
      </section>
      <section class="card" id="pricing-example">
        <p class="eyebrow">Example checkride cost \u00b7 Fictional numbers</p>
        <div class="summary">
          <div class="line"><span>Examiner fee</span><b>${money(exFee)}</b></div>
          <div class="line"><span>Travel to KORL <span class="muted small">Estimate</span></span><b>${money(exTravel)}</b></div>
          <div class="line total"><span><b>Total (est.)</b></span><b>${money(exFee + exTravel)}</b></div>
        </div>
        <div class="inset small"><div class="line"><span>Deposit paid to your examiner</span><b class="mono">${money(depositFor(ex, "ppl"))}</b></div></div>
        <p class="muted small" style="margin:.6rem 0 0">Sample, fictional figures.</p>
      </section>
      <section class="card" id="deposit-policy"><h3>Deposits and cancellations <span class="pill warn" style="vertical-align:middle">Proposed, pending legal review</span></h3><p class="small" style="margin:0" data-policy>${DEPOSIT_POLICY}</p><p style="margin:.4rem 0 0">${PM_TAG}</p><p class="muted small" style="margin:.5rem 0 0">Each examiner\u2019s own deposit terms are quoted on their profile and on your request. Nothing is charged or refunded in this prototype. Still open: real examiner data sources, payment handling and checklist review by a CFI or DPE.</p></section>
      <p class="muted small">Prototype: nothing is charged.</p>
    </div>`;
    }
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
          <li>Search, fee comparison and checklists are free</li><li>Plus the deposit paid to your examiner (mock), credited toward their fee</li><li>Shown in the mock booking flow, never charged</li></ul>
          <a class="btn secondary" href="#/search">Try a mock request</a></div>
        <div class="card plan"><h3>Flight schools · proposed plans</h3><div class="p">$0 <span class="muted small" style="font-weight:400">to</span> $299<span class="muted small" style="font-weight:400"> / mo</span></div><ul class="small" id="pricing-tiers">
          ${TIERS.map((t) => `<li><b>${esc(t.name)}</b> ${t.price}${t.unit ? " " + esc(t.unit) : ""}</li>`).join("")}<li>Proposed pricing, not final. Selecting one is a mock.</li></ul>
          <a class="btn secondary" href="#" data-action="set-role" data-role="school">See the school view</a></div>
      </section>
      <section class="grid g2" style="margin-top:1rem">
        <div class="card"><h3>Why a flat student fee?</h3><p class="muted small" style="margin:0">It stays the same whichever examiner you choose and is not a percentage of the examiner's fee. Whether any booking fee is permitted alongside designee rules still needs confirming with the FAA or FSDO before launch.</p></div>
        <div class="card" id="deposit-policy"><h3>Deposits and cancellations <span class="pill warn" style="vertical-align:middle">Proposed, pending legal review</span></h3><p class="small" style="margin:0" data-policy>${DEPOSIT_POLICY}</p><p style="margin:.4rem 0 0">${PM_TAG}</p><p class="muted small" style="margin:.5rem 0 0">Each examiner\u2019s own deposit terms are quoted on their profile and on your booking. Nothing is charged or refunded in this prototype. Still open: real examiner data sources, payment handling and checklist review by a CFI or DPE.</p></div>
      </section>
    </div>`;
  }

  // ---------- v3 (design-spec-v3, ux-copy-v3): landing, student home, journey, readiness, more, request workspace, DPE and school tabs ----------
  const slotOf = (b) => S.slots.find((x) => x.id === b.slotId);
  const myReqs = () => S.bookings.filter((b) => b.mine).sort((a, b) => b.createdAt - a.createdAt);
  const activeReq = () => myReqs().find((b) => b.status === "confirmed") || myReqs().find((b) => b.status === "requested");
  const dateTile = (iso) => `<div class="date-tile" aria-hidden="true"><span>${fmtDate(iso, { month: "short" }).toUpperCase()}</span><b>${parseIso(iso).getDate()}</b></div>`;
  const certLong = (c) => ({ ppl: "Private Pilot \u00b7 Airplane SEL" }[c] || certById(c).name);
  const chip = (cls, t) => `<span class="pill ${cls}">${t}</span>`;

  // Readiness checklist: the 9 items of ux-copy-v3 §3, ruling 1 order, prep last. [VERIFY] flags kept as written.
  const VERIFY = `<span class="pill verify" title="A regulatory fact to be checked by a CFI, a DPE or counsel before it ships">[VERIFY]</span>`;
  const READY9 = (cert, dp) => [
    cert === "cfi"
      ? { id: "kt", t: "Knowledge tests passed", h: `${VERIFY} CFI applicants usually have more than one knowledge test (FOI and FIA). Add each one.` }
      : { id: "kt", t: "Knowledge test passed", h: `Upload a photo or PDF of your test report. Bring the original on test day. ${VERIFY}` },
    { id: "exp", t: "Aeronautical experience met", h: `Your logged hours, checked with your CFI. Journey shows what you\u2019ve logged so far. ${VERIFY}` },
    { id: "end", t: "Endorsements in your logbook", h: "Your CFI signs these in your logbook, including the sign-off for any knowledge-test areas you missed. We only track that they\u2019re there." },
    { id: "med", t: "Medical", h: `Your medical (or BasicMed, or U.S. driver\u2019s license for Sport), with you on test day. ${VERIFY}` },
    { id: "iacra", t: "IACRA application", h: "Start it in IACRA. Your CFI usually signs it before test day." },
    { id: "docs", t: "Aircraft documents ready", h: `Ask your school or the owner where the aircraft documents and maintenance records are. ${VERIFY}` },
    { id: "id", t: "Photo ID ready", h: `Government photo ID. ${VERIFY}` },
    { id: "terms", t: "Examiner fee and deposit terms acknowledged", h: dp ? `${esc(first(dp.name))}\u2019s fee, deposit and cancellation terms, in their own words: \u201c${esc(depTerms(dp))}\u201d` : "Your examiner\u2019s fee, deposit and cancellation terms, in their own words, show here once you send a request.", lbl: "I\u2019ve read these" },
    { id: "prep", t: "Checkride-day prep", h: "Mark it done when you feel set." },
  ];
  // Segmented n-of-9 bar (D38 #5, QA-004: counts, never percentages).
  const seg9 = (n, total = 9) => `<div class="seg9" role="img" aria-label="${n} of ${total} ready" data-seg="${n}/${total}"${total !== 9 ? ` style="grid-template-columns:repeat(${total},1fr)"` : ""}>${Array.from({ length: total }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</div>`;
  // Eligibility roll-up (D38 #5, ux-copy-v3 journey.chip.*): On track · Heads-up · Closed · Not set, most serious wins
  // (Closed > Heads-up > On track); "Not set" when nothing is entered. The only dated input in this prototype is the
  // optional knowledge-test date on the readiness checklist (24-calendar-month rule, draft; Heads-up within 90 days, D8).
  // Target month (ux-copy-v3 D9 "Target: Dec 2026 \u00b7 Change"). PM default, pending Drewbert: the month that contains today + 45 days.
  function defaultTarget() { return addDays(45).slice(0, 7); }
  const targetEnd = (ym) => { const [y, m] = ym.split("-").map(Number); return iso(new Date(y, m, 0)); };
  // QA-037: feature-detect <input type=month>. An unsupported type falls back to "text" and doesn't sanitize values.
  // window.CC_FORCE_MONTH_FALLBACK forces the fallback (tests).
  const monthInputSupported = () => {
    if (window.CC_FORCE_MONTH_FALLBACK) return false;
    const i = document.createElement("input"); i.setAttribute("type", "month");
    if (i.type !== "month") return false;
    i.value = "not-a-month"; return i.value === "";
  };
  // Accepts 2027-03, 2027-3, 03/2027, 3/2027, "March 2027", "Mar 2027"; returns YYYY-MM or "".
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const parseMonthText = (t) => {
    t = String(t || "").trim().toLowerCase(); let y, m, r;
    if ((r = t.match(/^(\d{4})[-/.](\d{1,2})$/))) { y = +r[1]; m = +r[2]; }
    else if ((r = t.match(/^(\d{1,2})[-/.](\d{4})$/))) { y = +r[2]; m = +r[1]; }
    else if ((r = t.match(/^([a-z]{3,9})\.?,?\s+(\d{4})$/)) && MONTHS.indexOf(r[1].slice(0, 3)) >= 0 && "january february march april may june july august september october november december".split(" ").some((n) => n.startsWith(r[1]))) { y = +r[2]; m = MONTHS.indexOf(r[1].slice(0, 3)) + 1; }
    else return "";
    return m >= 1 && m <= 12 && y >= 1900 && y <= 2999 ? `${y}-${String(m).padStart(2, "0")}` : "";
  };
  const fmtMonth = (ym) => { const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }); };
  const targetChip = () => `<span class="pill" id="journey-target" data-target="${S.target}">Target: ${fmtMonth(S.target)} \u00b7 <button class="linkish" type="button" data-action="target-change" aria-haspopup="dialog">Change</button></span>`;
  const ROLL = { bad: ["bad", "Closed"], warn: ["warn", "Heads-up"], good: ["good", "On track"], none: ["", "Not set"] };
  const eligRollup = () => {
    const r9 = S.ready9 || {}, dates = S.ready9Dates || {};
    const cur = activeReq(), sl = cur && slotOf(cur);
    const ref = sl ? sl.date : iso(today0());
    const goal = sl ? sl.date : S.target ? targetEnd(S.target) : ref;
    const sigs = [], why = [];
    if (dates.kt) {
      const exp = ktExpiry(dates.kt), left = Math.round((parseIso(exp) - parseIso(ref)) / 864e5);
      const smp = S.ktSample ? " Sample date; change it on the readiness checklist." : "";
      if (exp < ref) { sigs.push("bad"); why.push(`Knowledge test result expired ${fmtDate(exp)} (draft rule).${smp}`); }
      else if (left <= 90) { sigs.push("warn"); why.push(`Knowledge test result valid through ${fmtDateY(exp)}, ${plural(left, "day")} after ${sl ? "your checkride date" : "today"} (draft rule).${smp}`); }
      else if (!sl && exp < goal) { sigs.push("warn"); why.push(`Knowledge test result valid through ${fmtDateY(exp)}, before the end of your target month (draft rule).${smp}`); }
      else { sigs.push("good"); why.push(`Knowledge test result valid through ${fmtDateY(exp)} (draft rule).${smp}`); }
    }
    const any = dates.kt || Object.values(r9).some(Boolean);
    const k = sigs.includes("bad") ? "bad" : sigs.includes("warn") ? "warn" : any ? "good" : "none";
    return { k, cls: ROLL[k][0], label: ROLL[k][1], why: why.join(" ") };
  };
  const rollChip = (r) => `<span class="pill ${r.cls}" data-rollup="${r.k}">${r.label}</span>`;
  const ready9Count = () => { const r = S.ready9 || {}; return ["kt", "exp", "end", "med", "iacra", "docs", "id", "terms", "prep"].filter((k) => r[k]).length; };

  function viewJourney() {
    const reqs = myReqs(), cur = activeReq();
    const s = cur && slotOf(cur), dp = cur && dpeById(cur.dpeId);
    const cert = cur ? cur.cert : "ppl";
    const n = ready9Count();
    const items = READY9(cert, dp), r9 = S.ready9 || {};
    const nextItem = items.find((it) => !r9[it.id]);
    const roll = eligRollup();
    let state;
    if (cur && cur.status === "confirmed") state = `<p data-journey-state="confirmed">Confirmed: ${slotAt(s)} with ${esc(first(dp.name))}. Next: your readiness checklist. \u00b7 <a href="#/readiness">Open</a></p><p class="small muted">Checkride in ${plural(Math.max(daysUntil(s.date, slotTz(s)), 0), "day")} \u00b7 ${fmtDate(s.date)} with ${esc(first(dp.name))}</p>`;
    else if (cur) state = `<p data-journey-state="requested">Request sent to ${esc(first(dp.name))} for ${slotAt(s)}. It\u2019s confirmed once ${esc(first(dp.name))} accepts. \u00b7 <a href="#/request/${cur.id}">View request</a></p>${(() => { const he = holdEnd(cur, s); return he && he > Date.now() ? `<p class="small muted" data-hold-end>Held for you until ${tsWhen(he, slotTz(s))} \u00b7 Not confirmed yet</p>` : holdEnded(cur, s) ? holdEndedLine(cur) : ""; })()}`;
    else state = `<p data-journey-state="ready">${n === 9 ? "All set. " : ""}Time to request your examiner. \u00b7 <a href="#/search">Find an examiner</a></p>`;
    const cs = cur && cur.status === "confirmed" ? S.curated[cur.id] : null;
    const exam = cs && cs.sent ? (() => { const t = S.ticks[cur.id] || {}, it = cs.sent.items; return `<p>From your examiner \u00b7 ${esc(dp.name)} \u00b7 ${it.filter((i) => t[i.id]).length} of ${it.length} ready \u00b7 <a href="#/my-checklists">Open</a></p>`; })()
      : `<p class="muted">Once an examiner accepts your request, their checklist shows up here. Until then, here\u2019s a general draft to look over. \u00b7 <a href="#/readiness">See the draft</a></p>`;
    return `<div class="page">
      ${head("YOUR NEXT MILESTONE", "Know where you stand.", "Know what\u2019s next.")}
      <div class="ws-grid">
        <div class="stack">
          <section class="card" id="journey-ready">
            <div class="row spread"><h2 class="h3" style="margin:0">${esc(certLong(cert))}</h2><a class="small" href="#/readiness">Open</a></div>
            <div class="row" style="margin-top:.5rem"><b class="big-num">${n} of 9 ready</b> ${rollChip(roll)}</div>
            <div class="row" style="margin-top:.4rem">${targetChip()}</div>
            ${seg9(n)}
            ${roll.why ? `<p class="small" style="margin:0 0 .25rem">${esc(roll.why)}</p>` : roll.k === "none" ? `<p class="small muted" style="margin:0 0 .25rem">Nothing entered yet. Tick items on your <a href="#/readiness">readiness checklist</a>.</p>` : ""}
            <p class="small muted" style="margin:0">Draft: verify with your CFI. Not legal or FAA advice.</p>
          </section>
          ${nextItem ? `<section class="card next-step"><p class="eyebrow">YOUR NEXT STEP</p><h3>${esc(nextItem.t)}</h3><a class="btn secondary sm" href="#/readiness">Open the checklist</a></section>` : ""}
          <section class="card">${state}</section>
          <section class="card" id="from-examiner"><h2>From your examiner</h2>${exam}</section>
        </div>
        <aside class="stack">
          <section class="card" id="journey-requests"><h2>Your checkride requests</h2>
            ${reqs.length ? reqs.slice(0, 5).map((b) => { const sl = slotOf(b), d = dpeById(b.dpeId); return `<a class="req-row" href="#/request/${b.id}">${dateTile(sl.date)}<span><b>${esc(d.name)}</b><span class="small muted"> \u00b7 ${esc(certById(b.cert).short)}</span><br>${reqPill(b)}</span></a>`; }).join("")
              : `<p class="muted small">No requests yet. <a href="#/search">Find an examiner</a></p>`}
            <a class="small" href="#/bookings">My checkrides</a>
          </section>
        </aside>
      </div>
    </div>`;
  }

  function viewReadiness() {
    const cur = activeReq(), dp = cur && dpeById(cur.dpeId), s = cur && slotOf(cur);
    const cert = cur ? cur.cert : "ppl";
    const items = READY9(cert, dp), r9 = S.ready9 || {}, n = ready9Count();
    const cs = cur && cur.status === "confirmed" ? S.curated[cur.id] : null;
    return `<div class="page">
      ${head("YOUR READINESS CHECKLIST", "Ready on paper.", "Ready on the ramp.")}
      <section class="card">
        <div class="row spread"><h2 style="margin:0">Readiness checklist <span class="pill warn" style="vertical-align:middle">Unverified draft</span></h2><span class="row" style="gap:.5rem"><b class="mono">${n} of 9 ready</b>${countPill(n).replace(/>[^<]*</, ">" + readyLabel(n, 9) + "<")}</span></div>
        <p class="muted small">${cur ? `For your ${esc(certById(cert).name)} checkride with ${esc(dp.name)} \u00b7 ${slotAt(s)}` : `For your ${esc(certById(cert).name)} checkride`}</p>
        ${cs && cs.sent ? `<p class="small">${esc(dp.name)} confirmed this list on ${fmtDate(iso(new Date(cs.sent.sentAt)), { month: "short", day: "numeric" })}.</p>` : ""}
        <div class="row" style="margin:.25rem 0 .5rem;gap:.75rem;align-items:end"><label class="field" style="max-width:240px"><span>Knowledge test date (optional)</span><input type="date" id="kt-date-r9" data-r9date="kt" value="${esc((S.ready9Dates || {}).kt || "")}" /></label>${rollChip(eligRollup())}</div>
        <ol class="ready9">${items.map((it, i) => { const d = !!r9[it.id]; return `<li><label class="check-item ${d ? "done" : ""}"><input type="checkbox" data-r9="${it.id}" ${d ? "checked" : ""} /><div><div class="t"><span class="mono muted">${i + 1}</span> ${esc(it.t)}</div><div class="muted small">${it.h}</div>${it.lbl ? `<div class="small"><b>${it.lbl}</b></div>` : ""}${it.id === "prep" && cs && cs.sent ? `<a class="small" href="#/my-checklists">Open prep list</a>` : ""}</div></label>${it.id === "med" ? medicalBlock() : it.id === "prep" ? prepStudent(cur && cur.status === "confirmed" ? cur : null, dp) : ""}</li>`; }).join("")}</ol>
        <p class="small muted" style="margin:.75rem 0 0">A checklist to help you prepare, not an FAA requirement list. Your CFI and examiner have the final word.</p>
        <p class="small muted" style="margin:.25rem 0 0">Draft: verify with your CFI. Not legal or FAA advice. Ticks are saved in this browser only.</p>
      </section>
      <p class="small"><a href="#/checklists/${cert}">Detailed starter lists by certificate (unverified draft)</a></p>
    </div>`;
  }

  // ---- FAQ (D38 #10/#11, ux-copy-v3 §7.5, design-spec-v3 §3.1). q1–q9 verbatim; faq.q10 is [DECIDE] and is not rendered. ----
  const FAQ = [
    ["Is Checkride Connect free?", "Yes, free during the prototype. There are no fees from us for students, examiners or flight schools. You pay your examiner directly for the checkride, under the examiner\u2019s own terms."],
    ["Is this real? Is it connected to the FAA?", "It\u2019s an early prototype. The examiners, schools and openings are fictional, and no real requests are sent. Checkride Connect isn\u2019t affiliated with or endorsed by the FAA."],
    ["How do deposits work?", "No deposit is taken before your examiner accepts your request. After that, the examiner\u2019s own terms apply. Deposits are paid directly to your examiner, not through us, so we never hold deposit money. <em class=\"faq-tag\">(Proposed, pending legal review)</em> " + PM_TAG],
    ["What happens after I send a request?", "We hold the slot while the examiner reviews it, for up to 48 hours or until 12 hours before it starts, whichever comes first. If it starts in less than 12 hours, there\u2019s no hold: first to be accepted gets it. It\u2019s a confirmed checkride only once the examiner accepts. If there\u2019s no answer in time, the slot is released, it doesn\u2019t count as a pass, and you keep your waitlist place."],
    ["Can I withdraw or cancel?", "You can withdraw a pending request in one step, and you keep your waitlist place. Once a checkride is confirmed, the examiner\u2019s cancellation and deposit terms apply. If your examiner cancels, or weather or maintenance does, you go to the front of that examiner\u2019s waitlist."],
    ["What if I\u2019m marked as a no-show?", "Only your examiner can mark a no-show, and you can dispute it within 7 days. A dispute only affects your checkride record. Examiners see just a count of no-shows from the last 12 months, and a disputed one isn\u2019t counted until it\u2019s resolved."],
    ["What do the eligibility checks mean?", "They\u2019re informational only, not an FAA determination. Using the dates you enter, the clock tracks your knowledge test, your CFI\u2019s sign-off, your medical and any unfinished checkride. " + VERIFY + " It warns and never blocks a request. Your CFI and your examiner confirm eligibility. If a window has closed or a check fails, you\u2019ll tick \u201cMy CFI has reviewed this\u201d before sending, and your examiner sees that you did. A heads-up never needs the tick."],
    ["I\u2019m an examiner. What do I control, and what do I see?", "You set your availability and your own fee, deposit and cancellation terms. You accept or decline each request, and you can edit the checkride-day prep list. You can send one template reminder per missing checklist item, at most once every 3 days. You see each applicant\u2019s readiness, any clock flag, and a count of no-shows from the last 12 months. It\u2019s free for examiners during the prototype."],
    ["I run a flight school. What does it do for us?", "You get one roster with each student\u2019s readiness, eligibility clock and checkride requests. It\u2019s free for flight schools during the prototype, with no plans or tiers."],
  ];
  const CHEV = `<svg class="faq-chev" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const faqAccordion = (px, hl = "h3") => `<div class="faq-acc">${FAQ.map(([q, a], i) => { const n = i + 1, open = n === 1;
    return `<div class="faq-item"><${hl} class="faq-q"><button type="button" class="faq-btn" id="${px}-q${n}" data-action="faq-toggle" aria-expanded="${open}" aria-controls="${px}-a${n}"><span>${q}</span>${CHEV}</button></${hl}><div class="faq-a" id="${px}-a${n}" role="region" aria-labelledby="${px}-q${n}"${open ? "" : " hidden"}><p>${a}</p></div></div>`; }).join("")}</div>`;
  const FAQ_H = (id) => `<p class="eyebrow">GOOD QUESTIONS</p><h2 class="paired" id="${id}">Plain answers. <span class="b">No fine print.</span></h2>`;
  function viewFaq() {
    return `<div class="page narrow faq-page">
      <div class="page-head v3-head"><p class="eyebrow">GOOD QUESTIONS</p><h1 class="paired" id="faq-page-h" tabindex="-1">Plain answers. <span class="b">No fine print.</span></h1></div>
      <section class="card faq-card" aria-labelledby="faq-page-h">${faqAccordion("faqm", "h2")}</section>
    </div>`;
  }

  function viewMore() {
    const theme = (() => { try { return localStorage.getItem("cc-theme") || "system"; } catch (e) { return "system"; } })();
    const L = (h, t) => `<a class="more-row" href="${h}">${t}<span aria-hidden="true">\u203a</span></a>`;
    const groups = {
      pilot: [["Your checkride", [["#/journey", "Journey"], ["#/readiness", "Readiness checklist"], ["#/checklists", "Checklists by certificate"]]],
        ["Checkrides and costs", [["#/bookings", "My checkrides"], ["#/my-checklists", "From your examiner"], ["#/compare", "Compare fees"], ["#/pricing", "Pricing"], ["#/pricing#deposit-policy", "How cancellations work"]]]],
      dpe: [["Your desk", [["#/dpe-fees", "Your terms (fee, deposit and cancellation)"], ["#/dpe/" + S.actingDpe, "My public profile"], ["#/pricing", "Pricing"]]]],
      school: [["Your school", [["#/school/cohort", "Cohort scheduling"], ["#/search", "Search examiners"], ["#/compare", "Compare fees"], ["#/checklists", "Checklists"], ["#/pricing", "Pricing"]]]],
      admin: [["Admin", [["#/admin", "Applications & metrics"], ["#/search", "Browse listings"], ["#/pricing", "Pricing"]]]],
    }[S.role];
    return `<div class="page narrow">
      ${head("SETTINGS", "Your app.", "Your way.")}
      <section class="card stack">
        <label class="field"><span>Theme</span><select id="more-theme" data-theme-select data-action-change="theme">${[["light", "Light"], ["dark", "Dark"], ["system", "System"]].map(([v, l]) => `<option value="${v}" ${v === theme ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <p class="small muted" style="margin:-.5rem 0 0">System follows your device\u2019s light or dark setting.</p>
        <label class="field"><span>View as</span><select id="more-role" data-action-change="role">${ROLE_OPTS.map(([v, l]) => `<option value="${v}" ${v === S.role ? "selected" : ""}${v === "admin" ? " hidden disabled" : ""}>${l}</option>`).join("")}</select></label>
        <p class="small muted" style="margin:-.5rem 0 0">Prototype only: see the app as each role.</p>
      </section>
      ${groups.map(([g, rows]) => `<section class="card more-group"><h2 class="h3">${g}</h2>${rows.map(([h, t]) => L(h, t)).join("")}</section>`).join("")}
      <section class="card more-group"><h2 class="h3">Help</h2>${L("#/faq", "FAQs")}</section>
      <section class="card stack" id="reset-demo-data">
        <h2 class="h3">Demo data</h2>
        <p class="small muted" style="margin:0">Everything you do here is saved only in this browser on this device. Nothing is sent to a server. Resetting clears your requests, alerts, ticks and edits and brings back the sample data. Your theme stays as it is.</p>
        <div><button class="btn secondary" data-action="reset-data-ask" id="more-reset-data">Reset demo data</button></div>
      </section>
    </div>`;
  }

  function viewRequest(q, id) {
    const b = S.bookings.find((x) => x.id === id);
    if (!b) return `<div class="page">${emptyState({ id: "req-not-found", ic: "search", h: "h1", title: "Request not found", body: "This sample request isn\u2019t in this browser (links can go stale after a reset).", actions: `<a class="btn" href="#/journey">Go to Journey</a>` })}</div>`;
    const s = slotOf(b), dp = dpeById(b.dpeId), f = esc(first(dp.name));
    const near = nearFor(b.near, dp);
    const travel = allIn(dp, b.cert, near, s.airport).travel;
    const fee = b.feeUsd ?? dp.fees[b.cert], dep = b.depositUsd ?? depositFor(dp, b.cert);
    const isDpe = S.role === "dpe";
    const cs = S.curated[b.id];
    const step3 = b.status === "confirmed"
      ? (isDpe ? `<a class="btn secondary sm" href="#/dpe-checklist/${b.id}">${cs ? "Edit checklist" : "Build checklist"}</a>`
        : cs && cs.sent ? `<p class="small" style="margin:0">${esc(dp.name)} confirmed this list on ${fmtDate(iso(new Date(cs.sent.sentAt)), { month: "short", day: "numeric" })}. <a href="#/my-checklists">Open</a></p>`
        : `<p class="small muted" style="margin:0">Confirmed. ${f}\u2019s checklist shows up here once it\u2019s sent. Meanwhile: <a href="#/readiness">your readiness checklist</a>.</p>`)
      : `<p class="small muted" style="margin:0">Once an examiner accepts your request, their checklist shows up here. Until then, here\u2019s a general draft to look over. <a href="#/readiness">See the draft</a></p>`;
    const step2 = b.status === "requested" ? reqPill(b) : b.status === "confirmed" ? chip("good", "Accepted") : b.status === "declined" ? chip("bad", "Declined") : isWithdrawn(b) ? chip("", "Withdrawn") : chip("", "Cancelled");
    return `<div class="page">
      ${head(isDpe ? "CHECKRIDE REQUEST" : "YOUR CHECKRIDE REQUEST", `${esc(isDpe ? b.applicant : dp.name)} \u00b7 ${esc(certById(b.cert).name)}`, "", "", "h1")}
      <div class="ws-grid">
        <div class="stack">
          <section class="card ws-when">
            <div class="row" style="gap:1rem;flex-wrap:nowrap">${dateTile(s.date)}<div><b>${slotWhenLong(s)}</b><div class="small muted">${s.airport}${s.airport !== dp.home ? ` \u00b7 examiner travels from ${dp.home}` : ""}${isDpe ? ` \u00b7 ${esc(b.aircraft)} \u00b7 CFI: ${esc(b.cfi)}` : ""}</div></div></div>
            <div style="margin-top:.75rem" id="req-status">${reqPill(b)}${holdEnded(b, slotOf(b)) ? holdEndedLine(b) : ""}${!isDpe && b.mine && b.status === "requested" ? `<p class="small muted" data-nodeposit style="margin:.4rem 0 0">No deposit until ${f} accepts</p>` : ""}${isDpe ? dpeHoldLine(b, s) + (b.status === "requested" ? dpeNoShowLine(b) : "") : ""}</div>
            ${!isDpe ? noShowCard(b, s, dp) : b.noShow ? `<p class="small" data-ns-marked="${b.id}"><span class="pill bad">No-show</span></p>` : ""}
            ${b.status === "declined" && !isDpe ? `<p class="small" style="margin:.5rem 0 0">${f} couldn\u2019t take this request. Nothing was confirmed, so nothing changes on your side. <a href="#/search?cert=${b.cert}">See other openings</a></p>` : ""}
            ${b.status === "cancelled" ? `<div class="small cancel-outcome"><b>${cancelLine(b, s)}</b></div>` : ""}
          </section>
          <ol class="ws-steps">
            <li class="card"><span class="step-n mono">01</span><div><h2 class="h3">Request sent</h2><p class="small muted mono" style="margin:0" data-sent-at>${tsReader(b.createdAt)}</p></div></li>
            <li class="card"><span class="step-n mono">02</span><div><h2 class="h3">${isDpe ? "You review this request" : `${f} reviews your request`}</h2>${step2}
              ${isDpe ? `<div class="row small" style="margin-top:.6rem;gap:.5rem" data-dpe-ready><span class="muted">Applicant checklist</span> ${countPill(b.mine ? ready9Count() : of9(b.readiness || 0))}${b.selfCheck ? ` <span class="muted">\u00b7 self-attested readiness</span>` : ""}</div>` : ""}${isDpe && b.status === "requested" ? `<div class="row" style="margin-top:.6rem"><button class="btn good" data-action="accept" data-id="${b.id}">Accept request</button><button class="btn bad" data-action="decline" data-id="${b.id}">Decline</button></div>` : ""}</div></li>
            <li class="card"><span class="step-n mono">03</span><div><h2 class="h3">From your examiner</h2>${step3}</div></li>
          </ol>
        </div>
        <aside class="card fee-card sticky" aria-labelledby="fee-h">
          <h2 id="fee-h" class="h3">Fee breakdown</h2>
          <div class="summary small">
            <div class="line"><span>Examiner fee</span><b class="mono">${money(fee)}</b></div>
            <div class="line"><span>Travel (estimate)</span><b class="mono">${money(travel)}</b></div>
            ${FEES ? `<div class="line"><span>Student booking fee</span><b class="mono">${money(BOOKING_FEE)}</b></div>` : ""}
            <div class="line total"><span><b>Total (est.)</b></span><b class="mono">${money(fee + travel + BOOKING_FEE)}</b></div>
          </div>
          <div class="inset small">
            <div class="line"><span>Deposit paid to your examiner</span><b class="mono">${money(dep)}</b></div>
            <p style="margin:.35rem 0 0">Paid directly to ${f}, not through Checkride Connect. Nothing is taken until ${f} accepts your request. After that, ${f}\u2019s terms say when it\u2019s due. <i>(Proposed, pending legal review)</i></p>
            <p style="margin:.25rem 0 0">${PM_TAG}</p>
          </div>
          ${isDpe ? "" : estimateMini(dp, b.cert, travel, fee)}
          ${examinerTerms(dp)}
          <div class="stack" style="margin-top:.75rem">
            ${b.note ? `<button class="btn secondary" data-action="view-note" data-id="${b.id}">${isDpe ? `See ${esc(first(b.applicant))}\u2019s note` : `See your note to ${f}`}</button>` : ""}
            ${!isDpe && b.mine && b.status === "requested" ? `<button class="btn bad" data-action="pilot-cancel" data-id="${b.id}">Withdraw request</button>` : ""}
            ${!isDpe && b.mine && b.status === "confirmed" && !b.noShow ? `<button class="btn bad" data-action="pilot-cancel" data-id="${b.id}">Cancel checkride</button>` : ""}
            ${isDpe && b.status === "confirmed" && !b.noShow && slotStart(s) <= Date.now() ? `<button class="btn ghost" data-action="ns-mark" data-id="${b.id}">Mark no-show</button>` : ""}
            ${!isDpe && b.mine && b.status === "requested" ? `<button class="btn ghost sm" data-action="as-dpe" data-dpe="${dp.id}" data-to="#/request/${b.id}">Respond as ${f} (demo)</button>` : ""}
          </div>
          <p class="small muted" style="margin:.75rem 0 0">Prototype: nothing is charged. <a href="#/pricing#deposit-policy">How cancellations work</a></p>
        </aside>
      </div>
    </div>`;
  }

  // DPE desk tiles (dpe.requests tiles, reused on Today).
  const dpeTiles = (mine) => `<section class="grid g3 tiles" style="margin-bottom:1rem">
    ${statCard(mine.filter((b) => b.status === "requested").length, "Awaiting your review \u00b7 Requests, not bookings")}
    ${statCard(mine.filter((b) => b.status === "confirmed").length, "Confirmed \u00b7 Accepted by you")}
    ${statCard(mine.length, "Total requests \u00b7 Including history")}
  </section>`;
  const actingSelect = (dp) => `<label class="field acting"><span>Signed in as (demo)</span><select data-action-change="acting-dpe">${allDpes().map((d) => `<option value="${d.id}" ${d.id === dp.id ? "selected" : ""}>${esc(d.name)} \u00b7 ${d.home}</option>`).join("")}</select></label>`;
  function viewDpeToday() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const mine = S.bookings.filter((b) => b.dpeId === dp.id);
    const t = todayIn(aptTz(dp.home)); // D39: the examiner's airport zone (KECP = America/Chicago), not the browser's
    const todays = mine.filter((b) => b.status === "confirmed" && slotOf(b).date === slotToday(slotOf(b)));
    const upcoming = mine.filter((b) => b.status === "confirmed" && slotOf(b).date > slotToday(slotOf(b))).sort((a, b) => slotStart(slotOf(a)) - slotStart(slotOf(b))).slice(0, 4);
    const row = (b) => { const s = slotOf(b); return `<a class="req-row" href="#/request/${b.id}">${dateTile(s.date)}<span><b>${esc(b.applicant)}</b> <span class="small muted">\u00b7 ${esc(certById(b.cert).short)}</span><br><span class="small mono">${slotTime(s)} \u00b7 ${s.airport}</span></span></a>`; };
    return `<div class="page">
      <div class="row spread">${head("YOUR EXAMINER DESK", `Today \u00b7 ${fmtDate(t, { weekday: "short", month: "short", day: "numeric" })}`, "")}${actingSelect(dp)}</div>
      ${dpeTiles(mine)}
      <section class="card"><h2>On the schedule</h2>
        ${todays.length ? todays.map(row).join("") : `<p class="muted" id="today-empty">Nothing on the schedule today.</p>`}
      </section>
      ${upcoming.length ? `<section class="card" style="margin-top:1rem"><h2 class="h3">Coming up</h2>${upcoming.map(row).join("")}</section>` : ""}
    </div>`;
  }
  function viewDpeApplicants() {
    const dp = dpeById(S.actingDpe) || D.dpes[0];
    const conf = S.bookings.filter((b) => b.dpeId === dp.id && b.status === "confirmed");
    return `<div class="page">
      ${head("YOUR EXAMINER DESK", "Applicant pre-check", "")}
      ${conf.length ? `<div class="stack">${conf.map((b) => { const s = slotOf(b), c = S.curated[b.id]; return `<section class="card"><div class="row spread"><div class="row" style="gap:.75rem;flex-wrap:nowrap">${dateTile(s.date)}<div><b>${esc(b.applicant)}</b> \u00b7 ${esc(certById(b.cert).name)}<div class="small muted">${slotWhenLong(s)} \u00b7 ${s.airport}</div><div class="small row" style="gap:.5rem">${countPill(of9(b.readiness))}${b.selfCheck ? " \u00b7 self-attested readiness (unverified)" : ""}</div></div></div>
          <div class="row">${c?.sent ? chip("good", "Checklist sent") : c ? chip("warn", "Draft") : chip("", "No checklist yet")}<a class="btn secondary sm" href="#/dpe-checklist/${b.id}">${c ? "Edit checklist" : "Build checklist"}</a><a class="btn ghost sm" href="#/request/${b.id}">Open</a></div></div>${selfCheckDetails(b)}</section>`; }).join("")}</div>`
        : emptyState({ id: "applicants-empty", ic: "list", title: "No confirmed checkrides yet.", body: "When you accept a request, that applicant\u2019s checklist shows up here." })}
    </div>`;
  }

  const SCHOOL_TABS = (cur) => `<nav class="tabs" aria-label="School">${[["#/school", "Roster"], ["#/school/requests", "Checkride requests"], ["#/school/readiness", "Readiness"]].map(([h, l]) => `<a href="${h}" class="${h === cur ? "active" : ""}"${h === cur ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>`;
  const schoolHead = () => head("YOUR SCHOOL DESK", "Every student.", "One clear view.", "See each student\u2019s readiness, eligibility clock and checkride requests in one place.");
  function viewSchoolRequests() {
    const st = D.school.students;
    const rows = st.map((s) => {
      const sb = studentBooking(s);
      if (sb) { const sl = slotOf(sb); return [s, sb.status === "requested" ? chip("warn", `Awaiting ${esc(first(dpeById(sb.dpeId).name))}`) : chip("good", "Confirmed"), `${fmtDate(sl.date)} \u00b7 ${esc(dpeById(sb.dpeId).name)}`, `<a class="btn ghost sm" href="#/request/${sb.id}">Open</a>`]; }
      if (s.status === "confirmed") return [s, chip("good", "Confirmed"), `${fmtDate(addDays(s.daysOut))} \u00b7 ${esc(dpeById(s.dpe).name)}`, ""];
      if (s.status === "requested") return [s, chip("warn", `Awaiting ${esc(first(dpeById(s.dpe).name))}`), `${fmtDate(addDays(s.daysOut))} \u00b7 ${esc(dpeById(s.dpe).name)}`, ""];
      return [s, `<span class="muted small">No request yet</span>`, "", `<a class="btn sm" href="#/search?cert=${s.cert}&near=${D.school.airport}" data-action="school-find" data-student="${esc(s.name)}">Find slot</a>`];
    });
    return `<div class="page">${schoolHead()}${SCHOOL_TABS("#/school/requests")}
      <section class="card"><div class="table-wrap"><table><thead><tr><th>Student</th><th>Checkride</th><th>Request</th><th>When</th><th><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${rows.map(([s, p, w, a]) => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(certById(s.cert).short)}</td><td>${p}</td><td class="small">${w}</td><td class="num">${a}</td></tr>`).join("")}</tbody></table></div></section>
      <p class="small muted">Requests, not bookings: a request is confirmed only once the examiner accepts. <a href="#/school/cohort">Schedule a cohort</a></p>
    </div>`;
  }
  function viewSchoolReadiness() {
    const st = D.school.students;
    return `<div class="page">${schoolHead()}${SCHOOL_TABS("#/school/readiness")}
      <section class="card"><div class="table-wrap"><table class="ready-table"><thead><tr><th>Student</th><th>Checkride</th><th>Readiness</th><th>Endorsements</th></tr></thead>
      <tbody>${st.map((s) => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(certById(s.cert).short)}</td><td><div class="row" style="gap:.5rem;flex-wrap:nowrap"><div style="width:90px">${seg9(of9(s.readiness))}</div>${countPill(of9(s.readiness))}</div></td><td>${s.endorsed ? chip("good", "Signed") : chip("warn", "Pending")}</td></tr>`).join("")}</tbody></table></div></section>
      <p class="small muted">Sample readiness, self-reported. Draft: verify with your CFI. Not legal or FAA advice. Check readiness item by item in <a href="#/school/cohort">Cohort scheduling</a>.</p>
    </div>`;
  }

  // ===================== v4: Vercel look (checkride-connect.vercel.app reference) =====================
  // Layout, sections and flows follow the reference site; product rules (example data, no %, zone labels,
  // fees off, warn-never-block, D-decisions, ux-copy-v3 keys) win where they conflict (vercel-ref/conflicts.md).
  const V4_RADII = [25, 50, 100];
  const V4_PLANE = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
  const V4_CHECK = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
  const v4Sample = () => `<span class="pill v4-ex">Example examiner</span>`;
  const v4DateCap = (d) => fmtDate(d, { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const v4Short = (d) => fmtDate(d, { month: "short", day: "numeric" });
  // Airports with at least one sample examiner based there, grouped by state (the "Near" picker on #/find).
  const v4NearOpts = (cur) => COVERED_STATES.map(([c, n]) => {
    const ids = [...new Set(allDpes().filter((dp) => dpeState(dp) === c).map((dp) => dp.home))].filter((id) => apt(id)).sort();
    if (cur && aptState(cur) === c && !ids.includes(cur)) ids.unshift(cur);
    return `<optgroup label="${n}">${ids.map((id) => `<option value="${id}" ${id === cur ? "selected" : ""}>${id} \u00b7 ${esc(apt(id).city)}</option>`).join("")}</optgroup>`;
  }).join("");
  function v4FindFilters(q) {
    const cert = certById(q.cert) && q.cert !== "sport" ? q.cert : "ppl";
    const near = apt(q.near) ? q.near : "KORL";
    const radius = V4_RADII.includes(+q.radius) ? +q.radius : 50;
    // QA-069: a link with a value we can't use says what it fell back to instead of switching silently.
    const fixed = [];
    if (q.cert && cert !== q.cert) fixed.push(`checkride “${q.cert}” isn’t in the sample data, showing ${certById(cert).name}`);
    if (q.near && near !== q.near) fixed.push(`airport “${q.near}” has no sample examiners, showing ${near}`);
    if (q.radius != null && q.radius !== "" && radius !== +q.radius) fixed.push(`distance “${q.radius}” isn’t one of 25, 50 or 100 nm, showing ${radius} nm`);
    return { cert, near, state: aptState(near), outside: "", radius, before: "", maxFee: 0, sort: "soonest", fixed };
  }
  const FIND_PAGE = 20; // QA-066 (PM-approved): #/find shows 20 cards at a time with "Show more".
  const v4FindHref = (f, o = {}) => { const g = { ...f, ...o }; return `#/find?cert=${g.cert}&near=${g.near}&radius=${g.radius}`; };

  function v4FindCard(r, f, open) {
    const { dp } = r, stale = isStale(dp.id), home = apt(dp.home);
    const travels = r.dist > f.radius; // QA-058: in the list only because they travel to the pilot
    const apts = [...new Set([dp.home, ...r.slots.map((s) => s.airport)])].slice(0, 3);
    const nextDay = r.soonest && !stale ? r.soonest.date : null;
    const prof = `#/dpe/${dp.id}?cert=${f.cert}&near=${f.near}`;
    const daySlots = open && nextDay ? r.slots.filter((s) => s.date === nextDay).slice(0, 4) : [];
    return `<article class="v4-card v4-find-card" data-dpe="${dp.id}">
      <div class="v4-card-top">
        <div class="avatar">${initials(dp.name)}</div>
        <div class="v4-who"><h2 class="h3"><a href="${prof}">${esc(dp.name)}</a></h2><div class="muted small">${esc(home.city)} \u00b7 ${r.dist} nm</div></div>
        <div class="v4-fee"><b class="mono">${money(r.fee)}</b><span class="muted small">${esc(certById(f.cert).short)}</span></div>
      </div>
      <div class="v4-chips">${v4Sample()}${travels ? `<span class="pill v4-travel">Travels to you</span>` : ""}${apts.map((id) => `<span class="v4-apt"><span class="mono">${id}</span> ${esc(apt(id).city)}</span>`).join("")}</div>
      ${travels ? `<p class="small muted v4-travel-why">Based ${r.dist} nm from ${f.near}, outside your ${f.radius} nm. Listed because this examiner travels up to ${dp.travelNm} nm to meet you (sample).</p>` : ""}
      ${daySlots.length ? `<div class="v4-next">
        <p class="v4-lbl">${v4DateCap(nextDay)} \u00b7 ${daySlots[0].airport}</p>
        <div class="v4-times">${daySlots.map((s) => `<a class="v4-time" href="${prof}&date=${s.date}&pick=${s.id}"><span class="mono">${slotTime(s)}</span><span class="small muted">${s.airport}</span></a>`).join("")}</div>
        <a class="btn secondary v4-wide" href="${prof}&date=${nextDay}">See all openings</a>
      </div>` : `<div class="v4-card-foot">${nextDay ? `<span class="pill v4-next-pill">Next open ${v4Short(nextDay)}</span>` : `<span class="pill">${stale ? "Availability not confirmed" : "No openings posted"}</span>`}<a href="${prof}">View profile \u2192</a></div>`}
    </article>`;
  }

  function viewFind(q) {
    const f = v4FindFilters(q);
    const res = searchDpes(f);
    const c = certById(f.cert);
    const firstOpen = res.findIndex((r) => r.soonest && !isStale(r.dp.id));
    const key = v4FindHref(f);
    if (ui.findKey !== key) { ui.findKey = key; ui.findShown = FIND_PAGE; }
    const shown = Math.min(res.length, ui.findShown || FIND_PAGE);
    const nTravel = res.filter((r) => r.dist > f.radius).length;
    return `<div class="page v4-find">
      <div class="v4-col">
        <div class="v4-find-head"><span class="v4-ic" aria-hidden="true">${V4_PLANE}</span><div><p class="eyebrow">FIND A DPE</p><h1>Find a DPE</h1></div></div>
        <p class="muted small" style="margin:.25rem 0 1rem">Fictional sample examiners in ${coveredList()}. Fees are each examiner\u2019s own; you pay them directly.</p>
        ${f.fixed.length ? `<p class="v4-note" id="find-param-note" role="status">Some link settings couldn\u2019t be used: ${esc(f.fixed.join("; "))}.</p>` : ""}
        <form class="v4-filters" data-form="find" data-auto aria-label="Find a DPE filters">
          <label class="field v4-f-cert"><span class="v4-lbl">Checkride</span><select name="cert" id="find-cert">${D.certs.filter((x) => x.id !== "sport").map((x) => `<option value="${x.id}" ${x.id === f.cert ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>
          <label class="field v4-f-near"><span class="v4-lbl">Near</span><select name="near" id="find-near">${v4NearOpts(f.near)}</select></label>
          <input type="hidden" name="radius" value="${f.radius}">
          <div class="field v4-f-radius"><span class="v4-lbl" id="find-r-l">Within</span><div class="v4-seg" role="group" aria-labelledby="find-r-l">${V4_RADII.map((r) => `<a class="v4-seg-b" href="${v4FindHref(f, { radius: r })}" ${r === f.radius ? 'aria-current="true" ' : ""}data-radius="${r}">${r} nm</a>`).join("")}</div></div>
        </form>
        <p id="find-count" class="v4-count" aria-live="polite"><b>${plural(res.length, "examiner")}</b> for ${esc(c.name)} within ${f.radius} nm of <span class="mono">${f.near}</span> \u00b7 ${esc(apt(f.near).city)}${nTravel ? ` <span class="small">(${nTravel} based farther out travel to you)</span>` : ""}${res.length > FIND_PAGE ? ` \u00b7 <span id="find-shown">showing ${shown}</span>` : ""}</p>
        <div class="stack" id="find-results">${res.length ? res.slice(0, shown).map((r, i) => v4FindCard(r, f, i === firstOpen)).join("")
          : emptyState({ id: "find-empty", ic: "search", title: "No sample examiners in range", body: `Nobody in the sample data gives the ${esc(c.short)} checkride within ${f.radius} nm of ${f.near}. Try a wider distance or another airport.`, actions: f.radius < 100 ? `<a class="btn secondary sm" href="${v4FindHref(f, { radius: 100 })}">Search 100 nm</a>` : "" })}</div>
        ${shown < res.length ? `<div class="v4-more-row"><button type="button" class="btn secondary v4-wide" id="find-more" data-action="find-more">Show more (${Math.min(FIND_PAGE, res.length - shown)} of ${res.length - shown} left)</button></div>` : ""}
        <section class="card v4-more" style="margin-top:1rem"><div class="row spread"><div><b>Need a date window, a fee cap or a map?</b><div class="muted small">The full search has more filters, compare and alerts.</div></div><a class="btn secondary sm" href="#/search?cert=${f.cert}&near=${f.near}&radius=${f.radius}">More filters</a></div></section>
      </div>
    </div>`;
  }

  // Profile: Vercel-style openings picker (day tabs, time grid, sticky "Request slot" bar). Shares ui.sel with the calendar.
  function v4Openings(dp, cert, slots, own, q, alertPick) {
    q = q || {};
    const stale = isStale(dp.id);
    const certSlots = slots.filter((s) => s.certs.includes(cert));
    const days = [...new Set(certSlots.map((s) => s.date))].sort().slice(0, 7);
    const lost = ui.v4lost && ui.v4lost.date ? ui.v4lost : null;
    // QA-070: the slot.started message (role=status, focusable) when the picked opening started or went away.
    const lostMsg = lost ? `<p class="v4-note crit" id="slot-started" role="status" tabindex="-1"><b>${lost.started ? COPY["slot.started"] : "That opening is no longer available."}</b> <span>${esc(fmtDate(lost.date, { weekday: "short", month: "short", day: "numeric" }))} \u00b7 <span class="mono">${esc(lost.time)}</span>. Pick another time.</span></p>` : "";
    const alertMsg = alertPick ? `<div class="cta-banner small" id="alert-pick" style="margin:.75rem 0 0"><b>From your alert:</b> ${slotTime(alertPick)} is preselected.${alertPick.simulated ? ` <span class="pill warn">Simulated opening</span>` : ""}</div>` : q.slot ? `<p class="v4-note" id="alert-pick-gone"><b>That opening is no longer available.</b> Pick another time below.</p>` : "";
    const foot = `<div class="v4-op-foot small"><span>${freshBadge(dp.id)}</span> <b>Nothing that works?</b> <a href="#" data-action="alert-dpe" data-dpe="${dp.id}" data-cert="${cert}">Save a mock alert for ${esc(first(dp.name))}</a></div>
      <p class="muted small" style="margin:.5rem 0 0">${plural(slots.length, "open slot")} \u00b7 sample calendar, generated for this demo. Always confirm the date with the examiner; this prototype guarantees nothing.</p>`;
    if (stale || !days.length) return `<section class="card v4-openings" id="v4-openings" aria-labelledby="v4-op-h"><h2 id="v4-op-h">Openings</h2>${lostMsg}${alertMsg}<p class="muted small" style="margin:0">${stale ? "<b>Availability not recently confirmed.</b> Contact the examiner. Openings are hidden until the examiner confirms." : `No open ${esc(certById(cert).short)} slots right now.`} <a href="#" data-action="alert-dpe" data-dpe="${dp.id}" data-cert="${cert}">Save a mock alert</a></p></section>`;
    // The shown day is the student's: a fixed day (a ?date= link, or the day of a slot that started) is never swapped for another.
    const day = days.includes(ui.sel) ? ui.sel : ui.selFixed && ui.sel ? null : days[0];
    const times = day ? S.slots.filter((s) => s.dpeId === dp.id && s.date === day && s.status !== "removed" && !(s.status === "open" && slotPast(s))).sort((a, b) => a.time.localeCompare(b.time)) : [];
    const live = times.filter((s) => slotLive(s) && s.certs.includes(cert));
    // QA-070: after a pick was lost, nothing is preselected until the student picks again.
    const pick = live.find((s) => s.id === ui.v4pick) || (ui.v4needPick ? null : live[0]) || null;
    ui.v4cur = pick ? pick.id : null;
    const shown = day || ui.sel;
    return `<section class="card v4-openings" id="v4-openings" aria-labelledby="v4-op-h">
      <div class="row spread"><h2 id="v4-op-h" style="margin:0">Openings</h2><span class="muted small">${esc(fmtDate(shown, { month: "long", year: "numeric" }))}</span></div>
      ${lostMsg}${alertMsg}
      <div class="v4-days" role="group" aria-label="Open days">${days.map((d) => `<button type="button" class="v4-day" data-action="v4-day" data-date="${d}" aria-pressed="${d === day}"><span class="small">${fmtDate(d, { weekday: "short" })}</span><b>${parseIso(d).getDate()}</b></button>`).join("")}</div>
      ${day ? `<p class="v4-lbl" style="margin:.9rem 0 .5rem">${v4DateCap(day)}</p>
      <div class="v4-times" role="group" aria-label="Times">${times.map((s) => { const ok = slotLive(s) && s.certs.includes(cert); return ok
        ? `<button type="button" class="v4-time" data-action="v4-pick" data-slot="${s.id}" aria-pressed="${!!pick && pick.id === s.id}"><span class="mono">${slotTime(s)}</span><span class="small muted">${s.airport}</span></button>`
        : `<span class="v4-time is-off"><span class="mono">${slotTime(s)}</span><span class="small">${s.status === "open" ? "Other checkrides" : "Taken"}</span></span>`; }).join("")}</div>
      ${(() => { const nt = times.filter((s) => s.note && slotLive(s) && s.certs.includes(cert)); return nt.length ? `<ul class="v4-day-notes small" id="v4-day-notes" aria-label="Notes from the examiner">${nt.map((s) => `<li><span class="mono">${slotTime(s)}</span>: ${esc(s.note)}</li>`).join("")}</ul>` : ""; })()}
      ${live.length ? "" : dayNone(dp, cert, slots, day)}` : `<div style="margin-top:.9rem">${dayNone(dp, cert, slots, ui.sel)}</div>`}
      <p class="muted small v4-slot-note" id="v4-slot-note" style="margin:.75rem 0 0">Each slot is about 4 hours, oral and flight (typical, varies by examiner). ${VERIFY}</p>
      <p class="muted small" style="margin:.4rem 0 0">Times are local to the airport. A request holds the slot while ${esc(first(dp.name))} reviews it; it\u2019s confirmed only once they accept.</p>
      ${foot}
      ${own ? "" : pick ? `<div class="v4-bar" id="v4-bar"><div><b>${esc(fmtDate(pick.date))} \u00b7 <span class="mono">${slotTime(pick)}</span></b><div class="muted small">${pick.airport} \u00b7 ${esc(certById(cert).short)} \u00b7 ${money(dp.fees[cert])} to the examiner</div></div><button class="btn cta" data-action="request" data-slot="${pick.id}" data-cert="${cert}" id="v4-request">Request slot</button></div>` : ""}
    </section>`;
  }


  // Pretend log in / sign up: local state only. Nothing is sent; passwords, emails and phones are never stored.
  const V4_DEMO_NOTE = `<p class="v4-demo-note" role="note"><b>Demo only.</b> No real accounts: nothing is sent or checked, and your password, email and phone are never stored. Only a display name, role and airport stay in this browser (Reset clears them).</p>`;
  const V4_ROLES = [["pilot", "Student pilot", "Find an examiner and request a checkride."], ["dpe", "Examiner (DPE)", "Post openings and answer requests."], ["school", "Flight school", "Request checkrides for your students."]];
  function v4AuthShell(inner) {
    return `<div class="page v4-auth"><div class="v4-auth-card card">
      <a class="v4-auth-logo" href="#/" aria-label="Checkride Connect, home"><img class="lockup lockup-light" src="${BRAND_LOGO.light}" width="164" height="26" alt=""><img class="lockup lockup-dark" src="${BRAND_LOGO.dark}" width="164" height="26" alt=""></a>
      ${inner}</div></div>`;
  }
  function viewLogin() {
    const u = S.demoUser;
    return v4AuthShell(`<h1>Welcome back</h1><p class="muted">Log in to the demo to manage your checkride requests.</p>${V4_DEMO_NOTE}
      <form class="stack" data-form="demo-login" autocomplete="off" novalidate>
        <label class="field"><span>Email</span><input type="email" name="email" id="login-email" autocomplete="off" placeholder="you@example.com" required></label>
        <label class="field"><span>Password</span><input type="password" name="password" id="login-password" autocomplete="off" required><span class="small muted">Demo: never stored or sent.</span></label>
        <fieldset class="field v4-role-mini"><legend class="small">Open the demo as</legend><div class="row" style="gap:.5rem;flex-wrap:wrap">${V4_ROLES.map(([r, l]) => `<label class="v4-radio sm"><input type="radio" name="role" value="${r}" ${(u ? u.role : S.role) === r ? "checked" : ""}> ${l}</label>`).join("")}</div></fieldset>
        <button class="btn cta v4-wide" type="submit" id="login-submit">Log in (demo)</button>
      </form>
      <p class="small" style="margin:1rem 0 0;text-align:center">New here? <a href="#/signup">Create a demo account</a></p>`);
  }
  function viewSignup(q) {
    const role = V4_ROLES.some(([r]) => r === (ui.signupRole || q.role)) ? (ui.signupRole || q.role) : "pilot";
    const aptLbl = { pilot: "Home airport", dpe: "Main airport you test at", school: "School\u2019s home airport" }[role];
    const goal = role === "pilot" ? `<label class="field"><span>Checkride you\u2019re working toward</span><select name="goal" id="signup-goal">${D.certs.filter((c) => c.id !== "sport").map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}<option value="atp">ATP (info only: not bookable in this prototype)</option></select></label>
        <label class="field"><span>Recommending CFI <span class="muted">(optional)</span></span><input name="cfi" id="signup-cfi" autocomplete="off"></label>` : "";
    return v4AuthShell(`<h1>Create your account</h1><p class="muted">Free during the prototype. Takes about a minute.</p>${V4_DEMO_NOTE}
      <form class="stack" data-form="demo-signup" autocomplete="off" novalidate>
        <fieldset class="v4-roles"><legend>I am a\u2026</legend>${V4_ROLES.map(([r, l, d]) => `<label class="v4-radio card"><input type="radio" name="role" value="${r}" ${r === role ? "checked" : ""} data-signup-role><span><b>${l}</b><span class="muted small">${d}</span></span></label>`).join("")}</fieldset>
        <label class="field"><span>Full name</span><input name="name" id="signup-name" autocomplete="off" required></label>
        <label class="field"><span>${aptLbl}</span><select name="airport" id="signup-airport">${v4NearOpts(STATE_HOME.FL)}</select></label>
        ${goal}
        <label class="field"><span>Phone <span class="muted">(optional)</span></span><input type="tel" name="phone" id="signup-phone" autocomplete="off"><span class="small muted">Demo: not stored, nothing is texted.</span></label>
        <label class="field"><span>Email</span><input type="email" name="email" id="signup-email" autocomplete="off" required><span class="small muted">Demo: not stored, nothing is emailed.</span></label>
        <label class="field"><span>Password</span><input type="password" name="password" id="signup-password" autocomplete="off" minlength="8" required><span class="small muted">At least 8 characters. Demo: never stored or sent.</span></label>
        <label class="v4-check small"><input type="checkbox" name="age" id="signup-age" required> I\u2019m 16 or older and I understand this is a prototype with example data.</label>
        <p class="small muted" id="signup-err" role="alert" style="margin:0"></p>
        <button class="btn cta v4-wide" type="submit" id="signup-submit">Create demo account</button>
      </form>
      <p class="small" style="margin:1rem 0 0;text-align:center">Already have one? <a href="#/login">Log in</a></p>`);
  }

  // Landing (v4): reference-site section order; keyed ux-copy-v3 copy kept for hero, #who, #how, #free and #faq.
  // EASY SWITCH (rc2): landing wording lives here (copy keys). Text is unchanged from v4-rc1.
  const LANDING_COPY = {
    "hero.eyebrow": "EARLY PROTOTYPE \u00b7 CHECKRIDE SCHEDULING",
    "hero.h1": "Your next checkride.", "hero.h1b": "A clearer path.",
    "hero.lead": "Finding an examiner shouldn\u2019t feel like another test. See openings and fees upfront, send a request, and get ready in one place. This is an early prototype, so every examiner, school and opening shown is fictional.",
    "final.h2": "Ready for your checkride?",
    "final.body": () => `Sample examiners in ${coveredList()}. Find one near your field.`,
  };
  const LC = (k) => { const v = LANDING_COPY[k]; return typeof v === "function" ? v() : v; };
  function viewLanding() {
    const f = { cert: "ppl", near: "KORL", state: "FL", outside: "", radius: 50, before: "", maxFee: 0, sort: "soonest" };
    const res = searchDpes(f).filter((r) => r.soonest && !isStale(r.dp.id));
    const dayN = (r) => r.slots.filter((s) => s.date === r.soonest.date).length;
    const top = res.find((r) => dayN(r) >= 3) || res.find((r) => dayN(r) >= 2) || res[0];
    const heroDay = top ? top.slots.filter((s) => s.date === top.soonest.date).slice(0, 3) : [];
    const hs = heroDay[1] || heroDay[0];
    const hero = top ? `<div class="v4-hero-panel" aria-hidden="false"><article class="v4-card v4-mock" aria-label="Sample request card">
        <div class="v4-card-top"><div class="avatar">${initials(top.dp.name)}</div><div class="v4-who"><b>${esc(top.dp.name)}</b><div class="muted small">Example examiner \u00b7 ${esc(apt(top.dp.home).city)}, FL \u00b7 ${top.dist} nm</div></div><div class="v4-fee"><b class="mono">${money(top.fee)}</b><span class="muted small">Private Pilot</span></div></div>
        <p class="v4-lbl" style="margin:.9rem 0 .5rem">${v4DateCap(top.soonest.date)} \u00b7 ${top.soonest.airport}</p>
        <div class="v4-times">${heroDay.map((s) => `<span class="v4-time${s === hs ? " is-on" : ""}"><span class="mono">${slotTime(s)}</span></span>`).join("")}</div>
        <a class="btn cta v4-wide" href="#/dpe/${top.dp.id}?cert=ppl&near=KORL&date=${hs.date}&pick=${hs.id}" data-action="set-role" data-role="pilot" data-to="#/dpe/${top.dp.id}?cert=ppl&near=KORL&date=${hs.date}&pick=${hs.id}">Request ${slotTime(hs)} slot</a>
      </article><p class="v4-toast-mock">${V4_CHECK} Accepted \u00b7 prep checklist sent <span class="muted">(mock)</span></p></div>` : "";
    const aud = [["01 / Students", "Find the right fit.", "Not just a phone number.", "Compare examiners\u2019 certificates, airports, published fees and openings, then send a request. It\u2019s confirmed only when the examiner accepts.", "pilot", "#/#students"],
      ["02 / Examiners", "Your calendar.", "Your decisions.", "Set your availability and terms, then accept or decline requests that arrive with the details attached. Nothing is confirmed until you accept.", "dpe", "#/#examiners"],
      ["03 / Flight schools", "Every student.", "One clear view.", "See each student\u2019s readiness, eligibility clock and checkride requests in one place.", "school", "#/#schools"]];
    const how = [["01", "Find and request", "Choose an opening and send a request with your readiness details and an optional note to the examiner. It\u2019s a request, not a booking.", "Awaiting your examiner", "warn"],
      ["02", "Review and accept", "The examiner reviews your request and decides. Only an accepted request becomes a confirmed checkride.", "Confirmed after acceptance", "good"],
      ["03", "Prepare together", "Once your request is accepted, the examiner\u2019s readiness checklist shows up in your workspace, and you track your prep there.", "Your next step", "accent"]];
    const feat = (items) => `<ul class="v4-feats">${items.map(([t, b]) => `<li><span class="v4-tick">${V4_CHECK}</span><div><b>${t}</b><p class="muted small">${b}</p></div></li>`).join("")}</ul>`;
    // Examiner inbox mock from the first sample examiner's own requests.
    const dp0 = D.dpes[0], bk = S.bookings.filter((b) => b.dpeId === dp0.id);
    const pend = bk.filter((b) => b.status === "requested"), wk = bk.filter((b) => b.status === "confirmed" && daysUntil(slotOf(b).date, slotTz(slotOf(b))) <= 7 && daysUntil(slotOf(b).date, slotTz(slotOf(b))) >= 0);
    const openN = openSlots({ dpeId: dp0.id }).length;
    const p0 = pend[0], s0 = p0 && slotOf(p0);
    const inbox = `<div class="v4-card v4-inbox" aria-label="Sample examiner inbox">
        <div class="row spread"><b>Requests</b><span class="pill v4-ex">Example data</span></div>
        <div class="v4-stats"><div><b class="mono">${pend.length}</b><span class="small muted">Pending</span></div><div><b class="mono">${wk.length}</b><span class="small muted">This week</span></div><div><b class="mono">${openN}</b><span class="small muted">Open slots</span></div></div>
        ${p0 ? `<div class="v4-req"><div class="row spread"><b>${esc(p0.applicant)}</b>${chip("warn", "Requested")}</div><div class="small">${esc(certById(p0.cert).name)} \u00b7 ${fmtDate(s0.date)} \u00b7 ${slotTime(s0)}</div><div class="muted small">${esc(p0.aircraft)} \u00b7 CFI ${esc(p0.cfi)}</div><div class="small" style="margin-top:.35rem">${countPill(of9(p0.readiness))}</div>
          <div class="row" style="gap:.5rem;margin-top:.6rem"><a class="btn secondary sm" href="#/requests" data-action="set-role" data-role="dpe" data-to="#/requests">Decline</a><a class="btn sm" href="#/requests" data-action="set-role" data-role="dpe" data-to="#/requests">Accept + checklist</a></div></div>` : ""}
        ${pend.slice(1, 3).map((b) => { const s = slotOf(b); return `<div class="v4-req-row"><div><b>${esc(b.applicant)}</b><div class="muted small">${esc(certById(b.cert).short)} \u00b7 ${fmtDate(s.date)}</div></div>${chip("warn", "Requested")}</div>`; }).join("")}
      </div>`;
    const near3 = searchDpes(f).slice(0, 4);
    const studs = D.school.students.slice(0, 2);
    const table = `<div class="v4-card v4-table-card" aria-label="Sample examiners near ${D.school.airport}">
        <div class="row spread"><b>Examiners near ${D.school.airport}</b><span class="pill v4-ex">Example data</span></div>
        <div class="table-wrap"><table class="v4-table"><thead><tr><th>Examiner</th><th class="num">Private</th><th class="num">Next</th></tr></thead><tbody>${near3.map((r) => `<tr><td>${esc(r.dp.name)}</td><td class="num mono">${money(r.fee)}</td><td class="num">${r.soonest && !isStale(r.dp.id) ? v4Short(r.soonest.date) : "\u2014"}</td></tr>`).join("")}</tbody></table></div>
        ${studs.map((s) => `<div class="v4-req-row"><b>${esc(s.name)}</b>${s.status === "confirmed" ? chip("good", "Confirmed") : s.status === "requested" ? chip("warn", "Requested") : chip("", "No request yet")}</div>`).join("")}
        <a class="btn v4-wide" href="#/school/requests" data-action="set-role" data-role="school" data-to="#/school/requests" style="margin-top:.75rem">Request for a student</a>
      </div>`;
    const findMock = `<div class="v4-card v4-findmock" aria-label="Sample search">
        <div class="row" style="gap:.5rem;flex-wrap:wrap"><span class="v4-apt"><span class="mono">KORL</span></span><span class="v4-apt">Private Pilot</span><span class="v4-apt">50 nm</span><span class="v4-apt">Next 2 weeks</span></div>
        ${near3.slice(0, 3).map((r) => `<div class="v4-req-row"><div class="row" style="gap:.6rem;flex-wrap:nowrap"><div class="avatar sm">${initials(r.dp.name)}</div><div><b>${esc(r.dp.name)}</b><div class="muted small">${r.dist} nm${r.soonest && !isStale(r.dp.id) ? ` \u00b7 Next open ${v4Short(r.soonest.date)}` : ""}</div></div></div><b class="mono">${money(r.fee)}</b></div>`).join("")}
        <a class="btn v4-wide" href="#/find" data-action="set-role" data-role="pilot" data-to="#/find" style="margin-top:.75rem">Request a slot</a>
      </div>`;
    return `<div class="landing v4-landing">
    <section class="land-hero v4-hero">
      <div class="land-hero-grid">
        <div>
          <p class="eyebrow">${LC("hero.eyebrow")}</p>
          <h1 class="display paired">${LC("hero.h1")} <span class="b">${LC("hero.h1b")}</span></h1>
          <p class="lead muted">${LC("hero.lead")}</p>
          <div class="row"><a class="btn cta" href="#/find" data-action="set-role" data-role="pilot" data-to="#/find" id="land-find">Find a DPE \u2192</a><a class="btn secondary" href="#/home" data-action="set-role" data-role="pilot" data-to="#/home">Explore the demo</a></div>
          <p class="small muted" style="margin-top:1rem">Built for students, examiners and flight schools. Free during the prototype. No fees from us. <a href="#/#how">See how it works</a> \u00b7 <a href="#/requests" data-action="set-role" data-role="dpe" data-to="#/requests">I\u2019m an examiner</a></p>
        </div>
        ${hero}
      </div>
    </section>
    <section class="land-sec" id="how">
      <p class="eyebrow">HOW IT WORKS</p>
      <h2 class="paired">Requests, not guesswork. <span class="b">Preparation in one place.</span></h2>
      <ol class="grid g3 steps-v3">${how.map(([n, t, b, c, v]) => `<li class="card"><span class="step-n mono">${n}</span><h3>${t}</h3><p class="muted small">${b}</p>${chip(v, c)}</li>`).join("")}</ol>
    </section>
    <section class="land-sec" id="who">
      <p class="eyebrow">ONE CONNECTION. THREE PERSPECTIVES.</p>
      <h2 class="paired">Built for the people <span class="b">behind every checkride.</span></h2>
      <p class="lead muted">Less chasing down information. More clarity for everyone involved.</p>
      <div class="grid g3">${aud.map(([l, a, b, line, role, href]) => `<a class="card aud-card" href="${href}"><p class="eyebrow">${l}</p><h3 class="paired h-card">${a} <span class="b">${b}</span></h3><p class="muted small" style="margin:0">${line}</p></a>`).join("")}</div>
    </section>
    <section class="land-sec v4-split" id="students" aria-labelledby="students-h">
      <div><p class="eyebrow">FOR STUDENT PILOTS</p><h2 id="students-h">Stop chasing examiners. Start requesting checkrides.</h2>
        <p class="muted">You\u2019ve done the training. Skip the week of phone calls and voicemails between sign-off and test day.</p>
        ${feat([["Every sample DPE near you, in one search", "Filter by checkride and airport, and see who has openings."], ["Fees and policies upfront", "Published examiner fees, retest fees and cancellation rules."], ["Request a real opening, not a callback", "Pick an open time. It\u2019s held while the examiner reviews, and confirmed only once they accept."], ["Show up prepared", "Your examiner\u2019s own checklist says what to finish and what to bring."]])}
        <a class="btn" href="#/find" data-action="set-role" data-role="pilot" data-to="#/find">Find a DPE near you</a></div>
      ${findMock}
    </section>
    <section class="land-sec v4-split rev" id="examiners" aria-labelledby="examiners-h">
      ${inbox}
      <div><p class="eyebrow">FOR EXAMINERS</p><h2 id="examiners-h">Spend your time examining, not scheduling.</h2>
        <p class="muted">Post your openings once. Requests arrive that already match your checkrides and airports, with the details you need to decide.</p>
        ${feat([["Requests that already fit", "Students only see checkrides you give, at airports you fly from."], ["Every detail upfront", "Slot, aircraft, recommending CFI and the applicant\u2019s self-attested readiness arrive with each request."], ["Checklists in one tap", "Accept + checklist opens your prep list for that applicant, ready to edit and send."], ["Your rules, published", "You set fees, airports and cancellation terms. Everyone sees them before asking."]])}
        <a class="btn" href="#/requests" data-action="set-role" data-role="dpe" data-to="#/requests">Open the examiner demo</a></div>
    </section>
    <section class="land-sec v4-split" id="schools" aria-labelledby="schools-h">
      <div><p class="eyebrow">FOR FLIGHT SCHOOLS</p><h2 id="schools-h">Get signed-off students tested sooner.</h2>
        <p class="muted">Compare the sample examiners near your field and request slots for your students in one place.</p>
        ${feat([["Examiners at a glance", "Airports, fees per checkride and next opening for nearby examiners, in one table."], ["Request for your students", "Send a request on a student\u2019s behalf, with the aircraft and recommending CFI."], ["Every request, one list", "See which requests are waiting, accepted or declined."], ["Fewer phone chains", "Less back and forth between students, CFIs and examiners."]])}
        <a class="btn" href="#/school" data-action="set-role" data-role="school" data-to="#/school">Browse examiners</a></div>
      ${table}
    </section>
    <section class="land-sec v4-promise free-note" id="free">
      <p class="eyebrow">${FEES ? "PROPOSED PRICING" : "WHAT IT COSTS"}</p>
      ${FEES ? `<h2>Proposed pricing</h2><p><span class="pill warn">Proposed pricing</span> A flat ${money(BOOKING_FEE)} student booking fee and optional school plans are proposed. Nothing is charged in this prototype; you pay your examiner directly.</p>`
        : `<h2 class="paired">Free during the prototype. <span class="b">No fees from us.</span></h2><p>Students, examiners and flight schools pay Checkride Connect nothing while we test this prototype. You pay your examiner directly for the checkride, under the examiner\u2019s own terms.</p>`}
      <a class="btn secondary" href="#/pricing">See pricing</a>
    </section>
    <section class="land-sec v4-final" aria-labelledby="final-h">
      <h2 id="final-h">${LC("final.h2")}</h2>
      <p class="muted">${LC("final.body")}</p>
      <div class="row" style="justify-content:center"><a class="btn cta" href="#/find" data-action="set-role" data-role="pilot" data-to="#/find">Find a DPE</a><a class="btn secondary" href="#/#how">See how it works</a></div>
    </section>
    <section class="land-sec faq-sec" id="faq" aria-labelledby="faq-h">
      <div class="faq-head">${FAQ_H("faq-h")}</div>
      ${faqAccordion("faq")}
    </section>
    <p class="small muted land-footer">Early prototype. All names, schools, openings and prices are fictional. Nothing is charged, and no real requests are sent. Not affiliated with or endorsed by the FAA.</p>
    <p class="small muted land-footer"><b>Prototype – no real payments.</b> Nothing is charged, emailed or texted.</p>
    <p class="small muted land-footer">\u00a9 2026 Checkride Connect \u00b7 Prototype, not legal or FAA advice.</p>
    </div>`;
  }

  // School: "Examiners near <airport>" table (reference layout).
  function v4SchoolNear() {
    const a = D.school.airport, f = { cert: "ppl", near: a, state: aptState(a), outside: "", radius: 50, before: "", maxFee: 0, sort: "soonest" };
    const rows = searchDpes(f).slice(0, 6);
    const cs = ["ppl", "ir", "cpl"];
    return `<section class="card v4-near" id="school-near" aria-labelledby="school-near-h">
      <div class="row spread"><h2 id="school-near-h" style="margin:0">Examiners near ${a}</h2><span class="pill v4-ex">Example data</span></div>
      <div class="table-wrap"><table class="v4-table"><caption class="sr-only">Sample examiners near ${a}: airports, fee per checkride and next opening</caption><thead><tr><th scope="col">Examiner</th><th scope="col">Airports</th>${cs.map((c) => `<th scope="col" class="num">${esc(certById(c).short)}</th>`).join("")}<th class="num">Next</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td><a href="#/dpe/${r.dp.id}?cert=ppl&near=${a}">${esc(r.dp.name)}</a><div class="muted small">${r.dist} nm</div></td><td class="mono small">${[...new Set([r.dp.home, ...r.slots.map((s) => s.airport)])].slice(0, 3).join(" ")}</td>${cs.map((c) => `<td class="num mono">${r.dp.fees[c] ? money(r.dp.fees[c]) : "\u2014"}</td>`).join("")}<td class="num">${r.soonest && !isStale(r.dp.id) ? v4Short(r.soonest.date) : "\u2014"}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="row" style="margin-top:.75rem;gap:.5rem"><a class="btn sm" href="#/school/requests">Request for a student</a><a class="btn secondary sm" href="#/find?cert=ppl&near=${a}">Find a DPE</a></div>
    </section>`;
  }

  const V4_ACTIONS = {
    "day-next": (el, e) => { if (e) e.preventDefault(); ui.sel = el.dataset.date; ui.selFixed = true; ui.month = ui.sel.slice(0, 7); ui.dateMoved = null; ui.v4lost = null; ui.v4pick = el.dataset.slot || null; ui.v4needPick = true; ui.focusAfter = `[data-action="v4-pick"][aria-pressed="true"] || [data-action="v4-day"][aria-pressed="true"] || #v4-op-h`; render(); },
    // QA-066: show the next 20 cards; focus stays on "Show more" (or lands on the first new card when the list is complete).
    "find-more": () => { const prev = ui.findShown || FIND_PAGE; ui.findShown = prev + FIND_PAGE; ui.focusAfter = `#find-more || #find-results > article:nth-child(${prev + 1}) h2 a`; render(); },
    "v4-day": (el) => { ui.dateMoved = null; ui.v4lost = null; ui.selFixed = true; ui.sel = el.dataset.date; ui.month = ui.sel.slice(0, 7); ui.v4pick = null; ui.focusAfter = `[data-action="v4-day"][data-date="${ui.sel}"]`; render(); },
    "v4-pick": (el) => { ui.v4pick = el.dataset.slot; ui.v4lost = null; ui.focusAfter = `[data-action="v4-pick"][data-slot="${ui.v4pick}"]`; render(); },
    // QA-061 (conflicts.md #15, D34): accept, then open the builder already prefilled with the default list; the examiner
    // edits and sends it. Focus lands on the builder's h1 so keyboard users keep their place.
    "accept-checklist": (el) => {
      actions.accept(el);
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      if (!b || b.status !== "confirmed") return; // refused (e.g. the opening started): stay on the requests list
      if (!S.curated[b.id]) { S.curated[b.id] = { items: standardItems(b.cert).map((i) => ({ id: uid("i"), ...i })), note: "", updatedAt: Date.now(), sent: null, prefilled: true }; save(); }
      ui.focusAfter = "#cl-h1 || #app h1";
      go(`#/dpe-checklist/${b.id}`);
    },
    "demo-logout": () => { S.demoUser = null; save(); toast("Logged out of the demo. Nothing was sent."); go("#/"); },
  };
  const V4_FORMS = {
    find: (f, fd) => { const q = new URLSearchParams({ cert: fd.get("cert"), near: fd.get("near"), radius: fd.get("radius") || 50 }); location.hash = "#/find?" + q.toString(); },
    "demo-login": (f, fd) => {
      const email = String(fd.get("email") || "").trim(), role = fd.get("role") || "pilot";
      if (!email || !String(fd.get("password") || "")) { toast("Enter any email and password: this is a demo, nothing is checked."); return; }
      const name = (S.demoUser && S.demoUser.name) || "Demo user";
      S.demoUser = { name, role, airport: (S.demoUser && S.demoUser.airport) || "" }; S.role = role;
      f.reset(); save(); toast(`Logged in to the demo as ${name}. No account was checked and nothing was sent.`); go(HOME[role]);
    },
    "demo-signup": (f, fd) => {
      const name = String(fd.get("name") || "").trim(), role = fd.get("role") || "pilot", pw = String(fd.get("password") || "");
      const err = !name ? "Add your name." : !String(fd.get("email") || "").includes("@") ? "Add an email (it isn\u2019t stored)." : pw.length < 8 ? "Use at least 8 characters for the password (it isn\u2019t stored)." : !fd.get("age") ? "Confirm you\u2019re 16 or older." : "";
      if (err) {
        const e = $("#signup-err"); if (e) e.textContent = err;
        // QA-068: move focus to the first field with a problem, and tie the message to it.
        const id = !name ? "signup-name" : !String(fd.get("email") || "").includes("@") ? "signup-email" : pw.length < 8 ? "signup-password" : "signup-age";
        f.querySelectorAll("[aria-describedby~='signup-err']").forEach((x) => { if (x.id !== id) x.removeAttribute("aria-describedby"); });
        const fe = document.getElementById(id); if (fe) { fe.setAttribute("aria-invalid", "true"); fe.setAttribute("aria-describedby", "signup-err"); fe.focus(); }
        return;
      }
      const airport = fd.get("airport") || "";
      S.demoUser = { name: name.slice(0, 60), role, airport }; S.role = role; ui.signupRole = null;
      f.reset(); save(); toast(`Demo account for ${S.demoUser.name}. Nothing was sent; your email, phone and password weren\u2019t kept.`); go(HOME[role]);
    },
  };

  // ---------- router ----------
  const routes = [
    [/^\/$/, viewLanding], [/^\/find$/, viewFind], [/^\/login$/, viewLogin], [/^\/signup$/, viewSignup], [/^\/home$/, viewHome], [/^\/journey$/, viewJourney], [/^\/readiness$/, viewReadiness], [/^\/more$/, viewMore], [/^\/faq$/, viewFaq], [/^\/request\/(\w+)$/, viewRequest], [/^\/offer\/(\w+)$/, viewOffer],
    [/^\/dpe-today$/, viewDpeToday], [/^\/dpe-applicants$/, viewDpeApplicants], [/^\/school\/requests$/, viewSchoolRequests], [/^\/school\/readiness$/, viewSchoolReadiness], [/^\/search$/, viewSearch], [/^\/dpe\/(\w+)$/, viewProfile], [/^\/compare$/, viewCompare],
    [/^\/alerts$/, viewAlerts], [/^\/checklists(?:\/(\w+))?$/, viewChecklists], [/^\/bookings$/, viewBookings], [/^\/my-checklists$/, viewMyChecklists], [/^\/dpe-checklist\/(\w+)$/, viewBuilder],
    [/^\/requests$/, viewDpeDash], [/^\/school$/, viewSchool], [/^\/school\/cohort$/, viewCohort], [/^\/dpe-openings$/, viewOpenings], [/^\/openings$/, viewPublish], [/^\/dpe-fees$/, viewDpeFees], [/^\/admin$/, viewAdmin], [/^\/pricing$/, viewPricing],
  ];
  // v3 navigation: bottom tab bar (<1024px) / 248px rail (>=1024px), per role (design-spec-v3 §5, ux-copy-v3 §6.3).
  const IC = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    journey: '<path d="M4 19c4 0 4-6 8-6s4-6 8-6"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="7" r="2"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    today: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.5"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M16 4a3 3 0 0 1 0 6M21 20c0-2-1-4-3-4.5"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  };
  const tabIcon = (k) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
  const NAV = () => {
    const pend = S.bookings.filter((b) => b.dpeId === S.actingDpe && b.status === "requested").length;
    const unread = S.notifications.filter((n) => !n.read).length;
    return ({
      pilot: [["#/home", "Home", "home", ["/home"]], ["#/search", "Search", "search", ["/search", "/find", "/dpe/", "/compare"]], ["#/journey", "Journey", "journey", ["/journey", "/readiness", "/request/", "/bookings", "/my-checklists", "/checklists"]], ["#/alerts", "Alerts", "bell", ["/alerts", "/offer/"], unread], ["#/more", "More", "more", ["/more", "/faq", "/pricing"]]],
      dpe: [["#/dpe-today", "Today", "today", ["/dpe-today"]], ["#/requests", "Requests", "inbox", ["/requests", "/request/", "/openings"], pend], ["#/dpe-openings", "Calendar", "cal", ["/dpe-openings"]], ["#/dpe-applicants", "Applicants", "people", ["/dpe-applicants", "/dpe-checklist/"]], ["#/more", "More", "more", ["/more", "/faq", "/dpe-fees", "/dpe/", "/pricing"]]],
      school: [["#/school", "Roster", "people", ["/school", "/school/cohort"]], ["#/school/requests", "Checkride requests", "inbox", ["/school/requests", "/request/"]], ["#/school/readiness", "Readiness", "list", ["/school/readiness"]], ["#/more", "More", "more", ["/more", "/faq", "/search", "/compare", "/checklists", "/pricing", "/dpe/"]]],
      admin: [["#/admin", "Admin", "shield", ["/admin"]], ["#/search", "Listings", "search", ["/search", "/dpe/"]], ["#/more", "More", "more", ["/more", "/faq", "/pricing"]]],
    }[S.role]);
  };
  const ROLE_OPTS = [["pilot", "Student pilot"], ["dpe", "Examiner"], ["school", "Flight school"], ["admin", "Admin"]];
  const HOME = { pilot: "#/home", dpe: "#/dpe-today", school: "#/school", admin: "#/admin" };
  const navActive = (path) => {
    let best = -1, len = 0;
    NAV().forEach(([, , , pre], i) => pre.forEach((p) => { const hit = p.endsWith("/") ? path.startsWith(p) : path === p || path.startsWith(p + "/"); if (hit && p.length > len) { best = i; len = p.length; } }));
    return best;
  };
  const CRUMBS = { "/find": "Find a DPE", "/openings": "Publish an opening", "/home": "Home", "/search": "Search", "/compare": "Compare fees", "/alerts": "Alerts", "/journey": "Journey", "/readiness": "Readiness checklist", "/bookings": "My checkrides", "/my-checklists": "From your examiner", "/checklists": "Checklists", "/more": "More", "/faq": "FAQs", "/pricing": "Pricing", "/dpe-today": "Today", "/requests": "Requests", "/dpe-openings": "Calendar", "/dpe-applicants": "Applicants", "/dpe-fees": "Your terms", "/school": "Roster", "/school/requests": "Checkride requests", "/school/readiness": "Readiness", "/school/cohort": "Cohort scheduling", "/admin": "Admin" };
  const crumb = (path) => {
    const tab = NAV()[navActive(path)];
    const leaf = CRUMBS[path] || (path.startsWith("/request/") ? "Request" : path.startsWith("/dpe/") ? "Examiner profile" : path.startsWith("/dpe-checklist/") ? "Checklist" : path.startsWith("/checklists/") ? "Checklists" : "");
    if (!leaf) return "";
    if (tab && tab[1] !== leaf) return `<a href="${tab[0]}">${tab[1]}</a> <span aria-hidden="true">/</span> <span aria-current="page">${leaf}</span>`;
    return `<span aria-current="page">${leaf}</span>`;
  };
  const getTheme = () => { try { return localStorage.getItem("cc-theme") || "system"; } catch (e) { return "system"; } };
  const applyTheme = (t) => {
    try { localStorage.setItem("cc-theme", t); } catch (e) { /* private mode */ }
    const r = t === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t;
    document.documentElement.dataset.theme = r;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      const k = m.getAttribute("content") === "#10141d" ? "dark" : "light";
      m.setAttribute("media", t === "system" ? `(prefers-color-scheme: ${k})` : (k === r ? "all" : "not all"));
    });
    document.querySelectorAll("[data-theme-select]").forEach((x) => { x.value = t; });
  };
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (getTheme() === "system") applyTheme("system"); }); } catch (e) { /* old browser */ }

  function parseHash() {
    const h = location.hash.slice(1) || "/";
    const [pa, qs] = h.split("?");
    const [path, anchor] = pa.split("#");
    return { path: path || "/", anchor: anchor || "", q: Object.fromEntries(new URLSearchParams(qs || "")) };
  }

  const PROTO_STRIP = `<div class="proto-strip" role="note"><span class="ps-main"><b>Private prototype</b> \u00b7 Fictional demo data \u00b7 No real requests are sent.</span><span><b>Prototype – no real payments.</b> Nothing is charged, emailed, texted or sent; everything stays in this browser.</span><span><b>Prototype, not legal or FAA advice.</b> Fees, deposits and checklists are fictional examples.</span></div>`;

  function notFound(path) {
    return `<div class="page">${emptyState({ id: "not-found", ic: "compass", h: "h1", title: "Page not found",
      body: `There is no page at <code>#${esc(path)}</code> in this prototype. It may have been renamed, or the link is mistyped.`,
      actions: `<a class="btn" href="${HOME[S.role]}">Go to ${S.role === "pilot" ? "home" : "your dashboard"}</a><a class="btn secondary" href="#/search">Search examiners</a><a class="btn ghost" href="#/pricing">Pricing</a>` })}</div>`;
  }
  // A view that throws (e.g. odd saved state) shows a recoverable error instead of a blank page.
  function renderError(err) {
    console.error("Checkride Connect render error", err);
    return `<div class="page">${emptyState({ id: "render-error", ic: "alert", h: "h1", title: "This page couldn\u2019t be shown",
      body: "Something in the saved sample data didn\u2019t load as expected. Reload, or reset the demo to start from fresh sample data. Nothing was sent or charged.",
      actions: `<button class="btn" data-action="reload-page">Reload</button><button class="btn secondary" data-action="reset">Reset demo data</button>` })}</div>`;
  }
  // Rail and sticky fee card sit under the sticky header; keep its height in a CSS var.
  const setHdr = () => { const h = document.querySelector(".topbar"); if (h) document.documentElement.style.setProperty("--hdr-h", h.offsetHeight + "px"); };
  if (window.ResizeObserver) { const h = document.querySelector(".topbar"); if (h) new ResizeObserver(setHdr).observe(h); }
  window.addEventListener("resize", setHdr);
  // D38 #9: #/dpe-dashboard was renamed #/requests; old links and bookmarks redirect (query kept, no extra history entry).
  const RENAMED = { "/dpe-dashboard": "/requests" };
  function render() {
    { const h = location.hash.slice(1), p0 = h.split("?")[0].split("#")[0]; if (p0 === "faq") { location.replace("#/#faq"); return; } if (RENAMED[p0]) { location.replace("#" + RENAMED[p0] + h.slice(p0.length)); return; } }
    const { path, q, anchor } = parseHash();
    let html = null;
    try { for (const [re, fn] of routes) { const m = path.match(re); if (m) { html = fn(q, ...m.slice(1)); break; } } }
    catch (err) { html = renderError(err); }
    const landing = path === "/", pub = landing || path === "/login" || path === "/signup";
    // QA-065: remember what had focus so a re-render that replaces it can put focus back on the same control.
    const fKey = focusKey(document.activeElement), pathChanged = ui.lastPath !== path && ui.lastPath !== null;
    document.body.classList.toggle("is-landing", pub);
    $("#app").innerHTML = (landing ? "" : PROTO_STRIP) + (html ?? notFound(path));
    a11yFix($("#app"));
    if (!/^\/dpe\/[^/]+$/.test(path)) ui.profileKey = null;
    const act = navActive(path);
    $("#nav").innerHTML = pub ? "" : NAV().map(([href, label, ic, , badge], i) => `<a href="${href}" class="${i === act ? "active" : ""}"${i === act ? ' aria-current="page"' : ""}>${tabIcon(ic)}<span class="t">${label}</span>${badge ? `<span class="badge"${ic === "bell" ? ' id="alerts-badge"' : ""} aria-label="${badge} ${ic === "bell" ? "unread" : "awaiting review"}">${badge}</span>` : ""}</a>`).join("");
    $("#nav").hidden = pub;
    $("#crumb").innerHTML = landing ? "" : crumb(path);
    $("#land-nav").hidden = !pub;
    { const au = $("#v4-auth"); if (au) au.innerHTML = S.demoUser ? `<span class="v4-hi small">Demo: <b>${esc(S.demoUser.name)}</b></span><button class="btn ghost sm" data-action="demo-logout">Log out</button>` : `<a class="btn ghost sm" href="#/login">Log in</a><a class="btn sm" href="#/signup">Sign up</a>`; }
    $("#role-select").value = S.role;
    document.querySelectorAll("[data-theme-select]").forEach((x) => { x.value = getTheme(); });
    const unread = S.notifications.filter((n) => !n.read).length;
ui.lastUnread = unread;
    try { if (navigator.setAppBadge) { unread && S.role === "pilot" ? navigator.setAppBadge(unread) : navigator.clearAppBadge(); } } catch (e) { /* optional */ }
    if (ui.pendingReq) { const [sid, c] = ui.pendingReq; ui.pendingReq = null; setTimeout(() => { if ($("#modal-root form[data-form=request]")) return; const s = S.slots.find((x) => x.id === sid); if (slotLive(s)) openRequest(sid, c); }, 60); }
if (ui.lastPath !== path) {
      // First paint is instant (no entrance animation): content is visible as soon as it renders (better LCP, no flash).
      const firstPaint = ui.lastPath === null;
      window.scrollTo(0, 0); ui.lastPath = path;
      if (!firstPaint) animateEnter();
      if (path !== "/openings") ui.pubHighlight = null;
      // QA-035: on #/openings, focus the h1 (tabindex=-1) so keyboard users don't restart from <body>.
      if (path === "/openings") { const h = $("#app h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
    }
    if (anchor && ui.lastAnchor !== location.hash) { ui.lastAnchor = location.hash; const t = document.getElementById(anchor); if (t) { const f = (anchor === "faq" && document.getElementById("faq-h")) || t; f.setAttribute("tabindex", "-1"); t.scrollIntoView({ block: "start" }); f.focus({ preventScroll: true });
      // Re-align once layout settles (late font swap / first-paint reflow can push the target down).
      const h = location.hash, again = () => { const e = document.getElementById(anchor); if (e && location.hash === h && Math.abs(e.getBoundingClientRect().top) > 40) e.scrollIntoView({ block: "start" }); };
      requestAnimationFrame(() => requestAnimationFrame(again)); setTimeout(again, 350); } }
    else if (!anchor) ui.lastAnchor = null;
    // QA-041/042: a handler can ask for focus to land on a given element after this render.
    barFit(); // QA-071
    if (ui.focusAfter) { const sel = ui.focusAfter; ui.focusAfter = null; const fe = sel.split(" || ").map((x) => $(x)).find(Boolean); /* first match in priority order */ if (fe) { if (!/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(fe.tagName) && !fe.hasAttribute("tabindex")) fe.setAttribute("tabindex", "-1"); fe.focus({ preventScroll: true }); } }
    // QA-065: never leave keyboard / screen-reader users on <body>. A new screen focuses its h1 (tabindex=-1, no scroll);
    // the same screen re-rendered (radius chip, filter change, re-check) gets the equivalent control back.
    else if (!document.activeElement || document.activeElement === document.body) {
      const back = !pathChanged && fKey ? $(fKey) : null;
      if (back) back.focus({ preventScroll: true });
      else if (pathChanged && !anchor && !$("#modal-root .modal")) { const h = $("#app h1"); if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
    }
  }
function focusKey(el) {
  if (!el || el === document.body || !el.closest || !el.closest("#app, #nav, #crumb, header")) return null;
  const q = (k) => CSS.escape(el.getAttribute(k));
  if (el.id) return "#" + CSS.escape(el.id);
  if (el.dataset.radius) return `[data-radius="${q("data-radius")}"]`;
  if (el.dataset.action) return `[data-action="${q("data-action")}"]` + (el.dataset.slot ? `[data-slot="${q("data-slot")}"]` : el.dataset.date ? `[data-date="${q("data-date")}"]` : el.dataset.id ? `[data-id="${q("data-id")}"]` : "");
  if (el.name && el.form && el.form.dataset.form) return `form[data-form="${CSS.escape(el.form.dataset.form)}"] [name="${q("name")}"]`;
  return null;
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
    ppl: { hours: [["total", "Total flight time", 40, "61.109(a)"], ["dual", "Dual instruction received", 20, "61.109(a)"], ["solo", "Solo flight time", 10, "61.109(a)(5)"]], test: true, end: [END_KT, END_PT] },
    sport: { hours: [["total", "Total flight time", 20, "61.313(a)"], ["dual", "Dual instruction received", 15, "61.313(a)(1)"], ["solo", "Solo flight time", 5, "61.313(a)(1)"]], test: true, end: [END_KT, END_PT] },
    ir: { hours: [["xcpic", "Cross-country time as PIC", 50, "61.65(d)(1)"], ["inst", "Actual or simulated instrument time", 40, "61.65(d)(2)"]], test: true, end: [END_KT, END_PT] },
    cpl: { hours: [["total", "Total flight time", 250, "61.129(a)"], ["pic", "Pilot-in-command time", 100, "61.129(a)(2)"]], test: true, end: [END_KT, END_PT] },
    me: { hours: [], test: false, end: ["Multi-engine training and practical-test endorsement (draft cite 61.63(c))"] },
    cfi: { hours: [], test: true, end: ["Fundamentals of instructing and knowledge endorsements (draft cite 61.183)", "Flight-proficiency endorsement (draft cite 61.187)", "Spin-training endorsement (draft cite 61.183(i))"] },
    cfii: { hours: [], test: true, end: ["Instrument instructor practical-test endorsement (draft cite 61.183, 61.187)"] },
    mei: { hours: [["mepic", "Multi-engine pilot-in-command time", 15, "61.183(j)"]], test: false, end: ["Multi-engine instructor practical-test endorsement (draft cite 61.187)"] },
  };
  const readyOf = (cert) => READY[cert] || { hours: [], test: true, end: [END_PT] };
  // Knowledge test results: draft rule of 24 calendar months (expires at the end of the 24th month after the test month).
  const ktExpiry = (date) => { const d = parseIso(date); return iso(new Date(d.getFullYear(), d.getMonth() + 25, 0)); };
  function readinessFields(cert) {
    const r = readyOf(cert);
    return `<fieldset class="ready-check" id="req-check">
      <legend>Readiness check <span class="pill warn">Self-attested</span></legend>
      <p class="small muted" style="margin:0 0 .5rem">Unverified draft, not legal or FAA advice. Minimums below are draft Part 61 figures; verify against current 14 CFR, the applicable ACS or PTS (CFII and Sport still use a PTS) and AC 61-65K. Your instructor and the examiner decide eligibility; this prototype verifies nothing.</p>
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
      else if (sd && ktExpiry(d) < sd) block.push(`Knowledge test: result from ${fmtDateY(d)} expires ${fmtDateY(ktExpiry(d))} (draft 24-calendar-month rule), before this checkride`);
      else if (!sd && ktExpiry(d) < iso(today0())) block.push(`Knowledge test: result from ${fmtDateY(d)} expired ${fmtDateY(ktExpiry(d))} (draft 24-calendar-month rule)`);
      else if (sd && daysUntil(ktExpiry(d)) - daysUntil(sd) < 60) warn.push(`Knowledge test result expires ${fmtDateY(ktExpiry(d))}, soon after this checkride. A reschedule could push ${opts.who ? "the student" : "you"} past it.`);
    }
    if (opts.iacra && !A.iacra) block.push("IACRA application: not confirmed as started");
    if (opts.pct !== undefined && of9(opts.pct) < of9(opts.pctMin || 50)) /* D12: compare counts, never percentages */ warn.push(`${opts.who ? opts.who + "\u2019s" : "Your"} ${certById(cert).short} checklist: ${opts.count || readyText(of9(opts.pct))}.`);
    return { block, warn };
  }
  function readinessIssues(form) {
    const cert = form.cert.value;
    if (form.dataset.form === "cohort-ready") return readinessEval(cert, answersFromForm(form), { pct: +form.dataset.pct, pctMin: 90, who: form.dataset.who, iacra: true });
    const s = S.slots.find((x) => x.id === form.slot.value);
    return readinessEval(cert, answersFromForm(form), { slotDate: s && s.date, pct: checklistPct(cert), count: (() => { const k = checklistCount(cert); return readyText(k.n, k.total); })() });
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

  // QA-053: after a started slot is refused, focus goes to the "No openings left" message (or the Openings heading / page h1), never <body>.
  function staleFocus() { ui.focusAfter = "#slot-started || #day-none || #v4-op-h || #app h1"; }

  function openRequest(slotId, certHint) {
    const s = S.slots.find((x) => x.id === slotId);
    if (!s) return;
    if (slotPast(s)) { toast(PAST_SLOT, "crit"); staleFocus(); rerender(); return; } // QA-039 / QA-052 / QA-053
    const dp = dpeById(s.dpeId);
    const certs = s.certs.filter((c) => dp.fees[c]);
    const rs = S.role === "school" && ui.forStudent ? D.school.students.find((x) => x.name === ui.forStudent) : null; // UF#7
    const cert = certs.includes(rs && rs.cert) ? rs.cert : certs.includes(certHint) ? certHint : certs[0];
    openModal(`<h2>Request checkride <span class="pill warn" style="vertical-align:middle">Mock</span></h2>
      <p class="muted small" style="margin-bottom:.75rem">${esc(dp.name)} (sample examiner) · ${fmtDate(s.date, { weekday: "long", month: "long", day: "numeric" })} · ${slotTime(s)} · ${s.airport}</p>
      <div class="proto-strip small" style="margin-bottom:1rem"><b>Prototype – no real payments.</b> Nothing is charged or sent. <b>Prototype, not legal or FAA advice.</b></div>
      <form class="stack" data-form="request">
        <input type="hidden" name="slot" value="${s.id}" /><input type="hidden" name="near" value="${nearFor(parseHash().q.near, dp)}" />
        <label class="field"><span>Certificate / rating</span><select name="cert" data-action-change="req-cert">${certOptions(cert, certs)}</select></label>
        <label class="field"><span>Your name (fictional is fine)</span><input name="name" required maxlength="80" autocomplete="off" value="${rs ? esc(rs.name) : ""}" placeholder="Alex Pilot" /></label>
        <label class="field"><span>Aircraft (tail number & type)</span><input name="aircraft" required maxlength="60" placeholder="N12345 · Cessna 172S" /></label>
        <label class="field"><span>Recommending instructor</span><input name="cfi" required maxlength="80" value="${rs && rs.cfi ? esc(rs.cfi) + ", CFI" : ""}" placeholder="Name, CFI" /></label>
        ${readinessFields(cert)}
        <label class="check-row small"><input type="checkbox" name="iacra" required /> <span>My IACRA application is started, and my instructor will sign the recommendation before the checkride.</span></label>
        <div class="small" id="req-ready">Your <a href="#/checklists/${cert}" data-action="close-modal">${esc(certById(cert).short)} checklist</a>: <b>${(() => { const k = checklistCount(cert); return readyText(k.n, k.total); })()}</b>. The examiner will see this.</div>
        <label class="field"><span>Note to examiner (optional)</span><textarea name="note" rows="2" maxlength="500" placeholder="Anything ${esc(first(dp.name))} should know"></textarea></label>
        <div class="summary small" id="req-summary">${requestSummary(dp, cert, s)}</div>
        <p class="small muted" data-noshow-note style="margin:0">When you send a request, the examiner sees only how many no-shows you\u2019ve had in the last 12 months. A no-show you\u2019re disputing isn\u2019t counted until it\u2019s resolved.</p>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn cta" type="submit">Send request (mock)</button></div>
        <p class="small muted" data-hold-rule style="margin:0">We hold a requested slot while the examiner reviews it, until 48 hours after you send it or 12 hours before it starts, whichever comes first. No deposit is taken until the examiner accepts.</p>
      </form>`);  showGate($("#modal-root form[data-form=request]"));
  }
  const requestSummary = (dp, cert, sl) => {
    const fee = dp.fees[cert], dep = depositFor(dp, cert);
    const near = nearFor(parseHash().q.near, dp);
    const x = sl ? allIn(dp, cert, near, sl.airport) : null;
    return `
    <div class="line"><span>Examiner fee, ${esc(certById(cert).short)} (sample)</span><b>${money(fee)}</b></div>
    <div class="line"><span>Deposit paid to your examiner, <b>ASSUMPTION</b>, mock, credited toward the fee</span><b>${money(dep)}</b></div>
    ${FEES ? `<div class="line"><span>Student booking fee</span><b>${money(BOOKING_FEE)}</b></div>` : ""}
    <div class="line" style="border-top:1px solid var(--border-strong);margin-top:.3rem;padding-top:.5rem"><span><b>Total due if the examiner accepts</b></span><b>${money(dep + BOOKING_FEE)}</b></div>
    <div class="line muted"><span>Remaining examiner fee at the test</span><b>${money(fee - dep)}</b></div>
    <div class="line muted"><span>Actually charged in this prototype</span><b>$0</b></div>
    ${x ? `<div id="req-allin" style="margin-top:.6rem;border-top:1px dashed var(--border-strong);padding-top:.5rem">
      <div class="line"><span>Aircraft rental + fuel estimate<div class="muted small">${esc(x.aircraftNote)}</div></span><b>${money(x.aircraft)}</b></div>
      <div class="line"><span>Travel / lodging estimate<div class="muted small" data-travel-note>${esc(x.travelNote)}</div></span><b>${money(x.travel)}</b></div>
      <div class="line"><span><b>Example all-in for this opening at ${x.at}</b> (examiner fee + ${FEES ? "$15 + " : ""}aircraft + travel)</span><b>${money(x.total)}</b></div>
      ${x.offer ? `<div class="small">${esc(x.offer)}</div>` : ""}
      <div class="muted small">Example numbers, not a quote. From ${near}.</div></div>` : ""}
    <div class="warn-note small" style="margin-top:.5rem"><b>ASSUMPTION, not a policy:</b> the deposit is ${depositRule(dp)}, and is part of the fee, not an extra. Real deposit rules are set by each examiner.</div>
    <div class="small" style="margin-top:.5rem" data-policy>${DEPOSIT_POLICY} ${FEES ? LEGAL_TAG + " " : ""}${PM_TAG}</div>
    ${examinerTerms(dp)}`;
  };

  function setBookingState(b, status) {
    const s = S.slots.find((x) => x.id === b.slotId);
    b.status = status;
    if (status === "confirmed") { s.status = "booked"; }
    else if (status === "declined" || status === "cancelled") { s.status = "open"; s.bookingId = null; }
    return s;
  }

  const actions = {
    "set-role": (el) => { S.role = el.dataset.role; go(el.dataset.to || HOME[S.role]); },
    "view-note": (el) => { const b = S.bookings.find((x) => x.id === el.dataset.id); if (!b || !b.note) return; const f = first(dpeById(b.dpeId).name);
      openModal(`<h2>${S.role === "dpe" ? `${esc(first(b.applicant))}\u2019s note` : `Your note to ${esc(f)}`}</h2><blockquote class="review">${esc(b.note)}</blockquote><p class="small muted">Read-only. Messaging isn\u2019t part of this prototype.</p><div class="row" style="justify-content:flex-end"><button class="btn" data-action="close-modal">Close</button></div>`); },
    "reload-page": () => location.reload(),
    reset: () => { clearDemoData(); S = seed(); applyDpeEdits(); ui.profileKey = null; toast("Demo reset to sample data."); go("#/"); },
    // More > Demo data > "Reset demo data" (mobile and desktop). One confirm step; theme (cc-theme) is kept.
    "reset-data-ask": () => {
      openModal(`<h2>Reset demo data?</h2><p class="small" id="reset-body">This clears what you\u2019ve done in this browser (requests, alerts, ticks and edits) and brings back the sample data. Your theme stays as it is. Nothing is sent anywhere.</p>
        <div class="row" style="justify-content:flex-end"><button class="btn bad" data-action="reset-data" id="reset-data-confirm">Reset demo data</button><button class="btn secondary" data-action="close-modal" data-default>Keep my data</button></div>`);
      const k = $("#modal-root [data-default]"); if (k) k.focus();
    },
    "reset-data": () => {
      const role = S.role, acting = S.actingDpe;
      clearDemoData(); S = seed(); applyDpeEdits(); ui.profileKey = null;
      S.role = role; if (acting) S.actingDpe = acting;
      closeModal(); save(); $("#toasts").innerHTML = ""; toast("Demo data reset to the sample data. Your theme is unchanged."); rerender();
    },
    "faq-toggle": (el) => {
      const open = el.getAttribute("aria-expanded") !== "true";
      el.setAttribute("aria-expanded", String(open));
      const p = document.getElementById(el.getAttribute("aria-controls")); if (p) p.hidden = !open;
    },
    "target-change": () => {
      const min = iso(today0()).slice(0, 7);
      // QA-037: where <input type=month> isn't supported (e.g. Firefox desktop), it's a plain text box: show a YYYY-MM hint,
      // pattern and our own validation instead. Feature-detected, never browser-sniffed.
      const fb = !monthInputSupported();
      const field = fb
        ? `<label class="field"><span>Month (YYYY-MM)</span><input type="text" name="month" id="target-month" inputmode="numeric" autocomplete="off" placeholder="YYYY-MM" pattern="\\d{4}-(0?[1-9]|1[0-2])" title="Year and month as YYYY-MM, for example ${min}" value="${S.target}" required aria-describedby="target-month-hint target-month-err" data-month-fallback="1" /></label>
          <p class="small muted" id="target-month-hint" style="margin:-.4rem 0 0">Type the year and month as YYYY-MM, for example ${min} for ${fmtMonth(min)}. ${fmtMonth(min)} or later.</p>
          <p class="small" id="target-month-err" role="alert" style="margin:0;color:var(--bad, #b42318)"></p>`
        : `<label class="field"><span>Month</span><input type="month" name="month" id="target-month" min="${min}" value="${S.target}" required /></label>`;
      openModal(`<h2 id="modal-title">Target month</h2><p class="muted small">When you hope to take your checkride. It only changes the heads-up on your journey; nothing is booked.</p>
        <form class="stack" data-form="target"${fb ? " novalidate" : ""}>${field}
        <div class="row"><button class="btn cta" type="submit">Save</button><button class="btn ghost" type="button" data-action="close-modal">Cancel</button></div></form>`);
    },
    "close-modal": (el) => { closeModal(); return el.tagName === "A"; },
    "modal-bg": (el, e) => { if (e.target === el) closeModal(); },
    "alert-from-search": (el) => {
      const f = searchFilters(parseHash().q);
      addAlert({ cert: f.cert, near: f.near, radius: f.radius, before: f.before || addDays(60), maxFee: f.maxFee, dpeId: el.dataset.dpe || "" });
    },
    "alert-dpe": (el) => addAlert({ cert: el.dataset.cert, near: dpeById(el.dataset.dpe).home, radius: 100, before: addDays(90), maxFee: 0, dpeId: el.dataset.dpe }),
    "sim-open": (el) => {
      // QA-050: a double-click adds one simulated opening, not two (same 1.2 s lock as Publish).
      if (ui.simLock && Date.now() < ui.simLock) return;
      ui.simLock = Date.now() + 1200;
      simulateOpening({ alertId: el.dataset.alert, dpeId: el.dataset.dpe });
      simBusy();
    },
    "notif-perm": () => { try { Promise.resolve(Notification.requestPermission()).then(() => rerender()); } catch (e) { /* unsupported */ } },
    "del-alert": (el) => { S.alerts = S.alerts.filter((a) => a.id !== el.dataset.id); toast("Alert deleted."); rerender(); },
    "read-all": () => { S.notifications.forEach((n) => { n.read = true; }); rerender(); },
    // ---- C: no-shows (D34/D36)
    "ns-mark": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id); if (!b || b.noShow) return;
      const sl = slotOf(b), nm = esc(first(b.applicant));
      openModal(`<h2>Mark ${nm} as a no-show for the confirmed checkride on ${slotAt(sl)}?</h2><p class="small">They\u2019ll be told (in-app, mock), and they can dispute it within 7 days. Your deposit terms apply as written.</p>
        <div class="row" style="justify-content:flex-end"><button class="btn bad" data-action="ns-mark-confirm" data-id="${b.id}">Mark no-show</button><button class="btn secondary" data-action="close-modal" data-default>Cancel</button></div>`);
      const k = $("#modal-root [data-default]"); if (k) k.focus();
    },
    "ns-mark-confirm": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id); closeModal();
      if (!b || b.noShow || b.status !== "confirmed") return; // lock: a double-click marks once
      const sl = slotOf(b), dp = dpeById(b.dpeId), f = first(dp.name);
      b.noShow = { at: Date.now(), by: dp.id };
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "No-show", bookingId: b.id, body: `Marked as a no-show by ${f} for your confirmed checkride on ${slotAt(sl)} \u00b7 The slot is closed \u00b7 Deposit: per ${f}\u2019s terms` });
      toast(`Marked as a no-show. ${first(b.applicant)} has been told (in-app, mock).`);
      rerender();
    },
    "ns-dispute": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id); if (!b || !b.noShow || b.noShow.dispute) return;
      const f = esc(first(dpeById(b.dpeId).name));
      openModal(`<p class="eyebrow">YOUR RECORD</p><h2>Your side. Fairly heard.</h2>
        <form class="stack" data-form="ns-dispute" id="ns-dispute-form"><input type="hidden" name="bid" value="${b.id}" />
          <label class="field"><span>Tell us what happened.</span><textarea name="text" rows="3" maxlength="600" required></textarea></label>
          <p class="small muted" style="margin:0">Checkride Connect reviews it and decides. We may ask ${f} for ${f}\u2019s side. A dispute only affects whether the no-show stays on your checkride record. While it\u2019s being reviewed, it isn\u2019t counted in what examiners see.</p>
          <p class="small muted" style="margin:0">When you send a request, the examiner sees only how many no-shows you\u2019ve had in the last 12 months. A no-show you\u2019re disputing isn\u2019t counted until it\u2019s resolved.</p>
          <div class="row" style="justify-content:flex-end"><button class="btn" type="submit" id="ns-dispute-send">Send dispute</button><button type="button" class="btn secondary" data-action="close-modal">Cancel</button></div>
        </form>`);
      const t = $("#ns-dispute-form textarea"); if (t) t.focus();
    },
    // ---- C: checkride-day prep editor (D35)
    "prep-add": (el) => { prepSync(el.dataset.id); const pr = S.prep[el.dataset.id]; const it = { id: uid("pi"), t: "" }; pr.items.push(it); rerender(); const i = $(`#prep-${it.id}`); if (i) i.focus(); },
    "prep-del": (el) => { prepSync(el.dataset.id); const pr = S.prep[el.dataset.id]; pr.items = pr.items.filter((x) => x.id !== el.dataset.item); rerender(); const b = $("#prep-form [data-action=\"prep-add\"]"); if (b) b.focus(); },
    // ---- C: medical row
    "med-edit": () => { const d = $("#med-date"); if (d) d.focus(); },
    // ---- C: waitlist offer (wl.offer.*)
    "offer-pass": (el) => {
      const n = S.notifications.find((x) => x.id === el.dataset.id); if (!n) return;
      const wl = wlOf(n.dpeId); S.offers = S.offers || {};
      if ((S.offers[n.id] || {}).passed) return;
      if (wl.passes >= 1) {
        openModal(`<h2>Pass on this one too?</h2><p class="small">You\u2019ve passed once already, so this moves you to the back of the line (#${WL_BACK}).</p><p class="small muted">Pass once and you keep your place. Pass twice and you move to the back of the line. A hold that runs out overnight doesn\u2019t count as a pass.</p>
          <div class="row" style="justify-content:flex-end"><button class="btn bad" data-action="offer-pass2" data-id="${n.id}">Pass and move to the back</button><button class="btn secondary" data-action="close-modal" data-default>Go back</button></div>`);
        const k = $("#modal-root [data-default]"); if (k) k.focus();
        return;
      }
      wl.passes = 1; S.offers[n.id] = { passed: true, at: Date.now() };
      toast(`No problem. You\u2019re still #${wl.pos} in line for the next one.`);
      rerender();
    },
    "offer-pass2": (el) => {
      closeModal();
      const n = S.notifications.find((x) => x.id === el.dataset.id); if (!n) return;
      S.offers = S.offers || {}; if ((S.offers[n.id] || {}).passed) return;
      const wl = wlOf(n.dpeId); wl.pos = WL_BACK; wl.passes = 0; S.offers[n.id] = { passed: true, at: Date.now() };
      toast(`Done. You\u2019re now #${WL_BACK}, at the back of the line.`);
      rerender();
    },
    "school-find": (el) => { ui.forStudent = el.dataset.student; return true; }, // UF#7: the request form opens prefilled for this student
    "read-notif": (el) => { const n = S.notifications.find((x) => x.id === el.dataset.id); if (n) n.read = true; save(); return true; },
    "cal-nav": (el) => { const [y, m] = ui.month.split("-").map(Number); const d = new Date(y, m - 1 + Number(el.dataset.dir), 1); ui.month = iso(d).slice(0, 7); render(); },
    "cal-day": (el) => { ui.dateMoved = null; ui.sel = el.dataset.date; render(); },
    request: (el) => openRequest(el.dataset.slot, el.dataset.cert),
    "share-checklist": (el) => {
      toast("Sharing is not available in this prototype. No link was created and nothing was sent.");
    },
    "goto-publish": () => {
      const sec = $("#publish-opening"); if (!sec) return;
      sec.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      const d = sec.querySelector('input[name="date"]'); (d || sec).focus({ preventScroll: true });
    },
    "pilot-cancel": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id); if (!b) return;
      const s = S.slots.find((x) => x.id === b.slotId), dp = dpeById(b.dpeId);
      if (b.status !== "confirmed") {
        // ux-copy-v3 §5.2a: req.withdraw.eyebrow / .headline / .body / .confirm / .keep ("Keep my request" is the default focus).
        const f1 = esc(first(dp.name));
        openModal(`<p class="eyebrow">CHANGE OF PLANS</p><h2>Your request. Your call.</h2><p class="small" id="cancel-body" data-withdraw>Your request to ${esc(dp.name)} for ${s ? slotAt(s) : "this checkride"} hasn\u2019t been accepted yet. If you withdraw it, the slot is freed and the next person in line can request it. No deposit is taken until ${f1} accepts, so there\u2019s nothing to get back. If you\u2019re on ${f1}\u2019s waitlist, you keep your place.</p>
          <div class="row" style="justify-content:flex-end"><button class="btn bad" data-action="pilot-cancel-confirm" data-id="${b.id}">Withdraw request</button><button class="btn secondary" data-action="close-modal" data-default>Keep my request</button></div>`);
      } else {
        const ms = slotStart(s) - Date.now();
        openModal(`<h2>Cancel your checkride with ${esc(dp.name)}?</h2>
          <p class="eyebrow">CHANGE OF PLANS</p><p class="small" id="cancel-body" data-outcome="${!FEES ? "none" : ms >= H48 ? "credited" : "kept"}">${studentCancelBody(s, ms, dp)}${FEES ? ` ${LEGAL_TAG}` : ""}</p>
          <p class="small" id="cancel-deposit">Your ${money(b.depositUsd ?? depositFor(dp, b.cert))} deposit was paid directly to ${esc(first(dp.name))} and follows their terms: \u201c${esc(depTerms(dp))}\u201d.</p>
          <p class="small">Need a different day instead? \u00b7 <a href="#/dpe/${dp.id}?cert=${b.cert}" data-action="close-modal">See ${esc(first(dp.name))}\u2019s other openings</a></p>
          <p class="muted small">${PM_TAG} Prototype: nothing is charged.</p>
          <div class="row" style="justify-content:flex-end"><button class="btn bad" data-action="pilot-cancel-confirm" data-id="${b.id}">Cancel checkride</button><button class="btn secondary" data-action="close-modal" data-default>Keep my checkride</button></div>`);
      }
      const k = $("#modal-root [data-default]"); if (k) k.focus();
    },
    "pilot-cancel-confirm": (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id); if (!b || (b.status !== "confirmed" && b.status !== "requested")) { closeModal(); return; }
      const s0 = S.slots.find((x) => x.id === b.slotId);
      const ms = slotStart(s0) - Date.now(), now = Date.now();
      const wasConfirmed = b.status === "confirmed";
      b.cancel = wasConfirmed ? { by: "student", at: now, aheadMs: ms, fee: !FEES ? "none" : ms >= H48 ? "credited" : "kept" } : { by: "student", at: now, request: true, fee: "none" };
      const s = setBookingState(b, "cancelled");
      closeModal();
      // D38 #3 / D39 (req.withdraw.toast): the waitlist sentence only when the student is on THIS examiner's waitlist (an alert for this examiner).
      const onWl = S.alerts.some((a) => a.cert === b.cert && a.dpeId === b.dpeId); // D39: only this examiner's waitlist
      toast(!wasConfirmed ? `Request withdrawn. The ${fmtDate(s0.date, { weekday: "short", month: "short", day: "numeric" })} slot is free again.${onWl ? " Your waitlist place hasn\u2019t changed." : ""}` : !FEES ? `Cancelled. Your slot went back to ${first(dpeById(b.dpeId).name)}. Your deposit follows ${first(dpeById(b.dpeId).name)}\u2019s terms.` : ms >= H48 ? `Cancelled. Your $15 credit is ready, good for any booking until ${creditUntil(now)}.` : "Cancelled. The $15 booking fee was kept, since it was under 48 hours.");
      fireAlerts(s, "cancel", { skipMine: true, quiet: true });
      if (!wasConfirmed) ui.focusAfter = "#req-status"; // QA-041: focus lands on the withdrawn status, never <body>
      rerender();
    },
    "as-dpe": (el) => { S.role = "dpe"; S.actingDpe = el.dataset.dpe; go(el.dataset.to || "#/requests"); },
    accept: (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      const s = setBookingState(b, "confirmed");
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Request accepted", body: `Confirmed. ${dpeById(b.dpeId).name} accepted your request: ${slotAt(s)}. Your checklist is in Journey > From your examiner. Prototype: nothing was charged.` });
      toast(`Accepted. ${first(b.applicant)}\u2019s checkride is confirmed for ${slotAt(s)}. They\u2019ll see it in the app (mock).`);
      rerender();
    },
    decline: (el) => {
      const b = S.bookings.find((x) => x.id === el.dataset.id);
      const s = setBookingState(b, "declined");
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Request declined", body: `${first(dpeById(b.dpeId).name)} couldn\u2019t take this request for ${slotAt(s)}. Nothing was confirmed, so nothing changes on your side.` });
      fireAlerts(s, "new", { skipMine: b.mine, quiet: true });
      toast(`Request declined. ${first(b.applicant)} has been told, and the slot is open again (mock).`);
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
    "dpe-fees-reset": () => { const id = S.actingDpe; if (S.dpeEdits) delete S.dpeEdits[id]; applyDpeEdits(); toast("Restored the sample fees and policies."); rerender(); },
    "mark-cancel": (el) => {
      const s = S.slots.find((x) => x.id === el.dataset.id);
      const b = S.bookings.find((x) => x.id === s.bookingId);
      if (!b) { s.status = "open"; fireAlerts(s, "cancel"); rerender(); return; }
      const nm = esc(first(b.applicant));
      openModal(`<h2>Cancel ${nm}\u2019s checkride on ${fmtDate(s.date)}?</h2>
        <form class="stack" data-form="dpe-cancel" id="dpe-cancel-form"><input type="hidden" name="slot" value="${s.id}" />
          <fieldset class="field reason-set"><legend><b>Who\u2019s cancelling?</b> <span class="muted small">(required)</span></legend>
            ${[["examiner", "I am (examiner)"], ["weather", "Weather"], ["maintenance", "Aircraft maintenance"], ["student", "The applicant asked to cancel"]].map(([v, l]) => `<label class="check-row"><input type="radio" name="reason" value="${v}" required /> <span>${l}</span></label>`).join("")}
          </fieldset>
          <label class="field"><span>Add a note for ${nm} (optional)</span><textarea name="note" rows="2" maxlength="200"></textarea></label>
          <p class="muted small" style="margin:0">The reason drives ${nm}\u2019s message${FEES ? " and the $15 outcome" : ""}. ${LEGAL_TAG} In-app notice only (mock): nothing is emailed or texted.</p>
          <div class="row" style="justify-content:flex-end"><button class="btn bad" type="submit">Cancel checkride</button><button type="button" class="btn secondary" data-action="close-modal">Keep booking</button></div>
        </form>`);
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
      toast(`Checklist sent to ${first(b.applicant)}. Mock: it appears in their app; nothing is emailed.`);
      rerender();
    },
    "school-invite": () => toast("Mock only: no invite email is sent."),
    approve: (el) => {
      const p = S.pending.find((x) => x.id === el.dataset.id);
      if (!p || p.status === "approved" || S.approvedDpes.some((x) => x.id === "n" + p.id)) return; // QA-007: a double-click lists once
      if (ui.approveLock && Date.now() < ui.approveLock) return; // QA-007: the 2nd click of a double-click lands on the next row after re-render; ignore it
      ui.approveLock = Date.now() + 700;
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
    "ns-dispute": (f, fd) => {
      const b = S.bookings.find((x) => x.id === fd.get("bid"));
      if (!b || !b.noShow || b.noShow.dispute) { closeModal(); return; } // lock: one dispute
      b.noShow.dispute = { status: "received", at: Date.now(), text: String(fd.get("text") || "").trim().slice(0, 600) };
      closeModal(); toast("Got it. We\u2019ll show the outcome here."); rerender();
    },
    "prep-save": (f, fd) => {
      const bid = fd.get("bid"), b = S.bookings.find((x) => x.id === bid); if (!b) return;
      if (ui.prepLock && Date.now() < ui.prepLock) return; ui.prepLock = Date.now() + 1000;
      prepSync(bid);
      const pr = prepOf(b), dp = dpeById(b.dpeId);
      pr.items = pr.items.filter((x) => String(x.t).trim()).map((x) => ({ ...x, t: String(x.t).trim() }));
      const def = prepDefaults(dp.name);
      const changed = JSON.stringify(pr.items.map((x) => x.t)) !== JSON.stringify(def.map((x) => x.t));
      pr.sent = { items: JSON.parse(JSON.stringify(pr.items)), at: Date.now(), changed };
      if (b.mine) S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Checkride-day prep", body: `${dp.name} updated your checkride-day prep.`, link: "#/readiness", linkText: "Have a look" });
      toast(`Saved. ${first(b.applicant)} sees the updated list (mock).`);
      rerender();
    },
    target: (f, fd) => {
      const raw = String(fd.get("month") || "").trim(), min = iso(today0()).slice(0, 7);
      const inp = f.querySelector("#target-month"), fb = inp && inp.dataset.monthFallback === "1";
      const m = fb ? parseMonthText(raw) : raw;
      const fail = (msg) => {
        if (fb) { const e = f.querySelector("#target-month-err"); if (e) e.textContent = msg; inp.setAttribute("aria-invalid", "true"); inp.focus(); }
        toast(msg);
      };
      if (!/^\d{4}-\d{2}$/.test(m)) { fail(fb ? `Type the month as YYYY-MM, for example ${min}.` : "Pick a month."); return; }
      if (m < min) { fail(`Pick ${fmtMonth(min)} or a later month.`); return; }
      S.target = m; save(); closeModal(); rerender(); toast(`Target set to ${fmtMonth(m)}.`);
      setTimeout(() => { const b = $('#journey-target [data-action="target-change"]'); if (b) b.focus(); }, 0);
    },
    search: (f, fd, t) => {
      const txt = fd.get("nearText");
      let near = fd.get("near"), st = "";
      const base = () => ({ cert: fd.get("cert"), radius: fd.get("radius"), before: fd.get("before") || "", maxFee: fd.get("maxFee") || "", sort: fd.get("sort") || "" });
      if (t && t.name === "st") {
        // B: switching state. A covered state goes to its sample airport; any other state shows the outside-coverage message.
        st = String(fd.get("st") || "");
        const covered = COVERED_STATES.some(([c]) => c === st);
        ui.focusAfter = "[data-state-select]"; // QA-042: focus stays on the state selector
        go("#/search?" + toQuery({ ...base(), near: covered ? (aptState(near) === st ? near : STATE_HOME[st]) : "", st: covered ? "" : st })); // QA-049: no stale near on the outside panel
        return;
      }
      if (txt != null && String(txt).trim() !== "") {
        const r = resolveAirport(txt);
        if (!r) {
          const m = String(txt).trim().toUpperCase().match(/,\s*([A-Z]{2})$/);
          if (m && US_STATES[m[1]] && !COVERED_STATES.some(([c]) => c === m[1])) { go("#/search?" + toQuery({ ...base(), st: m[1] })); return; }
          { const os = outsideStateFor(txt); if (os) { go("#/search?" + toQuery({ ...base(), st: os })); return; } } // QA-049
          { const inp = f.querySelector('[name="nearText"]'); if (inp) { inp.setAttribute("aria-invalid", "true"); inp.focus(); } }
          toast(`We couldn\u2019t find "${String(txt).slice(0, 40)}". Try the airport code (like KORL) or a nearby city.`); return;
        }
        near = r;
      } else if (txt != null) { toast("Add your airport to see examiners near you."); return; }
      go("#/search?" + toQuery({ ...base(), near }));
    },
    retest: (f, fd, t) => {
      const raw = String(fd.get("p") ?? "").trim(), v = Number(raw), c = f.dataset.cert;
      if (!certById(c) || raw === "" || !Number.isFinite(v) || v < 0 || v > 0.6) return; // QA-047: "" is not 0
      S.retestP = { ...(S.retestP || {}), [c]: v }; save();
      const id = (t && t.id) || (document.activeElement && document.activeElement.id);
      rerender();
      if (id) { const el = document.getElementById(id); if (el) el.focus({ preventScroll: true }); }
      toast(v <= 0 ? `Retest risk left out of ${certById(c).short} estimates (stored in this browser).` : `Retest chance set to ${oneIn(v).toLowerCase()} for ${certById(c).short} estimates (stored in this browser).`); // QA-048
    },
    allin: (f, fd) => go("#/dpe/" + f.dataset.dpe + "?" + toQuery({ cert: fd.get("cert"), near: fd.get("near") })),
    compare: (f, fd) => go("#/compare?" + toQuery({ cert: fd.get("cert"), near: fd.get("near"), radius: fd.get("radius") })),
    alert: (f, fd) => addAlert({ cert: fd.get("cert"), near: fd.get("near"), radius: +fd.get("radius"), before: fd.get("before") || "", maxFee: +fd.get("maxFee") || 0, dpeId: fd.get("dpeId") || "" }),
    "dpe-fees": (f, fd) => {
      const dp = dpeById(S.actingDpe) || D.dpes[0];
      const num = (k, lo, hi) => { const raw = String(fd.get(k) ?? "").trim(); if (raw === "") return null; const v = Number(raw); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : null; };
      const fees = {}; Object.keys(dp.fees).forEach((c) => { const v = num("fee-" + c, 100, 5000); if (v) fees[c] = v; });
      const txt = (k, fb) => String(fd.get(k) || "").trim().slice(0, 300) || fb;
      S.dpeEdits = S.dpeEdits || {};
      S.dpeEdits[dp.id] = { fees, depositUsd: num("depositUsd", 0, 2000), depositTerms: txt("depositTerms", depTerms(dp)), travelNm: num("travelNm", 0, 500) ?? dp.travelNm, travelFee: num("travelFee", 0, 2000) ?? dp.travelFee, retestFee: num("retestFee", 0, 5000) ?? dp.retestFee, cancellation: txt("cancellation", dp.cancellation) };
      applyDpeEdits();
      toast("Fees & policies saved in this browser (mock). Your public profile, search, compare and new requests now show them. Nothing was sent.");
      rerender();
    },
    "dpe-cancel": (f, fd) => {
      const s = S.slots.find((x) => x.id === fd.get("slot"));
      const b = s && S.bookings.find((x) => x.id === s.bookingId);
      const reason = fd.get("reason");
      if (!reason) { toast("Choose who\u2019s cancelling first."); return; }
      if (!b || b.status !== "confirmed") { closeModal(); rerender(); return; }
      const dp = dpeById(b.dpeId), now = Date.now(), ms = slotStart(s) - now, note = String(fd.get("note") || "").trim().slice(0, 200);
      const by = reason === "student" ? "student-via-dpe" : reason;
      b.cancel = { by, at: now, aheadMs: ms, note, fee: !FEES ? "none" : reason === "student" ? (ms >= H48 ? "credited" : "kept") : "pending" };
      if (b.mine) S.notifications.unshift(cancelNotice(b, s, dp));
      setBookingState(b, "cancelled");
      closeModal();
      toast(`Cancelled. ${first(b.applicant)} has been told (in-app, mock).`);
      // The cancelled student never gets an "opening" alert for their own slot (UF#1); other matching alerts still run.
      fireAlerts(s, "cancel", { skipMine: !!b.mine, quiet: true });
      rerender();
    },
    request: (f, fd) => {
      const s = S.slots.find((x) => x.id === fd.get("slot"));
      // QA-006: a rapid second submit of the same form is ignored; it is our own request, not someone else's.
      if (ui.reqLock && Date.now() < ui.reqLock) return;
      const own = s.bookingId && S.bookings.find((x) => x.id === s.bookingId && x.mine && Date.now() - x.createdAt < 5000);
      if (own) { closeModal(); return; }
      if (s.status !== "open") { closeModal(); toast("Sorry, someone else just requested that slot."); rerender(); return; }
      if (slotPast(s)) { closeModal(); toast(PAST_SLOT, "crit"); staleFocus(); rerender(); return; } // QA-039: the start time has passed; QA-053: focus lands on the message
      const gate = showGate(f, true);
      if (gate.block.length) { toast("Readiness check: confirm the remaining items before submitting (mock, self-attested)."); $("#req-gate").scrollIntoView({ block: "nearest" }); $("#req-gate").setAttribute("tabindex", "-1"); $("#req-gate").focus(); return; }
      if (isStale(s.dpeId)) { closeModal(); toast("This examiner has not confirmed their availability recently. Contact the examiner."); rerender(); return; }
      const cert = fd.get("cert");
      const dpx = dpeById(s.dpeId);
      const b = { id: uid("b"), slotId: s.id, dpeId: s.dpeId, applicant: fd.get("name").trim() || "Alex Pilot", mine: true, cert, aircraft: fd.get("aircraft").trim(), cfi: fd.get("cfi").trim(), readiness: checklistPct(cert), selfCheck: { attested: true, by: "student", warnings: gate.warn.length, warn: gate.warn, answers: { ...answersFromForm(f), iacra: true }, ktDate: fd.get("kt-date") || "", hours: Object.fromEntries([...fd.entries()].filter(([k]) => k.startsWith("h-")).map(([k, v]) => [k.slice(2), +v])) }, status: "requested", createdAt: Date.now(), feeUsd: dpx.fees[cert], depositUsd: depositFor(dpx, cert), bookingFeeUsd: BOOKING_FEE };
      const note = (fd.get("note") || "").trim(); if (note) b.note = note;
      b.near = fd.get("near") || "KORL";
      if (s.simulated) b.simulated = true;
      if (parseHash().q.slot === s.id) b.fromAlert = true;
      S.bookings.push(b);
      ui.reqLock = Date.now() + 1500; { const sb = f.querySelector('button[type="submit"]'); if (sb) sb.disabled = true; }
      s.status = "held"; s.bookingId = b.id;
      S.notifications.forEach((n) => { if (n.slotId === s.id) n.read = true; });
      closeModal();
      // D38 #3 (wl.offer.booked_toast / _nohold): hold ends at min(sent + 48 h, slot − 12 h), in the airport's zone; none inside 12 h.
      const hEnd = holdEnd(b, s), fn = first(dpx.name);
      toast(hEnd
        ? `Request sent to ${dpx.name} for ${slotAt(s)}. We\u2019re holding the slot for you while ${fn} reviews it, for up to 48 hours (until ${tsWhen(hEnd, slotTz(s))}). It becomes a confirmed checkride once ${fn} accepts. We\u2019ll let you know here.`
        : `Request sent to ${dpx.name} for ${slotAt(s)}. This one starts in less than 12 hours, so there\u2019s no hold: first to be accepted gets it. We\u2019ll let you know here.`);
      go("#/request/" + b.id);
    },
    "cl-add": (f, fd) => {
      const c = S.curated[fd.get("bid")]; const t = fd.get("t").trim(); if (!t) return;
      c.items.push({ id: uid("i"), t, n: "" }); rerender();
      const last = $("#cl-items .cl-row:last-child input"); if (last) last.scrollIntoView({ block: "nearest" });
    },
    avail: (f, fd) => {
      // C (Marlo): guard against a double submit of the weekly pattern.
      if (ui.availLock && Date.now() < ui.availLock) return;
      ui.availLock = Date.now() + 1200;
      { const sb = $("#avail-save"); if (sb) { sb.disabled = true; setTimeout(() => { const x = $("#avail-save"); if (x) x.disabled = false; }, 1200); } }
      const dp = dpeById(S.actingDpe);
      const days = [...f.querySelectorAll("[data-date]")].map((r) => { const d = r.dataset.date; return { date: d, open: fd.get("open-" + d) === "on", cap: Number(fd.get("cap-" + d)) || 1, time: fd.get("time-" + d) || "08:00", airport: fd.get("airport-" + d) || dp.home, note: String(fd.get("note-" + d) || "").trim().slice(0, 80) }; });
      const r = applyAvailability(dp, days);
      touchAvail(dp.id);
      const bits = [];
      if (r.created.length) bits.push(`${plural(r.created.length, "new slot")} published`);
      if (r.updated) bits.push(`${plural(r.updated, "opening")} updated`);
      if (r.removed) bits.push(`${plural(r.removed, "opening")} removed`);
      if (r.closedDays) bits.push(`${plural(r.closedDays, "day")} closed`);
      if (r.keptDays) bits.push(`${plural(r.keptDays, "day")} kept open because of requests or bookings`);
      if (r.skipped) bits.push(`${plural(r.skipped, "opening")} already published, skipped`);
      if (r.oneOffs) bits.push(`${plural(r.oneOffs, "one-off opening")} left as published`);
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
      // QA-008: a double-click / double-submit right after a publish is ignored (one toast); the button is disabled meanwhile.
      if (ui.publishLock && Date.now() < ui.publishLock) return;
      const certs = fd.getAll("certs");
      if (!certs.length) { toast("Pick at least one certificate."); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fd.get("date") || "") || fd.get("date") <= todayIn(aptTz(fd.get("airport")))) { toast("Pick a date after today at that airport."); return; }
      const date = fd.get("date"), time = fd.get("time");
      const lock = () => {
        ui.publishLock = Date.now() + 1200;
        const btn = () => $("#publish-submit");
        if (btn()) { btn().disabled = true; btn().setAttribute("aria-disabled", "true"); }
        setTimeout(() => { ui.publishLock = 0; const b = btn(); if (b) { b.disabled = false; b.removeAttribute("aria-disabled"); } }, 1200);
      };
      const focusItem = (id) => { const e = document.getElementById("pub-" + id) || $("#app h1"); if (e) { if (!e.hasAttribute("tabindex")) e.setAttribute("tabindex", "-1"); e.scrollIntoView({ block: "nearest" }); e.focus({ preventScroll: true }); } };
      // QA-008: the same examiner can't publish the same date and start time twice (any status except removed).
      const dup = S.slots.find((x) => x.dpeId === S.actingDpe && x.date === date && x.time === time && x.status !== "removed");
      if (dup) {
        ui.pubHighlight = { id: dup.id, dup: true };
        rerender(); lock();
        toast(`Already published. You have an opening on ${slotWhenLong(dup)} at ${dup.airport}, so nothing new was added.`);
        focusItem(dup.id);
        return;
      }
      const s = { id: uid("s"), dpeId: S.actingDpe, date, time, airport: fd.get("airport"), certs, status: "open", bookingId: null, src: "oneoff" };
      S.slots.push(s);
      touchAvail(S.actingDpe);
      fireAlerts(s, "new");
      ui.pubHighlight = { id: s.id, dup: false };
      rerender(); lock();
      focusItem(s.id); // QA-035: focus moves to the new item, never to <body>
    },
  };

  // ---------- event wiring ----------
  Object.assign(actions, V4_ACTIONS); Object.assign(forms, V4_FORMS); // v4
  document.addEventListener("click", (e) => {
    const sk = e.target.closest && e.target.closest(".skip-link");
    if (sk) { e.preventDefault(); const m = $("#app"); if (m) m.focus(); return; }
    const el = e.target.closest("[data-action]");
    if (!el || !actions[el.dataset.action]) return;
    const passThrough = actions[el.dataset.action](el, e);
    if (passThrough !== true && (el.tagName === "A" || el.tagName === "BUTTON")) e.preventDefault();
  });
  // QA-071: measure the sticky Request bar into --bar-h (used by scroll-padding / scroll-margin), and tuck the bar away while
  // its card is still below the fixed tab bar so it is never drawn under #nav.
  function barFit() {
    const b = document.getElementById("v4-bar"), root = document.documentElement;
    if (!b) { root.style.setProperty("--bar-h", "0px"); return; }
    root.style.setProperty("--bar-h", b.offsetHeight + "px");
    const n = document.getElementById("nav");
    let tuck = false;
    if (n && !n.hidden && getComputedStyle(n).position === "fixed") {
      const q = n.getBoundingClientRect();
      if (q.height && q.top > window.innerHeight / 2) { const r = b.getBoundingClientRect(); tuck = r.bottom > q.top + 0.5 && r.top < window.innerHeight; }
    }
    // A focused control inside the bar is never hidden: scroll it clear of the tab bar instead.
    if (tuck && b.contains(document.activeElement)) { const q = n.getBoundingClientRect(), r = b.getBoundingClientRect(); window.scrollBy({ top: r.bottom - q.top + 8, behavior: "auto" }); tuck = false; }
    if (b.classList.contains("is-tucked") !== tuck) b.classList.toggle("is-tucked", tuck);
  }
  window.CC_BAR_FIT = barFit;
  { let raf = 0; const kick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; barFit(); }); };
    window.addEventListener("scroll", kick, { passive: true }); window.addEventListener("resize", kick); }
  // QA-034: a keyboard-focused control that lands under the fixed mobile tab bar is scrolled clear of it
  // (backs up the CSS scroll-padding / scroll-margin; some engines treat a 2 px sliver as "visible" and don't scroll).
  document.addEventListener("focusin", (e) => {
    const t = e.target, bar = document.getElementById("nav");
    if (!t || !t.getBoundingClientRect || t.closest("#nav, #modal-root, #toasts")) return;
    // Keyboard focus only (:focus-visible): a tap or click must not scroll the page out from under the pointer.
    try { if (!t.matches(":focus-visible")) return; } catch (err) { /* old engines: fall through */ }
    barFit();
    // Obstructions at the bottom of the viewport: the fixed mobile tab bar (QA-034) and the sticky Request bar (QA-071).
    let top = window.innerHeight;
    if (bar && !bar.hidden && getComputedStyle(bar).position === "fixed") { const br = bar.getBoundingClientRect(); if (br.height && br.top < window.innerHeight && br.top >= window.innerHeight / 2 && br.bottom >= window.innerHeight - 4) top = Math.min(top, br.top); }
    const vb = document.getElementById("v4-bar");
    if (vb && !vb.contains(t) && !vb.classList.contains("is-tucked")) { const r2 = vb.getBoundingClientRect(); if (r2.height && r2.top < window.innerHeight && r2.top > window.innerHeight / 3) top = Math.min(top, r2.top); }
    if (top >= window.innerHeight) return;
    const r = t.getBoundingClientRect();
    if (r.bottom > top - 8 && r.top < window.innerHeight) { window.scrollBy({ top: r.bottom - top + 16, behavior: "auto" }); barFit(); }
  });

  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (!f.dataset.form || !forms[f.dataset.form]) return;
    e.preventDefault();
    forms[f.dataset.form](f, new FormData(f));
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.hasAttribute && t.hasAttribute("data-signup-role")) { const nm = ($("#signup-name") || {}).value || ""; ui.signupRole = t.value; render(); const n2 = $("#signup-name"); if (n2) n2.value = nm; const r2 = document.querySelector(`[data-signup-role][value="${t.value}"]`); if (r2) r2.focus(); return; }
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
    if (t.dataset.actionChange === "theme") { applyTheme(t.value); return; }
    if (t.dataset.actionChange === "role") { S.role = t.value; go(HOME[S.role]); return; }
    if (t.dataset.med) {
      S.medical = S.medical || {};
      if (t.dataset.med === "type") { S.medical.type = t.value; if (!t.value || t.value === "unsure") S.medical.date = ""; }
      else {
        S.medical.date = t.value;
        // D8/D13: an in-app reminder 60 days before the date as entered (once per date). Never blocks.
        const o = MED_OPTS.find((x) => x[0] === S.medical.type);
        S.medical.reminded = S.medical.reminded || {};
        if (t.value && o && medDaysLeft(t.value) <= 60 && !S.medical.reminded[t.value]) {
          S.medical.reminded[t.value] = 1;
          S.notifications.unshift({ id: uid("n"), ts: Date.now(), read: false, title: "Heads-up", body: `Your ${o[1]} is valid through ${fmtDateY(t.value)} (as you entered it).` });
        }
      }
      save(); rerender(); const back = $(t.dataset.med === "type" ? "#med-type" : "#med-date"); if (back) back.focus(); return;
    }
    if (t.dataset.r9date) { S.ready9Dates = S.ready9Dates || {}; S.ready9Dates[t.dataset.r9date] = t.value; if (t.dataset.r9date === "kt") S.ktSample = false; save(); rerender(); return; }
    if (t.dataset.r9) { S.ready9 = S.ready9 || {}; S.ready9[t.dataset.r9] = t.checked; save(); rerender(); return; }
    if (t.dataset.actionChange === "acting-dpe") { S.actingDpe = t.value; rerender(); return; }
    if (t.dataset.actionChange === "req-cert") {
      const s = S.slots.find((x) => x.id === t.form.slot.value);
      const dp = dpeById(s.dpeId);
      $("#req-summary").innerHTML = requestSummary(dp, t.value, s); // QA-009: keep the slot's all-in
      $("#req-check").outerHTML = readinessFields(t.value);
      showGate(t.form);
      $("#req-ready").innerHTML = `Your <a href="#/checklists/${t.value}" data-action="close-modal">${esc(certById(t.value).short)} checklist</a>: <b>${(() => { const k = checklistCount(t.value); return readyText(k.n, k.total); })()}</b>. The examiner will see this.`;
      return;
    }
    // QA-042: a keyboard change of the state selector doesn't navigate at once; Enter or leaving the field applies it.
    if (t.matches && t.matches("[data-state-select]") && t.dataset.kbd === "1") { t.dataset.pending = "1"; return; }
    const f = t.form;
    if (f && f.dataset.auto !== undefined && forms[f.dataset.form]) forms[f.dataset.form](f, new FormData(f), t);
  });
  const applyState = (sel, nextSel) => { delete sel.dataset.pending; forms.search(sel.form, new FormData(sel.form), sel); if (nextSel) ui.focusAfter = nextSel; };
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (!t.matches || !t.matches("[data-state-select]")) return;
    if (e.key === "Enter") { if (t.dataset.pending === "1") { e.preventDefault(); applyState(t); } return; }
    if (e.key !== "Tab" && e.key !== "Escape") t.dataset.kbd = "1";
  });
  document.addEventListener("pointerdown", (e) => { const t = e.target; if (t.matches && t.matches("[data-state-select]")) delete t.dataset.kbd; });
  document.addEventListener("focusout", (e) => {
    const t = e.target;
    if (!t.matches || !t.matches("[data-state-select]") || t.dataset.pending !== "1") return;
    const r = e.relatedTarget, nextSel = r ? (r.id ? "#" + CSS.escape(r.id) : r.name && r.form ? `[data-form="${r.form.dataset.form}"] [name="${r.name}"]` : null) : null;
    setTimeout(() => { if (document.contains(t)) applyState(t, nextSel); }, 0);
  });
  // Builder inputs autosave without re-rendering (keeps focus while typing).
  document.addEventListener("input", (e) => {
    if (e.target.form && (e.target.form.dataset.form === "request" || e.target.form.dataset.form === "cohort-ready") && e.target.name !== "cert") showGate(e.target.form);
    const t = e.target;
    if (t.form && t.form.id === "dpe-fees-form") {
      // Live preview of the public profile while the examiner types (nothing saved until submit).
      const m = /^fee-(.+)$/.exec(t.name || ""); const v = Number(t.value);
      if (m) { const cell = $(`#fees-preview [data-preview-fee="${m[1]}"]`); if (cell && Number.isFinite(v) && v > 0) cell.textContent = money(v); }
      if (t.name === "depositTerms") { const q = $("#fees-preview [data-preview-terms]"); if (q) q.textContent = t.value.trim() || "\u2026"; }
      return;
    }
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
  // BRAND_LOGO: keep the static header lockups in step with the one constant.
  document.querySelectorAll(".brand img.lockup-light, .brand img.lockup-dark").forEach((im) => { const v = im.classList.contains("lockup-dark") ? BRAND_LOGO.dark : BRAND_LOGO.light; if (im.getAttribute("src") !== v) im.setAttribute("src", v); });
  window.addEventListener("hashchange", () => { closeModal(); render(); });

  // Offline banner: the app keeps working from the SW cache; nothing is ever sent, online or not.
  let netTimer;
  function netStatus(e) {
    let el = $("#net-status");
    if (!el) {
      el = document.createElement("div"); el.id = "net-status"; el.className = "net-banner"; el.setAttribute("role", "status"); el.hidden = true;
      const anchor = $("#demo-date") || $(".proto-banner"); anchor.after(el);
    }
    clearTimeout(netTimer);
    if (navigator.onLine === false) {
      el.className = "net-banner off"; el.hidden = false;
      el.innerHTML = `<b>You\u2019re offline.</b> <span>The prototype keeps working from the copy saved on this device. Your changes stay in this browser.</span>`;
    } else if (e && e.type === "online") {
      el.className = "net-banner on"; el.hidden = false; el.innerHTML = "<b>Back online.</b>";
      netTimer = setTimeout(() => { el.hidden = true; }, 3000);
    } else el.hidden = true;
  }
  window.addEventListener("offline", netStatus); window.addEventListener("online", netStatus);
  // Lets :active press feedback show on iOS Safari.
  document.addEventListener("touchstart", () => {}, { passive: true });

  render();
  netStatus();
  window.CC_APP_READY = true;

  // QA-039 staleness re-check (v4). Every 60 s, and when the tab regains focus or becomes visible, look for open slots
  // whose start instant (airport zone) has passed since the last check. If any did, re-render so lists, pickers and
  // the sticky Request bar drop them. Never re-render under an open modal or while the user is typing; an open request
  // form gets an inline note instead, and Request / submit re-validate (openRequest and forms.request use PAST_SLOT).
  let liveCheckAt = Date.now(), staleDue = false;
  function staleRecheck() {
    const now = Date.now(), from = liveCheckAt; liveCheckAt = now;
    if (S.slots.some((x) => x.status === "open" && (() => { const t = slotStart(x); return t > from && t <= now; })())) staleDue = true;
    const reqF = $("#modal-root form[data-form=request]");
    if (reqF) {
      const sl = S.slots.find((x) => x.id === (reqF.elements.slot && reqF.elements.slot.value));
      if (sl && slotPast(sl) && !$("#req-started")) { reqF.noValidate = true; reqF.insertAdjacentHTML("afterbegin", `<p class="warn-note small" id="req-started" role="alert">${esc(PAST_SLOT)}</p>`); }
    }
    if (!staleDue || $("#modal-root .modal-bg")) return false;
    const a = document.activeElement;
    if (a && a.closest && a.closest("form") && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== "radio" && a.type !== "checkbox") return false;
    staleDue = false; render(); return true;
  }
  // QA-020: the Main nav is a left rail at >= 1024 px (visually before the page) and a bottom tab bar below that
  // (visually after the page and footer). Keep its DOM position in step so Tab follows the visual order; no tabindex.
  (function navOrder() {
    const mq = window.matchMedia("(min-width: 1024px)");
    const place = () => { const nav = $("#nav"), main = $("#app"), foot = $("footer.footer"); if (!nav || !main || !foot) return;
      if (mq.matches) { if (nav.nextElementSibling !== main) main.before(nav); } else if (foot.nextElementSibling !== nav) foot.after(nav); };
    place(); if (mq.addEventListener) mq.addEventListener("change", place); else if (mq.addListener) mq.addListener(place);
  })();
  window.CC_STALE_RECHECK = staleRecheck; // test hook (mocked clock)
  window.CC_ONE_IN = oneIn; // test hook (QA-047 labels)
  setInterval(staleRecheck, 60000);
  window.addEventListener("focus", staleRecheck);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") staleRecheck(); });

  // Brand fonts after first paint: load all three faces, then switch them on in one swap (html.wf). Remembered per device.
  (function brandFonts() {
    const html = document.documentElement;
    if (html.classList.contains("wf") || !document.fonts || !document.fonts.load) { html.classList.add("wf"); return; }
    const go = () => Promise.all(['800 1em "Manrope"', '700 1em "Manrope"', '400 1em "Geist"', '400 1em "Geist Mono"'].map((f) => document.fonts.load(f)))
      .then(() => { html.classList.add("wf"); try { localStorage.setItem("cc-wf", "1"); } catch (e) {} })
      .catch(() => html.classList.add("wf"));
    const later = () => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(go, 0)));
    if (document.readyState === "complete") later(); else window.addEventListener("load", later, { once: true });
  })();
})();
