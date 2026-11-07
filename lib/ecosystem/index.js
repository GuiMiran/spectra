'use strict';

const COMPONENTS = {
  stack: ['GuiMiran/guido-sdd-engineering-stack', 'DEFINE'],
  scale: ['GuiMiran/guido-sdd-migration-effort-scale', 'MEASURE'],
  spectra: ['GuiMiran/spectra', 'UNDERSTAND_DECIDE'],
  runtime: ['GuiMiran/guido-autonomous-runtime', 'EXECUTE'],
  pipeline: ['GuiMiran/guido-agentic-pipeline', 'PROVE'],
};
const VERSION = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/;
const SHA = /^[a-f0-9]{40}$/;
const SOURCES = {
  stack: [], scale: ['pyproject.toml'], spectra: ['package.json'],
  runtime: ['autonomy/package.json', 'evaluation/package.json'], pipeline: [],
};

function validateManifest(manifest) {
  if (manifest.schemaVersion !== 1 || !VERSION.test(manifest.baselineVersion)
      || manifest.owner !== 'GuiMiran' || manifest.compatibility !== 'NOT_VERIFIED'
      || !Array.isArray(manifest.components) || manifest.components.length !== 5) {
    throw new Error('Invalid ecosystem manifest envelope');
  }
  const ids = new Set();
  for (const component of manifest.components) {
    const expected = COMPONENTS[component.id];
    if (!expected || ids.has(component.id) || component.repository !== expected[0]
        || component.role !== expected[1] || !SHA.test(component.revision)
        || !Array.isArray(component.versions)) throw new Error('Invalid component identity or revision');
    ids.add(component.id);
    const paths = new Set();
    for (const source of component.versions) {
      if (!SOURCES[component.id].includes(source.path) || paths.has(source.path)
          || !VERSION.test(source.declared)
          || source.format !== (source.path === 'pyproject.toml' ? 'python-project' : 'node-package')) {
        throw new Error('Invalid version source');
      }
      paths.add(source.path);
    }
    if (paths.size !== SOURCES[component.id].length) throw new Error('Missing version source');
  }
  return manifest;
}

function extractVersion(text, format) {
  let value;
  if (format === 'node-package') value = JSON.parse(text).version;
  else if (format === 'python-project') {
    const section = text.match(/^\[project\]\s*\n([\s\S]*?)(?=^\[|$(?![\s\S]))/m);
    value = section?.[1].match(/^version\s*=\s*"([^"]+)"\s*$/m)?.[1];
  }
  if (typeof value !== 'string' || !VERSION.test(value)) throw new Error('Invalid declared version');
  return value;
}

async function githubJSON(path) {
  if (!/^\/repos\/GuiMiran\/[A-Za-z0-9-]+\//.test(path)) throw new Error('Unapproved API path');
  const response = await fetch('https://api.github.com' + path, {
    redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'GUIDO-ecosystem-observer',
      ...(process.env.GH_TOKEN ? { Authorization: 'Bearer ' + process.env.GH_TOKEN } : {}),
    },
  });
  if (response.status === 404 && path.endsWith('/releases/latest')) return null;
  if (!response.ok) throw new Error('GitHub request failed: HTTP ' + response.status);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 1048576) throw new Error('GitHub response exceeds limit');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function observe(manifest, get = githubJSON) {
  validateManifest(manifest);
  const components = [];
  for (const component of manifest.components) {
    try {
      const repo = '/repos/' + component.repository;
      const metadata = await get(repo + '/branches/main');
      const revision = metadata?.commit?.sha;
      if (!SHA.test(revision)) throw new Error('Invalid observed revision');
      const release = await get(repo + '/releases/latest');
      if (release !== null && (typeof release.tag_name !== 'string'
          || !/^[A-Za-z0-9._-]{1,80}$/.test(release.tag_name))) throw new Error('Invalid release tag');
      const versions = [];
      for (const source of component.versions) {
        const file = await get(repo + '/contents/' + source.path + '?ref=' + revision);
        if (file.encoding !== 'base64' || typeof file.content !== 'string' || file.content.length > 262144) {
          throw new Error('Invalid version file response');
        }
        const declared = extractVersion(Buffer.from(file.content, 'base64').toString('utf8'), source.format);
        versions.push({ path: source.path, declared, baselineDeclared: source.declared });
      }
      components.push({
        id: component.id, repository: component.repository, baselineRevision: component.revision,
        revision, status: revision === component.revision ? 'SAME_REVISION' : 'REVISION_CHANGED',
        versions, latestRelease: release?.tag_name ?? null,
      });
    } catch {
      // Keep partial errors explicit without leaking remote bodies or credentials.
      components.push({ id: component.id, repository: component.repository, status: 'OBSERVATION_ERROR' });
    }
  }
  return { schemaVersion: 1, baselineVersion: manifest.baselineVersion,
    compatibility: 'NOT_VERIFIED', components };
}

function renderObservation(report) {
  const lines = [
    '# Observed ecosystem versions', '',
    'Generated observations only. Baseline pins and compatibility are not updated.',
    'A release tag, a package declaration and a deployed version are different facts.',
    'CI, deployment and cross-component compatibility are NOT VERIFIED by this report.', '',
    '| Component | Baseline commit | Observed main commit | Declared version at observed commit | Latest published release tag | State |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const item of report.components) {
    if (item.status === 'OBSERVATION_ERROR') throw new Error('Incomplete observation cannot replace documentation');
    lines.push('| ' + [
      '[' + item.id + '](https://github.com/' + item.repository + ')',
      '[' + item.baselineRevision.slice(0, 7) + '](https://github.com/' + item.repository + '/commit/' + item.baselineRevision + ')',
      '[' + item.revision.slice(0, 7) + '](https://github.com/' + item.repository + '/commit/' + item.revision + ')',
      item.versions.map(v => v.path + ': ' + v.declared).join('; ') || 'No version source configured',
      item.latestRelease || 'No published release returned', item.status,
    ].join(' | ') + ' |');
  }
  return lines.join('\n') + '\n';
}

module.exports = { validateManifest, extractVersion, observe, renderObservation };
