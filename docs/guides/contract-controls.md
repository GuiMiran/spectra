# Synthetic rounding and idempotency controls

These two in-memory examples complement [Umbral](umbral.md). They are independent
fixtures under `evals/`, not new CLI commands or production release policies.
No network, external APIs, agents or credentials are involved.

Run `node --test test/contract-controls.test.js`, or `npm run verify` to include
the repository suite. Existing CI discovers the tests automatically.

## Explicit example contracts

- Rounding: integer cents from 0 through 1,000,000; calculate 21% and round
  nonnegative results half-up per operation. Two cents yields zero tax cents,
  three yields one and fifty yields eleven. This is a synthetic policy, not a
  claim about tax compliance, tax-inclusive pricing or invoice-level rounding.
- Idempotency: repeated submissions of the same nonempty string key in one
  fixture return the same response and leave one stored record. A distinct key
  creates a distinct record. There is no payload, expiry or cross-process storage.

| Seeded defect | Basic smoke | Stronger contract checks |
| --- | --- | --- |
| Truncate tax instead of rounding | Pass | Detected |
| Same key creates a new record and response | Pass | Detected |
| Same key repeats the response but secretly adds a record | Pass | Detected |

The reference implementations pass both kinds of check. Mutation controls
assert that each known defect is caught; a successful suite therefore contains
expected assertion failures inside these controls.

These public, hand-constructed cases show only that the specified assertions
distinguish the seeded faults. They do not measure agent performance, general
fault detection, concurrent retries, distributed exactly-once guarantees or
transactional rollback.
