/* Eligibility clock, Rules 5 and 6 (eligibility-rules.md v2.1; port of tools/eligibility_clock_reference.py).
   Informational only: warn, never block (decision #18, canBook is always true). Dates are local document dates
   "YYYY-MM-DD" with no time zone (ER §0 / flag #13); a planned test is an exact date or a month "YYYY-MM".
   Status model (ER §0, v2.1): ok · warn/fails (needs the "My CFI has reviewed this" tick, DPE flag) ·
   needs-check (note "Confirm this with your CFI.", no tick, DPE "to verify").
   Where the doc and the reference differed, this file followed the doc; D42 (Mon Nov 2, 2026) brought the reference into line (see DOC_VS_REF). No dependencies, no network. */
(function (root) {
  "use strict";
  // ---- calendar helpers (ER §0): integer month index, date-only strings, inclusive bounds
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const parts = (s) => s.split("-").map(Number);
  const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthIndex = (s) => { const [y, m] = parts(s); return y * 12 + (m - 1); };
  const miYM = (mi) => [Math.floor(mi / 12), (mi % 12 + 12) % 12 + 1];
  const firstOfMi = (mi) => { const [y, m] = miYM(mi); return ymd(y, m, 1); };
  const endOfMi = (mi) => { const [y, m] = miYM(mi); return ymd(y, m, dim(y, m)); };
  const endOfMonthAfter = (s, n) => endOfMi(monthIndex(s) + n);
  const startOfMonthBefore = (s, n) => firstOfMi(monthIndex(s) - n);
  const sameDayMonthsBefore = (s, n) => { const [y, m] = miYM(monthIndex(s) - n), d = parts(s)[2]; return ymd(y, m, Math.min(d, dim(y, m))); };
  const addDays = (s, n) => { const [y, m, d] = parts(s); const t = new Date(Date.UTC(y, m - 1, d + n)); return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); };
  const isYmd = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && (() => { const [y, m, d] = parts(s); return m >= 1 && m <= 12 && d >= 1 && d <= dim(y, m); })();
  const isYm = (s) => typeof s === "string" && /^\d{4}-\d{2}$/.test(s) && +s.slice(5) >= 1 && +s.slice(5) <= 12;
  // Planned: an exact date, or a month only.
  function planned(v) {
    if (isYmd(v)) return { exact: v, first: v, last: v, mi: monthIndex(v) };
    if (isYm(v)) { const mi = monthIndex(v + "-01"); return { exact: null, first: firstOfMi(mi), last: endOfMi(mi), mi }; }
    throw new Error("planned date must be YYYY-MM-DD or YYYY-MM: " + v);
  }
  const position = (deadline, p) => (p.last <= deadline ? "in" : p.first > deadline ? "out" : "partial");
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = (s) => MONTH_NAMES[parts(s)[1] - 1];
  const monthYear = (p) => `${monthName(p.first)} ${parts(p.first)[0]}`;
  // rc5 (QA-091): shown figures round DOWN to 0.01 so a short total never reads as the full amount (2.996 -> "2.99").
  const num = (x) => String(Math.floor(x * 100 + 1e-7) / 100);

  const OK = "ok", WARN = "warn", CHECK = "needs-check";
  const CFI_NOTE = "Confirm this with your CFI."; // ux-copy-v3 clock.needs_check.note (D32, v2.1)
  const ASK = "Ask your CFI to review this."; // ER §0: every warn/fails message ends with this
  function result(rule, status, reason, key, message, extra) {
    return Object.assign({ rule, status, reason, key, message, cite: "", deadline: null, verify: [],
      cfiAckRequired: status === WARN && reason === "fails", // the tick: warn/fails only (v2.1)
      cfiNote: status === CHECK ? CFI_NOTE : null, // needs-check: the note, never the tick (v2.1)
      dpeFlag: status === CHECK || (status === WARN && reason === "fails") }, extra || {});
  }

  // ---- Rule 5: practical-test prep (ER §5). key -> [amount, unit, anchor, cite]
  const PREP_RULES = {
    "private-asel": [3, "hours", "test-month", "61.109(a)(4)"], "private-amel": [3, "hours", "test-month", "61.109(b)(4)"],
    "private-helicopter": [3, "hours", "test-month", "61.109(c)(3)"], "private-gyroplane": [3, "hours", "test-month", "61.109(d)(3)"],
    "private-powered-lift": [3, "hours", "test-month", "61.109(e)(4)"], "private-glider": [3, "flights", "test-month", "61.109(f)(1)(i)"],
    "private-glider-40h": [3, "flights", "test-month", "61.109(f)(2)(ii)"], "private-airship": [3, "hours", "test-month", "61.109(g)(3)"],
    "private-gas-balloon": [1, "flights", "test-month", "61.109(h)(1)(i)"], "private-hot-air-balloon": [2, "flights", "test-month", "61.109(h)(2)(i)"],
    "private-powered-parachute": [3, "hours", "test-month", "61.109(i)(3)"], "private-weight-shift": [3, "hours", "test-month", "61.109(j)(3)"],
    "commercial-asel": [3, "hours", "test-month", "61.129(a)(3)(v)"], "commercial-amel": [3, "hours", "test-month", "61.129(b)(3)(v)"],
    "commercial-helicopter": [3, "hours", "test-month", "61.129(c)(3)(iv)"], "commercial-gyroplane": [3, "hours", "test-month", "61.129(d)(3)(iv)"],
    "commercial-powered-lift": [3, "hours", "test-month", "61.129(e)(3)(iv)"], "commercial-glider": [3, "flights", "test-month", "61.129(f)(1)(i) / (f)(2)(i)"],
    "commercial-airship": [3, "hours", "test-month", "61.129(g)(4)(i)"], "commercial-gas-balloon": [2, "flights", "test-month", "61.129(h)(4)(i)(A)"],
    "commercial-hot-air-balloon": [2, "flights", "test-month", "61.129(h)(4)(ii)(A)"], "recreational": [3, "hours", "test-month", "61.99(a)(1)(ii)"],
    "sport-airplane": [2, "hours", "test-month", "61.313(a)(1)(iv)"], "sport-glider": [3, "flights", "test-month", "61.313(a)(2)(ii) / (a)(3)(ii)"],
    "sport-gyroplane": [2, "hours", "test-month", "61.313(a)(4)(iv)"], "sport-airship": [2, "hours", "test-month", "61.313(a)(5)(iv)"],
    "sport-balloon": [1, "hours", "test-month", "61.313(a)(6)(ii)"], "sport-powered-parachute": [1, "hours", "test-month", "61.313(a)(7)(v)"],
    "sport-weight-shift": [2, "hours", "test-month", "61.313(a)(8)(iv)"], "sport-helicopter": [2, "hours", "test-month", "61.313(a)(9)(iv)"],
    "instrument-airplane": [3, "hours", "test-date", "61.65(d)(2)(i)"], "instrument-helicopter": [3, "hours", "test-date", "61.65(e)(2)(i)"],
    "instrument-powered-lift": [3, "hours", "test-date", "61.65(f)(2)(i)"],
  };
  const NO_PREP_RULE = ["cfi", "cfi-instrument", "cfi-sport", "atp", "type-rating"];
  // entries: [{ date, hours, qualifies }] (qualifies = with an authorized instructor, in the aircraft, not a simulator/FTD, flag #16).
  // "flights" rules count qualifying entries.
  // rc5 (QA-091): the hours total is compared unrounded (only float noise below 1e-6 is removed), so 2.996 h < 3 h.
  // Hours outside 0 < h <= 24 (or not a number) are not counted; the app flags them on the field.
  const hoursOk = (h) => { const n = Number(h); return h !== null && h !== "" && Number.isFinite(n) && n > 0 && n <= 24; };
  const sumIn = (entries, start, end, unit) => { const sel = entries.filter((e) => e.qualifies !== false && e.date >= start && e.date <= end && (unit === "flights" || hoursOk(e.hours))); return unit === "flights" ? sel.length : Math.round(sel.reduce((a, e) => a + Number(e.hours), 0) * 1e6) / 1e6; };

  // o: { rating, entries (null = not entered), testStart, testEnd?, pathway ("part61"|"part141"), graduationDate?, addedClass, balloonToAirship, fmt? }
  function checkPrep(o) {
    const fmt = o.fmt || ((s) => s), R = "prep_3h";
    if (NO_PREP_RULE.includes(o.rating))
      return result(R, OK, "not-applicable", "clock.prep.na", "No timed practical-test prep requirement for this certificate. Your CFI\u2019s endorsement covers readiness.", { cite: "14 CFR 61.183(g), 61.157, 61.405 (endorsement only)" });
    const rule = PREP_RULES[o.rating]; if (!rule) throw new Error("unknown rating " + o.rating);
    const [amount, unit, anchor, c] = rule, cite = "14 CFR " + c, sect = "\u00a7" + c;
    const base = { cite, amount, unit, anchor, verify: anchor === "test-date" ? [3, 12, 15, 16] : [3, 15, 16] };
    if (o.addedClass && !o.balloonToAirship)
      return result(R, OK, "exempt", "clock.prep.exempt", "Not required when adding a class rating (\u00a761.63(c)(3)).", { ...base, cite: cite + "; 61.63(c)(3)", verify: [17] });
    // rc5 (QA U21): an empty list is "missing" like null (ER §5.6 L395 "if entries missing").
    const s = planned(o.testStart), e = planned(o.testEnd || o.testStart), entries = o.entries && o.entries.length ? o.entries : null;
    if (o.pathway === "part141" && o.graduationDate) {
      const gradDl = addDays(o.graduationDate, 60);
      if (position(gradDl, e) === "in") {
        const p141 = { ...base, cite: "14 CFR 61.71(a); Part 141 App. B/D 4(b)", deadline: gradDl, verify: [7, 18] };
        if (entries && s.exact) {
          const got = sumIn(entries, addDays(s.exact, -60), s.exact, unit);
          if (got >= amount) return result(R, OK, "part141-graduate", "clock.prep.p141_ok", `Part 141 graduate testing by ${fmt(gradDl)} (\u00a761.71(a)); ${num(got)} of ${amount} ${unit} of prep in the 60 days before the test.`, { ...p141, got });
        }
        return result(R, CHECK, "part141-graduate", "clock.prep.p141_check", `As a Part 141 graduate testing by ${fmt(gradDl)}, the Part 61 hour rules are treated as met (\u00a761.71(a)). Your school\u2019s course requires the prep training within 60 days before the test date. Your school can confirm.`, p141);
      } // after 60 days the Part 61 rule applies
    }
    if (!entries) return result(R, CHECK, "missing", "clock.prep.missing", `Log ${amount} ${unit} of practical-test prep with your instructor in your test month or the 2 calendar months before it.`, base);
    const win = (p) => sumIn(entries, firstOfMi(p.mi - 2), p.exact || p.last, unit); // month only: through the end of the target month
    const got = win(s), windowStart = firstOfMi(s.mi - 2), windowEnd = s.exact || s.last;
    const d = { ...base, got, windowStart, windowEnd };
    if (got < amount)
      return result(R, WARN, "fails", "clock.prep.fails", `You\u2019ve logged ${num(got)} of ${amount} ${unit} of practical-test prep with your instructor since ${fmt(windowStart)}. `
        + (anchor === "test-date" ? `The rule (${sect}) needs them within 2 calendar months before your test date. ` : `The rule (${sect}) needs them in your test month or the 2 calendar months before it. `) + ASK, d);
    if (e.mi !== s.mi) {
      const gotE = win(e);
      if (gotE < amount) return result(R, CHECK, "spans-months", "clock.prep.spans", `Your test starts in ${monthName(s.first)} and may finish in ${monthName(e.first)}. Counting from the finish month you\u2019d have ${num(gotE)} of ${amount} ${unit}. The rule doesn\u2019t say which month counts.`, { ...d, gotEnd: gotE, verify: [4, ...base.verify] });
    }
    if (anchor === "test-date" && s.exact) {
      const strictStart = sameDayMonthsBefore(s.exact, 2), strict = sumIn(entries, strictStart, s.exact, unit);
      if (strict < amount) return result(R, CHECK, "interpretation", "clock.prep.interpretation", `You have ${num(got)} ${unit} counting whole calendar months, but only ${num(strict)} counting from ${fmt(strictStart)} (2 months before the test date). The instrument rule says \u201cwithin 2 calendar months before the date of the practical test.\u201d`, { ...d, strict, strictStart });
    }
    if (!s.exact) return result(R, OK, "ok", "clock.prep.ok_month", `${num(got)} of ${amount} ${unit} of prep logged in the window for ${monthYear(s)} (${fmt(windowStart)} to ${fmt(windowEnd)}). Prep after the test date won\u2019t count.`, d);
    return result(R, OK, "ok", "clock.prep.ok", `${num(got)} of ${amount} ${unit} of practical-test prep logged in the window (${fmt(windowStart)} to ${fmt(windowEnd)}).`, d);
  }

  // ---- Rule 6: retest after a test you didn't pass (§61.49, ER §6). Order: fail -> training -> endorsement -> reapply.
  // o: { failureDate, endorsementDate (null = none), planned, endorserGaveTraining (true|false|null), has8710 (true|false|null),
  //      cfiSpinFailure, spinCertified (true|false|null), fmt? }
  function checkRetest(o) {
    const fmt = o.fmt || ((s) => s), R = "retest_61_49", cite = "14 CFR 61.49";
    const base = { cite, verify: [5] };
    if (!o.endorsementDate)
      return result(R, WARN, "fails", "clock.retest.no_endorsement", `After a test you didn\u2019t pass, you need more training and a new endorsement from the instructor who gave it before you reapply (\u00a761.49). ${ASK}`, base);
    if (o.endorsementDate < o.failureDate)
      return result(R, WARN, "fails", "clock.retest.before_failure", `Your retest endorsement (${fmt(o.endorsementDate)}) is dated before the test you didn\u2019t pass (${fmt(o.failureDate)}). \u00a761.49 needs one given after the additional training. ${ASK}`, base);
    const p = planned(o.planned);
    // Doc §6.2/6.4 + D42: endorsement <= reapplication on every plan. Month-only plan: compared with the last day of that month.
    if (o.endorsementDate > p.last)
      return result(R, WARN, "fails", "clock.retest.after_application", `Your retest endorsement (${fmt(o.endorsementDate)}) is dated after your planned application (${p.exact ? fmt(p.exact) : monthYear(p)}). You can reapply only after receiving it (\u00a761.49(a)). ${ASK}`, base);
    if (o.cfiSpinFailure && o.spinCertified === false)
      return result(R, WARN, "fails", "clock.retest.spin", `For this retest you\u2019ll likely need to bring an aircraft certificated for spins and demonstrate spin instruction (\u00a761.49(b)). ${ASK}`, { ...base, cite: cite + "(b)" });
    if (o.endorserGaveTraining === false)
      return result(R, WARN, "fails", "clock.retest.not_trainer", `Your endorsement needs to come from the instructor who gave you the additional training (\u00a761.49(a)(2)). ${ASK}`, { ...base, cite: cite + "(a)(2)" });
    if (o.has8710 === false)
      return result(R, WARN, "fails", "clock.retest.no_8710", `Each retake likely needs a new instructor recommendation on your application (AC 61-65K \u00a714.2). ${ASK}`, { ...base, cite: cite + "; AC 61-65K \u00a714.2" });
    const unknowns = [];
    if (o.endorserGaveTraining == null) unknowns.push("the endorsing instructor gave you the additional training");
    if (o.has8710 == null) unknowns.push("your application has a new instructor recommendation");
    if (o.cfiSpinFailure && o.spinCertified == null) unknowns.push("your aircraft is certificated for spins (\u00a761.49(b))");
    const sameDay = o.endorsementDate === o.failureDate, v = sameDay ? [5, 19] : [5];
    if (unknowns.length) return result(R, CHECK, "confirm", "clock.retest.confirm", "Please confirm: " + unknowns.join("; ") + ".", { ...base, verify: v, sameDay });
    return result(R, OK, "ok", "clock.retest.ok", `Retest endorsement recorded after the test you didn\u2019t pass (${fmt(o.failureDate)}; endorsed ${fmt(o.endorsementDate)}).`, { ...base, verify: v, sameDay });
  }

  // Combined (ER §7): worst status ok < needs-check < warn; canBook always true.
  const SEV = { ok: 0, "needs-check": 1, warn: 2 };
  function combine(results) {
    return { overall: results.reduce((w, r) => (SEV[r.status] > SEV[w] ? r.status : w), OK), canBook: true,
      cfiAckRequired: results.some((r) => r.cfiAckRequired), cfiNotes: results.filter((r) => r.status === CHECK).map((r) => r.rule),
      dpeFlags: results.filter((r) => r.dpeFlag).map((r) => r.rule) };
  }
  // ER §8 [VERIFY] flags shown next to the rows (titles only; the doc has the detail).
  const VERIFY_FLAGS = {
    3: "No formal FAA interpretation of the month count, i.e., whether the application or test month itself counts, for (a)(6) or the 3-hour rules.",
    4: "Which month counts for a test that spans a month boundary (Rule 5). The app shows needs-check.",
    5: "Whether a retest within the credit window needs a fresh (a)(6) endorsement or a fresh 3-hour window (Rule 6). The app re-checks both.",
    7: "Part 141 App. A, D and M paragraph numbers.",
    12: "Instrument \u201cbefore the date of the practical test\u201d uses calendar months. A strict same-day reading gives needs-check.",
    15: "The test month itself counts toward the 3-hour prep window.",
    16: "Simulator or FTD time is excluded from the prep count, because the text says \u201cin an airplane\u201d etc.",
    17: "\u00a761.63(c)(3) is read as exempting an added class rating from the 3-hour prep.",
    18: "A Part 141 graduate within 60 days is treated under \u00a761.71(a) together with the course\u2019s own 60-day prep rule.",
    19: "A \u00a761.49 endorsement dated the same day as the failure is accepted.",
  };

  // Resolved by D42: tools/eligibility_clock_reference.py now matches these three points. Kept for the record.
  const DOC_VS_REF = [
    "Rule 6 warn/fails messages for 'endorsement after the planned application', the §61.49(b) spin case and the 8710 recommendation end with 'Ask your CFI to review this.' (doc §0); the reference omits it (8710 says 'Ask your CFI.').",
    "Rule 6: the doc checks endorsement <= reapplication for any plan; the reference checks it only for an exact date. A month-only plan is compared with the month's last day.",
    "Rule 6 spin and 8710 messages use 'likely' wording (doc §0); the reference says 'you must' / 'needs'.",
  ];
  root.CC_ELIG = { checkPrep, checkRetest, combine, PREP_RULES, NO_PREP_RULE, VERIFY_FLAGS, DOC_VS_REF, CFI_NOTE,
    cal: { monthIndex, endOfMonthAfter, startOfMonthBefore, sameDayMonthsBefore, addDays, firstOfMi, endOfMi, planned, isYmd, isYm } };
})(typeof window !== "undefined" ? window : globalThis);
