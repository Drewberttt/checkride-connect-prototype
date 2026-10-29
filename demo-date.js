/* Demo date mode (prototype, for stable screenshots). Loaded before every other script.
   ?demoDate=YYYY-MM-DD pins "today" to that date (09:00 Eastern, the sample region's zone, then the clock runs normally from page load);
   ?demo=promo pins the promo date below. ?demoDate=off (or ?demo=off) returns to the real date.
   The choice persists for this browser tab (sessionStorage). The hash router is unaffected: put the
   param before the #, e.g. ./?demo=promo#/search?cert=ppl. Demo mode keeps its own saved state, so it
   always starts from fresh sample data for that date. Default (no param) is relative to the real today. */
(function () {
  var PROMO = "2026-11-02"; // unchanged promo date (Mon Nov 9 is only the digest's sample date, not the demo date)
  var SKEY = "cc-demo-date";
  var RealDate = Date;
  var pick = null;
  function fromQuery(qs) {
    var p = new URLSearchParams(qs || "");
    if (p.has("demoDate")) return p.get("demoDate");
    if (p.has("demo")) return p.get("demo") === "promo" ? PROMO : p.get("demo");
    return null;
  }
  try {
    var hashQs = (location.hash.split("?")[1] || "");
    var v = fromQuery(location.search);
    if (v === null) v = fromQuery(hashQs);
    if (v !== null) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) sessionStorage.setItem(SKEY, v);
      else sessionStorage.removeItem(SKEY); // "off" or anything invalid
    }
    pick = sessionStorage.getItem(SKEY);
  } catch (e) { pick = null; }
  if (!pick || !/^\d{4}-\d{2}-\d{2}$/.test(pick)) { window.CC_DEMO_DATE = null; return; }
  var ymd = pick.split("-").map(Number);
  // 09:00 in America/New_York regardless of the browser's zone (D38: Intl + timeZone, never local setHours).
  var TZ = "America/New_York";
  function tzOffset(ts) {
    var o = {}; new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new RealDate(ts)).forEach(function (x) { o[x.type] = x.value; });
    return RealDate.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second) - Math.floor(ts / 1000) * 1000;
  }
  var g = RealDate.UTC(ymd[0], ymd[1] - 1, ymd[2], 9, 0, 0, 0);
  var target = g - tzOffset(g - tzOffset(g));
  if (isNaN(target)) { window.CC_DEMO_DATE = null; return; }
  var offset = target - RealDate.now();
  function DemoDate() {
    if (!(this instanceof DemoDate)) return new RealDate(RealDate.now() + offset).toString();
    var a = Array.prototype.slice.call(arguments);
    return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(RealDate.now() + offset);
  }
  DemoDate.prototype = RealDate.prototype;
  DemoDate.now = function () { return RealDate.now() + offset; };
  DemoDate.parse = RealDate.parse;
  DemoDate.UTC = RealDate.UTC;
  window.Date = DemoDate;
  window.CC_DEMO_DATE = pick;
  function label() {
    var txt = new RealDate(target).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: TZ });
    var bar = document.createElement("div");
    bar.className = "demo-date-bar";
    bar.id = "demo-date";
    bar.innerHTML = "<b>Demo date: " + txt + "</b> <span>(pinned for screenshots; dates and times below are relative to it)</span>";
    var banner = document.querySelector(".proto-banner");
    if (banner) banner.insertAdjacentElement("afterend", bar); else document.body.prepend(bar);
    var reset = document.querySelector("#footer-reset-data") || document.querySelector("footer [data-action=reset]");
    if (reset) {
      var exit = document.createElement("a");
      exit.className = "btn ghost sm"; exit.id = "demo-date-exit";
      exit.href = location.pathname + "?demoDate=off" + (location.hash || "#/");
      exit.textContent = "Exit demo date";
      reset.insertAdjacentElement("afterend", exit);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", label); else label();
})();
