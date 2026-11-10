<!-- Evidence screenshots, JSON, and run-output dirs were moved (not deleted) to /workspace/checkride-pm/qa/evidence/rc17-dark/tests/dark/ (before/, out/, shots/). Checksums: MOVE-MANIFEST.json. This findings document stays in the app tree. -->

# Dark-mode baseline findings (rc17)

**Recorded:** Nov 10, 2026, 12:31:02 PM (America/New_York)
**App:** `/workspace/checkride-v4` (rc16 live / dev). **No app code was changed.** Brand Designer's dark-mode token/spec notes have not arrived; this is a read-only baseline.
**Method:** Playwright Chromium + Firefox at 360 and 1440. Pass A: `colorScheme: dark` with in-app theme left at **System** (pre-paint script resolves `prefers-color-scheme: dark` → `data-theme=dark`). Pass B: in-app **Dark** toggle with OS preference left light, on a key-route subset, to confirm the toggle wins.
**Coverage:** 33 static routes (including `#/dpe-week` and `#/after/pass|inc|dis`), all **31 examiner profiles**, wait.* states (normal / empty N=0 / injected N=1 / empty N=2–7 / stale), `wk.fresh.*` ok / amber / stale on week, Calendar, and a student profile, plus logo screenshots.
**Evidence:** `/workspace/checkride-v4/tests/dark/out` and screenshots in `/workspace/checkride-v4/tests/dark/shots`.

## Summary

| Check | Unique findings | Observations (pages × issues) |
|---|---:|---:|
| Text contrast < 4.5:1 (3:1 large text) | 1 | 4 |
| UI component contrast < 3:1 | 189 | 1190 |
| Focus-ring contrast < 3:1 (or missing ring) | 43 | 304 |
| Hard-coded colors / token bypasses (static) | 122 | — |
| Logo notes | 0 | — |

| Pages audited | 352 |
| Static routes | 33 |
| Examiner profiles | 31 |

### Top issues

1. **Dark `--border` / `--border-strong` fail WCAG 1.4.11** (~1.3–1.6:1 on `--bg` / `--surface`). Inputs, chips, and other controls that rely on `border` rather than `--border-control` will fail the 3:1 UI-component check.

