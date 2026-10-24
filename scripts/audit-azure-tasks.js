'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Azure DevOps Services retirement list, 2026-10-15. Keep this list tied to
// https://learn.microsoft.com/azure/devops/pipelines/tasks/task-retirement
const REPLACEMENTS = Object.freeze({
  'DotNetCoreInstaller@0': 'UseDotNet@2', 'DotNetCoreInstaller@1': 'UseDotNet@2',
  'DotNetCoreCLI@0': 'DotNetCoreCLI@2', 'DotNetCoreCLI@1': 'DotNetCoreCLI@2',
  'NuGet@0': 'NuGetCommand@2', 'NuGetInstaller@0': 'NuGetToolInstaller@1 + NuGetCommand@2',
  'NuGetPackager@0': 'NuGetCommand@2 (pack)', 'NuGetPublisher@0': 'NuGetCommand@2 (push)',
  'NuGetRestore@1': 'NuGetCommand@2 (restore)',
  'DownloadPipelineArtifact@0': 'DownloadPipelineArtifact@2',
  'DeployVisualStudioTestAgent@1': 'VSTest@3',
  'RunVisualStudioTestsusingTestAgent@1': 'VSTest@3',
  'QuickPerfTest@1': 'AzureLoadTest@1', 'AzureMonitor@0': 'AzureMonitor@1',
  'AutomatedAnalysis@0': 'supported analysis/monitoring workflow',
  'InvokeRESTAPI@0': 'InvokeRESTAPI@1', 'PowerShell@1': 'PowerShell@2', 'CmdLine@1': 'CmdLine@2',
});

function scanYaml(source, filename) {
  const findings = [];
  source.split(/\r?\n/).forEach((line, index) => {
    // Match YAML task declarations, not comments or arbitrary references in scripts.
    const match = line.match(/^\s*(?:-\s*)?task:\s*['"]?([A-Za-z][\w]*@\d+)['"]?(?:\s*(?:#.*)?)?$/);
    if (match && Object.hasOwn(REPLACEMENTS, match[1])) {
      findings.push({ file: filename, line: index + 1, task: match[1], replacement: REPLACEMENTS[match[1]] });
    }
  });
  return findings;
}

function scanPath(target) {
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) return [];
  if (stat.isDirectory()) {
    return fs.readdirSync(target, { withFileTypes: true })
      .filter(entry => !['.git', 'node_modules'].includes(entry.name) && !entry.isSymbolicLink())
      .flatMap(entry => scanPath(path.join(target, entry.name)));
  }
  return /\.ya?ml$/i.test(target) ? scanYaml(fs.readFileSync(target, 'utf8'), target) : [];
}

function main(args = process.argv.slice(2)) {
  if (args.length === 0) throw new Error('Usage: npm run audit:azure-tasks -- <YAML file or directory> [...]');
  const findings = args.flatMap(scanPath);
  for (const item of findings) process.stdout.write(`${item.file}:${item.line} ${item.task} -> ${item.replacement}\n`);
  process.stdout.write(`${findings.length} selected retired Azure DevOps task(s) found in YAML. Classic pipelines and other retired tasks are not scanned.\n`);
  if (findings.length) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 2; }
}

module.exports = { REPLACEMENTS, scanYaml, scanPath };
