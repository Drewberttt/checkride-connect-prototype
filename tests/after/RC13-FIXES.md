# RC13-I01 / RC13-I02 fixes (rc14)

## RC13-I01 — `#/after/pass` horizontal overflow

**Primary (QA named):** `.after-page .btn` / `.after-card .btn` — `white-space: normal; max-width: 100%; width: 100%; line-height: 1.35; text-align: center; min-height: 44px; height: auto; overflow-wrap: anywhere`. Copy unchanged.

**Also changed (overflow audit at 320/360/390/768 Cr+Fx):**
1. `.after-entry-actions .btn` — same wrap/min-height treatment.
2. `@media (max-width: 420px)` `.page .btn.ghost|secondary` — wraps long CTAs (Firefox 320 `#/alerts` “Also show browser notifications…”).
3. `.fr-cards` / `.fr-card` — `max-width: 100%; box-sizing: border-box; grid-template-columns: auto minmax(0,1fr)` (320 onboarding cards).
4. `.tabbar .badge` — `max-width: 2.5rem; overflow: hidden; text-overflow: ellipsis` plus **app.js** nav render: badge is the **5th** NAV tuple (count), not the 4th (path prefixes) — path arrays were rendering as chip text and expanding scrollWidth.

**Test:** `tests/after/overflow-audit.js` — scrollWidth ≤ clientWidth on all static routes incl. `#/after/pass|inc|dis` at 320/360/390/768 Cr+Fx.

## RC13-I02 — INVENTORY self-hash

`tests/rc10/freeze-tree.sh`: inventory **never** lists `INVENTORY-SHA256.json`; post-write verify fails freeze unless SOURCE, INVENTORY, and MD5SUMS each verify 100% (no self-entries).
