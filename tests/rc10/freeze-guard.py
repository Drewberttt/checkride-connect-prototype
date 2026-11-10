#!/usr/bin/env python3
"""Reject screenshot / audit-output artifacts from a freeze tree.

Allowed image roots (the app's own assets only):
  icons/   (favicon, PWA, runway)
  brand/   (lockups, marks, including brand/archive-png-pre-v2/)

Everywhere else, including tests/, these are forbidden:
  - files with suffix .png .jpg .jpeg .webp .zip .webm .mp4 .trace
  - directories named as screenshot / trace / video / known audit output dirs

Exit 0 if clean, 1 if any artifact remains (prints each path).
Usage: freeze-guard.py <tree-root>
"""
from __future__ import annotations

import sys
from pathlib import Path

# Explicit allow-list of app image roots. Anything under these prefixes is
# a real product asset, not test evidence.
ALLOWED_IMAGE_PREFIXES = (
    "icons/",
    "brand/",
)

# Current explicit asset inventory (kept for the guard test and docs).
ALLOWED_IMAGES = frozenset({
    "brand/archive-png-pre-v2/checkride-connect-icon.png",
    "brand/archive-png-pre-v2/checkride-connect-logo-dark.png",
    "brand/archive-png-pre-v2/checkride-connect-logo-light.png",
    "brand/checkride-connect-icon.png",
    "brand/checkride-connect-logo-dark.png",
    "brand/checkride-connect-logo-light.png",
    "brand/checkride-connect-logo-original.png",
    "icons/apple-touch-icon.png",
    "icons/favicon-16.png",
    "icons/favicon-32.png",
    "icons/favicon-48.png",
    "icons/favicon-dark-16.png",
    "icons/favicon-dark-32.png",
    "icons/favicon-dark-48.png",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "icons/icon-maskable-192.png",
    "icons/icon-maskable-512.png",
    "icons/mark-master-512.png",
    "icons/runway/apple-touch-icon.png",
    "icons/runway/favicon-16.png",
    "icons/runway/favicon-32.png",
    "icons/runway/favicon-48.png",
    "icons/runway/icon-192.png",
    "icons/runway/icon-512.png",
    "icons/runway/icon-maskable-192.png",
    "icons/runway/icon-maskable-512.png",
})

FORBIDDEN_SUFFIXES = frozenset({
    ".png", ".jpg", ".jpeg", ".webp", ".zip", ".webm", ".mp4", ".trace",
})

# Directory names that always mean test/audit output (any depth).
FORBIDDEN_DIR_NAMES = frozenset({
    "shots",
    "shots-after",
    "shots-d51",
    "screenshots",
    "screenshot",
    "traces",
    "videos",
    "video",
    "playwright-report",
    "test-results",
    "out-after",
    "out-d51",
    "after-final",
})

# Exact relative dir paths that are known audit output (names too generic to ban globally).
FORBIDDEN_DIR_PATHS = frozenset({
    "tests/dark/out",
    "tests/dark/before",
})


def rel_of(root: Path, p: Path) -> str:
    return str(p.relative_to(root)).replace("\\", "/")


def is_allowed_image(rel: str) -> bool:
    if rel in ALLOWED_IMAGES:
        return True
    return any(rel.startswith(prefix) for prefix in ALLOWED_IMAGE_PREFIXES)


def find_artifacts(root: Path) -> list[str]:
    """Return relative paths that must not be frozen."""
    root = root.resolve()
    hits: list[str] = []
    if not root.is_dir():
        return [f"(not a directory) {root}"]

    # Forbidden directories (if they exist and are non-empty, or even empty:
    # an empty leftover shots/ dir should not ship). Report the dir itself.
    for p in root.rglob("*"):
        if not p.is_dir():
            continue
        rel = rel_of(root, p)
        if p.name in FORBIDDEN_DIR_NAMES or rel in FORBIDDEN_DIR_PATHS:
            hits.append(rel + "/")

    for p in root.rglob("*"):
        if not p.is_file():
            continue
        rel = rel_of(root, p)
        suf = p.suffix.lower()
        if suf in FORBIDDEN_SUFFIXES and not is_allowed_image(rel):
            hits.append(rel)
        # Playwright trace is also a file without suffix sometimes; catch *.trace.zip via .zip

    # stable unique
    return sorted(set(hits))


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if not args:
        print("usage: freeze-guard.py <tree-root>", file=sys.stderr)
        return 2
    root = Path(args[0])
    hits = find_artifacts(root)
    if hits:
        print(f"FREEZE GUARD FAIL: {len(hits)} artifact(s) under {root}:", file=sys.stderr)
        for h in hits:
            print(f"  {h}", file=sys.stderr)
        return 1
    print(f"FREEZE GUARD OK: no screenshot/audit artifacts under {root}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
