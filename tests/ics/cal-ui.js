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


const AXE = process.env.AXE_MODULE || "/workspace/checkride-test-tools/node_modules/axe-core/axe.min.js";
async function axeLabelInName(page, scope) {
  const has = await page.evaluate(() => typeof axe !== "undefined");
  if (!has) await page.addScriptTag({ path: AXE });
  return page.evaluate(async (sel) => {
    const root = sel ? document.querySelector(sel) : document;
    const r = await axe.run(root || document, { runOnly: { type: "rule", values: ["label-content-name-mismatch"] } });
    return r.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.html).slice(0, 4) }));
  }, scope || ".cal-ics");
}

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
    const rideAria = await rideBtn.getAttribute("aria-label");
    check(bname + " ride aria is full cal.ride.aria (no prepend)", rideAria === "Add to calendar: downloads a calendar file for this sample checkride. Nothing is sent.", rideAria);
    check(bname + " ride btn has no aria-describedby on cal.helper", await rideBtn.getAttribute("aria-describedby") === null);
    check(bname + " ride helper", await page.locator('[data-cal="ride"] [data-copy-key="cal.helper"]').textContent() === "Downloads a calendar file to this device. The file has no reminders. Nothing is sent.");
    const rideAxe = await axeLabelInName(page, '[data-cal="ride"]');
    check(bname + " ride axe label-content-name-mismatch", rideAxe.length === 0, rideAxe);

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
      const deadlineAria = await btn.getAttribute("aria-label");
      check(bname + " deadline aria is full cal.deadline.aria on " + kind, deadlineAria === "Add credit deadline to calendar: downloads a calendar file for the estimated retest credit deadline. Nothing is sent.", deadlineAria);
      check(bname + " deadline btn has no aria-describedby on " + kind, await btn.getAttribute("aria-describedby") === null);
      check(bname + " deadline helper on " + kind, await page.locator('[data-copy-key="cal.deadline.helper"]').textContent() === "This date is an estimate. Confirm it with your examiner.");
      check(bname + " helper also on " + kind, await page.locator('[data-cal="deadline"] [data-copy-key="cal.helper"]').count() === 1);
      const deadlineAxe = await axeLabelInName(page, '[data-cal="deadline"]');
      check(bname + " deadline axe label-content-name-mismatch on " + kind, deadlineAxe.length === 0, deadlineAxe);
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

    // D55 Label in Name (rc21): extend axe coverage to proto.details, fr.s2.suggest, after.saved
    await page.goto(BASE + "?demo=promo#/home", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".proto-details, .page");
    const protoBtn = page.locator("button.proto-details").first();
    check(bname + " proto.details.aria closed verbatim", (await protoBtn.getAttribute("aria-label")) === "Details: more about this prototype");
    const protoAxeClosed = await axeLabelInName(page, ".proto-merged");
    check(bname + " proto.details closed axe label-content-name-mismatch", protoAxeClosed.length === 0, protoAxeClosed);
    await protoBtn.click();
    check(bname + " proto.details.aria_open swapped verbatim", (await protoBtn.getAttribute("aria-label")) === "Details: hide the extra prototype notes");
    check(bname + " proto.details expanded", (await protoBtn.getAttribute("aria-expanded")) === "true");
    const protoAxeOpen = await axeLabelInName(page, ".proto-merged");
    check(bname + " proto.details open axe label-content-name-mismatch", protoAxeOpen.length === 0, protoAxeOpen);

    await page.goto(BASE + "?demo=promo#/onboarding?edit=1&step=2", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-action="fr-suggest-airport"], .page');
    const suggest = page.locator('[data-action="fr-suggest-airport"]');
    if (await suggest.count()) {
      const suggestAria = await suggest.getAttribute("aria-label");
      const suggestText = (await suggest.textContent()).trim();
      check(bname + " fr.s2.suggest visible starts the aria name", suggestText === "Use XNC01 Tarwick?" && suggestAria === "Use XNC01 Tarwick? A suggestion. XNC01 Tarwick is a fictional sample airport.", { suggestText, suggestAria });
      const suggestAxe = await axeLabelInName(page, '[data-action="fr-suggest-airport"]');
      check(bname + " fr.s2.suggest axe label-content-name-mismatch", suggestAxe.length === 0, suggestAxe);
    } else {
      check(bname + " fr.s2.suggest CTA present for axe", false, await page.locator("body").innerText().then((x) => x.slice(0, 200)));
    }

    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("cc-connect-proto-v3"));
      for (const key of keys) {
        const s = JSON.parse(localStorage.getItem(key) || "{}");
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        const g = (ty) => parts.find((p) => p.type === ty).value;
        const today = `${g("year")}-${g("month")}-${g("day")}`;
        const [Y, M, D] = today.split("-").map(Number);
        const yday = new Date(Date.UTC(Y, M - 1, D - 1)).toISOString().slice(0, 10);
        s.slots = s.slots || [];
        s.bookings = s.bookings || [];
        s.slots = s.slots.filter((x) => x.id !== "slotd55");
        s.bookings = s.bookings.filter((b) => b.id !== "bkd55");
        s.slots.push({ id: "slotd55", dpeId: "d5", date: yday, time: "09:00", airport: "XNC08", status: "booked", certs: ["ppl"], bookingId: "bkd55" });
        s.bookings.push({ id: "bkd55", slotId: "slotd55", dpeId: "d5", cert: "ppl", status: "confirmed", mine: true, outcome: "pass", outcomeAt: Date.now(), applicant: "Alex Demo", createdAt: Date.now() - 864e5 });
        localStorage.setItem(key, JSON.stringify(s));
      }
    });
    await page.reload();
    await page.goto(BASE + "?demo=promo#/bookings", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-outcome="pass"], .page');
    const saved = page.locator('[data-outcome="pass"]').first();
    check(bname + " after.saved pill present", await saved.count() === 1);
    const savedLabel = (await saved.textContent()).trim();
    const savedAria = await saved.getAttribute("aria-label");
    check(bname + " after.saved.aria starts with visible Passed · date", typeof savedAria === "string" && savedAria.startsWith(savedLabel) && savedAria.endsWith("Saved checkride result.") && /^Passed · /.test(savedLabel), { savedLabel, savedAria });
    const savedAxe = await axeLabelInName(page, '[data-outcome="pass"]');
    check(bname + " after.saved axe label-content-name-mismatch", savedAxe.length === 0, savedAxe);

    await browser.close();
  }

  const summary = { pass, fail, results };
  fs.writeFileSync(path.join(OUT, "cal-ui.json"), JSON.stringify(summary, null, 2));
  console.log("CAL UI RESULT", pass, pass, fail); // keep a pass/fail pair
  console.log("CAL UI " + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
