import sys,json,subprocess,importlib.util,random
from datetime import date,timedelta
from pathlib import Path
sys.dont_write_bytecode=True
p='/workspace/checkride-pm/tools/eligibility_clock_reference.py';sp=importlib.util.spec_from_file_location('canonical',p);R=importlib.util.module_from_spec(sp);sys.modules['canonical']=R;sp.loader.exec_module(R)
HS=[['2.9999999999999999'],['1.00','1.9999999999999999'],['1.50','1.50'],['1.00','2.00'],['1.000',2],['3.000'],['3e0'],['3E0'],['0.3e1'],['+3'],['-3'],['3.'],['.5','2.5'],[' 1.5 ','\t1.5\n'],['\f3'],[None],[True,False,2.9],[True,3],[.3,2.3,.4],[.7,1.4,.9],[.1]*30,[2.9999999999999999],['0003.00'],['1e-1','2.90'],[1e-1,2.9],['24.00','24.01'],['2.995'],[1.005,1.995],['1.25',1.75,'1.999'],[],['0.09',2.95],['1,5'],['inf'],['nan'],[''],['1 .5']]
# Mirror reconciled canonical P93-P98, without changing product semantics.
HS += [['\u0663'],['\u0661.\u0665','\u0661.\u0665'],['\uff13'],['\uff11.\uff15','\uff11.\uff15'],['1.5','1.5'],['\uff13','3']]
cases=[]
for hs in HS:
 entries=[(date(2026,3,1),h,True)for h in hs];r=R.check_prep_training('private-asel',entries,date(2026,3,31))
 cases.append({'in':{'rating':'private-asel','entries':[{'date':str(d),'hours':h,'qualifies':q}for d,h,q in entries],'testStart':'2026-03-31'},'expected':[r.status,r.reason,r.cfi_ack_required,R.combine([r])['can_book']],'valid':[R.hours_value(h)is not None for h in hs]})
for rating,hs in [('private-glider',['0.333',.333,'2.9999999999999999']),('private-glider',[True,'1.234','1.234']),('private-hot-air-balloon',[True,False])]:
 r=R.check_prep_training(rating,[(date(2026,3,1),h,True)for h in hs],date(2026,3,31));cases.append({'in':{'rating':rating,'entries':[{'date':'2026-03-01','hours':h,'qualifies':True}for h in hs],'testStart':'2026-03-31'},'expected':[r.status,r.reason,r.cfi_ack_required,R.combine([r])['can_book']],'valid':[R.hours_value(h)is not None for h in hs]})
out=Path(__import__('os').environ.get('OUT','/workspace/checkride-test-tools/evidence/rc7-parity-new'));out.mkdir(parents=True,exist_ok=True);(out/'precision-cases.json').write_text(json.dumps(cases))
script="""require('/workspace/checkride-v4/elig-clock.js');const cs=require(process.argv[1]);let n=0;for(const c of cs){const r=CC_ELIG.checkPrep(c.in),v=c.in.entries.map(e=>CC_ELIG.prepHoursValid(e.hours)),g=[r.status,r.reason,r.cfiAckRequired,CC_ELIG.combine([r]).canBook];if(JSON.stringify(g)!==JSON.stringify(c.expected)||JSON.stringify(v)!==JSON.stringify(c.valid))throw Error(JSON.stringify({c,g,v}));n++}for(const h of [NaN,Infinity,-Infinity])if(CC_ELIG.prepHoursValid(h))throw Error('nonfinite');console.log('D44 CANONICAL/JS '+n+'/'+n+' CASES PASS; +3 nonfinite validator assertions');"""
subprocess.run(['node','-e',script,str(out/'precision-cases.json')],check=True)
rng=random.Random(202611071459);random_cases=[]
for _ in range(3000):
 rating=rng.choice(['private-asel','sport-airplane','private-glider','private-hot-air-balloon','instrument-airplane']);test=date(2026,3,31)
 entries=None if rng.random()<.1 else [(test-timedelta(days=rng.randrange(-5,120)),rng.choice(rng.choice(HS)or[None]),rng.random()>.15)for _ in range(rng.randrange(6))]
 r=R.check_prep_training(rating,entries,test);random_cases.append({'in':{'rating':rating,'entries':None if entries is None else[{'date':str(d),'hours':h,'qualifies':q}for d,h,q in entries],'testStart':str(test)},'expected':[r.status,r.reason,r.cfi_ack_required,R.combine([r])['can_book']]})
(out/'random-cases.json').write_text(json.dumps(random_cases))
script="""require('/workspace/checkride-v4/elig-clock.js');const cs=require(process.argv[1]);for(const c of cs){const r=CC_ELIG.checkPrep(c.in),g=[r.status,r.reason,r.cfiAckRequired,CC_ELIG.combine([r]).canBook];if(JSON.stringify(g)!==JSON.stringify(c.expected))throw Error(JSON.stringify({c,g}));}console.log('D44 RANDOM CANONICAL/JS '+cs.length+'/'+cs.length+' PASS');"""
subprocess.run(['node','-e',script,str(out/'random-cases.json')],check=True)