2. **Focus rings on text fields are below 3:1.** `select:focus, input:focus, textarea:focus` sets `outline: none` and a 4px `box-shadow` of `--accent-soft` (#1B2C4F), which is only ~1.2:1 on `--surface`. Buttons that use `outline: 2px solid var(--accent)` sit at ~3.1:1 (barely). `--focus` (#9DB4FF) would be 9.13:1 on `--bg`.

3. **Hard-coded light surfaces and missing tokens.** `.demo-date-bar`, `.net-banner.on`, `.proto-banner`, `.v4-promise`, `.share-card`, and `.after-mark` use raw light (or navy) hexes instead of dark tokens. `--card` is not defined, so `.after-credit` falls back to `#fff` in dark. `--sky` is never remapped for dark.

4. **Dark logo mark uses light-theme accent `#3860E3`** on `#0B1424` (~3.47:1). Brand notes say to use mark-on-navy `#4167E4` or mono-white on navy, not `#3860E3`. Wordmark `#EAF0F8` is fine (16:1). Confirm both lockups swap correctly (see screenshots).

Token ratios used in the narrative (computed from the current dark palette in `styles.css`, pending BD revision): `--border` `#24334C` on `--bg` `#0B1424` = 1.45:1; on `--surface` `#121E33` = 1.31:1. `--accent-soft` `#1B2C4F` on `--surface` = 1.21:1. `--accent` `#3860E3` on `--surface` = 3.14:1; on `--bg` = 3.47:1. `--focus` `#9DB4FF` on `--bg` = 9.13:1.

## 1. Text contrast

### T1
- **Route(s):** #/dpe-fees
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#dpe-fees-form > div.row > button.btn.ghost`
- **Colors:** #505C70 on #121E33
- **Ratio:** 2.48:1 (threshold 4.5:1)
- **Sample text:** Restore sample values
- **Suggested token:** Foreground: nearest dark token pending Brand Designer. Background: --surface. Prefer --text on --bg/--surface, or --accent-text for links.
## 2. UI component contrast

### U1
- **Route(s):** #/, #/login, #/signup, #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-auth > a.btn.ghost.sm`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U2
- **Route(s):** #/, #/login, #/signup, #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-auth > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U3
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#land-find`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U4
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `section.land-hero.v4-hero > div.land-hero-grid > div.v4-hero-panel > article.v4-card.v4-mock > a.btn.cta.v4-wide`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U5
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#students > div > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U6
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#students > div.v4-card.v4-findmock > a.btn.v4-wide`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U7
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#examiners > div.v4-card.v4-inbox > div.v4-req > div.row > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U8
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#examiners > div > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U9
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#schools > div > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U10
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#schools > div.v4-card.v4-table-card > a.btn.v4-wide`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U11
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#app > div.landing.v4-landing > section.land-sec.v4-final > div.row > a.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U12
- **Route(s):** #/, #/find, #/login, #/signup, #/home, #/onboarding, #/after/pass, #/after/inc, #/after/dis, #/journey, #/readiness, #/more
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#footer-reset-data`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U13
- **Route(s):** #/, #/find, #/login, #/signup, #/home, #/onboarding, #/after/pass, #/after/inc, #/after/dis, #/journey, #/readiness, #/more
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#demo-date-exit`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U14
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#find-results > article.v4-card.v4-find-card > div.row > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U15
- **Route(s):** #/login
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark, in-app-dark (4+ observations)
- **Selector:** `form.stack > fieldset.field.v4-role-mini > div.row > label.v4-radio.sm > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U16
- **Route(s):** #/login
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#login-submit`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U17
- **Route(s):** #/signup
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.v4-auth-card.card.anim > form.stack > fieldset.v4-roles > label.v4-radio.card > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U18
- **Route(s):** #/signup
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#signup-age`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U19
- **Route(s):** #/signup
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#signup-submit`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U20
- **Route(s):** #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `#app > div.page.narrow.fr-page > button.btn.ghost.sm`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U21
- **Route(s):** #/home, #/onboarding
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page.narrow.fr-page > div.fr-cards > label.fr-card > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U22
- **Route(s):** #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `#app > div.page.narrow.fr-page > div.fr-actions.row > button.btn.ghost`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U23
- **Route(s):** #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `#app > div.page.narrow.fr-page > div.fr-actions.row > button.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U24
- **Route(s):** #/after/pass, #/after/inc, #/after/dis
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#app > div.page.narrow.after-page > div.row.after-ctas > a.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U25
- **Route(s):** #/after/pass, #/after/inc, #/after/dis
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#app > div.page.narrow.after-page > div.row.after-ctas > a.btn.ghost`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U26
- **Route(s):** #/after/dis
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `#app > div.page.narrow.after-page > div.row.after-ctas > button.btn.ghost`
- **Colors:** #0B1424 on #0B1424
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U27
- **Route(s):** #/readiness
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-s0`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U28
- **Route(s):** #/readiness
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-s1`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U29
- **Route(s):** #/readiness
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-s2`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U30
- **Route(s):** #/readiness
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-retest`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U31
- **Route(s):** #/readiness
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `section.card.anim > ol.ready9 > li > label.check-item > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U32
- **Route(s):** #/more
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark, in-app-dark (4+ observations)
- **Selector:** `#fr-more-unsure`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U33
- **Route(s):** #/more
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#fr-more-plan > div.row > button.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U34
- **Route(s):** #/more
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#fr-more-plan > div.row > a.btn.ghost`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U35
- **Route(s):** #/saved
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page.narrow > div.card.empty.state > div.empty-actions > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U36
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#loc-s-hint > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U37
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#soonest-lead > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U38
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page.split > section.stack.anim > div.cta-banner.row.spread > button.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U39
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `section.stack.anim > article.card.result > div > div.row > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U40
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > form.grid.g2 > div > button.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U41
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.split-r > div.stack > div.card.anim > div.row.spread > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U42
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.split-r > div.stack > div.card.anim > div.row.small > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U43
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#inbox > div.row.spread > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U44
- **Route(s):** #/bookings, #/my-checklists, #/dpe/p1?cert=ppl, #/dpe/p2?cert=ppl, #/dpe/p3?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `#app > div.page > div.card.empty.state > div.empty-actions > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U45
- **Route(s):** #/checklists
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.split-r > div.stack > section.card.anim > label.check-item > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U46
- **Route(s):** #/checklists
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page > div.split-r > aside.card.sticky.anim > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U47
- **Route(s):** #/compare
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `table.cmp > tbody > tr.best > td > span.pill.good`
- **Colors:** #13301F on #13301F
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U48
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#dash-openings`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U49
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.slot-row > div.row > button.btn.good.sm`
- **Colors:** #4DBA6E on #4DBA6E
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U50
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.slot-row > div.row > button.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U51
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `table > tbody > tr > td.num > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U52
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#publish-link-card > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U53
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-confirm`
- **Colors:** #4DBA6E on #4DBA6E
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U54
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `div.page.avail-page > section.card.avail-status.ok > div.row.spread > div.row > a.btn.ghost`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U55
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#sim-open-dpe`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U56
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `form.stack.avail-form > section.card.avail-week.anim > div.row.spread > div.row > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U57
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-save`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U58
- **Route(s):** #/dpe-openings
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark, in-app-dark (10+ observations)
- **Selector:** `#avail-reminders > form.row > label.row.small > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U59
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-reminders > div.email-preview > div.ep-body > div.row > button.btn.good.sm`
- **Colors:** #4DBA6E on #4DBA6E
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U60
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-reminders > div.email-preview > div.ep-body > div.row > button.btn.ghost.sm`
- **Colors:** #1E2A40 on #1E2A40
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U61
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#wk-confirm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U62
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#wk-days > fieldset.wk-day.is-open > button.btn.ghost.sm`
- **Colors:** #1B2C4F on #1B2C4F
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U63
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#app > div.page.wk-page > section.card.wk-next.anim > a.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U64
- **Route(s):** #/dpe-applicants
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.row.spread > div.row > a.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U65
- **Route(s):** #/dpe-fees
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#dpe-fees-form > div.row > button.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U66
- **Route(s):** #/openings
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `form.stack > fieldset > div.row.small > label.row > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U67
- **Route(s):** #/openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#publish-submit`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U68
- **Route(s):** #/admin
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > div.stack > div.card.anim > div.row > button.btn.good.sm`
- **Colors:** #4DBA6E on #4DBA6E
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U69
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page > div.page-head.row.spread > div.row > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U70
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `tbody > tr > td.num > div.row > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U71
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `tbody > tr > td.num > div.row > a.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U72
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#school-near > div.row > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U73
- **Route(s):** #/school/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `table > tbody > tr > td.num > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U74
- **Route(s):** #/school/cohort
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.stack > form.card.stack.anim > div.check-list > label.check-row > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U75
- **Route(s):** #/school/cohort
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.page.cohort-page > div.stack > form.card.stack.anim > label.check-row.small > input`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U76
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `section.card > div.row > div > div.row > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U77
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-days > button.v4-day`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U78
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-times > button.v4-time`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U79
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d9?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-times > button.v4-time`
- **Colors:** #12304A on #12304A
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U80
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-request`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U81
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.avail-page > section.card.avail-status.amber > div.row.spread > div.row > a.btn.ghost`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U82
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.avail-page > section.card.avail-status.stale > div.row.spread > div.row > a.btn.ghost`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U83
- **Route(s):** #/, #/login, #/signup, #/home, #/onboarding
- **Seen on:** chromium, firefox · 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `header.topbar > div.topbar-inner > div.topbar-right > a.btn.cta.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U84
- **Route(s):** #/alerts
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#notif-perm > button.btn.ghost.sm`
- **Colors:** #121E33 on #121E33
- **Ratio:** 1:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U85
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page > section.cta-banner.row.spread > div > span.pill.wk-fresh.wk-fresh-ok`
- **Colors:** #1E2A40 on #1B2C4F
- **Ratio:** 1.04:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U86
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `div.summary.small > div.line > span > div.muted.small > span.pill.verify`
- **Colors:** #2A2148 on #1E2A40
- **Ratio:** 1.04:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U87
- **Route(s):** #/after/inc, #/after/dis
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `#app > div.page.narrow.after-page > section.card.stack.after-card > section.after-verify > span.pill.verify.after-verify-chip`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U88
- **Route(s):** #/journey
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#elig-clock > ul.clock-rows > li.clock-row > div.row > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U89
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#clock-more > fieldset.clock-fs > p.small.muted > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U90
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#elig-clock-r9 > ul.clock-rows > li.clock-row > div.row > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U91
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `li > label.check-item > div > div.muted.small > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U92
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-slot-note > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U93
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#cost-estimate > p.muted.small > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U94
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#cost-estimate > p.muted.small > span > span.pill.verify`
- **Colors:** #2A2148 on #121E33
- **Ratio:** 1.12:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U95
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.wk-page > section.card.wk-status.stale > div.row.spread.wk-status-row > div > span.pill.wk-fresh.wk-fresh-stale`
- **Colors:** #24334C on #1E2A40
- **Ratio:** 1.13:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U96
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `section.card.avail-status.stale > div.row.spread > div > div > span.pill.wk-fresh.wk-fresh-stale`
- **Colors:** #24334C on #1E2A40
- **Ratio:** 1.13:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U97
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#examiners > div.v4-card.v4-inbox > div.v4-req > div.row.spread > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U98
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#schools > div.v4-card.v4-table-card > div.v4-req-row > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U99
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#find-results > article.v4-card.v4-find-card > div.v4-card-foot > span.pill.v4-next-pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U100
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#find-results > article.v4-card.v4-find-card > div.v4-chips > span.pill.v4-travel`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U101
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#find-results > article.v4-card.v4-find-card > div.v4-card-foot > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U102
- **Route(s):** #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `div.fr-cards > label.fr-card > span.fr-card-body > span.fr-card-title > span.pill.fr-info-pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U103
- **Route(s):** #/journey
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#journey-target`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U104
- **Route(s):** #/journey
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#elig-clock > ul.clock-rows > li.clock-row > div.row > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U105
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > section.card.anim > div.row.spread > h2 > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U106
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > section.card.anim > div.row.spread > span.row > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U107
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#elig-clock-r9 > ul.clock-rows > li.clock-row > div.row > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U108
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.split > section.stack.anim > article.card.result > div.price > div.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U109
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#digest-preview > p > b.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U110
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > div.split-r > div.stack > section.card.anim > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U111
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > div.split-r > div.stack > section.card.anim > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U112
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.split-r > div.stack > div.card.anim > div.row.small > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U113
- **Route(s):** #/checklists, #/school, #/school/requests, #/school/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `#app > div.page > nav.tabs.anim > a.active`
- **Colors:** #121E33 on #1E2A40
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U114
- **Route(s):** #/checklists
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > div.split-r > aside.card.sticky.anim > div > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U115
- **Route(s):** #/pricing
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#deposit-policy > h3 > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U116
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.slot-row > div.row > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U117
- **Route(s):** #/requests, #/school, #/school/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `table > tbody > tr > td > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U118
- **Route(s):** #/dpe-today
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#wk-today-prompt > div.row.spread > div > div > span.pill.wk-fresh.wk-fresh-ok`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U119
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `section.card.avail-status.ok > div.row.spread > div > div > span.pill.wk-fresh.wk-fresh-ok`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U120
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#sim-card > div.row.spread > h2 > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U121
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-reminders > div.row.spread > h2 > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U122
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `div.page.wk-page > section.card.wk-status.ok > div.row.spread.wk-status-row > div > span.pill.wk-fresh.wk-fresh-ok`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U123
- **Route(s):** #/dpe-applicants
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.row.spread > div.row > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U124
- **Route(s):** #/dpe-fees
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#dpe-fees-form > p.muted.small > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U125
- **Route(s):** #/admin
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > div.stack > div.card.anim > div.row.spread > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U126
- **Route(s):** #/admin
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > div.card.anim > div.grid.g3.small > div > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U127
- **Route(s):** #/school/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `table.ready-table > tbody > tr > td > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U128
- **Route(s):** #/school/cohort
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `form.card.stack.anim > div.check-list > label.check-row > span > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U129
- **Route(s):** #/school/cohort
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `form.card.stack.anim > div.check-list > label.check-row.is-busy > span > span.pill`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U130
- **Route(s):** #/school/cohort
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `form.card.stack.anim > div.check-list > label.check-row.is-busy > span > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U131
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-op-foot.small > span > span.pill.wk-fresh.wk-fresh-ok`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U132
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#all-in > div.row.spread > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U133
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#cost-estimate > div.row.spread > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U134
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `div.v4-prof-more > div.stack > section.card.anim > p.small > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U135
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d4?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#reviews > div.row.spread > span.pill.warn`
- **Colors:** #33290F on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U136
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.wk-page > section.card.wk-status.ok > div.row.spread.wk-status-row > div > span.pill.wk-nudge.wk-nudge-due`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U137
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.wk-page > section.card.wk-status.amber > div.row.spread.wk-status-row > div > span.pill.wk-fresh.wk-fresh-amber`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U138
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.wk-page > section.card.wk-status.amber > div.row.spread.wk-status-row > div > span.pill.wk-nudge.wk-nudge-due`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U139
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.wk-page > section.card.wk-status.stale > div.row.spread.wk-status-row > div > span.pill.wk-nudge.wk-nudge-stale`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U140
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `section.card.avail-status.amber > div.row.spread > div > div > span.pill.wk-fresh.wk-fresh-amber`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U141
- **Route(s):** #/dpe/d1?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#v4-openings > div.v4-op-foot.small > span > span.pill.wk-fresh.wk-fresh-amber`
- **Colors:** #1E2A40 on #121E33
- **Ratio:** 1.16:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U142
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#how > ol.grid.g3.steps-v3 > li.card > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U143
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#schools > div.v4-card.v4-table-card > div.v4-req-row > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U144
- **Route(s):** #/journey
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#journey-ready > div.row > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U145
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page > section.card.anim > div.row > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U146
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#med-block > label.field > span > span.pill.verify`
- **Colors:** #2A2148 on #0F1A2C
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U147
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `ol.ready9 > li > div.inset.prep-student > p.muted.small > span.pill.verify`
- **Colors:** #2A2148 on #0F1A2C
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U148
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page.split > section.stack.anim > article.card.result > div.price > div.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U149
- **Route(s):** #/requests, #/school, #/school/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `table > tbody > tr > td > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U150
- **Route(s):** #/dpe-applicants
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.row.spread > div.row > div > div.small.row > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U151
- **Route(s):** #/school, #/school/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `tbody > tr > td > div.row > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U152
- **Route(s):** #/school/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `table.ready-table > tbody > tr > td > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U153
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · in-app-dark (4+ observations)
- **Selector:** `#how > ol.grid.g3.steps-v3 > li.card.anim > span.pill.good`
- **Colors:** #13301F on #121E33
- **Ratio:** 1.17:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U154
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#how > ol.grid.g3.steps-v3 > li.card > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U155
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#examiners > div.v4-card.v4-inbox > div.v4-req > div.small > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U156
- **Route(s):** #/signup
- **Seen on:** chromium · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.v4-auth-card.card.anim > form.stack > fieldset.v4-roles > label.v4-radio.card > input`
- **Colors:** #121E33 on #1B2C4F
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U157
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#med-block > span.muted.small > span.pill`
- **Colors:** #1E2A40 on #0F1A2C
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U158
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `ol.ready9 > li > div.inset.prep-student > div.row > span.pill`
- **Colors:** #1E2A40 on #0F1A2C
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U159
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `section.card.anim > div.slot-row > div > div.row.small > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U160
- **Route(s):** #/requests, #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `table > tbody > tr > td > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U161
- **Route(s):** #/dpe-applicants
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.row.spread > div.row > div > div.small.row > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U162
- **Route(s):** #/school, #/school/readiness
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `tbody > tr > td > div.row > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U163
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · in-app-dark (4+ observations)
- **Selector:** `#how > ol.grid.g3.steps-v3 > li.card.anim > span.pill.accent`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U164
- **Route(s):** #/find, #/after/pass, #/after/inc, #/after/dis, #/journey, #/readiness, #/more, #/saved, #/faq, #/search, #/alerts, #/bookings
- **Seen on:** chromium, firefox · 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#nav > a.active`
- **Colors:** #1B2C4F on #121E33
- **Ratio:** 1.21:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U165
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#examiners > div.v4-card.v4-inbox > div.row.spread > span.pill.v4-ex`
- **Colors:** #12304A on #121E33
- **Ratio:** 1.23:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U166
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#schools > div.v4-card.v4-table-card > div.row.spread > span.pill.v4-ex`
- **Colors:** #12304A on #121E33
- **Ratio:** 1.23:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U167
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#find-results > article.v4-card.v4-find-card > div.v4-chips > span.pill.v4-ex`
- **Colors:** #12304A on #121E33
- **Ratio:** 1.23:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U168
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#school-near > div.row.spread > span.pill.v4-ex`
- **Colors:** #12304A on #121E33
- **Ratio:** 1.23:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U169
- **Route(s):** #/signup
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.v4-auth-card.card.anim > form.stack > fieldset.v4-roles > label.v4-radio.card > input`
- **Colors:** #2B3B57 on #1B2C4F
- **Ratio:** 1.23:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U170
- **Route(s):** #/alerts, #/bookings, #/my-checklists, #/checklists, #/admin
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `#app > div.page > div.page-head.v3-head.anim > h1 > span.pill.warn`
- **Colors:** #33290F on #0B1424
- **Ratio:** 1.29:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U171
- **Route(s):** #/compare, #/dpe-fees
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `#app > div.page > div.page-head.anim > h1 > span.pill.warn`
- **Colors:** #33290F on #0B1424
- **Ratio:** 1.29:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U172
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.page > div.page-head.row.spread > div > p.muted > span.pill.good`
- **Colors:** #13301F on #0B1424
- **Ratio:** 1.29:1 (threshold 3:1, fill vs adjacent (no 3:1 border))
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U173
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-days > button.v4-day`
- **Colors:** #24334C on #121E33
- **Ratio:** 1.31:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U174
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `section.stack.anim > article.card.result > div > div.chips > a.chip`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U175
- **Route(s):** #/login
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (4+ observations)
- **Selector:** `form.stack > fieldset.field.v4-role-mini > div.row > label.v4-radio.sm > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U176
- **Route(s):** #/signup
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.v4-auth-card.card.anim > form.stack > fieldset.v4-roles > label.v4-radio.card > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U177
- **Route(s):** #/signup
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#signup-age`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U178
- **Route(s):** #/home, #/onboarding
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page.narrow.fr-page > div.fr-cards > label.fr-card > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U179
- **Route(s):** #/readiness
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-s0`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U180
- **Route(s):** #/readiness
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-s1`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U181
- **Route(s):** #/readiness
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-s2`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U182
- **Route(s):** #/readiness
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-retest`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U183
- **Route(s):** #/readiness
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `section.card.anim > ol.ready9 > li > label.check-item > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U184
- **Route(s):** #/more
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (4+ observations)
- **Selector:** `#fr-more-unsure`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U185
- **Route(s):** #/checklists
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.split-r > div.stack > section.card.anim > label.check-item > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U186
- **Route(s):** #/dpe-openings
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (10+ observations)
- **Selector:** `#avail-reminders > form.row > label.row.small > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U187
- **Route(s):** #/openings
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `form.stack > fieldset > div.row.small > label.row > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U188
- **Route(s):** #/school/cohort
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.stack > form.card.stack.anim > div.check-list > label.check-row > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
### U189
- **Route(s):** #/school/cohort
- **Seen on:** firefox · 360 / 1440 px · system+prefers-dark (2+ observations)
- **Selector:** `div.page.cohort-page > div.stack > form.card.stack.anim > label.check-row.small > input`
- **Colors:** #2B3B57 on #121E33
- **Ratio:** 1.48:1 (threshold 3:1, border vs fill/adjacent)
- **Suggested token:** Component boundary: --border/#24334C is ~1.3–1.5:1 on --bg/--surface; use --border-control (#71819B, ≥3:1) or a new dark border token pending BD.
## 3. Focus-ring contrast

### F1
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-d0`
- **Colors:** — on #121E33
- **Ratio:** n/a:1 (threshold 3:1, no visible focus ring (outline/box-shadow))
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F2
- **Route(s):** #/readiness
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark (2+ observations)
- **Selector:** `#clock-prep-h0`
- **Colors:** — on #121E33
- **Ratio:** n/a:1 (threshold 3:1, no visible focus ring (outline/box-shadow))
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F3
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark (8+ observations)
- **Selector:** `details > section.inset > ul > li > a`
- **Colors:** — on #0F1A2C
- **Ratio:** n/a:1 (threshold 3:1, no visible focus ring (outline/box-shadow))
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F4
- **Route(s):** #/, #/login, #/signup, #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-auth > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F5
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark, in-app-dark (4+ observations)
- **Selector:** `#land-find`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F6
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#students > div > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F7
- **Route(s):** #/
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#students > div.v4-card.v4-findmock > a.btn.v4-wide`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F8
- **Route(s):** #/login
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#login-submit`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F9
- **Route(s):** #/signup
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#signup-submit`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F10
- **Route(s):** #/home, #/onboarding
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (8+ observations)
- **Selector:** `#app > div.page.narrow.fr-page > div.fr-actions.row > button.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F11
- **Route(s):** #/after/pass, #/after/inc, #/after/dis
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#app > div.page.narrow.after-page > div.row.after-ctas > a.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F12
- **Route(s):** #/more
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#fr-more-plan > div.row > button.btn.cta`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F13
- **Route(s):** #/saved
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page.narrow > div.card.empty.state > div.empty-actions > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F14
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#soonest-lead > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F15
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page.split > section.stack.anim > div.cta-banner.row.spread > button.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F16
- **Route(s):** #/alerts
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > form.grid.g2 > div > button.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F17
- **Route(s):** #/bookings, #/my-checklists, #/dpe/p1?cert=ppl, #/dpe/p2?cert=ppl, #/dpe/p3?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (12+ observations)
- **Selector:** `#app > div.page > div.card.empty.state > div.empty-actions > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F18
- **Route(s):** #/checklists
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page > div.split-r > aside.card.sticky.anim > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F19
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#dash-openings`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F20
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.slot-row > div.row > button.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F21
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark (2+ observations)
- **Selector:** `#publish-link-card > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F22
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-save`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F23
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#wk-confirm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F24
- **Route(s):** #/dpe-fees
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#dpe-fees-form > div.row > button.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F25
- **Route(s):** #/openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#publish-submit`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F26
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `#app > div.page > div.page-head.row.spread > div.row > a.btn`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F27
- **Route(s):** #/school
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `tbody > tr > td.num > div.row > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F28
- **Route(s):** #/school/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `table > tbody > tr > td.num > a.btn.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F29
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-days > button.v4-day`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F30
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-openings > div.v4-times > button.v4-time`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F31
- **Route(s):** #/dpe/d1?cert=ppl, #/dpe/d2?cert=ppl, #/dpe/d3?cert=ppl, #/dpe/d5?cert=ppl, #/dpe/d6?cert=ppl, #/dpe/d7?cert=ppl, #/dpe/d8?cert=ppl, #/dpe/d9?cert=ppl, #/dpe/d10?cert=ppl, #/dpe/d11?cert=ppl, #/dpe/d12?cert=ppl, #/dpe/d13?cert=ppl
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#v4-request`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F32
- **Route(s):** #/, #/login, #/signup, #/home, #/onboarding
- **Seen on:** chromium, firefox · 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `header.topbar > div.topbar-inner > div.topbar-right > a.btn.cta.sm`
- **Colors:** #3860E3 on #3860E3
- **Ratio:** 1:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F33
- **Route(s):** #/requests
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `div.stack > section.card.anim > div.slot-row > div.row > button.btn.good.sm`
- **Colors:** #3860E3 on #4DBA6E
- **Ratio:** 2.17:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F34
- **Route(s):** #/dpe-openings
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#avail-confirm`
- **Colors:** #3860E3 on #4DBA6E
- **Ratio:** 2.17:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F35
- **Route(s):** #/admin
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (6+ observations)
- **Selector:** `div.page > div.stack > div.card.anim > div.row > button.btn.good.sm`
- **Colors:** #3860E3 on #4DBA6E
- **Ratio:** 2.17:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F36
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (8+ observations)
- **Selector:** `#find-results > article.v4-card.v4-find-card > div.v4-next > div.v4-times > a.v4-time`
- **Colors:** #3860E3 on #12304A
- **Ratio:** 2.55:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F37
- **Route(s):** #/find
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark, in-app-dark (4+ observations)
- **Selector:** `div.v4-col > form.v4-filters > div.field.v4-f-radius > div.v4-seg > a.v4-seg-b`
- **Colors:** #3860E3 on #1B2C4F
- **Ratio:** 2.6:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F38
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark, in-app-dark (10+ observations)
- **Selector:** `#wk-days > fieldset.wk-day.is-open > button.wk-switch`
- **Colors:** #3860E3 on #1B2C4F
- **Ratio:** 2.6:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F39
- **Route(s):** #/dpe-week
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#wk-days > fieldset.wk-day.is-open > button.btn.ghost.sm`
- **Colors:** #3860E3 on #1B2C4F
- **Ratio:** 2.6:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F40
- **Route(s):** #/find, #/after/pass, #/after/inc, #/after/dis, #/journey, #/readiness, #/more, #/saved, #/faq, #/search, #/alerts, #/bookings
- **Seen on:** chromium, firefox · 1440 px · system+prefers-dark, in-app-dark (12+ observations)
- **Selector:** `#nav > a.active`
- **Colors:** #3860E3 on #1B2C4F
- **Ratio:** 2.6:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F41
- **Route(s):** #/search
- **Seen on:** chromium, firefox · 360 / 1440 px · system+prefers-dark (4+ observations)
- **Selector:** `section.stack.anim > article.card.result > div > div.chips > a.chip.soon`
- **Colors:** #3860E3 on #13301F
- **Ratio:** 2.69:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F42
- **Route(s):** #/compare
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark (2+ observations)
- **Selector:** `table.cmp > tbody > tr.best > td > a`
- **Colors:** #3860E3 on #13301F
- **Ratio:** 2.69:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
### F43
- **Route(s):** #/checklists, #/school, #/school/requests, #/school/readiness
- **Seen on:** chromium, firefox · 360 px · system+prefers-dark (12+ observations)
- **Selector:** `#app > div.page > nav.tabs.anim > a`
- **Colors:** #3860E3 on #1E2A40
- **Ratio:** 2.71:1 (threshold 3:1, outline)
- **Suggested token:** Use --focus (#9DB4FF, 9.13:1 on --bg) for the visible ring; avoid outline:none with a --accent-soft glow (1.2:1 on --surface). --accent (#3860E3) is only ~3.1:1 on --surface.
## 4. Hard-coded colors that bypass tokens

Static scan of `styles.css` (rules outside `:root` / `[data-theme]` token blocks), `var(--token, #light-fallback)` (flagged especially when the token is **missing**), `app.js` inline styles, and the pre-paint block in `index.html`. Mask-image `#000` stops are omitted (they are not fills). Light-token *definitions* themselves are omitted.

### H1
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--card)`)
- **Selector:** `var(--card)`
- **File:** `styles.css:1413`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** TOKEN MISSING — fallback is used at runtime, including in dark
- **Snippet:** `var(--card, #fff)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H2
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`inline style`)
- **Selector:** `inline style`
- **File:** `app.js:4993`
- **Colors:** `#b42318`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `margin:0;color:var(--bad, #b42318)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #B42318 → use dark --bad (light)).

### H3
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`pre-paint <style> body`)
- **Selector:** `pre-paint <style> body`
- **File:** `index.html:1`
- **Colors:** `#F6F9FC / #162941 (dark override #0B1424 / #EAF0F8)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** pre-paint + theme-color; not a token
- **Snippet:** `Hard-coded pre-paint colors (dark branch exists). Light paper #F6F9FC ≠ --bg #F7FAFD; dark theme-color #10141d ≠ --bg #0B1424.`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H4
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:35`
- **Colors:** `#F7FAFD`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--bg: #F7FAFD; --bg-tint: #F3F6FF;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #F7FAFD → use dark --bg).

### H5
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:35`
- **Colors:** `#F3F6FF`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--bg: #F7FAFD; --bg-tint: #F3F6FF;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #F3F6FF → use dark --bg-tint).

### H6
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:36,41,44`
- **Colors:** `#FFFFFF`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--surface: #FFFFFF; --surface-inset: #F6F9FB; --surface-hero: #EDF5FC; --surface-hero-2: #EAF2FD;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H7
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:36`
- **Colors:** `#F6F9FB`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--surface: #FFFFFF; --surface-inset: #F6F9FB; --surface-hero: #EDF5FC; --surface-hero-2: #EAF2FD;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #F6F9FB → use dark --surface-inset).

### H8
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:36`
- **Colors:** `#EDF5FC`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--surface: #FFFFFF; --surface-inset: #F6F9FB; --surface-hero: #EDF5FC; --surface-hero-2: #EAF2FD;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #EDF5FC → use dark --surface-hero).

### H9
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:36`
- **Colors:** `#EAF2FD`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--surface: #FFFFFF; --surface-inset: #F6F9FB; --surface-hero: #EDF5FC; --surface-hero-2: #EAF2FD;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H10
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:37,48`
- **Colors:** `#F0F3F9`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--surface-2: #F0F3F9; --surface-3: #EAEDF6;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #F0F3F9 → use dark --surface-2).

### H11
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:37,48`
- **Colors:** `#EAEDF6`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--surface-2: #F0F3F9; --surface-3: #EAEDF6;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #EAEDF6 → use dark --surface-3 / --track).

### H12
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:38,40,43`
- **Colors:** `#172941`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--text: #172941; --muted: #4A5A73; --faint: #5E6778; --subtle: #5E6778; --label: #495A6E; --placeholder: #626C7E;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #172941 → use dark --text / --navy / --brand).

### H13
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:38`
- **Colors:** `#4A5A73`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--text: #172941; --muted: #4A5A73; --faint: #5E6778; --subtle: #5E6778; --label: #495A6E; --placeholder: #626C7E;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #4A5A73 → use dark --muted).

### H14
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:38,38`
- **Colors:** `#5E6778`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--text: #172941; --muted: #4A5A73; --faint: #5E6778; --subtle: #5E6778; --label: #495A6E; --placeholder: #626C7E;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #5E6778 → use dark --faint / --subtle).

### H15
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:38,48`
- **Colors:** `#495A6E`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--text: #172941; --muted: #4A5A73; --faint: #5E6778; --subtle: #5E6778; --label: #495A6E; --placeholder: #626C7E;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #495A6E → use dark --label).

### H16
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:38`
- **Colors:** `#626C7E`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--text: #172941; --muted: #4A5A73; --faint: #5E6778; --subtle: #5E6778; --label: #495A6E; --placeholder: #626C7E;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #626C7E → use dark --placeholder).

### H17
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:39`
- **Colors:** `#D6E0EC`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--border: #D6E0EC; --border-strong: #D1DAEB; --rule: #D1DAEB; --rule-accent: #C3DAFA; --border-control: #808DA2;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #D6E0EC → use dark --border).

### H18
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:39,39`
- **Colors:** `#D1DAEB`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--border: #D6E0EC; --border-strong: #D1DAEB; --rule: #D1DAEB; --rule-accent: #C3DAFA; --border-control: #808DA2;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #D1DAEB → use dark --border-strong).

### H19
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:39`
- **Colors:** `#C3DAFA`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--border: #D6E0EC; --border-strong: #D1DAEB; --rule: #D1DAEB; --rule-accent: #C3DAFA; --border-control: #808DA2;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H20
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:39`
- **Colors:** `#808DA2`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--border: #D6E0EC; --border-strong: #D1DAEB; --rule: #D1DAEB; --rule-accent: #C3DAFA; --border-control: #808DA2;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H21
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:41,42,42,42`
- **Colors:** `#3860E3`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--accent: #3860E3; --accent-strong: #2A4FC7; --accent-text: #2A4FC7; --accent-soft: #E6ECFC; --accent-soft-2: #E3F2FC; --on-accent: #FFFFFF;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--accent).

### H22
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:41,41`
- **Colors:** `#2A4FC7`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--accent: #3860E3; --accent-strong: #2A4FC7; --accent-text: #2A4FC7; --accent-soft: #E6ECFC; --accent-soft-2: #E3F2FC; --on-accent: #FFFFFF;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #2A4FC7 → use dark --accent-strong / --accent-text (light)).

### H23
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:41`
- **Colors:** `#E6ECFC`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--accent: #3860E3; --accent-strong: #2A4FC7; --accent-text: #2A4FC7; --accent-soft: #E6ECFC; --accent-soft-2: #E3F2FC; --on-accent: #FFFFFF;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E6ECFC → use dark --accent-soft).

### H24
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:41,48`
- **Colors:** `#E3F2FC`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--accent: #3860E3; --accent-strong: #2A4FC7; --accent-text: #2A4FC7; --accent-soft: #E6ECFC; --accent-soft-2: #E3F2FC; --on-accent: #FFFFFF;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E3F2FC → use dark --accent-soft-2 / --info-soft).

### H25
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:42`
- **Colors:** `#2A4DCD`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--headline-accent: #3860E3; --date-num: #2A4DCD; --indicator: #3860E3; --focus: #3860E3;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H26
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:43,51`
- **Colors:** `#F9FDFE`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--navy: #172941; --on-navy: #F9FDFE; --on-navy-muted: #C9D6E8; --navy-dot: #A6C6F9; --strip-text: #3E5B7D;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H27
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:43,51`
- **Colors:** `#C9D6E8`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--navy: #172941; --on-navy: #F9FDFE; --on-navy-muted: #C9D6E8; --navy-dot: #A6C6F9; --strip-text: #3E5B7D;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H28
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:43`
- **Colors:** `#A6C6F9`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--navy: #172941; --on-navy: #F9FDFE; --on-navy-muted: #C9D6E8; --navy-dot: #A6C6F9; --strip-text: #3E5B7D;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--navy-dot).

### H29
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:43`
- **Colors:** `#3E5B7D`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--navy: #172941; --on-navy: #F9FDFE; --on-navy-muted: #C9D6E8; --navy-dot: #A6C6F9; --strip-text: #3E5B7D;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H30
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:45,45`
- **Colors:** `#1F7A4D`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--good: #1F7A4D; --good-text: #1F7A4D; --good-soft: #E2F4EA;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #1F7A4D → use dark --good (light)).

### H31
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:45`
- **Colors:** `#E2F4EA`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--good: #1F7A4D; --good-text: #1F7A4D; --good-soft: #E2F4EA;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E2F4EA → use dark --good-soft).

### H32
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:46,46`
- **Colors:** `#8A5300`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--warn: #8A5300; --warn-text: #8A5300; --warn-soft: #FFF1D6;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #8A5300 → use dark --warn / --warn-text (light)).

### H33
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:46`
- **Colors:** `#FFF1D6`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--warn: #8A5300; --warn-text: #8A5300; --warn-soft: #FFF1D6;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FFF1D6 → use dark --warn-soft).

### H34
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:47,47`
- **Colors:** `#B42318`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--bad: #B42318; --bad-text: #B42318; --bad-soft: #FDE8E6; --bad-border-control: #B86E72;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #B42318 → use dark --bad (light)).

### H35
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:47`
- **Colors:** `#FDE8E6`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--bad: #B42318; --bad-text: #B42318; --bad-soft: #FDE8E6; --bad-border-control: #B86E72;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FDE8E6 → use dark --bad-soft).

### H36
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:47`
- **Colors:** `#B86E72`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--bad: #B42318; --bad-text: #B42318; --bad-soft: #FDE8E6; --bad-border-control: #B86E72;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H37
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:48`
- **Colors:** `#0B5E8E`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--info-soft: #E3F2FC; --info-text: #0B5E8E; --neutral-soft: #F0F3F9; --neutral-text: #495A6E; --track: #EAEDF6;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H38
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:49`
- **Colors:** `#F3EEFF`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--verify-soft: #F3EEFF; --verify-text: #5B3DB8;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H39
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:49`
- **Colors:** `#5B3DB8`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--verify-soft: #F3EEFF; --verify-text: #5B3DB8;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H40
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:50`
- **Colors:** `#f2b33d`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--signal: #f2b33d;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H41
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:51`
- **Colors:** `#15273F`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--board-bg: #15273F; --board-row: #1C3150; --board-row-hover: #233B5F; --board-text: #F9FDFE; --board-dim: #C9D6E8;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H42
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:51`
- **Colors:** `#1C3150`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--board-bg: #15273F; --board-row: #1C3150; --board-row-hover: #233B5F; --board-text: #F9FDFE; --board-dim: #C9D6E8;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H43
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:51`
- **Colors:** `#233B5F`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--board-bg: #15273F; --board-row: #1C3150; --board-row-hover: #233B5F; --board-text: #F9FDFE; --board-dim: #C9D6E8;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H44
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:52`
- **Colors:** `rgb(0 0 0 / .45)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--scrim: rgb(0 0 0 / .45);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H45
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:53,56`
- **Colors:** `rgb(22 41 65 / .04)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--shadow-sm: 0 1px 2px rgb(22 41 65 / .04), 0 8px 24px -12px rgb(22 41 65 / .10);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H46
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:53,56`
- **Colors:** `rgb(22 41 65 / .10)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--shadow-sm: 0 1px 2px rgb(22 41 65 / .04), 0 8px 24px -12px rgb(22 41 65 / .10);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H47
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:54`
- **Colors:** `rgb(22 41 65 / .05)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--shadow-md: 0 1px 2px rgb(22 41 65 / .05), 0 14px 30px -12px rgb(22 41 65 / .18);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H48
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:54`
- **Colors:** `rgb(22 41 65 / .18)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--shadow-md: 0 1px 2px rgb(22 41 65 / .05), 0 14px 30px -12px rgb(22 41 65 / .18);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H49
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:55`
- **Colors:** `rgb(22 41 65 / .35)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--shadow-lg: 0 30px 70px -20px rgb(22 41 65 / .35);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H50
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`)
- **Selector:** `resolved to light or dark by the pre-paint script in index.html. Older variable names used across this file map onto v3 values. */ :root, :root[data-theme="light"]`
- **File:** `styles.css:57`
- **Colors:** `rgb(56 96 227 / .55)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `--shadow-cta: 0 10px 22px -10px rgb(56 96 227 / .55);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H51
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.proto-banner`)
- **Selector:** `.proto-banner`
- **File:** `styles.css:540`
- **Colors:** `#c42f2a`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: #c42f2a; color: #fff; text-align: center; font-size: .8rem; line-height: 1.35;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H52
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.proto-banner`)
- **Selector:** `.proto-banner`
- **File:** `styles.css:540`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: #c42f2a; color: #fff; text-align: center; font-size: .8rem; line-height: 1.35;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H53
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.review`)
- **Selector:** `.review`
- **File:** `styles.css:559`
- **Colors:** `rgba(0,0,0,.02)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.review { margin: .5rem 0 0; padding: .6rem .8rem; border-left: 3px solid var(--border-strong); background: var(--surface-2, rgba(0,0,0,.02)); border-radius: 0 var(--r-sm) var(--r-sm) 0; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H54
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--surface-2)`)
- **Selector:** `var(--surface-2)`
- **File:** `styles.css:559`
- **Colors:** `rgba(0,0,0,.02`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--surface-2, rgba(0,0,0,.02)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H55
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.switch .track::after`)
- **Selector:** `.switch .track::after`
- **File:** `styles.css:602`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.switch .track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .2s; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H56
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.switch .track::after`)
- **Selector:** `.switch .track::after`
- **File:** `styles.css:602`
- **Colors:** `rgba(0,0,0,.25)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.switch .track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .2s; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H57
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.avail-save`)
- **Selector:** `.avail-save`
- **File:** `styles.css:610`
- **Colors:** `rgba(0,0,0,.08)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.avail-save { position: sticky; bottom: 0; z-index: 5; display: flex; justify-content: space-between; align-items: center; gap: .75rem; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border); border`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H58
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.gate.bad`)
- **Selector:** `.gate.bad`
- **File:** `styles.css:650`
- **Colors:** `#fdecec`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.gate.bad { background: var(--bad-soft, #fdecec); border-color: var(--bad); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FDECEC → use dark --bad-soft (fallback)).

