#!/usr/bin/env bash
# Full prior matrix vs rc11 4391 lanes + onboarding. America/New_York box clock.
set -uo pipefail
export PYTHONDONTWRITEBYTECODE=1
ROOT=/workspace/checkride-v4
TOOLS=/workspace/checkride-test-tools
EVIDENCE_ROOT=/workspace/checkride-pm/qa/evidence
STAMP=${STAMP:-$(date +%Y%m%d-%H%M%S)}
# Official runs write only to a fresh rc21-* evidence dir (never qa/harness/results or an existing evidence dir).
OUT=${OUT:-$EVIDENCE_ROOT/rc21-matrix-$STAMP}
SHOTS=${SHOTS:-/workspace/checkride-connect-shots/rc21-matrix-$STAMP}
export CC_APP=$ROOT
export OUT SHOTS
export BASE_URL=http://127.0.0.1:8020/
export CC_DARK_WRITE_REPO=0
export CC_BASE=http://127.0.0.1:8020/
export PLAYWRIGHT_MODULE=/workspace/checkride-test-tools/node_modules/playwright
export AXE_MODULE=/workspace/checkride-test-tools/node_modules/axe-core/axe.min.js
export NODE_PATH=/workspace/checkride-test-tools/node_modules${NODE_PATH:+:$NODE_PATH}
export PYTHONPATH=$ROOT/tests/rc6:$ROOT/tests/rc7${PYTHONPATH:+:$PYTHONPATH}
# Guard (rc20): refuse an OUT or SHOTS path that contains an older rc name (rc1–rc19)
# or that points inside an already-existing evidence directory other than this run's OUT.
# This prevents inheriting SHOTS from a prior matrix (the rc19-evidence overwrite incident).
CURRENT_RC=21
matrix_path_guard() {
  local label="$1"
  local raw="$2"
  python3 - "$label" "$raw" "$EVIDENCE_ROOT" "$OUT" "$CURRENT_RC" <<'GUARD'
import os, re, sys
label, raw, root, out, current_rc = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5])
abs_path = os.path.abspath(os.path.expanduser(raw))
root = os.path.abspath(root)
out = os.path.abspath(out)
older = re.search(r"rc([1-9]|1[0-9])([^0-9]|$)", abs_path)
if older:
    print(f"run-matrix: refusing {label}={abs_path} (path contains an older rc name; rc1–rc{current_rc-1} evidence and trees are frozen)", file=sys.stderr)
    sys.exit(2)
norm = abs_path.replace("\\", "/")
if "/qa/harness/results" in norm or norm.rstrip("/").endswith("/qa/harness/results"):
    print(f"run-matrix: refusing {label}={abs_path} (QA harness results are off-limits; write only to a fresh rc{current_rc}-* evidence dir)", file=sys.stderr)
    sys.exit(2)
# OUT and SHOTS must live in a directory named rc{current}-**.
base = os.path.basename(abs_path.rstrip(os.sep))
# If this is a nested path (OUT/suite), use the evidence run dir name.
if label == "OUT":
    run_name = base
    if not re.match(rf"^rc{current_rc}-", run_name):
        print(f"run-matrix: refusing {label}={abs_path} (must be a fresh rc{current_rc}-* evidence dir)", file=sys.stderr)
        sys.exit(2)
    if os.path.isdir(abs_path) and os.listdir(abs_path):
        print(f"run-matrix: refusing {label}={abs_path} (directory already exists; use a fresh rc{current_rc}-* evidence dir)", file=sys.stderr)
        sys.exit(2)
elif label == "SHOTS":
    if not re.search(rf"rc{current_rc}-", base) and not re.search(rf"/rc{current_rc}-", norm + "/"):
        print(f"run-matrix: refusing {label}={abs_path} (must be a fresh rc{current_rc}-* shots dir)", file=sys.stderr)
        sys.exit(2)
    if os.path.isdir(abs_path) and os.listdir(abs_path):
        print(f"run-matrix: refusing {label}={abs_path} (directory already exists; use a fresh rc{current_rc}-* shots dir)", file=sys.stderr)
        sys.exit(2)
# Under the evidence root, the first path component is the evidence run dir.
# Allow only paths inside this run's OUT (which may not exist yet). Refuse a path
# that already lives inside some other evidence directory.
try:
    rel = os.path.relpath(abs_path, root)
except Exception:
    rel = None
if rel is not None and not rel.startswith("..") and rel != ".":
    top = rel.split(os.sep)[0]
    top_dir = os.path.join(root, top)
    if abs_path == out or abs_path.startswith(out + os.sep):
        sys.exit(0)
    if os.path.isdir(top_dir):
        print(f"run-matrix: refusing {label}={abs_path} (points inside existing evidence dir {top_dir})", file=sys.stderr)
        sys.exit(2)
elif rel == ".":
    print(f"run-matrix: refusing {label}={abs_path} (points at the evidence root itself)", file=sys.stderr)
    sys.exit(2)
