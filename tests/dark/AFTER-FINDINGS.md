<!-- Evidence screenshots, JSON, and run-output dirs were moved (not deleted) to /workspace/checkride-pm/qa/evidence/rc17-dark/tests/dark/ (out-after/, shots-after/, after-final/, out-d51/, before/, out/, shots/, shots-d51/). Checksums: MOVE-MANIFEST.json. This findings document stays in the app tree. -->

# Dark-mode AFTER findings (rc17, post-fix)

**Recorded:** Nov 10, 2026, 1:02:20 PM (America/New_York)
**App:** `/workspace/checkride-v4` (rc17 dev, post D51 / §23 fixes). The pre-fix record is in `tests/dark/before/`. Do not overwrite that record.
**Method:** Playwright Chromium + Firefox at 360 and 1440. Modes: `dark-system`, `light-system`, `dark-contrast-more` (`prefers-contrast: more`), `dark-forced-colors` (`forced-colors: active`), plus an in-app Dark toggle check against a light OS. Forced-colors pages are scored on visible focus / structure, not token contrast (system colors apply).
**Coverage:** 33 static routes (including `#/dpe-week` and `#/after/pass|inc|dis`), all **31 examiner profiles**, wait.* states (normal / empty N=0 / injected N=1 / empty N=2–7 / stale), `wk.fresh.*` ok / amber / stale on week, Calendar, and a student profile, plus logo screenshots.
**Evidence:** `/workspace/checkride-v4/tests/dark/out-after` and screenshots in `/workspace/checkride-v4/tests/dark/shots-after`.

## Summary

| Check | Unique findings | Observations (pages × issues) |
|---|---:|---:|
| Text contrast < 4.5:1 (3:1 large text) | 0 | 0 |
| UI component contrast < 3:1 | 0 | 0 |
| Focus-ring contrast < 3:1 (or missing ring) | 0 | 0 |
| Hard-coded colors / token bypasses (static) | 0 | — |
| Logo notes | 0 | — |
| D51 token checks (hover not lightened, accent=pressed, headline) | 0 failed / 9 run | — |

| Pages audited | 1312 |
| Static routes | 33 |
| Examiner profiles | 31 |

### Top issues

1. **Targets met** for text (4.5:1 / 3:1 large) and UI (3:1), with no disallowed hard-coded light colors outside tokens. Decorative `--border` hairlines and allowlisted landing / share / proto-banner art are not counted as fails.

2. **D51 / §23 token facts:** dark `--accent-hover` must stay `#4A6EE6` (do not lighten; `--focus` `#C5D2FF` on that fill is 3.01:1, tight). Default primary fill `#3860E3` is under 3:1 on `--surface-raised` (2.71:1), `--surface-hero` (2.83:1), `--surface-hero-2` (2.97:1), and `--accent-soft` (2.60:1). Light `--focus` `#3562E3` on `#3860E3` is 1.01:1, so primary and `.btn.good` use the two-layer ring.

Light accent recheck: `--accent` `#3860E3` on live light `--bg` / `--surface` (white-on-fill 5.32:1; fill-on-`#F7FAFD` ≈ 5.07:1). Dark `--focus` `#C5D2FF` on `--accent` `#3860E3` = 3.55:1; on `--accent-hover` `#4A6EE6` = 3.01:1. Decorative `--border` remains below 3:1 by design.

## 1. Text contrast

_No text contrast failures were recorded at 4.5:1 (3:1 for large text) in this after-audit._

## 2. UI component contrast

_No UI-component contrast failures were recorded at 3:1 in this after-audit._

## 3. Focus-ring contrast

_No focus-ring contrast failures or missing rings were recorded at 3:1 in this after-audit._

## 4. Hard-coded colors that bypass tokens

Static scan of `styles.css` (rules outside `:root` / `[data-theme]` token blocks), `var(--token, #light-fallback)` (flagged especially when the token is **missing**), `app.js` inline styles, and the pre-paint block in `index.html`. Mask-image `#000` stops are omitted (they are not fills). Light-token *definitions* themselves are omitted. Allowed to remain (not counted as fails): `.proto-banner` (constant alert), `.v4-hero-panel` / `.v4-promise` landing art, `.share-card` souvenir (§23.4 item 16 / §23.6), pre-paint CSS with a dark branch, and `var(--token)` fallbacks on tokens that exist.

## 4b. D51 token checks

Dark `--accent-hover` must remain `#4A6EE6` (do not lighten). `--accent-pressed` equals `--accent` `#3860E3`. Dark `--headline-accent` stays `#8FA9FF`. Runtime placement of a default primary fill on `--surface-raised` / `--surface-hero` / `--surface-hero-2` / `--accent-soft` is counted under UI contrast.

