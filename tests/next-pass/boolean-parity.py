import sys, json, subprocess, importlib.util
sys.dont_write_bytecode=True
from datetime import date
import reference as R
# Include nonempty-invalid, valid mixtures, numeric strings, blank and corrected values.
cases=[]
for rating,amount in [('private-asel',3),('sport-airplane',2)]:
 for hs,reason in [([True],'fails'),([False],'fails'),([True,False],'fails'),([True]*3,'fails'),([True,amount-.1],'fails'),([False,amount-.1],'fails'),([True,amount],'ok'),([False,amount],'ok'),([True,False,str(amount)],'ok'),([], 'missing'),([str(amount)],'ok'),([None],'fails')]:cases.append((rating,hs,reason))
for rating,amount in [('private-glider',3),('private-hot-air-balloon',2)]:
 cases.extend([(rating,[True]*amount,'fails'),(rating,[False]*amount,'fails'),(rating,[True]+[.3]*(amount-1),'fails'),(rating,[False]+[.3]*amount,'ok')])
inputs=[]
for rating,hs,want in cases:
 r=R.check_prep_training(rating,[(date(2026,3,1),h,True)for h in hs],date(2026,3,31))
 assert (r.status,r.reason)==(('warn' if want=='fails' else 'needs-check' if want=='missing' else 'ok'),want),(rating,hs,r,want)
 assert r.cfi_ack_required == (want=='fails') and R.combine([r])['can_book'] is True,(rating,hs,r)
 inputs.append({'rating':rating,'entries':[{'date':'2026-03-01','hours':h,'qualifies':True}for h in hs],'want':want})
script='''require('/workspace/checkride-v4/elig-clock.js'); const cs=JSON.parse(process.argv[1]);let n=0;for(const c of cs){const r=CC_ELIG.checkPrep({...c,testStart:'2026-03-31'});const combined=CC_ELIG.combine([r]);if(r.status!==(c.want==='fails'?'warn':c.want==='missing'?'needs-check':'ok')||r.reason!==c.want||r.cfiAckRequired!==(c.want==='fails')||!combined.canBook)throw Error(JSON.stringify({c,r,combined}));n++;}console.log('BOOLEAN PARITY '+n+'/'+n+' PASS (local reference / JS; no crash, optional flag and canBook)');'''
subprocess.run(['node','-e',script,json.dumps(inputs)],check=True)
# Canonical v2.4 follow-up: compare actual status/reason/CFI flag/can-book for every case.
p='/workspace/checkride-pm/tools/eligibility_clock_reference.py'
s=importlib.util.spec_from_file_location('canonical',p);C=importlib.util.module_from_spec(s);sys.modules['canonical']=C;s.loader.exec_module(C)
hourly=0;flights=0;gaps=[]
for rating,hs,want in cases:
 entries=[(date(2026,3,1),h,True)for h in hs]
 r=C.check_prep_training(rating,entries,date(2026,3,31))
 local=R.check_prep_training(rating,entries,date(2026,3,31))
 actual=(r.status,r.reason,r.cfi_ack_required,C.combine([r])['can_book'])
 expected=(local.status,local.reason,local.cfi_ack_required,R.combine([local])['can_book'])
 if actual!=expected:gaps.append({'rating':rating,'hours':hs,'canonical':actual,'local':expected})
 if 'glider' not in rating and 'balloon' not in rating:hourly+=1
 else:flights+=1
print('CANONICAL PARITY',str(len(cases))+'/'+str(len(cases)), 'cases; hourly='+str(hourly)+' flights='+str(flights)+' gaps='+str(len(gaps)),json.dumps(gaps))
assert not gaps,gaps
print('CANONICAL STATUS/REASON/CFI/CAN-BOOK PARITY PASS')
