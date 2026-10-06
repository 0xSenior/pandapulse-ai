# Python Modern Typing, Pattern Matching & Robust Error Handling

## 1. Type Hints & Static Typing (`typing`)
Modern Python leverages expressive type hinting for production reliability, IDE auto-completion, and static verification with `mypy`:

```python
from typing import Optional, Union, Dict, List, Literal
from pathlib import Path

StatusType = Literal["PENDING", "PROCESSING", "SUCCESS", "FAILED"]

def parse_config(file_path: Union[str, Path]) -> Optional[Dict[str, str]]:
    """Strictly typed configuration loader with path normalization."""
    path_obj = Path(file_path)
    if not path_obj.exists():
        return None
    
    with path_obj.open("r", encoding="utf-8") as f:
        return {line.split("=")[0]: line.split("=")[1].strip() for line in f if "=" in line}
```

## 2. Structural Pattern Matching (`match / case` in Python 3.10+)
Pattern matching provides clean branching for complex payloads and data contracts:

```python
def handle_event(event: dict) -> str:
    match event:
        case {"type": "user_signup", "user_id": uid, "email": email}:
            return f"Registering new user {uid} ({email})"
        case {"type": "data_sync", "rows": int(count)} if count > 0:
            return f"Synchronizing {count} dataset rows"
        case {"type": "error", "code": 500, **rest}:
            return f"Fatal server event detected: {rest}"
        case _:
            return "Unknown event schema"
```

## 3. Idiomatic Error Handling with Custom Exceptions
Avoid bare `except:` clauses. Always inherit from `Exception` and preserve error contexts using exception chaining (`from e`):

```python
class DataIngestionError(Exception):
    """Raised when pipeline input cannot be validated or parsed."""
    def __init__(self, message: str, file_path: str):
        super().__init__(f"Ingestion failed for '{file_path}': {message}")
        self.file_path = file_path

def load_dataset_safely(path: str):
    try:
        with open(path, "r") as f:
            return f.read()
    except FileNotFoundError as err:
        raise DataIngestionError("File not found on disk", path) from err
    except PermissionError as err:
        raise DataIngestionError("Insufficient read permissions", path) from err
```
