# Python Core: Data Structures, Algorithms & Time Complexities

## 1. Built-in Python Collections & Big-O Operations

Writing performant Python code requires selecting the correct data structure for the target access pattern:

### Time Complexity Overview
| Structure | Index Access | Search (in) | Append / Push | Insert / Delete (Middle) | Common Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **List (`list`)** | $O(1)$ | $O(n)$ | $O(1)$ amortized | $O(n)$ | Ordered sequences, indexed reads |
| **Dictionary (`dict`)** | N/A (Key $O(1)$) | $O(1)$ avg | $O(1)$ avg | $O(1)$ avg | Hash lookups, key-value mappings |
| **Set (`set`)** | N/A | $O(1)$ avg | $O(1)$ avg | $O(1)$ avg | Unique membership, set math (union/intersect) |
| **Tuple (`tuple`)** | $O(1)$ | $O(n)$ | Immutable | Immutable | Fixed records, dictionary keys |
| **Deque (`collections.deque`)** | $O(n)$ | $O(n)$ | $O(1)$ (both ends) | $O(n)$ | Queues, sliding windows, FIFO / LIFO buffers |

### 2. High-Performance Idioms with `collections`
```python
from collections import defaultdict, Counter, deque

# 1. Frequency counting in O(n)
words = ["python", "pandas", "python", "arrow", "pandas", "python"]
counts = Counter(words)
top_word, count = counts.most_common(1)[0]  # ('python', 3)

# 2. Grouping without KeyError boilerplate
grouped = defaultdict(list)
records = [("eng", "Alice"), ("eng", "Bob"), ("hr", "Charlie")]
for department, name in records:
    grouped[department].append(name)

# 3. Double-ended queue for sliding window
window = deque(maxlen=3)
for num in [10, 20, 30, 40, 50]:
    window.append(num)  # Automatically drops oldest item when capacity reached
```

### 3. List & Dictionary Comprehensions
Always prefer comprehensions over accumulator loops for readability and bytecode speed:
```python
# List comprehension with filtering
squares = [x ** 2 for x in range(100) if x % 2 == 0]

# Dict comprehension
price_lookup = {item["id"]: item["price"] for item in products if item["in_stock"]}

# Set comprehension
unique_categories = {item["category"].strip().lower() for item in products}
```
