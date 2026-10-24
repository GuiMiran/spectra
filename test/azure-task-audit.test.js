'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { scanYaml } = require('../scripts/audit-azure-tasks');

test('finds retired versions in YAML task declarations only', () => {
  const source = [
    '# - task: DotNetCoreCLI@1',
    'steps:',
    '  - task: DotNetCoreCLI@1 # legacy',
    '  - task: "NuGetRestore@1"',
    '  - task: DotNetCoreCLI@2',
    '  - script: echo task: PowerShell@1',
  ].join('\n');
  assert.deepEqual(scanYaml(source, 'azure-pipelines.yml'), [
    { file: 'azure-pipelines.yml', line: 3, task: 'DotNetCoreCLI@1', replacement: 'DotNetCoreCLI@2' },
    { file: 'azure-pipelines.yml', line: 4, task: 'NuGetRestore@1', replacement: 'NuGetCommand@2 (restore)' },
  ]);
});
