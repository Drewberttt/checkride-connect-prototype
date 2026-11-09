#!/bin/bash
# Dev helper for a future freeze. Sev1 hygiene: MD5SUMS.txt must NOT list its own checksum
# (self-entry fails by construction). Do not rewrite existing frozen trees with this.
set -euo pipefail
APP="${1:-/workspace/checkride-v4}"
DST="${2:-}"
if [ -z "$DST" ]; then echo "usage: freeze-tree.sh <src-app> <dest-freeze-dir>"; exit 2; fi
if [ -e "$DST" ]; then echo "REFUSE: $DST exists"; exit 2; fi
cp -a "$APP" "$DST"
# Manifest excludes itself so `md5sum -c MD5SUMS.txt` passes cleanly
(cd "$DST" && find . -type f ! -path './.git/*' ! -name 'MD5SUMS.txt' | sort | xargs md5sum > MD5SUMS.txt)
echo "MD5SUMS lines=$(wc -l < "$DST/MD5SUMS.txt") (excluded ./MD5SUMS.txt self-entry)"
