# Missing Data Semantics and Categorical Optimization

## 1. Native Nullability: `pd.NA` vs `np.nan`
Traditionally, integer columns in Pandas were cast to `float64` whenever nulls existed because NumPy had no NaN for ints.
Pandas 2.x introduces nullable extension types:
- `Int64` (nullable integer)
- `boolean` (nullable boolean with ternary logic: True, False, NA)
- `string[pyarrow]` (Arrow backed nullable string)

```python
import pandas as pd

# Nullable integer preserves int types alongside pd.NA
s = pd.Series([1, 2, None, 4], dtype="Int64")
print(s.isna())  # Correctly identifies NA without float promotion
```

## 2. Categorical Encodings for Cardinality Reduction
When working with repeated string values (e.g., states, country codes, order status), convert columns to `'category'`:
```python
df['status'] = df['status'].astype('category')
# Memory footprint drops up to 90% for high-repetition categorical columns
```
