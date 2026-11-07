# rc7 development handoff — NOT frozen / NOT release-ready

Recorded Nov 7, 2026, 3:08 PM ET (America/New_York). Development SW: **cc-proto-v7.9.0**, unreleased. No rc7 snapshot, READY or freeze timestamp exists. No live/demo, frozen-tree, repository/cloud, remote or publishing operations. PM reference/rules were read-only; the explicitly authorized append-only D44 record is the sole PM edit.

## Implementation / ownership
- **D44 / QA-099:** shared engine validates raw hours before coercion; UI passes native `.value`, not `valueAsNumber`; invalid evidence is retained, excluded and classifies fails, not missing. A truly cleared list is missing. Existing optional CFI tick and warn-never-block remain. Native input remains editable; step is 0.01. Sums use integer hundredths, not an unlimited exact-decimal feature.
- Contract: trim ASCII space/tab/LF/CR, then ASCII `^(?:[0-9]+(?:\.[0-9]{1,2})?|\.[0-9]{1,2})$`, then 0.1–24 inclusive. `1.00`, `.50` and numeric strings are supported; `1.000`, exponents, signs, trailing dot, empty/nonfinite text are invalid. Trailing zeros count. Numeric values are judged by shortest round-trip representation: a literal already coerced to number 3 from 2.9999999999999999 cannot be recovered. Actual Chromium native text retained that long value while valueAsNumber was 3, and was rejected/excluded correctly. Browser filtering is not app rejection.
- **QA-100:** boolean saved hours excluded before either hour or flight unit. All-boolean lists fail, not missing; [true,2.90] fails, [true,3.00] ok with boolean ignored. Native saved boolean field remains associated with inline error even though number input displays blank; correction/explicit clear persist.
- Canonical inspected directly: v2.5 implementation, SHA256 `f5842b3d0dcf9e5426bed402b1858be7859155ebc8b17a5917cb3e8264c0d759`. Owned tests/rc7/reference.py is identical except its provenance header. **Actual self-tests 142/142, through P65, not the relayed 169/P66–P92.** The latter corpus is absent in this inspected file; do not claim it ran. Canonical/JS precision and randomized parity below are actual current results, independent of that reported count. No semantic reference-owner patch is needed; owner should reconcile missing published cap-test corpus/count before full handoff acceptance.
- D44 attributed to **Marlo**, append-only at `/workspace/checkride-pm/product-decisions.md:109`; no duplicate record.
- **QA-095 accepted with intentional exceptions per Marlo**, not user approval or independent QA closure. `proto.payments = "Prototype: no real payments."` applies only to static top notice and landing footer. Four mandatory en-dash notices in app strip, Request modal, examiner settings and index fallback remain exactly unchanged. D41 landing otherwise identical. No new D44 copy changes. Existing `clock.more.hours_invalid = "Enter hours from 0.1 to 24. This entry isn’t counted."` reused as directed; it does NOT explain the two-place/syntax restriction (known clarity limitation). `clock.prep.ignored` unchanged.
- QA-089 remains open/parked stress-only; no stress investigation. QA-096/097/098 and QA-091 relevant Chromium correction/blank/badInput/keyboard/persistence checks green, but new exact dev candidate is not fully cross-browser accepted. rc6 independent GO exists at `/workspace/checkride-pm/qa/qa-report-20261107-1457.md`, scoped to frozen rc6, not this dev candidate.

## Actual completed tests (do not sum duplicate reference corpora)
| Suite | Actual outcome |
|---|---|
| Canonical v2.5 current file | 142/142, zero failures |
| Owned current reference | same 142/142, zero failures |
| D44 Python/JS parity | 39/39 cases + 3 nonfinite validator assertions |
| Fresh seeded canonical/JS comparisons | 3000/3000 |
| Native Chromium typed/paste precision | 27/27 assertions |
| Native Chromium saved booleans/mixed/corrected/cleared | 26/26 assertions |
| Retained numeric-boundary reference/JS | 19/19 |
| Boolean local/canonical/JS | 32/32 cases; 24 hourly + 8 flight; zero canonical gaps |
| Mandatory notices/D41/font/static scope | 16/16 |
| App/engine/SW and new portable runner syntax | PASS |

