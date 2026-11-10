#!/bin/bash
# Dev helper for a future freeze. Sev1 hygiene: MD5SUMS.txt must NOT list its own checksum
# (self-entry fails by construction). Do not rewrite existing frozen trees with this.
# RC18: freeze-guard.py must pass on the source and the dest (no leftover
# screenshots / audit output). App images are allow-listed under icons/ and brand/.
# Always writes SOURCE-SHA256.json (curated runtime) and INVENTORY-SHA256.json (all files)
# into the dest tree BEFORE MD5SUMS.txt so both are covered by the manifest.
# RC13-I02: INVENTORY must NEVER list itself (self-hash can never verify 100%).
set -euo pipefail
APP="${1:-/workspace/checkride-v4}"
DST="${2:-}"
if [ -z "$DST" ]; then echo "usage: freeze-tree.sh <src-app> <dest-freeze-dir>"; exit 2; fi
if [ -e "$DST" ]; then echo "REFUSE: $DST exists"; exit 2; fi

# RC18: refuse screenshot / audit-output artifacts (png/jpg/webp/zip/trace/video,
# shots/ dirs, known tests/dark output dirs). App images live only under icons/ and brand/.
GUARD="$APP/tests/rc10/freeze-guard.py"
if [ ! -f "$GUARD" ]; then echo "REFUSE: missing $GUARD"; exit 2; fi
python3 "$GUARD" "$APP"

cp -a "$APP" "$DST"
python3 "$DST/tests/rc10/freeze-guard.py" "$DST"

python3 - "$DST" <<'PY'
import hashlib, json, os, sys, subprocess
from pathlib import Path
root = Path(sys.argv[1])

SOURCE_KEYS = [
    "app.js", "sw.js", "styles.css", "index.html", "data.js", "demo-date.js",
    "cost-model.js", "elig-clock.js",
    "sample-fl-examiners.js", "sample-tx-examiners.js", "sample-ca-examiners.js",
    "sample-az-examiners.js", "sample-nc-examiners.js",
    "site.webmanifest", "runway.webmanifest", "favicon.ico",
    "tests/rc10/freeze-tree.sh",
]

def sha_size(p: Path):
    data = p.read_bytes()
    st = p.stat()
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "size": st.st_size,
        "mtime_ns": getattr(st, "st_mtime_ns", int(st.st_mtime * 1e9)),
    }

def sha_only(p: Path):
    return hashlib.sha256(p.read_bytes()).hexdigest()

source = {}
for rel in SOURCE_KEYS:
    p = root / rel
    if p.is_file():
        d = sha_size(p)
        source[rel] = {"sha256": d["sha256"], "size": d["size"]}

for folder in ("brand", "icons"):
    base = root / folder
    if not base.is_dir():
        continue
    for p in sorted(base.rglob("*")):
        if not p.is_file():
            continue
        if "archive" in p.parts:
            continue
        rel = str(p.relative_to(root)).replace("\\", "/")
        d = sha_size(p)
        source[rel] = {"sha256": d["sha256"], "size": d["size"]}

for pat in ("QA-HANDOFF*.md", "READY.txt", "PLAN.md"):
    for p in sorted(root.glob(pat)):
        if p.is_file():
            rel = str(p.relative_to(root)).replace("\\", "/")
            d = sha_size(p)
            source[rel] = {"sha256": d["sha256"], "size": d["size"]}

(root / "SOURCE-SHA256.json").write_text(json.dumps(source, indent=2, sort_keys=False) + "\n")

# Inventory of every file EXCEPT MD5SUMS.txt and INVENTORY-SHA256.json itself (RC13-I02).
inventory = {}
for p in sorted(root.rglob("*")):
    if not p.is_file():
        continue
    rel = str(p.relative_to(root)).replace("\\", "/")
    if rel in ("MD5SUMS.txt", "INVENTORY-SHA256.json"):
        continue
    inventory[rel] = sha_size(p)

