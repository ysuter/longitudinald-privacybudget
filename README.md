<!-- SPDX-License-Identifier: Apache-2.0 -->
# Privacy Receipt Calculator

What does a stated differential-privacy budget mean for one patient whose digital health twin holds several MRI sessions?

A model trained with DP-SGD states one privacy budget ε per record. A patient with k longitudinal sessions contributes k records. This calculator prints that patient's "privacy receipt":

- the stated per-record budget,
- a worst-case upper bound for all k sessions together under record-level training,
- the budget under user-level (per-person) training,
- for each, the highest success rate a membership attack can reach at a 1% false-positive rate.

It is a single static page.

## Use it

- **Online:** enable GitHub Pages (below) and open `https://<user>.github.io/<repo>/`.
- **Locally:** open `index.html` in a browser. No build step, no server needed.

## Method

Per-step Rényi DP of the Poisson-subsampled Gaussian at integer orders 2–64 and 72–512 (Mironov, Talwar, Zhang, 2019), composed over all steps and converted to (ε, δ) as in Balle et al. (2020). This is the same method as Opacus and Google's `dp-accounting`.

**Per-person bound.** A person with k records is in a step with probability p = 1 − (1 − q)^k. Their total clipped contribution has norm at most k·C against noise σ·C, so each step is bounded by a subsampled Gaussian with rate p and noise multiplier σ/k. This is a valid upper bound (removal adjacency), not a tight one: the true leakage for a person lies between the stated budget and this bound. Measuring where it lies needs an empirical audit, which is the subject of the follow-up project.

**Attack ceiling.** For an (ε, δ)-DP mechanism, a membership test at false-positive rate α has true-positive rate at most min(1, e^ε · α + δ).

## Tests

```
node --test
```

The tests compare `accountant.js` against reference values from Google's `dp-accounting` (stored in `test/reference.json`, relative tolerance 1e-6). To regenerate them:

```
pip install dp-accounting
python scripts/reference.py > test/reference.json
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The calculator page |
| `accountant.js` | The accountant; works in the browser and in Node |
| `test/` | Tests and reference values |
| `scripts/reference.py` | Regenerates the reference values |

## Licence

Apache-2.0, see `LICENSE`. Every source file carries an SPDX identifier.

## Context

Preliminary work.

## References

- I. Mironov, K. Talwar, L. Zhang. Rényi Differential Privacy of the Sampled Gaussian Mechanism. arXiv:1908.10530, 2019.
- B. Balle, G. Barthe, M. Gaboardi, J. Hsu, T. Sato. Hypothesis Testing Interpretations and Renyi Differential Privacy. AISTATS 2020.
- M. Abadi et al. Deep Learning with Differential Privacy. CCS 2016.
