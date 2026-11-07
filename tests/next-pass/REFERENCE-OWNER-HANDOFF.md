# Current status — RESOLVED after read-only verification, Nov 7, 2026, 2:54 PM ET

Canonical v2.4 now excludes bool before both hour/flight unit branches. P52–P65 are present; independently executed canonical self-tests **142/142 PASS**. Corrected owned boolean-parity.py compares status, reason, CFI flag and can-book against actual canonical results: **32/32**, including 24 hour / 8 flight cases, **zero gaps**. An independent fresh seeded canonical-versus-JS status/reason run also passes **3000/3000** (new seed and cases, not a reused Data Collector claim).

Evidence: `/tmp/t5/dev-20261107-parity-followup/logs/{canonical,parity,random-parity}.log`; fresh random cases and generator retained beside logs. Canonical file was read-only. **No reference-owner action remains for this handoff.** This resolution concerns verified canonical/dev parity, not independent QA closure or a runtime release.

Owned next-pass reference copy also refreshed to canonical v2.4 corpus and independently passes **142/142**; corrected parity rerun remains **32/32, zero gaps**. Previous local reference is preserved in fresh follow-up scratch.

## Historical proposal and observations retained below — superseded, not sent

# Canonical reference owner handoff — NOT SENT

Inspected `/workspace/checkride-pm/tools/eligibility_clock_reference.py` directly Nov 7, 2026. Actual self-test result: **128/128 PASS**, not merely the reported 120. `_sum.hours_ok` already has `if isinstance(h, bool): return False`, 0.1 minimum and exact Decimal summation. Hourly boolean cases P44–P51 are present and pass. No hourly boolean fix remains to request from the canonical owner.

One remaining selector gap was observed: `_sum` bypasses hours_ok for `unit == "flights"`, so boolean-valued hours still count as training-flight entries. The request for booleans to be malformed/noncounting entries is applied consistently to both units in development and its local reference. The PM-owned file was NOT edited.

Exact proposed owner change in `_sum` (currently around L206):

    sel = [e for e in entries
           if not isinstance(e[1], bool) and e[2] and start <= e[0] <= end
           and (unit == "flights" or hours_ok(e[1]))]

Retain the existing hours_ok boolean guard as well. No change to Decimal arithmetic, numeric-string support, empty-list handling, real flight counting, regulatory windows, or warn-never-block / optional CFI rules.

Add explicit dated-entry cases (2026-03-01, qualifies=True, test 2026-03-31):
- private-glider `[True, True, True]` => warn/fails, zero qualifying flights (canonical currently ok/ok, 3 flights).
- private-glider `[False, False, False]` => warn/fails, zero flights (currently ok/ok).
- private-glider `[True, 0.3, 0.3]` => warn/fails, two flights (currently ok/ok, 3).
- private-hot-air-balloon `[True, True]` and `[False, False]` => warn/fails, zero flights (currently ok/ok, 2).
- private-hot-air-balloon `[True, 0.3]` => warn/fails, one flight (currently ok/ok, 2).
- Mixed valid control: glider `[False, 0.3, 0.3, 0.3]` and balloon `[False, 0.3, 0.3]` remain ok from valid flights alone.

The first six differences are retained explicitly in fresh parity.log. Local next-pass reference / JS parity: 32/32. Canonical hourly parity: 24/24; canonical flight-unit differences: 6, not silently marked passing/aligned. Existing canonical 128 cases still pass as written, but do not cover this flight-unit gap.

Original development rc6 reference True caused decimal.InvalidOperation, False did not crash (it was excluded by its zero numeric value). Original JS did not crash: True wrongly counted as 1 h; `[True,True,True]` wrongly passed. Saved UI rendered True as an empty native number field but counted it invisibly; False already had an error. These distinct observations are in baseline-reference.log, engine-before.log and ui-before.log.

No message sent to any owner/agent; this file is the precise change proposal for the parent to hand off if authorized. Frozen rc6 and all PM-owned files remain untouched.


Nov7,2026 recovery follow-up: owner handoff remains RESOLVED. Canonical v2.5 P66–P98/current SHA256 c148833dcc67f64faab8ca9f7aa4302d4ce1a75ab9ae52289b51fe1d6ecfbbf3 directly verified175/175; current owned rc7 reference identical except provenance header,175/175. Actual45-case+3-nonfinite parity and3000 fresh randomized comparisons pass. Earlier142/interim169 corpus observations retained as history; no canonical source writes or speculation about file recreation. No owner action remaining. See ../rc7/README.md/evidence.
