/** rc21: F06 single readiness model, D53 Checkride-ready Home card, F03 after-checkride outcome. */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const { injectReadyState } = require("./ready-inject");
const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT) throw Error("OUT required");
if (SH) fs.mkdirSync(SH, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 360)); };

const liveStorageKey = () => {
  // Mirrors app.js KEY: cc-connect-proto-v3[:nc][:demo-DATE]
  return `(function(){var keys=Object.keys(localStorage).filter(function(x){return x.indexOf("cc-connect-proto-v3")===0});var demo=window.CC_DEMO_DATE;if(demo){var hit=keys.find(function(x){return x.indexOf(":demo-"+demo)!==-1});if(hit)return hit;}return keys.sort(function(a,b){return b.length-a.length})[0]||("cc-connect-proto-v3"+(demo?":demo-"+demo:""));})()`;
};
const stateOf = (page) => page.evaluate(() => {
  const keys = Object.keys(localStorage).filter((x) => x.startsWith("cc-connect-proto-v3"));
  const demo = window.CC_DEMO_DATE;
  const k = (demo && keys.find((x) => x.includes(":demo-" + demo))) || keys.sort((a, b) => b.length - a.length)[0];
  return { key: k, s: JSON.parse(localStorage[k] || "{}") };
});

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
    const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "?demo=promo#/");
    await page.waitForFunction(() => window.CC_ELIG && window.CC_APP_READY !== false);
    await page.waitForFunction(() => document.querySelector(".page, #app"));

    // --- F06 migration of a flat rc20 localStorage doc ---
    const migrated = await page.evaluate(() => {
      const demo = window.CC_DEMO_DATE;
      const live = "cc-connect-proto-v3" + ":nc" + (demo ? ":demo-" + demo : "");
      const keys = new Set(Object.keys(localStorage).filter((k) => k.startsWith("cc-connect-proto-v3")));
      keys.add(live);
      keys.add("cc-connect-proto-v3");
      const flat = {
        v: 3, fl: 1, ms: 1, p4: 1, role: "pilot", nextId: 2000, slots: [], bookings: [],
        avail: {}, alerts: [], notifications: [], checklist: {}, curated: {}, ticks: {}, tier: "free",
        target: "2026-12", ready9: { kt: true, exp: true }, ready9Dates: { kt: "2026-01-15" },
        ready9CfiReviewed: false, ktSample: false, pending: [], approvedDpes: [], actingDpe: "d1",
        savedExaminers: [], savedSearches: [], demoUser: { name: "Example", role: "pilot", goal: "ir" },
        readinessCert: null,
        onboarding: { status: "done", source: "test", completedAt: Date.now() }
      };
      for (const k of keys) localStorage.setItem(k, JSON.stringify(flat));
      return [...keys];
    });
    await page.reload();
    await page.waitForFunction(() => window.CC_ELIG);
    await page.goto(BASE + "?demo=promo#/readiness");
    await page.waitForSelector("#readiness-cert, [data-ready-cert], .ready9");
    const afterMig = await stateOf(page);
    const r9 = afterMig.s.ready9 || {};
    const dates = afterMig.s.ready9Dates || {};
    const tickMap = afterMig.s.ready9CfiReviewed || {};
    // Docs: wrap under planning cert (readinessCert / findCert / demoUser.goal, else ppl).
    // readinessCert is null, goal is ir, but D45 planning cert stays PPL when evidence exists without a pin.
    // Migrate uses readinessCert || findCert || demoUser.goal || ppl → ir if it follows that list strictly.
    // We implemented: s.readinessCert || s.findCert || s.demoUser.goal || ppl → "ir"
    const cert = r9.ir ? "ir" : (r9.ppl ? "ppl" : null);
    check(bname + " rc20 flat ready9 migrated under a cert", !!cert && r9[cert] && r9[cert].kt === true && r9[cert].exp === true && !("kt" in r9 && r9.kt === true), { cert, r9 });
    check(bname + " rc20 flat ready9Dates migrated", !!(dates[cert] && dates[cert].kt === "2026-01-15"), dates);
    check(bname + " lone boolean CFI tick wrapped", typeof tickMap === "object" && tickMap[cert] === false, tickMap);
    check(bname + " official list is of 9", /of 9 ready/.test(await page.locator("body").innerText()) && !/of 2[14] ready/.test(await page.locator("body").innerText()));

    // Pin to ppl and tick items; then tick CFI; untick one item; only that cert's tick clears.
    await injectReadyState(page, "review");
    await page.reload();
    await page.waitForFunction(() => window.CC_ELIG);
    await page.goto(BASE + "?demo=promo#/readiness");
    await page.waitForSelector(".ready-tick, ol.ready9");
    check(bname + " readiness shows CFI tick at 9 of 9", await page.locator(".ready-tick").count() === 1);
    const tickLabel = page.locator('[data-copy-key="ready.tick.label"]').first();
    check(bname + " tick label verbatim", await tickLabel.count() === 1 && (await tickLabel.textContent()).trim() === "My CFI has reviewed this");
    await page.locator(".ready-tick input").check();
    await page.waitForTimeout(200);
    let st = await stateOf(page);
    check(bname + " ticking stores S.ready9CfiReviewed[ppl]", !!(st.s.ready9CfiReviewed && st.s.ready9CfiReviewed.ppl), st.s.ready9CfiReviewed);
    // also set IR tick in storage to prove clear is per-cert
    await page.evaluate(() => {
      const k = Object.keys(localStorage).find((x) => x.startsWith("cc-connect-proto-v3"));
      const s = JSON.parse(localStorage[k]);
      s.ready9.ir = { kt: true, exp: true, end: true, med: true, iacra: true, docs: true, id: true, terms: true, prep: true };
      s.ready9CfiReviewed.ir = true;
      localStorage.setItem(k, JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector("ol.ready9");
    // uncheck first item (kt)
    const firstBox = page.locator("ol.ready9 input[data-r9]").first();
    if (await firstBox.isChecked()) await firstBox.uncheck();
    else await firstBox.click();
    await page.waitForTimeout(250);
    st = await stateOf(page);
    const cleared = await page.locator('[data-copy-key="ready.tick.cleared"]').count();
    check(bname + " untick clears only ppl CFI tick", st.s.ready9CfiReviewed.ppl === false && st.s.ready9CfiReviewed.ir === true, st.s.ready9CfiReviewed);
    check(bname + " announces ready.tick.cleared", cleared === 1 && (await page.locator('[data-copy-key="ready.tick.cleared"]').textContent()).trim() === "Your CFI review note was cleared because an item is no longer marked done. Nothing was sent.");
    check(bname + " cleared notice is polite status", await page.locator(".ready-tick-cleared").getAttribute("role") === "status" && await page.locator(".ready-tick-cleared").getAttribute("aria-live") === "polite");

    // Self-untick of CFI box: no cleared notice, returns to review
    await injectReadyState(page, "ready");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/readiness");
    await page.waitForSelector(".ready-tick input");
    await page.locator(".ready-tick input").uncheck();
    await page.waitForTimeout(200);
    check(bname + " self-untick does not announce cleared", await page.locator('[data-copy-key="ready.tick.cleared"]').count() === 0);
    st = await stateOf(page);
    check(bname + " self-untick leaves review state", st.s.ready9CfiReviewed.ppl === false);

    // --- D53 Home card placement and states ---
    for (const [state, attr] of [["not_started", "not_started"], ["progress", "progress"], ["review", "review"], ["ready", "ready"]]) {
      await injectReadyState(page, state);
      await page.reload();
      await page.waitForFunction(() => window.CC_ELIG);
      await page.goto(BASE + "?demo=promo#/home");
      await page.waitForSelector("[data-ready-card], .ready-card, .home-v3");
      const order = await page.evaluate(() => {
        const chips = document.querySelector("[data-plan-chips], .fr-chips, #home-plan, .home-v3");
        const card = document.querySelector("[data-ready-card]");
        const search = document.querySelector("form.search-box, form[data-form=search]");
        const mil = document.querySelector(".card.milestone, a.milestone");
        const all = [...document.querySelectorAll("form.search-box, [data-ready-card], .fr-chips, [data-fr-chips]")];
        return {
          hasCard: !!card,
          state: card && card.getAttribute("data-ready-card"),
          milestone: !!mil,
          cardBeforeSearch: !!(card && search && !!(card.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING)),
          progressbar: !!(card && card.querySelector('[role="progressbar"]')),
          imgOnBar: !!(card && card.querySelector('.seg9[role="img"]')),
          eyebrow: card && (card.querySelector('[data-copy-key="ready.eyebrow"]') || {}).textContent
        };
      });
      check(bname + " Home " + state + " card present", order.hasCard && order.state === attr, order);
      check(bname + " Home " + state + " before search, no milestone", order.cardBeforeSearch && !order.milestone, order);
      check(bname + " Home " + state + " progressbar not img", order.progressbar && !order.imgOnBar, order);
      check(bname + " Home " + state + " eyebrow verbatim", String(order.eyebrow || "").trim() === "CHECKRIDE-READY", order);
      if (SH) await page.screenshot({ path: path.join(SH, bname + "-home-" + state + ".png"), fullPage: true }).catch(() => {});
    }

    await injectReadyState(page, "ready");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/home");
    await page.waitForSelector("[data-ready-card=ready]");
    check(bname + " Home Ready headline verbatim", (await page.locator('[data-copy-key="ready.headline.ready"]').textContent()).trim() === "You marked that your CFI has reviewed this.");
    check(bname + " Home Ready keeps tick helper", (await page.locator('[data-copy-key="ready.tick.helper"]').first().textContent()).trim() === "You marked this. The app can't verify it.");
    const tickBox = page.locator("[data-ready-card] .ready-tick");
    check(bname + " Home tick is 44px target", await tickBox.evaluate((el) => el.getBoundingClientRect().height >= 44));

    // Countdown: confirmed date wins; this-month line
    await injectReadyState(page, "progress");
    await page.evaluate(() => {
      const k = Object.keys(localStorage).find((x) => x.startsWith("cc-connect-proto-v3"));
      const s = JSON.parse(localStorage[k]);
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const g = (t) => parts.find((p) => p.type === t).value;
      s.target = `${g("year")}-${g("month")}`;
      localStorage.setItem(k, JSON.stringify(s));
    });
    await page.reload();
    await page.goto(BASE + "?demo=promo#/home");
    await page.waitForSelector("[data-ready-card]");
    const monthLine = await page.locator(".ready-count").textContent();
    check(bname + " target month uses this-month copy", /This is your target month/.test(monthLine), monthLine);

    // F06 On track suppression
    await injectReadyState(page, "due");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/journey");
    await page.waitForSelector(".page");
    const jourEl = page.locator("#journey-ready");
    const jour = (await jourEl.count()) ? await jourEl.innerText() : await page.locator(".page").innerText();
    check(bname + " Journey does not show On track at 0 within 7 days", !/On track/.test(jour), jour.slice(0, 400));
    check(bname + " Journey shows ready.due.*", /of 9 ready/.test(jour) && (/days to go|1 day to go|Your checkride is today/.test(jour)), jour.slice(0, 400));

    // F06 attestations feed ready9
    await injectReadyState(page, "not_started");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/readiness");
    st = await stateOf(page);
    check(bname + " not started is 0 of 9", !(st.s.ready9.ppl && Object.values(st.s.ready9.ppl).some(Boolean)));

    // F03 Home prompt, hide Cancel morning after, next offer after Passed only
    await injectReadyState(page, "past");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/home");
    await page.waitForSelector(".page");
    const homePrompt = page.locator('[data-after-entry] [data-copy-key="after.entry.prompt"]');
    check(bname + " Home shows How did it go? group", await homePrompt.count() === 1, await page.locator("body").innerText().then((x) => x.slice(0, 400)));
    check(bname + " Home prompt verbatim", await homePrompt.count() === 1 && (await homePrompt.first().textContent()).trim() === "How did it go?");
    const groupMin = await page.locator(".after-entry-actions a").first().evaluate((el) => el.getBoundingClientRect().height);
    check(bname + " Home after-entry targets 44px", groupMin >= 44, groupMin);
    await page.goto(BASE + "?demo=promo#/bookings");
    check(bname + " Cancel hidden morning after (no outcome yet)", await page.locator('[data-action="pilot-cancel"][data-id="bkpast"]').count() === 0);
    check(bname + " bookings still shows prompt until saved", await page.locator('[data-after-entry][data-booking="bkpast"]').count() === 1);

    await page.locator('[data-after-entry][data-booking="bkpast"] [data-after-choice="pass"]').click();
    await page.waitForSelector("[data-after=pass]");
    check(bname + " after.next on pass screen", await page.locator("[data-after-next] [data-copy-key='after.next.headline']").textContent().then((t) => t.trim() === "Set a next checkride?"));
    check(bname + " after.next body no eligibility claim", /planning default only, not eligibility or CFI approval/.test(await page.locator("[data-after-next]").innerText()));
    st = await stateOf(page);
    const pastB = (st.s.bookings || []).find((b) => b.id === "bkpast");
    check(bname + " Passed saved on booking", pastB && pastB.outcome === "pass", pastB);

    await page.goto(BASE + "?demo=promo#/home");
    check(bname + " Home hides prompt after saved outcome", await page.locator("[data-after-entry]").count() === 0);
    check(bname + " Home shows after.next after Passed", await page.locator("[data-after-next]").count() >= 1);

    await injectReadyState(page, "past");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/bookings");
    await page.locator('[data-after-choice="dis"]').first().click();
    await page.waitForSelector("[data-after=dis]");
    check(bname + " Not passed does not offer after.next", await page.locator("[data-after-next]").count() === 0);
    await page.goto(BASE + "?demo=promo#/home");
    check(bname + " Home has no after.next after Not passed", await page.locator("[data-after-next]").count() === 0);

    // RC20-I02: after-demo and after-screen sub lines use the full fictional name "Lauren Pike", not first().
    const bareFirst = (txt) => /with Lauren(?! Pike)/.test(txt);
    const F20_SUB = "Private Pilot with Lauren Pike · Fri, Oct 30, 2026 · 9:00 AM ET, at XNC08";
    for (const kind of ["pass", "dis", "inc"]) {
      await page.goto(BASE + "?demo=promo#/after/" + kind);
      await page.waitForSelector("[data-after='" + kind + "']");
      const subKey = kind === "pass" ? "pass.sub" : ("after." + kind + ".sub");
      const sub = (await page.locator('[data-copy-key="' + subKey + '"]').textContent()).replace(/\s+/g, " ").trim();
      const body = await page.locator(".page").innerText();
      check(bname + " RC20-I02 " + kind + " demo sub is the F20 Lauren Pike fill", sub === F20_SUB, sub);
      check(bname + " RC20-I02 " + kind + " demo page has no first-name-only Lauren", !bareFirst(body), body.slice(0, 400));
      const rebook = page.locator('[data-copy-key="after.rebook"]');
      if (await rebook.count()) {
        const rt = (await rebook.textContent()).trim();
        check(bname + " RC20-I02 " + kind + " rebook uses Lauren Pike", /Lauren Pike/.test(rt) && !bareFirst(rt), rt);
      }
    }
    // Booking-backed after screens (d5 / Lauren Pike at XNC08)
    await injectReadyState(page, "past");
    await page.reload();
    for (const kind of ["pass", "dis", "inc"]) {
      await page.goto(BASE + "?demo=promo#/after/" + kind + "?bookingId=bkpast");
      await page.waitForSelector("[data-after='" + kind + "']");
      const subKey = kind === "pass" ? "pass.sub" : ("after." + kind + ".sub");
      const sub = (await page.locator('[data-copy-key="' + subKey + '"]').textContent()).replace(/\s+/g, " ").trim();
      check(bname + " RC20-I02 " + kind + " booking-backed sub uses Lauren Pike", /with Lauren Pike/.test(sub) && !bareFirst(sub), sub);
    }
    // Home "How did it go?" prompt variant must not introduce a first-name-only sub line
    await injectReadyState(page, "past");
    await page.reload();
    await page.goto(BASE + "?demo=promo#/home");
    await page.waitForSelector(".page");
    const homeTxt = await page.locator(".page").innerText();
    check(bname + " RC20-I02 Home prompt has no first-name-only Lauren", !bareFirst(homeTxt), homeTxt.slice(0, 400));
    if (await page.locator("[data-after-entry]").count()) {
      const entryTxt = await page.locator("[data-after-entry]").first().innerText();
      check(bname + " RC20-I02 Home after-entry has no first-name-only Lauren", !bareFirst(entryTxt), entryTxt);
    }

    await browser.close();
  }

  fs.writeFileSync(path.join(OUT, "rc21.json"), JSON.stringify({ pass, fail, results }, null, 2));
  console.log("RESULT", pass, fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