### H59
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--bad-soft)`)
- **Selector:** `var(--bad-soft)`
- **File:** `styles.css:650,726`
- **Colors:** `#fdecec`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--bad-soft, #fdecec)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FDECEC → use dark --bad-soft (fallback)).

### H60
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.gate.good`)
- **Selector:** `.gate.good`
- **File:** `styles.css:652`
- **Colors:** `#e8f6ee`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.gate.good { background: var(--good-soft, #e8f6ee); border-color: var(--good); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E8F6EE → use dark --good-soft (fallback)).

### H61
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--good-soft)`)
- **Selector:** `var(--good-soft)`
- **File:** `styles.css:652`
- **Colors:** `#e8f6ee`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--good-soft, #e8f6ee)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E8F6EE → use dark --good-soft (fallback)).

### H62
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.demo-date-bar`)
- **Selector:** `.demo-date-bar`
- **File:** `styles.css:704`
- **Colors:** `#fff4cc`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.demo-date-bar { background: #fff4cc; color: #4d3800; font-size: .78rem; line-height: 1.35; text-align: center; padding: .25rem .75rem; border-bottom: 1px solid #f0d77a; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FFF4CC → use dark --warn-soft).

### H63
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.demo-date-bar`)
- **Selector:** `.demo-date-bar`
- **File:** `styles.css:704`
- **Colors:** `#4d3800`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.demo-date-bar { background: #fff4cc; color: #4d3800; font-size: .78rem; line-height: 1.35; text-align: center; padding: .25rem .75rem; border-bottom: 1px solid #f0d77a; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #4D3800 → use dark --warn-text).

