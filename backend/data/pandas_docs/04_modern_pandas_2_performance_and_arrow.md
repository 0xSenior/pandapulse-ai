# Modern Pandas 2.x Performance, Vectorization & PyArrow Engine

## 1. PyArrow Data Types in Pandas 2.0+
Pandas 2.0 introduced native Apache Arrow backing for columns. This eliminates high memory overhead for string types, supports native missing values (`pd.NA`), and enables SIMD vector acceleration.

### Enabling PyArrow Engine
```python
import pandas as pd

# Reading Parquet or CSV with PyArrow backend
df = pd.read_csv("telemetry_logs.csv", engine="pyarrow", dtype_backend="pyarrow")

# Convert existing string columns to PyArrow strings
df['user_id'] = df['user_id'].astype("string[pyarrow]")
```

Benefits:
- **Up to 70% lower memory footprint** for textual and nested categorical fields.
- Zero-copy data sharing between Python and high-performance native engines.

## 2. Copy-on-Write (CoW)
In Pandas 2.0+, Copy-on-Write transforms memory safety:
```python
pd.options.mode.copy_on_write = True

base = pd.DataFrame({'val': [1, 2, 3]})
subset = base[base['val'] > 1]
# Under CoW, modifying subset never mutates base, and no eager shallow copies are made!
subset['val'] = 99
```

## 3. Strict Elimination of Row Loops
Never use `for idx, row in df.iterrows():` in production pipelines!
- `df.iterrows()` yields $1000\times$ slower execution due to boxed Series overhead.
- Use vectorized numpy operations, `np.select`, `pd.Series.map`, or Numba JIT:
```python
import numpy as np

# Vectorized conditional categorization
conditions = [
    df['latency_ms'] < 20,
    df['latency_ms'] < 100
]
choices = ['Fast', 'Normal']
df['speed_tier'] = np.select(conditions, choices, default='Degraded')
```
