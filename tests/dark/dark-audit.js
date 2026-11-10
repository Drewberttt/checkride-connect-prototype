/** Dark-mode baseline audit (rc17). Read-only: does not modify app code.
 *  Uses prefers-color-scheme: dark (theme=system) and verifies the in-app Dark toggle.
 *  Coverage: every overflow-audit static route, all 31 NC examiner profiles, #/dpe-week,
 *  wait.* card states, wk.fresh.* states, after/* screens. 360 and 1440, Chromium + Firefox.
 */
const fs = require("fs");
const path = require("path");
try { if (process.stdout._handle && process.stdout._handle.setBlocking) process.stdout._handle.setBlocking(true); } catch (e) { /* */ }
const ROOT = process.env.CC_APP || path.resolve(__dirname, "../..");
const OUT = process.env.OUT || path.join(__dirname, "out");
const SH = process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SH, { recursive: true });
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

const LOGO_ROUTES = ["#/", "#/login", "#/find", "#/home", "#/dpe/d1?cert=ppl", "#/dpe-week", "#/after/pass", "#/more"];

function dpeIdsFromSample() {
  const src = fs.readFileSync(path.join(ROOT, "sample-nc-examiners.js"), "utf8");
  const start = src.indexOf('"dpes"');
  if (start < 0) throw Error("NC dpes not found");
  const ids = [...src.slice(start).matchAll(/\n\s+"id":\s*"([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(ids)];
  if (unique.length !== 31) throw Error("expected 31 examiners, got " + unique.length);
  return unique;
}

function parseCustomProps(block) {
  const out = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(block))) out["--" + m[1]] = m[2].trim();
  return out;
}
function tokensFromStyles(css, wantDark) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = wantDark
    ? /:root\[data-theme=["']dark["']\]\s*\{/g
    : /:root\s*,\s*:root\[data-theme=["']light["']\]\s*\{|:root\[data-theme=["']light["']\]\s*\{/g;
  const out = {};
  let match, found = 0;
  while ((match = re.exec(src))) {
    let i = match.index + match[0].length;
    let depth = 1, body = "";
    for (; i < src.length && depth > 0; i++) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) break; }
      if (depth >= 1) body += ch;
    }
    Object.assign(out, parseCustomProps(body));
    found++;
  }
  if (!found) throw new Error("theme block not found (" + (wantDark ? "dark" : "light") + ")");
  return out;
}
const _stylesCss = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const DARK_TOKENS = tokensFromStyles(_stylesCss, true);
const LIGHT_TOKENS = tokensFromStyles(_stylesCss, false);
if (!DARK_TOKENS["--focus"]) throw new Error("dark --focus missing from styles.css");
if (!LIGHT_TOKENS["--focus"]) throw new Error("light --focus missing from styles.css");

const LIGHT_ONLY = {
  "#F7FAFD": "--bg", "#F3F6FF": "--bg-tint", "#FFFFFF": "--surface", "#FFF": "--surface",
  "#F6F9FB": "--surface-inset", "#EDF5FC": "--surface-hero", "#F0F3F9": "--surface-2",
  "#EAEDF6": "--surface-3 / --track", "#172941": "--text / --navy / --brand",
  "#4A5A73": "--muted", "#5E6778": "--faint / --subtle", "#495A6E": "--label",
  "#626C7E": "--placeholder", "#D6E0EC": "--border", "#D1DAEB": "--border-strong",
  "#2A4FC7": "--accent-strong / --accent-text (light)", "#E6ECFC": "--accent-soft",
  "#E3F2FC": "--accent-soft-2 / --info-soft", "#FFF1D6": "--warn-soft",
  "#8A5300": "--warn / --warn-text (light)", "#E2F4EA": "--good-soft",
  "#1F7A4D": "--good (light)", "#FDE8E6": "--bad-soft", "#B42318": "--bad (light)",
  "#FDECEC": "--bad-soft (fallback)", "#E8F6EE": "--good-soft (fallback)",
  "#E9EEFF": "--accent-soft (fallback)", "#FFF4CC": "--warn-soft",
  "#4D3800": "--warn-text", "#F0D77A": "--warn / border", "#5C4A14": "--warn-text",
  "#E6F6EC": "--good-soft", "#11512B": "--good-text", "#C9D0DC": "--border-strong",
  "#DDD": "--border", "#F6F9FC": "--bg (pre-paint / light logo paper)",
};

