"""
Synthetic Mindanao WESM hourly price generator  (FOR CLASS DEMO ONLY)

Produces a realistic-looking but entirely randomized 8,760-hour price series
in PHP/MWh. It is NOT actual WESM data and is not derived from any company model.

Shape logic
- Daily profile: cheap overnight, solar-dampened midday, high evening peak (18:00-21:00)
- Season: dry season (Mar-May) runs hottest; wet season (Jun-Sep) softer
- Weekends ~12% cheaper
- Random day-level drift + hourly noise
- Occasional scarcity spikes in peak hours, capped at PHP 32,000/MWh

Change SEED to get a different (but equally realistic) series.
"""
import numpy as np
import pandas as pd

SEED = 44
YEAR = 2025
CAP, FLOOR = 32_000, 1_500

rng = np.random.default_rng(SEED)

# Base hourly shape, PHP/MWh (hour 0..23)
base = np.array([
    4300, 4100, 3950, 3900, 4000, 4400,   # 00-05 overnight trough
    5200, 6100, 6600, 6700, 6400, 6100,   # 06-11 morning ramp
    5900, 5900, 6200, 6800, 7900, 9600,   # 12-17 midday, afternoon ramp
    12400, 13200, 12600, 10800, 8100, 5600 # 18-23 evening peak
], dtype=float)

season = {1: 0.92, 2: 0.95, 3: 1.18, 4: 1.30, 5: 1.25, 6: 1.02,
          7: 0.95, 8: 0.93, 9: 0.95, 10: 1.00, 11: 1.03, 12: 0.98}

idx = pd.date_range(f"{YEAR}-01-01", f"{YEAR}-12-31 23:00", freq="h")
n_days = len(idx) // 24

# Day-level drift (mean-reverting random walk around 1.0)
drift = np.ones(n_days)
for d in range(1, n_days):
    drift[d] = 1 + 0.75 * (drift[d - 1] - 1) + rng.normal(0, 0.06)

prices = []
for i, ts in enumerate(idx):
    d = i // 24
    p = base[ts.hour] * season[ts.month] * drift[d]
    if ts.dayofweek >= 5:
        p *= 0.88
    p *= rng.lognormal(0, 0.10)
    # Scarcity spikes: ~3% of 17:00-21:00 hours, more likely in dry season
    spike_prob = 0.05 if ts.month in (3, 4, 5) else 0.025
    if 17 <= ts.hour <= 21 and rng.random() < spike_prob:
        p = rng.uniform(18_000, CAP)
    prices.append(min(max(p, FLOOR), CAP))

df = pd.DataFrame({
    "timestamp": idx.strftime("%Y-%m-%d %H:%M"),
    "hour": idx.hour,
    "month": idx.month,
    "price_php_per_mwh": np.round(prices, 0).astype(int),
})
df.to_csv("synthetic_wesm_mindanao_hourly.csv", index=False)

# Compact 12 x 24 average profile (easy to paste into Base44 as seed data)
prof = df.pivot_table(index="month", columns="hour",
                      values="price_php_per_mwh", aggfunc="mean").round(0).astype(int)
prof.to_csv("synthetic_wesm_monthly_hourly_profile.csv")

daily = df.groupby(df.index // 24)["price_php_per_mwh"]
spread4 = daily.apply(lambda s: np.sort(s.values)[-4:].mean() - np.sort(s.values)[:4].mean())
print(f"Annual average:          PHP {df.price_php_per_mwh.mean():,.0f}/MWh")
print(f"Max / min:               PHP {df.price_php_per_mwh.max():,} / {df.price_php_per_mwh.min():,}")
print(f"Avg daily 4h-4h spread:  PHP {spread4.mean():,.0f}/MWh")
print(f"Hours at cap-level (>18k): {(df.price_php_per_mwh > 18000).sum()}")