### H64
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.demo-date-bar`)
- **Selector:** `.demo-date-bar`
- **File:** `styles.css:704`
- **Colors:** `#f0d77a`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.demo-date-bar { background: #fff4cc; color: #4d3800; font-size: .78rem; line-height: 1.35; text-align: center; padding: .25rem .75rem; border-bottom: 1px solid #f0d77a; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #F0D77A → use dark --warn / border).

### H65
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.demo-date-bar span`)
- **Selector:** `.demo-date-bar span`
- **File:** `styles.css:705`
- **Colors:** `#5c4a14`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.demo-date-bar span { color: #5c4a14; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #5C4A14 → use dark --warn-text).

### H66
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.spinner`)
- **Selector:** `.spinner`
- **File:** `styles.css:714`
- **Colors:** `#c9d0dc`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-strong, #c9d0dc); border-top-color: var(--accent); animation: spin .8s linear infinite; flex-shrink: 0; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #C9D0DC → use dark --border-strong).

### H67
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--border-strong)`)
- **Selector:** `var(--border-strong)`
- **File:** `styles.css:714`
- **Colors:** `#c9d0dc`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--border-strong, #c9d0dc)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #C9D0DC → use dark --border-strong).

### H68
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.sk`)
- **Selector:** `.sk`
- **File:** `styles.css:715`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.sk { border-radius: 10px; background: linear-gradient(90deg, var(--surface-2) 25%, color-mix(in srgb, var(--surface-2) 40%, var(--surface, #fff)) 50%, var(--surface-2) 75%); background-size: 300% 100%; animation: shimme`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H69
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--surface)`)
- **Selector:** `var(--surface)`
- **File:** `styles.css:715,1035`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--surface, #fff)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H70
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.state-ic`)
- **Selector:** `.state-ic`
- **File:** `styles.css:725`
- **Colors:** `#e9eeff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.state-ic { color: var(--accent-text); background: var(--accent-soft, #e9eeff); border-radius: 50%; padding: 10px; width: 48px; height: 48px; box-sizing: border-box; margin-bottom: .4rem; flex-shrink: 0; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E9EEFF → use dark --accent-soft (fallback)).

### H71
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--accent-soft)`)
- **Selector:** `var(--accent-soft)`
- **File:** `styles.css:725`
- **Colors:** `#e9eeff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--accent-soft, #e9eeff)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E9EEFF → use dark --accent-soft (fallback)).

### H72
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`[data-state="render-error"] .state-ic, [data-state="load-error"] .state-ic`)
- **Selector:** `[data-state="render-error"] .state-ic, [data-state="load-error"] .state-ic`
- **File:** `styles.css:726`
- **Colors:** `#fdecec`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `[data-state="render-error"] .state-ic, [data-state="load-error"] .state-ic { color: var(--bad); background: var(--bad-soft, #fdecec); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FDECEC → use dark --bad-soft (fallback)).

