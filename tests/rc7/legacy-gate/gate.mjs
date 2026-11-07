// Pre-run gate (runs FIRST in run-all.sh; a failure aborts the run).
//   G01  node --check app.js and sw.js           -> smoke-checklist G01
//   G02  every sw.js precache (SHELL) URL is 200  -> smoke-checklist G02
//   G03  airport tz data: every airport has a valid IANA tz; AZ = America/Phoenix (D38 #3) -> smoke-checklist G03
// Usage: node gate.mjs   (exit 0 = pass, 1 = syntax error, 2 = precache miss, 3 = server down, 4 = airport tz data)
// Only 1 and 3 abort run-all.sh; 2 and 4 fail the run but the suites still run.  ONLY=G03 node gate.mjs runs just G03.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { BASE, save } from './common.mjs';
import { loadData, isIana, tzOf, looksArizona, stateOf, REF_TZ } from './tz.mjs';
const want = (id) => !process.env.ONLY || process.env.ONLY.split(',').some((o) => id.startsWith(o));
const APP = process.env.CC_APP || '/workspace/checkride-connect';
const results = []; let rc = 0;
const rec = (id, name, pass, notes) => { results.push({ id, name, pass, notes }); console.log(pass ? 'PASS' : 'FAIL', id, name, pass ? '' : notes.filter((n) => n.startsWith('FAIL')).join(' ; ')); };

// G01 syntax gate
if (want('G01')) {
  const notes = [];
  for (const f of ['app.js', 'sw.js']) {
    try { execFileSync(process.execPath, ['--check', path.join(APP, f)], { stdio: 'pipe' }); notes.push(`ok: node --check ${f}`); }
    catch (e) { notes.push(`FAIL node --check ${f}: ` + String(e.stderr || e.message).split('\n').slice(0, 5).join(' | ')); }
  }
  const pass = notes.every((n) => n.startsWith('ok')); rec('G01-syntax', 'node --check app.js and sw.js', pass, notes);
  if (!pass) rc = 1;
}

