/** D49 wait-time card + RC15-I01 Calendar student-label keys. Copy from ux-copy-v3.md §11.12 / §12. */
const fs = require("fs");
const path = require("path");
const ROOT = process.env.CC_APP || path.resolve(__dirname, "../..");

require(path.join(ROOT, "wait-time-sample-nc.js"));
require(path.join(ROOT, "wait-time.js"));
const W = global.CC_WAIT;
const DATA = global.CC_WAIT_DATA;
if (!W || !DATA) throw Error("CC_WAIT / CC_WAIT_DATA not loaded");

const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => {
  results.push({ name, pass: !!yes, data });
  yes ? pass++ : fail++;
  console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 400));
};

const ASOF = "2026-11-10";
const TZ = "America/New_York";

function ymdAdd(ymd, n) {
  const [Y, M, D] = ymd.split("-").map(Number);
  const dt = new Date(Y, M - 1, D + n);
  const p = (x) => String(x).padStart(2, "0");
  return dt.getFullYear() + "-" + p(dt.getMonth() + 1) + "-" + p(dt.getDate());
}

function ev(id, confirmedYmd, waitDays, source) {
  return {
    examinerId: id,
    source: source || "verified_booking",
    tz: TZ,
    firstConfirmedAt: confirmedYmd + "T12:00:00-05:00",
    firstConfirmedTestDate: ymdAdd(confirmedYmd, waitDays),
    requestSubmittedAt: confirmedYmd + "T09:00:00-05:00",
    waitCalendarDays: waitDays,
    fictional: true
  };
}

function nEvents(id, n, newestYmd, waitDays) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(ev(id, ymdAdd(newestYmd, -i * 3), waitDays == null ? 14 : waitDays));
  return out;
}

// ---------- unit: rounding ----------
const ROUND = [
  [0, "under 1 week"], [3, "under 1 week"], [6, "under 1 week"],
  [7, "about 1 week"], [10, "about 1 week"],
  [11, "about 2 weeks"], [13, "about 2 weeks"], [14, "about 2 weeks"], [17, "about 2 weeks"],
  [18, "about 3 weeks"],
];
ROUND.forEach(([days, phrase]) => {
  check("unit durationPhrase " + days + " → " + phrase, W.durationPhrase(days) === phrase, { days, got: W.durationPhrase(days) });
  const headline = phrase === "under 1 week" ? W.defaultCopy["wait.headline.under"]
    : phrase === "about 1 week" ? W.defaultCopy["wait.headline.week"]
    : W.fill(W.defaultCopy["wait.headline.weeks"], [phrase.replace("about ", "").replace(" weeks", "")]);
  const formatted = W.formatCard({ enough: true, n: 9, stale: false, medianDays: days, p25Days: days, p75Days: days });
  check("unit headline " + days, formatted.headline === "Typical wait: " + phrase && formatted.duration === phrase, formatted);
});
check("unit 24.5 days → 4 weeks", W.weeksFromMedianDays(24.5) === 4 && W.durationPhrase(24.5) === "about 4 weeks", { weeks: W.weeksFromMedianDays(24.5), phrase: W.durationPhrase(24.5) });

// 0–6 must not become "about 1 week" even though 4–6 would half-up
[4, 5, 6].forEach((d) => check("unit 0–6 precedence over half-up at " + d, W.weeksFromMedianDays(d) == null && W.durationPhrase(d) === "under 1 week", { d, w: W.weeksFromMedianDays(d) }));

// ---------- unit: empty states ----------
function emptyOf(n) {
  return W.formatCard({ enough: false, n, stale: n > 0, medianDays: null, p25Days: null, p75Days: null });
}
const e0 = emptyOf(0);
check("unit empty N=0 headline", e0.headline === "Not enough bookings yet.");
check("unit empty N=0 detail_zero", e0.detail === W.defaultCopy["wait.empty.detail_zero"] && e0.detailKey === "wait.empty.detail_zero", e0);
check("unit empty N=0 no stale note and no number", !e0.stale && e0.staleNote === "" && !/\d+\s+weeks/.test(e0.headline + e0.detail), e0);
const e1 = emptyOf(1);
check("unit empty N=1 uses detail_one", e1.detail === W.defaultCopy["wait.empty.detail_one"] && e1.detailKey === "wait.empty.detail_one", e1);
[2, 3, 7].forEach((n) => {
  const e = emptyOf(n);
  const want = W.fill(W.defaultCopy["wait.empty.detail_some"], [String(n)]);
  check("unit empty N=" + n + " uses detail_some", e.detail === want && e.headline === "Not enough bookings yet." && !e.stale && e.staleNote === "", e);
});