### H73
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.net-banner.off`)
- **Selector:** `.net-banner.off`
- **File:** `styles.css:735`
- **Colors:** `#1f2633`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.net-banner.off { background: #1f2633; color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H74
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.net-banner.off`)
- **Selector:** `.net-banner.off`
- **File:** `styles.css:735`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.net-banner.off { background: #1f2633; color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H75
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.net-banner.on`)
- **Selector:** `.net-banner.on`
- **File:** `styles.css:736`
- **Colors:** `#e6f6ec`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.net-banner.on { background: #e6f6ec; color: #11512b; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E6F6EC → use dark --good-soft).

### H76
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.net-banner.on`)
- **Selector:** `.net-banner.on`
- **File:** `styles.css:736`
- **Colors:** `#11512b`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.net-banner.on { background: #e6f6ec; color: #11512b; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #11512B → use dark --good-text).

### H77
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.skip-link`)
- **Selector:** `.skip-link`
- **File:** `styles.css:1035`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.skip-link { position: absolute; left: .5rem; top: -100px; z-index: 1000; background: var(--surface, #fff); color: var(--accent-text, #000); padding: .6rem .9rem; border-radius: var(--r-sm, 6px); font-weight: 700; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H78
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.skip-link`)
- **Selector:** `.skip-link`
- **File:** `styles.css:1035`
- **Colors:** `#000`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.skip-link { position: absolute; left: .5rem; top: -100px; z-index: 1000; background: var(--surface, #fff); color: var(--accent-text, #000); padding: .6rem .9rem; border-radius: var(--r-sm, 6px); font-weight: 700; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H79
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--accent-text)`)
- **Selector:** `var(--accent-text)`
- **File:** `styles.css:1035`
- **Colors:** `#000`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--accent-text, #000)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H80
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`input[aria-invalid="true"]`)
- **Selector:** `input[aria-invalid="true"]`
- **File:** `styles.css:1041,1041`
- **Colors:** `#b42318`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `input[aria-invalid="true"] { border-color: var(--bad, #b42318); box-shadow: 0 0 0 1px var(--bad, #b42318); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #B42318 → use dark --bad (light)).

### H81
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--bad)`)
- **Selector:** `var(--bad)`
- **File:** `styles.css:1041,1041,1494`
- **Colors:** `#b42318`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--bad, #b42318)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #B42318 → use dark --bad (light)).

