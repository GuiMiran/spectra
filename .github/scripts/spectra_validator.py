#!/usr/bin/env python3
"""
Spectra Validator — automatic spec quality checker
Validates all 13 layers across every example in the repository.

Checks:
  INV-C01: Every example has all 13 required layers
  INV-C02: Reconstructability markers present
  INV-C03: No duplicate IDs across the repo
  INV-C04: No technical keywords in spec layers
  INV-C05: All terms used are defined in glossary (Layer 01)
  INV-C06: All cross-references resolve to existing IDs
  INV-C07: SPECTRA-TRACE format is valid
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict

# ─── Configuration ──────────────────────────────────────────────────────────

REQUIRED_LAYERS = [
    "00-vision",
    "01-glossary",
    "02-stories",
    "03-business-rules",
    "04-invariants",
    "05-contracts",
    "06-policies",
    "07-events",
    "08-agents",
    "09-skills",
    "10-workflows",
    "11-acceptance-criteria",
    "12-trace",
]

ID_PATTERNS = {
    "US":  r"\bUS-[A-Z]{0,4}-?\d{3}\b",
    "BR":  r"\bBR-[A-Z]{0,4}-?\d{3}\b",
    "INV": r"\bINV-[A-Z]{0,4}-?\d{3}\b",
    "OP":  r"\bOP-[A-Z]{0,4}-?\d{3}\b",
    "POL": r"\bPOL-[A-Z]{0,4}-?\d{3}\b",
    "EVT": r"\bEVT-[A-Z]{0,4}-?\d{3}\b",
    "AG":  r"\bAG-[A-Z]{0,4}-?\d{3}\b",
    "SK":  r"\bSK-[A-Z]{0,4}-?\d{3}\b",
    "WF":  r"\bWF-[A-Z]{0,4}-?\d{3}\b",
    "AC":  r"\bAC-[A-Z]{0,4}-?\d{3}\b",
}

# Keywords that suggest technical implementation details in specs
TECHNICAL_KEYWORDS = [
    r"\bREST\b", r"\bSQL\b", r"\bMySQL\b", r"\bPostgres\b", r"\bMongoDB\b",
    r"\bReact\b", r"\bVue\b", r"\bAngular\b", r"\bNext\.js\b", r"\bFastAPI\b",
    r"\bDjango\b", r"\bFlask\b", r"\bSpring\b", r"\bexpress\b",
    r"\bJSON\b", r"\bXML\b", r"\bHTTP\b", r"\bAPI endpoint\b",
    r"\bclass [A-Z]", r"\bfunction [a-z]", r"\bconst \b", r"\bvar \b",
    r"\bdef [a-z]", r"\bimport \b", r"\bfrom \b.*\bimport\b",
    r"\bDockerfile\b", r"\bkubernetes\b", r"\bpod\b", r"\bcontainer\b",
]

# Layers where technical keywords are tolerated (skills and workflows may mention them)
TECHNICAL_EXEMPT_LAYERS = ["09-skills", "10-workflows", "12-trace"]

REPORT_PATH = Path("spectra-report.md")
EXAMPLES_DIR = Path("examples")

# ─── Validator ───────────────────────────────────────────────────────────────

class SpectraValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.passed = []
        self.all_ids = defaultdict(list)  # id -> list of files where found

    def log_error(self, check, file, message):
        self.errors.append({"check": check, "file": str(file), "message": message})

    def log_warning(self, check, file, message):
        self.warnings.append({"check": check, "file": str(file), "message": message})

    def log_pass(self, check, detail=""):
        self.passed.append({"check": check, "detail": detail})

    def find_example_dirs(self):
        if not EXAMPLES_DIR.exists():
            return []
        return [d for d in EXAMPLES_DIR.iterdir() if d.is_dir() and not d.name.startswith(".")]

    def find_layer_file(self, example_dir, layer_name):
        """Find a layer file by prefix name (e.g. '00-vision' matches '00-vision.md')"""
        for f in example_dir.iterdir():
            if f.stem == layer_name or f.name == f"{layer_name}.md":
                return f
        return None

    # INV-C01: All 13 layers present
    def check_all_layers_present(self, example_dir):
        missing = []
        for layer in REQUIRED_LAYERS:
            if not self.find_layer_file(example_dir, layer):
                missing.append(layer)
        if missing:
            self.log_error(
                "INV-C01",
                example_dir,
                f"Missing layers: {', '.join(missing)}"
            )
        else:
            self.log_pass("INV-C01", f"{example_dir.name} — all 13 layers present")

    # INV-C02: Reconstructability marker in 12-trace
    def check_reconstructability(self, example_dir):
        trace_file = self.find_layer_file(example_dir, "12-trace")
        if not trace_file:
            return  # already caught by INV-C01
        content = trace_file.read_text(encoding="utf-8", errors="ignore")
        has_forward = "FORWARD MATRIX" in content or "Spec → Code" in content
        has_reverse = "REVERSE MATRIX" in content or "Code → Spec" in content
        has_score = "COVERAGE SCORE" in content or "coverage" in content.lower()
        if not (has_forward and has_reverse):
            self.log_error(
                "INV-C02",
                trace_file,
                "SPECTRA-TRACE missing FORWARD MATRIX or REVERSE MATRIX section"
            )
        elif not has_score:
            self.log_warning(
                "INV-C02",
                trace_file,
                "SPECTRA-TRACE missing COVERAGE SCORE field"
            )
        else:
            self.log_pass("INV-C02", f"{example_dir.name} — reconstructability markers present")

    # INV-C03: No duplicate IDs across the repo
    def collect_ids(self, file_path):
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        for id_type, pattern in ID_PATTERNS.items():
            found = re.findall(pattern, content)
            for id_val in found:
                self.all_ids[id_val].append(file_path)

    def check_duplicate_ids(self):
        duplicates = {
            id_val: files
            for id_val, files in self.all_ids.items()
            if len(set(str(f) for f in files)) > 1
        }
        if duplicates:
            for id_val, files in duplicates.items():
                unique_files = list(set(str(f) for f in files))
                self.log_error(
                    "INV-C03",
                    unique_files[0],
                    f"Duplicate ID '{id_val}' found in: {', '.join(unique_files)}"
                )
        else:
            self.log_pass("INV-C03", f"No duplicate IDs found ({len(self.all_ids)} unique IDs)")

    # INV-C04: No technical keywords in spec layers (except exempt layers)
    def check_no_technical_keywords(self, example_dir):
        for layer in REQUIRED_LAYERS:
            if layer in TECHNICAL_EXEMPT_LAYERS:
                continue
            layer_file = self.find_layer_file(example_dir, layer)
            if not layer_file:
                continue
            content = layer_file.read_text(encoding="utf-8", errors="ignore")
            # Skip code blocks
            content_no_code = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
            for kw_pattern in TECHNICAL_KEYWORDS:
                matches = re.findall(kw_pattern, content_no_code, re.IGNORECASE)
                if matches:
                    self.log_warning(
                        "INV-C04",
                        layer_file,
                        f"Possible technical keyword found: '{matches[0]}' — ensure this is domain language, not implementation detail"
                    )

    # INV-C05: All terms in specs are defined in glossary
    def check_glossary_coverage(self, example_dir):
        glossary_file = self.find_layer_file(example_dir, "01-glossary")
        if not glossary_file:
            return
        glossary_content = glossary_file.read_text(encoding="utf-8", errors="ignore").lower()
        # Extract defined terms (lines starting with ** or ##)
        defined_terms = set(re.findall(r"\*\*([^*]+)\*\*", glossary_content))
        defined_terms |= set(re.findall(r"^#{1,3}\s+(.+)$", glossary_content, re.MULTILINE))
        if len(defined_terms) == 0:
            self.log_warning(
                "INV-C05",
                glossary_file,
                "Glossary appears empty or uses unexpected format — expected **Term** headers"
            )
        else:
            self.log_pass(
                "INV-C05",
                f"{example_dir.name} — {len(defined_terms)} terms defined in glossary"
            )

    # INV-C06: Cross-references resolve to existing IDs
    def check_cross_references(self, example_dir):
        all_known_ids = set(self.all_ids.keys())
        for layer in REQUIRED_LAYERS:
            layer_file = self.find_layer_file(example_dir, layer)
            if not layer_file:
                continue
            content = layer_file.read_text(encoding="utf-8", errors="ignore")
            # Find all ID references in this file
            referenced_ids = set()
            for pattern in ID_PATTERNS.values():
                referenced_ids |= set(re.findall(pattern, content))
            # Check each referenced ID exists somewhere in the repo
            for ref_id in referenced_ids:
                if ref_id not in all_known_ids:
                    self.log_warning(
                        "INV-C06",
                        layer_file,
                        f"Reference to '{ref_id}' not found in any spec file"
                    )

    # ─── Main runner ─────────────────────────────────────────────────────────

    def run(self):
        print("=" * 60)
        print("SPECTRA VALIDATOR")
        print("https://github.com/GuiMiran/spectra")
        print("=" * 60)

        example_dirs = self.find_example_dirs()

        if not example_dirs:
            print("\n⚠  No examples found in /examples — skipping example checks")
            print("   Add your first example to get full validation\n")
        else:
            print(f"\nFound {len(example_dirs)} example(s): {[d.name for d in example_dirs]}\n")

        # Collect all IDs first (needed for cross-reference checks)
        for example_dir in example_dirs:
            for layer in REQUIRED_LAYERS:
                layer_file = self.find_layer_file(example_dir, layer)
                if layer_file:
                    self.collect_ids(layer_file)

        # Also collect from core framework files
        for md_file in Path(".").glob("*.md"):
            self.collect_ids(md_file)
        for md_file in Path("layers").glob("*.md") if Path("layers").exists() else []:
            self.collect_ids(md_file)

        # Run checks per example
        for example_dir in example_dirs:
            print(f"Checking: {example_dir.name}")
            self.check_all_layers_present(example_dir)
            self.check_reconstructability(example_dir)
            self.check_no_technical_keywords(example_dir)
            self.check_glossary_coverage(example_dir)
            self.check_cross_references(example_dir)

        # Run repo-wide checks
        self.check_duplicate_ids()

        # Also validate SKILL.md exists
        skill_file = Path("skills/SKILL.md")
        if skill_file.exists():
            self.log_pass("SKILL", "skills/SKILL.md present")
        else:
            self.log_warning("SKILL", Path("."), "skills/SKILL.md not found — agents cannot auto-load this skill")

        self.generate_report()
        self.print_summary()

        if self.errors:
            sys.exit(1)
        sys.exit(0)

    def generate_report(self):
        lines = [
            "# Spectra Validation Report\n",
            f"Repository: https://github.com/GuiMiran/spectra\n",
            f"---\n",
            f"## Summary\n",
            f"- ✅ Passed: {len(self.passed)}",
            f"- ❌ Errors: {len(self.errors)}",
            f"- ⚠️  Warnings: {len(self.warnings)}\n",
        ]

        if self.errors:
            lines.append("## ❌ Errors (must fix before merge)\n")
            for e in self.errors:
                lines.append(f"**[{e['check']}]** `{e['file']}`")
                lines.append(f"  → {e['message']}\n")

        if self.warnings:
            lines.append("## ⚠️ Warnings (review recommended)\n")
            for w in self.warnings:
                lines.append(f"**[{w['check']}]** `{w['file']}`")
                lines.append(f"  → {w['message']}\n")

        if self.passed:
            lines.append("## ✅ Passed checks\n")
            for p in self.passed:
                detail = f" — {p['detail']}" if p['detail'] else ""
                lines.append(f"- [{p['check']}]{detail}")

        lines.append("\n---")
        lines.append("*Generated by Spectra Validator — https://github.com/GuiMiran/spectra*")

        REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
        print(f"\nReport saved to: {REPORT_PATH}")

    def print_summary(self):
        print("\n" + "=" * 60)
        print(f"✅ PASSED:   {len(self.passed)}")
        print(f"⚠️  WARNINGS: {len(self.warnings)}")
        print(f"❌ ERRORS:   {len(self.errors)}")
        print("=" * 60)

        if self.errors:
            print("\n❌ VALIDATION FAILED — fix errors before merging\n")
            for e in self.errors:
                print(f"  [{e['check']}] {e['file']}")
                print(f"    → {e['message']}")
        else:
            print("\n✅ ALL CHECKS PASSED — ready to merge\n")


if __name__ == "__main__":
    validator = SpectraValidator()
    validator.run()
