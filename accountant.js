// SPDX-License-Identifier: Apache-2.0
//
// Rényi-DP accountant for the Poisson-subsampled Gaussian mechanism (DP-SGD),
// with a per-person bound for people who contribute k records.
//
// - Per-step RDP at integer orders: Mironov, Talwar, Zhang (2019),
//   "Rényi Differential Privacy of the Sampled Gaussian Mechanism".
// - RDP to (epsilon, delta): Balle et al. (2020), "Hypothesis Testing
//   Interpretations and Renyi Differential Privacy" (as used by Opacus and
//   Google's dp-accounting).
//
// Works in the browser (window.PrivacyAccountant) and in Node (require).

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PrivacyAccountant = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ORDERS = [];
  for (let a = 2; a <= 64; a++) ORDERS.push(a);
  for (let a = 72; a <= 512; a += 8) ORDERS.push(a);

  const LOGFACT = [0];
  for (let i = 1; i <= 1024; i++) LOGFACT[i] = LOGFACT[i - 1] + Math.log(i);
  const logBinom = (n, k) => LOGFACT[n] - LOGFACT[k] - LOGFACT[n - k];

  function logAdd(a, b) {
    if (a === -Infinity) return b;
    if (b === -Infinity) return a;
    const m = Math.max(a, b);
    return m + Math.log(Math.exp(a - m) + Math.exp(b - m));
  }

  /** RDP of one step at integer order `alpha`, sampling rate `q`, noise multiplier `sigma`. */
  function rdpStep(q, sigma, alpha) {
    if (q <= 0) return 0;
    if (q >= 1) return alpha / (2 * sigma * sigma);
    const lq = Math.log(q), l1q = Math.log1p(-q);
    let logA = -Infinity;
    for (let i = 0; i <= alpha; i++) {
      logA = logAdd(logA, logBinom(alpha, i) + i * lq + (alpha - i) * l1q + (i * i - i) / (2 * sigma * sigma));
    }
    return logA / (alpha - 1);
  }

  /** (epsilon, delta)-DP epsilon after `steps` steps of DP-SGD. */
  function epsilon(q, sigma, steps, delta) {
    let best = Infinity;
    for (const a of ORDERS) {
      const e = steps * rdpStep(q, sigma, a) + Math.log1p(-1 / a) - (Math.log(delta) + Math.log(a)) / (a - 1);
      if (e < best) best = e;
    }
    return Math.max(0, best);
  }

  /**
   * Upper bound on epsilon for one person with k records under record-level DP-SGD.
   * The person is in a step with probability p = 1 - (1 - q)^k, and their total
   * clipped contribution has norm at most k*C, so each step is bounded by a
   * subsampled Gaussian with rate p and noise multiplier sigma / k.
   * Removal adjacency, as in Opacus. Not tight: the true value can be much lower.
   */
  function personEpsilon(q, sigma, steps, delta, k) {
    return epsilon(1 - Math.pow(1 - q, k), sigma / k, steps, delta);
  }

  /** Highest true-positive rate a membership test can reach at false-positive rate `fpr`. */
  function attackCeiling(eps, delta, fpr = 0.01) {
    return Math.min(1, Math.exp(Math.min(eps, 700)) * fpr + delta);
  }

  return { ORDERS, rdpStep, epsilon, personEpsilon, attackCeiling };
});
