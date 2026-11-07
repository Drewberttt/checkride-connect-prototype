> CURRENT STATUS CORRECTION (Nov 7, 2026, ET): Independent rc7 verdict at qa-report-20261107-1540.md and parent continuation are now supplied. The gate was parent continuation after verdict, NOT a new Drewbert approval requirement. Prior closed-gate wording below is historical and superseded. Current scope/results and freeze authority: QA-HANDOFF-RC8.md.

# Next local dev handoff — READY IN DEV, NOT FROZEN

Nov 7, 2026, 3:35 PM ET (America/New_York). SW **cc-proto-v7.10.0**, unreleased. Marlo selected these two small passes: signup goal continuity, then fictional per-examiner waitlist clarity. Digest preview NOT implemented. No external messages/notifications, real data, repository/cloud/upload, publishing, live/demo writes, or frozen-tree writes.

## Mandatory gate
**DO NOT FREEZE rc8.** The independent rc7 verdict has not been supplied in this workstream. Freeze requires the user's explicit continuation AFTER that verdict, not merely discovering a report file or treating these tests as QA GO. `/workspace/checkride-v4-rc8` does not exist. No READY/rc8 manifest created. Stop after this ready-in-dev handoff. Existing QA-HANDOFF-RC7.md describes the historical frozen rc7, not this dev candidate.

## Changes / decisions
Runtime edits only app.js + SW version/comment. Eligibility engine/reference, styles, index, data/cost model, fonts and D41 landing template byte-identical to frozen rc7. D43 parking and all mandatory prototype/example/FAA/legal/VERIFY notices, FEES_ENABLED=false, no percentages, airport timezone labels, static/subpath/offline/no external runtime requests retained.