- **PASS dark-accent-hover-not-lightened** (chromium 360 dark-system): expected `#4A6EE6`, actual `#4A6EE6` — exact #4A6EE6
- **PASS dark-accent-pressed-equals-accent** (chromium 360 dark-system): expected `#3860E3`, actual `#3860E3 / pressed #3860E3`
- **PASS dark-headline-accent-stays-8FA9FF** (chromium 360 dark-system): expected `#8FA9FF`, actual `#8FA9FF`
- **PASS dark-accent-hover-not-lightened** (chromium 360 dark-contrast-more): expected `#4A6EE6`, actual `#4A6EE6` — exact #4A6EE6
- **PASS dark-accent-pressed-equals-accent** (chromium 360 dark-contrast-more): expected `#3860E3`, actual `#3860E3 / pressed #3860E3`
- **PASS dark-headline-accent-stays-8FA9FF** (chromium 360 dark-contrast-more): expected `#8FA9FF`, actual `#8FA9FF`
- **PASS dark-accent-hover-not-lightened** (chromium 1440 dark-system): expected `#4A6EE6`, actual `#4A6EE6` — exact #4A6EE6
- **PASS dark-accent-pressed-equals-accent** (chromium 1440 dark-system): expected `#3860E3`, actual `#3860E3 / pressed #3860E3`
- **PASS dark-headline-accent-stays-8FA9FF** (chromium 1440 dark-system): expected `#8FA9FF`, actual `#8FA9FF`

## 5. Logo on dark

Header and auth lockups swap with CSS: `.lockup-dark` is shown when `:root[data-theme=dark]`. Files: `brand/checkride-connect-logo-dark.svg` (ink `#EAF0F8`, mark `#3860E3`, paper `#0B1424`) and `brand/checkride-connect-logo-light.svg` (ink `#172941`, mark `#3860E3`, paper `#F6F9FC`).

- **Route(s):** #/, #/login, #/find, #/home, #/dpe/d1?cert=ppl, #/dpe-week, #/after/pass, #/more
- **Selector:** `a.brand img.lockup-dark`, `a.v4-auth-logo img.lockup-dark`
- **Colors:** mark `#3860E3` on paper `#0B1424` (matches `--bg`); wordmark `#EAF0F8` (`--text` / `--brand`)
- **Ratio:** wordmark 16.07:1 (pass); mark `#3860E3` on `#0B1424` = **3.47:1** (passes 3:1 for a graphic, but is below 4.5:1 and contradicts the in-file brand note to use mark-on-navy `#4167E4` or mono-white on navy `#15273F`, not `#3860E3`).
- **Suggested token / asset:** keep the dark lockup swap; pending BD, consider `brand/checkride-connect-mark-mono-white.svg` or a mark-on-navy (`#4167E4`) variant. Screenshots are under `/workspace/checkride-v4/tests/dark/shots-after` (`*-lockup.png`, `*-header.png`).

No runtime swap failures were recorded: under `data-theme=dark` the dark lockup was visible and the light lockup was hidden on pages that render a brand lockup.

## Appendix A — Theme toggle checks

- chromium 360px · **dark-system**: `data-theme=dark`, `cc-theme=system`
- chromium 360px · **light-system**: `data-theme=light`, `cc-theme=system`
- chromium 360px · **dark-contrast-more**: `data-theme=dark`, `cc-theme=system`
- chromium 360px · **dark-forced-colors**: `data-theme=dark`, `cc-theme=system`
- chromium 360px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark
- chromium 1440px · **dark-system**: `data-theme=dark`, `cc-theme=system`
- chromium 1440px · **light-system**: `data-theme=light`, `cc-theme=system`
- chromium 1440px · **dark-contrast-more**: `data-theme=dark`, `cc-theme=system`
- chromium 1440px · **dark-forced-colors**: `data-theme=dark`, `cc-theme=system`
- chromium 1440px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark
- firefox 360px · **dark-system**: `data-theme=dark`, `cc-theme=system`
- firefox 360px · **light-system**: `data-theme=light`, `cc-theme=system`
- firefox 360px · **dark-contrast-more**: `data-theme=dark`, `cc-theme=system`
- firefox 360px · **dark-forced-colors**: `data-theme=dark`, `cc-theme=system`
- firefox 360px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark
- firefox 1440px · **dark-system**: `data-theme=dark`, `cc-theme=system`
- firefox 1440px · **light-system**: `data-theme=light`, `cc-theme=system`
- firefox 1440px · **dark-contrast-more**: `data-theme=dark`, `cc-theme=system`
- firefox 1440px · **dark-forced-colors**: `data-theme=dark`, `cc-theme=system`
- firefox 1440px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark

## Appendix B — Coverage

Wait-card states observed:
- `#/dpe/d1?cert=ppl` `#/dpe/d1?cert=ppl`: n=20 enough=true stale=false · Typical wait: about 4 weeks
- `#/dpe/d2?cert=ppl` `#/dpe/d2?cert=ppl`: n=14 enough=true stale=false · Typical wait: about 5 weeks
- `#/dpe/d3?cert=ppl` `#/dpe/d3?cert=ppl`: n=13 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/d4?cert=ppl` `#/dpe/d4?cert=ppl`: n=19 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/d5?cert=ppl` `#/dpe/d5?cert=ppl`: n=24 enough=true stale=false · Typical wait: about 2 weeks
- `#/dpe/d6?cert=ppl` `#/dpe/d6?cert=ppl`: n=14 enough=true stale=false · Typical wait: about 4 weeks
- `#/dpe/d7?cert=ppl` `#/dpe/d7?cert=ppl`: n=12 enough=true stale=false · Typical wait: about 5 weeks
- `#/dpe/d8?cert=ppl` `#/dpe/d8?cert=ppl`: n=17 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/d9?cert=ppl` `#/dpe/d9?cert=ppl`: n=11 enough=true stale=true · Typical wait: about 6 weeks
- `#/dpe/d10?cert=ppl` `#/dpe/d10?cert=ppl`: n=16 enough=true stale=false · Typical wait: about 2 weeks
- `#/dpe/d11?cert=ppl` `#/dpe/d11?cert=ppl`: n=12 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/d12?cert=ppl` `#/dpe/d12?cert=ppl`: n=20 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/d13?cert=ppl` `#/dpe/d13?cert=ppl`: n=3 enough=false stale=false · Not enough bookings yet.
- `#/dpe/nc14?cert=ppl` `#/dpe/nc14?cert=ppl`: n=11 enough=true stale=false · Typical wait: about 5 weeks
- `#/dpe/nc15?cert=ppl` `#/dpe/nc15?cert=ppl`: n=14 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/nc16?cert=ppl` `#/dpe/nc16?cert=ppl`: n=16 enough=true stale=false · Typical wait: about 2 weeks
- `#/dpe/nc17?cert=ppl` `#/dpe/nc17?cert=ppl`: n=9 enough=true stale=true · Typical wait: about 5 weeks
- `#/dpe/nc18?cert=ppl` `#/dpe/nc18?cert=ppl`: n=8 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/nc19?cert=ppl` `#/dpe/nc19?cert=ppl`: n=14 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/nc20?cert=ppl` `#/dpe/nc20?cert=ppl`: n=4 enough=false stale=false · Not enough bookings yet.
- `#/dpe/nc21?cert=ppl` `#/dpe/nc21?cert=ppl`: n=11 enough=true stale=false · Typical wait: about 4 weeks
- `#/dpe/nc22?cert=ppl` `#/dpe/nc22?cert=ppl`: n=17 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/nc23?cert=ppl` `#/dpe/nc23?cert=ppl`: n=12 enough=true stale=false · Typical wait: about 4 weeks
- `#/dpe/nc24?cert=ppl` `#/dpe/nc24?cert=ppl`: n=6 enough=false stale=false · Not enough bookings yet.
- `#/dpe/nc25?cert=ppl` `#/dpe/nc25?cert=ppl`: n=2 enough=false stale=false · Not enough bookings yet.
- `#/dpe/nc26?cert=ppl` `#/dpe/nc26?cert=ppl`: n=10 enough=true stale=false · Typical wait: about 3 weeks
- `#/dpe/nc27?cert=ppl` `#/dpe/nc27?cert=ppl`: n=6 enough=false stale=false · Not enough bookings yet.
- `#/dpe/nc28?cert=ppl` `#/dpe/nc28?cert=ppl`: n=0 enough=false stale=false · Not enough bookings yet.
- `wait:normal` `#/dpe/d1?cert=ppl`: n=20 enough=true stale=false · Typical wait: about 4 weeks
- `wait:empty-0` `#/dpe/nc28?cert=ppl`: n=0 enough=false stale=false · Not enough bookings yet.
- `wait:empty-some` `#/dpe/d13?cert=ppl`: n=3 enough=false stale=false · Not enough bookings yet.
- `wait:stale` `#/dpe/nc17?cert=ppl`: n=9 enough=true stale=true · Typical wait: about 5 weeks
- `wait:empty-1` `#/dpe/nc28?cert=ppl`: n=1 enough=false stale=false · Not enough bookings yet.
- `fresh:amber-profile` `#/dpe/d1?cert=ppl`: n=20 enough=true stale=false · Typical wait: about 4 weeks
- `fresh:stale-profile` `#/dpe/d1?cert=ppl`: n=20 enough=true stale=false · Typical wait: about 4 weeks