### H82
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`:root { --sky }`)
- **Selector:** `:root { --sky }`
- **File:** `styles.css:1061`
- **Colors:** `#7CC4F2`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light-only token used by .v4-promise .eyebrow
- **Snippet:** `--sky: #7CC4F2 is not remapped in :root[data-theme=dark] (only --sky-soft / --sky-ink are)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H83
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-time[aria-pressed="true"], .v4-time.is-on`)
- **Selector:** `.v4-time[aria-pressed="true"], .v4-time.is-on`
- **File:** `styles.css:1085`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-time[aria-pressed="true"], .v4-time.is-on { background: var(--accent); border-color: var(--accent); color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H84
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-time[aria-pressed="true"] .muted, .v4-time.is-on .muted`)
- **Selector:** `.v4-time[aria-pressed="true"] .muted, .v4-time.is-on .muted`
- **File:** `styles.css:1086`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-time[aria-pressed="true"] .muted, .v4-time.is-on .muted { color: #fff; } /* axe: #E6ECFC on brand was 4.49:1 */`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H85
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-time[aria-pressed="true"] .muted, .v4-time.is-on .muted`)
- **Selector:** `.v4-time[aria-pressed="true"] .muted, .v4-time.is-on .muted`
- **File:** `styles.css:1086`
- **Colors:** `#E6ECFC`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-time[aria-pressed="true"] .muted, .v4-time.is-on .muted { color: #fff; } /* axe: #E6ECFC on brand was 4.49:1 */`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #E6ECFC → use dark --accent-soft).

### H86
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-day[aria-pressed="true"]`)
- **Selector:** `.v4-day[aria-pressed="true"]`
- **File:** `styles.css:1119`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-day[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H87
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-bar`)
- **Selector:** `.v4-bar`
- **File:** `styles.css:1120`
- **Colors:** `rgba(23,41,65,.16)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-bar { position: sticky; bottom: calc(var(--tabbar-h, 64px) + 8px + env(safe-area-inset-bottom, 0px)); z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; marg`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H88
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-hero-panel`)
- **Selector:** `.v4-hero-panel`
- **File:** `styles.css:1146`
- **Colors:** `#3860E3`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-hero-panel { border-radius: 24px; padding: 2rem 1.25rem; background: linear-gradient(135deg, #3860E3 0%, #2A4FC7 55%, #7CC4F2 140%); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--accent).