### Signup → planning defaults
- Store optional pilot demoUser.goal on actual demo signup; no email/phone/password storage. Add blank "No default checkride"; retain supported goals and info-only ATP, but ATP/unsupported goals never become bookable/default certificates. Blank/unsupported falls back to existing PPL example.
- Draft goal survives role-toggle rerenders, not persisted until submit. Goal persistence is local only; not a real account.
- Find precedence: explicit URL cert (including cleared/invalid parameter's existing PPL fallback/adjustment behavior) > supported saved explicit Find certificate > supported signup goal > PPL. Only a certificate selection saves findCert; changing airport/radius does not pin an untouched goal-derived certificate. Existing explicit URLs/history retain current edits.
- Readiness precedence: active request cert > saved explicit/readiness-edit pin > legacy prior evidence's PPL interpretation > supported signup goal > PPL. Existing sample KT date flagged ktSample alone is not user evidence. Unflagged legacy dates/checks/medical/clock state are conservatively retained under their prior PPL interpretation. No automatic evidence migration/relabeling.
- New labelled Planning checkride select allows deliberate supported changes when there is no active request. Before the first actual readiness edit, pin its current planning cert, so changing/clearing signup goal cannot silently reinterpret already edited evidence. Explicit certificate changes retain existing global evidence with a note to check applicability; the existing model is not per-certificate evidence storage.
- Clearing evidence persists without resetting an explicit/pinned certificate. Clearing signup goal returns to PPL only where no user choice/evidence wins. No hidden automatic tick/eligibility/CFI approval. Existing warn-never-block and optional CFI semantics unchanged; no eligibility edge hardening or new engine cases.

### Fictional local waitlist clarity
- Stay within existing examiner-specific saved alerts + S.wl model, not a backend/new demand model. Membership is examiner+checkride; existing illustrative position/pass state is examiner-scoped/shared across checkrides, not an inferred live count.
- Profile, Alerts and existing simulated offer show consistent joined/not-joined status and explicitly illustrative position/disclosure. Initial example position4 remains the old deterministic sample; existing position12/pass effects stay intact. Rerender/reload does not create demand or randomize positions.
- Joining same examiner/checkride is idempotent even through the actual Alerts form and before the alert-limit check; duplicate join keeps existing alert criteria, does not update filters or create another queue entry. General any-examiner saved alerts remain separate and do not imply membership in every examiner's list.
- Profile Leave and Alerts Leave remove this examiner/checkride's local alerts, including legacy duplicates only after that explicit action. Other certificates/examiners remain. Rejoin retains existing illustrative position/pass state; no real priority guarantee. Existing offer/hold/pass mechanics not redesigned; new disclosure explicitly says no slot reserved/no live demand/no notifications sent.
- Join/leave controls use native buttons, associated disclosure, live status and keyboard focus return. All strings are concise prototype copy, not ownership/availability claims.

## Exact copy
Twelve new keys and exact final text: tests/rc8/COPY-CHANGES.json. No preexisting copy normalized. Key texts:
- goal.blank: No default checkride
- goal.label: Planning checkride
- goal.note: A planning default only, not eligibility or CFI approval. Saved evidence is kept; check that it applies to this checkride.
- wl.status.joined: Joined locally · illustrative position #{position}.
- wl.status.not_joined: Not joined for this checkride.
- wl.sample: Fictional sample only. Positions are illustrative, not live demand or priority. No notifications are sent; no slot is reserved.
- wl.join: Join sample waitlist
- wl.leave: Leave sample waitlist
- wl.already: Already joined locally for this examiner and checkride. Nothing was sent.
- wl.joined: Sample waitlist joined in this browser. Nothing was sent.
- wl.left: Sample waitlist left for this checkride. Nothing was sent.
- wl.leave_note: Leaving removes this examiner/checkride’s local alerts.

## Actual validation
Persistent recovered Playwright1.65.0/axe4.14.0; final new-flow tests Chromium158.0.8127.18 + Firefox159.0. Unchanged existing native compatibility regression uses installed Chrome156 and Firefox159. No new downloads needed this pass.

Final browser assertions **339/339**, no final failures:
- Main signup/default overrides/draft role toggling/active request priority/waitlist actual join+duplicate+leave+rejoin/per-cert+examiner isolation/legacy duplicates/offer+Alerts consistency/settled light+dark axe/narrow overflow:96/96 (48 each).
- Actual KT/checklist/medical preservation and clearing across goal changes:8/8 (4 each).
- Signup native keyboard/Tab + narrow light/dark settled full-page axe/overflow:10/10 (5 each).
- Real rc7v7.9→devv7.10 worker upgrade, exact prior prep persistence, legacy default protection, offline actual signup→Find, pinned readiness evidence, old membership/leave/rejoin, root/subpath legacy search/routes/mock Send/reconnect:96/96 (48 each). Final single cache verified by actual awaited Node-side predicates, not async waitForFunction truthiness.
- Unchanged existing native precision/badInput/clearing/ARIA/persistence/optional checked+unchecked CFI mock Send regression:129/129 (63 Chrome,66 Firefox). Regression only; no new eligibility cases or engine/reference changes.
- Static scope21/21; existing gate3/3 including all50 precache URLs200, syntax and airport timezone data. Engine and owned reference byte-identical to frozen rc7; no new canonical/reference owner action.
- No normal crashes/console errors/external runtime requests. No stress-only QA-089 work or broad historical-suite total claimed. Axe measured after fonts/settled state (1.6s); not a claim about animation-time measurements or exhaustive accessibility certification.

## Preserved failure / correction
Initial reduced suite86/86 retained, not added to final339. Extended first run95/96: Chromium checked simulated-offer count before hash render completed; Firefox passed. Kept the failed JSON/log/screenshots; corrected only the test to wait for visible #wl-offer, then full96/96. No app change to conceal this failure. Actual assertions, not exit statuses, inspected. No other failing final assertions.

## Evidence / integrity / QA handoff
Fresh source tests tests/rc8/; durable evidence tests/rc8/evidence/ (also /workspace/checkride-test-tools/evidence/rc8-dev-20261107-1524/). Exact copy JSON adjacent. Screenshot output variables audited before execution, including inherited native regression's env overrides. All new screenshots under /workspace/checkride-connect-shots/rc8-dev-20261107-1524/; final folders main-settled/, evidence-defaults/ has no shots, signup-accessibility/, pwa/, native-regression/.53 new images including preserved preliminary/failure evidence; hashes in evidence/screenshots.json. Prior51 rc7 screenshot hashes unchanged; no history overwritten.

Prior **13 frozen trees/630 files** match start-of-pass SHA256+size+mtime inventories. Existing rc3–rc7 MD5 manifests pass (rc7 152 entries/153 files). Protected all prior snapshots; no rc8 snapshot. Dedicated8038 upgrade test server stopped; original local8020 dev server unchanged. Final runtime hash record can be used to identify this exact ready-in-dev candidate.

Independent QA scope once rc7 verdict/user continuation gate is satisfied: planning precedence/blank/unsupported/legacy evidence/active request and explicit changes; joined/position clarity across profile/Alerts/offer, duplicate and leave/rejoin isolation; light/dark/narrow native focus/ARIA; root/subpath normal worker upgrade/offline. No digest, live queue, delivery, new eligibility policy or release authority. STOP here pending explicit gate continuation.
