// Airport time-zone helpers shared by gate.mjs (G03) and v3.mjs (V06/V07/V11/V13). product-decisions D38 #1/#3.
// D38 #1: times are shown in the AIRPORT's zone with a zone label, e.g. "9:00 AM CT, at KAUS".
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Generic US zone labels (D38 example uses "CT"). Phoenix = "MST" only (D39 #2).
export const ZONE_ABBR = {
  'America/New_York': 'ET', 'America/Detroit': 'ET', 'America/Indiana/Indianapolis': 'ET', 'America/Kentucky/Louisville': 'ET',
  'America/Chicago': 'CT', 'America/Indiana/Knox': 'CT', 'America/Menominee': 'CT',
  'America/Denver': 'MT', 'America/Boise': 'MT', 'America/Phoenix': 'MST',
  'America/Los_Angeles': 'PT', 'America/Anchorage': 'AKT', 'Pacific/Honolulu': 'HT', 'America/Puerto_Rico': 'AT',
};
export const ZONE_ALT = {}; // D39 #2: Phoenix is labelled MST only (no MT alternative)
export const zoneLabels = (tz) => ZONE_ALT[tz] || [ZONE_ABBR[tz] || (new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortGeneric' }).formatToParts(0).find((p) => p.type === 'timeZoneName') || {}).value];
export const isIana = (tz) => { if (typeof tz !== 'string' || !/^[A-Za-z_]+\/[A-Za-z_\/+-]+$/.test(tz)) return false; try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; } };

// "Mon, Nov 9" and "Mon, Nov 9 · 2:00 PM" in a zone (app format: weekday short, month short, day, " · ", h:mm AM).
export const fmtDate = (ms, tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(ms);
export const fmtTime = (ms, tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(ms).replace(/\u202f/g, ' ');
export const fmtWhen = (ms, tz) => `${fmtDate(ms, tz)} · ${fmtTime(ms, tz)}`;
// wall clock time in tz -> UTC ms
export function wallToUtc(y, mo, d, h, mi, tz) {
  const off = (t) => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(t).map((x) => [x.type, x.value])); return Date.UTC(+p.year, p.month - 1, +p.day, +p.hour, +p.minute) - t; };
  const guess = Date.UTC(y, mo, d, h, mi); return guess - off(guess - off(guess));
}
export const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
// Parse "Fri, Dec 4 · 9:00 AM" (no year) as a wall time in tz, choosing the first occurrence at/after `after`.
export function parseWhen(s, tz, after) {
  const m = String(s).match(/([A-Z][a-z]{2}) (\d{1,2}) · (\d{1,2}):(\d{2}) ([AP])M/); if (!m) return NaN;
  const h = (+m[3] % 12) + (m[5] === 'P' ? 12 : 0); const yr = new Date(after).getUTCFullYear();
  let t = wallToUtc(yr, MON[m[1]], +m[2], h, +m[4], tz); if (t < after - 864e5) t = wallToUtc(yr + 1, MON[m[1]], +m[2], h, +m[4], tz); return t;
}
// A slot time as D38 #1 wants it: "<Ddd, Mmm d · h:mm AM> <ZONE>, at <ICAO>". Captures date/time, zone label, airport.
export const WHEN_D38 = /([A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2} · \d{1,2}:\d{2} [AP]M) ([A-Z]{2,4}), at (K[A-Z0-9]{3})\b/;
// Loose: any labelled time, old ("9:00 AM Eastern at KORL") or new; used to locate the slot in a string even before the rebuild.
export const WHEN_ANY = /([A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2} · \d{1,2}:\d{2} [AP]M) ([A-Za-z]{2,8})(?:,)? at (K[A-Z0-9]{3})\b/;
// Split layout (request page header, mockup 05): "Wed, Nov 11 · 8:00 AM ET" on one line, "KSFB · examiner travels from KORL" on the next.
export const WHEN_SPLIT = /([A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2} · \d{1,2}:\d{2} [AP]M) ([A-Z]{2,4})\s+(K[A-Z0-9]{3})\b/;

// Airports as the app sees them: data.js airports, replaced by sample-fl-examiners.js airports when that is a superset (app.js L9-16).
export function loadData(APP) {
  const win = {}; const ctx = vm.createContext({ window: win, console: { log() {}, warn() {}, error() {} } });
  const out = { files: [] };
  for (const f of ['data.js', 'sample-fl-examiners.js', 'sample-tx-examiners.js', 'sample-ca-examiners.js', 'sample-az-examiners.js']) {
    const p = path.join(APP, f); if (!fs.existsSync(p)) continue;
    try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f, timeout: 5000 }); out.files.push(f); } catch (e) { out.error = `${f}: ${e.message}`; }
  }
  const D = win.CC_DATA || {}; const FL = win.CC_SAMPLE_FL || {};
  const base = Array.isArray(D.airports) ? D.airports : []; const fl = Array.isArray(FL.airports) ? FL.airports : [];
  out.airports = fl.length && base.every((a) => fl.some((b) => b.id === a.id)) ? fl : base;
  out.allAirports = [...base, ...fl.filter((a) => !base.some((b) => b.id === a.id))];
  // RC3 (multi-state): TX/CA/AZ sets are appended with state = region.short and tz = airport.tz || D.airportTz (app.js L18-27).
  base.forEach((a) => { if (!a.state) a.state = 'FL'; }); fl.forEach((a) => { if (!a.state) a.state = 'FL'; });
  out.multi = [];
  for (const X of [win.CC_SAMPLE_TX, win.CC_SAMPLE_CA, win.CC_SAMPLE_AZ]) {
    if (!X || !X.fictional || !Array.isArray(X.dpes) || !X.region) continue;
    const st = X.region.short;
    for (const a of X.airports || []) if (!out.allAirports.some((b) => b.id === a.id)) { const n = { ...a, state: st, tz: a.tz || (D.airportTz && D.airportTz[a.id]) || undefined }; out.allAirports.push(n); out.airports.push(n); }
    out.multi.push(...X.dpes);
  }
  out.dpes = [...(D.dpes || []), ...((FL.fictional && FL.dpes) || []).filter((d) => !(D.dpes || []).some((x) => x.id === d.id)), ...out.multi];
  return out;
}
// Arizona: by a state field if the data has one, else by lat/lng box (AZ ~31.33-37.0 N, 109.05-114.82 W).
export const stateOf = (a) => a.state || a.st || (a.region && typeof a.region === 'string' ? a.region : '') || '';
export const looksArizona = (a) => /^(AZ|Arizona)$/i.test(stateOf(a)) || (typeof a.lat === 'number' && typeof a.lng === 'number' && a.lat >= 31.3 && a.lat <= 37.01 && a.lng <= -109.04 && a.lng >= -114.82);
export const tzOf = (a) => a && (a.tz || a.timeZone || a.timezone || a.iana);
// Reference zones for airports in the sample data that are NOT Eastern, plus likely TX/CA/AZ additions. Used (a) by G03 to
// cross-check the data's tz field and (b) by v3 as the expected zone when the data has no tz field yet.
// Florida panhandle west of the Apalachicola River is Central time (KPNS Pensacola, KECP Panama City are in the sample data).
export const REF_TZ = {
  KPNS: 'America/Chicago', KECP: 'America/Chicago', KVPS: 'America/Chicago', KDTS: 'America/Chicago', KNPA: 'America/Chicago',
  KTLH: 'America/New_York', KORL: 'America/New_York', KTPA: 'America/New_York', KMIA: 'America/New_York', KJAX: 'America/New_York',
  KAUS: 'America/Chicago', KDFW: 'America/Chicago', KHOU: 'America/Chicago', KIAH: 'America/Chicago', KSAT: 'America/Chicago', KADS: 'America/Chicago', KGTU: 'America/Chicago', KELP: 'America/Denver',
  KPHX: 'America/Phoenix', KTUS: 'America/Phoenix', KFFZ: 'America/Phoenix', KDVT: 'America/Phoenix', KSDL: 'America/Phoenix', KCHD: 'America/Phoenix', KPRC: 'America/Phoenix', KGCN: 'America/Phoenix', KIWA: 'America/Phoenix', KGEU: 'America/Phoenix',
  KLAX: 'America/Los_Angeles', KSAN: 'America/Los_Angeles', KSNA: 'America/Los_Angeles', KVNY: 'America/Los_Angeles', KSJC: 'America/Los_Angeles', KPAO: 'America/Los_Angeles', KOAK: 'America/Los_Angeles', KCRQ: 'America/Los_Angeles',
};
// Fallback when an airport has no tz field: reference table, else Florida panhandle rule, else the env default.
export const expectedTz = (a, dflt = 'America/New_York') => tzOf(a) || (a && REF_TZ[a.id]) || (a && typeof a.lng === 'number' && a.lng < -85.0 && a.lat > 29.5 && a.lat < 31.1 && a.lng > -87.7 ? 'America/Chicago' : dflt);