// ---------- unit: N=7 vs 8 ----------
const newestOk = "2026-10-20"; // well under 60 days before 2026-11-10
const s7 = W.typicalWait(nEvents("x7", 7, newestOk, 14), ASOF);
const s8 = W.typicalWait(nEvents("x8", 8, newestOk, 14), ASOF);
check("unit N=7 not enough, no median", s7.enough === false && s7.n === 7 && s7.medianDays == null, s7);
check("unit N=8 enough, has median", s8.enough === true && s8.n === 8 && s8.medianDays === 14, s8);
check("unit N=7 card has no typical-wait number", !/Typical wait: about|Typical wait: under/.test(W.formatCard(s7).headline), W.formatCard(s7));

// ---------- unit: stale 60 / 61, numbers stay, N>=8 only ----------
const day60 = "2026-09-11"; // 60 days before asOf — not stale
const day61 = "2026-09-10"; // 61 days — stale
const t60 = W.typicalWait(nEvents("s60", 8, day60, 20), ASOF);
const t61 = W.typicalWait(nEvents("s61", 8, day61, 20), ASOF);
check("unit newest 60 days is not stale", t60.stale === false && t60.daysSinceNewest === 60 && t60.enough === true, t60);
check("unit newest 61 days is stale", t61.stale === true && t61.daysSinceNewest === 61 && t61.enough === true, t61);
const f60 = W.formatCard(t60);
const f61 = W.formatCard(t61);
check("unit stale note hidden at 60", f60.staleNote === "" && f60.headline.startsWith("Typical wait:"), f60);
check("unit stale note shown at 61 and numbers remain", f61.staleNote === W.defaultCopy["wait.stale"] && f61.headline.startsWith("Typical wait:") && /Median \d+ days/.test(f61.detail) && !f61.detail.includes(f61.staleNote), f61);

const staleButEmpty = W.typicalWait(nEvents("sE", 7, day61, 20), ASOF);
const fEmptyStale = W.formatCard(staleButEmpty);
check("unit N=7 with 61-day newest is empty not stale", staleButEmpty.n === 7 && fEmptyStale.staleNote === "" && fEmptyStale.headline === "Not enough bookings yet.", { stats: staleButEmpty, display: fEmptyStale });

// ---------- unit: p1–p3 excluded ----------
["p1", "p2", "p3"].forEach((id) => {
  const card = W.cardForExaminer(id, { data: DATA, events: nEvents(id, 12, newestOk, 18) });
  check("unit " + id + " shows no card", W.showsCard(id) === false && card === null, { id, shows: W.showsCard(id), card });
});
check("unit d1 still shows a card", W.showsCard("d1") === true && W.cardForExaminer("d1").stats.enough === true, W.cardForExaminer("d1").stats);

// ---------- unit: fixture parity (stale kept off detail) ----------
DATA.profiles.forEach((p) => {
  const card = W.cardForExaminer(p.examinerId);
  const st = p.stats;
  const got = card.stats;
  const same = got.n === st.n && got.enough === st.enough && got.stale === st.stale
    && got.medianDays === st.medianDays && got.p25Days === st.p25Days && got.p75Days === st.p75Days
    && got.daysSinceNewest === st.daysSinceNewest;
  check("unit fixture stats " + p.examinerId, same, { want: st, got });
  const wantDetail = (st.display.detail || "").replace(/\s*No new bookings in the last 60 days — this may be out of date\.$/, "");
  const wantHead = st.display.headline.replace(/\.$/, ""); // empty headline in fixture may omit period? 
  // fixture empty headline is "Not enough bookings yet" without period in some gens? check exact
  const headOk = card.display.headline === st.display.headline || card.display.headline === st.display.headline + "." || card.display.headline.replace(/\.$/, "") === st.display.headline.replace(/\.$/, "");
  const detOk = card.display.detail === wantDetail;
  const staleOk = st.stale && st.enough ? card.display.staleNote === W.defaultCopy["wait.stale"] : card.display.staleNote === "";
  check("unit fixture display " + p.examinerId, headOk && detOk && staleOk, { wantHead: st.display.headline, gotHead: card.display.headline, wantDetail, gotDetail: card.display.detail, staleNote: card.display.staleNote, fixtureDetail: st.display.detail });
});

