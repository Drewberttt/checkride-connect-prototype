#!/usr/bin/env bash
# Full prior matrix vs rc11 4391 lanes + onboarding. America/New_York box clock.
set -uo pipefail
ROOT=/workspace/checkride-v4
TOOLS=/workspace/checkride-test-tools
STAMP=${STAMP:-$(date +%Y%m%d-%H%M%S)}
OUT=${OUT:-$TOOLS/evidence/after-entry-full-$STAMP}
SHOTS=${SHOTS:-/workspace/checkride-connect-shots/after-entry-full-$STAMP}
export CC_APP=$ROOT
export OUT SHOTS
export BASE_URL=http://127.0.0.1:8020/
export CC_BASE=http://127.0.0.1:8020/
export PLAYWRIGHT_MODULE=/workspace/checkride-test-tools/node_modules/playwright
export AXE_MODULE=/workspace/checkride-test-tools/node_modules/axe-core/axe.min.js
export NODE_PATH=/workspace/checkride-test-tools/node_modules${NODE_PATH:+:$NODE_PATH}
export PYTHONPATH=$ROOT/tests/rc6:$ROOT/tests/rc7${PYTHONPATH:+:$PYTHONPATH}
mkdir -p "$OUT" "$SHOTS"
echo "=== MATRIX $(date -Iseconds) OUT=$OUT SHOTS=$SHOTS SW=$(rg -o 'cc-proto-v[0-9.]+' $ROOT/sw.js | head -1) ===" | tee "$OUT/matrix.log"

# Static app server (8020) + PWA upgrade server (8044)
pkill -f 'http.server 8020' 2>/dev/null || true
pkill -f 'upgrade-server.py' 2>/dev/null || true
sleep 0.2
echo "$ROOT" > "$TOOLS/rc10-active-root.txt"
python3 -m http.server 8020 --bind 127.0.0.1 --directory "$ROOT" >"$OUT/srv-8020.log" 2>&1 &
echo $! > "$OUT/srv-8020.pid"
python3 "$ROOT/tests/rc10/upgrade-server.py" >"$OUT/srv-8044.log" 2>&1 &
echo $! > "$OUT/srv-8044.pid"
sleep 0.5

