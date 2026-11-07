# rc7 acceptance handoff — ready for local snapshot / independent QA

Nov 7, 2026, America/New_York (ET). Runtime **cc-proto-v7.9.0**, not published. Earlier 3:08 PM blocked handoff is preserved at evidence/README-initial-1508.md; this supersedes its missing-tools/canonical-corpus blockers. READY.txt in the eventual snapshot is authoritative for exact freeze time.

## Scope / semantics
D44 is Marlo's decision, logged append-only at /workspace/checkride-pm/product-decisions.md:109. D43 parking record remains present at line104. No PM eligibility-reference/rules edits, frozen/demo/live edits, remote/repository/cloud/upload, external messages or publishing.

Prep hour text trims ASCII space/tab/LF/CR, then matches ASCII `^(?:[0-9]+(?:\.[0-9]{1,2})?|\.[0-9]{1,2})$`, then must be 0.1–24 inclusive. Trailing zeros count: 1.00 valid,1.000 invalid. Numeric strings and .50 supported; signs, exponents, trailing dot, empty/nonfinite text invalid. Numbers judged by shortest round-trip form: already-rounded numeric 3 cannot reveal the original 2.9999999999999999. Native UI passes raw .value, not valueAsNumber; actual typed/pasted long text remains invalid even if valueAsNumber is3. Mixed 1.00+1.9999999999999999 counts only1. Integer hundredths sum supported values, no unlimited exact-string comparison feature.

Invalid-only nonempty evidence => fails/warn, not missing; truly clear => missing/needs-check. Optional CFI tick and warn-never-block booking retained. Booleans invalid before either hour or flight unit; [true,2.90] fails,[true,3.00] ok ignoring bool; all boolean fails. Nonboolean flight-count behavior unchanged. Editing, badInput, correction, clear, ARIA association, raw persistence and optional checked/unchecked actual mock Send verified in both browsers.

## Status / copy
- QA-099/D44, QA-100 and relevant QA-091/096/097/098 focused acceptance PASS in Chromium and Firefox. Not an independent QA closure or release GO.
- QA-095 accepted with intentional exceptions per Marlo, not user approval/independent QA closure: proto.payments = "Prototype: no real payments." in static top notice and landing footer only. Four mandatory en-dash notices EXACT unchanged (app strip, Request modal, examiner settings, index fallback). D41 otherwise unchanged. No new D44 copy changes.
- Existing clock.more.hours_invalid remains "Enter hours from 0.1 to 24. This entry isn’t counted." Existing clock.prep.ignored unchanged. Known clarity limitation: these do not explicitly explain two-place/syntax restrictions; reused as PM directed.
- QA-089 remains open/parked stress-only; no stress-only eligibility/SW hunt. Normal SW lifecycle timing was investigated only because acceptance observed it. All fictional/EXAMPLE DATA, legal/no-real-payments, FAA nonaffiliation, VERIFY, no percentages, landing parking, FEES_ENABLED=false, static/local-only runtime and font bytes retained.

## Recovered test tools
box-doctor first:11/11. Standard npm install in /workspace/checkride-test-tools restored Playwright1.65.0 and axe4.14.0; standard Playwright installer restored Chromium158.0.8127.18 and Firefox159.0. Existing Chrome156.0.8078.47 used for native Chromium tests, recovered Chromium158 for PWA/settled pages. No private/signed-in browser, credentials, uploads or network/review bypass. Missing local tools are no longer a blocker. Historical temporary harness/evidence was not invented as restored; narrow owned harnesses reuse existing local source/fixtures with corrected output paths.

## Canonical provenance — RESOLVED
Direct read-only source SHA256 **c148833dcc67f64faab8ca9f7aa4302d4ce1a75ab9ae52289b51fe1d6ecfbbf3**. Canonical v2.5 P66–P92 and P93–P98 present; actual fresh run **175/175**, zero failures. Owner's precision-reference-test-results.txt independently read and agrees175. Owned tests/rc7/reference.py is canonical bytes except provenance header and runs175/175. Earlier142 and interim169 evidence preserved as historical observations; no speculation about source recreation actor/cause. No remaining canonical-owner action.

