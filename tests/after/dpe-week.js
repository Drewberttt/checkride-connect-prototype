/** Confirm this week's availability (#/dpe-week) — D48 start-only, wk.* copy, no parked end-time keys. */
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("OUT/SHOTS required");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
let pass = 0, fail = 0; const results = [];
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 300)); };

const PARKED = ["wk.sheet.end", "wk.err.end_before", "wk.err.overlap"];
const LIVE = [
  "wk.confirm", "wk.cal.link", "wk.err.duplicate", "wk.err.past", "wk.day.locked",
  "wk.fresh.just_now", "wk.fresh.amber", "wk.fresh.stale", "wk.fresh.never", "wk.fresh.stale_detail",
  "wk.sheet.start", "wk.sheet.airport", "wk.sheet.note"
];

async function seedPage(page, availPatch, extra) {
  await page.goto(BASE + "?demo=promo#/");
  await page.waitForFunction(() => window.CC_WK && window.CC_APP_READY);
  await page.evaluate(({ availPatch, extra }) => {
    window.CC_WK.mutate((S) => {
      S.role = "dpe";
      S.actingDpe = (extra && extra.actingDpe) || "d1";
      S.avail = S.avail || {};
      Object.assign(S.avail, availPatch || {});
      if (extra && extra.slots) S.slots = (S.slots || []).concat(extra.slots);
    });
  }, { availPatch, extra: extra || {} });
  await page.reload();
  await page.waitForFunction(() => window.CC_WK && window.CC_APP_READY);
}

