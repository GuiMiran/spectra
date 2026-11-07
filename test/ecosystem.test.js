'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { validateManifest, extractVersion, observe, renderObservation } = require('../lib/ecosystem');
const original = require('../docs/ecosystem/components.json');
const clone = () => JSON.parse(JSON.stringify(original));

test('manifest pins five distinct known repositories without compatibility claims', () => {
  assert.equal(validateManifest(clone()).components.length, 5);
  for (const mutate of [
    m => { m.compatibility = 'VERIFIED'; },
    m => { m.components[0].revision = 'main'; },
    m => { m.components[0].repository = 'other/repo'; },
    m => { m.components[1] = m.components[0]; },
    m => { m.components[1].versions[0].path = '../../secret'; },
    m => { m.components[1].versions = []; },
  ]) {
    const manifest = clone();
    mutate(manifest);
    assert.throws(() => validateManifest(manifest));
  }
});

test('version extraction uses package or project fields, not incidental numbers', () => {
  assert.equal(extractVersion('{"version":"0.5.0"}', 'node-package'), '0.5.0');
  assert.equal(extractVersion('[build-system]\nrequires=["setuptools"]\n[project]\nversion = "0.1.0"\n[other]\nversion="9.0.0"', 'python-project'), '0.1.0');
  assert.throws(() => extractVersion('{"version":"<script>"}', 'node-package'));
  assert.throws(() => extractVersion('[tool.x]\nversion="1.0.0"', 'python-project'));
});

function mock(manifest, changed = false) {
  const calls = [];
  const get = async route => {
    calls.push(route);
    const component = manifest.components.find(c => route.startsWith('/repos/' + c.repository + '/'));
    assert.ok(component);
    if (route.endsWith('/branches/main')) return { commit: { sha: changed ? 'f'.repeat(40) : component.revision } };
    if (route.endsWith('/releases/latest')) return component.id === 'spectra' ? { tag_name: 'v0.4.0' } : null;
    const source = component.versions.find(v => route.includes('/contents/' + v.path + '?ref='));
    assert.ok(source);
    const text = source.format === 'node-package' ? JSON.stringify({ version: source.declared })
      : '[project]\nversion = "' + source.declared + '"\n';
    return { encoding: 'base64', content: Buffer.from(text).toString('base64') };
  };
  return { calls, get };
}

test('observation detects commit drift without changing pins or claiming compatibility', async () => {
  const manifest = clone();
  const before = JSON.stringify(manifest);
  const remote = mock(manifest, true);
  const report = await observe(manifest, remote.get);
  assert.ok(report.components.every(c => c.status === 'REVISION_CHANGED'));
  assert.equal(report.compatibility, 'NOT_VERIFIED');
  assert.equal(JSON.stringify(manifest), before);
  assert.ok(remote.calls.filter(c => c.includes('/contents/')).every(c => c.endsWith('f'.repeat(40))));
  const markdown = renderObservation(report);
  assert.match(markdown, /v0.4.0/);
  assert.match(markdown, /package.json: 0.5.0/);
});

test('same revision and no release remain explicit, not an upgrade or certificate', async () => {
  const manifest = clone();
  const report = await observe(manifest, mock(manifest).get);
  assert.ok(report.components.every(c => c.status === 'SAME_REVISION'));
  assert.equal(report.components[0].latestRelease, null);
  assert.match(renderObservation(report), /No published release returned/);
});

test('API failures cannot replace complete documentation', async () => {
  const report = await observe(clone(), async () => { throw new Error('unavailable'); });
  assert.ok(report.components.every(c => c.status === 'OBSERVATION_ERROR'));
  assert.throws(() => renderObservation(report), /Incomplete/);
});

test('invalid remote identity, version or release is unresolved, never rendered as success', async () => {
  for (const broken of ['revision', 'version', 'release']) {
    const manifest = clone();
    const remote = mock(manifest);
    const report = await observe(manifest, async route => {
      if (broken === 'revision' && route.endsWith('/branches/main')) return { commit: { sha: 'main' } };
      if (broken === 'release' && route.endsWith('/releases/latest')) return { tag_name: '<script>' };
      if (broken === 'version' && route.includes('/contents/')) return { encoding: 'base64', content: Buffer.from('{}').toString('base64') };
      return remote.get(route);
    });
    assert.ok(report.components.some(c => c.status === 'OBSERVATION_ERROR'));
    assert.throws(() => renderObservation(report));
  }
});
