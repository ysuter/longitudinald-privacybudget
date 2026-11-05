# SPDX-License-Identifier: Apache-2.0
"""Regenerate test/reference.json from Google's dp-accounting library.

    pip install dp-accounting
    python scripts/reference.py > test/reference.json
"""
import json

import dp_accounting as dpa

ORDERS = list(range(2, 65)) + list(range(72, 513, 8))
CASES = [
    (0.01, 1.0, 3000, 1e-5),
    (256 / 60000, 1.1, int(60 * 60000 / 256), 1e-5),
    (0.004, 0.8, 5000, 1e-5),
    (0.05, 2.0, 600, 1e-6),
    (0.02, 1.5, 1500, 1e-5),
    (0.001, 0.6, 20000, 1e-7),
    (0.0394, 0.25, 3000, 1e-5),
]

out = []
for q, sigma, steps, delta in CASES:
    acc = dpa.rdp.RdpAccountant(ORDERS)
    acc.compose(dpa.PoissonSampledDpEvent(q, dpa.GaussianDpEvent(sigma)), steps)
    out.append({"q": q, "sigma": sigma, "steps": steps, "delta": delta,
                "epsilon": acc.get_epsilon(delta)})
print(json.dumps({"source": f"dp-accounting {getattr(dpa, '__version__', '')}".strip(),
                  "orders": "2..64, 72..512 step 8", "cases": out}, indent=2))
