'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { roundingFixture, idempotencyFixture } = require('../evals/contract-controls');

function roundingSmoke(api) { assert.equal(api.taxCents(1000), 210); }
function roundingEdges(api) {
  for (const [cents, expected] of [[0, 0], [2, 0], [3, 1], [49, 10], [50, 11], [1000000, 210000]]) {
    assert.equal(api.taxCents(cents), expected, `amount=${cents}`);
  }
}

function idempotencySmoke(api) {
  assert.deepEqual(api.submit('first'), { status: 202, id: 1 });
  assert.equal(api.snapshot().length, 1);
}

function idempotencyEdges(api) {
  const first = api.submit('retry');
  const before = api.snapshot();
  for (let attempt = 0; attempt < 3; attempt++) {
    assert.deepEqual(api.submit('retry'), first, 'Same key must return the same reply');
    assert.deepEqual(api.snapshot(), before, 'Same key must not add writes');
  }
  assert.notEqual(api.submit('other').id, first.id);
  assert.equal(api.snapshot().length, 2, 'Distinct key must create a new record');
}

test('rounding reference satisfies the smoke and explicit boundary examples', () => {
  roundingSmoke(roundingFixture());
  roundingEdges(roundingFixture());
});

test('truncation survives the smoke but fails a boundary assertion', () => {
  roundingSmoke(roundingFixture('truncate'));
  assert.throws(() => roundingEdges(roundingFixture('truncate')), { code: 'ERR_ASSERTION' });
});

test('idempotency reference satisfies single submission and repeated submissions', () => {
  idempotencySmoke(idempotencyFixture());
  idempotencyEdges(idempotencyFixture());
});

for (const variant of ['duplicate', 'duplicate-hidden']) {
  test(`${variant} survives the smoke but fails the retry contract`, () => {
    idempotencySmoke(idempotencyFixture(variant));
    assert.throws(() => idempotencyEdges(idempotencyFixture(variant)), { code: 'ERR_ASSERTION' });
  });
}

test('a stable response alone misses hidden duplicate writes', () => {
  const api = idempotencyFixture('duplicate-hidden');
  const first = api.submit('retry');
  assert.deepEqual(api.submit('retry'), first);
  assert.equal(api.snapshot().length, 2);
});

test('fixtures reject unsupported inputs and variant names', () => {
  for (const amount of [-1, 0.1, NaN, Infinity, 1000001, '3', null]) {
    assert.throws(() => roundingFixture().taxCents(amount), RangeError);
  }
  for (const key of ['', ' ', null, 1]) {
    assert.throws(() => idempotencyFixture().submit(key), TypeError);
  }
  assert.throws(() => roundingFixture('other'), /Unknown variant/);
  assert.throws(() => idempotencyFixture('other'), /Unknown variant/);
});
