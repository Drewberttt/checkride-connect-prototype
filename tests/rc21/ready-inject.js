/** Shared ready-card / F03 state injection for rc21 audits and tests. */
const READY_STATES = ["not_started", "progress", "review", "ready", "due", "past", "passed"];

function liveKey() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("cc-connect-proto-v3"))
    .sort((a, b) => b.length - a.length)[0] || "cc-connect-proto-v3";
}

function applyReadyState(s, state) {
  const ids = ["kt", "exp", "end", "med", "iacra", "docs", "id", "terms", "prep"];
  const n = (state === "not_started" || state === "due" || state === "past") ? 0 : (state === "progress" ? 6 : 9);
  const items = {};
  ids.forEach((id, i) => { if (i < n) items[id] = true; });
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t).value;
  const today = `${g("year")}-${g("month")}-${g("day")}`;
  const [Y, M, D] = today.split("-").map(Number);
  const add = (off) => new Date(Date.UTC(Y, M - 1, D + off)).toISOString().slice(0, 10);
  s.v = 3;
  s.role = "pilot";
  s.demoUser = Object.assign({}, s.demoUser, { name: (s.demoUser && s.demoUser.name) || "Example", role: "pilot", goal: "ppl", airport: (s.demoUser && s.demoUser.airport) || "XNC01" });
  s.readinessCert = "ppl";
  s.ready9 = { ppl: Object.assign({}, items) };
  s.ready9Dates = { ppl: {} };
  s.ready9CfiReviewed = { ppl: state === "ready" };
  s.ktSample = false;
  if (s.target == null) s.target = "";
  if (!Array.isArray(s.slots)) s.slots = [];
  if (!Array.isArray(s.bookings)) s.bookings = [];
  s.slots = s.slots.filter((x) => !String(x.id || "").startsWith("slotready") && !String(x.id || "").startsWith("slotpast") && !String(x.id || "").startsWith("slotpass") && !String(x.id || "").startsWith("slotdue"));
  s.bookings = (s.bookings || []).filter((b) => !b.mine || (!String(b.id || "").startsWith("bkready") && !String(b.id || "").startsWith("bkpast") && !String(b.id || "").startsWith("bkpass") && !String(b.id || "").startsWith("bkdue")));
  if (state === "due") {
    const ride = add(3);
    s.target = "";
    s.slots.push({ id: "slotdue", dpeId: "d5", date: ride, time: "09:00", airport: "XNC01", status: "booked", certs: ["ppl"], bookingId: "bkdue" });
    s.bookings.push({ id: "bkdue", slotId: "slotdue", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, applicant: "Example", createdAt: Date.now() });
  }
  if (state === "past") {
    const yday = add(-1);
    s.slots.push({ id: "slotpast", dpeId: "d5", date: yday, time: "09:00", airport: "XNC08", status: "booked", certs: ["ppl"], bookingId: "bkpast" });
    s.bookings.push({ id: "bkpast", slotId: "slotpast", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, applicant: "Example", createdAt: Date.now() - 864e5 });
  }
  if (state === "passed") {
    const yday = add(-1);
    s.slots.push({ id: "slotpass", dpeId: "d5", date: yday, time: "09:00", airport: "XNC08", status: "booked", certs: ["ppl"], bookingId: "bkpass" });
    s.bookings.push({ id: "bkpass", slotId: "slotpass", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, outcome: "pass", outcomeAt: Date.now(), applicant: "Example", createdAt: Date.now() - 864e5 });
  }
  return s;
}

async function injectReadyState(page, state) {
  await page.evaluate((state) => {
    const ids = ["kt", "exp", "end", "med", "iacra", "docs", "id", "terms", "prep"];
    const apply = (s, st) => {
      const n = (st === "not_started" || st === "due" || st === "past") ? 0 : (st === "progress" ? 6 : 9);
      const items = {};
      ids.forEach((id, i) => { if (i < n) items[id] = true; });
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const g = (t) => parts.find((p) => p.type === t).value;
      const today = `${g("year")}-${g("month")}-${g("day")}`;
      const [Y, M, D] = today.split("-").map(Number);
      const add = (off) => new Date(Date.UTC(Y, M - 1, D + off)).toISOString().slice(0, 10);
      s.v = 3;
      s.role = "pilot";
      s.demoUser = Object.assign({}, s.demoUser, { name: (s.demoUser && s.demoUser.name) || "Example", role: "pilot", goal: "ppl", airport: (s.demoUser && s.demoUser.airport) || "XNC01" });
      s.readinessCert = "ppl";
      s.ready9 = { ppl: Object.assign({}, items) };
      s.ready9Dates = { ppl: {} };
      s.ready9CfiReviewed = { ppl: st === "ready" };
      s.ktSample = false;
      if (s.target == null) s.target = "";
      if (!Array.isArray(s.slots)) s.slots = [];
      if (!Array.isArray(s.bookings)) s.bookings = [];
      s.slots = s.slots.filter((x) => !String(x.id || "").startsWith("slotready") && !String(x.id || "").startsWith("slotpast") && !String(x.id || "").startsWith("slotpass") && !String(x.id || "").startsWith("slotdue"));
      s.bookings = (s.bookings || []).filter((b) => !b.mine || (!String(b.id || "").startsWith("bkready") && !String(b.id || "").startsWith("bkpast") && !String(b.id || "").startsWith("bkpass") && !String(b.id || "").startsWith("bkdue")));
      if (st === "due") {
        const ride = add(3);
        s.target = "";
        s.slots.push({ id: "slotdue", dpeId: "d5", date: ride, time: "09:00", airport: "XNC01", status: "booked", certs: ["ppl"], bookingId: "bkdue" });
        s.bookings.push({ id: "bkdue", slotId: "slotdue", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, applicant: "Example", createdAt: Date.now() });
      }
      if (st === "past") {
        const yday = add(-1);
        s.slots.push({ id: "slotpast", dpeId: "d5", date: yday, time: "09:00", airport: "XNC08", status: "booked", certs: ["ppl"], bookingId: "bkpast" });
        s.bookings.push({ id: "bkpast", slotId: "slotpast", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, applicant: "Example", createdAt: Date.now() - 864e5 });
      }
      if (st === "passed") {
        const yday = add(-1);
        s.slots.push({ id: "slotpass", dpeId: "d5", date: yday, time: "09:00", airport: "XNC08", status: "booked", certs: ["ppl"], bookingId: "bkpass" });
        s.bookings.push({ id: "bkpass", slotId: "slotpass", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, outcome: "pass", outcomeAt: Date.now(), applicant: "Example", createdAt: Date.now() - 864e5 });
      }
    };
    if (window.CC_WK && typeof window.CC_WK.mutate === "function") {
      window.CC_WK.mutate((S) => apply(S, state));
      return "mutate";
    }
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("cc-connect-proto-v3"));
    if (!keys.length) keys.push("cc-connect-proto-v3");
    for (const key of keys) {
      let s = {};
      try { s = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) { s = {}; }
      apply(s, state);
      localStorage.setItem(key, JSON.stringify(s));
    }
    return "storage";
  }, state);
}

module.exports = { injectReadyState, READY_STATES };
