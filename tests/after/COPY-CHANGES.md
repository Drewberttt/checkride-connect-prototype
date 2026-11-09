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
