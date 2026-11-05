// SPDX-License-Identifier: Apache-2.0
// Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { epsilon, personEpsilon, attackCeiling } = require('../accountant.js');
const ref = require(path.join(__dirname, 'reference.json'));

test('epsilon matches dp-accounting reference values', () => {
  for (const c of ref.cases) {
    const got = epsilon(c.q, c.sigma, c.steps, c.delta);
    const rel = Math.abs(got - c.epsilon) / c.epsilon;
    assert.ok(rel < 1e-6, `q=${c.q} sigma=${c.sigma} steps=${c.steps}: got ${got}, expected ${c.epsilon}`);
  }
});

test('person bound with k = 1 equals the record-level epsilon', () => {
  const a = personEpsilon(0.01, 1.0, 3000, 1e-5, 1), b = epsilon(0.01, 1.0, 3000, 1e-5);
  assert.ok(Math.abs(a - b) / b < 1e-9, `${a} vs ${b}`);
});

test('person bound grows with the number of sessions', () => {
  let prev = 0;
  for (let k = 1; k <= 16; k++) {
    const e = personEpsilon(0.01, 1.0, 3000, 1e-5, k);
    assert.ok(e >= prev, `k=${k}`);
    prev = e;
  }
});

test('attack ceiling stays in [0, 1]', () => {
  assert.ok(Math.abs(attackCeiling(0, 0) - 0.01) < 1e-12);
  assert.equal(attackCeiling(1e6, 1e-5), 1);
});
