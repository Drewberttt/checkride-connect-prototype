# COPY-CHANGES — rc16 (v7.24.0)

Recorded: 2026-11-10 America/New_York

Brand Designer final (no INTERIM). Source: `ux-copy-v3.md` §11.12 and §12, placement/anatomy in `design-spec-v3.md` §21.

## RC15-I01 Calendar student labels (`wk.cal.students_*`)

| Key | Value |
|---|---|
| `wk.cal.students_amber` | They also see “Last confirmed [n] days ago.” |
| `wk.cal.students_stale` | They see “Not recently confirmed,” and your slots are hidden from search and requests until you confirm. |
| `wk.cal.students_note` | Students see when you last confirmed, in the same wording they see on your openings. |

- `wk.cal.students_note` is in §11.12 (official key). No INTERIM. Typographic quotes U+201C/U+201D. Retired “may be out of date” tag and “confirm with the examiner” line.

## D49 wait-time (`wait.*`, §12 verbatim)

All §12.1 keys shipped: `wait.headline.under` / `.week` / `.weeks`, `wait.detail`, `wait.empty.headline` / `.detail_zero` / `.detail_some` / `.detail_one`, `wait.stale`, `wait.how_label`, `wait.how`, `wait.aria`, `wait.aria.empty`, `wait.proto`.

No fulfillment line, no national comparison, no PLACEHOLDER / INTERIM.

## SW

`cc-proto-v7.24.0`

---

# COPY-CHANGES — after-the-checkride / entry (v7.20.0)

Recorded: 2026-11-09 ~5:25 PM ET (America/New_York)

## Brand Designer final — `after.entry.*` (ux-copy-v3.md §10.0)

| Key | Value |
|---|---|
| `after.entry.prompt` | How did it go? |
| `after.entry.passed` | Passed |
| `after.entry.inc` | Not finished |
| `after.entry.dis` | Not passed |
| `after.entry.helper` | Pick what your examiner handed you: a temporary certificate (Passed), a letter of discontinuance (Not finished) or a notice of disapproval (Not passed). If the test stopped after an unsatisfactory task, choose Not passed. Prototype only; nothing is filed or sent. |
| `after.entry.aria` | Checkride result for this booking |
| `after.entry.group_label` | Checkride result |

- Removed on-screen suffix ` · PLACEHOLDER keys pending Brand Designer`.
- No PLACEHOLDER / TODO copy strings remain in runtime (`app.js` / `sw.js`).

## `after.verify.examiner_plan` (unchanged since settle)

- §10.3.0 exact: `Your examiner decides the plan for the remaining test; bring your NOD/LOD and ask them what will be covered.`
- VERIFY chip kept; §10.3c FSIMS sourcing not on screen.

## Outcome → route (literal)

| Choice | Route |
|---|---|
| Passed | `#/after/pass` |
| Not finished (LOD) | `#/after/inc` |
| Not passed (NOD) | `#/after/dis` |

## SW

`cc-proto-v7.20.0` (app.js shell copy changed after v7.19.0 → cache bump required).