inv_path = root / "INVENTORY-SHA256.json"
inv_path.write_text(json.dumps(inventory, indent=2, sort_keys=True) + "\n")
print(f"SOURCE-SHA256.json entries={len(source)}")
print(f"INVENTORY-SHA256.json entries={len(inventory)} (no self-entry)")
PY

# Manifest excludes itself so `md5sum -c MD5SUMS.txt` passes cleanly
(cd "$DST" && find . -type f ! -path './.git/*' ! -name 'MD5SUMS.txt' | sort | xargs md5sum > MD5SUMS.txt)
echo "MD5SUMS lines=$(wc -l < "$DST/MD5SUMS.txt") (excluded ./MD5SUMS.txt self-entry)"

# RC13-I02: fail freeze if any identity file does not verify 100%
python3 - "$DST" <<'PY'
import hashlib, json, sys, subprocess
from pathlib import Path
root = Path(sys.argv[1])

def fail(msg):
    print("FREEZE VERIFY FAIL:", msg, file=sys.stderr)
    sys.exit(1)

# SOURCE: every entry matches file bytes
src = json.loads((root / "SOURCE-SHA256.json").read_text())
src_ok = src_bad = 0
for rel, meta in src.items():
    p = root / rel
    if not p.is_file():
        fail(f"SOURCE missing file {rel}")
    got = hashlib.sha256(p.read_bytes()).hexdigest()
    if got != meta.get("sha256") or p.stat().st_size != meta.get("size"):
        src_bad += 1
        print(f"SOURCE mismatch {rel}: claimed {meta.get('sha256')} got {got}")
    else:
        src_ok += 1
if src_bad:
    fail(f"SOURCE {src_ok}/{src_ok+src_bad} (bad={src_bad})")
print(f"SOURCE verify {src_ok}/{src_ok} OK")

# INVENTORY: never lists itself; every entry matches
inv = json.loads((root / "INVENTORY-SHA256.json").read_text())
if "INVENTORY-SHA256.json" in inv:
    fail("INVENTORY lists itself (RC13-I02)")
inv_ok = inv_bad = 0
for rel, meta in inv.items():
    p = root / rel
    if not p.is_file():
        fail(f"INVENTORY missing file {rel}")
    got = hashlib.sha256(p.read_bytes()).hexdigest()
    if got != meta.get("sha256"):
        inv_bad += 1
        print(f"INVENTORY mismatch {rel}")
    else:
        inv_ok += 1
# Also: every file except MD5SUMS + INVENTORY itself should be listed
listed = set(inv)
expected = set()
for p in root.rglob("*"):
    if not p.is_file():
        continue
    rel = str(p.relative_to(root)).replace("\\", "/")
    if rel in ("MD5SUMS.txt", "INVENTORY-SHA256.json"):
        continue
    expected.add(rel)
missing = expected - listed
extra = listed - expected
if missing or extra:
    fail(f"INVENTORY coverage gap missing={len(missing)} extra={len(extra)}")
if inv_bad:
    fail(f"INVENTORY {inv_ok}/{inv_ok+inv_bad}")
print(f"INVENTORY verify {inv_ok}/{inv_ok} OK (no self-entry)")

# MD5SUMS: no self-entry; md5sum -c clean
md = (root / "MD5SUMS.txt").read_text().splitlines()
if any("MD5SUMS.txt" in line for line in md):
    fail("MD5SUMS lists itself")
r = subprocess.run(["md5sum", "-c", "MD5SUMS.txt"], cwd=str(root), capture_output=True, text=True)
lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
ok = sum(1 for ln in lines if ln.endswith(": OK"))
bad = [ln for ln in lines if not ln.endswith(": OK")]
if r.returncode != 0 or bad:
    fail(f"MD5SUMS verify failed ok={ok} bad={bad[:5]}")
print(f"MD5SUMS verify {ok}/{ok} OK (no self-entry)")
print("FREEZE IDENTITY VERIFY 100%")
PY
