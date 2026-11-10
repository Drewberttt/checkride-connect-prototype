/* Wait-time stats (D49). Formula from wait-time-model.md §7 / §2; display from ux-copy-v3.md §12. Fictional sample only. */
(function (g) {
  const WINDOW_DAYS = 180;
  const MIN_N = 8;
  const STALE_AFTER_DAYS = 60;
  const NO_CARD_IDS = { p1: true, p2: true, p3: true };

  const showsCard = (id) => !!id && !NO_CARD_IDS[id];

  const parseYmd = (s) => {
    const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  };
  const ymd = (d) => {
    const y = d.getFullYear(), mo = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
    return y + "-" + mo + "-" + da;
  };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const diffDays = (a, b) => Math.round((a - b) / 86400000);

  // Python 3 int(round(x)) — ties-to-even — used for median / P25 / P75 whole-day rounding (generator).
  const pyRound = (x) => {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const n = Math.floor(ax);
    const frac = ax - n;
    let r;
    if (frac > 0.5) r = n + 1;
    else if (frac < 0.5) r = n;
    else r = (n % 2 === 0) ? n : n + 1;
    return sign * r;
  };

  const localDateFromIso = (iso, tz) => {
    if (!iso) return null;
    // Prefer the calendar date in the event tz when an instant is given.
    try {
      if (/T/.test(iso) && tz && typeof Intl !== "undefined") {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
        const g = (t) => (parts.find((p) => p.type === t) || {}).value;
        return parseYmd(g("year") + "-" + g("month") + "-" + g("day"));
      }
    } catch (e) { /* fall through */ }
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? parseYmd(m[1] + "-" + m[2] + "-" + m[3]) : null;
  };

  const waitCalendarDays = (event) => {
    if (!event || event.firstConfirmedTestDate == null) return null;
    const testday = parseYmd(event.firstConfirmedTestDate);
    const req = localDateFromIso(event.requestSubmittedAt, event.tz);
    if (!testday || !req) return null;
    if (testday < req) return null;
    return diffDays(testday, req);
  };

  const includeEvent = (event, asOf, windowDays) => {
    if (!event || event.source !== "verified_booking") return false;
    if (event.firstConfirmedAt == null || event.firstConfirmedTestDate == null) return false;
    const confirmed = localDateFromIso(event.firstConfirmedAt, event.tz);
    if (!confirmed) return false;
    const start = addDays(asOf, -(windowDays));
    if (confirmed < start || confirmed > asOf) return false;
    return true;
  };

  // Hyndman–Fan type 7 (numpy default). p in [0, 1].
  const percentile = (sortedVals, p) => {
    const n = sortedVals.length;
    if (n === 0) throw new Error("empty");
    if (n === 1) return sortedVals[0];
    const k = (n - 1) * p;
    const f = Math.floor(k);
    const c = (k === f) ? f : f + 1;
    if (c >= n) return sortedVals[n - 1];
    if (f === c) return sortedVals[f];
    return sortedVals[f] + (sortedVals[c] - sortedVals[f]) * (k - f);
  };

  const medianOf = (sortedVals) => {
    const n = sortedVals.length;
    if (n === 0) return null;
    if (n % 2 === 1) return sortedVals[(n - 1) / 2];
    return (sortedVals[n / 2 - 1] + sortedVals[n / 2]) / 2;
  };

  // D49: 0–6 → under 1 week (precedence). ≥7 → nearest whole week, half-up. (2*days+7)//14
  const weeksFromMedianDays = (days) => {
    if (days < 0) throw new Error("wait days cannot be negative: " + days);
    if (days <= 6) return null;
    return Math.floor((2 * days + 7) / 14);
  };
  const durationPhrase = (days) => {
    const w = weeksFromMedianDays(days);
    if (w == null) return "under 1 week";
    if (w === 1) return "about 1 week";
    return "about " + w + " weeks";
  };

  const fill = (s, vals) => {
    let out = s;
    (vals || []).forEach((v) => { out = out.replace(/\[[^\]]*\]/, String(v)); });
    return out;
  };

  const typicalWait = (events, asOf, opts) => {
    opts = opts || {};
    const windowDays = opts.windowDays == null ? WINDOW_DAYS : opts.windowDays;
    const minN = opts.minN == null ? MIN_N : opts.minN;
    const asOfDate = typeof asOf === "string" ? parseYmd(asOf) : asOf;
    const included = (events || []).filter((e) => includeEvent(e, asOfDate, windowDays));
    const waits = included.map((e) => (e.waitCalendarDays != null ? e.waitCalendarDays : waitCalendarDays(e))).filter((d) => d != null).sort((a, b) => a - b);
    const n = waits.length;
    let newest = null;
    included.forEach((e) => {
      const d = localDateFromIso(e.firstConfirmedAt, e.tz);
      if (d && (!newest || d > newest)) newest = d;
    });
    const daysSince = newest ? diffDays(asOfDate, newest) : null;
    const stale = newest != null && daysSince > STALE_AFTER_DAYS;
    const base = {
      n, windowDays, asOf: ymd(asOfDate), minN, enough: n >= minN, stale, daysSinceNewest: daysSince,
      medianDays: null, p25Days: null, p75Days: null
    };
    if (n < minN) return base;
    let med = pyRound(medianOf(waits));
    let p25 = pyRound(percentile(waits, 0.25));
    let p75 = pyRound(percentile(waits, 0.75));
    if (p25 > med) p25 = med;
    if (p75 < med) p75 = med;
    base.medianDays = med;
    base.p25Days = p25;
    base.p75Days = p75;
    return base;
  };

  const defaultCopy = {
    "wait.headline.under": "Typical wait: under 1 week",
    "wait.headline.week": "Typical wait: about 1 week",
    "wait.headline.weeks": "Typical wait: about [3] weeks",
    "wait.detail": "Median [18] days; most students waited [12]–[25] days. Based on [9] bookings in the last 180 days.",
    "wait.empty.headline": "Not enough bookings yet.",
    "wait.empty.detail_zero": "We'll show a typical wait after 8 bookings in the last 180 days.",
    "wait.empty.detail_some": "Based on [N] bookings in the last 180 days — we need 8 to show a typical wait.",
    "wait.empty.detail_one": "Based on 1 booking in the last 180 days — we need 8 to show a typical wait.",
    "wait.stale": "No new bookings in the last 60 days — this may be out of date.",
    "wait.how_label": "How this is measured",
    "wait.how": "Typical wait is the number of calendar days from a student's booking request to the first confirmed test date, using verified in-app bookings only. It is not a guarantee.",
    "wait.aria": "Typical wait: [about 3 weeks]. Median [18] days; most students waited [12] to [25] days. Based on [9] bookings in the last 180 days.",
    "wait.aria.empty": "Not enough bookings yet. [We'll show a typical wait after 8 bookings in the last 180 days.]",
    "wait.proto": "Prototype: fictional sample bookings, not real wait times."
  };

  const formatCard = (stats, copy) => {
    copy = copy || defaultCopy;
    const c = (k) => copy[k] || defaultCopy[k];
    if (!stats.enough) {
      const headline = c("wait.empty.headline");
      let detail, detailKey;
      if (stats.n === 0) { detail = c("wait.empty.detail_zero"); detailKey = "wait.empty.detail_zero"; }
      else if (stats.n === 1) { detail = c("wait.empty.detail_one"); detailKey = "wait.empty.detail_one"; }
      else { detail = fill(c("wait.empty.detail_some"), [String(stats.n)]); detailKey = "wait.empty.detail_some"; }
      const aria = fill(c("wait.aria.empty"), [detail]);
      return { enough: false, n: stats.n, stale: false, headline, detail, staleNote: "", aria, duration: "", headlineKey: "wait.empty.headline", detailKey };
    }
    const weeks = weeksFromMedianDays(stats.medianDays);
    let headline, headlineKey, duration;
    if (weeks == null) { headline = c("wait.headline.under"); headlineKey = "wait.headline.under"; duration = "under 1 week"; }
    else if (weeks === 1) { headline = c("wait.headline.week"); headlineKey = "wait.headline.week"; duration = "about 1 week"; }
    else { headline = fill(c("wait.headline.weeks"), [String(weeks)]); headlineKey = "wait.headline.weeks"; duration = "about " + weeks + " weeks"; }

    const med = stats.medianDays, p25 = stats.p25Days, p75 = stats.p75Days, n = stats.n;
    let detail = c("wait.detail");
    // §12.2 singular/plural on median and range, then fill remaining brackets (range, N).
    if (med === 1) detail = detail.replace("Median [18] days", "Median 1 day");
    else detail = detail.replace("Median [18] days", "Median " + med + " days");
    if (p25 === 1 && p75 === 1) detail = detail.replace("most students waited [12]–[25] days", "most students waited 1 day");
    else detail = detail.replace("most students waited [12]–[25] days", "most students waited " + p25 + "–" + p75 + " days");
    detail = fill(detail, [String(n)]);

    let aria = c("wait.aria");
    aria = fill(aria, [duration, med === 1 ? "1 day" : (med + " days"), String(p25), String(p75), String(n)]);
    // If we used "Median [18] days" pattern leftover, already filled by sequential brackets:
    // wait.aria: Typical wait: [about 3 weeks]. Median [18] days; most students waited [12] to [25] days. Based on [9] bookings...
    // After first fill of duration, second is median number only if template still has [18]. We already filled duration, then 18, 12, 25, 9.
    // But we passed "1 day" as second fill which would become "Median 1 day days". Fix aria more carefully:
    aria = c("wait.aria");
    const medPhrase = med === 1 ? "1 day" : (med + " days");
    const rangePhrase = (p25 === 1 && p75 === 1) ? "1 day" : (p25 + " to " + p75 + " days");
    aria = aria.replace(/\[[^\]]*\]/, duration);
    aria = aria.replace("Median [18] days", "Median " + medPhrase);
    if (p25 === 1 && p75 === 1) aria = aria.replace("most students waited [12] to [25] days", "most students waited 1 day");
    else aria = aria.replace("most students waited [12] to [25] days", "most students waited " + p25 + " to " + p75 + " days");
    aria = fill(aria, [String(n)]);

    const staleNote = stats.stale ? c("wait.stale") : "";
    if (staleNote) aria = aria + " " + staleNote;
    return { enough: true, n, stale: !!stats.stale, headline, detail, staleNote, aria, duration, headlineKey, detailKey: "wait.detail" };
  };

  const cardForExaminer = (id, opts) => {
    opts = opts || {};
    if (!showsCard(id)) return null;
    const data = opts.data || g.CC_WAIT_DATA;
    if (!data) return null;
    const asOf = opts.asOf || data.asOf;
    const events = (opts.events || data.events || []).filter((e) => e.examinerId === id);
    const stats = typicalWait(events, asOf, opts);
    const display = formatCard(stats, opts.copy);
    return { id, stats, display };
  };

  g.CC_WAIT = {
    WINDOW_DAYS, MIN_N, STALE_AFTER_DAYS, NO_CARD_IDS,
    showsCard, parseYmd, waitCalendarDays, includeEvent, percentile, medianOf, pyRound,
    weeksFromMedianDays, durationPhrase, typicalWait, formatCard, cardForExaminer, fill, defaultCopy
  };
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
