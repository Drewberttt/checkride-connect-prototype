# rc6 machine-local regression tests

No runtime dependency or network service is added to the prototype.

- `typed-prep.js`: Playwright from `/tmp/pw/node_modules`, Chrome + Firefox; real keyboard entry for hours, native badInput observations, boundaries, mixed/blank/corrected states, route/reload persistence, optional CFI checkbox and actual mock Send checked/unchecked, settled invalid-form axe in light/dark.
- `reference.py`: local rc6 copy of PM's eligibility_clock_reference.py with the 0.1 lower bound and exact decimal sum (no threshold rounding), so code/reference changes stay inside the authorized development folder. The PM canonical file is intentionally unchanged/read-only; QA should use this version for rc6 lower-bound parity (canonical PM still has the rc5 lower bound until its owner aligns it).
- `boundaries.py`: 19 explicit Python-reference/JS-engine comparisons, including empty versus invalid-only, 2.996 and 2.9999999, invalid lower/upper bounds and mixed valid evidence. Both reference and JS flags must agree.

Full evidence and regenerated 4,000 prep/3,000 retest differential cases: `/tmp/t5/rc6-20261107/`. Additional local keyboard/root/subpath/legacy checks and SW-upgrade fixture are kept there. New screenshots only: `/workspace/checkride-connect-shots/v4-rc6/`.

Native Chromium filters the comma in typed `1,5`, yielding `15`; this is NOT app rejection. Firefox exposes that token as badInput. Native editing is preserved (no rerender of the input on input/change); feedback and advisory output update while typing. `step=0.1` is a browser editing hint, not an instruction to round fractional evidence to a passing 3.

Do not use these tests to modify or publish frozen, demo or live folders. Exact frozen rc6 still requires independent QA GO before release.

Unreleased development follow-up, Nov 7: the canonical PM reference was later verified directly at v2.3 with 128 passing cases, 0.1 lower bound, Decimal arithmetic and hourly boolean guard. The historical frozen rc6 provenance above still describes that snapshot, not current canonical state. This development-only legacy reference copy now rejects boolean hours too; frozen rc6 was not changed. See ../next-pass/REFERENCE-OWNER-HANDOFF.md for the remaining canonical flight-unit selector gap.
