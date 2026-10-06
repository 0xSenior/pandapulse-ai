# Arrays and Interoperability in Modern Pandas 2.x

## Core Array Representations

Pandas interacts closely with NumPy arrays and internal ExtensionArrays, but developers must understand the exact APIs:

### 1. Does `df.array()` exist?
> **CRITICAL FACT**: **`df.array()` does NOT exist in Pandas!**
> There is no `.array()` method or attribute on a `DataFrame`. Attempting to call `df.array()` or `df.array` will raise an `AttributeError: 'DataFrame' object has no attribute 'array'`.

### 2. How to Convert a DataFrame to a NumPy Array: Use `df.to_numpy()`
The modern, recommended standard in Pandas 2.0+ is **`df.to_numpy()`**:
```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'feature_a': [1.2, 3.4, 5.6],
    'feature_b': [10, 20, 30]
})

# Correct Modern Standard (Pandas 2.0+):
array_2d = df.to_numpy()
print(type(array_2d))  # <class 'numpy.ndarray'>
print(array_2d.dtype)  # float64

# Specify explicit dtype if needed:
float32_array = df.to_numpy(dtype=np.float32)
```

### 3. Why `df.values` is Discouraged (Legacy)
In older Pandas code, developers used `df.values`. In modern Pandas 2.0+:
- **`df.values` is discouraged** because its behavior is inconsistent across mixed dtypes, and it does not allow controlling whether a copy is made or specifying the destination dtype.
- Always replace `.values` with **`df.to_numpy()`** or **`series.to_numpy()`**.

### 4. `Series.array` (ExtensionArray)
While `DataFrame` does not have an `.array` attribute, a **`Series`** does have a `.array` property:
```python
s = pd.Series([1, 2, 3], dtype="int64")

# Returns a Pandas ExtensionArray / PandasArray:
ext_array = s.array
print(type(ext_array))  # <class 'pandas.core.arrays.numpy_.PandasArray'>

# For a NumPy array from a Series:
numpy_arr = s.to_numpy()
```

### 5. `pd.array()` (Top-Level Constructor)
Pandas provides a top-level function `pd.array()` to instantiate 1D Pandas ExtensionArrays:
```python
# Creates an ExtensionArray with nullable integer type:
arr = pd.array([1, 2, None], dtype="Int64")
print(arr)  # <IntegerArray>[1, 2, <NA>]
```

### 6. Converting NumPy Arrays into DataFrames
```python
import numpy as np
import pandas as pd

matrix = np.array([
    [10, 20, 30],
    [40, 50, 60]
])

df = pd.DataFrame(matrix, columns=['col_1', 'col_2', 'col_3'])
print(df)
```
