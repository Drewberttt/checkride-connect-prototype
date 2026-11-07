# Checkride Connect: prototype plan

Base: the "Checkride Connect" Claude design (copied from /workspace/claude-design, which is untouched).
The older /workspace/checkride-mvp is untouched and now superseded.

## Run
    cd /workspace/checkride-connect && python3 -m http.server 8002   # then open http://localhost:8002
Static site, no dependencies, no build. State lives in localStorage key `cc-connect-proto-v3` (plus `:demo-YYYY-MM-DD` variants); "Reset demo data" (footer, More > Demo data, error screen) clears them. See "v3 + D38 wrap-up" below.

## Owner decisions this prototype follows
1. Data: fictional FAA-style listings only. Red "EXAMPLE DATA – not real examiners" banner on every page.
2. Money: **now free during the prototype (owner decision, Oct 29, 2026)**; see "Free mode" below. Originally: free for DPEs, $15 student booking fee, subscription for flight schools; that behavior returns only with `CC_CONFIG.FEES_ENABLED = true`. **Proposed pricing** (from /workspace/checkride-pricing-and-counsel.md): Free $0, Pro $79/mo per location, Academy $299/mo. Shown on the school page and pricing page labeled "Proposed pricing"; selection is mock only.
3. Discovery, alerts, in-app booking with deposit ("Deposit paid to your examiner" (mock), under the examiner's terms; Checkride Connect never holds it).
4. After a DPE approves a checkride, the DPE builds a curated checklist for that student.
5. Prototype choices: hash-routed static SPA, localStorage only.

## From the design (kept)
Home, search with filters, DPE profile, compare fees, alerts, readiness checklists, bookings, DPE dashboard, flight-school page, admin sketch, pricing, role switch, request modal, toasts.

## Carried over / added
- Booking fee breakdown: examiner deposit (ASSUMPTION, see below), paid to the examiner (mock), + $15 Checkride Connect booking fee = total due if approved. "Actually charged $0."
- Status Requested -> Approved/Declined (DPE), student can cancel; My bookings.
- DPE "Approved checkrides & curated checklists" and checklist builder (`#/dpe-checklist/:id`): start from standard list or blank, edit text and notes, add, remove, reorder, note to student, Send to student.
- Student "My checklists" (`#/my-checklists`) with ticks persisted per booking.
- Flight school tiers (mock selection) and mock roster.
- Roles relabeled Student / DPE / Flight school (+ mock Admin).

## Copy fixes
Counts computed from data ("N of 13 sample examiners match"); pluralization helper ("1 day"); no "Verified"/"FAA-verified"/"Live" wording (badge says "Sample examiner", no shield icon; a SAMPLE tag sits next to every star rating); timestamps in the viewer's local zone; fake share link and clipboard write removed; Google Fonts links removed (system fonts, no third-party requests).

## Mock-only guarantees
No fetch/XHR/WebSocket, no external assets, every form is `data-form` with preventDefault (plus a capture-phase safety net), alerts write to localStorage only and say "nothing was sent". Every route shows the "Prototype – no real payments" and "Prototype, not legal or FAA advice" strip.

## Phase 1 (this round): done
- **Alert Pass removed entirely** (alerts page, pricing page, admin stats). Alerts are email-only, free for students, mock only; prototype cap of 5 saved alerts ("Alert limit reached").
- **Per-examiner all-in cost** (profile card `#all-in`, and compare table sorted by all-in total). Lines: examiner fee + $15 student fee + aircraft rental/fuel estimate + travel/lodging estimate = **example all-in total**. Retest/discontinuance fee and no-show/late-cancel fee are shown but NOT added to the total. Labeled "Example numbers, not a quote". Profile and compare use the same `allIn()` function so totals match.
  - Aircraft: hours by certificate (PPL 2.5, IR 2.5, CPL 2.5, ME 3, CFI 2.5, CFII 2.5, MEI 3, Sport 2) x per-examiner sample hourly rate; multi-engine certs use a 1.9x rate. (`allInModel` and `dp.sample` in data.js.)
  - Travel: $0 if the examiner is at your airport; the examiner's sample travel fee if within the examiner's range; otherwise a fly-there estimate (round trip at 105 kt x rate) plus one hotel night if more than 100 nm.
- **Example reviews and wait time** per examiner (profile card `#reviews`, wait shown in compare and search): rating, avg days to next checkride, typical booking lead time, 3 sample review snippets, all marked "sample review, not real". Data is in data.js (`sampleExtras`).
- **Deposit formula is an ASSUMPTION** (owner has not specified deposit rules): about a fifth of the examiner fee, rounded to $25, minimum $100. It is treated as part of the examiner fee (credited), not an extra. The deposit is paid to the examiner (mock) at approval, alongside the $15 booking fee; the rest is paid to the examiner at the test. Checkride Connect never holds deposit money. Labeled "ASSUMPTION" on the profile fees, all-in card, request modal, booking summary, bookings page and compare footnote. Real deposit rules would be set by each examiner.
- Mobile fixes: toasts no longer cover or block taps on modal buttons (pointer-events none, top of screen at <=640 px); compare table shows examiner, exam fee, all-in total, wait on a phone.
- Bug fixed: reload ignored saved state (loader checked `v === 2` while state is `v: 3`), so reloads reset the demo.

## Phase 2/3 (this run): done
- **(c) DPE "Update my openings"** (`#/dpe-openings`, mobile-first, per /workspace/dpe-availability-proposal.md): 21-day calendar, tap a day to open/close it with times, airport and a note; "Yes, nothing changed" confirm button; freshness levels (ok ≤7 days, amber 8–14, stale 15–90, re-verify >90). Stale examiners' openings are hidden from students ("availability not confirmed recently"); confirming restores them. Weekly reminder is a preview only (nothing emailed or texted). Demo "pretend last confirmed N days ago" selector.
- **(d) Flight-school cohort view** (`#/school/cohort`): pick students, cert and date window; greedy match onto open sample slots (whole cohort with one examiner if it fits, else split); per-student warnings (endorsement pending, readiness < 90%); fee summary $15 x n, "Actually charged $0"; creates mock requests that show on the DPE dashboard and in the school roster.
- **Dataset**: /workspace/sample-fl-examiners.js (50 fictional Florida examiners, real airport identifiers) loaded after data.js and appended to the 13 originals: 63 sample examiners, 29 airports. ATP/rotorcraft `otherAuthorizations` shown on profiles in a separate "Other authorizations (sample)" block, not in fees. Counts are computed from data. Saved state migrates (new examiners/slots merged, user data kept).
- **(e) "Soonest checkride near me"**: home and search lead with it. Default sort = soonest opening, ties broken by distance from you to the checkride airport, then fee; other sorts: lowest fee, closest checkride airport. Lead card shows the soonest match. Location accepts an identifier or city name (e.g. "Orlando" resolves to KORL); unknown places give a toast. "Use a sample location" is a mock that cycles through fixed sample airports; no geolocation API is called.
- **(f) Readiness gate** in the request modal: self-attested checks: logbook endorsements, draft Part 61 hour minimums per certificate, knowledge test passed with a date that has not expired (24 calendar months), IACRA application started. Labeled "Unverified draft, not legal or FAA advice". Missing/failed items block submit; borderline items (hours close to a minimum, knowledge test expiring soon after the slot, checklist under 100%) warn but allow. Result is stored on the booking (`selfCheck`) and shown to the DPE as "Self-attested".
- **(g) Accessibility pass**: `lang="en"`; contrast fixes (--faint, --good, dark --faint) to WCAG AA; all form fields labelled; visible focus outlines; modal is labelled (`aria-labelledby`), traps Tab/Shift+Tab, closes on Esc and returns focus; scrollable tables are focusable regions; bell label includes unread count; ≥44px tap targets at ≤640px. axe-core (installed in /tmp/t only, run offline) reports 0 violations on every route/role at 1280 and 390, plus the modal.
- **Fixes 1–4**: (1) shield removed from the sample badge; prominent SAMPLE tag beside every rating. (2) Pricing page link to PLAN.md removed (inline text). (3) Tiers Free/Pro/Academy as "Proposed pricing" (school page, pricing page, this file). (4) Copy sweep: admin "verify" wording changed to "List in directory (mock)" / "Fictional locator lookup" with a note that listing says nothing about FAA designation; footer on every route: "Not affiliated with or endorsed by the FAA."
- Bugs found and fixed while testing: readiness "blocked" state reset to "pending" after any later input; a profile revisited after its openings went stale showed no selected day after they were restored; a rating line could not wrap and overflowed by 18px at 390px.

## Brand pass (Runway logo): done
- Logo: Drewbert picked "Runway" (/workspace/checkride-brand/, see brand-guidelines.md). Icon set copied in: `favicon.ico` (16/32/48) at the root; `icons/` holds favicon.svg (simplified small-size mark), favicon-16/32/48.png, apple-touch-icon.png, icon-192/512.png, icon-maskable-512.png; `site.webmanifest` at the root (`start_url`/`scope` "./"). Every `<head>` href and manifest icon path is relative, so it works at a domain root or a subpath (e.g. GitHub Pages /checkride-connect/). theme-color #2b59ff. The old inline #1d4ed8 favicon is gone.
- Nav: the airplane glyph (close to the pending CHECKRIDEPRO airplane + checkmark mark) is removed; the brand link uses `brand/runway-icon.svg` at 32px (the brand minimum for the full mark; under 32px use the simplified favicon). The hover rotate is removed (the guide says don't rotate the mark). The plane path appears nowhere else in the project.
- Color: light-theme `--good` is now #086B48 (brand guide: #0B875A is too weak on good-soft #E1F4EA). No other #0B875A uses remain; the dark themes keep their own greens.
- Fonts: (superseded in Phase 4) now self-hosted from ./fonts/; see Phase 4.
- Dataset check: app.js appends the 50 sample-fl-examiners.js entries to the 13 in data.js (63 total, ids not overwritten); demo examiner d1 is still present.

## Cohort v2 + nav fix: done
- **Per-student readiness** (`#/school/cohort`, "Readiness check per student"): each selected student runs the same draft checks as a student request (endorsements, logbook hours vs draft minimums, knowledge test passed and within the 24-calendar-month draft rule at the matched date, plus IACRA started; also a warning below a 90% checklist). Blocked students are left out of matching with their reasons listed; warnings are listed for ready ones; "N of M eligible. Not included: ..." The school can "Fix/Edit answers" (modal with the same live gate, saved to localStorage only, labeled self-attested by the school) or proceed with the eligible subset. Starting answers are SAMPLE data; the roster's "endorsement pending" stays honest, so most students start blocked.
- **DPE sees answers**: every request (student or cohort) carries the answers; the DPE dashboard shows a "Readiness answers, self-attested by the school/the student (unverified)" disclosure (endorsements, hours, knowledge test date/expiry, IACRA, warnings shown at request time).
- **Ranked matching** (replaces first-fit). Rule shown in the UI: 1) soonest date that fits, 2) lowest total all-in for the group (fee + $15 + example aircraft/travel from KORL), 3) examiner name A-Z. "Keep the cohort together" (default on) prefers one-examiner, one-day options when any fits everyone; otherwise (or with it off) a split places students most-constrained first, each by the same rule, across examiners and days. "Alternatives considered" table: top whole-cohort options plus the split, rank, delta vs the chosen option, "Use this" to override (labeled "Your pick, not the top-ranked option"). Examiner filter defaults to "Any sample examiner (ranked)". Fee rows show per-student examiner and all-in.
- **Nav at 1280**: at >=1041px the nav links/gaps are tightened (padding .45/.55rem, .9rem); 1041-1199px tightens further and visually hides the "View as" label (the select keeps its aria-label). Verified no nav overflow for every role at 1041/1100/1200/1280/1381/1440; 390 layout and 44px targets unchanged.