### H89
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-hero-panel`)
- **Selector:** `.v4-hero-panel`
- **File:** `styles.css:1146`
- **Colors:** `#2A4FC7`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-hero-panel { border-radius: 24px; padding: 2rem 1.25rem; background: linear-gradient(135deg, #3860E3 0%, #2A4FC7 55%, #7CC4F2 140%); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #2A4FC7 → use dark --accent-strong / --accent-text (light)).

### H90
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-hero-panel`)
- **Selector:** `.v4-hero-panel`
- **File:** `styles.css:1146`
- **Colors:** `#7CC4F2`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-hero-panel { border-radius: 24px; padding: 2rem 1.25rem; background: linear-gradient(135deg, #3860E3 0%, #2A4FC7 55%, #7CC4F2 140%); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H91
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-toast-mock`)
- **Selector:** `.v4-toast-mock`
- **File:** `styles.css:1148`
- **Colors:** `#1F7A4D`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-toast-mock { max-width: 420px; margin: .9rem auto 0; display: flex; gap: .5rem; align-items: center; background: var(--surface); color: var(--good-text, #1F7A4D); border-radius: 999px; padding: .5rem .9rem; font-weig`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #1F7A4D → use dark --good (light)).

### H92
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--good-text)`)
- **Selector:** `var(--good-text)`
- **File:** `styles.css:1148`
- **Colors:** `#1F7A4D`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--good-text, #1F7A4D)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #1F7A4D → use dark --good (light)).

### H93
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise`)
- **Selector:** `.v4-promise`
- **File:** `styles.css:1166`
- **Colors:** `#172941`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise { background: linear-gradient(135deg, #172941 0%, #1E3A66 100%); color: #fff; border-radius: 24px; padding: 2.5rem 1.5rem; text-align: center; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #172941 → use dark --text / --navy / --brand).

### H94
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise`)
- **Selector:** `.v4-promise`
- **File:** `styles.css:1166`
- **Colors:** `#1E3A66`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise { background: linear-gradient(135deg, #172941 0%, #1E3A66 100%); color: #fff; border-radius: 24px; padding: 2.5rem 1.5rem; text-align: center; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H95
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise`)
- **Selector:** `.v4-promise`
- **File:** `styles.css:1166`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise { background: linear-gradient(135deg, #172941 0%, #1E3A66 100%); color: #fff; border-radius: 24px; padding: 2.5rem 1.5rem; text-align: center; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H96
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise h2, .v4-promise p`)
- **Selector:** `.v4-promise h2, .v4-promise p`
- **File:** `styles.css:1168`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise h2, .v4-promise p { color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H97
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise h2 .b`)
- **Selector:** `.v4-promise h2 .b`
- **File:** `styles.css:1169`
- **Colors:** `#BFD3FF`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise h2 .b { color: #BFD3FF; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H98
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise p`)
- **Selector:** `.v4-promise p`
- **File:** `styles.css:1170`
- **Colors:** `#DCE6F5`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise p { max-width: 640px; margin-inline: auto; color: #DCE6F5; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H99
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise .btn.secondary`)
- **Selector:** `.v4-promise .btn.secondary`
- **File:** `styles.css:1171`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise .btn.secondary { background: transparent; color: #fff; border-color: rgba(255,255,255,.6); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H100
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise .btn.secondary`)
- **Selector:** `.v4-promise .btn.secondary`
- **File:** `styles.css:1171`
- **Colors:** `rgba(255,255,255,.6)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise .btn.secondary { background: transparent; color: #fff; border-color: rgba(255,255,255,.6); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H101
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise .pill.warn`)
- **Selector:** `.v4-promise .pill.warn`
- **File:** `styles.css:1172`
- **Colors:** `#FFF1D6`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise .pill.warn { background: #FFF1D6; color: #8A5300; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #FFF1D6 → use dark --warn-soft).

### H102
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.v4-promise .pill.warn`)
- **Selector:** `.v4-promise .pill.warn`
- **File:** `styles.css:1172`
- **Colors:** `#8A5300`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.v4-promise .pill.warn { background: #FFF1D6; color: #8A5300; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #8A5300 → use dark --warn / --warn-text (light)).

### H103
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.saved-toggle[aria-pressed="true"] .saved-bookmark`)
- **Selector:** `.saved-toggle[aria-pressed="true"] .saved-bookmark`
- **File:** `styles.css:1265`
- **Colors:** `#3660E1`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.saved-toggle[aria-pressed="true"] .saved-bookmark { color: var(--accent, #3660E1); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H104
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--accent)`)
- **Selector:** `var(--accent)`
- **File:** `styles.css:1265,1266,1268`
- **Colors:** `#3660E1`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--accent, #3660E1)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H105
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.saved-toggle:focus-visible`)
- **Selector:** `.saved-toggle:focus-visible`
- **File:** `styles.css:1266`
- **Colors:** `#3660E1`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.saved-toggle:focus-visible { outline: 2px solid var(--accent, #3660E1); outline-offset: 2px; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H106
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.saved-new-pill`)
- **Selector:** `.saved-new-pill`
- **File:** `styles.css:1268`
- **Colors:** `#3660E1`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.saved-new-pill { background: var(--accent, #3660E1); color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H107
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.saved-new-pill`)
- **Selector:** `.saved-new-pill`
- **File:** `styles.css:1268`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.saved-new-pill { background: var(--accent, #3660E1); color: #fff; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H108
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.after-mark`)
- **Selector:** `.after-mark`
- **File:** `styles.css:1409,1410`
- **Colors:** `#3860E3`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: radial-gradient(circle at 40% 35%, var(--accent, #3860E3), #1e3a8a);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--accent).

### H109
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.after-mark`)
- **Selector:** `.after-mark`
- **File:** `styles.css:1409`
- **Colors:** `#1e3a8a`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: radial-gradient(circle at 40% 35%, var(--accent, #3860E3), #1e3a8a);`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H110
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--accent)`)
- **Selector:** `var(--accent)`
- **File:** `styles.css:1409,1410,1413,1414`
- **Colors:** `#3860E3`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--accent, #3860E3)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--accent).

### H111
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.after-credit`)
- **Selector:** `.after-credit`
- **File:** `styles.css:1413,1414`
- **Colors:** `#3860E3`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: color-mix(in srgb, var(--accent, #3860E3) 10%, var(--card, #fff));`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--accent).

### H112
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.after-credit`)
- **Selector:** `.after-credit`
- **File:** `styles.css:1413`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: color-mix(in srgb, var(--accent, #3860E3) 10%, var(--card, #fff));`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H113
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.after-credit`)
- **Selector:** `.after-credit`
- **File:** `styles.css:1414`
- **Colors:** `#ddd`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `border: 1px solid color-mix(in srgb, var(--accent, #3860E3) 25%, var(--border, #ddd));`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #DDDDDD → use dark --border).

### H114
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`var(--border)`)
- **Selector:** `var(--border)`
- **File:** `styles.css:1414`
- **Colors:** `#ddd`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Note:** light fallback on a defined token (ok if the token resolves)
- **Snippet:** `var(--border, #ddd)`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #DDDDDD → use dark --border).

