/** Placement, toast/aria, error path, DESCRIPTION order, overflow + target-size for .ics buttons. */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT; const SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || process.env.CC_BASE || "http://127.0.0.1:8020/";
const ICS = require(path.resolve(__dirname, "../../ics.js"));
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 400)); };

const WINDOW = "To keep credit for what you already passed, finish by the earlier of (a) 60 days after the day the test stopped, and (b) the last day of the second calendar month after the month you started. After that, expect the full test again. Ask your CFI / DPE.";
const DAY60 = "Day 60 is treated as the last valid day (Interpretation; [VERIFY] #10).";
const FOOT = "This file has no reminders or alarms. Nothing was booked or sent.";

async function seedPilot(page) {
  await page.goto(BASE + "?demo=promo#/home", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.CC_WK && window.CC_ICS);
  await page.evaluate(() => {
    window.CC_WK.mutate((S) => {
      S.role = "pilot";
      S.demoUser = Object.assign({ name: "Alex Demo", goal: "ppl", airport: "KVDF" }, S.demoUser || {});
      const slots = (S.slots || []).filter((s) => s && s.date && s.time && s.airport);
      const icao = (s) => /^[A-Z]{3,4}$/.test(s.airport);
      const s1 = slots.find(icao) || slots[0];
      const s2 = slots.filter((s) => s.id !== s1.id).find(icao) || slots.find((s) => s.id !== s1.id) || s1;
      if (!/^[A-Z]{3,4}$/.test(s1.airport)) s1.airport = "KVDF";
      S.bookings = S.bookings || [];
      if (!S.bookings.some((b) => b.id === "bcalconf")) {
        S.bookings.push({
          id: "bcalconf", slotId: s1.id, dpeId: s1.dpeId, applicant: "Alex Demo",
          mine: true, cert: "ppl", aircraft: "N123AB", cfi: "A. Grant, CFI",
          status: "confirmed", createdAt: Date.now()
        });
      }
      if (!S.bookings.some((b) => b.id === "bcalpend")) {
        S.bookings.push({
          id: "bcalpend", slotId: s2.id, dpeId: s2.dpeId, applicant: "Alex Demo",
          mine: true, cert: "ppl", aircraft: "N123AB", cfi: "A. Grant, CFI",
          status: "requested", createdAt: Date.now()
        });
      }
    });
  });
}

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch();
    const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await seedPilot(page);

    // Confirmed booking: button present
    await page.goto(BASE + "?demo=promo#/request/bcalconf", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.CC_ICS);
    await page.screenshot({ path: path.join(SH, bname + "-ride-confirmed.png"), fullPage: true });
    const rideBtn = page.locator('[data-cal="ride"] [data-action="cal-ride"]');
    check(bname + " ride btn on confirmed", await rideBtn.count() === 1);
    check(bname + " ride btn copy", (await rideBtn.textContent()).trim() === "Add to calendar");
    check(bname + " ride aria", await rideBtn.getAttribute("aria-label") === "Download a calendar file for this sample checkride. Nothing is sent.");
    check(bname + " ride helper", await page.locator('[data-cal="ride"] [data-copy-key="cal.helper"]').textContent() === "Downloads a calendar file to this device. The file has no reminders. Nothing is sent.");

    // Target size + overflow of ride button
    const rideBox = await rideBtn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 0.5;
      return { w: r.width, h: r.height, overflowX };
    });
    check(bname + " ride btn 44x44", rideBox.w >= 43.5 && rideBox.h >= 43.5, rideBox);
    check(bname + " ride no overflow", rideBox.overflowX === false, rideBox);

    // Download + filename
    const dl1 = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
    await rideBtn.click();
    const d1 = await dl1;
    check(bname + " ride download fired", !!d1);
    if (d1) {
      check(bname + " ride filename pattern", /^demo-checkride-\d{4}-\d{2}-\d{2}-[A-Z]{3,4}\.ics$/.test(d1.suggestedFilename()), d1.suggestedFilename());
      const tmp = path.join(OUT, bname + "-ride.ics");
      await d1.saveAs(tmp);
      const text = fs.readFileSync(tmp, "utf8");
      check(bname + " ride SUMMARY Demo:", /SUMMARY:Demo:/.test(text));
      check(bname + " ride TZID present", /DTSTART;TZID=/.test(text) && /BEGIN:VTIMEZONE/.test(text));
      check(bname + " ride 2h DTEND", /DTEND;TZID=/.test(text));
      check(bname + " ride no VALARM/ATTENDEE/ORGANIZER/@ in UID", !/VALARM|ATTENDEE|ORGANIZER/.test(text) && !/UID:[^\r]*@/.test(text));
      check(bname + " ride STATUS TENTATIVE", /STATUS:TENTATIVE/.test(text));
    }

    // Toast + aria
    const toast = page.locator(".toast[role='status']");
    await page.waitForTimeout(200);
    check(bname + " toast done copy", (await toast.count()) >= 1 && (await toast.first().textContent()).includes("Calendar file downloaded"));
    check(bname + " toast aria-live polite", (await toast.first().getAttribute("aria-live")) === "polite");

    // Pending request: no ride button
    await page.goto(BASE + "?demo=promo#/request/bcalpend", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.CC_WK);
    check(bname + " no ride btn on pending", await page.locator('[data-action="cal-ride"]').count() === 0);
    check(bname + " no deadline on request", await page.locator('[data-action="cal-deadline"]').count() === 0);

    // after/pass: no deadline
    await page.goto(BASE + "?demo=promo#/after/pass", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-after="pass"]');
    check(bname + " no deadline on pass", await page.locator('[data-action="cal-deadline"]').count() === 0);
    check(bname + " no ride on pass", await page.locator('[data-action="cal-ride"]').count() === 0);

    for (const kind of ["dis", "inc"]) {
      await page.goto(BASE + "?demo=promo#/after/" + kind, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-after="' + kind + '"]');
      await page.screenshot({ path: path.join(SH, bname + "-deadline-" + kind + ".png"), fullPage: true });
      const btn = page.locator('[data-cal="deadline"] [data-action="cal-deadline"]');
      check(bname + " deadline btn on " + kind, await btn.count() === 1);
      check(bname + " deadline copy on " + kind, (await btn.textContent()).trim() === "Add credit deadline to calendar");
      check(bname + " deadline aria on " + kind, await btn.getAttribute("aria-label") === "Download a calendar file for the estimated retest credit deadline. Nothing is sent.");
      check(bname + " deadline helper on " + kind, await page.locator('[data-copy-key="cal.deadline.helper"]').textContent() === "This date is an estimate. Confirm it with your examiner.");
      check(bname + " helper also on " + kind, await page.locator('[data-cal="deadline"] [data-copy-key="cal.helper"]').count() === 1);
      const box = await btn.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 0.5;
        return { w: r.width, h: r.height, overflowX };
      });
      check(bname + " deadline btn 44x44 on " + kind, box.w >= 43.5 && box.h >= 43.5, box);
      check(bname + " deadline no overflow on " + kind, box.overflowX === false, box);

      if (kind === "dis") {
        const dl = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
        await btn.click();
        const d = await dl;
        check(bname + " deadline download fired", !!d);
        if (d) {
          check(bname + " deadline filename", d.suggestedFilename() === "demo-credit-deadline-2026-07-09.ics", d.suggestedFilename());
          const tmp = path.join(OUT, bname + "-deadline.ics");
          await d.saveAs(tmp);
          const text = fs.readFileSync(tmp, "utf8");
          const unfolded = text.replace(/\r\n[ \t]/g, "");
          const m = unfolded.match(/DESCRIPTION:([^\r]*)/);
          const raw = m ? m[1].replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\") : "";
          const paras = raw.split("\n\n");
          check(bname + " DESCRIPTION has 4 paragraphs", paras.length === 4, paras);
          check(bname + " DESCRIPTION lead has Jul 9, 2026", paras[0] && paras[0].includes("Jul 9, 2026"), paras[0]);
          check(bname + " DESCRIPTION window verbatim", paras[1] === WINDOW, paras[1]);
          check(bname + " DESCRIPTION day60 verbatim with [VERIFY]", paras[2] === DAY60, paras[2]);
          check(bname + " DESCRIPTION foot verbatim", paras[3] === FOOT, paras[3]);
          check(bname + " all-day VALUE=DATE 20260709/10 no TZID", /DTSTART;VALUE=DATE:20260709/.test(text) && /DTEND;VALUE=DATE:20260710/.test(text) && !/DTSTART;TZID/.test(text));
          check(bname + " deadline SUMMARY exact", /SUMMARY:Demo: estimated retest credit deadline/.test(text));
        }
      }
    }

    // Error path: mocked Blob failure
    await page.goto(BASE + "?demo=promo#/after/dis", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-action="cal-deadline"]');
    await page.evaluate(() => {
      const box = document.getElementById("toasts");
      if (box) box.innerHTML = "";
      window.CC_ICS.downloadIcs = function () { throw new Error("blob failed"); };
    });
    await page.click('[data-action="cal-deadline"]');
    const err = page.locator(".toast").filter({ hasText: "Couldn't download the calendar file" });
    await err.first().waitFor({ state: "visible", timeout: 3000 });
    check(bname + " err toast shown", (await err.count()) >= 1 && (await err.first().textContent()).includes("Couldn't download the calendar file"));
    check(bname + " err toast role status", await err.first().getAttribute("role") === "status");
    check(bname + " err toast aria-live polite", await err.first().getAttribute("aria-live") === "polite");

    await browser.close();
  }

  const summary = { pass, fail, results };
  fs.writeFileSync(path.join(OUT, "cal-ui.json"), JSON.stringify(summary, null, 2));
  console.log("CAL UI RESULT", pass, pass, fail); // keep a pass/fail pair
  console.log("CAL UI " + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