## Phase 4: done (Oct 29, 2026)
- **Sample roster**: 10 sample students (8 selectable in the cohort tool). Defaults give 6 of 8 ready (75%), 3 of them with warnings (test result expiring, hours close to minimum, checklist 85%), and 2 blocked for different reasons (Noah Patel: IACRA not started; Emma Rossi: CFI endorsement not confirmed, checklist 40%).
- **Groups of 3+**: the cause was the sample data (no examiner-day had more than 2 openings). Sample examiners now have several 3-checkride days ("Up to three checkrides this day (sample)"). Day matching was also hardened from greedy first-fit to bipartite matching (most-constrained student first, earliest time preferred), so a day is not missed because of slot order. Tested: 3 students together on one examiner-day; same 3 with "keep together" off → split; 6 students → split across examiners.
- **Nav tap targets**: every top-bar link, the bell and the "View as" select are >=44x44 at all widths; no nav overflow at 1041-1440 (checked at 1041/1100/1200/1280/1381/1440 for all roles). Also: at 641-1040px the nav row now wraps instead of hiding links in a scroller; checklist cert tabs are 44px at every width; standalone name links and 'See all' are at least 24px on desktop (WCAG 2.5.8).
- **Installable PWA**: `site.webmanifest` (id/start_url/scope "./", standalone, theme #2b59ff, icons 192/512 any + maskable 192/512). `sw.js` (version `cc-proto-v4.0.1`; runtime cache keys drop the #fragment) precaches the app shell, data files, icons, Runway mark and fonts with relative paths, is network-first with cache fallback (navigations fall back to index.html), deletes older `checkride-connect-*` caches on activate, and is registered from index.html only on http(s). Works at / and under a subpath.
- **Opening alerts (mock, simulated)**: a student saves an alert (examiner/area/cert); "Simulate a matching opening" on the alert card, or "Simulate opening" on the DPE openings page, adds a slot labeled "Simulated opening (demo, not a real examiner)" and runs the normal alert matching. Matching students get an in-app inbox item ("Simulated: ..." plus a Simulated pill) and a bell badge (plus the app icon badge where supported). A browser notification appears only if the user has already granted permission via the Alerts-page button. Nothing is emailed, texted or pushed. "Book this opening" opens the examiner profile with that slot preselected and the request form open; submitting creates a mock request marked "Simulated opening" and "From a mock alert".
- **Fonts**: Bricolage Grotesque, Geist and Geist Mono variable WOFF2 (SIL OFL 1.1) self-hosted in ./fonts/ with the licenses in ./fonts/licenses/, @font-face with font-display: swap and system fallbacks; only Bricolage (latin) and Geist are preloaded; all are in the SW precache.
- **Header mark**: brand/runway-icon.svg is byte-identical to /workspace/checkride-brand/final/runway-icon.svg; favicon and icons match final/icons.
- **Deposits and cancellations (Proposed, pending legal review)**: "Deposits are paid directly to the examiner and follow the examiner's cancellation terms; Checkride Connect never holds deposit money. If the examiner, weather, or maintenance cancels, our $15 booking fee is credited or refunded on request. If the student cancels at least 48 hours ahead, the $15 fee is credited; later cancellations or no-shows forfeit it." Shown on Pricing, in the request form and on My bookings; all other copy says "paid to the examiner (mock)".
- **Deterministic sample values**: fees are fixed in the data files; slots, reviews, wait times and extras come from a seeded generator (no Math.random), and slots are relative to today. Two fresh loads show identical fees, search results, profiles and slots (tested).
- **Regulatory fixes**: the 7 Incorrect and 15 Imprecise items from /workspace/checkride-reg-verification.md applied (Spanish/Portuguese practical-test claims removed: the test is conducted in English; PPL/Sport/MEI cites; MEI checklist without a knowledge test report; medical, CFI eligibility, straight-line distances, PTS for CFII/Sport, AC 61-65K, etc.). "Unverified draft" labels kept.

## Phase 4b follow-ups: done (Oct 29, 2026)
- **Demo fixed-date mode** (`demo-date.js`, loaded before data.js). `?demo=promo` pins "today" to **Mon, Nov 2, 2026, 09:00 local**; `?demoDate=YYYY-MM-DD` pins any date; `?demoDate=off` (or the footer "Exit demo date" link) clears it. With no param, dates stay relative to the real today.
  - It patches the global `Date` (`new Date()` / `Date.now()` only; dates with explicit arguments are untouched), so slots, "in N days", alerts and timestamps all follow it.
  - The pin persists for the browser tab session (sessionStorage `cc-demo-date`) across hash routes and reloads without the param.
  - It uses its own state key (`cc-connect-proto-v3:demo-<date>`), so promo shots are deterministic and real demo state is untouched.
  - A small "Demo date: …" bar is shown under the prototype banner.
  - Works with the hash router (put the query before `#`, e.g. `http://localhost:8002/?demo=promo#/search?cert=ppl&near=KORL`). It also works offline via the SW, which matches with `ignoreSearch`, and under a subpath.
- **Narrow nav (≤640px):** a priority "More" menu. Tabs that do not fit move, from the end, into a `More` dropdown (`<details>`). The active tab always stays in the row, so no tab is ever clipped mid-word.
  - Targets stay 44px, with no nav scroll and no page overflow. Checked at 320/360/375/390/414/430/480/600/640 for all roles.
  - Escape or an outside click closes the menu. It refits on width change only.
- **Bell after Reset demo = 1, by design.** The seed has exactly one notification: "Your first sample alert is active". Reset clears the state key and reseeds, so it always shows 1 (tested twice in a row, and after reload).
  - The old phase4 `mobile-390-nav.png` showed 3 because it was taken in the same session after the e2e had simulated two openings. That shot is now taken right after Reset, so it shows 1.
- SW VERSION is now `cc-proto-v4.0.4`, with `demo-date.js` added to the shell.

## Round 5: done (Oct 29, 2026)
- Performance, loading/empty/error states (the load-error fallback card keeps the "Prototype – no real payments" and "Prototype, not legal or FAA advice" notices), transitions with `prefers-reduced-motion` respected. SW VERSION is now `cc-proto-v5.2.1`.
- Lighthouse (mobile, local http.server, Oct 29, 2026 ~11:30 AM ET): home 93/100/100/100 (perf/a11y/best practices/SEO); search 85–92 / 98 / 100 / 100 across two runs (a11y 98 is one heading-order item on search). `python3 -m http.server` cannot serve gzip or cache headers, which caps the performance score; a real static host would fix that.
- design-spec-v2 P0s were **not applied** (reverted cleanly, per the 10:41 change of plan). Only the dark-theme `.sample-tag` contrast fix was kept.

## Usability fixes (usability-findings.md, Round 5)
- Done: #1 (student notice when the DPE cancels; no alert for their own slot), #2 (DPE "Fees & policies" editor, mock, with live preview), #3 (policy text; in free mode: deposits always follow the examiner's terms and Checkride Connect is free during the prototype), #4 (all-in for the selected slot's airport, carried into the request modal), #5 (cancel confirm with the outcome from hours remaining, recorded on the card), #6 (examiner's deposit terms inline + `#deposit-policy` deep link), #8 (DPE cancel dialog with reason), #20 ("see the project plan" removed).
- ux-copy-v2 wording used for #1, #3 and #5, with its [VERIFY] flags and the "PM default, pending Drewbert and a lawyer" tags kept.
- Not done (sev 2/1, out of time): #7, #9–#19, #21.

## Free mode (owner decision, Oct 29, 2026)
- One flag at the top of `app.js`: `CC_CONFIG.FEES_ENABLED` (default `false`). It can also be set before app.js loads with `window.CC_CONFIG = { FEES_ENABLED: true }` (the tests do this).
- Flag off (default): no $15 booking fee anywhere (pricing, request flow and breakdown, all-in totals, cohort totals, credits, cancel and no-show outcomes, alerts, DPE/school/admin views). The cancel confirmation shows deposit terms only. School paid tiers are hidden; the school and pricing pages say "Free during the prototype". Deposits are still shown and labeled "Deposit paid to your examiner" (mock), under the examiner's terms. There was no waitlist "credit carries over" line in the app, so nothing to remove there.
- Flag on: the previous $15 rule, credits/forfeits and Free/Pro/Academy "Proposed pricing" tiers come back.

## Open flags
- Checklist Part 61 / ACS / PTS cites are labeled "unverified draft". Phase 4 applied the 22 Incorrect/Imprecise fixes from checkride-reg-verification.md; the 3 Unverifiable items (photo ID, "bring the original" test report, IFR GPS database) are unchanged and still need CFI/DPE review.
- Deposit and cancellation policy is **Proposed, pending legal review** (see Phase 4).
- Admin listing is a mock marketplace decision only; checking FAA designation is out of scope.
- Seeded applicants' (Jordan Lee, Sam Rivera, Taylor Brooks) checklists are saved but only visible to a student for bookings made in Student view.
- All-in example numbers (rental rates, hours, travel, no-show fees) are invented and need owner/market input before they mean anything.
- Flight school tiers (Free $0 / Pro $79/mo per location / Academy $299/mo) are proposed pricing, not final, and are hidden while the app is free (FEES_ENABLED = false).
- Multi-state data integration is deferred.
- BasicMed wording needs CFI confirmation. Copy uses "their" where the source said "her".
- The ux-copy-v2 waitlist / place-in-line copy and the no-show / dispute copy are not implemented.
- Openings have no per-slot test type; the calendar horizon is 21 days; reminders are preview only.
- Cohort readiness answers are self-attested by the school (SAMPLE defaults), not verified against logbooks, IACRA or test reports.
- Ranking is date-first, so it can pick a costlier option (the delta column shows the trade-off); the split is a greedy heuristic under that rule, not a global optimum. Phase 4: day matching is now a bipartite matching, and some sample examiners have 3-checkride days, so a 3-student cohort can stay together.
- "View as" text is hidden visually at 1041-1199px. At <=640px the nav is a second row that scrolls sideways (by design).
- Readiness minimums are self-attested draft figures, not checked against 14 CFR / ACS.
- "Use a sample location" is a fixed sample cycle, not real geolocation.

## Testing
- /tmp/t/e2e_p4.js (Phase 4, **163/163 passing**, Oct 29, 2026, policy expectations now the free-mode text; reg regexes updated for the data.js wording tweaks; nav shot now taken after Reset): alert flow end to end, browser notification only when granted, deposit-policy copy sweep, regulatory text, fonts and header mark, tap targets, determinism (two fresh loads), PWA (SW scope/control, versioned cache and cleanup, precache list, CDP installability + manifest, offline reload and cold navigation) at / and under /checkride-connect/.
- /tmp/t/brand.js: brand checks at 1280 and 390, root and subpath: Runway mark byte-identical to final/, manifest any + maskable 192/512, self-hosted fonts loaded from ./fonts/ and byte-identical to the brand delivery, OFL licenses served, colors, no external requests. **84/84 passing.**
- /tmp/t/navw3.js: nav overflow, last link visible and 44px top-bar targets at 390-1440 for all roles; only the intended <=640 sideways scroller scrolls.
Headless Chrome (/usr/bin/google-chrome via puppeteer-core, installed in /tmp/t only, not in the project) at 1280x800 and 390px (mobile + touch emulation), timezone America/New_York.
- /tmp/t/e2e_all.js: all routes x roles regression (banner, notices, FAA footer, no horizontal overflow, SAMPLE next to every star, copy-sweep regex), dataset, (c), (d), (e), (f), modal keyboard, DPE accept/checklist/decline/cancel, alerts, compare, tiers, pricing, admin, no external or non-GET requests, no console/page errors. Cohort v2 block: per-student readiness, modal fix/live gate, ranking order and override, split across examiners, eligible-only create, answers on bookings and on the DPE dashboard, nav fit at 1280 and 44px at 390 for all roles; Phase 4 roster mix, 3 together / split / 6 split, 44px nav at both widths. **561/561 passing** flag-off (default) and **565/565** with `FEES=on node e2e_all.js` (flag-on smoke; shots in checkride-connect-shots/fees-on/) (Oct 29, 2026).
- /tmp/t/axe.js: axe-core offline on every route/role at both widths plus the request modal, cohort with students, the edit-answers modal, the DPE answers disclosure, the alerts inbox after a simulated opening, the profile with a preselected slot and the DPE simulate-opening control. Tap-target audit: 44px at 390; at 1280, 44px for the top bar and nav and 24px (WCAG 2.5.8) for other controls. **0 violations, 0 small targets** on 44 route/width combinations.
- The earlier scripts (/tmp/t/e2e.js, e2e_p1.js, e2e_p3.js) were lost in a box restart; their coverage was rewritten into e2e_all.js.
Screenshots: /workspace/checkride-connect-shots/phase4/ (Phase 4, mobile + some desktop); /workspace/checkride-connect-shots/cohort/ (readiness-blocked, edit-answers-modal, ranked-alternatives, split-across-examiners, dpe-sees-answers, nav-student; desktop and mobile); /workspace/checkride-connect-shots/phase3/ (desktop-*, mobile-*); pre-restart (c)/(d) shots moved to phase3/stale-pre-restart/. - /tmp/t/brand.js: favicon/manifest/apple-touch links and manifest icons resolve (200) at the root (:8002) and from a subpath (:8013/checkride-connect/ via a /tmp symlink); Runway mark in the nav; no plane glyph; .pill.good color; font stacks; no external requests or 4xx. Shots in /workspace/checkride-connect-shots/brand/.
Not tested: real devices, Safari/Firefox, real screen readers, an actual install prompt/installed app (installability checked via CDP only).
- /tmp/t/e2e_p4b.js (Phase 4b, **177/177 passing**): demo date (label, pinned Date, slot/notification dates, session persistence, hash routes, two fresh loads identical, `?demoDate=off`, invalid values ignored, offline via SW at / and the subpath), narrow nav at 360–640 for all roles (no clipping, 44px, no overflow, More open/pick/Escape), Reset gives bell = 1 twice and after reload. /tmp/t/navnarrow.js (320–640): bad 0.

- /tmp/t/e2e_p5.js (Round 5 + usability fixes + free mode): **241/241 passing**; checks flag-off by default and repeats UF#3/#5 and a full-view sweep with the flag on. brand.js now requires byte-identity only for fonts the app ships (Manrope, newly added to the brand delivery, is listed but not adopted). axe, navnarrow and navw3: 0 issues.


## v3 + D38 wrap-up (Thu Oct 29, 2026, Eastern)

**Changes this run**
- D38 times: slot times use the airport's IANA zone, formatted "Fri, Nov 6 · 9:00 AM ET, at KVDF" (new `slotAt` helper). This covers request toasts, journey states, cancel dialog, accept/decline notices and examiner-cancel notices. Request hold end-times use the same airport-zone format. System timestamps ("Requested …", cancellation records) use the reader's zone, spelled out ("Nov 2, 9:00 AM Eastern"). Closes QA-003. TZ suite runs in New York and Los Angeles.
- Fixed a slotTime infinite recursion and a mobile sticky "Save" bar that sat behind the tabbar.
- Landing CLS went from 0.101 to 0.001. `is-landing` is now set by an inline script before first paint, and metric-matched fallback faces ("Manrope Fallback" and "Geist Fallback") are used until the webfonts load.
- FAQ page uses h2 questions (heading order). Search adds a visually hidden h2 "Examiners" (heading order).
- The demo/promo date stays at 2026-11-02. Mon Nov 9 is only the digest's sample date.
- SW is now `cc-proto-v6.2.1`.

**Reset demo data locations.** All three clear every `cc-connect-proto-v3*` key and keep `cc-theme`.
1. More (`#/more`) > "Demo data" card (`#reset-demo-data`) > button `#more-reset-data`. It works on mobile and desktop. It opens a confirm dialog (`#reset-data-confirm`) with focus on "Keep my data".
2. Footer button `#footer-reset-data` (index.html). It resets immediately.
3. The error screen's "Reset demo data" button.

**Persistence inventory**
- localStorage: `cc-connect-proto-v3` and `cc-connect-proto-v3:demo-YYYY-MM-DD` (all app state), `cc-theme` (Light/Dark/System), `cc-wf` (webfonts-loaded flag).
- sessionStorage: `cc-demo-date`.
- Cache Storage: `checkride-connect-cc-proto-v6.2.1`.
- IndexedDB: none.

**Tests (latest)**
- e2e_all: 562/562 (FEES=on 566/566)
- e2e_p4: 163/163
- e2e_p4b: 159/159
- e2e_p5: 239/239
- e2e_d38: 84/84
- e2e_tz: 41/41 (NY and LA)
- axe: 0 nodes
- brand: 88/88
- e2e_sw: precache all 200
- syntax, pctscan, navnarrow, navw3, v3smoke: all pass

**Lighthouse (mobile)**
- Landing, /faq and /search: perf 85, a11y 100, BP 100, SEO 100. LCP 4.4 s, CLS ≤ 0.002.

**Screenshots:** /workspace/checkride-connect-shots/v3/ (390 and 1440, light and dark; 16 views each).

**Open issues**
- TX/CA/AZ zone data is present but not wired up (multi-state is deferred).
- The journey roll-up uses the optional KT date.
- The waitlist is a matching alert (no waitlist-offer screen).
- Landing LCP is about 4.4 s on simulated mobile.
- Hold chips, withdraw button, no-show, medical selector, editable prep list, digest and the eligibility clock are not built.

## RC2 / D39 (Thu Oct 29, 2026, Eastern)

The RC snapshot `/workspace/checkride-v3-rc` is frozen for QA and was not touched. All work below is in this folder.

- **Demo "today".** The default is the real current date. `demo-date.js` pins only with `?demo=promo` (Mon Nov 2) or `?demoDate=YYYY-MM-DD`, and `?demoDate=off` clears the pin. No code path defaults to Nov 9. Seeds are all relative (`addDays`).
- **KECP bug (D39).** New zone-aware helpers in app.js: `todayIn(tz)`, `addDaysIn(n, tz)`, `slotToday(slot)`, and `daysUntil`/`relDays` with an optional tz. They use Intl + timeZone and never the browser's zone. The following now use the right zone:
  - Examiner Today h1: the examiner's home-airport zone (KECP = America/Chicago).
  - Today/upcoming split: each slot's airport zone.
  - `openSlots` past-filter: per slot airport.
  - #/requests slot list: per slot airport.
  - Publish form min/default date: the examiner's home zone.
  - Examiner-profile calendar today/past: the examiner's home zone.
  - #/dpe-openings 21-day grid: the examiner's home zone.
  - "in N days"/"Soonest" labels: the slot's zone.
  - Publish now rejects a date that is not after today at the chosen airport ("Pick a date after today at that airport.").
- **"More clarity. Less admin."** It was already absent. A regression test guards it.
- **Publish-openings form (S12).** Own route `#/openings` (h1 "Publish an opening.", `section#publish-opening` > h2 "New opening" > `form[data-form=publish]`, plus "Your next open dates" and links back to Requests and Calendar). Linked from `#/requests` (examiner nav tab "Requests"): the weekly-check banner button `a#dash-publish` "Publish one opening" and the right-column card "Open the publish form". The Requests tab stays highlighted on `#/openings`. Publish rejects a date that is not after today at the examiner's home airport. #/requests no longer carries a second copy of the form.
- **Waitlist line (D39).** The withdraw toast's "Your waitlist place hasn't changed." now appears only for an alert on this examiner (`a.dpeId === b.dpeId`). An any-examiner alert no longer counts.
- SW is now `cc-proto-v6.2.3` (6.2.2 during the QA fixes; 6.2.3 after #/openings).
- New test: `/tmp/t/e2e_rc2.js` (default date, promo/demoDate pins, KECP mocked-clock 00:30 ET Tue = 23:30 CT Mon, phrase regression, publish via UI). With the pre-RC2 app.js it reproduces "Today · Tue, Nov 3".

### RC2 QA fixes (QA report 2026-10-29 14:00, Eastern)
- QA-004 fixed: `#/dpe-applicants` shows "N of 9 ready · status" (countPill), and the DPE `#/request/:id` shows "Applicant checklist N of 9 ready". The cohort note now says "below 8 of 9 ready", and the cohort warning compares counts, not percentages.
- QA-025 fixed: every `.progress` bar (school Roster, school Readiness, checklist sidebars, alerts form) is now `seg9(n, total)`, which fills exactly n of total segments (`data-seg="n/total"`).
- QA-026 fixed: Journey shows "Target: Dec 2026 · Change" (`S.target`). The default is the month that contains today + 45 days; this is a PM default, pending Drewbert. Change opens a month picker. A fresh profile has a sample knowledge-test date (about 10 months ago, labelled "Sample date"), so the roll-up reads On track. The roll-up shows Heads-up when the knowledge-test window ends before the end of the target month. "Not set" still appears when nothing is entered.
- QA-024 fixed: the waitlist line appears only for an alert on this examiner.
- QA-027 fixed: KECP (see above).
- QA-029 fixed: the pending chip reads "Awaiting Maria · Held for you until <date · time> · Not confirmed yet" while the hold is active.
- QA-030 fixed: the footer Reset uses the More confirm dialog and toast, and stays on the page.
- QA-032 fixed: reset clears old toasts.
- Deferred: QA-028 (v3 withdraw copy and the Withdrawn chip), QA-031 (View-as labels), QA-033 (activity timestamp zone labels).
- Test: /tmp/t/e2e_qa.js (scans 49 role/route pairs).

### RC2 freeze notes (Thu Oct 29, 2026, Eastern)
- Regression from QA-030 fixed: demo-date.js anchored "Exit demo date" (`#demo-date-exit`) after `footer [data-action=reset]`, which QA-030 renamed. It now anchors after `#footer-reset-data` (falls back to the old selector). e2e_p4b asserts it again (159/159).
- QA-028, QA-031, QA-033 stay deferred; no code was changed for them.
- Frozen copy: /workspace/checkride-v3-rc2 (see READY.txt there). SW `cc-proto-v6.2.3`.

## B (run started Oct 29 3:30 PM ET)
Local only. RC2 frozen at /workspace/checkride-v3-rc2; pristine base at /workspace/checkride-rc2-base. Every B change since RC2:

Small fixes
- QA-031: View as labels are Student pilot / Examiner / Flight school (index.html role select).
- QA-033: system/activity timestamps (`fmtTs`) use the reader's zone with the SHORT label ("Sent Oct 29, 3:12 PM ET"); replaces the spelled-out "Eastern" form. Requests "Weekly check" uses it. Never "GMT+00:00" (UTC readers see "UTC"). Slot and checkride times stay in the airport zone (D38).
- QA-028: withdraw uses ux-copy-v3 req.withdraw.* ("CHANGE OF PLANS" / "Your request. Your call." / "Withdraw request" / "Keep my request"), a "Withdrawn" chip, card line and banner (no "Cancelled" for withdrawn requests).
- 390px: content clears the fixed bottom tabbar (body padding-bottom + scroll-padding/scroll-margin-bottom, styles.css end).

Multi-state
- Shipped sample-tx/ca/az-examiners.js = PM copies + an IANA `tz` on every airport (AZ America/Phoenix, CA America/Los_Angeles, TX America/Chicago, KELP America/Denver). FL airports keep their D38 tz. 153 sample examiners (63 FL + 30 TX + 30 CA + 30 AZ), 99 airports. d1/d2/d9 untouched.
- app.js: airports carry `state`; TX/CA/AZ examiners appended after FL; their slots use a separate "ms" id prefix and a `migrate()` step, so FL slot ids and saved states are unchanged.
- Search: State selector (FL/TX/CA/AZ + "Not covered yet" group); other states show the ux-copy-v3 "Outside sample coverage" message (#outside-coverage) with links to the 4 states. Results are filtered to the selected state; results line reads "N of M sample examiners in <State> match". Typed "City, XX" for an uncovered state goes to the message. Airport pickers grouped by state.
- Home/landing openings stay Florida (demo pilot near KORL). Profiles/requests for out-of-state examiners default "near" to the examiner's home airport (`nearFor`).

Cost estimator
- cost-model.js shipped (byte copy of PM data/cost-model.js), used via CC_COST_MODEL.expectedAllInForExaminer. FL examiners get a built cost model (sample rental, twin = 2.4x, state CFI rate, typical defaults).
- Profile: "Expected all-in, including retest risk" card (#cost-estimate), labelled "Estimate built from example inputs, not a quote"; sourced test-day flight time 1.3–2.0 h shown; retest chance adjustable ("About 1 in N", shared default, never a %; stored per cert in this browser), with [VERIFY] and "not this examiner's pass rate".
- Request workspace fee card: compact estimate inset (#fee-estimate) for the pilot.
- Not added to search/compare: design-spec-v3 has no place for it (gap).
- data.js allInModel: hours now the cost-model typical values (1.2–1.8 h) and multiMult 2.4 (was 2.5–3 h and 1.9). Examiner's own costModel wins in allIn.
- FEES_ENABLED=false: no Checkride Connect fee lines; with fees on the estimate adds the booking-fee line.

Shell / tests
- sw.js VERSION cc-proto-v6.3.0; precache + sample-tx/ca/az + cost-model.js (31 entries).
- New /tmp/t/e2e_b.js (NY + LA, in suite6b). e2e_all counts -> 153/99 and "in Florida match"; e2e_tz compares slot labels with system stamps removed (QA-033); axe + pctscan gained TX/NY search, TX/AZ profile and request routes.

### B, RC3 QA additions (steering 4:06 PM ET, qa-report-20261029-1602)
- QA-008 (app.js forms.publish, viewPublish): the same examiner + date + start time can't be published twice (any status except removed). A repeat shows one toast, "Already published. You have an opening on <date · time> at <airport>, so nothing new was added.", marks the item "Already published" in "Your next open dates" and focuses it. Double-click / double-submit guard: after a publish the submit button (#publish-submit) is disabled and further submits are ignored for 1.2 s (one toast). The weekly Calendar pattern (applyAvailability) was not changed.
- QA-034 (app.js focusin handler): a keyboard-focused control that lands under the fixed bottom tab bar is scrolled clear of it. This backs up the B tabbar padding, scroll-padding and scroll-margin CSS. It only applies to keyboard focus (:focus-visible), so a tap or click never scrolls the page under the pointer, and only when #nav is a fixed bar at the bottom of the viewport (phone/tablet).
- QA-035 (render + forms.publish): entering #/openings focuses the h1 (tabindex=-1). After a publish, focus goes to the new item (li#pub-<id>, tabindex=-1, "Just published"), which is always listed. Fallback is the h1, never body.
- QA-036 (fmtDateY / fmtDateA): knowledge-test "valid through" (all three Journey variants), "result expires/expired" (readiness gate, cohort checklist) always show the year: "Mon, Jan 31, 2028". Alert/search "before" dates and the cohort "before <date>" warning show the year when it's another year or more than ~6 months out.
- QA-037 (target-change, forms.target): monthInputSupported() feature-detects <input type=month> (type reflects and the value is sanitized). window.CC_FORCE_MONTH_FALLBACK forces the fallback for tests. Fallback is a text box labelled "Month (YYYY-MM)" with a YYYY-MM placeholder, pattern, hint with an example, novalidate and our own inline + toast errors ("Type the month as YYYY-MM, for example 2026-11." / "Pick Nov 2026 or a later month."). It accepts 2027-03, 2027-3, 03/2027, "March 2027", "Mar 2027".
- QA-038 (holdEnded / holdEndedLine): when a pilot's hold has run out (48 h after sending, or 12 h before the slot) and the request is still pending, the "Held for you until" segment becomes "Hold ended". The request page and Journey show "Hold ended. The examiner didn’t reply in time. You can request another opening." with a "Find another opening" link to #/search?cert=<cert>. Copy is from Drewbert's run notes; the spec is silent, so it's pending PM review.
- styles.css: .pill[data-hold-ended] wraps. sw.js VERSION cc-proto-v6.3.1 (no new files).
- Tests: new /tmp/t/e2e_qa2.js (NY and LA) added to suite6b. e2e_qa.js QA-026 "past month refused" now expects the new QA-037 copy ("Pick Nov 2026 or a later month."), with the same strictness.
- Extra (found while taking the QA-008 screenshots; not a QA id; also present in RC2): at <=640px every toast stretched to ~700 px tall because the tabbar rule gave .toasts a bottom while the phone rule pins it to the top. styles.css now clears the bottom at <=640px. Tested in e2e_qa2 (toast < 220 px tall, clear of the tabbar).

## C (run started Oct 29 5:07 PM ET)
Local only. RC3 frozen at /workspace/checkride-v3-rc3 (QA testing it; never touch rc*). Backups of pre-C files: /tmp/bak-c/.
Progress (updated Oct 29 ~6:00 PM ET; code done, full suite next):
- [done] M1 Admin hidden from View as (index.html option hidden+disabled; #/admin route + code kept; e2e_c checks both)
- [done] M2 ATP / rotorcraft: profile shows "No estimate yet for this certificate."; kept out of search, compare and cert pickers
- [done] M3 Calendar weekly-pattern dedupe (applyAvailability returns skipped), #avail-save lock 1200 ms, toast "N openings already published, skipped" (copy gap: no key)
- [done] M4 ux-copy-v3 (.bak10 diff = zone labels + req.status.hold_ended): app already matched; "Find another opening" link label kept (CD: use ours). New zone-name test in e2e_c (Eastern/Central/Mountain/Pacific/GMT± in rendered text, all roles' routes)
- [done] D32/D33 soft hold: min(sent+48h, slot-12h), no hold inside 12h, "Held for you until …", DPE hold chips
- [done] D33 withdraw finished per v3
- [done] D34 no-show mark + dispute (no fee, record only; disputed not counted) + DPE no-show count
- [done] D34 examiner-editable prep list, prep last (item 9)
- [done] medical type selector, date as entered, 60-day heads-up [VERIFY] kept
- [done] wl.offer.* waitlist-offer screen (#/offer/:id), holds in student's own time (D19), quiet hours, short hold <72h
- usability-findings: fixed #7 #11 #12 #13(toast) #18; already fixed #14 #19 #21; #15 moot (D31); deferred #9 (PM call on ratings), #10 (digest batch), #16 (eligibility batch), #17 (paging, next batch)
- QA Sev 2/1 (qa-report-20261029-1602): fixed 005 006 007 009 011 012 013 015 016 017 018 019 021 022 023; 031/033 via Marlo calls. QA-020 deferred: no CSS reordering; tab order follows DOM/reading order of the two-column layout (rail → main, left column → right column); needs QA/PM confirmation of expected order.
- Sample data: validate_samples.js on the PM originals = ALL CHECKS PASSED; originals deep-equal to our copies (tx ca az fl).
- SW cc-proto-v6.4.0. e2e_c added to suite6b (NY + LA): 74/0 in both.
- Next batch (not built): eligibility v2.1 (cfi_note for needs-check), clock, digest, onboarding.
- Suite run 1 (Oct 29 ~6:05 PM ET) found: page overflow on #/school and #/requests (the sr-only "Actions" th span is absolute and escaped .table-wrap) → fixed in styles.css (.table-wrap and th position: relative). Stale tests updated: e2e_qa QA-029 (req-status now also carries the v3 "No deposit until [Linda] accepts" line; check first line), e2e_all fee summary ($15 match now excludes $150-style amounts), e2e_p5 ($79/$299 with word boundary; $793 all-ins matched), brand theme-color (QA-013 light/dark pair replaces the single #2b59ff meta).
- Screenshots: /workspace/checkride-connect-shots/c/ (17 PNGs, via /tmp/t/shots_c.js, NY).

### C, RC3 NO-GO additions (steering 5:55 PM ET, qa-report-20261029-1752) + copy .bak11
Pre-edit backups: /tmp/bak-c2/. rc3-1 (QA-039 hotfix by another worker) is not touched; /workspace/checkride-pm/qa/rc3-1.patch did not exist yet when checked (~6:05 PM ET).
- [done] QA-039 past slots: shared slotPast/slotLive (slot start instant in the airport zone <= now) used by openSlots (Search/Home/Compare), profile picks and Request button, alerts/notifications, request auto-open, openRequest and request submit (toast "That date has passed. Pick today or later.", closest key), DPE lists, offers. Calendar rows start tomorrow (Publish form lead-time rule) and applyAvailability ignores today/past days.
- [done] QA-040 weekly pattern never moves or removes one-off slots (src "oneoff" or simulated); kept slots only retimed if the time is free; a plain save doesn't rewrite other slots' note/airport; toast counts created/updated/removed/closed and "N one-off openings left as published" (copy gap). Calendar row shows a one-off count (copy gap).
- [done] QA-041 focus to #req-status after confirming a withdrawal (generic ui.focusAfter in render).
- [done] QA-042 state selector: keyboard arrows don't navigate (apply on Enter or on leaving the select); focus restored to the selector after navigation.
- [done] QA-043 ended hold: single pill "Hold ended" (wording gap).
- [done] QA-044 "Request sent" and "Withdrawn by you" stamps in the reader's zone with weekday (slot/hold times stay airport zone).
- [done] QA-045 ATP/rotorcraft profile: "No estimate yet for this certificate." (no estimate card).
- [done] QA-046 lines rounded once; total = sum of rounded lines.
- [done] QA-047 retest select keeps a stored value's own option; "" ignored. 0.4/0.6 still not offered as separate labels (gap).
- [done] QA-048 p=0 toast "Retest risk left out of {cert} estimates (stored in this browser)." (QA's suggestion, copy gap).
- [done] QA-049 major non-covered airports (partial OUT_ICAO list) and any non-sample 2-letter state/territory → outside-coverage panel; outside URL drops near.
- [done] QA-050 Simulate opening locked 1.2 s (double-click adds 1).
- [done] QA-051 unused font preloads removed (font-display: swap kept).
- [done] QA-031 Admin hidden in both the header View as select and More (e2e_c).
- [done] .bak11: req.status.released retired; hold_ended copy + "You keep your place on [Examiner]'s waitlist." only when on that examiner's waitlist + "Search openings" → search. Ended hold never counts on the record (F11).
- SW cc-proto-v6.5.0. e2e_c extended (QA-039..051, .bak11).

### Phase 1 close-out (Mon Nov 2, 2026, 8:02 AM ET)
- Batch C is complete: QA-039 to QA-051, QA-031, D32/D33 soft hold and withdraw, D34 no-show plus dispute and the prep list, the medical type selector (D20) and the wl.offer screen. SW cc-proto-v6.5.0.
- Full suite run on the real date (Nov 2), all green. The demo date stays pinnable with ?demoDate=YYYY-MM-DD or ?demo=promo.
- Still deferred:
  - usability #9, #10, #16, #17
  - QA-020 (PM confirmation)
  - eligibility v2.1, clock, digest, onboarding
- Frozen as /workspace/checkride-v3-rc4. Phase 2 (Vercel look) continues in /workspace/checkride-v4.

## v4 progress, Mon Nov 2 8:14 AM ET (label fixed; box shell shows UTC)
- sw.js VERSION cc-proto-v7.0.0. Tests: e2e_p5/e2e_sw SW regex now expects v7 (same strength).
- Visual pass at 390/1440 (shots_v4.js) clean: 0 page errors, 0 external requests. Fixed: hero mock picks a DPE with 3+ times that day; openings day tabs sorted; auth radios/checkboxes were full width (global input rule).
- e2e_v4.js written: 172/172 at NY, LA and the :8023 subpath. Axe now also covers #/find, find ir/KAUS, profile with pick, #/login, #/signup, #/school.
- Full /tmp/t4 suite running.

## v4 progress, Mon Nov 2 8:39 AM ET
- [done] QA-039 staleness re-check: on window focus, visibilitychange (visible) and every 60 s, views that list slots re-render when an open slot's start has passed, so passed slots drop out. No re-render under an open modal or while a form field has focus. Request click and request submit re-validate with "This opening has already started. Pick another time." (toast; in an open request form an inline alert is added and the form skips native validation so the submit reaches the check). Nothing is booked. Copy gap: PAST_SLOT has no ux-copy key yet.
- [done] QA-020 tab order follows the visual order, by DOM order only (no positive tabindex):
  - Main nav moves in the DOM: before main at >= 1024 px (left rail), after the footer below that (bottom tab bar).
  - Profile: removed the mobile order:-1 on the calendar aside (the Openings card is already on top).
  - Search filters at <= 900 px: the location field spans the full row, so "Use a sample location" is followed by the radius below it.
  - Landing "For examiners": the inbox mock comes first in the DOM (it is the left column on desktop); no CSS order. On mobile the mock now shows above the text (conflicts.md #22).
- Tests: e2e_v4 QA-039 section with a mocked clock (Date.now skew + captured setInterval): 189/189 NY. New taborder.js (14 pages x 390/1440, forward-only positions, no positive tabindex): 56/56. Added to suite6v.sh.
- Full suite re-run started 8:39 AM ET.
- 9:16 AM ET: first re-run found reds, now fixed:
  - axe 26 nodes: radius segment links used aria-pressed (not allowed on links), now aria-current="true" on the selected one; the airport code inside a selected time tile was #E6ECFC on brand blue (4.49:1), now white.
  - brand.js expected the v3 green pill (#36623E/#EAF6ED); v4 adopted the Vercel palette (conflicts #3), so it now expects #1F7A4D/#E2F4EA exactly.
  - e2e_p4 font-stack check expected a Geist body; v4 body is Manrope (Vercel look), so it now checks Manrope body + h1 with fallbacks AND Geist Mono with a monospace fallback.
  - Harness stricter: axe.js, navnarrow.js and navw3.js now exit 1 on any violation, and their counts are written to the summary.
- Full suite re-run started 9:16 AM ET.

## QA-05x fold-in (QA report 2026-11-02 09:13, RC4 GO), notes Mon Nov 2 9:30 AM ET
- QA-054 fixed: examiner Requests calendar (viewDpeDash mySlots) now drops open slots with slotPast(), the same helper as the pilot views. Test: e2e_v4 [QA-054] (mocked clock, focus re-check).
- QA-056 fixed: site.webmanifest theme_color #2b59ff -> #ffffff (matches the light theme-color meta; dark meta stays #10141d). Test: e2e_v4 [QA-056].
- QA-052 fixed: the day panel never goes blank. Empty selected day -> "No openings left today." / "No openings left on this day." + "Next opening: …" link (#day-none, #day-next). ?date= of an empty day (or a day emptied by the clock) moves to the next opening day with "No openings left on {date}. Showing the next opening." (#date-moved). Refusal copy stays "This opening has already started. Pick another time." Tests: e2e_v4 [QA-052] x9 incl. every Search "See this opening" link.
- QA-053 fixed: after a refused Request click or Send, focus goes (priority) #day-none > #date-moved > Openings heading > page h1, never body. ui.focusAfter now accepts "a || b" priority lists. Tests: e2e_v4 [QA-053] x2.
- QA-055 fixed: unknown st (ZZ) gets a selected disabled "Choose a state" option; territories (PR, GU, VI, AS, MP) get a "Territories (not covered yet)" optgroup; stateName() never returns the raw code ("this state"). Outside-coverage copy unchanged. Tests: e2e_v4 [QA-055] for ZZ, PR, zz.
- QA-016 fixed: toast() drops an identical message within 1 s (Enter fired change + submit). Test: e2e_v4 [QA-016] (mutation-checked: fails with dedupe removed).
- QA-047 fixed: oneIn() says "About 1 in n" only within 0.02 of the value, else "About k in 10" (0.6 -> About 6 in 10). No percentages. Tests: e2e_v4 [QA-047] x2 + existing e2e_c.
- Extra fixed: Simulate opening gets aria-disabled/aria-busy + .is-busy (opacity .55, no pointer events) for its 1.2 s lock; focus stays on it. Test: e2e_v4 [sim] x3.
- QA-007 fixed: approve also takes a 700 ms lock (the 2nd click of a double-click landed on the next row after re-render). Test: e2e_v4 [QA-007] (mutation-checked: 0->2 without the lock).
- QA-019 fixed: the only heading-order hits (axe heading-order sweep over all axe.js routes at 1280 + 390) were the empty states on #/bookings and #/my-checklists (h1 -> h3); now h2. Test: e2e_v4 [QA-019] x2. Probe: /tmp/t4/hprobe.js.
- QA-021 fixed (by the QA-020 .loc-field full-row change): Near input 311 px of 390 (was 174). Test: e2e_v4 [QA-021].
- QA-011 partly fixed: breadcrumb links 24 px everywhere, 44 px on touch/narrow; "← Back to search" 44 px on touch/narrow; checkboxes/radios 22 px on touch. Inline links in running text left as is (WCAG 2.5.8 inline exception). Tests: e2e_v4 [QA-011] x2.
- e2e_v4 now 228/228 (NY). Next: full suite, then shots, then freeze rc1.

- 10:08 AM ET: full suite (run started 9:31 AM ET, logs /tmp/t4/s6/*.txt, summary /tmp/t4/s6/summary.txt): suite6a + suite6b all green (axe 0 nodes, pct pass, nav bad 0); e2e_v4 228/228 in NY and LA; subpath + taborder still running.
- 10:13 AM ET: full suite done, all 31 runs exit 0 (subpath e2e_v4 228, taborder 56). Shots re-taken (node /tmp/t4/shots_v4.js, 16 PNGs, 0 page errors, 0 external requests) in /workspace/checkride-connect-shots/v4/; 12 side-by-side PNGs rebuilt with PIL in side-by-side/. Next: freeze rc1.
- 10:13 AM ET: frozen as /workspace/checkride-v4-rc1 (cp -a), READY.txt written there. No push.
- 10:13 AM ET: servers :8020 and :8023 stopped (pid files). :8002 and other agents' servers left running. Run ended.

## v4-rc2 pass (QA NO-GO report 2026-11-02 11:15), started Mon Nov 2 11:13 AM ET
Plan: QA-057 dark CSS, QA-071 sticky bar, QA-070 no silent re-target, parity QA-059/062/063/064, Sev 2s 061/058/065/067/068, find paging, ux-copy 7.6 keys, Sev 1s 060/066/069/072/073; SW cc-proto-v7.1.0; full suite; freeze /workspace/checkride-v4-rc2. Backup of the dev tree before edits: /tmp/t4/v4-backup-pre-rc2-*.
- 11:16 AM ET QA-057 done: removed stray 'ce; }' before :root[data-theme=dark] (styles.css ~L75). axe.js now takes THEME=dark (emulates prefers-color-scheme + cc-theme=dark, checks data-theme applied): dark axe 0 nodes on all 34 routes x 1280/390 (color-contrast rule = 4.5:1 text).

### rc2 progress 11:30 AM ET
- QA-070 done: no auto-move ever. A started/vanished pick clears the selection, keeps the chosen day, shows #slot-started ("This opening has already started." via COPY["slot.started"]) with critical styling, focus → #slot-started || #day-none || #v4-op-h; no Request bar until the student picks again. #day-none is a sky-soft panel with a manual "next opening" link (QA-073).
- QA-062 done: legacy Availability card (.day-panel Request buttons) removed; the openings picker is the only booking path. QA-063 4-hour note #v4-slot-note under the time grid ([VERIFY]). QA-064 unpicked tiles sky-soft.
- QA-071 done: --bar-h measured by barFit(); scroll-padding/scroll-margin = tabbar + bar + 24px below 1024px (bar + 24px above); focusin treats #v4-bar as an obstruction; the bar is tucked (visibility:hidden) while its card is still below #nav, so it is never drawn under the tab bar. /tmp/t4/rc2/bar71.js: Chromium + Firefox 157 (Playwright) at 360x640, 390x844, 1440x900 → 0 issues (baseline 36).
- Toasts: toast(msg, "crit") for stale-slot refusals (QA-073).

### rc2 progress 11:45 AM ET
- QA-059 Find filters: `form.v4-filters` is a plain 2-column grid (no card), radius chips span the row; one column only under 340px.
- QA-060: current radius chip uses accent-soft/accent-text with the brand radius; `.proto-strip` is a slim block strip (3px accent edge); "Next open" pill is sky-soft (no green).
- QA-058: a card listed only because the examiner travels gets a "Travels to you" pill and a one-line why ("Based X nm from NEAR, outside your R nm. Listed because this examiner travels up to T nm to meet you (sample)."). Filter semantics unchanged; the count line says how many travel in.
- QA-066: #/find shows 20 cards, then "Show more (n of m left)"; focus stays on the button (or the first new card when the list completes).
- QA-069: bad `cert`/`near`/`radius` link params are reset and listed in a `#find-param-note` status note.
- QA-065: on a route change with no explicit focus target, focus goes to `#app h1` (tabindex -1, no scroll jump); same-route re-renders restore focus to the same control (focusKey).
- QA-061: Accept + checklist accepts, prefills the D34 standard list (unverified draft) when none exists, opens the builder with focus on `#cl-h1` and a `#cl-prefilled` note.
- QA-067: tables get sr-only captions, `th scope`, and unique region names ("<caption> (table)", counter on clashes).
- QA-068: empty sign-up submit focuses the first bad field (aria-invalid + aria-describedby="signup-err").
- QA-072: #/dpe/nope "Back to Find a DPE" -> #/find. QA-073: stale states use v4 notes (#day-none sky-soft, #slot-started critical), critical toast for refused Requests.
- Copy keys (ux-copy §7.6): `COPY["slot.started"]`, `COPY["search.empty_today"]`, `COPY["search.state.placeholder"]`; "That date has passed" now only on onboarding date fields.
- SW `cc-proto-v7.1.0`. Tests: e2e_v4 QA-052 block rewritten for QA-070 (no auto-move); e2e_p4/e2e_rc2 selectors moved to v4 picker; new `/tmp/t4/e2e_rc2v4.js` (Playwright Chromium + Firefox, 87 checks) and `/tmp/t4/bar71.js`; axe dark added to suite6b.
- Trade-off (QA-071): below 1024px the sticky Request bar is tucked (hidden) while its own Openings card is still below the bottom tab bar, so it can never slide under #nav; it reappears as soon as the card scrolls into view or focus enters the bar.

## Easy switch (logo, example states, landing wording) — kept as is in rc2
| What | Where to change it | Notes |
|---|---|---|
| Logo (Runway lockups) | `BRAND_LOGO` in app.js (~L32) | Also listed statically in index.html L17-18 (no-JS header; app.js re-syncs these from BRAND_LOGO at boot) and in sw.js SHELL L33-34 (precache: update the paths and bump VERSION). |
| Example states FL/TX/CA/AZ | `COVERED_STATES` in app.js (~L29); `coveredList()` (~L33) builds "Florida, Texas, California and Arizona" | Each state also needs a home airport in `STATE_HOME` (app.js ~L35) and sample examiners/airports in data.js. |
| Landing wording | `LANDING_COPY` + `LC(key)` in app.js (~L2566, just above viewLanding) | Keys: hero.eyebrow, hero.h1, hero.h1b, hero.lead, final.h2, final.body. index.html's no-JS landing strip is separate static text. |
| **D41 switches** | `window.CC_CONFIG` (set before app.js) or the defaults at the top of app.js (`AREA`, `LANDING_SET`, `BRAND`) | `SAMPLE_AREA`: "NC" (default, sample-nc-examiners.js, fictional XNC01–XNC12, America/New_York) or "legacy" (FL/TX/CA/AZ from data.js + sample-*.js, untouched). `LANDING`: "site" (default, his vercel copy adapted, `LANDING_SITE`) or "v4" (`LANDING_V4`, rc2 text). `BRAND`: "site" (default, brand/checkride-connect-logo-*.png, icons/*) or "runway" (Runway SVG lockups, icons/runway/*). NC mode uses storage suffix `:nc`. |
| ux-copy §7.6 keys | `COPY` in app.js (~L166) | slot.started, search.empty_today, search.state.placeholder. |

### rc2 progress 12:06 PM ET
- First full run: e2e_all 560/562; the 2 fails were DPE-entered opening notes no longer visible after the legacy Availability card was removed (QA-062). Fixed: the Openings card lists notes for the shown day (`#v4-day-notes`, "Notes from the examiner"). Full suites restarted (log /tmp/t4/s6/run.log, summary /tmp/t4/s6/summary.txt).

### rc2 tests green, 1:11 PM ET
- Full run (12:03 PM ET start, after the last code change at 12:03 PM ET): every suite exit 0 except taborder (55/56): QA-065 now focuses the h1 on route change, so Tab started from the h1 instead of the page top on #/dpe-checklist/b1 at 1440. Test-only fix in /tmp/t4/taborder.js (start Tab from a tabindex -1 marker at the top of body); re-run 56/56. No app code changed after 12:03 PM ET.
- Frozen as /workspace/checkride-v4-rc2 (READY.txt there).

## D41 pass (Mon Nov 2, 2026, started 1:23 PM ET) — on top of v4-rc2, NOT frozen
Scope (Drewbert D41 via Marlo): 1) logo from checkride-connect.vercel.app, 2) North Carolina fictional sample area,
3) his landing copy, 4) D41 in product-decisions.md. SW -> cc-proto-v7.2.0. Switches keep Runway / FL-TX-CA-AZ / v4 copy.
- [x] backup: /tmp/t5/v4-backup-pre-d41, /tmp/t5/product-decisions.pre-d41.md
- [x] logo assets + favicon/manifest   - [x] NC data + area switch   - [x] estimator "No estimate yet" (COPY key `estimate.no_area_data`)
- [x] landing copy switch              - [x] D41 decision log          - [x] SW bump (cc-proto-v7.2.0)  - [x] tests, suites
- Smoke (NC default, :8020): 17 routes, 0 page errors; no FL/KORL text outside the 50-state picker.
- Tests (1:40 PM ET): new /tmp/t5/nc/e2e_d41.js 273/273 (TZ NY + LA, root + subpath built in); /tmp/t5/nc/brand.js 88/88;
  legacy copies (/tmp/t5/legacy, :8030/:8033 inject legacy/v4/runway) running; NC default batch (ncA.sh) running. Log: /tmp/t5/s7/summary.txt
- Suites done 1:58 PM ET (all green; log /tmp/t5/s7/summary.txt):
  NC default (:8020/:8023): syntax ALL PASS; axe 0 / axe-dark 0; pctscan ALL PASS; navnarrow 0; navw3 0; taborder 56/56; bar71 0; e2e_sw ALL PASS;
  brand (nc) 88/88; e2e_d41 273/273 NY + 273/273 LA.
  Legacy behind switches (:8030/:8033 legacy/v4/runway): e2e_all 562/562 fees off, 566/566 fees on; p4 163; p4b 159; p5 239; brand 88; sw; d38 90;
  tz 41 NY/LA; rc2 52 NY/LA; qa 228 NY/LA; b 157 NY/LA; qa2 46 NY/LA; c 115 NY/LA; v4 241 NY/LA/subpath; rc2v4 87 NY/LA/subpath; taborder 56.
  Flakes under parallel load only (pass alone, reruns green): e2e_tz [same] jTxt/bTxt ordering (also reproduced on frozen rc2 served read-only
  on a temp :8040 under 4x parallel load: 4/8 runs, so pre-existing; demo clock restarts per page load) and e2e_p5 one count-up frame "$15–$1,300".
- NOT frozen. Waiting for the parent to say freeze /workspace/checkride-v4-rc3.

## rc3 pass (Mon Nov 2, 2026, started 2:28 PM ET) — on top of D41; QA report qa-report-20261102-1420.md (rc2 GO)
Backup /tmp/t5/v4-backup-pre-rc3. Must: QA-075, QA-081 (X04). Quick if possible: 076, 077, 078, 079, 080. SW -> cc-proto-v7.3.0.
- ~2:31 PM ET: code done for 075, 081, 076, 077, 078, 079, 080; SW cc-proto-v7.3.0. Next: probe + tests.
- ~2:36 PM ET: e2e_rc3.js written (/tmp/t5/nc); first run 163/169, test-side fixes (ring via box-shadow, toast via textContent).
- 14:38 ET: full batch launched (ncA8/legA8/legB8/legV8, logs /tmp/t5/s8). rc3 suite verified to fail on the pre-rc3 backup (27 fails) and pass on v4.
- 2:58 PM ET: all suites green (flake reruns noted in READY.txt); freezing to /workspace/checkride-v4-rc3.
- 2:59 PM ET: frozen v4-rc3, READY.txt + MD5SUMS.txt written.

## Eligibility Rules 5/6 + home Next openings card (Mon Nov 2, 2026, started 3:10 PM ET) — PM Marlo
Backup /tmp/t5/v4-backup-pre-elig. Do NOT freeze rc4. SW -> cc-proto-v7.4.0.
- 3:17 PM ET: elig-clock.js written (Rules 5+6 port, doc wording). Unit+differential vs ref: /tmp/t5/elig/unit.js PASS (4000 prep + 3000 retest fuzz). Next: UI wiring.
- 3:23 PM ET NC cost data wired: sample-nc-examiners.js regenerated (/tmp/t5/nccost/gen.js; state NC on XNC01-12, PPL fees 700-900, nc22 retest 500, costModel+sample.rental/lodging on all 28, costData true); app.js NO_EST_AREA follows costData, 'national average' tags (natOf/NAT_TAG); home Next openings card stacks fee and wraps names. Next: validator + tests + suites.
- 2026-11-02 15:30 ET: NC cost wiring done (validator 1280/1280, e2e_nccost 509/0), e2e_elig 61/0 (boundaries, NY=LA, axe light+dark, card 360-1440); retest missing-date row now gets the needs-check note. Full s9 suites running.
- 2026-11-02 15:48 ET: s9 full run all green (see /tmp/t5/s9/summary.txt). rc4 NOT frozen.

## rc4 pass (Mon Nov 2, 2026, 3:49 PM ET onward) — deposit wording, D42, Customer Discovery copy (§7.4/7.7/7.8/7.9), QA-082–089; freeze to checkride-v4-rc4
Backups in /tmp/t5 (app.pre-pct/pre-d42/pre-cd/pre-cd79.js, styles.pre-ovf/pre-cd.css, elig-clock.pre-d42/pre-cd.js, qa-backup/, PLAN.pre-rc4.md). SW -> cc-proto-v7.5.0 (overrides "SW stays v7.4.0").
- Deposit note: "about 20% of the fee" -> "about a fifth of the fee" (dollar amounts kept); % exclusions removed from the no-% checks.
- Landing 6 px overflow at 1024 fixed (styles.css, 1024–1199 px topbar gap/padding).
- D42: optional Request-step tick "Your CFI has reviewed the items flagged on your Journey." (request.cfi_reviewed / .hint), only when Journey has a warn/fails row, never gates Send. Reference .py aligned (97 -> 101 cases).
- Customer Discovery copy review applied (keys kept); estimate.limited_data beside the NC PPL fee and the twin rate only.
- §7.9 (4:04 PM ET steering): outside-coverage line says "North Carolina"; Find count "({n} based farther away travel to you)"; landing inbox "Confirmed this week" (QA-086); Search pills now "No openings posted" / "Availability not confirmed" like Find; Compare empty says "sample examiners" / "checkride".
- QA-082 #/search link note (same "We adjusted this link:" as #/find). QA-083 runway.webmanifest + runway PNGs precached. QA-084 dark-tab favicon. QA-085 deferred (see Open). QA-086 relabelled. QA-087 docs only (Customer Discovery). QA-088 "OUR PROMISE" fixed earlier; "tested faster" parked. QA-089 SW answers icons from the precache first (mitigation; Firefox not on this box to reproduce).
- 4:11 PM ET: code done; full s10 suites next.

### QA items (qa-report-20261102-1600)
- QA-082 fixed: searchFilters() notes an unknown airport ("KTPA", "XNC99", "KORL" in NC) or checkride, falls back as before; lower-case known ids are accepted.
- QA-083 fixed: BRAND "runway" swaps <link rel=manifest> to runway.webmanifest (same fields, icons/runway/*); sw.js precaches icons/runway/favicon-16/32/48.png, icon-192/512, maskable-192/512 and runway.webmanifest.
- QA-084 fixed: icons/favicon.svg carries a light-on-dark copy of his mark behind @media (prefers-color-scheme: dark); icons/favicon-dark-16/32/48.png (derived locally from his PNG) + a media-query <link> in index.html. Dropped under BRAND "runway".
- QA-085 deferred: his mark only exists as a 192 px PNG (brand/checkride-connect-icon.png), so icon-512 and icon-maskable-512 can't be made sharper without upscaling. icon-maskable-192 is already his mark at native size with padding on a white tile. A vector (SVG) of the mark from Drewbert would fix the 512s.
- QA-086 fixed: label "Confirmed this week" (count unchanged: confirmed checkrides).
- QA-087: docs only, owned by Customer Discovery (ux-copy-v3.md §7.9 added by them). No code.
- QA-088: "OUR PROMISE" -> "WHAT IT COSTS" (done in the CD pass). "Get signed-off students tested faster." parked (below).
- QA-089 mitigated: Firefox's "ServiceWorker intercepted the request and encountered an unexpected error" came from icon requests still waiting on the network inside respondWith when a clock-frozen test tore the page down. Icons are now answered from the precache first (they only change with a VERSION bump), and cache.put errors are caught. Not reproducible on this box (no Firefox); QA to re-check in the Firefox clock-frozen suites.

### Parked copy ideas (optional, for Drewbert later)
Not applied; they mirror or touch Drewbert's own site wording, so they wait for him.
- "DPE" -> "examiner" on the landing and CTAs ("Find a DPE" etc.), on Find ("FIND A DPE" / "Find a DPE") and on the profile ("Sample DPE since {year}" -> "Sample examiner since {year}").
- Hero eyebrow: a 4-word eyebrow instead of the current one.
- Schools wording: "momentum lost", "Get signed-off students tested faster." (QA-088 speed claim), "Fewer admin hours".
- "cancellation policy" -> "cancellation terms".
- Home lead "Find your checkride. Sooner." / "…across examiners near you": drop the speed claim ("Without the phone tag.") and say "sample examiners".
- Students section "cuts out the week…" (Drewbert's wording): an outcome claim the prototype can't back; soften or drop. Parked by Marlo, Nov 2 (from Customer Discovery's rc4 copy review).
- 4:51 PM ET: full s10 suites green (NC + legacy; flakes/expectation fixes re-run alone: axe light 390 modal transition timing re-run solo 0 nodes; d41 x2, e2e_all x2, e2e_p4, e2e_p4b, brand re-run after intended-change expectation updates). Freezing to checkride-v4-rc4.

## post-rc4 copy batch, unreleased (Mon Nov 2, 2026, 5:00 PM ET)
Customer Discovery via PM. Not in checkride-v4-rc4; no freeze, SW still cc-proto-v7.5.0.
- estimate.nc_fee_national: "We have no North Carolina figure for this checkride. The sample fee is within the national range." ([VERIFY] kept)
- Profile line: "Sample DPE since {year} · Piedmont FSDO (fictional)" (leading "Sample " stripped from the FSDO label at render; data file unchanged, "Managing office" still shows the data value).
- clock.retest.recheck_note on two lines: "We re-check your prep hours against the retest date. Hours from before your last test may fall outside the window." [VERIFY #5] / "Your knowledge test and medical dates keep running."
- estimate.nc_basis line 1 reordered so twin is last: "... trainer $185/h, instructor $60/h, hotel $113 a night, twin $428/h. Based on limited public data." (no parenthesised full stop).
- Banner "Prototype – no real payments" (index.html, examiner settings) unchanged.
- 5:24 PM ET: admin applicant card "Managing office" now reads "Piedmont FSDO (fictional)" (same render-time fsdoLabel() as the profile line; data unchanged; legacy shows e.g. "Tampa FSDO (fictional)"). e2e_cdcopy checks it and that no doubled "Sample"/"(fictional)" appears.

## rc5 pass (Mon Nov 2, 2026, 6:10 PM ET onward) — QA report qa-report-20261102-1807 (rc4 GO); freeze to checkride-v4-rc5
Backups in /tmp/t5 (app/elig-clock/sw/nc.pre-rc5.js, PLAN.pre-rc5.md, ref.pre-rc5.py, test *.pre-rc5). SW -> cc-proto-v7.6.0.
- QA-090 fixed: the optional request-step CFI tick shows only when Journey has a warn/fails row (cfiAckRequired: roll-up CFI review or Closed). A knowledge-test heads-up (warn/at-risk) or needs-check never shows it (ER v2.1 L77/L80, C5).
- QA-091 fixed: prep hours must be a number from 0.1 to 24. Non-numeric (badInput), 0, negative and >24 entries are not counted; the field gets aria-invalid + clock.more.hours_invalid, the clock row notes clock.prep.ignored. Warn only, never blocks. The total is compared unrounded and shown floored to 2 dp, so 2.996 h shows "2.99 of 3" and fails. Reference .py aligned (101 -> 105 cases).
- QA-092 fixed: d12 instrument fee $950 (was $900 = its private fee); validator checks every non-private, non-sport fee sits above private.
- QA-093 fixed: exempt / not-applicable prep rows show a neutral chip "Not needed for this checkride" (clock.chip.not_needed), not "On track".
- QA-094 fixed: expired KT line carries the year ("expired Tue, Jun 30, 2026").
- QA-095 not changed: three forms of the prototype line (landing banner "Prototype, no real payments.", landing footer "Prototype: no real payments.", app strip/modal "Prototype – no real payments.") each match their source; copy-owner item, waits for Customer Discovery.
- Empty prep list: entries [] = needs-check/missing (ER L395), engine + reference (P25) + unit.
- QA-089 (re-scoped, Firefox "A ServiceWorker intercepted the request and encountered an unexpected error" on app.js in rapid interrupted reloads): reproduced with Playwright Firefox (v7.5.0: 10 errors in 3 runs, named files). Ours: respondWith could get a rejected/aborted stream. Fixed: answer().catch(offline), no page abort signal on subresource fetches, body read in full, offline() never rejects. After: 0 on :8020 and :8023 (6 runs each); the legacy injector ports :8030/:8033 still log a few with an empty URL ('') in the 8-reloads-at-60-ms burst only, no named file, page loads fine. Looks like Firefox reporting requests cancelled when the page is torn down; left open for QA as a residual.
- D43 (parked wording) is in product-decisions.md L104; parked items above stay parked.

## rc6 — Nov 7, 2026 (QA report qa-report-20261107-1419)
Standalone machine-local static tree (no .git in tree or parents), no cloud target, no repo access, no publish/demo update. Frozen rc5 GO is not an rc6 GO. SW next version: cc-proto-v7.7.0.
- QA-096 root cause: UI and engine used >0 although the documented minimum is 0.1. Both now require 0.1–24; min attribute also 0.1. Step remains an editing hint, not a rounding rule (2.996 remains short of 3).
- QA-097 root cause: listening only to change misses malformed native input whose exposed value remains empty (badInput true). Hours now autosave on input and change, preserve the native input DOM/raw edit while typing, update aria-invalid/describedby + inline error and advisory output without replacing the field. Malformed state persists via hoursBad, clearing/replacing clears it. Tab advances normally, no hours-field rerender/focus bounce.
- QA-098 root cause: UI prefiltered invalid rows, turned nonempty evidence into null and incorrectly returned missing. Invalid rows now reach the engine as nonqualifying evidence (null hours), so invalid-only is warn/fails with cfiAckRequired=true. Date-only/intentionally blank/all-cleared rows still become missing with no tick. Mixed valid evidence counts only qualifying hours. Optional checkbox and warn-never-block unchanged.
- QA-091 arithmetic: exact decimal sum avoids both upward threshold rounding (2.996 and 2.9999999 fail) and binary-addition false negatives (0.3+2.3+0.4 and 0.7+1.4+0.9 exactly pass). No rounding before comparison.
- Reference scope: tests/rc6/reference.py is the aligned local rc6 copy of the PM reference; canonical checkride-pm source stays read-only/unchanged under this task's v4-only edit scope. QA must use the local rc6 reference for sub-0.1 parity until the PM owner aligns the canonical copy.
- No copy keys/text changed; clock.more.hours_invalid and clock.prep.ignored now match actual validation. Fictional-data/legal/prototype/FAA/VERIFY notices and FEES_ENABLED=false unchanged; fonts byte-identical. QA-095 stays pending copy owner; D43 parking and all landing wording unchanged. QA-089 stress-only residual remains open, not investigated further; normal flows/upgrade only.
- Evidence: /tmp/t5/rc6-20261107/; fresh screenshots only in /workspace/checkride-connect-shots/v4-rc6/. Actual typed hours tested in Chromium + Firefox, including e/1e/comma, 0.05, 0.09, 0.1, 0, negative, 24, 24.1, huge, 2.996, 2.9999999, mixed/blank/corrected, route/reload persistence, optional checked/unchecked mock Send. Chromium's typed 1,5 becomes 15 via native filtering: explicitly NOT app rejection. Firefox reports badInput for that token.
- Harness corrections retained, never counted as product passes: initial details-open fixture tested empty-string attribute as false and timed out on hidden hours; corrected to compare with null. First request-tick regression lacked its fresh screenshot directory (ENOENT); created the directory for re-run. First upgrade fixture assumed untouched app state had already been saved; corrected to enter dated hours through UI. Next upgrade attempt tested before activation (both caches temporarily present; offline reload timeout); corrected to await worker activated, not merely cache creation. Earlier logs retained. Old rc5 QA Maria/KORL/obsolete U21/U33/qa039 baseline failures were not silently converted to passes; this lane uses explicitly versioned fixtures.
- Evidence-handling limitation found during destination audit: the copied brand script used SHOTS (not SH), so its first run retained the old v4-d41/nc/brand screenshot destination. Current affected tree and modified-file inventory were preserved under scratch immediately on discovery; original overwritten images cannot be claimed preserved. Frozen folders/app files were not touched. Corrected the script destination to v4-rc6/reg-nc-brand for a fresh rerun. All other copied screenshot destinations were audited. This is an evidence-preservation limitation, not a product-test pass or a restoration claim.
- Final validation Nov 7, 2026, 2:40 PM ET: 16 selected regression lanes, 1,645 literal passing assertions plus 66 settled axe scans / 0 violations (19 small-target diagnostics are informational/non-gating); actual typed C/F 111/111, narrow/root/subpath/legacy keyboard 30/30, final C/F upgrade/offline 12/12, explicit reference/JS boundaries 19/19, unit 517/517 plus prep differential 4000/4000 and retest 3000/3000, local reference base cases 105/105. Earlier successes were rerun where the final decimal arithmetic changed. Old 500 ms modal-axe timing caveat remains: settled lane uses 1.5 seconds, not proof of zero issues mid-transition or a screen-reader audit. No full independent rc6 QA GO claimed.
- Brand fresh-destination rerun initially also lacked its new directory (second ENOENT fixture failure); retained that failure, created the directory, and final-brand-corrected.log is 88/88. Final assertion audit selects the corrected fresh run, not the old-destination run. All fixture failures and screenshot-preservation limitation above remain explicit.

## Unreleased bounded follow-up — Nov 7, 2026, 2:50 PM ET (does not block frozen rc6 QA)
Standalone local development only; no repo/remote/cloud/upload/push/publish/message, no frozen/live edits, **NO rc7 freeze**. SW dev assets bumped from cc-proto-v7.7.0 to **cc-proto-v7.8.0**. Historical QA-HANDOFF-RC6.md describes the frozen rc6 snapshot, not this unreleased pass.
- Verified canonical PM reference read-only, not from relay: current v2.3 self-tests **128/128** (not merely reported 120), 0.1 minimum, exact Decimal sum, P44–P51 hourly bool exclusion already present. No canonical hourly owner change needed. SHA256 unchanged across this pass.
- Reproduced actual baseline distinction: old dev-local Python True raised decimal.InvalidOperation; False did not crash (zero excluded). Old JS did not crash but counted True as 1, so [True,True,True] and [True,2.9] incorrectly passed. Both browsers showed an empty native number input for True while invisibly counting it; False already had error feedback. Preserved original observations in fresh baseline-reference.log, engine-before.log, ui-before.log.
- Dev UI and engine now treat both boolean values as malformed, noncounting evidence. All-boolean nonempty lists are warn/fails with optional CFI tick, not missing. Mixed valid evidence counts only real numeric/numeric-string hours; correction works and persists. Imported boolean value stays stored until edited; displayed blank native field has explicit inline error/ARIA/ignored note. Explicit Backspace/Delete on that empty imported-boolean field intentionally clears it to missing; mere focus/blur/route/reload does not silently clear it. Actual checked/unchecked mock Send still works and persists flags/evidence.
- Local legacy dev reference and new tests/next-pass/reference.py fixed without touching frozen rc6. A separate gap was found beyond the reported hourly fix: canonical flight-unit shortcut still counts boolean-valued entries. Dev/local reference exclude bool before the unit shortcut. Local parity 32/32, canonical hourly parity 24/24; **six canonical flight-unit expectation differences retained explicitly**, not claimed aligned or hidden as passes. Exact optional owner proposal: tests/next-pass/REFERENCE-OWNER-HANDOFF.md (not sent). Numeric strings, 0.1–24 bounds, exact decimals and actual nonboolean flight counting retained.
- CD §7.10 read directly. Added key **proto.payments = "Prototype: no real payments."**. Static top EXAMPLE DATA banner changes comma to colon and gains data-copy-key; existing colon landing footer is now wired to the key with no visible wording change. Entire D41 landing template text unchanged except key wiring (asserted).
- **QA-095 partial scope / explicit safeguard conflict:** CD asks to normalize all short variants, but standing instruction mandates literal "Prototype – no real payments" in app strip (app.js ~3152), Request modal (~3377), examiner settings escaped en-dash (~1686), and index fallback (index.html:80). Those four mandatory contexts remain byte-for-byte verbatim, not silently relabeled to the colon key. QA-095 cannot be claimed fully closed until this conflict is resolved. Separate legal/FAA-advice/fictional/no-send disclosures, D43 landing parking and all other prototype invariants remain. No proto.strip repurposing.
- Fresh scratch only: /tmp/t5/dev-20261107-bool-notice/; fresh screenshots only: /workspace/checkride-connect-shots/dev-20261107-bool-notice/. All inherited SH/SHOTS/OUT paths audited BEFORE execution; original typed regression copied/repointed into fresh scratch. No old brand harness run and no historical screenshot destinations used.
- Actual assertions: saved-boolean/notice Chromium+Firefox **94/94**; actual typed-hour regression **111/111**; Python/JS bool cases **32/32**; canonical hourly bool agreement **24/24**, with six explicit flight gaps; unit **517/517**, seeded prep diff **4000/4000** and retest **3000/3000** (booleans included); numeric boundaries **19/19**; new local/canonical reference base suites **128/128** each, legacy local base **105/105**; scope/font audit **17/17**; syntax **11**, no-percent scan **36**, PWA/SW **62** literal passing assertions. No post-fix product assertion failure. Forced app.js abort is an intentional fallback fixture, not a product crash. Normal browser runs assert no page exceptions, console errors or external runtime requests.
- Accessibility: invalid saved-boolean forms light/dark in both browsers (four settled axe checks), plus typed-regression four checks: zero violations. Settled timing, no screen-reader/mobile hardware/WebKit signoff; no new global 500 ms modal-axe or stress-only QA-089 claim. QA-089 remains open low priority and was not stress-tested.
- Frozen rc6 remains untouched: all 60 file hash/mtime-ns/size records unchanged and 59/59 MD5 manifest entries pass. All font bytes unchanged. No rc7 folder created. Detailed results/owner proposal in tests/next-pass/ and fresh logs.

### Tests/docs-only follow-up — Nov 7, 2026, 2:54 PM ET (no runtime change; rc7 freeze still held)
- Verified Data Collector update directly/read-only: canonical v2.4 `_sum` excludes bool before either unit; P52–P65 present; canonical **142/142 PASS**. Updated owned tests/next-pass/boolean-parity.py to require zero actual gaps while comparing status/reason/CFI flag/can-book to local reference and JS. Corrected run **32/32**, 24 hourly + 8 flight cases, **zero gaps**. Independently generated fresh seeded status/reason comparisons against canonical: **3000/3000**. Prior six-gap evidence and prior test script retained; no history removed or old logs overwritten. Reference-owner handoff now marked resolved with evidence, no remaining action for that gap.
- **QA-095 accepted with intentional exceptions, per Marlo's decision** relayed Nov 7, 2026, 2:53 PM ET: retain implemented proto.payments = "Prototype: no real payments." within authorized top-banner/footer scope, and keep the four mandatory app-strip/Request-modal/examiner-settings/index-fallback notices EXACTLY unchanged. D41 unchanged. This is attributable to Marlo, NOT user approval and NOT independent QA closure. Supersedes the prior unresolved-conflict disposition, not the preserved historical observations.
- Tests/docs only; app.js, elig-clock.js, index.html and sw.js bytes unchanged; no new runtime change or version bump (development remains **cc-proto-v7.8.0, unreleased**). No browser/screenshot-producing scripts run, so no historical screenshot outputs touched. No canonical PM or frozen-tree writes, no external messages or publication. **Hold rc7 freeze until exact rc6 QA verdict.** Fresh evidence: /tmp/t5/dev-20261107-parity-followup/.
- Refreshed only the owned tests/next-pass/reference.py to the verified canonical v2.4 test/reference corpus (including P52–P65); previous local copy backed up in fresh scratch. Local reference **142/142 PASS** and corrected parity again **32/32 / zero gaps**. This is test-reference alignment, not a runtime change. Frozen rc6's reference was not edited.


### D44 / QA-099 next local pass — Nov 7, 2026, 3:08 PM ET (UNRELEASED; not frozen)
- Marlo D44 logged append-only in /workspace/checkride-pm/product-decisions.md:109. Dev SW **cc-proto-v7.9.0**. Raw native prep text validated with ASCII max-two-place grammar before coercion, 0.1–24 bounds; integer hundredths sums. Trailing zeros count; exponent/sign/trailing dot invalid. Already-coerced numeric 3 cannot reveal former 2.9999999999999999 text. QA-100 boolean exclusion and persistence retained. Invalid-only fails + OPTIONAL CFI; truly blank missing; warn never block.
- QA-095 accepted intentional exceptions per Marlo (not user approval/independent QA closure): scoped proto.payments = "Prototype: no real payments."; four mandatory en-dash notices EXACTLY unchanged. D41 and font bytes unchanged. Existing hours_invalid/ignored copy unchanged; clarity does not explicitly describe precision. QA-089 parked stress-only.
- Actual read-only canonical v2.5 source implements cap, owned rc7 reference aligned except provenance header. **142/142 actual self-tests, not relayed169; P66–P92 absent in inspected file.** Current actual parity39 cases+3 nonfinite checks and3000 random cases green; boolean32 zero gaps; boundary19; native Chromium precision27 + savedboolean26 assertions; static scope16. Full evidence and caveats: tests/rc7/README.md and evidence/.
- Preserve initial23-pass CDP fixture route-reset timeout; corrected fixture rerun27/27. Old rc6 >2-place expectations intentionally superseded, not silently counted. Fresh screenshots only under v4-rc7, corrected run separated; inherited SH/OUT variables audited before execution.
- **NOT READY / no rc7 freeze**: Firefox/Playwright/axe/historical temporary harness dependencies unavailable; no downloads. Portable Firefox definition added but UNRUN, full legacy/SW/axe regressions not rerun. Previously available temp dependencies/evidence disappeared during pass, cause unknown; no deletion by task. Canonical169 corpus discrepancy also needs reconciliation. No broad all-green claim. Exact frozen rc6 GO at qa-report-20261107-1457.md verified; it does not certify devv7.9.0.
- Existing frozen rc3–6 manifests PASS; 12-tree/477-file NEW inventory captured read-only (not pretending to replace missing earlier baseline). No frozen/live/demo writes, no rc7 folder, no remote/cloud/upload/repo operations, no external messages or publishing. Only authorized PM change is append-only D44; eligibility rules/reference untouched.
- Proposed, not implemented: onboarding goal continuity; clearer fictional per-examiner waitlist state; local grouped digest preview. After eventual validated freeze, stop eligibility hardening.


### rc7 tool recovery and completed acceptance — Nov 7, 2026, 3:22 PM ET
- Supersedes earlier missing-tools/canonical-corpus blockers, preserves their history. box-doctor11/11; standard persistent npm Playwright1.65/axe4.14 + official Chromium/Firefox browser installer recovered local dependencies. No runtime asset changes during recovery: dev remains cc-proto-v7.9.0.
- Canonical read-only v2.5 now verified P66–P98/current SHA256 c148833dcc67f64faab8ca9f7aa4302d4ce1a75ab9ae52289b51fe1d6ecfbbf3, actual175/175; owned reference refreshed,175/175. Owner discrepancy RESOLVED, no action. Parity45+3 nonfinite,random3000,boolean32 zero gaps,boundary19 green.
- Final browser303/303: actual native typing/paste/ARIA/persistence/excess-precision optional checked+unchecked Send129, saved booleans/notice94, normal SW upgrade/offline/root/subpath/legacy72, settled pages8. Gate3/scope16 green. No broad historical test total invented.
- Preserved fixture failures: initial PWA unpersisted state, unsupported KRDU picker option, and70/72 premature async waitForFunction assertions. Verified installed Playwright poll does not await an async predicate; corrected owned harness to await Node-side page.evaluate polling. Final72/72 with actual settled single cache. No app/SW patch to hide timing observations; axe also measured after settled fonts/render. Detailed counts/caveats/failure logs and tool recovery in tests/rc7/README.md, QA-HANDOFF-RC7.md, evidence/recovery-1510/.
- QA-099/D44 and QA-100 focused acceptance green; QA-091/096–098 relevant both-browser acceptance green. QA-095 accepted intentional exceptions per Marlo, not independent QA closure; proto.payments canonical text only authorized top notice/footer, four mandatory notices exact, D41 unchanged. QA-089 remains parked stress-only; D43 present line104; D44 Marlo line109.
- Prior frozen manifests and12-tree/477-file captured-baseline inventory verified read-only. Freeze only to absent rc7 with cp-a, exact ET READY/checksums/handoff and protected screenshot inventory. Independent exact rc7 QA GO still required; no live/demo release/publishing/messages. STOP further eligibility hardening after freeze. No onboarding/digest/waitlist backlog implemented; proposals only in handoff.