sys.exit(0)
GUARD
  local st=$?
  if [[ $st -ne 0 ]]; then exit $st; fi
}
matrix_path_guard OUT "$OUT" || exit 2
matrix_path_guard SHOTS "$SHOTS" || exit 2
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
run_suite logo-qa085 node "$ROOT/tests/rc10/logo-qa085.js"
wait_suites

# Isolate the PWA upgrade lane (v7.13→v7.28, 3 browsers). Running it with other
# Playwright farms caused a mid-run waitForLoadState timeout in rc21-matrix-20261116-154002.
run_suite pwa-saved env QA_BROWSERS=chromium,firefox,webkit node "$ROOT/tests/rc10/pwa-saved.js"
wait_suites

run_suite boundaries bash -c "cd \"$ROOT/tests/rc6\" && python3 boundaries.py"
run_suite precision-parity python3 "$ROOT/tests/rc7/precision-parity.py"
run_suite scope python3 "$ROOT/tests/rc10/scope-v728.py"
wait_suites

# Also run D45-aligned focused-features (optional honesty lane; not in 4391 sum historically as "features"=d45)
run_suite focused-features node "$ROOT/tests/rc9/focused-features.js"
run_suite onboarding node "$ROOT/tests/onboarding/onboarding.js"
run_suite credit-parity node "$ROOT/tests/after/credit-parity.js"
run_suite after-checkride node "$ROOT/tests/after/after-checkride.js"
run_suite after-entry node "$ROOT/tests/after/after-entry.js"
run_suite rc21 node "$ROOT/tests/rc21/rc21.js"
run_suite dpe-week node "$ROOT/tests/after/dpe-week.js"
run_suite wait-time node "$ROOT/tests/after/wait-time.js"
run_suite ics-unit node "$ROOT/tests/ics/ics-test.js"
run_suite cal-ui node "$ROOT/tests/ics/cal-ui.js"
wait_suites

# Overflow now walks every ready-card state (5206 checks, ~30 min). Isolate it so it
# cannot starve sibling Playwright suites or get a mid-run waitForFunction timeout
# (rc21-matrix-20261116-154002 died at 1008/5206 under the shared after-wave).
run_suite overflow-audit node "$ROOT/tests/after/overflow-audit.js"
wait_suites

# QA-089 burst isolated: the same contended after-wave produced a one-off Firefox
# SW intercept error (35/1) that is a load flake, not a v7.28.0 fetch-path change
# (sw.js vs rc20 differs only in the VERSION pin).
run_suite qa089-burst node "$ROOT/tests/rc10/qa089-burst.js"
wait_suites

run_suite dark-audit node "$ROOT/tests/dark/dark-audit.js"
run_suite target-size-audit node "$ROOT/tests/a11y/target-size-audit.js"
wait_suites

# Summarize
python3 - <<'PY' | tee -a "$OUT/matrix.log"
import json, os, re
from pathlib import Path
OUT=Path(os.environ['OUT'])
suites=[]
pass_sum=fail_sum=0
# Parse each suite dir for pass/fail from json or log
order=['gate','evidence-defaults','header','digest','features','legacy-place','raw-hours','signup-a11y','saved','saved-quota','text-precision','settled-pages','saved-booleans','native-browsers','pwa-saved','logo-qa085','boundaries','precision-parity','scope','focused-features','onboarding','credit-parity','after-checkride','after-entry','rc21','overflow-audit','dpe-week','wait-time','ics-unit','cal-ui','qa089-burst','dark-audit','target-size-audit']
for name in order:
    d=OUT/name
    if not d.exists(): continue
    p=f=0; ec=open(d/'exitcode').read().strip() if (d/'exitcode').exists() else '?'
    # Prefer json
    found=False
    for j in d.glob('*.json'):
        try:
            data=json.loads(j.read_text())
            if isinstance(data,dict) and 'failPages' in data and 'pages' in data:
                p=int(data['pages'])-int(data.get('failPages') or 0); f=int(data.get('failPages') or data.get('failTargets') or 0); found=True; break
            if isinstance(data,dict) and isinstance(data.get('summary'),dict) and 'pages' in data['summary'] and 'text' in data['summary']:
                p=int(data['summary']['pages']); f=0; found=True; break
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
            mt=re.search(r'TARGET-SIZE pages=(\d+) fail=(\d+)', log)
            mdark=re.search(r'DARK AUDIT pages=(\d+)', log)
            if mt: m=mt
            elif mdark:
                class _M:
                    def group(self,i):
                        return mdark.group(1) if i==1 else '0'
                m=_M()
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
    if name not in ('focused-features','onboarding','credit-parity','after-checkride','after-entry','overflow-audit','dark-audit','target-size-audit'):
        pass_sum+=p; fail_sum+=f

summary={'OUT':str(OUT),'SHOTS':os.environ.get('SHOTS'),'sw':'cc-proto-v7.28.0','suites':suites,
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
