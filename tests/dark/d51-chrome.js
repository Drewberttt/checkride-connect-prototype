/* RC17 D51 / design-spec-v3 §23 tests:
   favicon + theme-color follow data-theme; pressed + reduced-motion;
   disabled at full opacity; two-layer focus in light and dark;
   dark hover stays #4A6EE6; no default primary fill on mid-luminance surfaces;
   light accent contrast recheck.
*/
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || "/workspace/checkride-test-tools/node_modules/playwright");
const OUT = process.env.OUT;
const SH = process.env.SHOTS;
if (!OUT || !SH) throw Error("fresh outputs required");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SH, { recursive: true });
const BASE = process.env.BASE_URL || "http://127.0.0.1:8020/";
const APP = process.env.CC_APP || "/workspace/checkride-v4";
let pass = 0, fail = 0;
const results = [];
const check = (name, yes, data) => {
  results.push({ name, pass: !!yes, data });
  yes ? pass++ : fail++;
  console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data)?.slice(0, 500));
};

const relL = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const ch = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
};
const contrast = (a, b) => {
  const L1 = relL(a), L2 = relL(b);
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
};
const normHex = (c) => {
  c = (c || "").trim();
  const h = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (h) {
    let s = h[1];
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    return ("#" + s).toUpperCase();
  }
  const m = c.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
  if (!m) return (c || "").toUpperCase();
  const hex = (n) => Number(n).toString(16).padStart(2, "0");
  return ("#" + hex(m[1]) + hex(m[2]) + hex(m[3])).toUpperCase();
};