Freshness badges observed:
- `#/requests`: level=ok key=wk.fresh.hours “Confirmed 2 hours ago”
- `#/dpe-today`: level=ok key=wk.fresh.hours “Confirmed 2 hours ago”
- `#/dpe-openings`: level=ok key=wk.fresh.hours “Confirmed 2 hours ago”
- `#/dpe-week`: level=ok key=wk.fresh.hours “Confirmed 2 hours ago”
- `#/dpe/d1?cert=ppl`: level=ok key=wk.fresh.hours “Confirmed 2 hours ago”
- `#/dpe/d2?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/d3?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/d5?cert=ppl`: level=ok key=wk.fresh.hours “Confirmed 6 hours ago”
- `#/dpe/d6?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/d7?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/d8?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 3 days ago”
- `#/dpe/d9?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/d10?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/d11?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 3 days ago”
- `#/dpe/d12?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `#/dpe/d13?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/nc14?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/nc15?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 3 days ago”
- `#/dpe/nc16?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `#/dpe/nc17?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/nc18?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/nc19?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 3 days ago”
- `#/dpe/nc20?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `#/dpe/nc21?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/nc22?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/nc23?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 3 days ago”
- `#/dpe/nc24?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `#/dpe/nc25?cert=ppl`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `#/dpe/nc26?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `#/dpe/nc27?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 3 days ago”
- `#/dpe/nc28?cert=ppl`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `wait:normal`: level=ok key=wk.fresh.hours “Confirmed 2 hours ago”
- `wait:empty-0`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `wait:empty-some`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `wait:stale`: level=ok key=wk.fresh.yesterday “Confirmed yesterday”
- `wait:empty-1`: level=ok key=wk.fresh.days “Confirmed 4 days ago”
- `fresh:ok-week`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `fresh:amber-week`: level=amber key=wk.fresh.amber “Last confirmed 10 days ago”
- `fresh:stale-week`: level=stale key=wk.fresh.stale “Not recently confirmed”
- `fresh:ok-cal`: level=ok key=wk.fresh.days “Confirmed 2 days ago”
- `fresh:amber-cal`: level=amber key=wk.fresh.amber “Last confirmed 10 days ago”
- `fresh:stale-cal`: level=stale key=wk.fresh.stale “Not recently confirmed”
- `fresh:amber-profile`: level=amber key=wk.fresh.amber “Last confirmed 10 days ago”

Page count by mode:
- chromium 1440 dark-contrast-more: 80 pages
- chromium 1440 dark-forced-colors: 80 pages
- chromium 1440 dark-system: 80 pages
- chromium 1440 in-app-dark: 8 pages
- chromium 1440 light-system: 80 pages
- chromium 360 dark-contrast-more: 80 pages
- chromium 360 dark-forced-colors: 80 pages
- chromium 360 dark-system: 80 pages
- chromium 360 in-app-dark: 8 pages
- chromium 360 light-system: 80 pages
- firefox 1440 dark-contrast-more: 80 pages
- firefox 1440 dark-forced-colors: 80 pages
- firefox 1440 dark-system: 80 pages
- firefox 1440 in-app-dark: 8 pages
- firefox 1440 light-system: 80 pages
- firefox 360 dark-contrast-more: 80 pages
- firefox 360 dark-forced-colors: 80 pages
- firefox 360 dark-system: 80 pages
- firefox 360 in-app-dark: 8 pages
- firefox 360 light-system: 80 pages

## Appendix C — Method notes

- Contrast uses WCAG 2.x relative luminance on composite (opacity-aware) colors. Large text = 24px regular or 18.66px (≥14 pt) and weight ≥ 700.
- Text is measured on nodes with their own text (or input placeholders). Hidden / `.sr-only` / zero-size nodes are skipped.
- UI components: visible borders of buttons, inputs, selects, textareas, chips, pills, switches, tabs, and the theme select, plus fill-vs-adjacent when there is no 3:1 border. Decorative page rules and cards are not individually listed unless they are those controls.
- Focus: up to 16 unique visible interactives per page are focused; outline and 0-spread box-shadow rings are measured against the composite background. Disabled controls are skipped.
- Wait N=1 has no fixture examiner; the audit injects one `verified_booking` onto `nc28` in the page's `CC_WAIT_DATA` only (no app/source change) after the N=0 visit.
- Freshness states are seeded via `CC_WK.mutate` using the page clock (demo date).
- Brand Designer dark-token notes were not available; suggested tokens refer to the existing dark palette in `styles.css`.
- **No freeze. No app code changes.**
