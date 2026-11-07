from pathlib import Path
import hashlib
root=Path('/workspace/checkride-v4');old=Path('/tmp/t5/dev-20261107-bool-notice/backups');n=0

def check(c,name):
 global n
 assert c,name
 n+=1;print('PASS',name)
s=(root/'app.js').read_text();b=(old/'app.js').read_text();idx=(root/'index.html').read_text();bi=(old/'index.html').read_text()
check('"proto.payments": "Prototype: no real payments."' in s,'new canonical key exact')
check('<span data-copy-key="proto.payments">Prototype: no real payments.</span>' in idx,'static header keyed canonical')
check(idx.replace('<span data-copy-key="proto.payments">Prototype: no real payments.</span>','Prototype, no real payments.')==bi,'index change limited to header short disclaimer')
landing=lambda text:text[text.index('  function viewLanding() {'):text.index('  function v4SchoolNear() {')]
newlanding=landing(s).replace('<b data-copy-key="proto.payments">${COPY["proto.payments"]}</b>','<b>Prototype: no real payments.</b>')
check(newlanding==landing(b),'D41 landing template unchanged except key wiring, existing footer text unchanged')
for start,end,name in [('  const PROTO_STRIP =','\n','mandatory app strip'),('      <div class="proto-strip small"','\n','mandatory modal strip')]:
 get=lambda t:t[t.index(start):t.index(end,t.index(start))]
 check(get(s)==get(b),name+' unchanged')
check('Prototype \\u2013 no real payments. Deposits go directly to you under your terms;' in s,'examiner settings mandatory escaped dash retained')
check("'<p class=\"muted small\">Prototype – no real payments. Prototype, not legal or FAA advice.</p></div></div>';" in idx,'fallback mandatory dash/legal unchanged')
check('const VERSION = "cc-proto-v7.8.0"' in (root/'sw.js').read_text(),'dev next SW version v7.8.0')
check('FEES_ENABLED: false' in s,'fees remain false')
for p in (Path('/workspace/checkride-v4-rc6')/'fonts').rglob('*'):
 if p.is_file():check(p.read_bytes()==(root/p.relative_to('/workspace/checkride-v4-rc6')).read_bytes(),'font bytes '+p.name)
print('SCOPE AUDIT',n,'PASS')
