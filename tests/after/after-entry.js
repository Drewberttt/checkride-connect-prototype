/** Past-booking "How did it go?" entry → #/after/pass|inc|dis. Airport-zone calendar-date past boundary. */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 240)); };

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
    const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "#/");
    await page.waitForFunction(() => window.CC_ELIG && typeof window.CC_ELIG.checkResume === "function");

    // App may keep seed only in memory until first save — write canonical KEY explicitly.
    const seeded = await page.evaluate(() => {
      const KEY = "cc-connect-proto-v3";
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const g = (t) => parts.find((p) => p.type === t).value;
      const today = `${g("year")}-${g("month")}-${g("day")}`;
      const [Y, M, D] = today.split("-").map(Number);
      const yday = new Date(Date.UTC(Y, M - 1, D - 1)).toISOString().slice(0, 10);
      const tmrw = new Date(Date.UTC(Y, M - 1, D + 1)).toISOString().slice(0, 10);
      const mkSlot = (id, date) => ({ id: "slotentry" + id, dpeId: "d5", date, time: "09:00", airport: "KVDF", status: "booked", certs: ["ppl"], bookingId: "bkentry" + id });
      const mkBook = (id, status) => ({ id: "bkentry" + id, slotId: "slotentry" + id, dpeId: "d5", cert: "ppl", status, mine: true, applicant: "Alex Demo", createdAt: Date.now() - 864e5, feeUsd: 700, depositUsd: 200 });
      const slots = [mkSlot("past", yday), mkSlot("today", today), mkSlot("future", tmrw), mkSlot("pastreq", yday)];
      const bookings = [mkBook("past", "confirmed"), mkBook("today", "confirmed"), mkBook("future", "confirmed"), mkBook("pastreq", "requested")];
      // past-req shares date with past but distinct slot id already
      slots[3].bookingId = "bkentrypastreq";
      const state = {
        v: 3, fl: 1, ms: 1, role: "pilot", nextId: 2000, slots, bookings,
        avail: { d5: { confirmedAt: Date.now(), updatedAt: Date.now(), reminderDay: 0, pauseReminders: false } },
        alerts: [], notifications: [], checklist: {}, curated: {}, ticks: {}, tier: "free",
        target: today.slice(0, 7), ready9Dates: {}, pending: [], approvedDpes: [], actingDpe: "d1", p4: 1,
        savedExaminers: [{ id: "sx-entry", dpeId: "d5", savedAt: 1 }],
        savedSearches: [],
        demoUser: { name: "Alex Demo", goal: "ppl", airport: "KVDF" },
        onboarding: { status: "done", source: "test", completedAt: Date.now(), certDone: true, airportDone: true, targetDone: true },
      };
      // NC builds use ":nc" suffix; FL builds use bare key — write both so load() hits.
      localStorage.setItem("cc-connect-proto-v3", JSON.stringify(state));
      localStorage.setItem("cc-connect-proto-v3:nc", JSON.stringify(state));
      return { KEY, today, yday, tmrw };
    });

    await page.reload();
    await page.waitForFunction(() => window.CC_ELIG);
    await page.goto(BASE + "#/bookings");
    await page.waitForSelector(".page");
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SH, bname + "-bookings-entry.png"), fullPage: true });

    const pastEntry = page.locator('[data-after-entry][data-booking="bkentrypast"]');
    const todayEntry = page.locator('[data-after-entry][data-booking="bkentrytoday"]');
    const futureEntry = page.locator('[data-after-entry][data-booking="bkentryfuture"]');
    const pastReq = page.locator('[data-after-entry][data-booking="bkentrypastreq"]');

    check(bname + " past confirmed shows entry", await pastEntry.count() === 1, seeded);
    check(bname + " today confirmed hides entry", await todayEntry.count() === 0, seeded);
    check(bname + " future confirmed hides entry", await futureEntry.count() === 0);
    check(bname + " past requested shows entry", await pastReq.count() === 1);

    if (!(await pastEntry.count())) {
      const dbg = await page.evaluate(() => {
        const raw = localStorage.getItem("cc-connect-proto-v3:nc") || localStorage.getItem("cc-connect-proto-v3") || "{}";
        const s = JSON.parse(raw);
        return { mine: (s.bookings || []).filter((b) => b.mine), slots: (s.slots || []).filter((x) => String(x.id).includes("entry")), text: document.body.innerText.slice(0, 400) };
      });
      check(bname + " debug seed persisted", false, dbg);
      await browser.close();
      continue;
    }

    check(bname + " Passed → #/after/pass", await pastEntry.locator('[data-after-choice="pass"]').getAttribute("href") === "#/after/pass?bookingId=bkentrypast");
    check(bname + " Not finished → #/after/inc (LOD)", await pastEntry.locator('[data-after-choice="inc"]').getAttribute("href") === "#/after/inc?bookingId=bkentrypast");
    check(bname + " Not passed → #/after/dis (NOD)", await pastEntry.locator('[data-after-choice="dis"]').getAttribute("href") === "#/after/dis?bookingId=bkentrypast");

    await pastEntry.locator('[data-after-choice="pass"]').focus();
    check(bname + " choice is focusable link", await page.evaluate(() => document.activeElement?.getAttribute("data-after-choice") === "pass"));

    await pastEntry.locator('[data-after-choice="pass"]').click();
    await page.waitForSelector('[data-after="pass"]');
    check(bname + " routed to pass", page.url().includes("#/after/pass"));
    const sub = await page.locator('[data-copy-key="pass.sub"]').textContent();
    check(bname + " pass sub has cert/examiner context", /Private|Pilot|with/i.test(sub) && sub.length > 10, sub);

    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + "#/bookings");
    await page.screenshot({ path: path.join(SH, bname + "-bookings-entry-dark-1440.png") });
    check(bname + " dark 1440 still shows past entry", await page.locator('[data-after-entry][data-booking="bkentrypast"]').count() === 1);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(BASE + "#/request/bkentrypast");
    await page.waitForSelector(".page");
    check(bname + " request page shows entry for past", await page.locator('[data-after-entry][data-booking="bkentrypast"]').count() === 1);
    await page.locator('[data-after-choice="inc"]').click();
    await page.waitForSelector('[data-after="inc"]');
    check(bname + " Not finished routes to inc/LOD", page.url().includes("#/after/inc") && await page.locator('[data-copy-key="after.inc.no_endorse"]').count() === 1);

    await page.goto(BASE + "#/request/bkentrypast");
    await page.locator('[data-after-choice="dis"]').click();
    await page.waitForSelector('[data-after="dis"]');
    check(bname + " Not passed routes to dis/NOD", page.url().includes("#/after/dis") && await page.locator('[data-copy-key="after.dis.endorse"]').count() === 1);

    await page.goto(BASE + "#/bookings");
    const entry = page.locator('[data-after-entry][data-booking="bkentrypast"]');
    check(bname + " entry prompt §10.0", (await entry.locator('[data-copy-key="after.entry.prompt"]').textContent()).trim() === "How did it go?");
    check(bname + " entry passed label", (await entry.locator('[data-copy-key="after.entry.passed"]').textContent()).trim() === "Passed");
    check(bname + " entry inc Not finished (no discontinued)", (await entry.locator('[data-copy-key="after.entry.inc"]').textContent()).trim() === "Not finished");
    check(bname + " entry dis Not passed", (await entry.locator('[data-copy-key="after.entry.dis"]').textContent()).trim() === "Not passed");
    const helper = (await entry.locator('[data-copy-key="after.entry.helper"]').textContent()).trim();
    check(bname + " entry helper §10.0", helper === "Pick what your examiner handed you: a temporary certificate (Passed), a letter of discontinuance (Not finished) or a notice of disapproval (Not passed). If the test stopped after an unsatisfactory task, choose Not passed. Prototype only; nothing is filed or sent.", helper);
    check(bname + " entry aria §10.0", await entry.locator('.after-entry-actions').getAttribute("aria-label") === "Checkride result for this booking");
    check(bname + " entry group_label §10.0", (await entry.locator('[data-copy-key="after.entry.group_label"]').textContent()).trim() === "Checkride result");
    check(bname + " no PLACEHOLDER on entry", !(await entry.innerText()).includes("PLACEHOLDER"));

    await browser.close();
  }
  fs.writeFileSync(path.join(OUT, "after-entry.json"), JSON.stringify({ pass, fail, results, mapping: {
    Passed: "#/after/pass",
    "Not finished (LOD)": "#/after/inc",
    "Not passed (disapproval / NOD)": "#/after/dis",
  }, placeholders: [] }, null, 2));
  console.log("RESULT", pass, fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
