'use strict';

const fs = require('fs');
const path = require('path');
const { invariant, validateAgent } = require('./contracts');
const { clone, ensureDir, readJson, sha256, stableStringify, writeJsonAtomic } = require('./utils');

const GENESIS_HASH = '0'.repeat(64);

class AgentRegistry {
  constructor(projectRoot, options = {}) {
    this.root = options.root || path.join(projectRoot, '.spectra', 'evolution');
    this.registryFile = path.join(this.root, 'registry.json');
    this.auditFile = path.join(this.root, 'audit.jsonl');
    this.clock = options.clock || (() => new Date().toISOString());
    this.maxAgentVersions = options.maxAgentVersions || 10;
    this.state = readJson(this.registryFile, {
      schemaVersion: 1,
      agents: {},
      activeByCapability: {},
      auditHead: GENESIS_HASH,
      updatedAt: null,
    });
  }

  save() {
    this.state.updatedAt = this.clock();
    writeJsonAtomic(this.registryFile, this.state);
  }

  appendAudit(type, payload) {
    ensureDir(this.root);
    const event = {
      schemaVersion: 1,
      sequence: this.auditEvents().length + 1,
      timestamp: this.clock(),
      type,
      previousHash: this.state.auditHead || GENESIS_HASH,
      payload: clone(payload),
    };
    event.hash = sha256(event);
    fs.appendFileSync(this.auditFile, `${JSON.stringify(event)}\n`, 'utf8');
    this.state.auditHead = event.hash;
    return clone(event);
  }

  auditEvents() {
    if (!fs.existsSync(this.auditFile)) return [];
    return fs.readFileSync(this.auditFile, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }

  verifyAuditChain() {
    const events = this.auditEvents();
    let previousHash = GENESIS_HASH;
    for (const event of events) {
      const { hash, ...body } = event;
      if (event.previousHash !== previousHash || sha256(body) !== hash) {
        return { valid: false, events: events.length, failedSequence: event.sequence };
      }
      previousHash = hash;
    }
    const headMatches = previousHash === (this.state.auditHead || GENESIS_HASH);
    return { valid: headMatches, events: events.length, head: previousHash };
  }

  versions(agentId) {
    return clone(this.state.agents[agentId] || []);
  }

  list() {
    return Object.values(this.state.agents).flat().map(clone);
  }

  get(agentId, version) {
    const record = (this.state.agents[agentId] || []).find(item => item.definition.version === version);
    return record ? clone(record) : null;
  }

  getActive(capability) {
    const pointer = this.state.activeByCapability[capability];
    return pointer ? this.get(pointer.id, pointer.version) : null;
  }

  registerCandidate(definition, context) {
    const agent = validateAgent(definition);
    const versions = this.state.agents[agent.id] || [];
    invariant(versions.length < this.maxAgentVersions, `Agent ${agent.id} reached maxAgentVersions.`);
    invariant(!versions.some(record => record.definition.version === agent.version), `Agent ${agent.id} v${agent.version} already exists.`);
    const record = {
      definition: clone(agent),
      status: 'candidate',
      createdAt: this.clock(),
      evaluation: null,
      lifecycleReason: 'factory-proposal',
      runId: context.runId,
      supersedes: context.supersedes || null,
    };
    this.state.agents[agent.id] = [...versions, record];
    this.appendAudit('candidate.registered', {
      runId: context.runId,
      agent: { id: agent.id, version: agent.version, capabilities: agent.capabilities },
      supersedes: record.supersedes,
      mutation: context.mutation,
    });
    this.save();
    return clone(record);
  }

  recordEvaluation(agentId, version, evaluation, runId) {
    const record = (this.state.agents[agentId] || []).find(item => item.definition.version === version);
    invariant(record, `Unknown agent ${agentId} v${version}.`);
    record.evaluation = clone(evaluation);
    this.appendAudit('candidate.evaluated', {
      runId,
      agent: { id: agentId, version },
      evaluation,
    });
    this.save();
  }

  promote(agentId, version, evaluation, runId) {
    const record = (this.state.agents[agentId] || []).find(item => item.definition.version === version);
    invariant(record && record.status === 'candidate', `Only a candidate can be promoted: ${agentId} v${version}.`);
    const capability = record.definition.capabilities[0];
    const previousPointer = this.state.activeByCapability[capability];
    if (previousPointer) {
      const previous = (this.state.agents[previousPointer.id] || []).find(item => item.definition.version === previousPointer.version);
      if (previous) {
        previous.status = 'retired';
        previous.retiredAt = this.clock();
        previous.lifecycleReason = `superseded-by:${agentId}@${version}`;
      }
    }
    record.status = 'active';
    record.promotedAt = this.clock();
    record.lifecycleReason = 'evaluation-improvement';
    record.evaluation = clone(evaluation);
    this.state.activeByCapability[capability] = { id: agentId, version };
    this.appendAudit('candidate.promoted', {
      runId,
      agent: { id: agentId, version, capability },
      replaced: previousPointer || null,
      evidence: evaluation,
    });
    this.save();
  }

  reject(agentId, version, reason, evaluation, runId) {
    const record = (this.state.agents[agentId] || []).find(item => item.definition.version === version);
    invariant(record && record.status === 'candidate', `Only a candidate can be rejected: ${agentId} v${version}.`);
    record.status = 'rejected';
    record.rejectedAt = this.clock();
    record.lifecycleReason = reason;
    record.evaluation = clone(evaluation);
    this.appendAudit('candidate.rejected', {
      runId,
      agent: { id: agentId, version },
      reason,
      evidence: evaluation,
    });
    this.save();
  }

  retireUnneeded(requiredCapabilities, runId) {
    const required = new Set(requiredCapabilities);
    const retired = [];
    Object.entries({ ...this.state.activeByCapability }).forEach(([capability, pointer]) => {
      if (required.has(capability)) return;
      const record = (this.state.agents[pointer.id] || []).find(item => item.definition.version === pointer.version);
      if (record) {
        record.status = 'retired';
        record.retiredAt = this.clock();
        record.lifecycleReason = 'capability-no-longer-required';
        retired.push({ capability, ...pointer });
      }
      delete this.state.activeByCapability[capability];
    });
    if (retired.length) {
      this.appendAudit('agents.retired', { runId, retired });
      this.save();
    }
    return retired;
  }

  summary() {
    const records = this.list();
    return {
      schemaVersion: this.state.schemaVersion,
      totalVersions: records.length,
      active: records.filter(record => record.status === 'active').map(record => ({
        id: record.definition.id,
        version: record.definition.version,
        capability: record.definition.capabilities[0],
        score: record.evaluation?.candidate?.score ?? null,
      })),
      lifecycle: records.reduce((counts, record) => {
        counts[record.status] = (counts[record.status] || 0) + 1;
        return counts;
      }, {}),
      audit: this.verifyAuditChain(),
    };
  }
}

module.exports = { AgentRegistry, GENESIS_HASH };