Chromium checks include actual keyboard typing and clipboard Ctrl+V (`beforeinput.inputType=insertFromPaste`), native badInput, raw persisted precision, inline ARIA association, no replaced field/Tab, exact supported sums, long-precision mixed evidence, correction/clear, optional CFI present and actual mock Send unchecked/checked with persistence. Saved-boolean suite checks actual UI reload/no crash, correction/clear and optional/nonblocking request UI. No page exceptions or external runtime requests in these focused runs.

## Honest failures / limitations / freeze blockers
- Initial CDP run passed 23 assertions then **fixture timed out** finding clock-more after a mock Send route. Cause: reset reloaded a request route whose booking had just been removed from fixture storage. Corrected reset explicitly returns to readiness and awaits Page load; rerun 27/27. Initial failure log and screenshots preserved separately, not silently relabeled as app failure/pass.
- Old rc6 typed fixture expectations allowing 2.996 are superseded by D44. New portable definition explicitly expects invalid/un-counted; historical script untouched.
- Environment changed during this pass: previous /tmp/t4, /tmp/t5 and /tmp/pw dependencies, PM harness node_modules, Firefox binary and Playwright browser cache were unavailable. Cause not established; no deletion performed by this task. Previously reported temporary logs cannot be newly attested as present. New evidence copied into owned dev tests/rc7/evidence to survive temporary-path loss.
- **Firefox native acceptance is NOT RUN / BLOCKED**: no installed Firefox/Playwright. No network install or download performed under local-only scope. `native-browsers.js` defines the fresh portable Chromium/Firefox typed, actual clipboard, ARIA, persistence, mixed, clearing and optional Send cases, but is unexecuted, not claimed validated. Its clipboard support may need an explicit browser fixture correction; no synthetic paste fallback is allowed.
- Full legacy e2e/subpath/taborder/axe/SW-upgrade suites NOT rerun; dependencies/harness locations previously under /tmp missing. Focused ARIA checks are not an axe audit. Settled-state axe timing caveats from earlier QA still apply; no current axe pass asserted.
- Reported canonical 169-test cap corpus absent on direct read, as noted above. These validation gaps mean **do not freeze rc7 or claim READY**. Restore existing sanctioned local browser/dependencies and reconcile canonical corpus, then rerun exact candidate acceptance before any freeze. No release without exact-snapshot QA GO.

## Evidence / inventory
- Durable logs/results: `tests/rc7/evidence/`; source tests in `tests/rc7/`. Fresh scratch `/tmp/t5/rc7-20261107/`.
- Screenshot-output variables audited before each executed browser runner. Old rc6 and next-pass scripts with historical SH/OUT defaults were not executed. Root rc7 images preserve the initial run; corrected evidence only in `/workspace/checkride-connect-shots/v4-rc7/chromium-corrected/`:
  - chromium-precision-invalid.png
  - chromium-mixed-precision.png
  - chromium-optional-tick-false.png
  - chromium-optional-tick-true.png
- Frozen rc3/4/5/6 existing MD5 manifests verified PASS read-only. rc6 has 59 manifest entries / 60 total files. New read-only inventory captures 12 prior rc trees / 477 files. It is a NEW baseline, not a substitute for unavailable start-of-pass temporary inventories. Frozen rc6 had also passed its manifest at initial inspection. No frozen writes. A final comparison to this new baseline is recorded separately.

## Small next user-facing passes — proposals only, priority order
1. Onboarding continuity: signup collects `signup-goal` but stores only name/role/airport; persist selected goal and carry it into Find/readiness defaults, with a small local first-run review. No account/network scope.
2. Waitlist clarity: `wlOf` initializes each examiner to mock pos 4 / passes 0; clarify per-examiner/checkride joined state and the fictional place-in-line meaning without adding real queue behavior.
3. Local digest preview: Alerts currently lists individual mock notifications (first 25), not a digest. Group unread changes into a local digest preview; no scheduler, delivery or external messages. The separate availability "Weekly check" is not a digest.

Backlog work not started. After a future successful rc7 freeze, stop eligibility edge-case hardening as instructed.
