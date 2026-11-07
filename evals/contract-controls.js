'use strict';

// Synthetic examples only: these are not fiscal rules or a production service.
function roundingFixture(variant = 'reference') {
  if (!['reference', 'truncate'].includes(variant)) throw new Error('Unknown variant');
  return {
    taxCents(cents) {
      if (!Number.isSafeInteger(cents) || cents < 0 || cents > 1000000) {
        throw new RangeError('Expected integer cents from 0 to 1000000');
      }
      // Explicit example policy: 21%, nonnegative amounts, half-up per operation.
      return variant === 'truncate' ? Math.floor(cents * 21 / 100)
        : Math.floor((cents * 21 + 50) / 100);
    },
  };
}

function idempotencyFixture(variant = 'reference') {
  if (!['reference', 'duplicate', 'duplicate-hidden'].includes(variant)) throw new Error('Unknown variant');
  const replies = new Map();
  const records = [];
  return {
    submit(key) {
      if (typeof key !== 'string' || !key.trim()) throw new TypeError('Expected a nonempty key');
      const prior = replies.get(key);
      if (prior && variant === 'reference') return { ...prior };
      const reply = { status: 202, id: records.length + 1 };
      records.push({ key, id: reply.id });
      if (!prior) replies.set(key, reply);
      return { ...(prior && variant === 'duplicate-hidden' ? prior : reply) };
    },
    snapshot() { return records.map(record => ({ ...record })); },
  };
}

module.exports = { roundingFixture, idempotencyFixture };
