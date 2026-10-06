# Merging, Joining, and Concatenation in Pandas 2.x

## 1. Deprecation of `DataFrame.append()`
> **CRITICAL ARCHITECTURAL GUARDRAIL**:
> `DataFrame.append()` and `Series.append()` have been permanently **removed** in Pandas 2.0+.
> Attempting to use `.append()` results in `AttributeError: 'DataFrame' object has no attribute 'append'`.
> All row/column concatenation operations MUST use `pd.concat()`.

### Modern Idiomatic Row Appending with `pd.concat()`:
```python
import pandas as pd

df1 = pd.DataFrame({'sensor_id': [101, 102], 'temp_c': [21.4, 22.1]})
df2 = pd.DataFrame({'sensor_id': [103, 104], 'temp_c': [20.9, 23.5]})

# Concatenate along rows (axis=0) and reset index
combined = pd.concat([df1, df2], ignore_index=True)
```

For incremental row accumulation in loops, never call concatenation inside the loop ($O(N^2)$ quadratic copying). Instead, accumulate dictionaries into a list and construct a DataFrame once:
```python
records = []
for item in stream_source:
    records.append({'metric': item.name, 'value': item.val})
df = pd.DataFrame.from_records(records)
```

## 2. Advanced Merging with `pd.merge()`
`pd.merge()` provides SQL-like relational joins with validation checks:
```python
orders = pd.DataFrame({
    'order_id': [1, 2, 3],
    'customer_id': [10, 20, 10],
    'amount': [120.50, 45.00, 310.20]
})

customers = pd.DataFrame({
    'customer_id': [10, 20, 30],
    'tier': ['Platinum', 'Gold', 'Silver']
})

# Inner, Left, Right, Outer joins with relational cardinality validation
merged = pd.merge(
    orders, 
    customers, 
    on='customer_id', 
    how='left', 
    validate='many_to_one'  # Ensures customer_id is unique in the right table!
)
```

## 3. Merge As-Of for Time-Series Matching
`pd.merge_asof()` performs fuzzy alignment for streaming or financial ticker trades and quotes:
```python
trades = pd.DataFrame({
    'time': pd.to_datetime(['2026-01-01 10:00:01', '2026-01-01 10:00:05']),
    'ticker': ['AAPL', 'AAPL'],
    'price': [150.0, 150.5]
})

quotes = pd.DataFrame({
    'time': pd.to_datetime(['2026-01-01 10:00:00', '2026-01-01 10:00:04']),
    'ticker': ['AAPL', 'AAPL'],
    'bid': [149.9, 150.4],
    'ask': [150.1, 150.6]
})

aligned = pd.merge_asof(trades, quotes, on='time', by='ticker', direction='backward')
```
