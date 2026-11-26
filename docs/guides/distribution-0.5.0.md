# SPECTRA 0.5.0 distribution

The npm package is `@guimiran/spectra`. The proposed PyPI distribution is
`spectra-sdd`. Both install the `spectra` command and require Node.js
18 or newer. The Python package additionally requires Python 3.9 or newer.
It bundles the same CLI and does not fetch npm packages at runtime.

## Verify before release

```sh
npm run verify
npm pack --dry-run --ignore-scripts
python -m pip wheel --no-deps . --wheel-dir dist
```

In separate disposable environments, install the npm tarball and wheel,
then exercise `spectra --version`, `spectra init` and the same existing project
through `spectra status` and `spectra validate`. Avoid installing both
globally on the same PATH because both provide the same command name.

## Publish and install

For future tags, the Release workflow creates the GitHub release and stages
unpublished npm versions. A maintainer approves the staged version with 2FA in
[npm Staged Packages](https://www.npmjs.com/settings/guimiran/staged-packages).
The workflow skips staging if that exact version is already public. To check
or stage an existing tag, run Release manually from the default branch and
enter the tag.
PyPI publishing is separate: verify control of the proposed name and set up
the authorized publishing identity before uploading the wheel and sdist
from the same reviewed commit. This change does not configure a publisher.
After publication, verify both registries and use either:

```sh
npm install -g @guimiran/spectra@0.5.0
python -m pip install spectra-sdd==0.5.0
```

See the [compatibility notes](../../CHANGELOG.md) before upgrading automation
that parses CLI text.
