/** RC14-I01 / RC13-I01: no horizontal overflow (scrollWidth <= clientWidth, 0px tolerance)
 *  on every static route AND every fictional DPE profile, at 320/360/390/768, Chromium + Firefox.
 *
 *  The rc14 258/0 audit missed Firefox #/dpe/nc14 @ 320 because ROUTES listed only static
 *  app paths — no #/dpe/{id} profile routes at all (32 routes × 4 widths × 2 browsers = 256,
 *  plus 2 dark after/pass checks = 258).
 */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
const WIDTHS = [320, 360, 390, 768];
const STATIC_ROUTES = [
  "#/", "#/find", "#/login", "#/signup", "#/home", "#/onboarding",
  "#/after/pass", "#/after/inc", "#/after/dis",
  "#/journey", "#/readiness", "#/more", "#/saved", "#/faq",
  "#/search", "#/alerts", "#/bookings", "#/my-checklists", "#/checklists",
  "#/pricing", "#/compare", "#/requests", "#/dpe-today", "#/dpe-openings", "#/dpe-week",
  "#/dpe-applicants", "#/dpe-fees", "#/openings", "#/admin", "#/school",
  "#/school/requests", "#/school/readiness", "#/school/cohort",
];

function dpeIdsFromSample() {
  const root = path.resolve(__dirname, "../..");
  const src = fs.readFileSync(path.join(root, "sample-nc-examiners.js"), "utf8");
  const start = src.indexOf('"dpes"');
  if (start < 0) throw Error("NC dpes not found");
  const ids = [...src.slice(start).matchAll(/\n\s+"id":\s*"([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(ids)];
  if (!unique.includes("nc14")) throw Error("nc14 missing from NC dpes: " + unique.join(","));
  return unique;
}

let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 320)); };

const measure = () => {
  const de = document.documentElement;
  const body = document.body;
  const sw = Math.max(de.scrollWidth, body.scrollWidth);
  const cw = de.clientWidth;
  let worst = null;
  for (const el of document.querySelectorAll("button, a.btn, .btn, .chip, .pill, .after-card .btn, [data-estimate-label]")) {
    const r = el.getBoundingClientRect();
    if (r.right > cw || r.width > cw) {
      const t = (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 90);
      if (!worst || r.right > worst.right) worst = { w: Math.round(r.width), right: Math.round(r.right * 10) / 10, t, tag: el.tagName, cls: String(el.className || "").slice(0, 80) };
    }
  }
  return { sw, cw, delta: sw - cw, overflow: sw > cw, worst, path: location.hash };
};

(async () => {
  const dpeIds = dpeIdsFromSample();
  const dpeRoutes = dpeIds.map((id) => `#/dpe/${id}?cert=ppl`);
  // Guarantee the QA repro URL is present even if already covered
  if (!dpeRoutes.includes("#/dpe/nc14?cert=ppl")) dpeRoutes.unshift("#/dpe/nc14?cert=ppl");
  const ROUTES = [...STATIC_ROUTES, ...dpeRoutes];

  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: w, height: 844 }, colorScheme: "light" });
      const page = await ctx.newPage();
      await page.goto(BASE + "?demo=promo#/");
      await page.waitForFunction(() => window.CC_ELIG);
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const route of ROUTES) {
        await page.goto(BASE + "?demo=promo" + route);
        await page.waitForSelector(".page, #app, body", { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(80);
        const m = await page.evaluate(measure);
        const name = `${bname} ${w}px ${route}`;
        check(name + " no h-overflow", !m.overflow, m);
        if (m.overflow) {
          const safe = route.replace(/[^a-z0-9]+/gi, "_").slice(0, 80);
          await page.screenshot({ path: path.join(SH, `${bname}-overflow-${w}-${safe}.png`), fullPage: true }).catch(() => {});
        }
      }
      if (w === 360) {
        await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
        await page.goto(BASE + "?demo=promo#/after/pass");
        await page.waitForTimeout(120);
        const m = await page.evaluate(measure);
        check(`${bname} 360 dark #/after/pass no h-overflow`, !m.overflow, m);
        await page.goto(BASE + "?demo=promo#/dpe/nc14?cert=ppl");
        await page.waitForTimeout(120);
        const m2 = await page.evaluate(measure);
        check(`${bname} 360 dark #/dpe/nc14?cert=ppl no h-overflow`, !m2.overflow, m2);
        await page.goto(BASE + "?demo=promo#/dpe/d1?cert=ppl");
        await page.waitForTimeout(120);
        const m3 = await page.evaluate(measure);
        check(`${bname} 360 dark #/dpe/d1?cert=ppl no h-overflow`, !m3.overflow, m3);
      }
      await ctx.close();
    }
    await browser.close();
  }
  const meta = { pass, fail, staticRoutes: STATIC_ROUTES.length, dpeProfiles: dpeIds.length, dpeIds, widths: WIDTHS, tolerancePx: 0 };
  fs.writeFileSync(path.join(OUT, "overflow-audit.json"), JSON.stringify({ ...meta, results }, null, 2));
  console.log("DPE_PROFILES", dpeIds.length, dpeIds.join(","));
  console.log("RESULT", pass, fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
