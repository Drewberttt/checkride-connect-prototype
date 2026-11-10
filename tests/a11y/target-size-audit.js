/** QA-011 target-size audit (rc19).
 *  Every static route, all 31 profiles, wk.* / wait.* / after/* states,
 *  360 and 390, Chromium + Firefox, light and dark.
 *  Pass if the effective hit area is ≥ 44×44 CSS px, or WCAG 2.5.8
 *  inline-text or spacing (24px circle) exception applies.
 *  Writes only to OUT (set OUT/SHOTS outside the app tree).
 */
const fs = require("fs");
const path = require("path");
try { if (process.stdout._handle && process.stdout._handle.setBlocking) process.stdout._handle.setBlocking(true); } catch (e) { /* */ }
const ROOT = process.env.CC_APP || path.resolve(__dirname, "../..");
const OUT = process.env.OUT;
const SH = process.env.SHOTS;
if (!OUT) throw new Error("OUT required (write evidence outside the app tree)");
fs.mkdirSync(OUT, { recursive: true });
if (SH) fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");

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
  const src = fs.readFileSync(path.join(ROOT, "sample-nc-examiners.js"), "utf8");
  const start = src.indexOf('"dpes"');
  if (start < 0) throw Error("NC dpes not found");
  const ids = [...src.slice(start).matchAll(/\n\s+"id":\s*"([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(ids)];
  if (unique.length !== 31) throw Error("expected 31 examiners, got " + unique.length);
  return unique;
}

const SPECIAL = [
  { id: "wait:normal", hash: "#/dpe/d1?cert=ppl", expect: {} },
  { id: "wait:empty-0", hash: "#/dpe/nc28?cert=ppl" },
  { id: "wait:empty-some", hash: "#/dpe/d13?cert=ppl" },
  { id: "wait:stale", hash: "#/dpe/nc17?cert=ppl" },
  { id: "wait:empty-1", hash: "#/dpe/nc28?cert=ppl", injectN1: true },
  { id: "fresh:ok-week", hash: "#/dpe-week", role: "dpe", days: { d1: 2 } },
  { id: "fresh:amber-week", hash: "#/dpe-week", role: "dpe", days: { d1: 10 } },
  { id: "fresh:stale-week", hash: "#/dpe-week", role: "dpe", days: { d1: 20 } },
  { id: "fresh:ok-cal", hash: "#/dpe-openings", role: "dpe", days: { d1: 2 } },
  { id: "fresh:amber-cal", hash: "#/dpe-openings", role: "dpe", days: { d1: 10 } },
  { id: "fresh:stale-cal", hash: "#/dpe-openings", role: "dpe", days: { d1: 20 } },
  { id: "fresh:amber-profile", hash: "#/dpe/d1?cert=ppl", role: "pilot", days: { d1: 10 } },
  { id: "fresh:stale-profile", hash: "#/dpe/d1?cert=ppl", role: "pilot", days: { d1: 20 } },
  { id: "after:pass", hash: "#/after/pass" },
  { id: "after:inc", hash: "#/after/inc" },
  { id: "after:dis", hash: "#/after/dis" },
];

function measureFn() {
  const MIN = 44;
  const SPACE = 24;
  const isVisible = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
    if (el.type === "hidden") return false;
    if (el.closest("[hidden], .sr-only, [aria-hidden='true']")) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  };
  const union = (a, b) => {
    if (!a) return b;
    if (!b) return a;
    const left = Math.min(a.left, b.left), top = Math.min(a.top, b.top);
    const right = Math.max(a.right, b.right), bottom = Math.max(a.bottom, b.bottom);
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  };
  const pseudoBox = (el, which) => {
    const cs = getComputedStyle(el, which);
    if (!cs || cs.content === "none" || cs.content === "normal") return null;
    if (cs.position !== "absolute" && cs.position !== "relative") return null;
    const r = el.getBoundingClientRect();
    const w = parseFloat(cs.width) || 0, h = parseFloat(cs.height) || 0;
    let left = r.left, top = r.top;
    if (cs.left !== "auto") left = r.left + (parseFloat(cs.left) || 0);
    if (cs.top !== "auto") top = r.top + (parseFloat(cs.top) || 0);
    if (cs.transform && cs.transform.includes("matrix")) {
      // 50% / -50% translate used for centered hit pads
    }
    if (w <= 0 || h <= 0) return null;
    // If left/top were 50% with translate(-50%,-50%), approximate a centered box
    if ((cs.left === "50%" || parseFloat(cs.left) === r.width / 2) && (cs.top === "50%" || parseFloat(cs.top) === r.height / 2)) {
      left = r.left + r.width / 2 - w / 2;
      top = r.top + r.height / 2 - h / 2;
    }
    return { left, top, right: left + w, bottom: top + h, width: w, height: h };
  };
  const effectiveBox = (el) => {
    let box = el.getBoundingClientRect();
    box = { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    const label = el.closest("label");
    if (label && label.querySelectorAll("input, select, textarea, button").length <= 1) {
      const lb = label.getBoundingClientRect();
      box = union(box, { left: lb.left, top: lb.top, right: lb.right, bottom: lb.bottom, width: lb.width, height: lb.height });
    }
    box = union(box, pseudoBox(el, "::before"));
    box = union(box, pseudoBox(el, "::after"));
    if (label) {
      box = union(box, pseudoBox(label, "::before"));
      box = union(box, pseudoBox(label, "::after"));
    }
    return box;
  };
  const isInlineText = (el) => {
    if (el.classList.contains("btn") || el.closest("nav, .tabbar, .tabs, header, .cal, .v4-days, .chip, .pill")) return false;
    const tag = el.tagName;
    if (tag !== "A" && tag !== "BUTTON" && el.getAttribute("role") !== "link") return false;
    const parent = el.parentElement;
    if (!parent) return false;
    let textBeside = false;
    for (const n of parent.childNodes) {
      if (n === el || (n.nodeType === 1 && el.contains(n))) continue;
      if (n.nodeType === 3 && n.textContent.trim().length > 0) textBeside = true;
      if (n.nodeType === 1 && /^(SPAN|B|EM|STRONG|I|SMALL)$/.test(n.tagName) && n.textContent.trim()) textBeside = true;
    }
    return textBeside && /^(P|LI|DD|TD|TH|LABEL|SPAN|SMALL|DIV)$/.test(parent.tagName);
  };
  const cssPath = (el) => {
    const parts = [];
    let n = el;
    for (let i = 0; n && n.nodeType === 1 && i < 5; i++, n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift("#" + n.id); break; }
      if (n.getAttribute("data-action")) s += '[data-action="' + n.getAttribute("data-action") + '"]';
      if (n.className && typeof n.className === "string") {
        const c = n.className.trim().split(/\s+/).slice(0, 3).join(".");
        if (c) s += "." + c;
      }
      parts.unshift(s);
    }
    return parts.join(" > ");
  };
  const sel = [
    "a[href]", "button", "input:not([type=hidden])", "select", "textarea", "summary",
    "[role='button']", "[role='link']", "[role='checkbox']", "[role='radio']",
    "[role='switch']", "[role='tab']", "[role='menuitem']",
    "[tabindex]:not([tabindex='-1'])", "[data-action]"
  ].join(",");
  const nodes = [...document.querySelectorAll(sel)].filter(isVisible);
  const unique = [];
  const seen = new Set();
  for (const el of nodes) {
    // If this control is a checkbox/radio inside a label, keep the input (box uses the label).
    if (seen.has(el)) continue;
    seen.add(el);
    unique.push(el);
  }
  const targets = unique.map((el) => {
    const box = effectiveBox(el);
    return {
      el, box,
      name: (el.getAttribute("aria-label") || el.innerText || el.getAttribute("name") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 80),
      sel: cssPath(el),
      tag: el.tagName.toLowerCase() + (el.type ? ":" + el.type : ""),
      w: Math.round(box.width * 10) / 10,
      h: Math.round(box.height * 10) / 10
    };
  }).filter((t) => t.box.width > 0 && t.box.height > 0);

  const intersectsCircle = (box, cx, cy, d) => {
    const r = d / 2;
    const nx = Math.max(box.left, Math.min(cx, box.right));
    const ny = Math.max(box.top, Math.min(cy, box.bottom));
    const dx = cx - nx, dy = cy - ny;
    return (dx * dx + dy * dy) < (r * r) - 0.01;
  };

  const findings = [];
  const ok = [];
  for (const t of targets) {
    const big = t.w >= MIN - 0.5 && t.h >= MIN - 0.5;
    if (big) { ok.push({ ...t, el: undefined, result: "pass-size" }); continue; }
    if (isInlineText(t.el)) { ok.push({ ...t, el: undefined, result: "exception-inline-text" }); continue; }
    const cx = (t.box.left + t.box.right) / 2, cy = (t.box.top + t.box.bottom) / 2;
    let spaced = true;
    for (const o of targets) {
      if (o === t) continue;
      if (intersectsCircle(o.box, cx, cy, SPACE)) { spaced = false; break; }
    }
    if (spaced) { ok.push({ ...t, el: undefined, result: "exception-spacing" }); continue; }
    findings.push({
      name: t.name, sel: t.sel, tag: t.tag, w: t.w, h: t.h,
      result: "fail"
    });
  }
  return {
    hash: location.hash, count: targets.length,
    fail: findings.length,
    passSize: ok.filter((x) => x.result === "pass-size").length,
    exceptionInline: ok.filter((x) => x.result === "exception-inline-text").length,
    exceptionSpacing: ok.filter((x) => x.result === "exception-spacing").length,
    findings,
    exceptions: ok.filter((x) => x.result !== "pass-size").map((x) => ({ name: x.name, sel: x.sel, tag: x.tag, w: x.w, h: x.h, result: x.result }))
  };
}