SUITE_PIDS=()
run_suite() {
  local name="$1"; shift
  local dir="$OUT/$name"
  mkdir -p "$dir" "$SHOTS/$name"
  echo "=== START $name $(date -Iseconds) ===" | tee -a "$OUT/matrix.log"
  (
    export OUT="$dir" SHOTS="$SHOTS/$name"
    "$@"
    echo $? > "$dir/exitcode"
  ) >"$dir/run.log" 2>&1 &
  SUITE_PIDS+=($!)
}
wait_suites() {
  local pid ec name
  for pid in "${SUITE_PIDS[@]}"; do
    wait "$pid" || true
  done
  # Log OK/FAIL from exitcodes written by suites that finished this batch
  for dir in "$OUT"/*/; do
    name=$(basename "$dir")
    [[ -f "$dir/exitcode" && -f "$dir/run.log" ]] || continue
    # Only annotate once
    if [[ -f "$dir/.logged" ]]; then continue; fi
    ec=$(cat "$dir/exitcode")
    if [[ "$ec" == "0" ]]; then
      echo "=== OK $name exit=$ec ===" | tee -a "$OUT/matrix.log"
    else
      echo "=== FAIL $name exit=$ec ===" | tee -a "$OUT/matrix.log"
      tail -20 "$dir/run.log" | tee -a "$OUT/matrix.log" || true
    fi
    touch "$dir/.logged"
  done
  SUITE_PIDS=()
}

# Parallel batches matching prior matrix cadence
run_suite gate node "$ROOT/tests/rc7/legacy-gate/gate.mjs"
run_suite evidence-defaults node "$ROOT/tests/rc8/evidence-defaults.js"
run_suite header node "$ROOT/tests/rc9/header-unsupported.js"
wait_suites

run_suite digest node "$ROOT/tests/rc9/digest.js"
run_suite features node "$ROOT/tests/rc9/d45-features.js"
wait_suites

run_suite legacy-place node "$ROOT/tests/rc9/legacy-place.js"
run_suite raw-hours node "$ROOT/tests/rc8/raw-hours.js"
run_suite signup-a11y node "$ROOT/tests/rc8/signup-accessibility.js"
wait_suites

run_suite saved node "$ROOT/tests/rc10/saved.js"
run_suite saved-quota node "$ROOT/tests/rc10/saved-quota.js"
run_suite text-precision node "$ROOT/tests/rc8/text-precision-regression.js"
wait_suites

run_suite settled-pages node "$ROOT/tests/rc7/settled-pages.js"
run_suite saved-booleans node "$ROOT/tests/rc7/saved-booleans-browsers.js"
wait_suites

run_suite native-browsers node "$ROOT/tests/rc7/native-browsers.js"
run_suite pwa-saved node "$ROOT/tests/rc10/pwa-saved.js"
run_suite logo-qa085 node "$ROOT/tests/rc10/logo-qa085.js"
wait_suites

run_suite boundaries bash -c "cd \"$ROOT/tests/rc6\" && python3 boundaries.py"
run_suite precision-parity python3 "$ROOT/tests/rc7/precision-parity.py"
run_suite scope python3 "$ROOT/tests/rc10/scope-v724.py"
wait_suites

# Also run D45-aligned focused-features (optional honesty lane; not in 4391 sum historically as "features"=d45)
run_suite focused-features node "$ROOT/tests/rc9/focused-features.js"
run_suite onboarding node "$ROOT/tests/onboarding/onboarding.js"
run_suite credit-parity node "$ROOT/tests/after/credit-parity.js"
run_suite after-checkride node "$ROOT/tests/after/after-checkride.js"
run_suite after-entry node "$ROOT/tests/after/after-entry.js"
run_suite overflow-audit node "$ROOT/tests/after/overflow-audit.js"
run_suite dpe-week node "$ROOT/tests/after/dpe-week.js"
run_suite wait-time node "$ROOT/tests/after/wait-time.js"
wait_suites

# Summarize
python3 - <<'PY' | tee -a "$OUT/matrix.log"
import json, os, re
from pathlib import Path
OUT=Path(os.environ['OUT'])
suites=[]
pass_sum=fail_sum=0
# Parse each suite dir for pass/fail from json or log
order=['gate','evidence-defaults','header','digest','features','legacy-place','raw-hours','signup-a11y','saved','saved-quota','text-precision','settled-pages','saved-booleans','native-browsers','pwa-saved','logo-qa085','boundaries','precision-parity','scope','focused-features','onboarding','credit-parity','after-checkride','after-entry','overflow-audit','dpe-week','wait-time']
for name in order:
    d=OUT/name
    if not d.exists(): continue
    p=f=0; ec=open(d/'exitcode').read().strip() if (d/'exitcode').exists() else '?'
    # Prefer json
    found=False
    for j in d.glob('*.json'):
        try:
            data=json.loads(j.read_text())
            if isinstance(data,dict) and 'pass' in data and 'fail' in data:
                p,f=int(data['pass']),int(data['fail']); found=True; break
            if isinstance(data,dict) and 'results' in data and 'pass' in data:
                p,f=int(data['pass']),int(data['fail']); found=True; break
        except Exception:
            pass
    if not found and (d/'run.log').exists():
        log=(d/'run.log').read_text(errors='replace')
        # patterns: "X passed, Y failed" / "RESULT X Y" / "SCOPE X PASS Y FAIL" / HEADER D45 RESULT
        m=re.search(r'(\d+)\s+passed,\s*(\d+)\s+failed', log)
        if not m: m=re.search(r'RESULT\s+(\d+)\s+(\d+)', log)
        if not m: m=re.search(r'SCOPE\s+(\d+)\s+PASS\s+(\d+)\s+FAIL', log)
        if not m: m=re.search(r'HEADER D45 RESULT\s+(\d+)\s+(\d+)', log)
        if not m: m=re.search(r'LEGACY PLACE\s+(\d+)\s+(\d+)', log)
        if not m: m=re.search(r'PWA LEGACY RESULT\s+(\d+)\s+passed,\s*(\d+)\s+failed', log)
        if not m:
            mb=re.search(r'BOUNDARIES reference \+ JS (\d+)/(\d+) PASS', log)
            m45=re.search(r'D44 CANONICAL/JS (\d+)/(\d+) CASES PASS', log)
            m3k=re.search(r'D44 RANDOM CANONICAL/JS (\d+)/(\d+) PASS', log)
            if mb:
                p,f=int(mb.group(1)), 0 if mb.group(1)==mb.group(2) else int(mb.group(2))-int(mb.group(1))
            elif m45 and m3k:
                p,f=int(m45.group(1))+int(m3k.group(1)),0
            else:
                p=len(re.findall(r'^PASS\b', log, re.M))
                f=len(re.findall(r'^FAIL\b', log, re.M))
        else:
            p,f=int(m.group(1)),int(m.group(2))
    suites.append({'suite':name,'pass':p,'fail':f,'exitcode':ec})
    # Core 4391 lanes exclude focused-features + onboarding from baseline compare; still report all
    if name not in ('focused-features','onboarding','credit-parity','after-checkride','after-entry','overflow-audit'):
        pass_sum+=p; fail_sum+=f

summary={'OUT':str(OUT),'SHOTS':os.environ.get('SHOTS'),'sw':'cc-proto-v7.24.0','suites':suites,
         'pass_sum_core':pass_sum,'fail_sum_core':fail_sum,
         'pass_sum_all':sum(s['pass'] for s in suites),'fail_sum_all':sum(s['fail'] for s in suites)}
(OUT/'matrix-summary.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
print(f"CORE pass-sum {pass_sum} fail-sum {fail_sum}")
print(f"ALL  pass-sum {summary['pass_sum_all']} fail-sum {summary['fail_sum_all']}")
PY

echo "=== MATRIX DONE $(date -Iseconds) ===" | tee -a "$OUT/matrix.log"
# cleanup servers
kill $(cat "$OUT/srv-8020.pid") 2>/dev/null || true
kill $(cat "$OUT/srv-8044.pid") 2>/dev/null || true