(async () => {
  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});

    // --- default timezone ET, 390 ---
    {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await seedPage(page, null);
      await page.evaluate(() => {
        const now = Date.now();
        window.CC_WK.mutate((S) => {
          S.role = "dpe"; S.actingDpe = "d1"; S.avail = S.avail || {};
          const rec = (at) => ({ confirmedAt: at, updatedAt: at, reminderDay: 0, pauseReminders: false });
          Object.assign(S.avail, {
            d1: rec(now - 2 * 3600e3),
            d2: rec(now - 10 * 864e5),
            d3: rec(now - 20 * 864e5),
            d4: rec(now - 100 * 864e5),
            d5: rec(null),
          });
        });
      });
      await page.reload();
      await page.waitForFunction(() => window.CC_WK && window.CC_APP_READY);

      // COPY map: live keys present, parked keys absent
      const copyInfo = await page.evaluate(({ live, parked }) => {
        const missing = live.filter((k) => !window.CC_WK.copyHas(k));
        const parkedPresent = parked.filter((k) => window.CC_WK.copyHas(k));
        return { missing, parkedPresent, keys: window.CC_WK.keys(), dup: window.CC_WK.copy("wk.err.duplicate") };
      }, { live: LIVE, parked: PARKED });
      check(bname + " live wk.* keys present", copyInfo.missing.length === 0, copyInfo.missing);
      check(bname + " parked keys absent from COPY", copyInfo.parkedPresent.length === 0, copyInfo.parkedPresent);
      check(bname + " wk.err.duplicate start-only wording", copyInfo.dup === "That start time is already on [Mon, Nov 9]. Pick a different start.", copyInfo.dup);

      // Route + Calendar tab
      await page.goto(BASE + "?demo=promo#/dpe-week");
      await page.waitForSelector(".wk-page");
      const routeBits = await page.evaluate(() => {
        const pageEl = document.querySelector(".wk-page");
        const confirm = document.querySelector("#wk-confirm, [data-copy-key='wk.confirm']");
        const cal = document.querySelector('#nav a[href="#/dpe-openings"]');
        const endFields = [...document.querySelectorAll("label, [data-copy-key], input, select")].filter((el) => {
          const t = ((el.getAttribute("data-copy-key") || "") + " " + (el.textContent || "") + " " + (el.getAttribute("name") || "")).toLowerCase();
          return /wk\.sheet\.end|wk\.err\.end_before|wk\.err\.overlap|\bend time\b|\bend-time\b/.test(t);
        }).map((el) => el.outerHTML.slice(0, 200));
        return {
          hash: location.hash,
          hasPage: !!pageEl,
          confirmText: confirm ? confirm.textContent.trim() : "",
          calCurrent: !!(cal && (cal.getAttribute("aria-current") === "page" || cal.classList.contains("active"))),
          calHref: cal ? cal.getAttribute("href") : null,
          calClass: cal ? cal.className : null,
          role: document.documentElement.getAttribute("data-role") || (document.querySelector("#role-select") || {}).value,
          headline: (document.querySelector("[data-copy-key='wk.headline']") || {}).textContent || "",
          endFields,
        };
      });
      check(bname + " route #/dpe-week renders", routeBits.hash.includes("/dpe-week") && routeBits.hasPage, routeBits);
      check(bname + " Looks right, confirm week on week page", routeBits.confirmText.includes("Looks right, confirm week"), routeBits);
      check(bname + " Calendar tab current on #/dpe-week", routeBits.calCurrent, routeBits);
      check(bname + " no parked key or end-time UI at runtime", routeBits.endFields.length === 0, routeBits.endFields);
      await page.screenshot({ path: path.join(SH, bname + "-dpe-week-390.png"), fullPage: true });

      // Confirm + undo
      const before = await page.evaluate(() => window.CC_WK.availOf("d1").confirmedAt);
      await page.click("#wk-confirm");
      await page.waitForTimeout(300);
      const after = await page.evaluate((before) => {
        const toastHost = document.getElementById("toasts");
        const toast = toastHost ? toastHost.textContent : "";
        const at = window.CC_WK.availOf("d1").confirmedAt;
        return {
          confirmedAt: at,
          before,
          now: Date.now(),
          toast,
          stamp: (document.querySelector("[data-copy-key='wk.confirmed.stamp']") || {}).textContent || "",
          undo: !!(document.querySelector("[data-action='saved-undo']")),
        };
      }, before);
      check(bname + " confirm stamps confirmedAt", after.confirmedAt && after.confirmedAt !== before && Math.abs(after.confirmedAt - after.now) < 5000, after);
      check(bname + " confirm toast + undo", /Week confirmed/.test(after.toast) && after.undo, after);
      check(bname + " stamp uses reader zone ET", /ET/.test(after.stamp) && /Confirmed /.test(after.stamp), after.stamp);
      if (after.undo) {
        await page.click("[data-action='saved-undo']");
        await page.waitForTimeout(200);
        const undone = await page.evaluate(() => ({ at: window.CC_WK.availOf("d1").confirmedAt, toast: (document.querySelector("#toasts") || document.body).innerText }));
        check(bname + " undo restores previous confirmedAt", undone.at === before, undone);
        check(bname + " undone toast", /Confirmation undone/.test(undone.toast), undone.toast.slice(0, 200));
      } else {
        check(bname + " undo restores previous confirmedAt", false, after);
        check(bname + " undone toast", false, after);
      }

      // Re-confirm so later checks have a stamp; then validation
      await page.goto(BASE + "?demo=promo#/dpe-week");
      await page.waitForSelector(".wk-page");

      // Three start-only rules via CC_WK.validateSlot + UI
      const val = await page.evaluate(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const todayParts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        const g = (t) => todayParts.find((p) => p.type === t).value;
        const today = `${g("year")}-${g("month")}-${g("day")}`;
        const [Y, M, D] = today.split("-").map(Number);
        const ymd = (dt) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
        const yday = ymd(new Date(Y, M - 1, D - 1));
        const tmrw = ymd(new Date(Y, M - 1, D + 1));
        const dup = window.CC_WK.validateSlot({ date: tmrw, time: "09:00", tz: "America/New_York", used: ["09:00", "13:00"] });
        const past = window.CC_WK.validateSlot({ date: yday, time: "09:00", tz: "America/New_York", used: [] });
        const lead = window.CC_WK.validateSlot({ date: today, time: "23:30", tz: "America/New_York", used: [] });
        const ok = window.CC_WK.validateSlot({ date: tmrw, time: "10:30", tz: "America/New_York", used: ["09:00"] });
        return { today, yday, tmrw, dup, past, lead, ok };
      });
      check(bname + " validate duplicate start", val.dup === "wk.err.duplicate", val);
      check(bname + " validate past start", val.past === "wk.err.past", val);
      check(bname + " validate lead time (today locked)", val.lead === "wk.day.locked", val);
      check(bname + " validate ok unique future start", val.ok == null, val);

      // UI: locked days + add a duplicate on a future open day
      const uiVal = await page.evaluate(() => {
        const locked = [...document.querySelectorAll(".wk-day[data-locked], .wk-day.is-locked")];
        const lockedSwitches = locked.map((d) => ({ date: d.getAttribute("data-date"), disabled: !!(d.querySelector("[role='switch'][disabled], .wk-switch:disabled")), lockedCopy: (d.querySelector("[data-copy-key='wk.day.locked']") || {}).textContent || "", add: !!d.querySelector("[data-action='wk-add']") }));
        let target = null;
        window.CC_WK.mutate((S) => {
          const tz = "America/New_York";
          const dates = window.CC_WK.weekDates(tz, 0);
          const today = dates && window.CC_WK.weekDates ? dates.find(() => true) && dates[0] : null;
          // today is Monday; use slot dates > calendar today in that tz via ymd comparison on locked attrs
        });
        const unlocked = [...document.querySelectorAll(".wk-day:not([data-locked]):not(.is-locked)")];
        for (const d of unlocked) {
          const date = d.getAttribute("data-date");
          const add = d.querySelector("[data-action='wk-add']");
          if (!add) continue;
          let time = null;
          window.CC_WK.mutate((S) => {
            const sl = (S.slots || []).find((s) => s.dpeId === S.actingDpe && s.date === date && s.status !== "removed");
            if (sl) time = sl.time;
          });
          if (time) { target = { date, time }; break; }
        }
        return { lockedCount: locked.length, lockedSwitches, target };
      });
      check(bname + " lead-time days locked in UI", uiVal.lockedCount >= 1 && uiVal.lockedSwitches.every((x) => x.disabled && /started/i.test(x.lockedCopy) && !x.add), uiVal);

      if (uiVal.target) {
        const daySel = `.wk-day[data-date="${uiVal.target.date}"]`;
        const isOpen = await page.evaluate((sel) => {
          const sw = document.querySelector(sel + " [role='switch']");
          return sw && sw.getAttribute("aria-checked") === "true";
        }, daySel);
        if (!isOpen) await page.click(daySel + " [role='switch']");
        // If still no add (just opened), click add after toggle
        if (!(await page.$(daySel + " [data-action='wk-add']"))) {
          await page.click(daySel + " [role='switch']");
        }
        await page.click(daySel + " [data-action='wk-add']");
        await page.waitForSelector("#wk-sheet");
        const sheetFields = await page.evaluate(() => {
          const sheet = document.getElementById("wk-sheet");
          const labels = [...sheet.querySelectorAll("[data-copy-key]")].map((el) => el.getAttribute("data-copy-key"));
          return { labels, hasEnd: /end time|wk\.sheet\.end/i.test(sheet.innerText + sheet.innerHTML) };
        });
        check(bname + " sheet has start/airport/note only", !sheetFields.hasEnd && sheetFields.labels.includes("wk.sheet.start") && sheetFields.labels.includes("wk.sheet.airport") && sheetFields.labels.includes("wk.sheet.note"), sheetFields);
        await page.selectOption("#wk-sheet-start", uiVal.target.time);
        await page.click("#wk-sheet button[type='submit']");
        await page.waitForTimeout(200);
        const err = await page.evaluate(() => {
          const el = document.getElementById("wk-sheet-err");
          return el ? { text: el.textContent, key: el.getAttribute("data-copy-key") } : { text: "", key: "" };
        });
        check(bname + " UI duplicate start shows wk.err.duplicate", err.key === "wk.err.duplicate" && /already on/.test(err.text) && /Pick a different start/.test(err.text), err);
        await page.click("[data-action='wk-sheet-cancel']").catch(() => {});
      } else {
        check(bname + " sheet has start/airport/note only", false, uiVal);
        check(bname + " UI duplicate start shows wk.err.duplicate", false, uiVal);
      }

      // Freshness thresholds via hook (seeded vs never / amber / stale / reverify)
      const fresh = await page.evaluate(() => {
        const ids = ["d1", "d2", "d3", "d4", "d5"];
        return Object.fromEntries(ids.map((id) => [id, { level: window.CC_WK.freshOf(id).level, stale: window.CC_WK.isStale(id), vis: window.CC_WK.freshVisible(id), at: window.CC_WK.availOf(id).confirmedAt }]));
      });
      check(bname + " seeded d1 is ok not stale", fresh.d1.level === "ok" && !fresh.d1.stale && fresh.d1.at, fresh.d1);
      check(bname + " amber 8-14 days", fresh.d2.level === "amber" && !fresh.d2.stale && /Last confirmed/.test(fresh.d2.vis.text) && !/out of date|contact the examiner/i.test(fresh.d2.vis.text), fresh.d2);
      check(bname + " stale >14 uses same label", fresh.d3.level === "stale" && fresh.d3.stale && fresh.d3.vis.text === "Not recently confirmed", fresh.d3);
      check(bname + " reverify >90 uses stale label", fresh.d4.level === "reverify" && fresh.d4.stale && fresh.d4.vis.text === "Not recently confirmed", fresh.d4);
      check(bname + " never confirmed stays null", fresh.d5.level === "never" && fresh.d5.stale && fresh.d5.at == null && fresh.d5.vis.text === "Availability not yet confirmed", fresh.d5);

      // Today prompt + Calendar link; Calendar wording unchanged
      await page.goto(BASE + "?demo=promo#/dpe-today");
      await page.waitForSelector(".page");
      const today = await page.evaluate(() => {
        const prompt = document.getElementById("wk-today-prompt");
        const cta = prompt && prompt.querySelector("[data-copy-key='wk.today.prompt.cta']");
        const weekCta = document.body.innerText.includes("Looks right, confirm week");
        return { hasPrompt: !!prompt, href: cta ? cta.getAttribute("href") : null, weekCtaOnToday: weekCta };
      });
      check(bname + " Today prompt links to #/dpe-week", today.hasPrompt && today.href === "#/dpe-week", today);
      check(bname + " Looks right, confirm week not on Today", !today.weekCtaOnToday, today);

      await page.goto(BASE + "?demo=promo#/dpe-openings");
      await page.waitForSelector(".avail-page, .page");
      const cal = await page.evaluate(() => {
        const link = document.querySelector("[data-copy-key='wk.cal.link']");
        const yes = [...document.querySelectorAll("button")].some((b) => /Yes, nothing changed/.test(b.textContent || ""));
        const weekPhrase = (document.body.innerText || "").includes("Looks right, confirm week");
        return { link: link ? { href: link.getAttribute("href"), text: link.textContent.trim() } : null, yes, weekPhrase };
      });
      check(bname + " Calendar keeps Yes, nothing changed", cal.yes, cal);
      check(bname + " Calendar has Confirm this week link", cal.link && cal.link.href === "#/dpe-week" && cal.link.text === "Confirm this week", cal);
      check(bname + " Looks right, confirm week not on Calendar", !cal.weekPhrase, cal);

      // RC15-I02: locked-day text contrast ≥ 4.5:1 (token --muted, not 0.6 opacity)
      await page.goto(BASE + "?demo=promo#/dpe-week");
      await page.waitForSelector(".wk-page");
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(200);
      const contrast = await page.evaluate(() => {
        const lum = (r, g, b) => {
          const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const parse = (c) => {
          const m = String(c).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([0-9.]+))?\)/);
          if (!m) return null;
          return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
        };
        const blend = (fg, bg) => {
          const a = fg.a == null ? 1 : fg.a;
          return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
        };
        const bgOf = (el) => {
          let n = el;
          while (n && n !== document.documentElement) {
            const s = getComputedStyle(n);
            const p = parse(s.backgroundColor);
            if (p && p.a > 0.01 && s.backgroundColor !== "transparent") {
              const parent = n.parentElement ? bgOf(n.parentElement) : { r: 255, g: 255, b: 255, a: 1 };
              return p.a >= 0.99 ? p : blend(p, parent);
            }
            n = n.parentElement;
          }
          return { r: 247, g: 250, b: 253, a: 1 };
        };
        const ratio = (fg, bg) => {
          const L1 = lum(fg.r, fg.g, fg.b), L2 = lum(bg.r, bg.g, bg.b);
          return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        };
        const hex = (c) => "#" + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
        const day = document.querySelector(".wk-day.is-locked, .wk-day[data-locked]");
        if (!day) return { ok: false, reason: "no locked day" };
        const nodes = [
          ["legend", day.querySelector("legend")],
          ["summary", day.querySelector(".wk-summary")],
          ["locked", day.querySelector(".wk-locked, [data-copy-key='wk.day.locked']")],
        ].filter(([, el]) => el);
        const fieldOp = getComputedStyle(day).opacity;
        const rows = nodes.map(([name, el]) => {
          const cs = getComputedStyle(el);
          let fg = parse(cs.color);
          const bg = bgOf(el);
          const op = parseFloat(cs.opacity) * parseFloat(fieldOp);
          if (op < 0.999) fg = blend({ ...fg, a: op }, bg);
          const r = ratio(fg, bg);
          return { name, color: hex(fg), bg: hex(bg), ratio: +r.toFixed(2), opacity: op, text: (el.textContent || "").trim() };
        });
        return { ok: true, fieldOpacity: fieldOp, rows };
      });
      const allPass = contrast.ok && contrast.rows.length >= 3 && contrast.rows.every((r) => r.ratio >= 4.5) && parseFloat(contrast.fieldOpacity) >= 0.999;
      check(bname + " locked-day contrast >= 4.5:1 via --muted", allPass, contrast);

      const axePath = process.env.AXE_MODULE || "/workspace/checkride-test-tools/node_modules/axe-core/axe.min.js";
      await page.addScriptTag({ path: axePath });
      const axe = await page.evaluate(async () => {
        const res = await axe.run(document.querySelector(".wk-page") || document, { runOnly: { type: "tag", values: ["wcag2aa"] } });
        const cc = res.violations.filter((v) => v.id === "color-contrast");
        const lockedHits = cc.flatMap((v) => v.nodes.filter((n) => /wk-day|wk-summary|wk-locked|legend/i.test((n.target || []).join(" ") + (n.html || "")))).map((n) => n.target);
        return { contrastViolations: cc.length, lockedHits };
      });
      check(bname + " axe color-contrast has no locked-day fails", axe.lockedHits.length === 0, axe);

      await ctx.close();
    }

    // Timezone label in America/Chicago + 360 / 1440 layouts
    {
      const ctx = await browser.newContext({ timezoneId: "America/Chicago", viewport: { width: 360, height: 800 } });
      const page = await ctx.newPage();
      await seedPage(page, { d1: { confirmedAt: Date.now() - 90 * 1000, updatedAt: Date.now() - 90 * 1000, reminderDay: 0, pauseReminders: false } });
      await page.goto(BASE + "?demo=promo#/dpe-week");
      await page.waitForSelector(".wk-page");
      const zone = await page.evaluate(() => {
        const stamp = (document.querySelector("[data-copy-key='wk.confirmed.stamp']") || {}).textContent || "";
        const abs = window.CC_WK.freshVisible("d1").abs;
        const label = window.CC_WK.readerZoneLabel();
        const days = getComputedStyle(document.querySelector(".wk-days")).gridTemplateColumns;
        return { stamp, abs, label, cols: days, stacked: !days || days.split(" ").length === 1 };
      });
      check(bname + " 360 reader zone CT on stamps", zone.label === "CT" && /CT/.test(zone.stamp) && /CT/.test(zone.abs), zone);
      check(bname + " 360 day list stacked", zone.stacked, zone);
      await page.screenshot({ path: path.join(SH, bname + "-dpe-week-360.png"), fullPage: true });
      await ctx.close();
    }
    {
      const ctx = await browser.newContext({ timezoneId: "America/New_York", viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await seedPage(page, { d1: { confirmedAt: Date.now() - 5 * 60000, updatedAt: Date.now() - 5 * 60000, reminderDay: 0, pauseReminders: false } });
      await page.goto(BASE + "?demo=promo#/dpe-week");
      await page.waitForSelector(".wk-page");
      const desk = await page.evaluate(() => {
        const days = document.querySelector(".wk-days");
        const cols = getComputedStyle(days).gridTemplateColumns.split(" ").filter(Boolean);
        const confirm = document.querySelector("#wk-confirm");
        return { colCount: cols.length, confirmVisible: !!(confirm && confirm.offsetParent !== null) };
      });
      check(bname + " 1440 seven-column week grid", desk.colCount === 7, desk);
      await page.screenshot({ path: path.join(SH, bname + "-dpe-week-1440.png"), fullPage: true });
      await ctx.close();
    }

    await browser.close();
  }

  fs.writeFileSync(path.join(OUT, "dpe-week.json"), JSON.stringify({ pass, fail, results }, null, 2));
  console.log("RESULT", pass, fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
