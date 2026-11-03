"""Build a Python launcher with the canonical Node CLI and its runtime data."""
import json
from pathlib import Path
from shutil import copy2, copytree

from setuptools import setup
from setuptools.command.build_py import build_py

ROOT = Path(__file__).resolve().parent
VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
DIRECTORIES = ("bin", "lib", "templates", "schemas", "layers")
FILES = ("package.json", "SPECTRA-PROMPT.md", "LICENSE", "scripts/welcome.js")


class BundleCLI(build_py):
    def run(self):
        super().run()
        target = Path(self.build_lib) / "guimiran_spectra" / "cli"
        for name in DIRECTORIES:
            copytree(ROOT / name, target / name, dirs_exist_ok=True)
        for name in FILES:
            destination = target / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            copy2(ROOT / name, destination)


setup(
    name="guimiran-spectra",
    version=VERSION,
    description="Python distribution of the SPECTRA Node.js CLI",
    url="https://github.com/GuiMiran/spectra",
    python_requires=">=3.9",
    packages=["guimiran_spectra"],
    package_dir={"": "python"},
    entry_points={"console_scripts": ["spectra=guimiran_spectra:main"]},
    cmdclass={"build_py": BundleCLI},
)