// self-reported excluded
const mixed = nEvents("mix", 8, newestOk, 14).concat([ev("mix", newestOk, 3, "self_reported")]);
check("unit self-reported excluded from N", W.typicalWait(mixed, ASOF).n === 8, W.typicalWait(mixed, ASOF));

const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");

const COPY_EXPECT = {
  "wk.cal.students_amber": "They also see “Last confirmed [n] days ago.”",
  "wk.cal.students_stale": "They see “Not recently confirmed,” and your slots are hidden from search and requests until you confirm.",
  "wk.cal.students_note": "Students see when you last confirmed, in the same wording they see on your openings.",
  "wait.proto": "Prototype: fictional sample bookings, not real wait times.",
  "wait.empty.headline": "Not enough bookings yet.",
  "wait.stale": "No new bookings in the last 60 days — this may be out of date.",
  "wait.how_label": "How this is measured",
};

function measureOverflow() {
  const de = document.documentElement;
  const body = document.body;
  const sw = Math.max(de.scrollWidth, body.scrollWidth);
  const cw = de.clientWidth;
  const card = document.querySelector("#wait-card");
  const r = card ? card.getBoundingClientRect() : null;
  const cardOverflow = !!(r && (r.right > cw + 1 || r.width > cw + 1));
  return { sw, cw, delta: sw - cw, overflow: sw > cw || cardOverflow, card: r && { w: r.width, right: r.right }, path: location.hash };
}

