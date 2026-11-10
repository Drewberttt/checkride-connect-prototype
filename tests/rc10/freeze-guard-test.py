#!/usr/bin/env python3
import os
import sys
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.dont_write_bytecode = True
"""Tests for tests/rc10/freeze-guard.py — must fail a freeze tree that still has audit artifacts."""
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

# The module file is freeze-guard.py (hyphen). Import via importlib.
import importlib.util
spec = importlib.util.spec_from_file_location(
    "freeze_guard", Path(__file__).resolve().parent / "freeze-guard.py"
)
fg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fg)


class FreezeGuardTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="freeze-guard-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write(self, rel: str, data: bytes = b"x"):
        p = self.tmp / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data)
        return p

    def test_allow_listed_app_icons_and_brand_are_clean(self):
        for rel in sorted(fg.ALLOWED_IMAGES):
            self.write(rel, b"fake-png")
        self.write("app.js", b"// app")
        self.write("sw.js", b"const VERSION")
        hits = fg.find_artifacts(self.tmp)
        self.assertEqual(hits, [], hits)

    def test_explicit_allow_list_covers_current_assets(self):
        for rel in fg.ALLOWED_IMAGES:
            self.assertTrue(fg.is_allowed_image(rel), rel)
        self.assertTrue(fg.is_allowed_image("icons/runway/icon-512.png"))
        self.assertTrue(fg.is_allowed_image("brand/checkride-connect-logo-light.png"))
        self.assertFalse(fg.is_allowed_image("tests/dark/shots/foo.png"))
        self.assertFalse(fg.is_allowed_image("tests/foo.png"))

    def test_png_under_tests_is_rejected(self):
        self.write("icons/icon-512.png", b"ok")
        self.write("tests/dark/shots/page.png", b"no")
        hits = fg.find_artifacts(self.tmp)
        self.assertTrue(any(h.endswith("page.png") or h.endswith("shots/") for h in hits), hits)
        self.assertEqual(fg.main([str(self.tmp)]), 1)

    def test_zip_and_webp_and_trace_rejected(self):
        self.write("tests/rc10/out/foo.zip", b"PK")
        self.write("tests/foo.webp", b"RIFF")
        self.write("tests/run.trace", b"trace")
        hits = fg.find_artifacts(self.tmp)
        self.assertTrue(any(h.endswith(".zip") for h in hits), hits)
        self.assertTrue(any(h.endswith(".webp") for h in hits), hits)
        self.assertTrue(any(h.endswith(".trace") for h in hits), hits)

    def test_known_audit_output_dirs_rejected_even_without_png(self):
        self.write("tests/dark/out-after/dark-audit.json", b"{}")
        self.write("tests/dark/after-final/x.md", b"#")
        self.write("tests/dark/before/BASELINE-FINDINGS.md", b"#")
        self.write("tests/dark/out/dark-audit.json", b"{}")
        hits = fg.find_artifacts(self.tmp)
        joined = " ".join(hits)
        self.assertIn("out-after", joined)
        self.assertIn("after-final", joined)
        self.assertIn("tests/dark/before", joined)
        self.assertIn("tests/dark/out", joined)

    def test_historic_log_evidence_without_media_is_allowed(self):
        # Pre-existing tests/rc7/evidence logs were in rc16; not screenshot artifacts.
        self.write("tests/rc7/evidence/precision-parity.log", b"ok")
        self.write("tests/rc9/evidence-final/scope.json", b"{}")
        self.write("icons/icon-512.png", b"ok")
        hits = fg.find_artifacts(self.tmp)
        self.assertEqual(hits, [], hits)

    def test_clean_tree_exits_zero(self):
        self.write("icons/icon-512.png", b"ok")
        self.write("app.js", b"x")
        self.assertEqual(fg.main([str(self.tmp)]), 0)



    def test_pycache_and_pyc_are_rejected(self):
        self.write("tests/rc10/__pycache__/freeze-guard.cpython-313.pyc", b"\x00")
        hits = fg.find_artifacts(self.tmp)
        joined = " ".join(hits)
        self.assertTrue("__pycache__" in joined or joined.endswith(".pyc"), hits)
        self.assertEqual(fg.main([str(self.tmp)]), 1)

if __name__ == "__main__":
    # The hyphen module is loaded as fg; also expose names used if imported as freeze_guard
    unittest.main()
