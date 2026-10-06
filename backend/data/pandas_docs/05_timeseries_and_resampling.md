# Time Series & High-Frequency Resampling in Modern Pandas

## 1. Datetime Parsing and Frequency Aliases

Pandas 2.2+ updated frequency aliases for improved ISO compliance:
- Use `'min'` instead of deprecated `'T'` for minutes.
- Use `'s'` instead of deprecated `'S'` for seconds.
- Use `'h'` instead of deprecated `'H'` for hours.
- Use `'ME'` (Month End) instead of deprecated `'M'`.
- Use `'YE'` (Year End) instead of deprecated `'Y'`.

### Example Resampling Pipeline:
```python
import pandas as pd
import numpy as np

# Generate high-frequency timestamps
rng = pd.date_range("2026-01-01 00:00:00", periods=10000, freq="10s")
ts_df = pd.DataFrame({
    'timestamp': rng,
    'price': 100 + np.random.randn(len(rng)).cumsum(),
    'volume': np.random.randint(10, 500, size=len(rng))
}).set_index('timestamp')

# Resample to 5-minute OHLCV candles
ohlcv = ts_df['price'].resample('5min').ohlc()
volume_resampled = ts_df['volume'].resample('5min').sum()

candle_bars = pd.concat([ohlcv, volume_resampled.rename('volume')], axis=1)
```

## 2. Timezone Conversions and Localization
Always localize naive datetimes before conversions:
```python
ts_df.index = ts_df.index.tz_localize('UTC').tz_convert('America/New_York')
```
