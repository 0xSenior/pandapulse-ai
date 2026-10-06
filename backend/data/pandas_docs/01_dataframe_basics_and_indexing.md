# Modern Indexing & Selection in Pandas 2.x

## Core Principles

In modern Pandas (2.0+), precise selection and indexing must strictly adhere to explicit label and position accessors.

### 1. Label-Based Indexing with `.loc`
`.loc` is used for selection by label/name or boolean masks:
```python
import pandas as pd

df = pd.DataFrame({
    'ticker': ['AAPL', 'MSFT', 'GOOGL', 'NVDA'],
    'price': [182.5, 415.2, 175.4, 880.0],
    'volume': [54000000, 22000000, 18000000, 45000000]
}, index=['tech_1', 'tech_2', 'tech_3', 'tech_4'])

# Single row by label
aapl = df.loc['tech_1']

# Multi-axis slice with column projection
subset = df.loc['tech_1':'tech_3', ['ticker', 'price']]

# Boolean filtering via .loc
high_val = df.loc[df['price'] > 200.0, ['ticker', 'volume']]
```

### 2. Positional Indexing with `.iloc`
`.iloc` is integer-location based (0 to length-1 of the axis):
```python
# First two rows, first two columns
first_matrix = df.iloc[0:2, 0:2]

# Reverse slice positional
last_row = df.iloc[-1, :]
```

### 3. Strict Deprecation Notice: `.ix` is Removed
> **WARNING**: The `.ix` accessor has been completely removed from Pandas.
> Never use `.ix`. Always distinguish explicitly between `.loc` (label-based) and `.iloc` (integer-positional).

### 4. Avoiding `SettingWithCopyWarning` and Copy-on-Write (CoW)
In modern Pandas 2.0+, Copy-on-Write can be enabled globally to prevent subtle mutation bugs:
```python
pd.options.mode.copy_on_write = True
```
When chained indexing like `df['price'][0] = 190.0` is performed, Pandas will raise warnings or exceptions under CoW. Always write:
```python
# Modern idiomatic assignment
df.loc['tech_1', 'price'] = 190.0
```