async function waitReady(page) {
  await page.waitForFunction(() => window.CC_APP_READY || window.CC_WK, { timeout: 20000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(60);
}
async function gotoAudit(page, hash) {
  await page.goto(BASE + "?demo=promo" + hash, { waitUntil: "domcontentloaded" });
  await waitReady(page);
}
async function seedDpe(page, daysById) {
  await page.evaluate((daysById) => {
    if (!window.CC_WK || !window.CC_WK.mutate) return;
    window.CC_WK.mutate((S) => {
      S.avail = S.avail || {};
      Object.keys(daysById).forEach((id) => {
        const at = Date.now() - daysById[id] * 864e5;
        S.avail[id] = { confirmedAt: daysById[id] == null ? null : at, updatedAt: at, reminderDay: 0, pauseReminders: false };
      });
    });
  }, daysById);
}
async function injectWaitN1(page) {
  await page.evaluate(() => {
    const data = window.CC_WAIT_DATA;
    if (!data) return;
    data.nc28 = data.nc28 || [];
    data.nc28.push({ kind: "verified_booking", days: 12, firstConfirmedAt: Date.now() - 12 * 864e5 });
  });
}
async function seedKnownOffenders(page) {
  // A saved alert so #/alerts shows "N matching openings now →"
  await page.evaluate(() => {
    if (!window.CC_WK || !window.CC_WK.mutate) return;
    window.CC_WK.mutate((S) => {
      S.role = S.role || "pilot";
      S.alerts = S.alerts || [];
      if (!S.alerts.some((a) => a.id === "qa011-alert")) {
        S.alerts.push({ id: "qa011-alert", cert: "ppl", near: "KORL", radius: 80, createdAt: Date.now() });
      }
    });
  });
}

(async () => {
  const dpeIds = dpeIdsFromSample();
  const routes = [...STATIC_ROUTES, ...dpeIds.map((id) => "#/dpe/" + id + "?cert=ppl")];
  const widths = [360, 390];
  const themes = ["light", "dark"];
  const browsers = [["chromium", chromium], ["firefox", firefox]];
  const coverage = [];
  const failBag = new Map();
  const exceptionBag = new Map();
  let pages = 0, failPages = 0, failTargets = 0, passSize = 0, exInline = 0, exSpace = 0;

  function keyOf(f) { return f.sel + "|" + f.name + "|" + f.w + "x" + f.h; }

  for (const [bname, type] of browsers) {
    const browser = await type.launch();
    for (const theme of themes) {
      for (const width of widths) {
        const ctx = await browser.newContext({
          viewport: { width, height: 844 },
          colorScheme: theme,
          timezoneId: "America/New_York"
        });
        await ctx.addInitScript((t) => { try { localStorage.setItem("cc-theme", t); } catch (e) {} }, theme);
        const page = await ctx.newPage();
        await gotoAudit(page, "#/");
        await seedKnownOffenders(page);

        const visit = async (label, hash) => {
          const audit = await page.evaluate(measureFn);
          pages++;
          passSize += audit.passSize;
          exInline += audit.exceptionInline;
          exSpace += audit.exceptionSpacing;
          if (audit.fail) {
            failPages++;
            failTargets += audit.fail;
            audit.findings.forEach((f) => {
              const k = keyOf(f);
              if (!failBag.has(k)) failBag.set(k, { ...f, routes: [], count: 0 });
              const rec = failBag.get(k);
              rec.count++;
              if (rec.routes.length < 8) rec.routes.push({ browser: bname, theme, width, label, hash });
            });
          }
          (audit.exceptions || []).forEach((f) => {
            const k = f.result + "|" + f.sel + "|" + f.name;
            if (!exceptionBag.has(k)) exceptionBag.set(k, { ...f, count: 0 });
            exceptionBag.get(k).count++;
          });
          coverage.push({ browser: bname, theme, width, label, hash, fail: audit.fail, passSize: audit.passSize, exceptionInline: audit.exceptionInline, exceptionSpacing: audit.exceptionSpacing, count: audit.count });
        };

        for (const hash of routes) {
          await gotoAudit(page, hash);
          await visit(hash, hash);
        }
        for (const sp of SPECIAL) {
          if (sp.injectN1) {
            await gotoAudit(page, "#/");
            await injectWaitN1(page);
          }
          if (sp.role || sp.days) {
            await gotoAudit(page, "#/");
            await page.evaluate((role) => {
              if (!window.CC_WK) return;
              window.CC_WK.mutate((S) => { if (role) { S.role = role; if (role === "dpe") S.actingDpe = S.actingDpe || "d1"; } });
            }, sp.role || null);
            if (sp.days) await seedDpe(page, sp.days);
          }
          await page.goto(BASE + "?demo=promo" + sp.hash, { waitUntil: "domcontentloaded" });
          await waitReady(page);
          await visit(sp.id, sp.hash);
        }
        await ctx.close();
        console.log("done", bname, theme, width, "pages=" + pages, "fails=" + failTargets, "passSize=" + passSize, "inline=" + exInline, "spacing=" + exSpace);
      }
    }
    await browser.close();
  }

  const unexplained = [...failBag.values()].sort((a, b) => b.count - a.count);
  const summary = {
    recorded: new Date().toISOString(),
    pages, failPages,
    failTargets,
    uniqueFails: unexplained.length,
    passSize, exceptionInline: exInline, exceptionSpacing: exSpace,
    unexplained,
    exceptions: [...exceptionBag.values()].sort((a, b) => b.count - a.count).slice(0, 80)
  };
  fs.writeFileSync(path.join(OUT, "target-size-audit.json"), JSON.stringify(summary, null, 2));
  const md = [];
  md.push("# Target-size audit");
  md.push("");
  md.push("Pages: " + pages + ". Unexplained failures: " + failTargets + " observations / " + unexplained.length + " unique. Pass by size: " + passSize + ". Inline-text exceptions: " + exInline + ". Spacing exceptions: " + exSpace + ".");
  md.push("");
  if (unexplained.length) {
    md.push("## Unexplained failures");
    unexplained.slice(0, 80).forEach((f) => {
      md.push("- `" + f.sel + "` “" + f.name + "” " + f.w + "×" + f.h + " (" + f.count + " obs). e.g. " + JSON.stringify(f.routes[0]));
    });
  } else {
    md.push("No unexplained failures.");
  }
  fs.writeFileSync(path.join(OUT, "TARGET-SIZE.md"), md.join("\n") + "\n");
  console.log("TARGET-SIZE pages=" + pages + " fail=" + failTargets + " unique=" + unexplained.length + " passSize=" + passSize + " inline=" + exInline + " spacing=" + exSpace);
  process.exit(failTargets ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
