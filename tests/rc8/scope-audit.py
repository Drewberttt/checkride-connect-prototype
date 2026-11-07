from pathlib import Path
import hashlib,json,re
r=Path('/workspace/checkride-v4');old=Path('/workspace/checkride-v4-rc7');n=0

def ck(c,label):
 global n
 assert c,label
 n+=1;print('PASS',label)
a=(r/'app.js').read_text();b=(old/'app.js').read_text()
for name in ['index.html','styles.css','elig-clock.js','data.js','demo-date.js','cost-model.js']:
 ck((r/name).read_bytes()==(old/name).read_bytes(),name+' byte-identical')
landing=lambda s:s[s.index('  function viewLanding() {'):s.index('  function v4SchoolNear() {')]
ck(landing(a)==landing(b),'D41 landing byte-identical')
for start in ['  const PROTO_STRIP =','      <div class="proto-strip small"']:
 get=lambda s:s[s.index(start):s.index('\n',s.index(start))]
 ck(get(a)==get(b),'mandatory notice unchanged '+start)
ck('Prototype \\u2013 no real payments. Deposits go directly to you under your terms;' in a,'mandatory examiner notice unchanged')
ck('FEES_ENABLED: false' in a,'fees disabled')
ck('cc-proto-v7.11.0' in (r/'sw.js').read_text(),'unreleased next SW version')
ck((r/'sw.js').read_text().split('const SHELL =')[1]==(old/'sw.js').read_text().split('const SHELL =')[1],'SW caching logic/shell unchanged')
for p in (old/'fonts').rglob('*'):
 if p.is_file():ck(p.read_bytes()==(r/p.relative_to(old)).read_bytes(),'font unchanged '+p.name)
ck('type="text" inputmode="decimal" autocomplete="off" spellcheck="false" id="clock-prep-h${i}"' in a,'raw text hours / decimal keyboard hint')
print('RC8 SCOPE AUDIT',n,'PASS')
