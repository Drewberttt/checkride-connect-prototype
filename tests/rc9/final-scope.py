from pathlib import Path
import json,hashlib,os
r=Path('/workspace/checkride-v4'); b=Path('/workspace/checkride-v4-rc8'); p=Path(os.environ['OUT']); a=(r/'app.js').read_text(); old=(b/'app.js').read_text(); checks=[]
def ck(n,c):
 checks.append({'name':n,'pass':bool(c)}); assert c,n
for f in b.iterdir():
 if f.is_file() and f.suffix in ['.js','.json','.html'] and f.name not in ['app.js','sw.js','SOURCE-SHA256.json']: ck('protected '+f.name,(r/f.name).read_bytes()==f.read_bytes())
ck('owned reference unchanged',(r/'tests/rc7/reference.py').read_bytes()==(b/'tests/rc7/reference.py').read_bytes())
ck('D41/D43 landing unchanged',a[a.index('  function viewLanding() {'):a.index('  function v4SchoolNear() {')]==old[old.index('  function viewLanding() {'):old.index('  function v4SchoolNear() {')])
ck('prep display/save/clock inputs byte-identical',a[a.index('  const prepHoursDisplay'):a.index('  function infoCertificate')]==old[old.index('  const prepHoursDisplay'):old.index('  function viewJourney')])
for start in ['  const PROTO_STRIP =','      <div class="proto-strip small"']:
 ck('mandatory notice '+start,next(l for l in a.splitlines() if l.startswith(start))==next(l for l in old.splitlines() if l.startswith(start)))
ck('styles original prefix unchanged; new rules auth-only',(r/'styles.css').read_text().startswith((b/'styles.css').read_text()) and all(l.startswith('body.is-auth ') for l in (r/'styles.css').read_text()[len((b/'styles.css').read_text()):].splitlines() if l and not l.startswith('/*')))
ck('SW shell/logic unchanged',[l for l in (r/'sw.js').read_text().splitlines() if not l.startswith('const VERSION')]==[l for l in (b/'sw.js').read_text().splitlines() if not l.startswith('const VERSION')])
for f in (b/'fonts').rglob('*'):
 if f.is_file(): ck('font '+str(f.relative_to(b)),(r/f.relative_to(b)).read_bytes()==f.read_bytes())
ck('No repository metadata',all(not (x/'.git').exists() for x in [r,*r.parents])); ck('rc9 absent',not Path('/workspace/checkride-v4-rc9').exists()); ck('D45 owner source unchanged since read',hashlib.sha256(Path('/workspace/checkride-pm/product-decisions.md').read_bytes()).hexdigest()==(p/'PM-sha256.txt').read_text()); (p/'scope.json').write_text(json.dumps({'pass':len(checks),'fail':0,'results':checks},indent=2)); print('SCOPE',len(checks),'PASS')
