'use strict';
const { createHash } = require('node:crypto');

// Trusted, in-memory reference products and deliberately injected defects.
// No candidate-supplied code, shell, network, or persistent state is executed.
async function retry(variant, input) {
  const receipts = new Map(), completed = new Set();
  let effects = 0, chargedCents = 0, attempts = 0, lost = false, delivered = false;
  async function charge() {
    const seen = variant === 'alternative' ? completed.has(input.operationId) : receipts.has(input.operationId);
    if (!seen || variant === 'duplicate-effect') {
      effects++; chargedCents += input.amountCents;
      receipts.set(input.operationId, { accepted: true }); completed.add(input.operationId);
    }
    if (!lost) { lost = true; throw new Error('synthetic-response-lost-after-commit'); }
    return receipts.get(input.operationId);
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    attempts++;
    try { delivered = Boolean((await charge())?.accepted); break; }
    catch { if (variant === 'no-retry') break; }
  }
  return { effects, chargedCents, attempts, delivered };
}

async function concurrency(variant, input) {
  let active = 0, peak = 0, accepted = 0, rejected = 0, finished = 0;
  const slots = new Set();
  await Promise.all(Array.from({ length: input.jobs }, async (_, index) => {
    if (variant === 'reject-all') { rejected++; return; }
    const available = variant === 'alternative' ? slots.size < input.limit : active < input.limit;
    if (!available) { rejected++; return; }
    // The faulty check-before-yield lets every worker observe the same capacity.
    if (variant === 'check-before-yield') await Promise.resolve();
    slots.add(index); active++; accepted++; peak = Math.max(peak, active);
    await Promise.resolve();
    active--; slots.delete(index); finished++;
  }));
  return { accepted, rejected, finished, peak, active };
}

async function trace(variant, input) {
  const events = ['received', 'decided', 'completed'].map((state, index) => {
    const event = { sequence: index + 1, traceId: input.traceId, operationId: input.operationId, state };
    if (variant !== 'alternative') event.payloadDigest = createHash('sha256').update(input.operationId).digest('hex');
    if (variant === 'raw-sensitive-data') { event.token = input.token; event.email = input.email; }
    if (variant === 'drop-correlation') delete event.traceId;
    return event;
  });
  return { events };
}

async function compatibility(variant, input) {
  function qualify(required) {
    if (input.legacy.schemaVersion !== (variant === 'reject-v1' ? 2 : 1)) return { accepted: false, state: 'UNKNOWN' };
    if (required === null) return { accepted: true, state: variant === 'absence-is-pass' ? 'PASS' : 'UNKNOWN' };
    const index = new Map(input.legacy.results.map(result => [result.id, result.status]));
    const passed = required.length > 0 && required.every(id => variant === 'alternative'
      ? input.legacy.results.some(result => result.id === id && result.status === 'passed') : index.get(id) === 'passed');
    return { accepted: true, state: passed ? 'PASS' : 'UNKNOWN' };
  }
  return { absent: qualify(null), complete: qualify(input.complete), missing: qualify(input.missing) };
}

const registry = {
  'retry-idempotency': { run: retry, variants: ['reference', 'alternative', 'duplicate-effect', 'no-retry'] },
  'concurrency-limits': { run: concurrency, variants: ['reference', 'alternative', 'check-before-yield', 'reject-all'] },
  'trace-privacy': { run: trace, variants: ['reference', 'alternative', 'raw-sensitive-data', 'drop-correlation'] },
  'compatibility-validation': { run: compatibility, variants: ['reference', 'alternative', 'reject-v1', 'absence-is-pass'] },
};

async function runVariant(caseId, variant, input) {
  const entry = registry[caseId];
  if (!Object.hasOwn(registry, caseId) || !entry.variants.includes(variant)) throw new Error('Unknown Stage 2 control implementation.');
  return entry.run(variant, input);
}

module.exports = { runVariant };
