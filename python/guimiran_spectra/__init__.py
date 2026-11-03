"""Launch the bundled SPECTRA CLI without installing anything from npm."""
from pathlib import Path
import shutil
import subprocess
import sys


def main():
    node = shutil.which("node")
    if not node:
        print("SPECTRA requires Node.js >=18 on PATH.", file=sys.stderr)
        return 127
    cli = Path(__file__).resolve().parent / "cli" / "bin" / "spectra.js"
    try:
        result = subprocess.run([node, str(cli), *sys.argv[1:]], check=False)
    except KeyboardInterrupt:
        return 130
    return result.returncode if result.returncode >= 0 else 128 - result.returncode