## Final actual counts (no duplicate-corpus inflation)
- Native typed/pasted precision/badInput/blank/mixed/correction/persistence/optional checked+unchecked **excess-precision** mock Send and settled form axe:129/129 (Chromium63,Firefox66).
- Saved true/false/mixed/corrected/cleared/reloaded evidence, optional checked+unchecked Send, notice scope/fallback and settled form axe:94/94 (47 each).
- Awaited normal SW rc6v7.7->rc7v7.9 upgrade, exact prep retention, one final cache, offline mutation/routes, root/subpath and real Find->legacy search:72/72 (36 each).
- Settled full-page light landing and fictional NC Find axe/overflow:8/8.
- **Final browser assertions303/303**, zero final failures. Twelve settled axe checks included; focused ARIA is not represented as an exhaustive a11y certification.
- PM gate reused read-only via owned fresh-output copy:3/3; all50 precache URLs200, syntax and airport-zone assertions pass.
- Static notices/D41/fonts/scope:16/16. Retained reference/JS boundaries19/19. Boolean local/canonical/JS32/32, zero gaps.
- Current canonical175/175; owned same175/175, not350 distinct cases. Precision parity45/45 plus3 nonfinite assertions (includes canonical P93–P98); seeded random canonical/JS3000/3000. Repeated earlier runs not added to totals.
- No normal page crashes/external runtime requests; normal Firefox upgrade/offline checks report no intercepted-SW unexpected-error regression. This does not close the historical stress-only QA-089.

## Explicit fixture failures / limits
- Original CDP23-pass route-reset timeout retained; fixed return-to-readiness/load-event reset then27/27 (historical first pass, not added to303).
- Recovery first PWA run:1 assertion passed then missing persisted-state JSON parse; initialized through real native edit. Next fixture selected unsupported real KRDU; corrected to actual fictional NC picker option. These were harness failures, not app rejection.
- Multiple retained PWA70/72 runs asserted single cache prematurely. Root cause verified in installed Playwright coreBundle.js:26050: `const success = predicate()` does not await async predicate truthiness, so async waitForFunction did not poll its boolean. Replaced with Node-side polling that actually awaits page.evaluate; waits old worker redundant, cache stable and post-reload cleanup. Final72/72. Worker tracing/1600ms diagnostics were separate, not acceptance or product modifications. No SW runtime patch/version bump needed during recovery.
- Native Chromium comma filtering to15 is explicitly a native observation, NOT app rejection; Firefox badInput behavior separately asserted. Clipboard tests use actual Control+V/inputType insertFromPaste, no synthetic fallback.
- Axe runs after fonts/settled state (1.5–1.8s), no claim that transient animation measurements are settled accessibility results.
- First recovery pure parity helper refreshed inherited temporary case JSON; original case evidence already persisted in initial dev evidence. Helper now takes fresh explicit OUT. All historical screenshots preserved, and all executed recovery screenshot destinations were new/audited. No claim of full historical /tmp preservation.
- No full historical broad suite totals claimed: narrow reconstructed relevant root/subpath/legacy/SW checks are explicitly72, not the disappeared old e2e harness.

## Evidence / QA scope
Durable `tests/rc7/evidence/recovery-1510/`; persistent install /workspace/checkride-test-tools. All earlier failed logs/diagnostics retained alongside final results. Screenshots /workspace/checkride-connect-shots/v4-rc7/recovery-1510/; key final folders native-final/ (both precision-pasted-invalid PNGs), booleans/, pwa-awaited/ (root/subpath offline both browsers), settled/ (landing/NC light). Full51-image SHA256 inventory at evidence/recovery-1510/screenshots-final.json, including initial images preserved from prior pass. No old SH/OUT script run in place.

rc6 independent GO at /workspace/checkride-pm/qa/qa-report-20261107-1457.md scoped only to exact rc6. Before snapshot, rc3–rc6 manifests verify and12 prior rc trees/477 file hash+size+mtime records match the newly captured baseline; rc6 has59 manifest entries/60 files. Earlier missing temporary inventories are not newly attested. Snapshot copy/checksums/READY will record final integrity. Independent QA must target exact rc7 snapshot (new harnesses contain local server constants; do not accidentally point them at dev), confirm precision/boolean/CFI/persistence, protected notice scope and normal SW/root/subpath/offline behavior. Release still requires exact rc7 independent QA GO via Marlo; no demo update or publishing authorized. After successful freeze STOP eligibility edge-case hardening.

## Proposed next user-facing passes — NOT implemented
1. Onboarding goal continuity: signup collects signup-goal but stores only name/role/airport; carry the goal to Find/readiness defaults and a small first-run review.
2. Waitlist clarity: current wlOf starts mock pos4/passes0; clarify fictional per-examiner/checkride joined state and mock place meaning, without real queue behavior.
3. Local grouped digest preview: Alerts currently shows individual mock notifications (first25), not a digest. Group unread changes locally; no scheduler, delivery or external messages. Availability "Weekly check" is not a digest.