### H115
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.share-card`)
- **Selector:** `.share-card`
- **File:** `styles.css:1429`
- **Colors:** `#0b1b4a`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: #0b1b4a; color: #fff; position: relative; overflow: hidden;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H116
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.share-card`)
- **Selector:** `.share-card`
- **File:** `styles.css:1429`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `background: #0b1b4a; color: #fff; position: relative; overflow: hidden;`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H117
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.share-eyebrow`)
- **Selector:** `.share-eyebrow`
- **File:** `styles.css:1432`
- **Colors:** `#93c5fd`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.share-eyebrow { margin: 2.2rem 0 .35rem; font-size: .7rem; letter-spacing: .06em; color: #93c5fd; font-weight: 700; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H118
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.share-detail, .share-examiner`)
- **Selector:** `.share-detail, .share-examiner`
- **File:** `styles.css:1434`
- **Colors:** `#cbd5e1`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.share-detail, .share-examiner { margin: .4rem 0 0; font-size: .85rem; color: #cbd5e1; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H119
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.wk-switch .track::after`)
- **Selector:** `.wk-switch .track::after`
- **File:** `styles.css:1473`
- **Colors:** `#fff`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.wk-switch .track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (--on-accent).

### H120
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.wk-switch .track::after`)
- **Selector:** `.wk-switch .track::after`
- **File:** `styles.css:1473`
- **Colors:** `rgba(0,0,0,.25)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.wk-switch .track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

### H121
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`.wk-err`)
- **Selector:** `.wk-err`
- **File:** `styles.css:1494`
- **Colors:** `#b42318`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.wk-err { color: var(--bad, #b42318); margin: 0; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (light #B42318 → use dark --bad (light)).

### H122
- **Route(s):** n/a (source); runtime impact is global in dark unless the rule is page-specific (`@media (max-width: 1023px)`)
- **Selector:** `@media (max-width: 1023px)`
- **File:** `styles.css:1498`
- **Colors:** `rgba(10, 16, 28, .45)`
- **Ratio:** measured at runtime when the rule paints (see sections 1–3). Static finding only here.
- **Snippet:** `.wk-sheet-bg { display: block; position: fixed; inset: 0; background: rgba(10, 16, 28, .45); z-index: 79; }`
- **Suggested token:** Replace the hard-coded light value with the matching dark token (nearest dark token pending Brand Designer).

## 5. Logo on dark

Header and auth lockups swap with CSS: `.lockup-dark` is shown when `:root[data-theme=dark]`. Files: `brand/checkride-connect-logo-dark.svg` (ink `#EAF0F8`, mark `#3860E3`, paper `#0B1424`) and `brand/checkride-connect-logo-light.svg` (ink `#172941`, mark `#3860E3`, paper `#F6F9FC`).

- **Route(s):** #/, #/login, #/find, #/home, #/dpe/d1?cert=ppl, #/dpe-week, #/after/pass, #/more
- **Selector:** `a.brand img.lockup-dark`, `a.v4-auth-logo img.lockup-dark`
- **Colors:** mark `#3860E3` on paper `#0B1424` (matches `--bg`); wordmark `#EAF0F8` (`--text` / `--brand`)
- **Ratio:** wordmark 16.07:1 (pass); mark `#3860E3` on `#0B1424` = **3.47:1** (passes 3:1 for a graphic, but is below 4.5:1 and contradicts the in-file brand note to use mark-on-navy `#4167E4` or mono-white on navy `#15273F`, not `#3860E3`).
- **Suggested token / asset:** keep the dark lockup swap; pending BD, consider `brand/checkride-connect-mark-mono-white.svg` or a mark-on-navy (`#4167E4`) variant. Screenshots are under `/workspace/checkride-v4/tests/dark/shots` (`*-lockup.png`, `*-header.png`).

No runtime swap failures were recorded: under `data-theme=dark` the dark lockup was visible and the light lockup was hidden on pages that render a brand lockup.

## Appendix A — Theme toggle checks

- chromium 360px · **system+prefers-dark**: `data-theme=dark`, `cc-theme=null`, prefers-dark=true
- chromium 360px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark
- chromium 1440px · **system+prefers-dark**: `data-theme=dark`, `cc-theme=null`, prefers-dark=true
- chromium 1440px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark
- firefox 360px · **system+prefers-dark**: `data-theme=dark`, `cc-theme=null`, prefers-dark=true
- firefox 360px · **in-app-dark (OS light)**: `data-theme=dark`, `cc-theme=dark`, select=dark
- firefox 1440px · **system+prefers-dark**: `data-theme=dark`, `cc-theme=null`, prefers-dark=true
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
- chromium 1440 in-app-dark: 8 pages
- chromium 1440 system+prefers-dark: 80 pages
- chromium 360 in-app-dark: 8 pages
- chromium 360 system+prefers-dark: 80 pages
- firefox 1440 in-app-dark: 8 pages
- firefox 1440 system+prefers-dark: 80 pages
- firefox 360 in-app-dark: 8 pages
- firefox 360 system+prefers-dark: 80 pages

## Appendix C — Method notes

- Contrast uses WCAG 2.x relative luminance on composite (opacity-aware) colors. Large text = 24px regular or 18.66px (≥14 pt) and weight ≥ 700.
- Text is measured on nodes with their own text (or input placeholders). Hidden / `.sr-only` / zero-size nodes are skipped.
- UI components: visible borders of buttons, inputs, selects, textareas, chips, pills, switches, tabs, and the theme select, plus fill-vs-adjacent when there is no 3:1 border. Decorative page rules and cards are not individually listed unless they are those controls.
- Focus: up to 16 unique visible interactives per page are focused; outline and 0-spread box-shadow rings are measured against the composite background. Disabled controls are skipped.
- Wait N=1 has no fixture examiner; the audit injects one `verified_booking` onto `nc28` in the page's `CC_WAIT_DATA` only (no app/source change) after the N=0 visit.
- Freshness states are seeded via `CC_WK.mutate` using the page clock (demo date).
- Brand Designer dark-token notes were not available; suggested tokens refer to the existing dark palette in `styles.css`.
- **No freeze. No app code changes.**
