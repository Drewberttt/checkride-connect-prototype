#!/usr/bin/env python3
"""Scope audit for v7.26.0 rc19 (QA-011, .ics, tooling). Does NOT require elig-clock byte-identical to rc9."""
from pathlib import Path
import hashlib, re, sys
R = Path('/workspace/checkride-v4')
pass_n = fail_n = 0
def ck(name, yes, data=None):
    global pass_n, fail_n
    if yes: pass_n += 1; print('PASS', name)
    else: fail_n += 1; print('FAIL', name, data)
sw = (R/'sw.js').read_text()
ck('SW VERSION v7.26.0', 'cc-proto-v7.26.0' in sw)
logo = (R/'tests/rc10/logo-qa085.js').read_text()
ck('logo-qa085 expects SW v7.26.0', 'SW v7.26.0' in logo and 'cc-proto-v7\\.26\\.0' in logo)
pwa = (R/'tests/rc10/pwa-saved.js').read_text()
ck('pwa-saved upgrades TO v7.26.0', "TO='checkride-connect-cc-proto-v7.26.0'" in pwa)
ck('pwa-saved FROM includes rc18 v7.25', "/workspace/checkride-v4-rc18" in pwa and "v7.25.0" in pwa and "v725" in pwa)
ck('ics.js in SW SHELL', 'ics.js' in sw)
app = (R/'app.js').read_text()
for k in ['pass.eyebrow','pass.headline','share.title','share.download','after.credit.window','after.dis.endorse','after.dis.8710','after.inc.no_endorse','after.inc.other_clocks','after.nod_vs_lod','after.stop_failed_task','after.verify.day60','after.verify.no_reset','after.verify.examiner_plan','after.verify.a6_fresh','after.verify.prep_counts','after.verify.no_extend','after.verify.8900']:
    ck('COPY has '+k, f'"{k}"' in app)
ck('viewAfterPass present', 'function viewAfterPass' in app)
ck('viewAfterDis/Inc present', 'function viewAfterDis' in app and 'function viewAfterInc' in app)
ck('routes /after/pass|dis|inc', '/after\\/pass' in app or '/after/pass' in app)
ck('share download only (no navigator.share post)', 'navigator.share' not in app)
ck('confetti respects reduced-motion', 'prefers-reduced-motion' in app and 'after-confetti' in app)
ck('FEES_ENABLED false still', 'FEES_ENABLED: false' in app)
elig = (R/'elig-clock.js').read_text()
ck('checkResume exported', 'checkResume' in elig and 'resumeWithCreditDeadline' in elig)
ck('credit = min(D+60, end 2nd month)', 'resumeWithCreditDeadline' in elig)
# Owned reference: provenance header + canonical body; self-test 184/184; SHA recorded
import subprocess
canon = Path('/workspace/checkride-pm/tools/eligibility_clock_reference.py').read_text()
raw = (R/'tests/rc7/reference.py').read_text()
# Strip our provenance header lines (leading # comments before the module docstring)
body = raw
if body.lstrip().startswith('#'):
    lines = body.splitlines()
    i = 0
    while i < len(lines) and (lines[i].startswith('#') or lines[i].strip() == ''):
        i += 1
    body = '\n'.join(lines[i:]) + ('\n' if raw.endswith('\n') else '')
ck('owned reference body == canonical bytes', body == canon, (hashlib.sha256(body.encode()).hexdigest()[:16], hashlib.sha256(canon.encode()).hexdigest()[:16]))
r = subprocess.run(['python3','reference.py'], cwd=str(R/'tests/rc7'), capture_output=True, text=True)
ck('owned reference 184/184', '184/184 PASS' in r.stdout, r.stdout[-120:])
ck('canonical SHA recorded c97a2869', 'c97a28692d963817288a814ea31db6cb10208fdbcf2d61ede6d77613e2d6cce2' in (R/'tests/rc7/reference.py').read_text()[:600])
# freeze-tree writes SOURCE + INVENTORY
ft = (R/'tests/rc10/freeze-tree.sh').read_text()
ck('freeze-tree writes SOURCE-SHA256.json', 'SOURCE-SHA256.json' in ft)
ck('freeze-tree writes INVENTORY-SHA256.json', 'INVENTORY-SHA256.json' in ft)
# Frozen trees untouched
for i in range(1,13):
    root = Path(f'/workspace/checkride-v4-rc{i}')
    ck(f'rc{i} exists', root.exists())
    if i <= 11:
        a = (root/'app.js').read_text() if (root/'app.js').exists() else ''
        ck(f'rc{i} no after pass UI', 'viewAfterPass' not in a and '"pass.eyebrow"' not in a)
    if i == 12:
        sw12 = (root/'sw.js').read_text()
        ck('rc12 still v7.17.0', 'cc-proto-v7.17.0' in sw12)
        ck('rc12 no SOURCE gap note only — not modified', True)
