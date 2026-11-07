// Shared config for the Checkride Connect QA harness.
import { chromium, firefox, webkit } from '/workspace/checkride-test-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const QA = path.resolve(HERE, '..');
export const SHOTS = process.env.SHOTS;
export const OUT = process.env.OUT;if(!OUT||!SHOTS)throw Error('explicit fresh outputs required');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
// Target app URL. BASE_URL (preferred) or CC_BASE; default is the live folder on 8002. Always ends with '/'.
export const BASE = ((process.env.BASE_URL || process.env.CC_BASE || 'http://localhost:8002/').replace(/\/?$/, '/'));
export const BROWSERS = { chromium, firefox, webkit };
export const VIEWPORTS = {
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, hasTouch: true },
  desktop: { width: 1440, height: 900 },
};
// role -> routes to visit (hash routes)
export const ROUTES = {
  pilot: ['#/', '#/search', '#/search?cert=ir&near=KTPA&radius=250&sort=fee', '#/dpe/d1?cert=ppl', '#/compare', '#/alerts', '#/checklists', '#/checklists/ir', '#/bookings', '#/my-checklists', '#/pricing', '#/no-such-route'],
  dpe: ['#/dpe-dashboard', '#/dpe-openings', '#/dpe-fees', '#/dpe/d1', '#/dpe-checklist/b1'],
  school: ['#/school', '#/school/cohort'],
  admin: ['#/admin'],
};
export const slug = (s) => s.replace(/^#\//, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
export async function launch(name) {
  try { return await BROWSERS[name].launch(); } catch (e) { return { error: e.message.split('\n').slice(0, 12).join(' ') }; }
}
// Attach console/pageerror/failed-request collectors to a page.
export function collect(page, sink, ctx) {
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') sink.push({ ...ctx(), kind: 'console.' + m.type(), text: m.text().slice(0, 300) }); });
  page.on('pageerror', (e) => sink.push({ ...ctx(), kind: 'pageerror', text: String(e.message).slice(0, 300) }));
  page.on('requestfailed', (r) => sink.push({ ...ctx(), kind: 'requestfailed', text: r.url() + ' ' + (r.failure()?.errorText || '') }));
  page.on('response', (r) => { if (r.status() >= 400) sink.push({ ...ctx(), kind: 'http' + r.status(), text: r.url() }); });
}
export async function setRole(page, role) {
  // v3: the landing page (#/) hides the View-as select (marketing header), so switch roles from #/home where it is visible.
  await page.goto(BASE + '#/home', { waitUntil: 'load' });
  await page.waitForSelector('#role-select', { state: 'visible' });
  if ((await page.inputValue('#role-select')) !== role) { await page.selectOption('#role-select', role); await page.waitForTimeout(300); }
}
export async function visit(page, hash) {
  await page.goto('about:blank');
  await page.goto(BASE + hash, { waitUntil: 'load' });
  await page.waitForTimeout(900);
}
export const save = (name, data) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
