# QA-011 target-size before count (rc19)

Recorded: 2026-11-10 02:16:12 PM EST (America/New_York).
Evidence: `/workspace/checkride-pm/qa/evidence/rc19-targets/before-20261110-141456/`.

Coverage: 640 pages (every static route, all 31 examiner profiles, wk.* / wait.* / after/* states) at 360 and 390, Chromium and Firefox, light and dark.

| | Count |
|---|---:|
| Pages | 640 |
| Unexplained failures | **0** |
| Unique unexplained | 0 |
| Pass by size (≥44×44 CSS px, including label / ::before hit area) | 17140 |
| WCAG 2.5.8 inline-text exceptions | 372 observations / 13 unique |
| WCAG 2.5.8 spacing exceptions (24px circle) | 256 observations / 10 unique |

Known QA-011 offenders in this before record:

- **24×44 / 22×22 checkboxes:** the visible glyph is still 22×22 or 24×44, but most wrapping labels already met 44px (counted as pass-by-size). Two leftover undersized labels used the spacing exception: “Pause reminders” 141.4×28, certificate checkboxes 78.8×28.
- **22×22 calendar day buttons:** not observed; v4 booking uses `.v4-day` / `.v4-time` (already ≥44). Legacy `.cal button` CSS already set 44px at `max-width: 640px`. Guard CSS still added.
- **“Save a mock alert for …”:** 168×19, classified as inline-text (it sits in a `<p class="small muted">`).
- **“N matching openings now →”:** not present on the default alerts cards in this run (or already ≥44). Class + min-height added anyway.

Other undersized controls in the exception list (inline body links such as “How cancellations work” 151×19, or slightly narrow `.btn.sm` at 42.8px wide with spacing) were documented, not treated as unexplained failures.