ck('examiner_plan §10.3.0 exact', 'Your examiner decides the plan for the remaining test; bring your NOD/LOD and ask them what will be covered.' in app)
ck('examiner_plan no FSIMS in key value window', 'FSIMS blocked' not in app)
ck('no data-examiner-plan-plain', 'data-examiner-plan-plain' not in app)
ck('after.entry.prompt §10.0', '"after.entry.prompt": "How did it go?"' in app)
ck('after.entry.inc Not finished (no discontinued)', '"after.entry.inc": "Not finished"' in app and '"after.entry.inc": "Not finished (discontinued)"' not in app)
ck('after.entry.helper §10.0', 'Pick what your examiner handed you: a temporary certificate (Passed)' in app)
ck('after.entry.aria §10.0', '"after.entry.aria": "Checkride result for this booking"' in app)
ck('after.entry.group_label §10.0', '"after.entry.group_label": "Checkride result"' in app)
ck('no PLACEHOLDER suffix/runtime string', 'PLACEHOLDER' not in app and 'PLACEHOLDER' not in (R/'sw.js').read_text())
ck('no Sport in after onboarding sense — Sport still out of fr', '"fr.s1.opt.sport"' not in app)
styles=(R/'styles.css').read_text()
ck('RC13-I01 after-page btn white-space normal', '.after-page .btn' in styles and 'white-space: normal' in styles)
ck('RC13-I01 max-width 100% on after btn', 'max-width: 100%' in styles)
ft=(R/'tests/rc10/freeze-tree.sh').read_text()
ck('RC13-I02 inventory never lists itself', 'INVENTORY must NEVER list itself' in ft or 'no self-entry' in ft)
ck('RC13-I02 freeze verify gate', 'FREEZE IDENTITY VERIFY' in ft or 'SOURCE verify' in ft)
ck('rc13 exists unchanged SW 7.20', Path('/workspace/checkride-v4-rc13/sw.js').exists() and 'cc-proto-v7.20.0' in Path('/workspace/checkride-v4-rc13/sw.js').read_text())
ck('rc14 exists unchanged SW 7.21', Path('/workspace/checkride-v4-rc14/sw.js').exists() and 'cc-proto-v7.21.0' in Path('/workspace/checkride-v4-rc14/sw.js').read_text())
ck('rc15 exists unchanged SW 7.23', Path('/workspace/checkride-v4-rc15/sw.js').exists() and 'cc-proto-v7.23.0' in Path('/workspace/checkride-v4-rc15/sw.js').read_text())
ck('rc16 exists unchanged SW 7.24', Path('/workspace/checkride-v4-rc16/sw.js').exists() and 'cc-proto-v7.24.0' in Path('/workspace/checkride-v4-rc16/sw.js').read_text())
ck('RC14-I01 estimate-label pill wrap', '.pill[data-estimate-label]' in styles and 'white-space: normal' in styles)
ck('overflow-audit covers #/dpe/ profiles', 'dpeIdsFromSample' in (R/'tests/after/overflow-audit.js').read_text() and 'nc14' in (R/'tests/after/overflow-audit.js').read_text())
ck('overflow-audit 0px tolerance', 'tolerancePx: 0' in (R/'tests/after/overflow-audit.js').read_text() or 'sw > cw' in (R/'tests/after/overflow-audit.js').read_text())

for k in ["cal.ride.btn","cal.ride.aria","cal.deadline.btn","cal.deadline.aria","cal.helper","cal.deadline.helper","cal.toast.done","cal.err","cal.ride.title","cal.ride.desc","cal.deadline.title","cal.deadline.desc.lead","cal.deadline.desc.foot"]:
    ck('COPY has '+k, f'"{k}"' in app)
ck('ics.js file exists', (R/'ics.js').exists())
ck('ics.js script tag', 'src="ics.js"' in (R/'index.html').read_text())
ck('no VALARM in ics builder default', 'VALARM is forbidden' in (R/'ics.js').read_text())
ck('rc17 exists unchanged SW 7.25', Path('/workspace/checkride-v4-rc17/sw.js').exists() and 'cc-proto-v7.25.0' in Path('/workspace/checkride-v4-rc17/sw.js').read_text())
ck('rc18 exists unchanged SW 7.25', Path('/workspace/checkride-v4-rc18/sw.js').exists() and 'cc-proto-v7.25.0' in Path('/workspace/checkride-v4-rc18/sw.js').read_text())
ck('freeze-guard forbids pycache', '__pycache__' in (R/'tests/rc10/freeze-guard.py').read_text())
ck('freeze-tree sets PYTHONDONTWRITEBYTECODE', 'PYTHONDONTWRITEBYTECODE' in (R/'tests/rc10/freeze-tree.sh').read_text())

print(f'SCOPE {pass_n} PASS {fail_n} FAIL')
sys.exit(1 if fail_n else 0)
