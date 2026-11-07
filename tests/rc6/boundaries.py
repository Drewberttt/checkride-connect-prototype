# Local reference/JS agreement for the QA-091/096..098 numeric contract.
import sys, json, subprocess
sys.dont_write_bytecode = True
from datetime import date
import reference as R
cases = [([], 'missing'), ([None], 'fails'), (['abc'], 'fails'), ([0], 'fails'), ([-5], 'fails'), ([.05], 'fails'), ([.09,2.95], 'fails'), ([.099999,2.900001], 'fails'), ([.1,2.9], 'ok'), ([24], 'ok'), ([24.1], 'fails'), ([1000000], 'fails'), ([2.996], 'fails'), ([2.9999999], 'fails'), ([3], 'ok'), ([.3,2.3,.4], 'ok'), ([.7,1.4,.9], 'ok'), ([3, -5], 'ok'), ([1.5,1.5,30], 'ok')]
inputs=[]
for hs,want in cases:
    entries=[(date(2026,3,1), h, True) for h in hs]
    r=R.check_prep_training('private-asel',entries,date(2026,3,31))
    assert r.reason==want,(hs,r,want)
    inputs.append({'entries':[{'date':'2026-03-01','hours':h,'qualifies':True} for h in hs], 'want':want})
script='''require(process.argv[1]); const cases=JSON.parse(process.argv[2]); for(const c of cases){const r=CC_ELIG.checkPrep({rating:'private-asel',entries:c.entries,testStart:'2026-03-31'}); if(r.reason!==c.want || r.cfiAckRequired!==(c.want==='fails'))throw Error(JSON.stringify({c,r}));}console.log('BOUNDARIES reference + JS '+cases.length+'/'+cases.length+' PASS');'''
subprocess.run(['node','-e',script,'/workspace/checkride-v4/elig-clock.js',json.dumps(inputs)],check=True)