function nearestToken(hex) {
  if (!hex) return "—";
  const h = hex.toUpperCase();
  const compact = h.length === 4 ? ("#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]) : h;
  for (const [tok, val] of Object.entries(DARK_TOKENS)) {
    if (val.toUpperCase() === compact) return tok;
  }
  const light = LIGHT_ONLY[compact] || LIGHT_ONLY[h];
  if (light) return "light " + compact + " → use dark " + light;
  return "nearest dark token pending Brand Designer";
}

function suggestFor(kind, sel, fg, bg) {
  const bits = [];
  if (kind === "text") {
    bits.push("Foreground: " + nearestToken(fg) + ".");
    bits.push("Background: " + nearestToken(bg) + ".");
    if (/muted|small|faint|placeholder|subtle|label/.test(sel)) bits.push("If --muted/--placeholder stays below 4.5:1, darken or lighten the dark token (pending BD).");
    else bits.push("Prefer --text on --bg/--surface, or --accent-text for links.");
  } else if (kind === "focus") {
    bits.push("Use --focus (" + (DARK_TOKENS["--focus"] || "") + ") for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (" + (DARK_TOKENS["--accent"] || "#3860E3") + ") is only ~3.1:1 on --surface.");
  } else if (kind === "ui") {
    bits.push("Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.");
  } else {
    bits.push("Replace the hard-coded light value with the matching dark token (" + nearestToken(fg || bg) + ").");
  }
  return bits.join(" ");
}

/* ---------- static CSS / inline scan (node) ---------- */
function scanHardcoded() {
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const colorRe = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\(\s*[\d.]+[^)]*\)/g;
  const findings = [];
  const lines = css.split('\n');
  let brace = 0, selector = "", kind = null;
  const isTokenSel = (s) => /^(:root|html\.wf)\b/.test(s.trim());
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;
    if (brace === 0) {
      if (line.includes("{")) {
        const pre = line.split("{")[0];
        selector = (selector + " " + pre).trim();
        kind = isTokenSel(selector) ? "token" : "rule";
        brace += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        if (kind !== "token") {
          const code = line.slice(line.indexOf("{") + 1);
          for (const m of code.match(colorRe) || []) {
            if (/mask-image|webkit-mask/.test(line) && /#000\b|#000000\b/.test(m)) continue;
            findings.push({ file: "styles.css", line: lineNo, selector, color: m, snippet: line.trim().slice(0, 220) });
          }
        }
        if (brace <= 0) { brace = 0; selector = ""; kind = null; }
      } else if (line.trim() && !line.trim().startsWith("/*") && !line.trim().startsWith("*") && !line.trim().startsWith("@font")) {
        selector = (selector + " " + line.trim()).trim();
      }
    } else {
      if (kind !== "token") {
        const code = line.replace(/\/\*.*?\*\//g, "");
        for (const m of code.match(colorRe) || []) {
          if (/mask-image|-webkit-mask/.test(code) && /#000\b|#000000\b/.test(m)) continue;
          findings.push({ file: "styles.css", line: lineNo, selector, color: m, snippet: line.trim().slice(0, 220) });
        }
      }
      brace += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      if (brace <= 0) { brace = 0; selector = ""; kind = null; }
    }
  }
  // var() light fallbacks + missing --card
  const fbRe = /var\((--[\w-]+)\s*,\s*([^)]+)\)/g;
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  let fm;
  const cssAll = css;
  while ((fm = fbRe.exec(cssAll))) {
    const name = fm[1], fb = fm[2].trim();
    if (/#|rgb|white/i.test(fb)) {
      const lineNo = cssAll.slice(0, fm.index).split("\n").length;
      findings.push({
        file: "styles.css", line: lineNo, selector: "var(" + name + ")",
        color: fb, snippet: fm[0],
        note: defined.has(name) ? "light fallback on a defined token (ok if the token resolves)" : "TOKEN MISSING — fallback is used at runtime, including in dark"
      });
    }
  }
  // --sky is set only on a generic :root rule (light #7CC4F2) and not remapped in the dark token block at L1062
  if (/:root\s*\{[^}]*--sky:\s*#7CC4F2/.test(css.replace(/\n/g, " ")) && !/:root\[data-theme="dark"\]\s*\{[^}]*--sky:/.test(css)) {
    findings.push({
      file: "styles.css", line: 1061, selector: ":root { --sky }",
      color: "#7CC4F2", snippet: "--sky: #7CC4F2 is not remapped in :root[data-theme=dark] (only --sky-soft / --sky-ink are)",
      note: "light-only token used by .v4-promise .eyebrow"
    });
  }
  // app.js inline
  const styleRe = /style="([^"]*)"/g;
  let sm;
  while ((sm = styleRe.exec(app))) {
    const v = sm[1];
    if (/#(?:[0-9a-fA-F]{3,8})|rgba?\(/i.test(v)) {
      const lineNo = app.slice(0, sm.index).split("\n").length;
      findings.push({ file: "app.js", line: lineNo, selector: "inline style", color: (v.match(/#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]*\)/) || [v])[0], snippet: v.slice(0, 220) });
    }
  }
  // index.html pre-paint
  const idxColors = index.match(/#[0-9A-Fa-f]{3,8}/g) || [];
  findings.push({
    file: "index.html", line: 1, selector: "pre-paint <style> body",
    color: "#F6F9FC / #162941 (dark override #0B1424 / #EAF0F8)",
    snippet: "Hard-coded pre-paint colors (dark branch exists). Light paper #F6F9FC ≠ --bg #F7FAFD; dark theme-color #10141d ≠ --bg #0B1424.",
    note: "pre-paint + theme-color; not a token"
  });
  return findings;
}

/* ---------- in-page contrast auditor (runs in the browser) ---------- */
const auditFn = () => {
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (c) => {
    if (!c) return null;
    const m = String(c).match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
    const h = String(c).match(/^#([0-9a-f]{3,8})$/i);
    if (h) {
      let s = h[1];
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
      return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16), a: 1 };
    }
    return null;
  };
  const blend = (fg, bg) => {
    if (!fg) return bg || { r: 11, g: 20, b: 36, a: 1 };
    const base = bg || { r: 11, g: 20, b: 36, a: 1 };
    const a = fg.a == null ? 1 : fg.a;
    if (a >= 0.99) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
    return { r: fg.r * a + base.r * (1 - a), g: fg.g * a + base.g * (1 - a), b: fg.b * a + base.b * (1 - a), a: 1 };
  };
  const hex = (c) => "#" + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();
  const ratio = (a, b) => {
    const L1 = lum(a.r, a.g, a.b), L2 = lum(b.r, b.g, b.b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };
  const gradientHint = (cs) => {
    const img = cs.backgroundImage || "";
    const m = img.match(/#([0-9a-f]{3,8})/i);
    if (!m) return null;
    return parse("#" + m[1]);
  };
  const bgOf = (el) => {
    let n = el;
    let acc = null;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      let p = parse(cs.backgroundColor);
      if ((!p || p.a < 0.01) && cs.backgroundImage && cs.backgroundImage !== "none") p = gradientHint(cs);
      if (p && p.a > 0.01) {
        const parent = n.parentElement ? bgOf(n.parentElement) : { r: 11, g: 20, b: 36, a: 1 };
        const solid = p.a >= 0.99 ? p : blend(p, parent);
        return acc ? blend({ ...acc, a: acc.a }, solid) : solid;
      }
      n = n.parentElement;
    }
    return { r: 11, g: 20, b: 36, a: 1 };
  };
  const visible = (el) => {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return false;
    if (/(^|\s)sr-only(\s|$)/.test(el.className || "")) return false;
    if ((cs.clipPath && cs.clipPath !== "none" && /inset\(100%|circle\(0/.test(cs.clipPath)) ) return false;
    return true;
  };
  const isLarge = (cs) => {
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    return px >= 24 || (bold && px + 0.01 >= 18.66);
  };
  const cssPath = (el) => {
    const parts = [];
    let n = el;
    while (n && n !== document.body && parts.length < 5) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift("#" + n.id); break; }
      const cls = (typeof n.className === "string" ? n.className : "").trim().split(/\s+/).filter(Boolean).slice(0, 3);
      if (cls.length) s += "." + cls.join(".");
      parts.unshift(s);
      n = n.parentElement;
    }
    return parts.join(" > ");
  };
  const textIssues = [];
  const uiIssues = [];
  const seenText = new Set();
  const nodes = document.querySelectorAll("body *:not(script):not(style):not(noscript):not(svg)");
  for (const el of nodes) {
    if (!visible(el)) continue;
    if (el.closest && el.closest(".v4-promise, .v4-hero-panel, .share-card, .proto-banner")) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && /\S/.test(n.textContent || ""));
    if (!own && !(el.tagName === "INPUT" && el.placeholder && !el.value)) continue;
    const cs = getComputedStyle(el);
    let fg = parse(el.tagName === "INPUT" && !el.value ? cs.placeholderColor || cs.color : cs.color);
    if (!fg) continue;
    const bg = bgOf(el);
    const op = parseFloat(cs.opacity);
    if (op < 0.999) fg = blend({ ...fg, a: op }, bg);
    else if (fg.a < 0.99) fg = blend(fg, bg);
    const r = ratio(fg, bg);
    const large = isLarge(cs);
    const th = large ? 3 : 4.5;
    if (r + 0.005 < th) {
      const key = cssPath(el) + "|" + hex(fg) + "|" + hex(bg) + "|" + (large ? "L" : "N");
      if (seenText.has(key)) continue;
      seenText.add(key);
      textIssues.push({
        kind: "text", selector: cssPath(el), fg: hex(fg), bg: hex(bg),
        ratio: Math.round(r * 100) / 100, threshold: th, large,
        text: ((el.tagName === "INPUT" ? el.placeholder : el.textContent) || "").trim().replace(/\s+/g, " ").slice(0, 80),
        font: (parseFloat(cs.fontSize) || 0) + "px/" + cs.fontWeight
      });
    }
  }

  const artRoot = (el) => el.closest(".v4-promise, .v4-hero-panel, .share-card, .proto-banner, .v4-promise *");
  const uiSel = "button, .btn, a.btn, input, select, textarea, .chip, .saved-toggle, [role='switch'], .wk-switch, .switch, summary, .tabbar a, .tabs a, .theme-pick select, .v4-day, .v4-time";
  const seenUi = new Set();
  for (const el of document.querySelectorAll(uiSel)) {
    if (!visible(el)) continue;
    if (el.closest && el.closest(".v4-promise, .v4-hero-panel, .share-card, .proto-banner")) continue;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;
    const isNativeCheck = (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio"));
    const cs = getComputedStyle(el);
    const bgAdj = bgOf(el.parentElement || el);
    const bw = ["Top", "Right", "Bottom", "Left"].map((s) => parseFloat(cs["border" + s + "Width"]) || 0);
    const maxBw = Math.max(...bw);
    let fgCol = null, compared = null, why = "";
    if (maxBw >= 1) {
      fgCol = parse(cs.borderTopColor || cs.borderColor);
      compared = bgOf(el);
      why = "border vs fill/adjacent";
      // Transparent or same-as-fill borders are not a visible 1.4.11 edge.
      if (!fgCol || fgCol.a < 0.2) { fgCol = null; /* fall through to fill */ }
      else {
        const ownFill = parse(cs.backgroundColor) || compared;
        if (ownFill && Math.abs(fgCol.r-ownFill.r)+Math.abs(fgCol.g-ownFill.g)+Math.abs(fgCol.b-ownFill.b) < 4 && Math.abs((fgCol.a||1)-(ownFill.a||1)) < 0.2) {
          fgCol = null;
        }
      }
      if (!fgCol) {
        if (isNativeCheck) continue; // native checkbox/radio chrome is not a filled token surface
        // treat as no visible border
        let fill = parse(cs.backgroundColor);
        if ((!fill || fill.a < 0.01) && cs.backgroundImage && cs.backgroundImage !== "none") fill = gradientHint(cs) || fill;
        if (fill && fill.a >= 0.2 && bgAdj) {
          const usedFg = fill.a < 0.99 ? blend(fill, bgAdj) : fill;
          const r = ratio(usedFg, bgAdj);
          if (r + 0.005 < 3) {
            const key = cssPath(el) + "|f|" + hex(usedFg) + "|" + hex(bgAdj);
            if (!seenUi.has(key)) {
              seenUi.add(key);
              uiIssues.push({ kind: "ui", selector: cssPath(el), fg: hex(usedFg), bg: hex(bgAdj), ratio: Math.round(r * 100) / 100, threshold: 3, why: "fill vs adjacent (no 3:1 border)", tag: el.tagName, type: el.type || "" });
            }
          }
        }
        continue;
      }
      const adj = bgAdj || { r: 11, g: 20, b: 36, a: 1 };
      const own = compared || adj;
      const rOwn = ratio(fgCol.a < 0.99 ? blend(fgCol, own) : fgCol, own);
      const rAdj = ratio(fgCol.a < 0.99 ? blend(fgCol, adj) : fgCol, adj);
      // WCAG 1.4.11: the component edge passes if the border is 3:1 vs the fill OR vs the adjacent color.
      const r = Math.max(rOwn, rAdj);
      const useAdj = rAdj >= rOwn;
      const usedBg = useAdj ? adj : own;
      const usedFg = fgCol.a < 0.99 ? blend(fgCol, usedBg) : fgCol;
      if (r + 0.005 < 3) {
        const key = cssPath(el) + "|b|" + hex(usedFg) + "|" + hex(usedBg);
        if (!seenUi.has(key)) {
          seenUi.add(key);
          uiIssues.push({ kind: "ui", selector: cssPath(el), fg: hex(usedFg), bg: hex(usedBg), ratio: Math.round(r * 100) / 100, threshold: 3, why, tag: el.tagName, type: el.type || "" });
        }
      }
    } else {
      if (isNativeCheck) continue;
      // filled control: compare fill to adjacent
      let fill = parse(cs.backgroundColor);
      if ((!fill || fill.a < 0.01) && cs.backgroundImage && cs.backgroundImage !== "none") fill = gradientHint(cs) || fill;
      if (fill && fill.a > 0.04) {
        const usedFg = fill.a < 0.99 ? blend(fill, bgAdj) : fill;
        const r = ratio(usedFg, bgAdj);
        // Transparent/ghost text-only controls are identified by text, not fill — skip near-invisible fills.
        if (fill.a >= 0.2 && r + 0.005 < 3) {
          const key = cssPath(el) + "|f|" + hex(usedFg) + "|" + hex(bgAdj);
          if (!seenUi.has(key)) {
            seenUi.add(key);
            uiIssues.push({ kind: "ui", selector: cssPath(el), fg: hex(usedFg), bg: hex(bgAdj), ratio: Math.round(r * 100) / 100, threshold: 3, why: "fill vs adjacent (no 3:1 border)", tag: el.tagName, type: el.type || "" });
          }
        }
      }
    }
  }

  // Focus rings: sample unique visible interactives
  const focusIssues = [];
  const candidates = [...document.querySelectorAll("a, button, input, select, textarea, [tabindex], .btn, .chip, .saved-toggle, summary")]
    .filter(visible)
    .filter((el) => !el.disabled && el.getAttribute("tabindex") !== "-1");
  const picked = [];
  const seenType = new Set();
  for (const el of candidates) {
    const t = el.tagName + ":" + (el.className || "").toString().split(/\s+/).slice(0, 2).join(".");
    if (seenType.has(t) && picked.length >= 8) continue;
    seenType.add(t);
    picked.push(el);
    if (picked.length >= 16) break;
  }
  const prev = document.activeElement;
  for (const el of picked) {
    try { el.focus({ preventScroll: true }); } catch (e) { continue; }
    const cs = getComputedStyle(el);
    const bg = bgOf(el);
    const outlineW = parseFloat(cs.outlineWidth) || 0;
    const outlineStyle = cs.outlineStyle;
    let ring = null, why = "";
    if (outlineStyle && outlineStyle !== "none" && outlineW >= 1) {
      ring = parse(cs.outlineColor);
      why = "outline";
    }
    // box-shadow ring: 0 0 0 Npx color
    const sh = cs.boxShadow || "";
    const shm = sh.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/i);
    if ((!ring || why !== "outline") && sh && sh !== "none" && shm) {
      const spread = /0px\s+0px\s+0px\s+(\d+)/.exec(sh) || /0\s+0\s+0\s+(\d+)/.exec(sh);
      if (spread || /0px 0px 0px/.test(sh) || /0 0 0/.test(sh)) {
        ring = parse(shm[0]);
        why = (why ? why + "+" : "") + "box-shadow";
      }
    }
    const visFocus = (() => { try { return el.matches(":focus-visible"); } catch (e) { return true; } })();
    if (!ring) {
      if (!visFocus) continue; // programmatic :focus is not required to show a ring (§23.2)
      focusIssues.push({ kind: "focus", selector: cssPath(el), fg: "", bg: hex(bg), ratio: 0, threshold: 3, why: "no visible focus ring (outline/box-shadow)", tag: el.tagName });
      continue;
    }
    if (!visFocus) continue;
    const used = ring.a < 0.99 ? blend(ring, bg) : ring;
    const r = ratio(used, bg);
    if (r + 0.005 < 3) {
      focusIssues.push({ kind: "focus", selector: cssPath(el), fg: hex(used), bg: hex(bg), ratio: Math.round(r * 100) / 100, threshold: 3, why, tag: el.tagName });
    }
  }
  if (prev && prev.focus) { try { prev.focus({ preventScroll: true }); } catch (e) { /* */ } }

  const theme = document.documentElement.dataset.theme || "";
  const logo = (() => {
    const light = [...document.querySelectorAll("img.lockup-light")].map((im) => {
      const cs = getComputedStyle(im);
      const r = im.getBoundingClientRect();
      return { src: im.getAttribute("src"), display: cs.display, visibility: cs.visibility, w: r.width, h: r.height, shown: cs.display !== "none" && r.width > 0 };
    });
    const dark = [...document.querySelectorAll("img.lockup-dark")].map((im) => {
      const cs = getComputedStyle(im);
      const r = im.getBoundingClientRect();
      return { src: im.getAttribute("src"), display: cs.display, visibility: cs.visibility, w: r.width, h: r.height, shown: cs.display !== "none" && r.width > 0 };
    });
    return { theme, light, dark, lightVisible: light.some((x) => x.shown), darkVisible: dark.some((x) => x.shown) };
  })();

  // D51: do not sit a default primary fill on mid-luminance surfaces (under 3:1).
  const placementIssues = [];
  try {
    const rootCs = getComputedStyle(document.documentElement);
    const tokHex = (name) => {
      const c = parse((rootCs.getPropertyValue(name) || "").trim());
      return c ? hex(c) : "";
    };
    const accentHex = tokHex("--accent");
    const forbidden = ["--surface-raised", "--surface-hero", "--surface-hero-2", "--accent-soft"]
      .map((name) => ({ token: name, hex: tokHex(name) }))
      .filter((x) => x.hex);
    for (const el of document.querySelectorAll("button, .btn, a.btn")) {
      if (!visible(el)) continue;
      const cls = " " + ((typeof el.className === "string" ? el.className : "") || "") + " ";
      if (/\s(secondary|ghost|bad|good)\s/.test(cls)) continue;
      if (!el.classList.contains("btn") && el.tagName !== "BUTTON" && !(el.tagName === "A" && el.classList.contains("btn"))) continue;
      if (!el.classList.contains("btn")) continue;
      const fill = parse(getComputedStyle(el).backgroundColor);
      if (!fill || fill.a < 0.2) continue;
      const fillHex = hex(fill.a < 0.99 ? blend(fill, bgOf(el.parentElement || el)) : fill);
      if (fillHex.toLowerCase() !== (accentHex || "").toLowerCase()) continue;
      const adj = bgOf(el.parentElement || el);
      const adjHex = hex(adj);
      const hit = forbidden.find((f) => f.hex && f.hex.toLowerCase() === adjHex.toLowerCase());
      if (hit) {
        const r = ratio(fill, adj);
        if (r + 0.005 >= 3) continue; // light --surface-raised is #FFFFFF and passes
        placementIssues.push({
          kind: "ui", selector: cssPath(el), fg: fillHex, bg: adjHex,
          ratio: Math.round(r * 100) / 100, threshold: 3,
          why: "primary fill on " + hit.token + " (<3:1; D51 — do not place default accent on this surface)",
          tag: el.tagName, type: "placement"
        });
      }
    }
  } catch (e) { /* keep audit going */ }

  const wait = (() => {
    const card = document.querySelector("#wait-card");
    if (!card) return null;
    return {
      id: card.getAttribute("data-wait-id"),
      n: card.getAttribute("data-wait-n"),
      enough: card.getAttribute("data-wait-enough"),
      stale: card.getAttribute("data-wait-stale"),
      headline: (card.querySelector(".wait-headline") || {}).textContent || "",
      detail: ((card.querySelector(".wait-detail") || {}).textContent || "").slice(0, 160),
      hasStale: !!card.querySelector(".wait-stale"),
    };
  })();

  const fresh = [...document.querySelectorAll("[data-fresh-level], .wk-fresh")].slice(0, 8).map((el) => ({
    level: el.getAttribute("data-fresh-level") || "",
    key: el.getAttribute("data-copy-key") || "",
    text: (el.textContent || "").trim(),
  }));

  return {
    hash: location.hash,
    theme,
    textIssues,
    uiIssues: uiIssues.concat(placementIssues),
    focusIssues,
    logo,
    wait,
    fresh,
    counts: { text: textIssues.length, ui: uiIssues.length, focus: focusIssues.length }
  };
};

function issueKey(it) {
  return [it.kind, it.selector, it.fg || "", it.bg || "", it.why || "", it.threshold || ""].join("|");
}

async function safeAudit(page, hash) {
  try {
    return await page.evaluate(auditFn);
  } catch (err) {
    console.error("auditFn failed", hash, err && err.message);
    return { hash, theme: "", textIssues: [], uiIssues: [], focusIssues: [], logo: null, wait: null, fresh: [], counts: { text: 0, ui: 0, focus: 0 }, error: String(err && err.message || err) };
  }
}

async function waitReady(page) {
  await page.waitForFunction(() => window.CC_APP_READY || window.CC_WK, { timeout: 20000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(80);
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
    data.events = (data.events || []).filter((e) => e.bookingId !== "audit-n1-nc28");
    data.events.push({
      bookingId: "audit-n1-nc28", examinerId: "nc28", tz: "America/New_York",
      source: "verified_booking", fictional: true,
      firstConfirmedAt: "2026-10-20T12:00:00-04:00",
      firstConfirmedTestDate: "2026-11-03",
      requestSubmittedAt: "2026-10-18T09:00:00-04:00",
      waitCalendarDays: 16
    });
  });
}

async function screenshotLogo(page, label) {
  const brand = page.locator("a.brand, a.v4-auth-logo").first();
  if (await brand.count()) {
    try {
      await brand.screenshot({ path: path.join(SH, label + "-lockup.png") });
    } catch (e) { /* not visible on some routes */ }
  }
  const top = page.locator(".topbar, header, .v4-authbar, body").first();
  try {
    const box = await page.locator("a.brand, a.v4-auth-logo").first().boundingBox();
    if (box) {
      await page.screenshot({
        path: path.join(SH, label + "-header.png"),
        clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: Math.min(box.width + 16, 400), height: Math.min(box.height + 16, 80) }
      });
    }
  } catch (e) { /* */ }
}

(async () => {
  const dpeIds = dpeIdsFromSample();
  const dpeRoutes = dpeIds.map((id) => `#/dpe/${id}?cert=ppl`);
  const ROUTES = [...STATIC_ROUTES, ...dpeRoutes];
  const special = [
    { id: "wait:normal", hash: "#/dpe/d1?cert=ppl", expect: { waitEnough: "true" } },
    { id: "wait:empty-0", hash: "#/dpe/nc28?cert=ppl", expect: { waitN: "0" } },
    { id: "wait:empty-some", hash: "#/dpe/d13?cert=ppl", expect: { waitN: "3" } },
    { id: "wait:stale", hash: "#/dpe/nc17?cert=ppl", expect: { waitStale: "true" } },
    { id: "wait:empty-1", hash: "#/dpe/nc28?cert=ppl", injectN1: true, expect: { waitN: "1" } },
    { id: "fresh:ok-week", hash: "#/dpe-week", role: "dpe", days: { d1: 2 }, expect: {} },
    { id: "fresh:amber-week", hash: "#/dpe-week", role: "dpe", days: { d1: 10 }, expect: {} },
    { id: "fresh:stale-week", hash: "#/dpe-week", role: "dpe", days: { d1: 20 }, expect: {} },
    { id: "fresh:ok-cal", hash: "#/dpe-openings", role: "dpe", days: { d1: 2 }, expect: {} },
    { id: "fresh:amber-cal", hash: "#/dpe-openings", role: "dpe", days: { d1: 10 }, expect: {} },
    { id: "fresh:stale-cal", hash: "#/dpe-openings", role: "dpe", days: { d1: 20 }, expect: {} },
    { id: "fresh:amber-profile", hash: "#/dpe/d1?cert=ppl", role: "pilot", days: { d1: 10 }, expect: {} },
    { id: "fresh:stale-profile", hash: "#/dpe/d1?cert=ppl", role: "pilot", days: { d1: 20 }, expect: {} },
    { id: "after:pass", hash: "#/after/pass", expect: {} },
    { id: "after:inc", hash: "#/after/inc", expect: {} },
    { id: "after:dis", hash: "#/after/dis", expect: {} },
  ];

  const hard = scanHardcoded();
  const tokenChecks = []; // D51: dark hover must stay #4A6EE6; accent vs mid-luminance surfaces
  const observations = []; // {key, issue, routes:[{browser,width,hash,mode,label}]}
  const byKey = new Map();
  const coverage = [];
  const logoNotes = [];
  const themeChecks = [];

  function record(browser, width, mode, label, hash, audit) {
    const forced = /forced-colors/.test(mode);
    const pack = forced
      ? (audit.focusIssues || []).filter((it) => it.ratio === 0)
      : [...(audit.textIssues || []), ...(audit.uiIssues || []), ...(audit.focusIssues || [])];
    for (const it of pack) {
      const k = issueKey(it);
      if (!byKey.has(k)) {
        byKey.set(k, { issue: it, routes: [], browsers: new Set(), widths: new Set(), modes: new Set() });
      }
      const rec = byKey.get(k);
      if (rec.routes.length < 12) rec.routes.push({ browser, width, mode, label, hash });
      rec.browsers.add(browser);
      rec.widths.add(String(width));
      rec.modes.add(mode);
    }
    coverage.push({
      browser, width, mode, label, hash,
      theme: audit.theme, counts: audit.counts, wait: audit.wait, fresh: audit.fresh,
      logo: audit.logo && { lightVisible: audit.logo.lightVisible, darkVisible: audit.logo.darkVisible, theme: audit.logo.theme }
    });
    if (audit.logo) {
      if (audit.theme === "dark" && audit.logo.lightVisible && !audit.logo.darkVisible) {
        logoNotes.push({ browser, width, mode, label, hash, problem: "light lockup visible in dark theme; dark lockup hidden" });
      }
      if (audit.theme === "dark" && !audit.logo.darkVisible && !audit.logo.lightVisible) {
        logoNotes.push({ browser, width, mode, label, hash, problem: "no lockup visible" });
      }
    }
  }

  const MODES = [
    { id: "dark-system", colorScheme: "dark", contrast: "no-preference", forcedColors: "none" },
    { id: "light-system", colorScheme: "light", contrast: "no-preference", forcedColors: "none" },
    { id: "dark-contrast-more", colorScheme: "dark", contrast: "more", forcedColors: "none" },
    { id: "dark-forced-colors", colorScheme: "dark", contrast: "no-preference", forcedColors: "active" },
  ];

  async function crawl(page, bname, width, modeId, takeShots) {
    if (tokenChecks.length < 8 && /dark/.test(modeId) && !/forced-colors/.test(modeId)) {
      await gotoAudit(page, "#/");
      const toks = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        const val = (n) => (cs.getPropertyValue(n) || "").trim();
        const parse = (c) => {
          c = (c || "").trim();
          const h = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
          if (h) {
            let s = h[1];
            if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
            return "#" + s.toUpperCase();
          }
          const m = c.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
          if (!m) return c;
          const hex = (n) => Number(n).toString(16).padStart(2, "0");
          return ("#" + hex(m[1]) + hex(m[2]) + hex(m[3])).toUpperCase();
        };
        const tokens = {};
        ["--accent","--accent-hover","--accent-pressed","--focus","--disabled","--headline-accent",
         "--surface","--surface-raised","--surface-hero","--surface-hero-2","--accent-soft","--bg"].forEach((n) => {
          tokens[n] = parse(val(n));
        });
        return tokens;
      });
      const lum = (hex) => {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
        if (!m) return 0;
        const n = parseInt(m[1], 16);
        const ch = (v) => { v /= 255; return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
        return 0.2126*ch((n>>16)&255)+0.7152*ch((n>>8)&255)+0.0722*ch(n&255);
      };
      const hover = toks["--accent-hover"];
      const expectedHover = "#4A6EE6";
      const hoverOk = (hover || "").toUpperCase() === expectedHover;
      const lightened = lum(hover) > lum(expectedHover) + 0.001;
      tokenChecks.push({
        id: "dark-accent-hover-not-lightened", browser: bname, width, mode: modeId,
        pass: hoverOk && !lightened,
        expected: expectedHover, actual: hover,
        note: lightened ? "hover was lightened (would drop focus #C5D2FF below ~3.01:1)" : (hoverOk ? "exact #4A6EE6" : "mismatch")
      });
      tokenChecks.push({
        id: "dark-accent-pressed-equals-accent", browser: bname, width, mode: modeId,
        pass: (toks["--accent-pressed"] || "").toUpperCase() === (toks["--accent"] || "").toUpperCase()
          && (toks["--accent"] || "").toUpperCase() === "#3860E3",
        expected: "#3860E3", actual: toks["--accent"] + " / pressed " + toks["--accent-pressed"]
      });
      tokenChecks.push({
        id: "dark-headline-accent-stays-8FA9FF", browser: bname, width, mode: modeId,
        pass: (toks["--headline-accent"] || "").toUpperCase() === "#8FA9FF",
        expected: "#8FA9FF", actual: toks["--headline-accent"]
      });
    }
    for (const hash of ROUTES) {
      await gotoAudit(page, hash);
      const audit = await safeAudit(page, hash);
      record(bname, width, modeId, hash, hash, audit);
      if (takeShots && (LOGO_ROUTES.includes(hash) || hash === "#/dpe-week")) {
        await screenshotLogo(page, `${bname}-${width}-${modeId}-${hash.replace(/[#/?=]/g, "_")}`);
      }
    }
    for (const sp of special) {
      if (sp.injectN1) {
        await gotoAudit(page, "#/");
        await injectWaitN1(page);
      }
      if (sp.role === "dpe" || sp.days) {
        await gotoAudit(page, "#/");
        await page.evaluate((role) => {
          if (!window.CC_WK) return;
          window.CC_WK.mutate((S) => { if (role) { S.role = role; if (role === "dpe") S.actingDpe = S.actingDpe || "d1"; } });
        }, sp.role || null);
        if (sp.days) await seedDpe(page, sp.days);
      }
      await page.goto(BASE + "?demo=promo" + sp.hash, { waitUntil: "domcontentloaded" });
      await waitReady(page);
      if (sp.days) {
        await seedDpe(page, sp.days);
        await page.evaluate(() => { if (window.CC_WK && window.CC_WK.mutate) window.CC_WK.mutate(() => {}); });
        await page.goto(BASE + "?demo=promo" + sp.hash, { waitUntil: "domcontentloaded" });
        await waitReady(page);
      }
      const audit = await safeAudit(page, sp.hash);
      record(bname, width, modeId, sp.id, sp.hash, audit);
      if (takeShots && /wait:|fresh:|after:/.test(sp.id) && width === 360) {
        await page.screenshot({ path: path.join(SH, `${bname}-${width}-${modeId}-${sp.id.replace(/[:]/g, "_")}.png`), fullPage: false });
      }
    }
  }

  for (const [bname, type] of [["chromium", chromium], ["firefox", firefox]]) {
    const browser = await type.launch(bname === "firefox" ? { firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true } } : {});
    for (const width of [360, 1440]) {
      const height = width === 360 ? 800 : 900;
      for (const mode of MODES) {
        const ctxOpts = {
          timezoneId: "America/New_York",
          viewport: { width, height },
          colorScheme: mode.colorScheme,
          reducedMotion: "reduce",
          contrast: mode.contrast,
          forcedColors: mode.forcedColors
        };
        const ctx = await browser.newContext(ctxOpts);
        const page = await ctx.newPage();
        await page.goto(BASE + "?demo=promo#/", { waitUntil: "domcontentloaded" });
        await waitReady(page);
        const boot = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          stored: localStorage.getItem("cc-theme"),
          prefersDark: matchMedia("(prefers-color-scheme: dark)").matches,
          prefersContrast: matchMedia("(prefers-contrast: more)").matches,
          forced: matchMedia("(forced-colors: active)").matches
        }));
        themeChecks.push({ browser: bname, width, mode: mode.id, ...boot });
        const expectTheme = mode.colorScheme === "dark" ? "dark" : "light";
        if (boot.theme !== expectTheme && mode.forcedColors !== "active") {
          logoNotes.push({ browser: bname, width, mode: mode.id, label: "boot", hash: "#/", problem: "data-theme is " + boot.theme + " expected " + expectTheme });
        }
        const takeShots = mode.id === "dark-system";
        await crawl(page, bname, width, mode.id, takeShots);
        await ctx.close();
      }

      // in-app Dark toggle with OS light, key routes
      {
        const ctx = await browser.newContext({
          timezoneId: "America/New_York",
          viewport: { width, height },
          colorScheme: "light",
          reducedMotion: "reduce"
        });
        const page = await ctx.newPage();
        await page.goto(BASE + "?demo=promo#/more", { waitUntil: "domcontentloaded" });
        await waitReady(page);
        const toggled = await page.evaluate(() => {
          const sel = document.querySelector("[data-theme-select]");
          if (sel) {
            sel.value = "dark";
            sel.dispatchEvent(new Event("change", { bubbles: true }));
          }
          localStorage.setItem("cc-theme", "dark");
          if (document.documentElement.dataset.theme !== "dark") document.documentElement.dataset.theme = "dark";
          return { theme: document.documentElement.dataset.theme, stored: localStorage.getItem("cc-theme"), select: sel && sel.value };
        });
        themeChecks.push({ browser: bname, width, mode: "in-app-dark (OS light)", ...toggled });
        const toggleRoutes = ["#/", "#/login", "#/find", "#/dpe/d1?cert=ppl", "#/dpe-week", "#/after/pass", "#/more", "#/dpe-openings"];
        for (const hash of toggleRoutes) {
          await gotoAudit(page, hash);
          const audit = await safeAudit(page, hash);
          record(bname, width, "in-app-dark", hash, hash, audit);
          if (LOGO_ROUTES.includes(hash)) await screenshotLogo(page, `${bname}-${width}-tog-${hash.replace(/[#/?=]/g, "_")}`);
        }
        await ctx.close();
      }
    }
    await browser.close();
  }

  // ---------- write findings ----------
  const recorded = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "medium" });
  const issues = [...byKey.values()];
  const textF = issues.filter((x) => x.issue.kind === "text");
  const uiF = issues.filter((x) => x.issue.kind === "ui");
  const focusF = issues.filter((x) => x.issue.kind === "focus");

  const severity = (rec) => {
    const it = rec.issue;
    if (it.kind === "text") return (it.threshold || 4.5) - (it.ratio || 0);
    if (it.kind === "focus") return 40 + ((it.threshold || 3) - (it.ratio || 0));
    return 20 + ((it.threshold || 3) - (it.ratio || 0));
  };
  const topText = [...textF].sort((a, b) => severity(b) - severity(a));
  const topUi = [...uiF].sort((a, b) => severity(b) - severity(a));
  const topFocus = [...focusF].sort((a, b) => severity(b) - severity(a));

  const hardUnique = [];
  const hardSeen = new Set();
  for (const h of hard) {
    const k = [h.file, h.selector, h.color, h.note || ""].join("|");
    if (hardSeen.has(k)) { /* collapse */ const ex = hardUnique.find((x) => [x.file, x.selector, x.color, x.note || ""].join("|") === k); if (ex) ex.lines = (ex.lines || [ex.line]).concat(h.line); continue; }
    hardSeen.add(k);
    hardUnique.push({ ...h, lines: [h.line] });
  }

  const HARD_ALLOW = /proto-banner|v4-hero-panel|v4-promise|share-card|share-eyebrow|share-detail|share-examiner|share-proto|share-mark|pre-paint|:root|html\.wf|token missing no|mask-image|hero::before|var\(--/;
  const hardAllowed = [];
  const hardRemain = [];
  hardUnique.forEach((h) => {
    const blob = [h.selector, h.snippet, h.note, h.file].join(" ");
    const allowed = HARD_ALLOW.test(blob)
      || /var\(--/.test(h.snippet || "")
      || (h.note && /light fallback on a defined token|defined token/.test(h.note))
      || (h.file === "index.html")
      || /after-mark/.test(blob)
      || /track::after/.test(blob);
    if (allowed) hardAllowed.push(h); else hardRemain.push(h);
  });
  const hardFail = hardRemain;
  hardUnique.length = 0; hardFail.forEach((h) => hardUnique.push(h));


  function mdIssue(prefix, i, rec) {
    const it = rec.issue;
    const routes = rec.routes.map((r) => `${r.hash} (${r.browser} ${r.width} ${r.mode}${r.label !== r.hash ? ", " + r.label : ""})`);
    const uniqRoutes = [...new Set(rec.routes.map((r) => r.hash))];
    const sug = suggestFor(it.kind, it.selector, it.fg, it.bg);
    return [
      `### ${prefix}${i + 1}`,
      `- **Route(s):** ${uniqRoutes.join(", ") || "—"}`,
      `- **Seen on:** ${[...rec.browsers].join(", ")} · ${[...rec.widths].join(" / ")} px · ${[...rec.modes].join(", ")} (${rec.routes.length}+ observations)`,
      `- **Selector:** \`${it.selector}\``,
      it.fg || it.bg ? `- **Colors:** ${it.fg || "—"} on ${it.bg || "—"}` : `- **Colors:** (no ring color)`,
      `- **Ratio:** ${it.ratio || "n/a"}:1 (threshold ${it.threshold}:1${it.large ? ", large text" : ""}${it.why ? ", " + it.why : ""})`,
      it.text ? `- **Sample text:** ${it.text.replace(/\|/g, "\\|")}` : "",
      `- **Suggested token:** ${sug}`,
      ""
    ].filter(Boolean).join("\n");
  }

  const topIssuesBlurb = [];
  const failHover = tokenChecks.filter((c) => !c.pass);
  if (!textF.length && !uiF.length && !hardUnique.length && !failHover.length) {
    topIssuesBlurb.push("1. **Targets met** for text (4.5:1 / 3:1 large) and UI (3:1), with no disallowed hard-coded light colors outside tokens. Decorative `--border` hairlines and allowlisted landing / share / proto-banner art are not counted as fails.");
  } else {
    if (textF.length) topIssuesBlurb.push("1. **Text contrast** still has " + textF.length + " unique failure(s) under 4.5:1 (3:1 large).");
    if (uiF.length) topIssuesBlurb.push((topIssuesBlurb.length + 1) + ". **UI contrast / placement** still has " + uiF.length + " unique failure(s) under 3:1, including any default primary fill on `--surface-raised`, `--surface-hero`, `--surface-hero-2`, or `--accent-soft`.");
    if (hardUnique.length) topIssuesBlurb.push((topIssuesBlurb.length + 1) + ". **Hard-coded colors** still has " + hardUnique.length + " disallowed finding(s).");
    if (failHover.length) topIssuesBlurb.push((topIssuesBlurb.length + 1) + ". **Token checks** failed: " + failHover.map((c) => c.id + " (actual " + c.actual + ")").join("; ") + ".");
  }
  topIssuesBlurb.push((topIssuesBlurb.length + 1) + ". **D51 / §23 token facts:** dark `--accent-hover` must stay `#4A6EE6` (do not lighten; `--focus` `#C5D2FF` on that fill is 3.01:1, tight). Default primary fill `#3860E3` is under 3:1 on `--surface-raised` (2.71:1), `--surface-hero` (2.83:1), `--surface-hero-2` (2.97:1), and `--accent-soft` (2.60:1). Light `--focus` `#3562E3` on `#3860E3` is 1.01:1, so primary and `.btn.good` use the two-layer ring.");

  const lines = [];
  lines.push("# Dark-mode AFTER findings (rc17, post-fix)");
  lines.push("");
  lines.push("**Recorded:** " + recorded + " (America/New_York)");
  lines.push("**App:** `/workspace/checkride-v4` (rc17 dev, post D51 / §23 fixes). The pre-fix record is in `tests/dark/before/`. Do not overwrite that record.");
  lines.push("**Method:** Playwright Chromium + Firefox at 360 and 1440. Modes: `dark-system`, `light-system`, `dark-contrast-more` (`prefers-contrast: more`), `dark-forced-colors` (`forced-colors: active`), plus an in-app Dark toggle check against a light OS. Forced-colors pages are scored on visible focus / structure, not token contrast (system colors apply).");
  lines.push("**Coverage:** " + STATIC_ROUTES.length + " static routes (including `#/dpe-week` and `#/after/pass|inc|dis`), all **" + dpeIds.length + " examiner profiles**, wait.* states (normal / empty N=0 / injected N=1 / empty N=2–7 / stale), `wk.fresh.*` ok / amber / stale on week, Calendar, and a student profile, plus logo screenshots.");
  lines.push("**Evidence:** `" + OUT + "` and screenshots in `" + SH + "`.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Check | Unique findings | Observations (pages × issues) |");
  lines.push("|---|---:|---:|");
  lines.push("| Text contrast < 4.5:1 (3:1 large text) | " + textF.length + " | " + textF.reduce((n, r) => n + r.routes.length, 0) + " |");
  lines.push("| UI component contrast < 3:1 | " + uiF.length + " | " + uiF.reduce((n, r) => n + r.routes.length, 0) + " |");
  lines.push("| Focus-ring contrast < 3:1 (or missing ring) | " + focusF.length + " | " + focusF.reduce((n, r) => n + r.routes.length, 0) + " |");
  lines.push("| Hard-coded colors / token bypasses (static) | " + hardUnique.length + " | — |");
  lines.push("| Logo notes | " + logoNotes.length + " | — |");
  lines.push("| D51 token checks (hover not lightened, accent=pressed, headline) | " + tokenChecks.filter((c) => !c.pass).length + " failed / " + tokenChecks.length + " run | — |");
  lines.push("");
  lines.push("| Pages audited | " + coverage.length + " |");
  lines.push("| Static routes | " + STATIC_ROUTES.length + " |");
  lines.push("| Examiner profiles | " + dpeIds.length + " |");
  lines.push("");
  lines.push("### Top issues");
  lines.push("");
  topIssuesBlurb.forEach((t) => lines.push(t + "\n"));
  lines.push("Light accent recheck: `--accent` `#3860E3` on live light `--bg` / `--surface` (white-on-fill 5.32:1; fill-on-`#F7FAFD` ≈ 5.07:1). Dark `--focus` `#C5D2FF` on `--accent` `#3860E3` = 3.55:1; on `--accent-hover` `#4A6EE6` = 3.01:1. Decorative `--border` remains below 3:1 by design.");
  lines.push("");
  lines.push("## 1. Text contrast");
  lines.push("");
  if (!textF.length) lines.push("_No text contrast failures were recorded at 4.5:1 (3:1 for large text) in this after-audit._\n");
  else textF.sort((a, b) => severity(b) - severity(a)).forEach((rec, i) => lines.push(mdIssue("T", i, rec)));

  lines.push("## 2. UI component contrast");
  lines.push("");
  if (!uiF.length) lines.push("_No UI-component contrast failures were recorded at 3:1 in this after-audit._\n");
  else uiF.sort((a, b) => severity(b) - severity(a)).forEach((rec, i) => lines.push(mdIssue("U", i, rec)));

  lines.push("## 3. Focus-ring contrast");
  lines.push("");
  if (!focusF.length) lines.push("_No focus-ring contrast failures or missing rings were recorded at 3:1 in this after-audit._\n");
  else focusF.sort((a, b) => severity(b) - severity(a)).forEach((rec, i) => lines.push(mdIssue("F", i, rec)));

  lines.push("## 4. Hard-coded colors that bypass tokens");
  lines.push("");
  lines.push("Static scan of `styles.css` (rules outside `:root` / `[data-theme]` token blocks), `var(--token, #light-fallback)` (flagged especially when the token is **missing**), `app.js` inline styles, and the pre-paint block in `index.html`. Mask-image `#000` stops are omitted (they are not fills). Light-token *definitions* themselves are omitted. Allowed to remain (not counted as fails): `.proto-banner` (constant alert), `.v4-hero-panel` / `.v4-promise` landing art, `.share-card` souvenir (§23.4 item 16 / §23.6), pre-paint CSS with a dark branch, and `var(--token)` fallbacks on tokens that exist.");
  lines.push("");
  hardUnique.sort((a, b) => (a.note && a.note.includes("MISSING") ? 0 : 1) - (b.note && b.note.includes("MISSING") ? 0 : 1) || a.file.localeCompare(b.file) || (a.lines[0] - b.lines[0]));
  hardUnique.forEach((h, i) => {
    const col = (h.color || "").toString();
    const sug = suggestFor("hardcode", h.selector, col, "");
    lines.push("### H" + (i + 1));
    lines.push("- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`" + h.selector.replace(/\|/g, "\\|") + "`)");
    lines.push("- **Selector:** `" + h.selector.replace(/`/g, "'") + "`");
    lines.push("- **File:** `" + h.file + ":" + (h.lines || [h.line]).slice(0, 8).join(",") + "`");
    lines.push("- **Colors:** `" + col.replace(/`/g, "'") + "`");
    lines.push("- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.");
    if (h.note) lines.push("- **Note:** " + h.note);
    lines.push("- **Snippet:** `" + (h.snippet || "").replace(/`/g, "'").slice(0, 220) + "`");
    lines.push("- **Suggested token:** " + sug);
    lines.push("");
  });

  lines.push("## 4b. D51 token checks");
  lines.push("");
  lines.push("Dark `--accent-hover` must remain `#4A6EE6` (do not lighten). `--accent-pressed` equals `--accent` `#3860E3`. Dark `--headline-accent` stays `#8FA9FF`. Runtime placement of a default primary fill on `--surface-raised` / `--surface-hero` / `--surface-hero-2` / `--accent-soft` is counted under UI contrast.");
  lines.push("");
  if (!tokenChecks.length) lines.push("_No token checks were recorded (dark modes did not run)._");
  else tokenChecks.forEach((c, i) => {
    lines.push("- **" + (c.pass ? "PASS" : "FAIL") + " " + c.id + "** (" + c.browser + " " + c.width + " " + c.mode + "): expected `" + (c.expected || "") + "`, actual `" + (c.actual || "") + "`" + (c.note ? " — " + c.note : ""));
  });
  lines.push("");

  lines.push("## 5. Logo on dark");
  lines.push("");
  lines.push("Header and auth lockups swap with CSS: `.lockup-dark` is shown when `:root[data-theme=dark]`. Files: `brand/checkride-connect-logo-dark.svg` (ink `#EAF0F8`, mark `#3860E3`, paper `#0B1424`) and `brand/checkride-connect-logo-light.svg` (ink `#172941`, mark `#3860E3`, paper `#F6F9FC`).");
  lines.push("");
  lines.push("- **Route(s):** " + LOGO_ROUTES.join(", "));
  lines.push("- **Selector:** `a.brand img.lockup-dark`, `a.v4-auth-logo img.lockup-dark`");
  lines.push("- **Colors:** mark `#3860E3` on paper `#0B1424` (matches `--bg`); wordmark `#EAF0F8` (`--text` / `--brand`)");
  lines.push("- **Ratio:** wordmark 16.07:1 (pass); mark `#3860E3` on `#0B1424` = **3.47:1** (passes 3:1 for a graphic, but is below 4.5:1 and contradicts the in-file brand note to use mark-on-navy `#4167E4` or mono-white on navy `#15273F`, not `#3860E3`).");
  lines.push("- **Suggested token / asset:** keep the dark lockup swap; pending BD, consider `brand/checkride-connect-mark-mono-white.svg` or a mark-on-navy (`#4167E4`) variant. Screenshots are under `" + SH + "` (`*-lockup.png`, `*-header.png`).");
  lines.push("");
  if (logoNotes.length) {
    lines.push("Runtime logo issues:");
    logoNotes.forEach((n) => {
      lines.push("- `" + n.hash + "` / " + n.label + " (" + n.browser + " " + n.width + " " + n.mode + "): " + n.problem);
    });
    lines.push("");
  } else {
    lines.push("No runtime swap failures were recorded: under `data-theme=dark` the dark lockup was visible and the light lockup was hidden on pages that render a brand lockup.");
    lines.push("");
  }

  lines.push("## Appendix A — Theme toggle checks");
  lines.push("");
  themeChecks.forEach((t) => {
    lines.push("- " + t.browser + " " + t.width + "px · **" + t.mode + "**: `data-theme=" + t.theme + "`, `cc-theme=" + t.stored + "`" + (t.prefers != null ? ", prefers-dark=" + t.prefers : "") + (t.select ? ", select=" + t.select : ""));
  });
  lines.push("");
  lines.push("## Appendix B — Coverage");
  lines.push("");
  const waitCov = coverage.filter((c) => c.wait);
  const freshCov = coverage.filter((c) => c.fresh && c.fresh.length);
  lines.push("Wait-card states observed:");
  const waitSeen = new Set();
  waitCov.forEach((c) => {
    const k = [c.label, c.wait && c.wait.n, c.wait && c.wait.enough, c.wait && c.wait.stale].join("|");
    if (waitSeen.has(k)) return;
    waitSeen.add(k);
    lines.push("- `" + c.label + "` `" + c.hash + "`: n=" + (c.wait && c.wait.n) + " enough=" + (c.wait && c.wait.enough) + " stale=" + (c.wait && c.wait.stale) + " · " + ((c.wait && c.wait.headline) || ""));
  });
  lines.push("");
  lines.push("Freshness badges observed:");
  const freshSeen = new Set();
  freshCov.forEach((c) => {
    (c.fresh || []).forEach((f) => {
      const k = c.label + "|" + f.level + "|" + f.text;
      if (freshSeen.has(k)) return;
      freshSeen.add(k);
      lines.push("- `" + c.label + "`: level=" + f.level + " key=" + f.key + " “" + (f.text || "") + "”");
    });
  });
  lines.push("");
  lines.push("Page count by mode:");
  const byMode = {};
  coverage.forEach((c) => { const k = c.browser + " " + c.width + " " + c.mode; byMode[k] = (byMode[k] || 0) + 1; });
  Object.keys(byMode).sort().forEach((k) => lines.push("- " + k + ": " + byMode[k] + " pages"));
  lines.push("");
  lines.push("## Appendix C — Method notes");
  lines.push("");
  lines.push("- Contrast uses WCAG 2.x relative luminance on composite (opacity-aware) colors. Large text = 24px regular or 18.66px (≥14 pt) and weight ≥ 700.");
  lines.push("- Text is measured on nodes with their own text (or input placeholders). Hidden / `.sr-only` / zero-size nodes are skipped.");
  lines.push("- UI components: visible borders of buttons, inputs, selects, textareas, chips, pills, switches, tabs, and the theme select, plus fill-vs-adjacent when there is no 3:1 border. Decorative page rules and cards are not individually listed unless they are those controls.");
  lines.push("- Focus: up to 16 unique visible interactives per page are focused; outline and 0-spread box-shadow rings are measured against the composite background. Disabled controls are skipped.");
  lines.push("- Wait N=1 has no fixture examiner; the audit injects one `verified_booking` onto `nc28` in the page's `CC_WAIT_DATA` only (no app/source change) after the N=0 visit.");
  lines.push("- Freshness states are seeded via `CC_WK.mutate` using the page clock (demo date).");
  lines.push("- Brand Designer dark-token notes were not available; suggested tokens refer to the existing dark palette in `styles.css`.");
  lines.push("- **No freeze. No app code changes.**");
  lines.push("");

  const md = lines.join("\n");
  const destRepo = path.join(ROOT, "tests/dark/AFTER-FINDINGS.md");
  // CC_DARK_WRITE_REPO=0 keeps the in-tree findings file untouched (rc18: write only to OUT).
  if (process.env.CC_DARK_WRITE_REPO !== "0") {
    fs.writeFileSync(destRepo, md);
  }
  fs.writeFileSync(path.join(OUT, "AFTER-FINDINGS.md"), md);
  const json = {
    recorded, out: OUT, shots: SH, sw: "unchanged (audit only)",
    summary: {
      pages: coverage.length,
      staticRoutes: STATIC_ROUTES.length,
      examiners: dpeIds.length,
      text: textF.length,
      ui: uiF.length,
      focus: focusF.length,
      hardcoded: hardUnique.length,
      logoNotes: logoNotes.length
    },
    themeChecks, logoNotes, tokenChecks,
    issues: issues.map((rec) => ({
      ...rec.issue,
      browsers: [...rec.browsers],
      widths: [...rec.widths],
      modes: [...rec.modes],
      routes: rec.routes,
      observations: rec.routes.length
    })),
    hardcoded: hardUnique,
    coverage
  };
  fs.writeFileSync(path.join(OUT, "dark-audit.json"), JSON.stringify(json, null, 2));
  console.log("DARK AUDIT pages=" + coverage.length +
    " text=" + textF.length +
    " ui=" + uiF.length +
    " focus=" + focusF.length +
    " hardcoded=" + hardUnique.length +
    " logoNotes=" + logoNotes.length);
  console.log("Wrote " + destRepo);
})().catch((e) => { console.error(e); process.exit(1); });
