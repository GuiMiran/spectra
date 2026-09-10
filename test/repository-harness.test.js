'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { verifyRepository } = require('../scripts/verify-repository');

test('repository SPECTRA matrix and verification harness are internally consistent', () => {
  assert.doesNotThrow(() => verifyRepository());
});
