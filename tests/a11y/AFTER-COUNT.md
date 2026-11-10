# QA-011 target-size after count (rc19)

Recorded: 2026-11-10 02:25:39 PM EST (America/New_York).
Evidence: `/workspace/checkride-pm/qa/evidence/rc19-targets/after-20261110-142424/`.

Same coverage as the before record: 640 pages (every static route, all 31 examiner profiles, wk.* / wait.* / after/* states) at 360 and 390, Chromium and Firefox, light and dark.

| | Before | After | Delta |
|---|---:|---:|---:|
| Pages | 640 | 640 | 0 |
| Unexplained failures | **0** | **0** | 0 |
| Unique unexplained | 0 | 0 | 0 |
| Pass by size (≥44×44 CSS px, including label / `::before` hit area) | 17140 | 17396 | +256 |
| WCAG 2.5.8 inline-text exceptions | 372 obs / 13 unique | 364 obs / 12 unique | −8 obs |
| WCAG 2.5.8 spacing exceptions (24px circle) | 256 obs / 10 unique | 40 obs / 5 unique | −216 obs |

No unexplained failures after the hit-area fixes. The new Add to calendar buttons (`[data-cal="ride"]`, `[data-cal="deadline"]`, class `target-44`) passed by size in the dedicated cal-ui overflow / 44×44 checks (Chromium and Firefox at 390).

## Offenders from the before record

- **Pause reminders** label (141.4×28, spacing) and **certificate checkboxes** (78.8×28, spacing): now pass by size via `label:has(input[type="checkbox"])` / `label:has(input[type="radio"])` `min-height: 44px`. Visible glyphs stay 22×22 (`.check-item input` undo of the leftover 24×44 stretch).
- **“Save a mock alert for …”** (168×19, inline-text): now reaches 44px via `a[data-action="alert-from-search"]` / `.target-44`.
- **“N matching openings now →”**: class `target-44` and `a[data-cal-openings]` min-height 44 (hook present even when the link is not on the default alerts card).
- **Legacy `.cal` day buttons**: still not observed on v4 routes; guard CSS remains (`.cal button` 44×44 plus `[data-action="cal-day"]::before` hit pad).

## Remaining documented exceptions (not unexplained failures)

All are WCAG 2.5.8 inline-text (link in a sentence/block) or spacing (24px circle does not intersect another target). Unique after list:

- Inline-text: “How cancellations work” 151×19, “See how it works” 309×41, “Explore the demo” 111×19, “Create a demo account” 152×19, “Log in” 37×19, “Find an examiner” 107×19, “From your examiner” 144×22, “← Back to Requests” 129×19, “Calendar” 58×19, “Schedule a cohort” 280×41, “Cohort scheduling” 117×19, “See the draft” 95×22.
- Spacing: “Open” 34×22, “My checkrides” 92×19, “Detailed starter lists by certificate (unverified draft)” 291×41, “Review this week” 124×25.6, “← Roster” 67×22.

## Selectors changed (padding / min-size / hit-area only; no copy or visual redesign)

In `styles.css`, appended rc19 QA-011 block at `(pointer: coarse), (max-width: 640px)`:

- `label:has(input[type="checkbox"])`, `label:has(input[type="radio"])` — `min-height: 44px`
- `.check-item input[type="checkbox"]` — keep visible box 22×22
- `a[data-action="alert-from-search"]`, `a[data-cal-openings]`, `.target-44` — `min-height: 44px`
- `.cal button` — `min-width` / `min-height: 44px`
- `.cal button[data-action="cal-day"]::before` — 44×44 hit pad
- `.btn, .btn.sm` — `min-width: 44px`
- `.cal-ics`, `.cal-ics .btn` — calendar-file buttons also 44×44