(async () => {
  const css = fs.readFileSync(APP + "/styles.css", "utf8");
  const idx = fs.readFileSync(APP + "/index.html", "utf8");
  const app = fs.readFileSync(APP + "/app.js", "utf8");
  const man = fs.readFileSync(APP + "/site.webmanifest", "utf8");
  const sw = fs.readFileSync(APP + "/sw.js", "utf8");

  check("SW is v7.25.0 or later", /const VERSION = "cc-proto-v7\.(2[5-9]|[3-9]\d|\d{3,})\.\d+"/.test(sw) || /const VERSION = "cc-proto-v7\.25\.0"/.test(sw), sw.match(/VERSION = "[^"]+"/)?.[0]);
  check("manifest stays static light theme_color", /"theme_color"\s*:\s*"#ffffff"/.test(man) && /"background_color"\s*:\s*"#f4f6f9"/.test(man));
  check("pre-paint script sets favicon href and theme-color content", /setAttribute\('href',hrefs\[k\]\)/.test(idx) && /setAttribute\('content',dark\?'#0B1424':'#ffffff'\)/.test(idx));
  check("applyTheme swaps favicon href and theme-color content", /applyThemeChrome/.test(app) && /#0B1424/.test(app) && /favicon-dark\.svg/.test(app) && /data-cc-icon/.test(app));

  // Exact pressed CSS from §23.3
  const pressedRe = /\.btn:not\(\.secondary\):not\(\.ghost\):not\(\.bad\):not\(\.good\):active\s*\{[^}]*background:\s*var\(--accent-pressed\);[^}]*transform:\s*scale\(0\.97\);[^}]*box-shadow:\s*inset 0 0 0 2px color-mix\(in srgb,\s*var\(--on-accent\) 35%,\s*transparent\);/s;
  check("§23.3 pressed CSS: same fill + scale(0.97) + inset 2px on-accent 35%", pressedRe.test(css));
  const rmBlock = css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.btn:not\(\.secondary\):not\(\.ghost\):not\(\.bad\):not\(\.good\):active\s*\{[\s\S]*?\}/);
  check("§23.3 reduced-motion pressed: inset only, no scale", !!(rmBlock && /transform:\s*none/.test(rmBlock[0]) && /inset 0 0 0 2px color-mix/.test(rmBlock[0]) && !/scale\(0\.97\)/.test(rmBlock[0])));

  const twoLayer = /box-shadow:\s*0 0 0 2px var\(--surface\),\s*0 0 0 4px var\(--focus\)/;
  check("two-layer focus on .btn.good", /\.btn\.good:focus-visible/.test(css) && twoLayer.test(css));
  check("two-layer focus also on primary buttons (light --focus on --accent is 1.01:1)", /\.btn:not\(\.secondary\):not\(\.ghost\):not\(\.bad\):not\(\.good\):focus-visible/.test(css) && twoLayer.test(css));

  check("disabled uses --disabled at opacity 1 (no fade)", /\.btn\[disabled\],\s*\.btn\[aria-disabled="true"\]\s*\{[^}]*opacity:\s*1;[^}]*color:\s*var\(--disabled\)/.test(css) && !/\.btn\[disabled\][^{]*\{[^}]*opacity:\s*0?\.[0-9]/.test(css));

  // Token values in CSS (skip the comment that mentions [data-theme])
  const blockAfter = (src, needle) => {
    const i = src.indexOf(needle);
    if (i < 0) return "";
    const startB = src.indexOf("{", i);
    let depth = 0, endB = startB;
    for (let j = startB; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") { depth--; if (depth === 0) { endB = j; break; } }
    }
    return src.slice(startB, endB + 1);
  };
  const tokenIn = (block, name) => {
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*([^;]+);", "g");
    const ms = [...block.matchAll(re)];
    return ms.length ? ms[ms.length - 1][1].trim().toUpperCase() : "";
  };
  const rootBlock = blockAfter(css, ':root, :root[data-theme="light"]');
  const darkBlock = blockAfter(css, ':root[data-theme="dark"]');
  check("light --accent #3860E3", tokenIn(rootBlock, "--accent") === "#3860E3");
  check("light --accent-hover stays #2E4BC0", tokenIn(rootBlock, "--accent-hover") === "#2E4BC0");
  check("light --accent-pressed equals #3860E3", tokenIn(rootBlock, "--accent-pressed") === "#3860E3");
  check("light --disabled #626C7E", tokenIn(rootBlock, "--disabled") === "#626C7E");
  check("dark --accent #3860E3", tokenIn(darkBlock, "--accent") === "#3860E3");
  check("dark --accent-hover is exactly #4A6EE6 (not lightened)", tokenIn(darkBlock, "--accent-hover") === "#4A6EE6");
  check("dark --accent-pressed equals #3860E3", tokenIn(darkBlock, "--accent-pressed") === "#3860E3");
  check("dark --headline-accent stays #8FA9FF", tokenIn(darkBlock, "--headline-accent") === "#8FA9FF");
  check("dark --disabled #8C98AC", tokenIn(darkBlock, "--disabled") === "#8C98AC");
  check("dark --focus #C5D2FF", tokenIn(darkBlock, "--focus") === "#C5D2FF");

  const rHoverFocus = contrast("#C5D2FF", "#4A6EE6");
  check("focus #C5D2FF on hover #4A6EE6 is >= 3.01:1 (do not lighten hover)", rHoverFocus + 0.005 >= 3.01, rHoverFocus);
  const rAccSurfRaised = contrast("#3860E3", "#1E2A40");
  const rAccHero = contrast("#3860E3", "#152645");
  const rAccHero2 = contrast("#3860E3", "#132240");
  const rAccSoft = contrast("#3860E3", "#1B2C4F");
  check("documented: accent on surface-raised / hero / accent-soft is under 3:1", rAccSurfRaised < 3 && rAccHero < 3 && rAccHero2 < 3 && rAccSoft < 3, { rAccSurfRaised, rAccHero, rAccHero2, rAccSoft });
  const rLightAccBg = contrast("#3860E3", "#F7FAFD");
  const rLightAccCanvas = contrast("#3860E3", "#F6F9FC");
  const rWhiteOnAcc = contrast("#FFFFFF", "#3860E3");
  const rWhiteOnHoverDark = contrast("#FFFFFF", "#4A6EE6");
  check("light accent #3860E3 on #F7FAFD >= 4.5:1", rLightAccBg + 0.005 >= 4.5, rLightAccBg);
  check("light accent #3860E3 on token-file #F6F9FC >= 4.5:1", rLightAccCanvas + 0.005 >= 4.5, rLightAccCanvas);
  check("white on #3860E3 >= 4.5:1", rWhiteOnAcc + 0.005 >= 4.5, rWhiteOnAcc);
  check("white on dark hover #4A6EE6 >= 4.5:1", rWhiteOnHoverDark + 0.005 >= 4.5, rWhiteOnHoverDark);

  const chromeOf = async (page) => page.evaluate(() => {
    const theme = document.documentElement.dataset.theme;
    const icons = [...document.querySelectorAll('link[rel~="icon"]')].map((l) => ({
      href: l.getAttribute("href"), media: l.getAttribute("media") || "", kind: l.getAttribute("data-cc-icon")
    }));
    const metas = [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => ({
      content: m.getAttribute("content"), media: m.getAttribute("media") || ""
    }));
    return { theme, icons, metas };
  });
  const expectChrome = (label, chrome, dark) => {
    const icons = (chrome.icons || []).filter((i) => i.kind);
    const hrefs = icons.map((i) => i.href || "");
    const darkHref = hrefs.some((h) => /favicon-dark/.test(h));
    const lightHref = hrefs.some((h) => h === "favicon.ico" || /icons\/favicon\.svg$/.test(h) || /icons\/favicon-\d+\.png$/.test(h));
    const meta = (chrome.metas || []).find((m) => !m.media || m.media === "all" || m.media === "") || chrome.metas[0];
    const color = (meta && meta.content || "").toUpperCase();
    if (dark) {
      check(label + " data-theme=dark", chrome.theme === "dark", chrome);
      check(label + " favicon href is dark assets", darkHref && hrefs.every((h) => /favicon-dark|favicon-dark-/.test(h) || !h), hrefs);
      check(label + " theme-color is #0B1424", color === "#0B1424", chrome.metas);
    } else {
      check(label + " data-theme=light", chrome.theme === "light", chrome);
      check(label + " favicon href is light assets", lightHref && !darkHref, hrefs);
      check(label + " theme-color is #ffffff", color === "#FFFFFF", chrome.metas);
    }
  };

  const installProbes = async (page) => {
    await page.addStyleTag({ content: "#d51-probes, #d51-probes * { transition: none !important; animation: none !important; }" });
    await page.evaluate(() => {
      if (document.getElementById("d51-probes")) return;
      const wrap = document.createElement("div");
      wrap.id = "d51-probes";
      wrap.style.cssText = "position:fixed;top:8px;left:8px;z-index:99999;display:flex;gap:8px;align-items:center;background:var(--bg);padding:8px;";
      wrap.innerHTML = '<input id="d51-tabstart" aria-label="d51 tab start" style="width:24px">' +
        '<button type="button" class="btn" id="d51-primary">Primary probe</button>' +
        '<button type="button" class="btn good" id="d51-good">Good probe</button>';
      document.body.appendChild(wrap);
    });
  };

  const forceActive = async (page, sel) => {
    await installProbes(page);
    const loc = page.locator(sel).first();
    await loc.scrollIntoViewIfNeeded();
    const box = await loc.boundingBox();
    if (!box) return null;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(200);
    const style = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { transform: cs.transform, boxShadow: cs.boxShadow, background: cs.backgroundColor, opacity: cs.opacity };
    });
    await page.mouse.up();
    await page.mouse.move(0, 0);
    return style;
  };

  const focusStyle = async (page, sel) => {
    await installProbes(page);
    await page.mouse.move(400, 400);
    await page.locator("#d51-tabstart").click();
    const targetId = sel.includes("good") ? "d51-good" : "d51-primary";
    // One Tab from the input lands on the primary probe; a second lands on .btn.good.
    await page.keyboard.press("Tab");
    if (targetId === "d51-good") await page.keyboard.press("Tab");
    const loc = page.locator("#" + targetId);
    const style = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        outline: cs.outline, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineStyle: cs.outlineStyle,
        boxShadow: cs.boxShadow, background: cs.backgroundColor, focused: document.activeElement === el, id: el.id
      };
    });
    return style;
  };

  const tokensOf = async (page) => page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const val = (n) => (cs.getPropertyValue(n) || "").trim();
    const out = {};
    ["--accent", "--accent-hover", "--accent-pressed", "--focus", "--disabled", "--headline-accent",
     "--surface", "--surface-raised", "--surface-hero", "--surface-hero-2", "--accent-soft", "--on-accent", "--bg", "--on-good", "--good"]
      .forEach((n) => { out[n] = val(n); });
    return out;
  });

  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const b = await type.launch();

    // OS light + in-app Dark, and OS dark + in-app Light, plus System.
    for (const [os, saved, expectDark] of [
      ["light", "dark", true],
      ["dark", "light", false],
      ["light", "light", false],
      ["dark", "dark", true],
      ["dark", "system", true],
      ["light", "system", false],
    ]) {
      const ctx = await b.newContext({ timezoneId: "America/New_York", colorScheme: os, viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript((theme) => { try { localStorage.setItem("cc-theme", theme); } catch (e) { /* */ } }, saved);
      const p = await ctx.newPage();
      await p.goto(BASE + "?demo=promo#/", { waitUntil: "domcontentloaded" });
      await p.waitForSelector("body", { timeout: 15000 });
      await p.waitForTimeout(150);
      const chrome = await chromeOf(p);
      expectChrome(`${bname} OS=${os} saved=${saved}`, chrome, expectDark);
      if (bname === "chromium" && saved === "dark" && os === "light") {
        await p.screenshot({ path: path.join(SH, `${bname}-os-light-inapp-dark-header.png`) });
      }
      await ctx.close();
    }

    // Runtime tokens + pressed + disabled + focus, light and dark
    for (const theme of ["light", "dark"]) {
      const ctx = await b.newContext({ timezoneId: "America/New_York", colorScheme: theme === "dark" ? "dark" : "light", viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
      await ctx.addInitScript((t) => { try { localStorage.setItem("cc-theme", t); } catch (e) { /* */ } }, theme);
      const p = await ctx.newPage();
      await p.goto(BASE + "?demo=promo#/", { waitUntil: "domcontentloaded" });
      await p.waitForSelector(".btn", { timeout: 15000 });
      await installProbes(p);
      const toks = await tokensOf(p);
      if (theme === "dark") {
        check(bname + " computed dark --accent-hover is #4A6EE6", normHex(toks["--accent-hover"]) === "#4A6EE6", toks["--accent-hover"]);
        check(bname + " computed dark --accent-pressed equals --accent #3860E3", normHex(toks["--accent-pressed"]) === "#3860E3" && normHex(toks["--accent"]) === "#3860E3", toks);
        check(bname + " computed dark --headline-accent is #8FA9FF", normHex(toks["--headline-accent"]) === "#8FA9FF", toks["--headline-accent"]);
        check(bname + " computed dark --disabled is #8C98AC", normHex(toks["--disabled"]) === "#8C98AC", toks["--disabled"]);
      } else {
        check(bname + " computed light --accent-hover is #2E4BC0", normHex(toks["--accent-hover"]) === "#2E4BC0", toks["--accent-hover"]);
        check(bname + " computed light --accent / pressed #3860E3", normHex(toks["--accent"]) === "#3860E3" && normHex(toks["--accent-pressed"]) === "#3860E3", toks);
        check(bname + " computed light --disabled is #626C7E", normHex(toks["--disabled"]) === "#626C7E", toks["--disabled"]);
      }

      // No default primary fill sitting on a forbidden mid-luminance surface
      const placements = await p.evaluate(() => {
        const parse = (c) => {
          const m = (c || "").match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
          if (!m) return null;
          const hex = (n) => Number(n).toString(16).padStart(2, "0");
          return ("#" + hex(m[1]) + hex(m[2]) + hex(m[3])).toUpperCase();
        };
        const bgOf = (el) => {
          let n = el;
          while (n && n !== document.documentElement) {
            const bg = parse(getComputedStyle(n).backgroundColor);
            if (bg && bg !== "#000000") {
              // transparent is rgba(0,0,0,0) — already skipped if a=0, parse ignores a; check raw
              const raw = getComputedStyle(n).backgroundColor;
              if (/rgba?\(\s*0,\s*0,\s*0,\s*0/.test(raw) || raw === "transparent") { n = n.parentElement; continue; }
              return bg;
            }
            n = n.parentElement;
          }
          return parse(getComputedStyle(document.body).backgroundColor);
        };
        const root = getComputedStyle(document.documentElement);
        const tok = (n) => parse(getComputedStyle(document.documentElement).getPropertyValue(n) ? (() => {
          // getPropertyValue returns hex or rgb? usually the specified hex in this app
          const v = root.getPropertyValue(n).trim();
          if (v.startsWith("#")) {
            let s = v.slice(1);
            if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
            return ("#" + s).toUpperCase();
          }
          return parse(v);
        })() : null);
        const accent = tok("--accent");
        const forbidden = ["--surface-raised", "--surface-hero", "--surface-hero-2", "--accent-soft"].map((n) => ({ n, hex: tok(n) }));
        const hits = [];
        document.querySelectorAll(".btn").forEach((el) => {
          const cls = " " + el.className + " ";
          if (/\s(secondary|ghost|bad|good)\s/.test(cls)) return;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return;
          const fill = parse(cs.backgroundColor);
          if (fill !== accent) return;
          const adj = bgOf(el.parentElement || el);
          const hit = forbidden.find((f) => f.hex && f.hex === adj);
          if (hit) hits.push({ sel: el.className, fill, adj, token: hit.n });
        });
        return { accent, hits, forbidden };
      });
      check(bname + " " + theme + " no primary fill on surface-raised/hero/accent-soft", placements.hits.length === 0, placements);

      // Pressed: scale + inset (normal motion)
      await p.emulateMedia({ reducedMotion: "no-preference" });
      const pressed = await forceActive(p, "#d51-primary");
      const hasScale = pressed && /matrix\(|scale/.test(pressed.transform) && pressed.transform !== "none";
      // scale(0.97) computed as matrix(0.97, 0, 0, 0.97, ...)
      const scaleAmt = pressed && /matrix\(([^,]+),/.exec(pressed.transform);
      const scaleOk = scaleAmt && Math.abs(parseFloat(scaleAmt[1]) - 0.97) < 0.02;
      const inset = pressed && /inset/i.test(pressed.boxShadow);
      check(bname + " " + theme + " pressed uses scale(0.97) plus inset", !!(scaleOk && inset), pressed);

      // Reduced motion: inset only, no scale
      await p.emulateMedia({ reducedMotion: "reduce" });
      const rm = await forceActive(p, "#d51-primary");
      const noScale = rm && (rm.transform === "none" || rm.transform === "matrix(1, 0, 0, 1, 0, 0)");
      check(bname + " " + theme + " reduced-motion press is inset only (no scale)", !!(noScale && rm && /inset/i.test(rm.boxShadow)), rm);
      await p.emulateMedia({ reducedMotion: "no-preference" });

      // Disabled: full opacity, --disabled color, non-operable
      const dis = await p.evaluate((disabledTok) => {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = "Disabled probe";
        btn.disabled = true;
        btn.setAttribute("data-d51-disabled", "1");
        document.body.appendChild(btn);
        const cs = getComputedStyle(btn);
        const parse = (c) => {
          const m = (c || "").match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
          if (!m) return (c || "").toUpperCase();
          const hex = (n) => Number(n).toString(16).padStart(2, "0");
          return ("#" + hex(m[1]) + hex(m[2]) + hex(m[3])).toUpperCase();
        };
        const root = getComputedStyle(document.documentElement);
        let expect = (root.getPropertyValue("--disabled") || "").trim();
        if (expect.startsWith("#")) {
          let s = expect.slice(1);
          if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
          expect = ("#" + s).toUpperCase();
        } else expect = parse(expect);
        return {
          opacity: cs.opacity,
          color: parse(cs.color),
          expect,
          pointerEvents: cs.pointerEvents,
          cursor: cs.cursor,
          disabled: btn.disabled
        };
      });
      check(bname + " " + theme + " disabled opacity is 1", String(dis.opacity) === "1", dis);
      check(bname + " " + theme + " disabled color is --disabled", dis.color === dis.expect, dis);
      check(bname + " " + theme + " disabled stays non-operable", dis.disabled === true && (dis.pointerEvents === "none" || dis.cursor === "not-allowed"), dis);

      // Focus rings via keyboard
      const primaryFocus = await focusStyle(p, "#d51-primary");
      const shadow = (primaryFocus && primaryFocus.boxShadow) || "";
      const two = /0px 0px 0px 2px/.test(shadow) && /0px 0px 0px 4px/.test(shadow);
      // Firefox may serialize without px on 0
      const twoAlt = /0px 0px 0px 2px|0px 0px 0px 2px|0 0 0 2px/.test(shadow) && /0px 0px 0px 4px|0 0 0 4px/.test(shadow);
      check(bname + " " + theme + " primary two-layer focus ring", !!(primaryFocus && primaryFocus.focused && (two || twoAlt) && (primaryFocus.outlineStyle === "none" || parseFloat(primaryFocus.outlineWidth) === 0)), primaryFocus);

      const goodFocus = await focusStyle(p, "#d51-good");
      const gShadow = (goodFocus && goodFocus.boxShadow) || "";
      const gTwo = /0px 0px 0px 2px|0 0 0 2px/.test(gShadow) && /0px 0px 0px 4px|0 0 0 4px/.test(gShadow);
      check(bname + " " + theme + " .btn.good two-layer focus ring", !!(goodFocus && goodFocus.focused && gTwo && (goodFocus.outlineStyle === "none" || parseFloat(goodFocus.outlineWidth) === 0)), goodFocus);

      await p.screenshot({ path: path.join(SH, `${bname}-${theme}-d51.png`) });
      await ctx.close();
    }
    await b.close();
  }

  const report = { pass, fail, results, recorded: new Date().toISOString() };
  fs.writeFileSync(path.join(OUT, "d51-chrome.json"), JSON.stringify(report, null, 2));
  console.log("D51 CHECKS pass=" + pass + " fail=" + fail + " total=" + (pass + fail));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