async function seedDpeDays(page, daysAgo) {
  await page.goto(BASE + "?demo=promo#/");
  await page.waitForFunction(() => window.CC_WK && window.CC_APP_READY);
  await page.evaluate((daysAgo) => {
    const at = Date.now() - daysAgo * 864e5;
    const rec = { confirmedAt: at, updatedAt: at, reminderDay: 0, pauseReminders: false };
    window.CC_WK.mutate((S) => {
      S.role = "dpe";
      S.actingDpe = "d1";
      S.avail = S.avail || {};
      S.avail.d1 = rec;
    });
  }, daysAgo);
  await page.reload();
  await page.waitForFunction(() => window.CC_WK && window.CC_APP_READY);
  // Re-stamp after reload so demo-clock Date.now() still yields the intended bucket.
  await page.evaluate((daysAgo) => {
    const at = Date.now() - daysAgo * 864e5;
    window.CC_WK.mutate((S) => {
      S.role = "dpe";
      S.actingDpe = "d1";
      S.avail = S.avail || {};
      S.avail.d1 = { confirmedAt: at, updatedAt: at, reminderDay: 0, pauseReminders: false };
    });
  }, daysAgo);
}

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});

    // COPY keys + profile cards at 390
    {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(BASE + "?demo=promo#/dpe/d1?cert=ppl");
      await page.waitForFunction(() => window.CC_APP_READY);
      await page.waitForSelector("#wait-card, .profile, .page");

      const copy = await page.evaluate((keys) => {
        const src = window.CC_WK && window.CC_WK.copy ? window.CC_WK.copy.bind(window.CC_WK) : null;
        const out = {};
        keys.forEach((k) => { out[k] = src ? window.CC_WK.copy(k) : (window.COPY && window.COPY[k]); });
        // fallback: read from a data-copy-key if needed
        return out;
      }, Object.keys(COPY_EXPECT));
      // CC_WK.copy may need probing
      const copy2 = await page.evaluate((expect) => {
        const got = {};
        const has = (k) => {
          if (window.CC_WK && typeof window.CC_WK.copy === "function") return window.CC_WK.copy(k);
          if (window.CC_WK && typeof window.CC_WK.copyHas === "function" && window.CC_WK.copyHas(k)) {
            try { return window.CC_WK.copy(k); } catch (e) { return null; }
          }
          return null;
        };
        Object.keys(expect).forEach((k) => { got[k] = has(k); });
        return got;
      }, COPY_EXPECT);
      // Merge: prefer copy2
      const gotCopy = Object.keys(COPY_EXPECT).every((k) => (copy2[k] || copy[k]) === COPY_EXPECT[k]);
      check(bname + " COPY wait.* and wk.cal.students_* verbatim", gotCopy, { expect: COPY_EXPECT, copy, copy2 });

      const d1 = await page.evaluate(() => {
        const card = document.querySelector("#wait-card");
        if (!card) return { missing: true };
        const text = card.innerText;
        const how = card.querySelector(".wait-how-label, [data-copy-key='wait.how_label']");
        const hr = how ? how.getBoundingClientRect() : null;
        return {
          headline: (card.querySelector(".wait-headline") || {}).textContent,
          detail: (card.querySelector(".wait-detail") || {}).textContent,
          proto: (card.querySelector(".wait-proto") || {}).textContent,
          stale: (card.querySelector(".wait-stale") || null) && card.querySelector(".wait-stale").textContent,
          how: how && how.textContent,
          howH: hr && hr.height,
          howW: hr && hr.width,
          aria: card.getAttribute("aria-label"),
          role: card.getAttribute("role"),
          n: card.getAttribute("data-wait-n"),
          enough: card.getAttribute("data-wait-enough"),
          text,
          hasFulfill: /fulfill/i.test(text),
          hasNational: /national|compared to/i.test(text),
        };
      });
      check(bname + " d1 card headline about 4 weeks", d1.headline === "Typical wait: about 4 weeks", d1);
      check(bname + " d1 proto label", d1.proto === COPY_EXPECT["wait.proto"], d1);
      check(bname + " d1 detail has numbers, no stale", /Median 26 days/.test(d1.detail || "") && !d1.stale, d1);
      check(bname + " d1 how-control >= 44px", d1.how === "How this is measured" && d1.howH >= 44 && d1.howW >= 44, d1);
      check(bname + " d1 region + no fulfillment/national", d1.role === "region" && !d1.hasFulfill && !d1.hasNational, d1);
      await page.screenshot({ path: path.join(SH, bname + "-wait-d1-390.png"), fullPage: true });
      const ov390 = await page.evaluate(measureOverflow);
      check(bname + " 390 #/dpe/d1 no h-overflow", !ov390.overflow, ov390);

      // stale card: numbers stay, note visible
      await page.goto(BASE + "?demo=promo#/dpe/nc17?cert=ppl");
      await page.waitForSelector("#wait-card");
      const nc17 = await page.evaluate(() => {
        const card = document.querySelector("#wait-card");
        return {
          headline: card.querySelector(".wait-headline").textContent,
          detail: card.querySelector(".wait-detail").textContent,
          stale: (card.querySelector(".wait-stale") || {}).textContent || "",
          proto: card.querySelector(".wait-proto").textContent,
          n: card.getAttribute("data-wait-n"),
          staleFlag: card.getAttribute("data-wait-stale"),
        };
      });
      check(bname + " nc17 (61-day newest) stale note + numbers stay",
        nc17.headline === "Typical wait: about 5 weeks"
        && /Median 33 days/.test(nc17.detail)
        && /Based on 9 bookings/.test(nc17.detail)
        && !nc17.detail.includes(COPY_EXPECT["wait.stale"])
        && nc17.stale === COPY_EXPECT["wait.stale"]
        && nc17.proto === COPY_EXPECT["wait.proto"], nc17);

      // empty zero
      await page.goto(BASE + "?demo=promo#/dpe/nc28?cert=ppl");
      await page.waitForSelector("#wait-card");
      const z = await page.evaluate(() => {
        const card = document.querySelector("#wait-card");
        return {
          headline: card.querySelector(".wait-headline").textContent,
          detail: card.querySelector(".wait-detail").textContent,
          stale: !!(card.querySelector(".wait-stale")),
          n: card.getAttribute("data-wait-n"),
        };
      });
      check(bname + " nc28 N=0 empty detail_zero, no stale, no number",
        z.headline === "Not enough bookings yet."
        && z.detail === "We'll show a typical wait after 8 bookings in the last 180 days."
        && !z.stale && z.n === "0", z);

      // empty some (N=3), fixture stale flag ignored
      await page.goto(BASE + "?demo=promo#/dpe/d13?cert=ppl");
      await page.waitForSelector("#wait-card");
      const some = await page.evaluate(() => {
        const card = document.querySelector("#wait-card");
        return {
          headline: card.querySelector(".wait-headline").textContent,
          detail: card.querySelector(".wait-detail").textContent,
          stale: !!(card.querySelector(".wait-stale")),
          n: card.getAttribute("data-wait-n"),
        };
      });
      check(bname + " d13 N=3 empty detail_some, no stale note",
        some.headline === "Not enough bookings yet."
        && some.detail === "Based on 3 bookings in the last 180 days — we need 8 to show a typical wait."
        && !some.stale, some);

      // p1–p3 no card
      for (const id of ["p1", "p2", "p3"]) {
        await page.goto(BASE + "?demo=promo#/dpe/" + id + "?cert=ppl");
        await page.waitForFunction(() => window.CC_APP_READY);
        await page.waitForTimeout(150);
        const has = await page.evaluate(() => !!document.querySelector("#wait-card"));
        check(bname + " " + id + " profile has no wait card", has === false, { id, has });
      }

      // not on Search or Calendar
      await page.goto(BASE + "?demo=promo#/find");
      await page.waitForFunction(() => window.CC_APP_READY);
      const onFind = await page.evaluate(() => !!document.querySelector("#wait-card"));
      check(bname + " Search has no wait card", onFind === false, { onFind });

      // I01 Calendar copy
      await seedDpeDays(page, 10);
      await page.goto(BASE + "?demo=promo#/dpe-openings");
      await page.waitForFunction(() => window.CC_APP_READY);
      await page.waitForSelector("[data-copy-key='wk.cal.students_note']");
      const amber = await page.evaluate(() => {
        const body = document.body.innerText;
        const note = (document.querySelector("[data-copy-key='wk.cal.students_note']") || {}).textContent || "";
        const fr = window.CC_WK && window.CC_WK.freshOf ? window.CC_WK.freshOf("d1") : null;
        return {
          note,
          days: fr && fr.days,
          level: fr && fr.level,
          bodyHasAmber: /They also see “Last confirmed 10 days ago\.”/.test(body),
          bodyHasStale: /They see “Not recently confirmed,”/.test(body),
          retiredConfirm: /confirm with the examiner/i.test(body),
          retiredTag: /may be out of date/i.test(body),
          lead: /Students currently see your next open date as/.test(body),
        };
      });
      check(bname + " I01 amber students_amber + students_note, retired phrases gone",
        amber.bodyHasAmber && amber.note === COPY_EXPECT["wk.cal.students_note"] && amber.lead && !amber.bodyHasStale && !amber.retiredConfirm && !amber.retiredTag, amber);
      await page.screenshot({ path: path.join(SH, bname + "-cal-amber-390.png"), fullPage: true });

      await seedDpeDays(page, 20);
      await page.goto(BASE + "?demo=promo#/dpe-openings");
      await page.waitForFunction(() => window.CC_APP_READY);
      const stale = await page.evaluate(() => {
        const body = document.body.innerText;
        const note = (document.querySelector("[data-copy-key='wk.cal.students_note']") || {}).textContent || "";
        return {
          note,
          bodyHasStale: /They see “Not recently confirmed,” and your slots are hidden from search and requests until you confirm\./.test(body),
          bodyHasAmber: /They also see “Last confirmed/.test(body),
          retiredConfirm: /confirm with the examiner/i.test(body),
          retiredTag: /may be out of date/i.test(body),
        };
      });
      check(bname + " I01 stale students_stale + students_note, retired phrases gone",
        stale.bodyHasStale && stale.note === COPY_EXPECT["wk.cal.students_note"] && !stale.bodyHasAmber && !stale.retiredConfirm && !stale.retiredTag, stale);

      await seedDpeDays(page, 100);
      await page.goto(BASE + "?demo=promo#/dpe-openings");
      await page.waitForFunction(() => window.CC_APP_READY);
      const rev = await page.evaluate(() => /They see “Not recently confirmed,” and your slots are hidden from search and requests until you confirm\./.test(document.body.innerText));
      check(bname + " I01 reverify uses students_stale (same copy)", rev === true, { rev });

      // Calendar has no wait-time card
      const calWait = await page.evaluate(() => !!document.querySelector("#wait-card"));
      check(bname + " Calendar has no wait card", calWait === false, { calWait });

      await ctx.close();
    }

    // 360 + 1440 overflow on wait cards
    for (const [vw, vh] of [[360, 800], [1440, 900]]) {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: vw, height: vh } });
      const page = await ctx.newPage();
      for (const hash of ["#/dpe/d1?cert=ppl", "#/dpe/nc17?cert=ppl", "#/dpe/nc28?cert=ppl"]) {
        await page.goto(BASE + "?demo=promo" + hash);
        await page.waitForSelector("#wait-card");
        await page.waitForTimeout(80);
        const ov = await page.evaluate(measureOverflow);
        check(bname + " " + vw + " " + hash + " no h-overflow", !ov.overflow, ov);
        if (hash.includes("d1")) await page.screenshot({ path: path.join(SH, bname + "-wait-d1-" + vw + ".png"), fullPage: true });
      }
      await ctx.close();
    }

    await browser.close();
  }

  fs.writeFileSync(path.join(OUT, "wait-time.json"), JSON.stringify({ pass, fail, results }, null, 2));
  console.log("wait-time", { pass, fail });
  if (fail) process.exit(1);
})().catch((err) => { console.error(err); process.exit(1); });
