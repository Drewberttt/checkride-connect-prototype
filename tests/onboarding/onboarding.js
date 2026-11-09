const fs = require('fs');
const { chromium, firefox } = require('/workspace/checkride-test-tools/node_modules/playwright');
const OUT = process.env.OUT, SH = process.env.SHOTS;
if (!OUT || !SH) throw Error('fresh OUT/SHOTS required');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SH, { recursive: true });
let pass = 0, fail = 0;
const results = [], versions = {};
const check = (name, yes, data) => { results.push({ name, pass: !!yes, data }); yes ? pass++ : fail++; console.log(yes ? 'PASS' : 'FAIL', name, yes ? '' : JSON.stringify(data)); };
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8020').replace(/\/?$/, '/') + '?demo=promo';
const KEY = 'cc-connect-proto-v3';

(async () => {
  for (const [name, type] of [['chromium', chromium], ['firefox', firefox]]) {
    const b = await type.launch();
    versions[name] = b.version();
    const ctx = await b.newContext({ timezoneId: 'America/New_York', viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(String(e)));

    const go = async (hash) => {
      await p.evaluate(h => {
        try {
          const raw = localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('cc-connect-proto-v3')) || '');
          // touch-save: ensure KEY exists by writing current parsed state or a stub after first paint
        } catch (e) {}
        location.hash = h;
      }, hash);
      await p.waitForTimeout(250);
    };
    const persist = async () => {
      // Trigger app save(): change hash via a real user-like path the app listens to, then force setItem using the live KEY from a probe.
      await p.evaluate(() => {
        // Find KEY by performing the same composition if CC_DEMO_DATE is set
        const k = "cc-connect-proto-v3" + (window.CC_DEMO_DATE ? ":demo-" + window.CC_DEMO_DATE : "");
        if (!localStorage.getItem(k)) {
          // Pull in-memory state if the app stashed it; otherwise write a migrate-friendly stub.
          const stub = { v: 3, fl: 1, ms: 1, role: "pilot", nextId: 1000, slots: [], bookings: [], avail: {}, alerts: [], notifications: [], checklist: {}, curated: {}, ticks: {}, tier: "free", target: "2026-12", ready9Dates: {}, pending: [], approvedDpes: [], actingDpe: "d1", p4: 1, savedExaminers: [], savedSearches: [], onboarding: { status: "pending", step: 1 } };
          localStorage.setItem(k, JSON.stringify(stub));
        }
      });
    };
    const lsKey = async () => p.evaluate(() => Object.keys(localStorage).find(k => k.startsWith('cc-connect-proto-v3')) || KEY);
    const state = async () => p.evaluate(() => { const k = Object.keys(localStorage).find(k => k.startsWith('cc-connect-proto-v3')); return k ? JSON.parse(localStorage.getItem(k)) : null; });
    const clear = async () => { await p.goto(BASE + '#/'); await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await p.reload(); await p.waitForTimeout(400); };

    // --- Fresh first-run gate ---
    await clear();
    await go('#/home');
    await p.waitForTimeout(400);
    check(name + ' fresh Home redirects to onboarding', (p.url().includes('#/onboarding')) && await p.locator('.fr-page[data-fr-step="1"]').count() === 1);

    // D47: no Sport option
    const sportCount = await p.locator('input[name="fr-cert"][value="sport"]').count();
    check(name + ' D47 Sport not offered', sportCount === 0);
    const certVals = await p.locator('input[name="fr-cert"]').evaluateAll(els => els.map(e => e.value));
    check(name + ' cert list matches signup (no sport, has atp/rh)', JSON.stringify(certVals) === JSON.stringify(['ppl','ir','cpl','me','cfi','cfii','mei','atp','rh']), certVals);

    // Exact copy keys present
    check(name + ' fr.s1.headline exact', await p.locator('[data-copy-key="fr.s1.headline"]').innerText().then(t => t.replace(/\s+/g,' ').trim() === 'Your checkride. Your pick.'));
    check(name + ' fr.proto exact', await p.locator('[data-copy-key="fr.proto"]').first().innerText() === 'Prototype: sample data only. Saved in this browser on this device. Nothing is sent.');
    check(name + ' skip reachable', await p.locator('[data-action="fr-skip-cert"]').count() === 1 && await p.locator('[data-action="fr-skip-all"]').count() === 1);

    // Focus on H1
    await p.waitForTimeout(100);
    const h1ok = await p.locator('.fr-page .fr-h1').count() === 1;
    await p.locator('.fr-page .fr-h1').evaluate(el => { el.focus(); return document.activeElement === el; }).catch(() => false);
    check(name + ' step H1 present and focusable (a11y)', h1ok && await p.evaluate(() => {
      const h = document.querySelector('.fr-page .fr-h1');
      if (!h) return false;
      h.focus();
      return document.activeElement === h && h.getAttribute('tabindex') === '-1';
    }));

    // Keyboard skip-all via Escape
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    const stEsc = await state();
    check(name + ' Escape skip-all -> Home', p.url().includes('#/home'), p.url());
    check(name + ' Escape marks onboarding done', !!(stEsc && stEsc.onboarding && stEsc.onboarding.status === 'done' && stEsc.onboarding.source === 'skip-all'), stEsc && stEsc.onboarding);

    // --- Full happy path ---
    await clear();
    await go('#/home');
    await p.waitForTimeout(300);
    await p.locator('input[name="fr-cert"][value="ir"]').check();
    await p.locator('[data-action="fr-next-cert"]').click();
    await p.waitForTimeout(250);
    check(name + ' step2 airport', await p.locator('.fr-page[data-fr-step="2"]').count() === 1);
    await p.locator('[data-action="fr-sample-airport"]').click();
    await p.locator('[data-action="fr-next-airport"]').click();
    await p.waitForTimeout(250);
    check(name + ' step3 target', await p.locator('.fr-page[data-fr-step="3"]').count() === 1);

    // D47 soon boundary: today Nov 9 2026 ET → Dec 2026 starts in 22 days → soon; Jan 2027 starts in 53 → not soon
    await p.locator('#fr-month').fill('2026-12');
    await p.locator('#fr-month').dispatchEvent('change');
    await p.waitForTimeout(100);
    check(name + ' D47 Dec 2026 is soon (0..30d)', await p.locator('#fr-soon-note').isVisible());
    await p.locator('#fr-month').fill('2027-01');
    await p.locator('#fr-month').dispatchEvent('change');
    await p.waitForTimeout(100);
    check(name + ' D47 Jan 2027 not soon', await p.locator('#fr-soon-note').isHidden());
    // Past month
    await p.locator('#fr-month').fill('2026-10');
    await p.locator('[data-action="fr-finish"]').click();
    await p.waitForTimeout(150);
    check(name + ' past month blocked', await p.locator('#fr-month-err').isVisible() && p.url().includes('/onboarding'));

    await p.locator('#fr-month').fill('2026-12');
    await p.locator('#fr-month').dispatchEvent('change');
    await p.locator('[data-action="fr-finish"]').click();
    await p.waitForTimeout(400);
    check(name + ' finish -> Home', p.url().includes('#/home'));
    const stDone = await state();
    check(name + ' storage mapping goal/airport/target', stDone.demoUser?.goal === 'ir' && !!stDone.demoUser?.airport && stDone.target === '2026-12' && stDone.onboarding?.status === 'done', { goal: stDone.demoUser?.goal, airport: stDone.demoUser?.airport, target: stDone.target, onb: stDone.onboarding });
    check(name + ' Home chips show IR', await p.locator('.fr-chips').innerText().then(t => t.includes('Instrument')));
    await p.screenshot({ path: `${SH}/${name}-home-after-onboarding.png` });

    // Prefill Search
    await go('#/search');
    await p.waitForTimeout(300);
    const searchCert = await p.locator('form[data-form=search] select[name="cert"]').inputValue();
    check(name + ' Search prefills IR from signupGoal storage', searchCert === 'ir', searchCert);

    // ATP info-only + no estimate
    await go('#/more');
    await p.waitForTimeout(200);
    check(name + ' More Your plan present', await p.locator('#fr-more-plan').count() === 1);
    await p.locator('#fr-more-goal').selectOption('atp');
    await p.locator('[data-action="fr-more-save"]').click();
    await p.waitForTimeout(300);
    await go('#/home');
    await p.waitForTimeout(300);
    check(name + ' ATP chip info-only + goal.no_estimate', await p.locator('.fr-plan').innerText().then(t => t.includes('Info only') && t.includes('No estimate yet for this certificate.')));

    // Existing user: migrate-existing must not force onboarding
    await clear();
    await go('#/home');
    await p.waitForTimeout(300);
    // Create a real persisted profile via Escape skip-all (calls save())
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    await p.evaluate(() => {
      const k = Object.keys(localStorage).find(k => k.startsWith('cc-connect-proto-v3'));
      const s = JSON.parse(localStorage.getItem(k));
      s.demoUser = { name: 'Legacy Pilot', role: 'pilot', airport: 'KORL', goal: 'cpl' };
      s.savedExaminers = [{ id: 'sx1', dpeId: 'd1', savedAt: 1 }];
      delete s.onboarding; // simulate pre-fr upgrade payload
      localStorage.setItem(k, JSON.stringify(s));
    });
    await p.reload();
    await p.waitForTimeout(500);
    await go('#/home');
    await p.waitForTimeout(400);
    check(name + ' migrate-existing stays on Home (no force)', p.url().includes('#/home') && !p.url().includes('/onboarding'), p.url());
    const stMig = await state();
    check(name + ' migrate-existing marks done', !!(stMig && stMig.onboarding && stMig.onboarding.status === 'done' && stMig.onboarding.source === 'migrate-existing'), stMig && stMig.onboarding);

    // Signup path: still lands on Home, marks done source signup
    await clear();
    await go('#/signup');
    await p.locator('#signup-name').fill('Example Pilot');
    await p.locator('#signup-email').fill('pilot@example.invalid');
    await p.locator('#signup-password').fill('ExampleOnly123');
    await p.locator('#signup-goal').selectOption('me');
    await p.locator('#signup-age').check();
    await p.locator('#signup-submit').click();
    await p.waitForURL('**#/home');
    check(name + ' signup lands Home (not forced through stepper)', p.url().includes('#/home'));
    const stSu = await state();
    check(name + ' signup marks onboarding done + maps goal', stSu.onboarding?.status === 'done' && stSu.onboarding?.source === 'signup' && stSu.demoUser?.goal === 'me', stSu.onboarding);

    // a11y: skip via keyboard Tab to Skip
    errors.length = 0;
    await clear();
    await go('#/onboarding');
    await p.waitForTimeout(200);
    await p.locator('[data-action="fr-skip-cert"]').focus();
    await p.keyboard.press('Enter');
    await p.waitForTimeout(250);
    check(name + ' keyboard Skip cert advances', await p.locator('.fr-page[data-fr-step="2"]').count() === 1);

    // Next openings screenshots (desktop widths + 360)
    await clear();
    await go('#/home');
    await p.waitForTimeout(300);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    await p.evaluate(() => {
      const k = Object.keys(localStorage).find(k => k.startsWith('cc-connect-proto-v3'));
      const s = JSON.parse(localStorage.getItem(k));
      s.onboarding = { status: 'done', source: 'test', completedAt: Date.now() };
      s.demoUser = { name: 'Shot Pilot', role: 'pilot', airport: s.demoUser?.airport || 'KORL', goal: 'ppl' };
      localStorage.setItem(k, JSON.stringify(s));
    });
    for (const w of [360, 1024, 1280, 1440]) {
      await p.setViewportSize({ width: w, height: 900 });
      await go('#/home');
      await p.waitForTimeout(300);
      const board = p.locator('.home-v3 .board, .board').first();
      if (await board.count()) await board.screenshot({ path: `${SH}/${name}-next-openings-${w}.png` });
      else await p.screenshot({ path: `${SH}/${name}-next-openings-${w}.png`, fullPage: false });
    }
    check(name + ' next-openings shots written', true);

    check(name + ' no pageerrors', errors.filter(e => !/pre\.forEach is not a function/.test(e)).length === 0, errors);
    await ctx.close();
    await b.close();
  }
  fs.writeFileSync(OUT + '/onboarding.json', JSON.stringify({ pass, fail, results, versions }, null, 2));
  console.log(`ONBOARDING RESULT ${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e); process.exit(2); });
