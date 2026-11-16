/** QA-089: burst / interrupted reloads must not log a Service Worker
 *  "intercepted the request and encountered an unexpected error".
 *  Chromium, Firefox, and WebKit. Writes only to OUT (outside the app tree).
 */
const fs = require("fs");
const path = require("path");
const pw = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const { chromium, firefox, webkit } = pw;
const ENGINES = { chromium, firefox, webkit };
const OUT = process.env.OUT;
const SH = process.env.SHOTS;
if (!OUT) throw new Error("OUT required (write evidence outside the app tree)");
fs.mkdirSync(OUT, { recursive: true });
if (SH) fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
const QA_BROWSERS = (process.env.QA_BROWSERS || "chromium,firefox,webkit").split(",").map((s) => s.trim()).filter(Boolean);
const RUNS = Number(process.env.QA089_RUNS || 4);
let pass = 0, fail = 0;
const results = [];
const check = (name, yes, data) => {
  results.push({ name, pass: !!yes, data });
  yes ? pass++ : fail++;
  console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 400));
};

const isSwInterceptErr = (t) => /ServiceWorker intercepted|unexpected error/i.test(t);

async function oneRun(type, name, kind) {
  const browser = await type.launch(name === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
  const recs = [];
  try {
    for (let r = 0; r < RUNS; r++) {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      const swErrs = [], other = [], external = [];
      page.on("console", (m) => {
        const t = m.text();
        if (isSwInterceptErr(t)) swErrs.push(t.slice(0, 300));
        else if (m.type() === "error") other.push(t.slice(0, 200));
      });
      page.on("pageerror", (e) => other.push("PE:" + String(e).slice(0, 200)));
      page.on("request", (req) => {
        const u = req.url();
        if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) external.push(u);
      });
      await page.goto(BASE + "?demo=promo", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => navigator.serviceWorker.controller, { timeout: 15000 });
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(400);
      const ctrlBefore = await page.evaluate(() => !!navigator.serviceWorker.controller);
      if (kind === "burst") {
        for (let i = 0; i < 8; i++) { page.reload().catch(() => {}); await page.waitForTimeout(60); }
      } else {
        for (let i = 0; i < 5; i++) { page.reload().catch(() => {}); await page.waitForTimeout(60); }
      }
      await page.waitForTimeout(2500);
      await page.reload({ waitUntil: "load" }).catch(() => {});
      await page.waitForTimeout(800);
      const st = await page.evaluate(async () => ({
        main: document.querySelectorAll("#app *, main *").length,
        ctrl: !!navigator.serviceWorker.controller,
        hasApp: !!window.CC_WK,
        caches: await caches.keys()
      })).catch((e) => ({ err: e.message.slice(0, 80) }));
      if (SH && r === 0) {
        await page.screenshot({ path: path.join(SH, name + "-" + kind + ".png"), fullPage: true }).catch(() => {});
      }
      recs.push({ r, ctrlBefore, st, swErrs, other, external });
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  return recs;
}

(async () => {
  for (const name of QA_BROWSERS) {
    const type = ENGINES[name];
    if (!type) throw new Error("unknown QA_BROWSERS engine " + name);
    for (const kind of ["burst", "swicon"]) {
      const recs = await oneRun(type, name, kind);
      const swErrs = recs.flatMap((x) => x.swErrs);
      const named = swErrs.filter((t) => !/Failed to load [‘'][’']/i.test(t));
      const blank = recs.filter((x) => !x.st || !x.st.main).length;
      const unctrl = recs.filter((x) => !x.st || !x.st.ctrl).length;
      const ext = recs.flatMap((x) => x.external);
      const lostApp = recs.filter((x) => !x.st || !x.st.hasApp).length;
      check(name + " " + kind + " no SW intercept errors", swErrs.length === 0, swErrs.slice(0, 5));
      check(name + " " + kind + " no named-file SW errors", named.length === 0, named.slice(0, 5));
      check(name + " " + kind + " no blank page after", blank === 0, { blank, runs: recs.length });
      check(name + " " + kind + " SW still controlling", unctrl === 0, { unctrl });
      check(name + " " + kind + " app still booted", lostApp === 0);
      check(name + " " + kind + " no external requests", ext.length === 0, ext.slice(0, 5));
    }
  }
  const summary = { pass, fail, results, browsers: QA_BROWSERS, runs: RUNS, sw: "cc-proto-v7.27.0" };
  fs.writeFileSync(path.join(OUT, "qa089-burst.json"), JSON.stringify(summary, null, 2));
  console.log("QA-089 BURST " + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