// G02 precache URLs
if (!rc && want('G02')) {
  const notes = [];
  try { const r0 = await fetch(BASE); await r0.arrayBuffer(); } catch (e) { notes.push('FAIL server not reachable at ' + BASE); rec('G02-precache', 'every sw.js precache URL returns 200', false, notes); save('gate.json', { results }); process.exit(3); }
  const sw = fs.readFileSync(path.join(APP, 'sw.js'), 'utf8');
  // Find the array literal that the install handler passes to cache.addAll(...). Prefer `const SHELL = [...]`,
  // else the first array literal containing "index.html".
  const m = sw.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\[[^\]]*\])/g) || [];
  let list = null, varName = '';
  for (const decl of m) { const mm = decl.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\[[^\]]*\])/); if (/index\.html|\.\/|app\.js/.test(mm[2])) { list = mm[2]; varName = mm[1]; break; } }
  if (!list) { notes.push('FAIL could not find the precache array in sw.js'); }
  else {
    const urls = [...list.matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
    notes.push(`precache list ${varName}: ${urls.length} URLs`);
    for (const u of urls) {
      const full = new URL(u, BASE).href;
      try { const r = await fetch(full, { redirect: 'manual', headers: { connection: 'close' } }); await r.arrayBuffer().catch(() => {}); notes.push((r.status === 200 ? 'ok: ' : 'FAIL ') + `${r.status} ${u}`); }
      catch (e) { notes.push(`FAIL fetch error ${u}: ${e.message}`); }
    }
    // also flag font/asset URLs referenced by styles.css that are NOT precached (offline gaps), as info
    try {
      const css = fs.readFileSync(path.join(APP, 'styles.css'), 'utf8');
      const refs = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((x) => x[1]).filter((x) => !/^data:|^https?:/.test(x));
      const missing = refs.filter((x) => !urls.includes(x.replace(/^\.\//, '')));
      if (missing.length) notes.push('info: styles.css url() not in precache: ' + [...new Set(missing)].join(', '));
    } catch (e) { /* no css */ }
  }
  const pass = notes.every((n) => !n.startsWith('FAIL')); rec('G02-precache', 'every sw.js precache URL returns 200', pass, notes);
  if (!pass) rc = 2;
}
// G03 airport tz data (D38 #3). Reads data.js + sample-fl-examiners.js in a Node vm (no browser), the same merge app.js does.
if (rc !== 1 && want('G03')) {
  const notes = []; const d = loadData(APP);
  if (d.error) notes.push('FAIL could not evaluate data: ' + d.error);
  const list = d.allAirports || [];
  notes.push(`${list.length} airports (${d.airports.length} used by the app) from ${d.files.join(' + ')}`);
  if (!list.length) notes.push('FAIL no airports found');
  const missing = list.filter((a) => !tzOf(a)), bad = list.filter((a) => tzOf(a) && !isIana(tzOf(a)));
  notes.push((missing.length ? 'FAIL ' : 'ok: ') + `every airport has a tz field (${missing.length} missing${missing.length ? ': ' + missing.map((a) => a.id).join(', ') : ''})`);
  notes.push((bad.length ? 'FAIL ' : 'ok: ') + `every tz is a valid IANA zone name (${bad.length} invalid${bad.length ? ': ' + bad.map((a) => `${a.id}=${tzOf(a)}`).join(', ') : ''})`);
  const az = list.filter(looksArizona), azBad = az.filter((a) => tzOf(a) !== 'America/Phoenix');
  notes.push(az.length ? ((azBad.length ? 'FAIL ' : 'ok: ') + `Arizona airports use America/Phoenix (no DST): ${az.map((a) => `${a.id}=${tzOf(a) || '(none)'}`).join(', ')}`) : 'info: no Arizona airports in the data yet (rule activates when one lands; detected by state field or lat/lng)');
  const nav = az.filter((a) => a.lat > 35.5 && a.lng > -111.5); if (nav.length) notes.push('info: possible Navajo Nation airport(s) (observe DST, not America/Phoenix) - check by hand: ' + nav.map((a) => a.id).join(', '));
  const ref = list.filter((a) => REF_TZ[a.id] && tzOf(a) && tzOf(a) !== REF_TZ[a.id]);
  notes.push((ref.length ? 'FAIL ' : 'ok: ') + `tz matches the reference zone for known airports (${ref.length ? ref.map((a) => `${a.id}=${tzOf(a)} want ${REF_TZ[a.id]}`).join(', ') : 'none wrong'})`);
  const ct = list.filter((a) => REF_TZ[a.id] === 'America/Chicago' || (stateOf(a) === 'TX'));
  if (ct.length) notes.push(`info: Central-time airports in the data: ${ct.map((a) => `${a.id} (${a.city || ''}) tz=${tzOf(a) || '(none)'}`).join(', ')}`);
  // RC3: El Paso (KELP) is Mountain time (America/Denver), labelled MT; Phoenix labelled MST all year (D39 #2).
  const elp = list.find((a) => a.id === 'KELP'); notes.push(elp ? ((tzOf(elp) === 'America/Denver' ? 'ok: ' : 'FAIL ') + `KELP El Paso tz=${tzOf(elp)} (want America/Denver)`) : 'info: KELP not in the data');
  const appSrc = fs.readFileSync(path.join(APP, 'app.js'), 'utf8'); const za = appSrc.match(/const ZONE_ABBR = (\{[^}]*\})/); let ZA = {}; try { ZA = JSON.parse(za[1]); } catch {}
  notes.push((ZA['America/Phoenix'] === 'MST' ? 'ok: ' : 'FAIL ') + `app ZONE_ABBR America/Phoenix = ${ZA['America/Phoenix']} (want MST)`);
  notes.push((ZA['America/Denver'] === 'MT' ? 'ok: ' : 'FAIL ') + `app ZONE_ABBR America/Denver = ${ZA['America/Denver']} (want generic MT)`);
  const usedZones = [...new Set(list.map(tzOf).filter(Boolean))]; const unl = usedZones.filter((z) => !ZA[z]); notes.push((unl.length ? 'FAIL ' : 'ok: ') + `every zone in the data has an app label (${unl.length ? 'missing: ' + unl.join(', ') : usedZones.join(', ')})`);
  const byState = {}; for (const a of list) { const k = (a.state || '?') + ' ' + (tzOf(a) || '(none)'); byState[k] = (byState[k] || 0) + 1; } notes.push('info: state/zone ' + JSON.stringify(byState));
  const zones = {}; for (const a of list) { const z = tzOf(a) || '(none)'; zones[z] = (zones[z] || 0) + 1; } notes.push('info: zones ' + JSON.stringify(zones));
  const pass = notes.every((n) => !n.startsWith('FAIL')); rec('G03-airport-tz', 'every airport has an IANA tz; AZ = America/Phoenix (D38 #3)', pass, notes);
  if (!pass && !rc) rc = 4;
}
save('gate.json', { when: new Date().toISOString(), results });
process.exit(rc);
