# Groupby, Aggregation, and Transforms in Modern Pandas

## 1. Modern Groupby Best Practices

In modern Pandas, `groupby` operations must account for the `observed` parameter with categorical types and utilize named aggregation for clean, bug-free pipelines.

### Named Aggregation
Avoid ambiguous dictionary aggregations with nested lists. Use keyword arguments to assign explicit column output names:
```python
import pandas as pd

df = pd.DataFrame({
    'region': ['US-East', 'US-East', 'EU-West', 'EU-West'],
    'service': ['Compute', 'Storage', 'Compute', 'Storage'],
    'latency_ms': [12.4, 45.1, 8.2, 52.3],
    'requests': [1200, 450, 2100, 890]
})

summary = df.groupby('region', observed=False).agg(
    avg_latency=('latency_ms', 'mean'),
    max_latency=('latency_ms', 'max'),
    total_volume=('requests', 'sum')
).reset_index()
```

### 2. Fast Transformations with `.transform()`
Transform maintains the original DataFrame length while broadcasting group-level calculations:
```python
# Compute group z-scores without merging back
df['latency_zscore'] = df.groupby('region')['latency_ms'].transform(
    lambda x: (x - x.mean()) / (x.std() + 1e-9)
)
```

### 3. Window Operations: Rolling and Expanding
```python
# Compute rolling 7-period moving average
df['rolling_reqs'] = df.groupby('region')['requests'].rolling(window=3, min_periods=1).mean().reset_index(level=0, drop=True)
```
