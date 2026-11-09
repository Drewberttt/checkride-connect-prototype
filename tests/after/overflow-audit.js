/** RC13-I01: no horizontal overflow (scrollWidth <= clientWidth) on routes at narrow widths. */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
const WIDTHS = [320, 360, 390, 768];
const ROUTES = [
  "#/", "#/find", "#/login", "#/signup", "#/home", "#/onboarding",
  "#/after/pass", "#/after/inc", "#/after/dis",
  "#/journey", "#/readiness", "#/more", "#/saved", "#/faq",
  "#/search", "#/alerts", "#/bookings", "#/my-checklists", "#/checklists",
  "#/pricing", "#/compare", "#/requests", "#/dpe-today", "#/dpe-openings",
  "#/dpe-applicants", "#/dpe-fees", "#/openings", "#/admin", "#/school",
  "#/school/requests", "#/school/readiness", "#/school/cohort",
];
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 280)); };

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: w, height: 844 }, colorScheme: "light" });
      const page = await ctx.newPage();
      await page.goto(BASE + "?demo=promo#/");
      await page.waitForFunction(() => window.CC_ELIG);
      // Prefer reduced motion so confetti canvas doesn't affect layout
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const route of ROUTES) {
        await page.goto(BASE + "?demo=promo" + route);
        await page.waitForSelector(".page, #app, body", { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(120);
        const m = await page.evaluate(() => {
          const de = document.documentElement;
          const body = document.body;
          const sw = Math.max(de.scrollWidth, body.scrollWidth);
          const cw = de.clientWidth;
          // Find widest overflowing control
          let worst = null;
          for (const el of document.querySelectorAll("button, a.btn, .btn, .chip, .pill, .after-card .btn")) {
            const r = el.getBoundingClientRect();
            if (r.width > cw + 1) {
              const t = (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 80);
              if (!worst || r.width > worst.w) worst = { w: Math.round(r.width), t, tag: el.tagName, cls: el.className };
            }
          }
          return { sw, cw, overflow: sw > cw + 1, worst, path: location.hash };
        });
        const name = `${bname} ${w}px ${route}`;
        check(name + " no h-overflow", !m.overflow, m);
        if (m.overflow && (route.includes("/after/pass") || route.includes("/after/inc") || route.includes("/after/dis"))) {
          await page.screenshot({ path: path.join(SH, `${bname}-overflow-${w}-${route.replace(/[#/]/g, "_")}.png`), fullPage: true });
        }
      }
      // Dark mode spot-check on after/pass at 360
      if (w === 360) {
        await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
        await page.goto(BASE + "?demo=promo#/after/pass");
        await page.waitForTimeout(150);
        const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        check(`${bname} 360 dark #/after/pass no h-overflow`, m.sw <= m.cw + 1, m);
      }
      await ctx.close();
    }
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT, "overflow-audit.json"), JSON.stringify({ pass, fail, results }, null, 2));
  console.log("RESULT", pass, fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
