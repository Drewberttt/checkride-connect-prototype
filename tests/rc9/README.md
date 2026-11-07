> CURRENT RC9 STATUS: independent rc8 GO and parent continuation are now supplied. Historical closed gate below is superseded. Current v7.13 candidate, D45 authority, exact tests/copy and snapshot scope: QA-HANDOFF-RC9.md (root). READY in frozen rc9 gives exact freeze identity; no publishing.

# Local digest preview regression

Current authoritative scope/counts/limits/gate: ../../QA-HANDOFF-DEV-DIGEST.md.
SW7.12 dev only; rc9 freeze gate CLOSED pending independent rc8 verdict and parent continuation. Not a new user-approval requirement.

- digest.js: real browsers, actual existing app fixtures plus explicitly controlled fictional fixture clones, keyboard/link/axe checks.
- focused-features.js: adapter of prior rc8 main; intentional second digest membership rendering checked separately. Prior source unchanged.
- pwa-digest.js + upgrade-server.py: rc8 read-only→dev upgrade at dedicated127.0.0.1:8040, both root/subpath; fresh browser contexts, offline digest and focused prior features.
- Existing rc8 evidence-defaults, signup-accessibility and raw-hours suites rerun unchanged, with fresh explicit output variables.

Every run requires NEW absolute OUT and SHOTS paths; never reuse paths.json (a record only), evidence/ or historical directories as output. Persistent Playwright/axe dependencies are at /workspace/checkride-test-tools/node_modules. Regular local dev server is127.0.0.1:8020. Dedicated upgrade server was stopped; restart only for a fresh explicit test run. No external runtime requests, credentials, delivery or scheduling.

Copy keys: COPY-CHANGES.json. Final actual assertions and integrity: evidence/verification.json. Preliminary failed fixture assertions, corrected final runs and output-path audit all retained.352 final browser assertions; scope17/gate3. No historical totals invented and no full historical suite claimed.
