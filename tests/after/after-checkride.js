/** After-the-checkride screens: pass / share / NOD / LOD. Chromium+Firefox. Exact §10 keys; no external share. */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT; const SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || process.env.CC_BASE || "http://127.0.0.1:8020/";
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 300)); };

const VERIFY_KEYS = ["after.verify.day60","after.verify.no_reset","after.verify.examiner_plan","after.verify.a6_fresh","after.verify.prep_counts","after.verify.no_extend","after.verify.8900"];

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
    const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const external = [];
    page.on("request", (r) => {
      const u = r.url();
      if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) external.push(u);
    });

    // Seed pilot session so More/nav works
    await page.goto(BASE + "#/home");
    await page.waitForFunction(() => window.CC_ELIG && window.CC_ELIG.checkResume);
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.startsWith("cc-connect-proto-v3")) || "cc-connect-proto-v3";
      const s = JSON.parse(localStorage.getItem(key) || "{}");
      s.role = "pilot";
      s.demoUser = Object.assign({ name: "Alex Demo", goal: "ppl", airport: "KVDF" }, s.demoUser || {});
      s.onboarding = { status: "done", source: "test", completedAt: Date.now(), certDone: true, airportDone: true, targetDone: true };
      localStorage.setItem(key, JSON.stringify(s));
    });

    // ---- Pass screen ----
    await page.goto(BASE + "#/after/pass");
    await page.waitForSelector('[data-after="pass"]');
    await page.screenshot({ path: path.join(SH, bname + "-pass.png"), fullPage: true });
    check(bname + " pass eyebrow", await page.locator('[data-copy-key="pass.eyebrow"]').textContent() === "CHECKRIDE COMPLETE");
    check(bname + " pass headline", (await page.locator('[data-copy-key="pass.headline"]').textContent()).includes("You earned it"));
    check(bname + " pass proto", await page.locator('[data-copy-key="pass.proto"]').count() === 1);
    check(bname + " pass confetti suppressed under reduced-motion", await page.locator(".after-confetti").count() === 0);
    check(bname + " pass has share CTA", await page.locator('[data-action="after-share-open"]').count() === 1);

    // Share sheet — download only, no network share
    await page.click('[data-action="after-share-open"]');
    await page.waitForSelector('[data-copy-key="share.title"]');
    await page.screenshot({ path: path.join(SH, bname + "-share.png") });
    check(bname + " share title", await page.locator('[data-copy-key="share.title"]').textContent() === "Keepsake card");
    check(bname + " share helper never posts", (await page.locator('[data-copy-key="share.helper"]').textContent()).includes("never posts"));
    check(bname + " share no social buttons", await page.locator('a[href*="twitter"], a[href*="facebook"], a[href*="linkedin"], [data-action*="web-share"]').count() === 0);
    check(bname + " share examiner toggle default off", await page.locator("#share-include-examiner").isChecked() === false);
    // Download (may not persist file in all envs; ensure no throw / toast path)
    const dlPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
    await page.click('[data-action="after-share-download"]');
    const dl = await dlPromise;
    check(bname + " share download fired or toast", !!(dl || await page.locator(".toast").count()));
    if (dl) await dl.cancel().catch(() => {});

    // ---- LOD (inc) ----
    await page.goto(BASE + "#/after/inc");
    await page.waitForSelector('[data-after="inc"]');
    await page.screenshot({ path: path.join(SH, bname + "-inc.png"), fullPage: true });
    check(bname + " inc headline", (await page.locator('[data-copy-key="after.inc.headline"]').textContent()).includes("Paused, not finished"));
    check(bname + " inc no_endorse", await page.locator('[data-copy-key="after.inc.no_endorse"]').count() === 1);
    check(bname + " inc other_clocks", await page.locator('[data-copy-key="after.inc.other_clocks"]').count() === 1);
    check(bname + " credit window visible", await page.locator('[data-copy-key="after.credit.window"]').count() === 1);
    check(bname + " credit example visible", await page.locator('[data-copy-key="after.credit.example"]').count() === 1);
    check(bname + " live credit Jul 9", await page.locator("[data-credit-effective]").getAttribute("data-credit-effective") === "2026-07-09");
    check(bname + " stop_failed_task", await page.locator('[data-copy-key="after.stop_failed_task"]').count() === 1);
    check(bname + " nod_vs_lod", await page.locator('[data-copy-key="after.nod_vs_lod"]').count() === 1);
    for (const k of VERIFY_KEYS) {
      check(bname + " verify visible " + k, await page.locator(`[data-after-verify="${k}"]`).count() === 1);
    }

    const planTxt = await page.locator('[data-after-verify="after.verify.examiner_plan"]').textContent();
    check(bname + " examiner_plan §10.3.0 exact", planTxt.trim() === "Your examiner decides the plan for the remaining test; bring your NOD/LOD and ask them what will be covered.", planTxt);
    check(bname + " examiner_plan no FSIMS sourcing", !planTxt.includes("FSIMS") && !planTxt.includes("8900.1A text is unreachable"), planTxt);
    check(bname + " no plain duplicate examiner line", await page.locator("[data-examiner-plan-plain]").count() === 0);

    check(bname + " inc rebook → d5", (await page.locator('[data-copy-key="after.rebook"]').getAttribute("href")).includes("/dpe/d5"));

    // ---- NOD (dis) ----
    await page.goto(BASE + "#/after/dis");
    await page.waitForSelector('[data-after="dis"]');
    await page.screenshot({ path: path.join(SH, bname + "-dis.png"), fullPage: true });
    check(bname + " dis headline no failure word", !(await page.locator('[data-copy-key="after.dis.headline"]').textContent()).toLowerCase().includes("fail"));
    check(bname + " dis endorse", await page.locator('[data-copy-key="after.dis.endorse"]').count() === 1);
    check(bname + " dis 8710", await page.locator('[data-copy-key="after.dis.8710"]').count() === 1);
    check(bname + " dis same credit Jul9", await page.locator("[data-credit-effective]").getAttribute("data-credit-effective") === "2026-07-09");
    for (const k of VERIFY_KEYS) {
      check(bname + " dis verify " + k, await page.locator(`[data-after-verify="${k}"]`).count() === 1);
    }

    // Dark + narrow
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(BASE + "#/after/inc");
    await page.waitForSelector('[data-after="inc"]');
    await page.screenshot({ path: path.join(SH, bname + "-inc-dark-360.png"), fullPage: true });
    check(bname + " dark 360 renders", await page.locator(".after-page").count() === 1);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + "#/after/pass");
    await page.screenshot({ path: path.join(SH, bname + "-pass-1440.png") });

    // Confetti allowed when motion not reduced
    await ctx.close();
    const ctx2 = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 800, height: 700 }, reducedMotion: "no-preference" });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + "#/after/pass");
    await p2.waitForSelector('[data-after="pass"]');
    await p2.waitForTimeout(200);
    const confetti = await p2.locator(".after-confetti").count();
    check(bname + " confetti appears when motion allowed", confetti >= 1);
    await p2.waitForTimeout(2200);
    check(bname + " confetti gone after ~2s", await p2.locator(".after-confetti").count() === 0);
    await ctx2.close();

    check(bname + " no external share/network", external.length === 0, external.slice(0, 5));
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT, "after-checkride.json"), JSON.stringify({ pass, fail, results }, null, 2));
  console.log("RESULT", pass, fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
